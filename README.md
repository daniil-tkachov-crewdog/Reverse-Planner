# Reverse Planner

A desktop app for **reverse planning** — build a plan backwards from your end
goal (point **B**) to your starting point (point **A**), on an N8N-style visual
canvas. Plans are made of two node types:

- **State** (square, rounded) — a situation's state along the way.
- **Action** (circle, half the size) — the work that transitions one State into
  the next. The connecting arrow is colored by the Action's status.

## Concepts

- The plan is displayed left → right (A → B) but built **backwards**: every
  "Add" inserts a node to the **left** of the node you're editing.
- **Action-first chaining:** from a State, *Add Action* drops an Action on the
  arrow to its left; that Action's *Add State* then creates the previous State.
- **Side Flow:** a Plan-B fork placed in a lane above or below the main line.
  Reconnecting it back into the main line is optional (drag between node edges).
- **Status:** Not reached (grey), In progress (amber), Done (green), Failed (red).

## Persistence

- Every plan auto-saves to Electron's `userData/plans` folder, so the Dashboard
  repopulates on next launch.
- **Save All** writes a JSON backup of every plan to
  `Documents\Reverse Planner` (created automatically if missing). The button
  shows a spinner while saving, then turns green for 5 seconds.

## Development

```bash
npm install
npm run dev        # launch the app in dev mode
npm test           # run unit tests (graph logic + storage)
npm run typecheck  # type-check main + renderer
```

## Building (Windows)

```bash
npm run build:win  # produces an NSIS installer in ./dist
```

## Project layout

```
src/
  main/       Electron main process — window, IPC, storage (userData + Save All)
  preload/    contextBridge → window.api
  renderer/   React app
    lib/      graph.ts (pure reverse-planning graph ops), plan.ts, defaults.ts
    store/    planStore.ts (Zustand state + autosave)
    pages/    Dashboard, Editor, Settings
    components/
      canvas/   StateNodeView, ActionNodeView
      editors/  State/Action modals, RichDescription
  shared/     types shared by main + renderer
```
