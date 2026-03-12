// Timeline rendering + filtering
window.TIMELINE = {
  activeFilter: 'all',
  selectedTouchpointId: null,
  caseId: null,
  searchQuery: '',

  init() {
    const params = new URLSearchParams(window.location.search);
    this.caseId = params.get('case');
    if (this.caseId) {
      this.render();
      this.bindEvents();
    }
  },

  render() {
    const container = document.getElementById('timeline-list');
    if (!container) return;

    let touchpoints = (window.TOUCHPOINTS[this.caseId] || []).slice();

    // Filter
    if (this.activeFilter !== 'all') {
      touchpoints = touchpoints.filter(tp => tp.category === this.activeFilter);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      touchpoints = touchpoints.filter(tp =>
        tp.title.toLowerCase().includes(q) || tp.description.toLowerCase().includes(q)
      );
    }

    // Sort by date descending (newest first)
    touchpoints.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));

    if (touchpoints.length === 0) {
      container.innerHTML = `<div class="py-8 text-center text-slate-500 text-sm">No events match the current filter</div>`;
      return;
    }

    container.innerHTML = touchpoints.map((tp, i) => this.renderRow(tp, i)).join('');

    container.querySelectorAll('.tp-row').forEach(row => {
      row.addEventListener('click', () => this.selectTouchpoint(row.dataset.tpId));
    });
  },

  renderRow(tp, index) {
    const color = APP.getCategoryColor(tp.category);
    const date = APP.formatDateTime(tp.occurredAt);
    const isSelected = this.selectedTouchpointId === tp.id;
    const hasFlag = tp.aiFlag !== null;
    const flagColors = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#6b7280' };
    const flagColor = hasFlag ? flagColors[tp.aiFlag.severity] || '#6b7280' : null;

    return `
      <div class="tp-row group flex gap-2.5 px-3 py-2 cursor-pointer border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-slate-800 border-l-2 border-l-indigo-500' : ''}"
           data-tp-id="${tp.id}" style="${isSelected ? '' : ''}">
        <!-- Timeline line + dot -->
        <div class="flex flex-col items-center flex-shrink-0 mt-1">
          <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style="background:${color}22;color:${color};border:1.5px solid ${color}66">
            ${APP.getIconSVG(tp.icon)}
          </div>
          <div class="w-px flex-1 mt-1" style="background:${color}33;min-height:8px"></div>
        </div>
        <!-- Content -->
        <div class="flex-1 min-w-0 pb-1">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-xs font-medium text-slate-200 truncate">${tp.title}</span>
                ${hasFlag ? `
                  <span class="flex-shrink-0 inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded" style="background:${flagColor}22;color:${flagColor};border:1px solid ${flagColor}44">
                    <svg viewBox="0 0 24 24" fill="currentColor" class="w-2.5 h-2.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    AI
                  </span>
                ` : ''}
              </div>
              <div class="text-[11px] text-slate-500 mt-0.5 line-clamp-1">${tp.description}</div>
            </div>
            <div class="text-[10px] text-slate-500 flex-shrink-0 text-right">
              ${date.split(' ')[0]}<br/><span class="text-slate-600">${date.split(' ').slice(1).join(' ')}</span>
            </div>
          </div>
          <div class="mt-1">
            <span class="text-[9px] px-1 py-0.5 rounded font-medium" style="background:${color}18;color:${color}">${APP.getCategoryLabel(tp.category)}</span>
            <span class="text-[9px] text-slate-600 ml-1">${tp.sourceSystem}</span>
          </div>
        </div>
      </div>
    `;
  },

  selectTouchpoint(tpId) {
    this.selectedTouchpointId = tpId;
    this.render();

    const allTPs = window.TOUCHPOINTS[this.caseId] || [];
    const tp = allTPs.find(t => t.id === tpId);
    if (tp && window.PANELS) {
      window.PANELS.showTouchpointDetail(tp);
    }
    APP.setPanel3Tab('touchpoint');
  },

  setFilter(filter) {
    this.activeFilter = filter;
    document.querySelectorAll('.tl-filter-btn').forEach(btn => {
      btn.classList.toggle('active-filter', btn.dataset.filter === filter);
    });
    this.render();
  },

  setSearch(query) {
    this.searchQuery = query;
    this.render();
  },

  jumpToComplaintDate() {
    const caseData = (window.CASES || []).find(c => c.id === this.caseId);
    if (caseData) {
      this.searchQuery = '';
      this.activeFilter = 'all';
      this.render();
      // Scroll to complaint filed event
      const complaintRow = document.querySelector('[data-tp-id]');
      if (complaintRow) complaintRow.scrollIntoView({ behavior: 'smooth' });
    }
  },

  bindEvents() {
    document.querySelectorAll('.tl-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
    });

    const searchInput = document.getElementById('tl-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.setSearch(e.target.value));
    }

    const jumpBtn = document.getElementById('jump-to-complaint');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', () => this.jumpToComplaintDate());
    }
  }
};
