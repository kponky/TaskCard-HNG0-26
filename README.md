# AEA Digitals — Task Manager · Stage 1a

## Overview

Stage 1a extends the Stage 0 Todo Card into a fully interactive, stateful component. All Stage 0 test IDs are preserved while new functionality — inline editing, segmented status control, expand/collapse, overdue detection, and richer time logic — has been layered on top.

---

## What Changed From Stage 0

### 1. Inline Edit Form (`test-todo-edit-form`)
Stage 0 used `contentEditable` directly on the title and description elements, which was minimalist but limited. Stage 1a replaces this with a proper edit form that renders below the card content when the edit button is clicked. The form includes:
- Title input (`test-todo-edit-title-input`)
- Description textarea (`test-todo-edit-description-input`)
- Priority select (`test-todo-edit-priority-select`)
- Due date input (`test-todo-edit-due-date-input`)
- Save (`test-todo-save-button`) and Cancel (`test-todo-cancel-button`) buttons

All form fields have associated `<label for="">` elements. Pressing **Escape** cancels; pressing **Enter** (outside a textarea) saves. Focus returns to the edit button on close.

### 2. Status → Segmented Control (`test-todo-status-control`)
Stage 0 showed status as a pill with a hidden `<select>` overlay. Stage 1a replaces this with a visible three-button segmented control (Pending / In Progress / Done) using `aria-pressed` for screen-reader state. The control is fully keyboard-accessible and visually colour-coded per status.

Statuses have been aligned to the Stage 1 spec: **Pending**, **In Progress**, **Done** (Blocked is supported in data and stats, but the segmented control exposes only the three primary statuses to keep the card scannable).

### 3. Priority Indicator (`test-todo-priority-indicator`)
A coloured dot + label badge now sits in the pill group, providing an explicit, always-visible priority signal. The left border accent on the card is an additional reinforcing visual: red for High, amber for Medium, green for Low. Both update immediately when priority is changed via the edit form.

### 4. Expand / Collapse (`test-todo-expand-toggle`, `test-todo-collapsible-section`)
Descriptions longer than 120 characters are collapsed by default. A "Show more / Show less" toggle button appears below the truncated text. The button uses `aria-expanded` and `aria-controls` pointing to the collapsible section's `id`. A CSS gradient fade overlays the cut-off text to signal there is more content. The toggle is keyboard-focusable and included in the natural tab order.

### 5. Overdue Indicator (`test-todo-overdue-indicator`)
A pulsing red "Overdue" badge (`role="status"` + `aria-live="polite"`) appears when the due date has passed and the task is not done. The card also gains a subtle red tint (`is-overdue` class) and a red border. Both clear automatically when the task is marked Done.

### 6. Time Logic Improvements
- Granular labels: "Due in 45m", "Due in 3h", "Due tomorrow", "Due in N days", "Overdue by Xh", etc.
- Updates every 45 seconds via `setInterval`.
- When status becomes Done (via checkbox or segmented control), the time remaining stops updating and shows "Completed".

### 7. Checkbox ↔ Status Synchronisation
- Checking the checkbox → status becomes **Done**, segmented control updates.
- Clicking **Done** in the segmented control → checkbox becomes checked.
- Unchecking after Done → status reverts to **Pending**, segmented control updates.

### 8. Stats Row Label Update
"To Do" renamed to **Pending** to match the Stage 1 status vocabulary.

---

## New Design Decisions

**Edit form placement** — Rendered inline below card content (slide-down animation) rather than in a modal, so context is never lost. The user can still see the task title and description while editing.

**Segmented control over dropdown** — A segmented control is more visually informative and faster to interact with for a three-option set. A hidden `<select>` would be screenreader-compatible but slower for power users.

**Collapse threshold of 120 chars** — Long enough that short descriptions never truncate unnecessarily, short enough that cards with lengthy descriptions don't dominate the list view.

**Left border accent for priority** — Complements the topbar colour and the priority indicator badge; communicates priority at a glance even when the pill group is below the fold on small screens.

