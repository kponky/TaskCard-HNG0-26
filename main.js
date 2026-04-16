function icon(id, size = 12) {
  return `<svg class="pill-icon" width="${size}" height="${size}" aria-hidden="true"><use href="#${id}"/></svg>`;
}
function svgUse(id, size = 13, cls = "") {
  return `<svg width="${size}" height="${size}" class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
}

const H = 3600000,
  D = 86400000,
  NOW = Date.now();


  let tasks = [
  {
    id: "t1",
    title: "Stage 0 (Video) Self-recorded Introduction Video",
    description:
      "Create a 60–120 second intro video introducing yourself, your interests, and passions. Ensure clear presentation, engaging storytelling, smooth editing, subtitles, and clean audio.",
    priority: "high",
    status: "todo",
    dueDate: new Date("2026-04-13T23:59:00"),
    tags: ["Video", "Editing", "Storytelling"],
    completed: false,
  },
  {
    id: "t2",
    title: "Stage 0 (Frontend) Build a Testable Todo Item Card",
    description:
      "Build a high-fidelity, interactive task card UI with proper semantics, accessibility, and test IDs. Include dynamic due dates, time tracking, and clean design.",
    priority: "high",
    status: "in-progress",
    dueDate: new Date("2026-04-16T23:59:00"),
    tags: ["Frontend", "UI", "React", "Accessibility"],
    completed: false,
  },
  {
    id: "t3",
    title: "Stage 0 (DevOps) Linux Server Setup & Nginx Configuration",
    description:
      "Provision a Linux server, configure Nginx to serve static HTML and API endpoint, secure with SSL, enforce HTTPS, and implement proper server security practices.",
    priority: "high",
    status: "todo",
    dueDate: new Date("2026-04-13T23:59:00"),
    tags: ["DevOps", "Linux", "Nginx", "Security"],
    completed: false,
  },
];
// let tasks = [
//   {
//     id: "t1",
//     title: "Launch redesigned onboarding flow",
//     description:
//       "Coordinate with design and engineering to ship the new 3-step onboarding. Ensure analytics events fire correctly before going live.",
//     priority: "high",
//     status: "in-progress",
//     dueDate: new Date(NOW + 2 * D + 3 * H),
//     tags: ["Design", "Engineering", "Onboarding"],
//     completed: false,
//   },
//   {
//     id: "t2",
//     title: "Write Q2 investor update",
//     description:
//       "Summarize growth metrics, key milestones, and roadmap highlights for the board deck.",
//     priority: "medium",
//     status: "todo",
//     dueDate: new Date(NOW + 5 * D),
//     tags: ["Strategy", "Writing"],
//     completed: false,
//   },
//   {
//     id: "t3",
//     title: "Fix critical auth regression",
//     description:
//       "Users on Safari 17 are being logged out after 60 seconds. Trace session cookie expiry logic and patch before next release.",
//     priority: "high",
//     status: "blocked",
//     dueDate: new Date(NOW - 4 * H),
//     tags: ["Bug", "Backend"],
//     completed: false,
//   },
//   {
//     id: "t4",
//     title: "Set up CI/CD pipeline for mobile",
//     description:
//       "Configure GitHub Actions for iOS and Android builds with automated TestFlight distribution.",
//     priority: "low",
//     status: "todo",
//     dueDate: new Date(NOW + 10 * D),
//     tags: ["DevOps", "Mobile"],
//     completed: false,
//   },
// ];


let filter = "all",
  nextId = 20;

const MON = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function fmtDue(d) {
  return `Due ${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function isoDate(d) {
  return d.toISOString().split("T")[0];
}
function fmtRemaining(d, done) {
  if (done) return { label: "Completed", cls: "done", ico: "ic-done" };
  const diff = d - Date.now(),
    abs = Math.abs(diff);
  const mins = Math.floor(abs / 60000),
    hrs = Math.floor(abs / 3600000),
    days = Math.floor(abs / 86400000);
  if (diff < 0) {
    const label =
      mins < 60
        ? `Overdue by ${mins}m`
        : hrs < 24
          ? `Overdue by ${hrs}h`
          : days === 1
            ? "Overdue by 1 day"
            : `Overdue by ${days} days`;
    return { label, cls: "overdue", ico: "ic-overdue" };
  }
  if (mins < 60)
    return { label: `Due in ${mins}m`, cls: "soon", ico: "ic-clock" };
  if (hrs < 24)
    return { label: `Due in ${hrs}h`, cls: "soon", ico: "ic-clock" };
  if (days === 1)
    return { label: "Due tomorrow", cls: "soon", ico: "ic-clock" };
  if (days <= 3)
    return { label: `Due in ${days} days`, cls: "soon", ico: "ic-clock" };
  return { label: `Due in ${days} days`, cls: "future", ico: "ic-clock" };
}

const PRCONF = {
  high: { label: "High", cls: "pr-high", ico: "ic-high", bar: "#ff5757" },
  medium: {
    label: "Medium",
    cls: "pr-medium",
    ico: "ic-medium",
    bar: "#ff9500",
  },
  low: { label: "Low", cls: "pr-low", ico: "ic-low", bar: "#00b87c" },
};
const STCONF = {
  todo: { label: "To Do", cls: "st-todo", ico: "ic-todo" },
  "in-progress": {
    label: "In Progress",
    cls: "st-in-progress",
    ico: "ic-inprogress",
  },
  done: { label: "Done", cls: "st-done", ico: "ic-done" },
  blocked: { label: "Blocked", cls: "st-blocked", ico: "ic-blocked" },
};

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pillHtml(dispId, conf, testid) {
  return `<div class="pill-display ${conf.cls}" data-testid="${testid}" id="${dispId}">
    ${icon(conf.ico, 12)}
    ${conf.label}
    ${svgUse("ic-caret", 10, "pill-caret")}
  </div>`;
}

function makeCard(task) {
  const art = document.createElement("article");
  art.className = "todo-card" + (task.completed ? " completed" : "");
  art.dataset.testid = "test-todo-card";
  art.dataset.id = task.id;
  art.setAttribute("role", "listitem");
  art.setAttribute("aria-label", "Task: " + task.title);

  const pr = PRCONF[task.priority];
  const st = STCONF[task.status];
  const {
    label: trLabel,
    cls: trCls,
    ico: trIco,
  } = fmtRemaining(task.dueDate, task.completed);
  const cbId = "cb-" + task.id;
  const prDispId = "pr-" + task.id;
  const stDispId = "st-" + task.id;

  art.innerHTML = `
<div class="card-topbar" style="background:${pr.bar}"></div>
<div class="card-inner">
  <div class="del-overlay" role="dialog" aria-modal="true" aria-label="Confirm delete">
    <div class="del-icon">
      <svg width="22" height="22" aria-hidden="true"><use href="#ic-trash"/></svg>
    </div>
    <p>Delete this task?</p>
    <small>This action cannot be undone.</small>
    <div class="del-btns">
      <button class="btn-cancel-del" data-a="cdel">
        <svg width="13" height="13" aria-hidden="true"><use href="#ic-caret" style="transform:rotate(90deg)"/></svg>
        Cancel
      </button>
      <button class="btn-confirm-del" data-a="del">
        <svg width="13" height="13" aria-hidden="true"><use href="#ic-trash"/></svg>
        Yes, Delete
      </button>
    </div>
  </div>
 
  <div class="card-top">
    <div class="cb-wrap">
      <label for="${cbId}">
        <span class="sr-only">Mark "${esc(task.title)}" as complete</span>
        <input type="checkbox" class="todo-cb" id="${cbId}"
          data-testid="test-todo-complete-toggle"
          aria-label="Mark task as complete"
          ${task.completed ? "checked" : ""}/>
      </label>
    </div>
    <div class="card-body">
      <h3 class="todo-title" data-testid="test-todo-title">${esc(task.title)}</h3>
      <p class="todo-desc" data-testid="test-todo-description">${esc(task.description)}</p>
    </div>
    <div class="card-actions" role="group" aria-label="Task actions">
      <button class="edit-btn" data-testid="test-todo-edit-button" data-a="edit" aria-label="Edit task" title="Edit task">
        <svg width="14" height="14" aria-hidden="true"><use href="#ic-edit"/></svg>
      </button>
      <button class="delete-btn" data-testid="test-todo-delete-button" data-a="delbtn" aria-label="Delete task" title="Delete task">
        <svg width="14" height="14" aria-hidden="true"><use href="#ic-trash"/></svg>
      </button>
    </div>
  </div>
 
  <div class="edit-hint" aria-live="polite">
    <svg width="13" height="13" aria-hidden="true"><use href="#ic-keyboard"/></svg>
    Enter to save · Esc to cancel
  </div>
 
  <div class="pill-group">
    <div class="pill-select" title="Click to change priority">
      ${pillHtml(prDispId, pr, "test-todo-priority")}
      <select data-a="pr-sel" aria-label="Change priority">
        <option value="high"   ${task.priority === "high" ? "selected" : ""}>High</option>
        <option value="medium" ${task.priority === "medium" ? "selected" : ""}>Medium</option>
        <option value="low"    ${task.priority === "low" ? "selected" : ""}>Low</option>
      </select>
    </div>
    <div class="pill-select" title="Click to change status">
      ${pillHtml(stDispId, st, "test-todo-status")}
      <select data-a="st-sel" aria-label="Change status">
        <option value="todo"        ${task.status === "todo" ? "selected" : ""}>To Do</option>
        <option value="in-progress" ${task.status === "in-progress" ? "selected" : ""}>In Progress</option>
        <option value="done"        ${task.status === "done" ? "selected" : ""}>Done</option>
        <option value="blocked"     ${task.status === "blocked" ? "selected" : ""}>Blocked</option>
      </select>
    </div>
 
    <span class="meta-spacer"></span>
 
    <time class="todo-due-date" data-testid="test-todo-due-date"
      datetime="${isoDate(task.dueDate)}" aria-label="${fmtDue(task.dueDate)}">
      <svg width="11" height="11" aria-hidden="true"><use href="#ic-cal"/></svg>
      ${fmtDue(task.dueDate)}
    </time>
 
    <time class="todo-time-remaining ${trCls}" data-testid="test-todo-time-remaining"
      datetime="${isoDate(task.dueDate)}" aria-live="polite" aria-label="${trLabel}">
      <svg width="11" height="11" aria-hidden="true"><use href="#${trIco}"/></svg>
      ${trLabel}
    </time>
  </div>
 
  <ul class="todo-tags" data-testid="test-todo-tags" role="list" aria-label="Tags"></ul>
</div>`;

  // Render tags with icon
  const ul = art.querySelector('[data-testid="test-todo-tags"]');
  task.tags.forEach((tag) => {
    const li = document.createElement("li");
    li.setAttribute(
      "data-testid",
      "test-todo-tag-" + tag.toLowerCase().replace(/\s+/g, "-"),
    );
    li.setAttribute("role", "listitem");
    li.innerHTML = `<svg width="10" height="10" aria-hidden="true"><use href="#ic-tag"/></svg>${esc(tag)}`;
    ul.appendChild(li);
  });

  wireCard(art, task);
  return art;
}

/* ═══ WIRE CARD ═══════════════════════════════════ */
function wireCard(art, task) {
  // Checkbox
  const cb = art.querySelector('[data-testid="test-todo-complete-toggle"]');
  cb.addEventListener("change", () => {
    task.completed = cb.checked;
    art.classList.toggle("completed", task.completed);
    refreshTime(art, task);
    updateStats();
    showToast(task.completed ? "Task completed" : "Task reopened", "ic-done");
  });

  // Priority select
  const prSel = art.querySelector('[data-a="pr-sel"]');
  prSel.addEventListener("change", () => {
    task.priority = prSel.value;
    const pr = PRCONF[task.priority];
    const disp = art.querySelector("#pr-" + task.id);
    disp.className = "pill-display " + pr.cls;
    disp.innerHTML = `${icon(pr.ico, 12)}${pr.label}${svgUse("ic-caret", 10, "pill-caret")}`;
    art.querySelector(".card-topbar").style.background = pr.bar;
    updateStats();
    showToast("Priority → " + pr.label, "ic-" + task.priority);
  });

  // Status select function 
  const stSel = art.querySelector('[data-a="st-sel"]');
  stSel.addEventListener("change", () => {
    task.status = stSel.value;
    const st = STCONF[task.status];
    const disp = art.querySelector("#st-" + task.id);
    disp.className = "pill-display " + st.cls;
    disp.innerHTML = `${icon(st.ico, 12)}${st.label}${svgUse("ic-caret", 10, "pill-caret")}`;
    updateStats();
    showToast(
      "Status → " + st.label,
      "ic-" + task.status.replace("in-progress", "inprogress"),
    );
  });

  // Edit
  const editBtn = art.querySelector('[data-a="edit"]');
  const titleEl = art.querySelector('[data-testid="test-todo-title"]');
  const descEl = art.querySelector('[data-testid="test-todo-description"]');
  const hint = art.querySelector(".edit-hint");
  let editing = false,
    savedT = task.title,
    savedD = task.description;
  function enterEdit() {
    editing = true;
    editBtn.classList.add("active");
    hint.classList.add("visible");
    titleEl.contentEditable = "true";
    descEl.contentEditable = "true";
    titleEl.focus();
    const r = document.createRange();
    r.selectNodeContents(titleEl);
    r.collapse(false);
    const s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }
  function exitEdit(save) {
    editing = false;
    editBtn.classList.remove("active");
    hint.classList.remove("visible");
    titleEl.contentEditable = "false";
    descEl.contentEditable = "false";
    if (save) {
      const nt = titleEl.textContent.trim(),
        nd = descEl.textContent.trim();
      if (nt) {
        task.title = nt;
        savedT = nt;
      } else titleEl.textContent = savedT;
      task.description = nd;
      savedD = nd;
      art.setAttribute("aria-label", "Task: " + task.title);
      showToast("Task saved", "ic-done");
    } else {
      titleEl.textContent = savedT;
      descEl.textContent = savedD;
    }
  }
  editBtn.addEventListener("click", () =>
    editing ? exitEdit(true) : enterEdit(),
  );
  art.addEventListener("keydown", (e) => {
    if (!editing) return;
    if (e.key === "Escape") {
      e.preventDefault();
      exitEdit(false);
    }
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      document.activeElement === titleEl
    ) {
      e.preventDefault();
      exitEdit(true);
    }
  });

  // Delete function 
  const overlay = art.querySelector(".del-overlay");
  art.querySelector('[data-a="delbtn"]').addEventListener("click", () => {
    overlay.classList.add("visible");
    art.querySelector('[data-a="cdel"]').focus();
  });
  art
    .querySelector('[data-a="cdel"]')
    .addEventListener("click", () => overlay.classList.remove("visible"));
  art.querySelector('[data-a="del"]').addEventListener("click", () => {
    overlay.classList.remove("visible");
    art.classList.add("removing");
    setTimeout(() => {
      tasks = tasks.filter((t) => t.id !== task.id);
      renderAll();
      showToast("Task deleted", "ic-trash");
    }, 380);
  });
  art.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("visible"))
      overlay.classList.remove("visible");
  });
}

