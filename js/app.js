/* ========================================
   历史上的今天大事件站 - 核心逻辑
   ======================================== */

(function () {
  'use strict';

  const CATEGORY_NAMES = {
    all: '全部',
    politics: '政治',
    military: '军事',
    tech: '科技',
    culture: '文化',
    sports: '体育',
    economy: '经济',
    birth: '名人诞辰',
    death: '名人逝世',
    disaster: '重大灾害',
    society: '社会事件'
  };

  const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

  const CONSTELLATIONS = [
    { name: '摩羯座', start: [1, 1], end: [1, 19] },
    { name: '水瓶座', start: [1, 20], end: [2, 18] },
    { name: '双鱼座', start: [2, 19], end: [3, 20] },
    { name: '白羊座', start: [3, 21], end: [4, 19] },
    { name: '金牛座', start: [4, 20], end: [5, 20] },
    { name: '双子座', start: [5, 21], end: [6, 21] },
    { name: '巨蟹座', start: [6, 22], end: [7, 22] },
    { name: '狮子座', start: [7, 23], end: [8, 22] },
    { name: '处女座', start: [8, 23], end: [9, 22] },
    { name: '天秤座', start: [9, 23], end: [10, 23] },
    { name: '天蝎座', start: [10, 24], end: [11, 22] },
    { name: '射手座', start: [11, 23], end: [12, 21] },
    { name: '摩羯座', start: [12, 22], end: [12, 31] }
  ];

  const DYNASTIES = [
    { name: '夏朝', start: -2070, end: -1600 },
    { name: '商朝', start: -1600, end: -1046 },
    { name: '西周', start: -1046, end: -771 },
    { name: '东周(春秋战国)', start: -770, end: -256 },
    { name: '秦朝', start: -221, end: -206 },
    { name: '西汉', start: -202, end: 8 },
    { name: '东汉', start: 25, end: 220 },
    { name: '三国', start: 220, end: 280 },
    { name: '西晋', start: 266, end: 316 },
    { name: '东晋十六国', start: 317, end: 420 },
    { name: '南北朝', start: 420, end: 589 },
    { name: '隋朝', start: 581, end: 618 },
    { name: '唐朝', start: 618, end: 907 },
    { name: '五代十国', start: 907, end: 979 },
    { name: '北宋', start: 960, end: 1127 },
    { name: '南宋', start: 1127, end: 1279 },
    { name: '元朝', start: 1271, end: 1368 },
    { name: '明朝', start: 1368, end: 1644 },
    { name: '清朝', start: 1644, end: 1912 },
    { name: '中华民国', start: 1912, end: 1949 },
    { name: '中华人民共和国', start: 1949, end: 9999 }
  ];

  const state = {
    allEvents: [],
    filteredEvents: [],
    currentMonth: 1,
    currentDay: 1,
    currentCategory: 'all',
    currentSort: 'year-desc',
    searchKeyword: '',
    favorites: new Set(),
    showFavoritesOnly: false,
    selectedEvent: null
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function resolveDataPath() {
    return 'data/data.json';
  }

  function getDaysInMonth(month) {
    const days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return days[month - 1];
  }

  function formatDateCN(month, day) {
    return `${month}月${day}日`;
  }

  function formatYearDisplay(year, isBC) {
    if (isBC) return `公元前 ${Math.abs(year)}年`;
    return `公元 ${year}年`;
  }

  function formatYearShort(year, isBC) {
    if (isBC) return `${Math.abs(year)} BC`;
    return `${year}`;
  }

  function getStars(importance) {
    const imp = Math.max(1, Math.min(5, importance || 1));
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += i < imp ? '★' : '☆';
    }
    return stars;
  }

  function getStarsHTML(importance) {
    const imp = Math.max(1, Math.min(5, importance || 1));
    let html = '<span class="importance-stars">';
    for (let i = 0; i < 5; i++) {
      html += `<span class="star ${i < imp ? '' : 'empty'}">★</span>`;
    }
    html += '</span>';
    return html;
  }

  function getZodiacAnimal(year) {
    const y = year < 0 ? year + 1 : year;
    const idx = ((y - 4) % 12 + 12) % 12;
    return ZODIAC_ANIMALS[idx];
  }

  function getConstellation(month, day) {
    for (const c of CONSTELLATIONS) {
      if (month === c.start[0]) {
        if (day >= c.start[1] && (month !== c.end[0] || day <= (CONSTELLATIONS.find(x => x.name === c.name && x !== c)?.end[1] || 31))) {
          return c.name;
        }
      }
      if (month === c.end[0] && day <= c.end[1]) {
        return c.name;
      }
    }
    return '摩羯座';
  }

  function getConstellationRange(month) {
    const list = [];
    for (const c of CONSTELLATIONS) {
      if (c.start[0] === month || c.end[0] === month) {
        const startMonth = c.start[0];
        const startDay = c.start[1];
        const endMonth = c.end[0];
        const endDay = c.end[1];
        if (!list.includes(c.name)) {
          list.push(`${c.name}(${startMonth}/${startDay}-${endMonth}/${endDay})`);
        }
      }
    }
    return list.join('、') || '--';
  }

  function getDynastyByYear(year) {
    for (const d of DYNASTIES) {
      if (year >= d.start && year <= d.end) return d.name;
    }
    return year < -2070 ? '上古时期' : '近现代';
  }

  function getPicsumImage(seed, w = 600, h = 400) {
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
  }

  function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function storageGet(key, defaultValue) {
    try {
      const v = localStorage.getItem(key);
      if (v === null) return defaultValue;
      return JSON.parse(v);
    } catch (e) {
      return defaultValue;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { }
  }

  function initTheme() {
    const saved = storageGet('ht_theme', 'system');
    applyTheme(saved === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : saved);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const cur = storageGet('ht_theme', 'system');
      if (cur === 'system') applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
  }

  function toggleTheme() {
    const saved = storageGet('ht_theme', 'system');
    let next;
    if (saved === 'system') next = 'light';
    else if (saved === 'light') next = 'dark';
    else next = 'system';
    storageSet('ht_theme', next);
    if (next === 'system') {
      applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } else {
      applyTheme(next);
    }
  }

  function loadFavorites() {
    const favs = storageGet('ht_favorites', []);
    state.favorites = new Set(favs);
    updateFavCount();
  }

  function saveFavorites() {
    storageSet('ht_favorites', Array.from(state.favorites));
    updateFavCount();
  }

  function updateFavCount() {
    const el = $('#favCount');
    if (el) el.textContent = state.favorites.size;
  }

  function toggleFavorite(id) {
    if (state.favorites.has(id)) {
      state.favorites.delete(id);
    } else {
      state.favorites.add(id);
    }
    saveFavorites();
    renderTimeline();
  }

  function toggleShowFavorites() {
    state.showFavoritesOnly = !state.showFavoritesOnly;
    const btn = $('#favToggle');
    if (btn) btn.style.boxShadow = state.showFavoritesOnly ? 'inset 0 0 0 2px var(--primary-color)' : '';
    renderTimeline();
  }

  function initDaySelect() {
    const monthSel = $('#monthSelect');
    const daySel = $('#daySelect');
    if (!monthSel || !daySel) return;

    function populateDays(month) {
      const days = getDaysInMonth(month);
      const curVal = parseInt(daySel.value) || 1;
      daySel.innerHTML = '';
      for (let d = 1; d <= days; d++) {
        const opt = document.createElement('option');
        opt.value = String(d);
        opt.textContent = `${d}日`;
        daySel.appendChild(opt);
      }
      daySel.value = String(Math.min(curVal, days));
    }

    monthSel.addEventListener('change', () => {
      const m = parseInt(monthSel.value);
      state.currentMonth = m;
      populateDays(m);
      applyFilters();
      updateSidebar();
    });

    daySel.addEventListener('change', () => {
      state.currentDay = parseInt(daySel.value) || 1;
      applyFilters();
    });

    const today = new Date();
    state.currentMonth = today.getMonth() + 1;
    state.currentDay = today.getDate();
    monthSel.value = String(state.currentMonth);
    populateDays(state.currentMonth);
    daySel.value = String(state.currentDay);

    $('#todayDate').textContent = `${today.getFullYear()}年${formatDateCN(state.currentMonth, state.currentDay)}`;
  }

  function initCategoryTabs() {
    const tabs = $$('#categoryTabs .tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.currentCategory = tab.dataset.category;
        applyFilters();
      });
    });
  }

  function initSearch() {
    const input = $('#searchInput');
    const clearBtn = $('#searchClear');
    if (!input) return;

    const debouncedSearch = debounce(() => {
      state.searchKeyword = input.value.trim();
      applyFilters();
    }, 300);

    input.addEventListener('input', () => {
      if (clearBtn) {
        clearBtn.classList.toggle('show', input.value.length > 0);
      }
      debouncedSearch();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        state.searchKeyword = '';
        clearBtn.classList.remove('show');
        applyFilters();
      });
    }
  }

  function initSort() {
    const sel = $('#sortSelect');
    if (!sel) return;
    sel.addEventListener('change', () => {
      state.currentSort = sel.value;
      applyFilters();
    });
  }

  function applyFilters() {
    let list = state.allEvents.filter(e => e.month === state.currentMonth && e.day === state.currentDay);

    if (state.currentCategory !== 'all') {
      list = list.filter(e => e.category === state.currentCategory);
    }

    if (state.searchKeyword) {
      const kw = state.searchKeyword.toLowerCase();
      list = list.filter(e => {
        if (e.title?.toLowerCase().includes(kw)) return true;
        if (e.summary?.toLowerCase().includes(kw)) return true;
        if (e.content?.toLowerCase().includes(kw)) return true;
        if (e.location?.toLowerCase().includes(kw)) return true;
        if (e.tags?.some(t => t.toLowerCase().includes(kw))) return true;
        if (e.persons?.some(p => p.name?.toLowerCase().includes(kw) || p.intro?.toLowerCase().includes(kw))) return true;
        return false;
      });
    }

    if (state.showFavoritesOnly) {
      list = list.filter(e => state.favorites.has(e.id));
    }

    const [sortKey, sortOrder] = state.currentSort.split('-');
    list.sort((a, b) => {
      let va, vb;
      if (sortKey === 'year') {
        va = (a.isBC ? -1 : 1) * Math.abs(a.year);
        vb = (b.isBC ? -1 : 1) * Math.abs(b.year);
      } else {
        va = a.importance || 1;
        vb = b.importance || 1;
      }
      return sortOrder === 'desc' ? vb - va : va - vb;
    });

    state.filteredEvents = list;
    renderTimeline();
  }

  function renderTimeline() {
    const loading = $('#loadingState');
    const empty = $('#emptyState');
    const favEmpty = $('#favEmptyState');
    const container = $('#timelineContainer');
    const timeline = $('#timeline');
    const resultCount = $('#resultCount');
    const currentFilter = $('#currentFilter');

    if (loading) loading.style.display = 'none';

    if (state.showFavoritesOnly && state.filteredEvents.length === 0 && state.allEvents.length > 0) {
      if (container) container.style.display = 'none';
      if (empty) empty.style.display = 'none';
      if (favEmpty) favEmpty.style.display = 'flex';
      return;
    }

    if (favEmpty) favEmpty.style.display = 'none';

    if (state.filteredEvents.length === 0) {
      if (container) container.style.display = 'none';
      if (empty) empty.style.display = 'flex';
      return;
    }

    if (empty) empty.style.display = 'none';
    if (container) container.style.display = 'block';

    if (resultCount) resultCount.textContent = `共 ${state.filteredEvents.length} 条事件`;
    if (currentFilter) {
      const parts = [];
      parts.push(formatDateCN(state.currentMonth, state.currentDay));
      if (state.currentCategory !== 'all') parts.push(CATEGORY_NAMES[state.currentCategory]);
      if (state.searchKeyword) parts.push(`搜索:"${state.searchKeyword}"`);
      if (state.showFavoritesOnly) parts.push('仅收藏');
      currentFilter.textContent = parts.join(' · ');
    }

    if (timeline) {
      timeline.innerHTML = state.filteredEvents.map(e => renderTimelineItem(e)).join('');

      timeline.querySelectorAll('.timeline-item').forEach(item => {
        item.addEventListener('click', (ev) => {
          if (ev.target.closest('.card-fav-btn')) {
            ev.stopPropagation();
            const id = parseInt(ev.target.closest('.card-fav-btn').dataset.id);
            toggleFavorite(id);
            return;
          }
          const id = parseInt(item.dataset.id);
          openDetailModal(id);
        });
      });
    }
  }

  function renderTimelineItem(e) {
    const isFav = state.favorites.has(e.id);
    const yearDisplay = formatYearShort(e.year, e.isBC);
    const personsText = e.persons?.length ? e.persons.slice(0, 3).map(p => p.name).join('、') : '';
    const yearBadgeClass = e.isBC ? '' : '';

    return `
      <div class="timeline-item" data-id="${e.id}" data-category="${e.category}">
        <div class="timeline-dot">${yearDisplay.slice(0, 2)}</div>
        <div class="event-card">
          <div class="card-image-wrap">
            <img class="card-image" src="${e.image || getPicsumImage(e.id + '-' + e.title)}" alt="${e.title || ''}" loading="lazy" onerror="this.src='${getPicsumImage('default-' + e.id)}'">
            <span class="card-year-badge ${yearBadgeClass}">${formatYearShort(e.year, e.isBC)}</span>
            <button class="card-fav-btn ${isFav ? 'favorited' : ''}" data-id="${e.id}" title="收藏">
              ${isFav ? '★' : '☆'}
            </button>
          </div>
          <div class="card-body">
            <div class="card-header-row">
              <h3 class="card-title">${e.title || ''}</h3>
            </div>
            <div class="card-meta-row">
              <span class="category-tag" data-category="${e.category}">${CATEGORY_NAMES[e.category] || e.category}</span>
              ${getStarsHTML(e.importance)}
            </div>
            <p class="card-summary">${e.summary || ''}</p>
            <div class="card-footer">
              <div class="card-info-list">
                ${personsText ? `<span class="card-info-item"><span class="icon">👤</span>${personsText}</span>` : ''}
                ${e.location ? `<span class="card-info-item"><span class="icon">📍</span>${e.location}</span>` : ''}
              </div>
              <span class="card-view-detail">查看详情 →</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function openDetailModal(id) {
    const e = state.allEvents.find(x => x.id === id);
    if (!e) return;
    state.selectedEvent = e;

    const body = $('#detailBody');
    if (!body) return;

    const relatedEvents = getRelatedEvents(e);
    const isFav = state.favorites.has(e.id);

    body.innerHTML = `
      <div class="detail-hero">
        <img class="detail-hero-img" src="${e.image || getPicsumImage(e.id + '-' + e.title, 1200, 600)}" alt="${e.title || ''}" onerror="this.src='${getPicsumImage('detail-' + e.id, 1200, 600)}'">
        <div class="detail-hero-overlay"></div>
        <div class="detail-hero-content">
          <span class="detail-year-badge">${formatYearDisplay(e.year, e.isBC)}</span>
          <h2 class="detail-title">${e.title || ''}</h2>
        </div>
      </div>

      <div class="detail-main">
        <div class="detail-meta">
          <span class="category-tag" data-category="${e.category}">${CATEGORY_NAMES[e.category] || e.category}</span>
          ${getStarsHTML(e.importance)}
          <span class="detail-meta-item">📅 ${formatDateCN(e.month, e.day)}</span>
          ${e.location ? `<span class="detail-meta-item">📍 ${e.location}</span>` : ''}
          <button class="card-fav-btn ${isFav ? 'favorited' : ''}" data-id="${e.id}" title="收藏" style="position:static; width:36px; height:36px; margin-left:auto; cursor:pointer;">
            ${isFav ? '★' : '☆'}
          </button>
        </div>

        ${e.summary ? `
        <div class="detail-section">
          <h4 class="detail-section-title">事件简介</h4>
          <p class="detail-content-text">${e.summary || ''}</p>
        </div>
        ` : ''}

        ${e.content ? `
        <div class="detail-section">
          <h4 class="detail-section-title">详细内容</h4>
          <div class="detail-content-text" style="white-space:pre-line;">${e.content || ''}</div>
        </div>
        ` : ''}

        ${e.persons?.length ? `
        <div class="detail-section">
          <h4 class="detail-section-title">涉及人物 (${e.persons.length})</h4>
          <div class="persons-grid">
            ${e.persons.map(p => renderPersonCard(p)).join('')}
          </div>
        </div>
        ` : ''}

        ${e.impact?.length ? `
        <div class="detail-section">
          <h4 class="detail-section-title">影响分析</h4>
          <ul class="impact-list">
            ${e.impact.map(i => `<li>${i}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${e.historicalMeaning ? `
        <div class="detail-section">
          <h4 class="detail-section-title">历史意义</h4>
          <p class="detail-content-text">${e.historicalMeaning || ''}</p>
        </div>
        ` : ''}

        ${relatedEvents.length ? `
        <div class="detail-section">
          <h4 class="detail-section-title">相关事件推荐</h4>
          <div class="related-events">
            ${relatedEvents.map(r => `
              <div class="related-card" data-id="${r.id}">
                <div class="related-year">${formatYearShort(r.year, r.isBC)} · ${CATEGORY_NAMES[r.category] || r.category}</div>
                <div class="related-title">${r.title || ''}</div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        ${e.sourceUrl ? `
        <div class="detail-section">
          <a class="source-link" href="${e.sourceUrl}" target="_blank" rel="noopener noreferrer">
            🔗 维基百科原文
          </a>
        </div>
        ` : ''}
      </div>
    `;

    const modal = $('#detailModal');
    if (modal) modal.style.display = 'flex';
    document.body.classList.add('no-scroll');

    body.querySelectorAll('.related-card').forEach(card => {
      card.addEventListener('click', () => {
        const rid = parseInt(card.dataset.id);
        openDetailModal(rid);
      });
    });

    const favBtn = body.querySelector('.card-fav-btn');
    if (favBtn) {
      favBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const fid = parseInt(favBtn.dataset.id);
        toggleFavorite(fid);
        openDetailModal(fid);
      });
    }
  }

  function renderPersonCard(p) {
    const avatar = p.avatar || getPicsumImage('person-' + (p.name || 'default'), 100, 100);
    const years = [];
    if (p.birthYear) years.push((p.birthIsBC ? '前' : '') + Math.abs(p.birthYear));
    if (p.deathYear) years.push((p.deathIsBC ? '前' : '') + Math.abs(p.deathYear));
    else if (p.birthYear) years.push('至今');
    const yearsStr = years.length ? `(${years.join(' - ')})` : '';
    return `
      <div class="person-card">
        <img class="person-avatar" src="${avatar}" alt="${p.name || ''}" onerror="this.src='${getPicsumImage('person-default', 100, 100)}'">
        <div class="person-info">
          <div class="person-name">${p.name || '未知人物'}</div>
          ${yearsStr ? `<div class="person-years">${yearsStr}</div>` : ''}
          ${p.intro ? `<div class="person-intro">${p.intro}</div>` : ''}
        </div>
      </div>
    `;
  }

  function getRelatedEvents(e) {
    const sameYear = state.allEvents.filter(x => x.id !== e.id && x.year === e.year && x.isBC === e.isBC);
    const sameMonth = state.allEvents.filter(x => x.id !== e.id && x.month === e.month && x.category === e.category);
    const sameCategory = state.allEvents.filter(x => x.id !== e.id && x.category === e.category);

    const combined = [...sameYear, ...sameMonth, ...sameCategory];
    const seen = new Set();
    const unique = combined.filter(x => {
      if (seen.has(x.id)) return false;
      seen.add(x.id);
      return true;
    });

    unique.sort((a, b) => {
      const scoreA = (a.importance || 1) + (a.year === e.year ? 3 : 0) + (a.category === e.category ? 2 : 0);
      const scoreB = (b.importance || 1) + (b.year === e.year ? 3 : 0) + (b.category === e.category ? 2 : 0);
      return scoreB - scoreA;
    });

    return unique.slice(0, 6);
  }

  function closeDetailModal() {
    const modal = $('#detailModal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
    state.selectedEvent = null;
  }

  function initDetailModalClose() {
    const modal = $('#detailModal');
    if (!modal) return;

    modal.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', closeDetailModal);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display !== 'none') {
        closeDetailModal();
      }
    });
  }

  function updateSidebar() {
    const curYear = new Date().getFullYear();
    const zodiacEl = $('#yearZodiac');
    if (zodiacEl) zodiacEl.textContent = getZodiacAnimal(curYear) + '年';

    const constEl = $('#constellationRange');
    if (constEl) constEl.textContent = getConstellationRange(state.currentMonth);

    const dynEl = $('#dynastyInfo');
    if (dynEl) dynEl.textContent = `${getDynastyByYear(curYear - 100)} - ${getDynastyByYear(curYear)}`;

    const monthTop10El = $('#monthTop10');
    if (monthTop10El) {
      const monthEvents = state.allEvents
        .filter(e => e.month === state.currentMonth)
        .sort((a, b) => (b.importance || 1) - (a.importance || 1))
        .slice(0, 10);

      if (monthEvents.length === 0) {
        monthTop10El.innerHTML = '<p style="color:var(--text-tertiary);font-size:0.85rem;text-align:center;padding:1rem;">暂无数据</p>';
      } else {
        monthTop10El.innerHTML = monthEvents.map(e => `
          <div class="top10-item" data-id="${e.id}">
            <div class="top10-content">
              <div class="top10-title">${e.title || ''}</div>
              <div class="top10-meta">
                <span>${formatYearShort(e.year, e.isBC)}</span>
                <span>·</span>
                <span>${formatDateCN(e.month, e.day)}</span>
                <span>·</span>
                <span>${CATEGORY_NAMES[e.category] || e.category}</span>
              </div>
            </div>
          </div>
        `).join('');

        monthTop10El.querySelectorAll('.top10-item').forEach(item => {
          item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            const ev = state.allEvents.find(x => x.id === id);
            if (ev) {
              $('#monthSelect').value = String(ev.month);
              state.currentMonth = ev.month;
              const daySel = $('#daySelect');
              const days = getDaysInMonth(ev.month);
              daySel.innerHTML = '';
              for (let d = 1; d <= days; d++) {
                const opt = document.createElement('option');
                opt.value = String(d);
                opt.textContent = `${d}日`;
                daySel.appendChild(opt);
              }
              daySel.value = String(ev.day);
              state.currentDay = ev.day;
              applyFilters();
              setTimeout(() => openDetailModal(id), 100);
            }
          });
        });
      }
    }
  }

  function initRandomButtons() {
    const jt = $('#randomJump');
    if (jt) {
      jt.addEventListener('click', () => {
        const m = Math.floor(Math.random() * 12) + 1;
        const d = Math.floor(Math.random() * getDaysInMonth(m)) + 1;
        $('#monthSelect').value = String(m);
        state.currentMonth = m;
        const daySel = $('#daySelect');
        const days = getDaysInMonth(m);
        daySel.innerHTML = '';
        for (let i = 1; i <= days; i++) {
          const opt = document.createElement('option');
          opt.value = String(i);
          opt.textContent = `${i}日`;
          daySel.appendChild(opt);
        }
        daySel.value = String(d);
        state.currentDay = d;
        applyFilters();
        updateSidebar();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    const re = $('#randomEvent');
    if (re) {
      re.addEventListener('click', () => {
        if (state.allEvents.length === 0) return;
        const e = state.allEvents[Math.floor(Math.random() * state.allEvents.length)];
        $('#monthSelect').value = String(e.month);
        state.currentMonth = e.month;
        const daySel = $('#daySelect');
        const days = getDaysInMonth(e.month);
        daySel.innerHTML = '';
        for (let i = 1; i <= days; i++) {
          const opt = document.createElement('option');
          opt.value = String(i);
          opt.textContent = `${i}日`;
          daySel.appendChild(opt);
        }
        daySel.value = String(e.day);
        state.currentDay = e.day;
        state.currentCategory = 'all';
        state.searchKeyword = '';
        state.showFavoritesOnly = false;
        document.querySelectorAll('#categoryTabs .tab-btn').forEach(t => {
          t.classList.toggle('active', t.dataset.category === 'all');
        });
        const si = $('#searchInput');
        if (si) si.value = '';
        const sc = $('#searchClear');
        if (sc) sc.classList.remove('show');
        const fb = $('#favToggle');
        if (fb) fb.style.boxShadow = '';
        applyFilters();
        updateSidebar();
        setTimeout(() => openDetailModal(e.id), 150);
      });
    }
  }

  function initJumpToday() {
    const btn = $('#jumpToday');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const today = new Date();
      const m = today.getMonth() + 1;
      const d = today.getDate();
      $('#monthSelect').value = String(m);
      state.currentMonth = m;
      const daySel = $('#daySelect');
      const days = getDaysInMonth(m);
      daySel.innerHTML = '';
      for (let i = 1; i <= days; i++) {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = `${i}日`;
        daySel.appendChild(opt);
      }
      daySel.value = String(d);
      state.currentDay = d;
      applyFilters();
      updateSidebar();
    });
  }

  function initBackToTop() {
    const btn = $('#backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) btn.classList.add('show');
      else btn.classList.remove('show');
    });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initResetFilters() {
    const btn = $('#resetFilters');
    if (!btn) return;
    btn.addEventListener('click', () => {
      state.currentCategory = 'all';
      state.searchKeyword = '';
      state.showFavoritesOnly = false;
      document.querySelectorAll('#categoryTabs .tab-btn').forEach(t => {
        t.classList.toggle('active', t.dataset.category === 'all');
      });
      const si = $('#searchInput');
      if (si) si.value = '';
      const sc = $('#searchClear');
      if (sc) sc.classList.remove('show');
      const fb = $('#favToggle');
      if (fb) fb.style.boxShadow = '';
      applyFilters();
    });
  }

  function initSidebarToggle() {
    const toggle = $('#sidebarToggle');
    const mask = $('#sidebarMask');
    const sidebar = $('#sidebar');
    if (!toggle || !sidebar) return;

    function openSidebar() {
      sidebar.classList.add('open');
      if (mask) mask.style.display = 'block';
    }
    function closeSidebar() {
      sidebar.classList.remove('open');
      if (mask) mask.style.display = 'none';
    }

    toggle.addEventListener('click', () => {
      if (sidebar.classList.contains('open')) closeSidebar();
      else openSidebar();
    });
    if (mask) mask.addEventListener('click', closeSidebar);
  }

  async function loadData() {
    const loading = $('#loadingState');
    try {
      const resp = await fetch(resolveDataPath(), { cache: 'no-cache' });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();
      state.allEvents = Array.isArray(data) ? data : (data.events || []);
    } catch (err) {
      console.error('数据加载失败，使用备用空数据', err);
      state.allEvents = [];
    }
    loadFavorites();
    applyFilters();
    updateSidebar();
  }

  function init() {
    initTheme();
    initDaySelect();
    initCategoryTabs();
    initSearch();
    initSort();
    initDetailModalClose();
    initRandomButtons();
    initJumpToday();
    initBackToTop();
    initResetFilters();
    initSidebarToggle();

    $('#themeToggle')?.addEventListener('click', toggleTheme);
    $('#favToggle')?.addEventListener('click', toggleShowFavorites);

    loadData();
  }

  document.addEventListener('DOMContentLoaded', init);

  window.HistoryTodayApp = {
    state,
    resolveDataPath,
    toggleTheme,
    toggleFavorite,
    openDetailModal,
    closeDetailModal,
    reload: loadData
  };
})();
