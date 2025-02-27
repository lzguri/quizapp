document.addEventListener("DOMContentLoaded", () => {
    let topicsData = [];
    let selectedQuestions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let soundEnabled = true;
    let totalQuestions = 0; // ADDED: Store the total number of questions



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
    const limitQuestionsCheckbox = document.getElementById("limitQuestionsCheckbox");
    const allQuestionsCheckbox = document.getElementById("questionAllContainer");
    const questionLimitInput = document.getElementById("questionLimitInput");
    const progressBar = document.getElementById("progressBar"); // Progress bar element
    const endTestButton = document.getElementById("endTest");
    
    


    fetch("questions.json")
        .then(response => response.json())
        .then(data => {
            topicsData = sortTopicsAndSubtopics(data);
            //topicsData = data;
            totalQuestions = countTotalQuestions(topicsData);
            renderTopics();
            updateGenerateQuizButton();
            sortTopicsAndSubtopics();
            
        })
        .catch(error => console.error("Error loading JSON:", error));


        // ADDED: Function to count the total number of questions
    function countTotalQuestions(data) {
            let count = 0;
            data.forEach(topic => {
                topic.subtopics.forEach(subtopic => {
                    count += subtopic.questions.length;
                });
            });
            return count;
        }

    function sortTopicsAndSubtopics(data) {
            // Sort the main topics by 'name'
            data.sort((a, b) => a.name.localeCompare(b.name));
          
            // Sort each topic’s subtopics by 'name'
            data.forEach(topic => {
              topic.subtopics.sort((a, b) => a.name.localeCompare(b.name));
            });
            
            return data;
          }
          
    
        
    
    function playSound(isCorrect) {
            if (!soundEnabled) return; // Stop if sound is disabled
        
            // Create an Audio object
            let sound = new Audio(isCorrect ? "correct.wav" : "incorrect2.mp3");
        
            // Check if the browser allows audio playback
            let playPromise = sound.play();
        
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Chrome Mobile blocked autoplay. Waiting for user interaction...");
                    // Workaround: Wait for the first user interaction (tap)
                    document.addEventListener("click", () => sound.play(), { once: true });
                });
            }
        }
        
        

    function updateGenerateQuizButton() {
            let selectedQuestionsSet = updateQuestionCount(); // ✅ Get selected questions
            let selectedCount = selectedQuestionsSet.size; // ✅ Get total count
            let limitChecked = limitQuestionsCheckbox.checked; // ✅ Check if limit is enabled
            let questionLimit = parseInt(questionLimitInput.value) || 1; // ✅ Get limit input
            let displayLimit = limitChecked ? Math.min(questionLimit, selectedCount) : selectedCount; // ✅ Ensure limit is applied correctly
        
            // ✅ Update the button text
            generateQuizButton.textContent = limitChecked
                ? `Create test (Selected: ${displayLimit} / ${totalQuestions} Questions)`
                : `Create test (Selected: ${selectedCount} / ${totalQuestions} Questions)`;
        
            // ✅ Ensure question limit input reflects the max possible value
            questionLimitInput.max = selectedCount;
        }
        
        
        
        
        
    
        
    questionLimitInput.addEventListener("input", () => {
            let selectedCount = updateQuestionCount().size; // Get the number of selected questions
        
            if (parseInt(questionLimitInput.value) > selectedCount) {
                questionLimitInput.value = selectedCount; // Prevent exceeding selected count
            }
        
            updateGenerateQuizButton();
        });

    limitQuestionsCheckbox.addEventListener("change", () => {
            let selectedCount = updateQuestionCount().size;
        
            questionLimitInput.disabled = !limitQuestionsCheckbox.checked;
        
            if (!limitQuestionsCheckbox.checked) {
                questionLimitInput.value = selectedCount; // Reset to all selected questions
            } else {
                questionLimitInput.value = Math.min(parseInt(questionLimitInput.value) || 0, selectedCount);
            }
        
            updateGenerateQuizButton();
        });
        
        
    
   //let experimentalDiv = document.getElementById("experimental")
    //experimentalDiv.innerHTML = updateQuestionCount(false, true)
    //experimentalDiv.style.color = "red"

    // This function shuffles question and answer choices
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }
        

    // Update progress bar, this function is called with showquiz    
    function updateProgressBar() {
        const progress = (currentQuestionIndex / (selectedQuestions.length - 1)) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // This function will count the number of questions from json file
    function countKeyOccurrences(obj, keyName) {
        let count = 0;
    
        function recurse(currentObj) {
            if (Array.isArray(currentObj)) {
                currentObj.forEach(item => recurse(item));
            } else if (typeof currentObj === 'object' && currentObj !== null) {
                for (let key in currentObj) {
                    if (key === keyName) {
                        count++;
                    }
                    recurse(currentObj[key]); // Recursively check nested objects and arrays
                }
            }
        }
    
        recurse(obj);
        return count;
    }
    


    // This function allows for the user to pick topic and subtopics
    function renderTopics() {
        topicsDiv.innerHTML = ""; // Clear existing content
    
        topicsData.forEach((topic, index) => {
            let topicQuestionCount = topic.subtopics.reduce((sum, subtopic) => sum + subtopic.questions.length, 0);
    
            let topicDiv = document.createElement("div");
            topicDiv.classList.add("topic");
            topicDiv.innerHTML = `
                <input type="checkbox" class="topic-checkbox" id="topic-${index}">
                <label for="topic-${index}" class="topic-label">${topic.name} [${topicQuestionCount}]</label>
                <div class="subtopics" style="display: none;"></div>
            `;
    
            let subtopicsDiv = topicDiv.querySelector(".subtopics");
            let topicCheckbox = topicDiv.querySelector(".topic-checkbox");
    
            topic.subtopics.forEach((subtopic, subIndex) => {
                let subtopicQuestionCount = subtopic.questions.length;
    
                let subtopicDiv = document.createElement("div");
                subtopicDiv.innerHTML = `
                    <input type="checkbox" class="subtopic-checkbox" id="subtopic-${index}-${subIndex}" data-topic="${index}" data-subtopic="${subIndex}">
                    <label for="subtopic-${index}-${subIndex}">${subtopic.name} [${subtopicQuestionCount}]</label>
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
    


    function updateQuestionCount(questionsSelected = false, returnSizeOnly = false) {
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
            topicsData[topicIndex].subtopics[subtopicIndex].questions.forEach(q => selectedQuestionsSet.add(JSON.stringify(q)));
        });
    
        // Ensure the question count is updated
        // questionCountDisplay.textContent = `Questions Selected: ${selectedQuestionsSet.size}`;
        generateQuizButton.textContent = `Create test (Selected: ${selectedQuestionsSet.size} / ${totalQuestions} Questions)`
    
        return selectedQuestionsSet; // Ensure function returns the correct count
    }
    

    generateQuizButton.addEventListener("click", () => {
        let selectedQuestionsSet = updateQuestionCount();
        let allQuestions = shuffle(Array.from(selectedQuestionsSet).map(JSON.parse));

        if (allQuestions.length === 0) {
            alert("Please select at least one topic or subtopic.");
            return;
        }

        // Apply question limit if checkbox is checked
        selectedQuestions = limitQuestionsCheckbox.checked ? allQuestions.slice(0, parseInt(questionLimitInput.value)) : allQuestions;

        startQuiz();
    });

    function startQuiz() {
        homepage.style.display = "none";
        quizContainer.style.display = "block";
        scorePage.style.display = "none";
        currentQuestionIndex = 0;
        userAnswers = Array(selectedQuestions.length).fill(null);
        showQuestion();

        // Ensure navigation buttons are re-enabled when restarting
        prevButton.style.display = "none";  // Hide "Previous" at first question
        nextButton.style.display = "inline-block";
        resetButton.style.display = "inline-block";
        returnHomeButton.style.display = "inline-block";
        endTestButton.style.display = "inline-block";
        endTestButton.disabled = false; // Ensure it's clickable
    }

    function showQuestion(isReview = false) {
        let questionData = selectedQuestions[currentQuestionIndex];
        questionTitle.textContent = `${currentQuestionIndex + 1}. ${questionData.question}`;
        questionTitle.style.fontWeight = "normal";
        questionTitle.style.fontSize = "20px";
        answerChoices.innerHTML = "";
    
        let shuffledChoices = shuffle(questionData.choices);
        shuffledChoices.forEach((choice, index) => {
            let choiceDiv = document.createElement("div");
            choiceDiv.classList.add("button-choice");
            choiceDiv.setAttribute("id", `choice-${index}`);
            choiceDiv.textContent = choice;
    
            // Check if the user has already answered this question
            if (isReview || userAnswers[currentQuestionIndex] !== null) {
                if (choice === userAnswers[currentQuestionIndex]) {
                    choiceDiv.classList.add(choice === questionData.correct_answer ? "correct-choice" : "incorrect-choice");
                    choiceDiv.style.pointerEvents = "none"
                }
                if (choice === questionData.correct_answer && choice !== userAnswers[currentQuestionIndex]) {
                    choiceDiv.classList.add("correct-choice"); // Ensure the correct answer is highlighted
                }
            }
    
            choiceDiv.addEventListener("click", () => {
                if (userAnswers[currentQuestionIndex] === null) {
                    userAnswers[currentQuestionIndex] = choice;
                    displayExplanation(questionData, choice);
                    disableChoices();
    
                    let isCorrect = choice === questionData.correct_answer;
                    choiceDiv.classList.add(isCorrect ? "correct-choice" : "incorrect-choice");
            
                    playSound(isCorrect); // ✅ Play sound based on correctness
            
                    if (!isCorrect) {
                        shuffledChoices.forEach((correctChoice, correctIndex) => {
                            if (correctChoice === questionData.correct_answer) {
                                document.querySelector(`#choice-${correctIndex}`).classList.add("correct-choice");
                            }
                        });
                    }
                }
            });
    
            answerChoices.appendChild(choiceDiv);
        });
    
        if (userAnswers[currentQuestionIndex] !== null) {
            displayExplanation(questionData, userAnswers[currentQuestionIndex]);
        }

        if (isReview) {
            prevButton.remove();
            prevButton.style.display = "none";
            nextButton.disabled = true;
            nextButton.style.display = "none";
            resetButton.disabled = true;
            resetButton.style.display = "none";
            returnHomeButton.disabled = true;
            returnHomeButton.style.display = "none";
            endTestButton.disabled = true;
            endTestButton.style.display = "none";
        
            let backToScoreButton = document.createElement("button");
            backToScoreButton.textContent = "Back to Score Page";
            backToScoreButton.addEventListener("click", () => {
                quizContainer.style.display = "none";
                scorePage.style.display = "block";
        
                // Re-enable buttons when returning to the score page
                prevButton.disabled = false;
                nextButton.disabled = false;
                resetButton.disabled = false;
                returnHomeButton.disabled = false;
            });
            answerChoices.appendChild(backToScoreButton);
        }
        
    
        updateButtons();
        updateProgressBar();
    }

    
    
    endTestButton.addEventListener("click", () => {
        showScore(); 
      });
    
    function updateButtons() {
        prevButton.style.display = currentQuestionIndex > 0 ? "inline-block" : "none";
        nextButton.textContent = currentQuestionIndex === selectedQuestions.length - 1 ? "Submit Quiz" : "Next";
    }

    function displayExplanation(questionData, choice) {
        let explanationDiv = document.createElement("p");
        explanationDiv.textContent =  questionData.explanation;
        explanationDiv.style.fontWeight = "normal";
        explanationDiv.style.marginTop = "10px";
        explanationDiv.style.backgroundColor = "lightgreen";
        explanationDiv.style.border = '1px solid #003759';
        explanationDiv.style.padding = '10px';
        explanationDiv.style.fontSize = "14px"
        //explanationDiv.style.borderRadius = "5px"
        //explanationDiv.style.backgroundColor = choice === questionData.correct_answer ? "lightgreen" : "lightcoral";
        explanationDiv.style.backgroundColor = '#dcdcdc'
        answerChoices.appendChild(explanationDiv);
    }

    function disableChoices() {
        const choices = answerChoices.querySelectorAll('input[type="radio"]');
        choices.forEach(choice => {
            choice.disabled = true;
        });
    }

