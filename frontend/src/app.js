const routes = [
  { name: "Home", path: "/" },
  { name: "Learn", path: "/skills" },
  { name: "Practice", path: "/practice" },
  { name: "Review", path: "/review" },
  { name: "Profile", path: "/profile" },
];

const units = [
  {
    id: "unit-1",
    title: "Unit 1",
    subtitle: "Core HR foundations",
    badge: "Start",
    lessons: [
      {
        id: "hr-1",
        title: "Worker Lifecycle",
        subtitle: "Hire, transfer, terminate",
        xp: 20,
        question: {
          prompt: "Before terminating an employee, what should be completed first?",
          options: ["Pending payroll approvals", "Supplier invoice matching", "PO dispatch"],
          answer: 0,
        },
      },
      {
        id: "hr-2",
        title: "Legal Employer Setup",
        subtitle: "Enterprise structure",
        xp: 20,
        question: {
          prompt: "A legal employer is needed for:",
          options: ["Employment relationships", "Receiving inspection", "Asset depreciation"],
          answer: 0,
        },
      },
      {
        id: "hr-3",
        title: "Document Records",
        subtitle: "HR compliance docs",
        xp: 20,
        question: {
          prompt: "Document records are used to:",
          options: ["Track employee compliance", "Create GL journals", "Approve purchase orders"],
          answer: 0,
        },
      },
    ],
  },
  {
    id: "unit-2",
    title: "Unit 2",
    subtitle: "Benefits and payroll",
    badge: "Build",
    lessons: [
      {
        id: "ben-1",
        title: "Eligibility Profiles",
        subtitle: "Rules and criteria",
        xp: 25,
        question: {
          prompt: "Eligibility profiles mostly control:",
          options: ["Plan access", "Tax settlement", "Supplier onboarding"],
          answer: 0,
        },
      },
      {
        id: "ben-2",
        title: "Open Enrollment",
        subtitle: "Election windows",
        xp: 25,
        question: {
          prompt: "Enrollment changes are often triggered by:",
          options: ["Life events", "AP invoices", "Inventory adjustments"],
          answer: 0,
        },
      },
      {
        id: "pay-1",
        title: "Payroll Inputs",
        subtitle: "Time and entries",
        xp: 30,
        question: {
          prompt: "Payroll should start after:",
          options: ["Approved time", "Bank reconciliation", "PO cancellation"],
          answer: 0,
        },
      },
    ],
  },
  {
    id: "unit-3",
    title: "Unit 3",
    subtitle: "Talent and performance",
    badge: "Master",
    lessons: [
      {
        id: "tal-1",
        title: "Goal Plans",
        subtitle: "Alignment and ownership",
        xp: 35,
        question: {
          prompt: "A strong goal plan begins with:",
          options: ["Clear goals and scope", "PO category mapping", "Journal imports"],
          answer: 0,
        },
      },
      {
        id: "tal-2",
        title: "Performance Cycle",
        subtitle: "Calibrate and close",
        xp: 35,
        question: {
          prompt: "Performance cycle quality improves with:",
          options: ["Frequent manager check-ins", "Invoice automation", "Subledger close"],
          answer: 0,
        },
      },
    ],
  },
];

const orderedLessons = units.flatMap((unit, unitIndex) =>
  unit.lessons.map((lesson, lessonIndex) => ({
    ...lesson,
    unitId: unit.id,
    unitTitle: unit.title,
    unitSubtitle: unit.subtitle,
    unitBadge: unit.badge,
    absoluteOrder: unitIndex * 100 + lessonIndex,
  })),
);

const state = {
  profile: { name: "Learner", role: "HCM Consultant" },
  hearts: 5,
  xp: 0,
  level: 1,
  streak: 6,
  selectedLessonId: orderedLessons[0].id,
  completedLessonIds: [],
  attempts: [],
  lastResult: null,
};

const navEl = document.getElementById("nav");
const appEl = document.getElementById("app");

