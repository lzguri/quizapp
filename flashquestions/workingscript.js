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
        let totalQuestions = new Set();

        document.querySelectorAll(".topic-checkbox:checked").forEach(checkbox => {
            let topicIndex = parseInt(checkbox.id.split("-")[1]);
            topicsData[topicIndex].subtopics.forEach(subtopic => {
                subtopic.questions.forEach(q => totalQuestions.add(JSON.stringify(q)));
            });
        });

        document.querySelectorAll(".subtopic-checkbox:checked").forEach(checkbox => {
            let topicIndex = parseInt(checkbox.dataset.topic);
            let subtopicIndex = parseInt(checkbox.dataset.subtopic);
            topicsData[topicIndex].subtopics[subtopicIndex].questions.forEach(q => totalQuestions.add(JSON.stringify(q)));
        });

        questionCountDisplay.textContent = `Questions Selected: ${totalQuestions.size}`;
    }

    generateQuizButton.addEventListener("click", () => {
        selectedQuestions = [];

        document.querySelectorAll(".topic-checkbox:checked").forEach(checkbox => {
            let topicIndex = parseInt(checkbox.id.split("-")[1]);
            topicsData[topicIndex].subtopics.forEach(subtopic => {
                selectedQuestions.push(...subtopic.questions);
            });
        });

        document.querySelectorAll(".subtopic-checkbox:checked").forEach(checkbox => {
            let topicIndex = parseInt(checkbox.dataset.topic);
            let subtopicIndex = parseInt(checkbox.dataset.subtopic);
            selectedQuestions.push(...topicsData[topicIndex].subtopics[subtopicIndex].questions);
        });

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
        answerChoices.innerHTML = "";

        questionData.choices.forEach((choice, index) => {
            let choiceDiv = document.createElement("div");
            choiceDiv.innerHTML = `
                <input type="radio" name="answer" id="choice-${index}" value="${choice}" 
                    ${userAnswers[currentQuestionIndex] !== null ? "checked disabled" : ""}>
                <label for="choice-${index}">${choice}</label>
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
        explanationDiv.style.fontWeight = "bold";
        explanationDiv.style.marginTop = "10px";
        explanationDiv.style.color = choice === questionData.correct_answer ? "green" : "red";
        answerChoices.appendChild(explanationDiv);
    }

    function showScore() {
        quizContainer.style.display = "none";
        scorePage.style.display = "block";

        let correctAnswers = userAnswers.filter((answer, index) => answer === selectedQuestions[index].correct_answer).length;
        let percentage = ((correctAnswers / selectedQuestions.length) * 100).toFixed(2);

        scoreDetails.innerHTML = `
            <h2>Score: ${correctAnswers} / ${selectedQuestions.length} (${percentage}%)</h2>
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
