<!-- ==========================================================
     BIBLIOTECAS DE OEIRAS
     DISCOVERY HOMEPAGE v5.3
     ----------------------------------------------------------
     AUTOR:
     /opac-authoritiesdetail.pl?authid=116&marc=1

     NOVIDADES:
     KEEP pref=novidades
     KEEP pref=opac_infantil
     KEEP pref=opac_jovem_adulto
     ========================================================== --><link href="https://books.google.com" rel="preconnect" /><link href="https://covers.openlibrary.org" rel="preconnect" /><link href="https://www.wikidata.org" rel="preconnect" /><link href="https://pt.wikipedia.org" rel="preconnect" /><link href="https://commons.wikimedia.org" rel="preconnect" />
<style>

/* ==========================================================
   BASE
   ========================================================== */

#oeiras-discovery-home {
    --odh-lime:#dfe330;
    --odh-lime-dark:#bec51f;
    --odh-blue:#0788a6;
    --odh-blue-dark:#056c84;
    --odh-text:#222a2f;
    --odh-muted:#687278;
    --odh-soft:#f5f6f6;
    --odh-soft-cream:#f5f0e6;
    --odh-radius:18px;

    max-width:1320px;
    margin:34px auto 60px;
    padding:0 20px;
    color:var(--odh-text);
    box-sizing:border-box;
}

#oeiras-discovery-home *,
#oeiras-discovery-home *::before,
#oeiras-discovery-home *::after {
    box-sizing:border-box;
}

#oeiras-discovery-home a {
    text-decoration:none;
}

#oeiras-discovery-home img {
    display:block;
    max-width:100%;
}

#oeiras-discovery-home h2,
#oeiras-discovery-home h3,
#oeiras-discovery-home p {
    margin-top:0;
}

#oeiras-discovery-home .odh-section {
    margin-bottom:34px;
}

#oeiras-discovery-home .odh-heading {
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:20px;
    margin-bottom:16px;
}

#oeiras-discovery-home .odh-heading h2 {
    margin:0;
    color:#263843;
    font-size:1.55rem;
    line-height:1.2;
    font-weight:750;
}

#oeiras-discovery-home .odh-eyebrow {
    margin:0 0 5px;
    color:var(--odh-blue-dark);
    font-size:.74rem;
    font-weight:800;
    letter-spacing:.08em;
    text-transform:uppercase;
}

#oeiras-discovery-home .odh-panel {
    background:#fff;
    border:1px solid rgba(0,0,0,.04);
    border-radius:var(--odh-radius);
}

#oeiras-discovery-home .odh-status {
    width:100%;
    min-height:90px;
    display:flex;
    align-items:center;
    color:var(--odh-muted);
    font-size:.8rem;
}


/* ==========================================================
   TOPO
   ========================================================== */

#oeiras-discovery-home .odh-top-grid {
    display:grid;
    grid-template-columns:1.04fr .96fr;
    gap:26px;
    align-items:stretch;
}


/* ==========================================================
   SETAS
   ========================================================== */

#oeiras-discovery-home .odh-cover-controls,
#oeiras-discovery-home .odh-review-controls {
    display:flex;
    align-items:center;
    gap:6px;
    flex:0 0 auto;
}

#oeiras-discovery-home .odh-cover-nav,
#oeiras-discovery-home .odh-review-nav {
    width:35px;
    height:35px;
    display:inline-flex;
    justify-content:center;
    align-items:center;
    padding:0;

    color:#45616c;
    background:rgba(255,255,255,.9);

    border:1px solid rgba(69,97,108,.28);
    border-radius:8px;

    box-shadow:0 1px 2px rgba(0,0,0,.04);

    font-family:Arial,sans-serif;
    font-size:1.38rem;
    line-height:1;

    cursor:pointer;
}

#oeiras-discovery-home .odh-cover-nav:hover,
#oeiras-discovery-home .odh-review-nav:hover {
    color:var(--odh-blue-dark);
    border-color:rgba(7,136,166,.52);
    background:#fff;
}

#oeiras-discovery-home .odh-cover-nav:disabled,
#oeiras-discovery-home .odh-review-nav:disabled {
    color:rgba(69,97,108,.24);
    border-color:rgba(69,97,108,.12);
    background:rgba(255,255,255,.45);
    cursor:default;
}


/* ==========================================================
   NOVIDADES
   ========================================================== */

#oeiras-discovery-home .odh-new-block {
    min-width:0;
}

#oeiras-discovery-home .odh-new-header h2 {
    margin:0 0 12px;
    color:#263843;
    font-size:1.55rem;
    line-height:1.2;
    font-weight:750;
}

#oeiras-discovery-home .odh-new-toolbar {
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:14px;
    margin-bottom:15px;
}


/* filtros */

#oeiras-discovery-home .odh-new-filters {
    display:inline-flex;
    align-items:center;
    gap:3px;

    padding:4px;

    background:#eef2f3;
    border:1px solid #dde4e6;
    border-radius:999px;
}

#oeiras-discovery-home .odh-new-filter {
    min-height:30px;
    padding:6px 13px;

    color:#52656d;
    background:transparent;

    border:0;
    border-radius:999px;

    font:inherit;
    font-size:.73rem;
    line-height:1;
    font-weight:700;

    white-space:nowrap;
    cursor:pointer;
}

#oeiras-discovery-home .odh-new-filter:hover {
    color:var(--odh-blue-dark);
    background:rgba(255,255,255,.72);
}

#oeiras-discovery-home .odh-new-filter.is-active {
    color:#fff;
    background:#456d79;
    box-shadow:0 1px 4px rgba(38,56,67,.15);
}


/* capas */

#oeiras-discovery-home .odh-new-carousel-wrap {
    width:100%;
    overflow:hidden;
}

#oeiras-discovery-home .odh-new-carousel {
    display:flex;
    gap:16px;

    width:100%;

    overflow-x:auto;
    overflow-y:hidden;

    padding:3px 2px 10px;

    scrollbar-width:none;
    -webkit-overflow-scrolling:touch;
}

#oeiras-discovery-home .odh-new-carousel::-webkit-scrollbar {
    display:none;
}

#oeiras-discovery-home .odh-new-book {
    flex:0 0 calc((100% - 48px)/4);
    min-width:calc((100% - 48px)/4);

    aspect-ratio:2/3;

    overflow:hidden;

    background:#e4e7e8;
    border-radius:7px;

    box-shadow:0 3px 11px rgba(0,0,0,.14);

    transition:
        transform .22s ease,
        box-shadow .22s ease;
}

#oeiras-discovery-home .odh-new-book:hover {
    transform:translateY(-4px);
    box-shadow:0 7px 16px rgba(0,0,0,.19);
}

#oeiras-discovery-home .odh-new-book img {
    width:100%;
    height:100%;
    object-fit:cover;
}


/* ==========================================================
   CARTOGRAFIAS
   ========================================================== */

#oeiras-discovery-home .odh-cartografias {
    position:relative;
    overflow:hidden;

    min-height:100%;
    padding:29px;

    background:
        radial-gradient(
            circle at 85% 15%,
            rgba(202,180,135,.25),
            transparent 36%
        ),
        var(--odh-soft-cream);

    border-radius:var(--odh-radius);
}

#oeiras-discovery-home .odh-cartografias::after {
    content:"";
    position:absolute;

    width:330px;
    height:330px;

    right:-90px;
    top:-90px;

    border:1px solid rgba(135,109,72,.14);
    border-radius:50%;

    pointer-events:none;
}

#oeiras-discovery-home .odh-cartografias > * {
    position:relative;
    z-index:2;
}

#oeiras-discovery-home .odh-cart-header {
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:20px;
}

#oeiras-discovery-home .odh-cartografias h2 {
    margin:0 0 5px;

    color:#202b31;

    font-family:Georgia,"Times New Roman",serif;
    font-size:1.85rem;
    font-weight:500;
}

#oeiras-discovery-home .odh-cartografias h3 {
    margin:0 0 14px;
    color:#3d4b53;
    font-size:.96rem;
}

#oeiras-discovery-home .odh-cartografias p {
    max-width:440px;
    color:#495257;
    font-size:.91rem;
    line-height:1.52;
}

#oeiras-discovery-home .odh-primary-btn {
    display:inline-block;

    padding:10px 17px;

    color:#171717;
    background:var(--odh-lime);

    border-radius:7px;

    font-size:.84rem;
    font-weight:800;
}

#oeiras-discovery-home .odh-primary-btn:hover {
    background:var(--odh-lime-dark);
}

#oeiras-discovery-home .odh-cartografias-action {
    margin-top:7px;
}

#oeiras-discovery-home .odh-koha-carousel-wrap {
    margin-top:25px;
}

#oeiras-discovery-home .odh-koha-carousel {
    display:flex;
    gap:13px;

    overflow-x:auto;
    overflow-y:hidden;

    min-height:165px;

    padding:5px 2px 12px;

    scrollbar-width:none;
    -webkit-overflow-scrolling:touch;
}

#oeiras-discovery-home .odh-koha-carousel::-webkit-scrollbar {
    display:none;
}

#oeiras-discovery-home .odh-carousel-book {
    flex:0 0 102px;

    width:102px;
    aspect-ratio:2/3;

    overflow:hidden;

    background:#e6e8e9;

    border-radius:6px;

    box-shadow:0 3px 10px rgba(0,0,0,.14);
}

#oeiras-discovery-home .odh-carousel-book img {
    width:100%;
    height:100%;
    object-fit:cover;
}


/* ==========================================================
   IDEIAS
   ========================================================== */

#oeiras-discovery-home .odh-ideas {
    display:grid;
    grid-template-columns:repeat(8,1fr);
    gap:10px;
}

#oeiras-discovery-home .odh-idea {
    min-height:78px;

    display:flex;
    align-items:flex-end;

    padding:13px 14px;

    color:#fff;

    border-radius:14px;

    font-weight:750;
}

#oeiras-discovery-home .idea-memory {background:linear-gradient(135deg,#64655f,#242a2d);}
#oeiras-discovery-home .idea-japan {background:linear-gradient(135deg,#ad3836,#302020);}
#oeiras-discovery-home .idea-sea {background:linear-gradient(135deg,#5ea8b6,#194753);}
#oeiras-discovery-home .idea-freedom {background:linear-gradient(135deg,#8a8367,#2e2d24);}
#oeiras-discovery-home .idea-music {background:linear-gradient(135deg,#66463a,#111516);}
#oeiras-discovery-home .idea-science {background:linear-gradient(135deg,#81adb7,#345661);}
#oeiras-discovery-home .idea-lisbon {background:linear-gradient(135deg,#a5825e,#39434b);}
#oeiras-discovery-home .idea-distopia {background:linear-gradient(135deg,#696e70,#181b1c);}


/* ==========================================================
   DESCOBERTA
   ========================================================== */

#oeiras-discovery-home .odh-duo {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:22px;
}

#oeiras-discovery-home .odh-discover,
#oeiras-discovery-home .odh-reader-comments-panel {
    min-height:245px;
    padding:24px;
    background:var(--odh-soft);
}

#oeiras-discovery-home .odh-discover h2 {
    margin-bottom:5px;
    color:#293943;
    font-size:1.18rem;
}

#oeiras-discovery-home .odh-discover > p {
    color:var(--odh-muted);
    font-size:.84rem;
}

#oeiras-discovery-home .odh-moods {
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:10px;
    margin-top:15px;
}

#oeiras-discovery-home .odh-mood {
    min-height:90px;

    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;

    gap:7px;
    padding:10px;

    color:#29363e;
    background:#fff;

    border:1px solid #dce0e2;
    border-radius:12px;

    font:inherit;
    font-size:.78rem;
    font-weight:700;

    cursor:pointer;
}

#oeiras-discovery-home .odh-mood-symbol {
    font-size:1.35rem;
}


/* ==========================================================
   COMENTÁRIOS
   ========================================================== */

#oeiras-discovery-home .odh-reader-comments-panel {
    overflow:hidden;
}

#oeiras-discovery-home .odh-review-header {
    display:flex;
    align-items:flex-start;
    justify-content:space-between;

    gap:20px;
    margin-bottom:15px;
}

#oeiras-discovery-home .odh-review-header h2 {
    margin:0;
    color:#293943;
    font-size:1.2rem;
}

#oeiras-discovery-home .odh-review-carousel-wrap {
    width:100%;
    overflow:hidden;
}

#oeiras-discovery-home .odh-review-carousel {
    display:flex;
    gap:16px;

    width:100%;

    overflow-x:auto;
    overflow-y:hidden;

    padding:2px 0 5px;

    scrollbar-width:none;
}

#oeiras-discovery-home .odh-review-carousel::-webkit-scrollbar {
    display:none;
}

#oeiras-discovery-home .odh-review-card {
    flex:0 0 100%;

    width:100%;
    min-width:100%;

    display:grid;
    grid-template-columns:minmax(0,1fr) 102px;
    gap:22px;
    align-items:center;

    padding:0 4px;
}

#oeiras-discovery-home .odh-review-content {
    min-width:0;
}