**Pulsing overdue badge** — A subtle CSS animation (`pulse`) on the overdue badge draws attention without being aggressive. It stops animating when done.

---

## Accessibility Notes

- All edit form fields have `<label for="">` associations.
- Status segmented control uses `role="group"` with `aria-label="Task status"`, and each button carries `aria-pressed`.
- Expand toggle uses `aria-expanded` and `aria-controls` pointing to the collapsible section's `id`.
- Overdue indicator uses `role="status"` and `aria-live="polite"`.
- Time remaining uses `aria-live="polite"` so screen readers announce changes without interrupting.
- Delete confirmation overlay uses `role="dialog"` and `aria-modal="true"`; focus is moved to the Cancel button on open.
- Focus returns to the Edit button when the edit form is closed (save or cancel).
- All interactive elements are reachable by keyboard. Intended tab order per card: Checkbox → Status buttons → Expand toggle (if present) → Edit → Delete → (in edit mode) Title input → Description → Priority → Due date → Cancel → Save.
- `aria-label` on the card article and checkbox label includes the task title for screen-reader context.

---

## Known Limitations

1. **No persistence** — Tasks exist only in memory. Refreshing the page resets to the three seeded tasks. Adding `localStorage` or a backend would be a natural Stage 2 enhancement.

2. **Blocked status in segmented control** — Blocked is tracked in data and shown in stats, but the segmented control exposes only Pending / In Progress / Done. Tasks can be created as Blocked via the "New Task" modal but cannot be toggled to Blocked from the card itself without re-opening the modal. This keeps the card control compact; a "more" overflow option could be added later.

3. **Edit form does not include tags** — Tags can be set at creation time but are not editable from the inline form. This keeps the form lightweight; a tag chip editor could be added as a separate enhancement.

4. **Collapse detection is character-based** — The 120-character threshold works well for typical descriptions but does not account for rendered line height or available card width. A `ResizeObserver`-based approach would be more precise.

5. **No drag-to-reorder** — Task order is fixed (newest first after creation). Drag-and-drop reordering is out of scope for Stage 1.

6. **Browser datetime-local formatting** — The due date/time input uses the browser's native `datetime-local` picker, whose appearance varies across browsers and is not fully styleable with CSS.

---

## File Structure

```
index.html   — Markup, SVG sprite, semantic structure
style.css    — All styling including Stage 1a additions
main.js      — Task data, card factory, event wiring, state management
README.md    — This file
```

## Test IDs Reference

### Preserved from Stage 0
| Test ID | Element |
|---|---|
| `test-todo-card` | `<article>` root |
| `test-todo-complete-toggle` | Completion checkbox |
| `test-todo-title` | Task title `<h3>` |
| `test-todo-description` | Description `<p>` |
| `test-todo-priority` | _(pill — legacy; replaced by indicator below)_ |
| `test-todo-status` | _(pill — legacy; replaced by control below)_ |
| `test-todo-due-date` | Due date `<time>` |
| `test-todo-time-remaining` | Time remaining `<time>` |
| `test-todo-tags` | Tags `<ul>` |
| `test-todo-tag-*` | Individual tag `<li>` |
| `test-todo-edit-button` | Edit button |
| `test-todo-delete-button` | Delete button |

### New in Stage 1a
| Test ID | Element |
|---|---|
| `test-todo-edit-form` | Edit form container |
| `test-todo-edit-title-input` | Title `<input>` |
| `test-todo-edit-description-input` | Description `<textarea>` |
| `test-todo-edit-priority-select` | Priority `<select>` |
| `test-todo-edit-due-date-input` | Due date `<input type="datetime-local">` |
| `test-todo-save-button` | Save button |
| `test-todo-cancel-button` | Cancel button |
| `test-todo-status-control` | Segmented status control |
| `test-todo-priority-indicator` | Priority dot+label badge |
| `test-todo-expand-toggle` | Expand/collapse button |
| `test-todo-collapsible-section` | Collapsible description container |
| `test-todo-overdue-indicator` | Overdue badge |
