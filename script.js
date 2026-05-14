let userAnswers = {};
let currentType = '';
let currentLevel = '';

function initStoryPage() {
    if (typeof stories === 'undefined') {
        alert('Error: data.js not loaded');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    currentType = urlParams.get('type');
    currentLevel = urlParams.get('level') || 'easy';

    if (!currentType || !stories[currentType] || !stories[currentType][currentLevel]) {
        window.location.href = 'index.html';
        return;
    }

    userAnswers = {};
    const data = stories[currentType][currentLevel];
    const typeNames = { narrative: 'Narrative Text', recount: 'Recount Text', biography: 'Biography Text' };
    const levelNames = { easy: 'Easy', normal: 'Normal', hard: 'Hard', impossible: 'Impossible' };
    const badgeColors = {
        easy: { bg: 'rgba(34,197,94,0.2)', color: '#22c55e' },
        normal: { bg: 'rgba(6,182,212,0.2)', color: '#22d3ee' },
        hard: { bg: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
        impossible: { bg: 'rgba(239,68,68,0.2)', color: '#f87171' }
    };

    document.getElementById('breadcrumb').innerHTML = `
        <a href="index.html">Home</a>
        <span class="separator">›</span>
        <a href="${currentType}-explanation.html">${typeNames[currentType]}</a>
        <span class="separator">›</span>
        <a href="${currentType}-levels.html">${levelNames[currentLevel]}</a>
        <span class="separator">›</span>
        <span class="current">${data.title}</span>
    `;

    const badge = document.getElementById('levelBadge');
    badge.textContent = levelNames[currentLevel] + ' Level';
    badge.style.background = badgeColors[currentLevel].bg;
    badge.style.color = badgeColors[currentLevel].color;

    document.getElementById('storyTitle').textContent = data.title;
    document.getElementById('storyContent').innerHTML = data.story;

    document.getElementById('progressText').textContent = `📖 Reading the story... (${data.questions.length} questions after)`;
    document.getElementById('progressBar').style.width = '30%';

    const quizContainer = document.getElementById('quizContainer');
    let quizHTML = '';
    data.questions.forEach((q, i) => {
        quizHTML += `
            <div class="question-block" id="question${i}">
                <div class="question-number">Question ${i + 1} of ${data.questions.length}</div>
                <div class="question-text">${q.q}</div>
                <div class="options">
                    ${q.options.map((opt, j) => `
                        <button class="option" id="opt${i}_${j}" onclick="selectAnswer(${i}, ${j})">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `;
    });
    quizContainer.innerHTML = quizHTML;
}

function selectAnswer(qIndex, optIndex) {
    const data = stories[currentType][currentLevel];
    for (let j = 0; j < data.questions[qIndex].options.length; j++) {
        document.getElementById(`opt${qIndex}_${j}`).classList.remove('selected');
    }
    document.getElementById(`opt${qIndex}_${optIndex}`).classList.add('selected');
    userAnswers[qIndex] = optIndex;
}

function submitQuiz() {
    const data = stories[currentType][currentLevel];
    let correct = 0;

    data.questions.forEach((q, i) => {
        const selected = userAnswers[i];
        q.options.forEach((_, j) => {
            const btn = document.getElementById(`opt${i}_${j}`);
            btn.style.pointerEvents = 'none';
            if (j === q.answer) btn.classList.add('correct');
            if (selected === j && j !== q.answer) btn.classList.add('wrong');
        });
        if (selected === q.answer) correct++;
    });

    const total = data.questions.length;
    const percentage = Math.round((correct / total) * 100);

    let emoji, message;
    if (percentage === 100) { emoji = '🏆'; message = 'Perfect Score! You are amazing!'; }
    else if (percentage >= 80) { emoji = '🌟'; message = 'Great job! You really understand this!'; }
    else if (percentage >= 60) { emoji = '👍'; message = 'Good effort! Keep practicing!'; }
    else if (percentage >= 40) { emoji = '📚'; message = 'Not bad, but there is room for improvement.'; }
    else { emoji = '💪'; message = "Don't give up! Try reading the story again."; }

    document.getElementById('progressText').textContent = `✅ Quiz Complete!`;
    document.getElementById('progressBar').style.width = '100%';

    document.getElementById('resultContent').innerHTML = `
        <div class="result-container">
            <div class="result-emoji">${emoji}</div>
            <div class="result-score">${correct}/${total}</div>
            <div class="result-text">${message} (${percentage}%)</div>
            <div class="result-buttons">
                <button class="result-btn secondary" onclick="window.location.reload()">🔄 Retry</button>
                <button class="result-btn primary" onclick="window.location.href='${currentType}-levels.html'">📋 Change Level</button>
                <button class="result-btn secondary" onclick="window.location.href='index.html'">🏠 Home</button>
            </div>
        </div>
    `;

    document.getElementById('resultContent').scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('storyContent')) {
        initStoryPage();
        // Set back link dynamically
        document.getElementById('navBack').href = `${currentType}-levels.html`;
    }
});