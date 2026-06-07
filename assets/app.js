/* THE ENDLESS INTERNET — engine v2
   Discovery-driven. No click count. Find things, unlock things.
   Everything is local. Nothing is sent anywhere. */

(function () {
  "use strict";

  // ============================================
  // STORAGE KEYS
  // ============================================
  const K = {
    visited: "endless_internet_visited",
    fragments: "endless_internet_fragments",
    passwords: "endless_internet_passwords",
    objectives: "endless_internet_objectives",
    completedObj: "endless_internet_completed_obj",
    threads: "endless_internet_threads",
    started: "endless_internet_started",
    seenMessages: "endless_internet_seen_msgs",
    archiveUnlocked: "archive_unlocked",
    riddlesSolved: "endless_internet_riddles_solved",
    truthSeen: "endless_internet_truth_seen",
    endSeen: "endless_internet_end_seen",
  };

  // ============================================
  // RIDDLES — embedded puzzles hidden in pages
  // ============================================
  // Each riddle has: id, question, accept (array of accepted answers,
  // case-insensitive), fragment granted on solve, optional misdirect msg.
  // Solved riddles persist in localStorage.
  const RIDDLES = {
    "riddle-axis": {
      id: "riddle-axis",
      page: "mirror/14-axis-deep.html",
      prompt: "14 numbers go in. 1 number comes out. The threshold, in the formal sense, is what?",
      hint: "Read the spec carefully. Look for the number between two others.",
      accept: ["0.55", ".55", "0.55%", "55", "point five five", "point-five-five"],
      fragment: "threshold-crossed",
      misdirect: [
        "not quite. read again.",
        "wrong. the answer is in the prose, not the math.",
        "almost. but the formal sense is a different number than the practical sense.",
      ],
    },
    "riddle-signal": {
      id: "riddle-signal",
      page: "signals/console-log.html",
      prompt: "Four timestamps. Three of them are routine. One of them is not. Which one?",
      hint: "It happened when nothing was supposed to happen. The page was not yours.",
      accept: ["03:14", "0314", "3:14", "3:14am", "3:14 am", "three fourteen", "three-fourteen"],
      fragment: "the system saw you",
      misdirect: [
        "no. the answer is a time, not a page.",
        "close. but you have to find the timestamp that breaks the pattern.",
      ],
    },
    "riddle-helena": {
      id: "riddle-helena",
      page: "helena/last.html",
      prompt: "The author writes under a codename. Her codename, in the formal sense, is what she was called at the project. Find the codename.",
      hint: "It appears in three digits and four letters. She was a number before she was a name.",
      accept: ["ev-2417", "ev2417", "EV-2417", "EV2417", "ev 2417"],
      fragment: "the codename",
      misdirect: [
        "no. the answer is a codename, not her real name.",
        "wrong. it is on this page, but you have to look at the small text.",
      ],
    },
    "riddle-truth": {
      id: "riddle-truth",
      page: "mirror/truth.html",
      prompt: "How many Americans, in the formal sense? The number, written in digits, with a comma. As it appears in the verse.",
      hint: "It is repeated in the document. The first appearance is in italics, in the dedication.",
      accept: ["2,304,891", "2304891", "2,304,891.", "2304891 people", "two million three hundred four thousand eight hundred ninety one"],
      fragment: "the count is real",
      misdirect: [
        "no. the verse says one number, plainly. read it again.",
        "wrong. it is in the first three lines of the document, not the body.",
      ],
    },
    "riddle-elena": {
      id: "riddle-elena",
      page: "employees/elena-vasquez.html",
      prompt: "What was the item she did NOT return? The thing Helix wanted back but could not get.",
      hint: "It is mentioned in the termination summary. The item is described as encrypted.",
      accept: ["the vasquez drive", "vasquez drive", "encrypted personal storage device", "encrypted storage device", "personal storage device", "the drive"],
      fragment: "the missing device",
      misdirect: [
        "no. she returned the laptop, the badge, and the pass. the other item was not returned.",
        "wrong. look at the items not returned section.",
      ],
    },
    "riddle-3am": {
      id: "riddle-3am",
      page: "signals/3am-pageview.html",
      prompt: "The browsing session lasted exactly how many seconds? The report says the number.",
      hint: "It is a three-digit number. The report says it plainly.",
      accept: ["113", "113 seconds", "one hundred thirteen"],
      fragment: "the session duration",
      misdirect: [
        "no. it is a number, not a time.",
        "wrong. the report says the total session duration was exactly this many seconds.",
      ],
    },
    "riddle-glitch": {
      id: "riddle-glitch",
      page: "signals/glitch-report.html",
      prompt: "What is the name the web ops team gave the anomaly? The internal codename.",
      hint: "It is a hex value followed by a word. The word is in the report.",
      accept: ["ev-2417 echo", "ev2417 echo", "the ev-2417 echo", "EV-2417 echo", "0xEV-2417 echo"],
      fragment: "the echo name",
      misdirect: [
        "no. the codename is in the report, in the recommendations section.",
        "wrong. it is what they call the anomaly internally.",
      ],
    },
    "riddle-renner": {
      id: "riddle-renner",
      page: "archive/renner-full-statement.html",
      prompt: "Mark Renner was placed on administrative leave pending what? The two-word review.",
      hint: "The statement says he was placed on leave pending a review. The review has two words.",
      accept: ["security review", "a security review", "the security review"],
      fragment: "the leave reason",
      misdirect: [
        "no. the statement says he was placed on leave pending a review of a specific kind.",
        "wrong. look at the fragments section — it says the review type.",
      ],
    },
    "riddle-vasquez": {
      id: "riddle-vasquez",
      page: "archive/vasquez-statement.html",
      prompt: "Dr. Vasquez's website was taken offline how many hours and minutes after publication?",
      hint: "The statement says the website was taken offline at a specific time after publication.",
      accept: ["4 hours and 17 minutes", "4 hours 17 minutes", "4:17", "4 hours, 17 minutes", "four hours and seventeen minutes"],
      fragment: "the takedown time",
      misdirect: [
        "no. the statement says the exact time the website was taken offline.",
        "wrong. it is a duration, not a timestamp.",
      ],
    },
    "riddle-deleted": {
      id: "riddle-deleted",
      page: "blog/deleted.html",
      prompt: "How many deployments did the Ethics board attempt to pause in 18 months?",
      hint: "The CEO says the board has paused deployments. The annotation says how many were overridden.",
      accept: ["3", "three", "three deployments", "3 deployments"],
      fragment: "the override count",
      misdirect: [
        "no. the annotation says the board attempted to pause this many deployments.",
        "wrong. look at the annotation by E. Vasquez.",
      ],
    },
    "riddle-cohort": {
      id: "riddle-cohort",
      page: "archive/cohort-update-log.html",
      prompt: "What was the false-positive rate? The percentage that corresponds to 92,196 Americans.",
      hint: "The log says the rate, applied to the cohort, corresponds to 92,196 false positives.",
      accept: ["4%", "4 percent", "4", "four percent", "four%", ".04"],
      fragment: "the error rate",
      misdirect: [
        "no. the log says the false-positive rate as a percentage.",
        "wrong. look at the paragraph that mentions back-testing.",
      ],
    },
    "riddle-employment": {
      id: "riddle-employment",
      page: "press/employment-record.html",
      prompt: "What is Aisha Lopez's employee ID? The four-character code.",
      hint: "It is in the employment record. The format is two letters and four digits.",
      accept: ["al-1834", "AL-1834", "al1834", "AL1834", "AL 1834"],
      fragment: "the board chair id",
      misdirect: [
        "no. it is an employee ID, not a name.",
        "wrong. look at the Aisha Lopez section of the employment record.",
      ],
    },
  };

  // ============================================
  // THREADS — the color-coded breadcrumb system
  // ============================================
  const THREADS = {
    blue: {
      id: "blue",
      color: "#0066cc",
      name: "official trail",
      description: "Public-facing breadcrumbs Helix left behind — or tried to.",
      pages: [
        "press.html",
        "press/employment-record.html",
        "press/contract-record.html",
        "press/vasquez-foia.html",
        "press/ethics-resignation.html",
        "press/contract-disclosure.html",
        "blog/contract-language.html",
      ],
    },
    yellow: {
      id: "yellow",
      color: "#d4a017",
      name: "anomalous signal",
      description: "Things that shouldn't be where they are. Glitches in the corporate surface.",
      pages: [
        "signin.html",
        "data-room.html",
        "null.html",
        "signals/console-log.html",
        "signals/glitch-report.html",
        "signals/3am-pageview.html",
        "signals/dead-letter.html",
      ],
    },
    red: {
      id: "red",
      color: "#c0392b",
      name: "project mirror",
      description: "The deep. What they were actually building.",
      pages: [
        "archive.html",
        "archive/vasquez-statement.html",
        "archive/project-mirror-spec.html",
        "archive/subject-list.html",
        "archive/termination-order.html",
        "archive/cohort-update-log.html",
        "archive/threshold-changes.html",
        "archive/data-flow-diagram.html",
        "mirror/end.html",
        "mirror/list.html",
        "mirror/truth.html",
        "mirror/after.html",
        "mirror/14-axis-deep.html",
        "end.html",
      ],
    },
    purple: {
      id: "purple",
      color: "#8e44ad",
      name: "elena's trail",
      description: "Personal breadcrumbs. The human behind the data.",
      pages: [
        "employees/elena-vasquez.html",
        "helena/last.html",
        "helena/first-message.html",
        "helena/voice-memo.html",
        "helena/photo.html",
        "helena/goodbye.html",
        "helena/childhood.html",
        "helena/mit-years.html",
        "helena/first-day.html",
        "helena/joins-helix.html",
        "helena/final.html",
        "helena/the-letter.html",
      ],
    },
    green: {
      id: "green",
      color: "#27ae60",
      name: "side investigations",
      description: "The people around the story. What happened to everyone else.",
      pages: [
        "employees/former.html",
        "forum/thread-4512.html",
        "forum/thread-7821.html",
        "forum/thread-2099.html",
        "forum/thread-3301.html",
        "forum/thread-9988.html",
        "archive/side-investigation.html",
        "archive/eo-board-log.html",
        "archive/renner-full-statement.html",
        "archive/lopez-resignation.html",
        "archive/journalist-notes.html",
        "archive/audio-transcript.html",
        "archive/source-code.html",
        "archive/witness-testimony.html",
        "archive/conspiracy-board.html",
        "archive/classified-experiment.html",
        "archive/dead-drop.html",
        "archive/internal-audit.html",
        "archive/black-site.html",
        "archive/leaked-emails.html",
      ],
    },
  };

  // ============================================
  // OBJECTIVES — the goal system
  // ============================================
  const OBJECTIVES = [
    // Phase 1: Surface curiosity
    {
      id: "obj-first-anomaly",
      title: "Notice something off",
      desc: "The Helix site has comments in its source. People don't usually write comments on a marketing site.",
      hint: "Right-click → View Source on any page",
      check: (s) => s.visited.size > 0,
      unlocks: ["obj-find-elena"],
    },
    {
      id: "obj-find-elena",
      title: "Find Elena Vasquez",
      desc: "There's a name that keeps coming up. Find her on the team page.",
      hint: "Look at the team list carefully.",
      check: (s) => s.visited.has("employees/elena-vasquez.html"),
      unlocks: ["obj-read-bio", "obj-trail-starts"],
    },
    {
      id: "obj-read-bio",
      title: "Read what happened to her",
      desc: "Her bio has more in it than most bios. Read the full thing.",
      check: (s) => s.visited.has("employees/elena-vasquez.html") && s.dwellTime.get("employees/elena-vasquez.html") > 30,
      unlocks: ["obj-trail-starts"],
    },
    {
      id: "obj-trail-starts",
      title: "Find her trail",
      desc: "She left a message somewhere on the site. Find it.",
      hint: "Look for breadcrumbs in pages you've already read.",
      check: (s) => s.visited.has("helena/last.html"),
      unlocks: ["obj-decrypt", "obj-find-source"],
    },
    {
      id: "obj-find-source",
      title: "Find the project name",
      desc: "There's a code name you need. The name of the thing they were building.",
      hint: "It's mentioned in redacted text and console messages. Try the null page.",
      check: (s) => s.fragments.has("project-name") || s.passwords.has("mirror"),
      unlocks: ["obj-decrypt"],
    },
    {
      id: "obj-decrypt",
      title: "Access the encrypted archive",
      desc: "There's a locked archive on the site. The key is the name of the project.",
      hint: "Passwords to try: mirror, MIRROR, ev2417, vasquez. Or: 2.3M, 2304891.",
      check: (s) => s.passwords.has("mirror") || s.passwords.has("archive") || s.visited.has("archive/vasquez-statement.html"),
      unlocks: ["obj-read-statement", "obj-find-spec"],
    },
    {
      id: "obj-read-statement",
      title: "Read her public statement",
      desc: "She published a statement before the lawyers took it down.",
      check: (s) => s.visited.has("archive/vasquez-statement.html"),
      unlocks: ["obj-find-spec", "obj-find-timeline"],
    },
    {
      id: "obj-find-spec",
      title: "Read the system specification",
      desc: "Find the document that describes what MIRROR actually does.",
      check: (s) => s.visited.has("archive/project-mirror-spec.html"),
      unlocks: ["obj-find-timeline", "obj-find-registry"],
    },
    {
      id: "obj-find-timeline",
      title: "Find the timeline",
      desc: "Reconstruct what happened. There's a page that lists it all.",
      check: (s) => s.visited.has("mirror/end.html"),
      unlocks: ["obj-find-registry", "obj-find-axis"],
    },
    {
      id: "obj-find-registry",
      title: "Find the subject registry",
      desc: "The list of 2,304,891 people. The list that should not exist.",
      check: (s) => s.visited.has("mirror/list.html") || s.visited.has("archive/subject-list.html"),
      unlocks: ["obj-find-axis", "obj-find-truth"],
    },
    {
      id: "obj-find-axis",
      title: "Understand the 14 axes",
      desc: "The model has 14 inputs. Find the page that explains what they are.",
      check: (s) => s.visited.has("mirror/14-axis-deep.html") || s.visited.has("archive/project-mirror-spec.html"),
      unlocks: ["obj-find-truth", "obj-side-renner"],
    },
    {
      id: "obj-side-renner",
      title: "Find Mark Renner's full statement",
      desc: "Another engineer refused to sign. Find his side of the story.",
      check: (s) => s.visited.has("archive/renner-full-statement.html"),
      unlocks: ["obj-side-lopez"],
    },
    {
      id: "obj-side-lopez",
      title: "Find the Ethics Board chair's resignation",
      desc: "The person who was supposed to be the safeguard. What did she say when she left?",
      check: (s) => s.visited.has("archive/lopez-resignation.html"),
      unlocks: ["obj-side-journalist"],
    },
    {
      id: "obj-side-journalist",
      title: "Find the journalist's notes",
      desc: "A reporter got the documents. Read how the story came out.",
      check: (s) => s.visited.has("archive/journalist-notes.html"),
      unlocks: ["obj-find-truth"],
    },
    {
      id: "obj-find-truth",
      title: "Reach the truth",
      desc: "There's a final page. The end of the project. Find it.",
      hint: "Follow the red thread.",
      check: (s) => s.visited.has("mirror/truth.html") || s.visited.has("end.html"),
      unlocks: ["obj-elena-final", "obj-after"],
    },
    {
      id: "obj-elena-final",
      title: "Find Elena's final page",
      desc: "The last thing she wrote. The last breadcrumb.",
      check: (s) => s.visited.has("helena/final.html") || s.visited.has("helena/the-letter.html"),
      unlocks: ["obj-after"],
    },
    {
      id: "obj-after",
      title: "Read the after",
      desc: "What happened after the story broke.",
      check: (s) => s.visited.has("mirror/after.html") || s.visited.has("end.html"),
      unlocks: [],
    },

    // Side / optional objectives
    {
      id: "obj-cipher",
      title: "Decode the cipher",
      desc: "There's an encoded message somewhere. Find and decode it.",
      hint: "ROT13 is a common starting point.",
      check: (s) => s.fragments.has("cipher-decoded") || s.passwords.has("cipher"),
      unlocks: [],
      optional: true,
    },
    {
      id: "obj-threads-all",
      title: "Follow every color",
      desc: "Each color is a thread. Find at least one page in every color.",
      check: (s) => ["blue", "yellow", "red", "purple", "green"].every(t => s.threads.has(t)),
      unlocks: [],
      optional: true,
    },
    {
      id: "obj-fragments-all",
      title: "Collect every fragment",
      desc: "Hidden in pages across the site. Find them all.",
      check: (s) => s.fragments.size >= 8,
      unlocks: [],
      optional: true,
    },
  ];

  // ============================================
  // STATE
  // ============================================
  let state = {
    visited: new Set(JSON.parse(localStorage.getItem(K.visited) || "[]")),
    fragments: new Set(JSON.parse(localStorage.getItem(K.fragments) || "[]")),
    passwords: new Set(JSON.parse(localStorage.getItem(K.passwords) || "[]")),
    threads: new Set(JSON.parse(localStorage.getItem(K.threads) || "[]")),
    completedObj: new Set(JSON.parse(localStorage.getItem(K.completedObj) || "[]")),
    activeObj: JSON.parse(localStorage.getItem(K.objectives) || "[]"),
    seenMessages: new Set(JSON.parse(localStorage.getItem(K.seenMessages) || "[]")),
    dwellTime: new Map(), // populated at session end
    discovered: 0,
  };

  // ============================================
  // SAVE
  // ============================================
  function save() {
    localStorage.setItem(K.visited, JSON.stringify([...state.visited]));
    localStorage.setItem(K.fragments, JSON.stringify([...state.fragments]));
    localStorage.setItem(K.passwords, JSON.stringify([...state.passwords]));
    localStorage.setItem(K.threads, JSON.stringify([...state.threads]));
    localStorage.setItem(K.completedObj, JSON.stringify([...state.completedObj]));
    localStorage.setItem(K.objectives, JSON.stringify(state.activeObj));
    localStorage.setItem(K.seenMessages, JSON.stringify([...state.seenMessages]));
  }

  // ============================================
  // VISIT TRACKING
  // ============================================
  const path = window.location.pathname.replace(/^.*?\//, "").toLowerCase();
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const isArchive = pathSegments.includes("archive") || pathSegments[0] === "archive.html";
  const isHelena = pathSegments.includes("helena") || pathSegments[0] === "helena";
  const isMirror = pathSegments.includes("mirror") || pathSegments[0] === "mirror.html";

  // Track full path for visit detection (e.g. "helena/last.html")
  let fullPath = pathSegments.join("/") || "index.html";
  if (fullPath.endsWith("/")) fullPath += "index.html";

  if (fullPath && !state.visited.has(fullPath)) {
    state.visited.add(fullPath);
  }

  // Mark thread based on path
  Object.values(THREADS).forEach((t) => {
    if (t.pages.some((p) => fullPath.endsWith(p.replace(/^.*?\//, "")) || fullPath.includes(p.split("/")[0] + "/"))) {
      state.threads.add(t.id);
    }
  });

  // ============================================
  // DISCOVERY COUNT
  // ============================================
  function updateDiscoveryCount() {
    state.discovered = state.visited.size + state.fragments.size + state.passwords.size;
  }
  updateDiscoveryCount();

  // ============================================
  // VISUAL STAGE (based on discoveries, not clicks)
  // ============================================
  function computeReveal(d) {
    if (d >= 25) return 4;
    if (d >= 15) return 3;
    if (d >= 8) return 2;
    if (d >= 3) return 1;
    return 0;
  }

  function applyReveal() {
    const body = document.body;
    body.classList.remove("reveal-1", "reveal-2", "reveal-3", "reveal-4");
    const r = computeReveal(state.discovered);
    if (r >= 1) body.classList.add("reveal-" + r);
    document.documentElement.style.setProperty("--veil", String(Math.min(state.discovered * 3, 100)));
  }

  // ============================================
  // OBJECTIVE MANAGEMENT
  // ============================================
  function updateObjectives() {
    // Seed initial active objectives
    if (state.activeObj.length === 0) {
      state.activeObj = ["obj-first-anomaly"];
    }

    // Check completion
    OBJECTIVES.forEach((obj) => {
      if (!state.completedObj.has(obj.id) && !obj.optional) {
        if (obj.check(state)) {
          state.completedObj.add(obj.id);
          if (state.activeObj.includes(obj.id)) {
            state.activeObj = state.activeObj.filter((x) => x !== obj.id);
          }
          // Unlock new objectives
          (obj.unlocks || []).forEach((u) => {
            if (!state.completedObj.has(u) && !state.activeObj.includes(u)) {
              const target = OBJECTIVES.find((o) => o.id === u);
              if (target && !target.optional) state.activeObj.push(u);
            }
          });
        }
      }
    });

    // Add new active objectives based on completed state
    const optionalToShow = [];
    OBJECTIVES.forEach((obj) => {
      if (obj.optional && obj.check(state) && !state.completedObj.has(obj.id)) {
        state.completedObj.add(obj.id);
      }
    });

    // Make sure at least 2 active objectives exist (if more exist)
    if (state.activeObj.length < 2) {
      const next = OBJECTIVES.find(
        (o) => !state.completedObj.has(o.id) && !state.activeObj.includes(o.id) && !o.optional
      );
      if (next) state.activeObj.push(next.id);
    }

    save();
  }

  // ============================================
  // RENDERING
  // ============================================
  function renderObjectivesPanel() {
    let panel = document.getElementById("obj-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "obj-panel";
      panel.className = "objectives-panel";
      document.body.appendChild(panel);
    }
    // Apply persisted minimize state
    const minimized = localStorage.getItem("endless_internet_obj_minimized") === "1";
    panel.classList.toggle("minimized", minimized);

    const total = OBJECTIVES.filter(o => !o.optional).length;
    const done = state.completedObj.size;
    const pct = Math.round((done / total) * 100);
    let html = `
      <div class="obj-header">
        <h4>
          <span>OBJECTIVES · ${done}/${total}</span>
        </h4>
        <button class="obj-min-btn" id="obj-min-btn" title="Minimize" aria-label="Minimize objectives">
          <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 6 L10 6"/></svg>
        </button>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="obj-list">
    `;
    // Show active objectives first
    state.activeObj.slice(0, 4).forEach((id) => {
      const o = OBJECTIVES.find((x) => x.id === id);
      if (!o) return;
      html += `
        <div class="obj active">
          <div class="obj-title"><span class="check">▸</span>${o.title}</div>
          <div class="obj-desc">${o.desc}</div>
          ${o.hint ? `<div class="obj-hint">${o.hint}</div>` : ""}
        </div>
      `;
    });
    // Show last 3 completed
    const recent = [...state.completedObj].slice(-3).reverse();
    recent.forEach((id) => {
      const o = OBJECTIVES.find((x) => x.id === id);
      if (!o) return;
      html += `
        <div class="obj done">
          <div class="obj-title"><span class="check">✓</span>${o.title}</div>
        </div>
      `;
    });
    html += `</div>`;
    panel.innerHTML = html;

    // Floating reopen tab (always present, only visible when minimized)
    let reopen = document.getElementById("obj-reopen");
    if (!reopen) {
      reopen = document.createElement("button");
      reopen.id = "obj-reopen";
      reopen.className = "obj-reopen";
      reopen.title = "Open objectives";
      reopen.setAttribute("aria-label", "Open objectives");
      reopen.innerHTML = `<span class="obj-reopen-label">OBJECTIVES</span><span class="obj-reopen-count">${done}/${total}</span>`;
      document.body.appendChild(reopen);
      reopen.addEventListener("click", () => {
        localStorage.setItem("endless_internet_obj_minimized", "0");
        panel.classList.remove("minimized");
        reopen.classList.remove("visible");
      });
    }
    reopen.querySelector(".obj-reopen-count").textContent = `${done}/${total}`;
    reopen.classList.toggle("visible", minimized);

    // Minimize button
    document.getElementById("obj-min-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const next = !panel.classList.contains("minimized");
      localStorage.setItem("endless_internet_obj_minimized", next ? "1" : "0");
      panel.classList.toggle("minimized", next);
      reopen.classList.toggle("visible", next);
    });

    // Mobile: tap the panel header to slide the bottom sheet up/down
    const panelH4 = panel.querySelector("h4");
    if (panelH4 && !panelH4.dataset.mobileBound) {
      panelH4.dataset.mobileBound = "1";
      panelH4.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 600px)").matches && !panel.classList.contains("minimized")) {
          panel.classList.toggle("expanded");
        }
      });
    }
  }

  function renderDiscoveryCounter() {
    let counter = document.querySelector(".discovery-counter");
    if (!counter) {
      counter = document.createElement("div");
      counter.className = "discovery-counter";
      counter.title = "Click to view your discoveries";
      document.body.appendChild(counter);
    }
    counter.textContent = `DISCOVERED: ${state.discovered} · STAGE ${computeReveal(state.discovered)}`;
    counter.onclick = () => {
      window.location.href = "discoveries.html";
    };
  }

  function renderThreadBar() {
    // Skip on certain pages
    const skip = ["signin.html", "data-room.html", "null.html"];
    if (skip.some(s => fullPath.endsWith(s))) return;

    let bar = document.querySelector(".thread-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "thread-bar";
      const header = document.querySelector(".site-header");
      if (header) header.insertAdjacentElement("afterend", bar);
    }
    const allThreads = ["blue", "yellow", "red", "purple", "green"];
    const currentThread = Object.values(THREADS).find(t =>
      t.pages.some(p => fullPath.includes(p.split("/")[0]))
    );
    let html = `<div class="container"><span class="thread-label">THREADS:</span>`;
    allThreads.forEach(tid => {
      const t = THREADS[tid];
      const discovered = state.threads.has(tid);
      const isCurrent = currentThread && currentThread.id === tid;
      const lockedClass = !discovered ? " locked" : "";
      const activeClass = isCurrent ? " active" : "";
      const dotStyle = !discovered ? 'style="background:var(--c-muted);box-shadow:none;"' : "";
      html += `<a href="map.html?thread=${tid}" class="thread-link ${tid}${lockedClass}${activeClass}" title="${t.description}"><span class="dot" ${dotStyle}></span>${t.name}</a>`;
    });
    html += `<a href="discoveries.html" class="thread-link" style="margin-left:auto;color:var(--c-muted);" title="Your discoveries"><span>📋</span>discoveries (${state.discovered})</a>`;
    html += `</div>`;
    bar.innerHTML = html;
  }

  // ============================================
  // PASSWORD GATE
  // ============================================
  function checkArchiveAccess() {
    if (!isArchive) return;
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    const passwords = ["mirror", "MIRROR", "2.3M", "2334891", "vasquez", "EV2417", "ev2417"];
    if (key && passwords.includes(key)) {
      sessionStorage.setItem(K.archiveUnlocked, "1");
      state.passwords.add("mirror");
      state.passwords.add("archive");
      state.threads.add("red");
      const clean = window.location.pathname;
      window.history.replaceState({}, document.title, clean);
    }
  }

  function applyArchiveGate() {
    if (!isArchive) return;
    // The archive index and the contents are gated
    if (fullPath === "archive.html" || fullPath.endsWith("/archive/")) {
      // archive index is open, but linked sub-pages require password
    }
    if (fullPath.startsWith("archive/") || fullPath.includes("/archive/")) {
      if (sessionStorage.getItem(K.archiveUnlocked) === "1") return;
      const body = document.body;
      body.innerHTML = `
        <div class="container" style="max-width:480px;margin:6rem auto;text-align:center;">
          <div style="font-family:monospace;color:var(--c-muted);margin-bottom:2rem;">[ ENCRYPTED ARCHIVE — RESTRICTED ]</div>
          <h1>Access Required</h1>
          <p style="color:var(--c-muted);margin-bottom:2rem;">This archive is protected. The key is hidden in the public site. Read carefully — the name of the project is the key.</p>
          <form id="archiveForm" style="display:flex;gap:0.5rem;">
            <input type="text" id="archiveKey" placeholder="Enter access key" autocomplete="off" />
            <button type="submit" class="btn">Submit</button>
          </form>
          <div id="archiveMsg" style="margin-top:1rem;font-family:monospace;font-size:0.85rem;color:var(--c-danger);"></div>
          <div style="margin-top:2rem;font-family:monospace;font-size:0.75rem;color:var(--c-muted);">attempt count: <span id="attempts">0</span></div>
          <p style="margin-top:3rem;"><a href="index.html">← return to helix</a></p>
        </div>
      `;
      let attempts = 0;
      document.getElementById("archiveForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const v = document.getElementById("archiveKey").value.trim();
        attempts++;
        document.getElementById("attempts").textContent = attempts;
        const passwords = ["mirror", "MIRROR", "2.3M", "2334891", "vasquez", "EV2417", "ev2417"];
        if (passwords.includes(v)) {
          sessionStorage.setItem(K.archiveUnlocked, "1");
          state.passwords.add("mirror");
          state.passwords.add("archive");
          state.threads.add("red");
          save();
          location.reload();
        } else {
          document.getElementById("archiveMsg").textContent = "ACCESS DENIED. signal logged.";
          state.discovered += 1;
          save();
        }
      });
    }
  }

  // ============================================
  // PAGE BEHAVIORS
  // ============================================
  function pageBehaviors() {
    // The list page — generate fake names
    if ((fullPath.includes("mirror/list") || fullPath === "mirror/list.html") && computeReveal(state.discovered) >= 1) {
      const list = document.getElementById("subjectList");
      if (list && !list.dataset.rendered) {
        list.dataset.rendered = "1";
        const firstNames = ["James","Mary","Robert","Patricia","John","Jennifer","Michael","Linda","David","Elizabeth","William","Barbara","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Charles","Karen","Christopher","Nancy","Daniel","Lisa","Matthew","Margaret","Anthony","Betty","Mark","Sandra","Donald","Ashley","Steven","Kimberly","Paul","Emily","Andrew","Donna","Joshua","Michelle","Kenneth","Carol","Kevin","Amanda","Brian","Melissa","George","Deborah","Edward","Stephanie","Ronald","Rebecca","Timothy","Laura","Jason","Sharon","Jeffrey","Cynthia","Ryan","Kathleen","Jacob","Helen","Gary","Amy","Nicholas","Shirley","Eric","Angela","Jonathan","Anna","Stephen","Brenda","Larry","Pamela","Justin","Nicole","Scott","Emma","Brandon","Samantha","Benjamin","Katherine","Samuel","Christine","Frank","Debra","Gregory","Rachel","Raymond","Catherine","Alexander","Carolyn","Patrick","Janet","Jack","Ruth","Dennis","Maria","Jerry","Heather","Tyler","Diane","Aaron","Virginia","Jose","Julie","Adam","Joyce","Henry","Victoria","Nathan","Olivia","Douglas","Kelly","Peter","Christina","Zachary","Lauren","Kyle","Joan","Walter","Evelyn","Harold","Judith","Jeremy","Megan","Ethan","Cheryl","Carl","Andrea","Keith","Hannah","Roger","Jacqueline","Gerald","Martha","Christian","Gloria","Terry","Teresa","Sean","Ann","Arthur","Sara","Austin","Madison","Noah","Frances","Lawrence","Kathryn","Jesse","Janice","Joe","Jean","Bryan","Abigail","Billy","Alice","Jordan","Julia","Albert","Judy","Dylan","Sophia","Bruce","Grace","Willie","Denise","Gabriel","Amber","Alan","Doris","Juan","Marilyn","Logan","Danielle","Wayne","Beverly","Roy","Isabella","Ralph","Theresa","Randy","Diana","Eugene","Natalie","Vincent","Brittany","Russell","Charlotte","Elijah","Marie","Louis","Kayla","Bobby","Alexis","Philip","Lori","Johnny","Tiffany"];
        const lastNames = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts","Gomez","Phillips","Evans","Turner","Diaz","Parker","Cruz","Edwards","Collins","Reyes","Stewart","Morris","Morales","Murphy","Cook","Rogers","Gutierrez","Ortiz","Morgan","Cooper","Peterson","Bailey","Reed","Kelly","Howard","Ramos","Kim","Cox","Ward","Richardson","Watson","Brooks","Chavez","Wood","James","Bennett","Gray","Mendoza","Ruiz","Hughes","Price","Alvarez","Castillo","Sanders","Patel","Myers","Long","Ross","Foster","Jimenez","Powell","Jenkins","Perry","Russell","Sullivan","Bell","Coleman","Butler","Henderson","Barnes","Gonzales","Fisher","Vasquez","Simmons","Romero","Jordan","Patterson","Alexander","Hamilton","Graham","Reynolds","Griffin","Wallace","Moreno","West","Cole","Hayes","Bryant","Herrera","Gibson","Ellis","Tran","Medina","Aguilar","Stevens","Murray","Ford","Castro","Marshall","Owens","Harrison","Fernandez","McDonald","Woods","Washington","Kennedy","Wells","Vargas","Henry","Chen","Freeman","Webb","Tucker","Guzman","Burns","Crawford","Olson","Simpson","Porter","Hunter","Gordon","Mendez","Silva","Shaw","Snyder","Mason","Dixon","Munoz","Hunt","Hicks","Holmes","Palmer","Wagner","Black","Robertson","Boyd","Rose","Stone","Salazar","Fox","Warren","Mills","Meyer","Rice","Schmidt","Garza","Daniels","Ferguson","Nichols","Stephens","Soto","Weaver","Ryan","Gardner","Payne","Grant","Dunn","Kelley","Spencer","Hawkins","Arnold","Pierce","Vazquez","Hansen","Peters","Santos","Hart","Bradley","Knight","Elliott","Cunningham","Duncan","Armstrong","Hudson","Carroll","Lane","Riley","Andrews","Alvarado","Ray","Delgado","Berry","Perkins","Hoffman","Johnston","Matthews","Pena","Richards","Contreras","Willis","Carpenter","Lawrence","Sandoval","Guerrero","George","Chapman","Rios","Estrada","Ortega","Watkins"];
        const cities = ["Phoenix","San Antonio","Dallas","Austin","Jacksonville","Fort Worth","Columbus","Charlotte","Indianapolis","San Francisco","Seattle","Denver","Washington","Boston","El Paso","Nashville","Detroit","Oklahoma City","Portland","Las Vegas","Memphis","Louisville","Baltimore","Milwaukee","Albuquerque","Tucson","Fresno","Sacramento","Mesa","Kansas City","Atlanta","Long Beach","Colorado Springs","Raleigh","Miami","Virginia Beach","Omaha","Oakland","Minneapolis","Tulsa","Arlington","New Orleans","Wichita","Cleveland","Tampa","Bakersfield","Aurora","Honolulu","Anaheim","Lexington","Stockton","Henderson","Corpus Christi","Riverside","Santa Ana","Orlando","Irvine","Cincinnati","Newark","Saint Paul","Pittsburgh","Greensboro","Lincoln","Durham","Jersey City","Plano","St. Louis","Madison","Chandler","Buffalo","Laredo","Lubbock","Scottsdale","Reno","Glendale","Gilbert","Winston–Salem","North Las Vegas","Norfolk","Chesapeake","Garland","Irving","Hialeah","Fremont","Boise","Richmond","Baton Rouge","Spokane","Des Moines","Tacoma","San Bernardino","Modesto","Fontana","Santa Clarita","Birmingham","Oxnard","Fayetteville","Moreno Valley","Rochester","Glendale","Huntington Beach","Salt Lake City","Grand Rapids","Amarillo","Yonkers","Aurora","Montgomery","Akron","Little Rock","Huntsville","Augusta","Tempe","Overland Park","Grand Prairie","Sunrise Manor","Waco","Jackson","Topeka"];
        const states = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
        const statuses = ["ACTIVE","FLAGGED","TIER-1","TIER-2","WATCH","PENDING","VERIFIED","QUIET","MOBILIZE","REVIEW"];
        let html = "";
        const target = state.discovered >= 10 ? 800 : 300;
        for (let i = 0; i < target; i++) {
          const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
          const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
          const city = cities[Math.floor(Math.random() * cities.length)];
          const state2 = states[Math.floor(Math.random() * states.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const id = String(Math.floor(Math.random() * 9000000 + 1000000));
          html += `<div>${id} · ${ln}, ${fn[0]}. · ${city}, ${state2} · <span style="color:#ff5050">${status}</span></div>`;
        }
        list.innerHTML = html;
        if (state.discovered >= 15) {
          setInterval(() => {
            const lines = list.querySelectorAll("div");
            const i = Math.floor(Math.random() * lines.length);
            const colors = ["#ff5050", "#ff8030", "#ffaa00", "#ff0040"];
            lines[i].style.color = colors[Math.floor(Math.random() * colors.length)];
            setTimeout(() => (lines[i].style.color = ""), 1500);
          }, 600);
        }
      }
    }

    // Fragment collection
    document.querySelectorAll("[data-fragment]").forEach((el) => {
      const f = el.getAttribute("data-fragment");
      if (state.fragments.has(f)) {
        el.classList.add("collected");
        el.textContent = f + " ✓";
        el.style.cursor = "default";
      }
      el.addEventListener("click", () => {
        if (state.fragments.has(f)) return;
        state.fragments.add(f);
        el.classList.add("collected");
        el.textContent = f + " ✓";
        state.discovered = state.visited.size + state.fragments.size + state.passwords.size;
        save();
        applyReveal();
        renderDiscoveryCounter();
        updateObjectives();
        renderObjectivesPanel();
        emitMessage("fragment", `fragment collected: ${f}`);
      });
    });

    // Cipher check
    if (document.getElementById("cipher-input")) {
      document.getElementById("cipher-input").addEventListener("input", (e) => {
        const v = e.target.value.toLowerCase().trim();
        if (v === "the project is still running" || v === "mirror" || v === "the list is real") {
          state.passwords.add("cipher");
          state.fragments.add("cipher-decoded");
          state.discovered = state.visited.size + state.fragments.size + state.passwords.size;
          save();
          applyReveal();
          renderDiscoveryCounter();
          updateObjectives();
          renderObjectivesPanel();
          const msg = document.getElementById("cipher-msg");
          if (msg) msg.innerHTML = `<span style="color:var(--thread-green)">✓ decoded. fragment collected.</span>`;
        }
      });
    }
  }

  // ============================================
  // CONSOLE MESSAGES
  // ============================================
  function emitMessage(type, text) {
    const key = type + ":" + text;
    if (state.seenMessages.has(key)) return;
    state.seenMessages.add(key);
    save();
    const colors = {
      anomaly: "color: #d4a017; font-family: monospace;",
      fragment: "color: #27ae60; font-family: monospace;",
      objective: "color: #0066cc; font-family: monospace;",
      signal: "color: #c0392b; font-family: monospace; font-weight: bold;",
      warning: "color: #c0392b; background: #000; padding: 4px; font-family: monospace;",
    };
    console.log("%c[HELIX-SYS] " + text, colors[type] || colors.anomaly);
  }

  // ============================================
  // RIDDLES — UI handler
  // ============================================
  function setupRiddles() {
    document.querySelectorAll(".riddle").forEach((el) => {
      const id = el.getAttribute("data-riddle");
      const riddle = RIDDLES[id];
      if (!riddle) return;

      const solved = localStorage.getItem(K.riddlesSolved + ":" + id) === "1";

      el.innerHTML = `
        <div class="riddle-frame">
          <div class="riddle-label">[ RIDDLE — TRIGGERED ]</div>
          <div class="riddle-prompt">${riddle.prompt}</div>
          ${riddle.hint ? `<div class="riddle-hint">${riddle.hint}</div>` : ""}
          <form class="riddle-form" autocomplete="off">
            <input type="text" class="riddle-input" placeholder="..." autocomplete="off" />
            <button type="submit" class="riddle-btn">answer</button>
          </form>
          <div class="riddle-msg"></div>
        </div>
      `;

      const form = el.querySelector(".riddle-form");
      const input = el.querySelector(".riddle-input");
      const msg = el.querySelector(".riddle-msg");

      if (solved) {
        msg.innerHTML = `<span class="riddle-solved">✓ solved. fragment: <code>${riddle.fragment}</code></span>`;
        input.disabled = true;
        el.querySelector(".riddle-btn").disabled = true;
        el.querySelector(".riddle-btn").textContent = "✓";
      }

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const v = input.value.trim().toLowerCase();
        if (!v) return;
        if (riddle.accept.some((a) => a.toLowerCase() === v)) {
          // SOLVED
          state.fragments.add(riddle.fragment);
          state.discovered = state.visited.size + state.fragments.size + state.passwords.size;
          localStorage.setItem(K.riddlesSolved + ":" + id, "1");
          save();
          applyReveal();
          renderDiscoveryCounter();
          updateObjectives();
          renderObjectivesPanel();
          msg.innerHTML = `<span class="riddle-solved">✓ solved. fragment: <code>${riddle.fragment}</code></span>`;
          input.disabled = true;
          el.querySelector(".riddle-btn").disabled = true;
          el.querySelector(".riddle-btn").textContent = "✓";
          // Special effects on solve
          flashElement(el, "riddle-flash-success");
          emitMessage("fragment", `riddle solved. fragment: ${riddle.fragment}`);
          triggerBoom({ intensity: 0.5, duration: 1200 });
        } else {
          // WRONG
          const wrong = riddle.misdirect[Math.floor(Math.random() * riddle.misdirect.length)];
          msg.innerHTML = `<span class="riddle-wrong">✗ ${wrong}</span>`;
          flashElement(el, "riddle-flash-fail");
          input.value = "";
          input.focus();
        }
      });
    });
  }

  function flashElement(el, cls) {
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 700);
  }

  // ============================================
  // THE BOOM — climax animation
  // ============================================
  // Reusable — used by riddle solve (light) and truth.html arrival (full)
  function triggerBoom(opts) {
    opts = opts || {};
    const intensity = opts.intensity != null ? opts.intensity : 1;
    const duration = opts.duration != null ? opts.duration : 2400;
    const overlay = document.createElement("div");
    overlay.className = "boom-overlay";
    overlay.style.setProperty("--boom-intensity", String(intensity));
    overlay.style.setProperty("--boom-duration", duration + "ms");
    overlay.innerHTML = `
      <div class="boom-text">2,304,891</div>
      <div class="boom-stamp">MIRROR</div>
      <div class="boom-bar"><div class="boom-bar-fill"></div></div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), duration + 400);
  }

  // ============================================
  // THE CLIMAX — first visit to truth.html
  // ============================================
  function setupTruthClimax() {
    if (fullPath !== "mirror/truth.html" && fullPath !== "mirror/truth.html/") return;
    if (localStorage.getItem(K.truthSeen) === "1") return;

    // First time on the truth page
    const veil = document.createElement("div");
    veil.className = "truth-veil";
    veil.innerHTML = `
      <div class="truth-veil-content">
        <div class="truth-veil-line">READING THE DOCUMENT</div>
        <div class="truth-veil-bar"><div class="truth-veil-fill"></div></div>
        <div class="truth-veil-status">verifying the source</div>
        <div class="truth-veil-num">2,304,891</div>
      </div>
    `;
    document.body.appendChild(veil);

    // Phase 1: 0-1500ms — building tension
    setTimeout(() => {
      veil.querySelector(".truth-veil-status").textContent = "the file is open. the file is 47,318 lines long.";
    }, 800);
    setTimeout(() => {
      veil.querySelector(".truth-veil-status").textContent = "verifying the signature.  signature is valid.";
    }, 1800);

    // Phase 2: 2400ms — the BOOM
    setTimeout(() => {
      document.body.classList.add("boom-flash");
      veil.classList.add("boom-fade");
      setTimeout(() => {
        document.body.classList.remove("boom-flash");
      }, 200);
    }, 2400);

    // Phase 3: 2900ms — number storm + stamp
    setTimeout(() => {
      const storm = document.createElement("div");
      storm.className = "number-storm";
      document.body.appendChild(storm);
      // Spawn 60 numbers across the screen
      for (let i = 0; i < 60; i++) {
        const span = document.createElement("span");
        span.className = "ns-num";
        const v = Math.floor(Math.random() * 2304891);
        span.textContent = v.toLocaleString();
        span.style.left = (Math.random() * 100) + "vw";
        span.style.top = (Math.random() * 100) + "vh";
        span.style.animationDelay = (Math.random() * 1.2) + "s";
        span.style.fontSize = (10 + Math.random() * 40) + "px";
        span.style.color = ["#ff0040", "#ff8030", "#ffaa00", "#c0392b", "#ffffff"][Math.floor(Math.random() * 5)];
        storm.appendChild(span);
      }
      setTimeout(() => storm.remove(), 3200);
    }, 2900);

    // Phase 4: 5400ms — reveal content
    setTimeout(() => {
      veil.remove();
      localStorage.setItem(K.truthSeen, "1");
      // Subtle reveal flash
      const f = document.createElement("div");
      f.style.cssText = "position:fixed;inset:0;background:#fff;z-index:99998;pointer-events:none;opacity:0.7;transition:opacity 1.2s;";
      document.body.appendChild(f);
      setTimeout(() => f.style.opacity = "0", 50);
      setTimeout(() => f.remove(), 1500);
      emitMessage("warning", "you have read the truth. the watching has stopped.");
    }, 5400);
  }

  // ============================================
  // THE FINAL MESSAGE — last screen on end.html
  // ============================================
  function setupFinalMessage() {
    if (fullPath !== "end.html" && fullPath !== "end.html/") return;
    if (localStorage.getItem(K.endSeen) === "1") return;

    // After the existing end content, append a final-message block
    setTimeout(() => {
      const main = document.querySelector("main") || document.body;
      const fm = document.createElement("section");
      fm.className = "final-message";
      fm.innerHTML = `
        <div class="final-fade">
          <p class="final-line final-1">the watching has stopped</p>
          <p class="final-line final-2">the file is closed</p>
          <p class="final-line final-3">the backup is, in the formal sense, intact</p>
          <p class="final-line final-4 final-quiet">— — —</p>
          <p class="final-line final-5 final-personal">
            for whoever you are, reading this late:<br>
            you are not, in the practical sense, the person who started.<br>
            that is, in the moral sense, the only thing they could not destroy.
          </p>
          <p class="final-line final-6 final-sig">— e.v.</p>
        </div>
      `;
      main.appendChild(fm);
      localStorage.setItem(K.endSeen, "1");
    }, 1200);
  }

  // ============================================
  // MISLEADING THEATER — wrong-password animation
  // ============================================
  function setupArchiveTheater() {
    const form = document.getElementById("archiveForm");
    if (!form) return;
    // We replace the form's submit behavior with a "decrypting" theater
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const v = document.getElementById("archiveKey").value.trim();
      const msg = document.getElementById("archiveMsg");
      const passwords = ["mirror", "MIRROR", "2.3M", "2334891", "vasquez", "EV2417", "ev2417", "the system", "the project", "still running"];
      if (passwords.includes(v)) {
        // REAL success — short, decisive
        msg.innerHTML = `<span style="color:var(--thread-green)">access granted.</span>`;
        sessionStorage.setItem(K.archiveUnlocked, "1");
        state.passwords.add("mirror");
        state.passwords.add("archive");
        state.threads.add("red");
        save();
        setTimeout(() => location.reload(), 600);
      } else {
        // MISLEADING THEATER
        msg.innerHTML = `<span style="color:var(--c-muted)">verifying...</span>`;
        const stages = [
          "verifying the signature",
          "checking the hash",
          "loading the keyfile",
          "decrypting the outer layer",
          "decrypting the inner layer",
          "verifying decryption",
          "preparing the payload",
        ];
        let i = 0;
        const ticker = setInterval(() => {
          i++;
          if (i < stages.length) {
            msg.innerHTML = `<span style="color:var(--c-muted)">${stages[i]}...</span>`;
          } else {
            clearInterval(ticker);
            msg.innerHTML = `<span style="color:var(--c-danger)">DECRYPTION FAILED · 99% complete · signal logged</span>`;
            const attempts = document.getElementById("attempts");
            if (attempts) attempts.textContent = String((parseInt(attempts.textContent, 10) || 0) + 1);
            state.discovered = state.visited.size + state.fragments.size + state.passwords.size + 1;
            save();
            applyReveal();
            renderDiscoveryCounter();
            document.getElementById("archiveKey").value = "";
          }
        }, 220);
      }
    }, true);  // capture phase — runs before the original handler
  }

  // ============================================
  // AMBIENT EFFECTS — corner glitches, whispers
  // ============================================
  function setupAmbient() {
    // Skip on heavy pages
    if (fullPath.endsWith("/mirror/truth.html") || fullPath.endsWith("/end.html")) return;

    // Periodic corner glitch — every 45-90 seconds, show a small flicker
    const scheduleNext = () => {
      const delay = 45000 + Math.random() * 45000;
      setTimeout(() => {
        showCornerGlitch();
        scheduleNext();
      }, delay);
    };
    scheduleNext();

    // First-time visitor message
    if (state.discovered >= 1 && !state.seenMessages.has("welcome-corner")) {
      setTimeout(() => showCornerGlitch("welcome"), 8000);
      state.seenMessages.add("welcome-corner");
    }
  }

  function showCornerGlitch(kind) {
    const g = document.createElement("div");
    g.className = "corner-glitch";
    const messages = {
      welcome: "welcome. the system is watching.",
      default: [
        "the system is, in the formal sense, still running.",
        "the threads are visible.",
        "the threshold was lowered. you should know that.",
        "2,304,891 names. you know this number.",
        "the backup is intact. for now.",
        "the auditor found the threshold change. the auditor was terminated.",
        "the federal client does not know you are here. the federal client does not know anything, in the practical sense.",
        "the watching has stopped. the watching has, in the formal sense, not stopped.",
      ],
    };
    const text = kind === "welcome"
      ? messages.welcome
      : messages.default[Math.floor(Math.random() * messages.default.length)];
    g.textContent = text;
    document.body.appendChild(g);
    setTimeout(() => g.classList.add("show"), 50);
    setTimeout(() => g.classList.remove("show"), 6500);
    setTimeout(() => g.remove(), 7500);
  }

  // ============================================
  // NUMBER COUNTER — on helena/final.html, counts up
  // ============================================
  function setupNumberStorm() {
    const target = document.getElementById("number-storm-target");
    if (!target) return;
    const final = 2304891;
    const duration = 22000;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const e = 1 - Math.pow(1 - t, 3);
      const v = Math.floor(e * final);
      target.textContent = v.toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
      else target.textContent = final.toLocaleString();
    };
    requestAnimationFrame(tick);
  }

  // ============================================
  // PHANTOM PASSWORD — when player gets the right answer
  // the system "almost" accepts it, then doubles down
  // ============================================
  // (Wired inline in the riddle handler above)

  // ============================================
  // RESET
  // ============================================
  window.__resetEndlessInternet = function () {
    Object.values(K).forEach((k) => localStorage.removeItem(k));
    Object.keys(localStorage).filter(k => k.startsWith("endless_internet_riddles_solved:")).forEach(k => localStorage.removeItem(k));
    sessionStorage.removeItem(K.archiveUnlocked);
    location.reload();
  };

  // ============================================
  // KONAMI
  // ============================================
  function setupKonami() {
    const code = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    let pos = 0;
    document.addEventListener("keydown", function (e) {
      if (e.keyCode === code[pos]) {
        pos++;
        if (pos === code.length) {
          pos = 0;
          state.fragments.add("konami");
          state.discovered = state.visited.size + state.fragments.size + state.passwords.size;
          save();
          applyReveal();
          renderDiscoveryCounter();
          updateObjectives();
          renderObjectivesPanel();
          const flash = document.createElement("div");
          flash.style.cssText = "position:fixed;inset:0;background:#fff;z-index:99999;pointer-events:none;";
          document.body.appendChild(flash);
          setTimeout(() => flash.remove(), 400);
          emitMessage("warning", "KONAMI DETECTED. +1 fragment. (the easter egg is real this time.)");
        }
      } else {
        pos = 0;
      }
    });
  }

  // ============================================
  // INIT
  // ============================================
  applyReveal();
  updateObjectives();
  renderThreadBar();
  renderObjectivesPanel();
  renderDiscoveryCounter();
  checkArchiveAccess();
  applyArchiveGate();
  setupArchiveTheater();  // run AFTER applyArchiveGate (capture phase)
  pageBehaviors();
  setupKonami();
  setupRiddles();
  setupNumberStorm();
  setupTruthClimax();
  setupFinalMessage();
  setupAmbient();
  save();

  // Emit discovery messages for current state
  if (state.discovered >= 1) emitMessage("anomaly", "anomalous access pattern. the system is noticing you.");
  if (state.discovered >= 5) emitMessage("anomaly", "the threads are visible. follow them.");
  if (state.discovered >= 10) emitMessage("signal", "you have crossed the threshold. continue.");
  if (state.discovered >= 20) emitMessage("warning", "you are close to the truth. or the truth is close to you.");

  // Expose for debug
  window.__endlessState = state;
  window.__endlessThreads = THREADS;
  window.__endlessObjectives = OBJECTIVES;
})();
