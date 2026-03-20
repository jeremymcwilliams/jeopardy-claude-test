# Fake Jeopardy — Project Spec

## Overview

A two-part assignment to build a browser-based Jeopardy-style trivia game.

- **Part 1** — Build the layout and game logic using HTML, CSS, and vanilla JavaScript.
- **Part 2** — Connect the game to the Open Trivia Database API using jQuery AJAX.

---

## Part 1: Fake Jeopardy Layout

### What it should look like

**On first load:**
- A gray page with the heading "Welcome to Fake Jeopardy" (in a special Jeopardy-style font).
- A 5×6 grid of blank blue cells (no text).
- Below the grid: a "Start" button, a "Reset" button (disabled), a status message reading "Click Start to begin.", and a score display reading "Score: 0".

**After clicking Start:**
- The top row of the grid shows 5 randomly selected category headers (different every game).
- The remaining 5 rows show point values: 10, 20, 30, 40, 50 — one per row, repeated across all 5 columns.
- The Start button becomes disabled; the Reset button becomes enabled.
- Status message changes to "Select a question."

**After clicking a point cell:**
- A modal appears overlaid on the game board.
- The modal contains: a question, a list of answers as radio buttons, and a "Submit Answer" button.
- A close (×) button dismisses the modal.

**After submitting an answer:**
- If correct: "Correct!" is shown in the status area; points are added to the score.
- If incorrect: "Wrong. The correct answer is: [answer]" is shown; points are subtracted from the score.
- The clicked cell goes blank and can no longer be clicked.

**After clicking Reset:**
- Everything clears; the game returns to its initial state (blank grid, "Click Start to begin.", Score: 0).

---

### File structure

```
index.html          ← provided; do not edit
css/style.css       ← you write this
js/script.js        ← you write this
fonts/              ← contains Gyparody and ITC Korinna font files
```

---

### style.css specs

- **`body`**: background color `#aaa`; font-family "ITC Korinna Regular" (set up via `@font-face` pointing to the correct file in `fonts/`).
- **`#container`**: width `90%`, centered on the page.
- **`header`**: font-family "Gyparody" (set up via `@font-face`); text centered.
- **`#gameboard`**: `display: grid`; `grid-template-columns: repeat(5, 1fr)`; `grid-auto-rows: 75px`; `width: 100%`; background color black.
- **`.question` and `.category`**: background color blue; text color `#FFD700`; text centered both vertically and horizontally (use flexbox); `font-size: 20px`.
- **`.category`**: `text-transform: uppercase`.
- **`#gameInfo`**: `display: grid`; `grid-template-columns: repeat(3, 1fr)`; use `justify-content` to position Start/Reset left, status message center, score right.
- **Responsive**: Add media query rules at common breakpoints. Focus on reducing `font-size` to fit smaller screens.

The modal styles are already included in the provided CSS — do not remove them.

---

### script.js — Part 1

At the top of the file, add event listeners so that:
- Clicking Start calls `startGame()`
- Clicking Reset calls `resetGame()`

Do not hard-code a categories list. Categories will be fetched from the API at game start (see Part 2).

#### Functions to write:

**`startGame(categories)`**
- Receives the `categories` object from `loadCategories()`.
- Disable the Start button.
- Enable the Reset button.
- Call `populateBoard(categories)`, passing the categories through.
- Zero out any previous score.
- Add an event listener to `#submitResponse` (inside the modal) to call `checkResponse()` when clicked.

**`populateBoard(categories)`**
- Receives a `categories` object (name → id) as an argument — do not hard-code categories here.
- Populate `.category` divs with the category names.
- Populate `.question` divs with point values (10, 20, 30, 40, 50 per row, across all 5 columns).
- Add a click event listener to each `.question` div to call `viewQuestion()`.
- Give each `.question` div a unique `id` (using the loop counter is a good approach).
- Strategy: use two separate loops — one over `.category` elements, one over `.question` elements.

**`checkResponse()`**
- Read the selected radio button's `value` attribute to determine if the answer is correct (`value="correct"`).
- If correct: display "Correct!" in `<div id="feedback">`.
- If incorrect: display "Wrong. The correct answer is: [answer]" in the feedback div.
- Add or subtract the question's point value from the score; display updated total in `<span id="total">`.
- Clear the text from the clicked `.question` div so it appears blank.
- Remove the event listener from that `.question` div.

**`resetGame()`**
- Reset score to zero.
- Remove all `id` attributes from `.question` divs.
- Remove event listeners from all `.question` divs.
- Remove all text from grid cells.
- Disable Reset button; enable Start button.
- Display "Click Start to begin." in the feedback div.

