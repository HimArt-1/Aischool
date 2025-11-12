// Add event listener to run code when the document is ready
document.addEventListener('DOMContentLoaded', () => {

    // Quiz game data and variables
    const questions = [
        { text: "لوحة الموناليزا", answer: "human" },
        { text: "ترجمة فورية من العربية للإنجليزية", answer: "ai" },
        { text: "كتابة رواية كاملة في ساعة واحدة", answer: "ai" },
        { text: "فهم مشاعر الآخرين من نبرة صوتهم", answer: "human" },
        { text: "توليد صورة واقعية لمكان غير موجود", answer: "ai" }
    ];

    let currentQuestionIndex = 0;
    let score = 0;

    // DOM element references
    const questionElement = document.getElementById('question');
    const feedbackElement = document.getElementById('feedback');
    const scoreElement = document.getElementById('score');

    /**
     * Loads the current question into the UI.
     */
    function loadQuestion() {
        if (currentQuestionIndex < questions.length) {
            questionElement.textContent = questions[currentQuestionIndex].text;
            feedbackElement.style.display = 'none'; // Hide feedback for the new question
        } else {
            // End of the game
            questionElement.textContent = "انتهت اللعبة! شكراً لمشاركتك.";
            document.getElementById('check-ai').style.display = 'none';
            document.getElementById('check-human').style.display = 'none';
        }
    }

    /**
     * Checks the user's answer and provides feedback.
     * @param {string} userAnswer - The user's selected answer ('ai' or 'human').
     */
    function checkAnswer(userAnswer) {
        // Prevent answering the same question multiple times
        if (feedbackElement.style.display === 'block') return;

        const correctAnswer = questions[currentQuestionIndex].answer;

        if (userAnswer === correctAnswer) {
            score++;
            feedbackElement.textContent = '✅ إجابة صحيحة! ممتاز!';
            feedbackElement.className = 'quiz-feedback correct';
        } else {
            const correctText = correctAnswer === 'ai' ? 'ذكاء اصطناعي' : 'إنسان';
            feedbackElement.textContent = `❌ خاطئة! الإجابة الصحيحة: ${correctText}`;
            feedbackElement.className = 'quiz-feedback incorrect';
        }

        feedbackElement.style.display = 'block';
        scoreElement.textContent = score;

        // Move to the next question after a delay
        currentQuestionIndex++;
        setTimeout(loadQuestion, 2000);
    }

    /**
     * Shows a simulated AI answer.
     */
    function showAIAnswer() {
        const questionInput = document.getElementById('aiQuestion');
        const answerElement = document.getElementById('aiAnswer');

        if (questionInput.value.trim().length > 0) {
            answerElement.innerHTML = `💡 <strong>إجابة تجريبية:</strong> "${questionInput.value}" هو موضوع مثير للاهتمام! للحصول على إجابات حقيقية، ننصحك بتجربة أحد النماذج المتقدمة في الروابط أعلاه.`;
            answerElement.style.display = 'block';
        }
    }

    // Add event listeners to buttons
    const checkAiButton = document.querySelector("button[onclick=\"checkAnswer('ai')\"]");
    if(checkAiButton) checkAiButton.onclick = () => checkAnswer('ai');

    const checkHumanButton = document.querySelector("button[onclick=\"checkAnswer('human')\"]");
    if(checkHumanButton) checkHumanButton.onclick = () => checkAnswer('human');

    const tryAnswerButton = document.querySelector("button[onclick=\"showAIAnswer()\"]");
    if(tryAnswerButton) tryAnswerButton.onclick = showAIAnswer;

    // Initial load
    loadQuestion();
});