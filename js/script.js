// Global variables
let currentScore = 0;
let currentQuestionIndex = null;

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('startButton').addEventListener('click', function() {
        // Part 2: Start with API token setup
        setToken();
    });

    document.getElementById('resetButton').addEventListener('click', resetGame);

    // Modal close functionality
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('questionModal').style.display = 'none';
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('questionModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

/**
 * Starts the game with given categories
 * @param {Object} categories - Object mapping category names to IDs
 */
function startGame(categories) {
    // Disable Start button, enable Reset button
    document.getElementById('startButton').disabled = true;
    document.getElementById('resetButton').disabled = false;

    // Reset score
    currentScore = 0;
    updateScore();

    // Populate the board
    populateBoard(categories);

    // Update status message
    document.getElementById('feedback').textContent = 'Select a question.';

    // Add event listener to submit button inside modal
    document.getElementById('submitResponse').addEventListener('click', checkResponse);
}

/**
 * Populates the game board with categories and point values
 * @param {Object} categories - Object mapping category names to IDs
 */
function populateBoard(categories) {
    const categoryElements = document.querySelectorAll('.category');
    const questionElements = document.querySelectorAll('.question');

    // Populate categories (first row)
    const categoryNames = Object.keys(categories);
    const categoryIds = Object.values(categories);

    categoryElements.forEach((element, index) => {
        if (index < categoryNames.length) {
            element.textContent = categoryNames[index];
        }
    });

    // Populate question cells with point values and data attributes
    const pointValues = [10, 20, 30, 40, 50];
    questionElements.forEach((element, index) => {
        const row = Math.floor(index / 5);
        const col = index % 5;
        const pointValue = pointValues[row];

        element.textContent = pointValue;
        element.id = `question-${index}`;

        // Add data attributes for API calls
        element.setAttribute('data-cat', categoryIds[col]);

        // Map point values to difficulty levels
        let difficulty;
        switch (pointValue) {
            case 10:
                difficulty = 'easy';
                break;
            case 50:
                difficulty = 'hard';
                break;
            default: // 20, 30, 40
                difficulty = 'medium';
                break;
        }
        element.setAttribute('data-difficulty', difficulty);

        // Add click event listener (now calls loadQuestion instead of viewQuestion)
        element.addEventListener('click', function() {
            loadQuestion(index, pointValue);
        });
    });
}

/**
 * Displays the question modal with API response data
 * @param {Object} response - API response object containing question data
 */
function viewQuestion(response) {
    const questionData = response.results[0];

    // Decode HTML entities in question and answers
    const question = decodeHTML(questionData.question);
    const correctAnswer = decodeHTML(questionData.correct_answer);
    const incorrectAnswers = questionData.incorrect_answers.map(answer => decodeHTML(answer));

    // Create answers array with all options
    const allAnswers = [
        { text: correctAnswer, correct: true },
        ...incorrectAnswers.map(answer => ({ text: answer, correct: false }))
    ];

    // Shuffle answers
    const shuffledAnswers = shuffle([...allAnswers]);

    // Display question in modal
    document.getElementById('questionText').textContent = question;

    // Generate answer options
    const answersContainer = document.getElementById('answers');
    answersContainer.innerHTML = '';

    shuffledAnswers.forEach((answer, index) => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'answer';
        input.value = answer.correct ? 'correct' : answer.text;

        label.appendChild(input);
        label.appendChild(document.createTextNode(answer.text));
        answersContainer.appendChild(label);
    });

    // Reset status message
    document.getElementById('feedback').textContent = 'Select a question.';

    // Show modal
    document.getElementById('questionModal').style.display = 'block';
}

/**
 * Checks the submitted response and updates score
 */
function checkResponse() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');

    if (!selectedAnswer) {
        alert('Please select an answer.');
        return;
    }

    const pointValue = parseInt(localStorage.getItem('currentPoints'));
    const isCorrect = selectedAnswer.value === 'correct';

    // Find the correct answer text
    const correctLabel = document.querySelector('input[value="correct"]').parentNode;
    const correctText = correctLabel.textContent;

    if (isCorrect) {
        currentScore += pointValue;
        document.getElementById('feedback').textContent = `Correct, the answer is ${correctText}!`;
    } else {
        currentScore -= pointValue;
        document.getElementById('feedback').textContent = `Wrong. The correct answer is: ${correctText}`;
    }

    // Update score display
    updateScore();

    // Clear the clicked question cell
    const questionElement = document.getElementById(`question-${currentQuestionIndex}`);
    questionElement.textContent = '';
    questionElement.style.cursor = 'default';

    // Remove event listener from the clicked cell
    questionElement.replaceWith(questionElement.cloneNode(true));

    // Close modal
    document.getElementById('questionModal').style.display = 'none';
}

