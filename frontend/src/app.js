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

const AUTH_GATE_STORAGE_KEY = "learning-flow-auth-gate-enabled";

const parseBooleanSetting = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "on", "yes", "enabled"].includes(normalized)) return true;
  if (["0", "false", "off", "no", "disabled"].includes(normalized)) return false;
  return null;
};

const readAuthGateEnabled = () => {
  const runtimeConfig = window.__APP_CONFIG__ ?? {};
  const runtimeValue = parseBooleanSetting(runtimeConfig.AUTH_GATE_ENABLED ?? runtimeConfig.DISABLE_AUTH_GATE);
  if (typeof runtimeValue === "boolean") {
    return runtimeConfig.DISABLE_AUTH_GATE ? !runtimeValue : runtimeValue;
  }

  const urlSetting = new URLSearchParams(window.location.search).get("authGate");
  const parsedUrlSetting = parseBooleanSetting(urlSetting);
  if (typeof parsedUrlSetting === "boolean") {
    localStorage.setItem(AUTH_GATE_STORAGE_KEY, String(parsedUrlSetting));
    return parsedUrlSetting;
  }

  const storedSetting = parseBooleanSetting(localStorage.getItem(AUTH_GATE_STORAGE_KEY));
  if (typeof storedSetting === "boolean") return storedSetting;

  return true;
};

const routes = [
  { name: "Home", path: "/" },
  { name: "Learn", path: "/skills", requiresAuth: true },
  { name: "Process Overview", path: "/process-overview", requiresAuth: true },
  { name: "Practice", path: "/practice", requiresAuth: true },
  { name: "Review", path: "/review", requiresAuth: true },
  { name: "Developer Mode", path: "/developer", requiresAuth: true },
  { name: "Profile", path: "/profile", requiresAuth: true },
  { name: "Login", path: "/login", authOnly: true },
  { name: "Register", path: "/register", authOnly: true },
];

const AUTH_REQUIRED_ROUTES = new Set(["/skills", "/process-overview", "/practice", "/lesson-complete", "/review", "/developer", "/profile"]);
const AUTH_ONLY_ROUTES = new Set(["/login", "/register"]);

const CUSTOM_SECTIONS_KEY = "learning-flow-custom-sections-v1";
const CUSTOM_PROCESS_NODES_KEY = "learning-flow-custom-process-overview-nodes-v1";
const DEVELOPER_DRAFT_KEY = "learning-flow-developer-draft-v1";

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

