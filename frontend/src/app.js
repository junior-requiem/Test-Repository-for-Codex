const routes = [
  { name: "Home", path: "/" },
  { name: "Learn", path: "/skills" },
  { name: "Practice", path: "/practice" },
  { name: "Review", path: "/review" },
  { name: "Profile", path: "/profile" },
];

const sections = [
  {
    id: "foundation",
    title: "Section 1, Unit 1",
    subtitle: "Core HR Foundations",
    color: "section-primary",
    lessons: [
      {
        id: "l1",
        title: "Worker Lifecycle",
        description: "Hire, transfer, terminate",
        fusionPoints: 20,
        question: {
          prompt: "Before terminating an employee, what should happen first?",
          options: ["Finalize pending payroll approvals", "Delete worker record", "Close supplier account"],
          answer: 0,
        },
      },
      {
        id: "l2",
        title: "Legal Employer",
        description: "Employment structure",
        fusionPoints: 25,
        question: {
          prompt: "Legal employer setup is required for:",
          options: ["Employment relationships", "Invoice matching rules", "Supplier tax profile"],
          answer: 0,
        },
      },
      {
        id: "l3",
        title: "Benefits Eligibility",
        description: "Plan access rules",
        fusionPoints: 25,
        question: {
          prompt: "Eligibility profiles are used to:",
          options: ["Control plan enrollment access", "Run accounting close", "Dispatch purchase orders"],
          answer: 0,
        },
      },
    ],
  },
  {
    id: "operations",
    title: "Section 1, Unit 2",
    subtitle: "Payroll & Talent",
    color: "section-secondary",
    lessons: [
      {
        id: "l4",
        title: "Payroll Inputs",
        description: "Time and element entries",
        fusionPoints: 30,
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
        fusionPoints: 30,
        question: {
          prompt: "Prepayment validation confirms:",
          options: ["Pay results before transfer", "Asset depreciation", "PO dispatch status"],
          answer: 0,
        },
      },
    ],
  },
];

const lessons = sections.flatMap((section) =>
  section.lessons.map((lesson) => ({
    ...lesson,
    sectionId: section.id,
    sectionTitle: section.title,
    sectionSubtitle: section.subtitle,
  })),
);

