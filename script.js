// Game configuration and grouping
const groups = { 0: [1,2,3], 1: [4,5], 2: [9,10], 3: [6,7,8] };
const maxFactor = 10;
let groupIndex = 0, correctInGroup = 0, currentQuestion;

// DOM elements and audio
const monstersDiv = document.getElementById('monsters');
const questionDiv = document.getElementById('question');
const choicesDiv = document.getElementById('choices');
const bgMusic = document.getElementById('bg-music');
const cheer = document.getElementById('cheer-sound');
const fail = document.getElementById('fail-sound');

// play bg music
bgMusic.volume = 0.2;
bgMusic.play().catch(() => {});

// pick 4 choices
function pickChoices(correct) {
  const opts = new Set([correct]);
  while (opts.size < 4) {
    const delta = Math.floor(Math.random() * 10) - 5;
    const v = correct + delta;
    if (v > 0 && v <= maxFactor * maxFactor) opts.add(v);
  }
  return [...opts].sort(() => Math.random() - 0.5);
}

// next question generator
function nextQuestion() {
  const f = groups[groupIndex];
  const a = f[Math.floor(Math.random() * f.length)];
  const b = Math.ceil(Math.random() * maxFactor);
  return { a, b, answer: a * b };
}

// show question
function showQuestion() {
  if (groupIndex > 3) {
    questionDiv.textContent = 'All done! 🎉';
    monstersDiv.innerHTML = '';
    choicesDiv.innerHTML = '';
    return;
  }
  currentQuestion = nextQuestion();
  monstersDiv.innerHTML = '';
  for (let i = 0; i < currentQuestion.a; i++) {
    const img = document.createElement('img');
    img.src = 'monster.png';
    img.className = 'monster-img';
    monstersDiv.appendChild(img);
  }
  questionDiv.textContent = `× ${currentQuestion.b}`;
  choicesDiv.innerHTML = '';
  pickChoices(currentQuestion.answer).forEach(v => {
    const b = document.createElement('button');
    b.className = 'choice';
    b.textContent = v;
    b.addEventListener('click', () => checkAnswer(v));
    choicesDiv.appendChild(b);
  });
}

// check answer
function checkAnswer(choice) {
  if (choice === currentQuestion.answer) {
    // correct effect
    cheer.currentTime = 0;
    cheer.play().catch(() => {});
    // rotate each monster image
    const imgs = monstersDiv.querySelectorAll('.monster-img');
    imgs.forEach(img => {
      img.classList.remove('monster-dance');
      void img.offsetWidth;
      img.classList.add('monster-dance');
    });

    correctInGroup++;
    if (correctInGroup >= 5) {
      groupIndex++;
      correctInGroup = 0;
    }
    setTimeout(showQuestion, 300);
  } else {
    fail.currentTime = 0;
    fail.play().catch(() => {});
    const btn = [...choicesDiv.children].find(b => +b.textContent === choice);
    btn.classList.remove('wrong');
    void btn.offsetWidth;
    btn.classList.add('wrong');
  }
}

// init
showQuestion();
