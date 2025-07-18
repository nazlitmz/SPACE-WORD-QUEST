let soundEnabled = true;
let alienSoundPopupActive = false;

const wordCollections = {
  easy: [
    { word: "Sun", definition: "The star at the center of our solar system" },
    { word: "Moon", definition: "Earth's natural satellite" },
    { word: "Star", definition: "A luminous celestial body of gas" },
    { word: "Mars", definition: "The red planet, fourth from the Sun" },
    { word: "Sky", definition: "The expanse of space seen from Earth" },
    { word: "UFO", definition: "Unidentified Flying Object" },
    {
      word: "Orbit",
      definition: "The path a celestial body takes around another",
    },
    { word: "Solar", definition: "Related to the Sun" },
    { word: "Earth", definition: "Our home planet, third from the Sun" },
    { word: "Space", definition: "The vast expanse beyond Earth's atmosphere" },
  ],
  medium: [
    { word: "Planet", definition: "A celestial body orbiting a star" },
    {
      word: "Galaxy",
      definition: "A system of stars, gas, and dust bound by gravity",
    },
    {
      word: "Meteor",
      definition: "A space rock burning up in Earth's atmosphere",
    },
    { word: "Rocket", definition: "A vehicle designed for space travel" },
    { word: "Cosmic", definition: "Relating to the universe or cosmos" },
    { word: "Eclipse", definition: "When one celestial body blocks another" },
    {
      word: "Gravity",
      definition: "The force that attracts objects toward each other",
    },
    { word: "Jupiter", definition: "The largest planet in our solar system" },
    { word: "Neptune", definition: "The eighth and outermost planet" },
    { word: "Satellite", definition: "An object orbiting a planet or star" },
  ],
  hard: [
    { word: "Asteroid", definition: "A rocky object orbiting the Sun" },
    { word: "Nebula", definition: "A cloud of gas and dust in space" },
    { word: "Supernova", definition: "The explosive death of a massive star" },
    {
      word: "Quasar",
      definition: "An extremely bright active galactic nucleus",
    },
    { word: "Exoplanet", definition: "A planet outside our solar system" },
    { word: "Pulsar", definition: "A rapidly rotating neutron star" },
    { word: "Constellation", definition: "A group of stars forming a pattern" },
    { word: "Antimatter", definition: "Matter composed of antiparticles" },
    { word: "Wormhole", definition: "A theoretical tunnel through spacetime" },
    { word: "Singularity", definition: "A point of infinite density in space" },
  ],
};

// Game state variables
let currentDifficulty = "medium";
let currentWord = "";
let currentDefinition = "";
let missingIndices = [];
let score = 0;
let streak = 0;
let maxStreak = 0;
let multiplier = 1;
let lives = 3;
let timeLeft = 30;
let timer = null;
let usedWords = [];
let totalWords = 0;
let correctAnswers = 0;
let wordsCompleted = 0;
let maxWords = 25;
let hintsUsed = 0;

// Achievement system
let achievements = [];
let gameStats = {
  bestScore: 0,
  gamesPlayed: 0,
};
// Sound effects (using Web Audio API)
function playSound(type) {
  if (!soundEnabled) return;
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (type === "correct") {
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
  } else if (type === "wrong") {
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(185, audioContext.currentTime + 0.1);
  } else if (type === "achievement") {
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(
      554.37,
      audioContext.currentTime + 0.15
    );
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.3);
  }

  oscillator.type = "square";
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.5
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

//sound toggle function
function toggleSound() {
  soundEnabled = !soundEnabled;

  const soundBtn = document.getElementById("sound-toggle");
  const soundIcon = soundBtn.querySelector(".sound-icon");

  if (soundEnabled) {
    soundIcon.textContent = "🔊";
    soundBtn.classList.remove("muted");
    soundBtn.setAttribute("title", "Mute Sound");
  } else {
    soundIcon.textContent = "😭";
    soundBtn.classList.add("muted");
    soundBtn.setAttribute("title", "Unmute Sound");

    showAlienSoundMessage();
  }
}

