/* ==========================================================
   AUTHSEARCH — Pesquisa de identificadores Wikidata / VIAF
   Miguel Mimoso Correia | CC-BY-NC-SA

   Versão 1.1.0

   Corre na página de edição de uma autoridade do Koha
   (intranet). Pesquisa pessoas humanas no Wikidata (filtradas
   por P31 = Q5) e registos no VIAF, e permite aplicar o
   identificador escolhido ao campo 017 da autoridade.

   É o ÚNICO dos dois ficheiros (authbox.js / authsearch.js)
   que escreve num campo do formulário. A escrita fica sempre
   confinada ao preenchimento de inputs já existentes no
   formulário do Koha, tal como se o catalogador os tivesse
   preenchido à mão; a gravação continua a depender sempre do
   botão nativo "Gravar" do Koha.

   ----------------------------------------------------------
   CHANGELOG

   1.1.0
   - Leitura do MARC por atributo name em vez de texto de
     etiqueta e largura de input. Deixa de depender do idioma
     do framework e funciona com advancedMARCEditor ligado.
   - Criação automática de nova ocorrência do 017 através do
     botão nativo de repetição de campo do Koha. Deixa de ser
     necessário preparar um 017 vazio à mão.
   - Verificação de duplicados e de conflitos antes de escrever
     no 017. Duplicado exacto é recusado; mesmo $2 com valor
     diferente exige segunda confirmação explícita.
   - Identificadores tratados sempre como string (getAttribute
     em vez de jQuery .data(), que converte valores numéricos).
     Relevante para IDs VIAF, que podem ter até 23 dígitos.
   - Suporte a subcampos renderizados como <select> (valores
     autorizados), com verificação prévia da opção.
   - Mensagem honesta quando o VIAF falha por CORS, em vez de
     "erro ao consultar".
   - Namespace window.NOMEN e diagnóstico em
     NOMEN.authsearch.diagnostico().

   1.0.0
   - Versão inicial.
   ========================================================== */