const baseProcessOverviewNodes = [
  {
    id: "recruit",
    title: "Recruit & Onboard",
    subtitle: "Attract and prepare the right talent.",
    objective: "Build candidate pipeline, align role expectations, and prep the first-day experience.",
    visuals: ["Role profile brief", "Candidate funnel snapshot", "Welcome checklist"],
    walkthrough: [
      "Open with the role objective and business priority.",
      "Overlay key screenshots that show job req intake and approvals.",
      "Add contextual notes that explain what to validate before onboarding starts.",
    ],
    checkpoint: {
      prompt: "What makes this node complete?",
      options: ["The onboarding checklist is approved", "The final payroll run is posted", "Offboarding surveys are sent"],
      answer: 0,
    },
    checkpointPlacement: "end",
    reward: 30,
  },
  {
    id: "hire",
    title: "Hire & Position",
    subtitle: "Convert offers into active worker records.",
    objective: "Capture legal employer, position, and assignment details with strong data quality.",
    visuals: ["Offer letter capture", "Position assignment card", "Data validation panel"],
    walkthrough: [
      "Highlight each screen and annotate which fields are non-negotiable.",
      "Show a callout layer for common setup mistakes.",
      "Pause for a mini-quiz so users can identify the correct hiring sequence.",
    ],
    checkpoint: {
      prompt: "Which detail is critical during hire processing?",
      options: ["Legal employer and assignment", "Expense report category", "Supplier payment terms"],
      answer: 0,
    },
    checkpointPlacement: "middle",
    reward: 35,
  },
  {
    id: "develop",
    title: "Manage & Develop",
    subtitle: "Guide performance, growth, and retention.",
    objective: "Drive manager coaching, goal tracking, and role-readiness progression.",
    visuals: ["Goal dashboard", "Learning plan timeline", "Performance note feed"],
    walkthrough: [
      "Use a phased storyboard to explain manager actions at each milestone.",
      "Attach visuals for coaching notes and learning progress.",
      "Insert a challenge question after each phase to keep momentum game-like.",
    ],
    checkpoint: {
      prompt: "Why include challenge questions between visuals?",
      options: ["To reinforce understanding before advancing", "To hide unavailable actions", "To skip review checkpoints"],
      answer: 0,
    },
    checkpointPlacement: "middle",
    reward: 40,
  },
  {
    id: "reward",
    title: "Pay & Reward",
    subtitle: "Connect work outcomes to compensation.",
    objective: "Explain payroll, bonus, and rewards workflows with transparency and controls.",
    visuals: ["Payroll readiness board", "Compensation statement", "Audit confirmation strip"],
    walkthrough: [
      "Map each visual to a policy checkpoint.",
      "Contextualize calculations with plain-language annotations.",
      "Prompt a checkpoint question that confirms the user can identify release criteria.",
    ],
    checkpoint: {
      prompt: "Before payroll release, teams should verify:",
      options: ["Approved inputs and validation checks", "Social post scheduling", "Supplier onboarding status"],
      answer: 0,
    },
    checkpointPlacement: "end",
    reward: 45,
  },
  {
    id: "retire",
    title: "Exit & Retire",
    subtitle: "Close the journey and capture insight.",
    objective: "Handle offboarding, knowledge transfer, and retirement events with consistency.",
    visuals: ["Exit checklist", "Knowledge handoff note", "Final archive confirmation"],
    walkthrough: [
      "Walk through final approvals in sequence with visual stamps.",
      "Annotate transfer and archive expectations.",
      "Use a final challenge question to validate full process understanding.",
    ],
    checkpoint: {
      prompt: "The final node should always include:",
      options: ["A complete offboarding confirmation", "Open candidate requisitions", "Pending learning enrollments"],
      answer: 0,
    },
    checkpointPlacement: "end",
    reward: 50,
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

const loadProcessOverviewNodes = () => {
  try {
    const raw = localStorage.getItem(CUSTOM_PROCESS_NODES_KEY);
    if (!raw) return [...baseProcessOverviewNodes];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) return [...baseProcessOverviewNodes];
    return parsed;
  } catch {
    return [...baseProcessOverviewNodes];
  }
};

let processOverviewNodes = loadProcessOverviewNodes();

const saveProcessOverviewNodes = () => {
  localStorage.setItem(CUSTOM_PROCESS_NODES_KEY, JSON.stringify(processOverviewNodes));
};

const loadDeveloperDraft = () => {
  try {
    const raw = localStorage.getItem(DEVELOPER_DRAFT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const saveDeveloperDraft = (patch) => {
  const existing = loadDeveloperDraft();
  localStorage.setItem(DEVELOPER_DRAFT_KEY, JSON.stringify({ ...existing, ...patch }));
};

const clearDeveloperDraftSection = (keys) => {
  const existing = loadDeveloperDraft();
  keys.forEach((key) => {
    delete existing[key];
  });
  localStorage.setItem(DEVELOPER_DRAFT_KEY, JSON.stringify(existing));
};

const saveCustomSections = () => {
  localStorage.setItem(CUSTOM_SECTIONS_KEY, JSON.stringify(customSections));
};

const toDisplayQuestion = (question) => ({
  type: question.type || "question",
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
  developerInsertIndex: "end",
  authGateEnabled: readAuthGateEnabled(),
  processCurrentNodeIndex: 0,
  processCompletedNodeIds: [],
  processCheckpointResponses: {},
  processNodeStepIndexById: {},
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

const playTone = ({ frequency, type = "sine", duration = 0.12, gain = 0.06, detune = 0, delay = 0, pan = 0 }) => {
  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const panner = context.createStereoPanner ? context.createStereoPanner() : null;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.detune.setValueAtTime(detune, now);

  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(gain, now + 0.012);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gainNode);
  if (panner) {
    panner.pan.setValueAtTime(pan, now);
    gainNode.connect(panner);
    panner.connect(context.destination);
  } else {
    gainNode.connect(context.destination);
  }

  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
};

const playToneSequence = (tones = []) => {
  tones.forEach((tone) => playTone(tone));
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

const playProcessAdvanceClick = () => {
  playToneSequence([
    { frequency: 300, type: "triangle", duration: 0.03, gain: 0.02, pan: -0.15 },
    { frequency: 390, type: "sine", duration: 0.026, gain: 0.018, delay: 0.03, pan: 0.15 },
  ]);
};

const playProcessRightSound = () => {
  playToneSequence([
    { frequency: 440, type: "triangle", duration: 0.05, gain: 0.025, pan: -0.2 },
    { frequency: 554, type: "triangle", duration: 0.06, gain: 0.028, delay: 0.045, pan: 0.2 },
    { frequency: 740, type: "sine", duration: 0.08, gain: 0.022, delay: 0.09, detune: 5 },
    { frequency: 1110, type: "sine", duration: 0.07, gain: 0.015, delay: 0.11, detune: -6 },
  ]);
};

const playProcessWrongSound = () => {
  playToneSequence([
    { frequency: 280, type: "sawtooth", duration: 0.06, gain: 0.02, pan: 0.12 },
    { frequency: 210, type: "triangle", duration: 0.075, gain: 0.022, delay: 0.045, pan: -0.08 },
    { frequency: 160, type: "sine", duration: 0.08, gain: 0.012, delay: 0.09 },
  ]);
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
const isAuthGateEnabled = () => state.authGateEnabled !== false;

const isFocusedRoute = (route = getPath()) => route === "/practice" || route === "/lesson-complete" || route === "/process-overview";

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
      if (isAuthGateEnabled() && route.requiresAuth && !isAuthenticated()) return false;
      if (isAuthGateEnabled() && route.authOnly && isAuthenticated()) return false;
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

const processNodeStatus = (index) => {
  const node = processOverviewNodes[index];
  if (!node) return "locked";
  if (state.processCompletedNodeIds.includes(node.id)) return "done";
  if (index === 0) return "current";
  const prev = processOverviewNodes[index - 1];
  if (prev && state.processCompletedNodeIds.includes(prev.id)) return "current";
  return "locked";
};

const checkpointPlacementForNode = (node) => {
  if (node.checkpointPlacement === "middle" || node.checkpointPlacement === "end") return node.checkpointPlacement;
  return "end";
};

const buildNodeFlow = (node) => {
  const steps = Array.isArray(node.walkthrough) ? node.walkthrough : [];
  const visuals = Array.isArray(node.visuals) ? node.visuals : [];
  const contentSteps = steps.map((text, index) => ({
    type: "content",
    text,
    screenshot: visuals[index] || visuals[0] || `Step ${index + 1} screenshot`,
  }));

  const questionStep = {
    type: "question",
    prompt: node.checkpoint?.prompt || "Checkpoint",
    options: Array.isArray(node.checkpoint?.options) ? node.checkpoint.options : [],
    answer: Number.isInteger(node.checkpoint?.answer) ? node.checkpoint.answer : 0,
  };

  const insertion =
    checkpointPlacementForNode(node) === "middle"
      ? Math.max(1, Math.ceil(contentSteps.length / 2))
      : contentSteps.length;

  const flow = [...contentSteps];
  flow.splice(Math.min(insertion, flow.length), 0, questionStep);
  return flow;
};

const renderProcessOverviewCompletion = () => {
  const totalNodes = processOverviewNodes.length;
  const totalReward = processOverviewNodes.reduce((sum, node) => sum + (Number(node.reward) || 0), 0);

  const learningHighlights = processOverviewNodes
    .map((node) => {
      const firstStep = Array.isArray(node.walkthrough) && node.walkthrough.length ? node.walkthrough[0] : node.objective;
      return `
        <article class="process-learning-card">
          <p class="process-learning-tag">${node.title}</p>
          <h4>${node.subtitle}</h4>
          <p>${firstStep}</p>
        </article>
      `;
    })
    .join("");

  appEl.innerHTML = `
    <section class="process-completion-screen" aria-live="polite" aria-label="Process complete summary">
      <div class="process-completion-backdrop" aria-hidden="true"></div>
      <div class="process-completion-content panel">
        <p class="process-kicker">Process overview complete</p>
        <h2>🎉 Congratulations, ${state.profile.name}!</h2>
        <p class="process-completion-subtitle">You cleared every node and locked in the full workflow. Here's your gamified recap before you jump back in.</p>

        <div class="process-completion-stats">
          <article>
            <strong>${totalNodes}/${totalNodes}</strong>
            <span>Nodes completed</span>
          </article>
          <article>
            <strong>+${totalReward}</strong>
            <span>Fusion points earned</span>
          </article>
          <article>
            <strong>${Object.keys(state.processCheckpointResponses).length}</strong>
            <span>Checkpoint wins</span>
          </article>
        </div>

        <section>
          <h3>What you learned</h3>
          <div class="process-learning-grid">${learningHighlights}</div>
        </section>

        <div class="process-completion-actions">
          <button class="btn" id="processReplay">Replay walkthrough</button>
          <button class="btn primary" id="processBackToSkills">Back to learning map</button>
        </div>
      </div>
    </section>
  `;

  document.getElementById("processReplay")?.addEventListener("click", () => {
    state.processCurrentNodeIndex = 0;
    state.processCompletedNodeIds = [];
    state.processCheckpointResponses = {};
    state.processNodeStepIndexById = {};
    renderProcessOverview();
  });

  document.getElementById("processBackToSkills")?.addEventListener("click", () => {
    navigate("/skills");
  });
};

const renderProcessOverview = () => {
  const totalNodes = processOverviewNodes.length;

  if (!totalNodes) {
    renderShell(
      "Process Overview Mode",
      "Walk users through each process node with annotated visuals, contextual coaching, and gamified checkpoints.",
      `<span class="process-badge">0% journey complete</span>`,
      `
        <section class="panel process-overview-finale">
          <h3>No process nodes yet</h3>
          <p>Add nodes in Developer Mode to build your prototype walkthrough.</p>
          <button class="btn primary" id="goDeveloperProcess">Open Developer Mode</button>
        </section>
      `,
    );
    document.getElementById("goDeveloperProcess")?.addEventListener("click", () => navigate("/developer"));
    return;
  }

  const validNodeIds = new Set(processOverviewNodes.map((node) => node.id));
  state.processCompletedNodeIds = state.processCompletedNodeIds.filter((id) => validNodeIds.has(id));
  Object.keys(state.processCheckpointResponses).forEach((id) => {
    if (!validNodeIds.has(id)) delete state.processCheckpointResponses[id];
  });
  Object.keys(state.processNodeStepIndexById || {}).forEach((id) => {
    if (!validNodeIds.has(id)) delete state.processNodeStepIndexById[id];
  });

  const reachableIndex = processOverviewNodes.findIndex((_, index) => processNodeStatus(index) === "current");
  const safeIndex = Math.max(0, Math.min(state.processCurrentNodeIndex, totalNodes - 1));
  state.processCurrentNodeIndex = processNodeStatus(safeIndex) === "locked" ? Math.max(0, reachableIndex) : safeIndex;

  const activeNode = processOverviewNodes[state.processCurrentNodeIndex];
  const activeFlow = buildNodeFlow(activeNode);
  const storedStep = Number(state.processNodeStepIndexById[activeNode.id] || 0);
  const activeStepIndex = Math.max(0, Math.min(storedStep, activeFlow.length - 1));
  state.processNodeStepIndexById[activeNode.id] = activeStepIndex;
  const activeStep = activeFlow[activeStepIndex];

  const selectedAnswer = state.processCheckpointResponses[activeNode.id];
  const isAnswerCorrect = selectedAnswer === activeStep.answer;
  const trackerProgress = Math.round((state.processCompletedNodeIds.length / totalNodes) * 100);
  const isComplete = state.processCompletedNodeIds.length === totalNodes;

  if (isComplete) {
    renderProcessOverviewCompletion();
    return;
  }

  const tracker = processOverviewNodes
    .map((node, index) => {
      const status = processNodeStatus(index);
      const isReachable = status !== "locked";
      const nodeIcon = status === "done" ? "✓" : status === "current" ? "▶" : index + 1;
      const connector = index < totalNodes - 1 ? '<span class="overview-node-connector" aria-hidden="true">›</span>' : "";
      return `
        <li class="overview-node-item">
          <button class="overview-node ${status}" data-overview-node="${index}" ${isReachable ? "" : "disabled"}>
            <span class="overview-node-index">${nodeIcon}</span>
            <strong>${node.title}</strong>
            <small>${status === "done" ? "Complete" : status === "current" ? "In progress" : "Locked"}</small>
          </button>
          ${connector}
        </li>
      `;
    })
    .join("");

  const answerButtons =
    activeStep.type === "question"
      ? activeStep.options
          .map((option, index) => {
            const isPicked = selectedAnswer === index;
            const isCorrectOption = selectedAnswer !== undefined && index === activeStep.answer;
            const isWrongPicked = isPicked && selectedAnswer !== activeStep.answer;
            const stateClass = isCorrectOption ? "correct" : isWrongPicked ? "wrong" : isPicked ? "selected" : "";
            return `<button class="btn overview-answer ${stateClass}" data-overview-answer="${index}" data-index="${index}">${option}</button>`;
          })
          .join("")
      : "";

  const feedback =
    activeStep.type !== "question"
      ? ""
      : selectedAnswer === undefined
        ? "Choose one answer."
        : isAnswerCorrect
          ? "✅ Correct! Continue to the next step."
          : "❌ Not quite. Try again to keep the run moving.";

  const nextButtonLabel =
    activeStep.type === "question"
      ? "Continue"
      : activeStepIndex >= activeFlow.length - 1
        ? "Finish node"
        : "Next step";

  const nextDisabled = activeStep.type === "question" && !isAnswerCorrect;

  appEl.innerHTML = `
    <button class="btn process-exit-floating" id="processExit" aria-label="Exit walkthrough">← Exit walkthrough</button>
    <div class="focused-practice" aria-label="process overview focus view">
      <section class="panel process-overview-panel" id="processOverviewPanel">
        <header class="process-overview-head">
          <div>
            <p class="process-kicker">Guided walkthrough</p>
            <h3>${activeNode.title}</h3>
            <p>${activeNode.subtitle}</p>
          </div>
          <div class="process-session-pulse" aria-label="Session pulse">
            <span>Session pulse</span>
            <strong>${trackerProgress}% complete · Node ${state.processCurrentNodeIndex + 1} of ${totalNodes}</strong>
          </div>
        </header>

        <div class="bar"><span style="width:${trackerProgress}%"></span></div>
        <ol class="overview-node-tracker">${tracker}</ol>
      </section>

      <section class="panel process-overview-content process-overview-focus">
        <div class="process-overview-main">
          <p class="process-kicker process-kicker-inline">Active node</p>
          <h3>${activeNode.title}</h3>
        ${
          activeStep.type === "question"
            ? `
              <p class="process-objective">Checkpoint ${checkpointPlacementForNode(activeNode) === "middle" ? "(mid-node)" : "(end of node)"}</p>
              <h4 class="process-question-heading">${activeStep.prompt}</h4>
              <div class="process-answer-grid">${answerButtons}</div>
              <p class="feedback ${selectedAnswer === undefined ? "" : isAnswerCorrect ? "ok" : "bad"}">${feedback}</p>
            `
            : `
              <div class="process-visual-frame process-feature-image">${activeStep.screenshot}</div>
              <p class="process-objective">${activeNode.objective}</p>
              <p class="process-step-copy">${activeStep.text}</p>
            `
        }

          <p class="process-reward">Node reward: +${activeNode.reward} Fusion Points</p>
        </div>

        <div class="process-controls process-controls-single">
          <p class="process-controls-meta">Step ${activeStepIndex + 1} of ${activeFlow.length}</p>
          <button class="btn primary" id="processNextStep" ${nextDisabled ? "disabled" : ""}>${nextButtonLabel}</button>
        </div>
      </section>

    </div>
  `;

  document.getElementById("processExit")?.addEventListener("click", () => {
    navigate("/skills");
  });

  appEl.querySelectorAll("[data-overview-node]").forEach((button) => {
    button.addEventListener("click", () => {
      state.processCurrentNodeIndex = Number(button.dataset.overviewNode);
      renderProcessOverview();
    });
  });

  appEl.querySelectorAll("[data-overview-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedIndex = Number(button.dataset.overviewAnswer);
      state.processCheckpointResponses[activeNode.id] = selectedIndex;

      if (selectedIndex === activeStep.answer) {
        playProcessRightSound();
        vibrateFeedback([20, 30, 40]);
      } else {
        playProcessWrongSound();
        vibrateFeedback([40]);
      }

      renderProcessOverview();
    });
  });

  document.getElementById("processNextStep")?.addEventListener("click", () => {
    playProcessAdvanceClick();
    const nextStepIndex = activeStepIndex + 1;

    if (nextStepIndex < activeFlow.length) {
      state.processNodeStepIndexById[activeNode.id] = nextStepIndex;
      renderProcessOverview();
      return;
    }

    if (!state.processCompletedNodeIds.includes(activeNode.id)) {
      state.processCompletedNodeIds.push(activeNode.id);
      addFusionPoints(activeNode.reward);
      spawnConfetti("processOverviewPanel");
      playProcessRightSound();
    }

    const nextNodeIndex = Math.min(totalNodes - 1, state.processCurrentNodeIndex + 1);
    state.processCurrentNodeIndex = nextNodeIndex;
    if (state.processNodeStepIndexById[processOverviewNodes[nextNodeIndex]?.id] === undefined) {
      state.processNodeStepIndexById[processOverviewNodes[nextNodeIndex]?.id] = 0;
    }

    renderProcessOverview();
  });
};

const spawnConfetti = (targetId = "lessonPanel") => {
  const burst = document.createElement("div");
  burst.className = "confetti-burst";
  for (let i = 0; i < 16; i += 1) {
    const dot = document.createElement("span");
    dot.style.setProperty("--x", `${(Math.random() * 180 - 90).toFixed(0)}px`);
    dot.style.setProperty("--y", `${(Math.random() * 120 - 60).toFixed(0)}px`);
    dot.style.setProperty("--d", `${(Math.random() * 220 + 220).toFixed(0)}ms`);
    burst.appendChild(dot);
  }
  const panel = document.getElementById(targetId);
  if (!panel) return;
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
  const isInformativeStep = questionData?.type === "informative";
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
          isInformativeStep
            ? `<button class="btn primary" id="completeInformativeStep">Continue</button>
               <p class="feedback" id="feedbackText">Review this information, then continue.</p>`
            :
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
          correctAnswer: isInformativeStep
            ? "Informative step completed"
            : hasMultipleChoice
              ? questionData.options[questionData.answer]
              : questionData.answerText,
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

  if (isInformativeStep) {
    document.getElementById("completeInformativeStep")?.addEventListener("click", () => {
      handleAttempt(true);
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
  const developerDraft = loadDeveloperDraft();
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
    state.developerInsertIndex = "end";
  } else if (!customLessons.some((row) => row.lesson.id === state.developerSelectedLessonId)) {
    state.developerSelectedLessonId = customLessons[0].lesson.id;
    state.developerQuestionIndex = 0;
    state.developerInsertIndex = "end";
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
              ${
                selectedQuestion.type === "informative"
                  ? '<p class="feedback ok">Knowledge break</p>'
                  : `<p class="feedback ok">Answer: ${selectedQuestion.answerText}</p>`
              }
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
          <strong>${question.type === "informative" ? "Knowledge break" : "Question"} ${index + 1}</strong>
          <small>${question.title}</small>
        </button>
      </li>
    `,
    )
    .join("");

  const selectedInsertIndex =
    state.developerInsertIndex === "end"
      ? selectedQuestions.length
      : Math.max(0, Math.min(Number(state.developerInsertIndex), selectedQuestions.length));
  state.developerInsertIndex = selectedInsertIndex >= selectedQuestions.length ? "end" : String(selectedInsertIndex);

  const insertionSequence = selectedQuestions.length
    ? selectedQuestions
        .map((question, index) => {
          const slotLabel = index + 1;
          return `
            <li><button class="developer-insert-slot ${String(selectedInsertIndex) === String(index) ? "active" : ""}" data-insert-index="${index}">+ Insert before ${question.type === "informative" ? "Knowledge break" : "Question"} ${slotLabel}</button></li>
            <li class="developer-sequence-item">
              <span class="developer-sequence-type">${question.type === "informative" ? "Knowledge break" : "Question"} ${slotLabel}</span>
              <strong>${question.title}</strong>
            </li>
          `;
        })
        .join("")
    : '<li><p class="empty-state">No content yet. Start by adding your first question or knowledge break.</p></li>';

  const processNodeRows = processOverviewNodes
    .map(
      (node, index) => `
      <li class="developer-process-row">
        <div>
          <strong>${index + 1}. ${node.title}</strong>
          <small>${node.subtitle}</small>
        </div>
        <button class="btn" type="button" data-process-delete="${index}">Delete</button>
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
            <label>Content type
              <select name="questionType" ${customLessons.length ? "" : "disabled"}>
                <option value="question">Question</option>
                <option value="informative">Knowledge break</option>
              </select>
            </label>
            <label>Insert at
              <select name="insertIndex" ${customLessons.length ? "" : "disabled"}>
                <option value="end">End of lesson</option>
              </select>
            </label>
            <label>Question title <input name="questionTitle" required placeholder="Who owns attrition dashboard governance?" /></label>
            <label>Question body <textarea name="questionBody" rows="3" required placeholder="Describe the operating model expectation."></textarea></label>
            <label>Correct answer <input name="correctAnswer" placeholder="HR analytics lead" /></label>
            <button class="btn primary" type="submit" ${customLessons.length ? "" : "disabled"}>Add question</button>
          </form>
        </article>

        <article>
          <h3>Add Process Node</h3>
          <form id="processNodeForm" class="developer-form">
            <label>Node title <input name="nodeTitle" required placeholder="Manage & Develop" /></label>
            <label>Node subtitle <input name="nodeSubtitle" required placeholder="Guide performance and growth" /></label>
            <label>Objective <textarea name="nodeObjective" rows="2" required placeholder="Explain this phase and what success looks like."></textarea></label>
            <label>Visual labels (comma separated) <input name="nodeVisuals" required placeholder="Goal dashboard, Learning timeline" /></label>
            <label>Walkthrough steps (one per line) <textarea name="nodeWalkthrough" rows="3" required placeholder="Open the dashboard
Call out key fields"></textarea></label>
            <label>Checkpoint prompt <input name="checkpointPrompt" required placeholder="Which action unlocks this node?" /></label>
            <label>Checkpoint location
              <select name="checkpointPlacement">
                <option value="middle">Middle of node</option>
                <option value="end" selected>End of node</option>
              </select>
            </label>
            <label>Checkpoint options (one per line) <textarea name="checkpointOptions" rows="3" required placeholder="Correct option
Distractor A
Distractor B"></textarea></label>
            <label>Correct option number <input name="checkpointAnswer" type="number" min="1" value="1" required /></label>
            <label>Reward points <input name="nodeReward" type="number" min="5" step="5" value="30" required /></label>
            <button class="btn primary" type="submit">Add process node</button>
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
        <h4 class="developer-sequence-heading">Insertion slots</h4>
        <p class="empty-state">Choose a slot between questions and knowledge breaks, or use the end slot.</p>
        <ul class="developer-sequence-list">${insertionSequence}<li><button class="developer-insert-slot ${state.developerInsertIndex === "end" ? "active" : ""}" data-insert-index="end">+ Insert at end of lesson</button></li></ul>
      </section>

      <section class="panel">
        <h3>Process node sequence</h3>
        <p class="empty-state">These power the Process Overview route and are fully editable for prototype iteration.</p>
        ${
          processNodeRows
            ? `<ul class="developer-unit-list">${processNodeRows}</ul>`
            : '<p class="empty-state">No process nodes yet. Add one using the form above.</p>'
        }
        <div class="developer-actions-row">
          <button class="btn" id="resetProcessProgress" type="button">Reset process progress</button>
          <button class="btn" id="restoreProcessDefaults" type="button">Restore default nodes</button>
        </div>
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

  const unitForm = document.getElementById("unitForm");
  const lessonBuilderForm = document.getElementById("lessonBuilderForm");
  const questionBuilderForm = document.getElementById("questionBuilderForm");
  const processNodeForm = document.getElementById("processNodeForm");
  const questionLessonSelect = questionBuilderForm.querySelector('select[name="lessonId"]');
  const insertIndexSelect = questionBuilderForm.querySelector('select[name="insertIndex"]');

  unitForm.title.value = developerDraft.unitTitle || "";
  unitForm.subtitle.value = developerDraft.unitSubtitle || "";
  lessonBuilderForm.lessonTitle.value = developerDraft.lessonTitle || "";
  lessonBuilderForm.lessonDescription.value = developerDraft.lessonDescription || "";
  questionBuilderForm.questionTitle.value = developerDraft.questionTitle || "";
  questionBuilderForm.questionBody.value = developerDraft.questionBody || "";
  questionBuilderForm.correctAnswer.value = developerDraft.correctAnswer || "";
  processNodeForm.nodeTitle.value = developerDraft.processNodeTitle || "";
  processNodeForm.nodeSubtitle.value = developerDraft.processNodeSubtitle || "";
  processNodeForm.nodeObjective.value = developerDraft.processNodeObjective || "";
  processNodeForm.nodeVisuals.value = developerDraft.processNodeVisuals || "";
  processNodeForm.nodeWalkthrough.value = developerDraft.processNodeWalkthrough || "";
  processNodeForm.checkpointPrompt.value = developerDraft.processNodeCheckpointPrompt || "";
  processNodeForm.checkpointPlacement.value = ["middle", "end"].includes(developerDraft.processNodeCheckpointPlacement)
    ? developerDraft.processNodeCheckpointPlacement
    : "end";
  processNodeForm.checkpointOptions.value = developerDraft.processNodeCheckpointOptions || "";
  processNodeForm.checkpointAnswer.value = developerDraft.processNodeCheckpointAnswer || "1";
  processNodeForm.nodeReward.value = developerDraft.processNodeReward || "30";
  if (["question", "informative"].includes(developerDraft.questionType)) {
    questionBuilderForm.questionType.value = developerDraft.questionType;
  }

  unitForm.addEventListener("submit", (event) => {
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
    clearDeveloperDraftSection(["unitTitle", "unitSubtitle"]);
    renderDeveloper();
  });

  unitForm.addEventListener("input", () => {
    saveDeveloperDraft({
      unitTitle: unitForm.title.value,
      unitSubtitle: unitForm.subtitle.value,
    });
  });

  lessonBuilderForm.addEventListener("input", () => {
    saveDeveloperDraft({
      lessonTitle: lessonBuilderForm.lessonTitle.value,
      lessonDescription: lessonBuilderForm.lessonDescription.value,
    });
  });
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
    state.developerInsertIndex = "end";
    saveCustomSections();
    clearDeveloperDraftSection(["lessonTitle", "lessonDescription"]);
    form.reset();
    renderDeveloper();
  });

  const rebuildInsertOptions = (lessonId) => {
    if (!insertIndexSelect) return;
    const lesson = customSections
      .flatMap((section) => section.lessons)
      .find((item) => item.id === lessonId);
    const questionsForLesson = lesson ? lessonQuestions(lesson) : [];
    const options = [`<option value="end">End of lesson</option>`];

    questionsForLesson.forEach((question, index) => {
      const label = question.type === "informative" ? "knowledge break" : "question";
      options.push(`<option value="${index}">Before ${label} ${index + 1}</option>`);
    });

    insertIndexSelect.innerHTML = options.join("");

    const preferred = state.developerInsertIndex === "end" ? "end" : String(state.developerInsertIndex);
    const hasPreferred = Array.from(insertIndexSelect.options).some((option) => option.value === preferred);
    insertIndexSelect.value = hasPreferred ? preferred : "end";
    state.developerInsertIndex = insertIndexSelect.value;
  };

  rebuildInsertOptions(questionLessonSelect?.value);

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
    const questionType = form.questionType.value;
    const correctAnswer = form.correctAnswer.value.trim();

    if (!questionTitle || !questionBody) return;
    if (questionType !== "informative" && !correctAnswer) return;

    if (!Array.isArray(customLesson.questions)) {
      customLesson.questions = lessonQuestions(customLesson);
    }

    const insertTarget = form.insertIndex.value;
    const insertIndex =
      insertTarget === "end"
        ? customLesson.questions.length
        : Math.max(0, Math.min(Number(insertTarget), customLesson.questions.length));

    const questionEntry =
      questionType === "informative"
        ? {
            type: "informative",
            title: questionTitle,
            body: questionBody,
          }
        : {
            type: "question",
            title: questionTitle,
            body: questionBody,
            answerText: correctAnswer,
          };

    customLesson.questions.splice(insertIndex, 0, questionEntry);

    if (!customLesson.question) {
      customLesson.question = questionEntry;
    }

    state.developerSelectedLessonId = customLesson.id;
    state.developerQuestionIndex = insertIndex;
    state.developerInsertIndex = String(insertIndex + 1);
    saveCustomSections();
    clearDeveloperDraftSection(["questionTitle", "questionBody", "correctAnswer"]);
    form.reset();
    renderDeveloper();
  });

  questionBuilderForm.addEventListener("input", () => {
    saveDeveloperDraft({
      questionType: questionBuilderForm.questionType.value,
      questionTitle: questionBuilderForm.questionTitle.value,
      questionBody: questionBuilderForm.questionBody.value,
      correctAnswer: questionBuilderForm.correctAnswer.value,
    });
  });

  questionBuilderForm.querySelector('select[name="questionType"]')?.addEventListener("change", (event) => {
    saveDeveloperDraft({ questionType: event.target.value });
  });

  processNodeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const visuals = form.nodeVisuals.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const walkthrough = form.nodeWalkthrough.value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    const checkpointOptions = form.checkpointOptions.value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (visuals.length === 0 || walkthrough.length === 0 || checkpointOptions.length < 2) return;

    const answerIndex = Math.max(0, Math.min(Number(form.checkpointAnswer.value) - 1, checkpointOptions.length - 1));

    processOverviewNodes.push({
      id: `custom-process-node-${Date.now()}`,
      title: form.nodeTitle.value.trim(),
      subtitle: form.nodeSubtitle.value.trim(),
      objective: form.nodeObjective.value.trim(),
      visuals,
      walkthrough,
      checkpoint: {
        prompt: form.checkpointPrompt.value.trim(),
        options: checkpointOptions,
        answer: answerIndex,
      },
      checkpointPlacement: form.checkpointPlacement.value === "middle" ? "middle" : "end",
      reward: Math.max(5, Number(form.nodeReward.value) || 30),
    });

    saveProcessOverviewNodes();
    clearDeveloperDraftSection([
      "processNodeTitle",
      "processNodeSubtitle",
      "processNodeObjective",
      "processNodeVisuals",
      "processNodeWalkthrough",
      "processNodeCheckpointPrompt",
      "processNodeCheckpointPlacement",
      "processNodeCheckpointOptions",
      "processNodeCheckpointAnswer",
      "processNodeReward",
    ]);
    form.reset();
    form.checkpointAnswer.value = "1";
    form.checkpointPlacement.value = "end";
    form.nodeReward.value = "30";
    renderDeveloper();
  });

  processNodeForm.addEventListener("input", () => {
    saveDeveloperDraft({
      processNodeTitle: processNodeForm.nodeTitle.value,
      processNodeSubtitle: processNodeForm.nodeSubtitle.value,
      processNodeObjective: processNodeForm.nodeObjective.value,
      processNodeVisuals: processNodeForm.nodeVisuals.value,
      processNodeWalkthrough: processNodeForm.nodeWalkthrough.value,
      processNodeCheckpointPrompt: processNodeForm.checkpointPrompt.value,
      processNodeCheckpointPlacement: processNodeForm.checkpointPlacement.value,
      processNodeCheckpointOptions: processNodeForm.checkpointOptions.value,
      processNodeCheckpointAnswer: processNodeForm.checkpointAnswer.value,
      processNodeReward: processNodeForm.nodeReward.value,
    });
  });

  questionLessonSelect?.addEventListener("change", (event) => {
    state.developerSelectedLessonId = event.target.value;
    state.developerQuestionIndex = 0;
    state.developerInsertIndex = "end";
    rebuildInsertOptions(event.target.value);
    renderDeveloper();
  });

  insertIndexSelect?.addEventListener("change", (event) => {
    state.developerInsertIndex = event.target.value;
    renderDeveloper();
  });

  appEl.querySelectorAll("[data-insert-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.developerInsertIndex = button.dataset.insertIndex;
      if (insertIndexSelect) insertIndexSelect.value = state.developerInsertIndex;
      renderDeveloper();
    });
  });

  appEl.querySelectorAll("[data-process-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.processDelete);
      if (!Number.isInteger(index) || index < 0 || index >= processOverviewNodes.length) return;
      processOverviewNodes.splice(index, 1);
      saveProcessOverviewNodes();
      state.processCurrentNodeIndex = 0;
      state.processCompletedNodeIds = [];
      state.processCheckpointResponses = {};
      state.processNodeStepIndexById = {};
      renderDeveloper();
    });
  });

  document.getElementById("resetProcessProgress")?.addEventListener("click", () => {
    state.processCurrentNodeIndex = 0;
    state.processCompletedNodeIds = [];
    state.processCheckpointResponses = {};
    state.processNodeStepIndexById = {};
    renderDeveloper();
  });

  document.getElementById("restoreProcessDefaults")?.addEventListener("click", () => {
    processOverviewNodes = [...baseProcessOverviewNodes];
    saveProcessOverviewNodes();
    state.processCurrentNodeIndex = 0;
    state.processCompletedNodeIds = [];
    state.processCheckpointResponses = {};
    state.processNodeStepIndexById = {};
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
    navigate(isAuthGateEnabled() ? "/login" : "/");
  });
};