// Alien sound popup message
function showAlienSoundMessage() {
  if (alienSoundPopupActive) return;

  alienSoundPopupActive = true;
  const popup = document.getElementById("alien-sound-popup");

  popup.classList.add("show");

  const alien = popup.querySelector(".alien-character");
  alien.style.animation = "alienFloat 2s ease-in-out infinite";

  setTimeout(() => {
    popup.classList.remove("show");
    alienSoundPopupActive = false;
  }, 4000);
}

// Sound button creation
function createSoundToggle() {
  const soundToggle = document.createElement("div");
  soundToggle.id = "sound-toggle";
  soundToggle.className = "sound-toggle";
  soundToggle.title = "Mute Sound";
  soundToggle.onclick = toggleSound;

  soundToggle.innerHTML = `
    <div class="sound-icon">🔊</div>
    <div class="sound-waves">
      <div class="wave wave1"></div>
      <div class="wave wave2"></div>
      <div class="wave wave3"></div>
    </div>
  `;

  document.body.appendChild(soundToggle);
}

function createAlienSoundPopup() {
  const popup = document.createElement("div");
  popup.id = "alien-sound-popup";
  popup.className = "alien-sound-popup";

  popup.innerHTML = `
    <div class="alien-character">👽</div>
    <div class="alien-message">
      <div class="message-title">SILENCE ATTEMPT DETECTED!</div>
      <div class="message-text">You cannot silence me unless I'm trapped in the game!</div>
      <div class="message-subtitle">- Cosmic Entity 👽</div>
    </div>
    <div class="alien-effects">
      <div class="energy-ring"></div>
      <div class="energy-ring"></div>
      <div class="energy-ring"></div>
    </div>
  `;

  document.body.appendChild(popup);
}

function initSoundSystem() {
  createSoundToggle();
  createAlienSoundPopup();
}

// Initialize the game
function initializeGame() {
  updateStats();
  createStarfield();
  createDifficultyButtons();
  initSoundSystem();
}

// Update displayed stats
function updateStats() {
  document.getElementById("best-score").textContent = gameStats.bestScore;
  document.getElementById("games-played").textContent = gameStats.gamesPlayed;
}

// Difficulty selection
function showDifficultySelection() {
  document.getElementById("intro-screen").style.display = "none";
  document.getElementById("difficulty-screen").style.display = "block";
}

function selectDifficulty(difficulty) {
  currentDifficulty = difficulty;

  document.getElementById("intro-screen").style.display = "none";
  document.getElementById("difficulty-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("game-over-screen").style.display = "none";

  document.getElementById("instructions-screen").style.display = "block";

  // Set difficulty parameters
  switch (difficulty) {
    case "easy":
      maxWords = 10;
      timeLeft = 60;
      break;
    case "medium":
      maxWords = 15;
      timeLeft = 45;
      break;
    case "hard":
      maxWords = 20;
      timeLeft = 30;
      break;
  }
}

function backToDifficulty() {
  document.getElementById("instructions-screen").style.display = "none";
  document.getElementById("difficulty-screen").style.display = "block";
}

function backToIntro() {
  document.getElementById("difficulty-screen").style.display = "none";
  document.getElementById("intro-screen").style.display = "block";
}

function startGame() {
  document.getElementById("instructions-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";

  // Reset game state
  score = 0;
  streak = 0;
  maxStreak = 0;
  multiplier = 1;
  lives = 3;
  usedWords = [];
  totalWords = 0;
  correctAnswers = 0;
  wordsCompleted = 0;
  hintsUsed = 0;
  achievements = [];

  updateGameDisplay();
  nextWord();
  startTimer();
}

// Timer functions
function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {
      timeOut();
    } else if (timeLeft <= 10) {
      document.getElementById("timer").classList.add("warning");
    }
  }, 1000);
}

