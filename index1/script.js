let currentQuestionIndex = 0;
let answers = {}; // Store user's answers
let questions = [];

// Fetch questions from the JSON file
fetch("questions.json")
  .then(response => response.json())
  .then(data => {
    questions = data;
    loadQuestion();
  })
  .catch(error => console.error("Error loading questions:", error));

// Load the current question or show the score if all questions are done
function loadQuestion() {
  const questionBox = document.getElementById("question-box");
  const feedback = document.getElementById("feedback");
  feedback.innerHTML = ""; // Clear previous feedback
  questionBox.innerHTML = ""; // Clear the question box

  if (currentQuestionIndex >= questions.length) {
    // All questions answered, show the score
    showScore();
    return;
  }

  const question = questions[currentQuestionIndex];
  const questionHTML = `
    <br>
    <p> ${question.question}<p>
    ${question.choices
      .map(
        (choice, index) => `
      <label>
        <input type="radio" name="choice" value="${index}" ${
          answers[currentQuestionIndex] === index ? "checked" : ""
        } ${answers[currentQuestionIndex] !== undefined ? "disabled" : ""}>
        ${choice}
      </label><br>
    `
      )
      .join("")}
  `;
  questionBox.innerHTML = questionHTML;

  // Show feedback if the question has been answered
  if (answers[currentQuestionIndex] !== undefined) {
    const selectedAnswer = answers[currentQuestionIndex];
    const correctAnswer = question.correct;
    const feedback = document.getElementById("feedback");

    if (selectedAnswer === correctAnswer) {
      feedback.innerHTML = `<p class="correct">Correct! ${question.explanation}</p>`;
    } else {
      feedback.innerHTML = `<p class="incorrect">Incorrect! ${question.explanation}</p>`;
      document
        .querySelectorAll("input[name='choice']")
        [correctAnswer].parentNode.style.color = "green"; // Highlight correct answer
    }
  }

  // Update navigation buttons
  document.getElementById("prev").disabled = currentQuestionIndex === 0;
  document.getElementById("next").disabled =
    currentQuestionIndex === questions.length - 1 || answers[currentQuestionIndex] === undefined;

  // Disable the Submit button if the question is already answered
  document.getElementById("submit").disabled = answers[currentQuestionIndex] !== undefined;
}

// Handle the Submit button click
document.getElementById("submit").addEventListener("click", () => {
  const selected = document.querySelector("input[name='choice']:checked");
  if (!selected) {
    alert("Please select an answer before submitting.");
    return;
  }

  const selectedAnswer = parseInt(selected.value);
  const question = questions[currentQuestionIndex];
  const feedback = document.getElementById("feedback");

  if (selectedAnswer === question.correct) {
    feedback.innerHTML = `<p class="correct"><span class="wright_answer">Correct!</span> ${question.explanation}</p>`;
  } else {
    feedback.innerHTML = `<p class="incorrect"><span class="incorrect_answer">Incorrect!</span> ${question.explanation}</p>`;
    document
      .querySelectorAll("input[name='choice']")
      [question.correct].parentNode.style.color = "green";
  }

  // Store the user's answer and disable inputs
  answers[currentQuestionIndex] = selectedAnswer;
  document.querySelectorAll("input[name='choice']").forEach(input => {
    input.disabled = true;
  });

  document.getElementById("submit").disabled = true;
  document.getElementById("next").disabled = currentQuestionIndex === questions.length - 1;
});

// Handle the Previous button click
document.getElementById("prev").addEventListener("click", () => {
  currentQuestionIndex--;
  loadQuestion();
});

// Handle the Next button click
document.getElementById("next").addEventListener("click", () => {
  currentQuestionIndex++;
  loadQuestion();
});

// Show the final score
function showScore() {
  const questionBox = document.getElementById("question-box");
  const feedback = document.getElementById("feedback");
  feedback.innerHTML = ""; // Clear feedback

  const totalQuestions = questions.length;
  const correctAnswers = Object.keys(answers).filter(
    index => questions[index].correct === answers[index]
  ).length;

  questionBox.innerHTML = `
    <h2>Quiz Complete!</h2>
    <p>You scored ${correctAnswers} out of ${totalQuestions} (${(
    (correctAnswers / totalQuestions) *
    100
  ).toFixed(2)}%).</p>
    <p>Thank you for taking the quiz!</p>
  `;

  // Hide navigation buttons after completion
  document.querySelector(".navigation-buttons").style.display = "none";
}
