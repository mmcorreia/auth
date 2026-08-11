/* ==========================================================
   AUTHSEARCH / KOHA INTRANET AUTHORITY SEARCH
   Isolado a partir do K●RE Identidade v6.0
   Objetivo: Wikidata + VIAF + UNIMARC 017 + grafo de identidade
   v1.5.1 | 2026-08-11
   ========================================================== */

(function () {
    "use strict";

    if (window.AUTHSEARCH_V151_ATIVO) return;
    window.AUTHSEARCH_V151_ATIVO = true;

    if (!window.jQuery) {
        console.warn("AuthSearch: jQuery não está disponível.");
        return;
    }

    var $ = window.jQuery;

    $(document).ready(function () {
        if (!paginaAtualEhEditorAutoridade()) return;

        var CONFIG = {
            maxResultadosWikidata: 50,
            maxMostrarWikidata: 8,
            maxResultadosVIAF: 8,
            timeout: 10000,
            larguraPainel: "42vw",
            larguraMinima: 340,
            larguraMaxima: 980,
            larguraMaximaViewport: 0.72,
            storageKeyLargura: "authsearch-panel-width",
            idiomaPrincipal: "pt",
            idiomasFallback: ["pt", "en"],
            wikidataHumanQid: "Q5"
        };

        var STATE = {
            authority: null,
            aberto: false,
            modo: "pesquisa", // pesquisa | ficha
            xhr: [],
            tokenPesquisa: 0,
            entidadeAtual: null,
            qidAtual: "",
            cacheEntidades: {},
            cacheLabels: {},
            ultimaPesquisaAutomatica: "",
            larguraPainelPx: 0,
            redimensionando: false
        };

        instalarInterface();
        bindEventos();
        atualizarAuthorityState();
        sincronizarInterfaceInicial();

        /* ======================================================
           CONTEXTO / ESTADO
           ====================================================== */

        function paginaAtualEhEditorAutoridade() {
            var path = window.location.pathname || "";
            var params = new URLSearchParams(window.location.search || "");
            var pagina = path.indexOf("/authorities/authorities.pl") !== -1;
            return pagina && (!!params.get("authid") || params.has("authtypecode"));
        }

        function obterAuthidAtual() {
            var params = new URLSearchParams(window.location.search || "");
            var authid = params.get("authid") || "";
            return /^\d+$/.test(authid) ? authid : "";
        }

        function detectarTipoAutoridade() {
            var params = new URLSearchParams(window.location.search || "");
            var code = limparTexto(params.get("authtypecode") || "").toUpperCase();

            if (/PERS|PERSON|PESSOA|NP|NAME_PERSON/.test(code)) return "person";
            if (obterCampo200Autoridade().length) return "person";

            return "unknown";
        }

        function atualizarAuthorityState() {
            STATE.authority = obterDadosAutoridade();
        }

        function obterDadosAutoridade() {
            var campo200 = obterCampo200Autoridade();
            var nomeB = obterValorSubcampo(campo200, "Outra parte do nome");
            var nomeA = obterValorSubcampo(campo200, "Palavra de ordem");
            var datas = obterValorSubcampo(campo200, "Datas");
            var nome = limparTexto([nomeB, nomeA].filter(Boolean).join(" "));
            var ids017 = obterIdentificadores017Atuais();

            return {
                authid: obterAuthidAtual(),
                tipo: detectarTipoAutoridade(),
                campo200: campo200,
                nomeA: nomeA,
                nomeB: nomeB,
                nome: nome,
                datas: datas,
                ids017: ids017,
                wikidata: ids017.filter(function (id) { return id.tipo === "wikidata"; }),
                viaf: ids017.filter(function (id) { return id.tipo === "viaf"; })
            };
        }

        function sincronizarInterfaceInicial() {
            var authority = STATE.authority || {};
            var qid = primeiroQidValido(authority.wikidata || []);

            preencherPesquisa(authority.nome || "");
            atualizarResumoLateral();
            STATE.modo = "pesquisa";
            STATE.qidAtual = qid || "";
            renderModoPesquisa();

            if (qid) {
                carregarEntidadeWikidata(qid, function (entidade) {
                    if (entidade) STATE.entidadeAtual = entidade;
                });
            }
        }

        function primeiroQidValido(lista) {
            for (var i = 0; i < lista.length; i++) {
                var qid = String(lista[i].valor || "").toUpperCase();
                if (/^Q\d+$/.test(qid)) return qid;
            }
            return "";
        }

        /* ======================================================
           INTERFACE LATERAL
           ====================================================== */

        function instalarInterface() {
            $("#authsearch-root, #authsearch-tab, #authsearch-style").remove();
            $("body").removeClass("authsearch-docked authsearch-resizing");
            document.documentElement.style.removeProperty("--authsearch-dock-width");

            var css = '' +
                '<style id="authsearch-style">' +
                ':root{--authsearch-accent:#007fae;--authsearch-border:#d0d7de;--authsearch-bg:#fff;--authsearch-muted:#667085;}' +
                '#authsearch-tab{position:fixed;left:0;top:34%;z-index:10050;transition:left .18s ease;border:1px solid #98a2b3;border-left:0;background:#fff;color:#1f2937;padding:12px 7px;writing-mode:vertical-rl;transform:rotate(180deg);font-size:12px;font-weight:800;letter-spacing:.04em;cursor:pointer;border-radius:0 6px 6px 0;box-shadow:0 3px 12px rgba(15,23,42,.12);}' +
                '#authsearch-tab:hover{background:#f8fafc;color:#007fae;}' +
                '#authsearch-root{position:fixed;left:0;top:0;bottom:0;width:var(--authsearch-dock-width,min(' + CONFIG.larguraPainel + ',' + CONFIG.larguraMaxima + 'px));min-width:' + CONFIG.larguraMinima + 'px;max-width:72vw;z-index:10040;background:var(--authsearch-bg);border-right:1px solid #98a2b3;box-shadow:8px 0 24px rgba(15,23,42,.16);transform:translateX(-102%);transition:transform .18s ease;display:flex;flex-direction:column;color:#111827;}' +
                '#authsearch-root.authsearch-open{transform:translateX(0);}' +
                '#authsearch-resizer{position:absolute;top:0;right:-5px;width:10px;height:100%;z-index:3;cursor:col-resize;background:transparent;touch-action:none;}' +
                '#authsearch-resizer:after{content:"";position:absolute;top:0;bottom:0;left:4px;width:2px;background:transparent;transition:background .12s ease;}' +
                '#authsearch-resizer:hover:after,body.authsearch-resizing #authsearch-resizer:after{background:#007fae;}' +
                'body.authsearch-resizing{cursor:col-resize!important;user-select:none!important;}' +
                'body.authsearch-resizing *{cursor:col-resize!important;}' +
                'body.authsearch-docked{box-sizing:border-box!important;width:100%!important;padding-left:var(--authsearch-dock-width)!important;transition:padding-left .18s ease!important;overflow-x:hidden!important;}' +
                'body.authsearch-resizing.authsearch-docked{transition:none!important;}' +
                'body.authsearch-docked #authsearch-tab{left:var(--authsearch-dock-width);}' +
                'body.authsearch-resizing #authsearch-tab{transition:none!important;}' +
                '#authsearch-root *{box-sizing:border-box;}' +
                '.authsearch-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 13px;border-bottom:1px solid #e5e7eb;background:#fff;flex:0 0 auto;}' +
                '.authsearch-brand{display:flex;align-items:center;gap:8px;min-width:0;}' +
                '.authsearch-brand strong{font-size:15px;white-space:nowrap;}' +
                '.authsearch-context{font-size:11px;color:#667085;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
                '.authsearch-close{border:1px solid #cbd5e1;background:#fff;border-radius:4px;padding:5px 8px;cursor:pointer;font-size:16px;line-height:1;}' +
                '.authsearch-close:hover{background:#f8fafc;}' +
                '.authsearch-body{flex:1 1 auto;overflow:auto;padding:12px;background:#f8fafc;}' +
                '.authsearch-toolbar{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-bottom:10px;}' +
                '.authsearch-btn,.authsearch-link{display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid #cbd5e1!important;background:#fff!important;color:#344054!important;border-radius:4px!important;padding:6px 9px!important;font-size:12px!important;font-weight:650!important;text-decoration:none!important;cursor:pointer!important;line-height:1.2!important;box-shadow:none!important;}' +
                '.authsearch-btn:hover,.authsearch-link:hover{background:#f1f5f9!important;border-color:#94a3b8!important;color:#111827!important;text-decoration:none!important;}' +
                '.authsearch-primary{border-color:#007fae!important;color:#006b92!important;background:#f2fbff!important;}' +
                '.authsearch-searchbar{display:flex;gap:7px;align-items:center;margin-bottom:10px;}' +
                '#authsearch-term{flex:1;min-width:0;padding:8px 9px;border:1px solid #b8c2cc;border-radius:4px;background:#fff;font-size:13px;}' +
                '.authsearch-state{font-size:12px;color:#475467;margin:3px 0 10px 0;min-height:17px;}' +
                '.authsearch-source-grid{display:grid;grid-template-columns:1fr;gap:10px;}' +
                '.authsearch-box{background:#fff;border:1px solid #d8dee6;border-radius:6px;overflow:hidden;}' +
                '.authsearch-box-head{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 10px;border-bottom:1px solid #e5e7eb;background:#fff;}' +
                '.authsearch-box-head strong{font-size:13px;}' +
                '.authsearch-box-body{padding:9px 10px;}' +
                '.authsearch-result{padding:10px 0;border-top:1px solid #edf0f2;}' +
                '.authsearch-result:first-child{border-top:0;padding-top:0;}' +
                '.authsearch-wd-layout{display:grid;grid-template-columns:76px 1fr;gap:10px;align-items:start;}' +
                '.authsearch-photo,.authsearch-placeholder{width:76px;height:98px;border:1px solid #e5e7eb;border-radius:3px;background:#f8fafc;object-fit:cover;}' +
                '.authsearch-result-name{font-size:14px;font-weight:800;color:#111827;line-height:1.25;}' +
                '.authsearch-desc{font-size:12px;color:#667085;line-height:1.35;margin-top:3px;}' +
                '.authsearch-id{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#174b75;margin-top:5px;}' +
                '.authsearch-meta{font-size:12px;color:#344054;line-height:1.4;margin-top:4px;}' +
                '.authsearch-meta strong{color:#111827;}' +
                '.authsearch-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px;}' +
                '.authsearch-empty,.authsearch-error,.authsearch-loading{padding:9px;color:#667085;font-size:12px;}' +
                '.authsearch-error{color:#b42318;background:#fff6f5;border:1px solid #fecdca;border-radius:4px;}' +
                '.authsearch-card{background:#fff;border:1px solid #d8dee6;border-radius:8px;overflow:hidden;}' +
                '.authsearch-card-main{display:grid;grid-template-columns:112px 1fr;gap:14px;padding:14px;}' +
                '.authsearch-card-photo,.authsearch-card-placeholder{width:112px;height:146px;border:1px solid #d8dee6;border-radius:5px;background:#f8fafc;object-fit:cover;}' +
                '.authsearch-card-name{font-size:22px;line-height:1.08;font-weight:900;color:#0f172a;}' +
                '.authsearch-card-description{font-size:13px;color:#475467;line-height:1.4;margin-top:5px;}' +
                '.authsearch-card-qid{font-size:12px;color:#174b75;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;margin-top:7px;}' +
                '.authsearch-details{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px;}' +
                '.authsearch-detail{border:1px solid #edf0f2;background:#fbfdff;border-radius:4px;padding:7px 8px;font-size:11px;line-height:1.35;}' +
                '.authsearch-detail strong{display:block;color:#111827;margin-bottom:2px;}' +
                '.authsearch-card-actions{display:flex;gap:7px;flex-wrap:wrap;padding:10px 14px;border-top:1px solid #e5e7eb;background:#fff;}' +
                '.authsearch-local{padding:9px 12px;border-bottom:1px solid #e5e7eb;background:#fbfdff;font-size:11px;color:#475467;display:flex;gap:8px;flex-wrap:wrap;}' +
                '.authsearch-chip{display:inline-flex;padding:3px 7px;border:1px solid #dbe3ec;border-radius:999px;background:#fff;font-weight:650;}' +
                '.authsearch-newitem{margin-top:10px;padding-top:9px;border-top:1px solid #e5e7eb;}' +
                '.authsearch-card-viaf{padding:10px 14px;border-top:1px solid #e5e7eb;background:#fbfdff;}' +
                '.authsearch-warning{margin:10px 14px 0;padding:8px 9px;border:1px solid #fedf89;background:#fffaeb;color:#854a0e;border-radius:4px;font-size:11px;line-height:1.35;}' +
                '.authsearch-search-actions{margin-top:-2px;margin-bottom:10px;}' +
                '.authsearch-graph-slot{margin:0 0 11px 0;}' +
                '.authsearch-graph-toggle{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 11px;border:1px solid #d8dee6;background:#fff;border-radius:7px;margin-bottom:10px;}' +
                '.authsearch-graph-toggle-copy{min-width:0;}' +
                '.authsearch-graph-toggle-title{display:block;font-size:13px;font-weight:850;color:#111827;}' +
                '.authsearch-graph-toggle-sub{display:block;font-size:11px;color:#667085;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
                '.authsearch-kp{background:#fff;border:1px solid #d8dee6;border-radius:12px;overflow:hidden;box-shadow:0 8px 26px rgba(15,23,42,.08);margin-bottom:12px;}' +
                '.authsearch-kp-gallery{display:grid;grid-template-columns:1.15fr repeat(4,.9fr);gap:6px;background:#eef2f6;min-height:220px;align-items:stretch;}' +
                '.authsearch-kp-gallery-item{position:relative;overflow:hidden;background:#e8edf3;display:block;border-radius:4px;aspect-ratio:3/4;}' +
                '.authsearch-kp-gallery-item img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block;transition:transform .18s ease;}' +
                '.authsearch-kp-gallery-item:hover img{transform:scale(1.025);}' +
                '.authsearch-kp-gallery-empty{display:flex;align-items:center;justify-content:center;min-height:180px;background:#f8fafc;color:#98a2b3;font-size:12px;border-radius:4px;}' +
                '.authsearch-kp-main{padding:15px 16px 4px;background:linear-gradient(135deg,#fff 0%,#f8fbfd 100%);}' +
                '.authsearch-kp-name{font-size:26px;line-height:1.05;font-weight:900;color:#111827;letter-spacing:-.02em;}' +
                '.authsearch-kp-desc{font-size:13px;color:#475467;line-height:1.45;margin-top:6px;}' +
                '.authsearch-kp-facts-text{padding:10px 16px 13px;font-size:12.5px;color:#344054;line-height:1.55;}' +
                '.authsearch-kp-fact-line{margin-top:5px;}' +
                '.authsearch-kp-fact-line:first-child{margin-top:0;}' +
                '.authsearch-kp-fact-line b{color:#111827;}' +
                '.authsearch-kp-section{padding:12px 16px;border-top:1px solid #e5e7eb;}' +
                '.authsearch-kp-section-title{font-size:13px;font-weight:850;color:#111827;margin-bottom:7px;}' +
                '.authsearch-kp-wiki{font-size:12.5px;color:#344054;line-height:1.55;}' +
                '.authsearch-kp-wiki p{margin:0;}' +
                '.authsearch-kp-wiki a{display:inline-block;margin-top:7px;font-weight:750;color:#1769aa;text-decoration:none;}' +
                '.authsearch-kp-wiki a:hover{text-decoration:underline;}' +
                '.authsearch-kp-ids{display:flex;gap:6px;flex-wrap:wrap;}' +
                '.authsearch-kp-idbtn{display:inline-flex;align-items:center;gap:5px;padding:4px 7px;border:1px solid #dbe3ec;border-radius:5px;background:#f8fafc;color:#344054!important;text-decoration:none!important;font-size:10.5px;font-weight:700;line-height:1.2;}' +
                '.authsearch-kp-idbtn:hover{background:#eef4f8;border-color:#aebdca;text-decoration:none!important;}' +
                '.authsearch-kp-idbtn span{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:600;color:#174b75;}' +
                '.authsearch-kp-aliases{font-size:12px;color:#475467;line-height:1.5;}' +
                '@media(max-width:800px){.authsearch-kp-gallery{grid-template-columns:repeat(3,1fr);gap:5px}.authsearch-kp-gallery-item{aspect-ratio:3/4}.authsearch-kp-gallery-item:nth-child(n+4){display:none}.authsearch-kp-name{font-size:20px}body.authsearch-docked{padding-left:0!important}body.authsearch-docked #authsearch-tab{left:0}#authsearch-root{width:calc(100vw - 34px);min-width:0;max-width:none}.authsearch-card-main{grid-template-columns:86px 1fr}.authsearch-card-photo,.authsearch-card-placeholder{width:86px;height:112px}.authsearch-details{grid-template-columns:1fr}.authsearch-card-name{font-size:18px}}' +
                '</style>';

            $("head").append(css);

            var html = '' +
                '<button type="button" id="authsearch-tab" aria-controls="authsearch-root" aria-expanded="false">Identificadores</button>' +
                '<aside id="authsearch-root" aria-hidden="true">' +
                    '<div class="authsearch-head">' +
                        '<div class="authsearch-brand"><strong id="authsearch-heading">AuthID #</strong></div>' +
                        '<button type="button" class="authsearch-close" id="authsearch-close" aria-label="Fechar">×</button>' +
                    '</div>' +
                    '<div class="authsearch-body" id="authsearch-body"></div>' +
                    '<div id="authsearch-resizer" role="separator" aria-orientation="vertical" aria-label="Redimensionar painel Identificadores" tabindex="0"></div>' +
                '</aside>';

            $("body").append(html);
            STATE.larguraPainelPx = obterLarguraInicialPainel();
            definirLarguraPainel(STATE.larguraPainelPx, false);
        }

        function abrirPainel() {
            STATE.aberto = true;
            $("#authsearch-root").addClass("authsearch-open").attr("aria-hidden", "false");
            $("#authsearch-tab").attr("aria-expanded", "true").hide();
            aplicarDockLayout();
            atualizarAuthorityState();
            atualizarResumoLateral();

            var qid = primeiroQidValido((STATE.authority && STATE.authority.wikidata) || []);
            STATE.qidAtual = qid || "";
            renderModoPesquisa();

            if (qid && (!STATE.entidadeAtual || STATE.qidAtual !== qid)) {
                carregarEntidadeWikidata(qid, function (entidade) {
                    if (entidade) STATE.entidadeAtual = entidade;
                });
            }
        }

        function fecharPainel() {
            STATE.aberto = false;
            $("#authsearch-root").removeClass("authsearch-open").attr("aria-hidden", "true");
            $("#authsearch-tab").attr("aria-expanded", "false").show();
            removerDockLayout();
        }

        function obterLimitesLarguraPainel() {
            var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            var min = Math.min(CONFIG.larguraMinima, Math.max(260, vw - 120));
            var max = Math.min(CONFIG.larguraMaxima, Math.floor(vw * CONFIG.larguraMaximaViewport));
            if (max < min) max = min;
            return { min: min, max: max };
        }

        function obterLarguraInicialPainel() {
            var limites = obterLimitesLarguraPainel();
            var guardada = 0;
            try {
                guardada = parseInt(window.localStorage.getItem(CONFIG.storageKeyLargura) || "0", 10) || 0;
            } catch (e) {}

            if (guardada) return Math.max(limites.min, Math.min(limites.max, guardada));

            var root = document.getElementById("authsearch-root");
            var medida = root ? Math.round(root.getBoundingClientRect().width || 0) : 0;
            if (!medida) medida = Math.round((window.innerWidth || 1200) * 0.42);
            return Math.max(limites.min, Math.min(limites.max, medida));
        }

        function definirLarguraPainel(px, persistir) {
            var limites = obterLimitesLarguraPainel();
            px = Math.round(Math.max(limites.min, Math.min(limites.max, Number(px) || limites.min)));

            STATE.larguraPainelPx = px;
            document.documentElement.style.setProperty("--authsearch-dock-width", px + "px");

            if (persistir) {
                try { window.localStorage.setItem(CONFIG.storageKeyLargura, String(px)); } catch (e) {}
            }

            if (STATE.aberto && !window.matchMedia("(max-width: 800px)").matches) {
                $("body").addClass("authsearch-docked");
            }
        }

        function aplicarDockLayout() {
            if (window.matchMedia && window.matchMedia("(max-width: 800px)").matches) {
                removerDockLayout(false);
                return;
            }

            if (!STATE.larguraPainelPx) STATE.larguraPainelPx = obterLarguraInicialPainel();
            definirLarguraPainel(STATE.larguraPainelPx, false);
            $("body").addClass("authsearch-docked");

            try { window.dispatchEvent(new Event("resize")); } catch (e) {}
        }

        function removerDockLayout(limparLargura) {
            $("body").removeClass("authsearch-docked authsearch-resizing");
            if (limparLargura === true) {
                document.documentElement.style.removeProperty("--authsearch-dock-width");
            }
            STATE.redimensionando = false;
            try { window.dispatchEvent(new Event("resize")); } catch (e) {}
        }

        function iniciarRedimensionamento(e) {
            if (!STATE.aberto) return;
            if (window.matchMedia && window.matchMedia("(max-width: 800px)").matches) return;

            e.preventDefault();
            STATE.redimensionando = true;
            $("body").addClass("authsearch-resizing");

            var pointerId = e.pointerId;
            var handle = e.currentTarget;
            try {
                if (handle.setPointerCapture && pointerId !== undefined) handle.setPointerCapture(pointerId);
            } catch (_e) {}
        }

        function moverRedimensionamento(e) {
            if (!STATE.redimensionando) return;
            e.preventDefault();

            // O painel está ancorado à esquerda: clientX é diretamente a nova largura.
            definirLarguraPainel(e.clientX, false);

            // Alguns componentes do Koha recalculam dimensões ao receber resize.
            try { window.dispatchEvent(new Event("resize")); } catch (_e) {}
        }

        function terminarRedimensionamento(e) {
            if (!STATE.redimensionando) return;
            STATE.redimensionando = false;
            $("body").removeClass("authsearch-resizing");
            definirLarguraPainel(STATE.larguraPainelPx, true);

            try {
                var handle = document.getElementById("authsearch-resizer");
                if (handle && handle.releasePointerCapture && e && e.pointerId !== undefined) {
                    handle.releasePointerCapture(e.pointerId);
                }
            } catch (_e) {}

            try { window.dispatchEvent(new Event("resize")); } catch (_e) {}
        }

        function redimensionarPorTeclado(e) {
            if (!STATE.aberto) return;
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            var passo = e.shiftKey ? 50 : 20;
            var largura = STATE.larguraPainelPx || obterLarguraInicialPainel();
            largura += e.key === "ArrowRight" ? passo : -passo;
            definirLarguraPainel(largura, true);
            try { window.dispatchEvent(new Event("resize")); } catch (_e) {}
        }

        function atualizarResumoLateral() {
            var a = STATE.authority || {};
            $("#authsearch-heading").text("AuthID #" + (a.authid || "—"));
        }

        function renderModoPesquisa() {
            STATE.modo = "pesquisa";
            var a = STATE.authority || {};
            var qid = primeiroQidValido(a.wikidata || []);
            var html = '' +
                (qid ? '<div class="authsearch-graph-toggle"><div class="authsearch-graph-toggle-copy"><span class="authsearch-graph-toggle-title">Grafo de identidade</span><span class="authsearch-graph-toggle-sub">Informação enriquecida de projetos Wikimedia</span></div><button type="button" class="authsearch-btn authsearch-primary" id="authsearch-toggle-graph" data-qid="' + escaparAttr(qid) + '">Ver</button></div><div id="authsearch-graph-area" class="authsearch-graph-slot"></div>' : '') +
                '<div class="authsearch-searchbar">' +
                    '<input type="text" id="authsearch-term" autocomplete="off" placeholder="Nome da autoridade">' +
                '</div>' +
                '<div class="authsearch-toolbar authsearch-search-actions">' +
                    '<button type="button" class="authsearch-btn authsearch-primary" id="authsearch-search">Pesquisar Wikidata + VIAF</button>' +
                '</div>' +
                '<div class="authsearch-state" id="authsearch-state">Confirme sempre a identidade antes de aplicar um identificador.</div>' +
                '<div class="authsearch-source-grid">' +
                    '<section class="authsearch-box"><div class="authsearch-box-head"><strong>Wikidata</strong></div><div class="authsearch-box-body" id="authsearch-wikidata"><div class="authsearch-empty">Aguardando pesquisa.</div></div><div id="authsearch-create-area"></div></section>' +
                    '<section class="authsearch-box"><div class="authsearch-box-head"><strong>VIAF</strong></div><div class="authsearch-box-body" id="authsearch-viaf"><div class="authsearch-empty">Aguardando pesquisa.</div></div></section>' +
                '</div>';

            $("#authsearch-body").html(html);
            preencherPesquisa(a.nome || "");

            var termoAuto = limparTexto(a.nome || "");
            if (termoAuto && !qid && STATE.ultimaPesquisaAutomatica !== termoAuto) {
                STATE.ultimaPesquisaAutomatica = termoAuto;
                setTimeout(function () {
                    if (STATE.modo === "pesquisa" && limparTexto($("#authsearch-term").val()) === termoAuto) executarPesquisa();
                }, 0);
            }
        }

        function renderModoFichaLoading(qid) {
            STATE.modo = "ficha";
            $("#authsearch-body").html('<div class="authsearch-loading">A carregar entidade Wikidata ' + escaparHTML(qid) + '…</div>');
        }

        function renderErroFicha(msg) {
            $("#authsearch-body").html('' +
                '<div class="authsearch-error">' + escaparHTML(msg) + '</div>' +
                '<div class="authsearch-toolbar" style="margin-top:10px"><button type="button" class="authsearch-btn authsearch-primary" id="authsearch-switch-search">Pesquisar outra identidade</button></div>');
        }

        function renderFichaAutoridade(entidade, qid) {
            STATE.entidadeAtual = entidade;
            STATE.qidAtual = qid;

            var $area = $("#authsearch-graph-area");
            if (!$area.length) return;
            $area.html('<div class="authsearch-loading">A construir grafo de identidade…</div>');

            var relatedIds = removerDuplicados(
                obterIdsClaims(entidade, "P27").concat(obterIdsClaims(entidade, "P106"))
            );

            obterLabelsEntidades(relatedIds, function (labelsMap) {
                if (STATE.qidAtual !== qid || !$("#authsearch-graph-area").length) return;

                atualizarAuthorityState();
                var a = STATE.authority || {};
                var label = obterLabelEntidade(entidade) || a.nome || qid;
                var descricao = obterDescricaoEntidade(entidade);
                var nascimento = obterPrimeiraDataClaims(entidade, "P569");
                var morte = obterPrimeiraDataClaims(entidade, "P570");
                var paises = obterLabelsClaims(entidade, "P27", labelsMap);
                var ocupacoes = obterLabelsClaims(entidade, "P106", labelsMap);
                var aliases = obterAliases(entidade).slice(0, 10);
                var pseudonimos = obterValoresTextoClaims(entidade, "P742");
                var viafWd = obterPrimeiroValorTextoClaim(entidade, "P214");
                var isni = obterPrimeiroValorTextoClaim(entidade, "P213");
                var lccn = obterPrimeiroValorTextoClaim(entidade, "P244");
                var gnd = obterPrimeiroValorTextoClaim(entidade, "P227");
                var bnf = obterPrimeiroValorTextoClaim(entidade, "P268");
                var viafLocal = a.viaf && a.viaf.length ? a.viaf[0].valor : "";

                function factLine(t, v) {
                    return v ? '<div class="authsearch-kp-fact-line"><b>' + escaparHTML(t) + ':</b> ' + escaparHTML(v) + '</div>' : '';
                }
                function idButton(t, v, url) {
                    if (!v || !url) return '';
                    return '<a class="authsearch-kp-idbtn" href="' + escaparAttr(url) + '" target="_blank" rel="noopener" title="Abrir ' + escaparAttr(t) + '"><b>' + escaparHTML(t) + '</b><span>' + escaparHTML(v) + '</span></a>';
                }

                var html = '<div class="authsearch-kp">';
                html += '<div id="authsearch-kp-gallery" class="authsearch-kp-gallery"><div class="authsearch-kp-gallery-empty">A carregar imagens do Wikimedia Commons…</div></div>';
                html += '<div class="authsearch-kp-main"><div class="authsearch-kp-name">' + escaparHTML(label) + '</div>';
                if (descricao) html += '<div class="authsearch-kp-desc">' + escaparHTML(descricao) + '</div>';
                html += '</div>';

                var facts = '';
                facts += factLine('Datas', [nascimento, morte].filter(Boolean).join(' – '));
                facts += factLine('Nacionalidade / país', paises.join(', '));
                facts += factLine('Ocupações', ocupacoes.slice(0, 8).join(', '));
                facts += factLine('Pseudónimos', pseudonimos.slice(0, 8).join(', '));
                if (facts) html += '<div class="authsearch-kp-facts-text">' + facts + '</div>';

                html += '<div class="authsearch-kp-section" id="authsearch-kp-wikipedia"><div class="authsearch-kp-section-title">Wikipedia</div><div class="authsearch-kp-wiki">A carregar resumo…</div></div>';

                if (aliases.length) html += '<div class="authsearch-kp-section"><div class="authsearch-kp-section-title">Outros nomes</div><div class="authsearch-kp-aliases">' + escaparHTML(aliases.join(' · ')) + '</div></div>';

                var idsHtml = '';
                idsHtml += idButton('Wikidata', qid, 'https://www.wikidata.org/wiki/' + encodeURIComponent(qid));
                idsHtml += idButton('VIAF', viafWd || viafLocal, (viafWd || viafLocal) ? 'https://viaf.org/viaf/' + encodeURIComponent(viafWd || viafLocal) : '');
                idsHtml += idButton('ISNI', isni, isni ? 'https://isni.org/isni/' + encodeURIComponent(isni.replace(/\s+/g, '')) : '');
                idsHtml += idButton('LC', lccn, lccn ? 'https://id.loc.gov/authorities/names/' + encodeURIComponent(lccn) + '.html' : '');
                idsHtml += idButton('GND', gnd, gnd ? 'https://explore.gnd.network/gnd/' + encodeURIComponent(gnd) : '');
                idsHtml += idButton('BnF', bnf, bnf ? 'https://catalogue.bnf.fr/ark:/12148/cb' + encodeURIComponent(bnf) : '');
                if (idsHtml) html += '<div class="authsearch-kp-section"><div class="authsearch-kp-section-title">Identificadores</div><div class="authsearch-kp-ids">' + idsHtml + '</div></div>';

                if (viafLocal && viafWd && viafLocal !== viafWd) {
                    html += '<div class="authsearch-warning"><strong>Atenção:</strong> o VIAF do 017 (' + escaparHTML(viafLocal) + ') difere do VIAF indicado no Wikidata (' + escaparHTML(viafWd) + ').</div>';
                }

                html += '</div>';
                $("#authsearch-graph-area").html(html);

                carregarGaleriaCommons(entidade, label);
                carregarResumoWikipedia(entidade);
            });
        }

        function obterFicheiroImagemWikidata(entidade) {
            var claims = entidade && entidade.claims && entidade.claims.P18;
            if (!Array.isArray(claims) || !claims.length) return "";
            try {
                return String(claims[0].mainsnak.datavalue.value || "");
            } catch (e) {
                return "";
            }
        }

        function carregarGaleriaCommons(entidade, label) {
            var $galeria = $("#authsearch-kp-gallery");
            if (!$galeria.length) return;

            var principalFile = obterFicheiroImagemWikidata(entidade);
            var principalUrl = principalFile ? "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(principalFile) + "?width=900" : "";
            var principalPage = principalFile ? "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(principalFile.replace(/ /g, "_")) : "";

            var req = $.ajax({
                url: "https://commons.wikimedia.org/w/api.php",
                dataType: "jsonp",
                timeout: CONFIG.timeout,
                data: {
                    action: "query",
                    format: "json",
                    generator: "search",
                    gsrsearch: '"' + label + '"',
                    gsrnamespace: 6,
                    gsrlimit: 12,
                    prop: "imageinfo",
                    iiprop: "url",
                    iiurlwidth: 700
                }
            }).done(function (data) {
                if (!$("#authsearch-kp-gallery").length) return;
                var imagens = [];
                var vistos = {};

                function chaveImagem(url, page, title) {
                    var base = String(title || page || url || "")
                        .toLowerCase()
                        .replace(/^file:/, "")
                        .replace(/^https?:\/\/commons\.wikimedia\.org\/wiki\//, "")
                        .replace(/_/g, " ")
                        .replace(/\?.*$/, "")
                        .trim();
                    return base || String(url || "").toLowerCase().replace(/\?.*$/, "");
                }

                function add(url, page, title) {
                    url = String(url || "");
                    if (!url) return;
                    if (!/\.(?:jpe?g|png|webp)(?:\?|$)/i.test(url)) return;
                    var key = chaveImagem(url, page, title);
                    if (!key || vistos[key]) return;
                    vistos[key] = true;
                    imagens.push({ url: url, page: page || url, title: title || label });
                }

                add(principalUrl, principalPage, principalFile || label);

                var pages = data && data.query && data.query.pages ? data.query.pages : {};
                Object.keys(pages).forEach(function (k) {
                    var p = pages[k] || {};
                    var ii = p.imageinfo && p.imageinfo[0] ? p.imageinfo[0] : {};
                    var url = ii.thumburl || ii.url || "";
                    var page = p.title ? "https://commons.wikimedia.org/wiki/" + encodeURIComponent(p.title.replace(/ /g, "_")) : url;
                    add(url, page, p.title || label);
                });

                imagens = imagens.slice(0, 5);
                if (!imagens.length) {
                    $galeria.html('<div class="authsearch-kp-gallery-empty">Sem imagens adicionais no Wikimedia Commons.</div>');
                    return;
                }

                var html = '';
                imagens.forEach(function (img) {
                    html += '<a class="authsearch-kp-gallery-item" href="' + escaparAttr(img.page) + '" target="_blank" rel="noopener" title="Abrir imagem no Wikimedia Commons"><img src="' + escaparAttr(img.url) + '" alt="' + escaparAttr(label) + '"></a>';
                });
                $galeria.html(html);
            }).fail(function () {
                if (!$("#authsearch-kp-gallery").length) return;
                if (principalUrl) {
                    $galeria.html('<a class="authsearch-kp-gallery-item" href="' + escaparAttr(principalPage) + '" target="_blank" rel="noopener"><img src="' + escaparAttr(principalUrl) + '" alt="' + escaparAttr(label) + '"></a>');
                } else {
                    $galeria.html('<div class="authsearch-kp-gallery-empty">Sem imagens disponíveis.</div>');
                }
            });
            registarPedido(req);
        }

        function obterWikipediaReferenciaDaEntidade(entidade) {
            var sites = entidade && entidade.sitelinks ? entidade.sitelinks : {};
            var ordem = ["ptwiki", "enwiki", "eswiki", "frwiki"];
            for (var i = 0; i < ordem.length; i++) {
                var sl = sites[ordem[i]];
                if (!sl || !sl.title) continue;
                var lang = ordem[i].replace("wiki", "");
                return {
                    lang: lang,
                    title: sl.title,
                    url: sl.url || ("https://" + lang + ".wikipedia.org/wiki/" + encodeURIComponent(sl.title.replace(/ /g, "_")))
                };
            }
            return null;
        }

        function carregarResumoWikipedia(entidade) {
            var $sec = $("#authsearch-kp-wikipedia");
            if (!$sec.length) return;
            var ref = obterWikipediaReferenciaDaEntidade(entidade);
            if (!ref) {
                $sec.remove();
                return;
            }

            var endpoint = "https://" + ref.lang + ".wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(ref.title.replace(/ /g, "_"));
            var req = $.ajax({
                url: endpoint,
                dataType: "json",
                timeout: CONFIG.timeout
            }).done(function (data) {
                if (!$("#authsearch-kp-wikipedia").length) return;
                var resumo = limparTexto(data && data.extract || "");
                var link = data && data.content_urls && data.content_urls.desktop && data.content_urls.desktop.page ? data.content_urls.desktop.page : ref.url;
                if (!resumo) {
                    $sec.remove();
                    return;
                }
                if (resumo.length > 900) resumo = resumo.slice(0, 897).replace(/\s+\S*$/, "") + "…";
                $sec.html('<div class="authsearch-kp-section-title">Wikipedia</div><div class="authsearch-kp-wiki"><p>' + escaparHTML(resumo) + '</p><a href="' + escaparAttr(link) + '" target="_blank" rel="noopener">Ler mais na Wikipedia</a></div>');
            }).fail(function () {
                if (!$("#authsearch-kp-wikipedia").length) return;
                $sec.html('<div class="authsearch-kp-section-title">Wikipedia</div><div class="authsearch-kp-wiki"><a href="' + escaparAttr(ref.url) + '" target="_blank" rel="noopener">Abrir artigo na Wikipedia</a></div>');
            });
            registarPedido(req);
        }

        function detalhe(titulo, valor) {
            return '<div class="authsearch-detail"><strong>' + escaparHTML(titulo) + '</strong>' + escaparHTML(valor) + '</div>';
        }

        /* ======================================================
           EVENTOS
           ====================================================== */

        function bindEventos() {
            $(document)
                .off(".authsearchv150")
                .on("click.authsearchv150", "#authsearch-tab", function () {
                    if (STATE.aberto) fecharPainel(); else abrirPainel();
                })
                .on("click.authsearchv150", "#authsearch-close", fecharPainel)
                .on("pointerdown.authsearchv150", "#authsearch-resizer", iniciarRedimensionamento)
                .on("pointermove.authsearchv150", moverRedimensionamento)
                .on("pointerup.authsearchv150 pointercancel.authsearchv150", terminarRedimensionamento)
                .on("keydown.authsearchv150", "#authsearch-resizer", redimensionarPorTeclado)
                .on("keydown.authsearchv150", "#authsearch-term", function (e) {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        $("#authsearch-search").trigger("click");
                    }
                })

                .on("click.authsearchv150", "#authsearch-toggle-graph", function () {
                    atualizarAuthorityState();
                    var qid = String($(this).data("qid") || primeiroQidValido((STATE.authority && STATE.authority.wikidata) || [])).toUpperCase();
                    if (!/^Q\d+$/.test(qid)) return;
                    var $area = $("#authsearch-graph-area");
                    var $btn = $(this);
                    if ($area.children().length) {
                        $area.empty();
                        $btn.text("Ver");
                        return;
                    }
                    $btn.text("Fechar");
                    STATE.qidAtual = qid;
                    $area.html('<div class="authsearch-loading">A carregar grafo de identidade…</div>');
                    carregarEntidadeWikidata(qid, function (entidade) {
                        if (!entidade) {
                            $area.html('<div class="authsearch-error">Não foi possível carregar a entidade Wikidata.</div>');
                            return;
                        }
                        renderFichaAutoridade(entidade, qid);
                    });
                })
                .on("click.authsearchv150", "#authsearch-hide-graph", function () {
                    $("#authsearch-graph-area").empty();
                    $("#authsearch-toggle-graph").text("Ver");
                })
                .on("click.authsearchv150", "#authsearch-search", executarPesquisa)
                .on("click.authsearchv150", "#authsearch-retry-viaf", function () {
                    var termo = limparTexto($("#authsearch-term").val()) || limparTexto((STATE.authority && STATE.authority.nome) || "");
                    if (!termo) return;
                    STATE.tokenPesquisa++;
                    pesquisarVIAF(termo, STATE.tokenPesquisa);
                })
                .on("click.authsearchv150", "#authsearch-card-retry-viaf", function () {
                    var termo = limparTexto((STATE.authority && STATE.authority.nome) || "");
                    if (termo) pesquisarVIAFNaFicha(termo);
                })
                .on("click.authsearchv150", "#authsearch-prepare-wikidata", function () { renderAjudaCriacaoWikidata(true); })
                .on("click.authsearchv150", "#authsearch-copy-qs", copiarQuickStatements)
                .on("click.authsearchv150", ".authsearch-apply", function () {
                    var valor = String($(this).data("valor") || "");
                    var fonte = String($(this).data("fonte") || "");
                    aplicarNoCampo017(valor, fonte);
                })
                .on("input.authsearchv150 change.authsearchv150", "input[type='text'], textarea, select", debounce(function () {
                    if ($(this).closest("#authsearch-root").length) return;
                    atualizarAuthorityState();
                    atualizarResumoLateral();
                }, 180))
                .on("keydown.authsearchv150", function (e) {
                    if (e.key === "Escape" && STATE.aberto) fecharPainel();
                })
                .on("resize.authsearchv150", debounce(function () {
                    if (!STATE.aberto) return;
                    if (window.matchMedia && window.matchMedia("(max-width: 800px)").matches) {
                        $("body").removeClass("authsearch-docked authsearch-resizing");
                        return;
                    }
                    if (!STATE.larguraPainelPx) STATE.larguraPainelPx = obterLarguraInicialPainel();
                    definirLarguraPainel(STATE.larguraPainelPx, false);
                }, 80));
        }

        function executarPesquisa() {
            atualizarAuthorityState();
            var termo = limparTexto($("#authsearch-term").val());

            if (!termo) {
                setEstado("Indique um termo de pesquisa.");
                return;
            }

            abortarPedidos();
            STATE.tokenPesquisa++;
            var token = STATE.tokenPesquisa;

            setEstado("A pesquisar. Confirme sempre os resultados antes de aplicar identificadores.");
            $("#authsearch-create-area").empty();
            pesquisarWikidata(termo, token);
            pesquisarVIAF(termo, token);
        }

        /* ======================================================
           WIKIDATA
           ====================================================== */

        function pesquisarWikidata(termo, token) {
            $("#authsearch-wikidata").html('<div class="authsearch-loading">A pesquisar…</div>');

            var req = $.ajax({
                url: "https://www.wikidata.org/w/api.php",
                dataType: "jsonp",
                timeout: CONFIG.timeout,
                data: {
                    action: "wbsearchentities",
                    format: "json",
                    language: CONFIG.idiomaPrincipal,
                    uselang: CONFIG.idiomaPrincipal,
                    type: "item",
                    limit: CONFIG.maxResultadosWikidata,
                    search: termo
                }
            }).done(function (dados) {
                if (token !== STATE.tokenPesquisa) return;

                if (!dados || !dados.search || !dados.search.length) {
                    $("#authsearch-wikidata").html('<div class="authsearch-empty">Sem resultados no Wikidata para esta pesquisa.</div>');
                    renderAjudaCriacaoWikidata(false);
                    return;
                }

                var ids = dados.search.map(function (item) { return item.id; }).filter(Boolean);
                if (!ids.length) return;

                var req2 = $.ajax({
                    url: "https://www.wikidata.org/w/api.php",
                    dataType: "jsonp",
                    timeout: CONFIG.timeout,
                    data: {
                        action: "wbgetentities",
                        format: "json",
                        ids: ids.join("|"),
                        props: "labels|descriptions|aliases|claims|sitelinks",
                        languages: "pt|en"
                    }
                }).done(function (detalhes) {
                    if (token !== STATE.tokenPesquisa) return;

                    var entidades = (detalhes && detalhes.entities) || {};
                    var resultados = [];
                    var tipoPessoa = STATE.authority && STATE.authority.tipo === "person";

                    dados.search.forEach(function (item) {
                        var entidade = entidades[item.id];
                        if (!entidade || entidade.missing !== undefined) return;
                        if (tipoPessoa && !entidadeEhPessoaHumana(entidade)) return;

                        resultados.push({
                            id: item.id,
                            label: obterLabelEntidade(entidade) || item.label || "",
                            description: obterDescricaoEntidade(entidade) || item.description || "",
                            entidade: entidade
                        });
                    });

                    if (!resultados.length) {
                        var msg = tipoPessoa ? "Sem resultados confirmados como pessoa humana (P31 = Q5)." : "Sem resultados válidos.";
                        $("#authsearch-wikidata").html('<div class="authsearch-empty">' + escaparHTML(msg) + '</div>');
                        renderAjudaCriacaoWikidata(false);
                        return;
                    }

                    resultados = resultados.slice(0, CONFIG.maxMostrarWikidata);
                    $("#authsearch-create-area").empty();
                    enriquecerResultadosWikidata(resultados, token);
                }).fail(function () {
                    if (token !== STATE.tokenPesquisa) return;
                    $("#authsearch-wikidata").html('<div class="authsearch-error">Erro ao obter detalhes do Wikidata.</div>');
                });

                registarPedido(req2);
            }).fail(function (_xhr, status) {
                if (status === "abort" || token !== STATE.tokenPesquisa) return;
                $("#authsearch-wikidata").html('<div class="authsearch-error">Erro ao consultar o Wikidata.</div>');
            });

            registarPedido(req);
        }

        function enriquecerResultadosWikidata(resultados, token) {
            var idsRelacionados = [];
            resultados.forEach(function (r) {
                idsRelacionados = idsRelacionados.concat(obterIdsClaims(r.entidade, "P27"));
                idsRelacionados = idsRelacionados.concat(obterIdsClaims(r.entidade, "P106"));
            });

            obterLabelsEntidades(removerDuplicados(idsRelacionados), function (labelsMap) {
                if (token !== STATE.tokenPesquisa) return;
                apresentarResultadosWikidata(resultados, labelsMap);
            });
        }

        function apresentarResultadosWikidata(resultados, labelsMap) {
            var html = "";

            resultados.forEach(function (r) {
                var entidade = r.entidade || {};
                var qid = r.id || "";
                var label = r.label || qid;
                var descricao = r.description || "";
                var imagem = obterImagemWikidata(entidade);
                var aliases = obterAliases(entidade).slice(0, 5);
                var paises = obterLabelsClaims(entidade, "P27", labelsMap);
                var ocupacoes = obterLabelsClaims(entidade, "P106", labelsMap);
                var nascimento = obterPrimeiraDataClaims(entidade, "P569");
                var morte = obterPrimeiraDataClaims(entidade, "P570");
                var viaf = obterPrimeiroValorTextoClaim(entidade, "P214");

                html += '<div class="authsearch-result"><div class="authsearch-wd-layout">';
                html += imagem ? '<img class="authsearch-photo" src="' + escaparAttr(imagem) + '" alt="' + escaparAttr(label) + '">' : '<div class="authsearch-placeholder"></div>';
                html += '<div><div class="authsearch-result-name">' + escaparHTML(label) + '</div>';
                if (descricao) html += '<div class="authsearch-desc">' + escaparHTML(descricao) + '</div>';
                html += '<div class="authsearch-id">' + escaparHTML(qid) + '</div>';
                if (nascimento || morte) html += meta("Datas", [nascimento, morte].filter(Boolean).join(" – "));
                if (paises.length) html += meta("País", paises.join(", "));
                if (ocupacoes.length) html += meta("Ocupação", ocupacoes.join(", "));
                if (aliases.length) html += meta("Outros nomes", aliases.join(", "));
                if (viaf) html += meta("VIAF", viaf);
                html += '<div class="authsearch-actions">' +
                    '<a class="authsearch-link" href="https://www.wikidata.org/wiki/' + encodeURIComponent(qid) + '" target="_blank" rel="noopener">Abrir</a>' +
                    '<button type="button" class="authsearch-btn authsearch-primary authsearch-apply" data-valor="' + escaparAttr(qid) + '" data-fonte="wikidata">Aplicar Wikidata</button>' +
                    '</div></div></div></div>';
            });

            $("#authsearch-wikidata").html(html || '<div class="authsearch-empty">Sem resultados.</div>');
        }

        function entidadeEhPessoaHumana(entidade) {
            var p31 = entidade && entidade.claims && entidade.claims.P31;
            if (!Array.isArray(p31)) return false;

            return p31.some(function (claim) {
                try {
                    return claim.mainsnak.datavalue.value.id === CONFIG.wikidataHumanQid;
                } catch (e) {
                    return false;
                }
            });
        }

        function carregarEntidadeWikidata(qid, callback) {
            qid = String(qid || "").toUpperCase();
            if (!/^Q\d+$/.test(qid)) return callback(null);

            if (STATE.cacheEntidades[qid]) {
                callback(STATE.cacheEntidades[qid]);
                return;
            }

            var req = $.ajax({
                url: "https://www.wikidata.org/w/api.php",
                dataType: "jsonp",
                timeout: CONFIG.timeout,
                data: {
                    action: "wbgetentities",
                    format: "json",
                    ids: qid,
                    props: "labels|descriptions|aliases|claims|sitelinks",
                    languages: "pt|en"
                }
            }).done(function (data) {
                var entidade = data && data.entities ? data.entities[qid] : null;
                if (entidade && entidade.missing === undefined) {
                    STATE.cacheEntidades[qid] = entidade;
                    callback(entidade);
                } else {
                    callback(null);
                }
            }).fail(function () {
                callback(null);
            });

            registarPedido(req);
        }

        function obterLabelsEntidades(ids, callback) {
            ids = removerDuplicados(ids || []).filter(function (id) { return /^Q\d+$/.test(id); });
            if (!ids.length) return callback({});

            var resultado = {};
            var faltam = [];

            ids.forEach(function (id) {
                if (STATE.cacheLabels[id]) resultado[id] = STATE.cacheLabels[id];
                else faltam.push(id);
            });

            if (!faltam.length) return callback(resultado);

            var req = $.ajax({
                url: "https://www.wikidata.org/w/api.php",
                dataType: "jsonp",
                timeout: CONFIG.timeout,
                data: {
                    action: "wbgetentities",
                    format: "json",
                    ids: faltam.join("|"),
                    props: "labels",
                    languages: "pt|en"
                }
            }).done(function (data) {
                var entidades = (data && data.entities) || {};
                Object.keys(entidades).forEach(function (id) {
                    STATE.cacheLabels[id] = entidades[id];
                    resultado[id] = entidades[id];
                });
                callback(resultado);
            }).fail(function () {
                callback(resultado);
            });

            registarPedido(req);
        }

        /* ======================================================
           VIAF
           ====================================================== */

        function requisitarVIAF(termo, sucesso, falha) {
            termo = limparTexto(termo || "");
            if (!termo) {
                if (typeof falha === "function") falha("empty");
                return null;
            }

            var terminado = false;
            var reqPrincipal = $.ajax({
                url: "https://viaf.org/viaf/AutoSuggest?query=" + encodeURIComponent(termo),
                dataType: "json",
                method: "GET",
                crossDomain: true,
                timeout: CONFIG.timeout,
                cache: true
            }).done(function (dados) {
                if (terminado) return;
                terminado = true;
                if (typeof sucesso === "function") sucesso(dados || {});
            }).fail(function (_xhr, status) {
                if (terminado || status === "abort") return;

                /* Fallback para instalações/browser em que a chamada JSON
                   direta ao VIAF seja bloqueada por CORS. */
                var reqFallback = $.ajax({
                    url: "https://viaf.org/viaf/AutoSuggest",
                    dataType: "jsonp",
                    timeout: CONFIG.timeout,
                    cache: true,
                    data: { query: termo }
                }).done(function (dados) {
                    if (terminado) return;
                    terminado = true;
                    if (typeof sucesso === "function") sucesso(dados || {});
                }).fail(function (_xhr2, status2) {
                    if (terminado || status2 === "abort") return;
                    terminado = true;
                    if (typeof falha === "function") falha(status2 || status || "error");
                });

                registarPedido(reqFallback);
            });

            registarPedido(reqPrincipal);
            return reqPrincipal;
        }

        function pesquisarVIAF(termo, token) {
            $("#authsearch-viaf").html('<div class="authsearch-loading">A pesquisar…</div>');

            requisitarVIAF(termo, function (dados) {
                if (token !== STATE.tokenPesquisa) return;

                var lista = dados && dados.result ? dados.result : [];
                if (!lista.length) {
                    $("#authsearch-viaf").html('<div class="authsearch-empty">Sem resultados VIAF.</div>');
                    return;
                }

                var html = "";
                lista.slice(0, CONFIG.maxResultadosVIAF).forEach(function (item) {
                    var viafid = limparTexto(item.viafid || "");
                    var termoResultado = limparTexto(item.term || item.displayForm || "");
                    if (!viafid) return;

                    html += '<div class="authsearch-result">' +
                        '<div class="authsearch-result-name">' + escaparHTML(termoResultado || "VIAF") + '</div>' +
                        '<div class="authsearch-id">' + escaparHTML(viafid) + '</div>' +
                        '<div class="authsearch-actions">' +
                            '<a class="authsearch-link" href="https://viaf.org/viaf/' + encodeURIComponent(viafid) + '" target="_blank" rel="noopener">Abrir</a>' +
                            '<button type="button" class="authsearch-btn authsearch-primary authsearch-apply" data-valor="' + escaparAttr(viafid) + '" data-fonte="viaf">Aplicar VIAF</button>' +
                        '</div>' +
                    '</div>';
                });

                $("#authsearch-viaf").html(html || '<div class="authsearch-empty">Sem resultados VIAF.</div>');
            }, function () {
                if (token !== STATE.tokenPesquisa) return;
                $("#authsearch-viaf").html('<div class="authsearch-error">Não foi possível consultar o VIAF.</div><div class="authsearch-actions"><button type="button" class="authsearch-btn" id="authsearch-retry-viaf">Tentar novamente</button></div>');
            });
        }

        function pesquisarVIAFNaFicha(termo) {
            termo = limparTexto(termo || "");
            var $alvo = $("#authsearch-card-viaf-area");
            if (!$alvo.length) return;
            if (!termo) {
                $alvo.html('<div class="authsearch-card-viaf"><div class="authsearch-error">Não foi possível determinar o nome para pesquisar no VIAF.</div></div>');
                return;
            }

            $alvo.html('<div class="authsearch-card-viaf"><div class="authsearch-loading">A pesquisar VIAF…</div></div>');

            requisitarVIAF(termo, function (dados) {
                var lista = dados && dados.result ? dados.result : [];
                if (!lista.length) {
                    $alvo.html('<div class="authsearch-card-viaf"><div class="authsearch-empty">Sem resultados VIAF.</div></div>');
                    return;
                }

                var html = '<div class="authsearch-card-viaf"><div class="authsearch-box-head" style="padding-left:0;padding-right:0"><strong>Resultados VIAF</strong><span class="authsearch-chip">selecione para adicionar ao 017</span></div>';
                lista.slice(0, CONFIG.maxResultadosVIAF).forEach(function (item) {
                    var viafid = limparTexto(item.viafid || "");
                    var termoResultado = limparTexto(item.term || item.displayForm || "");
                    if (!viafid) return;
                    html += '<div class="authsearch-result">' +
                        '<div class="authsearch-result-name">' + escaparHTML(termoResultado || "VIAF") + '</div>' +
                        '<div class="authsearch-id">' + escaparHTML(viafid) + '</div>' +
                        '<div class="authsearch-actions">' +
                            '<a class="authsearch-link" href="https://viaf.org/viaf/' + encodeURIComponent(viafid) + '" target="_blank" rel="noopener">Abrir</a>' +
                            '<button type="button" class="authsearch-btn authsearch-primary authsearch-apply" data-valor="' + escaparAttr(viafid) + '" data-fonte="viaf">Adicionar ao 017</button>' +
                        '</div>' +
                    '</div>';
                });
                html += '</div>';
                $alvo.html(html);
            }, function () {
                $alvo.html('<div class="authsearch-card-viaf"><div class="authsearch-error">Não foi possível consultar o VIAF.</div><div class="authsearch-actions"><button type="button" class="authsearch-btn" id="authsearch-card-retry-viaf">Tentar novamente</button></div></div>');
            });
        }

        /* ======================================================
           UNIMARC 200 / 017
           ====================================================== */

        function obterCampo200Autoridade() {
            var campo = $();
            $("li").each(function () {
                var li = $(this);
                var texto = limparTexto(li.text());
                if (texto.indexOf("200") !== -1 && texto.indexOf("Palavra de ordem") !== -1) {
                    campo = li;
                    return false;
                }
            });
            return campo;
        }

        function obterValorSubcampo(campo, etiqueta) {
            var valor = "";
            if (!campo || !campo.length) return "";

            campo.find("li, div, p, tr").each(function () {
                var linha = $(this);
                var texto = limparTexto(linha.text());
                if (texto.indexOf(etiqueta) === -1) return;

                var input = linha.find("input[type='text'], textarea").filter(function () {
                    return $(this).is(":visible") && $(this).outerWidth() > 70;
                }).last();

                if (input.length) {
                    valor = limparTexto(input.val());
                    return false;
                }
            });
            return valor;
        }

        function obterIdentificadores017Atuais() {
            var identificadores = [];
            var vistos = {};
            encontrarCampos017ParaAplicacao().forEach(function (campo) {
                var valorA = campo.campoA.length ? limparTexto(campo.campoA.val()) : "";
                var valor2 = campo.campo2.length ? limparTexto(campo.campo2.val()).toLowerCase() : "";
                if (!valorA && !valor2) return;

                var chave = valorA.toUpperCase() + "|" + valor2;
                if (vistos[chave]) return;
                vistos[chave] = true;

                identificadores.push({
                    valor: valorA,
                    fonte: valor2,
                    tipo: classificarIdentificador017(valorA, valor2)
                });
            });
            return identificadores;
        }

        function encontrarCampos017ParaAplicacao() {
            var campos = [];
            var vistos = {};

            $("li, div, tr").each(function () {
                var bloco = $(this);
                var texto = limparTexto(bloco.text());
                if (texto.indexOf("017") === -1) return;
                if (texto.indexOf("Identificador") === -1) return;
                if (texto.indexOf("Sistema de codificação") === -1) return;

                var campoA = encontrarCampoPorEtiquetaRobusto(bloco, "Identificador");
                var campo2 = encontrarCampoPorEtiquetaRobusto(bloco, "Sistema de codificação");
                if (!campoA.length || !campo2.length) return;

                var idA = campoA.attr("id") || campoA.attr("name") || "";
                var id2 = campo2.attr("id") || campo2.attr("name") || "";
                var chave = idA + "|" + id2;
                if (!chave || vistos[chave]) return;
                vistos[chave] = true;

                campos.push({
                    bloco: bloco,
                    campoA: campoA,
                    campo2: campo2,
                    indicador1: encontrarIndicador017Robusto(bloco)
                });
            });
            return campos;
        }

        function encontrarCampoPorEtiquetaRobusto(bloco, etiqueta) {
            var resultado = $();

            bloco.find("label").each(function () {
                var label = $(this);
                var texto = limparTexto(label.text());
                if (texto.indexOf(etiqueta) === -1) return;

                var idCampo = label.attr("for");
                if (idCampo && $("#" + escaparSelector(idCampo)).length) {
                    resultado = $("#" + escaparSelector(idCampo));
                    return false;
                }

                var linha = label.closest("li, div, tr, p");
                var input = linha.find("input[type='text'], textarea").filter(function () {
                    var valor = limparTexto($(this).val());
                    var largura = $(this).outerWidth();
                    return largura > 100 && valor !== "a" && valor !== "2" && valor !== "017";
                }).first();

                if (input.length) {
                    resultado = input;
                    return false;
                }
            });
            return resultado;
        }

        function encontrarIndicador017Robusto(bloco) {
            var indicador = $();
            bloco.find("input[type='text']").each(function () {
                var input = $(this);
                var valor = limparTexto(input.val());
                var largura = input.outerWidth();
                if (largura <= 45 && (valor === "" || valor === "7" || valor.length === 1)) {
                    indicador = input;
                    return false;
                }
            });
            return indicador;
        }

        function classificarIdentificador017(valor, fonte) {
            var v = limparTexto(valor);
            var f = limparTexto(fonte).toLowerCase();
            if (/^Q\d+$/i.test(v) || f.indexOf("wikidata") !== -1) return "wikidata";
            if (/^\d+$/.test(v) && f.indexOf("viaf") !== -1) return "viaf";
            return "outro";
        }

        function aplicarNoCampo017(valor, fonte) {
            valor = limparTexto(valor);
            fonte = limparTexto(fonte).toLowerCase();

            if (!valor || !fonte) return;
            if (fonte === "wikidata") valor = valor.toUpperCase();

            if (fonte === "wikidata" && !/^Q\d+$/.test(valor)) {
                setEstado("QID Wikidata inválido.", true);
                return;
            }
            if (fonte === "viaf" && !/^\d+$/.test(valor)) {
                setEstado("Identificador VIAF inválido.", true);
                return;
            }

            atualizarAuthorityState();
            var jaExiste = (STATE.authority.ids017 || []).some(function (id) {
                return limparTexto(id.valor).toUpperCase() === valor.toUpperCase() && limparTexto(id.fonte).toLowerCase() === fonte;
            });

            if (jaExiste) {
                setEstado("O identificador " + valor + " já existe no campo 017.");
                if (fonte === "wikidata") mostrarFichaDepoisDeAplicar(valor);
                return;
            }

            var campos = encontrarCampos017ParaAplicacao();
            var escolhido = null;

            campos.some(function (campo) {
                var valorA = campo.campoA.length ? limparTexto(campo.campoA.val()) : "";
                var valor2 = campo.campo2.length ? limparTexto(campo.campo2.val()) : "";
                if (!valorA && !valor2) {
                    escolhido = campo;
                    return true;
                }
                return false;
            });

            if (!escolhido) {
                setEstado("Não existe campo 017 livre. Adicione um novo campo 017 vazio e volte a aplicar.", true);
                return;
            }

            try {
                if (escolhido.indicador1.length) escolhido.indicador1.val("7").trigger("input").trigger("change");
                escolhido.campoA.val(valor).trigger("input").trigger("change");
                escolhido.campo2.val(fonte).trigger("input").trigger("change");

                atualizarAuthorityState();
                atualizarResumoLateral();
                setEstado("Aplicado no 017: " + valor + " · " + fonte + ".");

                if (fonte === "wikidata") {
                    atualizarAuthorityState();
                    var termoAtual = limparTexto($("#authsearch-term").val()) || limparTexto((STATE.authority && STATE.authority.nome) || "");
                    renderModoPesquisa();
                    if (termoAtual) $("#authsearch-term").val(termoAtual);
                } else if (fonte === "viaf" && STATE.entidadeAtual && STATE.qidAtual && $("#authsearch-graph-area").children().length) {
                    renderFichaAutoridade(STATE.entidadeAtual, STATE.qidAtual);
                }
            } catch (e) {
                console.error("AuthSearch: erro ao aplicar 017", e);
                setEstado("Não foi possível aplicar o identificador no campo 017.", true);
            }
        }

        function mostrarFichaDepoisDeAplicar(qid) {
            atualizarAuthorityState();
            STATE.qidAtual = qid;
            renderModoPesquisa();
        }

        /* ======================================================
           HELPERS WIKIDATA
           ====================================================== */

        function obterIdsClaims(entidade, propriedade) {
            var ids = [];
            var claims = entidade && entidade.claims && entidade.claims[propriedade];
            if (!Array.isArray(claims)) return ids;

            claims.forEach(function (claim) {
                try {
                    var id = claim.mainsnak.datavalue.value.id;
                    if (id) ids.push(id);
                } catch (e) {}
            });
            return removerDuplicados(ids);
        }

        function obterValoresTextoClaims(entidade, propriedade) {
            var valores = [];
            var claims = entidade && entidade.claims && entidade.claims[propriedade];
            if (!Array.isArray(claims)) return valores;

            claims.forEach(function (claim) {
                try {
                    var v = claim.mainsnak.datavalue.value;
                    if (typeof v === "string" && v) valores.push(v);
                } catch (e) {}
            });
            return removerDuplicados(valores);
        }

        function obterPrimeiroValorTextoClaim(entidade, propriedade) {
            var valores = obterValoresTextoClaims(entidade, propriedade);
            return valores.length ? valores[0] : "";
        }

        function obterLabelsClaims(entidade, propriedade, entidadesRelacionadas) {
            return removerDuplicados(obterIdsClaims(entidade, propriedade).map(function (id) {
                return obterLabelEntidade(entidadesRelacionadas[id]);
            }).filter(Boolean));
        }

        function obterLabelEntidade(entidade) {
            if (!entidade || !entidade.labels) return "";
            if (entidade.labels.pt && entidade.labels.pt.value) return entidade.labels.pt.value;
            if (entidade.labels.en && entidade.labels.en.value) return entidade.labels.en.value;
            var keys = Object.keys(entidade.labels);
            return keys.length && entidade.labels[keys[0]] ? entidade.labels[keys[0]].value || "" : "";
        }

        function obterDescricaoEntidade(entidade) {
            if (!entidade || !entidade.descriptions) return "";
            if (entidade.descriptions.pt && entidade.descriptions.pt.value) return entidade.descriptions.pt.value;
            if (entidade.descriptions.en && entidade.descriptions.en.value) return entidade.descriptions.en.value;
            return "";
        }

        function obterAliases(entidade) {
            var aliases = [];
            if (!entidade || !entidade.aliases) return aliases;
            ["pt", "en"].forEach(function (lang) {
                (entidade.aliases[lang] || []).forEach(function (alias) {
                    if (alias && alias.value) aliases.push(alias.value);
                });
            });
            return removerDuplicados(aliases);
        }

        function obterPrimeiraDataClaims(entidade, propriedade) {
            var claims = entidade && entidade.claims && entidade.claims[propriedade];
            if (!Array.isArray(claims) || !claims.length) return "";
            try {
                return formatarDataWikidata(claims[0].mainsnak.datavalue.value);
            } catch (e) {
                return "";
            }
        }

        function formatarDataWikidata(valor) {
            if (!valor || !valor.time) return "";
            var data = String(valor.time).replace(/^\+/, "").replace("Z", "");
            var partes = data.split("T")[0].split("-");
            if (partes.length < 3) return "";
            var ano = partes[0], mes = partes[1], dia = partes[2];
            if (mes === "00") return ano;
            if (dia === "00") return mes + "/" + ano;
            return dia + "/" + mes + "/" + ano;
        }

        function obterImagemWikidata(entidade) {
            var claims = entidade && entidade.claims && entidade.claims.P18;
            if (!Array.isArray(claims) || !claims.length) return "";
            try {
                var ficheiro = claims[0].mainsnak.datavalue.value;
                if (!ficheiro) return "";
                return "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(ficheiro) + "?width=320";
            } catch (e) {
                return "";
            }
        }

        function obterWikipediaUrlDaEntidade(entidade) {
            var sites = entidade && entidade.sitelinks ? entidade.sitelinks : {};
            var ordem = ["ptwiki", "enwiki", "eswiki", "frwiki"];
            for (var i = 0; i < ordem.length; i++) {
                var sl = sites[ordem[i]];
                if (sl && sl.url) return sl.url;
                if (sl && sl.title) {
                    var host = ordem[i].replace("wiki", "") + ".wikipedia.org";
                    return "https://" + host + "/wiki/" + encodeURIComponent(sl.title.replace(/ /g, "_"));
                }
            }
            return "";
        }

        /* ======================================================
           CRIAÇÃO ASSISTIDA NO WIKIDATA
           ====================================================== */

        function renderAjudaCriacaoWikidata(expandida) {
            var $area = $("#authsearch-create-area");
            if (!$area.length) return;

            atualizarAuthorityState();
            var a = STATE.authority || {};
            var nome = limparTexto($("#authsearch-term").val() || a.nome || "");
            var viaf = a.viaf && a.viaf.length ? limparTexto(a.viaf[0].valor || "") : "";

            if (!expandida) {
                $area.html('<div style="padding:0 10px 10px"><button type="button" class="authsearch-btn" id="authsearch-prepare-wikidata">Não encontrou? Preparar novo item no Wikidata</button></div>');
                return;
            }

            var newItemUrl = "https://www.wikidata.org/wiki/Special:NewItem?label=" + encodeURIComponent(nome);
            var qs = construirQuickStatementsNovoItem(nome, viaf);
            var qsUrl = "https://quickstatements.toolforge.org/#/v1=" + encodeURIComponent(qs.replace(/\n/g, "||"));

            var html = '' +
                '<div class="authsearch-box" style="margin-top:10px">' +
                    '<div class="authsearch-box-head"><strong>Preparar novo item Wikidata</strong><span class="authsearch-chip">assistido</span></div>' +
                    '<div class="authsearch-box-body">' +
                        '<div class="authsearch-desc">Use apenas depois de confirmar que a pessoa não existe no Wikidata. O AuthSearch prepara os dados; a criação continua a exigir validação no Wikidata.</div>' +
                        (nome ? meta("Nome", nome) : '') +
                        '<div class="authsearch-meta"><strong>Tipo:</strong> ser humano (P31 = Q5)</div>' +
                        (viaf ? meta("VIAF a transportar", viaf) : '<div class="authsearch-meta"><strong>VIAF:</strong> ainda não registado no 017. Pode aplicar primeiro um resultado VIAF e voltar a preparar o item.</div>') +
                        '<div class="authsearch-actions">' +
                            '<a class="authsearch-link authsearch-primary" href="' + escaparAttr(newItemUrl) + '" target="_blank" rel="noopener">Criar manualmente no Wikidata</a>' +
                            '<a class="authsearch-link" href="' + escaparAttr(qsUrl) + '" target="_blank" rel="noopener">Abrir QuickStatements preparado</a>' +
                            '<button type="button" class="authsearch-btn" id="authsearch-copy-qs" data-qs="' + escaparAttr(qs) + '">Copiar comandos</button>' +
                        '</div>' +
                        '<div class="authsearch-desc" style="margin-top:8px">Depois de criar o item, volte ao AuthSearch e pesquise novamente o nome. O novo QID poderá então ser aplicado ao 017.</div>' +
                    '</div>' +
                '</div>';

            $area.html(html);
        }

        function construirQuickStatementsNovoItem(nome, viaf) {
            nome = limparTexto(nome || "");
            viaf = limparTexto(viaf || "");
            var linhas = ["CREATE"];
            if (nome) linhas.push('LAST|Lpt|"' + escaparQuickStatements(nome) + '"');
            linhas.push("LAST|P31|Q5");
            if (/^\d+$/.test(viaf)) linhas.push('LAST|P214|"' + viaf + '"');
            return linhas.join("\n");
        }

        function escaparQuickStatements(valor) {
            return String(valor || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n]+/g, " ");
        }

        function copiarQuickStatements() {
            var qs = String($("#authsearch-copy-qs").attr("data-qs") || "");
            if (!qs) return;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(qs).then(function () {
                    setEstado("Comandos QuickStatements copiados. Reveja-os antes de executar.");
                }).catch(function () {
                    setEstado("Não foi possível copiar automaticamente. Abra o QuickStatements preparado.", true);
                });
            } else {
                window.prompt("Copie os comandos QuickStatements:", qs);
            }
        }

        /* ======================================================
           UTILITÁRIOS
           ====================================================== */

        function preencherPesquisa(valor) {
            if ($("#authsearch-term").length && !limparTexto($("#authsearch-term").val())) {
                $("#authsearch-term").val(valor || "");
            }
        }

        function atualizarLinksPesquisa() {
            var termo = limparTexto($("#authsearch-term").val());
            var termoURL = encodeURIComponent(termo);
            $("#authsearch-link-wikidata").attr("href", termo ? "https://www.wikidata.org/w/index.php?search=" + termoURL : "https://www.wikidata.org/");
            $("#authsearch-link-viaf").attr("href", termo ? "https://viaf.org/viaf/search?query=local.names+all+%22" + termoURL + "%22&sortKeys=holdingscount&recordSchema=BriefVIAF" : "https://viaf.org/");
        }

        function setEstado(msg, erro) {
            var $el = $("#authsearch-state");
            if (!$el.length) return;
            $el.text(msg || "").css("color", erro ? "#b42318" : "#475467");
        }

        function meta(titulo, valor) {
            return '<div class="authsearch-meta"><strong>' + escaparHTML(titulo) + ':</strong> ' + escaparHTML(valor) + '</div>';
        }

        function limparTexto(txt) {
            return $.trim(String(txt == null ? "" : txt).replace(/\s+/g, " "));
        }

        function removerDuplicados(lista) {
            var vistos = Object.create(null);
            return (lista || []).filter(function (valor) {
                valor = limparTexto(valor);
                if (!valor || vistos[valor]) return false;
                vistos[valor] = true;
                return true;
            });
        }

        function escaparHTML(txt) {
            return String(txt == null ? "" : txt)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function escaparAttr(txt) {
            return escaparHTML(txt);
        }

        function escaparSelector(txt) {
            if ($.escapeSelector) return $.escapeSelector(txt);
            return String(txt || "").replace(/([ #;?%&,.+*~':"!^$[\]()=>|\/@])/g, "\\$1");
        }

        function debounce(fn, wait) {
            var timer = null;
            return function () {
                var ctx = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () { fn.apply(ctx, args); }, wait);
            };
        }

        function registarPedido(xhr) {
            if (!xhr) return;
            STATE.xhr.push(xhr);
            xhr.always(function () {
                STATE.xhr = STATE.xhr.filter(function (x) { return x !== xhr; });
            });
        }

        function abortarPedidos() {
            (STATE.xhr || []).forEach(function (xhr) {
                try {
                    if (xhr && xhr.readyState !== 4 && typeof xhr.abort === "function") xhr.abort();
                } catch (e) {}
            });
            STATE.xhr = [];
        }
    });
})();