#oeiras-discovery-home .odh-review-book-title {
    margin:0 0 5px;

    font-family:Georgia,"Times New Roman",serif;
    font-size:1.42rem;
    line-height:1.15;
    font-weight:500;
}

#oeiras-discovery-home .odh-review-book-title a {
    color:#203a46;
}

#oeiras-discovery-home .odh-review-book-author {
    margin:0 0 13px;
    color:#5f737c;
    font-size:1.08rem;
}

#oeiras-discovery-home .odh-review-text {
    margin:0 0 11px;

    padding:3px 8px 3px 17px;

    color:#465258;

    border-left:4px solid var(--odh-lime);

    font-size:.86rem;
    line-height:1.5;
}

#oeiras-discovery-home .odh-review-read-more {
    margin:-3px 0 9px 17px;
    padding:0;

    color:#55727d;
    background:transparent;

    border:0;

    font:inherit;
    font-size:.71rem;
    font-weight:700;

    cursor:pointer;
}

#oeiras-discovery-home .odh-review-meta {
    margin:0;
    color:#6b7a80;
    font-size:.73rem;
}

#oeiras-discovery-home .odh-review-meta strong {
    color:#465960;
}

#oeiras-discovery-home .odh-review-cover {
    width:102px;
    aspect-ratio:2/3;

    overflow:hidden;

    background:#e1e4e5;

    border-radius:5px;

    box-shadow:0 3px 10px rgba(0,0,0,.15);
}

#oeiras-discovery-home .odh-review-cover img {
    width:100%;
    height:100%;
    object-fit:cover;
}


/* ==========================================================
   AUTOR
   ========================================================== */

#oeiras-discovery-home .odh-feature-grid {
    display:grid;
    grid-template-columns:1.2fr .8fr;
    gap:22px;
}

#oeiras-discovery-home .odh-author-feature {
    display:grid;
    grid-template-columns:230px minmax(0,1fr);

    overflow:hidden;

    min-height:350px;

    background:
        linear-gradient(
            120deg,
            #e7f2f4 0%,
            #f5fafb 100%
        );
}

#oeiras-discovery-home .odh-author-photo {
    position:relative;

    min-height:350px;

    overflow:hidden;

    background:
        linear-gradient(
            135deg,
            #d7e4e7,
            #aabfc5
        );
}

#oeiras-discovery-home .odh-author-photo img {
    width:100%;
    height:100%;
    object-fit:cover;
    object-position:center top;
}

#oeiras-discovery-home .odh-author-photo-loading {
    position:absolute;
    inset:0;

    display:flex;
    align-items:center;
    justify-content:center;
}

#oeiras-discovery-home .odh-author-photo-spinner {
    width:30px;
    height:30px;

    border:3px dotted rgba(30,60,72,.28);
    border-radius:50%;

    animation:odh-spin 2.1s linear infinite;
}

@keyframes odh-spin {
    from {transform:rotate(0deg);}
    to {transform:rotate(360deg);}
}

#oeiras-discovery-home .odh-author-content {
    display:flex;
    flex-direction:column;

    min-width:0;

    padding:27px 28px 18px;
}

#oeiras-discovery-home .odh-author-name-row {
    display:flex;
    align-items:baseline;
    flex-wrap:wrap;

    gap:8px;

    margin:0 0 6px;
}

#oeiras-discovery-home .odh-author-name-row h2 {
    margin:0;

    color:#1e3c48;

    font-family:Georgia,"Times New Roman",serif;
    font-size:2rem;
    line-height:1.08;
    font-weight:500;
}

#oeiras-discovery-home .odh-author-dates {
    color:#62777f;

    font-family:Georgia,"Times New Roman",serif;
    font-size:1.08rem;
}

#oeiras-discovery-home .odh-author-meta {
    min-height:18px;
    margin-bottom:9px;

    color:#6c7d84;

    font-size:.76rem;
}

#oeiras-discovery-home .odh-author-description {
    max-width:620px;

    color:#4a5a60;

    font-size:.87rem;
    line-height:1.5;
}

#oeiras-discovery-home .odh-author-read-more {
    display:none;

    margin-top:3px;
    padding:0;

    color:#58727b;
    background:transparent;

    border:0;

    font:inherit;
    font-size:.72rem;
    font-weight:700;

    cursor:pointer;
}

#oeiras-discovery-home .odh-author-books-title {
    margin:14px 0 8px;

    color:#718187;

    font-size:.68rem;
    font-weight:800;

    letter-spacing:.055em;
    text-transform:uppercase;
}

#oeiras-discovery-home .odh-author-books {
    display:flex;
    gap:10px;

    min-height:102px;

    overflow:hidden;
}

#oeiras-discovery-home .odh-author-book {
    flex:0 0 68px;

    width:68px;
    aspect-ratio:2/3;

    overflow:hidden;

    background:#dce4e6;

    border-radius:4px;

    box-shadow:0 2px 8px rgba(0,0,0,.13);
}

#oeiras-discovery-home .odh-author-book img {
    width:100%;
    height:100%;
    object-fit:cover;
}

#oeiras-discovery-home .odh-author-catalog-link {
    display:inline-flex;
    align-self:flex-start;

    margin-top:11px;

    color:var(--odh-blue);

    font-size:.79rem;
    font-weight:750;
}

#oeiras-discovery-home .odh-author-sources {
    margin-top:8px;

    color:#8a979b;

    font-size:.63rem;
}

#oeiras-discovery-home .odh-author-sources a {
    color:#73858b;
}


/* ==========================================================
   CAMINHOS
   ========================================================== */

#oeiras-discovery-home .odh-paths {
    padding:25px;
    background:#f7f4ec;
}

#oeiras-discovery-home .odh-paths h2 {
    margin-bottom:5px;
    color:#293943;
    font-size:1.18rem;
}

#oeiras-discovery-home .odh-paths > p {
    color:var(--odh-muted);
    font-size:.84rem;
}

#oeiras-discovery-home .odh-paths-body {
    display:grid;
    grid-template-columns:118px 1fr;

    gap:18px;
    align-items:center;

    margin-top:18px;
}

#oeiras-discovery-home .odh-path-cover img {
    width:100%;
    aspect-ratio:2/3;
    object-fit:cover;

    border-radius:5px;

    box-shadow:0 3px 10px rgba(0,0,0,.14);
}

#oeiras-discovery-home .odh-path-list {
    display:flex;
    flex-direction:column;
    gap:8px;
}

#oeiras-discovery-home .odh-path {
    padding:10px 12px;

    color:#28343b;
    background:#fff;

    border:1px solid #e1ddd4;
    border-radius:10px;
}

#oeiras-discovery-home .odh-path strong {
    display:block;
    font-size:.78rem;
}

#oeiras-discovery-home .odh-path small {
    display:block;

    margin-top:2px;

    color:#747b7e;

    font-size:.67rem;
}


/* ==========================================================
   LOWER
   ========================================================== */

#oeiras-discovery-home .odh-lower-grid {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:26px;
}

#oeiras-discovery-home .odh-reading-intro {
    margin:5px 0 0;
    color:var(--odh-muted);
    font-size:.78rem;
    line-height:1.4;
}

#oeiras-discovery-home .odh-reading {
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:14px;
    min-height:126px;
}

#oeiras-discovery-home .odh-reading-card {
    display:grid;
    grid-template-columns:82px minmax(0,1fr);
    gap:10px;
    color:var(--odh-text);
}

#oeiras-discovery-home .odh-reading-card img {
    width:82px;
    aspect-ratio:2/3;
    object-fit:cover;
    background:#e4e7e8;
    border-radius:4px;
    box-shadow:0 2px 7px rgba(0,0,0,.10);
}

#oeiras-discovery-home .odh-reading-card > span {
    min-width:0;
    padding-top:2px;
}

#oeiras-discovery-home .odh-reading-card strong {
    display:block;
    color:#29363e;
    font-size:.8rem;
    line-height:1.25;
}

#oeiras-discovery-home .odh-reading-card small {
    display:block;
    margin-top:4px;
    color:var(--odh-muted);
    font-size:.7rem;
    line-height:1.3;
}

#oeiras-discovery-home .odh-reading-loans {
    color:#7b898e;
}

#oeiras-discovery-home .odh-collections {
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:10px;
}

#oeiras-discovery-home .odh-collection {
    min-height:145px;

    display:flex;
    align-items:flex-end;

    padding:16px;

    color:#fff;

    border-radius:13px;

    font-weight:750;
}

#oeiras-discovery-home .collection-sea {
    background:linear-gradient(140deg,#247b90,#082d3d);
}

#oeiras-discovery-home .collection-distopia {
    background:linear-gradient(140deg,#4c4850,#15171c);
}

#oeiras-discovery-home .collection-japan {
    background:linear-gradient(140deg,#a54239,#251a22);
}

#oeiras-discovery-home .collection-women {
    background:linear-gradient(140deg,#77868c,#282f33);
}


/* ==========================================================
   RESPONSIVO
   ========================================================== */

@media (max-width:1100px) {

    #oeiras-discovery-home .odh-ideas {
        grid-template-columns:repeat(4,1fr);
    }

}

@media (max-width:900px) {

    #oeiras-discovery-home .odh-top-grid,
    #oeiras-discovery-home .odh-duo,
    #oeiras-discovery-home .odh-feature-grid,
    #oeiras-discovery-home .odh-lower-grid {
        grid-template-columns:1fr;
    }

}

@media (max-width:620px) {

    #oeiras-discovery-home {
        padding:0 14px;
    }

    #oeiras-discovery-home .odh-new-toolbar {
        flex-direction:column;
        align-items:flex-start;
    }

    #oeiras-discovery-home .odh-new-filters {
        max-width:100%;
        overflow-x:auto;
    }

    #oeiras-discovery-home .odh-new-book {
        flex:0 0 calc((100% - 24px)/2.25);
        min-width:calc((100% - 24px)/2.25);
    }

    #oeiras-discovery-home .odh-ideas {
        grid-template-columns:repeat(2,1fr);
    }

    #oeiras-discovery-home .odh-author-feature {
        grid-template-columns:1fr;
    }

    #oeiras-discovery-home .odh-author-photo {
        min-height:310px;
    }

    #oeiras-discovery-home .odh-review-card {
        grid-template-columns:minmax(0,1fr) 78px;
        gap:14px;
    }

    #oeiras-discovery-home .odh-review-cover {
        width:78px;
    }

    #oeiras-discovery-home .odh-review-book-title {
        font-size:1.2rem;
    }

    #oeiras-discovery-home .odh-review-book-author {
        font-size:.96rem;
    }

    #oeiras-discovery-home .odh-cover-nav,
    #oeiras-discovery-home .odh-review-nav {
        width:31px;
        height:31px;
    }

}

</style>
<div id="oeiras-discovery-home"><!-- ======================================================
         NOVIDADES + CARTOGRAFIAS
         ====================================================== -->
<section class="odh-section odh-top-grid">
<div class="odh-new-block">
<div class="odh-new-header">
<h2>Novidades no cat&aacute;logo</h2>
</div>
<div class="odh-new-toolbar">
<div class="odh-new-filters" role="group" aria-label="Categorias das novidades"><button class="odh-new-filter is-active" type="button" data-pref="novidades" aria-pressed="true"> Adultos </button> <button class="odh-new-filter" type="button" data-pref="infantil" aria-pressed="false"> Infantil </button> <button class="odh-new-filter" type="button" data-pref="jovens" aria-pressed="false"> Jovens adultos </button></div>
<div class="odh-cover-controls"><button class="odh-cover-nav odh-new-prev" type="button" aria-label="Novidades anteriores"> &lsaquo; </button> <button class="odh-cover-nav odh-new-next" type="button" aria-label="Novidades seguintes"> &rsaquo; </button></div>
</div>
<div class="odh-new-carousel-wrap">
<div class="odh-new-carousel" id="odh-new-books" data-endpoint="/plugin/Koha/Plugin/Pt/KEEPS/OpacLastDocuments/opac-lastdocuments-biblionumbers.pl" data-pref="novidades" data-limit="10"></div>
</div>
</div>
<article class="odh-cartografias">
<div class="odh-cart-header">
<div>
<p class="odh-eyebrow">Cartografias Liter&aacute;rias</p>
<h2>Mediterr&acirc;neo</h2>
</div>
<div class="odh-cover-controls"><button class="odh-cover-nav odh-cart-prev" type="button" aria-label="Livros anteriores"> &lsaquo; </button> <button class="odh-cover-nav odh-cart-next" type="button" aria-label="Livros seguintes"> &rsaquo; </button></div>
</div>
<h3>Escritores de um mar comum</h3>
<p>Entre margens, l&iacute;nguas, mem&oacute;rias e desloca&ccedil;&otilde;es, o Mediterr&acirc;neo como territ&oacute;rio liter&aacute;rio.</p>
<div class="odh-koha-carousel-wrap">
<div class="odh-koha-carousel" id="odh-cartografias-carousel" data-shelf="4877" data-limit="10" data-scan="30"></div>
</div>
<div class="odh-cartografias-action"><a class="odh-primary-btn" href="/cgi-bin/koha/opac-shelves.pl?op=view&amp;shelfnumber=4877"> Explorar a sele&ccedil;&atilde;o </a></div>
</article>
</section>
<!-- ======================================================
         IDEIAS
         ====================================================== -->
