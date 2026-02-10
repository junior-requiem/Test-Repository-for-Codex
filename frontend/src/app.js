const routes = [
  { name: "Home", path: "/" },
  { name: "Path", path: "/skills" },
  { name: "Practice", path: "/practice" },
  { name: "Review", path: "/review" },
  { name: "Profile", path: "/profile" },
];

const modules = [
  {
    id: "core-hr",
    name: "Core HR",
    color: "blue",
    lessons: [
      {
        id: "hr-1",
        title: "Worker Lifecycle",
        subtitle: "Hire, transfer, terminate",
        xp: 20,
        question: {
          prompt: "Before terminating an employee, you should:",
          options: ["Finalize payroll approvals", "Delete worker record", "Close pay period"],
          answer: 0,
        },
      },
      {
        id: "hr-2",
        title: "Legal Employer Setup",
        subtitle: "Enterprise structure",
        xp: 20,
        question: {
          prompt: "A legal employer is required for:",
          options: ["Employment relationships", "Supplier invoices", "PO dispatch"],
          answer: 0,
        },
      },
    ],
  },
  {
    id: "benefits",
    name: "Benefits",
    color: "purple",
    lessons: [
      {
        id: "ben-1",
        title: "Eligibility Profiles",
        subtitle: "Rules and criteria",
        xp: 25,
        question: {
          prompt: "Eligibility profiles are mainly used to:",
          options: ["Control plan access", "Run payroll", "Close accounting periods"],
          answer: 0,
        },
      },
      {
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
    id: "payroll",
    name: "Payroll",
    color: "green",
    lessons: [
      {
        id: "pay-1",
        title: "Payroll Inputs",
        subtitle: "Time and element entries",
        xp: 30,
        question: {
          prompt: "Payroll run should start after:",
          options: ["Approved time", "Posted AR invoices", "Supplier onboarding"],
          answer: 0,
        },
      },
      {
        id: "pay-2",
        title: "Prepayments",
        subtitle: "Validation and balancing",
        xp: 30,
        question: {
          prompt: "Prepayment validation checks:",
          options: ["Pay results before transfer", "Item costs", "PO match exceptions"],
          answer: 0,
        },
      },
    ],
  },
  {
    id: "talent",
    name: "Talent",
    color: "orange",
    lessons: [
      {
        id: "tal-1",
        title: "Goal Plans",
        subtitle: "Structure and alignment",
        xp: 35,
        question: {
          prompt: "A strong goal plan starts with:",
          options: ["Clear goals and eligibility", "Supplier categories", "Close checklist"],
          answer: 0,
        },
      },
      {
        id: "tal-2",
        title: "Performance Cycle",
        subtitle: "Calibration and completion",
        xp: 35,
        question: {
          prompt: "Performance cycle success depends on:",
          options: ["Timely manager/employee check-ins", "Invoice matching", "Tax setup"],
          answer: 0,
        },
      },
    ],
  },
];

const orderedLessons = modules.flatMap((module, moduleIndex) =>
  module.lessons.map((lesson, lessonIndex) => ({
    ...lesson,
    moduleId: module.id,
    moduleName: module.name,
    moduleColor: module.color,
    sequence: moduleIndex * 100 + lessonIndex,
  })),
);

const state = {
  profile: { name: "Learner", role: "HCM Consultant" },
  hearts: 5,
  xp: 0,
  level: 1,
  streak: 4,
  completedLessonIds: [],
  attempts: [],
  selectedLessonId: orderedLessons[0].id,
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

const getLessonIndex = (lessonId) => orderedLessons.findIndex((lesson) => lesson.id === lessonId);
const getLesson = (lessonId) => orderedLessons.find((lesson) => lesson.id === lessonId) ?? orderedLessons[0];

const nextThreshold = () => state.level * 120;
const updateLevel = () => {
  while (state.xp >= nextThreshold()) {
    state.level += 1;
  }
};

const addXp = (amount) => {
  state.xp += Math.max(0, amount);
  updateLevel();
};

const lessonStatus = (lessonId) => {
  if (state.completedLessonIds.includes(lessonId)) return "done";
  const index = getLessonIndex(lessonId);
  const allPreviousDone = orderedLessons
    .slice(0, index)
    .every((lesson) => state.completedLessonIds.includes(lesson.id));
  return allPreviousDone ? "current" : "locked";
};

const calculateModuleProgress = (moduleId) => {
  const moduleLessons = orderedLessons.filter((lesson) => lesson.moduleId === moduleId);
  const done = moduleLessons.filter((lesson) => state.completedLessonIds.includes(lesson.id)).length;
  return { done, total: moduleLessons.length };
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
      <h2>${title}</h2>
      <p>${subtitle}</p>
    </section>
    ${body}
  `;
};

const renderHome = () => {
  const totalLessons = orderedLessons.length;
  shell(
    "HCM Quest",
    "Duolingo-style path progression. Complete lessons in order to unlock the next node.",
    `
      <section class="stat-row">
        <article class="stat-card"><span>XP</span><strong>${state.xp}</strong></article>
        <article class="stat-card"><span>Level</span><strong>${state.level}</strong></article>
        <article class="stat-card"><span>Hearts</span><strong>${"❤️".repeat(state.hearts)}</strong></article>
        <article class="stat-card"><span>Completed</span><strong>${state.completedLessonIds.length}/${totalLessons}</strong></article>
      </section>
      <section class="panel">
        <h3>Learning order</h3>
        <p>Core HR → Benefits → Payroll → Talent</p>
        <button class="btn primary" id="startPath">Open Path</button>
      </section>
    `,
  );

  document.getElementById("startPath").addEventListener("click", () => go("/skills"));
};

const createPathNode = (lesson, index) => {
  const status = lessonStatus(lesson.id);
  const offsetClass = index % 2 === 0 ? "left" : "right";
  return `
    <div class="path-step ${offsetClass}">
      <div class="path-line"></div>
      <button
        class="lesson-node ${status} ${lesson.moduleColor}"
        data-lesson-id="${lesson.id}"
        ${status === "locked" ? "disabled" : ""}
        title="${lesson.title}"
      >
        ${status === "done" ? "✓" : status === "current" ? "★" : "🔒"}
      </button>
      <div class="path-label ${status}">
        <strong>${lesson.title}</strong>
        <small>${lesson.moduleName}</small>
      </div>
    </div>
  `;
};

const renderSkills = () => {
  shell(
    "Path",
    "Follow the exact sequence. Only the next lesson node is playable.",
    `
      <section class="panel">
        <div class="module-chips">
          ${modules
            .map((module) => {
              const progress = calculateModuleProgress(module.id);
              return `<span class="chip">${module.name}: ${progress.done}/${progress.total}</span>`;
            })
            .join("")}
        </div>
      </section>
      <section class="duo-path">
        ${orderedLessons.map((lesson, index) => createPathNode(lesson, index)).join("")}
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