function refreshTime(art, task) {
  const tr = art.querySelector('[data-testid="test-todo-time-remaining"]');
  if (!tr) return;
  const { label, cls, ico } = fmtRemaining(task.dueDate, task.completed);
  tr.innerHTML = `<svg width="11" height="11" aria-hidden="true"><use href="#${ico}"/></svg>${label}`;
  tr.className = `todo-time-remaining ${cls}`;
  tr.setAttribute("aria-label", label);
}

function updateStats() {
  document.getElementById("st-todo").textContent = tasks.filter(
    (t) => t.status === "todo",
  ).length;
  document.getElementById("st-prog").textContent = tasks.filter(
    (t) => t.status === "in-progress",
  ).length;
  document.getElementById("st-done").textContent = tasks.filter(
    (t) => t.status === "done",
  ).length;
  document.getElementById("st-block").textContent = tasks.filter(
    (t) => t.status === "blocked",
  ).length;
}

function renderAll() {
  const list = document.getElementById("cardList");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("taskCount");
  const filtered =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  list.innerHTML = "";
  filtered.forEach((t) => list.appendChild(makeCard(t)));
  count.textContent = `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`;
  empty.style.display = filtered.length === 0 ? "block" : "none";
  updateStats();
}

setInterval(() => {
  document.querySelectorAll('[data-testid="test-todo-card"]').forEach((art) => {
    const t = tasks.find((x) => x.id === art.dataset.id);
    if (t) refreshTime(art, t);
  });
}, 45000);

