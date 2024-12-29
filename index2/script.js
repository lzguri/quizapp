// Fetch the quiz data from the JSON file
fetch('questions2.json')
    .then(response => response.json())
    .then(data => initializeQuiz(data));

let currentQuestionIndex = 0;
let userAnswers = [];
let progressHistory = []; // Will store references to appended progress note elements for each question

function initializeQuiz(quizData) {
    displayQuestion(quizData);

    document.getElementById('next-button').addEventListener('click', () => {
        if (userAnswers[currentQuestionIndex] === undefined) {
            alert('Please answer the question before proceeding.');
            return;
        }

        if (currentQuestionIndex < quizData.length - 1) {
            currentQuestionIndex++;
            if (currentQuestionIndex === 1) {
                switchToProgressMode();
            }
            displayQuestion(quizData);
        } else {
            showScore(quizData);
        }
    });

    document.getElementById('previous-button').addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            // Remove the progress lines for the current question before going back
            removeLastProgressLines(currentQuestionIndex);

            currentQuestionIndex--;
            displayQuestion(quizData, true);
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

    if (currentQuestionIndex === 0) {
        // First question: show notes/results/orders again
        showInitialSections();
        updateSection('notes-content', questionData.addNote);
        updateLabsSection(questionData.addLabs);
        //updateSection('orders-content', questionData.addOrders);
    } else {
        // From the second question onwards, only append progress lines if not revisiting
        if (!isRevisit && questionData.addProgress) {
            updateProgressSection(questionData.addProgress);
        }
    }

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
    if (!section) return;

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
    if (!section) return;

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

function updateProgressSection(progressLines) {
    const section = document.getElementById('progress-content');
    if (!section) return;

    const appendedElements = [];

    if (Array.isArray(progressLines)) {
        progressLines.forEach(item => {
            const p = document.createElement('p');
            p.innerHTML = item;
            section.appendChild(p);
            appendedElements.push(p);
        });
    } else {
        const p = document.createElement('p');
        p.innerHTML = progressLines;
        section.appendChild(p);
        appendedElements.push(p);
    }

    // Store appended elements for this question
    progressHistory[currentQuestionIndex] = appendedElements;
}

function removeLastProgressLines(questionIndex) {
    if (progressHistory[questionIndex]) {
        const appendedElements = progressHistory[questionIndex];
        appendedElements.forEach(el => {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        // Clear the stored reference after removal
        progressHistory[questionIndex] = [];
    }
}

function switchToProgressMode() {
    // Hide notes/results/orders sections
    document.getElementById('notes-section').style.display = 'none';
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('orders-section').style.display = 'none';

    // Show progress-section
    const progressSection = document.getElementById('progress-section');
    progressSection.style.display = 'block';
}

function showScore(quizData) {
    const correctAnswers = userAnswers.filter((answer, index) => answer === quizData[index].rightChoice).length;
    const totalQuestions = quizData.length;
    const scoreSection = document.getElementById('score-section');
    const mainSection = document.querySelector('main');
    const percentScore = (correctAnswers / totalQuestions) * 100;

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
    returnButton.className = "return-button";
    returnButton.addEventListener('click', () => {
        scoreSection.style.display = 'none';
        mainSection.style.display = 'block';

        // Reset to the first question
        currentQuestionIndex = 0;

        // Show notes/results/orders again and hide progress note
        showInitialSections();
        document.getElementById('progress-section').style.display = 'none';
        document.getElementById('progress-content').innerHTML = '';

        // Display first question in revisit mode (all answered questions should be reviewable)
        displayQuestion(quizData, true);
    });
    scoreSection.appendChild(returnButton);

    // Add Reset button
    const resetButton = document.createElement('button');
    resetButton.innerText = "Reset Quiz";
    resetButton.className = "reset-button";
    resetButton.addEventListener('click', () => {
        userAnswers = [];
        progressHistory = [];
        currentQuestionIndex = 0;
        scoreSection.style.display = 'none';
        mainSection.style.display = 'block';

        showInitialSections();
        document.getElementById('progress-section').style.display = 'none';
        document.getElementById('progress-content').innerHTML = '';

        displayQuestion(quizData); // Restart with fresh state
    });
    scoreSection.appendChild(resetButton);

    // Hide the main quiz and show the score section
    mainSection.style.display = 'none';
    scoreSection.style.display = 'block';
}

// Helper function to show initial sections (notes, results, orders) and remove collapsed class if any
function showInitialSections() {
    const notesSection = document.getElementById('notes-section');
    const resultsSection = document.getElementById('results-section');
    const ordersSection = document.getElementById('orders-section');
    ordersSection.innerHTML = '';

    notesSection.style.display = '';
    resultsSection.style.display = '';
    ordersSection.style.display = '';

    notesSection.classList.remove('collapsed');
    resultsSection.classList.remove('collapsed');
    
}