<section class="odh-section">
<div class="odh-heading">
<h2>Explore por uma ideia</h2>
</div>
<div class="odh-ideas"><a class="odh-idea idea-memory" href="/cgi-bin/koha/opac-search.pl?q=su%3AMem%C3%B3ria"> Mem&oacute;ria </a> <a class="odh-idea idea-japan" href="/cgi-bin/koha/opac-search.pl?q=su%3AJap%C3%A3o"> Jap&atilde;o </a> <a class="odh-idea idea-sea" href="/cgi-bin/koha/opac-search.pl?q=su%3AMar"> Mar </a> <a class="odh-idea idea-freedom" href="/cgi-bin/koha/opac-search.pl?q=su%3ALiberdade"> Liberdade </a> <a class="odh-idea idea-music" href="/cgi-bin/koha/opac-search.pl?q=su%3AM%C3%BAsica"> M&uacute;sica </a> <a class="odh-idea idea-science" href="/cgi-bin/koha/opac-search.pl?q=su%3ACi%C3%AAncia"> Ci&ecirc;ncia </a> <a class="odh-idea idea-lisbon" href="/cgi-bin/koha/opac-search.pl?q=su%3ALisboa"> Lisboa </a> <a class="odh-idea idea-distopia" href="/cgi-bin/koha/opac-search.pl?q=su%3ADistopia"> Distopia </a></div>
</section>
<!-- ======================================================
         DESCOBERTA + COMENTÁRIOS
         ====================================================== -->
<section class="odh-section odh-duo">
<article class="odh-panel odh-discover">
<h2>N&atilde;o sabe o que ler?</h2>
<p>Escolha um caminho e deixe o cat&aacute;logo fazer o resto.</p>
<div class="odh-moods"><a class="odh-mood" href="/cgi-bin/koha/opac-search.pl?q=su%3AHumor"> <span class="odh-mood-symbol">☺</span> <span>Quero rir</span> </a> <a class="odh-mood" href="/cgi-bin/koha/opac-search.pl?q=su%3AFilosofia"> <span class="odh-mood-symbol">◉</span> <span>Quero pensar</span> </a> <a class="odh-mood" href="/cgi-bin/koha/opac-search.pl?q=su%3AViagens"> <span class="odh-mood-symbol">✈</span> <span>Quero viajar</span> </a> <button class="odh-mood" id="odh-surprise" type="button"> <span class="odh-mood-symbol">⤨</span> <span>Surpreenda-me</span> </button></div>
</article>
<article class="odh-panel odh-reader-comments-panel">
<div class="odh-review-header">
<div>
<p class="odh-eyebrow">Comunidade</p>
<h2>Os leitores dizem</h2>
</div>
<div class="odh-review-controls"><button class="odh-review-nav odh-review-prev" type="button" aria-label="Coment&aacute;rio anterior"> &lsaquo; </button> <button class="odh-review-nav odh-review-next" type="button" aria-label="Coment&aacute;rio seguinte"> &rsaquo; </button></div>
</div>
<div class="odh-review-carousel-wrap">
<div class="odh-review-carousel" id="odh-review-carousel" data-url="/cgi-bin/koha/opac-showreviews.pl" data-limit="5" data-scan="30"></div>
</div>
</article>
</section>
<!-- ======================================================
         AUTOR + CAMINHOS
         ====================================================== -->
<section class="odh-section odh-feature-grid">
<article class="odh-panel odh-author-feature" id="odh-author-feature" data-authid="116" data-books="6" data-scan="40">
<div class="odh-author-photo" id="odh-author-photo">
<div class="odh-author-photo-loading">
<div class="odh-author-photo-spinner"></div>
</div>
</div>
<div class="odh-author-content">
<p class="odh-eyebrow">Autor(a) em destaque</p>
<div class="odh-author-name-row">
<h2 id="odh-author-name">Autor</h2>
<span class="odh-author-dates" id="odh-author-dates"> </span></div>
<div class="odh-author-meta" id="odh-author-meta"></div>
<div>
<div class="odh-author-description" id="odh-author-description"></div>
<button class="odh-author-read-more" id="odh-author-read-more" type="button" aria-expanded="false"> Ler mais </button></div>
<p class="odh-author-books-title">Obras no cat&aacute;logo</p>
<div class="odh-author-books" id="odh-author-books"></div>
<a class="odh-author-catalog-link" id="odh-author-catalog-link" href="#"> Explorar no cat&aacute;logo &rarr; </a>
<div class="odh-author-sources" id="odh-author-sources"></div>
</div>
</article>
<article class="odh-panel odh-paths">
<h2>Uma capa. Tr&ecirc;s caminhos.</h2>
<p>Descubra novas leituras a partir de uma &uacute;nica obra.</p>
<div class="odh-paths-body">
<div class="odh-path-cover"><img src="https://covers.openlibrary.org/b/isbn/9789722534148-L.jpg" loading="lazy" alt="Livro em destaque" /></div>
<div class="odh-path-list"><a class="odh-path" href="#"> <strong>Pelo autor</strong> <small>Outros livros do mesmo autor</small> </a> <a class="odh-path" href="/cgi-bin/koha/opac-search.pl?q=su%3ADistopia"> <strong>Pelo universo</strong> <small>Outras fic&ccedil;&otilde;es relacionadas</small> </a> <a class="odh-path" href="/cgi-bin/koha/opac-search.pl?q=su%3ALiberdade"> <strong>Pelo tema</strong> <small>Poder, liberdade e vigil&acirc;ncia</small> </a></div>
</div>
</article>
</section>
<!-- ======================================================
         LOWER
         ====================================================== -->
<section class="odh-section odh-lower-grid">
<div>
<div class="odh-heading">
<div>
<h2>O que est&aacute; Oeiras a ler?</h2>
<p class="odh-reading-intro">Entre os livros mais emprestados nas Bibliotecas de Oeiras.</p>
</div>
</div>
<div class="odh-reading" id="odh-reading" data-report="/cgi-bin/koha/svc/report?id=846&amp;annotated=1" data-pool="20" data-limit="3"><div class="odh-status">A carregar leituras&hellip;</div></div>
</div>
<div>
<div class="odh-heading">
<h2>Cole&ccedil;&otilde;es para explorar</h2>
</div>
<div class="odh-collections"><a class="odh-collection collection-sea" href="/cgi-bin/koha/opac-search.pl?q=su%3AMar"> Mar </a> <a class="odh-collection collection-distopia" href="/cgi-bin/koha/opac-search.pl?q=su%3ADistopia"> Distopias </a> <a class="odh-collection collection-japan" href="/cgi-bin/koha/opac-search.pl?q=su%3AJap%C3%A3o"> Jap&atilde;o </a> <a class="odh-collection collection-women" href="#"> Mulheres e Ci&ecirc;ncia </a></div>
</div>
</section>
</div>
<script>

