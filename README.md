# Mealy Moore Studio

A multi-page React app for learning Mealy and Moore machines (Theory of Computation).

**Created by Bhawani Singh Chadha**

Pages: Home, Simulator, Theory, About.

## Run

```
npm install
npm run dev
```

Open the address Vite prints (usually http://localhost:5173).

## Features

- Enter a Mealy or Moore machine with validation
- Mealy to Moore and Moore to Mealy conversion, with written steps
- Run, step, back, play, position slider
- Equivalence check over all inputs, with a counterexample if it fails
- Zoomable diagram with draggable states
- JSON import and export (format shown on the About page)
- Tests for the machine logic: `npm test`

## Folder layout

- src/core: machine logic (no React)
- src/components: editor, diagram, tables, traces
- src/pages: Home, Simulator, Theory, About
