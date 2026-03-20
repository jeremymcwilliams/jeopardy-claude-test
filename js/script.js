// Global variables
let currentScore = 0;
let currentQuestionIndex = null;

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('startButton').addEventListener('click', function() {
        // For Part 1, we'll use dummy categories
        // In Part 2, this will be replaced with setToken()
        const dummyCategories = {
            'Science': 1,
            'History': 2,
            'Sports': 3,
            'Movies': 4,
            'Geography': 5
        };
        startGame(dummyCategories);
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
    categoryElements.forEach((element, index) => {
        if (index < categoryNames.length) {
            element.textContent = categoryNames[index];
        }
    });

    // Populate question cells with point values
    const pointValues = [10, 20, 30, 40, 50];
    questionElements.forEach((element, index) => {
        const row = Math.floor(index / 5);
        const pointValue = pointValues[row];

        element.textContent = pointValue;
        element.id = `question-${index}`;

        // Add click event listener
        element.addEventListener('click', function() {
            viewQuestion(index, pointValue);
        });
    });
}

/**
 * Displays the question modal when a cell is clicked
 * @param {number} index - The index of the clicked question
 * @param {number} pointValue - The point value of the question
 */
function viewQuestion(index, pointValue) {
    currentQuestionIndex = index;

    // Store current point value for scoring
    localStorage.setItem('currentPoints', pointValue);

    // For Part 1, show dummy question
    // In Part 2, this will be replaced with API data
    const dummyQuestion = `This is a sample question worth ${pointValue} points.`;
    const dummyAnswers = [
        { text: 'Correct Answer', correct: true },
        { text: 'Wrong Answer 1', correct: false },
        { text: 'Wrong Answer 2', correct: false },
        { text: 'Wrong Answer 3', correct: false }
    ];

    // Shuffle answers
    const shuffledAnswers = shuffle([...dummyAnswers]);

    // Display question in modal
    document.getElementById('questionText').textContent = dummyQuestion;

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

    if (isCorrect) {
        currentScore += pointValue;
        document.getElementById('feedback').textContent = 'Correct!';
    } else {
        currentScore -= pointValue;
        // Find the correct answer text
        const correctLabel = document.querySelector('input[value="correct"]').parentNode;
        const correctText = correctLabel.textContent;
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