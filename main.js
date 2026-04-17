
//  HELPERS 
function svgUse(id, size = 12, cls = "") {
  return `<svg width="${size}" height="${size}" class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
}
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDue(d) { return `Due ${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; }
function isoDate(d) { return d.toISOString().split("T")[0]; }
function toLocalDT(d) {
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

//  TIME REMAINING 
function fmtRemaining(d, isDone) {
  if (isDone) return { label: "Completed", cls: "done", ico: "ic-done" };
  const diff = d - Date.now(), abs = Math.abs(diff);
  const mins = Math.floor(abs / 60000),
        hrs  = Math.floor(abs / 3600000),
        days = Math.floor(abs / 86400000);
  if (diff < 0) {
    const label = mins < 60 ? `Overdue by ${mins}m`
                : hrs  < 24 ? `Overdue by ${hrs}h`
                : days === 1 ? "Overdue by 1 day"
                : `Overdue by ${days} days`;
    return { label, cls: "overdue", ico: "ic-overdue", overdue: true };
  }
  if (mins < 60)  return { label: `Due in ${mins}m`,   cls: "soon",   ico: "ic-clock" };
  if (hrs  < 24)  return { label: `Due in ${hrs}h`,    cls: "soon",   ico: "ic-clock" };
  if (days === 1) return { label: "Due tomorrow",       cls: "soon",   ico: "ic-clock" };
  if (days <= 3)  return { label: `Due in ${days} days`, cls: "soon", ico: "ic-clock" };
  return             { label: `Due in ${days} days`,   cls: "future", ico: "ic-clock" };
}

//  PRIORITY / STATUS CONFIG 
const PRCONF = {
  High:   { label: "High",   cls: "pr-High",   ico: "ic-high",   bar: "#ff5757" },
  Medium: { label: "Medium", cls: "pr-Medium", ico: "ic-medium", bar: "#ff9500" },
  Low:    { label: "Low",    cls: "pr-Low",    ico: "ic-low",    bar: "#00b87c" },
};
const STCONF = {
  "Pending":     { label: "Pending",     ico: "ic-pending",    segCls: "active-pending" },
  "In Progress": { label: "In Progress", ico: "ic-inprogress", segCls: "active-inprogress" },
  "Done":        { label: "Done",        ico: "ic-done",       segCls: "active-done" },
  "Blocked":     { label: "Blocked",     ico: "ic-blocked",    segCls: "active-blocked" },
};


const H = 3600000, D = 86400000, NOW = Date.now();
let tasks = [
  {
    id: "t1",
    title: "Stage 1a (Frontend) Advanced Todo Card",
    description: "Extend the Stage 0 Todo Card into a more interactive, stateful component. Add editing mode with form fields, status transitions (Pending/In Progress/Done), priority indicators, expand/collapse behavior for long descriptions, overdue detection, and live time updates every 30–60 seconds. Must meet all accessibility and responsiveness requirements.",
    priority: "High",
    status: "Pending",
    dueDate: new Date("2026-04-17T23:59:00"),
    tags: ["Frontend", "React", "Accessibility", "UI"],
    completed: false,
  },
  {
    id: "t2",
    title: "Stage 1 (Data Analytics) Data Cleaning & Title Optimization",
    description: "Clean a raw marketing dataset in Excel by handling missing values, removing duplicates, and standardizing formats. Create a new short_title feature (30–50 chars) for SEO and readability. Prepare a professional technical report documenting the cleaning process, methodology, and improvements with before/after examples.",
    priority: "High",
    status: "Pending",
    dueDate: new Date("2026-04-17T23:59:00"),
    tags: ["Data Analytics", "Excel", "Data Cleaning", "SEO"],
    completed: false,
  },
  {
    id: "t3",
    title: "Stage 1 (Product Design) Web App Redesign",
    description: "Select one product (Zoom, CD Care, PropertyPro, Jiji, or Salesforce) and redesign 4–5 core web app pages. Identify usability issues — poor layout, confusing navigation, weak visual hierarchy — and solve them with high-fidelity desktop screens. Include a before/after comparison, Figma file, and share on social media.",
    priority: "High",
    status: "Pending",
    dueDate: new Date("2026-04-18T23:59:00"),
    tags: ["Product Design", "Figma", "UX", "UI"],
    completed: false,
  },
  {
    id: "t4",
    title: "Stage 1 (Product Management) UX Audit & QA Bug Hunt",
    description: "Conduct a New User Audit on one Stage 0 app (Zedu, Deen AI, Nora, ContentQ, or Sitelytics). Map the full onboarding flow, identify 3 friction points with fixes, and hunt at least 2 bugs (functional or UX/UI logic errors). Deliver a Google Doc audit report and a Google Sheet bug report with screenshots and reproduction steps.",
    priority: "High",
    status: "Pending",
    dueDate: new Date("2026-04-17T23:59:00"),
    tags: ["Product Management", "UX Audit", "QA", "Bug Hunting"],
    completed: false,
  },
];

const COLLAPSE_THRESHOLD = 120; // chars before auto-collapsing
let filter = "all", nextId = 20;

function makeCard(task) {
  const art = document.createElement("article");
  art.className = "todo-card" + (task.completed ? " completed" : "");
  art.dataset.testid = "test-todo-card";
  art.dataset.id = task.id;
  art.dataset.priority = task.priority;
  art.setAttribute("role", "listitem");
  art.setAttribute("aria-label", "Task: " + task.title);

  const pr = PRCONF[task.priority];
  const st = STCONF[task.status];
  const tr = fmtRemaining(task.dueDate, task.completed);
  const cbId       = "cb-"   + task.id;
  const collId     = "coll-" + task.id;
  const editFormId = "ef-"   + task.id;
  const needsCollapse = task.description.length > COLLAPSE_THRESHOLD;

  art.innerHTML = `
<div class="card-topbar" style="background:${pr.bar}"></div>
<div class="card-inner">

  <!-- DELETE OVERLAY -->
  <div class="del-overlay" role="dialog" aria-modal="true" aria-label="Confirm delete">
    <div class="del-icon"><svg width="22" height="22" aria-hidden="true"><use href="#ic-trash"/></svg></div>
    <p>Delete this task?</p>
    <small>This action cannot be undone.</small>
    <div class="del-btns">
      <button class="btn-cancel-del" data-a="cdel">
        ${svgUse("ic-cancel",12)} Cancel
      </button>
      <button class="btn-confirm-del" data-a="del">
        ${svgUse("ic-trash",12)} Yes, Delete
      </button>
    </div>
  </div>

  <!-- MAIN CONTENT -->
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
      <div class="desc-wrapper">
        <div class="todo-collapsible-section ${needsCollapse ? "collapsed" : "expanded"}"
             id="${collId}"
             data-testid="test-todo-collapsible-section">
          <p class="todo-desc" data-testid="test-todo-description">${esc(task.description)}</p>
        </div>
        ${needsCollapse ? `<div class="expand-fade"></div>` : ""}
        ${needsCollapse ? `
        <button class="todo-expand-toggle"
          data-testid="test-todo-expand-toggle"
          aria-expanded="false"
          aria-controls="${collId}">
          ${svgUse("ic-expand", 11)} Show more
        </button>` : ""}
      </div>
    </div>
    <div class="card-actions" role="group" aria-label="Task actions">
      <button class="edit-btn" data-testid="test-todo-edit-button" data-a="edit" aria-label="Edit task" title="Edit">
        ${svgUse("ic-edit",14)}
      </button>
      <button class="delete-btn" data-testid="test-todo-delete-button" data-a="delbtn" aria-label="Delete task" title="Delete">
        ${svgUse("ic-trash",14)}
      </button>
    </div>
  </div>

  <!-- EDIT FORM (Stage 1a) -->
  <div class="edit-form" id="${editFormId}" data-testid="test-todo-edit-form" role="form" aria-label="Edit task form">
    <div class="ef-field">
      <label for="ef-title-${task.id}">Title *</label>
      <input type="text" id="ef-title-${task.id}" data-testid="test-todo-edit-title-input"
        value="${esc(task.title)}" maxlength="100" autocomplete="off"/>
    </div>
    <div class="ef-field">
      <label for="ef-desc-${task.id}">Description</label>
      <textarea id="ef-desc-${task.id}" data-testid="test-todo-edit-description-input"
        maxlength="600" rows="3">${esc(task.description)}</textarea>
    </div>
    <div class="ef-row">
      <div class="ef-field">
        <label for="ef-priority-${task.id}">Priority</label>
        <select id="ef-priority-${task.id}" data-testid="test-todo-edit-priority-select">
          <option value="High"   ${task.priority==="High"   ?"selected":""}>High</option>
          <option value="Medium" ${task.priority==="Medium" ?"selected":""}>Medium</option>
          <option value="Low"    ${task.priority==="Low"    ?"selected":""}>Low</option>
        </select>
      </div>
      <div class="ef-field">
        <label for="ef-due-${task.id}">Due Date &amp; Time</label>
        <input type="datetime-local" id="ef-due-${task.id}"
          data-testid="test-todo-edit-due-date-input"
          value="${toLocalDT(task.dueDate)}"/>
      </div>
    </div>
    <div class="edit-form-actions">
      <button class="btn-cancel-edit" data-a="ef-cancel" data-testid="test-todo-cancel-button">
        ${svgUse("ic-cancel",13)} Cancel
      </button>
      <button class="btn-save" data-a="ef-save" data-testid="test-todo-save-button">
        ${svgUse("ic-save",13)} Save
      </button>
    </div>
  </div>

  <!-- PILL GROUP -->
  <div class="pill-group">

    <!-- Priority Indicator (Stage 1a) -->
    <div class="priority-indicator pi-${task.priority}" data-testid="test-todo-priority-indicator">
      <span class="pi-dot"></span>
      ${task.priority}
    </div>

    <!-- Status Segmented Control (Stage 1a) -->
    <div class="status-control-wrap">
      <div class="status-control" data-testid="test-todo-status-control"
           role="group" aria-label="Task status">
        <button class="status-btn ${task.status==="Pending"     ? "active-pending"    : ""}"
          data-st="Pending"     aria-pressed="${task.status==="Pending"}">Pending</button>
        <button class="status-btn ${task.status==="In Progress" ? "active-inprogress" : ""}"
          data-st="In Progress" aria-pressed="${task.status==="In Progress"}">In Progress</button>
        <button class="status-btn ${task.status==="Done"        ? "active-done"       : ""}"
          data-st="Done"        aria-pressed="${task.status==="Done"}">Done</button>
      </div>
    </div>

    <span class="meta-spacer"></span>

    <!-- Due date -->
    <time class="todo-due-date" data-testid="test-todo-due-date"
      datetime="${isoDate(task.dueDate)}" aria-label="${fmtDue(task.dueDate)}">
      ${svgUse("ic-cal",11)} ${fmtDue(task.dueDate)}
    </time>

    <!-- Time remaining -->
    <time class="todo-time-remaining ${tr.cls}" data-testid="test-todo-time-remaining"
      datetime="${isoDate(task.dueDate)}" aria-live="polite" aria-label="${tr.label}">
      ${svgUse(tr.ico,11)} ${tr.label}
    </time>

    <!-- Overdue indicator (Stage 1a) -->
    <span class="overdue-indicator ${tr.overdue ? "visible" : ""}"
      data-testid="test-todo-overdue-indicator"
      role="status" aria-live="polite" aria-label="Task is overdue">
      ${svgUse("ic-overdue",11)} Overdue
    </span>

  </div>

  <!-- TAGS (Stage 0) -->
  <ul class="todo-tags" data-testid="test-todo-tags" role="list" aria-label="Tags"></ul>

</div>`;

  // Render tags
  const ul = art.querySelector('[data-testid="test-todo-tags"]');
  task.tags.forEach(tag => {
    const li = document.createElement("li");
    li.setAttribute("data-testid", "test-todo-tag-" + tag.toLowerCase().replace(/\s+/g, "-"));
    li.setAttribute("role", "listitem");
    li.innerHTML = `${svgUse("ic-tag",10)}${esc(tag)}`;
    ul.appendChild(li);
  });

  wireCard(art, task);
  return art;
}


function wireCard(art, task) {
  const collId     = "coll-" + task.id;
  const editFormId = "ef-"   + task.id;

  /* ─ Checkbox ─ */
  const cb = art.querySelector('[data-testid="test-todo-complete-toggle"]');
  cb.addEventListener("change", () => {
    if (cb.checked) {
      task.status    = "Done";
      task.completed = true;
    } else {
      task.status    = "Pending";
      task.completed = false;
    }
    art.classList.toggle("completed", task.completed);
    syncStatusButtons(art, task);
    refreshTime(art, task);
    updateStats();
    showToast(task.completed ? "Task completed ✓" : "Task reopened", "ic-done");
  });

  /* ─ Status segmented control ─ */
  art.querySelectorAll(".status-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      task.status = btn.dataset.st;
      task.completed = (task.status === "Done");
      cb.checked = task.completed;
      art.classList.toggle("completed", task.completed);
      syncStatusButtons(art, task);
      refreshTime(art, task);
      updateStats();
      showToast("Status → " + task.status, "ic-done");
    });
  });

  /* ─ Expand / Collapse ─ */
  const expandBtn = art.querySelector('[data-testid="test-todo-expand-toggle"]');
  if (expandBtn) {
    const collEl   = art.querySelector(`#${collId}`);
    const fadeEl   = art.querySelector(".expand-fade");
    expandBtn.addEventListener("click", () => {
      const isExpanded = expandBtn.getAttribute("aria-expanded") === "true";
      expandBtn.setAttribute("aria-expanded", String(!isExpanded));
      collEl.classList.toggle("collapsed", isExpanded);
      collEl.classList.toggle("expanded",  !isExpanded);
      expandBtn.innerHTML = `${svgUse("ic-expand",11)} ${!isExpanded ? "Show less" : "Show more"}`;
      if (fadeEl) fadeEl.classList.toggle("hidden", !isExpanded);
    });
  }

  /* ─ Edit button ─ */
  const editBtn  = art.querySelector('[data-a="edit"]');
  const editForm = art.querySelector(`#${editFormId}`);
  const titleEl  = art.querySelector('[data-testid="test-todo-title"]');

  editBtn.addEventListener("click", () => {
    const isOpen = editForm.classList.contains("visible");
    if (isOpen) return closeEdit(false);
    // populate fresh values
    art.querySelector(`#ef-title-${task.id}`).value    = task.title;
    art.querySelector(`#ef-desc-${task.id}`).value     = task.description;
    art.querySelector(`#ef-priority-${task.id}`).value = task.priority;
    art.querySelector(`#ef-due-${task.id}`).value      = toLocalDT(task.dueDate);
    editForm.classList.add("visible");
    editBtn.classList.add("active");
    art.querySelector(`#ef-title-${task.id}`).focus();
  });

  function closeEdit(save) {
    if (save) {
      const newTitle = art.querySelector(`#ef-title-${task.id}`).value.trim();
      if (!newTitle) {
        art.querySelector(`#ef-title-${task.id}`).focus();
        showToast("Title is required", "ic-overdue"); return;
      }
      const newDesc     = art.querySelector(`#ef-desc-${task.id}`).value.trim();
      const newPriority = art.querySelector(`#ef-priority-${task.id}`).value;
      const newDueRaw   = art.querySelector(`#ef-due-${task.id}`).value;
      const newDue      = newDueRaw ? new Date(newDueRaw) : task.dueDate;

      // apply
      task.title       = newTitle;
      task.description = newDesc;
      task.priority    = newPriority;
      task.dueDate     = newDue;

      // update displayed title
      titleEl.textContent = newTitle;
      art.setAttribute("aria-label", "Task: " + newTitle);

      // update desc in collapsible
      const descEl = art.querySelector('[data-testid="test-todo-description"]');
      if (descEl) descEl.textContent = newDesc;

      // update priority indicator & topbar
      const pr = PRCONF[task.priority];
      art.dataset.priority = task.priority;
      art.querySelector(".card-topbar").style.background = pr.bar;
      const piEl = art.querySelector('[data-testid="test-todo-priority-indicator"]');
      if (piEl) {
        piEl.className = `priority-indicator pi-${task.priority}`;
        piEl.innerHTML = `<span class="pi-dot"></span>${task.priority}`;
      }

      // update due date display
      const dueEl = art.querySelector('[data-testid="test-todo-due-date"]');
      if (dueEl) {
        dueEl.setAttribute("datetime", isoDate(task.dueDate));
        dueEl.innerHTML = `${svgUse("ic-cal",11)} ${fmtDue(task.dueDate)}`;
      }
      refreshTime(art, task);
      showToast("Task saved ✓", "ic-save");
    }
    editForm.classList.remove("visible");
    editBtn.classList.remove("active");
    editBtn.focus();
  }

  art.querySelector('[data-a="ef-save"]').addEventListener("click", () => closeEdit(true));
  art.querySelector('[data-a="ef-cancel"]').addEventListener("click", () => closeEdit(false));

  // Keyboard: Escape closes edit form
  editForm.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.preventDefault(); closeEdit(false); }
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && !e.shiftKey) {
      e.preventDefault(); closeEdit(true);
    }
  });

  /* ─ Delete ─ */
  const overlay = art.querySelector(".del-overlay");
  art.querySelector('[data-a="delbtn"]').addEventListener("click", () => {
    overlay.classList.add("visible");
    art.querySelector('[data-a="cdel"]').focus();
  });
  art.querySelector('[data-a="cdel"]').addEventListener("click", () => overlay.classList.remove("visible"));
  art.querySelector('[data-a="del"]').addEventListener("click", () => {
    overlay.classList.remove("visible");
    art.classList.add("removing");
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== task.id);
      renderAll();
      showToast("Task deleted", "ic-trash");
    }, 380);
  });
  art.addEventListener("keydown", e => {
    if (e.key === "Escape" && overlay.classList.contains("visible"))
      overlay.classList.remove("visible");
  });
}

