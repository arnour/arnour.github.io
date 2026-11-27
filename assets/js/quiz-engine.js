(function () {
    const quizConfig = window.__QUIZ__;
    if (!quizConfig) return;

    const standardQuestions = quizConfig.standard;
    const bonusQuestions = quizConfig.bonus;
    const initialBadge = quizConfig.badge;
    const bonusModeBadge = quizConfig.interstitial.bonus_mode_badge;

    let currentQuestion = 0;
    let score = 0;
    let userAnswers = [];
    let isBonusStage = false;

    const pageBody = document.getElementById('page-body');
    const headerBadge = document.getElementById('header-badge');
    const questionCounter = document.getElementById('question-counter');
    const scoreCounter = document.getElementById('score-counter');
    const progressFill = document.getElementById('progress-fill');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackBox = document.getElementById('feedback-box');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackText = document.getElementById('feedback-text');
    const nextBtn = document.getElementById('next-btn');
    const quizScreen = document.getElementById('quiz-screen');
    const interstitialScreen = document.getElementById('interstitial-screen');
    const resultsScreen = document.getElementById('results-screen');
    const startBonusBtn = document.getElementById('start-bonus-btn');
    const finalScore = document.getElementById('final-score');
    const finalTotal = document.getElementById('final-total');
    const finalMessage = document.getElementById('final-message');
    const restartBtn = document.getElementById('restart-btn');
    const reviewContainer = document.getElementById('review-container');
    const debugForceBonusBtn = document.getElementById('debug-force-bonus');

    function getCurrentQuestions() {
        return isBonusStage ? bonusQuestions : standardQuestions;
    }

    function loadQuestion() {
        const questions = getCurrentQuestions();
        const q = questions[currentQuestion];

        questionCounter.textContent = isBonusStage
            ? `Pergunta Bônus ${currentQuestion + 1} de ${bonusQuestions.length}`
            : `Pergunta ${currentQuestion + 1} de ${standardQuestions.length}`;

        scoreCounter.textContent = `Pontuação: ${score}`;
        progressFill.style.width = `${(currentQuestion / questions.length) * 100}%`;

        questionText.textContent = q.q;
        optionsContainer.innerHTML = '';
        feedbackBox.style.display = 'none';
        nextBtn.style.display = 'none';

        const letters = ['A', 'B', 'C', 'D'];
        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span class="option-letter">${letters[idx]}.</span> <span>${opt}</span>`;
            btn.addEventListener('click', () => selectOption(idx, btn));
            optionsContainer.appendChild(btn);
        });
    }

    function selectOption(selectedIndex, selectedBtn) {
        const questions = getCurrentQuestions();
        const q = questions[currentQuestion];
        const buttons = optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach((btn) => { btn.disabled = true; });

        const isCorrect = selectedIndex === q.answer;
        if (isCorrect) {
            selectedBtn.classList.add('correct');
            score++;
            scoreCounter.textContent = `Pontuação: ${score}`;
            feedbackTitle.textContent = '✓ Resposta Correta!';
            feedbackTitle.style.color = 'var(--success)';
            feedbackBox.style.borderLeftColor = 'var(--success)';
        } else {
            selectedBtn.classList.add('incorrect');
            buttons[q.answer].classList.add('correct');
            feedbackTitle.textContent = '✗ Resposta Incorreta';
            feedbackTitle.style.color = 'var(--error)';
            feedbackBox.style.borderLeftColor = 'var(--error)';
        }

        userAnswers.push({
            question: q.q,
            selected: q.options[selectedIndex],
            correct: q.options[q.answer],
            isCorrect,
            explanation: q.explanation,
            isBonus: isBonusStage,
        });

        feedbackText.textContent = q.explanation;
        feedbackBox.style.display = 'block';

        const isLastQuestion = currentQuestion === questions.length - 1;
        if (!isBonusStage && isLastQuestion) {
            nextBtn.textContent = 'Verificar Conquista Bônus →';
        } else {
            nextBtn.textContent = isLastQuestion ? 'Ver Resultados Finais →' : 'Próxima Pergunta →';
        }
        nextBtn.style.display = 'inline-block';
    }

    nextBtn.addEventListener('click', () => {
        const questions = getCurrentQuestions();
        currentQuestion++;
        if (currentQuestion < questions.length) {
            loadQuestion();
        } else if (!isBonusStage) {
            const standardAnswers = userAnswers.filter((a) => !a.isBonus);
            const allCorrect = standardAnswers.every((a) => a.isCorrect);

            if (allCorrect) {
                quizScreen.style.display = 'none';
                interstitialScreen.style.display = 'block';
            } else {
                showResults();
            }
        } else {
            showResults();
        }
    });

    startBonusBtn.addEventListener('click', () => {
        isBonusStage = true;
        currentQuestion = 0;
        pageBody.classList.add('dark-mode');
        headerBadge.textContent = bonusModeBadge;
        headerBadge.classList.add('bonus-tag');
        interstitialScreen.style.display = 'none';
        quizScreen.style.display = 'block';
        loadQuestion();
    });

    if (debugForceBonusBtn) {
        debugForceBonusBtn.addEventListener('click', () => {
            isBonusStage = true;
            currentQuestion = 0;
            score = standardQuestions.length;
            userAnswers = standardQuestions.map((q) => ({
                question: q.q,
                selected: q.options[q.answer],
                correct: q.options[q.answer],
                isCorrect: true,
                explanation: q.explanation,
                isBonus: false,
            }));
            pageBody.classList.add('dark-mode');
            headerBadge.textContent = bonusModeBadge;
            headerBadge.classList.add('bonus-tag');
            interstitialScreen.style.display = 'none';
            resultsScreen.style.display = 'none';
            quizScreen.style.display = 'block';
            loadQuestion();
        });
    }

    function showResults() {
        quizScreen.style.display = 'none';
        interstitialScreen.style.display = 'none';
        resultsScreen.style.display = 'block';

        const totalQuestions = isBonusStage
            ? standardQuestions.length + bonusQuestions.length
            : standardQuestions.length;
        finalScore.textContent = score;
        finalTotal.textContent = `de ${totalQuestions}`;

        const standardScore = userAnswers.filter((a) => !a.isBonus && a.isCorrect).length;
        const bonusScore = userAnswers.filter((a) => a.isBonus && a.isCorrect).length;

        let msg = `Completou as ${standardQuestions.length} questões padrão com ${standardScore}/${standardQuestions.length} acertos.`;
        if (isBonusStage) {
            msg += ` No Modo Bônus de IA, acertou ${bonusScore}/${bonusQuestions.length} questões.`;
        }
        finalMessage.textContent = msg;

        reviewContainer.innerHTML = '<h3>Revisão Completa</h3>';
        userAnswers.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'review-item';
            div.innerHTML = `
            <h4>${idx + 1}. ${item.question} ${item.isBonus ? '<span style="color:var(--bonus-badge); font-size:0.8rem;">[BÔNUS IA]</span>' : ''}</h4>
            <p class="review-meta" style="color: ${item.isCorrect ? 'var(--success)' : 'var(--error)'}; font-weight: 600;">
                A sua resposta: ${item.selected} ${item.isCorrect ? '✓' : '✗'}
            </p>
            ${!item.isCorrect ? `<p class="review-meta" style="color: var(--success); font-weight: 600;">Resposta correta: ${item.correct}</p>` : ''}
            <p class="review-meta" style="margin-top: 0.4rem;"><em>Explicação:</em> ${item.explanation}</p>
        `;
            reviewContainer.appendChild(div);
        });
    }

    restartBtn.addEventListener('click', () => {
        currentQuestion = 0;
        score = 0;
        userAnswers = [];
        isBonusStage = false;
        pageBody.classList.remove('dark-mode');
        headerBadge.textContent = initialBadge;
        headerBadge.classList.remove('bonus-tag');
        resultsScreen.style.display = 'none';
        quizScreen.style.display = 'block';
        loadQuestion();
    });

    loadQuestion();
})();