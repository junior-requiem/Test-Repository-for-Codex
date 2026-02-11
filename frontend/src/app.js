const routes = [
  { name: "Home", path: "/" },
  { name: "Path", path: "/skills" },
  { name: "Practice", path: "/practice" },
  { name: "Review", path: "/review" },
  { name: "Profile", path: "/profile" },
];

const sections = [
  {
    id: "foundation",
    title: "Section 1, Unit 1",
    subtitle: "HCM Foundations",
    color: "section-green",
    lessons: [
      {
        id: "l1",
        title: "Worker Lifecycle",
        description: "Hire, transfer, terminate",
        xp: 20,
        question: {
          prompt: "Before terminating an employee, what should be done first?",
          options: ["Finalize pending payroll approvals", "Delete worker record", "Close supplier account"],
          answer: 0,
        },
      },
      {
        id: "l2",
        title: "Legal Employer",
        description: "Employment structures",
        xp: 25,
        question: {
          prompt: "Legal employer setup is needed to establish:",
          options: ["Employment relationships", "Invoice matching rules", "Supplier tax profile"],
          answer: 0,
        },
      },
      {
        id: "l3",
        title: "Benefits Eligibility",
        description: "Plan access rules",
        xp: 25,
        question: {
          prompt: "Eligibility profiles are used to:",
          options: ["Control plan enrollment access", "Run accounting close", "Dispatch purchase orders"],
        id: "ben-2",
        title: "Open Enrollment",
        subtitle: "Election windows",
        xp: 25,
        question: {
          prompt: "Enrollment changes are commonly triggered by:",
          options: ["Life events", "Bank reconciliation", "PO approval"],
          answer: 0,
        },
      },
    ],
  },
  {
    id: "operations",
    title: "Section 1, Unit 2",
    subtitle: "Payroll & Talent",
    color: "section-blue",
    lessons: [
      {
        id: "l4",
        title: "Payroll Inputs",
        description: "Time and element entries",
        xp: 30,
        question: {
          prompt: "Payroll should begin after:",
          options: ["Approved time collection", "AR invoices posted", "Supplier onboarding"],
          answer: 0,
        },
      },
      {
        id: "l5",
        title: "Prepayments",
        description: "Validate and transfer",
        xp: 30,
        question: {
          prompt: "Prepayment validation confirms:",
          options: ["Pay results before transfer", "Asset depreciation", "PO dispatch status"],
          answer: 0,
        },
      },
      {
        id: "l6",
        title: "Performance Cycle",
        description: "Goal and review cadence",
        xp: 35,
        question: {
          prompt: "A healthy performance cycle requires:",
          options: ["Regular manager and employee check-ins", "Supplier requalification", "Period close lock"],
          answer: 0,
        },
      },
    ],
  },
];

const lessons = sections.flatMap((section, sectionIndex) =>
  section.lessons.map((lesson, indexInSection) => ({
    ...lesson,
    sectionId: section.id,
    sectionTitle: section.title,
    sectionSubtitle: section.subtitle,
    sectionColor: section.color,
    order: sectionIndex * 100 + indexInSection,
  })),
);

const state = {
  profile: { name: "Learner", role: "HCM Consultant" },
  hearts: 5,
  xp: 0,
  level: 1,
  completed: [],
  attempts: [],
  selectedLessonId: lessons[0].id,
  lastAnswerCorrect: null,
};

const navEl = document.getElementById("nav");
const appEl = document.getElementById("app");

const getPath = () => {
  const hash = location.hash.replace(/^#/, "") || "/";
  return hash.startsWith("/") ? hash : `/${hash}`;
};

const navigate = (path) => {
  location.hash = path;
};

const findLesson = (id) => lessons.find((lesson) => lesson.id === id) ?? lessons[0];
const lessonIndex = (id) => lessons.findIndex((lesson) => lesson.id === id);

const xpTarget = () => state.level * 120;
const updateLevel = () => {
  while (state.xp >= xpTarget()) {
    state.level += 1;
  }
};

const addXp = (value) => {
  state.xp += Math.max(0, value);
  updateLevel();
};

const statusForLesson = (id) => {
  if (state.completed.includes(id)) return "done";
  const i = lessonIndex(id);
  const unlocked = lessons.slice(0, i).every((lesson) => state.completed.includes(lesson.id));
  return unlocked ? "current" : "locked";
};

const reviewQueue = () => {
  const queue = lessons.map((lesson) => ({ title: lesson.title, misses: 0 }));
  state.attempts.forEach((attempt) => {
    if (!attempt.correct) {
      const row = queue.find((item) => item.title === findLesson(attempt.lessonId).title);
      if (row) row.misses += 1;
    }
  });
  return queue.sort((a, b) => b.misses - a.misses);
};

const renderNav = () => {
  const current = getPath();
  navEl.innerHTML = routes
    .map((route) => `<button class="nav-pill ${current === route.path ? "active" : ""}" data-route="${route.path}">${route.name}</button>`)
    .join("");

  navEl.querySelectorAll("[data-route]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.route));
  });
};

const renderShell = (title, subtitle, body) => {
  appEl.innerHTML = `
    <section class="hero-card">
      <h2>${title}</h2>
      <p>${subtitle}</p>
    </section>
    ${body}
  `;
};

const renderHome = () => {
renderShell(
    "Duo-inspired HCM Journey",
    "Follow the lesson path in order. Green checks unlock your next node.",
    `
      <section class="stats-grid">
        <article class="panel stat"><span>XP</span><strong>${state.xp}</strong></article>
        <article class="panel stat"><span>Level</span><strong>${state.level}</strong></article>
        <article class="panel stat"><span>Hearts</span><strong>${"❤️".repeat(state.hearts)}</strong></article>
        <article class="panel stat"><span>Completed</span><strong>${state.completed.length}/${lessons.length}</strong></article>
      </section>
      <section class="panel">
        <h3>Section order</h3>
        <p>HCM Foundations → Payroll & Talent</p>
        <button id="openPath" class="btn green">Start Learning Path</button>
      </section>
    `,
  );

  document.getElementById("openPath").addEventListener("click", () => navigate("/skills"));
};

const renderSectionHeader = (section) => `
  <div class="section-banner ${section.color}">
    <div>
      <span>${section.title.toUpperCase()}</span>
      <h3>${section.subtitle}</h3>
    </div>
    <button class="btn ghost">CONTINUE</button>
  </div>
`;

const renderNode = (lesson, index) => {
  const side = index % 2 === 0 ? "left" : "right";
  const status = statusForLesson(lesson.id);
  const symbol = status === "done" ? "✓" : status === "current" ? "★" : "🔒";
  return `
    <div class="path-row ${side}">
      <div class="path-rail ${index === 0 ? "hidden" : ""}"></div>
      <button class="lesson-node ${status}" data-lesson-id="${lesson.id}" ${status === "locked" ? "disabled" : ""}>${symbol}</button>
      <div class="node-caption ${status}">
        <strong>${lesson.title}</strong>
        <small>${lesson.description}</small>
      </div>
      ${status === "current" ? '<div class="start-pill">START</div>' : ""}
    </div>
  `;
};

const renderSkills = () => {
  const sectionBlocks = sections
    .map((section) => {
      const sectionLessons = lessons.filter((lesson) => lesson.sectionId === section.id);
      return `
        ${renderSectionHeader(section)}
        <section class="path-block">
          ${sectionLessons.map((lesson, i) => renderNode(lesson, i)).join("")}
        </section>
      `;
    })
    .join("");

  renderShell("Path", "Exactly one next lesson is active, just like Duolingo units.", sectionBlocks);

  appEl.querySelectorAll("[data-lesson-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedLessonId = button.dataset.lessonId;
      go("/practice");
    });
  });
};

