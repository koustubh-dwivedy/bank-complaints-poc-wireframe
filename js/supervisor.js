// Supervisor view logic
window.SUPERVISOR = {
  init() {
    this.renderTeamQueue();
    this.renderWorkloadSummary();
    this.renderSLABreachAlerts();
  },

  getAllCases() {
    return window.CASES || [];
  },

  renderTeamQueue() {
    const container = document.getElementById('supervisor-queue');
    if (!container) return;

    const cases = this.getAllCases();
    const associates = {
      'ASSOC-0034': { name: 'A. Rivera', avatar: 'AR', color: 'bg-indigo-800' },
      'ASSOC-0051': { name: 'T. Nguyen', avatar: 'TN', color: 'bg-purple-800' },
      'ASSOC-0078': { name: 'M. Chen', avatar: 'MC', color: 'bg-teal-800' }
    };

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-xs border-collapse">
          <thead>
            <tr class="text-slate-500 border-b border-slate-700">
              <th class="text-left py-2 px-3">Case ID</th>
              <th class="text-left py-2 px-3">Category</th>
              <th class="text-left py-2 px-3">Customer</th>
              <th class="text-left py-2 px-3">Assigned To</th>
              <th class="text-left py-2 px-3">Status</th>
              <th class="text-left py-2 px-3">Priority</th>
              <th class="text-left py-2 px-3">Regulations</th>
              <th class="text-left py-2 px-3">Worst SLA</th>
              <th class="text-left py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${cases.map(c => {
              const customer = window.CUSTOMERS[c.customerId];
              const assoc = associates[c.assignedId];
              const slaInfo = this.getWorstSLA(c);
              const slaColor = APP.getSLAColor(slaInfo.status);
              const priorityColors = { P1: 'text-red-400', P2: 'text-amber-400', P3: 'text-blue-400', P4: 'text-gray-500' };

              return `
                <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition-colors cursor-pointer" onclick="window.location.href='case.html?case=${c.id}'">
                  <td class="py-2 px-3 font-mono text-indigo-400">${c.id}</td>
                  <td class="py-2 px-3 text-slate-300 max-w-32 truncate" title="${c.category}">${c.category}</td>
                  <td class="py-2 px-3 text-slate-400">${customer?.displayName || '—'}</td>
                  <td class="py-2 px-3">
                    <div class="flex items-center gap-1.5">
                      <div class="w-5 h-5 rounded-full ${assoc?.color || 'bg-slate-700'} flex items-center justify-center text-[9px] font-bold text-white">${assoc?.avatar || '?'}</div>
                      <span class="text-slate-300">${c.assignedTo}</span>
                    </div>
                  </td>
                  <td class="py-2 px-3">
                    <span class="text-[10px] px-1.5 py-0.5 rounded ${APP.getStatusBadge(c.status)}">${c.status}</span>
                  </td>
                  <td class="py-2 px-3 font-semibold ${priorityColors[c.priority]}">${c.priority}</td>
                  <td class="py-2 px-3">
                    <div class="flex gap-1 flex-wrap">
                      ${c.regulationTags.map(r => `<span class="text-[9px] px-1 py-0.5 rounded bg-indigo-900/50 text-indigo-300">${r}</span>`).join('')}
                    </div>
                  </td>
                  <td class="py-2 px-3">
                    <span class="text-[11px] font-bold" style="color:${slaColor}">${slaInfo.text}</span>
                  </td>
                  <td class="py-2 px-3">
                    <div class="flex gap-1.5" onclick="event.stopPropagation()">
                      <button class="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors" onclick="SUPERVISOR.reassignCase('${c.id}')">Reassign</button>
                      <button class="text-[10px] px-2 py-0.5 rounded bg-amber-900/40 text-amber-400 hover:bg-amber-900/60 border border-amber-700/40 transition-colors" onclick="SUPERVISOR.openQA('${c.id}')">QA</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderWorkloadSummary() {
    const container = document.getElementById('workload-summary');
    if (!container) return;

    const cases = this.getAllCases();
    const associates = [
      { id: 'ASSOC-0034', name: 'A. Rivera', avatar: 'AR', color: 'bg-indigo-800' },
      { id: 'ASSOC-0051', name: 'T. Nguyen', avatar: 'TN', color: 'bg-purple-800' },
      { id: 'ASSOC-0078', name: 'M. Chen', avatar: 'MC', color: 'bg-teal-800' }
    ];

    container.innerHTML = associates.map(assoc => {
      const myCases = cases.filter(c => c.assignedId === assoc.id);
      const redSLA = myCases.filter(c => this.hasSLAStatus(c, 'red')).length;
      const amberSLA = myCases.filter(c => this.hasSLAStatus(c, 'amber')).length;
      const p1Cases = myCases.filter(c => c.priority === 'P1').length;

      return `
        <div class="p-3 rounded border border-slate-700 bg-slate-800/40">
          <div class="flex items-center gap-2 mb-2.5">
            <div class="w-8 h-8 rounded-full ${assoc.color} flex items-center justify-center text-xs font-bold text-white">${assoc.avatar}</div>
            <div>
              <div class="text-sm font-semibold text-slate-200">${assoc.name}</div>
              <div class="text-[10px] text-slate-500">${myCases.length} active cases</div>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div class="text-center p-1.5 rounded bg-red-950/40 border border-red-800/40">
              <div class="text-lg font-bold text-red-400">${redSLA}</div>
              <div class="text-[9px] text-red-500">SLA Red</div>
            </div>
            <div class="text-center p-1.5 rounded bg-amber-950/40 border border-amber-800/40">
              <div class="text-lg font-bold text-amber-400">${amberSLA}</div>
              <div class="text-[9px] text-amber-500">SLA Amber</div>
            </div>
            <div class="text-center p-1.5 rounded bg-slate-700">
              <div class="text-lg font-bold text-red-300">${p1Cases}</div>
              <div class="text-[9px] text-slate-500">P1 Cases</div>
            </div>
          </div>
          <div class="mt-2 flex gap-1.5">
            <button onclick="SUPERVISOR.filterByAssociate('${assoc.id}')" class="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">View Cases</button>
            <button onclick="SUPERVISOR.bulkReassign('${assoc.id}')" class="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">Bulk Reassign</button>
          </div>
        </div>
      `;
    }).join('');
  },

  renderSLABreachAlerts() {
    const container = document.getElementById('sla-alerts');
    if (!container) return;

    const cases = this.getAllCases();
    const breaches = [];

    cases.forEach(c => {
      if (!c.sla) return;
      Object.entries(c.sla).forEach(([key, slaItem]) => {
        const countdown = APP.formatSLACountdown(slaItem.deadline);
        if (countdown.status === 'red') {
          breaches.push({ caseId: c.id, label: slaItem.label, countdown, assignedTo: c.assignedTo, category: c.category });
        }
      });
    });

    if (breaches.length === 0) {
      container.innerHTML = `<div class="py-4 text-center text-slate-500 text-sm">No active SLA breaches</div>`;
      return;
    }

    container.innerHTML = breaches.map(b => `
      <div class="flex items-center gap-3 p-2.5 rounded border border-red-800/40 bg-red-950/20 cursor-pointer hover:bg-red-950/30 transition-colors" onclick="window.location.href='case.html?case=${b.caseId}'">
        <svg viewBox="0 0 24 24" fill="#ef4444" class="w-4 h-4 flex-shrink-0"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
        <div class="flex-1">
          <div class="text-xs font-medium text-red-300">${b.caseId} — ${b.label}</div>
          <div class="text-[10px] text-slate-500">${b.category} · Assigned: ${b.assignedTo}</div>
        </div>
        <span class="text-[11px] font-bold text-red-400 flex-shrink-0">${b.countdown.text}</span>
      </div>
    `).join('');
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

  reassignCase(caseId) {
    const newAssignee = prompt(`Reassign case ${caseId} to:\n1. A. Rivera (ASSOC-0034)\n2. T. Nguyen (ASSOC-0051)\n3. M. Chen (ASSOC-0078)\n\nEnter name:`);
    if (newAssignee) {
      alert(`Case ${caseId} reassigned to ${newAssignee}. Notification sent.`);
    }
  },

  openQA(caseId) {
    alert(`QA Review opened for ${caseId}.\n\n[Mock: QA sampling interface would load here with structured QA checklist and finding recording.]`);
  },

  filterByAssociate(assocId) {
    // In a real impl, would filter the table
    alert(`Filtering queue to show cases for associate ${assocId}`);
  },

  bulkReassign(assocId) {
    alert(`Bulk reassignment modal for ${assocId}'s cases. Select cases to move.`);
  }
};
