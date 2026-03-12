// App state + routing
window.APP = {
  currentCaseId: null,
  currentPanel3Tab: 'touchpoint',
  currentPanel4Tab: 'summary',
  revealedPIIFields: new Set(),
  piiAccessLog: [],
  activeTimelineFilter: 'all',
  darkMode: true,

  init() {
    // Apply dark mode
    if (this.darkMode) document.documentElement.classList.add('dark');
  },

  setPanel3Tab(tab) {
    this.currentPanel3Tab = tab;
    document.querySelectorAll('.p3-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    document.querySelectorAll('.p3-content').forEach(c => {
      c.classList.toggle('hidden', c.dataset.tab !== tab);
    });
  },

  setPanel4Tab(tab) {
    this.currentPanel4Tab = tab;
    document.querySelectorAll('.p4-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    document.querySelectorAll('.p4-content').forEach(c => {
      c.classList.toggle('hidden', c.dataset.tab !== tab);
    });
  },

  revealPII(field, justification) {
    const entry = {
      field, justification,
      actor: 'A. Rivera (ASSOC-0034)',
      ip: '10.12.4.88',
      timestamp: new Date().toISOString(),
      caseId: this.currentCaseId
    };
    this.piiAccessLog.push(entry);
    this.revealedPIIFields.add(field);
    console.log('[AUDIT] PII Reveal:', entry);
  },

  formatDate(isoString) {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  formatDateTime(isoString) {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  },

  formatSLACountdown(deadline) {
    const now = new Date();
    const end = new Date(deadline);
    const diffMs = end - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffMs < 0) {
      const overDays = Math.abs(diffDays);
      return { text: `${overDays}d overdue`, status: 'red' };
    } else if (diffDays <= 2) {
      return { text: `${diffDays}d ${diffHours}h`, status: 'red' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays}d ${diffHours}h`, status: 'amber' };
    } else {
      return { text: `${diffDays}d`, status: 'green' };
    }
  },

  getSLAColor(status) {
    return { red: '#ef4444', amber: '#f59e0b', green: '#22c55e' }[status] || '#6b7280';
  },

  getCategoryColor(category) {
    const colors = {
      voice: '#3b82f6',
      financial: '#22c55e',
      complaint: '#f97316',
      regulatory: '#ef4444',
      digital: '#a855f7',
      account_lifecycle: '#6b7280',
      credit_bureau: '#14b8a6',
      fraud_risk: '#f59e0b',
      loan_servicing: '#8b5cf6'
    };
    return colors[category] || '#6b7280';
  },

  getCategoryLabel(category) {
    const labels = {
      voice: 'Voice',
      financial: 'Financial',
      complaint: 'Complaint/Dispute',
      regulatory: 'Regulatory/Legal',
      digital: 'Digital',
      account_lifecycle: 'Account Lifecycle',
      credit_bureau: 'Credit Bureau',
      fraud_risk: 'Fraud/Risk',
      loan_servicing: 'Loan Servicing'
    };
    return labels[category] || category;
  },

  getIconSVG(icon) {
    const icons = {
      phone: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`,
      transaction: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>`,
      complaint: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`,
      regulatory: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z"/></svg>`,
      document: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
      account: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
      alert: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
      credit: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>`,
      fee: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>`,
      message: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>`,
      fraud: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>`
    };
    return icons[icon] || icons.document;
  },

  getPriorityBadge(priority) {
    const cfg = {
      P1: 'bg-red-900/60 text-red-300 border border-red-700',
      P2: 'bg-amber-900/60 text-amber-300 border border-amber-700',
      P3: 'bg-blue-900/60 text-blue-300 border border-blue-700',
      P4: 'bg-gray-800 text-gray-400 border border-gray-600'
    };
    return cfg[priority] || cfg.P4;
  },

  getStatusBadge(status) {
    const cfg = {
      'Draft': 'bg-gray-800 text-gray-400',
      'Open': 'bg-blue-900/60 text-blue-300',
      'Under Investigation': 'bg-indigo-900/60 text-indigo-300',
      'Pending Customer Response': 'bg-yellow-900/60 text-yellow-300',
      'Pending Internal Review': 'bg-orange-900/60 text-orange-300',
      'Resolved': 'bg-green-900/60 text-green-300',
      'Closed': 'bg-gray-800 text-gray-400',
      'Reopened': 'bg-red-900/60 text-red-300'
    };
    return cfg[status] || 'bg-gray-800 text-gray-400';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.QUEUE !== 'undefined' && window.QUEUE.init) window.QUEUE.init();
  if (typeof window.TIMELINE !== 'undefined' && window.TIMELINE.init) window.TIMELINE.init();
  if (typeof window.SUPERVISOR !== 'undefined' && window.SUPERVISOR.init) window.SUPERVISOR.init();
  APP.init();
});
