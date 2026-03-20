# Fake Jeopardy

A browser-based Jeopardy-style trivia game. Full project spec is in spec.md.

## Before writing any code
Read spec.md in full. Present a numbered build plan and wait for
approval. Call out any assumptions you're making.

## Constraints
- Vanilla JS only for Part 1. jQuery added via CDN for Part 2.
- Three output files: index.html, css/style.css, js/script.js
- index.html must include a modal (structure described in spec.md)
- No external libraries or frameworks beyond jQuery in Part 2

## How to verify
After building, open index.html in a browser and confirm:
1. Page loads with blank blue grid and "Click Start to begin."
2. Start button fetches categories and populates the board
3. Clicking a cell opens the modal with a real trivia question
4. Submit adds/subtracts score and blanks the cell
5. Reset returns to initial state

## Git workflow
The repo is already initialized and has a remote configured.
Use git CLI for all version control — there is no GitHub MCP server.

### Commit as you go
After each meaningful, working milestone, stage and commit your changes.
Do not wait until everything is done. A good milestone is a logical chunk
of work that leaves the project in a coherent state — not necessarily
a complete feature, but never a broken one.

### What makes a good commit
- Write a short, specific commit message in imperative mood:
  "Add gameboard CSS grid layout" not "did some css stuff"
- Commit working code only — if something is partially broken, finish
  it before committing
- Group related changes together; don't mix unrelated edits in one commit

### After each commit, push
After every commit, run:
  git push origin main

If the push fails due to an unrelated remote change, pull with rebase first:
  git pull --rebase origin main

### Suggested commit points (not exhaustive — use your judgment)
- After index.html is complete
- After style.css produces the correct visual layout
- After Part 1 JS is working (Start, board population, modal, scoring, Reset)
- After Part 2 setToken() and loadCategories() are working
- After loadQuestion() and viewQuestion() are wired to the API
- After any meaningful bug fix or refinement

### Do not commit
- spec.md or CLAUDE.md (these are project scaffolding, not deliverables)
- Any API keys or tokens
- node_modules or other generated directories