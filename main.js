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

// --- NEW ---
// This code runs as soon as the page loads
window.addEventListener('load', () => {
    // Look for a 'quiz' parameter in the URL
    const params = new URLSearchParams(window.location.search);
    const quizToLoad = params.get('quiz');

    // If a quiz file is specified in the URL, start that quiz directly
    if (quizToLoad) {
        startQuiz(quizToLoad);
    }
    // Otherwise, the homepage will show by default.
});
// --- END NEW ---


// Function to shuffle an array (Fisher-Yates Shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Fetches quiz data from a file
function startQuiz(quizFile) {
    currentQuizFile = quizFile;
    
    fetch('quizzes/' + quizFile)
        .then(response => {
            if (!response.ok) {
                // If the file is not found or there's an error, throw an error
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
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
            // Show an alert and redirect to the homepage if the quiz file fails to load
            alert('Could not load the quiz. It might not exist. Returning to the homepage.');
            window.location.href = 'index.html'; // Go back to the clean homepage
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
    // When restarting, just use the file name we already have
    startQuiz(currentQuizFile);
});

homeBtn.addEventListener('click', () => {
    // Go back to the homepage by loading the URL without any parameters
    window.location.href = 'index.html';
});
