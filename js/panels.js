// Panel switching + detail rendering
window.PANELS = {
  currentCase: null,
  currentCustomer: null,
  piiRevealed: {},
  aiInteractionLog: [],

  init() {
    const params = new URLSearchParams(window.location.search);
    const caseId = params.get('case');
    if (!caseId) return;

    this.currentCase = (window.CASES || []).find(c => c.id === caseId);
    if (!this.currentCase) return;

    this.currentCustomer = window.CUSTOMERS[this.currentCase.customerId];

    this.renderCaseHeader();
    this.renderSLABar();
    this.renderCustomerPII();
    this.renderDocuments();
    this.renderCaseNotes();
    this.renderAISummary();
    this.renderRegEForm();
    this.renderFCRALog();
    this.renderAIInvestigation();
    this.renderAIActions();

    // Auto-select first touchpoint
    const touchpoints = window.TOUCHPOINTS[caseId] || [];
    if (touchpoints.length > 0) {
      const sorted = touchpoints.slice().sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
      this.showTouchpointDetail(sorted[0]);
    }

    // Check for active flags
    this.renderFlags();
  },

  renderCaseHeader() {
    const c = this.currentCase;
    const headerEl = document.getElementById('case-header-content');
    if (!headerEl) return;

    headerEl.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <span class="font-mono text-sm font-bold text-gray-900">${c.id}</span>
            <span class="text-xs px-2 py-0.5 rounded font-semibold ${APP.getPriorityBadge(c.priority)}">${c.priority}</span>
            <span class="text-xs px-2 py-0.5 rounded ${APP.getStatusBadge(c.status)}">${c.status}</span>
            ${c.flags.holdReason ? `<span class="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300 flex items-center gap-1"><svg viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>ON HOLD</span>` : ''}
          </div>
          <div class="text-sm text-gray-700 font-medium">${c.category}</div>
          <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span>Assigned: <span class="text-gray-700">${c.assignedTo}</span></span>
            <span>Opened: <span class="text-gray-700">${APP.formatDate(c.createdAt)}</span></span>
            ${c.cfpbRef ? `<span>CFPB: <span class="text-blue-600">${c.cfpbRef}</span></span>` : ''}
            ${c.linkedCases.length ? `<span>Linked: <span class="text-indigo-600 cursor-pointer hover:underline">${c.linkedCases.join(', ')}</span></span>` : ''}
          </div>
        </div>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <button onclick="PANELS.showNoteModal()" class="px-2.5 py-1.5 text-xs rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors">+ Note</button>
          <button onclick="APP.setPanel4Tab('actions')" class="px-2.5 py-1.5 text-xs rounded bg-indigo-700 hover:bg-indigo-600 text-white transition-colors">Generate Response</button>
          <div class="relative group">
            <button class="px-2.5 py-1.5 text-xs rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors flex items-center gap-1">
              Actions <svg viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3"><path d="M7 10l5 5 5-5z"/></svg>
            </button>
            <div class="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded shadow-xl z-50 hidden group-hover:block">
              <button class="w-full px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-100" onclick="PANELS.updateStatus('Pending Internal Review')">Move to Pending Review</button>
              <button class="w-full px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-100" onclick="PANELS.updateStatus('Resolved')">Mark Resolved</button>
              <button class="w-full px-3 py-2 text-xs text-left text-red-600 hover:bg-gray-100" onclick="PANELS.updateStatus('Escalated')">Escalate — P1</button>
              <button class="w-full px-3 py-2 text-xs text-left text-amber-600 hover:bg-gray-100">Request Consultation</button>
              <button class="w-full px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-100">Split Case</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderSLABar() {
    const c = this.currentCase;
    const container = document.getElementById('sla-bar');
    if (!container || !c.sla) return;

    container.innerHTML = Object.entries(c.sla).map(([key, slaItem]) => {
      const countdown = APP.formatSLACountdown(slaItem.deadline);
      const color = APP.getSLAColor(countdown.status);
      return `
        <div class="flex items-center gap-1.5 px-2 py-1 rounded" style="background:${color}15;border:1px solid ${color}33">
          <svg viewBox="0 0 24 24" fill="${color}" class="w-3 h-3 flex-shrink-0"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
          <div>
            <div class="text-[9px] text-gray-500">${slaItem.label}</div>
            <div class="text-[11px] font-bold" style="color:${color}">${countdown.text}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderFlags() {
    const customer = this.currentCustomer;
    if (!customer) return;

    const flagsContainer = document.getElementById('case-flags');
    if (!flagsContainer) return;

    const flags = [];
    if (customer.flags.fraudHold) {
      flags.push(`<div class="bg-red-50 border border-red-400 text-red-700 text-xs px-3 py-2 rounded flex items-center gap-2"><svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 flex-shrink-0"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg><strong>FRAUD HOLD ACTIVE</strong> — Follow fraud protocol before any remediation. Do not release funds without fraud clearance.</div>`);
    }
    if (customer.flags.bankruptcy) {
      flags.push(`<div class="bg-amber-50 border border-amber-400 text-amber-700 text-xs px-3 py-2 rounded flex items-center gap-2"><svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 flex-shrink-0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg><strong>BANKRUPTCY ACTIVE — CH. 13</strong> — Automatic stay in effect. No collection activity. Legal review required.</div>`);
    }
    if (customer.flags.legalHold) {
      flags.push(`<div class="bg-purple-50 border border-purple-400 text-purple-700 text-xs px-3 py-2 rounded flex items-center gap-2"><svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 flex-shrink-0"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg><strong>LEGAL HOLD</strong> — All communications and actions require legal clearance.</div>`);
    }
    if (customer.flags.scra) {
      flags.push(`<div class="bg-blue-50 border border-blue-400 text-blue-700 text-xs px-3 py-2 rounded flex items-center gap-2"><svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 flex-shrink-0"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg><strong>SCRA — ACTIVE MILITARY</strong> — SCRA / MLA protections apply. Rate cap and fee waiver may be required.</div>`);
    }
    if (customer.flags.doNotContact) {
      flags.push(`<div class="bg-red-50 border border-red-400 text-red-700 text-xs px-3 py-2 rounded flex items-center gap-2"><svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 flex-shrink-0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 6H7v2h10V8z"/></svg><strong>DO NOT CONTACT</strong> — FDCPA / TCPA restrictions active.</div>`);
    }

    flagsContainer.innerHTML = flags.join('');
    flagsContainer.classList.toggle('hidden', flags.length === 0);
  },

  showTouchpointDetail(tp) {
    const container = document.getElementById('touchpoint-detail');
    if (!container) return;

    const color = APP.getCategoryColor(tp.category);
    const hasFlag = tp.aiFlag !== null;
    const flagColors = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#6b7280' };

    let payloadHTML = '';
    if (tp.payload) {
      payloadHTML = Object.entries(tp.payload).map(([k, v]) => {
        if (typeof v === 'object') v = JSON.stringify(v);
        return `<div class="flex gap-2 py-1 border-b border-gray-100">
          <span class="text-[11px] text-gray-500 w-36 flex-shrink-0 capitalize">${k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
          <span class="text-[11px] text-gray-800 flex-1 break-words">${v}</span>
        </div>`;
      }).join('');
    }

    // Special call detail
    let callHTML = '';
    if (tp.type === 'inbound_call' || tp.type === 'outbound_call') {
      callHTML = `
        <div class="mt-3 p-2.5 rounded bg-blue-50 border border-blue-200">
          <div class="flex items-center gap-2 mb-2">
            <svg viewBox="0 0 24 24" fill="#3b82f6" class="w-4 h-4"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
            <span class="text-xs text-blue-700 font-medium">Call Recording & Transcript</span>
          </div>
          <div class="flex gap-2">
            <button class="text-[11px] px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">▶ Play Recording</button>
            <button class="text-[11px] px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">📄 View Transcript</button>
          </div>
          ${tp.payload?.callSummary ? `<div class="mt-2 text-[11px] text-gray-500 italic">"${tp.payload.callSummary}"</div>` : ''}
        </div>
      `;
    }

    // PDF viewer
    let pdfViewerHTML = '';
    if (tp.payload?.format === 'PDF') {
      pdfViewerHTML = `
        <div class="mt-3 rounded border border-sky-200 bg-sky-50 overflow-hidden">
          <div class="flex items-center justify-between px-3 py-2 bg-sky-100 border-b border-sky-200">
            <span class="text-xs font-medium text-sky-700">${tp.payload.documentType} · ${tp.payload.pages}p</span>
            <div class="flex gap-1.5">
              <button class="text-[10px] px-2 py-0.5 rounded bg-sky-200 text-sky-700 hover:bg-sky-300">Download</button>
              <button class="text-[10px] px-2 py-0.5 rounded bg-sky-200 text-sky-700 hover:bg-sky-300">Full Screen</button>
            </div>
          </div>
          <div class="bg-gray-100 flex items-center justify-center" style="height:220px">
            <div class="text-center">
              <div class="w-14 bg-white border border-gray-300 rounded shadow mx-auto mb-3 flex items-center justify-center" style="height:72px">
                <svg viewBox="0 0 24 24" fill="#0ea5e9" class="w-7 h-7 opacity-50"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
              </div>
              <div class="text-xs text-gray-600 font-medium">${tp.payload.documentType}</div>
              <div class="text-[10px] text-gray-400 mt-0.5">${tp.payload.documentId} · ${tp.payload.pages} pages</div>
              <button class="mt-2 text-[11px] px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700">Open PDF Preview</button>
            </div>
          </div>
          <div class="flex gap-1.5 p-2 border-t border-sky-200 bg-sky-50 overflow-x-auto">
            ${Array.from({length: tp.payload.pages}, (_, i) => `
              <div class="flex-shrink-0 w-10 bg-white border border-gray-300 rounded flex items-center justify-center text-[9px] text-gray-400 cursor-pointer hover:border-sky-400" style="height:52px">${i+1}</div>
            `).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="px-4 py-3">
        <!-- Header -->
        <div class="flex items-start gap-2 mb-3">
          <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background:${color}22;color:${color}">
            ${APP.getIconSVG(tp.icon)}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-gray-900">${tp.title}</div>
            <div class="text-xs text-gray-400">${APP.formatDateTime(tp.occurredAt)} · ${tp.sourceSystem}</div>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0" style="background:${color}18;color:${color}">${APP.getCategoryLabel(tp.category)}</span>
        </div>

        <!-- Description -->
        <p class="text-xs text-gray-700 mb-3 leading-relaxed">${tp.description}</p>

        <!-- AI Flag -->
        ${hasFlag ? `
          <div class="mb-3 p-2.5 rounded border text-xs leading-relaxed" style="background:${flagColors[tp.aiFlag.severity]}11;border-color:${flagColors[tp.aiFlag.severity]}33;color:${flagColors[tp.aiFlag.severity]}">
            <div class="flex items-center gap-1.5 mb-1 font-bold uppercase text-[10px]">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              AI Flag — ${tp.aiFlag.severity.toUpperCase()}
            </div>
            ${tp.aiFlag.message}
          </div>
        ` : ''}

        <!-- Payload fields -->
        <div class="mb-3">
          <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Event Details</div>
          <div class="divide-y divide-gray-100">
            ${payloadHTML}
          </div>
        </div>

        ${callHTML}
        ${pdfViewerHTML}

        <!-- Actions -->
        <div class="flex gap-2 mt-3 pt-3 border-t border-gray-200">
          <button class="text-[11px] px-2.5 py-1.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-300">Flag as Relevant</button>
          <button class="text-[11px] px-2.5 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">Add Note</button>
          <button class="text-[11px] px-2.5 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">Link to Case</button>
        </div>
      </div>
    `;
  },

  renderCustomerPII() {
    const customer = this.currentCustomer;
    const container = document.getElementById('customer-pii');
    if (!container || !customer) return;

    const revealed = this.piiRevealed;

    const piiRow = (label, maskedVal, fullVal, fieldKey) => {
      const isRevealed = revealed[fieldKey];
      return `
        <div class="flex items-center gap-2 py-2 border-b border-gray-100">
          <span class="text-[11px] text-gray-500 w-28 flex-shrink-0">${label}</span>
          <span class="text-[11px] font-mono ${isRevealed ? 'text-amber-600' : 'text-gray-700'} flex-1">${isRevealed ? fullVal : maskedVal}</span>
          <button onclick="PANELS.revealPIIWithPrompt('${fieldKey}', '${maskedVal}', '${fullVal}')"
                  class="text-[10px] px-1.5 py-0.5 rounded ${isRevealed ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-500 hover:text-gray-800 hover:bg-gray-200'} transition-colors flex-shrink-0">
            ${isRevealed ? 'Revealed ✓' : 'Reveal'}
          </button>
        </div>
      `;
    };

    const flagBadge = (condition, label, color) => condition
      ? `<span class="text-[10px] px-2 py-0.5 rounded font-medium" style="background:${color}22;color:${color};border:1px solid ${color}44">${label}</span>`
      : '';

    container.innerHTML = `
      <div class="px-4 py-3">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-bold">
            ${customer.displayName.charAt(0)}
          </div>
          <div>
            <div class="text-sm font-semibold text-gray-900">${customer.displayName}</div>
            <div class="text-[11px] text-gray-500">Customer since ${APP.formatDate(customer.since)} · ID: ${customer.id}</div>
          </div>
        </div>

        <!-- Active Flags -->
        <div class="flex flex-wrap gap-1.5 mb-3">
          ${flagBadge(customer.flags.fraudHold, 'FRAUD HOLD', '#ef4444')}
          ${flagBadge(customer.flags.bankruptcy, 'BANKRUPTCY CH.13', '#f59e0b')}
          ${flagBadge(customer.flags.legalHold, 'LEGAL HOLD', '#a855f7')}
          ${flagBadge(customer.flags.scra, 'SCRA/MLA', '#3b82f6')}
          ${flagBadge(customer.flags.doNotContact, 'DO NOT CONTACT', '#ef4444')}
          ${flagBadge(!customer.flags.tcpaConsent, 'NO TCPA CONSENT', '#f97316')}
          ${flagBadge(customer.flags.vulnerability === 'senior_citizen', 'SENIOR — VULNERABILITY', '#f59e0b')}
          ${flagBadge(customer.flags.vulnerability === 'financial_hardship', 'FINANCIAL HARDSHIP', '#f97316')}
        </div>

        <!-- PII Fields -->
        <div class="mb-3 p-2 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-700 flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 flex-shrink-0"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
          PII fields are masked by default. Each reveal is access-logged for SOC 2 / GLBA compliance.
        </div>

        <div class="divide-y divide-gray-100">
          ${piiRow('Full Name', customer.displayName, customer.fullName, 'fullName')}
          ${piiRow('SSN', customer.maskedSSN, customer.fullSSN, 'ssn')}
          ${piiRow('Date of Birth', customer.maskedDOB, customer.fullDOB, 'dob')}
          ${piiRow('Phone', customer.maskedPhone, customer.fullPhone, 'phone')}
          ${piiRow('Email', customer.email, customer.fullEmail, 'email')}
          ${piiRow('Address', customer.maskedAddress, customer.fullAddress, 'address')}
        </div>

        <!-- Accounts -->
        <details class="mt-3">
          <summary class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700">Linked Accounts (${customer.accounts.length}) ▸</summary>
          <div class="mt-1.5">
            ${customer.accounts.map(acc => `
              <div class="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span class="text-[11px] font-mono text-gray-700">${acc.replace(/\d{4}$/, m => '****')}</span>
                <button onclick="PANELS.revealPIIWithPrompt('account_${acc}', '${acc.replace(/\d{4}$/, m => '****')}', '${acc}')" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">Reveal</button>
              </div>
            `).join('')}
          </div>
        </details>

        <!-- Contact Restrictions -->
        <div class="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
          ${!customer.flags.tcpaConsent ? `<span class="text-[10px] px-1.5 py-0.5 rounded font-medium" style="background:#f9731611;color:#ea580c;border:1px solid #fed7aa">TCPA: No Consent</span>` : `<span class="text-[10px] text-gray-400">TCPA: Consent on file</span>`}
        </div>
      </div>
    `;
  },

  revealPIIWithPrompt(field, maskedVal, fullVal) {
    const justification = prompt(`Access to "${field}" will be logged.\n\nEnter justification reason code:\n1 = Case investigation required\n2 = Customer verification\n3 = Legal/regulatory request\n4 = Supervisor override\n\nEnter number (1-4):`);
    if (justification === null) return;
    const reasons = { '1': 'Case investigation required', '2': 'Customer verification', '3': 'Legal/regulatory request', '4': 'Supervisor override' };
    const reasonText = reasons[justification] || 'Other';
    APP.revealPII(field, reasonText);
    this.piiRevealed[field] = true;
    this.renderCustomerPII();
    console.log(`[AUDIT] PII Reveal — Field: ${field}, Reason: ${reasonText}, Actor: A. Rivera, Time: ${new Date().toISOString()}`);
  },

  renderDocuments() {
    const caseId = this.currentCase.id;
    const docs = window.DOCUMENTS[caseId] || [];
    const container = document.getElementById('documents-list');
    if (!container) return;

    const statusColors = { reviewed: '#22c55e', received: '#3b82f6', pending: '#f59e0b', insufficient: '#ef4444' };
    const statusLabels = { reviewed: 'Reviewed', received: 'Received', pending: 'Pending Review', insufficient: 'Insufficient' };

    container.innerHTML = `
      <div class="px-4 py-3">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-gray-700">Case Documents (${docs.length})</span>
          <button class="text-[11px] px-2 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">+ Upload</button>
        </div>
        <div class="space-y-2">
          ${docs.map(doc => `
            <div class="p-2.5 rounded border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" fill="#6366f1" class="w-5 h-5 flex-shrink-0 mt-0.5"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                  <div>
                    <div class="text-xs font-medium text-gray-800">${doc.name}</div>
                    <div class="text-[10px] text-gray-500">${doc.type} · ${doc.pages}p · Received ${doc.received}</div>
                  </div>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 font-medium" style="background:${statusColors[doc.status]}22;color:${statusColors[doc.status]}">
                  ${statusLabels[doc.status]}
                </span>
              </div>
              <div class="mt-1.5 text-[11px] text-gray-500 line-clamp-2">${doc.preview}</div>
              <div class="flex gap-2 mt-2">
                <button class="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Preview</button>
                <button class="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Annotate</button>
                <button class="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Mark Insufficient</button>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="mt-3 p-2.5 rounded border border-dashed border-gray-300 text-center text-[11px] text-gray-400 hover:border-gray-400 cursor-pointer transition-colors">
          Drop files here or click to request document from customer
        </div>
      </div>
    `;
  },

  renderCaseNotes() {
    const container = document.getElementById('case-notes');
    if (!container) return;

    const sampleNotes = [
      { author: 'A. Rivera', role: 'Investigator', time: '2024-03-12T14:00:00Z', text: 'Received signed affidavit via secure message. Auth database confirms zero authorization for originator 9876543210. Preparing to issue provisional credit.', mentions: [] },
      { author: 'T. Nguyen', role: 'Sr. Investigator', time: '2024-03-11T11:30:00Z', text: '@A. Rivera — make sure we request ACH return under NACHA 2.5.17 before issuing provisional. Also confirm if account number change is needed.', mentions: ['A. Rivera'] }
    ];

    container.innerHTML = `
      <div class="px-4 py-3">
        <div class="text-xs font-semibold text-gray-700 mb-3">Internal Notes</div>
        <div class="space-y-3 mb-4">
          ${sampleNotes.map(note => `
            <div class="p-2.5 rounded border border-gray-200 bg-gray-50">
              <div class="flex items-center gap-2 mb-1.5">
                <div class="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700">${note.author.split(' ').map(n => n[0]).join('')}</div>
                <span class="text-xs font-medium text-gray-800">${note.author}</span>
                <span class="text-[10px] text-gray-500">${note.role}</span>
                <span class="text-[10px] text-gray-400 ml-auto">${APP.formatDateTime(note.time)}</span>
              </div>
              <div class="text-[11px] text-gray-700 leading-relaxed">
                ${note.text.replace(/@(\w+\s\w+)/g, '<span class="text-indigo-600 font-medium">@$1</span>')}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="border-t border-gray-200 pt-3">
          <textarea placeholder="Add a note... Use @name to mention colleagues" rows="3" class="w-full bg-white border border-gray-300 rounded text-xs text-gray-700 p-2 resize-none focus:outline-none focus:border-indigo-600 placeholder-gray-400"></textarea>
          <div class="flex justify-end mt-2 gap-2">
            <button class="text-[11px] px-2.5 py-1.5 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">AI Draft Note</button>
            <button class="text-[11px] px-2.5 py-1.5 rounded bg-indigo-700 text-white hover:bg-indigo-600 transition-colors">Post Note</button>
          </div>
        </div>
      </div>
    `;
  },

  renderAISummary() {
    const caseId = this.currentCase.id;
    const summary = window.COPILOT.getSummary(caseId);
    const container = document.getElementById('ai-summary');
    if (!container) return;

    const sentimentColors = { red: '#ef4444', amber: '#f59e0b', green: '#22c55e', gray: '#6b7280' };
    const sentColor = sentimentColors[summary.sentiment.color] || '#6b7280';

    const regRefs = {
      'Reg E': { title: 'Reg E — Electronic Fund Transfers (12 CFR Part 1005)', summary: 'Governs EFT error resolution, unauthorized transactions, and provisional credit obligations.', keyClocks: ['10-day provisional credit', '45-day investigation (90-day if account < 30 days or POS)'], sections: ['§1005.11 — Error resolution procedures', '§1005.6 — Liability of consumer', '§1005.2(m) — Unauthorized EFT definition'] },
      'FCRA': { title: 'FCRA — Fair Credit Reporting Act (15 U.S.C. §1681)', summary: 'Regulates furnisher duties to report accurate information and respond to consumer disputes.', keyClocks: ['30-day investigation', '45-day if consumer provides additional info'], sections: ['§1681s-2(b) — Furnisher dispute obligations', '§1681n — Civil liability (willful)', '§1681o — Civil liability (negligent)'] },
      'CFPB': { title: 'CFPB Portal Complaint (ARC)', summary: 'CFPB complaint response obligations — acknowledgment and substantive response deadlines.', keyClocks: ['15-day acknowledgment', '60-day substantive response'], sections: ['ARC Company Portal response procedures', 'Public-facing narrative requirements', 'Confidential response standards'] },
      'SCRA': { title: 'SCRA — Servicemembers Civil Relief Act (50 U.S.C. §3937)', summary: 'Interest rate cap of 6% on pre-service obligations for active duty servicemembers.', keyClocks: ['Rate cap effective date of active duty', 'Retroactive to orders date'], sections: ['§3937 — Interest rate limitation', '§3953 — Mortgage protections', 'MLA — 36% MAPR cap'] },
      'Reg Z': { title: 'Reg Z — Truth in Lending (12 CFR Part 1026)', summary: 'Governs billing dispute procedures for credit card and closed-end credit accounts.', keyClocks: ['30-day acknowledgment', '90-day resolution'], sections: ['§1026.13 — Billing error resolution', '§1026.12(c) — Prohibition on adverse reporting during dispute'] }
    };
    const c = this.currentCase;

    container.innerHTML = `
      <div class="p-4 space-y-4">
        <!-- Ambient indicator -->
        <div class="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
          Hughes AI Copilot — Ambient Analysis Active
        </div>

        <!-- Case Brief -->
        <div>
          <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Case Brief</div>
          <div class="text-[11px] text-gray-700 leading-relaxed">${summary.brief}</div>
        </div>

        <!-- Regulations + SLA -->
        <div>
          <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Detected Regulations & Clocks</div>
          <div class="space-y-1">
            ${summary.regulations.map(r => `
              <div class="flex items-center gap-1.5 text-[11px] text-gray-700">
                <svg viewBox="0 0 24 24" fill="#6366f1" class="w-3 h-3 flex-shrink-0"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                ${r}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Sentiment -->
        <div class="p-2.5 rounded border text-[11px]" style="background:${sentColor}11;border-color:${sentColor}33">
          <div class="flex items-center gap-2 mb-0.5">
            <span class="text-[10px] font-bold uppercase" style="color:${sentColor}">${summary.sentiment.score}</span>
          </div>
          <div style="color:${sentColor}">${summary.sentiment.label}</div>
        </div>

        <!-- Anomalies -->
        ${summary.anomalies.length ? `
          <div>
            <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Journey Anomalies Detected</div>
            <div class="space-y-1.5">
              ${summary.anomalies.map(a => `
                <div class="flex items-start gap-1.5 text-[11px] text-amber-600">
                  <svg viewBox="0 0 24 24" fill="#f59e0b" class="w-3 h-3 flex-shrink-0 mt-0.5"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                  <span>${a}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Precedents quick -->
        <div>
          <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Similar Cases</div>
          ${(window.COPILOT.getPrecedents(caseId) || []).slice(0, 2).map(p => `
            <div class="py-1.5 border-b border-gray-100 text-[11px]">
              <span class="text-indigo-600 font-mono">${p.id}</span>
              <span class="text-gray-500 ml-2">${p.similarity} match</span>
              <div class="text-gray-600 mt-0.5 line-clamp-2">${p.summary}</div>
            </div>
          `).join('')}
        </div>

        <!-- Regulation Reference (collapsible) -->
        <details class="border border-gray-200 rounded overflow-hidden">
          <summary class="px-3 py-2 bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100 select-none">Regulation Reference ▸</summary>
          <div class="p-3 space-y-3">
            <div class="flex gap-2 items-center mb-1">
              <input type="text" placeholder="Ask a regulation question..." class="flex-1 bg-white border border-gray-300 rounded text-xs text-gray-700 px-2 py-1.5 focus:outline-none focus:border-indigo-600 placeholder-gray-400">
              <button class="text-[11px] px-2.5 py-1.5 rounded bg-indigo-700 text-white hover:bg-indigo-600 transition-colors">Ask AI</button>
            </div>
            ${c.regulationTags.map(reg => {
              const ref = regRefs[reg];
              if (!ref) return '';
              return `
                <div class="border border-gray-200 rounded overflow-hidden">
                  <div class="bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <div class="text-xs font-semibold text-indigo-700">${ref.title}</div>
                  </div>
                  <div class="px-3 py-2.5">
                    <p class="text-[11px] text-gray-600 mb-2">${ref.summary}</p>
                    <div class="mb-2">
                      <div class="text-[10px] font-semibold text-gray-500 uppercase mb-1">Key Clocks</div>
                      ${ref.keyClocks.map(k => `<div class="text-[11px] text-amber-600 flex items-center gap-1"><svg viewBox="0 0 24 24" fill="currentColor" class="w-2.5 h-2.5"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/></svg>${k}</div>`).join('')}
                    </div>
                    <div>
                      <div class="text-[10px] font-semibold text-gray-500 uppercase mb-1">Key Sections</div>
                      ${ref.sections.map(s => `<div class="text-[11px] text-gray-600">• ${s}</div>`).join('')}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </details>
      </div>
    `;
  },

  renderAIInvestigation() {
    const caseId = this.currentCase.id;
    const container = document.getElementById('ai-investigation');
    if (!container) return;

    container.innerHTML = `
      <div class="p-4">
        <div class="flex items-center justify-between mb-4">
          <div class="text-xs font-semibold text-gray-700">Deep Case Investigation</div>
          <button onclick="PANELS.runAIInvestigation()" class="text-[11px] px-3 py-1.5 rounded bg-indigo-700 hover:bg-indigo-600 text-white transition-colors flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
            Run Investigation
          </button>
        </div>
        <div id="ai-memo-container">
          <div class="text-center py-8 text-gray-500 text-xs">
            Click "Run Investigation" to generate a full AI investigation memo with regulation analysis, findings, and remediation recommendations.
            <div class="mt-2 text-[10px] text-gray-400">AI reasoning will be shown so you can verify the logic before adopting.</div>
          </div>
        </div>
      </div>
    `;
  },

  runAIInvestigation() {
    const caseId = this.currentCase.id;
    const container = document.getElementById('ai-memo-container');
    if (!container) return;

    container.innerHTML = `<div class="flex items-center gap-2 text-xs text-gray-500 py-4"><span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse inline-block"></span> Analyzing 47 touchpoints, 12 regulations, and 2,341 similar cases...</div>`;

    setTimeout(() => {
      const memo = window.COPILOT.getInvestigationMemo(caseId);
      const confColor = memo.confidence >= 90 ? '#22c55e' : memo.confidence >= 70 ? '#f59e0b' : '#ef4444';
      const recColor = memo.recommendation.includes('Error Found') ? '#22c55e' :
        memo.recommendation.includes('Pending') ? '#f59e0b' : '#6b7280';

      container.innerHTML = `
        <!-- Memo Header -->
        <div class="p-3 rounded border border-gray-200 bg-gray-50 mb-4">
          <div class="text-xs font-semibold text-gray-900 mb-1">${memo.title}</div>
          <div class="flex items-center gap-3">
            <div class="text-[11px]">
              <span class="text-gray-500">Confidence: </span>
              <span class="font-bold" style="color:${confColor}">${memo.confidence}%</span>
            </div>
            <div class="text-[11px]">
              <span class="text-gray-500">Recommendation: </span>
              <span class="font-bold" style="color:${recColor}">${memo.recommendation}</span>
            </div>
          </div>
          <div class="mt-1.5 text-[11px] text-gray-600">${memo.recommendationRationale}</div>
        </div>

        <!-- Memo Sections -->
        <div class="space-y-3 mb-4">
          ${memo.sections.map(s => `
            <div class="border-l-2 border-indigo-300 pl-3">
              <div class="text-[11px] font-semibold text-indigo-600 mb-1">${s.heading}</div>
              <div class="text-[11px] text-gray-700 leading-relaxed">${s.content}</div>
            </div>
          `).join('')}
        </div>

        <!-- Associate Actions -->
        <div class="flex gap-2 pt-3 border-t border-gray-200">
          <button onclick="PANELS.adoptAIMemo()" class="flex-1 text-[11px] py-2 rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-medium transition-colors">
            ✓ Agree & Adopt
          </button>
          <button onclick="PANELS.rejectAIMemo()" class="flex-1 text-[11px] py-2 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-medium transition-colors">
            ✗ Disagree — Note Reason
          </button>
        </div>
        <div class="mt-2 text-[9px] text-gray-400 text-center">All AI interactions are logged for regulatory defensibility per AI Interaction Log policy.</div>
      `;
      this.aiInteractionLog.push({ type: 'investigation', caseId, timestamp: new Date().toISOString(), status: 'generated' });
    }, 1800);
  },

  adoptAIMemo() {
    this.aiInteractionLog.push({ type: 'investigation', caseId: this.currentCase.id, timestamp: new Date().toISOString(), status: 'adopted' });
    alert('AI memo adopted. Investigation findings logged. Navigate to Actions tab to record determination.');
  },

  rejectAIMemo() {
    const reason = prompt('Please provide a reason for disagreeing with the AI recommendation:');
    if (reason) {
      this.aiInteractionLog.push({ type: 'investigation', caseId: this.currentCase.id, timestamp: new Date().toISOString(), status: 'rejected', reason });
      alert('Disagreement logged: ' + reason);
    }
  },

  renderAIDraftResponse() {
    // Content merged into renderAIActions() Response Letter collapsible — this function is no longer called
  },

  generateDraftLetter() {
    const caseId = this.currentCase.id;
    const outcome = document.getElementById('outcome-selector')?.value || 'Error Found';
    const draft = window.COPILOT.getDraftResponse(caseId, outcome);
    const container = document.getElementById('draft-preview');
    if (!container) return;

    container.innerHTML = `
      <div class="border border-gray-200 rounded overflow-hidden">
        <div class="bg-gray-50 px-3 py-2 flex items-center justify-between border-b border-gray-200">
          <span class="text-[11px] font-medium text-gray-700">Draft Letter — Editable</span>
          <div class="flex gap-1.5">
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">DRAFT</span>
            <button class="text-[10px] px-2 py-0.5 rounded bg-gray-200 text-gray-600 hover:bg-gray-300">Send for Approval</button>
          </div>
        </div>
        <textarea class="w-full bg-gray-50 text-[11px] text-gray-700 font-mono p-3 resize-none focus:outline-none" rows="18" style="min-height:300px">${draft}</textarea>
        <div class="bg-gray-50 px-3 py-2 border-t border-gray-200 flex gap-2">
          <button class="text-[11px] px-2.5 py-1.5 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">AI Compliance Check</button>
          <button class="text-[11px] px-2.5 py-1.5 rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors ml-auto">Approve & Send</button>
        </div>
      </div>
    `;
  },

  renderAIActions() {
    const c = this.currentCase;
    const container = document.getElementById('ai-actions');
    if (!container) return;

    const isRegE = c.regulationTags.includes('Reg E');
    const isFCRA = c.regulationTags.includes('FCRA');
    const isCFPB = c.regulationTags.includes('CFPB');
    const isSCRA = c.regulationTags.includes('SCRA');

    container.innerHTML = `
      <div class="p-4 space-y-4">
        <!-- Determination Recording -->
        <div>
          <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Record Determination</div>
          <select class="w-full bg-white border border-gray-300 rounded text-xs text-gray-800 px-2 py-1.5 mb-2 focus:outline-none focus:border-indigo-600">
            <option>— Select outcome —</option>
            <option>Upheld — Error Found</option>
            <option>Partially Upheld</option>
            <option>Denied — No Error Found</option>
            <option>Withdrawn by Customer</option>
            <option>Error Found — Remediated</option>
            <option>Referred to Specialist</option>
          </select>
          <textarea placeholder="Decision rationale (required) — document investigative findings and basis for determination..." rows="4" class="w-full bg-white border border-gray-300 rounded text-xs text-gray-700 p-2 resize-none focus:outline-none focus:border-indigo-600 placeholder-gray-400 mb-2"></textarea>
          <button class="w-full text-[11px] py-2 rounded bg-indigo-700 hover:bg-indigo-600 text-white font-medium transition-colors">Record Determination</button>
        </div>

        <!-- Remediation Actions -->
        <div>
          <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Remediation Actions</div>
          <div class="space-y-2">
            ${isRegE ? `
              <div class="p-2.5 rounded border border-green-200 bg-green-50">
                <div class="text-[11px] font-medium text-green-700 mb-1">Reg E — Provisional Credit</div>
                <div class="flex items-center gap-2">
                  <input type="number" placeholder="Amount $" class="flex-1 bg-white border border-gray-300 rounded text-xs text-gray-800 px-2 py-1 focus:outline-none" value="1247.00">
                  <button class="text-[11px] px-2.5 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors">Issue Credit</button>
                </div>
              </div>
            ` : ''}
            ${isFCRA ? `
              <div class="p-2.5 rounded border border-teal-200 bg-teal-50">
                <div class="text-[11px] font-medium text-teal-700 mb-1">FCRA — Credit Bureau Correction</div>
                <div class="flex gap-2 flex-wrap">
                  <button class="text-[11px] px-2 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors">Submit E-OSCAR Correction</button>
                  <button class="text-[11px] px-2 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors">Request Bureau Deletion</button>
                </div>
              </div>
            ` : ''}
            ${isCFPB ? `
              <div class="p-2.5 rounded border border-blue-200 bg-blue-50">
                <div class="text-[11px] font-medium text-blue-700 mb-1">CFPB Portal Response</div>
                <button class="text-[11px] px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors">Draft CFPB Response</button>
              </div>
            ` : ''}
            ${isSCRA ? `
              <div class="p-2.5 rounded border border-blue-200 bg-blue-50">
                <div class="text-[11px] font-medium text-blue-700 mb-1">SCRA — Rate Cap Application</div>
                <div class="flex gap-2">
                  <button class="text-[11px] px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors">Apply 6% Rate Cap</button>
                  <button class="text-[11px] px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors">Refund Excess Interest</button>
                </div>
              </div>
            ` : ''}
            <div class="p-2.5 rounded border border-gray-200 bg-gray-50">
              <div class="text-[11px] font-medium text-gray-700 mb-1">Fee Waiver</div>
              <div class="flex items-center gap-2">
                <input type="number" placeholder="Amount $" class="flex-1 bg-white border border-gray-300 rounded text-xs text-gray-800 px-2 py-1 focus:outline-none">
                <button class="text-[11px] px-2.5 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">Waive Fee</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Reg-E specific form -->
        ${isRegE ? `
          <div>
            <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Reg E Determination Form</div>
            <div class="space-y-2 text-[11px]">
              <div><label class="text-gray-600 block mb-0.5">Error Type</label>
                <select class="w-full bg-white border border-gray-300 rounded text-gray-700 px-2 py-1 focus:outline-none">
                  <option>Unauthorized EFT</option><option>Incorrect EFT amount</option><option>Wrong account</option><option>No error</option>
                </select>
              </div>
              <div><label class="text-gray-600 block mb-0.5">Provisional Credit Status</label>
                <select class="w-full bg-white border border-gray-300 rounded text-gray-700 px-2 py-1 focus:outline-none">
                  <option>Issued — Pending Investigation</option><option>Made Permanent</option><option>Not Issued (error found within 10 days)</option>
                </select>
              </div>
              <div><label class="text-gray-600 block mb-0.5">Final Determination</label>
                <select class="w-full bg-white border border-gray-300 rounded text-gray-700 px-2 py-1 focus:outline-none">
                  <option>Error Confirmed — Full Credit</option><option>Error Confirmed — Partial Credit</option><option>No Error Found</option>
                </select>
              </div>
              <button class="w-full text-[11px] py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors mt-1">Save Reg E Form</button>
            </div>
          </div>
        ` : ''}

        <!-- FCRA E-OSCAR log -->
        ${isFCRA ? this.renderFCRAInline() : ''}

        <!-- Response Letter (collapsible — merged from Draft Response tab) -->
        <details class="border border-gray-200 rounded overflow-hidden">
          <summary class="px-3 py-2 bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100 select-none">Response Letter ▸</summary>
          <div class="p-3 space-y-3">
            <div>
              <label class="text-[11px] text-gray-600 block mb-1">Select Determination Outcome</label>
              <select id="outcome-selector" class="w-full bg-white border border-gray-300 rounded text-xs text-gray-800 px-2 py-1.5 focus:outline-none focus:border-indigo-600">
                <option value="">— Select outcome —</option>
                <option>Error Found — Full Credit</option>
                <option>Error Found — Partial Credit</option>
                <option>No Error Found</option>
                <option>Error Found — Remediated</option>
                <option>Complaint Withdrawn</option>
                <option>Referred to Specialist</option>
              </select>
            </div>
            <div>
              <label class="text-[11px] text-gray-600 block mb-1">Communication Channel</label>
              <div class="flex gap-2">
                <label class="flex items-center gap-1 text-[11px] text-gray-700 cursor-pointer"><input type="radio" name="channel" value="letter" class="accent-indigo-500"> Mailed Letter</label>
                <label class="flex items-center gap-1 text-[11px] text-gray-700 cursor-pointer"><input type="radio" name="channel" value="secure" class="accent-indigo-500" checked> Secure Message</label>
                <label class="flex items-center gap-1 text-[11px] text-gray-700 cursor-pointer"><input type="radio" name="channel" value="cfpb" class="accent-indigo-500"> CFPB Portal Response</label>
              </div>
            </div>
            <button onclick="PANELS.generateDraftLetter()" class="w-full text-[11px] py-2 rounded bg-indigo-700 hover:bg-indigo-600 text-white transition-colors font-medium">
              Generate Draft Letter
            </button>
            <div id="draft-preview"></div>
          </div>
        </details>
      </div>
    `;
  },

  renderFCRAInline() {
    return `
      <div>
        <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">E-OSCAR Dispute Log</div>
        <div class="overflow-x-auto">
          <table class="w-full text-[10px] border-collapse">
            <thead>
              <tr class="text-gray-500 border-b border-gray-200">
                <th class="text-left py-1 pr-2">Bureau</th>
                <th class="text-left py-1 pr-2">Submitted</th>
                <th class="text-left py-1 pr-2">Deadline</th>
                <th class="text-left py-1 pr-2">Status</th>
                <th class="text-left py-1">Outcome</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-100">
                <td class="py-1.5 pr-2 text-gray-700">Equifax</td>
                <td class="py-1.5 pr-2 text-gray-500">2024-02-15</td>
                <td class="py-1.5 pr-2 text-red-600 font-bold">OVERDUE</td>
                <td class="py-1.5 pr-2"><span class="text-amber-600">Pending Response</span></td>
                <td class="py-1.5"><span class="text-gray-400">—</span></td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-1.5 pr-2 text-gray-700">Experian</td>
                <td class="py-1.5 pr-2 text-gray-500">2022-11-30</td>
                <td class="py-1.5 pr-2 text-gray-400">Closed</td>
                <td class="py-1.5 pr-2"><span class="text-green-600">Complete</span></td>
                <td class="py-1.5 text-green-600">Updated: Settled</td>
              </tr>
              <tr>
                <td class="py-1.5 pr-2 text-gray-700">TransUnion</td>
                <td class="py-1.5 pr-2 text-gray-500">2022-11-30</td>
                <td class="py-1.5 pr-2 text-gray-400">Closed</td>
                <td class="py-1.5 pr-2"><span class="text-green-600">Complete</span></td>
                <td class="py-1.5 text-green-600">Updated: Settled</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderFCRALog() {},
  renderRegEForm() {},

  renderRegulationRef() {
    // Content merged into renderAISummary() Regulation Reference collapsible — this function is no longer called
  },

  updateStatus(newStatus) {
    if (this.currentCase) {
      this.currentCase.status = newStatus;
      this.renderCaseHeader();
      alert(`Case status updated to: ${newStatus}\n[AUDIT] Status change logged with timestamp and actor.`);
    }
  },

  showNoteModal() {
    APP.setPanel3Tab('notes');
  }
};
