const pages = [
  {
    id: 'overview',
    title: 'Platform Overview',
    icon: '🧭',
    intro: 'Learn the structure of Fusion Payroll, key modules, and how teams navigate the ecosystem.',
    sections: [
      { icon: '🏛️', title: 'Architecture', body: 'Core architecture components include Payroll Definitions, Legislative Data Groups, and security roles that control process access.' },
      { icon: '🧩', title: 'Modules', body: 'Documentation links HR, Time & Labor, Absence Management, and Payroll Processing to help users understand dependencies.' },
      { icon: '🚀', title: 'Getting Started', body: 'Use this section for implementation prerequisites, environment setup, and migration planning notes.' }
    ],
    links: [
      { label: 'Implementation checklist', href: '#overview' },
      { label: 'Module dependency map', href: '#overview' }
    ]
  },
  {
    id: 'configuration',
    title: 'Configuration Guide',
    icon: '⚙️',
    intro: 'Configure payroll calendars, element classifications, payment methods, and costing rules with step-by-step guidance.',
    sections: [
      { icon: '📅', title: 'Payroll Calendar Setup', body: 'Define frequencies, periods, and cut-off windows so payroll cycles are predictable and auditable.' },
      { icon: '💳', title: 'Payment Methods', body: 'Document bank account setup, payment source priorities, and validations for direct deposit and checks.' },
      { icon: '📘', title: 'Element Entries', body: 'Capture recurring and one-time elements, balancing dimensions, and eligibility rules.' }
    ],
    links: [
      { label: 'Configuration runbook', href: '#configuration' },
      { label: 'Validation standards', href: '#configuration' }
    ]
  },
  {
    id: 'operations',
    title: 'Payroll Operations',
    icon: '🧾',
    intro: 'Follow the operational sequence from pre-payroll checks to costing and post-run reconciliation.',
    sections: [
      { icon: '✅', title: 'Pre-Payroll Validation', body: 'Review missing timecards, pending approvals, and element exceptions before running payroll.' },
      { icon: '🔁', title: 'Calculate & Retry', body: 'Run Calculate Payroll, inspect errors, and use targeted retries for failed assignment groups.' },
      { icon: '📊', title: 'Post-Run Reconciliation', body: 'Reconcile balances, verify payment totals, and prepare sign-off summaries for auditors and finance leads.' }
    ],
    links: [
      { label: 'Daily operations checklist', href: '#operations' },
      { label: 'Exception handling playbook', href: '#operations' }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations & Reporting',
    icon: '🔗',
    intro: 'Use integration references for inbound data, outbound files, and dashboard/reporting best practices.',
    sections: [
      { icon: '📥', title: 'Inbound Interfaces', body: 'Track file formats and field mappings for time, absences, and payroll element imports.' },
      { icon: '📤', title: 'Outbound Files', body: 'Document payment file generation, GL transfer schedules, and regulatory output expectations.' },
      { icon: '📈', title: 'Operational Dashboards', body: 'Publish KPI definitions for gross-to-net, retro trends, and cycle completion SLA metrics.' }
    ],
    links: [
      { label: 'Integration mapping sheet', href: '#integrations' },
      { label: 'Reporting glossary', href: '#integrations' }
    ]
  },
  {
    id: 'support',
    title: 'Support & Troubleshooting',
    icon: '🛠️',
    intro: 'Provide practical resolutions, ownership guidance, and escalation paths for payroll incidents.',
    sections: [
      { icon: '🚨', title: 'Critical Incidents', body: 'Define severity levels, service owners, and communication templates for payroll-impacting events.' },
      { icon: '🧪', title: 'Root Cause Analysis', body: 'Capture known error signatures and proven remediation steps with verification criteria.' },
      { icon: '📞', title: 'Escalation Matrix', body: 'List support tiers, SLAs, and emergency contacts for finance, HRIS, and vendor operations.' }
    ],
    links: [
      { label: 'Incident triage workflow', href: '#support' },
      { label: 'Escalation contacts', href: '#support' }
    ]
  }
];

let currentPageId = pages[0].id;

const navEl = document.getElementById('docs-nav');
const appEl = document.getElementById('app');
const menuToggle = document.getElementById('menu-toggle');

const renderNav = () => {
  const items = pages
    .map(
      (page) => `
      <li>
        <button class="nav-item ${page.id === currentPageId ? 'active' : ''}" data-page-id="${page.id}">
          <span aria-hidden="true">${page.icon}</span>
          <span>${page.title}</span>
        </button>
      </li>
    `
    )
    .join('');

  navEl.innerHTML = `<ul class="nav-list">${items}</ul>`;
};

const renderPage = () => {
  const page = pages.find((item) => item.id === currentPageId);
  if (!page) return;

  const cards = page.sections
    .map(
      (section) => `
      <article class="doc-card" id="${page.id}-${section.title.toLowerCase().replaceAll(' ', '-')}">
        <h3>
          <span aria-hidden="true">${section.icon}</span>
          <span>${section.title}</span>
        </h3>
        <p>${section.body}</p>
      </article>
    `
    )
    .join('');

  const links = page.links
    .map((link) => `<li><a href="${link.href}">${link.label}</a></li>`)
    .join('');

  appEl.innerHTML = `
    <section>
      <header class="page-header" id="${page.id}">
        <span class="section-icon" aria-hidden="true">${page.icon}</span>
        <div>
          <h2>${page.title}</h2>
        </div>
      </header>
      <p class="page-intro">${page.intro}</p>
      <div class="card-grid">${cards}</div>
      <aside class="quick-links">
        <h4>Quick links</h4>
        <ul>${links}</ul>
      </aside>
    </section>
  `;
};

navEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-page-id]');
  if (!button) return;

  currentPageId = button.dataset.pageId;
  renderNav();
  renderPage();
  navEl.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
});

menuToggle.addEventListener('click', () => {
  const willOpen = !navEl.classList.contains('open');
  navEl.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(willOpen));
});

renderNav();
renderPage();