// Modify the showScore function to include checkboxes for filtering
function showScore() {
    quizContainer.style.display = "none";
    scorePage.style.display = "block";

    let correctAnswers = userAnswers.filter((answer, index) => answer === selectedQuestions[index].correct_answer).length;
    let percentage = ((correctAnswers / selectedQuestions.length) * 100).toFixed(2);

    let scoreFilter = `
        <h2 style="text-align: center;">Your score is ${percentage}%</h2>
    
        <!-- Add a container around the three checkboxes -->
        <h2 style="text-align: center;">Key concepts</h2>
        <div class="checkbox-filter-container">
        <label>
            <input type="checkbox" id="filterCorrect" checked> Correct
        </label>
        <br>
        <label>
            <input type="checkbox" id="filterIncorrect" checked> Incorrect
        </label>
        <br>
        <label>
            <input type="checkbox" id="filterUnanswered" checked> Unanswered
        </label>
        </div>
        
        <div id="scoreDetailsContainer"></div>
        <button id="resetQuizFinal">Reset Quiz</button>
        <button id="returnHomeFinal">Return to Homepage</button>
    `;

    scoreDetails.innerHTML = scoreFilter;

    function renderScoreDetails() {
        let scoreDetailsContainer = document.getElementById("scoreDetailsContainer");
        scoreDetailsContainer.innerHTML = selectedQuestions.map((question, index) => {
            let userAnswer = userAnswers[index];
            let status = userAnswer === question.correct_answer ? "correct" : (userAnswer ? "incorrect" : "unanswered");
            
            let showCorrect = document.getElementById("filterCorrect").checked;
            let showIncorrect = document.getElementById("filterIncorrect").checked;
            let showUnanswered = document.getElementById("filterUnanswered").checked;

            if ((status === "correct" && !showCorrect) || 
                (status === "incorrect" && !showIncorrect) || 
                (status === "unanswered" && !showUnanswered)) {
                return "";
            }
            
            return `
  <div id="explanation-text" class="score-item ${status}">
    <p>
      
      <strong><a href="#" class="review-question" data-index="${index}">Question ${index + 1}: </a></strong>${question.explanation}
    </p>
  </div>
`;
        }).join("");
    }
    //<p><strong>Question ${index + 1}: ${userAnswer || "Unanswered"}  ${question.correct_answer || "Answered correctly"}</strong> <a href="#" class="review-question" data-index="${index}">Go to the question</a></p>
    // <p><strong>Question ${index + 1}:</strong> <a href="#" class="review-question" data-index="${index}">${question.question}</a></p>
    //<p><strong>Your Answer:</strong> ${userAnswer || "Unanswered"}</p><p><strong>Correct Answer:</strong> ${question.correct_answer}</p>
    //                     <p><strong>Your Answer:</strong> ${userAnswer || "Unanswered"}  <strong>Correct Answer:</strong> ${question.correct_answer}</p>

    //document.getElementById("score-item").style.paddingTop = "0px"

    document.getElementById("filterCorrect").addEventListener("change", renderScoreDetails);
    document.getElementById("filterIncorrect").addEventListener("change", renderScoreDetails);
    document.getElementById("filterUnanswered").addEventListener("change", renderScoreDetails);
    renderScoreDetails();

    document.getElementById("resetQuizFinal").addEventListener("click", startQuiz);
    document.getElementById("returnHomeFinal").addEventListener("click", () => location.reload());

    document.getElementById("scoreDetailsContainer").addEventListener("click", function(event) {
        if (event.target.classList.contains("review-question")) {
            event.preventDefault();
            let questionIndex = parseInt(event.target.getAttribute("data-index"));
            currentQuestionIndex = questionIndex;
            scorePage.style.display = "none";
            quizContainer.style.display = "block";
            showQuestion(true);
        }
    });
}

    

    prevButton.addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion();
        }
    });

    resetButton.addEventListener("click", startQuiz);
    returnHomeButton.addEventListener("click", () => location.reload());

    

    nextButton.addEventListener("click", () => {
        if (currentQuestionIndex < selectedQuestions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
        } else {
            showScore();
        }
    });
});



