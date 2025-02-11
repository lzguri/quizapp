// Fetch topics and subtopics from JSON
fetch('quiz-data.json')
  .then(response => response.json())
  .then(data => {
    const topicsContainer = document.getElementById('topics-container');
    const topics = [...new Set(data.map(item => item.topic))]; // Get unique topics

    topics.forEach(topic => {
      const topicDiv = document.createElement('div');
      topicDiv.className = 'topic';
      topicDiv.innerHTML = `<h3>${topic}</h3>`;
      const subtopics = data.filter(item => item.topic === topic).map(item => item.subtopic);
      const uniqueSubtopics = [...new Set(subtopics)];

      const subtopicsDiv = document.createElement('div');
      subtopicsDiv.className = 'subtopics';
      uniqueSubtopics.forEach(subtopic => {
        subtopicsDiv.innerHTML += `
          <label>
            <input type="checkbox" value="${subtopic}"> ${subtopic}
          </label><br>
        `;
      });

      topicDiv.appendChild(subtopicsDiv);
      topicsContainer.appendChild(topicDiv);

      // Collapsible functionality
      topicDiv.querySelector('h3').addEventListener('click', () => {
        subtopicsDiv.style.display = subtopicsDiv.style.display === 'none' ? 'block' : 'none';
      });
    });
  });


  document.getElementById('generate-quiz').addEventListener('click', () => {
    const selectedSubtopics = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
      .map(checkbox => checkbox.value);
  
    // Store selected subtopics in localStorage
    localStorage.setItem('selectedSubtopics', JSON.stringify(selectedSubtopics));
    window.location.href = 'quiz.html';
  });


// Fetch selected subtopics from localStorage
const selectedSubtopics = JSON.parse(localStorage.getItem('selectedSubtopics'));

fetch('quiz-data.json')
  .then(response => response.json())
  .then(data => {
    const quizContainer = document.getElementById('quiz-container');
    const questions = data.filter(item => selectedSubtopics.includes(item.subtopic));

    let currentQuestionIndex = 0;

    const displayQuestion = (index) => {
      const question = questions[index];
      quizContainer.innerHTML = `
        <div class="question">
          <h3>${question.question}</h3>
          ${question.choices.map((choice, i) => `
            <label>
              <input type="radio" name="answer" value="${choice}"> ${choice}
            </label><br>
          `).join('')}
        </div>
        <div id="explanation" style="display: none;">${question.explanation}</div>
      `;

      // Show explanation when an answer is selected
      quizContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('click', () => {
          document.getElementById('explanation').style.display = 'block';
        });
      });
    };

    displayQuestion(currentQuestionIndex);

    // Next and Previous buttons
    document.getElementById('next').addEventListener('click', () => {
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
      }
    });

    document.getElementById('previous').addEventListener('click', () => {
      if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(currentQuestionIndex);
      }
    });
  });