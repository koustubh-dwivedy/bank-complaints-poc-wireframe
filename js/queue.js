// Queue panel logic
window.QUEUE = {
  activeFilter: 'all',
  searchMode: false,
  pinnedCases: new Set(),

  init() {
    this.render();
    this.bindEvents();
  },

  render() {
    const container = document.getElementById('queue-list');
    if (!container) return;

    let cases = window.CASES || [];

    // Apply filter
    if (this.activeFilter !== 'all') {
      cases = cases.filter(c => {
        if (this.activeFilter === 'sla-red') return this.hasSLAStatus(c, 'red');
        if (this.activeFilter === 'sla-amber') return this.hasSLAStatus(c, 'amber');
        if (this.activeFilter === 'p1') return c.priority === 'P1';
        if (this.activeFilter === 'p2') return c.priority === 'P2';
        if (this.activeFilter === 'reg-e') return c.regulationTags.includes('Reg E');
        if (this.activeFilter === 'fcra') return c.regulationTags.includes('FCRA');
        if (this.activeFilter === 'cfpb') return c.regulationTags.includes('CFPB');
        return true;
      });
    }

    // Pinned first
    const pinned = cases.filter(c => this.pinnedCases.has(c.id));
    const unpinned = cases.filter(c => !this.pinnedCases.has(c.id));
    const sorted = [...pinned, ...unpinned];

    container.innerHTML = sorted.map(c => this.renderCard(c)).join('');

    // Bind card clicks
    container.querySelectorAll('.case-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.pin-btn')) return;
        this.openCase(card.dataset.caseId);
      });
    });

    container.querySelectorAll('.pin-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePin(btn.dataset.caseId);
      });
    });
  },

  renderCard(c) {
    const customer = window.CUSTOMERS[c.customerId];
    const slaInfo = this.getWorstSLA(c);
    const slaColor = { red: '#ef4444', amber: '#f59e0b', green: '#22c55e' }[slaInfo.status];
    const pinned = this.pinnedCases.has(c.id);
    const priorityColors = { P1: 'text-red-400', P2: 'text-amber-400', P3: 'text-blue-400', P4: 'text-gray-500' };

    return `
      <div class="case-card group cursor-pointer px-3 py-2.5 border-b border-slate-800 hover:bg-slate-800/50 transition-colors relative"
           data-case-id="${c.id}">
        ${c.flags.holdReason ? `<div class="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500"></div>` : ''}
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="text-xs font-mono text-slate-400">${c.id}</span>
              <span class="text-[10px] font-semibold ${priorityColors[c.priority]}">${c.priority}</span>
              ${pinned ? `<svg viewBox="0 0 24 24" fill="#f59e0b" class="w-3 h-3 flex-shrink-0"><path d="M17 4v7l2 3H5l2-3V4h10zm-2 14h-6c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2zm-1-18H10c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>` : ''}
            </div>
            <div class="text-xs font-medium text-slate-200 truncate">${c.category}</div>
            <div class="text-[11px] text-slate-500 truncate">${customer?.displayName || 'Unknown'}</div>
          </div>
          <div class="flex flex-col items-end gap-1 flex-shrink-0">
            <div class="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold" style="background:${slaColor}22;color:${slaColor};border:1px solid ${slaColor}44">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-2.5 h-2.5"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
              ${slaInfo.text}
            </div>
            <button class="pin-btn opacity-0 group-hover:opacity-100 text-slate-600 hover:text-amber-400 transition-all" data-case-id="${c.id}" title="${pinned ? 'Unpin' : 'Pin to top'}">
              <svg viewBox="0 0 24 24" fill="${pinned ? '#f59e0b' : 'currentColor'}" class="w-3.5 h-3.5"><path d="M17 4v7l2 3H5l2-3V4h10zm-2 14h-6c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2zm-1-18H10c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>
            </button>
          </div>
        </div>
        <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
          ${c.regulationTags.map(r => `<span class="text-[9px] px-1 py-0.5 rounded bg-slate-700 text-slate-300 font-medium">${r}</span>`).join('')}
          <span class="text-[9px] px-1 py-0.5 rounded ${APP.getStatusBadge(c.status)}">${c.status}</span>
        </div>
      </div>
    `;
  },

  getWorstSLA(c) {
    if (!c.sla) return { text: 'No SLA', status: 'green' };
    let worst = { text: '—', status: 'green' };
    const order = { red: 3, amber: 2, green: 1 };
    Object.values(c.sla).forEach(slaItem => {
      const countdown = APP.formatSLACountdown(slaItem.deadline);
      if ((order[countdown.status] || 0) > (order[worst.status] || 0)) {
        worst = countdown;
      }
    });
    return worst;
  },

  hasSLAStatus(c, status) {
    if (!c.sla) return false;
    return Object.values(c.sla).some(s => APP.formatSLACountdown(s.deadline).status === status);
  },

  openCase(caseId) {
    window.location.href = `case.html?case=${caseId}`;
  },

  togglePin(caseId) {
    if (this.pinnedCases.has(caseId)) {
      this.pinnedCases.delete(caseId);
    } else {
      this.pinnedCases.add(caseId);
    }
    this.render();
  },

  setFilter(filter) {
    this.activeFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active-filter', btn.dataset.filter === filter);
    });
    this.render();
  },

  bindEvents() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
    });

    const searchInput = document.getElementById('case-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    const searchToggle = document.getElementById('search-toggle');
    if (searchToggle) {
      searchToggle.addEventListener('click', () => this.toggleSearchMode());
    }
  },

  toggleSearchMode() {
    this.searchMode = !this.searchMode;
    const queueView = document.getElementById('queue-view');
    const searchView = document.getElementById('search-view');
    if (queueView) queueView.classList.toggle('hidden', this.searchMode);
    if (searchView) searchView.classList.toggle('hidden', !this.searchMode);
  },

  handleSearch(query) {
    if (!query.trim()) {
      document.getElementById('search-results').innerHTML = '';
      return;
    }
    const q = query.toLowerCase();
    const results = (window.CASES || []).filter(c => {
      const customer = window.CUSTOMERS[c.customerId];
      return c.id.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.cfpbRef && c.cfpbRef.includes(q)) ||
        (customer && customer.displayName.toLowerCase().includes(q));
    });

    const container = document.getElementById('search-results');
    if (container) {
      container.innerHTML = results.length
        ? results.map(c => this.renderCard(c)).join('')
        : `<div class="px-4 py-6 text-center text-slate-500 text-sm">No results found</div>`;

      container.querySelectorAll('.case-card').forEach(card => {
        card.addEventListener('click', () => this.openCase(card.dataset.caseId));
      });
    }
  }
};