// Adjust interface according to screen size
function adjustDivWidth() {
    const div = document.getElementById('content');  // Select #content
    const internalMedicine = document.getElementById('internal-medicine'); // Select h1

    if (div) {  // Ensure the element exists
        if (window.innerWidth > 768) {
            // Apply styles for desktop screens (greater than 768px)
            div.style.width = '60%';
            div.style.margin = '20px auto';
            div.style.background = 'white';
            div.style.padding = '20px';
            div.style.borderRadius = '5px';
            div.style.boxShadow = '0px 0px 10px gray';
            div.style.textAlign = 'left';

            if (internalMedicine) {
                internalMedicine.style.textAlign = 'left';  // Ensure h1 is left-aligned on desktop
            }
        } else {
            // Apply styles for mobile screens (768px or smaller)
            div.style.width = '100%';

            if (internalMedicine) {
                internalMedicine.style.textAlign = 'center';  // Center h1 on mobile
                internalMedicine.style.padding = "5px"
            }

            // Remove the extra desktop styles for mobile
            div.style.margin = '';
            div.style.background = '';
            div.style.padding = '';
            div.style.borderRadius = '';
            div.style.boxShadow = '';
            div.style.textAlign = '';  // Reset to default on mobile
        }
    }
}


window.addEventListener('resize', adjustDivWidth);
window.addEventListener('load', adjustDivWidth);