(function () {
    "use strict";

    if (window.__authsearchAtivo) return;
    window.__authsearchAtivo = true;

    var NOMEN = window.NOMEN = window.NOMEN || {};

    $(document).ready(function () {
        if (!paginaAtualEhEditorAutoridade()) return;

        // -----------------------------------------------------------
        // Configuração central
        // -----------------------------------------------------------

        var CONFIG = {
            versao: "1.1.0",

            maxResultadosWikidata: 50,
            maxMostrarWikidata: 8,
            maxResultadosVIAF: 8,

            // Campo de destino dos identificadores.
            // Convenção da instalação: 017 com indicador 1 = 7
            // ("fonte especificada no $2"). Confirmado no registo 3098.
            tag017: "017",
            indicador017: "7",
            codigoSubcampoIdentificador: "a",
            codigoSubcampoFonte: "2",

            // Valores escritos em 017$2.
            fontes: {
                wikidata: "wikidata",
                viaf: "viaf"
            },

            // Campo do ponto de acesso de pessoa em UNIMARC(A),
            // usado apenas para pré-preencher o termo de pesquisa.
            tagPontoAcesso: "200",

            // Transporte da pesquisa VIAF.
            //   "xhr"    — pedido normal. Desde Jan/2025 o AutoSuggest do
            //              VIAF deixou de enviar Access-Control-Allow-Origin,
            //              pelo que isto falha sempre por CORS.
            //   "jsonp"  — funciona, mas executa um script vindo de viaf.org
            //              no contexto autenticado da intranet. Decisão de
            //              segurança a tomar conscientemente.
            //   "proxy"  — recomendado. Exige um reverse proxy na vossa
            //              instalação; indicar o prefixo em viafProxyBase.
            //   "manual" — não pesquisa; oferece apenas o link para o VIAF.
            viafTransporte: "xhr",
            viafProxyBase: "",   // ex.: "/viafproxy/" a apontar para https://viaf.org/viaf/

            debug: false
        };

        NOMEN.authsearch = {
            version: CONFIG.versao,
            config: CONFIG,
            diagnostico: diagnostico
        };

        $("#authsearch").remove();
        construirInterface();
        instalarEstilos();
        preencherTermoInicial();
        atualizarLinksExternos();
        ligarEventos();
        log("iniciado", { versao: CONFIG.versao, authid: obterAuthid(), authtypecode: obterAuthtypecode() });

        // ---------------------------------------------------------------
        // Guarda de página e utilitários
        // ---------------------------------------------------------------

        function paginaAtualEhEditorAutoridade() {
            var path = window.location.pathname || "";
            var params = new URLSearchParams(window.location.search || "");
            var paginaAutoridade =
                path.indexOf("/cgi-bin/koha/authorities/authorities.pl") !== -1 ||
                path.indexOf("/authorities/authorities.pl") !== -1;
            if (!paginaAutoridade) return false;
            return !!params.get("authid") || params.has("authtypecode");
        }

        function log() {
            if (!CONFIG.debug || !window.console) return;
            var args = Array.prototype.slice.call(arguments);
            args.unshift("[authsearch]");
            console.log.apply(console, args);
        }

        function limparTexto(txt) { return String(txt || "").replace(/\s+/g, " ").trim(); }

        function escaparHTML(txt) {
            return String(txt || "")
                .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        }

        function removerDuplicados(lista) {
            var vistos = {}; var resultado = [];
            $.each(lista || [], function (i, v) { v = limparTexto(v); if (!v || vistos[v]) return; vistos[v] = true; resultado.push(v); });
            return resultado;
        }

        // Lê um atributo data-* como string pura.
        // NUNCA usar jQuery .data() para identificadores: converte valores
        // numéricos em Number, e um ID VIAF pode ter mais dígitos do que
        // Number.MAX_SAFE_INTEGER consegue representar sem perda.
        function dadoTexto(elemento, nome) {
            if (!elemento) return "";
            var bruto = elemento.getAttribute ? elemento.getAttribute("data-" + nome) : null;
            return bruto === null ? "" : String(bruto);
        }

        // ---------------------------------------------------------------
        // Camada Koha — leitura e escrita do MARC
        //
        // Toda a identificação de campos e subcampos assenta no atributo
        // name gerado pelo Koha:
        //
        //   valor do subcampo : tag_{tag}_subfield_{codigo}_{indice}_{indiceSub}
        //   indicador 1       : tag_{tag}_indicator1_{indice}{aleatorio}
        //   ocorrência (li)   : id="tag_{tag}_{indice}{aleatorio}"
        //
        // O agrupamento por ocorrência TEM de ser feito por contenção no
        // DOM: duas ocorrências do mesmo campo partilham o mesmo {indice},
        // pelo que o name não permite distingui-las.
        // ---------------------------------------------------------------

        var RE_SUBCAMPO = /^tag_([0-9A-Za-z]{3})_subfield_(.)_/;

        function obterAuthid() {
            var campo = document.querySelector('form#f input[name="authid"]');
            return campo ? limparTexto(campo.value) : "";
        }

        function obterAuthtypecode() {
            var campo = document.querySelector('form#f input[name="authtypecode"]');
            return campo ? limparTexto(campo.value) : "";
        }

        // Todas as ocorrências de uma tag, como elementos li.
        function obterOcorrenciasDeCampo(tag) {
            return $('#authoritytabs li.tag[id^="tag_' + tag + '_"]').toArray();
        }

        // Subcampos de uma ocorrência, por ordem de apresentação.
        function lerSubcampos(li) {
            var subcampos = [];
            $(li).find(".input_marceditor").each(function () {
                var nome = this.getAttribute("name") || this.getAttribute("id") || "";
                var m = RE_SUBCAMPO.exec(nome);
                if (!m) return;
                subcampos.push({ codigo: m[2], input: this, valor: lerValorControlo(this) });
            });
            return subcampos;
        }

        function primeiroSubcampo(subcampos, codigo) {
            for (var i = 0; i < subcampos.length; i++) {
                if (subcampos[i].codigo === codigo) return subcampos[i];
            }
            return null;
        }

        function lerValorControlo(elemento) {
            if (!elemento) return "";
            return limparTexto(elemento.value);
        }

        // Escreve num controlo do editor MARC do Koha.
        // Devolve { ok: bool, motivo: string }.
        function escreverValorControlo(elemento, valor) {
            if (!elemento) return { ok: false, motivo: "campo inexistente" };

            if (elemento.tagName === "SELECT") {
                // Subcampo ligado a valores autorizados: só é possível
                // escrever um valor que exista na lista.
                var existe = false;
                $(elemento).find("option").each(function () {
                    if (String(this.value) === String(valor)) { existe = true; return false; }
                });
                if (!existe) {
                    return { ok: false, motivo: 'o subcampo é uma lista de valores autorizados e não contém a opção "' + valor + '"' };
                }
            }

            $(elemento).val(valor).trigger("input").trigger("change");
            return { ok: true, motivo: "" };
        }

        // ---------------------------------------------------------------
        // Leitura do ponto de acesso, para pré-preencher a pesquisa
        // ---------------------------------------------------------------

        function obterNomeAtualDaAutoridade() {
            var ocorrencias = obterOcorrenciasDeCampo(CONFIG.tagPontoAcesso);
            for (var i = 0; i < ocorrencias.length; i++) {
                var subcampos = lerSubcampos(ocorrencias[i]);
                var a = primeiroSubcampo(subcampos, "a");
                var b = primeiroSubcampo(subcampos, "b");
                var nome = limparTexto([b ? b.valor : "", a ? a.valor : ""].filter(Boolean).join(" "));
                if (nome) return nome;
            }
            return "";
        }

        function preencherTermoInicial() {
            var nome = obterNomeAtualDaAutoridade();
            if (nome) $("#authsearch-termo").val(nome);
            log("termo inicial", nome);
        }

        // ---------------------------------------------------------------
        // Campo 017 — leitura, verificação e escrita
        // ---------------------------------------------------------------

        function encontrarCampos017() {
            return obterOcorrenciasDeCampo(CONFIG.tag017).map(function (li) {
                var subcampos = lerSubcampos(li);
                var a = primeiroSubcampo(subcampos, CONFIG.codigoSubcampoIdentificador);
                var f = primeiroSubcampo(subcampos, CONFIG.codigoSubcampoFonte);
                return {
                    li: li,
                    subcampos: subcampos,
                    inputA: a ? a.input : null,
                    input2: f ? f.input : null,
                    valorA: a ? a.valor : "",
                    valor2: f ? f.valor : "",
                    indicador1: li.querySelector('input[name*="_indicator1_"]'),
                    repetivel: !!li.querySelector(".tag_title a.buttonPlus")
                };
            });
        }

        function normalizarFonte(txt) { return limparTexto(txt).toLowerCase(); }

        // Comparação de identificadores. Os QID do Wikidata comparam-se sem
        // distinguir maiúsculas; os IDs VIAF são numéricos e comparam-se
        // como texto, nunca como número.
        function mesmoIdentificador(a, b, fonte) {
            a = limparTexto(a); b = limparTexto(b);
            if (!a || !b) return false;
            if (normalizarFonte(fonte) === CONFIG.fontes.wikidata) return a.toUpperCase() === b.toUpperCase();
            return a === b;
        }

        // Cria uma nova ocorrência do 017 clicando no botão nativo de
        // repetição de campo do Koha (CloneField). Preferimos o botão ao
        // CloneField() directo porque o onclick já traz os argumentos
        // correctos desta instalação (hide_marc, advancedMARCEditor).
        //
        // Comportamento verificado no cataloging.js do Koha 24.05:
        // o clone é inserido logo a seguir ao original, os valores dos
        // subcampos são limpos, e a letra do subcampo e os indicadores
        // são preservados.
        function criarNovoCampo017() {
            var existentes = encontrarCampos017();
            if (!existentes.length) return { campo: null, motivo: "não existe nenhum campo 017 nesta folha de recolha" };

            var ultimo = existentes[existentes.length - 1];
            var botao = ultimo.li.querySelector(".tag_title a.buttonPlus");
            if (!botao) return { campo: null, motivo: "o campo 017 não está definido como repetível neste framework" };

            var idsAntes = {};
            existentes.forEach(function (c) { idsAntes[c.li.id] = true; });

            try {
                botao.click();
            } catch (e) {
                return { campo: null, motivo: "não foi possível accionar a repetição do campo (" + e.message + ")" };
            }

            var novos = encontrarCampos017().filter(function (c) { return !idsAntes[c.li.id]; });
            if (!novos.length) return { campo: null, motivo: "a repetição do campo não produziu uma nova ocorrência" };

            log("nova ocorrência 017 criada", novos[0].li.id);
            return { campo: novos[0], motivo: "" };
        }

        function aplicarNoCampo017(valor, fonte, confirmado) {
            valor = limparTexto(valor);
            fonte = normalizarFonte(fonte);
            if (!valor || !fonte) return;

            var campos = encontrarCampos017();

            if (!campos.length) {
                estado("erro", "Não existe nenhum campo 017 nesta folha de recolha. Verifique o framework desta tipologia de autoridade.");
                return;
            }

            // 1. Duplicado exacto: mesma fonte e mesmo identificador.
            var duplicado = campos.filter(function (c) {
                return normalizarFonte(c.valor2) === fonte && mesmoIdentificador(c.valorA, valor, fonte);
            })[0];

            if (duplicado) {
                estado("aviso", "Este identificador já está registado: 017$a <strong>" + escaparHTML(duplicado.valorA) +
                    "</strong> $2 <strong>" + escaparHTML(duplicado.valor2) + "</strong>. Nada foi alterado.");
                realcarCampo(duplicado.li);
                return;
            }

            // 2. Conflito: mesma fonte já presente com outro identificador.
            //    Não substituímos nunca; o 017 é repetível, mas dois valores
            //    para a mesma fonte devem ser uma decisão consciente.
            var conflito = campos.filter(function (c) {
                return normalizarFonte(c.valor2) === fonte && limparTexto(c.valorA) && !mesmoIdentificador(c.valorA, valor, fonte);
            })[0];

            if (conflito && !confirmado) {
                estado("aviso",
                    "Já existe um identificador <strong>" + escaparHTML(fonte) + "</strong> neste registo: <strong>" +
                    escaparHTML(conflito.valorA) + "</strong>. O novo valor é <strong>" + escaparHTML(valor) + "</strong>." +
                    ' <button type="button" class="authsearch-btn authsearch-btn-aplicar authsearch-confirmar" ' +
                    'data-valor="' + escaparHTML(valor) + '" data-fonte="' + escaparHTML(fonte) + '">' +
                    "Acrescentar mesmo assim</button>" +
                    ' <span class="authsearch-nota">O valor existente não será alterado.</span>');
                realcarCampo(conflito.li);
                return;
            }

            // 3. Destino: ocorrência vazia, ou nova ocorrência clonada.
            var destino = campos.filter(function (c) {
                return !limparTexto(c.valorA) && !limparTexto(c.valor2);
            })[0];

            if (!destino) {
                var criacao = criarNovoCampo017();
                if (!criacao.campo) {
                    estado("erro", "Não foi possível criar um novo campo 017: " + escaparHTML(criacao.motivo) + ".");
                    return;
                }
                destino = criacao.campo;
            }

            // 4. Escrita.
            if (!destino.inputA || !destino.input2) {
                estado("erro", "O campo 017 desta folha de recolha não expõe os subcampos $" +
                    CONFIG.codigoSubcampoIdentificador + " e $" + CONFIG.codigoSubcampoFonte + ".");
                return;
            }

            var escritaA = escreverValorControlo(destino.inputA, valor);
            if (!escritaA.ok) {
                estado("erro", "Não foi possível escrever em 017$" + CONFIG.codigoSubcampoIdentificador + ": " + escaparHTML(escritaA.motivo) + ".");
                return;
            }

            var escrita2 = escreverValorControlo(destino.input2, fonte);
            if (!escrita2.ok) {
                // Reverte o $a para não deixar o campo num estado incoerente.
                escreverValorControlo(destino.inputA, "");
                estado("erro", "Não foi possível escrever em 017$" + CONFIG.codigoSubcampoFonte + ": " + escaparHTML(escrita2.motivo) + ". Nada foi alterado.");
                return;
            }

            if (destino.indicador1 && !limparTexto(destino.indicador1.value)) {
                escreverValorControlo(destino.indicador1, CONFIG.indicador017);
            }

            realcarCampo(destino.li);
            estado("sucesso",
                "Aplicado no 017: indicador 1 = <strong>" + escaparHTML(CONFIG.indicador017) +
                "</strong>, 017$" + CONFIG.codigoSubcampoIdentificador + " = <strong>" + escaparHTML(valor) +
                "</strong>, 017$" + CONFIG.codigoSubcampoFonte + " = <strong>" + escaparHTML(fonte) + "</strong>. " +
                'A gravação continua a exigir o botão "Gravar" do Koha.');

            log("aplicado", { valor: valor, fonte: fonte, campo: destino.li.id });
        }

        function realcarCampo(li) {
            if (!li) return;
            $(".authsearch-campo-realcado").removeClass("authsearch-campo-realcado");
            $(li).addClass("authsearch-campo-realcado");
        }

        // ---------------------------------------------------------------
        // Estado da interface
        // ---------------------------------------------------------------

        function estado(tipo, html) {
            $("#authsearch-estado")
                .removeClass("authsearch-estado-info authsearch-estado-aviso authsearch-estado-erro authsearch-estado-sucesso")
                .addClass("authsearch-estado-" + (tipo || "info"))
                .html(html || "");
        }

        function diagnostico() {
            return {
                versao: CONFIG.versao,
                authid: obterAuthid(),
                authtypecode: obterAuthtypecode(),
                nome: obterNomeAtualDaAutoridade(),
                campos017: encontrarCampos017().map(function (c) {
                    return {
                        id: c.li.id,
                        identificador: c.valorA,
                        fonte: c.valor2,
                        indicador1: c.indicador1 ? c.indicador1.value : null,
                        repetivel: c.repetivel,
                        tipoControloIdentificador: c.inputA ? c.inputA.tagName : null,
                        tipoControloFonte: c.input2 ? c.input2.tagName : null
                    };
                })
            };
        }

        // ---------------------------------------------------------------
        // Interface
        // ---------------------------------------------------------------

        function construirInterface() {
            var html = "";
            html += '<div id="authsearch">';
            html += '  <div id="authsearch-header">';
            html += '    <div id="authsearch-header-titulo"><div id="authsearch-icone">' + iconeLupa() + '</div>';
            html += '      <div><strong>Pesquisa de identificadores</strong><p>Wikidata e VIAF. Confirme sempre os resultados antes de aplicar.</p></div></div>';
            html += '    <button type="button" id="authsearch-colapsar">' + iconeSeta() + ' <span id="authsearch-colapsar-txt">Ocultar</span></button>';
            html += '  </div>';
            html += '  <div id="authsearch-corpo"><div id="authsearch-corpo-inner">';
            html += '    <div id="authsearch-linha-pesquisa">';
            html += '      <label class="authsearch-sr" for="authsearch-termo">Nome a pesquisar</label>';
            html += '      <input type="text" id="authsearch-termo" placeholder="Nome a pesquisar">';
            html += '      <button type="button" id="authsearch-pesquisar">Pesquisar</button>';
            html += '      <a href="#" target="_blank" rel="noopener noreferrer" id="authsearch-link-wikidata">Wikidata ↗</a>';
            html += '      <a href="#" target="_blank" rel="noopener noreferrer" id="authsearch-link-viaf">VIAF ↗</a>';
            html += '    </div>';
            html += '    <div id="authsearch-estado" role="status" aria-live="polite"></div>';
            html += '    <div id="authsearch-grid">';
            html += '      <div class="authsearch-coluna"><h3>Wikidata</h3><div id="authsearch-resultados-wikidata"></div></div>';
            html += '      <div class="authsearch-coluna"><h3>VIAF</h3><div id="authsearch-resultados-viaf"></div></div>';
            html += '    </div>';
            html += '    <div id="authsearch-rodape"><a href="https://www.wikidata.org/wiki/Special:NewItem" target="_blank" rel="noopener noreferrer">Criar item novo no Wikidata ↗</a></div>';
            html += '  </div></div>';
            html += '</div>';

            // O painel fica FORA do formulário #f. Qualquer input nosso lá
            // dentro seria submetido ao Koha ao gravar a autoridade.
            var $alvo = $("#authbox").length ? $("#authbox") :
                $("h1").first().length ? $("h1").first() :
                $("#main_intranet-main").first().length ? $("#main_intranet-main").first() :
                $("#main").first().length ? $("#main").first() : $("body").first();

            $alvo.after(html);
        }

        function ligarEventos() {
            $("#authsearch-colapsar").on("click", function () {
                var colapsado = !$("#authsearch").hasClass("colapsado");
                $("#authsearch").toggleClass("colapsado", colapsado);
                $("#authsearch-colapsar-txt").text(colapsado ? "Mostrar" : "Ocultar");
            });

            $("#authsearch-termo").on("input", atualizarLinksExternos);
            $("#authsearch-termo").on("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); $("#authsearch-pesquisar").click(); } });

            $("#authsearch-pesquisar").on("click", function () {
                var termo = limparTexto($("#authsearch-termo").val());
                if (!termo) { estado("aviso", "Indique um termo de pesquisa."); return; }
                estado("info", "Pesquisa enviada. Confirme sempre os resultados antes de aplicar identificadores.");
                pesquisarWikidata(termo);
                pesquisarVIAF(termo);
            });

            $(document).on("click.authsearch", ".authsearch-copiar", function () {
                var valor = dadoTexto(this, "valor"); var $btn = $(this); var original = $btn.text();
                if (!valor) return;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(valor).then(function () { $btn.text("Copiado"); setTimeout(function () { $btn.text(original); }, 1200); });
                } else { estado("info", "Copie manualmente: " + escaparHTML(valor)); }
            });

            $(document).on("click.authsearch", ".authsearch-aplicar", function () {
                aplicarNoCampo017(dadoTexto(this, "valor"), dadoTexto(this, "fonte"), false);
            });

            $(document).on("click.authsearch", ".authsearch-confirmar", function () {
                aplicarNoCampo017(dadoTexto(this, "valor"), dadoTexto(this, "fonte"), true);
            });
        }

        function atualizarLinksExternos() {
            var termo = limparTexto($("#authsearch-termo").val());
            var termoURL = encodeURIComponent(termo);
            $("#authsearch-link-wikidata").attr("href", termo ? "https://www.wikidata.org/w/index.php?search=" + termoURL : "https://www.wikidata.org/");
            $("#authsearch-link-viaf").attr("href", termo ? linkPesquisaVIAF(termo) : "https://viaf.org/");
        }

        function linkPesquisaVIAF(termo) {
            return "https://viaf.org/viaf/search?query=local.names+all+%22" + encodeURIComponent(termo) + "%22&sortKeys=holdingscount&recordSchema=BriefVIAF";
        }

        // ---------------------------------------------------------------
        // Pesquisa Wikidata (filtrada por P31 = Q5, pessoa humana)
        // ---------------------------------------------------------------

        function pesquisarWikidata(termo) {
            $("#authsearch-resultados-wikidata").html('<p class="authsearch-msg">A pesquisar...</p>');

            $.ajax({
                url: "https://www.wikidata.org/w/api.php", dataType: "jsonp",
                data: { action: "wbsearchentities", format: "json", language: "pt", uselang: "pt", type: "item", limit: CONFIG.maxResultadosWikidata, search: termo }
            }).done(function (dados) {
                if (!dados.search || !dados.search.length) { $("#authsearch-resultados-wikidata").html('<p class="authsearch-msg">Sem resultados.</p>'); return; }

                var ids = $.map(dados.search, function (i) { return i.id; }).join("|");

                $.ajax({
                    url: "https://www.wikidata.org/w/api.php", dataType: "jsonp",
                    data: { action: "wbgetentities", format: "json", ids: ids, props: "labels|descriptions|aliases|claims", languages: "pt|en" }
                }).done(function (detalhes) {
                    var humanas = {}; var lista = [];
                    $.each(dados.search, function (i, item) {
                        var entidade = detalhes.entities[item.id];
                        if (!entidade || !ehPessoaHumana(entidade)) return;
                        humanas[item.id] = entidade;
                        lista.push({ id: item.id, label: obterLabel(entidade) || item.label || "", description: obterDescricao(entidade) || item.description || "" });
                    });

                    if (!lista.length) { $("#authsearch-resultados-wikidata").html('<p class="authsearch-msg">Sem resultados confirmados como pessoa humana (P31 = Q5).</p>'); return; }

                    lista = lista.slice(0, CONFIG.maxMostrarWikidata);
                    var entidadesLimitadas = {};
                    lista.forEach(function (item) { entidadesLimitadas[item.id] = humanas[item.id]; });
                    log("wikidata", { candidatos: dados.search.length, validados: lista.length });
                    enriquecerEApresentarWikidata(lista, entidadesLimitadas);
                }).fail(function () { $("#authsearch-resultados-wikidata").html('<p class="authsearch-msg">Erro ao obter detalhes do Wikidata.</p>'); });
            }).fail(function () { $("#authsearch-resultados-wikidata").html('<p class="authsearch-msg">Erro ao consultar o Wikidata.</p>'); });
        }

        function ehPessoaHumana(entidade) {
            if (!entidade || !entidade.claims || !entidade.claims.P31) return false;
            var humano = false;
            $.each(entidade.claims.P31, function (i, claim) {
                try { if (claim.mainsnak.datavalue.value.id === "Q5") { humano = true; return false; } } catch (e) {}
            });
            return humano;
        }

        function enriquecerEApresentarWikidata(resultados, entidades) {
            var idsRelacionados = [];
            $.each(entidades, function (qid, entidade) {
                idsRelacionados = idsRelacionados.concat(obterIdsClaims(entidade, "P27"), obterIdsClaims(entidade, "P106"));
            });
            idsRelacionados = removerDuplicados(idsRelacionados);

            if (!idsRelacionados.length) { apresentarResultadosWikidata(resultados, entidades, {}); return; }

            $.ajax({
                url: "https://www.wikidata.org/w/api.php", dataType: "jsonp",
                data: { action: "wbgetentities", format: "json", ids: idsRelacionados.join("|"), props: "labels", languages: "pt|en" }
            }).done(function (labels) { apresentarResultadosWikidata(resultados, entidades, labels.entities || {}); })
              .fail(function () { apresentarResultadosWikidata(resultados, entidades, {}); });
        }

        function apresentarResultadosWikidata(resultados, entidades, relacionadas) {
            var html = "";
            $.each(resultados, function (i, item) {
                var qid = item.id || "";
                var entidade = entidades[qid] || {};
                var label = obterLabel(entidade) || item.label || "";
                var descricao = obterDescricao(entidade) || item.description || "";
                var imagem = obterImagemWikidata(entidade);
                var paises = obterLabelsClaims(entidade, "P27", relacionadas);
                var nascimento = obterData(entidade, "P569");
                var morte = obterData(entidade, "P570");
                var ocupacoes = obterLabelsClaims(entidade, "P106", relacionadas);
                var viafs = obterIdentificadoresExternos(entidade, "P214");

                html += '<div class="authsearch-item">';
                html += '<div class="authsearch-item-layout' + (imagem ? '' : ' sem-imagem') + '">';
                html += imagem ? ('<img class="authsearch-item-img" src="' + escaparHTML(imagem) + '" alt="">') : '<div class="authsearch-item-img-vazia"></div>';
                html += '<div class="authsearch-item-info">';
                html += '<div class="authsearch-item-label">' + escaparHTML(label) + '</div>';
                if (descricao) html += '<div class="authsearch-item-desc">' + escaparHTML(descricao) + '</div>';
                html += '<div class="authsearch-item-id">' + escaparHTML(qid) + '</div>';
                if (paises.length) html += '<div class="authsearch-item-meta"><strong>País:</strong> ' + escaparHTML(paises.join(", ")) + '</div>';
                if (nascimento) html += '<div class="authsearch-item-meta"><strong>Nascimento:</strong> ' + escaparHTML(nascimento) + '</div>';
                if (morte) html += '<div class="authsearch-item-meta"><strong>Morte:</strong> ' + escaparHTML(morte) + '</div>';
                if (ocupacoes.length) html += '<div class="authsearch-item-meta"><strong>Ocupação:</strong> ' + escaparHTML(ocupacoes.join(", ")) + '</div>';
                html += '<div class="authsearch-item-acoes">';
                html += '<a class="authsearch-btn" href="https://www.wikidata.org/wiki/' + encodeURIComponent(qid) + '" target="_blank" rel="noopener noreferrer">Abrir</a>';
                html += '<button type="button" class="authsearch-btn authsearch-copiar" data-valor="' + escaparHTML(qid) + '">Copiar QID</button>';
                html += '<button type="button" class="authsearch-btn authsearch-btn-aplicar authsearch-aplicar" data-valor="' + escaparHTML(qid) + '" data-fonte="' + escaparHTML(CONFIG.fontes.wikidata) + '">Aplicar ao 017</button>';
                html += '</div>';

                // VIAF declarado no próprio item Wikidata (P214). A propriedade
                // é repetível e os valores podem incluir clusters obsoletos;
                // por isso mostram-se todos e nenhum é aplicado automaticamente.
                if (viafs.length) {
                    html += '<div class="authsearch-item-viaf"><span class="authsearch-item-meta"><strong>VIAF via Wikidata:</strong></span>';
                    viafs.forEach(function (v) {
                        html += '<button type="button" class="authsearch-btn authsearch-aplicar" data-valor="' + escaparHTML(v.valor) + '" data-fonte="' + escaparHTML(CONFIG.fontes.viaf) + '">' +
                                escaparHTML(v.valor) + (v.rank === "preferred" ? " ★" : (v.rank === "deprecated" ? " (obsoleto)" : "")) + "</button>";
                    });
                    html += '<div class="authsearch-nota">Valor declarado no Wikidata, não verificado junto do VIAF.</div>';
                    html += "</div>";
                }

                html += '</div></div></div>';
            });
            $("#authsearch-resultados-wikidata").html(html);
        }

        function obterImagemWikidata(entidade) {
            if (!entidade || !entidade.claims || !entidade.claims.P18 || !entidade.claims.P18.length) return "";
            try {
                var ficheiro = entidade.claims.P18[0].mainsnak.datavalue.value;
                return ficheiro ? "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(ficheiro) + "?width=180" : "";
            } catch (e) { return ""; }
        }

        function obterIdsClaims(entidade, prop) {
            var ids = [];
            if (!entidade || !entidade.claims || !entidade.claims[prop]) return ids;
            $.each(entidade.claims[prop], function (i, claim) {
                try { var id = claim.mainsnak.datavalue.value.id; if (id) ids.push(id); } catch (e) {}
            });
            return ids;
        }

        // Identificadores externos (P214 VIAF, P213 ISNI, ...). São repetíveis
        // e cada declaração tem um rank: preferred / normal / deprecated.
        // O valor vem sempre como string; nunca converter para número.
        function obterIdentificadoresExternos(entidade, prop) {
            var valores = [];
            if (!entidade || !entidade.claims || !entidade.claims[prop]) return valores;
            $.each(entidade.claims[prop], function (i, claim) {
                try {
                    var v = claim.mainsnak.datavalue.value;
                    if (typeof v !== "string" || !v) return;
                    valores.push({ valor: v, rank: claim.rank || "normal" });
                } catch (e) {}
            });
            valores.sort(function (a, b) {
                var peso = { preferred: 0, normal: 1, deprecated: 2 };
                return (peso[a.rank] || 1) - (peso[b.rank] || 1);
            });
            return valores;
        }

        function obterLabelsClaims(entidade, prop, relacionadas) {
            var labels = [];
            obterIdsClaims(entidade, prop).forEach(function (id) { var l = obterLabel(relacionadas[id]); if (l) labels.push(l); });
            return removerDuplicados(labels);
        }

        function obterLabel(entidade) {
            if (!entidade || !entidade.labels) return "";
            if (entidade.labels.pt) return entidade.labels.pt.value;
            if (entidade.labels.en) return entidade.labels.en.value;
            return "";
        }

        function obterDescricao(entidade) {
            if (!entidade || !entidade.descriptions) return "";
            if (entidade.descriptions.pt) return entidade.descriptions.pt.value;
            if (entidade.descriptions.en) return entidade.descriptions.en.value;
            return "";
        }

        function obterData(entidade, prop) {
            if (!entidade || !entidade.claims || !entidade.claims[prop] || !entidade.claims[prop].length) return "";
            try {
                var v = entidade.claims[prop][0].mainsnak.datavalue.value;
                var data = v.time.replace("+", "").replace("Z", "");
                var partes = data.split("T")[0].split("-");
                if (partes.length < 3) return "";
                if (partes[1] === "00") return partes[0];
                if (partes[2] === "00") return partes[1] + "/" + partes[0];
                return partes[2] + "/" + partes[1] + "/" + partes[0];
            } catch (e) { return ""; }
        }

        // ---------------------------------------------------------------
        // Pesquisa VIAF
        //
        // Desde Janeiro de 2025 o AutoSuggest do VIAF deixou de enviar o
        // cabeçalho Access-Control-Allow-Origin, pelo que um pedido XHR
        // normal falha sempre por CORS. Ver CONFIG.viafTransporte.
        // ---------------------------------------------------------------

        function pesquisarVIAF(termo) {
            if (CONFIG.viafTransporte === "manual") {
                mostrarRecursoManualVIAF(termo, "Pesquisa automática no VIAF desactivada na configuração.");
                return;
            }

            $("#authsearch-resultados-viaf").html('<p class="authsearch-msg">A pesquisar...</p>');

            var pedido = {
                url: CONFIG.viafTransporte === "proxy" && CONFIG.viafProxyBase
                    ? CONFIG.viafProxyBase.replace(/\/+$/, "") + "/AutoSuggest"
                    : "https://viaf.org/viaf/AutoSuggest",
                data: { query: termo },
                dataType: CONFIG.viafTransporte === "jsonp" ? "jsonp" : "json"
            };

            $.ajax(pedido)
                .done(function (dados) {
                    if (!dados || !dados.result || !dados.result.length) {
                        $("#authsearch-resultados-viaf").html('<p class="authsearch-msg">Sem resultados.</p>');
                        return;
                    }
                    apresentarResultadosVIAF(dados.result.slice(0, CONFIG.maxResultadosVIAF));
                    log("viaf", { resultados: dados.result.length, transporte: CONFIG.viafTransporte });
                })
                .fail(function (xhr, tipo) {
                    // status 0 sem tipo de erro identificado é, na prática,
                    // sempre CORS ou rede. Distinguimos isto de "sem dados".
                    var causa = (CONFIG.viafTransporte === "xhr" && (!xhr || xhr.status === 0))
                        ? "O VIAF não autoriza pedidos directos a partir do navegador (CORS). É necessário configurar CONFIG.viafTransporte."
                        : "Não foi possível obter resposta do VIAF (" + escaparHTML(tipo || "erro") + ").";
                    mostrarRecursoManualVIAF(termo, causa);
                });
        }

        function apresentarResultadosVIAF(resultados) {
            var html = "";
            $.each(resultados, function (i, item) {
                // O ID VIAF pode ter até 23 dígitos. Se a resposta o trouxer
                // como número, já perdeu precisão antes de chegar aqui; por
                // isso converte-se para texto sem qualquer aritmética.
                var viafid = limparTexto(item.viafid);
                var termoResultado = item.term || item.displayForm || "";
                if (!viafid) return;

                html += '<div class="authsearch-item"><div class="authsearch-item-label">' + escaparHTML(termoResultado) + "</div>";
                html += '<div class="authsearch-item-id">VIAF ' + escaparHTML(viafid) + "</div>";
                html += '<div class="authsearch-item-acoes">';
                html += '<a class="authsearch-btn" href="https://viaf.org/en/viaf/' + encodeURIComponent(viafid) + '" target="_blank" rel="noopener noreferrer">Abrir</a>';
                html += '<button type="button" class="authsearch-btn authsearch-copiar" data-valor="' + escaparHTML(viafid) + '">Copiar VIAF</button>';
                html += '<button type="button" class="authsearch-btn authsearch-btn-aplicar authsearch-aplicar" data-valor="' + escaparHTML(viafid) + '" data-fonte="' + escaparHTML(CONFIG.fontes.viaf) + '">Aplicar ao 017</button>';
                html += "</div></div>";
            });
            $("#authsearch-resultados-viaf").html(html || '<p class="authsearch-msg">Sem resultados utilizáveis.</p>');
        }

        function mostrarRecursoManualVIAF(termo, causa) {
            $("#authsearch-resultados-viaf").html(
                '<p class="authsearch-msg">' + escaparHTML(causa) + "</p>" +
                '<p><a class="authsearch-btn" href="' + escaparHTML(linkPesquisaVIAF(termo)) + '" target="_blank" rel="noopener noreferrer">Pesquisar directamente no VIAF</a></p>' +
                '<p class="authsearch-nota">Em alternativa, use o VIAF declarado no item Wikidata, na coluna ao lado.</p>'
            );
        }

        // ---------------------------------------------------------------
        // Ícones
        // ---------------------------------------------------------------

        function svg(path) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + "</svg>"; }
        function iconeLupa() { return svg('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'); }
        function iconeSeta() { return svg('<path d="M6 9l6 6 6-6"/>'); }

        // ---------------------------------------------------------------
        // Estilos
        // ---------------------------------------------------------------

        function instalarEstilos() {
            if ($("#authsearch-estilos").length) return;
            var css = "" +
                "#authsearch{font-family:Inter,Arial,sans-serif;font-size:12.5px;color:#16212c;background:#fff;border:1px solid #d9e2ea;border-radius:8px;box-shadow:0 1px 2px rgba(16,24,32,.04),0 8px 20px rgba(16,24,32,.045);overflow:hidden;margin:14px 0;}" +
                "#authsearch *{box-sizing:border-box;}" +
                ".authsearch-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}" +
                "#authsearch-header{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:14px 18px;border-bottom:1px solid #e5ebf0;background:linear-gradient(180deg,#fff 0%,#fbfdfe 100%);}" +
                "#authsearch-header-titulo{display:flex;gap:11px;align-items:flex-start;}" +
                "#authsearch-icone{width:32px;height:32px;border-radius:8px;flex:0 0 32px;background:linear-gradient(135deg,#6a3fb5 0%,#4c2a86 100%);display:flex;align-items:center;justify-content:center;}" +
                "#authsearch-icone svg{width:16px;height:16px;stroke:#fff;}" +
                "#authsearch-header-titulo strong{font-size:14.5px;font-weight:750;}" +
                "#authsearch-header-titulo p{margin:2px 0 0;font-size:11px;color:#5b6b78;}" +
                "#authsearch-colapsar{display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:6px;border:1px solid #c7d2da;background:#fff;font-size:11px;font-weight:650;color:#5b6b78;cursor:pointer;font-family:inherit;}" +
                "#authsearch-colapsar svg{width:12px;height:12px;transition:transform .15s ease;}" +
                "#authsearch.colapsado #authsearch-colapsar svg{transform:rotate(-90deg);}" +
                "#authsearch-corpo{display:grid;grid-template-rows:1fr;transition:grid-template-rows .15s ease;}" +
                "#authsearch.colapsado #authsearch-corpo{grid-template-rows:0fr;}" +
                "#authsearch-corpo-inner{overflow:hidden;}" +
                "#authsearch-linha-pesquisa{display:flex;gap:8px;align-items:center;padding:14px 18px 8px;flex-wrap:wrap;}" +
                "#authsearch-termo{flex:1;min-width:260px;padding:8px 10px;border:1px solid #c7d2da;border-radius:6px;font-size:13px;font-family:inherit;}" +
                "#authsearch-pesquisar{padding:8px 15px;border-radius:6px;border:1px solid transparent;background:#0b4f6c;color:#fff;font-size:12px;font-weight:650;cursor:pointer;font-family:inherit;}" +
                "#authsearch-link-wikidata,#authsearch-link-viaf{padding:8px 12px;border-radius:6px;border:1px solid #c7d2da;background:#fff;color:#5b6b78;font-size:11.5px;font-weight:650;text-decoration:none;}" +
                "#authsearch-estado{padding:0 18px 8px;font-size:11.5px;color:#5b6b78;}" +
                "#authsearch-estado:empty{padding:0;}" +
                "#authsearch-estado.authsearch-estado-aviso{color:#8a5a00;}" +
                "#authsearch-estado.authsearch-estado-erro{color:#a12b2b;}" +
                "#authsearch-estado.authsearch-estado-sucesso{color:#1c6b45;}" +
                "#authsearch-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:0 18px 14px;}" +
                "@media(max-width:820px){#authsearch-grid{grid-template-columns:1fr;}}" +
                ".authsearch-coluna{border:1px solid #e5ebf0;border-radius:6px;padding:12px;background:#fbfcfd;}" +
                ".authsearch-coluna h3{margin:0 0 9px;font-size:12.5px;font-weight:700;}" +
                ".authsearch-msg{color:#5b6b78;font-size:12px;}" +
                ".authsearch-nota{color:#5b6b78;font-size:10.5px;margin-top:4px;display:block;}" +
                ".authsearch-item{padding:9px 0;border-top:1px solid #edf0f2;}" +
                ".authsearch-item:first-child{border-top:none;}" +
                ".authsearch-item-layout{display:grid;grid-template-columns:60px 1fr;gap:10px;align-items:start;}" +
                ".authsearch-item-layout.sem-imagem{grid-template-columns:1fr;}" +
                ".authsearch-item-img{width:60px;height:78px;object-fit:cover;border:1px solid #d9e2ea;border-radius:4px;}" +
                ".authsearch-item-img-vazia{width:60px;height:78px;background:#eef2f5;border-radius:4px;}" +
                ".authsearch-item-label{font-weight:700;font-size:13px;}" +
                ".authsearch-item-desc{font-size:11.5px;color:#5b6b78;margin-top:2px;}" +
                ".authsearch-item-id{font-family:ui-monospace,Consolas,monospace;font-size:11.5px;color:#0b4f6c;margin-top:4px;}" +
                ".authsearch-item-meta{font-size:11px;color:#374151;margin-top:3px;}" +
                ".authsearch-item-meta strong{font-weight:700;color:#16212c;}" +
                ".authsearch-item-acoes{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px;}" +
                ".authsearch-item-viaf{margin-top:8px;padding-top:7px;border-top:1px dashed #e5ebf0;display:flex;gap:6px;flex-wrap:wrap;align-items:center;}" +
                ".authsearch-btn{display:inline-flex;align-items:center;padding:5px 10px;border:1px solid #c7d2da;background:#fff;border-radius:5px;font-size:10.5px;font-weight:650;color:#374151;text-decoration:none;cursor:pointer;font-family:inherit;}" +
                ".authsearch-btn:hover{background:#f1f4f6;}" +
                ".authsearch-btn-aplicar{background:#0b4f6c;border-color:#0b4f6c;color:#fff;}" +
                ".authsearch-btn-aplicar:hover{background:#0a4560;}" +
                "#authsearch-rodape{padding:0 18px 14px;}" +
                "#authsearch-rodape a{font-size:11.5px;color:#0b4f6c;font-weight:650;text-decoration:none;}" +
                // Realce do campo 017 tocado. Prefixado para não colidir com o Koha.
                "#authoritytabs li.tag.authsearch-campo-realcado{outline:2px solid #0b4f6c;outline-offset:2px;border-radius:4px;}";

            $("<style>").attr("id", "authsearch-estilos").text(css).appendTo("head");
        }

    });

})();
