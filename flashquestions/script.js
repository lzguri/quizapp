document.addEventListener("DOMContentLoaded", () => {
    let topicsData = [];
    let selectedQuestions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];

    const homepage = document.getElementById("homepage");
    const quizContainer = document.getElementById("quizContainer");
    const scorePage = document.getElementById("scorePage");
    const topicsDiv = document.getElementById("topics");
    const questionTitle = document.getElementById("questionTitle");
    const answerChoices = document.getElementById("answerChoices");
    const prevButton = document.getElementById("prevQuestion");
    const nextButton = document.getElementById("nextQuestion");
    const resetButton = document.getElementById("resetQuiz");
    const returnHomeButton = document.getElementById("returnHome");
    const generateQuizButton = document.getElementById("generateQuiz");
    const scoreDetails = document.getElementById("scoreDetails");
    const questionCountDisplay = document.getElementById("questionCount");

    fetch("questions.json")
        .then(response => response.json())
        .then(data => {
            topicsData = data;
            renderTopics();
        })
        .catch(error => console.error("Error loading JSON:", error));

        
    function renderTopics() {
        topicsDiv.innerHTML = "";
        topicsData.forEach((topic, index) => {
            let topicDiv = document.createElement("div");
            topicDiv.classList.add("topic");
            topicDiv.innerHTML = `
                <input type="checkbox" class="topic-checkbox" id="topic-${index}">
                <label for="topic-${index}" class="topic-label">${topic.name}</label>
                <div class="subtopics" style="display: none;"></div>
            `;
            let subtopicsDiv = topicDiv.querySelector(".subtopics");
            let topicCheckbox = topicDiv.querySelector(".topic-checkbox");

            topic.subtopics.forEach((subtopic, subIndex) => {
                let subtopicDiv = document.createElement("div");
                subtopicDiv.innerHTML = `
                    <input type="checkbox" class="subtopic-checkbox" id="subtopic-${index}-${subIndex}" data-topic="${index}" data-subtopic="${subIndex}">
                    <label for="subtopic-${index}-${subIndex}">${subtopic.name}</label>
                `;
                subtopicsDiv.appendChild(subtopicDiv);
            });

            topicDiv.querySelector(".topic-label").addEventListener("click", () => {
                subtopicsDiv.style.display = subtopicsDiv.style.display === "none" ? "block" : "none";
            });

            topicCheckbox.addEventListener("change", (e) => {
                let checked = e.target.checked;
                subtopicsDiv.querySelectorAll(".subtopic-checkbox").forEach(subCheckbox => {
                    subCheckbox.checked = checked;
                    subCheckbox.disabled = checked;
                });

                if (checked) {
                    subtopicsDiv.querySelectorAll(".subtopic-checkbox").forEach(subCheckbox => {
                        subCheckbox.checked = false;
                        subCheckbox.disabled = false;
                    });
                }
                updateQuestionCount();
            });

            subtopicsDiv.querySelectorAll(".subtopic-checkbox").forEach(subCheckbox => {
                subCheckbox.addEventListener("change", () => {
                    let anySubtopicChecked = [...subtopicsDiv.querySelectorAll(".subtopic-checkbox")].some(cb => cb.checked);
                    topicCheckbox.checked = false;
                    topicCheckbox.disabled = anySubtopicChecked;
                    updateQuestionCount();
                });
            });

            topicsDiv.appendChild(topicDiv);
        });
    }

    function updateQuestionCount() {
        let selectedQuestionsSet = new Set();

        document.querySelectorAll(".topic-checkbox:checked").forEach(checkbox => {
            let topicIndex = parseInt(checkbox.id.split("-")[1]);
            topicsData[topicIndex].subtopics.forEach(subtopic => {
                subtopic.questions.forEach(q => selectedQuestionsSet.add(JSON.stringify(q)));
            });
        });

        document.querySelectorAll(".subtopic-checkbox:checked").forEach(checkbox => {
            let topicIndex = parseInt(checkbox.dataset.topic);
            let subtopicIndex = parseInt(checkbox.dataset.subtopic);

            let parentTopicCheckbox = document.getElementById(`topic-${topicIndex}`);
            parentTopicCheckbox.checked = false;
            parentTopicCheckbox.disabled = true;

            topicsData[topicIndex].subtopics[subtopicIndex].questions.forEach(q => selectedQuestionsSet.add(JSON.stringify(q)));
        });

        questionCountDisplay.textContent = `Questions Selected: ${selectedQuestionsSet.size}`;
        return selectedQuestionsSet;
    }

    generateQuizButton.addEventListener("click", () => {
        let selectedQuestionsSet = updateQuestionCount();
        selectedQuestions = Array.from(selectedQuestionsSet).map(JSON.parse);

        if (selectedQuestions.length === 0) {
            alert("Please select at least one topic or subtopic.");
            return;
        }

        startQuiz();
    });

    function startQuiz() {
        homepage.style.display = "none";
        quizContainer.style.display = "block";
        scorePage.style.display = "none";
        currentQuestionIndex = 0;
        userAnswers = Array(selectedQuestions.length).fill(null);
        showQuestion();
    }

    function showQuestion() {
        let questionData = selectedQuestions[currentQuestionIndex];
        questionTitle.textContent = `${currentQuestionIndex + 1}. ${questionData.question}`;
        questionTitle.style.fontWeight = "normal";
        questionTitle.style.fontSize = "20px";
        answerChoices.innerHTML = "";

        questionData.choices.forEach((choice, index) => {
            let choiceDiv = document.createElement("div");
            choiceDiv.style.fontSize = "20px";
            choiceDiv.innerHTML = `
                <input class="button-choice" type="button" name="answer" id="choice-${index}" value="${choice}" 
                    ${userAnswers[currentQuestionIndex] !== null ? "checked disabled" : ""}>
                <label for="choice-${index}"></label>
            `;
            choiceDiv.addEventListener("click", () => {
                if (userAnswers[currentQuestionIndex] === null) {
                    userAnswers[currentQuestionIndex] = choice;
                    displayExplanation(questionData, choice);
                    disableChoices();
                }
            });
            answerChoices.appendChild(choiceDiv);
        });

        if (userAnswers[currentQuestionIndex] !== null) {
            displayExplanation(questionData, userAnswers[currentQuestionIndex]);
        }

        updateButtons();
    }

    function updateButtons() {
        prevButton.style.display = currentQuestionIndex > 0 ? "inline-block" : "none";
        nextButton.textContent = currentQuestionIndex === selectedQuestions.length - 1 ? "Submit Quiz" : "Next";
    }

    function displayExplanation(questionData, choice) {
        let explanationDiv = document.createElement("p");
        explanationDiv.textContent = questionData.explanation;
        explanationDiv.style.fontWeight = "normal";
        explanationDiv.style.marginTop = "10px";
        explanationDiv.style.backgroundColor = "lightgreen";
        explanationDiv.style.border = '1px solid black';
        explanationDiv.style.padding = '5px';
        explanationDiv.style.backgroundColor = choice === questionData.correct_answer ? "lightgreen" : "#ff8282";
        answerChoices.appendChild(explanationDiv);
    }

    function disableChoices() {
        const choices = answerChoices.querySelectorAll('input[type="radio"]');
        choices.forEach(choice => {
            choice.disabled = true;
        });
    }

    function showScore() {
        quizContainer.style.display = "none";
        scorePage.style.display = "block";
    
        let correctAnswers = userAnswers.filter((answer, index) => answer === selectedQuestions[index].correct_answer).length;
        let percentage = ((correctAnswers / selectedQuestions.length) * 100).toFixed(2);
    
       /* scoreDetails.innerHTML = `
        <h2 class="score-result">Score: ${correctAnswers} / ${selectedQuestions.length} (${percentage}%)</h2>
        <table class="tableExplanation">
            <thead>
                <tr>
                    <th>Your Answer</th>
                    <th>Correct Answer</th>
                    <th>Explanation</th>
                </tr>
            </thead>
            <tbody>
                ${selectedQuestions.map((question, index) => `
                    <tr style="background-color: ${userAnswers[index] === question.correct_answer ? "lightgreen" : "lightcoral"};">
                        <td>${userAnswers[index] || "No answer"}</td>
                        <td>${question.correct_answer}</td>
                        <td>${question.explanation}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
        <button id="resetQuizFinal">Reset Quiz</button>
        <button id="returnHomeFinal">Return to Homepage</button>
    `;*/
    scoreDetails.innerHTML = `
    <h2>Your score is ${correctAnswers} / ${selectedQuestions.length} (${percentage}%)</h2>
    ${selectedQuestions.map((question, index) => `
        <div style="border: 1px solid ${userAnswers[index] === question.correct_answer ? "green" : "red"}; border-radius: 3px; padding: 4px; margin: 3px 0; background-color: ${userAnswers[index] === question.correct_answer ? "#d4edda" : "#f8d7da"}; font-size: 14px; line-height: 1.2;">
            <p style="margin: 2px 0;"><strong>Question ${index + 1}:</strong> ${userAnswers[index] === question.correct_answer ? "Answered correctly" : "Answered wrong"}</p>
            <p style="margin: 2px 0;"><strong>Question:</strong> ${question.question}</p>
            <p style="margin: 2px 0;"><strong>Explanation:</strong> ${question.explanation}</p>
        </div>

    `).join("")}
     <button id="resetQuizFinal">Reset Quiz</button>
     <button id="returnHomeFinal">Return to Homepage</button>
`;




    
        document.getElementById("resetQuizFinal").addEventListener("click", startQuiz);
        document.getElementById("returnHomeFinal").addEventListener("click", () => location.reload());
    }
    

    prevButton.addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion();
        }
    });

    nextButton.addEventListener("click", () => {
        if (currentQuestionIndex < selectedQuestions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
        } else {
            showScore();
        }
    });
});


function adjustDivWidth() {
    const div = document.getElementById('content');  // Select #content
    if (div) {  // Ensure the element exists
        if (window.innerWidth > 768) {
            div.style.width = '50%';
            div.style.margin = '20px auto';
            div.style.background = 'white';
            div.style.padding = '20px';
            div.style.borderRadius = '10px';
            div.style.boxShadow = '0px 0px 10px gray';
            div.style.textAlign = 'left';
        } else {
            div.style.width = '100%';
        }
    }
}

window.addEventListener('resize', adjustDivWidth);
window.addEventListener('load', adjustDivWidth);
