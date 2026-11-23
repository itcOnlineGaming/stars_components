# Feedback screen

What a learner sees in Stars right after answering a practice item.

- **Exemplars**: the learner reads a piece of work and reviews it against a checklist
  (`ArtefactView`, `ArtefactReview`), then sees their answers next to the expected ones
  with feedback (`ExemplarFeedback`), then a screen asking "Are you ready for your next
  review?" before the next exemplar.
- **Exercises**: the learner answers a multiple choice or short exact answer question and
  sees the result: whether they were right, their response, the correct answer and any
  feedback.

![Exemplar feedback in Stars](screenshot.png)

## Run it

You need [Node.js](https://nodejs.org) 22 or later. From this folder:

```
npm install
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173). `npm run build` makes a
static copy in `dist/`.

## Scenarios

- **Exemplar**: a round of three exemplars: review, feedback, "Are you ready", and on to
  the next. As in Stars, the last exemplar skips the "Are you ready" screen.
- **Exercise**: two exercises, one multiple choice and one exact answer. The result is
  part of the Stars page rather than a component, so `src/ExercisePractice.svelte` holds a
  copy of it.

The exemplars and exercises are in `src/mock/practice.js`, and the marking in
`src/mock/api.js`. The "Fill Randomly (localhost only)" button under the checklist is a
Stars test helper that appears on any localhost address.

## Making a version of your own

The app is SvelteKit, like Stars, so each folder in `src/routes/` is a page. To try a
change next to the Stars version:

1. Copy the component you want to change and change the copy, e.g.
   `src/lib/components/ArtefactReview.svelte` to `src/lib/components/ArtefactReviewB.svelte`.
2. Copy each file that uses it, up to `src/App.svelte`, and point each copy at the B
   version below it: here `src/ExemplarPractice.svelte` to `src/ExemplarPracticeB.svelte`
   (importing `ArtefactReviewB`) and `src/App.svelte` to `src/AppB.svelte` (importing
   `ExemplarPracticeB`).
3. Add `src/routes/b/+page.svelte`:

   ```svelte
   <script>
   	import AppB from '../../AppB.svelte';
   </script>

   <AppB />
   ```

4. Open http://localhost:5173/b. The Stars version stays at `/`; a version C would be
   `src/routes/c/+page.svelte`.

Add new files rather than changing the Stars copies in `src/lib/` and `ui/`, so `/` keeps
showing the screen as it is in Stars, and those copies can be brought up to date from
Stars without touching your version.

## What is in this folder

- **`src/lib/` and `ui/`**: copies of the Stars originals: the component, the code it
  uses, and the Stars design system (the complete design tokens in
  `ui/tokens/tokens.json`, the CSS generated from them, base styles and every shared
  component). They are unchanged, so the component looks and behaves as it does in Stars.
  A version of your own can use any of the shared components, as Stars does:
  `import { Button, Card, Input, Modal } from '$ui/components';`
  (`ui/components/index.js` lists them all).
- **`src/routes/`**: the pages, as in any SvelteKit app. `+page.svelte` is the screen at
  `/`, and `+layout.svelte` loads the Stars global styles for every page.
- **`src/App.svelte`** (and the other files directly in `src/`): what the Stars page does
  around the component, with the parts that are not about this screen left out. The top
  of each file says what it leaves out.
- **`src/mock/`**: stand-ins for what the component needs from the rest of Stars: the
  server (`fetch.js`, which answers from the sample data in `api.js`) and a Stars package
  (`admin-exercises.js`). `svelte.config.js` points the component's imports at these; a
  `$lib` import always reads from `src/lib/`, so `src/lib/fetch.js` is the one file there
  that is not from Stars: it passes the import on to `src/mock/fetch.js`. The scenario bar
  at the top of the page and the **API calls** panel at the bottom are part of the mockup,
  not of Stars: the panel shows each request the component makes and what it sends.
