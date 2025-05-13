// game variables
let score = 0;
let lives = 3;
let level = 1;
let tracker = 0;
let asteroids = [];
let gameActive = false;
let asteroidSpeed = 2.5;
let spawnRate = 2000; // time between asteroid spawns
let spawnTimer;
let gameContainer = document.getElementById("game-container");
let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MAX_ASTEROIDS = 4; // maximum number of asteroids at once
let firstLetterHit = false;

//Bonus Words
const SPECIAL_WORDS = ["BONUS", "EXTRA", "POWER", "LIFE", "SHIELD"];
let currentSpecialWord = "";
let collectedLetters = [];
let specialWordDisplay = document.getElementById("special-word-display");
let isSlowActive = false;
let slowTimer = null;
//Slow Effect I added
const SLOW_DURATION = 5000; // 5 seconds of slow effect
const SLOW_SPEED_MULTIPLIER = 0.5; // Meteors move at half speed during slow effect

// Movement boundaries
const MARGIN = 150; // increased margin from edges
const MIN_BOTTOM = 20;
const MAX_BOTTOM = gameContainer.offsetHeight - 200;

// DOM elements
const scoreDisplay = document.getElementById("score-display");
const livesDisplay = document.getElementById("lives-display");
const levelDisplay = document.getElementById("level-display");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const endGameButton = document.getElementById("end-game");
const playerShip = document.getElementById("player-ship");
const particlesContainer = document.getElementById("particles");
const specialWordContainer = document.getElementById("special-word-container");

// Initialize the game
function initGame() {
  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  specialWordContainer.style.display = "block";
  score = 0;
  lives = 3;
  level = 1;
  asteroids = [];
  gameActive = true;
  asteroidSpeed = 2.5;
  spawnRate = 2000;
  firstLetterHit = false;

  // Reset special word
  setNewSpecialWord();

  // Show and position the ship
  playerShip.style.display = "block";
  playerShip.classList.remove("game-active"); // Remove game-active class if it exists
  playerShip.classList.add("game-started");

  // Add game-active class after initial animation
  setTimeout(() => {
    playerShip.classList.add("game-active");
  }, 1500);

  updateScore();
  updateLives();
  updateLevel();

  // Remove any existing asteroids
  document.querySelectorAll(".asteroid").forEach((a) => a.remove());

  // Start spawning asteroids with a delay to let ship animation complete
  setTimeout(() => {
    spawnTimer = setInterval(spawnAsteroid, spawnRate);
  }, 1500);

  requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop() {
  if (!gameActive) return;

  moveAsteroids();
  checkCollisions();

  requestAnimationFrame(gameLoop);
}

// Set a new special word
function setNewSpecialWord() {
  currentSpecialWord =
    SPECIAL_WORDS[Math.floor(Math.random() * SPECIAL_WORDS.length)];
  collectedLetters = [];
  displaySpecialWord();
}

// Display the special word with collected and uncollected letters
function displaySpecialWord() {
  specialWordDisplay.innerHTML = "";
  for (let letter of currentSpecialWord) {
    const span = document.createElement("span");
    span.className = `special-letter ${
      collectedLetters.includes(letter) ? "collected" : ""
    }`;
    span.textContent = letter;
    specialWordDisplay.appendChild(span);
  }
}

// Spawn a new asteroid
function spawnAsteroid() {
  if (!gameActive) return;

  // Don't spawn if we already have max asteroids
  if (asteroids.length >= MAX_ASTEROIDS) return;

  const asteroid = document.createElement("div");
  asteroid.className = "asteroid";

  // Ensure asteroids don't spawn too close to edges
  const left =
    Math.random() * (gameContainer.offsetWidth - 2 * MARGIN) + MARGIN;
  const top = -60;

  asteroid.style.left = left + "px";
  asteroid.style.top = top + "px";

  // 20% chance to spawn a special word letter if it's not collected yet
  const uncollectedLetters = currentSpecialWord
    .split("")
    .filter((letter) => !collectedLetters.includes(letter));
  let letter;

  if (uncollectedLetters.length > 0 && Math.random() < 0.2) {
    letter =
      uncollectedLetters[Math.floor(Math.random() * uncollectedLetters.length)];
  } else {
    // Normal letter spawn
    let availableLetters = letters
      .split("")
      .filter((letter) => !asteroids.some((a) => a.letter === letter));
    if (availableLetters.length === 0) return;
    letter =
      availableLetters[Math.floor(Math.random() * availableLetters.length)];
  }

  asteroid.textContent = letter;
  asteroid.dataset.letter = letter;

  gameContainer.appendChild(asteroid);
  asteroids.push({
    element: asteroid,
    x: left,
    y: top,
    letter: letter,
  });
}

// asteroids movement ternary operator
function moveAsteroids() {
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];
    // Apply slow effect
    const currentSpeed = isSlowActive
      ? asteroidSpeed * SLOW_SPEED_MULTIPLIER
      : asteroidSpeed;
    asteroid.y += currentSpeed;
    asteroid.element.style.top = asteroid.y + "px";

    // checks if asteroid reached the bottom
    if (asteroid.y > gameContainer.offsetHeight) {
      loseLife();
      asteroid.element.remove();
      asteroids.splice(i, 1);
    }
  }
}