/**
 * Resets the game to initial state
 */
function resetGame() {
    // Reset score
    currentScore = 0;
    updateScore();

    // Clear all question cells
    const questionElements = document.querySelectorAll('.question');
    questionElements.forEach(element => {
        element.textContent = '';
        element.removeAttribute('id');
        element.style.cursor = 'pointer';
        // Remove any existing event listeners by cloning
        element.replaceWith(element.cloneNode(true));
    });

    // Clear all category cells
    const categoryElements = document.querySelectorAll('.category');
    categoryElements.forEach(element => {
        element.textContent = '';
    });

    // Reset button states
    document.getElementById('startButton').disabled = false;
    document.getElementById('resetButton').disabled = true;

    // Reset status message
    document.getElementById('feedback').textContent = 'Click Start to begin.';

    // Close modal if open
    document.getElementById('questionModal').style.display = 'none';
}

/**
 * Updates the score display
 */
function updateScore() {
    document.getElementById('total').textContent = currentScore;
}

/**
 * Shuffles an array (Fisher-Yates algorithm)
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Fetches an API token from Open Trivia Database
 */
function setToken() {
    // Update status to show we're fetching token
    document.getElementById('feedback').textContent = 'Setting up game...';

    $.ajax({
        url: 'https://opentdb.com/api_token.php?command=request',
        method: 'GET',
        dataType: 'json'
    })
    .done(function(data) {
        if (data.response_code === 0) {
            localStorage.setItem('triviaToken', data.token);
            loadCategories();
        } else {
            document.getElementById('feedback').textContent = 'Error setting up game. Please try again.';
        }
    })
    .fail(function() {
        document.getElementById('feedback').textContent = 'Error connecting to trivia service. Please try again.';
    });
}

/**
 * Loads categories from the API and starts the game
 */
function loadCategories() {
    // Update status message
    document.getElementById('feedback').textContent = 'Loading categories...';

    $.ajax({
        url: 'https://opentdb.com/api_category.php',
        method: 'GET',
        dataType: 'json'
    })
    .done(function(data) {
        if (data.trivia_categories && data.trivia_categories.length > 0) {
            // Randomly select 5 categories
            const shuffledCategories = shuffle([...data.trivia_categories]);
            const selectedCategories = shuffledCategories.slice(0, 5);

            // Build categories object mapping name to ID
            const categoriesObject = {};
            selectedCategories.forEach(category => {
                categoriesObject[category.name] = category.id;
            });

            // Store for later use
            localStorage.setItem('activeCategories', JSON.stringify(categoriesObject));

            // Start the game with real categories
            startGame(categoriesObject);
        } else {
            document.getElementById('feedback').textContent = 'Error loading categories. Please try again.';
        }
    })
    .fail(function() {
        document.getElementById('feedback').textContent = 'Error loading categories. Please try again.';
    });
}

/**
 * Loads a specific question from the API based on category and difficulty
 * @param {number} index - The index of the clicked question
 * @param {number} pointValue - The point value of the question
 */
function loadQuestion(index, pointValue) {
    const clickedElement = document.getElementById(`question-${index}`);
    const categoryId = clickedElement.getAttribute('data-cat');
    const difficulty = clickedElement.getAttribute('data-difficulty');

    // Store current question index and point value
    currentQuestionIndex = index;
    localStorage.setItem('currentPoints', pointValue);

    // Update status message
    document.getElementById('feedback').textContent = 'Loading question...';

    const token = localStorage.getItem('triviaToken');

    $.ajax({
        url: 'https://opentdb.com/api.php',
        method: 'GET',
        data: {
            amount: 1,
            category: categoryId,
            difficulty: difficulty,
            type: 'multiple',
            token: token
        },
        dataType: 'json'
    })
    .done(function(data) {
        if (data.response_code === 0 && data.results && data.results.length > 0) {
            viewQuestion(data);
        } else {
            document.getElementById('feedback').textContent = 'Error loading question. Please try another.';
        }
    })
    .fail(function() {
        document.getElementById('feedback').textContent = 'Error loading question. Please try another.';
    });
}

/**
 * Decodes HTML entities in strings
 * @param {string} str - String with HTML entities
 * @returns {string} Decoded string
 */
function decodeHTML(str) {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
}