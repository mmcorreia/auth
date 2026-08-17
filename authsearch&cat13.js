/* ============================================================
   AUTHSEARCH / AUTHBOX
   PATCH · OBRAS NO CATÁLOGO COM PROBLEMAS
   CSS + JavaScript no mesmo ficheiro, separados por secções

   NOTA:
   - A secção CSS deve ser integrada no bloco AUTHSEARCH_CSS.
   - A secção JavaScript deve ser integrada dentro de $(document).ready(...).
   - A chamada final só deve correr depois de STATE.obrasLigadasPreload
     estar preenchido.
   ============================================================ */


/* ============================================================
   1. CSS
   ============================================================ */

/* ============================================================
   OBRAS NO CATÁLOGO · MODO OPERACIONAL
   Apenas obras com problemas + centro de resolução inline
   ============================================================ */
.authsearch-problem-kpis{
    display:grid;
    grid-template-columns:repeat(5,minmax(0,1fr));
    gap:10px;
    margin:0 0 12px 0;
}
.authsearch-problem-kpi{
    border:1px solid #d8dee6;
    background:#fff;
    border-radius:8px;
    padding:12px 14px;
    min-height:72px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    cursor:pointer;
    transition:border-color .14s ease, box-shadow .14s ease, background .14s ease;
}
.authsearch-problem-kpi:hover{
    border-color:#bfd0df;
    box-shadow:0 3px 10px rgba(15,23,42,.06);
    background:#fcfdff;
}
.authsearch-problem-kpi.is-active{
    border-color:#6ca6cb;
    box-shadow:0 0 0 2px rgba(0,127,174,.10);
    background:#f7fbfe;
}
.authsearch-problem-kpi-main{min-width:0}
.authsearch-problem-kpi-value{
    font-size:28px;
    line-height:1;
    font-weight:850;
    color:#243a53;
}
.authsearch-problem-kpi-label{
    margin-top:5px;
    font-size:12px;
    line-height:1.35;
    color:#475467;
    font-weight:700;
}
.authsearch-problem-kpi-icon{
    font-size:20px;
    color:#98a2b3;
    flex:0 0 auto;
}
.authsearch-problem-kpi.is-orange .authsearch-problem-kpi-value,
.authsearch-problem-kpi.is-orange .authsearch-problem-kpi-icon{color:#f79009}
.authsearch-problem-kpi.is-purple .authsearch-problem-kpi-value,
.authsearch-problem-kpi.is-purple .authsearch-problem-kpi-icon{color:#7f56d9}
.authsearch-problem-kpi.is-red .authsearch-problem-kpi-value,
.authsearch-problem-kpi.is-red .authsearch-problem-kpi-icon{color:#d92d20}
.authsearch-problem-kpi.is-blue .authsearch-problem-kpi-value,
.authsearch-problem-kpi.is-blue .authsearch-problem-kpi-icon{color:#2e90fa}

.authsearch-problem-toolbar{
    display:grid;
    grid-template-columns:260px 1fr;
    gap:10px;
    margin:0 0 10px 0;
}
.authsearch-problem-select,
.authsearch-problem-search{
    width:100%;
    border:1px solid #cfd6df;
    border-radius:6px;
    padding:9px 10px;
    font-size:12.5px;
    background:#fff;
    color:#344054;
}
.authsearch-problem-note{
    font-size:12px;
    color:#667085;
    margin:0 0 12px 0;
    display:flex;
    align-items:flex-start;
    gap:8px;
}
.authsearch-problem-note i{
    margin-top:2px;
    color:#98a2b3;
}

.authsearch-work-op{
    display:grid;
    grid-template-columns:68px minmax(0,1fr) 220px;
    gap:14px;
    padding:14px 2px;
    border-bottom:1px solid #e5e9ed;
    min-width:0;
}
.authsearch-work-op:last-child{border-bottom:0}
.authsearch-work-op-cover-wrap{position:relative}
.authsearch-work-op-cover{
    width:68px;
    height:102px;
    object-fit:cover;
    object-position:center top;
    border-radius:4px;
    background:#f1f5f9;
    box-shadow:0 1px 2px rgba(0,0,0,.08);
}
.authsearch-work-op-rank-badge{
    position:absolute;
    left:-8px;
    top:-6px;
    width:28px;
    height:28px;
    border-radius:50%;
    background:#f79009;
    color:#fff;
    font-size:13px;
    font-weight:800;
    display:flex;
    align-items:center;
    justify-content:center;
    border:2px solid #fff;
    box-shadow:0 2px 8px rgba(15,23,42,.12);
}
.authsearch-work-op-title{
    margin:0 0 6px 0;
    font-size:14px;
    line-height:1.35;
    font-weight:800;
    color:#1f5f8b;
}
.authsearch-work-op-title a{
    color:#1f5f8b!important;
    text-decoration:none!important;
}
.authsearch-work-op-title a:hover{text-decoration:underline!important}
.authsearch-work-op-meta{
    font-size:12px;
    line-height:1.45;
    color:#475467;
}
.authsearch-work-op-meta .sep{
    color:#98a2b3;
    margin:0 6px;
}
.authsearch-work-op-chips{
    display:flex;
    flex-wrap:wrap;
    gap:8px;
    margin-top:10px;
}
.authsearch-problem-chip{
    display:inline-flex;
    align-items:center;
    gap:6px;
    padding:6px 10px;
    border-radius:999px;
    font-size:12px;
    line-height:1;
    font-weight:700;
    border:1px solid transparent;
    white-space:nowrap;
}
.authsearch-problem-chip.is-orange{
    color:#b54708;
    background:#fff7ed;
    border-color:#fed7aa;
}
.authsearch-problem-chip.is-purple{
    color:#6941c6;
    background:#f4f3ff;
    border-color:#d9d6fe;
}
.authsearch-problem-chip.is-red{
    color:#b42318;
    background:#fef3f2;
    border-color:#fecdca;
}
.authsearch-problem-chip.is-blue{
    color:#175cd3;
    background:#eff8ff;
    border-color:#b2ddff;
}
.authsearch-work-op-submeta{
    font-size:12px;
    color:#667085;
    margin-top:10px;
}
.authsearch-work-op-actions{
    display:flex;
    flex-direction:column;
    align-items:flex-end;
    gap:10px;
    justify-content:center;
}
.authsearch-work-op-btn{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    min-width:186px;
    padding:10px 14px;
    border-radius:8px;
    border:1px solid #84add0;
    background:#fff;
    color:#2b6a97!important;
    text-decoration:none!important;
    font-size:13px;
    font-weight:800;
    cursor:pointer;
}
.authsearch-work-op-btn:hover{
    background:#f7fbfe;
    border-color:#5d95c0;
    text-decoration:none!important;
}
.authsearch-work-op-link{
    color:#2b6a97!important;
    text-decoration:none!important;
    font-size:13px;
    font-weight:700;
}
.authsearch-work-op-link:hover{text-decoration:underline!important}

.authsearch-resolution{
    margin-top:14px;
    border:1px solid #d8e3ec;
    border-radius:8px;
    background:#fbfdff;
    overflow:hidden;
}
.authsearch-resolution-head{
    padding:10px 12px;
    border-bottom:1px solid #e5edf4;
    background:#f7fbfe;
    font-size:12px;
    font-weight:800;
    color:#26435c;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
}
.authsearch-resolution-body{padding:10px 12px}
.authsearch-resolution-row{
    padding:10px 0;
    border-top:1px solid #e9eef3;
}
.authsearch-resolution-row:first-child{
    border-top:0;
    padding-top:0;
}
.authsearch-resolution-top{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:10px;
}
.authsearch-resolution-occ{min-width:0}
.authsearch-resolution-occ strong{
    display:block;
    font-size:12px;
    color:#111827;
}
.authsearch-resolution-occ span{
    display:block;
    margin-top:3px;
    font-size:12px;
    color:#667085;
    line-height:1.45;
}
.authsearch-resolution-tags{
    display:flex;
    flex-wrap:wrap;
    gap:6px;
    margin-top:8px;
}
.authsearch-resolution-actions{
    display:flex;
    flex-wrap:wrap;
    gap:8px;
    margin-top:10px;
}
.authsearch-resolution-btn{
    display:inline-flex;
    align-items:center;
    gap:6px;
    padding:7px 10px;
    border:1px solid #cbd5e1;
    border-radius:6px;
    background:#fff;
    color:#344054!important;
    text-decoration:none!important;
    font-size:12px;
    font-weight:700;
}
.authsearch-resolution-btn:hover{
    background:#f8fafc;
    text-decoration:none!important;
}
.authsearch-works-empty-ok{
    border:1px solid #cce5d6;
    background:#f6fef9;
    color:#027a48;
    border-radius:8px;
    padding:14px 16px;
    font-size:13px;
    line-height:1.45;
}
.authsearch-works-empty-muted{
    border:1px solid #e4e7ec;
    background:#fcfcfd;
    color:#667085;
    border-radius:8px;
    padding:14px 16px;
    font-size:13px;
    line-height:1.45;
}
.authsearch-works-loading{
    padding:12px 2px;
    color:#667085;
    font-size:12px;
}
@media(max-width:960px){
    .authsearch-problem-kpis{grid-template-columns:1fr 1fr}
    .authsearch-problem-toolbar{grid-template-columns:1fr}
    .authsearch-work-op{grid-template-columns:68px minmax(0,1fr)}
    .authsearch-work-op-actions{
        grid-column:1 / -1;
        align-items:flex-start;
        padding-left:82px;
    }
}



/* ============================================================
   2. JAVASCRIPT
   ============================================================ */

/* ============================================================
   PATCH · AUTHSEARCH V3.5
   OBRAS NO CATÁLOGO · APENAS OBRAS COM PROBLEMAS
   Inserir dentro de $(document).ready(...)
   ============================================================ */

STATE.obrasProblemas = [];
STATE.obrasProblemasPorBib = {};
STATE.obrasFiltroProblema = "todos";
STATE.obrasFiltroTexto = "";
STATE.obrasResolucaoAberta = {};
STATE.obrasDiagnosticoEmCurso = false;

var AUTHSEARCH_ISSUES = {
    total: {
        key: "total",
        label: "obras com problemas",
        chip: "Obra com problemas",
        className: "",
        icon: "fa fa-exclamation-triangle",
        priority: 100
    },
    missing9: {
        key: "missing9",
        label: "7xx sem $9",
        chip: "7xx sem $9",
        className: "is-orange",
        icon: "fa fa-user-o",
        priority: 90
    },
    missing4: {
        key: "missing4",
        label: "Função $4 ausente",
        chip: "Função $4 ausente",
        className: "is-purple",
        icon: "fa fa-tag",
        priority: 80
    },
    divergentName: {
        key: "divergentName",
        label: "Nome divergente",
        chip: "Nome divergente",
        className: "is-red",
        icon: "fa fa-exchange",
        priority: 70
    },
    dateCheck: {
        key: "dateCheck",
        label: "Verificar datas",
        chip: "Verificar datas",
        className: "is-blue",
        icon: "fa fa-calendar",
        priority: 60
    }
};

function normalizarComparacao(txt) {
    return String(txt || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[.,;:()[\]{}\/\\'"!?]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function obterAuthidAtualSeguro() {
    if (typeof obterAuthidAtual === "function") return obterAuthidAtual();
    var p = new URLSearchParams(window.location.search || "");
    return p.get("authid") || "";
}

function obterUniversoNomesAutoridade() {
    var nomes = [];
    var vistos = {};

    function pushNome(v) {
        v = limparTexto(v || "");
        if (!v) return;
        var key = normalizarComparacao(v);
        if (!key || vistos[key]) return;
        vistos[key] = true;
        nomes.push(v);
    }

    if (STATE.authority) {
        pushNome(STATE.authority.nome || "");
        pushNome(STATE.authority.heading || "");
        pushNome(STATE.authority.nomeCompleto || "");

        if ($.isArray(STATE.authority.variantes)) {
            STATE.authority.variantes.forEach(pushNome);
        }
        if ($.isArray(STATE.authority.variants)) {
            STATE.authority.variants.forEach(pushNome);
        }
        if ($.isArray(STATE.authority.formas400)) {
            STATE.authority.formas400.forEach(pushNome);
        }
    }

    return nomes;
}

function obterDatasAutoridade() {
    var inicio = "";
    var fim = "";

    if (STATE.authority) {
        inicio = limparTexto(
            STATE.authority.dataNascimento ||
            STATE.authority.nascimento ||
            STATE.authority.dataInicio || ""
        );
        fim = limparTexto(
            STATE.authority.dataMorte ||
            STATE.authority.morte ||
            STATE.authority.dataFim || ""
        );
    }

    return {
        nascimento: inicio,
        morte: fim,
        texto: (inicio || fim)
            ? (inicio + (inicio || fim ? "-" : "") + fim).replace(/-$/, "")
            : ""
    };
}

function buildUrlsObra(biblionumber, issueKey) {
    var authid = encodeURIComponent(obterAuthidAtualSeguro());
    var bib = encodeURIComponent(biblionumber || "");
    var issue = encodeURIComponent(issueKey || "");
    var origin = window.location.origin || "";

    return {
        editor: "/cgi-bin/koha/cataloguing/addbiblio.pl?biblionumber=" + bib +
                "&authsearch_authid=" + authid +
                "&authsearch_issue=" + issue,
        staff: "/cgi-bin/koha/catalogue/detail.pl?biblionumber=" + bib,
        marc: "/cgi-bin/koha/catalogue/MARCdetail.pl?biblionumber=" + bib,
        opac: origin + "/cgi-bin/koha/opac-detail.pl?biblionumber=" + bib
    };
}

function safeArray(v) {
    return $.isArray(v) ? v : [];
}

function getWorkTitle(obra) {
    return limparTexto(
        obra.title ||
        obra.titulo ||
        obra.title_display ||
        obra.display_title ||
        ""
    );
}

function getWorkCover(obra) {
    return limparTexto(
        obra.cover ||
        obra.coverUrl ||
        obra.cover_url ||
        obra.image ||
        obra.image_url ||
        ""
    );
}

function getWorkISBN(obra) {
    return limparTexto(obra.isbn || obra.ISBN || "");
}

function getWorkPublisher(obra) {
    return limparTexto(
        obra.publisher ||
        obra.editor ||
        obra.editora ||
        obra.imprint ||
        ""
    );
}

function getWorkYear(obra) {
    return limparTexto(
        obra.year ||
        obra.date ||
        obra.data ||
        obra.pubyear ||
        ""
    );
}

function getWorkMentions(obra) {
    var n = parseInt(
        obra.mentions ||
        obra.ocorrencias ||
        obra.count ||
        obra.matchCount ||
        0,
        10
    );
    return isNaN(n) ? 0 : n;
}

function getWorkLastLinkDate(obra) {
    return limparTexto(
        obra.lastLinked ||
        obra.lastSeen ||
        obra.last_match ||
        obra.dataLigacao ||
        obra.linked_at ||
        ""
    );
}

function extrairSubfieldsXML(datafieldNode) {
    var out = [];
    var subfields = datafieldNode.getElementsByTagName("subfield");

    for (var i = 0; i < subfields.length; i++) {
        out.push({
            code: subfields[i].getAttribute("code") || "",
            value: limparTexto(subfields[i].textContent || "")
        });
    }

    return out;
}

function valuesByCode(subfields, code) {
    return subfields
        .filter(function (s) { return s.code === code; })
        .map(function (s) { return s.value; })
        .filter(Boolean);
}

function firstByCode(subfields, code) {
    var arr = valuesByCode(subfields, code);
    return arr.length ? arr[0] : "";
}

function buildHeadingFrom7xx(subfields) {
    var a = firstByCode(subfields, "a");
    var b = firstByCode(subfields, "b");
    var f = firstByCode(subfields, "f");

    var nome = a;
    if (b) nome += (nome ? ", " : "") + b;
    if (f) nome += " " + f;

    return limparTexto(nome);
}

function headingMatchesAuthority(subfields, authid, universeNormalizado) {
    var fieldAuthId = firstByCode(subfields, "9");

    if (fieldAuthId && authid && String(fieldAuthId) === String(authid)) {
        return true;
    }

    var heading = buildHeadingFrom7xx(subfields);
    var n = normalizarComparacao(heading);

    if (n && universeNormalizado[n]) return true;

    var a = normalizarComparacao(firstByCode(subfields, "a"));

    if (a) {
        var keys = Object.keys(universeNormalizado);

        for (var i = 0; i < keys.length; i++) {
            if (keys[i].indexOf(a) !== -1 || a.indexOf(keys[i]) !== -1) {
                return true;
            }
        }
    }

    return false;
}

function getMarcExportUrl(biblionumber) {
    return "/cgi-bin/koha/catalogue/export.pl?op=export&format=marcxml&bib=" +
           encodeURIComponent(biblionumber);
}

function fetchMarcXmlForWork(biblionumber) {
    return $.ajax({
        url: getMarcExportUrl(biblionumber),
        method: "GET",
        dataType: "text",
        timeout: CONFIG.timeout || 10000
    });
}

function diagnosticarObra(obra, marcxml) {
    var authid = obterAuthidAtualSeguro();
    var universe = obterUniversoNomesAutoridade();
    var universeNormalizado = {};
    var datasAutoridade = obterDatasAutoridade();

    universe.forEach(function (nome) {
        universeNormalizado[normalizarComparacao(nome)] = true;
    });

    var parser = new DOMParser();
    var xml = parser.parseFromString(marcxml, "text/xml");
    var fields = xml.getElementsByTagName("datafield");
    var ocorrencias = [];

    var resumo = {
        total: 0,
        missing9: 0,
        missing4: 0,
        divergentName: 0,
        dateCheck: 0
    };

    for (var i = 0; i < fields.length; i++) {
        var tag = fields[i].getAttribute("tag") || "";

        if (["700", "701", "702"].indexOf(tag) === -1) continue;

        var subfields = extrairSubfieldsXML(fields[i]);

        if (!headingMatchesAuthority(
            subfields,
            authid,
            universeNormalizado
        )) continue;

        var issues = [];
        var heading = buildHeadingFrom7xx(subfields);
        var rawAuthId = firstByCode(subfields, "9");
        var raw4 = firstByCode(subfields, "4");
        var rawF = firstByCode(subfields, "f");

        if (!rawAuthId) {
            issues.push("missing9");
            resumo.missing9++;
        }

        if (!raw4) {
            issues.push("missing4");
            resumo.missing4++;
        }

        var headingNorm = normalizarComparacao(heading);

        if (heading && !universeNormalizado[headingNorm]) {
            issues.push("divergentName");
            resumo.divergentName++;
        }

        if (datasAutoridade.texto) {
            var dataOk =
                rawF &&
                normalizarComparacao(rawF) ===
                normalizarComparacao(datasAutoridade.texto);

            if (!dataOk) {
                issues.push("dateCheck");
                resumo.dateCheck++;
            }
        }

        if (issues.length) {
            resumo.total++;

            ocorrencias.push({
                tag: tag,
                heading: heading,
                fieldAuthId: rawAuthId,
                field4: raw4,
                fieldF: rawF,
                issues: issues.slice(0),
                source: subfields.map(function (s) {
                    return "$" + s.code + " " + s.value;
                }).join(" ")
            });
        }
    }

    return {
        biblionumber:
            obra.biblionumber ||
            obra.biblioNumber ||
            obra.id ||
            "",
        obra: obra,
        issuesSummary: resumo,
        ocorrencias: ocorrencias,
        hasProblems: resumo.total > 0
    };
}

function sortProblematicalWorks(arr) {
    return arr.sort(function (a, b) {
        var wa = pesoProblema(a.issuesSummary);
        var wb = pesoProblema(b.issuesSummary);

        if (wb !== wa) return wb - wa;

        return getWorkTitle(a.obra).localeCompare(
            getWorkTitle(b.obra),
            "pt"
        );
    });
}

function pesoProblema(summary) {
    return (summary.missing9 * 100) +
           (summary.missing4 * 80) +
           (summary.divergentName * 60) +
           (summary.dateCheck * 40);
}

function aggregateProblemTotals(obrasDiag) {
    var total = {
        total: 0,
        missing9: 0,
        missing4: 0,
        divergentName: 0,
        dateCheck: 0
    };

    obrasDiag.forEach(function (d) {
        if (!d.hasProblems) return;

        total.total++;

        if (d.issuesSummary.missing9) total.missing9++;
        if (d.issuesSummary.missing4) total.missing4++;
        if (d.issuesSummary.divergentName) total.divergentName++;
        if (d.issuesSummary.dateCheck) total.dateCheck++;
    });

    return total;
}

function obraPassaFiltro(diag) {
    if (!diag || !diag.hasProblems) return false;

    var filtro = STATE.obrasFiltroProblema || "todos";
    var texto = normalizarComparacao(
        STATE.obrasFiltroTexto || ""
    );

    var okProblema = true;

    if (filtro !== "todos") {
        okProblema = !!diag.issuesSummary[filtro];
    }

    if (!okProblema) return false;
    if (!texto) return true;

    var base = [
        getWorkTitle(diag.obra),
        getWorkISBN(diag.obra),
        getWorkPublisher(diag.obra),
        getWorkYear(diag.obra)
    ].join(" ");

    return normalizarComparacao(base).indexOf(texto) !== -1;
}

function renderProblemKpis(totais) {
    var defs = [
        {
            key: "total",
            value: totais.total,
            label: "obras com problemas",
            icon: "fa fa-exclamation-triangle",
            cls: ""
        },
        {
            key: "missing9",
            value: totais.missing9,
            label: "7xx sem $9",
            icon: "fa fa-user-o",
            cls: "is-orange"
        },
        {
            key: "missing4",
            value: totais.missing4,
            label: "Função $4 ausente",
            icon: "fa fa-tag",
            cls: "is-purple"
        },
        {
            key: "divergentName",
            value: totais.divergentName,
            label: "Nome divergente",
            icon: "fa fa-exchange",
            cls: "is-red"
        },
        {
            key: "dateCheck",
            value: totais.dateCheck,
            label: "Verificar datas",
            icon: "fa fa-calendar",
            cls: "is-blue"
        }
    ];

    return '<div class="authsearch-problem-kpis">' +
        defs.map(function (d) {
            var filtroKey =
                d.key === "total"
                    ? "todos"
                    : d.key;

            var ativo =
                ((STATE.obrasFiltroProblema || "todos") === filtroKey)
                    ? ' is-active'
                    : '';

            return '' +
                '<button type="button" ' +
                    'class="authsearch-problem-kpi ' +
                        d.cls + ativo + '" ' +
                    'data-problem-filter="' +
                        escaparHTML(filtroKey) + '">' +

                    '<div class="authsearch-problem-kpi-main">' +
                        '<div class="authsearch-problem-kpi-value">' +
                            escaparHTML(String(d.value)) +
                        '</div>' +
                        '<div class="authsearch-problem-kpi-label">' +
                            escaparHTML(d.label) +
                        '</div>' +
                    '</div>' +

                    '<i class="authsearch-problem-kpi-icon ' +
                        escaparHTML(d.icon) +
                        '" aria-hidden="true"></i>' +

                '</button>';
        }).join("") +
    '</div>';
}

function renderProblemToolbar() {
    return '' +
        '<div class="authsearch-problem-toolbar">' +

            '<select class="authsearch-problem-select" ' +
                'id="authsearch-problem-select">' +

                '<option value="todos"' +
                    ((STATE.obrasFiltroProblema || "todos") === "todos"
                        ? ' selected'
                        : '') +
                    '>Filtrar por problema</option>' +

                '<option value="missing9"' +
                    ((STATE.obrasFiltroProblema || "todos") === "missing9"
                        ? ' selected'
                        : '') +
                    '>7xx sem $9</option>' +

                '<option value="missing4"' +
                    ((STATE.obrasFiltroProblema || "todos") === "missing4"
                        ? ' selected'
                        : '') +
                    '>Função $4 ausente</option>' +

                '<option value="divergentName"' +
                    ((STATE.obrasFiltroProblema || "todos") === "divergentName"
                        ? ' selected'
                        : '') +
                    '>Nome divergente</option>' +

                '<option value="dateCheck"' +
                    ((STATE.obrasFiltroProblema || "todos") === "dateCheck"
                        ? ' selected'
                        : '') +
                    '>Verificar datas</option>' +

            '</select>' +

            '<input type="text" ' +
                'class="authsearch-problem-search" ' +
                'id="authsearch-problem-search" ' +
                'value="' +
                    escaparHTML(STATE.obrasFiltroTexto || "") +
                '" ' +
                'placeholder="Filtrar obras...">' +

        '</div>' +

        '<div class="authsearch-problem-note">' +
            '<i class="fa fa-info-circle" aria-hidden="true"></i>' +
            '<span>' +
                'Apenas obras que requerem intervenção. ' +
                'Clique em “Resolver problemas” para abrir ' +
                'o centro de resolução da obra.' +
            '</span>' +
        '</div>';
}

function renderProblemChips(summary) {
    var html = [];

    ["missing9", "missing4", "divergentName", "dateCheck"]
        .forEach(function (key) {
            if (!summary[key]) return;

            var def = AUTHSEARCH_ISSUES[key];

            html.push(
                '<span class="authsearch-problem-chip ' +
                    escaparHTML(def.className) + '">' +

                    '<i class="' +
                        escaparHTML(def.icon) +
                        '" aria-hidden="true"></i>' +

                    escaparHTML(
                        def.chip + " (" + summary[key] + ")"
                    ) +

                '</span>'
            );
        });

    return html.join("");
}

function renderResolutionPanel(diag) {
    var aberto =
        !!STATE.obrasResolucaoAberta[diag.biblionumber];

    if (!aberto) return "";

    return '' +
        '<div class="authsearch-resolution">' +

            '<div class="authsearch-resolution-head">' +

                '<span>' +
                    'Centro de resolução · ' +
                    escaparHTML(getWorkTitle(diag.obra)) +
                '</span>' +

                '<button type="button" ' +
                    'class="authsearch-resolution-btn ' +
                    'authsearch-close-resolution" ' +
                    'data-bib="' +
                    escaparHTML(String(diag.biblionumber)) +
                    '">' +

                    '<i class="fa fa-times" aria-hidden="true"></i> ' +
                    'Fechar' +

                '</button>' +

            '</div>' +

            '<div class="authsearch-resolution-body">' +

                diag.ocorrencias.map(function (occ, idx) {
                    var occUrls = buildUrlsObra(
                        diag.biblionumber,
                        occ.issues[0] || ""
                    );

                    return '' +
                        '<div class="authsearch-resolution-row">' +

                            '<div class="authsearch-resolution-top">' +
                                '<div class="authsearch-resolution-occ">' +

                                    '<strong>' +
                                        'Ocorrência ' +
                                        escaparHTML(String(idx + 1)) +
                                        ' · ' +
                                        escaparHTML(occ.tag) +
                                    '</strong>' +

                                    '<span>' +
                                        escaparHTML(
                                            occ.source ||
                                            occ.heading ||
                                            ""
                                        ) +
                                    '</span>' +

                                '</div>' +
                            '</div>' +

                            '<div class="authsearch-resolution-tags">' +

                                occ.issues.map(function (issueKey) {
                                    var def =
                                        AUTHSEARCH_ISSUES[issueKey];

                                    return '' +
                                        '<span class="' +
                                            'authsearch-problem-chip ' +
                                            escaparHTML(def.className) +
                                            '">' +

                                            '<i class="' +
                                                escaparHTML(def.icon) +
                                                '" aria-hidden="true"></i>' +

                                            escaparHTML(def.chip) +

                                        '</span>';
                                }).join("") +

                            '</div>' +

                            '<div class="authsearch-resolution-actions">' +

                                '<a class="authsearch-resolution-btn" ' +
                                    'href="' +
                                    escaparHTML(occUrls.editor) +
                                    '" target="_blank" rel="noopener">' +

                                    '<i class="fa fa-pencil" ' +
                                        'aria-hidden="true"></i> ' +
                                    'Editar registo' +

                                '</a>' +

                                '<a class="authsearch-resolution-btn" ' +
                                    'href="' +
                                    escaparHTML(occUrls.marc) +
                                    '" target="_blank" rel="noopener">' +

                                    '<i class="fa fa-list-alt" ' +
                                        'aria-hidden="true"></i> ' +
                                    'Ver MARC' +

                                '</a>' +

                                '<a class="authsearch-resolution-btn" ' +
                                    'href="' +
                                    escaparHTML(occUrls.staff) +
                                    '" target="_blank" rel="noopener">' +

                                    '<i class="fa fa-external-link" ' +
                                        'aria-hidden="true"></i> ' +
                                    'Ver no staff' +

                                '</a>' +

                            '</div>' +

                        '</div>';
                }).join("") +

            '</div>' +

        '</div>';
}

function renderOneProblematicWork(diag, idx) {
    var obra = diag.obra;
    var cover = getWorkCover(obra);

    var urls = buildUrlsObra(
        diag.biblionumber,
        diagnosticoPrincipal(diag)
    );

    var mentions = getWorkMentions(obra);
    var lastLink = getWorkLastLinkDate(obra);

    return '' +
        '<div class="authsearch-work-op">' +

            '<div class="authsearch-work-op-cover-wrap">' +

                (cover
                    ? '<img class="authsearch-work-op-cover" ' +
                        'src="' + escaparHTML(cover) + '" alt="">'
                    : '<div class="authsearch-work-placeholder">' +
                        'Sem<br>capa</div>') +

                '<div class="authsearch-work-op-rank-badge">' +
                    escaparHTML(String(idx + 1)) +
                '</div>' +

            '</div>' +

            '<div class="authsearch-work-body">' +

                '<h4 class="authsearch-work-op-title">' +
                    '<a href="' +
                        escaparHTML(urls.staff) +
                        '" target="_blank" rel="noopener">' +

                        escaparHTML(getWorkTitle(obra)) +

                    '</a>' +
                '</h4>' +

                '<div class="authsearch-work-op-meta">' +

                    (getWorkISBN(obra)
                        ? 'ISBN ' +
                            escaparHTML(getWorkISBN(obra))
                        : '') +

                    (getWorkPublisher(obra)
                        ? '<span class="sep">•</span>' +
                            escaparHTML(getWorkPublisher(obra))
                        : '') +

                    (getWorkYear(obra)
                        ? '<span class="sep">•</span>' +
                            escaparHTML(getWorkYear(obra))
                        : '') +

                '</div>' +

                '<div class="authsearch-work-op-chips">' +
                    renderProblemChips(diag.issuesSummary) +
                '</div>' +

                '<div class="authsearch-work-op-submeta">' +

                    (mentions
                        ? escaparHTML(String(mentions)) +
                          ' menç' +
                          (mentions === 1 ? 'ão' : 'ões')
                        : '1 menção') +

                    (lastLink
                        ? ' <span class="sep">|</span> ' +
                          'Última ligação: ' +
                          escaparHTML(lastLink)
                        : '') +

                '</div>' +

                renderResolutionPanel(diag) +

            '</div>' +

            '<div class="authsearch-work-op-actions">' +

                '<button type="button" ' +
                    'class="authsearch-work-op-btn ' +
                    'authsearch-open-resolution" ' +
                    'data-bib="' +
                    escaparHTML(String(diag.biblionumber)) +
                    '">' +

                    '<i class="fa fa-wrench" aria-hidden="true"></i> ' +
                    'Resolver problemas' +

                '</button>' +

                '<a href="' +
                    escaparHTML(urls.opac) +
                    '" class="authsearch-work-op-link" ' +
                    'target="_blank" rel="noopener">' +

                    'Ver no OPAC ' +
                    '<i class="fa fa-external-link" ' +
                        'aria-hidden="true"></i>' +

                '</a>' +

            '</div>' +

        '</div>';
}

function diagnosticoPrincipal(diag) {
    if (diag.issuesSummary.missing9) return "missing9";
    if (diag.issuesSummary.missing4) return "missing4";
    if (diag.issuesSummary.divergentName) return "divergentName";
    if (diag.issuesSummary.dateCheck) return "dateCheck";
    return "";
}

function renderWorksProblematicas($slot) {
    var lista = safeArray(
        STATE.obrasProblemas
    ).filter(obraPassaFiltro);

    var totais = aggregateProblemTotals(
        safeArray(STATE.obrasProblemas)
    );

    var html = '';

    html += renderProblemKpis(totais);
    html += renderProblemToolbar();

    if (STATE.obrasDiagnosticoEmCurso) {
        html += '' +
            '<div class="authsearch-works-loading">' +
                'A analisar as obras ligadas e a identificar problemas…' +
            '</div>';

        $slot.html(html);
        return;
    }

    if (!safeArray(STATE.obrasProblemas).length) {
        html += '' +
            '<div class="authsearch-works-empty-ok">' +
                'Não foram encontrados problemas nas obras ' +
                'associadas a esta autoridade.' +
            '</div>';

        $slot.html(html);
        return;
    }

    if (!lista.length) {
        html += '' +
            '<div class="authsearch-works-empty-muted">' +
                'Não existem obras com o filtro actual.' +
            '</div>';

        $slot.html(html);
        return;
    }

    html += '<div class="authsearch-works-list">';

    lista.forEach(function (diag, idx) {
        html += renderOneProblematicWork(diag, idx);
    });

    html += '</div>';

    html += '' +
        '<div class="authsearch-problem-note" ' +
            'style="margin-top:12px">' +

            '<i class="fa fa-lightbulb-o" aria-hidden="true"></i>' +

            '<span>' +
                'Dica: use “Resolver problemas” para abrir ' +
                'as ocorrências concretas e seguir directamente ' +
                'para a edição do bibliográfico.' +
            '</span>' +

        '</div>';

    $slot.html(html);
}

function diagnosticarListaObras(obras, onDone) {
    obras = safeArray(obras);

    STATE.obrasDiagnosticoEmCurso = true;

    var tarefas = obras.map(function (obra) {
        var bib =
            obra.biblionumber ||
            obra.biblioNumber ||
            obra.id ||
            "";

        if (!bib) {
            return $.Deferred()
                .resolve(null)
                .promise();
        }

        return fetchMarcXmlForWork(bib)
            .then(function (xml) {
                return diagnosticarObra(obra, xml);
            })
            .catch(function () {
                return null;
            });
    });

    $.when.apply($, tarefas).then(function () {
        var args = Array.prototype.slice.call(arguments);
        var resultados;

        if (tarefas.length === 1) {
            resultados = [arguments[0]];
        } else {
            resultados = args;
        }

        resultados = resultados.filter(function (r) {
            return r && r.hasProblems;
        });

        STATE.obrasProblemas =
            sortProblematicalWorks(resultados);

        STATE.obrasProblemasPorBib = {};

        STATE.obrasProblemas.forEach(function (d) {
            STATE.obrasProblemasPorBib[
                String(d.biblionumber)
            ] = d;
        });

        STATE.obrasDiagnosticoEmCurso = false;

        if (typeof onDone === "function") {
            onDone(STATE.obrasProblemas);
        }

    }).fail(function () {
        STATE.obrasProblemas = [];
        STATE.obrasProblemasPorBib = {};
        STATE.obrasDiagnosticoEmCurso = false;

        if (typeof onDone === "function") {
            onDone([]);
        }
    });
}

/* ============================================================
   EVENTOS
   ============================================================ */

$(document)
    .off(".authsearchworksproblems")

    .on(
        "click.authsearchworksproblems",
        "[data-problem-filter]",
        function () {
            var filtro =
                $(this).attr("data-problem-filter") ||
                "todos";

            STATE.obrasFiltroProblema = filtro;

            var $slot =
                $("#authsearch-works-problem-slot");

            if ($slot.length) {
                renderWorksProblematicas($slot);
            }
        }
    )

    .on(
        "change.authsearchworksproblems",
        "#authsearch-problem-select",
        function () {
            STATE.obrasFiltroProblema =
                $(this).val() ||
                "todos";

            var $slot =
                $("#authsearch-works-problem-slot");

            if ($slot.length) {
                renderWorksProblematicas($slot);
            }
        }
    )

    .on(
        "input.authsearchworksproblems",
        "#authsearch-problem-search",
        function () {
            STATE.obrasFiltroTexto =
                $(this).val() ||
                "";

            var $slot =
                $("#authsearch-works-problem-slot");

            if ($slot.length) {
                renderWorksProblematicas($slot);
            }
        }
    )

    .on(
        "click.authsearchworksproblems",
        ".authsearch-open-resolution",
        function () {
            var bib =
                String($(this).data("bib") || "");

            if (!bib) return;

            STATE.obrasResolucaoAberta[bib] =
                !STATE.obrasResolucaoAberta[bib];

            var $slot =
                $("#authsearch-works-problem-slot");

            if ($slot.length) {
                renderWorksProblematicas($slot);
            }
        }
    )

    .on(
        "click.authsearchworksproblems",
        ".authsearch-close-resolution",
        function () {
            var bib =
                String($(this).data("bib") || "");

            if (!bib) return;

            STATE.obrasResolucaoAberta[bib] = false;

            var $slot =
                $("#authsearch-works-problem-slot");

            if ($slot.length) {
                renderWorksProblematicas($slot);
            }
        }
    );

/* ============================================================
   FUNÇÃO PRINCIPAL DE RENDER
   Deve ser chamada onde hoje é renderizado “Obras no catálogo”.
   ============================================================ */

function renderObrasNoCatalogoApenasComProblemas(obrasLigadas) {
    var $body =
        $("#authsearch-works-problem-slot");

    if (!$body.length) {
        var $worksAccordionBody =
            $(".authsearch-accordion")
                .filter(function () {
                    return (
                        $(this)
                            .find(".authsearch-accordion-title")
                            .text() || ""
                    ).indexOf("Obras no catálogo") !== -1;
                })
                .find(".authsearch-accordion-body")
                .first();

        if (!$worksAccordionBody.length) return;

        $worksAccordionBody.html(
            '<div id="authsearch-works-problem-slot"></div>'
        );

        $body =
            $("#authsearch-works-problem-slot");
    }

    renderWorksProblematicas($body);

    diagnosticarListaObras(
        obrasLigadas || [],
        function () {
            renderWorksProblematicas($body);
            atualizarCabecalhoObrasComProblemas();
        }
    );
}

function atualizarCabecalhoObrasComProblemas() {
    var totalProblemas =
        safeArray(STATE.obrasProblemas).length;

    $(".authsearch-accordion").each(function () {
        var $acc = $(this);
        var $title =
            $acc.find(".authsearch-accordion-title").first();
        var $sub =
            $acc.find(".authsearch-accordion-sub").first();

        if (
            ($title.text() || "")
                .indexOf("Obras no catálogo") === -1
        ) return;

        $title.text(
            "Obras no catálogo com problemas · " +
            totalProblemas
        );

        $sub.text(
            totalProblemas +
            " obras requerem intervenção"
        );
    });
}

/* ============================================================
   CHAMADA DE INTEGRAÇÃO
   Executar APÓS STATE.obrasLigadasPreload estar preenchido.
   ============================================================ */

if (
    STATE.obrasLigadasPreload &&
    STATE.obrasLigadasPreload.length
) {
    renderObrasNoCatalogoApenasComProblemas(
        STATE.obrasLigadasPreload
    );
}