function checkKey(e) {
  if (!gameActive) return;

  const key = e.key.toUpperCase();

  // verifiying the key pressed for asteroids
  for (let i = 0; i < asteroids.length; i++) {
    if (asteroids[i].letter === key) {
      // Move ship towards the asteroid horizontally only
      const asteroid = asteroids[i];
      const asteroidRect = asteroid.element.getBoundingClientRect();
      const containerWidth = gameContainer.offsetWidth;
      const containerHeight = gameContainer.offsetHeight;

      // Calculate target position with stricter boundaries
      const targetX = Math.min(
        Math.max(asteroidRect.left, MARGIN),
        containerWidth - MARGIN
      );

      // Limit movement to middle section of screen horizontally
      const finalX = Math.max(
        MARGIN,
        Math.min(targetX, containerWidth - MARGIN)
      );

      // Calculate the bottom 30% boundary
      const bottomThirtyPercent = containerHeight * 0.7;

      // If this is the first letter hit, move up to the asteroid
      if (!firstLetterHit) {
        firstLetterHit = true;
        playerShip.style.top = asteroidRect.top + "px";

        // After a short delay, move to the bottom 30% of the screen
        setTimeout(() => {
          playerShip.style.top = bottomThirtyPercent + "px";
        }, 500);
      }

      // Move ship horizontally
      playerShip.style.left = finalX + "px";
      playerShip.style.transform = "translateX(-50%)";

      destroyAsteroid(i);
      break;
    }
  }
}

// Destroy asteroid
function destroyAsteroid(index) {
  const asteroid = asteroids[index];
  const letter = asteroid.letter;

  // Check if the letter is part of the special word and not already collected
  if (
    currentSpecialWord.includes(letter) &&
    !collectedLetters.includes(letter)
  ) {
    collectedLetters.push(letter);
    displaySpecialWord();

    // Check if word is completed
    if (collectedLetters.length === currentSpecialWord.length) {
      // Give extra life
      lives++;
      updateLives();

      // Activate slow effect
      isSlowActive = true;

      // Clear existing slow timer if it exists
      if (slowTimer) {
        clearTimeout(slowTimer);
      }

      // Show celebration effects
      const lifeMessage = document.createElement("div");
      lifeMessage.textContent = "+1 LIFE!";
      lifeMessage.className = "celebration-message life-message";
      gameContainer.appendChild(lifeMessage);

      const slowMessage = document.createElement("div");
      slowMessage.textContent = "SLOW EFFECT ACTIVATED!";
      slowMessage.className = "celebration-message slow-message";
      gameContainer.appendChild(slowMessage);

      // Add bonus points for completing word
      const wordBonus = Math.floor(50 * Math.pow(1.2, level));
      score += wordBonus;

      // Show bonus points message
      const bonusMessage = document.createElement("div");
      bonusMessage.textContent = `+${wordBonus} BONUS!`;
      bonusMessage.className = "celebration-message bonus-message";
      gameContainer.appendChild(bonusMessage);

      // Remove celebration messages and deactivate slow effect after duration
      slowTimer = setTimeout(() => {
        lifeMessage.remove();
        slowMessage.remove();
        bonusMessage.remove();
        isSlowActive = false;
        // Set new special word
        setNewSpecialWord();
      }, SLOW_DURATION);
    }
  }

  // explosion effect
  const explosion = document.createElement("div");
  explosion.className = "explosion";
  explosion.style.left = asteroid.x + "px";
  explosion.style.top = asteroid.y + "px";
  gameContainer.appendChild(explosion);

  setTimeout(() => {
    explosion.remove();
  }, 500);

  asteroid.element.remove();
  asteroids.splice(index, 1);

  // Calculate base points using exponential scaling
  const basePoints = Math.floor(10 * Math.pow(1.1, level - 1));

  // Add speed bonus - faster meteors = more points
  const speedMultiplier = Math.max(1, asteroidSpeed / 3); // 3 is initial speed
  const speedBonus = Math.floor(basePoints * (speedMultiplier - 1));

  // Calculate total points for this meteor
  const totalPoints = basePoints + speedBonus;

  // Add points and show point popup
  score += totalPoints;

  // Create floating score indicator
  const scorePopup = document.createElement("div");
  scorePopup.textContent = `+${totalPoints}`;
  scorePopup.style.position = "absolute";
  scorePopup.style.left = `${asteroid.x}px`;
  scorePopup.style.top = `${asteroid.y}px`;
  scorePopup.style.color = "#ffd700";
  scorePopup.style.fontSize = "20px";
  scorePopup.style.fontWeight = "bold";
  scorePopup.style.zIndex = "100";
  scorePopup.style.animation = "floatUp 1s ease-out forwards";
  gameContainer.appendChild(scorePopup);

  // Remove score popup after animation
  setTimeout(() => {
    scorePopup.remove();
  }, 1000);

  updateScore();

  // New level-up threshold calculation using a curve
  const levelUpThreshold = Math.floor(100 * Math.pow(1.2, level));

  if (score >= levelUpThreshold) {
    levelUp();
  }
}

