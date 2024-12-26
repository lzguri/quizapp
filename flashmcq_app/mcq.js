const question = [
    {
        topic: ' Science',
        question: 'What color is the sky ',
        possibleAnswers: [
            'blue',
            'green',
            'yellow',
         ],
        correctAnswer: 'blue ',
    },
    {
        topic: ' Technology',
        question: 'What is the easiest language to learn ',
        possibleAnswers: [
            'javascript',
            'python',
            'java',
         ],
        correctAnswer: 'javascript ',
    }
]


const quizProgress = document.getElementById('quizProgress')
const questionContainer = document.getElementById('questionContainer')
const answerContainer = document.getElementById('answerContainer')


function handleQuestion() {
    question.forEach(question => {
        quizProgress.innerHTML =+ "<span></span>";
    }

    )
}
