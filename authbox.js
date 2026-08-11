/* ==========================================================
   AUTHBOX — Ferramenta de descoberta de autoridade
   Miguel Mimoso Correia | CC-BY-NC-SA

   Corre na página de edição de uma autoridade do Koha
   (intranet). Mostra:
     1. Cartão de identidade do autor principal (dados locais
        200/017 do Koha + biografia/identificadores de leitura
        vindos da Wikidata, sempre distinguidos visualmente).
     2. Carrossel de capas dos bibliográficos relacionados
        ("como autor" e "sobre o autor"), servidas pelo Koha.
     3. Co-autorias e outras responsabilidades encontradas nos
        bibliográficos ligados, agrupadas por código de função.
     4. Painel de qualidade (secundário/expansível): motor de
        validação estrutural 7xx/$9/$4 herdado da versão anterior.

   Este ficheiro NUNCA escreve em nenhum campo MARC. Todos os
   pedidos de rede são GET. Nada aqui grava na base de dados;
   qualquer alteração continua a exigir gravação manual pelo
   catalogador na interface nativa do Koha. Se qualquer parte
   deste script falhar, a edição nativa da autoridade continua
   disponível e intacta.

   DEPLOYMENT — ficheiro único, CSS isolado internamente:
   Para caber num único IntranetUserJS, o CSS vive na secção 0
   abaixo (bloco de string próprio, nunca misturado com lógica)
   e é injetado uma única vez via <style id="abx-estilos">. Para
   editar apenas a aparência, mexe só nessa secção; para editar
   comportamento, o CSS nunca é tocado a partir daí em diante.

   DEPENDÊNCIAS A CONFIRMAR NESTA INSTALAÇÃO (ver CONFIG):
   - Capas: assume-se /cgi-bin/koha/opac-image.pl?biblionumber=N
     como endpoint de imagem de capa local do Koha. Confirmar no
     DevTools se esta instalação expõe capas locais (Coce,
     OPACLocalCoverImages ou CustomCoverImages); se a imagem
     falhar, o item é ocultado sem erro visível ao utilizador.
   - Estrutura visual da página de edição de autoridades (leitura
     de 200/400/500/017): depende de padrões de texto/label da
     interface Koha 24.05; se a interface mudar, os pontos de
     leitura estão isolados nas funções da secção "MARC / DOM".
   ========================================================== */