function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById("timer").textContent = `⏱️ ${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function timeOut() {
  clearInterval(timer);
  loseLife();
  showAlienAlert("⏰ TIME'S UP!", "Time ran out, Earthling!");
}

// Life management
function loseLife() {
  lives--;
  streak = 0;
  multiplier = 1;
  updateGameDisplay();

  if (lives <= 0) {
    endGame("MISSION FAILED!", "You ran out of lives, but you fought bravely!");
  } else {
    resetTimer();
    setTimeout(nextWord, 2000);
  }
}

function resetTimer() {
  switch (currentDifficulty) {
    case "easy":
      timeLeft = 60;
      break;
    case "medium":
      timeLeft = 45;
      break;
    case "hard":
      timeLeft = 30;
      break;
  }
  document.getElementById("timer").classList.remove("warning");
  updateTimer();
}

// Word selection and display
function nextWord() {
  if (wordsCompleted >= maxWords) {
    endGame("MISSION COMPLETE!", "Outstanding work, Space Explorer!");
    return;
  }

  const wordPool = wordCollections[currentDifficulty];
  let selectedWord, selectedDefinition;

  // Select unused word
  do {
    const randomIndex = Math.floor(Math.random() * wordPool.length);
    selectedWord = wordPool[randomIndex].word.toLowerCase();
    selectedDefinition = wordPool[randomIndex].definition;
  } while (
    usedWords.includes(selectedWord) &&
    usedWords.length < wordPool.length
  );

  if (usedWords.includes(selectedWord)) {
    // All words used, shuffle and restart
    usedWords = [];
  }

  usedWords.push(selectedWord);
  currentWord = selectedWord;
  currentDefinition = selectedDefinition;

  // Determine missing letters based on difficulty
  missingIndices = [];
  let numMissing;

  switch (currentDifficulty) {
    case "easy":
      numMissing = 1;
      break;
    case "medium":
      numMissing = Math.min(2, Math.floor(currentWord.length / 3));
      break;
    case "hard":
      numMissing = Math.min(3, Math.floor(currentWord.length / 2));
      break;
  }

  // Select random positions for missing letters
  while (missingIndices.length < numMissing) {
    const randomIndex = Math.floor(Math.random() * currentWord.length);
    if (!missingIndices.includes(randomIndex)) {
      missingIndices.push(randomIndex);
    }
  }

  missingIndices.sort((a, b) => a - b);

  displayWordWithBoxes();
  displayDefinition();
  createInputBoxes();
  updateGameDisplay();

  // Reset UI
  document.getElementById("result").textContent = "";
  document.getElementById("hint-btn").disabled = false;

  // Focus first input
  const firstInput = document.querySelector(".guess-input");
  if (firstInput) firstInput.focus();
}

function displayWordWithBoxes() {
  const wordDisplay = document.getElementById("word-display");
  wordDisplay.innerHTML = "";

  for (let i = 0; i < currentWord.length; i++) {
    const letterBox = document.createElement("div");
    letterBox.className = "letter-box";

    if (missingIndices.includes(i)) {
      letterBox.className += " missing";
      letterBox.textContent = "?";
    } else {
      letterBox.textContent = currentWord[i].toUpperCase();
    }

    wordDisplay.appendChild(letterBox);
  }
}

function displayDefinition() {
  document.getElementById(
    "word-definition"
  ).textContent = `💡 ${currentDefinition}`;
}

function createInputBoxes() {
  const inputContainer = document.getElementById("guess-inputs");
  inputContainer.innerHTML = "";

  missingIndices.forEach((index, i) => {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "guess-input";
    input.maxLength = 1;
    input.placeholder = "?";
    input.dataset.index = index; // Store the original word index

    // Auto-advance to next input
    input.addEventListener("input", (e) => {
      if (e.target.value.length === 1) {
        const nextInput = inputContainer.children[i + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }
    });

    // Handle backspace to go to previous input
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && e.target.value === "") {
        const prevInput = inputContainer.children[i - 1];
        if (prevInput) {
          prevInput.focus();
        }
      }
    });

    inputContainer.appendChild(input);
  });
}

// Game mechanics
function checkGuess() {
  const inputs = document.querySelectorAll(".guess-input");
  const letterBoxes = document.querySelectorAll(".letter-box");
  let allCorrect = true;

  // Check if all *enabled* inputs are filled
  const enabledInputs = Array.from(inputs).filter((input) => !input.disabled);
  if (enabledInputs.some((input) => input.value.trim() === "")) {
    showAlienAlert("❗ INCOMPLETE!", "Fill all missing letters!");
    return;
  }

  // Validate only the enabled inputs against their original word index
  enabledInputs.forEach((input) => {
    const wordIndex = parseInt(input.dataset.index); // Get the original word index
    const guess = input.value.trim().toLowerCase();

    const isCorrect = guess === currentWord[wordIndex];

    if (isCorrect) {
      // If correct, update the letter box (only if it was a missing one)
      if (letterBoxes[wordIndex].classList.contains("missing")) {
        letterBoxes[wordIndex].textContent = guess.toUpperCase();
        letterBoxes[wordIndex].classList.remove("missing");
        letterBoxes[wordIndex].classList.add("correct");
      }
    } else {
      allCorrect = false;
    }
  });

  // After checking user inputs, we also need to confirm that any hinted letters are correct.
  // Since `useHint` already fills the correct letter and disables the input,
  // we just need to ensure that `allCorrect` remains true if user input was correct.
  // The `missingIndices` array, after hints are used, will contain only the indices
  // of letters *still requiring user input*. So, if `allCorrect` is true based on
  // the `enabledInputs` (user guesses), it means all *visible* missing letters are correct.
  // We can also double-check the currently *revealed* or *correct* boxes from `missingIndices`
  // if `allCorrect` is true, to make sure the entire word is truly guessed/revealed.

  // A more robust check for `allCorrect` might be to verify all original missing indices.
  // We can reconstruct this by looking at all letter-boxes that were originally 'missing'.
  let finalWordComplete = true;
  for (let i = 0; i < currentWord.length; i++) {
    const letterBox = letterBoxes[i];
    // If a letter box was originally missing (i.e., its index was in the initial missingIndices)
    // it must now be 'correct' or 'revealed'.
    // The missingIndices array is modified, so we can't directly use it for the *original* missing spots.
    // Instead, let's check the current state of all letter-boxes.
    if (letterBox.textContent.toLowerCase() !== currentWord[i].toLowerCase()) {
      finalWordComplete = false;
      break;
    }
  }

  totalWords++;

  if (finalWordComplete) {
    // Use finalWordComplete to decide if the word is fully correct
    correctAnswers++;
    handleCorrectAnswer();
  } else {
    handleWrongAnswer();
  }
}

function handleCorrectAnswer() {
  playSound("correct");

  // Calculate score
  const basePoints = currentWord.length * 10;
  const difficultyBonus = { easy: 1, medium: 1.5, hard: 2 }[currentDifficulty];
  const timeBonus = Math.floor(timeLeft / 5);
  const points = Math.floor(
    (basePoints + timeBonus) * multiplier * difficultyBonus
  );

  score += points;
  streak++;
  maxStreak = Math.max(maxStreak, streak);

  // Update multiplier based on streak
  if (streak >= 10) multiplier = 4;
  else if (streak >= 5) multiplier = 3;
  else if (streak >= 3) multiplier = 2;
  else multiplier = 1;

  // Show combo popup for streaks
  if (streak >= 3) {
    showComboPopup(`COMBO ×${multiplier}!`);
  }

  wordsCompleted++;
  updateGameDisplay();

  document.getElementById("result").innerHTML = `
    ✅ CORRECT! +${points} points<br>
    <small>Word: ${currentWord.toUpperCase()}</small>
  `;

  // Check for achievements
  checkAchievements();

  setTimeout(() => {
    nextWord();
    resetTimer();
  }, 2000);
}

function handleWrongAnswer() {
  playSound("wrong");
  streak = 0;
  multiplier = 1;

  // Clear inputs
  document.querySelectorAll(".guess-input").forEach((input) => {
    // Only clear if not disabled (i.e., not a hinted letter)
    if (!input.disabled) {
      input.value = "";
    }
  });

  loseLife();
  showAlienAlert("👽 WRONG GUESS!", "Try again, Earthling!");
}

function useHint() {
  if (hintsUsed >= 3) {
    showAlienAlert("💡 NO MORE HINTS!", "You've used all your hints!");
    return;
  }

  // Deduct points for hint
  score = Math.max(0, score - 10);
  hintsUsed++;

  // Reveal one random missing letter
  const availableIndices = missingIndices.filter((index) => {
    const letterBox = document.querySelectorAll(".letter-box")[index];
    // Ensure it's still a 'missing' box, not already revealed or correct by user
    return letterBox.classList.contains("missing");
  });

  if (availableIndices.length > 0) {
    const randomIndex =
      availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const letterBoxes = document.querySelectorAll(".letter-box");
    const inputs = document.querySelectorAll(".guess-input");

    letterBoxes[randomIndex].textContent =
      currentWord[randomIndex].toUpperCase();
    letterBoxes[randomIndex].classList.remove("missing");
    letterBoxes[randomIndex].classList.add("revealed");

    // Find the corresponding input box for this revealed letter and fill it
    const correspondingInput = Array.from(inputs).find(
      (input) => parseInt(input.dataset.index) === randomIndex
    );

    if (correspondingInput) {
      correspondingInput.value = currentWord[randomIndex];
      correspondingInput.disabled = true; // Disable the input field
    }

    // Remove from missing indices (as it's now revealed)
    missingIndices = missingIndices.filter((i) => i !== randomIndex);

    updateGameDisplay();
    document.getElementById("result").textContent =
      "💡 Hint used! (-10 points)";

    if (hintsUsed >= 3) {
      document.getElementById("hint-btn").disabled = true;
      document.getElementById("hint-btn").textContent = "💡 NO HINTS LEFT";
    }
  }
}

function passWord() {
  // Reveal all missing letters
  const letterBoxes = document.querySelectorAll(".letter-box");
  // Iterate through the original currentWord to ensure all are revealed
  // since missingIndices only contains currently unguessed letters.
  for (let i = 0; i < currentWord.length; i++) {
    if (
      letterBoxes[i].classList.contains("missing") ||
      letterBoxes[i].classList.contains("revealed")
    ) {
      letterBoxes[i].textContent = currentWord[i].toUpperCase();
      letterBoxes[i].classList.remove("missing");
      letterBoxes[i].classList.add("revealed");
    }
  }

  // Disable and fill all current input boxes
  const inputs = document.querySelectorAll(".guess-input");
  inputs.forEach((input) => {
    const wordIndex = parseInt(input.dataset.index);
    input.value = currentWord[wordIndex];
    input.disabled = true;
  });

  // Clear missingIndices as all are now revealed/passed
  missingIndices = [];

  streak = 0;
  multiplier = 1;
  totalWords++;
  wordsCompleted++;

  document.getElementById("result").innerHTML = `
    ⏭️ SKIPPED!<br>
    <small>Word was: ${currentWord.toUpperCase()}</small>
  `;

  updateGameDisplay();

  setTimeout(() => {
    nextWord();
    resetTimer();
  }, 1500);
}

// Achievement system
function checkAchievements() {
  const newAchievements = [];

  if (streak === 5 && !achievements.includes("streak5")) {
    newAchievements.push({
      id: "streak5",
      title: "🔥 Hot Streak!",
      desc: "Get 5 words correct in a row",
    });
  }

  if (streak === 10 && !achievements.includes("streak10")) {
    newAchievements.push({
      id: "streak10",
      title: "🌟 Unstoppable!",
      desc: "Get 10 words correct in a row",
    });
  }

  if (score >= 500 && !achievements.includes("score500")) {
    newAchievements.push({
      id: "score500",
      title: "💫 Point Master!",
      desc: "Reach 500 points",
    });
  }

  if (score >= 1000 && !achievements.includes("score1000")) {
    newAchievements.push({
      id: "score1000",
      title: "🏆 Cosmic Champion!",
      desc: "Reach 1000 points",
    });
  }

  if (
    hintsUsed === 0 &&
    wordsCompleted >= 10 &&
    !achievements.includes("nohints")
  ) {
    newAchievements.push({
      id: "nohints",
      title: "🧠 Pure Genius!",
      desc: "Complete 10 words without hints",
    });
  }

  newAchievements.forEach((achievement) => {
    achievements.push(achievement.id);
    showAchievement(achievement.title, achievement.desc);
    playSound("achievement");
  });
}

function showAchievement(title, description) {
  const popup = document.getElementById("achievement-popup");
  document.getElementById(
    "achievement-text"
  ).innerHTML = `<strong>${title}</strong><br>${description}`;

  popup.classList.add("show");
  setTimeout(() => {
    popup.classList.remove("show");
  }, 4000);
}

// UI Updates
function updateGameDisplay() {
  document.getElementById("score").textContent = `Score: ${score}`;
  document.getElementById("multiplier").textContent = `×${multiplier}`;
  document.getElementById("streak").textContent = `Streak: ${streak}`;
  document.getElementById("word-counter").textContent =
    wordsCompleted < maxWords
      ? `Word ${wordsCompleted + 1} of ${maxWords}`
      : `✅ Completed`;

  // Update progress bar
  const progress = (wordsCompleted / maxWords) * 100;
  document.getElementById("progress-fill").style.width = `${progress}%`;

  // Update lives
  const heartsDisplay = "❤️".repeat(lives) + "💔".repeat(3 - lives);
  document.getElementById("lives").textContent = heartsDisplay;
}

// Alert functions
function showAlienAlert(title, message) {
  const alertDiv = document.getElementById("alien-alert");
  document.getElementById("alert-message").textContent = title;
  alertDiv.classList.add("show");
  setTimeout(() => alertDiv.classList.remove("show"), 2000);
}

function showComboPopup(text) {
  const popup = document.getElementById("combo-popup");
  document.getElementById("combo-text").textContent = text;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 1500);
}

// Game end
function endGame(title, message) {
  clearInterval(timer);

  // Update stats
  gameStats.gamesPlayed++;
  if (score > gameStats.bestScore) {
    gameStats.bestScore = score;
  }

  // Calculate accuracy
  const accuracy =
    totalWords > 0 ? Math.round((correctAnswers / totalWords) * 100) : 0;

  // Show game over screen
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("game-over-screen").style.display = "block";

  document.getElementById("game-over-title").textContent = title;
  // Display final stats
  document.querySelector(
    "#game-over-screen .final-score .score-value"
  ).textContent = score;
  document.querySelector(
    "#game-over-screen .accuracy .accuracy-value"
  ).textContent = `${accuracy}%`;
  document.querySelector(
    "#game-over-screen .max-streak .streak-value"
  ).textContent = maxStreak;

  document.getElementById("game-over-message").innerHTML = message;

  // Display achievements
  const achievementSection = document.getElementById("achievements");
  if (achievements.length > 0) {
    achievementSection.innerHTML =
      "<h3>🏆 Achievements Unlocked:</h3>" +
      achievements
        .map((id) => {
          const achievementData = getAchievementData(id);
          return `<div class="achievement-item"><span class="icon">${
            achievementData.icon || "✨"
          }</span> <div class="text"><div class="title">${
            achievementData.title
          }</div><div class="description">${
            achievementData.desc
          }</div></div></div>`;
        })
        .join("");
  } else {
    achievementSection.innerHTML = "";
  }
}

function getAchievementData(id) {
  const achievementMap = {
    streak5: {
      title: "🔥 Hot Streak!",
      desc: "Got 5 words correct in a row",
      icon: "🔥",
    },
    streak10: {
      title: "🌟 Unstoppable!",
      desc: "Got 10 words correct in a row",
      icon: "🌟",
    },
    score500: {
      title: "💫 Point Master!",
      desc: "Reached 500 points",
      icon: "💫",
    },
    score1000: {
      title: "🏆 Cosmic Champion!",
      desc: "Reached 1000 points",
      icon: "🏆",
    },
    nohints: {
      title: "🧠 Pure Genius!",
      desc: "Completed 10 words without hints",
      icon: "🧠",
    },
  };
  return (
    achievementMap[id] || {
      title: "🏆 Achievement",
      desc: "Well done!",
      icon: "✨",
    }
  );
}

// Navigation functions
function restartGame() {
  document.getElementById("game-over-screen").style.display = "none";
  startGame();
}

function quitGame() {
  clearInterval(timer);
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("game-over-screen").style.display = "none";
  goToIntro();
}

function goToIntro() {
  document.getElementById("intro-screen").style.display = "block";
  document.getElementById("instructions-screen").style.display = "none";
  document.getElementById("difficulty-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("game-over-screen").style.display = "none";
  updateStats();
}

// Starfield animation
function createStarfield() {
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      speed: Math.random() * 0.7 + 0.2,
      opacity: Math.random(),
    });
  }

  function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let star of stars) {
      star.y += star.speed;
      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }

      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    requestAnimationFrame(animateStars);
  }

  animateStars();

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Event listeners
document.addEventListener("keypress", function (e) {
  if (
    e.key === "Enter" &&
    document.getElementById("game-screen").style.display !== "none"
  ) {
    checkGuess();
  }
});

// Initialize when page loads

document.addEventListener("DOMContentLoaded", initializeGame);
document.addEventListener("DOMContentLoaded", function () {
  // Sadece intro ekranı gözüksün, diğerlerini gizle
  const screens = document.querySelectorAll(".container > div");

  screens.forEach((screen) => {
    screen.style.display = "none";
  });

  // Giriş ekranını görünür yap
  document.getElementById("intro-screen").style.display = "block";
});

document.addEventListener("DOMContentLoaded", function () {
  // Buton event listener
  const startBtn = document.querySelector(".start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", showDifficultySelection);
  }

  const submitBtn = document.querySelector(".submit-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", checkGuess);
  }

  const hintBtn = document.getElementById("hint-btn");
  if (hintBtn) {
    hintBtn.addEventListener("click", useHint);
  }

  const passBtn = document.querySelector(".pass-btn");
  if (passBtn) {
    passBtn.addEventListener("click", passWord);
  }

  const restartBtn = document.querySelector(".restart-btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", restartGame);
  }

  const quitBtn = document.querySelector(".quit-btn");
  if (quitBtn) {
    quitBtn.addEventListener("click", quitGame);
  }
});

// createDifficultyButtons
function createDifficultyButtons() {
  const easyBtn = document.querySelector('[data-difficulty="easy"]');
  const mediumBtn = document.querySelector('[data-difficulty="medium"]');
  const hardBtn = document.querySelector('[data-difficulty="hard"]');

  if (easyBtn)
    easyBtn.addEventListener("click", () => selectDifficulty("easy"));
  if (mediumBtn)
    mediumBtn.addEventListener("click", () => selectDifficulty("medium"));
  if (hardBtn)
    hardBtn.addEventListener("click", () => selectDifficulty("hard"));

  // Back butonlarını ekleyin
  const backFromDifficulty = document.querySelector(
    ".difficulty-screen .back-btn"
  );
  const backFromInstructions = document.querySelector(
    "#instructions-screen .back-btn"
  );

  if (backFromDifficulty) {
    backFromDifficulty.addEventListener("click", backToIntro);
  }

  if (backFromInstructions) {
    backFromInstructions.addEventListener("click", backToDifficulty);
  }
}
