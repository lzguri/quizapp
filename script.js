let questions = [];
let currentQuestionIndex = 0;
let answers = []; // Tracks user answers

const questionContainer = document.getElementById('questionContainer');
const choicesContainer = document.getElementById('choicesContainer');
const errorText = document.getElementById('errorText');
const explanationText = document.getElementById('explanationText');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');

// Fetch the questions from the JSON file
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        questions = await response.json();
        answers = Array(questions.length).fill(null); // Initialize answer tracking
        renderQuestion();
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

function renderQuestion() {
    if (questions.length === 0) return; // Ensure questions are loaded

    const currentQuestion = questions[currentQuestionIndex];
    questionContainer.textContent = `${currentQuestion.id}. ${currentQuestion.question}`;
    
    choicesContainer.innerHTML = ''; // Clear previous choices
    currentQuestion.choices.forEach((choice, index) => {
        const choiceDiv = document.createElement('div');
        const choiceInput = document.createElement('input');
        choiceInput.type = 'radio';
        choiceInput.name = 'choices';
        choiceInput.value = choice;
        choiceInput.id = `choice${index}`;
        choiceInput.disabled = answers[currentQuestionIndex] !== null; // Freeze answered questions
        
        if (answers[currentQuestionIndex] === choice) {
            choiceInput.checked = true; // Preserve selection
        }

        const choiceLabel = document.createElement('label');
        choiceLabel.htmlFor = `choice${index}`;
        choiceLabel.textContent = choice;

        choiceDiv.appendChild(choiceInput);
        choiceDiv.appendChild(choiceLabel);
        choicesContainer.appendChild(choiceDiv);
    });

    explanationText.textContent = ''; // Clear the explanation
    updateButtons();
    errorText.textContent = ''; // Clear errors
}

function updateButtons() {
    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.disabled = currentQuestionIndex === questions.length - 1;
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

function submitAnswer() {
    const selectedChoice = document.querySelector('input[name="choices"]:checked');
    if (!selectedChoice) {
        errorText.textContent = 'Please select an answer before proceeding!';
        return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    answers[currentQuestionIndex] = selectedChoice.value;

    // Show explanation only if the answer is correct
    if (selectedChoice.value === currentQuestion.answer) {
        explanationText.textContent = `Correct! ${currentQuestion.explanation}`;
    } else {
        explanationText.textContent = ''; // Clear explanation if incorrect
    }

    renderQuestion();
}

loadQuestions(); // Initialize the app
