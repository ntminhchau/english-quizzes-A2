// ===================================================================
// ======================= QUIZ ENGINE LOGIC =========================
// ===================================================================

// Page Elements
const homePage = document.getElementById('home-page');
const quizPage = document.getElementById('quiz-page');
const quizProper = document.getElementById('quiz-proper');
const quizTitleEl = document.getElementById('quiz-title');
const questionCounterEl = document.getElementById('question-counter');
const questionTextEl = document.getElementById('question-text');
const answerButtonsEl = document.getElementById('answer-buttons');
const nextBtn = document.getElementById('next-btn');
const resultsContainer = document.getElementById('results-container');
const scoreTextEl = document.getElementById('score-text');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');

// State
let currentQuizData = {};
let currentQuestionIndex = 0;
let score = 0;
let currentQuizFile = '';

// Function to shuffle an array (Fisher-Yates Shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// UPDATED: Fetches quiz data from a file
function startQuiz(quizFile) {
    currentQuizFile = quizFile;
    
    fetch('quizzes/' + quizFile)
        .then(response => response.json())
        .then(data => {
            const originalQuiz = data;
            const questionsCopy = [...originalQuiz.questions];
            shuffleArray(questionsCopy);
            
            currentQuizData = {
                title: originalQuiz.title,
                questions: questionsCopy
            };

            currentQuestionIndex = 0;
            score = 0;

            homePage.style.display = 'none';
            quizPage.style.display = 'block';
            resultsContainer.style.display = 'none';
            quizProper.style.display = 'block';
            nextBtn.style.display = 'none';
            
            quizTitleEl.innerText = currentQuizData.title;
            
            showNextQuestion();
        })
        .catch(error => {
            console.error('Error loading quiz data:', error);
            alert('Could not load the quiz. Please check the file name and path.');
        });
}

// Shuffles the answers for each question
function showNextQuestion() {
    resetState();
    if (currentQuestionIndex < currentQuizData.questions.length) {
        const questionData = currentQuizData.questions[currentQuestionIndex];
        questionTextEl.innerText = questionData.question;
        questionCounterEl.innerText = `Question ${currentQuestionIndex + 1}/${currentQuizData.questions.length}`;
        
        const shuffledAnswers = [...questionData.answers];
        shuffleArray(shuffledAnswers);

        shuffledAnswers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('btn');
            if (answer.correct) {
                button.dataset.correct = true;
            }
            button.addEventListener('click', selectAnswer);
            answerButtonsEl.appendChild(button);
        });
    } else {
        showResults();
    }
}

function resetState() {
    nextBtn.style.display = 'none';
    while (answerButtonsEl.firstChild) {
        answerButtonsEl.removeChild(answerButtonsEl.firstChild);
    }
}

function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === 'true';

    if (isCorrect) {
        score++;
        selectedBtn.classList.add('correct');
    } else {
        selectedBtn.classList.add('incorrect');
    }

    Array.from(answerButtonsEl.children).forEach(button => {
        if (button.dataset.correct === 'true') {
            button.classList.add('correct');
        }
        button.disabled = true;
    });
    
    nextBtn.style.display = 'block';
}

function showResults() {
    quizProper.style.display = 'none';
    resultsContainer.style.display = 'block';
    scoreTextEl.innerText = `You scored ${score} out of ${currentQuizData.questions.length}!`;
}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    showNextQuestion();
});

restartBtn.addEventListener('click', () => {
    startQuiz(currentQuizFile);
});

homeBtn.addEventListener('click', () => {
    quizPage.style.display = 'none';
    homePage.style.display = 'block';
});