document.querySelector(".filter-row").addEventListener("click", (e) => {
  const b = e.target.closest(".fbtn");
  if (!b) return;
  document
    .querySelectorAll(".fbtn")
    .forEach((x) => x.classList.remove("active"));
  b.classList.add("active");
  filter = b.dataset.filter;
  renderAll();
});

const modalBg = document.getElementById("modalBg");
const pad = (n) => String(n).padStart(2, "0");
function openModal() {
  const t = new Date(Date.now() + 86400000);
  t.setHours(12, 0, 0, 0);
  document.getElementById("f-due").value =
    `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}T${pad(t.getHours())}:${pad(t.getMinutes())}`;
  ["f-title", "f-desc", "f-tags"].forEach(
    (id) => (document.getElementById(id).value = ""),
  );
  document.getElementById("f-priority").value = "medium";
  document.getElementById("f-status").value = "todo";
  document
    .querySelectorAll(".field input,.field textarea")
    .forEach((el) => el.classList.remove("invalid"));
  modalBg.classList.add("open");
  setTimeout(() => document.getElementById("f-title").focus(), 60);
}
function closeModal() {
  modalBg.classList.remove("open");
  document.getElementById("openModal").focus();
}
document.getElementById("openModal").addEventListener("click", openModal);
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelModal").addEventListener("click", closeModal);
modalBg.addEventListener("click", (e) => {
  if (e.target === modalBg) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalBg.classList.contains("open")) closeModal();
});