const state = {
  profile: { name: "Learner", role: "HCM Consultant" },
  hearts: 4,
  fusionPoints: 185,
  level: 2,
  implementationStreak: 9,
  completed: ["l1", "l2", "l3"],
  attempts: [],
  selectedLessonId: "l4",
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

const nextLevelTarget = () => state.level * 120;
const addFusionPoints = (value) => {
  state.fusionPoints += Math.max(0, value);
  while (state.fusionPoints >= nextLevelTarget()) {
    state.level += 1;
  }
};

const statusForLesson = (id) => {
  if (state.completed.includes(id)) return "done";
  const idx = lessonIndex(id);
  const unlocked = lessons.slice(0, idx).every((lesson) => state.completed.includes(lesson.id));
  return unlocked ? "current" : "locked";
};

const masteryPercent = () => Math.round((state.completed.length / lessons.length) * 100);

const quests = () => {
  const completedLessons = state.completed.length;
  return [
    { label: "Complete 2 lessons", value: Math.min(completedLessons / 2, 1) },
    { label: "Earn 100 Fusion Points", value: Math.min(state.fusionPoints / 100, 1) },
    { label: "Keep 5 hearts", value: state.hearts >= 5 ? 1 : state.hearts / 5 },
  ];
};

const reviewQueue = () => {
  const queue = lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, misses: 0 }));
  state.attempts.forEach((attempt) => {
    if (!attempt.correct) {
      const row = queue.find((item) => item.id === attempt.lessonId);
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

const renderRightRail = () => {
  const items = quests();
  return `
    <aside class="right-rail" aria-label="progress sidebar">
      <section class="panel rail-card">
        <h3>Progress</h3>
        <div class="metric-list">
          <span>⚡ ${state.fusionPoints} Fusion Points</span>
          <span>🔥 ${state.implementationStreak} day streak</span>
          <span>💗 ${state.hearts} hearts</span>
        </div>
      </section>
      <section class="panel rail-card">
        <h3>Quests</h3>
        ${items
          .map((item) => {
            const done = item.value >= 1;
            return `
              <div class="quest-mini ${done ? "done" : ""}">
                <small>${item.label}</small>
                <div class="bar"><span style="width:${Math.round(item.value * 100)}%"></span></div>
              </div>
            `;
          })
          .join("")}
      </section>
    </aside>
  `;
};

const renderShell = (title, subtitle, primaryAction, body) => {
  appEl.innerHTML = `
    <div class="content-layout">
      <main class="main-column">
        <section class="hero-card">
          <h2>${title}</h2>
          <p>${subtitle}</p>
          ${primaryAction || ""}
        </section>
        ${body}
      </main>
      ${renderRightRail()}
    </div>
  `;
};

const renderHome = () => {
  renderShell(
    "Learning Flow",
    "Interactive onboarding, learning, and review experience.",
    `<button id="openPath" class="btn primary">Continue Learning</button>`,
    `
      <section class="stats-grid">
        <article class="panel stat"><span></span><strong>Level    ${state.level}</strong></article>
        <article class="panel stat"><span></span><strong>Mastery   ${masteryPercent()}%</strong></article>
      </section>
      <section class="panel">
        <h3>Current track</h3>
        <p>Core HR Foundations → Payroll & Talent</p>
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
  </div>
`;

const renderNode = (lesson, index) => {
  const side = index % 2 === 0 ? "left" : "right";
  const status = statusForLesson(lesson.id);
  const symbol = status === "done" ? "✓" : status === "current" ? "★" : "🔒";
  return `
    <div class="path-row ${side}">
      <div class="path-rail ${index === 0 ? "hidden" : ""}"></div>
      <button class="lesson-node ${status}" data-lesson-id="${lesson.id}" ${status === "locked" ? "disabled" : ""} aria-label="${lesson.title}">${symbol}</button>
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

  renderShell("Learn", "Only one next lesson is active.", null, sectionBlocks);

  appEl.querySelectorAll("[data-lesson-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedLessonId = button.dataset.lessonId;
      navigate("/practice");
    });
  });
};

const spawnConfetti = () => {
  const burst = document.createElement("div");
  burst.className = "confetti-burst";
  for (let i = 0; i < 16; i += 1) {
    const dot = document.createElement("span");
    dot.style.setProperty("--x", `${(Math.random() * 180 - 90).toFixed(0)}px`);
    dot.style.setProperty("--y", `${(Math.random() * 120 - 60).toFixed(0)}px`);
    dot.style.setProperty("--d", `${(Math.random() * 220 + 220).toFixed(0)}ms`);
    burst.appendChild(dot);
  }
  const panel = document.getElementById("lessonPanel");
  panel.appendChild(burst);
  setTimeout(() => burst.remove(), 700);
};

const lockAnswers = (buttons, selectedIndex, answerIndex) => {
  buttons.forEach((button) => {
    const idx = Number(button.dataset.index);
    button.disabled = true;
    if (idx === answerIndex) button.classList.add("correct");
    if (idx === selectedIndex && idx !== answerIndex) button.classList.add("wrong");
  });
};

const renderPractice = () => {
  const lesson = findLesson(state.selectedLessonId);
  const lessonStatus = statusForLesson(lesson.id);

  if (lessonStatus === "locked") {
    renderShell(
      "Lesson locked",
      "Complete the previous lesson first.",
      `<button id="backPath" class="btn primary">Back to path</button>`,
      `<section class="panel"><p>This lesson unlocks next.</p></section>`,
    );
    document.getElementById("backPath").addEventListener("click", () => navigate("/skills"));
    return;
  }

  const progressValue = ((lessonIndex(lesson.id) + 1) / lessons.length) * 100;

  renderShell(
    "Practice",
    `${lesson.sectionSubtitle} • +${lesson.fusionPoints} Fusion Points`,
    null,
    `
      <section class="panel lesson-progress">
        <div class="row-in-a-row">${state.implementationStreak} IN A ROW</div>
        <div class="bar"><span style="width:${Math.round(progressValue)}%"></span></div>
      </section>
      <section class="panel lesson-panel" id="lessonPanel">
        <h3>${lesson.question.prompt}</h3>
        <div class="answer-grid">
          ${lesson.question.options.map((option, i) => `<button class="btn answer" data-index="${i}">${option}</button>`).join("")}
        </div>
        <p class="feedback" id="feedbackText">Choose one answer.</p>
      </section>
      <section class="feedback-dock" id="continueWrap"></section>
    `,
  );

  const answerButtons = Array.from(appEl.querySelectorAll(".answer"));
  answerButtons.forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const selectedIndex = Number(button.dataset.index);
        const correct = selectedIndex === lesson.question.answer;

        state.attempts.push({ lessonId: lesson.id, correct, at: new Date().toISOString() });
        lockAnswers(answerButtons, selectedIndex, lesson.question.answer);

        const panel = document.getElementById("lessonPanel");
        const feedback = document.getElementById("feedbackText");
        const continueWrap = document.getElementById("continueWrap");

        if (correct) {
          panel.classList.add("celebrate");
          spawnConfetti();
          feedback.textContent = "Nice work!";
          feedback.classList.add("ok");
          state.implementationStreak += 1;
          if (!state.completed.includes(lesson.id)) {
            state.completed.push(lesson.id);
            addFusionPoints(lesson.fusionPoints);
          }
          continueWrap.className = "feedback-dock success";
          continueWrap.innerHTML = `<div><strong>Awesome!</strong><p>Module progress updated.</p></div><button id="continueBtn" class="btn success">Continue</button>`;
        } else {
          panel.classList.add("error-flash", "shake");
          feedback.textContent = "Not quite — try again.";
          feedback.classList.add("bad");
          state.hearts = Math.max(0, state.hearts - 1);
          state.implementationStreak = Math.max(0, state.implementationStreak - 1);
          setTimeout(() => panel.classList.remove("error-flash"), 150);
          continueWrap.className = "feedback-dock error";
          continueWrap.innerHTML = `<div><strong>Almost.</strong><p>Let’s look at how Oracle processes this.</p></div><button id="continueBtn" class="btn primary">Try next</button>`;
        }

        document.getElementById("continueBtn").addEventListener("click", () => navigate("/skills"));
      },
      { once: true },
    );
  });
};

const renderReview = () => {
  const queue = reviewQueue();
  renderShell(
    "Review",
    "Focus on weak spots first.",
    `<button id="reviewReward" class="btn primary">Finish Review</button>`,
    `
      <section class="panel">
        <ul class="review-list">
          ${queue.map((row) => `<li><span>${row.title}</span><span>misses ${row.misses}</span></li>`).join("")}
        </ul>
      </section>
    `,
  );

  document.getElementById("reviewReward").addEventListener("click", () => {
    addFusionPoints(10);
    const button = document.getElementById("reviewReward");
    button.textContent = "Completed";
    button.disabled = true;
  });
};

const renderProfile = () => {
  renderShell(
    "Profile",
    "Keep your learning identity current.",
    `<button id="saveProfile" class="btn primary">Save</button>`,
    `
      <section class="panel">
        <div class="profile-form">
          <label>Name <input id="nameInput" /></label>
          <label>Role <input id="roleInput" /></label>
        </div>
        <p id="profileSummary"></p>
      </section>
    `,
  );

  const nameInput = document.getElementById("nameInput");
  const roleInput = document.getElementById("roleInput");
  const profileSummary = document.getElementById("profileSummary");

  nameInput.value = state.profile.name;
  roleInput.value = state.profile.role;
  profileSummary.textContent = `${state.profile.name} • ${state.profile.role}`;

  document.getElementById("saveProfile").addEventListener("click", () => {
    state.profile.name = nameInput.value.trim() || state.profile.name;
    state.profile.role = roleInput.value.trim() || state.profile.role;
    renderProfile();
  });
};

const renderRoute = () => {
  renderNav();
  const route = getPath();
  if (route === "/") return renderHome();
  if (route === "/skills") return renderSkills();
  if (route === "/practice") return renderPractice();
  if (route === "/review") return renderReview();
  if (route === "/profile") return renderProfile();
  return renderShell("Not found", "Unknown route.", null, `<section class="panel"><code>${route}</code></section>`);
};

window.addEventListener("hashchange", renderRoute);
window.addEventListener("load", () => {
  if (!location.hash) navigate("/");
  renderRoute();
});