// STATUS BUTTON SYNC function — ensures status buttons reflect current task status
function syncStatusButtons(art, task) {
  const classMap = {
    "Pending":     "active-pending",
    "In Progress": "active-inprogress",
    "Done":        "active-done",
    "Blocked":     "active-blocked",
  };
  art.querySelectorAll(".status-btn").forEach(btn => {
    const active = btn.dataset.st === task.status;
    btn.className = "status-btn" + (active ? " " + (classMap[task.status] || "") : "");
    btn.setAttribute("aria-pressed", String(active));
  });
}

// refresh time function — updates time remaining display based on current time and task due date
function refreshTime(art, task) {
  const tr = art.querySelector('[data-testid="test-todo-time-remaining"]');
  const ov = art.querySelector('[data-testid="test-todo-overdue-indicator"]');
  if (!tr) return;
  const { label, cls, ico, overdue } = fmtRemaining(task.dueDate, task.completed);
  tr.innerHTML = `${svgUse(ico,11)} ${label}`;
  tr.className = `todo-time-remaining ${cls}`;
  tr.setAttribute("aria-label", label);
  if (ov) ov.classList.toggle("visible", !!overdue);
  art.classList.toggle("is-overdue", !!overdue && !task.completed);
}

//  STATS function
function updateStats() {
  document.getElementById("st-todo").textContent  = tasks.filter(t => t.status === "Pending").length;
  document.getElementById("st-prog").textContent  = tasks.filter(t => t.status === "In Progress").length;
  document.getElementById("st-done").textContent  = tasks.filter(t => t.status === "Done").length;
  document.getElementById("st-block").textContent = tasks.filter(t => t.status === "Blocked").length;
}

