/* ==========================================================
   AUTHSEARCH / KOHA INTRANET AUTHORITY SEARCH
   Koha authority editor · Wikidata + VIAF + UNIMARC 017

   Versão unificada v2.1 · 2026-08-11
   CSS e JavaScript no mesmo ficheiro, organizados por secções.

   Princípios:
   - o catalogador confirma sempre antes de preencher o 017;
   - falhas externas nunca devem impedir a edição normal no Koha;
   - dados externos são validados/escapados antes de entrar no DOM.
   ========================================================== */

(function () {
    "use strict";

    if (window.AUTHSEARCH_V2_ATIVO) return;
    window.AUTHSEARCH_V2_ATIVO = true;

    if (!window.jQuery) {
        console.warn("AuthSearch: jQuery não está disponível.");
        return;
    }

    var $ = window.jQuery;

    /* ======================================================
       CSS / APRESENTAÇÃO
       ======================================================
       O CSS fica concentrado neste bloco único. O JavaScript apenas
       o injeta uma vez no <head>, evitando estilos dispersos pelo código.
    */

    var AUTHSEARCH_CSS = `
:root {
    --authsearch-css-version: 2;
    --authsearch-accent:#007fae;
    --authsearch-border:#d0d7de;
    --authsearch-bg:#fff;
    --authsearch-muted:#667085;
}

#authsearch-tab {
    position:fixed;
    left:0;
    top:34%;
    z-index:10050;
    transition:left .18s ease;
    border:1px solid #98a2b3;
    border-right:0;
    background:#fff;
    color:#1f2937;
    padding:12px 7px;
    writing-mode:vertical-rl;
    transform:rotate(180deg);
    font-size:12px;
    font-weight:800;
    letter-spacing:.04em;
    cursor:pointer;
    border-radius:6px 0 0 6px;
    box-shadow:0 3px 12px rgba(15,23,42,.12);
}

#authsearch-tab:hover {
    background:#f8fafc;
    color:#007fae;
}

#authsearch-root {
    position:fixed;
    left:0;
    top:0;
    bottom:0;
    width:var(--authsearch-dock-width,min(42vw,980px));
    min-width:340px;
    max-width:72vw;
    z-index:10040;
    background:var(--authsearch-bg);
    border-right:1px solid #98a2b3;
    box-shadow:8px 0 24px rgba(15,23,42,.16);
    transform:translateX(-102%);
    transition:transform .18s ease;
    display:flex;
    flex-direction:column;
    color:#111827;
}

#authsearch-root.authsearch-open {
    transform:translateX(0);
}

#authsearch-resizer {
    position:absolute;
    top:0;
    right:-5px;
    width:10px;
    height:100%;
    z-index:3;
    cursor:col-resize;
    background:transparent;
    touch-action:none;
}

#authsearch-resizer:after {
    content:"";
    position:absolute;
    top:0;
    bottom:0;
    left:4px;
    width:2px;
    background:transparent;
    transition:background .12s ease;
}

#authsearch-resizer:hover:after,body.authsearch-resizing #authsearch-resizer:after {
    background:#007fae;
}

body.authsearch-resizing {
    cursor:col-resize!important;
    user-select:none!important;
}

body.authsearch-resizing * {
    cursor:col-resize!important;
}

body.authsearch-docked {
    box-sizing:border-box!important;
    width:100%!important;
    padding-left:var(--authsearch-dock-width)!important;
    transition:padding-left .18s ease!important;
    overflow-x:hidden!important;
}

body.authsearch-resizing.authsearch-docked {
    transition:none!important;
}

body.authsearch-docked #authsearch-tab {
    left:var(--authsearch-dock-width);
}

body.authsearch-resizing #authsearch-tab {
    transition:none!important;
}

#authsearch-root * {
    box-sizing:border-box;
}

.authsearch-head {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding:11px 13px;
    border-bottom:1px solid #e5e7eb;
    background:#fff;
    flex:0 0 auto;
}

.authsearch-brand {
    display:flex;
    align-items:center;
    gap:8px;
    min-width:0;
}

.authsearch-brand strong {
    font-size:15px;
    white-space:nowrap;
}

.authsearch-context {
    font-size:11px;
    color:#667085;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
}

.authsearch-close {
    border:1px solid #cbd5e1;
    background:#fff;
    border-radius:4px;
    padding:5px 8px;
    cursor:pointer;
    font-size:16px;
    line-height:1;
}

.authsearch-close:hover {
    background:#f8fafc;
}

.authsearch-body {
    flex:1 1 auto;
    overflow:auto;
    padding:12px;
    background:#f8fafc;
}

.authsearch-toolbar {
    display:flex;
    gap:7px;
    flex-wrap:wrap;
    align-items:center;
    margin-bottom:10px;
}

.authsearch-btn,.authsearch-link {
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:5px;
    border:1px solid #cbd5e1!important;
    background:#fff!important;
    color:#344054!important;
    border-radius:4px!important;
    padding:6px 9px!important;
    font-size:12px!important;
    font-weight:650!important;
    text-decoration:none!important;
    cursor:pointer!important;
    line-height:1.2!important;
    box-shadow:none!important;
}

.authsearch-btn:hover,.authsearch-link:hover {
    background:#f1f5f9!important;
    border-color:#94a3b8!important;
    color:#111827!important;
    text-decoration:none!important;
}

.authsearch-primary {
    border-color:#007fae!important;
    color:#006b92!important;
    background:#f2fbff!important;
}

.authsearch-searchbar {
    display:flex;
    gap:7px;
    align-items:center;
    margin-bottom:10px;
}

#authsearch-term {
    flex:1;
    min-width:0;
    padding:8px 9px;
    border:1px solid #b8c2cc;
    border-radius:4px;
    background:#fff;
    font-size:13px;
}

.authsearch-state {
    font-size:12px;
    color:#475467;
    margin:3px 0 10px 0;
    min-height:17px;
}

.authsearch-source-grid {
    display:grid;
    grid-template-columns:1fr;
    gap:10px;
}

.authsearch-box {
    background:#fff;
    border:1px solid #d8dee6;
    border-radius:6px;
    overflow:hidden;
}

.authsearch-box-head {
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:8px;
    padding:9px 10px;
    border-bottom:1px solid #e5e7eb;
    background:#fff;
}

.authsearch-box-head strong {
    font-size:13px;
}

.authsearch-box-body {
    padding:9px 10px;
}

.authsearch-result {
    padding:10px 0;
    border-top:1px solid #edf0f2;
}

.authsearch-result:first-child {
    border-top:0;
    padding-top:0;
}

.authsearch-wd-layout {
    display:grid;
    grid-template-columns:76px 1fr;
    gap:10px;
    align-items:start;
}

.authsearch-photo,.authsearch-placeholder {
    width:76px;
    height:98px;
    border:1px solid #e5e7eb;
    border-radius:3px;
    background:#f8fafc;
    object-fit:cover;
}

.authsearch-result-name {
    font-size:14px;
    font-weight:800;
    color:#111827;
    line-height:1.25;
}

.authsearch-desc {
    font-size:12px;
    color:#667085;
    line-height:1.35;
    margin-top:3px;
}

.authsearch-id {
    font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
    font-size:12px;
    color:#174b75;
    margin-top:5px;
}

.authsearch-meta {
    font-size:12px;
    color:#344054;
    line-height:1.4;
    margin-top:4px;
}

.authsearch-meta strong {
    color:#111827;
}

.authsearch-actions {
    display:flex;
    gap:6px;
    flex-wrap:wrap;
    margin-top:7px;
}

.authsearch-empty,.authsearch-error,.authsearch-loading {
    padding:9px;
    color:#667085;
    font-size:12px;
}

.authsearch-error {
    color:#b42318;
    background:#fff6f5;
    border:1px solid #fecdca;
    border-radius:4px;
}

.authsearch-card {
    background:#fff;
    border:1px solid #d8dee6;
    border-radius:8px;
    overflow:hidden;
}

.authsearch-card-main {
    display:grid;
    grid-template-columns:112px 1fr;
    gap:14px;
    padding:14px;
}

.authsearch-card-photo,.authsearch-card-placeholder {
    width:112px;
    height:146px;
    border:1px solid #d8dee6;
    border-radius:5px;
    background:#f8fafc;
    object-fit:cover;
}

.authsearch-card-name {
    font-size:22px;
    line-height:1.08;
    font-weight:900;
    color:#0f172a;
}

.authsearch-card-description {
    font-size:13px;
    color:#475467;
    line-height:1.4;
    margin-top:5px;
}

.authsearch-card-qid {
    font-size:12px;
    color:#174b75;
    font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
    margin-top:7px;
}

.authsearch-details {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:7px;
    margin-top:12px;
}

.authsearch-detail {
    border:1px solid #edf0f2;
    background:#fbfdff;
    border-radius:4px;
    padding:7px 8px;
    font-size:11px;
    line-height:1.35;
}

.authsearch-detail strong {
    display:block;
    color:#111827;
    margin-bottom:2px;
}

.authsearch-card-actions {
    display:flex;
    gap:7px;
    flex-wrap:wrap;
    padding:10px 14px;
    border-top:1px solid #e5e7eb;
    background:#fff;
}

.authsearch-local {
    padding:9px 12px;
    border-bottom:1px solid #e5e7eb;
    background:#fbfdff;
    font-size:11px;
    color:#475467;
    display:flex;
    gap:8px;
    flex-wrap:wrap;
}

.authsearch-chip {
    display:inline-flex;
    padding:3px 7px;
    border:1px solid #dbe3ec;
    border-radius:999px;
    background:#fff;
    font-weight:650;
}

.authsearch-newitem {
    margin-top:10px;
    padding-top:9px;
    border-top:1px solid #e5e7eb;
}

.authsearch-card-viaf {
    padding:10px 14px;
    border-top:1px solid #e5e7eb;
    background:#fbfdff;
}

.authsearch-warning {
    margin:10px 14px 0;
    padding:8px 9px;
    border:1px solid #fedf89;
    background:#fffaeb;
    color:#854a0e;
    border-radius:4px;
    font-size:11px;
    line-height:1.35;
}

.authsearch-search-actions {
    margin-top:-2px;
    margin-bottom:10px;
}

.authsearch-graph-slot {
    margin:0 0 11px 0;
}

.authsearch-graph-toggle {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    padding:10px 11px;
    border:1px solid #d8dee6;
    background:#fff;
    border-radius:7px;
    margin-bottom:10px;
}

.authsearch-graph-toggle-copy {
    min-width:0;
}

.authsearch-graph-toggle-title {
    display:block;
    font-size:13px;
    font-weight:850;
    color:#111827;
}

.authsearch-graph-toggle-sub {
    display:block;
    font-size:11px;
    color:#667085;
    margin-top:2px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
}

.authsearch-kp {
    background:#fff;
    border:1px solid #d8dee6;
    border-radius:12px;
    overflow:hidden;
    box-shadow:0 8px 26px rgba(15,23,42,.08);
    margin-bottom:12px;
}

.authsearch-kp-gallery {
    display:grid;
    grid-template-columns:minmax(180px,1.35fr) minmax(95px,1fr) minmax(95px,1fr);
    grid-template-rows:136px 136px;
    gap:5px;
    background:#eef2f6;
    min-height:277px;
}

.authsearch-kp-gallery-item {
    position:relative;
    overflow:hidden;
    background:#e8edf3;
    display:block;
    border-radius:3px;
    min-width:0;
}

.authsearch-kp-gallery-item:first-child {
    grid-column:1;
    grid-row:1/3;
}

.authsearch-kp-gallery-item:nth-child(2) {
    grid-column:2;
    grid-row:1;
}

.authsearch-kp-gallery-item:nth-child(3) {
    grid-column:3;
    grid-row:1;
}

.authsearch-kp-gallery-item:nth-child(4) {
    grid-column:2;
    grid-row:2;
}

.authsearch-kp-gallery-item:nth-child(5) {
    grid-column:3;
    grid-row:2;
}

.authsearch-kp-gallery-item img {
    width:100%;
    height:100%;
    object-fit:cover;
    object-position:center center;
    display:block;
    transition:transform .18s ease;
}

.authsearch-kp-gallery-item:first-child img {
    object-position:center top;
}

.authsearch-kp-gallery-item:hover img {
    transform:scale(1.025);
}

.authsearch-kp-gallery-empty {
    display:flex;
    align-items:center;
    justify-content:center;
    min-height:180px;
    background:#f8fafc;
    color:#98a2b3;
    font-size:12px;
    border-radius:3px;
}

.authsearch-kp-main {
    padding:15px 16px 4px;
    background:linear-gradient(135deg,#fff 0%,#f8fbfd 100%);
}

.authsearch-kp-name {
    font-size:26px;
    line-height:1.05;
    font-weight:900;
    color:#111827;
    letter-spacing:-.02em;
}

.authsearch-kp-desc {
    font-size:13px;
    color:#475467;
    line-height:1.45;
    margin-top:6px;
}

.authsearch-kp-facts-text {
    padding:10px 16px 13px;
    font-size:12.5px;
    color:#344054;
    line-height:1.55;
}

.authsearch-kp-fact-line {
    margin-top:5px;
}

.authsearch-kp-fact-line:first-child {
    margin-top:0;
}

.authsearch-kp-fact-line b {
    color:#111827;
}

.authsearch-kp-section {
    padding:12px 16px;
    border-top:1px solid #e5e7eb;
}

.authsearch-kp-section-title {
    font-size:13px;
    font-weight:850;
    color:#111827;
    margin-bottom:7px;
}

.authsearch-kp-wiki {
    font-size:12.5px;
    color:#344054;
    line-height:1.55;
}

.authsearch-kp-wiki p {
    margin:0;
}

.authsearch-kp-wiki a {
    display:inline;
    margin-left:4px;
    font-weight:750;
    color:#1769aa;
    text-decoration:none;
}

.authsearch-kp-wiki a:hover {
    text-decoration:underline;
}

.authsearch-kp-ids {
    display:flex;
    gap:6px;
    flex-wrap:wrap;
}

.authsearch-kp-idbtn {
    display:inline-flex;
    align-items:center;
    gap:5px;
    padding:4px 7px;
    border:1px solid #dbe3ec;
    border-radius:5px;
    background:#f8fafc;
    color:#344054!important;
    text-decoration:none!important;
    font-size:10.5px;
    font-weight:700;
    line-height:1.2;
}

.authsearch-kp-idbtn:hover {
    background:#eef4f8;
    border-color:#aebdca;
    text-decoration:none!important;
}

.authsearch-kp-idbtn span {
    font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
    font-weight:600;
    color:#174b75;
}

.authsearch-kp-aliases {
    font-size:12px;
    color:#475467;
    line-height:1.5;
}

@media(max-width:800px) {
    .authsearch-kp-gallery{grid-template-columns:1.45fr 1fr 1fr;grid-template-rows:96px 96px;gap:4px}
    .authsearch-kp-gallery-item:first-child{grid-column:1;grid-row:1/3}
    .authsearch-kp-gallery-item:nth-child(2){grid-column:2;grid-row:1}
    .authsearch-kp-gallery-item:nth-child(3){grid-column:3;grid-row:1}
    .authsearch-kp-gallery-item:nth-child(4){grid-column:2;grid-row:2}
    .authsearch-kp-gallery-item:nth-child(5){grid-column:3;grid-row:2}
    .authsearch-kp-name{font-size:20px}
    body.authsearch-docked{padding-left:0!important}
    body.authsearch-docked #authsearch-tab{left:0}
    #authsearch-root{width:calc(100vw - 34px);min-width:0;max-width:none}
    .authsearch-card-main{grid-template-columns:86px 1fr}
    .authsearch-card-photo,.authsearch-card-placeholder{width:86px;height:112px}
    .authsearch-details{grid-template-columns:1fr}
    .authsearch-card-name{font-size:18px}
}

/* ============================================================
   NAVEGAÇÃO INTERNA DO AUTHBOX
   Três secções com comportamento de menu/accordion claramente visível.
   ============================================================ */
.authsearch-accordion{margin:0 0 7px;background:#fff}
.authsearch-accordion-toggle{
    min-height:50px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:14px;
    cursor:pointer;user-select:none;outline:none;background:#f5f7f9;border:1px solid #d8e0e7;border-radius:5px;
    transition:background .14s ease,border-color .14s ease,box-shadow .14s ease
}
.authsearch-accordion-toggle:hover{background:#eef3f6;border-color:#bccbd7}
.authsearch-accordion-toggle:focus-visible{box-shadow:0 0 0 2px rgba(36,96,137,.18)}
.authsearch-accordion.is-open>.authsearch-accordion-toggle{background:#edf3f7;border-color:#b7c7d3;border-left:4px solid #336d96;padding-left:9px;border-radius:5px 5px 0 0}
.authsearch-accordion-copy{display:flex;flex-direction:column;gap:2px;min-width:0}
.authsearch-accordion-title{font-size:13px;font-weight:750;color:#263746;line-height:1.3}
.authsearch-accordion-sub{font-size:11px;font-weight:500;color:#71808e;line-height:1.3}
.authsearch-accordion-sub:empty{display:none}
.authsearch-accordion-chevron{width:18px;height:18px;flex:0 0 18px;position:relative}
.authsearch-accordion-chevron:before{content:"";position:absolute;width:7px;height:7px;left:4px;top:3px;border-right:2px solid #667786;border-bottom:2px solid #667786;transform:rotate(45deg);transition:transform .16s ease,top .16s ease}
.authsearch-accordion.is-open .authsearch-accordion-chevron:before{transform:rotate(225deg);top:7px}
.authsearch-accordion-body{padding:12px 10px 16px;border:1px solid #d8e0e7;border-top:0;border-radius:0 0 5px 5px;background:#fff}
.authsearch-accordion:not(.is-open) .authsearch-accordion-body{display:none}

/* Variantes 400 apresentadas junto dos resultados Wikidata. */
.authsearch-variants-list{display:flex;flex-direction:column;gap:5px;margin-top:8px}
.authsearch-variant-row{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:6px 0;border-top:1px solid #eef1f5}
.authsearch-variant-name{font-size:12px;line-height:1.35;min-width:0;flex:1 1 auto}
.authsearch-result-main-actions{margin-top:9px;margin-bottom:12px}
.authsearch-add-400{flex:0 0 auto;margin-left:14px!important;padding:4px 7px!important;font-size:11px!important;white-space:nowrap}
.authsearch-result-variants{margin-top:10px;padding-top:9px;border-top:1px solid #eef1f5}
.authsearch-result-variants-title{font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:#7a8494;margin-bottom:4px;font-weight:700}

/* ============================================================
   OBRAS NO CATÁLOGO
   Lista vertical integral; metadados essenciais em vez do ISBD completo.
   ============================================================ */
.authsearch-works-toolbar{position:sticky;top:0;z-index:2;background:#fff;padding:0 0 8px;margin-bottom:2px}
.authsearch-works-meta{font-size:11px;color:#7a8793;margin-bottom:6px}
.authsearch-works-filter{width:100%;border:1px solid #cfd6df;border-radius:4px;padding:6px 8px;font-size:11.5px;background:#fff}
.authsearch-works-list{max-height:560px;overflow-y:auto;overflow-x:hidden;scrollbar-gutter:stable;padding-right:5px}
.authsearch-work{display:grid;grid-template-columns:68px minmax(0,1fr);gap:12px;padding:12px 2px;border-bottom:1px solid #e5e9ed;min-width:0}
.authsearch-work:last-child{border-bottom:0}
.authsearch-work-cover{width:68px;height:102px;object-fit:cover;object-position:center top;border-radius:3px;background:#f1f5f9;box-shadow:0 1px 2px rgba(0,0,0,.08)}
.authsearch-work-placeholder{width:68px;height:102px;border-radius:3px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#98a2b3;font-size:9px;text-align:center;padding:5px}
.authsearch-work-body{min-width:0}
.authsearch-work-title{font-size:13.5px;font-weight:780;line-height:1.35;margin:0 0 7px;color:#1f3f58}
.authsearch-work-title a{color:#1f5f8b!important;text-decoration:none!important}
.authsearch-work-title a:hover{text-decoration:underline!important}
.authsearch-work-details{font-size:11.5px;color:#465766;line-height:1.42}
.authsearch-work-line{display:flex;align-items:flex-start;gap:6px;margin-top:3px;min-width:0}
.authsearch-work-line:first-child{margin-top:0}
.authsearch-work-label{flex:0 0 68px;color:#657786;font-weight:700}
.authsearch-work-value{min-width:0;overflow-wrap:anywhere}
.authsearch-work-details.is-loading{color:#98a2b3;font-style:italic}
.authsearch-works-actions{margin-top:8px;font-size:11px}
.authsearch-works-hidden{display:none!important}

/* Utilitários de layout que substituem estilos inline do JavaScript. */
.authsearch-toolbar-spaced { margin-top: 10px; }
.authsearch-box-head-flush { padding-left: 0; padding-right: 0; }
.authsearch-create-trigger { padding: 0 10px 10px; }
.authsearch-box-spaced { margin-top: 10px; }
.authsearch-desc-spaced { margin-top: 8px; }
`;

    function instalarEstilos() {
        if (document.getElementById("authsearch-v2-styles")) return;

        var style = document.createElement("style");
        style.id = "authsearch-v2-styles";
        style.type = "text/css";
        style.textContent = AUTHSEARCH_CSS;
        document.head.appendChild(style);
    }

    /* ======================================================
       JAVASCRIPT / COMPORTAMENTO
       ====================================================== */

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
            wikidataHumanQid: "Q5",
            maxTermLength: 200,
            permitirFallbackJsonpVIAF: true
        };

        var STATE = {
            authority: null,
            aberto: false,
            xhr: [],
            tokenPesquisa: 0,
            entidadeAtual: null,
            qidAtual: "",
            cacheEntidades: {},
            cacheLabels: {},
            // Mantém a última pesquisa visível mesmo quando o painel é reconstruído.
            pesquisaPersistente: null,
            larguraPainelPx: 0,
            redimensionando: false,
            obrasCarregadas: false
        };

        // Inicialização: estilos -> UI -> eventos -> leitura do registo -> estado inicial.
        instalarEstilos();
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

        /** Lê do formulário Koha apenas os dados necessários ao AuthSearch. */
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

        /** Cria a estrutura HTML do módulo. Os estilos estão concentrados no bloco AUTHSEARCH_CSS. */
        function instalarInterface() {
            $("#authsearch-root, #authsearch-tab").remove();
            $("body").removeClass("authsearch-docked authsearch-resizing");
            document.documentElement.style.removeProperty("--authsearch-dock-width");

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
            // Cancela pedidos pendentes para evitar alterações de UI após fechar o painel.
            abortarPedidos();
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
            STATE.obrasCarregadas = false;
            var a = STATE.authority || {};
            var qid = primeiroQidValido(a.wikidata || []);
            var pesquisa = '' +
                '<div class="authsearch-searchbar"><input type="text" id="authsearch-term" autocomplete="off" placeholder="Nome da autoridade"></div>' +
                '<div class="authsearch-toolbar authsearch-search-actions"><button type="button" class="authsearch-btn authsearch-primary" id="authsearch-search">Pesquisar Wikidata + VIAF</button></div>' +
                '<div class="authsearch-state" id="authsearch-state">Confirme sempre a identidade antes de aplicar um identificador.</div>' +
                '<div class="authsearch-source-grid">' +
                    '<section class="authsearch-box"><div class="authsearch-box-head"><strong>Wikidata</strong></div><div class="authsearch-box-body" id="authsearch-wikidata"><div class="authsearch-empty">Aguardando pesquisa.</div></div><div id="authsearch-create-area"></div></section>' +
                    '<section class="authsearch-box"><div class="authsearch-box-head"><strong>VIAF</strong></div><div class="authsearch-box-body" id="authsearch-viaf"><div class="authsearch-empty">Aguardando pesquisa.</div></div></section>' +
                '</div>';

            var html = '';
            if (qid) {
                html += criarAccordion('graph', 'Painel de Identidade', 'Wikidata, Wikimedia Commons e Wikipedia', false,
                    '<div id="authsearch-graph-area" class="authsearch-graph-slot" data-qid="' + escaparAttr(qid) + '"></div>');
            }
            html += criarAccordion('search', 'Identificadores e reconciliação', 'Pesquisa Wikidata + VIAF e formas variantes 400', false, pesquisa);
            html += criarAccordion('works', 'Obras no catálogo', '', false,
                '<div id="authsearch-works"><div class="authsearch-empty">Abra esta secção para carregar as obras ligadas.</div></div>');

            $("#authsearch-body").html(html);
            preencherPesquisa(a.nome || "");
            if (STATE.pesquisaPersistente) restaurarEstadoResultadosPesquisa(STATE.pesquisaPersistente);
        }

        function criarAccordion(id, titulo, subtitulo, aberto, conteudo) {
            return '<section class="authsearch-accordion' + (aberto ? ' is-open' : '') + '" data-accordion="' + escaparAttr(id) + '">' +
                '<div class="authsearch-accordion-toggle" role="button" tabindex="0" aria-expanded="' + (aberto ? 'true' : 'false') + '">' +
                    '<span class="authsearch-accordion-copy"><span class="authsearch-accordion-title">' + escaparHTML(titulo) + '</span><span class="authsearch-accordion-sub">' + escaparHTML(subtitulo || '') + '</span></span>' +
                    '<span class="authsearch-accordion-chevron" aria-hidden="true"></span>' +
                '</div>' +
                '<div class="authsearch-accordion-body">' + conteudo + '</div>' +
            '</section>';
        }



        function renderFichaAutoridade(entidade, qid) {
            STATE.entidadeAtual = entidade;
            STATE.qidAtual = qid;

            var $area = $("#authsearch-graph-area");
            if (!$area.length) return;
            $area.html('<div class="authsearch-loading">A construir Painel de Identidade…</div>');

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
                    return '<a class="authsearch-kp-idbtn" href="' + escaparAttr(url) + '" target="_blank" rel="noopener noreferrer" title="Abrir ' + escaparAttr(t) + '"><b>' + escaparHTML(t) + '</b><span>' + escaparHTML(v) + '</span></a>';
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

                html += '<div class="authsearch-kp-section" id="authsearch-kp-wikipedia"><div class="authsearch-kp-wiki">A carregar resumo…</div></div>';

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
                dataType: "json",
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
                    iiurlwidth: 700,
                    origin: "*"
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
                    url = sanitizarUrlExterna(url, ["upload.wikimedia.org", "commons.wikimedia.org"]);
                    page = sanitizarUrlExterna(page, ["commons.wikimedia.org"]) || url;
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
                    html += '<a class="authsearch-kp-gallery-item" href="' + escaparAttr(img.page) + '" target="_blank" rel="noopener noreferrer" title="Abrir imagem no Wikimedia Commons"><img src="' + escaparAttr(img.url) + '" alt="' + escaparAttr(label) + '"></a>';
                });
                $galeria.html(html);
            }).fail(function () {
                if (!$("#authsearch-kp-gallery").length) return;
                if (principalUrl) {
                    $galeria.html('<a class="authsearch-kp-gallery-item" href="' + escaparAttr(principalPage) + '" target="_blank" rel="noopener noreferrer"><img src="' + escaparAttr(principalUrl) + '" alt="' + escaparAttr(label) + '"></a>');
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
                var fallback = "https://" + lang + ".wikipedia.org/wiki/" + encodeURIComponent(sl.title.replace(/ /g, "_"));
                return {
                    lang: lang,
                    title: sl.title,
                    url: sanitizarUrlExterna(sl.url, [lang + ".wikipedia.org"]) || fallback
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
                var linkRecebido = data && data.content_urls && data.content_urls.desktop && data.content_urls.desktop.page ? data.content_urls.desktop.page : "";
                var link = sanitizarUrlExterna(linkRecebido, [ref.lang + ".wikipedia.org"]) || ref.url;
                if (!resumo) {
                    $sec.remove();
                    return;
                }
                if (resumo.length > 900) resumo = resumo.slice(0, 897).replace(/\s+\S*$/, "") + "…";
                $sec.html('<div class="authsearch-kp-wiki"><p>' + escaparHTML(resumo) + ' <a href="' + escaparAttr(link) + '" target="_blank" rel="noopener noreferrer">Ler mais</a></p></div>');
            }).fail(function () {
                if (!$("#authsearch-kp-wikipedia").length) return;
                $sec.html('<div class="authsearch-kp-wiki"><a href="' + escaparAttr(ref.url) + '" target="_blank" rel="noopener noreferrer">Ler mais</a></div>');
            });
            registarPedido(req);
        }



        /* ======================================================
           CAMPO 400 / FORMAS VARIANTES
           ====================================================== */

        /** Decompõe apenas formas que terminem pela palavra de ordem já existente no 200$a. */
        function decomporVariantePara400(forma) {
            atualizarAuthorityState();
            var apelido = limparTexto((STATE.authority && STATE.authority.nomeA) || "");
            forma = limparTexto(forma || "");
            if (!apelido || !forma) return null;
            var fLow = forma.toLowerCase(), aLow = apelido.toLowerCase();
            if (fLow === aLow) return { a: apelido, b: "" };
            if (!fLow.endsWith(" " + aLow)) return null;
            var b = limparTexto(forma.slice(0, forma.length - apelido.length));
            if (!b) return null;
            return { a: apelido, b: b };
        }

        function encontrarCampos400ParaAplicacao() {
            var campos = [], vistos = {};
            $("li, div, tr").each(function () {
                var bloco = $(this), texto = limparTexto(bloco.text());
                if (texto.indexOf("400") === -1 || texto.indexOf("Palavra de ordem") === -1) return;
                var a = encontrarCampoPorEtiquetaRobusto(bloco, "Palavra de ordem");
                var b = encontrarCampoPorEtiquetaRobusto(bloco, "Outra parte do nome");
                if (!a.length) return;
                var chave = (a.attr("id") || a.attr("name") || "") + "|" + (b.attr("id") || b.attr("name") || "");
                if (!chave || vistos[chave]) return;
                vistos[chave] = true;
                campos.push({ bloco: bloco, campoA: a, campoB: b, indicador1: encontrarIndicador017Robusto(bloco) });
            });
            return campos;
        }

        function encontrar400Livre() {
            var livre = null;
            encontrarCampos400ParaAplicacao().some(function (campo) {
                if (!limparTexto(campo.campoA.val()) && (!campo.campoB.length || !limparTexto(campo.campoB.val()))) { livre = campo; return true; }
                return false;
            });
            return livre;
        }

        /**
         * Normaliza uma forma de nome apenas para comparação local.
         * Não altera o valor que será efetivamente gravado no UNIMARC.
         */
        function normalizarForma400Comparacao(valor) {
            valor = limparTexto(valor || "").toLowerCase();
            try { valor = valor.normalize("NFKC"); } catch (_e) {}
            return valor.replace(/\s*,\s*/g, ", ").replace(/\s+/g, " " ).trim();
        }

        /** Recolhe as formas 400 já existentes para não voltar a sugeri-las. */
        function obterFormas400Existentes() {
            var formas = {};
            encontrarCampos400ParaAplicacao().forEach(function (campo) {
                var a = campo.campoA && campo.campoA.length ? limparTexto(campo.campoA.val()) : "";
                var b = campo.campoB && campo.campoB.length ? limparTexto(campo.campoB.val()) : "";
                if (!a && !b) return;

                [a, [b, a].filter(Boolean).join(" "), a + (b ? ", " + b : "")].forEach(function (forma) {
                    var chave = normalizarForma400Comparacao(forma);
                    if (chave) formas[chave] = true;
                });
            });
            return formas;
        }

        /**
         * Cria uma nova ocorrência repetível de 400 através do controlo nativo do Koha.
         * A estrutura HTML varia entre versões, por isso procuramos primeiro junto do campo
         * e, como fallback, um CloneField associado explicitamente à tag 400.
         */
        function tentarCriarNovo400(callback) {
            callback = typeof callback === "function" ? callback : function () {};
            var antes = encontrarCampos400ParaAplicacao().length;
            var $gatilho = $();

            function ehControloRepeticao400(el) {
                var $el = $(el);
                var onclick = String($el.attr("onclick") || "");
                var texto = limparTexto([$el.text(), $el.attr("title"), $el.attr("aria-label"), $el.val()].filter(Boolean).join(" ")).toLowerCase();
                var contexto = limparTexto($el.closest("li, .tag, .tag_400, fieldset, tr").text());

                if (/CloneField\s*\(/i.test(onclick)) {
                    if (/400/.test(onclick) || /(^|\s)400(\s|$)/.test(contexto)) return true;
                }
                if (/repetir campo|duplicar campo|adicionar campo|novo campo|repeat field|clone field/i.test(texto) && /400/.test(contexto)) return true;
                return false;
            }

            // 1) Procurar progressivamente nos ancestrais de uma ocorrência 400 já existente.
            encontrarCampos400ParaAplicacao().some(function (campo) {
                var $zona = campo.bloco;
                for (var nivel = 0; nivel < 6 && $zona.length; nivel++) {
                    var $c = $zona.find("button, input[type='button'], input[type='image'], a").filter(function () {
                        return ehControloRepeticao400(this);
                    }).first();
                    if ($c.length) {
                        $gatilho = $c;
                        return true;
                    }
                    $zona = $zona.parent();
                }
                return false;
            });

            // 2) Fallback global: algumas versões colocam o botão fora do bloco dos subcampos.
            if (!$gatilho.length) {
                $gatilho = $("button, input[type='button'], input[type='image'], a").filter(function () {
                    return ehControloRepeticao400(this);
                }).first();
            }

            if (!$gatilho.length) {
                console.warn("AuthSearch: não foi localizado o controlo nativo para repetir o campo 400.");
                callback(null);
                return;
            }

            try {
                $gatilho.trigger("click");
            } catch (e) {
                console.warn("AuthSearch: não foi possível acionar a repetição do campo 400", e);
                callback(null);
                return;
            }

            // Esperar pela criação real da nova ocorrência antes de a preencher.
            var tentativas = 0;
            (function verificarNovo400() {
                tentativas++;
                var depois = encontrarCampos400ParaAplicacao().length;
                var livre = encontrar400Livre();
                if (depois > antes && livre) {
                    callback(livre);
                    return;
                }
                if (tentativas < 8) {
                    window.setTimeout(verificarNovo400, 100);
                    return;
                }
                callback(livre || null);
            })();
        }

        function escrever400(campo, dados) {
            if (!campo || !campo.campoA || !campo.campoA.length || !dados) return false;
            campo.campoA.val(dados.a).trigger("input").trigger("change");
            if (campo.campoB && campo.campoB.length) campo.campoB.val(dados.b || "").trigger("input").trigger("change");
            return limparTexto(campo.campoA.val()) === dados.a && (!dados.b || (campo.campoB.length && limparTexto(campo.campoB.val()) === dados.b));
        }

        function aplicarVariante400(forma) {
            var dados = decomporVariantePara400(forma);
            if (!dados) { setEstado("A forma variante não pode ser decomposta com segurança para 400$a/400$b.", true); return; }
            var livre = encontrar400Livre();
            function concluir(campo) {
                if (!campo) { setEstado("Não foi possível criar/localizar um campo 400 livre.", true); return; }
                if (!escrever400(campo,dados)) { setEstado("Não foi possível preencher o campo 400.", true); return; }
                setEstado("Forma variante aplicada no 400: " + forma + ".");
            }
            if (livre) { concluir(livre); return; }
            setEstado("A preparar uma nova ocorrência 400…");
            tentarCriarNovo400(concluir);
        }

        /* ======================================================
           OBRAS NO CATÁLOGO
           ====================================================== */

        function carregarGrafoAccordion() {
            var $area=$("#authsearch-graph-area"); if (!$area.length || $area.children().length) return;
            atualizarAuthorityState();
            var qid=String($area.attr("data-qid") || primeiroQidValido((STATE.authority&&STATE.authority.wikidata)||[])).toUpperCase();
            if (!/^Q\d+$/.test(qid)) return;
            $area.html('<div class="authsearch-loading">A carregar Painel de Identidade…</div>');
            carregarEntidadeWikidata(qid,function(entidade){
                if(!entidade){$area.html('<div class="authsearch-error">Não foi possível carregar a entidade Wikidata.</div>');return;}
                renderFichaAutoridade(entidade,qid);
            });
        }

        /**
         * Extrai bibliográficos de uma página de resultados do catálogo staff.
         * A descrição recolhida aqui serve apenas de fallback até o ISBD real ser carregado.
         */
        function extrairObrasPagina(html) {
            var doc = $.parseHTML(html, document, true), $doc = $(doc), obras = [], vistos = {};
            $doc.find('a[href*="/cgi-bin/koha/catalogue/detail.pl?biblionumber="], a[href*="detail.pl?biblionumber="]').each(function () {
                var $a = $(this), href = String($a.attr('href') || ''), m = href.match(/[?&]biblionumber=(\d+)/);
                if (!m || vistos[m[1]]) return;
                var titulo = limparTexto($a.text());
                if (!titulo) return;
                vistos[m[1]] = true;
                var $ctx = $a.closest('tr, li, .searchresults, .bibliocol, .result, .bibliographic-information');
                if (!$ctx.length) $ctx = $a.parent();
                var img = String($ctx.find('img').first().attr('src') || '');
                if (img && !/^https?:\/\//i.test(img) && img.charAt(0) !== '/') img = '';
                var fallback = limitarTexto(limparTexto($ctx.text()), 700);
                obras.push({ biblionumber: m[1], titulo: titulo, href: href, img: img, fallback: fallback });
            });
            return obras;
        }

        function encontrarProximaPaginaCatalogo(html, urlAtual) {
            var doc = $.parseHTML(html, document, true), $doc = $(doc), href = '';
            var $next = $doc.find('a[rel="next"]').first();
            if (!$next.length) {
                $doc.find('.pagination a, nav a').each(function () {
                    var txt = limparTexto($(this).text()).toLowerCase();
                    var title = limparTexto($(this).attr('title') || '').toLowerCase();
                    if (/^(next|próximo|seguinte|›|»)$/.test(txt) || /next|próxim|seguinte/.test(title)) {
                        $next = $(this); return false;
                    }
                });
            }
            href = $next.length ? String($next.attr('href') || '') : '';
            if (!href) return '';
            try { return new URL(href, new URL(urlAtual, window.location.origin)).pathname + new URL(href, new URL(urlAtual, window.location.origin)).search; }
            catch (_e) { return ''; }
        }

        /** Carrega todas as páginas de resultados ligadas à autoridade, com limite de segurança. */
        function carregarTodasObrasCatalogo(urlInicial, callback) {
            var obras = [], vistos = {}, paginas = {}, pagina = 0, maxPaginas = 50;
            function carregar(url) {
                if (!url || paginas[url] || pagina >= maxPaginas) { callback(null, obras); return; }
                paginas[url] = true; pagina++;
                var req = $.ajax({ url: url, dataType: 'html', timeout: CONFIG.timeout }).done(function (html) {
                    extrairObrasPagina(html).forEach(function (o) {
                        if (!vistos[o.biblionumber]) { vistos[o.biblionumber] = true; obras.push(o); }
                    });
                    var proxima = encontrarProximaPaginaCatalogo(html, url);
                    if (proxima && !paginas[proxima]) carregar(proxima); else callback(null, obras);
                }).fail(function () { callback(new Error('catalogue'), obras); });
                registarPedido(req);
            }
            carregar(urlInicial);
        }

        function tituloSemResponsabilidade(titulo) {
            titulo = limparTexto(titulo || '');
            if (!titulo) return '';
            // Nos resultados Koha a responsabilidade surge normalmente depois de " / ".
            return limparTexto(titulo.split(/\s+\/\s+/)[0] || titulo);
        }

        function textoResumo($doc, seletores) {
            var $el = $doc.find(seletores).first();
            if (!$el.length) return '';
            var $clone = $el.clone();
            $clone.find('.label, script, style, button').remove();
            return limitarTexto(limparTexto($clone.text()), 900);
        }

        /** Normaliza um rótulo da ficha staff para permitir comparação entre templates/idiomas PT. */
        function normalizarRotuloFicha(texto) {
            return limparTexto(texto || '')
                .replace(/[:：]\s*$/, '')
                .replace(/\s+/g, ' ')
                .toLowerCase();
        }

        /**
         * Lê pares rótulo/valor diretamente da ficha bibliográfica do Koha.
         * Suporta dt/dd, th/td e o padrão visual "rótulo à esquerda / valor à direita"
         * usado no template staff da instalação atual.
         */
        function extrairMapaRotulosFicha($doc) {
            var mapa = {};

            function guardar(rotulo, valor) {
                rotulo = normalizarRotuloFicha(rotulo);
                valor = limitarTexto(limparTexto(valor || ''), 1200);
                if (!rotulo || !valor || rotulo === valor.toLowerCase()) return;
                if (!mapa[rotulo]) mapa[rotulo] = [];
                if (mapa[rotulo].indexOf(valor) === -1) mapa[rotulo].push(valor);
            }

            // Estruturas semânticas clássicas.
            $doc.find('dt').each(function () {
                var $r = $(this), $v = $r.next('dd');
                if ($v.length) guardar($r.text(), $v.text());
            });
            $doc.find('tr').each(function () {
                var $c = $(this).children('th,td');
                if ($c.length >= 2) guardar($c.eq(0).text(), $c.slice(1).text());
            });

            // Koha staff: linhas onde o primeiro elemento contém apenas o rótulo
            // e o elemento seguinte contém o respetivo valor/links.
            $doc.find('div,li,p').each(function () {
                var $linha = $(this);
                var $filhos = $linha.children(':visible, span, div, strong, b, label, a');
                if ($filhos.length < 2 || $filhos.length > 8) return;

                var $r = $filhos.eq(0);
                var rotulo = normalizarRotuloFicha($r.text());
                if (!/^(autor(?:es)?|responsabilidade|isbn|editor|publica(?:ção|cao)|cole(?:ção|cao)|série|serie|volume|assunto(?:s)?(?:\s*-.*)?)$/.test(rotulo)) return;

                var valor = limparTexto($filhos.slice(1).text());
                if (valor) guardar(rotulo, valor);
            });

            // Último fallback: elementos curtos cujo texto é exatamente um rótulo conhecido.
            var reRotulo = /^(autor(?:es)?|responsabilidade|isbn|editor|publica(?:ção|cao)|cole(?:ção|cao)|série|serie|volume|assunto(?:s)?(?:\s*-.*)?)$/;
            $doc.find('strong,b,label,span,div').each(function () {
                var $r = $(this), rotulo = normalizarRotuloFicha($r.text());
                if (!reRotulo.test(rotulo)) return;
                if ($r.children().length && limparTexto($r.children().text()) !== limparTexto($r.text())) return;

                var $v = $r.next();
                if (!$v.length) {
                    var $pai = $r.parent();
                    $v = $pai.children().eq($r.index() + 1);
                }
                if ($v && $v.length) guardar(rotulo, $v.text());
            });

            return mapa;
        }

        function valoresMapaPorRotulos(mapa, testes) {
            var vals = [];
            Object.keys(mapa || {}).forEach(function (rotulo) {
                if (!testes.some(function (re) { return re.test(rotulo); })) return;
                (mapa[rotulo] || []).forEach(function (v) {
                    if (vals.indexOf(v) === -1) vals.push(v);
                });
            });
            return limitarTexto(vals.join(' ; '), 1200);
        }

        /** Extrai apenas os elementos bibliográficos necessários à lista de obras. */
        function extrairMetadadosObra(html, obra) {
            var doc = $.parseHTML(html, document, true), $doc = $(doc);
            var titulo = tituloSemResponsabilidade(obra.titulo || '');
            var tituloPagina = limparTexto($doc.find('h1').first().text());
            if (tituloPagina) titulo = tituloSemResponsabilidade(tituloPagina.replace(/^Detalhes\s+de\s+/i, '')) || titulo;

            // Primeiro tenta seletores conhecidos; depois lê os pares rótulo/valor efetivos do template.
            var autores = textoResumo($doc, '.results_summary.author, .results_summary.author_statement, .author');
            var isbn = textoResumo($doc, '.results_summary.isbn, .isbn');
            var editor = textoResumo($doc, '.results_summary.publisher, .publisher');
            var colecao = textoResumo($doc, '.results_summary.series, .results_summary.collection, .series');
            var assunto = textoResumo($doc, '.results_summary.subjects, .results_summary.subject, .subjects');

            var mapa = extrairMapaRotulosFicha($doc);
            if (!autores) autores = valoresMapaPorRotulos(mapa, [/^autor(?:es)?$/, /^responsabilidade$/]);
            if (!isbn) isbn = valoresMapaPorRotulos(mapa, [/^isbn$/]);
            if (!editor) editor = valoresMapaPorRotulos(mapa, [/^editor$/, /^publica(?:ção|cao)$/]);
            if (!colecao) colecao = valoresMapaPorRotulos(mapa, [/^cole(?:ção|cao)$/, /^série$/, /^serie$/, /^volume$/]);
            if (!assunto) assunto = valoresMapaPorRotulos(mapa, [/^assunto(?:s)?(?:\s*-.*)?$/]);

            return { titulo: titulo, autores: autores, isbn: isbn, editor: editor, colecao: colecao, assunto: assunto };
        }

        function linhaObra(rotulo, valor) {
            valor = limparTexto(valor || '');
            if (!valor) return '';
            return '<div class="authsearch-work-line"><span class="authsearch-work-label">' + escaparHTML(rotulo) + '</span><span class="authsearch-work-value">' + escaparHTML(valor) + '</span></div>';
        }

        function renderObrasCatalogo(obras, urlPesquisa) {
            var $alvo = $('#authsearch-works');
            if (!$alvo.length) return;
            if (!obras.length) {
                $alvo.html('<div class="authsearch-empty">Não foram encontrados bibliográficos ligados nesta pesquisa.</div>');
                return;
            }

            var toolbar = '<div class="authsearch-works-toolbar"><div class="authsearch-works-meta">' + obras.length + ' registo' + (obras.length === 1 ? '' : 's') + '</div>';
            if (obras.length > 8) toolbar += '<input type="search" id="authsearch-works-filter" class="authsearch-works-filter" autocomplete="off" placeholder="Filtrar obras…">';
            toolbar += '</div>';
            var out = toolbar + '<div class="authsearch-works-list" id="authsearch-works-list">';

            obras.forEach(function (o) {
                var titulo = tituloSemResponsabilidade(o.titulo || '') || ('Registo ' + o.biblionumber);
                var textoFiltro = limparTexto((titulo || '') + ' ' + (o.fallback || '')).toLowerCase();
                out += '<article class="authsearch-work" data-biblionumber="' + escaparAttr(o.biblionumber) + '" data-filter="' + escaparAttr(textoFiltro) + '">' +
                    (o.img ? '<img class="authsearch-work-cover" src="' + escaparAttr(o.img) + '" alt="">' : '<div class="authsearch-work-placeholder">Sem capa</div>') +
                    '<div class="authsearch-work-body"><div class="authsearch-work-title"><a href="' + escaparAttr(o.href) + '" target="_blank" rel="noopener noreferrer">' + escaparHTML(titulo) + '</a></div>' +
                    '<div class="authsearch-work-details is-loading">A carregar dados bibliográficos…</div></div></article>';
            });
            out += '</div>';
            $alvo.html(out);
            observarDetalhesObrasVisiveis();
        }

        function carregarDetalhesObra($obra) {
            if (!$obra || !$obra.length || $obra.attr('data-detail-loaded') === '1' || $obra.attr('data-detail-loading') === '1') return;
            var biblionumber = String($obra.attr('data-biblionumber') || '');
            if (!/^\d+$/.test(biblionumber)) return;
            $obra.attr('data-detail-loading', '1');
            var $dest = $obra.find('.authsearch-work-details');
            var htmlCache = STATE.obrasDetalheHtml && STATE.obrasDetalheHtml[biblionumber];
            function aplicarHtmlDetalhe(html) {
                    var d = extrairMetadadosObra(html, { titulo: $obra.find('.authsearch-work-title').text() });
                    var linhas = '';
                    linhas += linhaObra('Autores', d.autores);
                    linhas += linhaObra('ISBN', d.isbn);
                    linhas += linhaObra('Editor', d.editor);
                    linhas += linhaObra('Coleção / vol.', d.colecao);
                    linhas += linhaObra('Assuntos', d.assunto);
                    $dest.html(linhas || '<span class="authsearch-muted">Sem metadados adicionais disponíveis.</span>').removeClass('is-loading');
                    $obra.attr('data-detail-loaded', '1');
                    var filtro = limparTexto(($obra.find('.authsearch-work-title').text() || '') + ' ' + $dest.text()).toLowerCase();
                    $obra.attr('data-filter', filtro);
            }
            if (htmlCache) {
                aplicarHtmlDetalhe(htmlCache);
                $obra.removeAttr('data-detail-loading');
                return;
            }
            var req = $.ajax({ url: '/cgi-bin/koha/catalogue/detail.pl?biblionumber=' + encodeURIComponent(biblionumber), dataType: 'html', timeout: CONFIG.timeout })
                .done(aplicarHtmlDetalhe)
                .fail(function () {
                    $dest.html('<span class="authsearch-muted">Não foi possível carregar os metadados.</span>').removeClass('is-loading');
                    $obra.attr('data-detail-loaded', '1');
                }).always(function () { $obra.removeAttr('data-detail-loading'); });
            registarPedido(req);
        }

        function observarDetalhesObrasVisiveis() {
            var root = document.getElementById('authsearch-works-list');
            if (!root) return;
            var itens = root.querySelectorAll('.authsearch-work[data-biblionumber]');
            if (!('IntersectionObserver' in window)) {
                $(itens).each(function () { carregarDetalhesObra($(this)); });
                return;
            }
            var observer = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    carregarDetalhesObra($(entry.target));
                    obs.unobserve(entry.target);
                });
            }, { root: root, rootMargin: '180px 0px' });
            Array.prototype.forEach.call(itens, function (item) { observer.observe(item); });
        }

        function filtrarObrasCatalogo(valor) {
            var termo = limparTexto(valor || '').toLowerCase();
            $('#authsearch-works-list .authsearch-work').each(function () {
                var texto = String($(this).attr('data-filter') || '');
                $(this).toggleClass('authsearch-works-hidden', !!termo && texto.indexOf(termo) === -1);
            });
        }

        /** Normaliza nomes para comparar a forma autorizada com a responsabilidade do bibliográfico. */
        function normalizarNomeParaComparacao(valor) {
            valor = limparTexto(valor || '').toLowerCase();
            try { valor = valor.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (_e) {}
            return valor
                .replace(/\b(?:18|19|20)\d{2}\s*[-–]\s*(?:18|19|20)?\d{0,4}\b/g, ' ')
                .replace(/\b(?:18|19|20)\d{2}\b/g, ' ')
                .replace(/[^a-z0-9\u00c0-\u024f]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        /**
         * Confirma que a autoridade é apresentada pelo Koha na responsabilidade "Autor".
         * A pesquisa an:<authid> garante a ligação ao registo; esta segunda validação evita
         * incluir bibliográficos em que a mesma autoridade aparece apenas como assunto.
         */
        function detalheConfirmaAutoria(html) {
            var a = STATE.authority || {};
            var apelido = normalizarNomeParaComparacao(a.nomeA || '');
            var restantes = normalizarNomeParaComparacao(a.nomeB || '');
            if (!apelido) return false;

            var d = extrairMetadadosObra(html, { titulo: '' });
            var autores = normalizarNomeParaComparacao(d.autores || '');
            if (!autores) return false;

            // O apelido/palavra de ordem tem de estar na responsabilidade de autor.
            if (autores.indexOf(apelido) === -1) return false;

            // Quando há 200$b, exige também a parte principal do nome para reduzir homónimos.
            if (restantes) {
                var tokens = restantes.split(/\s+/).filter(function (t) { return t.length > 1; });
                if (tokens.length && !tokens.every(function (t) { return autores.indexOf(t) !== -1; })) return false;
            }
            return true;
        }

        /**
         * Valida em paralelo moderado quais registos têm esta autoridade como autora.
         * Guarda o HTML da ficha para reutilização posterior e evitar um segundo pedido.
         */
        function filtrarObrasPorAutoria(obras, callback, onProgress) {
            obras = Array.isArray(obras) ? obras : [];
            callback = typeof callback === 'function' ? callback : function () {};
            onProgress = typeof onProgress === 'function' ? onProgress : function () {};
            if (!obras.length) { callback([]); return; }

            var aprovadas = [], indice = 0, ativos = 0, concluidos = 0, limite = 6;

            function terminarSePronto() {
                if (concluidos >= obras.length && ativos === 0) {
                    callback(aprovadas);
                    return true;
                }
                return false;
            }

            function proximo() {
                if (terminarSePronto()) return;
                while (ativos < limite && indice < obras.length) {
                    (function (obra) {
                        ativos++;
                        var url = '/cgi-bin/koha/catalogue/detail.pl?biblionumber=' + encodeURIComponent(obra.biblionumber);
                        var req = $.ajax({ url: url, dataType: 'html', timeout: CONFIG.timeout })
                            .done(function (html) {
                                obra.detailHtml = html;
                                STATE.obrasDetalheHtml = STATE.obrasDetalheHtml || {};
                                STATE.obrasDetalheHtml[String(obra.biblionumber)] = html;
                                if (detalheConfirmaAutoria(html)) aprovadas.push(obra);
                            })
                            .always(function () {
                                ativos--; concluidos++;
                                onProgress(concluidos, obras.length, aprovadas.length);
                                proximo();
                            });
                        registarPedido(req);
                    })(obras[indice++]);
                }
            }
            proximo();
        }

        function carregarObrasCatalogo() {
            var $alvo = $('#authsearch-works');
            if (!$alvo.length || STATE.obrasCarregadas) return;
            atualizarAuthorityState();
            var authid = String((STATE.authority && STATE.authority.authid) || '');
            if (!/^\d+$/.test(authid)) { $alvo.html('<div class="authsearch-empty">A autoridade ainda não tem AuthID persistido.</div>'); return; }
            $alvo.html('<div class="authsearch-loading">A carregar a lista integral de obras ligadas…</div>');
            var url = '/cgi-bin/koha/catalogue/search.pl?q=' + encodeURIComponent('an:' + authid) + '&count=50';
            carregarTodasObrasCatalogo(url, function (erro, obras) {
                STATE.obrasCarregadas = !erro;
                if (erro && !obras.length) {
                    $alvo.html('<div class="authsearch-error">Não foi possível consultar os bibliográficos ligados.</div><div class="authsearch-works-actions"><a class="authsearch-link" href="' + escaparAttr(url) + '" target="_blank" rel="noopener noreferrer">Abrir pesquisa no catálogo</a></div>');
                    return;
                }
                $alvo.html('<div class="authsearch-loading">A validar a autoria nos ' + obras.length + ' registos ligados…</div>');
                filtrarObrasPorAutoria(obras, function (obrasAutoria) {
                    STATE.obrasCarregadas = true;
                    renderObrasCatalogo(obrasAutoria, url);
                }, function (feito, total, encontrados) {
                    $alvo.html('<div class="authsearch-loading">A validar autoria… ' + feito + '/' + total + ' · ' + encontrados + ' obra' + (encontrados === 1 ? '' : 's') + ' confirmada' + (encontrados === 1 ? '' : 's') + '</div>');
                });
            });
        }

        /* ======================================================
           EVENTOS
           ====================================================== */

        function bindEventos() {
            $(document)
                .off(".authsearchv2")
                .on("click.authsearchv2", "#authsearch-tab", function () {
                    if (STATE.aberto) fecharPainel(); else abrirPainel();
                })
                .on("click.authsearchv2", "#authsearch-close", fecharPainel)
                .on("pointerdown.authsearchv2", "#authsearch-resizer", iniciarRedimensionamento)
                .on("pointermove.authsearchv2", moverRedimensionamento)
                .on("pointerup.authsearchv2 pointercancel.authsearchv2", terminarRedimensionamento)
                .on("keydown.authsearchv2", "#authsearch-resizer", redimensionarPorTeclado)
                .on("keydown.authsearchv2", "#authsearch-term", function (e) {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        $("#authsearch-search").trigger("click");
                    }
                })

                .on("keydown.authsearchv2", ".authsearch-accordion-toggle", function (e) {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    $(this).trigger("click");
                })
                .on("click.authsearchv2", ".authsearch-accordion-toggle", function () {
                    var $acc = $(this).closest(".authsearch-accordion");
                    var abrir = !$acc.hasClass("is-open");
                    $acc.toggleClass("is-open", abrir);
                    $(this).attr("aria-expanded", abrir ? "true" : "false");
                    if (!abrir) return;
                    var tipo = String($acc.attr("data-accordion") || "");
                    if (tipo === "graph") carregarGrafoAccordion();
                    if (tipo === "works") carregarObrasCatalogo();
                })
                .on("input.authsearchv2", "#authsearch-works-filter", function () {
                    filtrarObrasCatalogo($(this).val());
                })
                .on("click.authsearchv2", ".authsearch-add-400", function (e) {
                    e.preventDefault(); e.stopPropagation();
                    aplicarVariante400(String($(this).attr("data-forma") || ""));
                })
                .on("click.authsearchv2", "#authsearch-search", executarPesquisa)
                .on("click.authsearchv2", "#authsearch-retry-viaf", function () {
                    var termo = normalizarTermoPesquisa($("#authsearch-term").val()) || normalizarTermoPesquisa((STATE.authority && STATE.authority.nome) || "");
                    if (!termo) return;
                    STATE.tokenPesquisa++;
                    pesquisarVIAF(termo, STATE.tokenPesquisa);
                })
                .on("click.authsearchv2", "#authsearch-prepare-wikidata", function () { renderAjudaCriacaoWikidata(true); })
                .on("click.authsearchv2", "#authsearch-copy-qs", copiarQuickStatements)
                .on("click.authsearchv2", ".authsearch-apply", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    // Ler os atributos diretamente evita problemas de cache do jQuery em resultados restaurados no DOM.
                    var valor = String($(this).attr("data-valor") || "");
                    var fonte = String($(this).attr("data-fonte") || "");
                    aplicarNoCampo017(valor, fonte);
                })
                .on("input.authsearchv2 change.authsearchv2", "input[type='text'], textarea, select", debounce(function () {
                    if ($(this).closest("#authsearch-root").length) return;
                    atualizarAuthorityState();
                    atualizarResumoLateral();
                }, 180))
                .on("keydown.authsearchv2", function (e) {
                    if (e.key === "Escape" && STATE.aberto) fecharPainel();
                })
                .on("resize.authsearchv2", debounce(function () {
                    if (!STATE.aberto) return;
                    if (window.matchMedia && window.matchMedia("(max-width: 800px)").matches) {
                        $("body").removeClass("authsearch-docked authsearch-resizing");
                        return;
                    }
                    if (!STATE.larguraPainelPx) STATE.larguraPainelPx = obterLarguraInicialPainel();
                    definirLarguraPainel(STATE.larguraPainelPx, false);
                }, 80));
        }

        /** Dispara Wikidata e VIAF em paralelo; token evita resultados obsoletos. */
        function executarPesquisa() {
            atualizarAuthorityState();
            var termo = normalizarTermoPesquisa($("#authsearch-term").val());

            if (!termo) {
                setEstado("Indique um termo de pesquisa.");
                return;
            }

            abortarPedidos();
            STATE.tokenPesquisa++;
            var token = STATE.tokenPesquisa;

            setEstado("A pesquisar. Confirme sempre os resultados antes de aplicar identificadores.");
            $("#authsearch-create-area").empty();
            // Uma nova pesquisa substitui deliberadamente a anterior.
            STATE.pesquisaPersistente = null;
            pesquisarWikidata(termo, token);
            pesquisarVIAF(termo, token);
            memorizarEstadoPesquisa();
        }

        /* ======================================================
           WIKIDATA
           ====================================================== */

        function pesquisarWikidata(termo, token) {
            $("#authsearch-wikidata").html('<div class="authsearch-loading">A pesquisar…</div>');

            var req = $.ajax({
                url: "https://www.wikidata.org/w/api.php",
                dataType: "json",
                timeout: CONFIG.timeout,
                data: {
                    action: "wbsearchentities",
                    format: "json",
                    language: CONFIG.idiomaPrincipal,
                    uselang: CONFIG.idiomaPrincipal,
                    type: "item",
                    limit: CONFIG.maxResultadosWikidata,
                    search: termo,
                    origin: "*"
                }
            }).done(function (dados) {
                if (token !== STATE.tokenPesquisa) return;

                if (!dados || !dados.search || !dados.search.length) {
                    $("#authsearch-wikidata").html('<div class="authsearch-empty">Sem resultados no Wikidata para esta pesquisa.</div>');
                    renderAjudaCriacaoWikidata(false);
                    memorizarEstadoPesquisa();
                    return;
                }

                var ids = dados.search.map(function (item) { return item.id; }).filter(Boolean);
                if (!ids.length) return;

                var req2 = $.ajax({
                    url: "https://www.wikidata.org/w/api.php",
                    dataType: "json",
                    timeout: CONFIG.timeout,
                    data: {
                        action: "wbgetentities",
                        format: "json",
                        ids: ids.join("|"),
                        props: "labels|descriptions|aliases|claims|sitelinks",
                        languages: "pt|en",
                        origin: "*"
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
                            label: limitarTexto(obterLabelEntidade(entidade) || item.label || "", 180),
                            description: limitarTexto(obterDescricaoEntidade(entidade) || item.description || "", 500),
                            entidade: entidade
                        });
                    });

                    if (!resultados.length) {
                        var msg = tipoPessoa ? "Sem resultados confirmados como pessoa humana (P31 = Q5)." : "Sem resultados válidos.";
                        $("#authsearch-wikidata").html('<div class="authsearch-empty">' + escaparHTML(msg) + '</div>');
                        renderAjudaCriacaoWikidata(false);
                        memorizarEstadoPesquisa();
                        return;
                    }

                    resultados = resultados.slice(0, CONFIG.maxMostrarWikidata);
                    $("#authsearch-create-area").empty();
                    enriquecerResultadosWikidata(resultados, token);
                }).fail(function () {
                    if (token !== STATE.tokenPesquisa) return;
                    $("#authsearch-wikidata").html('<div class="authsearch-error">Erro ao obter detalhes do Wikidata.</div>');
                    memorizarEstadoPesquisa();
                });

                registarPedido(req2);
            }).fail(function (_xhr, status) {
                if (status === "abort" || token !== STATE.tokenPesquisa) return;
                $("#authsearch-wikidata").html('<div class="authsearch-error">Erro ao consultar o Wikidata.</div>');
                memorizarEstadoPesquisa();
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

                // Ações principais ficam antes das propostas de variantes, para manter a hierarquia do resultado clara.
                html += '<div class="authsearch-actions authsearch-result-main-actions">' +
                    '<a class="authsearch-link" href="https://www.wikidata.org/wiki/' + encodeURIComponent(qid) + '" target="_blank" rel="noopener noreferrer">Abrir</a>' +
                    '<button type="button" class="authsearch-btn authsearch-primary authsearch-apply" data-valor="' + escaparAttr(qid) + '" data-fonte="wikidata">Aplicar Wikidata</button>' +
                    '</div>';

                var formas400Existentes = obterFormas400Existentes();
                var variantes400 = removerDuplicados(aliases.concat(obterValoresTextoClaims(entidade, "P742"))).filter(function (nomeVariante) {
                    if (limparTexto(nomeVariante).toLowerCase() === limparTexto(label).toLowerCase()) return false;
                    return !formas400Existentes[normalizarForma400Comparacao(nomeVariante)];
                }).slice(0, 8);
                if (variantes400.length) {
                    html += '<div class="authsearch-result-variants"><div class="authsearch-result-variants-title">Candidatos ao 400</div><div class="authsearch-variants-list">';
                    variantes400.forEach(function (nomeVariante) {
                        var comp400 = decomporVariantePara400(nomeVariante);
                        html += '<div class="authsearch-variant-row"><span class="authsearch-variant-name">' + escaparHTML(nomeVariante) + '</span>' +
                            (comp400 ? '<button type="button" class="authsearch-btn authsearch-add-400" data-forma="' + escaparAttr(nomeVariante) + '">Adicionar ao 400</button>' : '<span class="authsearch-muted" title="Forma não decomponível com segurança">Rever</span>') +
                            '</div>';
                    });
                    html += '</div></div>';
                }

                html += '</div></div></div>';
            });

            $("#authsearch-wikidata").html(html || '<div class="authsearch-empty">Sem resultados.</div>');
            memorizarEstadoPesquisa();
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
                dataType: "json",
                timeout: CONFIG.timeout,
                data: {
                    action: "wbgetentities",
                    format: "json",
                    ids: qid,
                    props: "labels|descriptions|aliases|claims|sitelinks",
                    languages: "pt|en",
                    origin: "*"
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
                dataType: "json",
                timeout: CONFIG.timeout,
                data: {
                    action: "wbgetentities",
                    format: "json",
                    ids: faltam.join("|"),
                    props: "labels",
                    languages: "pt|en",
                    origin: "*"
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
            termo = normalizarTermoPesquisa(termo);
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

                /* JSONP executa código remoto no contexto da página. Mantém-se apenas
                   como fallback explícito para o VIAF, porque algumas instalações bloqueiam
                   a resposta JSON por CORS. Pode ser desativado em CONFIG. */
                if (!CONFIG.permitirFallbackJsonpVIAF) {
                    terminado = true;
                    if (typeof falha === "function") falha(status || "cors");
                    return;
                }

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
                    memorizarEstadoPesquisa();
                    return;
                }

                var html = "";
                lista.slice(0, CONFIG.maxResultadosVIAF).forEach(function (item) {
                    var viafid = limparTexto(item.viafid || "");
                    var termoResultado = limparTexto(item.term || item.displayForm || "");
                    if (!/^\d+$/.test(viafid)) return;

                    html += '<div class="authsearch-result">' +
                        '<div class="authsearch-result-name">' + escaparHTML(termoResultado || "VIAF") + '</div>' +
                        '<div class="authsearch-id">' + escaparHTML(viafid) + '</div>' +
                        '<div class="authsearch-actions">' +
                            '<a class="authsearch-link" href="https://viaf.org/viaf/' + encodeURIComponent(viafid) + '" target="_blank" rel="noopener noreferrer">Abrir</a>' +
                            '<button type="button" class="authsearch-btn authsearch-primary authsearch-apply" data-valor="' + escaparAttr(viafid) + '" data-fonte="viaf">Aplicar VIAF</button>' +
                        '</div>' +
                    '</div>';
                });

                $("#authsearch-viaf").html(html || '<div class="authsearch-empty">Sem resultados VIAF.</div>');
                memorizarEstadoPesquisa();
            }, function () {
                if (token !== STATE.tokenPesquisa) return;
                $("#authsearch-viaf").html('<div class="authsearch-error">Não foi possível consultar o VIAF.</div><div class="authsearch-actions"><button type="button" class="authsearch-btn" id="authsearch-retry-viaf">Tentar novamente</button></div>');
                memorizarEstadoPesquisa();
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

        /** Localiza campos 017 no DOM sem depender de IDs gerados pelo Koha. */
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

        /** Devolve a primeira ocorrência 017 totalmente vazia. */
        function encontrar017Livre() {
            var livre = null;
            encontrarCampos017ParaAplicacao().some(function (campo) {
                var valorA = campo.campoA.length ? limparTexto(campo.campoA.val()) : "";
                var valor2 = campo.campo2.length ? limparTexto(campo.campo2.val()) : "";
                if (!valorA && !valor2) {
                    livre = campo;
                    return true;
                }
                return false;
            });
            return livre;
        }

        /**
         * Tenta criar uma nova ocorrência repetível de 017 usando o controlo nativo do Koha.
         * Não clona manualmente HTML: isso poderia quebrar IDs/names internos do editor MARC.
         */
        function tentarCriarNovo017(callback) {
            callback = typeof callback === "function" ? callback : function () {};
            var antes = encontrarCampos017ParaAplicacao().length;
            var $gatilho = $();

            encontrarCampos017ParaAplicacao().some(function (campo) {
                var $zona = campo.bloco.closest("li");
                if (!$zona.length) $zona = campo.bloco;

                var $candidatos = $zona.find("button, input[type='button'], a").filter(function () {
                    var $el = $(this);
                    var onclick = String($el.attr("onclick") || "");
                    var texto = limparTexto([$el.text(), $el.attr("title"), $el.attr("aria-label"), $el.val()].filter(Boolean).join(" ")).toLowerCase();

                    // O editor MARC do Koha historicamente usa CloneField para repetir campos.
                    if (/CloneField\s*\(/i.test(onclick)) return true;
                    if (/repetir campo|duplicar campo|adicionar campo|novo campo|repeat field|clone field/i.test(texto)) return true;
                    return false;
                }).first();

                if ($candidatos.length) {
                    $gatilho = $candidatos;
                    return true;
                }
                return false;
            });

            if (!$gatilho.length) {
                callback(null);
                return;
            }

            try {
                $gatilho.trigger("click");
            } catch (e) {
                console.warn("AuthSearch: não foi possível acionar a repetição do campo 017", e);
                callback(null);
                return;
            }

            // O Koha cria a nova ocorrência de forma síncrona na maioria das versões,
            // mas damos uma pequena margem para handlers internos do editor.
            window.setTimeout(function () {
                var camposDepois = encontrarCampos017ParaAplicacao();
                var livre = encontrar017Livre();
                if (camposDepois.length > antes && livre) callback(livre);
                else callback(livre || null);
            }, 120);
        }

        /** Escreve e confirma os valores numa ocorrência 017 já localizada. */
        function escrever017(campo, valor, fonte) {
            if (!campo || !campo.campoA || !campo.campoA.length || !campo.campo2 || !campo.campo2.length) return false;

            if (campo.indicador1 && campo.indicador1.length) {
                campo.indicador1.val("7").trigger("input").trigger("change");
            }
            campo.campoA.val(valor).trigger("input").trigger("change");
            campo.campo2.val(fonte).trigger("input").trigger("change");

            return limparTexto(campo.campoA.val()).toUpperCase() === limparTexto(valor).toUpperCase() &&
                   limparTexto(campo.campo2.val()).toLowerCase() === limparTexto(fonte).toLowerCase();
        }

        function capturarEstadoResultadosPesquisa() {
            return {
                termo: limparTexto($("#authsearch-term").val() || ""),
                wikidataHtml: $("#authsearch-wikidata").length ? $("#authsearch-wikidata").html() : "",
                viafHtml: $("#authsearch-viaf").length ? $("#authsearch-viaf").html() : "",
                createHtml: $("#authsearch-create-area").length ? $("#authsearch-create-area").html() : "",
                estadoHtml: $("#authsearch-state").length ? $("#authsearch-state").html() : ""
            };
        }

        function restaurarEstadoResultadosPesquisa(snapshot) {
            if (!snapshot) return;
            if (snapshot.termo && $("#authsearch-term").length) $("#authsearch-term").val(snapshot.termo);
            if (snapshot.wikidataHtml && $("#authsearch-wikidata").length) $("#authsearch-wikidata").html(snapshot.wikidataHtml);
            if (snapshot.viafHtml && $("#authsearch-viaf").length) $("#authsearch-viaf").html(snapshot.viafHtml);
            if (snapshot.createHtml && $("#authsearch-create-area").length) $("#authsearch-create-area").html(snapshot.createHtml);
            if (snapshot.estadoHtml && $("#authsearch-state").length) $("#authsearch-state").html(snapshot.estadoHtml);
        }

        /** Guarda a pesquisa atual para sobreviver a rerenders e ao fechar/reabrir o painel. */
        function memorizarEstadoPesquisa() {
            if (!$("#authsearch-term").length) return;
            STATE.pesquisaPersistente = capturarEstadoResultadosPesquisa();
        }


        /**
         * Garante a secção do Painel de Identidade sem reconstruir a pesquisa.
         * É usado após aplicar um QID para manter Wikidata e VIAF visíveis no mesmo DOM.
         */
        function garantirControloGrafo(qid) {
            qid = String(qid || "").toUpperCase();
            if (!/^Q\d+$/.test(qid)) return;
            STATE.qidAtual = qid;

            var $acc = $('.authsearch-accordion[data-accordion="graph"]');
            if ($acc.length) {
                $acc.find('#authsearch-graph-area').attr('data-qid', qid);
                return;
            }

            var html = criarAccordion('graph', 'Painel de Identidade', 'Wikidata, Wikimedia Commons e Wikipedia', false,
                '<div id="authsearch-graph-area" class="authsearch-graph-slot" data-qid="' + escaparAttr(qid) + '"></div>');
            $('#authsearch-body').prepend(html);
            carregarEntidadeWikidata(qid, function (entidade) { if (entidade) STATE.entidadeAtual = entidade; });
        }

        /**
         * Aplica Wikidata/VIAF ao 017 sem substituir dados existentes.
         * Se não existir um 017 livre, tenta criar uma nova ocorrência pelo mecanismo nativo do Koha.
         */
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
                return limparTexto(id.valor).toUpperCase() === valor.toUpperCase() &&
                       limparTexto(id.fonte).toLowerCase() === fonte;
            });

            if (jaExiste) {
                setEstado("O identificador " + valor + " já existe no campo 017.");
                if (fonte === "wikidata") garantirControloGrafo(valor);
                memorizarEstadoPesquisa();
                return;
            }

            function concluirAplicacao(campo) {
                if (!campo) {
                    setEstado("Não foi possível criar/localizar uma ocorrência 017 livre para aplicar " + fonte.toUpperCase() + ".", true);
                    return;
                }

                try {
                    if (!escrever017(campo, valor, fonte)) {
                        setEstado("O botão respondeu, mas o Koha não confirmou a escrita de " + fonte.toUpperCase() + " no campo 017.", true);
                        return;
                    }

                    atualizarAuthorityState();
                    atualizarResumoLateral();

                    // Verificação final a partir do próprio formulário Koha.
                    var confirmado = (STATE.authority.ids017 || []).some(function (id) {
                        return limparTexto(id.valor).toUpperCase() === valor.toUpperCase() &&
                               limparTexto(id.fonte).toLowerCase() === fonte;
                    });

                    if (!confirmado) {
                        setEstado("O valor foi escrito, mas o AuthSearch não conseguiu confirmar o novo 017. Verifique o campo antes de gravar.", true);
                        return;
                    }

                    if (fonte === "wikidata") {
                        garantirControloGrafo(valor);
                        setEstado("Wikidata aplicado no 017. Pode agora aplicar o VIAF a partir dos resultados já apresentados.");
                    } else {
                        setEstado("VIAF aplicado no 017: " + valor + ".");
                    }

                    // Não reconstruir a pesquisa: os resultados permanecem no DOM.
                    memorizarEstadoPesquisa();
                } catch (e) {
                    console.error("AuthSearch: erro ao aplicar 017", e);
                    setEstado("Não foi possível aplicar o identificador no campo 017.", true);
                }
            }

            var livre = encontrar017Livre();
            if (livre) {
                concluirAplicacao(livre);
                return;
            }

            // Depois de aplicar o primeiro identificador pode não existir uma segunda ocorrência 017.
            // Tentamos criá-la pelo botão nativo de repetição do Koha e só depois escrevemos.
            setEstado("A preparar uma nova ocorrência 017 para " + fonte.toUpperCase() + "…");
            tentarCriarNovo017(function (novoCampo) {
                concluirAplicacao(novoCampo);
            });
        }

        function mostrarFichaDepoisDeAplicar(qid) {
            atualizarAuthorityState();
            garantirControloGrafo(qid);
            memorizarEstadoPesquisa();
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


        /* ======================================================
           CRIAÇÃO ASSISTIDA NO WIKIDATA
           ====================================================== */

        function renderAjudaCriacaoWikidata(expandida) {
            var $area = $("#authsearch-create-area");
            if (!$area.length) return;

            atualizarAuthorityState();
            var a = STATE.authority || {};
            var nome = normalizarTermoPesquisa($("#authsearch-term").val() || a.nome || "");
            var viaf = a.viaf && a.viaf.length ? limparTexto(a.viaf[0].valor || "") : "";

            if (!expandida) {
                $area.html('<div class="authsearch-create-trigger"><button type="button" class="authsearch-btn" id="authsearch-prepare-wikidata">Não encontrou? Preparar novo item no Wikidata</button></div>');
                return;
            }

            var newItemUrl = "https://www.wikidata.org/wiki/Special:NewItem?label=" + encodeURIComponent(nome);
            var qs = construirQuickStatementsNovoItem(nome, viaf);
            var qsUrl = "https://quickstatements.toolforge.org/#/v1=" + encodeURIComponent(qs.replace(/\n/g, "||"));

            var html = '' +
                '<div class="authsearch-box authsearch-box-spaced">' +
                    '<div class="authsearch-box-head"><strong>Preparar novo item Wikidata</strong><span class="authsearch-chip">assistido</span></div>' +
                    '<div class="authsearch-box-body">' +
                        '<div class="authsearch-desc">Use apenas depois de confirmar que a pessoa não existe no Wikidata. O AuthSearch prepara os dados; a criação continua a exigir validação no Wikidata.</div>' +
                        (nome ? meta("Nome", nome) : '') +
                        '<div class="authsearch-meta"><strong>Tipo:</strong> ser humano (P31 = Q5)</div>' +
                        (viaf ? meta("VIAF a transportar", viaf) : '<div class="authsearch-meta"><strong>VIAF:</strong> ainda não registado no 017. Pode aplicar primeiro um resultado VIAF e voltar a preparar o item.</div>') +
                        '<div class="authsearch-actions">' +
                            '<a class="authsearch-link authsearch-primary" href="' + escaparAttr(newItemUrl) + '" target="_blank" rel="noopener noreferrer">Criar manualmente no Wikidata</a>' +
                            '<a class="authsearch-link" href="' + escaparAttr(qsUrl) + '" target="_blank" rel="noopener noreferrer">Abrir QuickStatements preparado</a>' +
                            '<button type="button" class="authsearch-btn" id="authsearch-copy-qs" data-qs="' + escaparAttr(qs) + '">Copiar comandos</button>' +
                        '</div>' +
                        '<div class="authsearch-desc authsearch-desc-spaced">Depois de criar o item, volte ao AuthSearch e pesquise novamente o nome. O novo QID poderá então ser aplicado ao 017.</div>' +
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


        function setEstado(msg, erro) {
            var $el = $("#authsearch-state");
            if (!$el.length) return;
            $el.text(msg || "").css("color", erro ? "#b42318" : "#475467");
        }

        function meta(titulo, valor) {
            return '<div class="authsearch-meta"><strong>' + escaparHTML(titulo) + ':</strong> ' + escaparHTML(valor) + '</div>';
        }

        /** Limita e normaliza texto enviado a APIs externas. */
        function normalizarTermoPesquisa(txt) {
            return limparTexto(txt).slice(0, CONFIG.maxTermLength);
        }

        /** Aceita apenas HTTPS e hosts explicitamente autorizados. */
        function sanitizarUrlExterna(valor, hostsPermitidos) {
            try {
                var u = new URL(String(valor || ""), window.location.href);
                if (u.protocol !== "https:") return "";
                var host = u.hostname.toLowerCase();
                var permitido = (hostsPermitidos || []).some(function (h) {
                    h = String(h || "").toLowerCase();
                    return host === h || host.endsWith("." + h);
                });
                return permitido ? u.href : "";
            } catch (_e) {
                return "";
            }
        }


        function limparTexto(txt) {
            return $.trim(String(txt == null ? "" : txt).replace(/\s+/g, " "));
        }

        function limitarTexto(txt, max) {
            txt = limparTexto(txt);
            max = Number(max) || 500;
            return txt.length > max ? txt.slice(0, max) : txt;
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
