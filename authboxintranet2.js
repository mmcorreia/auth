/* ==========================================================
   AuthBox / Koha Intranet
   Miguel Mimoso Correia CC-BY-NC-SA

   Caixa compacta de autoridade para a página bibliográfica
   do interface profissional do Koha.

   - Apenas Intranet: /cgi-bin/koha/catalogue/detail.pl
   - Autor principal sempre visível
   - Co-autorias e responsabilidades secundárias em acordeão
   - Wikidata / Wikipédia
   - VIAF, ISNI, LoC, BnF, GND e Wikidata
   - Ligação ao registo de autoridade e aos títulos associados
   - Inserção por baixo de "Relatório de modificações"
   - Compatível com IntranetUserJS
   ========================================================== */

(function () {
  'use strict';

  if (window.__authBoxIntranetLoaded) return;
  window.__authBoxIntranetLoaded = true;

  const CONFIG = {
    maxAutoridades: 10,
    cacheMinutos: 20,
    langs: ['pt', 'pt-br', 'en', 'fr', 'es'],
    campos: {
      '700': 'Autor',
      '701': 'Co-autor',
      '702': 'Autor secundário'
    },
    externalIds: [
      { prop: 'P214', label: 'VIAF', url: 'https://viaf.org/viaf/$1' },
      { prop: 'P213', label: 'ISNI', url: 'https://isni.org/isni/$1' },
      { prop: 'P244', label: 'LoC', url: 'https://id.loc.gov/authorities/names/$1' },
      { prop: 'P268', label: 'BnF', url: 'https://catalogue.bnf.fr/ark:/12148/cb$1' },
      { prop: 'P227', label: 'GND', url: 'https://d-nb.info/gnd/$1' }
    ]
  };

  const cacheQID = new Map();
  const cacheWikidata = new Map();
  const cacheLabels = new Map();
  const cacheWikipedia = new Map();

  arrancar();

  function arrancar() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        setTimeout(initAuthBoxIntranet, 500);
      }, { once: true });
    } else {
      setTimeout(initAuthBoxIntranet, 500);
    }
  }

  async function initAuthBoxIntranet() {
    if (!ehPaginaDetalheBibliografico()) return;
    if (document.querySelector('#authbox-intranet')) return;

    const biblionumber = obterBiblionumber();
    if (!biblionumber) return;

    const alvo = localizarAbaixoRelatorioModificacoes();
    if (!alvo) {
      console.warn('AuthBox: não foi possível localizar o bloco "Relatório de modificações".');
      return;
    }

    inserirEstilos();
    const caixa = criarCaixa();
    inserirDepois(alvo, caixa);

    const content = caixa.querySelector('.authbox-intranet-content');
    content.innerHTML = '<div class="authbox-intranet-loading">A carregar autoridade…</div>';

    try {
      let autores = recolherAutoresVisiveis();

      if (!autores.length || autores.some(function (a) { return !a.authid; })) {
        const autoresMarc = await recolherAutoresDoMarc(biblionumber);
        autores = combinarAutores(autores, autoresMarc);
      }

      autores = autores
        .filter(function (a) { return a.nome && a.authid; })
        .filter(function (a, i, arr) {
          return arr.findIndex(function (b) { return b.authid === a.authid; }) === i;
        })
        .slice(0, CONFIG.maxAutoridades);

      if (!autores.length) {
        content.innerHTML = '<div class="authbox-intranet-empty">Não foi encontrada uma autoridade ligada aos campos 700/701/702.</div>';
        return;
      }

      const resultados = [];
      for (const autor of autores) {
        const qid = await obterQID(autor.authid);
        resultados.push({ autor: autor, qid: qid });
      }

      renderizar(content, resultados);
    } catch (e) {
      console.error('AuthBox: erro ao construir caixa intranet', e);
      content.innerHTML = '<div class="authbox-intranet-empty">Não foi possível carregar a informação de autoridade.</div>';
    }
  }

  function ehPaginaDetalheBibliografico() {
    return window.location.pathname.indexOf('/cgi-bin/koha/catalogue/detail.pl') !== -1;
  }

  function obterBiblionumber() {
    const m = window.location.search.match(/[?&]biblionumber=(\d+)/i);
    return m ? m[1] : '';
  }

  function localizarAbaixoRelatorioModificacoes() {
    const links = Array.from(document.querySelectorAll('a'));
    const link = links.find(function (a) {
      const t = normalizarTexto(a.textContent);
      return t === 'relatório de modificações' ||
             t === 'relatorio de modificacoes' ||
             t === 'modification log' ||
             t.indexOf('relatório de modificações') !== -1 ||
             t.indexOf('modification log') !== -1;
    });

    if (!link) return null;

    return link.closest('li') ||
           link.closest('.list-group-item') ||
           link.closest('.btn-group') ||
           link.parentElement ||
           link;
  }

  function inserirDepois(alvo, elemento) {
    if (alvo.insertAdjacentElement) {
      alvo.insertAdjacentElement('afterend', elemento);
    } else if (alvo.parentNode) {
      alvo.parentNode.insertBefore(elemento, alvo.nextSibling);
    }
  }

  function criarCaixa() {
    const box = document.createElement('aside');
    box.id = 'authbox-intranet';
    box.setAttribute('aria-label', 'AuthBox');
    box.innerHTML =
      '<div class="authbox-intranet-header">' +
        '<span>AuthBox</span>' +
        '<span class="authbox-intranet-count"></span>' +
      '</div>' +
      '<div class="authbox-intranet-content"></div>' +
      '<div class="authbox-intranet-source">Wikidata · Wikipédia · autoridades locais</div>';
    return box;
  }

  function recolherAutoresVisiveis() {
    const autores = [];

    document.querySelectorAll('#catalogue_detail_biblio .results_summary, .results_summary').forEach(function (bloco) {
      const labelEl = bloco.querySelector('.label, strong, b');
      const label = normalizarTexto(labelEl ? labelEl.textContent : bloco.textContent);

      let papel = '';
      if (label.indexOf('autor secundário') === 0 || label.indexOf('autor secundario') === 0) papel = 'Autor secundário';
      else if (label.indexOf('co-autor') === 0 || label.indexOf('coautor') === 0) papel = 'Co-autor';
      else if (label.indexOf('autor') === 0) papel = 'Autor';
      else return;

      const links = Array.from(bloco.querySelectorAll('a'));
      if (!links.length) return;

      const nomeLink = links.find(function (a) {
        const t = limparTexto(a.textContent);
        return t && !/^(ver|editar|pesquisar)$/i.test(t);
      });

      if (!nomeLink) return;

      let authid = extrairAuthId(nomeLink.href);
      if (!authid) {
        const authorityLink = links.find(function (a) { return extrairAuthId(a.href); });
        authid = authorityLink ? extrairAuthId(authorityLink.href) : '';
      }

      autores.push({
        nome: limparTexto(nomeLink.textContent),
        authid: authid || '',
        papel: papel,
        campo: papel === 'Autor' ? '700' : (papel === 'Co-autor' ? '701' : '702')
      });
    });

    return autores;
  }

  async function recolherAutoresDoMarc(biblionumber) {
    const url = '/cgi-bin/koha/catalogue/MARCdetail.pl?biblionumber=' + encodeURIComponent(biblionumber);
    const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) return [];

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const autores = [];

    // Primeiro: tenta interpretar linha a linha a tabela MARC do Koha.
    const rows = Array.from(doc.querySelectorAll('tr'));
    let campoAtual = '';
    let atual = null;

    function fecharAtual() {
      if (atual && atual.campo && atual.nome && atual.authid) autores.push(atual);
      atual = null;
    }

    rows.forEach(function (tr) {
      const texto = limparTexto(tr.textContent);
      const tagMatch = texto.match(/^(700|701|702)(?:\s|#|_|$)/);

      if (tagMatch) {
        fecharAtual();
        campoAtual = tagMatch[1];
        atual = { campo: campoAtual, papel: CONFIG.campos[campoAtual], nome: '', authid: '' };

        const suba = texto.match(/(?:\$|_)a\s*([^$_]+?)(?=(?:\$|_)[a-z0-9]|$)/i);
        const sub9 = texto.match(/(?:\$|_)9\s*(\d+)/i);
        if (suba) atual.nome = limparTexto(suba[1]);
        if (sub9) atual.authid = sub9[1];
        return;
      }

      if (!campoAtual || !atual) return;
      if (/^\d{3}(?:\s|#|_|$)/.test(texto)) {
        fecharAtual();
        campoAtual = '';
        return;
      }

      const cells = tr.querySelectorAll('th, td');
      if (cells.length >= 2) {
        const label = limparTexto(cells[0].textContent).toLowerCase();
        const valor = limparTexto(cells[cells.length - 1].textContent);
        if (!atual.nome && (/\$?a\b/.test(label) || label === 'nome' || label.indexOf('elemento de entrada') !== -1)) {
          atual.nome = valor;
        }
        if (!atual.authid && (/\$?9\b/.test(label) || label.indexOf('número de autoridade') !== -1 || label.indexOf('authority') !== -1)) {
          const m = valor.match(/\b(\d+)\b/);
          if (m) atual.authid = m[1];
        }
      }

      if (!atual.nome) {
        const suba = texto.match(/(?:\$|_)a\s*([^$_]+?)(?=(?:\$|_)[a-z0-9]|$)/i);
        if (suba) atual.nome = limparTexto(suba[1]);
      }
      if (!atual.authid) {
        const sub9 = texto.match(/(?:\$|_)9\s*(\d+)/i);
        if (sub9) atual.authid = sub9[1];
      }
    });
    fecharAtual();

    // Segundo fallback: procura blocos textuais 700/701/702 com $a e $9.
    if (!autores.length) {
      const texto = String(doc.body ? doc.body.innerText : html).replace(/\r/g, '\n');
      const regex = /(?:^|\n)\s*(700|701|702)\b([\s\S]{0,700}?)(?=\n\s*\d{3}\b|$)/g;
      let m;
      while ((m = regex.exec(texto)) !== null) {
        const campo = m[1];
        const bloco = m[2];
        const ma = bloco.match(/(?:\$|_)a\s*([^$_\n]+?)(?=(?:\$|_)[a-z0-9]|\n|$)/i);
        const m9 = bloco.match(/(?:\$|_)9\s*(\d+)/i);
        if (ma && m9) {
          autores.push({
            campo: campo,
            papel: CONFIG.campos[campo],
            nome: limparTexto(ma[1]),
            authid: m9[1]
          });
        }
      }
    }

    return autores;
  }

  function combinarAutores(visiveis, marc) {
    const saida = [];
    const usados = new Set();

    (visiveis || []).forEach(function (v) {
      let item = Object.assign({}, v);
      if (!item.authid) {
        const nomeNorm = normalizarNome(item.nome);
        const match = (marc || []).find(function (m) {
          return normalizarNome(m.nome) === nomeNorm ||
                 (m.papel === item.papel && nomesSemelhantes(m.nome, item.nome));
        });
        if (match) item = Object.assign({}, match, { nome: item.nome || match.nome });
      }
      const key = item.authid || (item.papel + '|' + normalizarNome(item.nome));
      if (!usados.has(key)) {
        usados.add(key);
        saida.push(item);
      }
    });

    (marc || []).forEach(function (m) {
      const key = m.authid || (m.papel + '|' + normalizarNome(m.nome));
      if (!usados.has(key)) {
        usados.add(key);
        saida.push(m);
      }
    });

    return saida;
  }

  function extrairAuthId(url) {
    try {
      const u = new URL(url, location.origin);
      const authid = u.searchParams.get('authid');
      if (authid && /^\d+$/.test(authid)) return authid;

      const q = u.searchParams.get('q') || '';
      const mq = q.match(/(?:^|\s|:)an[:=]?(\d+)/i) || q.match(/^\d+$/);
      if (mq) return mq[1] || mq[0];

      const d = decodeURIComponent(url);
      const m = d.match(/[?&]authid=(\d+)/i) || d.match(/an:(\d+)/i);
      return m ? m[1] : '';
    } catch (e) {
      const m = String(url || '').match(/[?&]authid=(\d+)/i) || String(url || '').match(/an:(\d+)/i);
      return m ? m[1] : '';
    }
  }

  async function obterQID(authid) {
    if (!authid || !/^\d+$/.test(String(authid))) return null;
    if (cacheQID.has(authid)) return cacheQID.get(authid);

    const cacheKey = 'authbox_intranet_qid_' + authid;
    const cached = lerCache(cacheKey);
    if (cached !== undefined) {
      cacheQID.set(authid, cached);
      return cached;
    }

    const urls = [
      '/cgi-bin/koha/authorities/detail.pl?authid=' + encodeURIComponent(authid),
      '/cgi-bin/koha/authorities/authorities.pl?authid=' + encodeURIComponent(authid)
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
        if (!response.ok) continue;
        const html = await response.text();
        const qid = extrairQIDWikidata(html);
        if (qid) {
          cacheQID.set(authid, qid);
          gravarCache(cacheKey, qid);
          return qid;
        }
      } catch (e) {}
    }

    cacheQID.set(authid, null);
    gravarCache(cacheKey, null);
    return null;
  }

  function extrairQIDWikidata(html) {
    const texto = String(html || '').replace(/\s+/g, ' ');
    const matches = Array.from(texto.matchAll(/Q[1-9]\d{2,}/g));
    for (const match of matches) {
      const pos = match.index || 0;
      const contexto = texto.slice(Math.max(0, pos - 500), pos + 500).toLowerCase();
      if (contexto.indexOf('wikidata') !== -1) return match[0];
    }
    return null;
  }

  async function obterEntidade(qid) {
    if (!qid || !/^Q[1-9]\d*$/.test(qid)) return null;
    if (cacheWikidata.has(qid)) return cacheWikidata.get(qid);

    const cacheKey = 'authbox_intranet_wd_' + qid;
    const cached = lerCache(cacheKey);
    if (cached !== undefined) {
      cacheWikidata.set(qid, cached);
      return cached;
    }

    try {
      const url = 'https://www.wikidata.org/wiki/Special:EntityData/' + encodeURIComponent(qid) + '.json';
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = await response.json();
      const entidade = data.entities && data.entities[qid];
      if (!entidade || entidade.missing) return null;
      cacheWikidata.set(qid, entidade);
      gravarCache(cacheKey, entidade);
      return entidade;
    } catch (e) {
      console.warn('AuthBox: erro Wikidata', qid, e);
      return null;
    }
  }

  async function renderizar(content, resultados) {
    content.innerHTML = '';

    const principal = resultados.find(function (r) { return r.autor.papel === 'Autor' || r.autor.campo === '700'; }) || resultados[0];
    const restantes = resultados.filter(function (r) { return r !== principal; });

    if (principal) {
      const html = await construirCartao(principal.autor, principal.qid, true);
      content.insertAdjacentHTML('beforeend', html);
    }

    if (restantes.length) {
      const details = document.createElement('details');
      details.className = 'authbox-intranet-details';
      const summary = document.createElement('summary');
      summary.textContent = 'Outras responsabilidades (' + restantes.length + ')';
      details.appendChild(summary);

      for (const item of restantes) {
        const html = await construirCartao(item.autor, item.qid, false);
        details.insertAdjacentHTML('beforeend', html);
      }
      content.appendChild(details);
    }

    const count = document.querySelector('.authbox-intranet-count');
    if (count) count.textContent = String(resultados.length);
  }

  async function construirCartao(autor, qid, principal) {
    const authorityUrl = '/cgi-bin/koha/authorities/detail.pl?authid=' + encodeURIComponent(autor.authid);
    const obrasUrl = '/cgi-bin/koha/catalogue/search.pl?q=an:' + encodeURIComponent(autor.authid);

    if (!qid) {
      return construirCartaoSemWikidata(autor, principal, authorityUrl, obrasUrl);
    }

    const entidade = await obterEntidade(qid);
    if (!entidade) {
      return construirCartaoSemWikidata(autor, principal, authorityUrl, obrasUrl);
    }

    const nome = obterTextoMultilingue(entidade.labels) || autor.nome || qid;
    const descricao = obterDescricao(entidade);
    const imagem = obterValorClaim(entidade, 'P18');
    const nascimento = obterDataClaim(entidade, 'P569');
    const morte = obterDataClaim(entidade, 'P570');
    const wikipedia = obterWikipediaInfo(entidade, nome);
    const resumo = principal && wikipedia ? await obterResumoWikipedia(wikipedia) : null;
    const externos = obterIdentificadoresExternos(entidade, qid);

    let html = '<article class="authbox-intranet-card' + (principal ? ' is-main' : '') + '">';
    html += '<div class="authbox-intranet-top">';

    if (imagem) {
      html += '<div class="authbox-intranet-photo"><img src="' + escapeAttr(imagemCommons(imagem)) + '" alt=""></div>';
    } else {
      html += '<div class="authbox-intranet-photo is-empty"><span>' + escapeHtml(iniciais(nome)) + '</span></div>';
    }

    html += '<div class="authbox-intranet-heading">';
    html += '<div class="authbox-intranet-name">' + escapeHtml(nome) + '</div>';
    html += '<div class="authbox-intranet-role">' + escapeHtml(autor.papel || CONFIG.campos[autor.campo] || 'Autor') + '</div>';
    if (descricao) html += '<div class="authbox-intranet-desc">' + escapeHtml(descricao) + '</div>';
    if (nascimento || morte) {
      html += '<div class="authbox-intranet-dates">' + escapeHtml([nascimento, morte].filter(Boolean).join(' – ')) + '</div>';
    }
    html += '</div></div>';

    if (resumo && resumo.extract) {
      html += '<div class="authbox-intranet-summary">' + escapeHtml(resumo.extract) + '</div>';
    }

    html += '<div class="authbox-intranet-actions">';
    html += '<a href="' + escapeAttr(authorityUrl) + '">Autoridade</a>';
    html += '<a href="' + escapeAttr(obrasUrl) + '">Títulos</a>';
    if (wikipedia && wikipedia.url) html += '<a href="' + escapeAttr(wikipedia.url) + '" target="_blank" rel="noopener noreferrer">Wikipédia</a>';
    html += '</div>';

    if (externos.length) {
      html += '<div class="authbox-intranet-ids">';
      externos.forEach(function (ext) {
        html += '<a href="' + escapeAttr(ext.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(ext.label) + '</a>';
      });
      html += '</div>';
    }

    html += '</article>';
    return html;
  }

  function construirCartaoSemWikidata(autor, principal, authorityUrl, obrasUrl) {
    return '<article class="authbox-intranet-card' + (principal ? ' is-main' : '') + '">' +
      '<div class="authbox-intranet-top">' +
        '<div class="authbox-intranet-photo is-empty"><span>' + escapeHtml(iniciais(autor.nome)) + '</span></div>' +
        '<div class="authbox-intranet-heading">' +
          '<div class="authbox-intranet-name">' + escapeHtml(autor.nome) + '</div>' +
          '<div class="authbox-intranet-role">' + escapeHtml(autor.papel || CONFIG.campos[autor.campo] || 'Autor') + '</div>' +
          '<div class="authbox-intranet-unlinked">Sem ligação Wikidata identificada</div>' +
        '</div>' +
      '</div>' +
      '<div class="authbox-intranet-actions">' +
        '<a href="' + escapeAttr(authorityUrl) + '">Autoridade</a>' +
        '<a href="' + escapeAttr(obrasUrl) + '">Títulos</a>' +
      '</div>' +
    '</article>';
  }

  function obterTextoMultilingue(obj) {
    if (!obj) return '';
    for (const lang of CONFIG.langs) {
      if (obj[lang] && obj[lang].value) return obj[lang].value;
    }
    const first = Object.keys(obj)[0];
    return first && obj[first] ? obj[first].value || '' : '';
  }

  function obterDescricao(entidade) {
    return obterTextoMultilingue(entidade && entidade.descriptions);
  }

  function obterValorClaim(entidade, prop) {
    try {
      return entidade.claims[prop][0].mainsnak.datavalue.value;
    } catch (e) {
      return null;
    }
  }

  function obterDataClaim(entidade, prop) {
    try {
      const v = entidade.claims[prop][0].mainsnak.datavalue.value;
      return formatarData(v.time, v.precision);
    } catch (e) {
      return '';
    }
  }

  function formatarData(time, precision) {
    const m = String(time || '').match(/^([+-])(\d{4,})-(\d{2})-(\d{2})/);
    if (!m) return '';
    if (m[1] === '-') return m[2] + ' a.C.';
    if (precision >= 11) return m[4] + '/' + m[3] + '/' + m[2];
    if (precision === 10) return m[3] + '/' + m[2];
    return m[2];
  }

  function obterWikipediaInfo(entidade, nome) {
    if (entidade && entidade.sitelinks) {
      for (const key of ['ptwiki', 'enwiki']) {
        if (entidade.sitelinks[key] && entidade.sitelinks[key].title) {
          const lang = key.replace('wiki', '');
          const title = entidade.sitelinks[key].title;
          return {
            lang: lang,
            title: title,
            url: 'https://' + lang + '.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_'))
          };
        }
      }
    }
    return nome ? {
      lang: 'pt',
      title: nome,
      url: 'https://pt.wikipedia.org/w/index.php?search=' + encodeURIComponent(nome)
    } : null;
  }

  async function obterResumoWikipedia(info) {
    if (!info || !info.lang || !info.title) return null;
    const key = info.lang + '|' + info.title;
    if (cacheWikipedia.has(key)) return cacheWikipedia.get(key);

    try {
      const url = 'https://' + info.lang + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(info.title.replace(/ /g, '_'));
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = await response.json();
      let extract = limparTexto(data.extract || '');
      if (extract.length > 230) extract = extract.slice(0, 227).replace(/\s+\S*$/, '') + '…';
      const out = { extract: extract, url: info.url };
      cacheWikipedia.set(key, out);
      return out;
    } catch (e) {
      cacheWikipedia.set(key, null);
      return null;
    }
  }

  function obterIdentificadoresExternos(entidade, qid) {
    const out = [];
    CONFIG.externalIds.forEach(function (ext) {
      try {
        const v = entidade.claims[ext.prop][0].mainsnak.datavalue.value;
        if (v) out.push({ label: ext.label, url: ext.url.replace('$1', encodeURIComponent(String(v).replace(/\s+/g, ''))) });
      } catch (e) {}
    });
    if (qid) out.push({ label: 'Wikidata', url: 'https://www.wikidata.org/wiki/' + encodeURIComponent(qid) });
    return out;
  }

  function imagemCommons(filename) {
    return 'https://commons.wikimedia.org/wiki/Special:Redirect/file/' + encodeURIComponent(String(filename || '').replace(/ /g, '_'));
  }

  function lerCache(key) {
    if (!CONFIG.cacheMinutos) return undefined;
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.expires || Date.now() > parsed.expires) {
        sessionStorage.removeItem(key);
        return undefined;
      }
      return parsed.value;
    } catch (e) {
      return undefined;
    }
  }

  function gravarCache(key, value) {
    if (!CONFIG.cacheMinutos) return;
    try {
      sessionStorage.setItem(key, JSON.stringify({
        value: value,
        expires: Date.now() + CONFIG.cacheMinutos * 60 * 1000
      }));
    } catch (e) {}
  }

  function normalizarNome(texto) {
    return limparTexto(texto)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,;:()\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function nomesSemelhantes(a, b) {
    const na = normalizarNome(a);
    const nb = normalizarNome(b);
    return na === nb || na.indexOf(nb) !== -1 || nb.indexOf(na) !== -1;
  }

  function normalizarTexto(texto) {
    return limparTexto(texto)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/:$/, '')
      .trim();
  }

  function limparTexto(texto) {
    return String(texto || '').replace(/\s+/g, ' ').trim();
  }

  function iniciais(nome) {
    return String(nome || '')
      .replace(/,\s*\d{4}.*/g, '')
      .replace(/,/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (p) { return p.charAt(0).toUpperCase(); })
      .join('');
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m];
    });
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }

  function inserirEstilos() {
    if (document.querySelector('#authbox-intranet-style')) return;
    const style = document.createElement('style');
    style.id = 'authbox-intranet-style';
    style.textContent = `
#authbox-intranet {
  display:block;
  width:100%;
  box-sizing:border-box;
  margin:14px 0 0 0;
  border:1px solid #d8dee8;
  border-radius:4px;
  background:#fff;
  box-shadow:0 1px 4px rgba(15,23,42,.08);
  overflow:hidden;
  color:#1f2937;
  font-size:12px;
}
#authbox-intranet * { box-sizing:border-box; }
.authbox-intranet-header {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  padding:10px 12px;
  border-bottom:1px solid #e5e7eb;
  background:#f8fafc;
  color:#182433;
  font-size:13px;
  font-weight:700;
}
.authbox-intranet-count {
  min-width:19px;
  height:19px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:0 6px;
  border-radius:999px;
  background:#e8eef7;
  color:#31527d;
  font-size:10px;
}
.authbox-intranet-content { padding:0 11px 8px 11px; }
.authbox-intranet-loading,
.authbox-intranet-empty {
  padding:12px 2px;
  color:#6b7280;
  line-height:1.35;
}
.authbox-intranet-card {
  padding:12px 0;
  border-bottom:1px solid #edf0f3;
}
.authbox-intranet-card:last-child { border-bottom:0; }
.authbox-intranet-top {
  display:flex;
  align-items:flex-start;
  gap:9px;
}
.authbox-intranet-photo {
  flex:0 0 48px;
  width:48px;
  height:60px;
  border:1px solid #dfe5ec;
  border-radius:5px;
  overflow:hidden;
  background:#f3f6f9;
  display:flex;
  align-items:center;
  justify-content:center;
}
.authbox-intranet-card.is-main .authbox-intranet-photo {
  flex-basis:62px;
  width:62px;
  height:78px;
}
.authbox-intranet-photo img {
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
.authbox-intranet-photo.is-empty span {
  font-weight:700;
  font-size:18px;
  color:#78879a;
}
.authbox-intranet-heading { min-width:0; flex:1; }
.authbox-intranet-name {
  font-size:13px;
  font-weight:700;
  line-height:1.25;
  overflow-wrap:anywhere;
}
.authbox-intranet-role {
  display:inline-block;
  margin-top:4px;
  padding:2px 6px;
  border-radius:999px;
  background:#edf4fb;
  color:#315d86;
  font-size:10px;
  font-weight:600;
}
.authbox-intranet-desc,
.authbox-intranet-dates,
.authbox-intranet-unlinked {
  margin-top:4px;
  color:#667085;
  font-size:10.5px;
  line-height:1.3;
}
.authbox-intranet-summary {
  margin-top:9px;
  padding:8px;
  border:1px solid #edf0f3;
  border-radius:4px;
  background:#fafcfe;
  color:#445164;
  font-size:10.5px;
  line-height:1.4;
}
.authbox-intranet-actions,
.authbox-intranet-ids {
  display:flex;
  flex-wrap:wrap;
  gap:5px;
  margin-top:9px;
}
.authbox-intranet-actions a,
.authbox-intranet-ids a {
  display:inline-flex;
  align-items:center;
  min-height:22px;
  padding:3px 7px;
  border:1px solid #dbe3ed;
  border-radius:4px;
  background:#fff;
  color:#245d92 !important;
  text-decoration:none !important;
  font-size:10px;
  line-height:1;
}
.authbox-intranet-actions a:hover,
.authbox-intranet-ids a:hover {
  background:#f1f6fb;
  border-color:#bfd0e2;
}
.authbox-intranet-ids { margin-top:5px; }
.authbox-intranet-ids a {
  min-height:19px;
  padding:2px 5px;
  font-size:9.5px;
  color:#64748b !important;
}
.authbox-intranet-details {
  margin:7px 0 2px 0;
  border-top:1px solid #edf0f3;
}
.authbox-intranet-details > summary {
  cursor:pointer;
  padding:9px 0 5px 0;
  color:#526173;
  font-weight:600;
  font-size:10.5px;
}
.authbox-intranet-source {
  padding:7px 11px 9px 11px;
  border-top:1px solid #edf0f3;
  background:#fbfcfd;
  color:#98a2b3;
  font-size:9px;
  line-height:1.3;
}
`;
    document.head.appendChild(style);
  }
})();
