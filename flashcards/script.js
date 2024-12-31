// Load the JSON data
fetch('questions.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON data
    })
    .then(data => {
        console.log(data); // Log the data to verify it works
        initializeFlashcards(data); // Pass data to a function to use
    })
    .catch(error => {
        console.error('Error loading JSON file:', error);
    });

// Example function to initialize flashcards
function initializeFlashcards(questions) {
    let currentQuestionIndex = 0;

    const questionElement = document.getElementById('question');
    const answersElement = document.getElementById('answers');
    const explanationElement = document.getElementById('explanation');

    // Function to render a question
    function renderQuestion(index) {
        const question = questions[index];
        questionElement.textContent = question.question;
        
        // Clear previous answers
        answersElement.innerHTML = '';
        question.answers.forEach((answer, i) => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.addEventListener('click', () => {
                checkAnswer(i, question);
            });
            answersElement.appendChild(button);
        });
        explanationElement.textContent = ''; // Clear explanation
    }

    // Function to check the answer
    function checkAnswer(selected, question) {
        if (selected === question.correct) {
            alert('Correct!');
        } else {
            alert('Incorrect!');
        }
        explanationElement.textContent = question.explanation;
    }

    // Navigation logic (if needed)
    document.getElementById('next').addEventListener('click', () => {
        currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
        renderQuestion(currentQuestionIndex);
    });

    // Render the first question
    renderQuestion(currentQuestionIndex);
}