// ── render ALL function — renders task list based on current filter and updates stats
function renderAll() {
  const list  = document.getElementById("cardList");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("taskCount");
  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);
  list.innerHTML = "";
  filtered.forEach(t => list.appendChild(makeCard(t)));
  count.textContent = `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`;
  empty.style.display = filtered.length === 0 ? "block" : "none";
  updateStats();
}

// ── TICK — update time every 45s 
setInterval(() => {
  document.querySelectorAll('[data-testid="test-todo-card"]').forEach(art => {
    const t = tasks.find(x => x.id === art.dataset.id);
    if (t) refreshTime(art, t);
  });
}, 45000);

// ── Filter Button function
document.querySelector(".filter-row").addEventListener("click", e => {
  const b = e.target.closest(".fbtn");
  if (!b) return;
  document.querySelectorAll(".fbtn").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  filter = b.dataset.filter;
  renderAll();
});

// ── MODAL — Add New Task Functions
const modalBg = document.getElementById("modalBg");
const pad = n => String(n).padStart(2, "0");

function openModal() {
  const t = new Date(Date.now() + 86400000);
  t.setHours(12, 0, 0, 0);
  document.getElementById("f-due").value =
    `${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(t.getDate())}T${pad(t.getHours())}:${pad(t.getMinutes())}`;
  ["f-title","f-desc","f-tags"].forEach(id => (document.getElementById(id).value = ""));
  document.getElementById("f-priority").value = "Medium";
  document.getElementById("f-status").value   = "Pending";
  document.querySelectorAll(".field input,.field textarea").forEach(el => el.classList.remove("invalid"));
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
modalBg.addEventListener("click", e => { if (e.target === modalBg) closeModal(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && modalBg.classList.contains("open")) closeModal();
});

document.getElementById("submitTask").addEventListener("click", () => {
  const ti = document.getElementById("f-title");
  const di = document.getElementById("f-due");
  let ok = true;
  if (!ti.value.trim()) { ti.classList.add("invalid"); ti.focus(); ok = false; } else ti.classList.remove("invalid");
  if (!di.value) { di.classList.add("invalid"); if (ok) di.focus(); ok = false; } else di.classList.remove("invalid");
  if (!ok) { showToast("Please fill required fields", "ic-overdue"); return; }

  const tags = document.getElementById("f-tags").value
    .split(",").map(s => s.trim()).filter(Boolean);
  const status = document.getElementById("f-status").value;
  tasks.unshift({
    id: "t" + ++nextId,
    title: ti.value.trim(),
    description: document.getElementById("f-desc").value.trim(),
    priority: document.getElementById("f-priority").value,
    status,
    dueDate: new Date(di.value),
    tags: tags.length ? tags : ["General"],
    completed: status === "Done",
  });
  filter = "all";
  document.querySelectorAll(".fbtn").forEach(b => b.classList.toggle("active", b.dataset.filter === "all"));
  closeModal();
  renderAll();
  showToast("New task added ✓", "ic-done");
});

// ── TOAST Function
let toastT;
function showToast(msg, ico = "") {
  const el = document.getElementById("toast");
  el.innerHTML = ico ? `${svgUse(ico,14)} ${msg}` : msg;
  el.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove("show"), 2600);
}

// INIT All functions
renderAll();