const renderPractice = () => {
  const lesson = getLesson(state.selectedLessonId);
  const status = lessonStatus(lesson.id);

  if (status === "locked") {
    shell("Lesson locked", "Finish previous lessons first.", `<section class="panel"><button class="btn primary" id="backPath">Back to Path</button></section>`);
    document.getElementById("backPath").addEventListener("click", () => go("/skills"));
    return;
  }

  shell(
    lesson.title,
    `${lesson.moduleName} • ${lesson.subtitle} • Reward: ${lesson.xp} XP`,
    `
      <section class="panel">
        <h3>${lesson.question.prompt}</h3>
        <div class="answers">
          ${lesson.question.options
            .map((option, index) => `<button class="btn secondary answer" data-index="${index}">${option}</button>`)
            .join("")}
        </div>
        <p id="practiceStatus" class="hint">Choose one answer.</p>
      </section>
    `,
  );

  appEl.querySelectorAll(".answer").forEach((button) => {
    button.addEventListener("click", () => {
      const correct = Number(button.dataset.index) === lesson.question.answer;
      state.attempts.push({ lessonId: lesson.id, correct, at: new Date().toISOString() });

      if (correct) {
        if (!state.completedLessonIds.includes(lesson.id)) {
          state.completedLessonIds.push(lesson.id);
          addXp(lesson.xp);
        }
      } else {
        state.hearts = Math.max(0, state.hearts - 1);
      }

      document.getElementById("practiceStatus").textContent = correct
        ? "Correct! Lesson complete. Return to Path for next node."
        : "Incorrect. You lost one heart and this lesson is now review priority.";
    });
  });
};

const renderReview = () => {
  const queue = buildReviewQueue();
  shell(
    "Review",
    "Lessons with most misses appear first.",
    `
      <section class="panel">
        <ul class="review-list">
          ${queue.map((item) => `<li>${item.title}<span>misses: ${item.misses}</span></li>`).join("")}
        </ul>
        <button class="btn success" id="reviewBoost">Complete review session (+10 XP)</button>
      </section>
    `,
  );

  document.getElementById("reviewBoost").addEventListener("click", () => {
    addXp(10);
    const button = document.getElementById("reviewBoost");
    button.disabled = true;
    button.textContent = "Session complete";
  });
};

const renderProfile = () => {
  shell(
    "Profile",
    "Customize your learner identity.",
    `
      <section class="panel">
        <div class="form-row">
          <label>Name <input id="nameInput" value="${state.profile.name}" /></label>
          <label>Role <input id="roleInput" value="${state.profile.role}" /></label>
          <button class="btn primary" id="saveProfile">Save</button>
        </div>
        <p class="hint">${state.profile.name} • ${state.profile.role}</p>
      </section>
    `,
  );

  document.getElementById("saveProfile").addEventListener("click", () => {
    state.profile.name = document.getElementById("nameInput").value.trim() || state.profile.name;
    state.profile.role = document.getElementById("roleInput").value.trim() || state.profile.role;
    renderProfile();
  });
};

const renderRoute = () => {
  renderNav();
  const path = getPath();
  if (path === "/") return renderHome();
  if (path === "/skills") return renderSkills();
  if (path === "/practice") return renderPractice();
  if (path === "/review") return renderReview();
  if (path === "/profile") return renderProfile();
  return shell("Not found", "Unknown route", `<section class="panel">${path}</section>`);
};

window.addEventListener("hashchange", renderRoute);
window.addEventListener("load", () => {
  if (!location.hash) go("/");
  renderRoute();
});