const getPath = () => {
  const hash = location.hash.replace(/^#/, "") || "/";
  return hash.startsWith("/") ? hash : `/${hash}`;
};

const go = (path) => {
  location.hash = path;
};

const getLessonById = (lessonId) => orderedLessons.find((lesson) => lesson.id === lessonId) ?? orderedLessons[0];
const getLessonIndex = (lessonId) => orderedLessons.findIndex((lesson) => lesson.id === lessonId);

const nextLevelXp = () => state.level * 120;
const updateLevel = () => {
  while (state.xp >= nextLevelXp()) {
    state.level += 1;
  }
};

const addXp = (xp) => {
  state.xp += Math.max(0, xp);
  updateLevel();
};

const lessonStatus = (lessonId) => {
  if (state.completedLessonIds.includes(lessonId)) return "done";
  const lessonIndex = getLessonIndex(lessonId);
  const allPreviousDone = orderedLessons
    .slice(0, lessonIndex)
    .every((lesson) => state.completedLessonIds.includes(lesson.id));
  return allPreviousDone ? "current" : "locked";
};

const firstCurrentLessonId = () => {
  const current = orderedLessons.find((lesson) => lessonStatus(lesson.id) === "current");
  return current?.id ?? orderedLessons[orderedLessons.length - 1].id;
};

const unitProgress = (unitId) => {
  const lessons = orderedLessons.filter((lesson) => lesson.unitId === unitId);
  const done = lessons.filter((lesson) => state.completedLessonIds.includes(lesson.id)).length;
  return { done, total: lessons.length };
};

const buildReviewQueue = () => {
  const queue = orderedLessons.map((lesson) => ({ lessonId: lesson.id, title: lesson.title, misses: 0 }));
  state.attempts.forEach((attempt) => {
    if (!attempt.correct) {
      const item = queue.find((entry) => entry.lessonId === attempt.lessonId);
      if (item) item.misses += 1;
    }
  });
  return queue.sort((a, b) => b.misses - a.misses);
};

const createQuestProgress = () => {
  const completed = state.completedLessonIds.length;
  return [
    { label: "Complete 2 lessons", value: Math.min(Math.round((completed / 2) * 100), 100) },
    { label: "Earn 100 XP", value: Math.min(Math.round((state.xp / 100) * 100), 100) },
    { label: "Maintain 5 hearts", value: state.hearts === 5 ? 100 : Math.max(state.hearts * 20, 0) },
  ];
};

const renderNav = () => {
  const current = getPath();
  navEl.innerHTML = routes
    .map((route) => `<button class="nav-pill ${current === route.path ? "active" : ""}" data-route="${route.path}">${route.name}</button>`)
    .join("");

  navEl.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => go(button.dataset.route));
  });
};

const shell = (title, subtitle, body) => {
  appEl.innerHTML = `
    <section class="hero">
      <div>
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
      <div class="hero-stats">
        <span>🔥 ${state.streak}</span>
        <span>⚡ ${state.xp}</span>
        <span>❤️ ${state.hearts}</span>
      </div>
    </section>
    ${body}
  `;
};

const renderHome = () => {
  shell(
    "HCM Path",
    "Duolingo-inspired lesson path. Learn in order and unlock the next node.",
    `
      <section class="panel-grid">
        <article class="panel stat-card"><span>Level</span><strong>${state.level}</strong></article>
        <article class="panel stat-card"><span>Completed</span><strong>${state.completedLessonIds.length}/${orderedLessons.length}</strong></article>
        <article class="panel stat-card"><span>Current Lesson</span><strong>${getLessonById(firstCurrentLessonId()).title}</strong></article>
      </section>
      <section class="panel home-action">
        <h3>Continue your path</h3>
        <p>Pick up where you left off in the learning tree.</p>
        <button class="btn primary" id="homeContinue">Go to Learning Path</button>
      </section>
    `,
  );

  document.getElementById("homeContinue").addEventListener("click", () => go("/skills"));
};