// Level up
function levelUp() {
  level++;
  updateLevel();

  // Calculate speed increase using a more gradual logarithmic progression
  let speedIncrease;

  if (level <= 5) {
    // Early levels: Faster progression
    speedIncrease = 0.3;
  } else if (level <= 10) {
    // Mid levels: Medium progression
    speedIncrease = 0.2 / Math.log10(level + 5);
  } else if (level <= 15) {
    // Higher levels: Slower progression
    speedIncrease = 0.15 / Math.log10(level + 10);
  } else {
    // Very high levels: Very slow progression
    speedIncrease = 0.1 / Math.log10(level + 15);
  }

  // Additional speed reduction for very high levels
  if (level > 15) {
    speedIncrease *= 15 / level; // Further reduce speed increase as levels go up
  }

  // Add the calculated speed increase
  asteroidSpeed += speedIncrease;

  // Lower the maximum speed cap and ensure it's never exceeded
  const MAX_SPEED = 6; // Reduced from 8
  asteroidSpeed = Math.min(asteroidSpeed, MAX_SPEED);

  // Adjust spawn rate more gradually at higher levels
  if (level <= 5) {
    // Early levels: Faster spawn rate reduction
    spawnRate = Math.max(800, spawnRate - 150);
  } else if (level <= 10) {
    // Mid levels: Medium spawn rate reduction
    spawnRate = Math.max(600, spawnRate - 100);
  } else if (level <= 15) {
    // Higher levels: Smaller spawn rate reduction
    spawnRate = Math.max(500, spawnRate - 50);
  } else {
    // Very high levels: Minimal spawn rate reduction
    spawnRate = Math.max(400, spawnRate - 25);
  }

  // Reset the spawn timer with new rate
  clearInterval(spawnTimer);
  spawnTimer = setInterval(spawnAsteroid, spawnRate);

  // Log the current state for debugging
  console.log(
    `Level ${level}: Speed +${speedIncrease.toFixed(
      4
    )} (Total: ${asteroidSpeed.toFixed(2)}) | Spawn Rate: ${spawnRate}ms`
  );
}

// Lose a life
function loseLife() {
  lives--;
  updateLives();

  if (lives <= 0) {
    gameOver();
  } else {
    // Respawn effect
    playerShip.classList.add("respawning");

    // Reset ship horizontal position only, maintain vertical position
    playerShip.style.left = "50%";
    playerShip.style.transform = "translateX(-50%)";

    // Remove respawning class after animation
    setTimeout(() => {
      playerShip.classList.remove("respawning");
    }, 3000);
  }
}