(function () {
    "use strict";

    if (window.__abxAtivo) return;
    window.__abxAtivo = true;

    // ==========================================================
    // 0. CSS — bloco isolado, nunca misturado com a lógica abaixo.
    //    Injetado uma única vez via <style id="abx-estilos">.
    //    Para alterar só a aparência, edita apenas este bloco.
    // ==========================================================
    var ABX_CSS = `
/* ==========================================================
   AUTHBOX — Folha de estilos (secção isolada dentro do JS)
   Todas as classes usam o prefixo "abx-" para nunca colidir
   com CSS nativo do Koha (tabelas, botões, cartões, etc.).
   Vive aqui, num único bloco, para que o ficheiro completo
   caiba num só IntranetUserJS. Injetado uma única vez em
   <style id="abx-estilos"> pela função carregarCSS() (secção 6).
   ========================================================== */

#abx-root { font-family: Inter, Arial, sans-serif; font-size: 12.5px; color: #16212c;
  background: #fff; border: 1px solid #d9e2ea; border-radius: 8px;
  box-shadow: 0 1px 2px rgba(16,24,32,.04), 0 8px 20px rgba(16,24,32,.045);
  overflow: hidden; margin: 14px 0; }
#abx-root * { box-sizing: border-box; }

/* ---------- Cabeçalho ---------- */
.abx-header { display: flex; justify-content: space-between; align-items: center; gap: 12px;
  padding: 12px 18px; border-bottom: 1px solid #e5ebf0; background: #fbfdfe; }
.abx-header-titulo { display: flex; gap: 10px; align-items: center; }
.abx-icone { width: 30px; height: 30px; border-radius: 8px; flex: 0 0 30px;
  background: linear-gradient(135deg,#0f6e93 0%,#0b4f6c 100%);
  display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 13px; }
.abx-header-titulo strong { font-size: 14.5px; font-weight: 750; }
.abx-count { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px;
  border-radius: 99px; background: #eef2f5; color: #5b6b78; font-size: 11px; font-weight: 800; padding: 0 6px; }
.abx-toggle { display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 6px;
  border: 1px solid #c7d2da; background: #fff; font-size: 11px; font-weight: 650; color: #5b6b78; cursor: pointer; }
.abx-toggle svg { width: 12px; height: 12px; transition: transform .15s ease; }
#abx-root.abx-colapsado .abx-toggle svg { transform: rotate(-90deg); }
#abx-root.abx-colapsado .abx-corpo { display: none; }

/* ---------- Cartão de identidade (autor principal) ---------- */
.abx-identidade { padding: 16px 18px; border-bottom: 1px solid #e5ebf0; }
.abx-eyebrow { font-size: 10px; font-weight: 750; letter-spacing: .05em; text-transform: uppercase;
  color: #0b4f6c; margin: 0 0 10px; }
.abx-id-grid { display: grid; grid-template-columns: 92px 1fr; gap: 14px; }
.abx-foto { width: 92px; height: 122px; object-fit: cover; border-radius: 6px; border: 1px solid #d9e2ea; background: #eef2f5; }
.abx-foto-vazia { display: flex; align-items: center; justify-content: center; color: #98a4ae; }
.abx-foto-vazia svg { width: 30px; height: 30px; }
.abx-nome { font-size: 17px; font-weight: 750; letter-spacing: -.01em; line-height: 1.25; }
.abx-papel { display: inline-block; margin-top: 6px; border: 1px solid #d9e2ea; background: #f8fafb;
  border-radius: 99px; padding: 3px 10px; font-size: 10.5px; font-weight: 650; color: #5b6b78; }
.abx-blurb { margin-top: 7px; font-size: 12.5px; color: #33424e; }

.abx-fields { margin-top: 12px; border-top: 1px solid #eef1f4; }
.abx-field-row { display: grid; grid-template-columns: 96px 1fr; gap: 10px; padding: 7px 0;
  border-bottom: 1px solid #eef1f4; font-size: 12px; }
.abx-field-row strong { color: #5b6b78; font-weight: 650; }

.abx-wiki-btn { display: inline-flex; align-items: center; gap: 6px; margin: 12px 0 10px; padding: 7px 12px;
  border-radius: 6px; border: 1px solid #c7d2da; background: #fff; color: #16212c; font-size: 11.5px;
  font-weight: 650; text-decoration: none; }
.abx-wiki-btn:hover { background: #f1f4f6; }

.abx-badges-ids { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
.abx-id-badge { display: inline-flex; align-items: center; gap: 5px; border-radius: 99px; padding: 4px 10px;
  font-size: 10.5px; font-weight: 700; text-decoration: none; border: 1px solid transparent; }
.abx-id-badge.abx-fonte-koha { background: #e6f1f6; color: #0b4f6c; border-color: #bcdcea; }
.abx-id-badge.abx-fonte-wikidata { background: #f1eefc; color: #4b3a92; border-color: #dcd4f7; }
.abx-legenda-fontes { margin-top: 6px; font-size: 10px; color: #98a4ae; }

/* ---------- Carrossel de capas ---------- */
.abx-capas-secao { padding: 14px 18px; border-bottom: 1px solid #e5ebf0; }
.abx-capas-titulo { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; }
.abx-capas-titulo span { font-size: 10px; font-weight: 750; letter-spacing: .04em; text-transform: uppercase; color: #5b6b78; }
.abx-tabs { display: flex; gap: 6px; }
.abx-tab { border: 1px solid #c7d2da; background: #fff; color: #5b6b78; border-radius: 99px; padding: 3px 10px;
  font-size: 10.5px; font-weight: 650; cursor: pointer; }
.abx-tab.abx-tab-ativa { background: #0b4f6c; border-color: #0b4f6c; color: #fff; }
.abx-carrossel { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; scroll-snap-type: x proximity; }
.abx-carrossel::-webkit-scrollbar { height: 6px; }
.abx-carrossel::-webkit-scrollbar-thumb { background: #d9e2ea; border-radius: 99px; }
.abx-capa-item { flex: 0 0 74px; scroll-snap-align: start; text-decoration: none; color: inherit; }
.abx-capa-img { width: 74px; height: 108px; object-fit: cover; border-radius: 4px; border: 1px solid #d9e2ea; background: #eef2f5; }
.abx-capa-titulo { display: block; font-size: 10px; line-height: 1.25; margin-top: 5px; color: #33424e;
  overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.abx-capas-vazio { font-size: 11.5px; color: #98a4ae; font-style: italic; padding: 6px 0; }

/* ---------- Co-autorias e outras responsabilidades ---------- */
.abx-coautores-secao { border-bottom: 1px solid #e5ebf0; }
.abx-coautores-toggle { width: 100%; display: flex; justify-content: space-between; align-items: center;
  padding: 12px 18px; background: #fbfcfd; border: none; cursor: pointer; font-family: inherit; text-align: left; }
.abx-coautores-toggle strong { font-size: 12px; font-weight: 650; }
.abx-coautores-toggle svg { width: 12px; height: 12px; transition: transform .15s ease; }
.abx-coautores-corpo { padding: 0 18px 14px; }
.abx-coautores-corpo.abx-fechado { display: none; }
.abx-grupo-funcao { border: 1px solid #e5ebf0; border-radius: 8px; margin-top: 8px; overflow: hidden; }
.abx-grupo-cabecalho { display: flex; justify-content: space-between; align-items: center; padding: 9px 12px;
  background: #f8fafb; font-size: 11.5px; font-weight: 650; }
.abx-grupo-lista { padding: 8px 10px; display: flex; flex-direction: column; gap: 7px; }
.abx-coautor-card { display: flex; align-items: center; gap: 10px; padding: 6px 4px; }
.abx-avatar { width: 40px; height: 40px; border-radius: 50%; background: #eef2f5; color: #5b6b78;
  display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; flex: 0 0 40px; }
.abx-coautor-nome { font-size: 12.5px; font-weight: 650; }
.abx-coautor-papel { display: inline-block; margin-top: 2px; border: 1px solid #d9e2ea; background: #fff;
  border-radius: 99px; padding: 1px 8px; font-size: 9.5px; font-weight: 650; color: #5b6b78; }
.abx-coautor-link { display: block; margin-top: 2px; font-size: 10.5px; color: #0b4f6c; font-weight: 650; text-decoration: none; }
.abx-coautor-indisponivel { display: block; margin-top: 2px; font-size: 10.5px; color: #98a4ae; font-style: italic; }

/* ---------- Painel de qualidade (secundário, expansível) ---------- */
.abx-quality-toggle { width: 100%; display: flex; justify-content: space-between; align-items: center;
  padding: 12px 18px; background: #fff; border: none; border-bottom: 1px solid #e5ebf0; cursor: pointer;
  font-family: inherit; text-align: left; }
.abx-quality-toggle strong { font-size: 12px; font-weight: 650; }
.abx-score-chip { font-size: 10.5px; font-weight: 700; border-radius: 99px; padding: 3px 9px; }
.abx-score-good { background: #e9f7ef; color: #1f7a4d; }
.abx-score-warning { background: #fdf1e2; color: #c67510; }
.abx-score-critical { background: #fdeeec; color: #c4392b; }
.abx-quality-corpo.abx-fechado { display: none; }

.abx-kpis { display: grid; grid-template-columns: repeat(5,1fr); gap: 1px; background: #e5ebf0; }
.abx-kpi { background: #fff; border: 0; text-align: left; padding: 11px 12px; cursor: pointer; font-family: inherit; position: relative; }
.abx-kpi::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; }
.abx-kpi-vermelho::before { background: #c4392b; } .abx-kpi-laranja::before { background: #c67510; }
.abx-kpi-verde::before { background: #1f7a4d; } .abx-kpi-azul::before { background: #0f6e93; } .abx-kpi-roxo::before { background: #6a3fb5; }
.abx-kpi-titulo { display: block; font-size: 9.5px; text-transform: uppercase; letter-spacing: .03em; color: #5b6b78; font-weight: 650; margin-top: 4px; }
.abx-kpi-valor { display: block; font-size: 19px; font-weight: 800; margin-top: 2px; }
.abx-kpi-detalhe { display: block; font-size: 10px; color: #5b6b78; margin-top: 2px; }

.abx-controlbar { display: flex; align-items: center; gap: 12px; padding: 11px 18px; background: #f8fafb;
  border-bottom: 1px solid #e5ebf0; flex-wrap: wrap; }
.abx-btn-carregar { display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px; border-radius: 6px;
  border: 1px solid transparent; background: #0b4f6c; color: #fff; font-size: 11.5px; font-weight: 650; cursor: pointer; font-family: inherit; }
.abx-btn-carregar:disabled { opacity: .55; cursor: not-allowed; }
.abx-progresso-wrap { flex: 1; min-width: 160px; height: 7px; background: #e4e9ed; border-radius: 99px; overflow: hidden; }
.abx-progresso-wrap.abx-fechado { opacity: .35; }
.abx-progresso-fill { display: block; height: 100%; width: 0; background: linear-gradient(90deg,#6bb9d6,#0f6e93); border-radius: 99px; transition: width .25s ease; }
.abx-progresso-texto { font-size: 10.5px; color: #5b6b78; white-space: nowrap; }
.abx-status { padding: 8px 18px; font-size: 11.5px; color: #5b6b78; background: #fbfcfd; border-bottom: 1px solid #e5ebf0; }

.abx-menu { display: flex; gap: 7px; flex-wrap: wrap; padding: 10px 18px; border-bottom: 1px solid #e5ebf0; }
.abx-menu-btn { display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 99px;
  border: 1px solid #c7d2da; background: #fff; font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; color: #5b6b78; }
.abx-menu-btn.abx-ativo { background: #0b4f6c; border-color: #0b4f6c; color: #fff; }
.abx-menu-critico { border-left: 3px solid #c4392b; } .abx-menu-revisao { border-left: 3px solid #c67510; }
.abx-menu-ok { border-left: 3px solid #1f7a4d; } .abx-menu-neutro { border-left: 3px solid #98a4ae; }

.abx-table-wrap { max-height: 380px; overflow: auto; }
.abx-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.abx-table thead th { position: sticky; top: 0; background: #f8fafb; text-align: left; padding: 7px 12px;
  border-bottom: 1px solid #e5ebf0; font-size: 10px; text-transform: uppercase; letter-spacing: .03em; color: #5b6b78; z-index: 2; }
.abx-table tbody td { padding: 7px 12px; border-bottom: 1px solid #eef1f4; vertical-align: top; }
.abx-table tbody tr:hover td { background: #f9fbfc; }
.abx-table a { color: #0b4f6c; font-weight: 650; text-decoration: none; }
.abx-titulo-cell { font-weight: 650; min-width: 200px; }
.abx-chip { display: inline-block; border: 1px solid #e5ebf0; background: #f8fafb; border-radius: 99px; padding: 2px 7px; font-size: 10.5px; }
.abx-pill { display: inline-flex; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; }
.abx-prio-critica { background: #fdeeec; color: #c4392b; } .abx-prio-revisao { background: #fdf1e2; color: #c67510; } .abx-prio-info { background: #f1f3f5; color: #5b6b78; }
.abx-acao-detalhe { font-size: 10px; color: #5b6b78; margin-top: 2px; max-width: 280px; }
.abx-badge-estado { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; }
.abx-badge-estado.ok { background: #e9f7ef; color: #1f7a4d; }
.abx-btn-mini { border: 1px solid #c7d2da; background: #fff; color: #5b6b78; padding: 3px 8px; border-radius: 5px;
  font-size: 10px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: inherit; text-decoration: none; display: inline-flex; }
.abx-btn-mini:hover { background: #f1f4f6; color: #16212c; }
.abx-links { display: flex; gap: 5px; }
.abx-rodape { padding: 8px 18px; font-size: 10.5px; color: #5b6b78; border-top: 1px solid #e5ebf0; background: #fbfcfd; }
.abx-vazio { padding: 14px; text-align: center; color: #5b6b78; font-style: italic; }

@media (max-width: 720px) {
  .abx-id-grid { grid-template-columns: 1fr; }
  .abx-foto, .abx-foto-vazia { width: 100%; height: 160px; }
  .abx-kpis { grid-template-columns: repeat(2,1fr); }
}
`;

    // ==========================================================
    // 1. CONFIGURAÇÃO
    // ==========================================================
    var CONFIG = {
        debug: false,
        timeoutMARC: 12000,
        timeoutWikidata: 9000,
        maxCandidatosValidacao: 180,
        maxCapasPorLista: 24,
        coverUrlTemplate: "/cgi-bin/koha/opac-image.pl?biblionumber={id}", // confirmar na instalação
        idiomasWikidata: ["pt", "en"]
    };

    // Códigos de função (UNIMARC $4) autorizados — usados para
    // validar 700/701/702 e para rotular grupos de co-autoria.
    var CODIGOS_FUNCAO = {
        "000": "Indeterminada", "005": "Actor", "010": "Adaptador", "020": "Anotador",
        "030": "Autor de arranjo musical", "040": "Artista", "050": "Responsável editorial",
        "060": "Nome associado", "065": "Leiloeiro", "070": "Autor", "072": "Autor em citações",
        "075": "Posfaciador", "080": "Autor da introdução", "090": "Autor do diálogo",
        "100": "Antecedente bibliográfico", "110": "Encadernador", "120": "Concepção da encadernação",
        "130": "Concepção gráfica", "140": "Concepção da capa", "150": "Concepção dos extratextos",
        "160": "Livreiro", "170": "Calígrafo", "180": "Cartógrafo", "190": "Censor",
        "200": "Coreógrafo", "205": "Colaborador", "210": "Comentador", "212": "Comentador (texto)",
        "220": "Compilador", "230": "Compositor", "240": "Compositor gráfico", "245": "Ideia original",
        "250": "Maestro", "260": "Detentor dos direitos de autor", "270": "Corrector",
        "273": "Organizador de exposição", "275": "Bailarino", "280": "Personalidade dedicatária",
        "290": "Autor da dedicatória", "300": "Director", "305": "Dissertador", "310": "Distribuidor",
        "320": "Doador", "330": "Autor incerto", "340": "Editor literário", "350": "Gravador (burilista)",
        "360": "Gravador (aguafortista)", "365": "Perito", "370": "Editor de filmes", "380": "Contrafactor",
        "390": "Antigo possuidor", "410": "Técnico gráfico", "420": "Em memória/honra de",
        "430": "Iluminista", "440": "Ilustrador", "445": "Empresário", "450": "Autor da apresentação",
        "460": "Entrevistado", "470": "Entrevistador", "480": "Libretista",
        "490": "Personalidade que detém licença", "500": "Pessoa que concede licença", "510": "Litógrafo",
        "520": "Autor de letras", "530": "Gravador em metal", "540": "Supervisor", "545": "Músico",
        "550": "Narrador", "555": "Arguente", "557": "Organizador de conferência", "560": "Investigador",
        "570": "Outro", "580": "Fabricante de papel", "590": "Intérprete", "600": "Fotógrafo",
        "610": "Impressor", "620": "Impressor de chapa gravada", "630": "Produtor", "632": "Director artístico",
        "633": "Equipa de produção", "640": "Revisor", "650": "Editor comercial", "660": "Destinatário de carta(s)",
        "670": "Técnico de gravação", "680": "Rubricador", "690": "Cenógrafo", "695": "Consultor científico",
        "700": "Escriba (copista)", "705": "Escultor", "710": "Relator", "720": "Autor de assinatura manuscrita",
        "721": "Cantor", "723": "Patrocinador", "727": "Orientador de tese", "730": "Tradutor",
        "740": "Concepção do tipo", "750": "Tipógrafo", "755": "Entretainer", "760": "Gravador em madeira",
        "770": "Responsável pelo material acompanhante"
    };

    // Demónimos conhecidos (best-effort). Quando o país não consta
    // aqui, mostra-se "País: X" em vez de tentar compor a frase —
    // nunca inventamos um gentílico incorreto.
    var DEMONIMOS_PT = {
        "frança": "francês", "portugal": "português", "espanha": "espanhol",
        "itália": "italiano", "alemanha": "alemão", "reino unido": "britânico",
        "estados unidos da américa": "norte-americano", "estados unidos": "norte-americano",
        "brasil": "brasileiro", "rússia": "russo", "japão": "japonês", "china": "chinês",
        "argentina": "argentino", "méxico": "mexicano", "canadá": "canadiano",
        "países baixos": "neerlandês", "bélgica": "belga", "suíça": "suíço", "áustria": "austríaco",
        "polónia": "polaco", "grécia": "grego", "irlanda": "irlandês", "suécia": "sueco",
        "noruega": "norueguês", "dinamarca": "dinamarquês", "finlândia": "finlandês"
    };

    // ==========================================================
    // 2. LOGGING
    // ==========================================================
    var log = {
        debug: function () { if (CONFIG.debug) console.debug.apply(console, ["[AuthBox]"].concat(slice(arguments))); },
        info: function () { if (CONFIG.debug) console.info.apply(console, ["[AuthBox]"].concat(slice(arguments))); },
        warn: function () { console.warn.apply(console, ["[AuthBox]"].concat(slice(arguments))); },
        error: function () { console.error.apply(console, ["[AuthBox]"].concat(slice(arguments))); }
    };
    function slice(a) { return Array.prototype.slice.call(a); }

    $(document).ready(function () {
        if (!isAuthorityDetailPage()) return;

        // ------------------------------------------------------
        // Estado central da instância
        // ------------------------------------------------------
        var STATE = {
            authority: null,
            wikidata: null,           // biografia/identificadores externos resolvidos
            wikidataToken: 0,
            candidatos: [],
            ocorrencias: [],
            diagnostics: [],
            score: 0,
            filtroIntervencao: "ligados",
            capasComo: [],             // biblionumbers "como autor"
            capasSobre: [],            // biblionumbers "sobre o autor"
            capaAbaAtiva: "como",
            dashboardExecutada: false,
            dashboardEmCurso: false,
            dashboardToken: 0,
            xhrDashboard: [],
            colapsado: false,
            qualityAberta: false,
            coautoresAberta: true
        };

        carregarCSS();
        $("#abx-root").remove();
        construirEsqueleto();
        atualizarAuthorityState();
        renderTudo();
        if (lerFlagLocal("abx_colapsado")) aplicarColapso(true);
        ligarEventos();
        resolverWikidataSeAplicavel();

        // ==========================================================
        // 3. DETEÇÃO DE PÁGINA
        // ==========================================================
        function isAuthorityDetailPage() {
            var path = window.location.pathname || "";
            var params = new URLSearchParams(window.location.search || "");
            var pagina = path.indexOf("/cgi-bin/koha/authorities/authorities.pl") !== -1 ||
                path.indexOf("/authorities/authorities.pl") !== -1;
            if (!pagina) return false;
            return !!params.get("authid") || params.has("authtypecode");
        }

        function authidAtual() {
            var params = new URLSearchParams(window.location.search || "");
            var id = params.get("authid");
            return id && /^\d+$/.test(id) ? id : "";
        }

        // ==========================================================
        // 4. UTILITÁRIOS GERAIS
        // ==========================================================
        function limpar(txt) { return String(txt || "").replace(/\s+/g, " ").trim(); }

        function escaparHTML(txt) {
            return String(txt || "")
                .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        }

        function escaparRegex(txt) { return String(txt || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

        function normalizar(txt) {
            return String(txt || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
        }

        function removerDuplicados(lista) {
            var vistos = {}, out = [];
            $.each(lista || [], function (i, v) { v = limpar(v); if (v && !vistos[v]) { vistos[v] = true; out.push(v); } });
            return out;
        }

        function contemPalavraInteira(texto, palavra) {
            if (!texto || !palavra) return false;
            var re = new RegExp("(^|[^a-z0-9])" + escaparRegex(palavra) + "($|[^a-z0-9])", "i");
            return re.test(" " + texto + " ");
        }

        function iniciais(nome) {
            var partes = limpar(nome).split(" ").filter(Boolean);
            if (!partes.length) return "?";
            if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
            return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
        }

        // Normaliza texto MARC "verboso" (rótulos completos que o Koha
        // por vezes injeta no DOM em vez do valor puro) para um valor
        // legível. Isolado aqui porque é a função mais dependente da
        // estrutura visual concreta desta instalação.
        function limparValorMARCOperacional(txt) {
            var valor = limpar(txt);
            if (!valor) return "";
            valor = valor.replace(/\u00a0/g, " ").replace(/‡/g, "$").replace(/ǂ/g, "$")
                .replace(/^Primeira menção de responsabilidade\s+/i, "")
                .replace(/^Menção de responsabilidade\s+/i, "");

            var padroes = [
                /^(.+?)\s+Autoridade\s+Outra parte do nome não tomada para palavra de ordem\s+(.+?)(?:\s+Datas\s+(.+))?$/i,
                /^(.+?)\s+Outra parte do nome não tomada para palavra de ordem\s+(.+?)(?:\s+Datas\s+(.+))?$/i
            ];
            for (var i = 0; i < padroes.length; i++) {
                var m = valor.match(padroes[i]);
                if (m) return limpar(m[1]) + ", " + limpar(m[2]) + (m[3] ? " " + limpar(m[3]) : "");
            }
            var m2 = valor.match(/^(.+?)\s+(?:Autoridade\s+)?Outra parte do nome não tomada para\s+(.+)$/i);
            if (m2) return limpar(m2[1]) + ", " + limpar(m2[2]);

            return valor.replace(/\bPalavra de ordem\b\s*/ig, "").replace(/\bAutoridade\b\s*/ig, "")
                .replace(/\bOutra parte do nome não tomada para palavra de ordem\b\s*/ig, ", ")
                .replace(/\bOutra parte do nome não tomada para\b\s*/ig, ", ")
                .replace(/\bDatas\b\s*/ig, " ").replace(/\s+,\s+/g, ", ").replace(/\s+/g, " ").trim();
        }

        // ==========================================================
        // 5. PERSISTÊNCIA LOCAL (só no browser do catalogador)
        // ==========================================================
        function chaveRevisao(authid) { return "abx_revisao_" + authid; }

        function lerEstadosRevisao(authid) {
            if (!authid) return {};
            try { return JSON.parse(localStorage.getItem(chaveRevisao(authid)) || "{}"); } catch (e) { return {}; }
        }

        function gravarEstadoRevisao(authid, chave, estado) {
            if (!authid || !chave) return;
            try {
                var estados = lerEstadosRevisao(authid);
                if (estado) estados[chave] = { estado: estado, em: Date.now() }; else delete estados[chave];
                localStorage.setItem(chaveRevisao(authid), JSON.stringify(estados));
            } catch (e) { log.warn("Não foi possível gravar estado de revisão.", e); }
        }

        function chaveOcorrencia(dados) {
            var obra = dados.obra || {};
            return [obra.biblionumber || "", dados.campo || "", dados.problema || "",
                normalizar(String(dados.valorEncontrado || "")).slice(0, 60)].join("|");
        }

        function estaResolvida(o) { return !!(o && (o.estadoRevisao === "confirmado" || o.estadoRevisao === "falso_positivo")); }

        function lerFlagLocal(chave) { try { return localStorage.getItem(chave) === "1"; } catch (e) { return false; } }
        function gravarFlagLocal(chave, v) { try { localStorage.setItem(chave, v ? "1" : "0"); } catch (e) {} }

        // ==========================================================
        // 6. INJEÇÃO DE CSS (a partir do bloco isolado ABX_CSS, secção 0)
        // ==========================================================
        function carregarCSS() {
            if ($("#abx-estilos").length) return; // idempotente: nunca duplica <style>
            $("<style>").attr("id", "abx-estilos").text(ABX_CSS).appendTo("head");
        }

        // ==========================================================
        // 7. MARC / DOM — leitura só-de-leitura da página de edição
        //    (isolado aqui: é o ponto a rever primeiro se o Koha
        //    mudar a estrutura visual do editor de autoridades)
        // ==========================================================
        function obterCampo200Autoridade() {
            var campo = $();
            $("li").each(function () {
                var li = $(this), texto = limpar(li.text());
                if (texto.indexOf("200") !== -1 && texto.indexOf("Palavra de ordem") !== -1) { campo = li; return false; }
            });
            return campo;
        }

        function obterValorSubcampo(campo, etiqueta) {
            var valor = "";
            if (!campo.length) return "";
            campo.find("li, div, p, tr").each(function () {
                var linha = $(this), texto = limpar(linha.text());
                if (texto.indexOf(etiqueta) === -1) return;
                var input = linha.find("input[type='text'], textarea")
                    .filter(function () { return $(this).is(":visible") && $(this).outerWidth() > 70; }).last();
                if (input.length) { valor = limpar(input.val()); return false; }
            });
            return valor;
        }

        function escaparSelector(txt) {
            if ($.escapeSelector) return $.escapeSelector(txt);
            return String(txt || "").replace(/([ #;?%&,.+*~':"!^$[\]()=>|\/@])/g, "\\$1");
        }

        function encontrarCampoPorEtiqueta(bloco, etiqueta) {
            var resultado = $();
            bloco.find("label").each(function () {
                var label = $(this);
                if (limpar(label.text()).indexOf(etiqueta) === -1) return;
                var idCampo = label.attr("for");
                if (idCampo && $("#" + escaparSelector(idCampo)).length) { resultado = $("#" + escaparSelector(idCampo)); return false; }
                var input = label.closest("li, div, tr, p").find("input[type='text'], textarea")
                    .filter(function () {
                        var v = limpar($(this).val()), w = $(this).outerWidth();
                        return w > 100 && v !== "a" && v !== "2" && v !== "017";
                    }).first();
                if (input.length) { resultado = input; return false; }
            });
            return resultado;
        }

        function classificarIdentificador017(valor, fonte) {
            var v = String(valor || "").trim(), f = String(fonte || "").toLowerCase();
            if (/^Q\d+$/i.test(v) || f.indexOf("wikidata") !== -1) return "wikidata";
            if (/^\d+$/.test(v) && f.indexOf("viaf") !== -1) return "viaf";
            return "outro";
        }

        // Só-leitura: mostra os 017 já preenchidos no cartão. A escrita
        // de um novo identificador é feita por authsearch.js.
        function obterIdentificadores017() {
            var out = [];
            $("li, div, tr").each(function () {
                var bloco = $(this), texto = limpar(bloco.text());
                if (texto.indexOf("017") === -1 || texto.indexOf("Identificador") === -1 || texto.indexOf("Sistema de codificação") === -1) return;
                var campoA = encontrarCampoPorEtiqueta(bloco, "Identificador");
                var campo2 = encontrarCampoPorEtiqueta(bloco, "Sistema de codificação");
                if (!campoA.length && !campo2.length) return;
                var valorA = campoA.length ? limpar(campoA.val()) : "";
                var valor2 = campo2.length ? limpar(campo2.val()).toLowerCase() : "";
                if (!valorA && !valor2) return;
                out.push({ valor: valorA, fonte: valor2, tipo: classificarIdentificador017(valorA, valor2) });
            });
            return out;
        }

        function extrairFormasDeBloco(regex300or400or500, etiquetasChave) {
            var resultado = [], vistos = {};
            $("li, div, tr").each(function () {
                var bloco = $(this), texto = limpar(bloco.text());
                if (texto.indexOf(regex300or400or500) === -1) return;
                var temEtiqueta = etiquetasChave.some(function (e) { return texto.indexOf(e) !== -1; });
                if (!temEtiqueta) return;

                var nomeA = obterValorSubcampo(bloco, "Palavra de ordem");
                var nomeB = obterValorSubcampo(bloco, "Outra parte do nome");
                var datas = obterValorSubcampo(bloco, "Datas");
                var relacao5 = obterValorSubcampoPorCodigo(bloco, "5") || obterValorSubcampo(bloco, "Código de relação") || obterValorSubcampo(bloco, "Relação");
                var formas = [];
                if (nomeB || nomeA) {
                    formas.push(limpar([nomeB, nomeA].filter(Boolean).join(" ")));
                    formas.push(limpar([nomeA, nomeB].filter(Boolean).join(" ")));
                }
                formas.forEach(function (forma) {
                    forma = limpar(forma);
                    var chave = normalizar(forma);
                    if (!forma || forma.length < 3 || !chave || vistos[chave]) return;
                    vistos[chave] = true;
                    resultado.push({ forma: forma, nomeA: nomeA || "", nomeB: nomeB || "", datas: datas || "", relacao5: relacao5 || "" });
                });
            });
            return resultado;
        }

        function obterValorSubcampoPorCodigo(campo, codigo) {
            var valor = "";
            codigo = String(codigo || "").replace(/^\$/, "").toLowerCase();
            if (!campo || !campo.length || !codigo) return "";
            campo.find("input[type='text'], textarea, select").each(function () {
                var el = $(this), id = String(el.attr("id") || "").toLowerCase(), name = String(el.attr("name") || "").toLowerCase();
                var contexto = limpar(el.closest("li, div, p, tr").text()).toLowerCase();
                var corresponde = id.indexOf("subfield_" + codigo) !== -1 || name.indexOf("subfield_" + codigo) !== -1 ||
                    id.match(new RegExp("_" + codigo + "($|_)", "i")) || contexto.indexOf("$" + codigo) !== -1;
                if (!corresponde) return;
                var v = limpar(el.val());
                if (v) { valor = v; return false; }
            });
            if (!valor) {
                var m = limpar(campo.text()).match(new RegExp("\\$" + codigo + "\\s*[:=]?\\s*([^$]+)", "i"));
                if (m) valor = limpar(m[1]);
            }
            return valor;
        }

        function obterDadosAutoridade() {
            var campo200 = obterCampo200Autoridade();
            var nomeB = obterValorSubcampo(campo200, "Outra parte do nome");
            var nomeA = obterValorSubcampo(campo200, "Palavra de ordem");
            var datas = obterValorSubcampo(campo200, "Datas");
            var ids017 = obterIdentificadores017();
            return {
                authid: authidAtual(),
                nomeA: nomeA, nomeB: nomeB, nome: limpar([nomeB, nomeA].filter(Boolean).join(" ")), datas: datas,
                wikidata: ids017.filter(function (i) { return i.tipo === "wikidata"; }),
                viaf: ids017.filter(function (i) { return i.tipo === "viaf"; }),
                variantes400: extrairFormasDeBloco("400", ["Palavra de ordem", "Outra parte do nome", "Forma variante", "Ver também"]),
                relacionadas500: extrairFormasDeBloco("500", ["Palavra de ordem", "Outra parte do nome", "Forma relacionada", "Ver também"])
            };
        }

        function atualizarAuthorityState() {
            STATE.authority = obterDadosAutoridade();
            STATE.diagnostics = diagnosticarAutoridade(STATE.authority);
            STATE.score = calcularScore();
        }

        // ==========================================================
        // 8. ENRIQUECIMENTO EXTERNO — WIKIDATA (leitura, fonte externa)
        //    Nunca confundir com dados locais: tudo o que vem daqui é
        //    marcado com .abx-fonte-wikidata no cartão de identidade.
        // ==========================================================
        function fetchComTimeout(url, timeoutMs) {
            var controller = new AbortController();
            var timer = setTimeout(function () { controller.abort(); }, timeoutMs);
            return fetch(url, { signal: controller.signal, method: "GET" })
                .then(function (resp) {
                    clearTimeout(timer);
                    if (!resp.ok) throw new Error("HTTP " + resp.status);
                    return resp.json();
                })
                .catch(function (err) { clearTimeout(timer); throw err; });
        }

        function qidPrincipal() {
            var wd = STATE.authority && STATE.authority.wikidata.length ? STATE.authority.wikidata[0].valor : "";
            return (wd && /^Q\d+$/i.test(wd)) ? wd.toUpperCase() : "";
        }

        function resolverWikidataSeAplicavel() {
            var qid = qidPrincipal();
            if (!qid) return;
            var token = ++STATE.wikidataToken;
            var url = "https://www.wikidata.org/wiki/Special:EntityData/" + encodeURIComponent(qid) + ".json";
            fetchComTimeout(url, CONFIG.timeoutWikidata)
                .then(function (data) {
                    if (token !== STATE.wikidataToken) return;
                    var entidade = data && data.entities ? data.entities[qid] : null;
                    if (!entidade) return;
                    processarEntidadeWikidata(entidade, qid, token);
                })
                .catch(function (err) { log.warn("Wikidata indisponível ou timeout.", err); });
        }

        function idsClaim(entidade, prop) {
            if (!entidade.claims || !entidade.claims[prop]) return [];
            return entidade.claims[prop].map(function (c) {
                try { return c.mainsnak.datavalue.value; } catch (e) { return null; }
            }).filter(Boolean);
        }

        function processarEntidadeWikidata(entidade, qid, token) {
            var imagem = "";
            var claimsP18 = idsClaim(entidade, "P18");
            if (claimsP18.length) imagem = "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(claimsP18[0]) + "?width=240";

            var ocupacoesQid = idsClaim(entidade, "P106").map(function (v) { return v.id; }).filter(Boolean);
            var paisQid = idsClaim(entidade, "P27").map(function (v) { return v.id; }).filter(Boolean);
            var premiosQid = idsClaim(entidade, "P166").map(function (v) { return v.id; }).filter(Boolean);
            var localNascQid = idsClaim(entidade, "P19").map(function (v) { return v.id; }).filter(Boolean);
            var dataNasc = idsClaim(entidade, "P569")[0];

            var isni = idsClaim(entidade, "P213")[0] || "";
            var lccn = idsClaim(entidade, "P244")[0] || "";
            var bnf = idsClaim(entidade, "P268")[0] || "";
            var gnd = idsClaim(entidade, "P227")[0] || "";

            var wikipediaUrl = "";
            if (entidade.sitelinks) {
                CONFIG.idiomasWikidata.concat(["en"]).forEach(function (lang) {
                    if (wikipediaUrl) return;
                    var site = entidade.sitelinks[lang + "wiki"];
                    if (site && site.title) wikipediaUrl = "https://" + lang + ".wikipedia.org/wiki/" + encodeURIComponent(site.title.replace(/ /g, "_"));
                });
            }

            var todosQids = removerDuplicados(ocupacoesQid.concat(paisQid, premiosQid, localNascQid));
            resolverRotulos(todosQids, token).then(function (rotulos) {
                if (token !== STATE.wikidataToken) return;
                STATE.wikidata = {
                    qid: qid, imagem: imagem,
                    ocupacoes: ocupacoesQid.map(function (q) { return rotulos[q]; }).filter(Boolean),
                    pais: paisQid.map(function (q) { return rotulos[q]; }).filter(Boolean),
                    premios: premiosQid.map(function (q) { return rotulos[q]; }).filter(Boolean),
                    localNascimento: localNascQid.map(function (q) { return rotulos[q]; }).filter(Boolean)[0] || "",
                    dataNascimento: formatarDataWikidata(dataNasc),
                    identificadores: { isni: isni, lccn: lccn, bnf: bnf, gnd: gnd },
                    wikipediaUrl: wikipediaUrl
                };
                renderIdentidade();
            }).catch(function (err) { log.warn("Falha a resolver rótulos Wikidata.", err); });
        }

        function formatarDataWikidata(claimValor) {
            if (!claimValor || !claimValor.time) return "";
            var m = String(claimValor.time).match(/^\+?(\d{1,4})-(\d{2})-(\d{2})/);
            if (!m) return "";
            var precisao = claimValor.precision;
            if (precisao <= 9) return m[1];
            return m[3] + "/" + m[2] + "/" + m[1];
        }

        // Um único pedido em lote a wbgetentities para rótulos (evita
        // N pedidos individuais). origin=* é necessário para CORS.
        function resolverRotulos(qids, token) {
            if (!qids.length) return Promise.resolve({});
            var url = "https://www.wikidata.org/w/api.php?action=wbgetentities&ids=" + qids.join("|") +
                "&props=labels&languages=" + CONFIG.idiomasWikidata.join("|") +
                "&format=json&origin=*";
            return fetchComTimeout(url, CONFIG.timeoutWikidata).then(function (data) {
                var rotulos = {};
                if (!data || !data.entities) return rotulos;
                Object.keys(data.entities).forEach(function (q) {
                    var labels = data.entities[q].labels || {};
                    var escolhido = "";
                    for (var i = 0; i < CONFIG.idiomasWikidata.length; i++) {
                        if (labels[CONFIG.idiomasWikidata[i]]) { escolhido = labels[CONFIG.idiomasWikidata[i]].value; break; }
                    }
                    rotulos[q] = escolhido;
                });
                return rotulos;
            });
        }

        function construirBlurb() {
            var wd = STATE.wikidata;
            if (!wd || !wd.ocupacoes.length) return "";
            var ocupacao = wd.ocupacoes[0].toLowerCase();
            var paisChave = wd.pais.length ? normalizar(wd.pais[0]) : "";
            var demonimo = "";
            Object.keys(DEMONIMOS_PT).forEach(function (k) { if (normalizar(k) === paisChave) demonimo = DEMONIMOS_PT[k]; });
            return demonimo ? (ocupacao + " " + demonimo) : ocupacao;
        }

        // ==========================================================
        // 9. DIAGNÓSTICO E PONTUAÇÃO (AuthQuality)
        // ==========================================================
        function issue(severity, title, text, action) { return { severity: severity, title: title, text: text, action: action }; }

        function analisarEstadoDatas(datas) {
            var d = limpar(datas || "");
            if (!d) return { estado: "bad", label: "Datas ausentes", detalhe: "Campo 200$f ausente." };
            var texto = d.replace(/\u2010|\u2011|\u2012|\u2013|\u2014|\u2212/g, "-").replace(/\s+/g, " ").trim();
            var numeros = texto.match(/\d{3,4}/g) || [];
            var fechado = /\d{3,4}\s*-\s*\d{3,4}/.test(texto);
            var abertoDepois = /\d{3,4}\s*-\s*$/.test(texto);
            var abertoAntes = /^-\s*\d{3,4}/.test(texto);
            if (fechado || numeros.length >= 2) return { estado: "ok", label: "Datas completas", detalhe: d };
            if (abertoDepois && numeros.length === 1) return { estado: "warn", label: "Falta data de morte", detalhe: d };
            if (abertoAntes && numeros.length === 1) return { estado: "warn", label: "Falta data de nascimento", detalhe: d };
            if (numeros.length === 1) return { estado: "warn", label: "Data única", detalhe: d };
            return { estado: "bad", label: "Datas não interpretadas", detalhe: d };
        }

        function estadoCompletudeForma(item, authority, campo) {
            var problemas = [];
            if (!limpar(item.forma || "")) problemas.push("forma vazia");
            if (limpar(authority.datas || "") && !limpar(item.datas || "")) problemas.push("datas vazias");
            if (campo === "500" && !limpar(item.relacao5 || "")) problemas.push("$5 vazio");
            if (!problemas.length) return { estado: "ok", titulo: campo + " completo", detalhe: "Preenchido e coerente." };
            return { estado: "warn", titulo: "Completar " + campo, detalhe: "Incompleto: " + problemas.join(" · ") + "." };
        }

        function diagnosticarAutoridade(authority) {
            var issues = [];
            if (!authority.authid) issues.push(issue("critical", "Sem authid", "Validação bibliográfica só fica disponível após gravar.", "Gravar a autoridade."));
            if (!authority.nomeA) issues.push(issue("critical", "200$a ausente", "Palavra de ordem não identificada.", "Completar 200$a."));
            if (!authority.nomeB) issues.push(issue("review", "200$b ausente", "Outra parte do nome não identificada.", "Confirmar estrutura do nome."));
            if (!authority.wikidata.length) issues.push(issue("review", "Wikidata ausente", "Sem QID no 017.", "Pesquisar e aplicar QID no 017."));
            if (!authority.viaf.length) issues.push(issue("review", "VIAF ausente", "Sem identificador VIAF no 017.", "Pesquisar e aplicar VIAF no 017."));
            authority.wikidata.forEach(function (id) { if (!/^Q\d+$/i.test(id.valor)) issues.push(issue("critical", "QID inválido", id.valor + " não é um QID válido.", "Corrigir 017$a.")); });
            authority.viaf.forEach(function (id) { if (!/^\d+$/.test(id.valor)) issues.push(issue("critical", "VIAF inválido", id.valor + " não é numérico.", "Corrigir 017$a.")); });
            if (authority.wikidata.length > 1) issues.push(issue("critical", "Múltiplos QID", "Mais do que um Wikidata no 017.", "Confirmar identidade."));
            if (authority.viaf.length > 1) issues.push(issue("review", "Múltiplos VIAF", "Mais do que um VIAF no 017.", "Confirmar identidade."));

            var estadoDatas = analisarEstadoDatas(authority.datas);
            if (estadoDatas.estado !== "ok") issues.push(issue("review", estadoDatas.label, estadoDatas.detalhe, "Confirmar/completar 200$f."));
            if (!authority.variantes400.length) issues.push(issue("info", "Campo 400 ausente", "Sem formas variantes registadas.", "Adicionar quando existirem."));

            authority.variantes400.forEach(function (v) { var e = estadoCompletudeForma(v, authority, "400"); if (e.estado !== "ok") issues.push(issue("review", e.titulo, e.detalhe, "Completar o 400.")); });
            authority.relacionadas500.forEach(function (v) { var e = estadoCompletudeForma(v, authority, "500"); if (e.estado !== "ok") issues.push(issue("review", e.titulo, e.detalhe, "Completar o 500.")); });
            return issues;
        }

        // Média ponderada: integridade bibliográfica (50%),
        // completude da autoridade (30%), identificadores externos (20%).
        function calcularScore() {
            var authority = STATE.authority, diagnostics = STATE.diagnostics || [];
            var ocorrencias = (STATE.ocorrencias || []).filter(function (o) { return !estaResolvida(o); });
            var scoreBib = 100, scoreAutoridade = 100, scoreIds = 0;

            var relevantes = ocorrencias.filter(function (o) { return o.grupo === "imediata" || o.grupo === "manual" || problemaOcorrencia(o) === "Ligação correta"; });
            if (STATE.dashboardExecutada && relevantes.length) {
                var ligadas = relevantes.filter(function (o) { return problemaOcorrencia(o) === "Ligação correta"; }).length;
                scoreBib = Math.round((ligadas / relevantes.length) * 100);
            } else if (STATE.dashboardExecutada) scoreBib = 100;

            var pesoDiag = { critical: 14, review: 6, info: 2 }, penal = 0;
            diagnostics.forEach(function (d) { penal += pesoDiag[d.severity] || 0; });
            scoreAutoridade = Math.max(0, 100 - penal);

            if (authority) {
                var temWD = authority.wikidata.length && /^Q\d+$/i.test(authority.wikidata[0].valor);
                var temVIAF = authority.viaf.length && /^\d+$/.test(authority.viaf[0].valor);
                scoreIds = (temWD ? 50 : 0) + (temVIAF ? 50 : 0);
            }
            var total = scoreBib * 0.5 + scoreAutoridade * 0.3 + scoreIds * 0.2;
            return Math.max(0, Math.min(100, Math.round(total)));
        }

        function estadoScore(score) {
            if (score >= 80) return { label: "Bom", classe: "abx-score-good" };
            if (score >= 55) return { label: "A rever", classe: "abx-score-warning" };
            return { label: "Crítico", classe: "abx-score-critical" };
        }

        // ==========================================================
        // 10. ESQUELETO / RENDER
        // ==========================================================
        function construirEsqueleto() {
            var html = "";
            html += '<div id="abx-root">';
            html += '  <div class="abx-header">';
            html += '    <div class="abx-header-titulo"><div class="abx-icone">A</div>';
            html += '      <div><strong>Autor(es)</strong> <span class="abx-count" id="abx-count">0</span></div></div>';
            html += '    <button type="button" class="abx-toggle" id="abx-toggle-corpo">' + iconeSeta() + ' <span id="abx-toggle-txt">Ocultar</span></button>';
            html += '  </div>';
            html += '  <div class="abx-corpo">';
            html += '    <div class="abx-identidade" id="abx-identidade"></div>';
            html += '    <div class="abx-capas-secao" id="abx-capas-secao"></div>';
            html += '    <div class="abx-coautores-secao" id="abx-coautores-secao"></div>';
            html += '    <button type="button" class="abx-quality-toggle" id="abx-quality-toggle">';
            html += '      <strong>Validação bibliográfica (avançado)</strong>';
            html += '      <span><span class="abx-score-chip" id="abx-score-chip"></span> ' + iconeSeta() + '</span>';
            html += '    </button>';
            html += '    <div class="abx-quality-corpo abx-fechado" id="abx-quality-corpo">';
            html += '      <div class="abx-kpis" id="abx-kpis"></div>';
            html += '      <div class="abx-controlbar">';
            html += '        <button type="button" class="abx-btn-carregar" id="abx-carregar">' + iconePlay() + ' Carregar bibliográficos</button>';
            html += '        <div class="abx-progresso-wrap abx-fechado" id="abx-progresso-wrap"><div class="abx-progresso-fill" id="abx-progresso-fill"></div></div>';
            html += '        <span class="abx-progresso-texto" id="abx-progresso-texto">Registos processados: 0 / 0 (0%)</span>';
            html += '      </div>';
            html += '      <div class="abx-status" id="abx-status">Aguardando carregamento bibliográfico.</div>';
            html += '      <div id="abx-area-intervencao"></div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';

            var alvo = $("h1").first().length ? $("h1").first() :
                $("#main_intranet-main").first().length ? $("#main_intranet-main").first() :
                $("#main").first().length ? $("#main").first() : $("body").first();
            if (alvo.is("h1")) alvo.after(html); else alvo.prepend(html);
        }

        function renderTudo() {
            atualizarAuthorityState();
            renderIdentidade();
            renderCapas();
            renderCoautores();
            renderQualityHeader();
            renderKpis();
            renderAreaIntervencao();
        }

        // ---------- 10.1 Cartão de identidade ----------
        function renderIdentidade() {
            var a = STATE.authority || {}, wd = STATE.wikidata;
            var wdWikidata = a.wikidata.length ? a.wikidata[0].valor : "";
            var wdViaf = a.viaf.length ? a.viaf[0].valor : "";
            var foto = wd && wd.imagem ? wd.imagem : "";
            var blurb = construirBlurb();
            var papel = papelPrincipal();

            var html = "";
            html += '<div class="abx-eyebrow">Autor principal</div>';
            html += '<div class="abx-id-grid">';
            html += foto ? '<img class="abx-foto" src="' + escaparHTML(foto) + '" alt="">' : '<div class="abx-foto abx-foto-vazia">' + iconePessoa() + '</div>';
            html += '<div>';
            html += '<div class="abx-nome">' + escaparHTML(a.nome || "Autoridade sem nome identificado") + '</div>';
            html += '<span class="abx-papel">' + escaparHTML(papel) + '</span>';
            if (blurb) html += '<div class="abx-blurb">' + escaparHTML(blurb) + '</div>';

            html += '<div class="abx-fields">';
            if (wd && wd.pais.length) html += campoLinha("País", escaparHTML(wd.pais.join(", ")));
            var nascimento = (wd && wd.dataNascimento) ? wd.dataNascimento : a.datas;
            if (nascimento) html += campoLinha("Nascimento", escaparHTML(nascimento) + (wd && wd.localNascimento ? ", " + escaparHTML(wd.localNascimento) : ""));
            if (wd && wd.premios.length) html += campoLinha("Prémios", escaparHTML(wd.premios.join("; ")));
            html += '</div>';

            if (wd && wd.wikipediaUrl) html += '<a class="abx-wiki-btn" target="_blank" rel="noopener noreferrer" href="' + escaparHTML(wd.wikipediaUrl) + '">Ler mais na Wikipédia ↗</a>';

            html += '<div class="abx-badges-ids">';
            if (wdViaf) html += idBadge("VIAF", "https://viaf.org/viaf/" + encodeURIComponent(wdViaf), "koha");
            if (wd && wd.identificadores.isni) html += idBadge("ISNI", "https://isni.org/isni/" + encodeURIComponent(wd.identificadores.isni.replace(/\s+/g, "")), "wikidata");
            if (wd && wd.identificadores.lccn) html += idBadge("LoC", "https://id.loc.gov/authorities/names/" + encodeURIComponent(wd.identificadores.lccn), "wikidata");
            if (wd && wd.identificadores.bnf) html += idBadge("BnF", "https://data.bnf.fr/ark:/12148/cb" + encodeURIComponent(wd.identificadores.bnf), "wikidata");
            if (wd && wd.identificadores.gnd) html += idBadge("GND", "https://d-nb.info/gnd/" + encodeURIComponent(wd.identificadores.gnd), "wikidata");
            if (wdWikidata) html += idBadge("Wikidata", "https://www.wikidata.org/wiki/" + encodeURIComponent(wdWikidata), "koha");
            html += '</div>';
            html += '<div class="abx-legenda-fontes">Fontes: Koha (VIAF, Wikidata) · Wikidata (restantes identificadores e biografia)</div>';
            html += '</div></div>';

            $("#abx-identidade").html(html);
            $("#abx-count").text(String(contarCoautoresTotal() + 1));
        }

        function campoLinha(rotulo, valorHtml) { return '<div class="abx-field-row"><strong>' + escaparHTML(rotulo) + '</strong><span>' + valorHtml + '</span></div>'; }
        function idBadge(label, url, fonte) {
            return '<a class="abx-id-badge abx-fonte-' + fonte + '" target="_blank" rel="noopener noreferrer" href="' + escaparHTML(url) + '">' + escaparHTML(label) + '</a>';
        }

        // Heurística simples: código de função mais frequente entre as
        // ocorrências 7xx ligadas a esta autoridade; "Autor" por omissão.
        function papelPrincipal() {
            var contagem = {};
            (STATE.ocorrencias || []).forEach(function (o) {
                if (problemaOcorrencia(o) !== "Ligação correta") return;
                var rotulo = o.codigoFuncao && o.codigoFuncao !== "0" ? o.codigoFuncao : "Autor";
                contagem[rotulo] = (contagem[rotulo] || 0) + 1;
            });
            var melhor = "Autor", max = 0;
            Object.keys(contagem).forEach(function (k) { if (contagem[k] > max) { max = contagem[k]; melhor = k; } });
            return melhor;
        }

        // ---------- 10.2 Carrossel de capas ----------
        function renderCapas() {
            var html = "";
            html += '<div class="abx-capas-titulo"><span>Obras relacionadas</span>';
            html += '<div class="abx-tabs">';
            html += '<button type="button" class="abx-tab' + (STATE.capaAbaAtiva === "como" ? " abx-tab-ativa" : "") + '" data-aba="como">Como autor</button>';
            html += '<button type="button" class="abx-tab' + (STATE.capaAbaAtiva === "sobre" ? " abx-tab-ativa" : "") + '" data-aba="sobre">Sobre o autor</button>';
            html += '</div></div>';
            html += '<div id="abx-carrossel-corpo"></div>';
            $("#abx-capas-secao").html(html);
            renderCarrosselCorpo();
        }

        function renderCarrosselCorpo() {
            var lista = STATE.capaAbaAtiva === "como" ? STATE.capasComo : STATE.capasSobre;
            if (!STATE.dashboardExecutada) { $("#abx-carrossel-corpo").html('<div class="abx-capas-vazio">Carregar bibliográficos para ver as capas (secção "Validação bibliográfica").</div>'); return; }
            if (!lista.length) { $("#abx-carrossel-corpo").html('<div class="abx-capas-vazio">Sem obras encontradas nesta categoria.</div>'); return; }

            var html = '<div class="abx-carrossel">';
            lista.slice(0, CONFIG.maxCapasPorLista).forEach(function (obra) {
                var url = CONFIG.coverUrlTemplate.replace("{id}", encodeURIComponent(obra.biblionumber));
                html += '<a class="abx-capa-item" href="' + escaparHTML(obra.detalhe) + '" target="_blank" rel="noopener">';
                html += '<img class="abx-capa-img" src="' + escaparHTML(url) + '" alt="" loading="lazy" onerror="this.closest(\'.abx-capa-item\').style.display=\'none\'">';
                html += '<span class="abx-capa-titulo">' + escaparHTML(obra.titulo || "") + '</span></a>';
            });
            html += '</div>';
            $("#abx-carrossel-corpo").html(html);
        }

        // ---------- 10.3 Co-autorias e outras responsabilidades ----------
        function contarCoautoresTotal() {
            var vistos = {};
            (STATE.ocorrencias || []).forEach(function (o) { if (ehOutroAutor(o) && o.authidEncontrado) vistos[o.authidEncontrado + "|" + o.valorEncontrado] = true; });
            return Object.keys(vistos).length;
        }

        function renderCoautores() {
            var grupos = agruparCoautores();
            var total = 0; grupos.forEach(function (g) { total += g.itens.length; });

            var html = "";
            html += '<button type="button" class="abx-coautores-toggle" id="abx-coautores-toggle">';
            html += '<strong>Co-autorias e outras responsabilidades (' + total + ')</strong>' + iconeSeta() + '</button>';
            html += '<div class="abx-coautores-corpo' + (STATE.coautoresAberta ? "" : " abx-fechado") + '" id="abx-coautores-corpo">';
            if (!STATE.dashboardExecutada) html += '<div class="abx-capas-vazio">Carregar bibliográficos para identificar co-autorias.</div>';
            else if (!grupos.length) html += '<div class="abx-capas-vazio">Nenhuma co-autoria estruturada encontrada.</div>';
            else grupos.forEach(function (g) {
                html += '<div class="abx-grupo-funcao"><div class="abx-grupo-cabecalho">' + escaparHTML(g.rotulo) + ' (' + g.itens.length + ')</div>';
                html += '<div class="abx-grupo-lista">';
                g.itens.forEach(function (item) { html += coautorCardHtml(item); });
                html += '</div></div>';
            });
            html += '</div>';
            $("#abx-coautores-secao").html(html);
        }

        function coautorCardHtml(item) {
            var html = '<div class="abx-coautor-card"><div class="abx-avatar">' + escaparHTML(iniciais(item.nome)) + '</div><div>';
            html += '<div class="abx-coautor-nome">' + escaparHTML(item.nome) + '</div>';
            if (item.authid) html += '<a class="abx-coautor-link" target="_blank" rel="noopener" href="/cgi-bin/koha/authorities/authorities.pl?authid=' + encodeURIComponent(item.authid) + '">Ver autoridade ↗</a>';
            else html += '<span class="abx-coautor-indisponivel">Ligação indisponível</span>';
            html += '</div></div>';
            return html;
        }

        // Agrupa ocorrências "Outro autor" (coautoria estrutural com
        // authid diferente do desta autoridade) por código de função.
        function agruparCoautores() {
            var mapa = {}, vistos = {};
            (STATE.ocorrencias || []).forEach(function (o) {
                if (!ehOutroAutor(o)) return;
                var nome = limparValorMARCOperacional(o.valorEncontrado || "");
                if (!nome) return;
                var chaveUnica = nome + "|" + (o.authidEncontrado || "") + "|" + (o.codigoFuncao || "");
                if (vistos[chaveUnica]) return;
                vistos[chaveUnica] = true;
                var rotulo = (o.codigoFuncao && o.codigoFuncao !== "0") ? o.codigoFuncao : "Outra responsabilidade";
                if (!mapa[rotulo]) mapa[rotulo] = [];
                mapa[rotulo].push({ nome: nome, authid: /^\d+$/.test(o.authidEncontrado || "") ? o.authidEncontrado : "" });
            });
            return Object.keys(mapa).sort().map(function (k) { return { rotulo: k, itens: mapa[k] }; });
        }

        // ---------- 10.4 Painel de qualidade (secundário) ----------
        function renderQualityHeader() {
            var estado = estadoScore(STATE.score);
            $("#abx-score-chip").attr("class", "abx-score-chip " + estado.classe).text("Qualidade: " + STATE.score + " · " + estado.label);
        }

        function renderKpis() {
            var sem9 = filtrarOcorrencias("problema:Falta $9").length;
            var sem4 = filtrarOcorrencias("problema:Falta $4").length;
            var outroAutor = filtrarOcorrencias("problema:Outro autor").length;
            var responsabilidade = filtrarOcorrencias("problema:200$f vs. 7xx").length;
            var ligados = filtrarOcorrencias("ligados").length;
            var contexto = filtrarOcorrencias("contexto").length;
            var candidatos = filtrarOcorrencias("sem").length;
            var totalCorrigir = STATE.dashboardExecutada ? (STATE.ocorrencias || []).filter(function (o) {
                if (estaResolvida(o)) return false;
                var p = problemaOcorrencia(o);
                return p === "Falta $9" || p === "Falta $4" || p === "Falta $9 e $4";
            }).length : 0;

            var html = "";
            html += kpi("abx-kpi-vermelho", "Corrigir", totalCorrigir, "Sem $9: <b>" + sem9 + "</b> · Sem $4: <b>" + sem4 + "</b>", "problema:Falta $9");
            html += kpi("abx-kpi-laranja", "Rever", outroAutor + responsabilidade, "Outro autor: <b>" + outroAutor + "</b> · 200$f vs. 7xx: <b>" + responsabilidade + "</b>", "problema:Outro autor");
            html += kpi("abx-kpi-verde", "Ligados", ligados, "Ligados à autoridade", "ligados");
            html += kpi("abx-kpi-azul", "Contexto", contexto, "Assuntos, notas, texto livre", "contexto");
            html += kpi("abx-kpi-roxo", "Candidatos", candidatos, "Sem confirmação MARC", "sem");
            $("#abx-kpis").html(html);
        }

        function kpi(classe, titulo, valor, detalheHtml, filtro) {
            return '<button type="button" class="abx-kpi ' + classe + ' abx-filtro" data-filtro="' + escaparHTML(filtro) + '">' +
                '<span class="abx-kpi-titulo">' + escaparHTML(titulo) + '</span>' +
                '<span class="abx-kpi-valor">' + (STATE.dashboardExecutada ? valor : 0) + '</span>' +
                '<span class="abx-kpi-detalhe">' + detalheHtml + '</span></button>';
        }

        function renderAreaIntervencao() {
            if (!STATE.filtroIntervencao) STATE.filtroIntervencao = "ligados";
            var html = "";
            html += '<div class="abx-menu">';
            html += menuBotao("problema:Falta $9", "Sem $9", "abx-menu-critico");
            html += menuBotao("problema:Falta $4", "Sem $4", "abx-menu-revisao");
            html += menuBotao("problema:200$f vs. 7xx", "200$f vs. 7xx", "abx-menu-revisao");
            html += menuBotao("problema:Outro autor", "Outro autor", "abx-menu-critico");
            html += menuBotao("variantes", "400/500", "abx-menu-neutro");
            html += menuBotao("ligados", "Ligados", "abx-menu-ok");
            html += menuBotao("resolvidos", "Resolvidos", "abx-menu-neutro");
            html += '</div>';
            html += '<div class="abx-table-wrap"><table class="abx-table"><thead><tr>';
            html += '<th>Bib#</th><th>Título</th><th>Campo</th><th>Ocorrência</th><th>Prioridade</th><th>Diagnóstico</th><th>Estado</th><th>Ligações</th>';
            html += '</tr></thead><tbody id="abx-tabela-corpo"></tbody></table></div>';
            html += '<div class="abx-rodape" id="abx-rodape"></div>';
            $("#abx-area-intervencao").html(html);
            renderTabela();
        }

        function menuBotao(filtro, label, classe) {
            var n = filtro === "variantes"
                ? ((STATE.authority.variantes400 || []).length + (STATE.authority.relacionadas500 || []).length)
                : filtrarOcorrencias(filtro).length;
            var ativo = STATE.filtroIntervencao === filtro ? " abx-ativo" : "";
            return '<button type="button" class="abx-menu-btn ' + classe + ativo + ' abx-filtro" data-filtro="' + escaparHTML(filtro) + '">' +
                escaparHTML(label) + ' (' + n + ')</button>';
        }

        function renderTabela() {
            var corpo = $("#abx-tabela-corpo");
            if (STATE.filtroIntervencao === "variantes") { renderTabelaVariantes(corpo); return; }
            var lista = filtrarOcorrencias(STATE.filtroIntervencao);
            if (!lista.length) { corpo.html('<tr><td colspan="8" class="abx-vazio">0 ocorrências nesta categoria.</td></tr>'); $("#abx-rodape").text(""); return; }

            var html = "";
            lista.forEach(function (o) {
                var links = o.links || {}, prioridade = prioridadeOperacional(o);
                html += "<tr>";
                html += '<td><a href="' + escaparHTML(links.detalhe || "#") + '" target="_blank" rel="noopener">' + escaparHTML(o.biblionumber || "0") + '</a></td>';
                html += '<td class="abx-titulo-cell">' + escaparHTML(o.titulo || "Sem título") + '</td>';
                html += '<td><span class="abx-chip">' + escaparHTML(o.campo || "0") + '</span></td>';
                html += '<td>' + escaparHTML(limparValorMARCOperacional(o.valorEncontrado || "")).slice(0, 90) + '</td>';
                html += '<td>' + pillPrioridade(prioridade) + '</td>';
                html += '<td>' + escaparHTML(o.acaoCurta || "") + '<div class="abx-acao-detalhe">' + escaparHTML(o.acaoDetalhada || "") + '</div></td>';
                html += '<td>' + celulaEstado(o) + '</td>';
                html += '<td><div class="abx-links">';
                html += '<a class="abx-btn-mini" title="Editar" href="' + escaparHTML(links.editar || links.detalhe || "#") + '" target="_blank" rel="noopener">✎</a>';
                html += '<a class="abx-btn-mini" title="Ver MARC" href="' + escaparHTML(links.marc || "#") + '" target="_blank" rel="noopener">$a</a>';
                html += '<a class="abx-btn-mini" title="OPAC" href="' + escaparHTML(links.opac || "#") + '" target="_blank" rel="noopener">◎</a>';
                html += '</div></td></tr>';
            });
            corpo.html(html);
            $("#abx-rodape").text("Mostrando " + lista.length + " de " + (STATE.ocorrencias || []).length + " ocorrência(s) analisada(s).");
        }

        function renderTabelaVariantes(corpo) {
            var linhas = (STATE.authority.variantes400 || []).map(function (v) { return { campo: "400", item: v }; })
                .concat((STATE.authority.relacionadas500 || []).map(function (v) { return { campo: "500", item: v }; }));
            if (!linhas.length) { corpo.html('<tr><td colspan="8" class="abx-vazio">Sem variantes 400 nem relações 500.</td></tr>'); $("#abx-rodape").text(""); return; }
            var html = "";
            linhas.forEach(function (linha) {
                var v = linha.item, e = estadoCompletudeForma(v, STATE.authority, linha.campo);
                html += "<tr>";
                html += '<td colspan="2" class="abx-titulo-cell">' + escaparHTML(v.forma || "Sem forma") + (v.datas ? ' (' + escaparHTML(v.datas) + ')' : '') + '</td>';
                html += '<td><span class="abx-chip">' + escaparHTML(linha.campo) + '</span></td>';
                html += '<td>' + (linha.campo === "500" ? escaparHTML(v.relacao5 || "$5 vazio") : "Forma variante") + '</td>';
                html += '<td>' + pillPrioridade(e.estado === "ok" ? "Informativa" : "Revisão") + '</td>';
                html += '<td>' + escaparHTML(e.titulo) + '<div class="abx-acao-detalhe">' + escaparHTML(e.detalhe) + '</div></td>';
                html += '<td colspan="2">—</td></tr>';
            });
            corpo.html(html);
            $("#abx-rodape").text((STATE.authority.variantes400 || []).length + " variante(s) 400 e " + (STATE.authority.relacionadas500 || []).length + " relação(ões) 500.");
        }

        function celulaEstado(o) {
            if (estaResolvida(o)) {
                var rotulo = o.estadoRevisao === "confirmado" ? "Resolvido" : "Falso positivo";
                return '<span class="abx-badge-estado ok">' + rotulo + '</span> <button type="button" class="abx-btn-mini abx-reabrir" data-chave="' + escaparHTML(o.chave) + '">Reabrir</button>';
            }
            return '<button type="button" class="abx-btn-mini abx-marcar" data-chave="' + escaparHTML(o.chave) + '" data-estado="confirmado">Resolvido</button> ' +
                '<button type="button" class="abx-btn-mini abx-marcar" data-chave="' + escaparHTML(o.chave) + '" data-estado="falso_positivo">Falso pos.</button>';
        }

        function pillPrioridade(p) {
            var classe = p === "Crítica" ? "abx-prio-critica" : (p === "Revisão" ? "abx-prio-revisao" : "abx-prio-info");
            return '<span class="abx-pill ' + classe + '">' + escaparHTML(p || "Informativa") + '</span>';
        }

        // ==========================================================
        // 11. FILTROS
        // ==========================================================
        function problemaOcorrencia(o) { return limpar(o && o.problema ? o.problema : ""); }
        function ehOutroAutor(o) { var p = problemaOcorrencia(o); return p === "Outro authid" || p === "Outro autor"; }
        function ehResponsabilidade(o) { var p = problemaOcorrencia(o); return p === "Menção de responsabilidade" || p === "200$f vs. 7xx"; }
        function ehSem9e4(o) { return problemaOcorrencia(o) === "Falta $9 e $4"; }
        function ausencia9(o) { return o && (o.problema === "Falta $9" || o.problema === "Falta $9 e $4"); }
        function ausencia4(o) { return o && (o.problema === "Falta $4" || o.problema === "Falta $9 e $4"); }
        function ehLigado(o) { return problemaOcorrencia(o) === "Ligação correta"; }

        function filtrarOcorrencias(filtro) {
            var lista = STATE.ocorrencias || [];
            return lista.filter(function (o) {
                if (filtro === "resolvidos") return estaResolvida(o);
                if (estaResolvida(o) && filtro !== "todos" && filtro !== "ligados") return false;
                if (filtro === "todos") return true;
                if (filtro === "ligados") return ehLigado(o);
                if (filtro === "sem") return o.grupo === "sem";
                if (filtro === "contexto") return o.grupo === "contexto";
                if (String(filtro).indexOf("problema:") === 0) {
                    var p = String(filtro).replace("problema:", "");
                    if (p === "Falta $9") return ausencia9(o);
                    if (p === "Falta $4") return ausencia4(o);
                    if (p === "Falta $9 e $4") return ehSem9e4(o);
                    if (p === "Outro autor") return ehOutroAutor(o);
                    if (p === "200$f vs. 7xx") return ehResponsabilidade(o);
                    return problemaOcorrencia(o) === p;
                }
                return o.grupo === filtro;
            });
        }

        function prioridadeOperacional(o) {
            var p = problemaOcorrencia(o);
            if (p === "Falta $9" || p === "Falta $9 e $4" || ehOutroAutor(o)) return "Crítica";
            if (p === "Falta $4" || ehResponsabilidade(o)) return "Revisão";
            if (p === "Ligação correta") return "Informativa";
            return o.prioridade || "Informativa";
        }

        // ==========================================================
        // 12. MOTOR DE VALIDAÇÃO BIBLIOGRÁFICA (dashboard)
        // ==========================================================
        function executarDashboardCompleto() {
            atualizarAuthorityState();
            if (STATE.dashboardEmCurso) { $("#abx-status").text("A análise já está em curso."); return; }
            if (!STATE.authority.authid) { $("#abx-status").text("A autoridade ainda não tem authid. Grave primeiro."); return; }
            (STATE.xhrDashboard || []).forEach(function (xhr) { try { if (xhr && xhr.readyState !== 4) xhr.abort(); } catch (e) {} });

            STATE.dashboardToken++; STATE.dashboardEmCurso = true; STATE.xhrDashboard = [];
            $("#abx-carregar").prop("disabled", true).text("A carregar...");
            atualizarProgresso(0, 0, "A pesquisar registos...");
            STATE.dashboardExecutada = false; STATE.candidatos = []; STATE.ocorrencias = [];
            renderTudo();
            pesquisarCandidatos(STATE.authority.authid, STATE.authority.nome, STATE.dashboardToken);
        }

        function atualizarProgresso(atual, total, msg) {
            var pct = total ? Math.round((atual / total) * 100) : 0;
            $("#abx-status").text(msg || "A preparar análise...");
            $("#abx-progresso-wrap").removeClass("abx-fechado");
            $("#abx-progresso-fill").css("width", pct + "%");
            $("#abx-progresso-texto").text(total ? ("Registos processados: " + atual + " / " + total + " (" + pct + "%)") : "Registos processados: 0 / 0 (0%)");
        }

        function terminarProgresso(msg) {
            STATE.dashboardEmCurso = false; STATE.xhrDashboard = [];
            $("#abx-carregar").prop("disabled", false).text("Carregar bibliográficos");
            $("#abx-status").text(msg || "");
        }

        function pesquisarCandidatos(authid, nome, token) {
            var pesquisas = [{ origem: "Pesquisa an", url: "/cgi-bin/koha/catalogue/search.pl?idx=an&q=" + encodeURIComponent(authid) }];
            if (nome) {
                pesquisas.push({ origem: "Pesquisa autor", url: "/cgi-bin/koha/catalogue/search.pl?idx=au&q=" + encodeURIComponent(nome) });
                pesquisas.push({ origem: "Pesquisa livre", url: "/cgi-bin/koha/catalogue/search.pl?q=" + encodeURIComponent(nome) });
            }
            var pedidos = $.map(pesquisas, function (p) {
                var xhr = $.ajax({ url: p.url, method: "GET", dataType: "html" })
                    .then(function (html) { return { origem: p.origem, html: html, erro: false }; },
                        function () { return { origem: p.origem, html: "", erro: true }; });
                STATE.xhrDashboard.push(xhr);
                return xhr;
            });
            $.when.apply($, pedidos).done(function () {
                if (token !== STATE.dashboardToken) return;
                var respostas = pedidos.length === 1 ? [arguments[0]] : Array.prototype.slice.call(arguments);
                var candidatos = fundirCandidatos(respostas);
                if (!candidatos.length) {
                    $("#abx-status").text("Não foram encontrados registos candidatos.");
                    STATE.dashboardExecutada = true; terminarProgresso(""); renderTudo();
                    return;
                }
                STATE.candidatos = candidatos;
                validarCandidatos(candidatos, authid, nome, token);
            });
        }

        function fundirCandidatos(respostas) {
            var vistos = {}, candidatos = [];
            $.each(respostas, function (i, r) {
                if (!r || r.erro) return;
                $.each(extrairObrasDaPesquisa(r.html), function (j, obra) {
                    if (!obra.biblionumber) return;
                    if (!vistos[obra.biblionumber]) { vistos[obra.biblionumber] = obra; obra.origens = []; candidatos.push(obra); }
                    vistos[obra.biblionumber].origens = removerDuplicados(vistos[obra.biblionumber].origens.concat([r.origem]));
                });
            });
            return candidatos.slice(0, CONFIG.maxCandidatosValidacao);
        }

        function extrairObrasDaPesquisa(html) {
            var obras = [], vistos = {};
            var doc = $("<div>").append($.parseHTML(html, document, true));
            doc.find('a[href*="detail.pl?biblionumber="], a[href*="addbiblio.pl?biblionumber="]').each(function () {
                var a = $(this), biblionumber = obterBiblionumberDeURL(a.attr("href") || "");
                if (!biblionumber || vistos[biblionumber]) return;
                vistos[biblionumber] = true;
                var bloco = a.closest("tr").length ? a.closest("tr") : a.closest(".searchresults, .result, li").length ? a.closest(".searchresults, .result, li") : a.parent();
                obras.push({
                    biblionumber: biblionumber, titulo: obterTituloDoResultado(bloco, biblionumber),
                    detalhe: "/cgi-bin/koha/catalogue/detail.pl?biblionumber=" + encodeURIComponent(biblionumber),
                    editar: "/cgi-bin/koha/cataloguing/addbiblio.pl?biblionumber=" + encodeURIComponent(biblionumber),
                    marc: "/cgi-bin/koha/catalogue/MARCdetail.pl?biblionumber=" + encodeURIComponent(biblionumber),
                    origens: []
                });
            });
            return obras;
        }

        function obterBiblionumberDeURL(url) {
            if (!url) return "";
            try { var u = new URL(url, window.location.origin), b = u.searchParams.get("biblionumber"); if (b && /^\d+$/.test(b)) return b; } catch (e) {}
            var m = String(url).match(/[?&]biblionumber=(\d+)/i);
            return m ? m[1] : "";
        }

        function obterTituloDoResultado(bloco, biblionumber) {
            var seletores = ['a.title[href*="detail.pl?biblionumber="]', '.title a[href*="detail.pl?biblionumber="]', 'h2 a[href*="detail.pl?biblionumber="]', 'h3 a[href*="detail.pl?biblionumber="]', 'a[href*="detail.pl?biblionumber="]'];
            var titulo = "";
            for (var i = 0; i < seletores.length && !titulo; i++) {
                bloco.find(seletores[i]).each(function () {
                    var txt = limpar($(this).text());
                    if (txt && txt.length > 2 && !ehRuido(txt)) { titulo = txt; return false; }
                });
            }
            return titulo || "Registo bibliográfico " + biblionumber;
        }

        function ehRuido(txt) {
            var t = normalizar(txt);
            return !t || ["imagem local de capa", "reservas", "adicionar ao carrinho", "modificar o registo", "editar exemplares", "vista opac", "ver detalhe", "ver marc"].indexOf(t) !== -1;
        }

        function validarCandidatos(candidatos, authid, nomeAutoridade, token) {
            var ocorrencias = [], indice = 0;
            function seguinte() {
                if (token !== STATE.dashboardToken) return;
                if (indice >= candidatos.length) {
                    STATE.ocorrencias = normalizarOcorrencias(ocorrencias);
                    atualizarCapasDosCandidatos();
                    STATE.dashboardExecutada = true;
                    terminarProgresso("Concluído: " + candidatos.length + " registo(s), " + STATE.ocorrencias.length + " ocorrência(s).");
                    renderTudo();
                    return;
                }
                var obra = candidatos[indice];
                atualizarProgresso(indice, candidatos.length, "A analisar MARC · " + obra.biblionumber + " · " + (obra.titulo || ""));
                indice++;
                var xhr = $.ajax({ url: obra.marc, method: "GET", dataType: "html" })
                    .done(function (html) { if (token === STATE.dashboardToken) ocorrencias = ocorrencias.concat(analisarMARCComoOcorrencias(html, authid, nomeAutoridade, obra)); })
                    .fail(function () {
                        if (token !== STATE.dashboardToken) return;
                        ocorrencias.push(criarOcorrencia({ obra: obra, natureza: "Erro de leitura", problema: "Erro de leitura", prioridade: "Revisão", authidEsperado: authid, acaoCurta: "Verificar manualmente", acaoDetalhada: "Não foi possível validar o MARC deste registo.", grupo: "manual" }));
                    })
                    .always(function () { if (token === STATE.dashboardToken) seguinte(); });
                STATE.xhrDashboard.push(xhr);
            }
            seguinte();
        }

        // Capas "como autor" = ocorrências ligadas em 700/701/702;
        // "sobre o autor" = ocorrências contextuais em campos de assunto
        // (6xx) ou nota (3xx) que mencionam a autoridade.
        function atualizarCapasDosCandidatos() {
            var comoMap = {}, sobreMap = {};
            (STATE.ocorrencias || []).forEach(function (o) {
                var obra = STATE.candidatos.filter(function (c) { return c.biblionumber === o.biblionumber; })[0];
                if (!obra) return;
                if (problemaOcorrencia(o) === "Ligação correta") comoMap[obra.biblionumber] = obra;
                else if (/^[36]\d\d$/.test(o.campo || "")) sobreMap[obra.biblionumber] = obra;
            });
            STATE.capasComo = Object.keys(comoMap).map(function (k) { return comoMap[k]; });
            STATE.capasSobre = Object.keys(sobreMap).map(function (k) { return sobreMap[k]; });
        }

        function criarOcorrencia(dados) {
            var obra = dados.obra, chave = chaveOcorrencia(dados);
            var authidAtualLocal = (STATE.authority && STATE.authority.authid) || "";
            var registoEstado = authidAtualLocal ? lerEstadosRevisao(authidAtualLocal)[chave] : null;
            return {
                biblionumber: obra.biblionumber, titulo: obra.titulo, campo: dados.campo || "",
                natureza: dados.natureza || "", valorEncontrado: dados.valorEncontrado || "",
                problema: dados.problema || "", prioridade: dados.prioridade || "Informativa",
                authidEsperado: dados.authidEsperado || "", authidEncontrado: dados.authidEncontrado || "",
                origemRelacao: dados.origemRelacao || (obra.origens || []).join(", "),
                codigoFuncao: dados.codigoFuncao || "", acaoCurta: dados.acaoCurta || "", acaoDetalhada: dados.acaoDetalhada || "",
                grupo: dados.grupo || "contexto", chave: chave, estadoRevisao: registoEstado ? registoEstado.estado : "",
                links: {
                    detalhe: obra.detalhe, editar: obra.editar,
                    marc: "/cgi-bin/koha/catalogue/showmarc.pl?id=" + encodeURIComponent(obra.biblionumber) + "&viewas=html",
                    opac: "/cgi-bin/koha/opac-detail.pl?biblionumber=" + encodeURIComponent(obra.biblionumber)
                }
            };
        }

        function normalizarOcorrencias(lista) {
            var vistos = {}, resultado = [];
            lista.forEach(function (o) {
                var chave = [o.biblionumber, o.campo, o.natureza, o.valorEncontrado, o.problema, o.authidEncontrado].join("|");
                if (vistos[chave]) return;
                vistos[chave] = true; resultado.push(o);
            });
            resultado.sort(function (a, b) {
                var peso = { imediata: 1, manual: 2, contexto: 3, sem: 4 };
                var pa = peso[a.grupo] || 9, pb = peso[b.grupo] || 9;
                return pa !== pb ? pa - pb : String(a.titulo).localeCompare(String(b.titulo), "pt");
            });
            return resultado;
        }

        function analisarMARCComoOcorrencias(html, authid, nomeAutoridade, obra) {
            var doc = $("<div>").append($.parseHTML(html, document, true));
            doc.find("script, style").remove();
            var blocos = extrairBlocosMARC(doc), nomeNorm = normalizar(nomeAutoridade), resultado = [];
            blocos.forEach(function (bloco) {
                if (["700", "701", "702"].indexOf(bloco.campo) !== -1) {
                    var r = analisarBlocoAutoria(bloco, authid, nomeNorm, obra);
                    if (r) resultado.push(r);
                } else {
                    var c = analisarBlocoContextual(bloco, authid, nomeNorm, obra);
                    if (c) resultado.push(c);
                }
            });
            if (!resultado.length) resultado.push(criarOcorrencia({ obra: obra, natureza: "Sem evidência", problema: "Sem menção identificada", prioridade: "Informativa", authidEsperado: authid, acaoCurta: "Sem ação imediata", acaoDetalhada: "Registo recuperado como candidato, sem menção claramente identificável.", grupo: "sem" }));
            return resultado;
        }

        function codigoFuncaoAutorizado(codigo) {
            codigo = limpar(codigo || "").trim();
            return !codigo || !!CODIGOS_FUNCAO[codigo];
        }

        function analisarBlocoAutoria(bloco, authid, nomeNorm, obra) {
            var authids = extrairAuthidsDoBloco(bloco);
            var valorAutoria = extrairValorAutoria(bloco);
            var codigos4 = extrairCodigosFuncaoDoBloco(bloco);
            var detalhe4 = descricaoFuncao4(codigos4);
            var compativel = textoAutoriaCompativel(valorAutoria || bloco.texto, nomeNorm);
            var origem = (obra.origens || []).join(", ");
            var temAuthidEsperado = authids.indexOf(String(authid)) !== -1;
            var temAuthid = authids.length > 0;
            var codigosValidos = codigos4.filter(codigoFuncaoAutorizado);
            var codigosInvalidos = codigos4.filter(function (c) { return !codigoFuncaoAutorizado(c); });
            var exigeFuncao4 = bloco.campo !== "700";
            var tem4 = exigeFuncao4 ? (codigosValidos.length > 0) : true;
            var valorDecisao = valorAutoria || bloco.texto;

            if (codigosInvalidos.length) return criarOcorrencia({
                obra: obra, campo: bloco.campo + "$4", natureza: "Código de função inválido",
                valorEncontrado: (valorDecisao || ("Autoridade " + authid)) + " || $4: " + codigosInvalidos.join(", "),
                problema: "Código $4 não autorizado", prioridade: "Revisão", authidEsperado: authid,
                authidEncontrado: authids.join(", "), origemRelacao: origem, codigoFuncao: detalhe4,
                acaoCurta: "Corrigir código $4", acaoDetalhada: "$4 fora da lista CODIGOFUNC: " + codigosInvalidos.join(", ") + ".", grupo: "imediata"
            });
            if (compativel && !temAuthid && !tem4) return criarOcorrencia({ obra: obra, campo: bloco.campo, natureza: "Responsabilidade estruturada", valorEncontrado: valorDecisao, problema: "Falta $9 e $4", prioridade: "Crítica", authidEsperado: authid, origemRelacao: origem, codigoFuncao: detalhe4, acaoCurta: "Completar $9 e $4", acaoDetalhada: "Compatível, sem $9 nem $4.", grupo: "imediata" });
            if (temAuthidEsperado && !tem4) return criarOcorrencia({ obra: obra, campo: bloco.campo + "$9", natureza: "Responsabilidade estruturada", valorEncontrado: valorDecisao || ("Autoridade " + authid), problema: "Falta $4", prioridade: "Revisão", authidEsperado: authid, authidEncontrado: authid, origemRelacao: origem, codigoFuncao: detalhe4, acaoCurta: "Adicionar $4", acaoDetalhada: "Ligado por $9, sem código de função.", grupo: "imediata" });
            if (temAuthidEsperado) return criarOcorrencia({ obra: obra, campo: bloco.campo + "$9", natureza: "Responsabilidade estruturada", valorEncontrado: valorDecisao || ("Autoridade " + authid), problema: "Ligação correta", prioridade: "Informativa", authidEsperado: authid, authidEncontrado: authid, origemRelacao: origem, codigoFuncao: detalhe4, acaoCurta: "Sem ação", acaoDetalhada: "Ligado correctamente.", grupo: "contexto" });
            if (compativel && !temAuthid && tem4) return criarOcorrencia({ obra: obra, campo: bloco.campo, natureza: "Responsabilidade estruturada", valorEncontrado: valorDecisao, problema: "Falta $9", prioridade: "Crítica", authidEsperado: authid, origemRelacao: origem, codigoFuncao: detalhe4, acaoCurta: "Ligar autoridade", acaoDetalhada: "Compatível, com $4, sem $9.", grupo: "imediata" });
            if (compativel && temAuthid && !temAuthidEsperado) return criarOcorrencia({ obra: obra, campo: bloco.campo + "$9", natureza: "Responsabilidade estruturada", valorEncontrado: valorDecisao, problema: "Outro autor", prioridade: "Crítica", authidEsperado: authid, authidEncontrado: authids.join(", "), origemRelacao: origem, codigoFuncao: detalhe4, acaoCurta: "Rever ligação", acaoDetalhada: "Ligado a outro authid; confirmar duplicação ou relação legítima.", grupo: "manual" });
            return null;
        }

        function analisarBlocoContextual(bloco, authid, nomeNorm, obra) {
            var texto = bloco.texto || "";
            if (!textoAutoriaCompativel(texto, nomeNorm)) return null;
            var classificacao = classificarCampoRelacao(bloco.campo);
            var authids = extrairAuthidsDoBloco(bloco);
            var valor = extrairValorContextual(bloco, classificacao.tipo);
            if (classificacao.tipo === "mencao_responsabilidade") return criarOcorrencia({
                obra: obra, campo: bloco.campo + "$f", natureza: classificacao.natureza,
                valorEncontrado: limparValorMARCOperacional(valor || texto), problema: "200$f vs. 7xx", prioridade: "Revisão",
                authidEsperado: authid, authidEncontrado: authids.join(", "), origemRelacao: (obra.origens || []).join(", "),
                acaoCurta: "Confirmar coerência", acaoDetalhada: "Comparar com 7xx, 400 e 500.", grupo: "manual"
            });
            return criarOcorrencia({
                obra: obra, campo: bloco.campo, natureza: classificacao.natureza, valorEncontrado: valor || texto,
                problema: "Menção contextual", prioridade: "Informativa", authidEsperado: authid,
                authidEncontrado: authids.join(", "), origemRelacao: (obra.origens || []).join(", "),
                acaoCurta: "Mapear menção", acaoDetalhada: "Menção contextual sem impacto estrutural imediato.", grupo: "contexto"
            });
        }

        function extrairValorContextual(bloco, tipo) {
            if (tipo === "mencao_responsabilidade") return obterSubcampo(bloco, "f") || obterSubcampo(bloco, "g") || bloco.texto;
            if (tipo === "assunto") return ["a", "x", "y", "z", "j"].map(function (c) { return obterSubcampo(bloco, c); }).filter(Boolean).join(" ");
            return obterSubcampo(bloco, "a") || bloco.texto;
        }

        function classificarCampoRelacao(campo) {
            campo = String(campo || "");
            if (["700", "701", "702"].indexOf(campo) !== -1) return { tipo: "autoria_estrutural", natureza: "Responsabilidade estruturada" };
            if (campo === "200") return { tipo: "mencao_responsabilidade", natureza: "Menção de responsabilidade" };
            if (/^6\d\d$/.test(campo)) return { tipo: "assunto", natureza: "Assunto" };
            if (/^3\d\d$/.test(campo)) return { tipo: "nota", natureza: "Nota ou texto" };
            if (/^4\d\d$/.test(campo)) return { tipo: "relacao_bibliografica", natureza: "Relação bibliográfica" };
            if (/^5\d\d$/.test(campo)) return { tipo: "titulo_relacionado", natureza: "Título relacionado" };
            return { tipo: "outro_contexto", natureza: "Outra menção contextual" };
        }

        function extrairBlocosMARC(doc) {
            var estruturais = extrairBlocosMARCDeTabela(doc);
            return estruturais.length ? estruturais : extrairBlocosMARCDeTexto(doc);
        }

        function extrairBlocosMARCDeTabela(doc) {
            var blocos = [];
            doc.find("tr").each(function () {
                var texto = limpar($(this).text()), m = texto.match(/\b(\d{3})\b/);
                if (!m || texto.length < 4) return;
                blocos.push({ campo: m[1], texto: texto, subcampos: extrairSubcamposDeTexto(texto) });
            });
            return compactarBlocosMARC(blocos);
        }

        function extrairBlocosMARCDeTexto(doc) {
            var texto = String(doc.text() || "").replace(/\r/g, "\n").replace(/\u00a0/g, " ");
            var linhas = texto.split(/\n+/).map(limpar).filter(Boolean), blocos = [], atual = null;
            linhas.forEach(function (linha) {
                var m = linha.match(/^(\d{3})(\s|#|$)/);
                if (m) { if (atual) { atual.subcampos = extrairSubcamposDeTexto(atual.texto); blocos.push(atual); } atual = { campo: m[1], texto: linha, subcampos: {} }; }
                else if (atual) atual.texto += " " + linha;
            });
            if (atual) { atual.subcampos = extrairSubcamposDeTexto(atual.texto); blocos.push(atual); }
            return blocos;
        }

        function compactarBlocosMARC(blocos) {
            var resultado = [];
            blocos.forEach(function (b) {
                if (!b.campo || !b.texto) return;
                var textoNorm = normalizar(b.texto);
                if (!resultado.some(function (e) { return e.campo === b.campo && normalizar(e.texto) === textoNorm; })) resultado.push(b);
            });
            return resultado;
        }

        function extrairSubcamposDeTexto(texto) {
            var subcampos = {}, t = " " + String(texto || "").replace(/\s+/g, " ") + " ";
            var re = /(?:^|\s|\$)([0-9a-z])\s+(.+?)(?=\s(?:[0-9a-z]|\$[0-9a-z])\s+|$)/gi, m;
            while ((m = re.exec(t)) !== null) {
                var codigo = String(m[1]).toLowerCase(), valor = limpar(m[2]);
                if (!subcampos[codigo]) subcampos[codigo] = [];
                if (valor) subcampos[codigo].push(valor);
            }
            return subcampos;
        }

        function obterSubcampo(bloco, codigo) {
            codigo = String(codigo || "").toLowerCase();
            if (bloco.subcampos && bloco.subcampos[codigo] && bloco.subcampos[codigo].length) return limparValorMARCOperacional(bloco.subcampos[codigo].join(" "));
            var re = new RegExp("(^|\\s|\\$)" + escaparRegex(codigo) + "\\s+(.+?)(?=\\s(?:[a-z0-9]|\\$[a-z0-9])\\s+|$)", "i");
            var m = String(bloco.texto || "").match(re);
            return m ? limpar(m[2]) : "";
        }

        function extrairAuthidsDoBloco(bloco) {
            var authids = [];
            if (bloco.subcampos && bloco.subcampos["9"]) bloco.subcampos["9"].forEach(function (v) { var n = String(v || "").match(/\b\d{1,12}\b/g); if (n) authids = authids.concat(n); });
            if (!authids.length) {
                var re = /(?:^|\s|\$)(?:9)\s*([0-9]{1,12})(?=\s|$)/g, m, texto = String(bloco.texto || "");
                while ((m = re.exec(texto)) !== null) authids.push(m[1]);
            }
            return removerDuplicados(authids);
        }

        function extrairCodigosFuncaoDoBloco(bloco) {
            var codigos = [];
            var texto = String(bloco && bloco.texto ? bloco.texto : "").replace(/\u00a0/g, " ").replace(/‡/g, "$").replace(/ǂ/g, "$");
            if (bloco && bloco.subcampos && bloco.subcampos["4"]) bloco.subcampos["4"].forEach(function (v) { var e = String(v || "").match(/\b[0-9]{3}\b/g); if (e) codigos = codigos.concat(e); });
            var re = /(?:\$4|\s4\s+)\s*([0-9]{3})\b/gi, m;
            while ((m = re.exec(texto)) !== null) codigos.push(m[1]);
            return removerDuplicados(codigos);
        }

        function traduzirCodigoFuncao(codigo) {
            codigo = limpar(codigo || "").trim();
            if (!codigo || codigo === "0" || codigo === "-" || codigo === "—") return "";
            return CODIGOS_FUNCAO[codigo] || ("Código não autorizado: " + codigo.toUpperCase());
        }

        function descricaoFuncao4(codigos) {
            if (!codigos || !codigos.length) return "0";
            return codigos.map(function (c) { return traduzirCodigoFuncao(c) || c; }).join(", ");
        }

        function extrairValorAutoria(bloco) {
            var partes = ["a", "b", "f", "g"].map(function (c) { return obterSubcampo(bloco, c); }).filter(Boolean);
            if (partes.length) return limparValorMARCOperacional(partes.join(" "));
            return limpar(String(bloco.texto || "").replace(/^\d{3}\s*#*\s*/g, "").replace(/\$?9\s+\d{1,12}\b/g, ""));
        }

        function construirUniversoIdentitario(authority) {
            var termos = [];
            if (!authority) return termos;
            if (authority.nome) termos.push(authority.nome);
            if (authority.nomeA && authority.nomeB) {
                termos.push(limpar(authority.nomeB + " " + authority.nomeA));
                termos.push(limpar(authority.nomeA + " " + authority.nomeB));
                termos.push(limpar(authority.nomeA + ", " + authority.nomeB));
                termos.push(limpar(authority.nomeB + ", " + authority.nomeA));
            }
            (authority.variantes400 || []).forEach(function (v) { if (v && v.forma) termos.push(v.forma); });
            (authority.relacionadas500 || []).forEach(function (v) { if (v && v.forma) termos.push(v.forma); });

            var limpos = [];
            removerDuplicados(termos).forEach(function (termo) {
                termo = limparValorMARCOperacional(termo);
                var n = normalizar(termo);
                if (n) limpos.push(n);
                var m = termo.match(/^([^,]+),\s*(.+)$/);
                if (m) { limpos.push(normalizar(m[1] + " " + m[2])); limpos.push(normalizar(m[2] + " " + m[1])); }
            });
            return removerDuplicados(limpos).filter(Boolean);
        }

        function textoAutoriaCompativel(texto, nomeNorm) {
            var t = normalizar(limparValorMARCOperacional(texto));
            if (!t || !nomeNorm) return false;
            var universo = construirUniversoIdentitario(STATE.authority || {});
            if (nomeNorm && universo.indexOf(nomeNorm) === -1) universo.push(nomeNorm);
            for (var i = 0; i < universo.length; i++) {
                var u = universo[i];
                if (!u) continue;
                if (t === u || contemPalavraInteira(t, u)) return true;
                var partesU = u.split(" ").filter(function (p) { return p.length > 2; });
                if (partesU.length <= 1) { if (partesU.length === 1 && contemPalavraInteira(t, partesU[0])) return true; continue; }
                var encontrados = 0;
                for (var j = 0; j < partesU.length; j++) if (contemPalavraInteira(t, partesU[j])) encontrados++;
                if (encontrados >= Math.min(2, partesU.length)) return true;
            }
            return false;
        }

        // ==========================================================
        // 13. EVENTOS
        // ==========================================================
        function ligarEventos() {
            $("#abx-toggle-corpo").on("click", function () {
                var colapsado = !$("#abx-root").hasClass("abx-colapsado");
                aplicarColapso(colapsado); gravarFlagLocal("abx_colapsado", colapsado);
            });

            $("#abx-quality-toggle").on("click", function () {
                STATE.qualityAberta = !STATE.qualityAberta;
                $("#abx-quality-corpo").toggleClass("abx-fechado", !STATE.qualityAberta);
            });

            $(document).on("click.abx", "#abx-coautores-toggle", function () {
                STATE.coautoresAberta = !STATE.coautoresAberta;
                $("#abx-coautores-corpo").toggleClass("abx-fechado", !STATE.coautoresAberta);
            });

            $(document).on("click.abx", ".abx-tab", function () {
                STATE.capaAbaAtiva = $(this).data("aba");
                renderCapas();
            });

            $("#abx-carregar").on("click", function () { executarDashboardCompleto(); });

            $(document).on("click.abx", "#abx-area-intervencao .abx-filtro", function () {
                STATE.filtroIntervencao = $(this).data("filtro");
                renderAreaIntervencao();
            });

            $(document).on("click.abx", ".abx-marcar", function () {
                var chave = $(this).data("chave"), estado = $(this).data("estado");
                var authid = (STATE.authority && STATE.authority.authid) || "";
                if (!chave || !estado || !authid) return;
                gravarEstadoRevisao(authid, chave, estado);
                STATE.ocorrencias.forEach(function (o) { if (o.chave === chave) o.estadoRevisao = estado; });
                atualizarAuthorityState(); renderTudo();
            });

            $(document).on("click.abx", ".abx-reabrir", function () {
                var chave = $(this).data("chave"), authid = (STATE.authority && STATE.authority.authid) || "";
                if (!chave || !authid) return;
                gravarEstadoRevisao(authid, chave, null);
                STATE.ocorrencias.forEach(function (o) { if (o.chave === chave) o.estadoRevisao = ""; });
                atualizarAuthorityState(); renderTudo();
            });
        }

        function aplicarColapso(colapsado) {
            $("#abx-root").toggleClass("abx-colapsado", colapsado);
            $("#abx-toggle-txt").text(colapsado ? "Mostrar" : "Ocultar");
        }

        // ==========================================================
        // 14. ÍCONES (SVG inline mínimos)
        // ==========================================================
        function svg(path) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>'; }
        function iconeSeta() { return svg('<path d="M6 9l6 6 6-6"/>'); }
        function iconePlay() { return svg('<path d="M5 3l14 9-14 9V3z"/>'); }
        function iconePessoa() { return svg('<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/>'); }
    });

})();
