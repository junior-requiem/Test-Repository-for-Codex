import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const readSupabaseConfig = () => {
  const runtimeConfig = window.__APP_CONFIG__ ?? {};
  const legacyRuntimeConfig = {
    SUPABASE_URL: window.SUPABASE_URL ?? window.__SUPABASE_URL__,
    SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY ?? window.__SUPABASE_ANON_KEY__,
  };
  const buildEnv = import.meta?.env ?? {};

  const supabaseUrl =
    runtimeConfig.SUPABASE_URL ??
    legacyRuntimeConfig.SUPABASE_URL ??
    buildEnv.SUPABASE_URL ??
    buildEnv.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    runtimeConfig.SUPABASE_ANON_KEY ??
    legacyRuntimeConfig.SUPABASE_ANON_KEY ??
    buildEnv.SUPABASE_ANON_KEY ??
    buildEnv.VITE_SUPABASE_ANON_KEY;

  const missing = [
    !supabaseUrl ? "SUPABASE_URL" : null,
    !supabaseAnonKey ? "SUPABASE_ANON_KEY" : null,
  ].filter(Boolean);

  return {
    supabaseUrl,
    supabaseAnonKey,
    missing,
  };
};

const renderConfigError = (missingKeys) => {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <section class="card" role="alert" aria-live="assertive">
      <h2>Configuration error</h2>
      <p>Missing required Supabase configuration: <strong>${missingKeys.join(", ")}</strong>.</p>
      <p>Define values as build-time env vars (<code>SUPABASE_URL</code>, <code>SUPABASE_ANON_KEY</code> or <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>) or inject <code>window.__APP_CONFIG__</code> before loading the app. Legacy globals (<code>window.SUPABASE_URL</code>, <code>window.SUPABASE_ANON_KEY</code>) are also supported.</p>
    </section>
  `;
};

const supabaseConfig = readSupabaseConfig();
if (supabaseConfig.missing.length) {
  renderConfigError(supabaseConfig.missing);
  throw new Error(`Missing Supabase configuration: ${supabaseConfig.missing.join(", ")}`);
}

const supabase = createClient(supabaseConfig.supabaseUrl, supabaseConfig.supabaseAnonKey);

const routes = [
  { name: "Home", path: "/" },
  { name: "Learn", path: "/skills", requiresAuth: true },
  { name: "Practice", path: "/practice", requiresAuth: true },
  { name: "Review", path: "/review", requiresAuth: true },
  { name: "Developer Mode", path: "/developer", requiresAuth: true },
  { name: "Profile", path: "/profile", requiresAuth: true },
  { name: "Login", path: "/login", authOnly: true },
  { name: "Register", path: "/register", authOnly: true },
];

const AUTH_REQUIRED_ROUTES = new Set(["/skills", "/practice", "/lesson-complete", "/review", "/developer", "/profile"]);
const AUTH_ONLY_ROUTES = new Set(["/login", "/register"]);

const CUSTOM_SECTIONS_KEY = "learning-flow-custom-sections-v1";

const baseSections = [
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

const loadCustomSections = () => {
  try {
    const raw = localStorage.getItem(CUSTOM_SECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

let customSections = loadCustomSections();

const saveCustomSections = () => {
  localStorage.setItem(CUSTOM_SECTIONS_KEY, JSON.stringify(customSections));
};

const toDisplayQuestion = (question) => ({
  title: question.title || question.prompt || "Question",
  body: question.body || "",
  answerText: question.answerText || "",
});

const lessonQuestions = (lesson) => {
  if (Array.isArray(lesson.questions) && lesson.questions.length) {
    return lesson.questions.map(toDisplayQuestion);
  }
  if (lesson.question) {
    return [toDisplayQuestion(lesson.question)];
  }
  return [];
};

const sections = () => [...baseSections, ...customSections];

const lessons = () =>
  sections().flatMap((section) =>
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
  lastCompletion: null,
  session: null,
  authReady: false,
  authError: null,
  developerSelectedLessonId: null,
  developerQuestionIndex: 0,
};

const navEl = document.getElementById("nav");
const appEl = document.getElementById("app");
const topbarEl = document.querySelector(".topbar");

let audioContext;

const getAudioContext = () => {
  if (!window.AudioContext && !window.webkitAudioContext) return null;
  if (!audioContext) {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextCtor();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
};

const playTone = ({ frequency, type = "sine", duration = 0.12, gain = 0.06 }) => {
  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);

  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(gain, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
};

const playRightSound = () => {
  playTone({ frequency: 720, type: "triangle", duration: 0.1, gain: 0.04 });
  setTimeout(() => playTone({ frequency: 940, type: "triangle", duration: 0.12, gain: 0.05 }), 65);
};

const playWrongSound = () => {
  playTone({ frequency: 240, type: "sawtooth", duration: 0.12, gain: 0.04 });
  setTimeout(() => playTone({ frequency: 170, type: "sawtooth", duration: 0.14, gain: 0.03 }), 60);
};

const playNavigationClick = () => {
  playTone({ frequency: 460, type: "square", duration: 0.045, gain: 0.025 });
};

const vibrateFeedback = (pattern) => {
  if (typeof navigator.vibrate !== "function") return;
  navigator.vibrate(pattern);
};

const getPath = () => {
  const hash = location.hash.replace(/^#/, "") || "/";
  return hash.startsWith("/") ? hash : `/${hash}`;
};

const navigate = (path) => {
  if (getPath() !== path) playNavigationClick();
  location.hash = path;
};

const isAuthenticated = () => Boolean(state.session);

const isFocusedRoute = (route = getPath()) => route === "/practice" || route === "/lesson-complete";

const syncRouteChrome = () => {
  const focused = isFocusedRoute();
  document.body.classList.toggle("focus-mode", focused);
  if (topbarEl) topbarEl.hidden = focused;
};

const findLesson = (id) => lessons().find((lesson) => lesson.id === id) ?? lessons()[0];
const lessonIndex = (id) => lessons().findIndex((lesson) => lesson.id === id);
const nextLessonId = (id) => {
  const orderedLessons = lessons();
  const idx = lessonIndex(id);
  if (idx < 0 || idx + 1 >= orderedLessons.length) return null;
  return orderedLessons[idx + 1].id;
};

const nextLevelTarget = () => state.level * 120;
const addFusionPoints = (value) => {
  state.fusionPoints += Math.max(0, value);
  while (state.fusionPoints >= nextLevelTarget()) {
    state.level += 1;
  }
};

const statusForLesson = (id) => {
  const orderedLessons = lessons();
  if (state.completed.includes(id)) return "done";
  const idx = lessonIndex(id);
  const unlocked = orderedLessons.slice(0, idx).every((lesson) => state.completed.includes(lesson.id));
  return unlocked ? "current" : "locked";
};

const masteryPercent = () => {
  const totalLessons = lessons().length;
  return Math.round((state.completed.length / Math.max(1, totalLessons)) * 100);
};

const quests = () => {
  const completedLessons = state.completed.length;
  return [
    { label: "Complete 2 lessons", value: Math.min(completedLessons / 2, 1) },
    { label: "Earn 100 Fusion Points", value: Math.min(state.fusionPoints / 100, 1) },
    { label: "Keep 5 hearts", value: state.hearts >= 5 ? 1 : state.hearts / 5 },
  ];
};

const reviewQueue = () => {
  const queue = lessons().map((lesson) => ({ id: lesson.id, title: lesson.title, misses: 0 }));
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
    .filter((route) => {
      if (route.requiresAuth && !isAuthenticated()) return false;
      if (route.authOnly && isAuthenticated()) return false;
      return true;
    })
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

const renderLogin = () => {
  appEl.innerHTML = `
    <section class="panel" aria-label="login form">
      <h2>Login</h2>
      <p>Sign in to continue your learning flow.</p>
      ${state.authError ? `<p role="alert">${state.authError}</p>` : ""}
      <form id="loginForm" class="profile-form">
        <label>Email <input id="loginEmail" type="email" autocomplete="email" required /></label>
        <label>Password <input id="loginPassword" type="password" autocomplete="current-password" required /></label>
        <button id="loginSubmit" class="btn primary" type="submit">Login</button>
      </form>
      <p id="loginFeedback"></p>
      <p>Need an account? <button id="goRegister" class="btn" type="button">Register</button></p>
    </section>
  `;

  const loginForm = document.getElementById("loginForm");
  const loginFeedback = document.getElementById("loginFeedback");
  const loginSubmit = document.getElementById("loginSubmit");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginFeedback.textContent = "Signing in...";
    loginSubmit.disabled = true;

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      loginFeedback.textContent = error.message;
      loginSubmit.disabled = false;
      return;
    }

    loginFeedback.textContent = "Login successful. Redirecting...";
    navigate("/");
  });

  document.getElementById("goRegister").addEventListener("click", () => navigate("/register"));
};

const renderRegister = () => {
  appEl.innerHTML = `
    <section class="panel" aria-label="registration form">
      <h2>Register</h2>
      <p>Create your account to track progress.</p>
      <form id="registerForm" class="profile-form">
        <label>Email <input id="registerEmail" type="email" autocomplete="email" required /></label>
        <label>Password <input id="registerPassword" type="password" autocomplete="new-password" required minlength="6" /></label>
        <button id="registerSubmit" class="btn primary" type="submit">Create account</button>
      </form>
      <p id="registerFeedback"></p>
      <p>Already have an account? <button id="goLogin" class="btn" type="button">Login</button></p>
    </section>
  `;

  const registerForm = document.getElementById("registerForm");
  const registerFeedback = document.getElementById("registerFeedback");
  const registerSubmit = document.getElementById("registerSubmit");

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    registerFeedback.textContent = "Creating your account...";
    registerSubmit.disabled = true;

    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      registerFeedback.textContent = error.message;
      registerSubmit.disabled = false;
      return;
    }

    if (data.session) {
      registerFeedback.textContent = "Registration successful. Redirecting...";
      navigate("/");
      return;
    }

    registerFeedback.textContent = "Account created. Check your email to confirm your address before logging in.";
    registerSubmit.disabled = false;
  });

  document.getElementById("goLogin").addEventListener("click", () => navigate("/login"));
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
  const allLessons = lessons();
  const sectionBlocks = sections()
    .map((section) => {
      const sectionLessons = allLessons.filter((lesson) => lesson.sectionId === section.id);
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

  const progressValue = ((lessonIndex(lesson.id) + 1) / lessons().length) * 100;
  const questionData = lesson.question || lessonQuestions(lesson)[0] || null;
  const hasMultipleChoice = Boolean(questionData) && Array.isArray(questionData.options) && typeof questionData.answer === "number";
  const questionTitle = questionData?.title || questionData?.prompt || "Question";
  const questionBody = questionData?.body || "";

  if (!questionData) {
    renderShell(
      "Question pending",
      "This lesson is available, but no question has been added yet.",
      `<button id="backPath" class="btn primary">Back to path</button>`,
      `<section class="panel"><p>Use Developer Mode to add one or more questions to this lesson.</p></section>`,
    );
    document.getElementById("backPath").addEventListener("click", () => navigate("/skills"));
    return;
  }

  appEl.innerHTML = `
    <div class="focused-practice" aria-label="lesson focus view">
      <section class="panel lesson-progress compact">
        <div class="row-in-a-row">${state.implementationStreak} IN A ROW • ${Math.round(progressValue)}% COURSE PROGRESS</div>
        <div class="bar"><span style="width:${Math.round(progressValue)}%"></span></div>
      </section>
      <section class="panel lesson-panel" id="lessonPanel">
        <p class="lesson-kicker">${lesson.sectionSubtitle} • +${lesson.fusionPoints} Fusion Points</p>
        <h3>${questionTitle}</h3>
        ${questionBody ? `<p class="question-body">${questionBody}</p>` : ""}
        ${
          hasMultipleChoice
            ? `<div class="answer-grid">${questionData.options.map((option, i) => `<button class="btn answer" data-index="${i}">${option}</button>`).join("")}</div>
               <p class="feedback" id="feedbackText">Choose one answer.</p>`
            : `<form id="textAnswerForm" class="text-answer-form">
                 <label>
                   Your answer
                   <input id="textAnswerInput" type="text" autocomplete="off" required placeholder="Type your answer" />
                 </label>
                 <button class="btn primary" type="submit">Check answer</button>
               </form>
               <p class="feedback" id="feedbackText">Enter the correct answer exactly.</p>`
        }
      </section>
      <section class="feedback-dock" id="continueWrap"></section>
    </div>
  `;

  const handleAttempt = (correct) => {
    state.attempts.push({ lessonId: lesson.id, correct, at: new Date().toISOString() });

    const panel = document.getElementById("lessonPanel");
    const feedback = document.getElementById("feedbackText");
    const continueWrap = document.getElementById("continueWrap");
    const moveToNextQuestion = () => {
      const upcomingLessonId = nextLessonId(lesson.id);
      if (!upcomingLessonId) {
        navigate("/skills");
        return;
      }
      state.selectedLessonId = upcomingLessonId;
      if (getPath() === "/practice") {
        renderPractice();
        return;
      }
      navigate("/practice");
    };

    if (correct) {
      playRightSound();
      vibrateFeedback(35);
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
      continueWrap.innerHTML = `
        <div>
          <strong>✅ Correct!</strong>
          <p>You got this one right. Move on when you're ready.</p>
        </div>
        <button class="btn primary" id="continueLesson">Next question</button>
      `;
      document.getElementById("continueLesson").addEventListener("click", () => {
        state.lastCompletion = {
          title: lesson.title,
          sectionSubtitle: lesson.sectionSubtitle,
          fusionPoints: lesson.fusionPoints,
          streak: state.implementationStreak,
          mastery: masteryPercent(),
          learned: questionTitle,
          correctAnswer: hasMultipleChoice ? questionData.options[questionData.answer] : questionData.answerText,
        };
        moveToNextQuestion();
      });
    } else {
      playWrongSound();
      vibrateFeedback([35, 40, 35]);
      panel.classList.add("shake");
      feedback.textContent = "Not quite. Try again.";
      feedback.classList.remove("ok");
      state.hearts = Math.max(0, state.hearts - 1);
      if (!state.completed.includes(lesson.id)) state.completed.push(lesson.id);
      continueWrap.className = "feedback-dock error";
      continueWrap.innerHTML = `
        <div>
          <strong>❌ Incorrect.</strong>
          <p>Heart lost. Remaining hearts: ${state.hearts}</p>
        </div>
        <button class="btn primary" id="nextAfterMiss">Next question</button>
      `;
      document.getElementById("nextAfterMiss").addEventListener("click", moveToNextQuestion);
      setTimeout(() => panel.classList.remove("shake"), 400);
    }
  };

  if (hasMultipleChoice) {
    const buttons = Array.from(appEl.querySelectorAll(".answer-grid .answer"));
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const selected = Number(button.dataset.index);
        lockAnswers(buttons, selected, questionData.answer);
        handleAttempt(selected === questionData.answer);
      });
    });
    return;
  }

  const textAnswerForm = document.getElementById("textAnswerForm");
  const textAnswerInput = document.getElementById("textAnswerInput");

  textAnswerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    textAnswerInput.disabled = true;
    textAnswerForm.querySelector("button").disabled = true;

    const submitted = textAnswerInput.value.trim().toLowerCase();
    const expected = (questionData.answerText || "").trim().toLowerCase();
    handleAttempt(submitted === expected);
  });
};

const renderDeveloper = () => {
  const customLessons = customSections.flatMap((section) =>
    section.lessons.map((lesson) => ({
      lesson,
      section,
      questions: lessonQuestions(lesson),
    })),
  );

  if (!customLessons.length) {
    state.developerSelectedLessonId = null;
    state.developerQuestionIndex = 0;
  } else if (!customLessons.some((row) => row.lesson.id === state.developerSelectedLessonId)) {
    state.developerSelectedLessonId = customLessons[0].lesson.id;
    state.developerQuestionIndex = 0;
  }

  const selectedLessonRow = customLessons.find((row) => row.lesson.id === state.developerSelectedLessonId) || null;
  const selectedQuestions = selectedLessonRow?.questions || [];
  const safeQuestionIndex = selectedQuestions.length ? Math.min(state.developerQuestionIndex, selectedQuestions.length - 1) : 0;
  state.developerQuestionIndex = safeQuestionIndex;
  const selectedQuestion = selectedQuestions[safeQuestionIndex] || null;

  const unitRows = customSections
    .map(
      (section) => `
      <li>
        <strong>${section.title}</strong>
        <small>${section.subtitle}</small>
        <span>${section.lessons.length} lesson(s)</span>
      </li>
    `,
    )
    .join("");

  const unitOptions = customSections
    .map((section) => `<option value="${section.id}">${section.title} — ${section.subtitle}</option>`)
    .join("");

  const lessonOptions = customLessons
    .map(
      (row) =>
        `<option value="${row.lesson.id}" ${row.lesson.id === state.developerSelectedLessonId ? "selected" : ""}>${row.section.title} • ${row.lesson.title}</option>`,
    )
    .join("");

  const questionPreview = selectedLessonRow
    ? `
      <div class="developer-preview-head">
        <div>
          <p class="developer-preview-kicker">Previewing lesson</p>
          <h4>${selectedLessonRow.lesson.title}</h4>
          <p>${selectedLessonRow.lesson.description}</p>
        </div>
        <span class="developer-preview-count">${selectedQuestions.length} question(s)</span>
      </div>
      ${
        selectedQuestion
          ? `
            <div class="panel lesson-panel developer-preview-card" aria-label="question preview">
              <p class="lesson-kicker">${selectedLessonRow.section.subtitle} • +${selectedLessonRow.lesson.fusionPoints} Fusion Points</p>
              <h3>${selectedQuestion.title}</h3>
              ${selectedQuestion.body ? `<p class="question-body">${selectedQuestion.body}</p>` : ""}
              <p class="feedback ok">Answer: ${selectedQuestion.answerText}</p>
            </div>
            <div class="developer-preview-controls">
              <button class="btn" id="previewPrev" ${safeQuestionIndex === 0 ? "disabled" : ""}>Previous</button>
              <span>Question ${safeQuestionIndex + 1} of ${selectedQuestions.length}</span>
              <button class="btn" id="previewNext" ${safeQuestionIndex >= selectedQuestions.length - 1 ? "disabled" : ""}>Next</button>
            </div>
          `
          : '<p class="empty-state">No questions yet for this lesson. Add one below.</p>'
      }
    `
    : '<p class="empty-state">Create a lesson to start adding questions.</p>';

  const questionRows = selectedQuestions
    .map(
      (question, index) => `
      <li>
        <button class="developer-question-jump ${index === safeQuestionIndex ? "active" : ""}" data-question-index="${index}">
          <strong>Question ${index + 1}</strong>
          <small>${question.title}</small>
        </button>
      </li>
    `,
    )
    .join("");

  renderShell(
    "Developer Mode",
    "No-code builder for custom units, lessons, and multi-question lesson previews.",
    null,
    `
      <section class="panel developer-grid">
        <article>
          <h3>Create Unit</h3>
          <form id="unitForm" class="developer-form">
            <label>Unit title <input name="title" required placeholder="Section 2, Unit 1" /></label>
            <label>Unit subtitle <input name="subtitle" required placeholder="People Analytics" /></label>
            <button class="btn primary" type="submit">Add unit</button>
          </form>
        </article>

        <article>
          <h3>Create Lesson</h3>
          <form id="lessonBuilderForm" class="developer-form">
            <label>Unit
              <select name="sectionId" ${customSections.length ? "" : "disabled"} required>
                ${unitOptions || '<option value="">Create a unit first</option>'}
              </select>
            </label>
            <label>Lesson title <input name="lessonTitle" required placeholder="Data roles" /></label>
            <label>Lesson description <input name="lessonDescription" required placeholder="Who owns workforce metrics" /></label>
            <button class="btn primary" type="submit" ${customSections.length ? "" : "disabled"}>Add lesson</button>
          </form>
        </article>

        <article>
          <h3>Add Question</h3>
          <form id="questionBuilderForm" class="developer-form">
            <label>Lesson
              <select name="lessonId" ${customLessons.length ? "" : "disabled"} required>
                ${lessonOptions || '<option value="">Create a lesson first</option>'}
              </select>
            </label>
            <label>Question title <input name="questionTitle" required placeholder="Who owns attrition dashboard governance?" /></label>
            <label>Question body <textarea name="questionBody" rows="3" required placeholder="Describe the operating model expectation."></textarea></label>
            <label>Correct answer <input name="correctAnswer" required placeholder="HR analytics lead" /></label>
            <button class="btn primary" type="submit" ${customLessons.length ? "" : "disabled"}>Add question</button>
          </form>
        </article>
      </section>

      <section class="panel">
        <h3>Question builder preview</h3>
        ${questionPreview}
      </section>

      <section class="panel">
        <h3>Current questions</h3>
        ${questionRows ? `<ul class="developer-unit-list developer-question-list">${questionRows}</ul>` : '<p class="empty-state">Questions for the selected lesson will appear here.</p>'}
      </section>

      <section class="panel">
        <h3>Custom units</h3>
        ${
          unitRows
            ? `<ul class="developer-unit-list">${unitRows}</ul>`
            : '<p class="empty-state">No custom units yet. Use the form above to create one.</p>'
        }
      </section>
    `,
  );

  document.getElementById("unitForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const title = form.title.value.trim();
    const subtitle = form.subtitle.value.trim();
    if (!title || !subtitle) return;

    customSections.push({
      id: `custom-unit-${Date.now()}`,
      title,
      subtitle,
      color: customSections.length % 2 === 0 ? "section-primary" : "section-secondary",
      lessons: [],
    });
    saveCustomSections();
    renderDeveloper();
  });

  const lessonBuilderForm = document.getElementById("lessonBuilderForm");
  lessonBuilderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const sectionId = form.sectionId.value;
    const section = customSections.find((item) => item.id === sectionId);
    if (!section) return;

    const lessonTitle = form.lessonTitle.value.trim();
    const lessonDescription = form.lessonDescription.value.trim();
    if (!lessonTitle || !lessonDescription) return;

    const lessonId = `custom-lesson-${Date.now()}`;

    section.lessons.push({
      id: lessonId,
      title: lessonTitle,
      description: lessonDescription,
      fusionPoints: 20,
      questions: [],
    });

    state.developerSelectedLessonId = lessonId;
    state.developerQuestionIndex = 0;
    saveCustomSections();
    form.reset();
    renderDeveloper();
  });

  const questionBuilderForm = document.getElementById("questionBuilderForm");
  questionBuilderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const lessonId = form.lessonId.value;
    const customLesson = customSections
      .flatMap((section) => section.lessons)
      .find((lesson) => lesson.id === lessonId);
    if (!customLesson) return;

    const questionTitle = form.questionTitle.value.trim();
    const questionBody = form.questionBody.value.trim();
    const correctAnswer = form.correctAnswer.value.trim();

    if (!questionTitle || !questionBody || !correctAnswer) return;

    if (!Array.isArray(customLesson.questions)) {
      customLesson.questions = lessonQuestions(customLesson);
    }

    customLesson.questions.push({
      title: questionTitle,
      body: questionBody,
      answerText: correctAnswer,
    });

    if (!customLesson.question) {
      customLesson.question = {
        title: questionTitle,
        body: questionBody,
        answerText: correctAnswer,
      };
    }

    state.developerSelectedLessonId = customLesson.id;
    state.developerQuestionIndex = customLesson.questions.length - 1;
    saveCustomSections();
    form.reset();
    renderDeveloper();
  });

  const questionLessonSelect = questionBuilderForm.querySelector('select[name="lessonId"]');
  questionLessonSelect?.addEventListener("change", (event) => {
    state.developerSelectedLessonId = event.target.value;
    state.developerQuestionIndex = 0;
    renderDeveloper();
  });

  const previewPrev = document.getElementById("previewPrev");
  const previewNext = document.getElementById("previewNext");

  if (previewPrev) {
    previewPrev.addEventListener("click", () => {
      state.developerQuestionIndex = Math.max(0, state.developerQuestionIndex - 1);
      renderDeveloper();
    });
  }

  if (previewNext) {
    previewNext.addEventListener("click", () => {
      state.developerQuestionIndex += 1;
      renderDeveloper();
    });
  }

  appEl.querySelectorAll("[data-question-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.developerQuestionIndex = Number(button.dataset.questionIndex);
      renderDeveloper();
    });
  });
};

const renderLessonComplete = () => {
  const completion = state.lastCompletion;
  if (!completion) {
    navigate("/skills");
    return;
  }

  appEl.innerHTML = `
    <div class="focused-practice" aria-label="lesson completion view">
      <section class="panel completion-panel" id="completionPanel">
        <div class="completion-badge">🏆 Lesson Complete</div>
        <h2>Great work, ${state.profile.name}!</h2>
        <p class="completion-subtitle">You finished <strong>${completion.title}</strong> in ${completion.sectionSubtitle}.</p>

        <div class="reward-grid">
          <article class="reward-card"><span>⚡</span><strong>+${completion.fusionPoints} Fusion Points</strong></article>
          <article class="reward-card"><span>🔥</span><strong>${completion.streak} day streak</strong></article>
          <article class="reward-card"><span>🧠</span><strong>${completion.mastery}% mastery unlocked</strong></article>
        </div>

        <section class="lesson-recap">
          <h3>What you just learned</h3>
          <p><strong>Question:</strong> ${completion.learned}</p>
          <p><strong>Key takeaway:</strong> ${completion.correctAnswer}</p>
        </section>

        <div class="completion-cta">
          <p>Returning to your learning map for the next lesson...</p>
          <button id="backToMap" class="btn primary">Continue to Learning Map</button>
        </div>
      </section>
    </div>
  `;

  const panel = document.getElementById("completionPanel");
  panel.classList.add("celebrate");
  for (let i = 0; i < 2; i += 1) setTimeout(spawnConfetti, i * 220);

  const goToMap = () => {
    state.lastCompletion = null;
    navigate("/skills");
  };

  document.getElementById("backToMap").addEventListener("click", goToMap);
  setTimeout(() => {
    if (getPath() === "/lesson-complete") goToMap();
  }, 4500);
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
        <div class="profile-form-actions">
          <button id="logoutAction" class="btn" type="button">Logout</button>
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

  document.getElementById("logoutAction").addEventListener("click", async () => {
    await supabase.auth.signOut();
    navigate("/login");
  });
};

const renderRoute = () => {
  if (!state.authReady) {
    appEl.innerHTML = '<section class="panel"><p>Loading session...</p></section>';
    return;
  }

  syncRouteChrome();
  const route = getPath();

  if (AUTH_REQUIRED_ROUTES.has(route) && !isAuthenticated()) {
    navigate("/login");
    return;
  }

  if (AUTH_ONLY_ROUTES.has(route) && isAuthenticated()) {
    navigate("/");
    return;
  }

  renderNav();

  if (route === "/") return renderHome();
  if (route === "/login") return renderLogin();
  if (route === "/register") return renderRegister();
  if (route === "/skills") return renderSkills();
  if (route === "/practice") return renderPractice();
  if (route === "/lesson-complete") return renderLessonComplete();
  if (route === "/review") return renderReview();
  if (route === "/developer") return renderDeveloper();
  if (route === "/profile") return renderProfile();
  return renderShell("Not found", "Unknown route.", null, `<section class="panel"><code>${route}</code></section>`);
};

const AUTH_BOOTSTRAP_TIMEOUT_MS = 8000;

const bootstrapAuth = async () => {
  try {
    const sessionResult = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Session check timed out")), AUTH_BOOTSTRAP_TIMEOUT_MS)),
    ]);

    const { data, error } = sessionResult;
    if (error) throw error;

    state.session = data.session;
    state.authError = null;
  } catch (error) {
    console.error("Auth bootstrap failed", error);
    state.session = null;
    state.authError = "We could not verify your Supabase session. Please check your Supabase URL/key and network, then try logging in.";
  } finally {
    state.authReady = true;
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    state.session = session;
    state.authError = null;
    renderRoute();
  });
};

window.addEventListener("hashchange", renderRoute);
window.addEventListener("load", async () => {
  if (!location.hash) navigate("/");
  await bootstrapAuth();
  renderRoute();
});