// Check for collisions between asteroids and ship
function checkCollisions() {
  const shipRect = playerShip.getBoundingClientRect();

  // Calculate a smaller hitbox (reduce by 60% of the original size)
  const hitboxReduction = 0.6;
  const hitboxWidth = shipRect.width * (1 - hitboxReduction);
  const hitboxHeight = shipRect.height * (1 - hitboxReduction);

  // Center the smaller hitbox
  const hitboxLeft = shipRect.left + (shipRect.width - hitboxWidth) / 2;
  const hitboxTop = shipRect.top + (shipRect.height - hitboxHeight) / 2;
  const hitboxRight = hitboxLeft + hitboxWidth;
  const hitboxBottom = hitboxTop + hitboxHeight;

  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];
    const asteroidRect = asteroid.element.getBoundingClientRect();

    if (
      hitboxLeft < asteroidRect.right &&
      hitboxRight > asteroidRect.left &&
      hitboxTop < asteroidRect.bottom &&
      hitboxBottom > asteroidRect.top
    ) {
      // Collision detected
      loseLife();
      asteroid.element.remove();
      asteroids.splice(i, 1);
    }
  }
}

// Game over
function gameOver() {
  gameActive = false;
  clearInterval(spawnTimer);
  if (slowTimer) {
    clearTimeout(slowTimer);
  }
  isSlowActive = false;

  // Hide the special word container
  specialWordContainer.style.display = "none";

  // Hide the ship and remove classes
  playerShip.style.display = "none";
  playerShip.classList.remove("game-started", "game-active");

  // Remove all asteroids
  asteroids.forEach((asteroid) => asteroid.element.remove());
  asteroids = [];

  document.getElementById("final-score").textContent = `Your score: ${score}`;
  gameOverScreen.style.display = "block";
}

// Update displays
function updateScore() {
  const formattedScore = score.toLocaleString(); // Add commas for large numbers
  scoreDisplay.textContent = `SCORE: ${formattedScore}`;

  // Update final score display if game over screen is showing
  const finalScoreElement = document.getElementById("final-score");
  if (finalScoreElement && gameOverScreen.style.display === "block") {
    finalScoreElement.textContent = `FINAL SCORE: ${formattedScore}`;
  }
}

function updateLives() {
  livesDisplay.textContent = `LIVES: ${lives}`;
}

function updateLevel() {
  levelDisplay.textContent = `LEVEL: ${level}`;
}

// Event listeners
document.addEventListener("keydown", checkKey);
startButton.addEventListener("click", initGame);
restartButton.addEventListener("click", initGame);
endGameButton.addEventListener("click", function () {
  // Instead of redirecting, just reload the current page
  window.location.reload();
});

const particles = [];
const ACCELERATION = 0.0007; // particles acceleration

// Create particles
for (let i = 0; i < 120; i++) {
  createParticle();
}

function createParticle() {
  const particle = document.createElement("div");
  const size = Math.random() * 5 + 2;

  particle.style.position = "absolute";
  particle.style.width = size + "px";
  particle.style.height = size + "px";
  particle.style.background = "rgba(255, 255, 255, 0.7)";
  particle.style.borderRadius = "50%";
  particle.style.boxShadow = "0 0 " + size + "px rgba(255, 255, 255, 0.7)";

  // Random position
  const xPos = Math.random() * 100;
  const yPos = Math.random() * 100;
  particle.style.left = xPos + "%";
  particle.style.top = yPos + "%";

  particlesContainer.appendChild(particle);

  particles.push({
    element: particle,
    x: xPos,
    y: yPos,
    speed: Math.random() * 0.05 + 0.02,
    size: size,
  });
}

// Animation loop
function animate() {
  particles.forEach((particle) => {
    // increase speed gradually
    particle.speed += ACCELERATION;

    // update position
    particle.y += particle.speed;

    // reset particle if it goes out of bounds
    if (particle.y > 100) {
      particle.y = -5;
      particle.x = Math.random() * 100;
      particle.speed = Math.random() * 0.05 + 0.02;
    }

    // Apply new position
    particle.element.style.top = particle.y + "%";
  });

  // Continue animation loop
  requestAnimationFrame(animate);
}

// Start animation
animate();

// Add floating score animation to CSS
const style = document.createElement("style");
style.textContent = `
@keyframes floatUp {
    0% {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
    100% {
        transform: translateY(-50px) scale(1.2);
        opacity: 0;
    }
}`;
document.head.appendChild(style);