const renderRoute = () => {
  if (!state.authReady) {
    appEl.innerHTML = '<section class="panel"><p>Loading session...</p></section>';
    return;
  }

  syncRouteChrome();
  const route = getPath();

  if (isAuthGateEnabled() && AUTH_REQUIRED_ROUTES.has(route) && !isAuthenticated()) {
    navigate("/login");
    return;
  }

  if (isAuthGateEnabled() && AUTH_ONLY_ROUTES.has(route) && isAuthenticated()) {
    navigate("/");
    return;
  }

  renderNav();

  if (route === "/") return renderHome();
  if (route === "/login") return renderLogin();
  if (route === "/register") return renderRegister();
  if (route === "/skills") return renderSkills();
  if (route === "/process-overview") return renderProcessOverview();
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
  window.toggleAuthGate = (enabled) => {
    const resolvedValue = parseBooleanSetting(enabled);
    if (typeof resolvedValue !== "boolean") {
      console.warn("toggleAuthGate expects true/false");
      return state.authGateEnabled;
    }

    state.authGateEnabled = resolvedValue;
    localStorage.setItem(AUTH_GATE_STORAGE_KEY, String(resolvedValue));
    renderRoute();
    return resolvedValue;
  };

  if (!location.hash) navigate("/");
  await bootstrapAuth();
  renderRoute();
});