document.getElementById("submitTask").addEventListener("click", () => {
  const ti = document.getElementById("f-title");
  const di = document.getElementById("f-due");
  let ok = true;
  if (!ti.value.trim()) {
    ti.classList.add("invalid");
    ti.focus();
    ok = false;
  } else ti.classList.remove("invalid");
  if (!di.value) {
    di.classList.add("invalid");
    if (ok) di.focus();
    ok = false;
  } else di.classList.remove("invalid");
  if (!ok) {
    showToast("Please fill required fields", "ic-overdue");
    return;
  }
  const tags = document
    .getElementById("f-tags")
    .value.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  tasks.unshift({
    id: "t" + ++nextId,
    title: ti.value.trim(),
    description: document.getElementById("f-desc").value.trim(),
    priority: document.getElementById("f-priority").value,
    status: document.getElementById("f-status").value,
    dueDate: new Date(di.value),
    tags: tags.length ? tags : ["General"],
    completed: false,
  });
  filter = "all";
  document
    .querySelectorAll(".fbtn")
    .forEach((b) => b.classList.toggle("active", b.dataset.filter === "all"));
  closeModal();
  renderAll();
  showToast("New task added", "ic-done");
});


let toastT;
function showToast(msg, ico = "") {
  const el = document.getElementById("toast");
  el.innerHTML = ico
    ? `<svg width="14" height="14" aria-hidden="true"><use href="#${ico}"/></svg>${msg}`
    : msg;
  el.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove("show"), 2600);
}

renderAll();