const renderUnitBlock = (unit) => {
  const progress = unitProgress(unit.id);
  const unitLessons = orderedLessons.filter((lesson) => lesson.unitId === unit.id);

  return `
    <section class="unit-block">
      <header class="unit-header">
        <div>
          <p>${unit.title}</p>
          <h3>${unit.subtitle}</h3>
        </div>
        <span class="unit-badge">${unit.badge}</span>
      </header>
      <div class="path-rail">
        ${unitLessons
          .map((lesson, index) => {
            const status = lessonStatus(lesson.id);
            const direction = index % 2 === 0 ? "left" : "right";
            return `
              <div class="path-node-wrap ${direction}">
                <button
                  class="path-node ${status}"
                  data-lesson-id="${lesson.id}"
                  ${status === "locked" ? "disabled" : ""}
                  title="${lesson.title}"
                >
                  <span class="node-inner">${status === "done" ? "✓" : "★"}</span>
                </button>
                <div class="node-caption ${status}">
                  <strong>${lesson.title}</strong>
                  <small>${lesson.subtitle}</small>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
      <footer class="unit-progress">${progress.done}/${progress.total} complete</footer>
    </section>
  `;
};

const renderSkills = () => {
  const quests = createQuestProgress();
  shell(
    "Learn",
    "Section-based path with interactive lesson nodes.",
    `
      <section class="learn-layout">
        <div class="learn-main">
          ${units.map((unit) => renderUnitBlock(unit)).join("")}
        </div>
        <aside class="learn-side panel">
          <h3>Daily Quests</h3>
          <ul class="quest-list">
            ${quests
              .map(
                (quest) => `
                  <li>
                    <div class="quest-head"><span>${quest.label}</span><strong>${quest.value}%</strong></div>
                    <div class="quest-bar"><span style="width:${quest.value}%"></span></div>
                  </li>
                `,
              )
              .join("")}
          </ul>
        </aside>
      </section>
    `,
  );

  appEl.querySelectorAll("[data-lesson-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedLessonId = button.dataset.lessonId;
      go("/practice");
    });
  });
};

const renderPractice = () => {
  const lesson = getLessonById(state.selectedLessonId);
  const status = lessonStatus(lesson.id);

  if (status === "locked") {
    shell(
      "Lesson locked",
      "Complete previous lessons to unlock this node.",
      `<section class="panel"><button class="btn primary" id="backLearn">Back to Learn</button></section>`,
    );

    document.getElementById("backLearn").addEventListener("click", () => go("/skills"));
    return;
  }

  shell(
    lesson.title,
    `${lesson.unitTitle} • ${lesson.subtitle} • Reward ${lesson.xp} XP`,
    `
      <section class="panel practice-card ${state.lastResult === "correct" ? "celebrate" : ""}">
        <p class="question">${lesson.question.prompt}</p>
        <div class="answers">
          ${lesson.question.options
            .map((option, index) => `<button class="btn answer" data-index="${index}">${option}</button>`)
            .join("")}
        </div>
        <p id="practiceMessage" class="practice-message">Choose the best answer.</p>
        <div class="practice-actions">
          <button class="btn primary" id="toPath">Back to Path</button>
        </div>
      </section>
    `,
  );

  document.getElementById("toPath").addEventListener("click", () => go("/skills"));

  appEl.querySelectorAll(".answer").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = Number(button.dataset.index);
      const isCorrect = selected === lesson.question.answer;
      state.attempts.push({ lessonId: lesson.id, correct: isCorrect, at: new Date().toISOString() });

      const messageEl = document.getElementById("practiceMessage");
      appEl.querySelectorAll(".answer").forEach((btn, index) => {
        btn.disabled = true;
        if (index === lesson.question.answer) {
          btn.classList.add("is-correct");
        }
        if (index === selected && !isCorrect) {
          btn.classList.add("is-wrong");
        }
      });

      if (isCorrect) {
        state.lastResult = "correct";
        if (!state.completedLessonIds.includes(lesson.id)) {
          state.completedLessonIds.push(lesson.id);
          addXp(lesson.xp);
        }

        messageEl.textContent = "Great job! Lesson complete. +XP";
        messageEl.className = "practice-message ok";

        const card = document.querySelector(".practice-card");
        card.classList.add("celebrate");
      } else {
        state.lastResult = "wrong";
        state.hearts = Math.max(0, state.hearts - 1);
        messageEl.textContent = "Not quite. Review and try again on your path.";
        messageEl.className = "practice-message bad";
      }
    });
  });
};

const renderReview = () => {
  const queue = buildReviewQueue();
  shell(
    "Review",
    "Lessons with most misses bubble to the top.",
    `
      <section class="panel">
        <ul class="review-list">
          ${queue.map((item) => `<li><span>${item.title}</span><strong>${item.misses} misses</strong></li>`).join("")}
        </ul>
        <button class="btn success" id="finishReview">Complete review session (+10 XP)</button>
      </section>
    `,
  );

  document.getElementById("finishReview").addEventListener("click", () => {
    addXp(10);
    const button = document.getElementById("finishReview");
    button.disabled = true;
    button.textContent = "Completed";
  });
};

const renderProfile = () => {
  shell(
    "Profile",
    "Set your learner profile for the journey.",
    `
      <section class="panel">
        <div class="form-row">
          <label>Name <input id="nameInput" value="${state.profile.name}" /></label>
          <label>Role <input id="roleInput" value="${state.profile.role}" /></label>
          <button class="btn primary" id="saveProfile">Save</button>
        </div>
        <p class="profile-note">${state.profile.name} • ${state.profile.role}</p>
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
  if (!location.hash) {
    go("/");
  }
  renderRoute();
});