(function () {

    "use strict";


    /* ==========================================================
       CACHE
       ========================================================== */

    const recordCache = new Map();
    const scrollAnimations = new WeakMap();



    /* ==========================================================
       UTILITÁRIOS
       ========================================================== */

    function cleanText(value) {

        return String(value || "")
            .replace(/\u00a0/g, " ")
            .replace(/\s+/g, " ")
            .trim();

    }



    function shortenText(text, max) {

        text = cleanText(text);


        if (text.length <= max) {
            return text;
        }


        const partial =
            text.substring(0, max);


        const lastSpace =
            partial.lastIndexOf(" ");


        return (
            partial.substring(
                0,
                lastSpace > 0
                    ? lastSpace
                    : max
            ) +
            "…"
        );

    }



    function uniqueNumeric(values) {

        const seen =
            new Set();


        return values
            .map(String)
            .filter(
                function (value) {

                    if (!/^\d+$/.test(value)) {
                        return false;
                    }


                    if (seen.has(value)) {
                        return false;
                    }


                    seen.add(value);

                    return true;

                }
            );

    }



    function randomInteger(max) {

        if (
            window.crypto &&
            window.crypto.getRandomValues
        ) {

            const values =
                new Uint32Array(1);


            window.crypto.getRandomValues(
                values
            );


            return values[0] % max;

        }


        return Math.floor(
            Math.random() * max
        );

    }



    function shuffleArray(array) {

        const copy =
            array.slice();


        for (
            let i = copy.length - 1;
            i > 0;
            i--
        ) {

            const j =
                randomInteger(i + 1);


            [
                copy[i],
                copy[j]
            ] = [
                copy[j],
                copy[i]
            ];

        }


        return copy;

    }



    /* ==========================================================
       SCROLL
       ========================================================== */

    function animateScroll(
        element,
        target,
        duration
    ) {

        const existing =
            scrollAnimations.get(
                element
            );


        if (existing) {

            cancelAnimationFrame(
                existing
            );

        }


        const max =
            Math.max(
                0,
                element.scrollWidth -
                element.clientWidth
            );


        target =
            Math.max(
                0,
                Math.min(
                    target,
                    max
                )
            );


        const start =
            element.scrollLeft;


        const distance =
            target - start;


        if (
            Math.abs(distance) <
            1
        ) {

            element.scrollLeft =
                target;

            return;

        }


        const startTime =
            performance.now();


        function frame(now) {

            const progress =
                Math.min(
                    (now - startTime) /
                    duration,
                    1
                );


            const eased =
                1 -
                Math.pow(
                    1 - progress,
                    5
                );


            element.scrollLeft =
                start +
                distance *
                eased;


            if (
                progress < 1
            ) {

                scrollAnimations.set(

                    element,

                    requestAnimationFrame(
                        frame
                    )

                );

            } else {

                element.scrollLeft =
                    target;


                scrollAnimations.delete(
                    element
                );

            }

        }


        scrollAnimations.set(

            element,

            requestAnimationFrame(
                frame
            )

        );

    }



    /* ==========================================================
       FETCH
       ========================================================== */

    async function fetchText(
        url,
        options
    ) {

        const response =
            await fetch(
                url,
                Object.assign(
                    {
                        credentials:
                            "same-origin"
                    },
                    options || {}
                )
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status +
                " — " +
                url
            );

        }


        return await response.text();

    }



    async function fetchHTML(
        url,
        options
    ) {

        const text =
            await fetchText(
                url,
                options
            );


        return new DOMParser()
            .parseFromString(
                text,
                "text/html"
            );

    }



    async function fetchJSON(
        url,
        timeout
    ) {

        const controller =
            new AbortController();


        const timer =
            setTimeout(

                function () {
                    controller.abort();
                },

                timeout || 5000

            );


        try {

            const response =
                await fetch(
                    url,
                    {
                        signal:
                            controller.signal
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "HTTP " +
                    response.status
                );

            }


            return await response.json();


        } finally {

            clearTimeout(
                timer
            );

        }

    }



    /* ==========================================================
       DADOS BIBLIOGRÁFICOS
       ========================================================== */

    async function getRecordData(record) {

        if (
            recordCache.has(
                record.bib
            )
        ) {

            return recordCache.get(
                record.bib
            );

        }


        const promise =
            (async function () {

                try {

                    const doc =
                        await fetchHTML(
                            record.url
                        );


                    return {

                        title:
                            extractRecordTitle(
                                doc
                            ),

                        author:
                            extractRecordAuthor(
                                doc
                            ),

                        isbn:
                            extractISBN(
                                doc
                            )

                    };


                } catch (error) {

                    return {
                        title:"",
                        author:"",
                        isbn:""
                    };

                }

            })();


        recordCache.set(
            record.bib,
            promise
        );


        return promise;

    }



    function extractRecordTitle(doc) {

        const selectors = [

            "#catalogue_detail_biblio h1",
            ".biblio-title",
            ".title",
            "main h1"

        ];


        for (
            const selector of selectors
        ) {

            const element =
                doc.querySelector(
                    selector
                );


            if (!element) {
                continue;
            }


            const value =
                cleanText(
                    element.textContent
                );


            if (value) {

                return value.replace(
                    /^Detalhes\s+(?:para|de)\s*:?\s*/i,
                    ""
                );

            }

        }


        return "";

    }



    function extractRecordAuthor(doc) {

        const selectors = [

            "#catalogue_detail_biblio a.author",
            "#catalogue_detail_biblio .author a",
            "a.author",
            ".author"

        ];


        for (
            const selector of selectors
        ) {

            const element =
                doc.querySelector(
                    selector
                );


            if (!element) {
                continue;
            }


            const value =
                cleanText(
                    element.textContent
                );


            if (value) {
                return value;
            }

        }


        return "";

    }



    function extractISBN(doc) {

        const text =
            doc.body
                ? doc.body.textContent
                : "";


        const candidates =
            text.match(
                /(?:97[89][\s-]?)?(?:\d[\s-]?){9}[\dXx]/g
            ) || [];


        for (
            const candidate of candidates
        ) {

            const isbn =
                candidate.replace(
                    /[^0-9Xx]/g,
                    ""
                );


            if (
                isbn.length === 10 ||
                isbn.length === 13
            ) {

                return isbn;

            }

        }


        return "";

    }



    /* ==========================================================
       CAPAS
       ========================================================== */

    function attachSmartCover(
        image,
        record,
        options
    ) {

        options =
            options || {};


        let stage = 0;
        let data = null;
        let finished = false;


        async function fallback() {

            if (finished) {
                return;
            }


            stage += 1;


            try {

                if (stage === 1) {

                    data =
                        await getRecordData(
                            record
                        );


                    if (!data.isbn) {

                        fail();
                        return;

                    }


                    image.src =
                        "https://books.google.com/books/content" +
                        "?vid=ISBN" +
                        encodeURIComponent(
                            data.isbn
                        ) +
                        "&printsec=frontcover" +
                        "&img=1" +
                        "&zoom=1";

                    return;

                }


                if (stage === 2) {

                    if (
                        !data ||
                        !data.isbn
                    ) {

                        fail();
                        return;

                    }


                    image.src =
                        "https://covers.openlibrary.org/b/isbn/" +
                        encodeURIComponent(
                            data.isbn
                        ) +
                        "-L.jpg?default=false";

                    return;

                }


                fail();


            } catch (error) {

                fail();

            }

        }



        function loaded() {

            if (
                image.naturalWidth <= 40 ||
                image.naturalHeight <= 60
            ) {

                fallback();
                return;

            }


            finished = true;


            if (
                typeof options.onSuccess ===
                "function"
            ) {

                options.onSuccess(
                    data
                );

            }

        }



        function fail() {

            finished = true;

            image.onload = null;
            image.onerror = null;


            if (
                typeof options.onFail ===
                "function"
            ) {

                options.onFail();

            }

        }


        image.onload =
            loaded;


        image.onerror =
            fallback;


        image.decoding =
            "async";


        image.loading =
            options.eager
                ? "eager"
                : "lazy";


        image.src =
            "/cgi-bin/koha/opac-image.pl" +
            "?biblionumber=" +
            encodeURIComponent(
                record.bib
            );

    }



    /* ==========================================================
       KEEP
       ========================================================== */

    function parseKeepResponse(raw) {

        raw =
            String(raw || "")
                .trim();


        if (!raw) {
            return [];
        }


        const found = [];


        /*
         * JSON
         */

        try {

            const json =
                JSON.parse(
                    raw
                );


            function inspect(value) {

                if (
                    value === null ||
                    value === undefined
                ) {
                    return;
                }


                if (
                    Array.isArray(value)
                ) {

                    value.forEach(
                        inspect
                    );

                    return;

                }


                if (
                    typeof value === "object"
                ) {

                    Object.keys(value)
                        .forEach(
                            function (key) {

                                if (
                                    /^(?:bib|biblionumber)$/i.test(
                                        key
                                    )
                                ) {

                                    const bib =
                                        String(
                                            value[key] || ""
                                        );


                                    if (
                                        /^\d+$/.test(
                                            bib
                                        )
                                    ) {

                                        found.push(
                                            bib
                                        );

                                    }

                                }


                                if (
                                    /^(?:bibs|biblionumbers|items|records|results)$/i.test(
                                        key
                                    )
                                ) {

                                    inspect(
                                        value[key]
                                    );

                                }

                            }
                        );

                }

            }


            inspect(
                json
            );


            if (found.length) {

                return uniqueNumeric(
                    found
                );

            }


        } catch (error) {
            /* não é JSON */
        }


        /*
         * HTML
         */

        if (
            /<[a-z][\s\S]*>/i.test(
                raw
            )
        ) {

            const doc =
                new DOMParser()
                    .parseFromString(
                        raw,
                        "text/html"
                    );


            doc
                .querySelectorAll(
                    'a[href*="biblionumber="]'
                )
                .forEach(
                    function (link) {

                        const href =
                            link.getAttribute(
                                "href"
                            ) || "";


                        const match =
                            href.match(
                                /biblionumber=(\d+)/i
                            );


                        if (match) {

                            found.push(
                                match[1]
                            );

                        }

                    }
                );


            doc
                .querySelectorAll(
                    "[data-biblionumber]"
                )
                .forEach(
                    function (element) {

                        const bib =
                            element.getAttribute(
                                "data-biblionumber"
                            );


                        if (
                            /^\d+$/.test(
                                bib || ""
                            )
                        ) {

                            found.push(
                                bib
                            );

                        }

                    }
                );


            return uniqueNumeric(
                found
            );

        }


        /*
         * Texto simples
         */

        if (
            /^[\d\s,;|\[\]"']+$/.test(
                raw
            )
        ) {

            return uniqueNumeric(
                raw.match(/\d+/g) || []
            );

        }


        return [];

    }



    async function getKeepBiblionumbers(
        endpoint,
        pref
    ) {

        const raw =
            await fetchText(

                endpoint +
                "?pref=" +
                encodeURIComponent(
                    pref
                ),

                {
                    cache:
                        "no-store"
                }

            );


        return parseKeepResponse(
            raw
        );

    }



    /* ==========================================================
       RENDER CAPAS
       ========================================================== */

    function renderCoverCarousel(
        container,
        records,
        className,
        eagerCount
    ) {

        container.innerHTML =
            "";


        records.forEach(
            function (
                record,
                index
            ) {

                const link =
                    document.createElement(
                        "a"
                    );


                link.className =
                    className;


                link.href =
                    record.url;


                const image =
                    document.createElement(
                        "img"
                    );


                image.alt =
                    "Capa do livro";


                attachSmartCover(
                    image,
                    record,
                    {

                        eager:
                            index < eagerCount,

                        onSuccess:
                            function (data) {

                                if (
                                    data &&
                                    data.title
                                ) {

                                    link.title =
                                        data.title;

                                }

                            },

                        onFail:
                            function () {

                                link.remove();

                            }

                    }
                );


                link.appendChild(
                    image
                );


                container.appendChild(
                    link
                );

            }
        );


        container.scrollLeft = 0;

    }



    /* ==========================================================
       NOVIDADES
       ========================================================== */

    async function initNewBooks() {

        const carousel =
            document.getElementById(
                "odh-new-books"
            );


        if (!carousel) {
            return;
        }


        const block =
            carousel.closest(
                ".odh-new-block"
            );


        const filters =
            Array.from(
                block.querySelectorAll(
                    ".odh-new-filter"
                )
            );


        const endpoint =
            carousel.dataset.endpoint;


        const limit =
            parseInt(
                carousel.dataset.limit || "10",
                10
            );


        let activePref =
            carousel.dataset.pref ||
            "novidades";


        let requestId = 0;


        async function load(pref) {

            activePref =
                pref;


            const currentRequest =
                ++requestId;


            filters.forEach(
                function (button) {

                    const active =
                        button.dataset.pref ===
                        pref;


                    button.classList.toggle(
                        "is-active",
                        active
                    );


                    button.setAttribute(
                        "aria-pressed",
                        active
                            ? "true"
                            : "false"
                    );

                }
            );


            carousel.innerHTML =
                '<div class="odh-status">A carregar novidades…</div>';


            try {

                const bibs =
                    await getKeepBiblionumbers(
                        endpoint,
                        pref
                    );


                if (
                    currentRequest !==
                    requestId
                ) {

                    return;

                }


                if (!bibs.length) {

                    carousel.innerHTML =
                        '<div class="odh-status">' +
                        'Não existem novidades disponíveis neste momento.' +
                        '</div>';

                    return;

                }


                const records =
                    bibs
                        .slice(
                            0,
                            limit
                        )
                        .map(
                            function (bib) {

                                return {

                                    bib:
                                        bib,

                                    url:
                                        "/cgi-bin/koha/opac-detail.pl" +
                                        "?biblionumber=" +
                                        encodeURIComponent(
                                            bib
                                        )

                                };

                            }
                        );


                renderCoverCarousel(
                    carousel,
                    records,
                    "odh-new-book",
                    4
                );


                setupNewNavigation(
                    carousel
                );


            } catch (error) {

                console.error(
                    "[ODH] Novidades KEEP:",
                    error
                );


                if (
                    currentRequest ===
                    requestId
                ) {

                    carousel.innerHTML =
                        '<div class="odh-status">' +
                        'Não foi possível carregar as novidades neste momento.' +
                        '</div>';

                }

            }

        }


        filters.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const pref =
                            button.dataset.pref;


                        if (
                            pref &&
                            pref !== activePref
                        ) {

                            load(
                                pref
                            );

                        }

                    }
                );

            }
        );


        load(
            activePref
        );

    }



    function setupNewNavigation(
        carousel
    ) {

        const block =
            carousel.closest(
                ".odh-new-block"
            );


        const prev =
            block.querySelector(
                ".odh-new-prev"
            );


        const next =
            block.querySelector(
                ".odh-new-next"
            );


        let index = 0;


        function cards() {

            return Array.from(
                carousel.querySelectorAll(
                    ".odh-new-book"
                )
            );

        }


        function visibleCount() {

            return window.matchMedia(
                "(max-width:620px)"
            ).matches
                ? 2
                : 4;

        }


        function maxIndex() {

            return Math.max(
                0,
                cards().length -
                visibleCount()
            );

        }


        function update() {

            prev.disabled =
                index <= 0;


            next.disabled =
                index >=
                maxIndex();

        }


        function goTo(value) {

            const list =
                cards();


            index =
                Math.max(
                    0,
                    Math.min(
                        value,
                        maxIndex()
                    )
                );


            if (!list[index]) {
                return;
            }


            animateScroll(
                carousel,
                list[index].offsetLeft -
                list[0].offsetLeft,
                800
            );


            update();

        }


        prev.onclick =
            function () {

                goTo(
                    index - 1
                );

            };


        next.onclick =
            function () {

                goTo(
                    index + 1
                );

            };


        setTimeout(
            update,
            100
        );

    }



    /* ==========================================================
       EXTRAIR BIBLIONUMBERS
       ========================================================== */

    function extractBiblionumbers(
        doc,
        limit
    ) {

        const records = [];
        const seen = new Set();


        const links =
            doc.querySelectorAll(
                'a[href*="biblionumber="]'
            );


        for (
            const link of links
        ) {

            const href =
                link.getAttribute(
                    "href"
                ) || "";


            const match =
                href.match(
                    /biblionumber=(\d+)/
                );


            if (!match) {
                continue;
            }


            const bib =
                match[1];


            if (
                seen.has(
                    bib
                )
            ) {
                continue;
            }


            seen.add(
                bib
            );


            records.push({

                bib:
                    bib,

                url:
                    "/cgi-bin/koha/opac-detail.pl" +
                    "?biblionumber=" +
                    encodeURIComponent(
                        bib
                    )

            });


            if (
                records.length >=
                limit
            ) {
                break;
            }

        }


        return records;

    }



    /* ==========================================================
       CARTOGRAFIAS
       ========================================================== */

    async function initCartografias() {

        const carousel =
            document.getElementById(
                "odh-cartografias-carousel"
            );


        if (!carousel) {
            return;
        }


        carousel.innerHTML =
            '<div class="odh-status">A carregar seleção…</div>';


        try {

            const doc =
                await fetchHTML(

                    "/cgi-bin/koha/opac-shelves.pl" +
                    "?op=view&shelfnumber=" +
                    encodeURIComponent(
                        carousel.dataset.shelf
                    )

                );


            const records =
                extractBiblionumbers(
                    doc,
                    parseInt(
                        carousel.dataset.scan || "30",
                        10
                    )
                )
                .slice(
                    0,
                    parseInt(
                        carousel.dataset.limit || "10",
                        10
                    )
                );


            renderCoverCarousel(
                carousel,
                records,
                "odh-carousel-book",
                5
            );


            setupCartNavigation(
                carousel
            );


        } catch (error) {

            console.error(
                "[ODH] Cartografias:",
                error
            );


            carousel.innerHTML =
                '<div class="odh-status">' +
                'Não foi possível carregar esta seleção.' +
                '</div>';

        }

    }



    function setupCartNavigation(
        carousel
    ) {

        const block =
            carousel.closest(
                ".odh-cartografias"
            );


        const prev =
            block.querySelector(
                ".odh-cart-prev"
            );


        const next =
            block.querySelector(
                ".odh-cart-next"
            );


        function update() {

            const max =
                Math.max(
                    0,
                    carousel.scrollWidth -
                    carousel.clientWidth
                );


            prev.disabled =
                carousel.scrollLeft <= 3;


            next.disabled =
                carousel.scrollLeft >=
                max - 3;

        }


        function move(direction) {

            const card =
                carousel.querySelector(
                    ".odh-carousel-book"
                );


            const step =
                card
                    ? (
                        card.getBoundingClientRect().width +
                        13
                    ) * 1.45
                    : 165;


            animateScroll(
                carousel,
                carousel.scrollLeft +
                step *
                direction,
                1150
            );

        }


        prev.onclick =
            function () {

                move(-1);

            };


        next.onclick =
            function () {

                move(1);

            };


        carousel.addEventListener(
            "scroll",
            update,
            {
                passive:true
            }
        );


        setTimeout(
            update,
            100
        );

    }



    /* ==========================================================
       COMENTÁRIOS
       ========================================================== */

    async function initReviews() {

        const carousel =
            document.getElementById(
                "odh-review-carousel"
            );


        if (!carousel) {
            return;
        }


        carousel.innerHTML =
            '<div class="odh-status">A carregar comentários…</div>';


        try {

            const doc =
                await fetchHTML(
                    carousel.dataset.url
                );


            const scan =
                parseInt(
                    carousel.dataset.scan || "30",
                    10
                );


            const limit =
                parseInt(
                    carousel.dataset.limit || "5",
                    10
                );


            const reviews =
                extractReviews(
                    doc
                )
                .filter(
                    function (review) {

                        return (
                            review.bib &&
                            review.comment
                        );

                    }
                )
                .sort(
                    function (a,b) {

                        return (
                            b.timestamp -
                            a.timestamp
                        );

                    }
                )
                .slice(
                    0,
                    scan
                )
                .slice(
                    0,
                    limit
                );


            renderReviews(
                carousel,
                reviews
            );


            setupReviewNavigation(
                carousel
            );


        } catch (error) {

            console.error(
                "[ODH] Comentários:",
                error
            );


            carousel.innerHTML =
                '<div class="odh-status">' +
                'Não foi possível carregar os comentários neste momento.' +
                '</div>';

        }

    }



    function extractReviews(doc) {

        return Array.from(
            doc.querySelectorAll(
                "#showreviews tbody tr"
            )
        )
        .map(
            function (row) {

                const titleLink =
                    row.querySelector(
                        "a.title"
                    );


                const href =
                    titleLink
                        ? titleLink.getAttribute(
                            "href"
                        ) || ""
                        : "";


                const bibMatch =
                    href.match(
                        /biblionumber=(\d+)/
                    );


                const bib =
                    bibMatch
                        ? bibMatch[1]
                        : "";


                const titleElement =
                    row.querySelector(
                        ".biblio-title"
                    );


                const authorElement =
                    row.querySelector(
                        "a.author"
                    );


                const line =
                    row.querySelector(
                        ".commentline"
                    );


                let comment =
                    "";


                if (line) {

                    const clone =
                        line.cloneNode(
                            true
                        );


                    const commenter =
                        clone.querySelector(
                            ".commenter"
                        );


                    if (commenter) {
                        commenter.remove();
                    }


                    comment =
                        cleanText(
                            clone.textContent
                        )
                        .replace(
                            /^["“]\s*/,
                            ""
                        )
                        .replace(
                            /\s*["”]\s*$/,
                            ""
                        );

                }


                const meta =
                    parseCommenter(

                        line
                            ? line.querySelector(
                                ".commenter"
                            )
                            : null

                    );


                return {

                    bib:
                        bib,

                    title:
                        titleElement
                            ? cleanText(
                                titleElement.textContent
                            )
                            : "",

                    author:
                        authorElement
                            ? cleanText(
                                authorElement.textContent
                            )
                            : "",

                    comment:
                        comment,

                    reader:
                        meta.name,

                    rawDate:
                        meta.rawDate,

                    timestamp:
                        meta.timestamp,

                    recordURL:
                        "/cgi-bin/koha/opac-detail.pl" +
                        "?biblionumber=" +
                        encodeURIComponent(
                            bib
                        )

                };

            }
        );

    }



    function parseCommenter(commenter) {

        if (!commenter) {

            return {
                name:"",
                rawDate:"",
                timestamp:0
            };

        }


        const text =
            cleanText(
                commenter.textContent
            );


        const dateMatch =
            text.match(
                /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/
            );


        let rawDate = "";
        let timestamp = 0;


        if (dateMatch) {

            const day =
                parseInt(
                    dateMatch[1],
                    10
                );


            const month =
                parseInt(
                    dateMatch[2],
                    10
                );


            const year =
                parseInt(
                    dateMatch[3],
                    10
                );


            rawDate =
                String(day).padStart(2,"0") +
                "/" +
                String(month).padStart(2,"0") +
                "/" +
                year;


            timestamp =
                new Date(
                    year,
                    month - 1,
                    day
                )
                .getTime();

        }


        let name =
            text.replace(

                /(?:Adicionado\s+(?:(?:em|a)\s+)?\d{1,2}\/\d{1,2}\/\d{4}\s+por\s*)+/gi,

                ""

            );


        name =
            name
                .replace(
                    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/ig,
                    ""
                )
                .replace(
                    /^["“'‘]\s*/,
                    ""
                )
                .replace(
                    /\s*["”'’]\s*$/,
                    ""
                )
                .trim();


        return {

            name:
                cleanText(
                    name
                ),

            rawDate:
                rawDate,

            timestamp:
                timestamp

        };

    }



    function renderReviews(
        carousel,
        reviews
    ) {

        carousel.innerHTML =
            "";


        if (!reviews.length) {

            carousel.innerHTML =
                '<div class="odh-status">' +
                'Ainda não existem comentários disponíveis.' +
                '</div>';

            return;

        }


        reviews.forEach(
            function (
                review,
                index
            ) {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "odh-review-card";


                const content =
                    document.createElement(
                        "div"
                    );


                content.className =
                    "odh-review-content";


                const title =
                    document.createElement(
                        "h3"
                    );


                title.className =
                    "odh-review-book-title";


                const titleLink =
                    document.createElement(
                        "a"
                    );


                titleLink.href =
                    review.recordURL;


                titleLink.textContent =
                    review.title ||
                    "Ver registo";


                title.appendChild(
                    titleLink
                );


                content.appendChild(
                    title
                );


                if (review.author) {

                    const author =
                        document.createElement(
                            "p"
                        );


                    author.className =
                        "odh-review-book-author";


                    author.textContent =
                        review.author;


                    content.appendChild(
                        author
                    );

                }


                appendExpandableReview(
                    content,
                    review.comment
                );


                const meta =
                    document.createElement(
                        "p"
                    );


                meta.className =
                    "odh-review-meta";


                meta.appendChild(
                    document.createTextNode(

                        review.rawDate
                            ? "Adicionado a " +
                              review.rawDate
                            : "Adicionado"

                    )
                );


                if (review.reader) {

                    meta.appendChild(
                        document.createTextNode(
                            " por "
                        )
                    );


                    const strong =
                        document.createElement(
                            "strong"
                        );


                    strong.textContent =
                        review.reader;


                    meta.appendChild(
                        strong
                    );

                }


                content.appendChild(
                    meta
                );


                const cover =
                    document.createElement(
                        "a"
                    );


                cover.className =
                    "odh-review-cover";


                cover.href =
                    review.recordURL;


                const image =
                    document.createElement(
                        "img"
                    );


                image.alt =
                    review.title
                        ? "Capa de " +
                          review.title
                        : "Capa do livro";


                attachSmartCover(
                    image,
                    {
                        bib:
                            review.bib,

                        url:
                            review.recordURL
                    },
                    {

                        eager:
                            index === 0,

                        onFail:
                            function () {

                                cover.style.visibility =
                                    "hidden";

                            }

                    }
                );


                cover.appendChild(
                    image
                );


                card.appendChild(
                    content
                );


                card.appendChild(
                    cover
                );


                carousel.appendChild(
                    card
                );

            }
        );


        carousel.scrollLeft =
            0;

    }



    function appendExpandableReview(
        content,
        fullText
    ) {

        const limit =
            280;


        const preview =
            shortenText(
                fullText,
                limit
            );


        const quote =
            document.createElement(
                "blockquote"
            );


        quote.className =
            "odh-review-text";


        const span =
            document.createElement(
                "span"
            );


        span.textContent =
            "“" +
            preview +
            "”";


        quote.appendChild(
            span
        );


        content.appendChild(
            quote
        );


        if (
            fullText.length <=
            limit
        ) {
            return;
        }


        const button =
            document.createElement(
                "button"
            );


        button.className =
            "odh-review-read-more";


        button.type =
            "button";


        button.textContent =
            "Ler mais";


        let expanded =
            false;


        button.onclick =
            function () {

                expanded =
                    !expanded;


                span.textContent =
                    "“" +
                    (
                        expanded
                            ? fullText
                            : preview
                    ) +
                    "”";


                button.textContent =
                    expanded
                        ? "Ler menos"
                        : "Ler mais";

            };


        content.appendChild(
            button
        );

    }



    function setupReviewNavigation(
        carousel
    ) {

        const panel =
            carousel.closest(
                ".odh-reader-comments-panel"
            );


        const prev =
            panel.querySelector(
                ".odh-review-prev"
            );


        const next =
            panel.querySelector(
                ".odh-review-next"
            );


        const cards =
            Array.from(
                carousel.querySelectorAll(
                    ".odh-review-card"
                )
            );


        if (!cards.length) {

            prev.disabled = true;
            next.disabled = true;

            return;

        }


        let index =
            0;


        function targetFor(card) {

            const raw =
                card.offsetLeft -
                cards[0].offsetLeft;


            const max =
                Math.max(
                    0,
                    carousel.scrollWidth -
                    carousel.clientWidth
                );


            return Math.max(
                0,
                Math.min(
                    raw,
                    max
                )
            );

        }


        function update() {

            prev.disabled =
                index <= 0;


            next.disabled =
                index >=
                cards.length - 1;

        }


        prev.onclick =
            function () {

                index =
                    Math.max(
                        0,
                        index - 1
                    );


                animateScroll(
                    carousel,
                    targetFor(
                        cards[index]
                    ),
                    800
                );


                update();

            };


        next.onclick =
            function () {

                index =
                    Math.min(
                        cards.length - 1,
                        index + 1
                    );


                animateScroll(
                    carousel,
                    targetFor(
                        cards[index]
                    ),
                    800
                );


                update();

            };


        update();

    }



    /* ==========================================================
       AUTOR — IMPLEMENTAÇÃO FUNCIONAL RESTAURADA
       ----------------------------------------------------------
       Este módulo fica deliberadamente isolado para que os seus
       helpers não alterem nenhuma das restantes funcionalidades.
       A lógica interna é a da versão funcional fornecida:
       autoridade normal + ?marc=1, 200, 017 Wikidata,
       Wikidata/Wikipédia/Commons e obras do catálogo.
       ========================================================== */

    function initAuthor() {

        async function initAuthorFeature() {

            const widget =
                document.getElementById(
                    "odh-author-feature"
                );


            if (!widget) {
                return;
            }


            const authid =
                String(
                    widget.dataset.authid ||
                    ""
                ).trim();


            const booksLimit =
                parseInt(
                    widget.dataset.books ||
                    "6",
                    10
                );


            if (!authid) {
                return;
            }



            const normalAuthorityURL =
                "/cgi-bin/koha/opac-authoritiesdetail.pl" +

                "?authid=" +

                encodeURIComponent(
                    authid
                );



            const marcAuthorityURL =
                "/cgi-bin/koha/opac-authoritiesdetail.pl" +

                "?marc=1&authid=" +

                encodeURIComponent(
                    authid
                );


            try {

                const docs =
                    await Promise.all([

                        fetchHTML(
                            normalAuthorityURL
                        ),

                        fetchHTML(
                            marcAuthorityURL
                        )

                    ]);


                const normalDoc =
                    docs[0];


                const marcDoc =
                    docs[1];



                const authority =
                    extractAuthority200(
                        marcDoc
                    );



                const displayName =
                    authority.displayName ||

                    cleanAuthorityHeading(
                        extractAuthorityHeading(
                            normalDoc
                        )
                    );


                if (displayName) {

                    setAuthorName(
                        displayName
                    );

                }



                const qid =
                    extractWikidataFrom017(
                        marcDoc
                    );



                const catalogSearchName =
                    authority.searchName ||
                    displayName;



                const catalogURL =
                    buildAuthorSearch(
                        catalogSearchName
                    );



                const catalogLink =
                    document.getElementById(
                        "odh-author-catalog-link"
                    );


                if (catalogLink) {

                    catalogLink.href =
                        catalogURL;

                }



                const tasks =
                    [];


                if (qid) {

                    tasks.push(

                        loadAndRenderExternalAuthorData(
                            qid,
                            displayName
                        )

                    );

                } else {

                    clearAuthorExternalData();

                }



                /*
                 * As obras são agora escolhidas
                 * aleatoriamente.
                 */

                tasks.push(

                    loadAndRenderAuthorBooks(
                        catalogURL,
                        booksLimit
                    )

                );


                await Promise.allSettled(
                    tasks
                );


            } catch (error) {

                console.error(
                    "[ODH] Autor:",
                    error
                );


                clearAuthorExternalData();

            }

        }



        /* ==========================================================
           AUTORIDADE 200
           ========================================================== */

        function extractAuthority200(
            doc
        ) {

            const result = {

                surname:
                    "",

                forenames:
                    "",

                dates:
                    "",

                displayName:
                    "",

                searchName:
                    ""

            };


            const rows =
                doc.querySelectorAll(
                    "tr, .tag, .marc_line, li"
                );


            for (
                const row of rows
            ) {

                const text =
                    cleanText(
                        row.textContent
                    );


                if (
                    !/^200\b/.test(
                        text
                    )
                ) {

                    continue;

                }


                const surname =
                    extractSubfieldFromText(
                        text,
                        "a"
                    );


                const forenames =
                    extractSubfieldFromText(
                        text,
                        "b"
                    );


                const dates =
                    extractSubfieldFromText(
                        text,
                        "f"
                    );


                result.surname =
                    cleanText(
                        surname
                    );


                result.forenames =
                    cleanText(
                        forenames
                    );


                result.dates =
                    cleanDates(
                        dates
                    );


                result.displayName =
                    cleanText(

                        [
                            result.forenames,
                            result.surname
                        ]
                        .filter(Boolean)
                        .join(" ")

                    );


                if (
                    result.surname &&
                    result.forenames
                ) {

                    result.searchName =
                        result.surname +
                        ", " +
                        result.forenames;

                } else {

                    result.searchName =
                        result.surname ||
                        result.forenames ||
                        "";

                }


                return result;

            }


            return result;

        }



        /* ==========================================================
           SUBCAMPOS
           ========================================================== */

        function extractSubfieldFromText(
            text,
            code
        ) {

            const regex =
                new RegExp(
                    "\\$" +
                    code +
                    "\\s*" +
                    "([^$]+)",
                    "i"
                );


            const match =
                text.match(
                    regex
                );


            if (!match) {
                return "";
            }


            return cleanText(
                match[1]
            );

        }



        function cleanDates(
            value
        ) {

            return cleanText(
                value
            )
            .replace(
                /[,.]\s*$/,
                ""
            );

        }



        /* ==========================================================
           CABEÇALHO FALLBACK
           ========================================================== */

        function extractAuthorityHeading(
            doc
        ) {

            const selectors = [

                "#auth_detail h1",

                "#authorities_detail h1",

                ".authheading",

                "main h1",

                "h1"

            ];


            for (
                const selector of selectors
            ) {

                const element =
                    doc.querySelector(
                        selector
                    );


                if (!element) {
                    continue;
                }


                const value =
                    cleanText(
                        element.textContent
                    );


                if (value) {

                    return value;

                }

            }


            return "";

        }



        function cleanAuthorityHeading(
            value
        ) {

            let text =
                cleanText(
                    value
                );


            text =
                text.replace(
                    /^Detalhes\s+(?:para|de)\s*:?\s*/i,
                    ""
                );


            text =
                text.replace(
                    /^Autoridade\s*:?\s*/i,
                    ""
                );


            text =
                text.replace(
                    /\s*\([^)]*(?:Pessoa|Autor|Authority)[^)]*\)\s*$/i,
                    ""
                );


            text =
                text.replace(
                    /\s*,?\s*\d{4}\s*-\s*(?:\d{4})?\s*$/,
                    ""
                );


            return cleanText(
                text
            );

        }



        /* ==========================================================
           017 WIKIDATA
           ========================================================== */

        function extractWikidataFrom017(
            doc
        ) {

            const rows =
                doc.querySelectorAll(
                    "tr, .tag, .marc_line, li"
                );


            for (
                const row of rows
            ) {

                const text =
                    cleanText(
                        row.textContent
                    );


                if (
                    !/^017\b/.test(
                        text
                    )
                ) {

                    continue;

                }


                if (
                    !/wikidata/i.test(
                        text
                    )
                ) {

                    continue;

                }


                const match =
                    text.match(
                        /\bQ\d+\b/i
                    );


                if (match) {

                    return match[0]
                        .toUpperCase();

                }

            }



            const text =
                cleanText(

                    doc.body
                        ? doc.body.textContent
                        : ""

                );


            let match =
                text.match(
                    /017.{0,500}wikidata.{0,300}\b(Q\d+)\b/i
                );


            if (match) {

                return match[1]
                    .toUpperCase();

            }


            match =
                text.match(
                    /017.{0,500}\b(Q\d+)\b.{0,300}wikidata/i
                );


            if (match) {

                return match[1]
                    .toUpperCase();

            }


            return "";

        }



        /* ==========================================================
           PESQUISA AUTOR
           ========================================================== */

        function buildAuthorSearch(
            authorityName
        ) {

            return (
                "/cgi-bin/koha/opac-search.pl" +

                "?idx=au" +

                "&q=" +

                encodeURIComponent(
                    authorityName
                )
            );

        }



        /* ==========================================================
           WIKIDATA
           ========================================================== */

        async function loadAndRenderExternalAuthorData(
            qid,
            fallbackName
        ) {

            try {

                const data =
                    await loadWikidataAuthor(
                        qid
                    );


                renderExternalAuthorData(
                    data,
                    fallbackName
                );


            } catch (error) {

                console.error(
                    "[ODH] Wikidata/Wikipédia:",
                    error
                );


                clearAuthorExternalData();


                renderExternalSources({

                    qid:
                        qid,

                    wikipediaTitle:
                        ""

                });

            }

        }



        async function loadWikidataAuthor(
            qid
        ) {

            const url =
                "https://www.wikidata.org/w/api.php" +

                "?action=wbgetentities" +

                "&ids=" +
                encodeURIComponent(
                    qid
                ) +

                "&props=labels|descriptions|claims|sitelinks" +

                "&languages=pt|en" +

                "&format=json" +

                "&origin=*";


            const response =
                await fetch(
                    url,
                    {
                        cache:
                            "default"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Wikidata HTTP " +
                    response.status
                );

            }


            const json =
                await response.json();


            const entity =
                json.entities &&
                json.entities[qid];


            if (!entity) {

                throw new Error(
                    "Entidade Wikidata não encontrada."
                );

            }



            const label =
                getLanguageValue(
                    entity.labels
                );


            const description =
                getLanguageValue(
                    entity.descriptions
                );


            const birth =
                getClaimYear(
                    entity,
                    "P569"
                );


            const death =
                getClaimYear(
                    entity,
                    "P570"
                );


            const imageFile =
                getClaimString(
                    entity,
                    "P18"
                );


            const countryIDs =
                getClaimEntityIDs(
                    entity,
                    "P27"
                );


            const occupationIDs =
                getClaimEntityIDs(
                    entity,
                    "P106"
                )
                .slice(
                    0,
                    2
                );


            const allIDs =
                Array.from(
                    new Set(
                        countryIDs.concat(
                            occupationIDs
                        )
                    )
                );


            let labels =
                {};


            if (
                allIDs.length
            ) {

                labels =
                    await getWikidataLabels(
                        allIDs
                    );

            }


            const countries =
                countryIDs
                    .map(

                        function (id) {

                            return labels[id] ||
                                "";

                        }

                    )
                    .filter(Boolean);


            const occupations =
                occupationIDs
                    .map(

                        function (id) {

                            return labels[id] ||
                                "";

                        }

                    )
                    .filter(Boolean);



            const wikipediaTitle =
                entity.sitelinks &&
                entity.sitelinks.ptwiki

                    ? entity.sitelinks.ptwiki.title

                    : "";


            let wikipediaExtract =
                "";


            if (
                wikipediaTitle
            ) {

                try {

                    wikipediaExtract =
                        await getWikipediaExtract(
                            wikipediaTitle
                        );

                } catch (error) {

                    console.warn(
                        "[ODH] Wikipédia:",
                        error
                    );

                }

            }



            let imageURL =
                "";


            if (
                imageFile
            ) {

                try {

                    imageURL =
                        await getCommonsThumbnail(
                            imageFile,
                            650
                        );

                } catch (error) {

                    console.warn(
                        "[ODH] Commons:",
                        error
                    );

                }

            }


            return {

                qid:
                    qid,

                label:
                    label,

                description:
                    description,

                birth:
                    birth,

                death:
                    death,

                countries:
                    countries,

                occupations:
                    occupations,

                imageURL:
                    imageURL,

                wikipediaTitle:
                    wikipediaTitle,

                wikipediaExtract:
                    wikipediaExtract

            };

        }



        /* ==========================================================
           LABELS WIKIDATA
           ========================================================== */

        async function getWikidataLabels(
            ids
        ) {

            if (
                !ids.length
            ) {

                return {};

            }


            const url =
                "https://www.wikidata.org/w/api.php" +

                "?action=wbgetentities" +

                "&ids=" +
                encodeURIComponent(
                    ids.join("|")
                ) +

                "&props=labels" +

                "&languages=pt|en" +

                "&format=json" +

                "&origin=*";


            const response =
                await fetch(
                    url
                );


            if (!response.ok) {

                return {};

            }


            const json =
                await response.json();


            const result =
                {};


            Object.keys(
                json.entities ||
                {}
            ).forEach(

                function (id) {

                    result[id] =
                        getLanguageValue(
                            json
                                .entities[id]
                                .labels
                        );

                }

            );


            return result;

        }



        /* ==========================================================
           COMMONS
           ========================================================== */

        async function getCommonsThumbnail(
            filename,
            width
        ) {

            const url =
                "https://commons.wikimedia.org/w/api.php" +

                "?action=query" +

                "&prop=imageinfo" +

                "&iiprop=url" +

                "&iiurlwidth=" +
                encodeURIComponent(
                    width
                ) +

                "&titles=File:" +
                encodeURIComponent(
                    filename
                ) +

                "&format=json" +

                "&origin=*";


            const response =
                await fetch(
                    url,
                    {
                        cache:
                            "default"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Commons HTTP " +
                    response.status
                );

            }


            const json =
                await response.json();


            const pages =
                json.query &&
                json.query.pages;


            if (!pages) {

                return "";

            }


            const page =
                Object.values(
                    pages
                )[0];


            if (
                !page ||
                !page.imageinfo ||
                !page.imageinfo.length
            ) {

                return "";

            }


            return (
                page.imageinfo[0].thumburl ||
                page.imageinfo[0].url ||
                ""
            );

        }



        /* ==========================================================
           WIKIPÉDIA
           ========================================================== */

        async function getWikipediaExtract(
            title
        ) {

            const url =
                "https://pt.wikipedia.org/w/api.php" +

                "?action=query" +

                "&prop=extracts" +

                "&exintro=1" +

                "&explaintext=1" +

                "&redirects=1" +

                "&titles=" +
                encodeURIComponent(
                    title
                ) +

                "&format=json" +

                "&origin=*";


            const response =
                await fetch(
                    url,
                    {
                        cache:
                            "default"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Wikipedia HTTP " +
                    response.status
                );

            }


            const json =
                await response.json();


            const pages =
                json.query &&
                json.query.pages;


            if (!pages) {

                return "";

            }


            const page =
                Object.values(
                    pages
                )[0];


            if (
                !page ||
                !page.extract
            ) {

                return "";

            }


            return cleanText(
                page.extract
            );

        }



        /* ==========================================================
           HELPERS WIKIDATA
           ========================================================== */

        function getLanguageValue(
            object
        ) {

            if (!object) {
                return "";
            }


            if (
                object.pt &&
                object.pt.value
            ) {

                return object.pt.value;

            }


            if (
                object.en &&
                object.en.value
            ) {

                return object.en.value;

            }


            return "";

        }



        function getClaimYear(
            entity,
            property
        ) {

            try {

                const time =
                    entity
                        .claims[property][0]
                        .mainsnak
                        .datavalue
                        .value
                        .time;


                const match =
                    time.match(
                        /^([+-])(\d{4,})-/
                    );


                if (!match) {

                    return "";

                }


                let year =
                    parseInt(
                        match[2],
                        10
                    );


                if (
                    match[1] === "-"
                ) {

                    year =
                        -year;

                }


                return String(
                    year
                );


            } catch (error) {

                return "";

            }

        }



        function getClaimString(
            entity,
            property
        ) {

            try {

                return (
                    entity
                        .claims[property][0]
                        .mainsnak
                        .datavalue
                        .value ||
                    ""
                );


            } catch (error) {

                return "";

            }

        }



        function getClaimEntityIDs(
            entity,
            property
        ) {

            try {

                return entity
                    .claims[property]
                    .map(

                        function (claim) {

                            const data =
                                claim
                                    .mainsnak
                                    .datavalue;


                            if (
                                !data ||
                                !data.value
                            ) {

                                return "";

                            }


                            return (
                                data.value.id ||
                                ""
                            );

                        }

                    )
                    .filter(Boolean);


            } catch (error) {

                return [];

            }

        }



        /* ==========================================================
           RENDER AUTOR
           ========================================================== */

        function renderExternalAuthorData(
            data,
            fallbackName
        ) {

            const name =
                data.label ||
                fallbackName;


            if (
                name
            ) {

                setAuthorName(
                    name
                );

            }


            renderAuthorDates(
                data
            );


            renderAuthorMeta(
                data
            );


            renderAuthorDescription(
                data
            );


            renderAuthorPhoto(
                data
            );


            renderExternalSources(
                data
            );

        }



        function setAuthorName(
            name
        ) {

            const element =
                document.getElementById(
                    "odh-author-name"
                );


            if (!element) {
                return;
            }


            element.textContent =
                name;

        }



        /* ==========================================================
           DATAS
           ========================================================== */

        function renderAuthorDates(
            data
        ) {

            const element =
                document.getElementById(
                    "odh-author-dates"
                );


            if (!element) {
                return;
            }


            if (
                data.birth &&
                data.death
            ) {

                element.textContent =
                    data.birth +
                    "–" +
                    data.death;


                return;

            }


            if (
                data.birth
            ) {

                element.textContent =
                    data.birth +
                    "–";


                return;

            }


            element.textContent =
                "";

        }



        /* ==========================================================
           META
           ========================================================== */

        function renderAuthorMeta(
            data
        ) {

            const element =
                document.getElementById(
                    "odh-author-meta"
                );


            if (!element) {
                return;
            }


            const parts =
                [];


            if (
                data.countries &&
                data.countries.length
            ) {

                parts.push(
                    data.countries[0]
                );

            }


            if (
                data.occupations &&
                data.occupations.length
            ) {

                parts.push(

                    data.occupations
                        .slice(
                            0,
                            2
                        )
                        .join(
                            ", "
                        )

                );

            }


            element.textContent =
                parts.join(
                    " · "
                );

        }



        /* ==========================================================
           DESCRIÇÃO + LER MAIS
           ========================================================== */

        function renderAuthorDescription(
            data
        ) {

            const element =
                document.getElementById(
                    "odh-author-description"
                );


            const button =
                document.getElementById(
                    "odh-author-read-more"
                );


            if (
                !element ||
                !button
            ) {

                return;

            }


            const fullText =
                cleanText(
                    data.wikipediaExtract ||
                    data.description ||
                    ""
                );


            if (!fullText) {

                element.textContent =
                    "";

                button.style.display =
                    "none";

                return;

            }


            const previewLength =
                260;


            if (
                fullText.length <=
                previewLength
            ) {

                element.textContent =
                    fullText;

                button.style.display =
                    "none";

                return;

            }


            const shortText =
                shortenText(
                    fullText,
                    previewLength
                );


            element.textContent =
                shortText;


            button.style.display =
                "inline-block";


            button.textContent =
                "Ler mais";


            button.setAttribute(
                "aria-expanded",
                "false"
            );


            let expanded =
                false;


            button.onclick =
                function () {

                    expanded =
                        !expanded;


                    if (
                        expanded
                    ) {

                        element.textContent =
                            fullText;


                        button.textContent =
                            "Ler menos";


                        button.setAttribute(
                            "aria-expanded",
                            "true"
                        );

                    } else {

                        element.textContent =
                            shortText;


                        button.textContent =
                            "Ler mais";


                        button.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }

                };

        }



        /* ==========================================================
           FOTO AUTOR
           ========================================================== */

        function renderAuthorPhoto(
            data
        ) {

            const container =
                document.getElementById(
                    "odh-author-photo"
                );


            if (!container) {
                return;
            }


            if (
                !data.imageURL
            ) {

                const loader =
                    container.querySelector(
                        ".odh-author-photo-loading"
                    );


                if (loader) {

                    loader.remove();

                }


                return;

            }


            const image =
                document.createElement(
                    "img"
                );


            image.alt =
                data.label
                    ? "Retrato de " +
                      data.label
                    : "Retrato do autor";


            image.loading =
                "eager";


            image.fetchPriority =
                "high";


            image.onload =
                function () {

                    container.innerHTML =
                        "";


                    container.appendChild(
                        image
                    );


                    requestAnimationFrame(

                        function () {

                            image.classList.add(
                                "odh-author-photo-loaded"
                            );

                        }

                    );

                };


            image.onerror =
                function () {

                    const loader =
                        container.querySelector(
                            ".odh-author-photo-loading"
                        );


                    if (loader) {

                        loader.remove();

                    }

                };


            image.src =
                data.imageURL;

        }



        /* ==========================================================
           FONTES
           ========================================================== */

        function renderExternalSources(
            data
        ) {

            const container =
                document.getElementById(
                    "odh-author-sources"
                );


            if (!container) {
                return;
            }


            const links =
                [];


            if (
                data.qid
            ) {

                links.push(

                    '<a ' +

                    'href="https://www.wikidata.org/wiki/' +

                    encodeURIComponent(
                        data.qid
                    ) +

                    '" ' +

                    'target="_blank" ' +

                    'rel="noopener noreferrer">' +

                    'Wikidata' +

                    '</a>'

                );

            }


            if (
                data.wikipediaTitle
            ) {

                links.push(

                    '<a ' +

                    'href="https://pt.wikipedia.org/wiki/' +

                    encodeURIComponent(
                        data.wikipediaTitle
                            .replace(
                                / /g,
                                "_"
                            )
                    ) +

                    '" ' +

                    'target="_blank" ' +

                    'rel="noopener noreferrer">' +

                    'Wikipédia' +

                    '</a>'

                );

            }


            if (
                !links.length
            ) {

                container.innerHTML =
                    "";

                return;

            }


            container.innerHTML =
                '<span>Fontes externas:</span> ' +

                links.join(
                    " · "
                );

        }



        /* ==========================================================
           LIMPAR DADOS EXTERNOS
           ========================================================== */

        function clearAuthorExternalData() {

            const meta =
                document.getElementById(
                    "odh-author-meta"
                );


            const description =
                document.getElementById(
                    "odh-author-description"
                );


            const dates =
                document.getElementById(
                    "odh-author-dates"
                );


            const readMore =
                document.getElementById(
                    "odh-author-read-more"
                );


            const photo =
                document.getElementById(
                    "odh-author-photo"
                );


            if (meta) {

                meta.innerHTML =
                    "";

            }


            if (description) {

                description.innerHTML =
                    "";

            }


            if (dates) {

                dates.innerHTML =
                    "";

            }


            if (readMore) {

                readMore.style.display =
                    "none";

            }


            if (photo) {

                const loader =
                    photo.querySelector(
                        ".odh-author-photo-loading"
                    );


                if (loader) {

                    loader.remove();

                }

            }

        }



        /* ==========================================================
           OBRAS DO AUTOR
           ========================================================== */

        async function loadAndRenderAuthorBooks(
            searchURL,
            limit
        ) {

            const container =
                document.getElementById(
                    "odh-author-books"
                );


            if (!container) {
                return;
            }


            try {

                const doc =
                    await fetchHTML(
                        searchURL
                    );


                /*
                 * Em vez de recolher apenas 6 ou 12,
                 * tentamos apanhar um universo bastante maior
                 * da página de resultados.
                 *
                 * Quanto maior o universo, maior a variedade
                 * entre carregamentos.
                 */

                const records =
                    extractBiblionumbers(
                        doc,
                        60
                    );


                /*
                 * Eliminar duplicados.
                 */

                const unique =
                    uniqueRecords(
                        records
                    );


                /*
                 * BARALHAR.
                 *
                 * Aqui está a principal alteração desta versão.
                 */

                const randomRecords =
                    getRandomRecords(
                        unique,
                        limit
                    );


                await renderAuthorBooks(
                    randomRecords
                );


            } catch (error) {

                console.error(
                    "[ODH] Obras do autor:",
                    error
                );


                container.innerHTML =
                    '<span class="odh-author-books-empty">' +

                    'Não foi possível carregar as obras.' +

                    '</span>';

            }

        }



        /* ==========================================================
           ELIMINAR BIBLIONUMBERS REPETIDOS
           ========================================================== */

        function uniqueRecords(
            records
        ) {

            const seen =
                new Set();


            const result =
                [];


            records.forEach(

                function (record) {

                    if (
                        seen.has(
                            record.bib
                        )
                    ) {

                        return;

                    }


                    seen.add(
                        record.bib
                    );


                    result.push(
                        record
                    );

                }

            );


            return result;

        }



        /* ==========================================================
           ESCOLHA ALEATÓRIA
           ========================================================== */

        function getRandomRecords(
            records,
            limit
        ) {

            if (
                records.length <=
                limit
            ) {

                /*
                 * Mesmo quando há apenas 6,
                 * baralhamos a ordem visual.
                 */

                return shuffleArray(
                    records.slice()
                );

            }


            const shuffled =
                shuffleArray(
                    records.slice()
                );


            return shuffled.slice(
                0,
                limit
            );

        }



        /* ==========================================================
           FISHER-YATES
           ========================================================== */

        function shuffleArray(
            array
        ) {

            for (
                let i =
                    array.length - 1;

                i > 0;

                i--
            ) {

                const j =
                    randomInteger(
                        i + 1
                    );


                const temporary =
                    array[i];


                array[i] =
                    array[j];


                array[j] =
                    temporary;

            }


            return array;

        }



        /* ==========================================================
           RANDOM ROBUSTO
           ========================================================== */

        function randomInteger(
            max
        ) {

            /*
             * Browser moderno:
             * usa Web Crypto.
             */

            if (
                window.crypto &&
                window.crypto.getRandomValues
            ) {

                const values =
                    new Uint32Array(
                        1
                    );


                window.crypto.getRandomValues(
                    values
                );


                return (
                    values[0] %
                    max
                );

            }


            /*
             * Fallback para browsers antigos.
             */

            return Math.floor(
                Math.random() *
                max
            );

        }



        /* ==========================================================
           RENDER OBRAS
           ========================================================== */

        async function renderAuthorBooks(
            records
        ) {

            const container =
                document.getElementById(
                    "odh-author-books"
                );


            if (!container) {
                return;
            }


            container.innerHTML =
                "";


            if (
                !records.length
            ) {

                container.innerHTML =
                    '<span class="odh-author-books-empty">' +

                    'Não foram encontradas obras no catálogo.' +

                    '</span>';

                return;

            }



            records.forEach(

                function (record) {

                    const link =
                        document.createElement(
                            "a"
                        );


                    link.className =
                        "odh-author-book";


                    link.href =
                        record.url;


                    link.dataset.bib =
                        record.bib;



                    const cover =
                        document.createElement(
                            "div"
                        );


                    cover.className =
                        "odh-author-book-cover";


                    cover.innerHTML =
                        '<div class="odh-cover-loading"></div>';


                    link.appendChild(
                        cover
                    );


                    container.appendChild(
                        link
                    );

                }

            );



            /*
             * Capa local primeiro.
             */

            const fallback =
                [];


            const localResults =
                await Promise.all(

                    records.map(

                        async function (
                            record,
                            index
                        ) {

                            const book =
                                container.querySelector(
                                    '.odh-author-book[data-bib="' +
                                    record.bib +
                                    '"]'
                                );


                            if (!book) {
                                return null;
                            }


                            const cover =
                                book.querySelector(
                                    ".odh-author-book-cover"
                                );


                            if (!cover) {
                                return null;
                            }


                            const success =
                                await loadLocalCover(
                                    cover,
                                    record,
                                    index
                                );


                            if (!success) {

                                return {

                                    record:
                                        record,

                                    cover:
                                        cover,

                                    index:
                                        index

                                };

                            }


                            return null;

                        }

                    )

                );


            localResults.forEach(

                function (item) {

                    if (
                        item
                    ) {

                        fallback.push(
                            item
                        );

                    }

                }

            );


            await runPool(
                fallback,
                3,

                async function (item) {

                    await loadFallbackCover(
                        item.cover,
                        item.record,
                        item.index
                    );

                }
            );

        }



        /* ==========================================================
           CAPA LOCAL
           ========================================================== */

        function loadLocalCover(
            element,
            record,
            index
        ) {

            return new Promise(

                function (resolve) {


                    const url =
                        "/cgi-bin/koha/opac-image.pl" +

                        "?biblionumber=" +

                        encodeURIComponent(
                            record.bib
                        );


                    const image =
                        document.createElement(
                            "img"
                        );


                    image.loading =
                        index < 6
                            ? "eager"
                            : "lazy";


                    image.fetchPriority =
                        index < 6
                            ? "high"
                            : "low";


                    image.alt =
                        "Capa do livro";


                    image.onload =
                        function () {

                            if (
                                image.naturalWidth >
                                40 &&

                                image.naturalHeight >
                                60
                            ) {

                                finishImage(
                                    element,
                                    image
                                );


                                resolve(
                                    true
                                );

                            } else {

                                image.remove();


                                resolve(
                                    false
                                );

                            }

                        };


                    image.onerror =
                        function () {

                            image.remove();


                            resolve(
                                false
                            );

                        };


                    element.appendChild(
                        image
                    );


                    image.src =
                        url;

                }

            );

        }



        /* ==========================================================
           FALLBACK CAPAS
           ========================================================== */

        async function loadFallbackCover(
            element,
            record,
            index
        ) {

            const data =
                await getRecordData(
                    record
                );


            if (
                !data.isbn
            ) {

                showNoCover(
                    element
                );

                return;

            }



            const google =
                "https://books.google.com/books/content" +

                "?vid=ISBN" +

                encodeURIComponent(
                    data.isbn
                ) +

                "&printsec=frontcover" +

                "&img=1" +

                "&zoom=1";


            if (
                await loadExternalImage(
                    element,
                    google,
                    data.title,
                    index
                )
            ) {

                return;

            }



            const openLibrary =
                "https://covers.openlibrary.org/b/isbn/" +

                encodeURIComponent(
                    data.isbn
                ) +

                "-L.jpg?default=false";


            if (
                await loadExternalImage(
                    element,
                    openLibrary,
                    data.title,
                    index
                )
            ) {

                return;

            }


            showNoCover(
                element
            );

        }



        /* ==========================================================
           IMAGEM EXTERNA
           ========================================================== */

        function loadExternalImage(
            element,
            url,
            title,
            index
        ) {

            return new Promise(

                function (resolve) {


                    const image =
                        document.createElement(
                            "img"
                        );


                    image.alt =
                        title
                            ? "Capa de " +
                              title

                            : "Capa do livro";


                    image.loading =
                        index < 6
                            ? "eager"
                            : "lazy";


                    image.fetchPriority =
                        index < 6
                            ? "high"
                            : "low";


                    image.onload =
                        function () {

                            if (
                                image.naturalWidth >
                                40 &&

                                image.naturalHeight >
                                60
                            ) {

                                finishImage(
                                    element,
                                    image
                                );


                                resolve(
                                    true
                                );

                            } else {

                                image.remove();


                                resolve(
                                    false
                                );

                            }

                        };


                    image.onerror =
                        function () {

                            image.remove();


                            resolve(
                                false
                            );

                        };


                    element.appendChild(
                        image
                    );


                    image.src =
                        url;

                }

            );

        }



        /* ==========================================================
           FINALIZAR CAPA
           ========================================================== */

        function finishImage(
            element,
            image
        ) {

            const loading =
                element.querySelector(
                    ".odh-cover-loading"
                );


            if (
                loading
            ) {

                loading.remove();

            }


            element
                .querySelectorAll(
                    "img"
                )
                .forEach(

                    function (candidate) {

                        if (
                            candidate !==
                            image
                        ) {

                            candidate.remove();

                        }

                    }

                );


            requestAnimationFrame(

                function () {

                    image.classList.add(
                        "odh-loaded"
                    );

                }

            );

        }



        function showNoCover(
            element
        ) {

            element.innerHTML =
                '<div class="odh-no-cover">' +

                'Sem capa' +

                '</div>';

        }



        /* ==========================================================
           DADOS BIBLIOGRÁFICOS
           ========================================================== */

        async function getRecordData(
            record
        ) {

            if (
                recordCache.has(
                    record.bib
                )
            ) {

                return recordCache.get(
                    record.bib
                );

            }


            const promise =
                (async function () {

                    try {

                        const doc =
                            await fetchHTML(
                                record.url
                            );


                        return {

                            bib:
                                record.bib,

                            title:
                                extractRecordTitle(
                                    doc
                                ),

                            isbn:
                                extractISBN(
                                    doc
                                )

                        };


                    } catch (error) {

                        return {

                            bib:
                                record.bib,

                            title:
                                "",

                            isbn:
                                ""

                        };

                    }

                })();


            recordCache.set(
                record.bib,
                promise
            );


            return promise;

        }



        /* ==========================================================
           TÍTULO
           ========================================================== */

        function extractRecordTitle(
            doc
        ) {

            const selectors = [

                "#catalogue_detail_biblio h1",

                ".title",

                "h1"

            ];


            for (
                const selector of selectors
            ) {

                const element =
                    doc.querySelector(
                        selector
                    );


                if (!element) {

                    continue;

                }


                const value =
                    cleanText(
                        element.textContent
                    );


                if (
                    value
                ) {

                    return value;

                }

            }


            return "";

        }



        /* ==========================================================
           ISBN
           ========================================================== */

        function extractISBN(
            doc
        ) {

            const selectors = [

                '[property="books:isbn"]',

                '[itemprop="isbn"]',

                ".isbn",

                '[class*="isbn"]'

            ];


            for (
                const selector of selectors
            ) {

                const element =
                    doc.querySelector(
                        selector
                    );


                if (!element) {

                    continue;

                }


                const isbn =
                    normalizeISBN(

                        element.getAttribute(
                            "content"
                        ) ||

                        element.textContent

                    );


                if (
                    isbn.length ===
                    10 ||

                    isbn.length ===
                    13
                ) {

                    return isbn;

                }

            }


            const bodyText =
                doc.body
                    ? doc.body.textContent
                    : "";


            const matches =
                bodyText.match(
                    /(?:97[89][\s-]?)?(?:\d[\s-]?){9}[\dXx]/g
                );


            if (
                matches
            ) {

                for (
                    const candidate of matches
                ) {

                    const isbn =
                        normalizeISBN(
                            candidate
                        );


                    if (
                        isbn.length ===
                        10 ||

                        isbn.length ===
                        13
                    ) {

                        return isbn;

                    }

                }

            }


            return "";

        }



        function normalizeISBN(
            value
        ) {

            return (
                value ||
                ""
            )
            .replace(
                /[^0-9Xx]/g,
                ""
            )
            .trim();

        }



        /* ==========================================================
           POOL
           ========================================================== */

        async function runPool(
            items,
            concurrency,
            worker
        ) {

            let index =
                0;


            async function next() {

                while (
                    index <
                    items.length
                ) {

                    const current =
                        index++;


                    await worker(
                        items[current]
                    );

                }

            }


            const workers =
                [];


            const count =
                Math.min(
                    concurrency,
                    items.length
                );


            for (
                let i = 0;
                i < count;
                i++
            ) {

                workers.push(
                    next()
                );

            }


            await Promise.all(
                workers
            );

        }



        /* ==========================================================
           MOVIMENTO CARROSSEL
           ========================================================== */

        function smoothScrollTo(
            element,
            target,
            duration
        ) {

            if (
                activeAnimation
            ) {

                cancelAnimationFrame(
                    activeAnimation
                );


                activeAnimation =
                    null;

            }


            const start =
                element.scrollLeft;


            const distance =
                target -
                start;


            if (
                Math.abs(
                    distance
                ) < 1
            ) {

                return;

            }


            const startTime =
                performance.now();



            function easeOutQuint(
                t
            ) {

                return (
                    1 -
                    Math.pow(
                        1 - t,
                        5
                    )
                );

            }



            function animate(
                currentTime
            ) {

                const elapsed =
                    currentTime -
                    startTime;


                const progress =
                    Math.min(
                        elapsed /
                        duration,
                        1
                    );


                element.scrollLeft =
                    start +
                    distance *
                    easeOutQuint(
                        progress
                    );


                if (
                    progress <
                    1
                ) {

                    activeAnimation =
                        requestAnimationFrame(
                            animate
                        );

                } else {

                    activeAnimation =
                        null;

                }

            }


            activeAnimation =
                requestAnimationFrame(
                    animate
                );

        }



        /* ==========================================================
           NAVEGAÇÃO CARROSSEL
           ========================================================== */

        function setupCarouselNavigation(
            carousel
        ) {

            const wrapper =
                carousel.closest(
                    ".odh-koha-carousel-wrap"
                );


            if (
                !wrapper
            ) {

                return;

            }


            const prev =
                wrapper.querySelector(
                    ".odh-carousel-prev"
                );


            const next =
                wrapper.querySelector(
                    ".odh-carousel-next"
                );


            if (
                !prev ||
                !next
            ) {

                return;

            }



            function getStep() {

                const firstBook =
                    carousel.querySelector(
                        ".odh-carousel-book"
                    );


                if (
                    !firstBook
                ) {

                    return 170;

                }


                const width =
                    firstBook
                        .getBoundingClientRect()
                        .width;


                return (
                    width +
                    13
                ) * 1.45;

            }



            function updateButtons() {

                const maxScroll =
                    carousel.scrollWidth -
                    carousel.clientWidth;


                prev.disabled =
                    carousel.scrollLeft <=
                    3;


                next.disabled =
                    carousel.scrollLeft >=
                    maxScroll - 3;

            }



            function move(
                direction
            ) {

                const maxScroll =
                    carousel.scrollWidth -
                    carousel.clientWidth;


                let target =
                    carousel.scrollLeft +
                    getStep() *
                    direction;


                target =
                    Math.max(
                        0,
                        Math.min(
                            target,
                            maxScroll
                        )
                    );


                smoothScrollTo(
                    carousel,
                    target,
                    1150
                );

            }


            prev.addEventListener(

                "click",

                function () {

                    move(
                        -1
                    );

                }

            );


            next.addEventListener(

                "click",

                function () {

                    move(
                        1
                    );

                }

            );


            carousel.addEventListener(
                "scroll",
                updateButtons,
                {
                    passive:
                        true
                }
            );


            window.addEventListener(
                "resize",
                updateButtons
            );


            updateButtons();

        }

        return initAuthorFeature();

    }



    /* ==========================================================
       O QUE ESTÁ OEIRAS A LER?
       Relatório público Koha 846.
       Escolhe 3 títulos distintos entre os primeiros 20.
       ========================================================== */

    async function initMostRead() {

        const container =
            document.getElementById(
                "odh-reading"
            );


        if (!container) {
            return;
        }


        const reportUrl =
            container.dataset.report ||
            "/cgi-bin/koha/svc/report?id=846&annotated=1";


        const poolSize =
            Math.max(
                1,
                parseInt(
                    container.dataset.pool || "20",
                    10
                ) || 20
            );


        const limit =
            Math.max(
                1,
                parseInt(
                    container.dataset.limit || "3",
                    10
                ) || 3
            );


        try {

            const rows =
                await fetchJSON(
                    reportUrl,
                    7000
                );


            if (!Array.isArray(rows)) {
                throw new Error("Resposta inválida do relatório 846");
            }


            const unique = [];
            const seenTitles = new Set();


            rows
                .slice(0, poolSize)
                .forEach(
                    function (row) {

                        const bib =
                            String(
                                row && row.biblionumber || ""
                            ).trim();


                        const title =
                            cleanText(
                                row && row.Titulo
                            );


                        const author =
                            cleanText(
                                row && row.Autor
                            );


                        const loans =
                            parseInt(
                                row && row.Emprestimos,
                                10
                            ) || 0;


                        if (
                            !/^\d+$/.test(bib) ||
                            !title
                        ) {
                            return;
                        }


                        const titleKey =
                            title
                                .toLocaleLowerCase("pt-PT")
                                .replace(/\s+/g, " ")
                                .trim();


                        if (seenTitles.has(titleKey)) {
                            return;
                        }


                        seenTitles.add(titleKey);


                        unique.push({
                            bib:bib,
                            title:title,
                            author:author,
                            loans:loans,
                            url:
                                "/cgi-bin/koha/opac-detail.pl?biblionumber=" +
                                encodeURIComponent(bib)
                        });

                    }
                );


            const selected =
                shuffleArray(unique)
                    .slice(
                        0,
                        Math.min(limit, unique.length)
                    );


            if (!selected.length) {
                throw new Error("Sem resultados utilizáveis");
            }


            container.innerHTML = "";


            selected.forEach(
                function (record, index) {

                    const link =
                        document.createElement(
                            "a"
                        );


                    link.className =
                        "odh-reading-card";


                    link.href =
                        record.url;


                    link.title =
                        record.title;


                    const image =
                        document.createElement(
                            "img"
                        );


                    image.alt =
                        "Capa de " +
                        record.title;


                    const info =
                        document.createElement(
                            "span"
                        );


                    const title =
                        document.createElement(
                            "strong"
                        );


                    title.textContent =
                        record.title;


                    const author =
                        document.createElement(
                            "small"
                        );


                    author.textContent =
                        record.author ||
                        "Autor não indicado";


                    const loans =
                        document.createElement(
                            "small"
                        );


                    loans.className =
                        "odh-reading-loans";


                    loans.textContent =
                        record.loans +
                        (record.loans === 1
                            ? " empréstimo"
                            : " empréstimos");


                    info.appendChild(title);
                    info.appendChild(author);
                    info.appendChild(loans);


                    link.appendChild(image);
                    link.appendChild(info);


                    container.appendChild(link);


                    attachSmartCover(
                        image,
                        record,
                        {
                            eager:
                                index < 3,

                            onFail:
                                function () {
                                    image.style.visibility = "hidden";
                                }
                        }
                    );

                }
            );


        } catch (error) {

            container.innerHTML =
                '<div class="odh-status">Não foi possível carregar os livros mais emprestados.</div>';

        }

    }



    /* ==========================================================
       SURPREENDA-ME
       ========================================================== */

    function initSurprise() {

        const button =
            document.getElementById(
                "odh-surprise"
            );


        if (!button) {
            return;
        }


        const terms = [

            "Humor",
            "Poesia",
            "Viagens",
            "Memória",
            "Fantástico",
            "Ciência"

        ];


        button.onclick =
            function () {

                const term =
                    terms[
                        randomInteger(
                            terms.length
                        )
                    ];


                window.location.href =
                    "/cgi-bin/koha/opac-search.pl?q=su:" +
                    encodeURIComponent(
                        term
                    );

            };

    }



    /* ==========================================================
       ARRANQUE
       ========================================================== */

    function init() {

        initSurprise();

        /*
         * Tudo independente.
         * A Wikipedia não bloqueia comentários,
         * KEEP não bloqueia o autor, etc.
         */

        initNewBooks();

        initCartografias();

        initReviews();

        initAuthor();

        initMostRead();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }


})();

</script>
