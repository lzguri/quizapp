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
    const selectAllCheckbox = document.getElementById("selectAll");
    
    // Get the disable sound and night mode checkboxes
    const menuButton = document.getElementById("menuButton");
    const menuContent = document.getElementById("menuContent");
    const toggleSoundCheckbox = document.getElementById("toggleSound");
    const toggleNightModeCheckbox = document.getElementById("toggleNightMode");

    
    


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
          
        // When the "Disable Sound" checkbox is toggled, update soundEnabled accordingly
    toggleSoundCheckbox.addEventListener("change", function() {
        // When checked, sound should be disabled (i.e. soundEnabled = false)
        soundEnabled = !this.checked;
    });

    // When the "Night Mode" checkbox is toggled, add or remove a night mode class on the body
    toggleNightModeCheckbox.addEventListener("change", function() {
        if (this.checked) {
            document.body.classList.add("night-mode");
        } else {
            document.body.classList.remove("night-mode");
        }
    });
        
    
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
    
        // Function to handle "Select All" checkbox behavior
    selectAllCheckbox.addEventListener("change", function () {
        let isChecked = this.checked;
        
        // Select or Deselect all topics and subtopics
        document.querySelectorAll(".topic-checkbox").forEach(topicCheckbox => {
            topicCheckbox.checked = isChecked;
        });

        document.querySelectorAll(".subtopic-checkbox").forEach(subtopicCheckbox => {
            subtopicCheckbox.checked = isChecked;
        });
        
        updateQuestionCount();
    });

    // If any topic or subtopic is selected manually, uncheck "Select All" and allow other selections
    document.querySelectorAll(".topic-checkbox, .subtopic-checkbox").forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            selectAllCheckbox.checked = false;
            document.querySelectorAll(".topic-checkbox").forEach(topicCheckbox => {
                topicCheckbox.disabled = false;
            });
        });
    });


    


    // This function allows for the user to pick topic and subtopics
    function renderTopics() {
        topicsDiv.innerHTML = ""; // Clear existing content
    
        topicsData.forEach((topic, index) => {
            let topicQuestionCount = topic.subtopics.reduce((sum, subtopic) => sum + subtopic.questions.length, 0);
    
            let topicDiv = document.createElement("div");
            topicDiv.classList.add("topic");
            topicDiv.innerHTML = `
                <input type="checkbox" class="topic-checkbox" id="topic-${index}">
                <label for="topic-${index}" class="topic-label">${topic.name}<span style="font-weight: lighter;"> [${topicQuestionCount}] </span></label>
                <div class="subtopics" style="display: none;"></div>
            `;
    
            let subtopicsDiv = topicDiv.querySelector(".subtopics");
            let topicCheckbox = topicDiv.querySelector(".topic-checkbox");
    
            topic.subtopics.forEach((subtopic, subIndex) => {
                let subtopicQuestionCount = subtopic.questions.length;
    
                let subtopicDiv = document.createElement("div");
                subtopicDiv.innerHTML = `
                    <input type="checkbox" class="subtopic-checkbox" id="subtopic-${index}-${subIndex}" data-topic="${index}" data-subtopic="${subIndex}">
                    <label for="subtopic-${index}-${subIndex}">${subtopic.name}<span style="font-weight: lighter;"> [${subtopicQuestionCount}]</span></label>
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


        // Global variable for clinical pearls toggle
    let clinicalPearlsEnabled = true;
    const toggleClinicalPearlsCheckbox = document.getElementById("toggleClinicalPearls");
    if (toggleClinicalPearlsCheckbox) {
    toggleClinicalPearlsCheckbox.addEventListener("change", function() {
        // When checked, clinical pearls are disabled.
        clinicalPearlsEnabled = !this.checked;
    });
    }

    // Helper function to display a clinical pearl using the same bullet formatting as explanations
    function displayClinicalPearl(pearlObj) {
    let pearlDiv = document.createElement("div");
    pearlDiv.classList.add("explanation"); // Reuse same styling as explanation
    // Optionally add an extra class if you want to differentiate visually
    pearlDiv.classList.add("clinical-pearl");

    let pearlText = pearlObj.pearl;
    // Use a regular expression to detect text between ** and format it as bullet points
    let bulletPattern = /\*\*(.*?)\*\*/g;
    let parts = pearlText.split(bulletPattern);
    let finalHTML = "";
    let inBulletList = false;

    parts.forEach((part, index) => {
        if (index % 2 === 0) {
        if (inBulletList) {
            finalHTML += "</ul>"; // Close bullet list if open
            inBulletList = false;
        }
        finalHTML += part;
        } else {
        if (!inBulletList) {
            finalHTML += "<ul style='margin-top: 5px; margin-bottom: 5px;'>";
            inBulletList = true;
        }
        finalHTML += `<li>${part}</li>`;
        }
    });
    if (inBulletList) {
        finalHTML += "</ul>";
    }

    pearlDiv.innerHTML = finalHTML;
    answerChoices.appendChild(pearlDiv);
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
    
        if (isReview) {
            displayExplanation(questionData, userAnswers[currentQuestionIndex]);
        } else if (userAnswers[currentQuestionIndex] !== null) {
            displayExplanation(questionData, userAnswers[currentQuestionIndex]);
        }

                // In showQuestion(), after displaying the question’s explanation:
        if (clinicalPearlsEnabled && questionData.subtopicPearls && questionData.subtopicPearls.length > 0) {
            // With ~25% chance or every 5th question – adjust as needed
            if (Math.random() < 0.25) {
                // Pick a random pearl from this subtopic’s pearls:
                let pearl = questionData.subtopicPearls[Math.floor(Math.random() * questionData.subtopicPearls.length)];
                // Use a function similar to displayExplanation() to render it.
                displayClinicalPearl(pearl);
            }
        }

        if (clinicalPearlsEnabled && questionData.subtopicPearls && questionData.subtopicPearls.length > 0) {
            // For a ratio of roughly 4:1, show a pearl every 5th question.
            if ((currentQuestionIndex + 1) % 5 === 0) {
            let randomIndex = Math.floor(Math.random() * questionData.subtopicPearls.length);
            let pearl = questionData.subtopicPearls[randomIndex];
            displayClinicalPearl(pearl);
            }
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
        //explanationDiv.style.backgroundColor = "lightgreen";
        explanationDiv.style.border = "1px solid #003759";
        explanationDiv.style.padding = '10px';
        explanationDiv.style.fontSize = "14px"
        //explanationDiv.style.borderRadius = "5px"
        //explanationDiv.style.backgroundColor = choice === questionData.correct_answer ? "lightgreen" : "lightcoral";
        explanationDiv.style.backgroundColor = "rgb(234, 243, 252)"

        let explanationText = questionData.explanation;
        let bulletPattern = /\*\*(.*?)\*\*/g; // Detect words or sentences enclosed in **
    
        let parts = explanationText.split(bulletPattern);
        let finalHTML = "";
        let inBulletList = false;

        parts.forEach((part, index) => {
            if (index % 2 === 0) {
                if (inBulletList) {
                    finalHTML += "</ul>"; // Close bullet list if it was open
                    inBulletList = false;
                }
                finalHTML += part;
            } else {
                if (!inBulletList) {
                    finalHTML += "<ul style='margin-top: 5px; margin-bottom: 5px;'>"; // Start bullet list
                    inBulletList = true;
                }
                finalHTML += `<li>${part}</li>`;
            }
        });

        if (inBulletList) {
            finalHTML += "</ul>"; // Ensure any open list is closed properly
        }
    
        explanationDiv.innerHTML = finalHTML;
        answerChoices.appendChild(explanationDiv);
    }

    function disableChoices() {
        const choices = answerChoices.querySelectorAll('input[type="radio"]');
        choices.forEach(choice => {
            choice.disabled = true;
        });
    }




        // Modify the showScore function to apply the requested changes
        function showScore() {
            quizContainer.style.display = "none";
            scorePage.style.display = "block";
          
            let correctAnswers = userAnswers.filter(
              (answer, index) => answer === selectedQuestions[index].correct_answer
            ).length;
            let percentage = ((correctAnswers / selectedQuestions.length) * 100).toFixed(2);
          
            let topicScores = {};
          
            // Build aggregated data
            selectedQuestions.forEach((question, index) => {
              let userAnswer = userAnswers[index];
              let isCorrect = userAnswer === question.correct_answer;
              let status = userAnswer ? (isCorrect ? "correct" : "incorrect") : "unanswered";
          
              let topicName = "Unknown Topic";
              let subtopicName = "Unknown Subtopic";
          
              // Figure out which topic/subtopic each question belongs to
              topicsData.forEach((topic) => {
                topic.subtopics.forEach((subtopic) => {
                  if (subtopic.questions.some((q) => q.question === question.question)) {
                    topicName = topic.name;
                    subtopicName = subtopic.name;
                  }
                });
              });
          
              if (!topicScores[topicName]) {
                topicScores[topicName] = { total: 0, correct: 0, subtopics: {} };
              }
              if (!topicScores[topicName].subtopics[subtopicName]) {
                topicScores[topicName].subtopics[subtopicName] = {
                  total: 0,
                  correct: 0,
                  questions: []
                };
              }
          
              topicScores[topicName].total++;
              topicScores[topicName].subtopics[subtopicName].total++;
              topicScores[topicName].subtopics[subtopicName].questions.push({
                question,
                index,
                status
              });
              if (isCorrect) {
                topicScores[topicName].correct++;
                topicScores[topicName].subtopics[subtopicName].correct++;
              }
            });
          
            // Build a single string of HTML representing the new layout
            function buildTreeView() {
              let html = `
                <h2 style='text-align: center;'>Your overall score: ${Math.round(percentage)}% (${correctAnswers}/${selectedQuestions.length})</h2>
          
                <div class='checkbox-filter-container'>
                  <label><input type='checkbox' id='filterCorrect' checked> Correct</label>
                  <label><input type='checkbox' id='filterIncorrect' checked> Incorrect</label>
                  <label><input type='checkbox' id='filterUnanswered' checked> Unanswered</label>
                </div>
          
                <ul class='score-tree'>
              `;
          
              Object.keys(topicScores).forEach((topic) => {
                let topicData = topicScores[topic];
                let topicPercentage = ((topicData.correct / topicData.total) * 100).toFixed(2);
          
                // Build the topic node
                html += `
                  <li class='tree-node topic-node collapsed'>
                    <!-- The entire block below gets a .tree-node-content to unify background for topic + subtopics -->
                    <div class='tree-node-content'>
                      <div class='tree-node-header'>
                        <span class='tree-toggle-icon'>▶</span>
                        <span class='folder-icon'></span>
                        <span class='tree-label'>
                          ${topic} (${Math.round(topicPercentage)}%)
                        </span>
                      </div>
                      <ul class='subtopic-list' style='display:none;'>
                `;
          
                // Subtopics
                Object.keys(topicData.subtopics).forEach((subtopic) => {
                  let subtopicData = topicData.subtopics[subtopic];
                  let subtopicPercentage = (
                    (subtopicData.correct / subtopicData.total) *
                    100
                  ).toFixed(2);
          
                  html += `
                    <li class='tree-node subtopic-node collapsed'>
                      <div class='tree-node-header'>
                        <span class='tree-toggle-icon'>▶</span>
                        <span class='folder-icon subtopic-folder-icon'></span>
                        <span class='tree-label'>
                          ${subtopic} (${Math.round(subtopicPercentage)}%)
                        </span>
                      </div>
                      <ul class='question-list' style='display:none;'>
                  `;
          
                  // Individual questions
                  subtopicData.questions.forEach((q) => {
                    let { question, index, status } = q;
                    html += `
                      <li class='question-item ${status}'>
                        <a href='#' class='review-question' data-index='${index}'>
                          ${question.question}
                        </a>
                      </li>
                    `;
                  });
          
                  html += `</ul></li>`; // end subtopic node
                });
          
                html += `</ul></div></li>`; // end topic node
              });
          
              html += `</ul>`; // end .score-tree
          
              // "Reset" & "Home" buttons
              html += `
                <button id='resetQuizFinal'>Reset Quiz</button>
                <button id='returnHomeFinal'>Return to Homepage</button>
              `;
          
              return html;
            }
          
            scoreDetails.innerHTML = `<tr><td style="width: 100%;">${buildTreeView()}</td></tr>`;

          
            // Expand/collapse logic for topic/subtopic
            document.querySelectorAll(".tree-node-header").forEach((header) => {
              header.addEventListener("click", function (e) {
                // Don't collapse if user clicks directly on question link
                if (e.target.classList.contains("review-question")) return;
          
                let node = this.closest('.tree-node');
                let toggleIcon = this.querySelector(".tree-toggle-icon");
                let childUL = node.querySelector("ul");
          
                if (node.classList.contains("collapsed")) {
                  node.classList.remove("collapsed");
                  node.classList.add("expanded");
                  toggleIcon.textContent = "[-]";
                  if (childUL) childUL.style.display = "block";
                } else {
                  node.classList.remove("expanded");
                  node.classList.add("collapsed");
                  toggleIcon.textContent = "[+]";
                  if (childUL) childUL.style.display = "none";
                }
              });
            });
          
            // Filter logic
            document.getElementById("filterCorrect").addEventListener("change", filterQuestions);
            document.getElementById("filterIncorrect").addEventListener("change", filterQuestions);
            document.getElementById("filterUnanswered").addEventListener("change", filterQuestions);
          
            function filterQuestions() {
              let showCorrect = document.getElementById("filterCorrect").checked;
              let showIncorrect = document.getElementById("filterIncorrect").checked;
              let showUnanswered = document.getElementById("filterUnanswered").checked;
          
              document.querySelectorAll(".question-item").forEach((item) => {
                if (
                  (item.classList.contains("correct") && showCorrect) ||
                  (item.classList.contains("incorrect") && showIncorrect) ||
                  (item.classList.contains("unanswered") && showUnanswered)
                ) {
                  item.style.display = "list-item";
                } else {
                  item.style.display = "none";
                }
              });
            }
          
            // “Reset Quiz” & “Return Home”
            document.getElementById("resetQuizFinal").addEventListener("click", startQuiz);
            document.getElementById("returnHomeFinal").addEventListener("click", () => location.reload());
          
            // Jump back to question
            document.querySelectorAll(".review-question").forEach((link) => {
              link.addEventListener("click", function (event) {
                event.preventDefault();
                let questionIndex = parseInt(this.dataset.index);
                currentQuestionIndex = questionIndex;
                scorePage.style.display = "none";
                quizContainer.style.display = "block";
                showQuestion(true);
              });
            });
        
          
          

        
        


        

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
    const scorePageBackground = document.getElementById("scorePage");
    const progressBarContent = document.getElementById("progressContainer");
    const dropdownButton = document.querySelector(".dropdown-button");

    

    if (div) {  // Ensure the element exists
        if (window.innerWidth > 768) {
            // Apply styles for desktop screens (greater than 768px)
            div.style.width = '70%';
            div.style.margin = '20px auto';
            div.style.background = 'white';
            div.style.padding = '20px';
            div.style.borderRadius = '5px';
            div.style.boxShadow = '0px 0px 10px gray';
            div.style.textAlign = 'left';
            dropdownButton.style.backgroundColor - "white"
            
            scorePageBackground.style.backgroundColor = 'white'

        } else {
            // Apply styles for mobile screens (768px or smaller)
            div.style.width = 'auto';

            // Remove the extra desktop styles for mobile
            div.style.margin = '';
            div.style.width = '';
            div.style.background = '';
            div.style.padding = '';
            div.style.borderRadius = '';
            div.style.boxShadow = '';
            div.style.textAlign = '';  // Reset to default on mobile
            scorePageBackground.style.backgroundColor = '#f4f4f4';
            
        }
    }
}

const dropdownButton = document.querySelector(".dropdown-button");
const dropdownContent = document.querySelector(".dropdown-content");

// Toggle dropdown on button click
dropdownButton.addEventListener("click", function(event) {
    event.stopPropagation(); // Prevent clicks inside the menu from closing it
    dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
});

// Close dropdown when clicking outside
window.addEventListener("click", function(event) {
    if (!dropdownButton.contains(event.target) && !dropdownContent.contains(event.target)) {
        dropdownContent.style.display = "none";
    }
});


window.addEventListener('resize', adjustDivWidth);
window.addEventListener('load', adjustDivWidth);