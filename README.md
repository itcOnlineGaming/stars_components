# Stars components

Three screens from Stars, the learning app, each as a small app of its own. Each app
contains the real Stars component, copied unchanged, with sample data in place of the
Stars server, so you can run it, try it out and change it without the rest of Stars.

| Folder | What it is |
| --- | --- |
| [Journey path](journey-path/) | The map a learner sees of their learning journey: a node for each step, done, locked or still to do. |
| [Feedback screen](feedback-screen/) | What a learner sees right after answering a practice item: the feedback on an exemplar review or an exercise answer, and the screen before the next one. |
| [Start practice session](start-practice-session/) | Where a learner chooses what to practise: the skill, exercises or exemplars, the mode and the number of items. |

## Running an app

Each folder is a separate app. You need [Node.js](https://nodejs.org) 22 or later. Then:

```
cd journey-path
npm install
npm run dev
```

and open the address Vite prints (usually http://localhost:5173). Each app has a
**Scenario** menu at the top to switch between sample situations, and most have an
**API calls** panel at the bottom showing what the component asks the server for.

## How each app is laid out

All three follow the same pattern; each app's README says what is in it.

- `src/lib/` and `ui/`: the Stars originals, unchanged. `ui/` is the Stars design system:
  `ui/tokens/tokens.json` holds every design token, and the CSS in `ui/tokens/` is
  generated from it. Stars styles use these tokens (`var(--spacing-4)`,
  `var(--color-text-muted)`) rather than fixed colours and sizes.
- `src/App.svelte`: what the Stars page does around the component.
- `src/mock/`: stand-ins for the server, the signed-in learner and SvelteKit, and the
  sample data.

The apps use plain [Vite](https://vite.dev) and [Svelte 5](https://svelte.dev), not
SvelteKit, so there is no routing or server to set up.
