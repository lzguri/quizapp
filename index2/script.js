// Fetch the quiz data from the JSON file
fetch('questions.json')
    .then(response => response.json())
    .then(data => initializeQuiz(data));

let currentQuestionIndex = 0;
let userAnswers = [];

function initializeQuiz(quizData) {
    displayQuestion(quizData);

    document.getElementById('next-button').addEventListener('click', () => {
        if (userAnswers[currentQuestionIndex] === undefined) {
            alert('Please answer the question before proceeding.');
            return;
        }

        if (currentQuestionIndex < quizData.length - 1) {
            currentQuestionIndex++;
            collapseSections(); // Collapse sections instead of hiding them
            displayQuestion(quizData);
        } else {
            showScore(quizData);
        }
    });

    document.getElementById('previous-button').addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(quizData, true); // Pass true to indicate revisiting
        }
    });

    document.getElementById('finish-button').addEventListener('click', () => {
        showScore(quizData);
    });
}

function displayQuestion(quizData, isRevisit = false) {
    const questionData = quizData[currentQuestionIndex];

    // Display question
    document.getElementById('question-container').innerHTML = questionData.question;

    // Display answers
    const answersContainer = document.getElementById('answers-container');
    answersContainer.innerHTML = '';
    questionData.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.innerHTML = answer;
        button.className = 'answer-button';

        if (isRevisit || userAnswers[currentQuestionIndex] !== undefined) {
            // Disable buttons for revisited or answered questions
            button.disabled = true;
            if (index === userAnswers[currentQuestionIndex]) {
                button.classList.add(index === questionData.rightChoice ? 'correct' : 'incorrect');
            }
            if (index === questionData.rightChoice && index !== userAnswers[currentQuestionIndex]) {
                button.classList.add('correct');
            }
        } else {
            button.addEventListener('click', () => handleAnswerSelection(index, quizData));
        }

        answersContainer.appendChild(button);
    });

    // Update notes, results, and orders sections
    updateSection('notes-content', questionData.addNote);
    updateLabsSection(questionData.addLabs);
    updateSection('orders-content', questionData.addOrders);

    // Show explanation for revisited questions
    const explanationContainer = document.getElementById('explanation-container');
    explanationContainer.innerHTML = isRevisit || userAnswers[currentQuestionIndex] !== undefined
        ? (userAnswers[currentQuestionIndex] === questionData.rightChoice
            ? `Correct! ${questionData.explanation}`
            : `Incorrect. The correct answer is: ${questionData.answers[questionData.rightChoice]}. ${questionData.explanation}`)
        : '';

    // Enable/disable navigation buttons
    document.getElementById('previous-button').disabled = currentQuestionIndex === 0;
    document.getElementById('next-button').disabled = userAnswers[currentQuestionIndex] === undefined;
    document.getElementById('finish-button').style.display = currentQuestionIndex === quizData.length - 1 ? 'inline' : 'none';
}

function handleAnswerSelection(selectedIndex, quizData) {
    const questionData = quizData[currentQuestionIndex];

    // Save user answer
    userAnswers[currentQuestionIndex] = selectedIndex;

    // Display explanation
    const explanationContainer = document.getElementById('explanation-container');
    if (selectedIndex === questionData.rightChoice) {
        explanationContainer.innerHTML = `<strong>Correct! </strong> ${questionData.explanation}`;
    } else {
        explanationContainer.innerHTML = `<strong>Incorrect!</strong> The correct answer is: ${questionData.answers[questionData.rightChoice]}. ${questionData.explanation}`;
    }

    // Highlight correct and incorrect answers
    const answerButtons = document.querySelectorAll('.answer-button');
    answerButtons.forEach((button, index) => {
        button.disabled = true;
        if (index === questionData.rightChoice) {
            button.classList.add('correct');
        } else if (index === selectedIndex) {
            button.classList.add('incorrect');
        }
    });

    // Enable next button
    document.getElementById('next-button').disabled = false;
}

function updateSection(sectionId, content) {
    const section = document.getElementById(sectionId);
    if (content) {
        if (Array.isArray(content)) {
            content.forEach(item => {
                const existingItem = Array.from(section.children).find(p => p.innerHTML === item);
                if (!existingItem) {
                    const p = document.createElement('p');
                    p.innerHTML = item;
                    section.appendChild(p);
                }
            });
        } else {
            const existingItem = Array.from(section.children).find(p => p.innerHTML === content);
            if (!existingItem) {
                const p = document.createElement('p');
                p.innerHTML = content;
                section.appendChild(p);
            }
        }
    }
}

function updateLabsSection(labs) {
    const section = document.getElementById('results-content');
    section.innerHTML = ''; // Clear existing content

    if (labs) {
        // Create a table element
        const table = document.createElement('table');
        table.className = 'labs-table';

        // Create table header
        if (labs.header) {
            const headerRow = document.createElement('tr');
            labs.header.forEach(headerText => {
                const headerCell = document.createElement('th');
                headerCell.innerHTML = headerText;
                headerRow.appendChild(headerCell);
            });
            table.appendChild(headerRow);
        }

        // Create table rows
        if (labs.rows && Array.isArray(labs.rows)) {
            labs.rows.forEach(rowData => {
                const row = document.createElement('tr');
                rowData.forEach(cellData => {
                    const cell = document.createElement('td');
                    cell.innerHTML = cellData;
                    row.appendChild(cell);
                });
                table.appendChild(row);
            });
        }

        // Append table to the section
        section.appendChild(table);
    }
}



function collapseSections() {
    const sections = ['notes-section', 'results-section', 'orders-section'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        section.classList.add('collapsed'); // Add collapsed class
    });
}

function showScore(quizData) {
    const correctAnswers = userAnswers.filter((answer, index) => answer === quizData[index].rightChoice).length;
    const totalQuestions = quizData.length;
    const scoreSection = document.getElementById('score-section');
    const mainSection = document.querySelector('main');
    const percentScore = (correctAnswers/totalQuestions)*100

    // Clear previous content in the score section
    scoreSection.innerHTML = `
        <h2>Your Score</h2>
        <p>You scored ${correctAnswers} out of ${totalQuestions}</p>
        <p>Your score <strong>${Math.round(percentScore)} % </strong></p>
    `;

    // Add feedback message
    const feedbackMessage = correctAnswers / totalQuestions > 0.7
        ? "Great job! You have a strong understanding."
        : "Keep practicing to improve your understanding.";
    const feedbackElement = document.createElement('p');
    feedbackElement.innerText = feedbackMessage;
    scoreSection.appendChild(feedbackElement);

    // Add Return button
    const returnButton = document.createElement('button');
    returnButton.innerText = "Return to Quiz";
    returnButton.addEventListener('click', () => {
        scoreSection.style.display = 'none';
        mainSection.style.display = 'block';
        currentQuestionIndex = 0; // Reset to the first question
        displayQuestion(quizData, true); // Enable review mode for all questions
    });
    scoreSection.appendChild(returnButton);

    // Add Reset button
    const resetButton = document.createElement('button');
    resetButton.innerText = "Reset Quiz";
    resetButton.addEventListener('click', () => {
        userAnswers = [];
        currentQuestionIndex = 0;
        scoreSection.style.display = 'none';
        mainSection.style.display = 'block';
        displayQuestion(quizData); // Restart with fresh state
    });
    scoreSection.appendChild(resetButton);

    // Hide the main quiz and show the score section
    mainSection.style.display = 'none';
    scoreSection.style.display = 'block';
}