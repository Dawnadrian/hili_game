// Game configuration and grouping
const groups = { 0: [1,2,3], 1: [4,5], 2: [9,10], 3: [6,7,8] };
const maxFactor = 10;
let groupIndex = 0, correctInGroup = 0, currentQuestion, wrongCount = 0;

// DOM elements and audio
const monstersDiv = document.getElementById('monsters');
const questionDiv = document.getElementById('question');
const helperDiv = document.getElementById('helper');
const choicesDiv = document.getElementById('choices');
const bgMusic = document.getElementById('bg-music');
const cheer = document.getElementById('cheer-sound');
const fail = document.getElementById('fail-sound');

// prepare bg music, will play on first user interaction
bgMusic.volume = 0.2;
function enableBGMusic() {
  bgMusic.play().catch(() => {});
  document.removeEventListener('click', enableBGMusic);
}
document.addEventListener('click', enableBGMusic);

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
    helperDiv.textContent = '';
    choicesDiv.innerHTML = '';
    return;
  }
  currentQuestion = nextQuestion();
  wrongCount = 0;
  monstersDiv.innerHTML = '';
  // display monsters
  for (let i = 0; i < currentQuestion.a; i++) {
    const img = document.createElement('img');
    img.src = 'monster.png';
    img.className = 'monster-img';
    monstersDiv.appendChild(img);
  }
  // show question
  questionDiv.textContent = `× ${currentQuestion.b}`;
  // show immediate tip for special cases
  const { a, b, answer } = currentQuestion;
  if (a === 5 && b === 5) {
    helperDiv.textContent = '5 כפול 5 שווה 25';
  } else if (a === 6 && b === 6) {
    helperDiv.textContent = '6 כפול 6 שווה 36';
  } else if (a === 9 || b === 9) {
    helperDiv.textContent = 'תכפילי בעשר ותורידי את המספר';
  } else if (a === 10 || b === 10) {
    helperDiv.textContent = 'פשוט מוסיפים 0!';
  } else if (a === 1 || b === 1) {
    helperDiv.textContent = 'זה פשוט המספר';
  } else {
    helperDiv.textContent = '';
  }
  // render choices
  choicesDiv.innerHTML = '';
  pickChoices(answer).forEach(v => {
    const bBtn = document.createElement('button');
    bBtn.className = 'choice';
    bBtn.textContent = v;
    bBtn.addEventListener('click', () => checkAnswer(v));
    choicesDiv.appendChild(bBtn);
  });
}

// check answer
function checkAnswer(choice) {
  if (choice === currentQuestion.answer) {
    cheer.currentTime = 0;
    cheer.play().catch(() => {});
    // rotate monsters
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
    wrongCount++;
    // on 2 wrongs in a row, prompt finger button regardless of other tips
    if (wrongCount === 2) {
      // create button to prompt using fingers
      helperDiv.innerHTML = '';
      const fingerBtn = document.createElement('button');
      fingerBtn.className = 'choice';
      fingerBtn.textContent = 'השתמשי באצבעות!';
      fingerBtn.addEventListener('click', () => {
        fingerBtn.remove();
        helperDiv.textContent = '';
        wrongCount = 0;
      });
      helperDiv.appendChild(fingerBtn);
      return;
    }
    // wrong animation
    const btns = [...choicesDiv.children];
    const wrongBtn = btns.find(bBtn => +bBtn.textContent === choice);
    wrongBtn.classList.remove('wrong');
    void wrongBtn.offsetWidth;
    wrongBtn.classList.add('wrong');
  }
}

// init
showQuestion();