**`viewQuestion()`** — pre-written for you. Displays the modal when a point cell is clicked, provided the event listener in `populateBoard()` is set up correctly.

---

## Part 2: Fake Jeopardy with AJAX API Calls

### Overview

Extend the Part 1 game to fetch real questions from the [Open Trivia Database API](https://opentdb.com). The look and feel stays the same — the main change is that questions are now live from the API instead of placeholder text.

Continue using the same repository from Part 1.

---

### Initial modifications

**In `index.html`**, add the jQuery library just before your `script.js` tag:
```html
<script
  src="https://code.jquery.com/jquery-3.7.0.min.js"
  integrity="sha256-2Pmvv0kuTBOenSvLm6bvfBSSHrUJ+3A7x6P5Ebd07/g="
  crossorigin="anonymous"></script>
```

**In `script.js`**, remove any hard-coded categories. Categories will now be fetched dynamically via `loadCategories()` each time the game starts.

---

### New functions to write

**`setToken()`**
- Using jQuery AJAX, query the Open Trivia DB token endpoint: `https://opentdb.com/api_token.php?command=request`
- Because this is asynchronous, update the Start button's event handler to call `setToken()` instead of `startGame()` directly.
- In the `.done()` callback: store the token with `localStorage.setItem('triviaToken', data.token)`, then call `loadCategories()`.
- Consider adding user feedback (e.g. updating the status message) before the AJAX call fires, in case it takes a moment.

**`loadCategories()`**
- Using jQuery AJAX, fetch the full list of available categories from: `https://opentdb.com/api_category.php`
- The response contains a `trivia_categories` array of objects, each with `id` and `name` properties.
- Randomly select 5 categories from that array (without repeats).
- Build a plain object mapping each selected category's `name` to its `id`, e.g. `{ "Mythology": 20, "Sports": 21, ... }`.
- Store this object in `localStorage` (e.g. `localStorage.setItem('activeCategories', JSON.stringify(selectedCategories))`).
- Call `startGame(selectedCategories)` when done, passing the object as an argument.
- Update the status message while the call is in progress.

**`loadQuestion()`**
- Purpose: given the clicked cell's category and difficulty, fetch a question from the API, populate the modal, and call `viewQuestion()`.
- Change the event listener on each `.question` div to fire `loadQuestion()` instead of `viewQuestion()`.
- Before the AJAX call, read `data-cat` and `data-difficulty` attributes from the clicked element (see `populateBoard()` changes below).
- Move the `localStorage.setItem('currentIndex', ...)` line here (from `viewQuestion()`).
- Update the status message while the API call is in progress.
- API endpoint: `https://opentdb.com/api.php`
- Parameters: `amount=1`, `category=<data-cat>`, `difficulty=<data-difficulty>`, `type=multiple`, `token=<localStorage.getItem('triviaToken')>`
- In `.done()`: parse the response, build the answer list, and call `viewQuestion(response)`.

**`shuffle(array)`** — utility, borrow this directly:
```js
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
```

---

### Functions to modify

**`populateBoard(categories)`**
- Now receives the `categories` object (name → id) as an argument from `startGame()`.
- Update the category loop to use a `for...in` loop (since `categories` is an object).
- For each `.question` div, add `data-*` attributes using `setAttribute`:
  - `data-cat` — the numeric category ID from the categories object.
  - `data-difficulty` — mapped from point value: `"easy"` for 10pts, `"medium"` for 20/30/40pts, `"hard"` for 50pts. A `switch` statement on the point value works well here.
- Change the click event listener to call `loadQuestion()` instead of `viewQuestion()`.

**`viewQuestion(response)`**
- Now receives the API response object as an argument.
- Parse `response.results[0]` to get: `question`, `correct_answer`, `incorrect_answers`.
- Build an array of all four answers (3 incorrect + 1 correct); shuffle with `shuffle()`.
- Render answers as radio buttons in the modal. The correct answer's radio input must have `value="correct"`; incorrect answers should have a different value (e.g. the answer text).
- Display the question text in the modal.

---

### Notes

- **HTML entity decoding**: API responses may contain HTML entities like `&#039;` or `&amp;`. Decode them before displaying:
  ```js
  function decodeHTML(str) {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  }
  ```
- **Button enable/disable**: revisit where Start and Reset are enabled/disabled — you may want to adjust timing now that `setToken()` is async.
- **User feedback**: update the status message at key moments — while fetching the token, while loading a question, and after an answer is submitted.
