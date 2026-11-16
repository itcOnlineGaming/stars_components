# Journey path

The map a learner sees of their learning journey in Stars (`JourneyPath.svelte`): one
round node per step, connected in rows. Each node shows the kind of step (a resource,
practice, a brief, a reflection and so on), whether it is done or locked, and a short
line about it underneath. A milestone's node is a ring split into one segment per
requirement, with its due date. Clicking a step opens it.

![The journey path in Stars](screenshot.png)

## Run it

You need [Node.js](https://nodejs.org) 22 or later. From this folder:

```
npm install
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173). `npm run build` makes a
static copy in `dist/`.

## Scenarios

Switch between them in the bar at the top. The journeys are in `src/mock/journeys.js`.

- **Part way through**: done, in-progress and locked steps, two unread reviews, a practice
  plan that is off track, and a mastery milestone due tomorrow.
- **Just started**: nothing done yet; two steps locked until the first submission.
- **Finished**: every step done.
- **Long journey**: 15 steps over three rows, with two milestones, one of them overdue.

Clicking a locked step shows the notice Stars shows; clicking any other step shows a note
saying what Stars would open.

## What is in this folder

- **`src/lib/` and `ui/`**: copies of the Stars originals: the component, the code it
  uses, and the Stars design system (the complete design tokens in
  `ui/tokens/tokens.json`, the CSS generated from them, base styles and the shared
  `Button`). They are unchanged, so the component looks and behaves as it does in Stars.
- **`src/App.svelte`** (and the other files directly in `src/`): what the Stars page does
  around the component, with the parts that are not about this screen left out. The top
  of each file says what it leaves out.
- **`src/mock/`**: stand-ins for what the component needs from the rest of Stars: the
  server (`fetch.js`, which answers from the sample data in `api.js`), the signed-in
  learner, and SvelteKit's `$app/paths` and `$app/stores`. `vite.config.js` points the
  component's imports at these. The scenario bar at the top of the page and the
  **API calls** panel at the bottom are part of the mockup, not of Stars: the panel shows
  each request the component makes and what it sends.
