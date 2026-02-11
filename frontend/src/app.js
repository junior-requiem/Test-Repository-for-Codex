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
      navigate("/practice");
    });
  });
};

const setAnswerStyles = (buttons, selectedIndex, answerIndex) => {
  buttons.forEach((button) => {
    const idx = Number(button.dataset.index);
    button.disabled = true;
    if (idx === answerIndex) {
      button.classList.add("correct");
    }
    if (idx === selectedIndex && idx !== answerIndex) {
      button.classList.add("wrong");
    }
  });
};

const renderPractice = () => {
  const lesson = findLesson(state.selectedLessonId);
  const lessonStatus = statusForLesson(lesson.id);

  if (lessonStatus === "locked") {
    renderShell("Lesson locked", "Complete previous node first.", `<section class="panel"><button id="backPath" class="btn green">Back to Path</button></section>`);
    document.getElementById("backPath").addEventListener("click", () => navigate("/skills"));
    return;
  }

  renderShell(
    lesson.title,
    `${lesson.sectionSubtitle} • +${lesson.xp} XP`,
    `
      <section class="panel lesson-panel" id="lessonPanel">
        <h3>${lesson.question.prompt}</h3>
        <div class="answer-grid">
          ${lesson.question.options.map((option, i) => `<button class="btn answer" data-index="${i}">${option}</button>`).join("")}
        </div>
        <p class="feedback" id="feedbackText">Choose your answer.</p>
        <div class="continue-wrap" id="continueWrap"></div>
      </section>
    `,
  );

  const answerButtons = Array.from(appEl.querySelectorAll(".answer"));
  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedIndex = Number(button.dataset.index);
      const correct = selectedIndex === lesson.question.answer;
      state.lastAnswerCorrect = correct;
      state.attempts.push({ lessonId: lesson.id, correct, at: new Date().toISOString() });

      setAnswerStyles(answerButtons, selectedIndex, lesson.question.answer);

      const panel = document.getElementById("lessonPanel");
      const feedback = document.getElementById("feedbackText");
      const continueWrap = document.getElementById("continueWrap");

      if (correct) {
        panel.classList.add("celebrate");
        feedback.textContent = "Great job! Correct answer. Node completed.";
        feedback.classList.add("ok");

        if (!state.completed.includes(lesson.id)) {
          state.completed.push(lesson.id);
          addXp(lesson.xp);
        }
      } else {
        panel.classList.add("shake");
        feedback.textContent = "Not quite. Review and try another lesson.";
        feedback.classList.add("bad");
        state.hearts = Math.max(0, state.hearts - 1);
      }

      continueWrap.innerHTML = `<button id="continueBtn" class="btn green">Continue</button>`;
      document.getElementById("continueBtn").addEventListener("click", () => navigate("/skills"));
    }, { once: true });
  });
};

const renderReview = () => {
  const queue = reviewQueue();
  renderShell(
    "Review",
    "Missed lessons bubble to the top.",
    `
      <section class="panel">
        <ul class="review-list">
          ${queue.map((row) => `<li><span>${row.title}</span><span>misses ${row.misses}</span></li>`).join("")}
        </ul>
        <button id="reviewReward" class="btn green">Finish Review (+10 XP)</button>
      </section>
    `,
  );

  document.getElementById("reviewReward").addEventListener("click", () => {
    addXp(10);
    const button = document.getElementById("reviewReward");
    button.textContent = "Done";
    button.disabled = true;
  });
};

const renderProfile = () => {
  renderShell(
    "Profile",
    "Edit your learner card.",
    `
      <section class="panel">
        <div class="profile-form">
          <label>Name <input id="nameInput" value="${state.profile.name}" /></label>
          <label>Role <input id="roleInput" value="${state.profile.role}" /></label>
          <button id="saveProfile" class="btn green">Save</button>
        </div>
        <p>${state.profile.name} • ${state.profile.role}</p>
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
  const route = getPath();
  if (route === "/") return renderHome();
  if (route === "/skills") return renderSkills();
  if (route === "/practice") return renderPractice();
  if (route === "/review") return renderReview();
  if (route === "/profile") return renderProfile();
  return renderShell("Not found", "Unknown route", `<section class="panel"><code>${route}</code></section>`);
};

window.addEventListener("hashchange", renderRoute);
window.addEventListener("load", () => {
  if (!location.hash) navigate("/");
  renderRoute();
});
