const dino = document.getElementById("dino");
const scoreText = document.getElementById("score");
const highscoreText = document.getElementById("highscore");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

let cacti = [];
let jumping = false;
let gameOver = false;

let dinoY = 0;
let score = 0;
let speed = 6;

let lastTime = 0;
let animationId;

let spawnTimer = 0;
let spawnDelay = 1500;

let highscore =
  Number(localStorage.getItem("dinoHighscore")) || 0;

highscoreText.textContent =
  "HIGHSCORE: " + String(highscore).padStart(5, "0");


function jump() {

  if (jumping || gameOver) return;

  jumping = true;

  let velocity = 15;

  function jumpAnimation() {

    if (gameOver) return;

    velocity -= 0.7;
    dinoY += velocity;

    if (dinoY <= 0) {

      dinoY = 0;
      jumping = false;
      dino.style.bottom = "10px";

      return;
    }

    dino.style.bottom =
      (10 + dinoY) + "px";

    requestAnimationFrame(jumpAnimation);
  }

  jumpAnimation();
}


function createCactus(offset = 0) {

  const cactus = document.createElement("div");

  cactus.textContent = "🌵";
  cactus.style.position = "absolute";
  cactus.style.left = (850 + offset) + "px";
  cactus.style.bottom = "8px";
  cactus.style.fontSize =
    Math.random() < 0.5 ? "48px" : "58px";
  cactus.style.zIndex = "5";

  document.getElementById("game")
    .appendChild(cactus);

  cacti.push({
    element: cactus,
    x: 850 + offset
  });
}


function gameLoop(time) {

  if (gameOver) return;

  let delta = time - lastTime;
  lastTime = time;

  if (delta > 100) delta = 16;

  spawnTimer += delta;

  if (spawnTimer >= spawnDelay) {

    const amount =
      Math.random() < 0.25 ? 2 : 1;

    for (let i = 0; i < amount; i++) {
      createCactus(i * 45);
    }

    spawnTimer = 0;

    spawnDelay =
      Math.max(
        750,
        1100 + Math.random() * 900 - score * 8
      );
  }


  for (let i = cacti.length - 1; i >= 0; i--) {

    const cactus = cacti[i];

    cactus.x -= speed * delta / 16;

    cactus.element.style.left =
      cactus.x + "px";


    if (cactus.x < -100) {

      cactus.element.remove();
      cacti.splice(i, 1);

      score++;

      scoreText.textContent =
        String(score).padStart(5, "0");

      speed =
        Math.min(
          11,
          6 + score * 0.08
        );
    }


    const dinoRect =
      dino.getBoundingClientRect();

    const cactusRect =
      cactus.element.getBoundingClientRect();

    const dinoHitbox = {
      left: dinoRect.left + 18,
      right: dinoRect.right - 18,
      top: dinoRect.top + 10,
      bottom: dinoRect.bottom - 5
    };

    const cactusHitbox = {
      left: cactusRect.left + 10,
      right: cactusRect.right - 10,
      top: cactusRect.top + 8,
      bottom: cactusRect.bottom
    };

    if (
      dinoHitbox.right > cactusHitbox.left &&
      dinoHitbox.left < cactusHitbox.right &&
      dinoHitbox.bottom > cactusHitbox.top &&
      dinoHitbox.top < cactusHitbox.bottom
    ) {

      endGame();
      return;
    }
  }

  animationId =
    requestAnimationFrame(gameLoop);
}


function endGame() {

  gameOver = true;

  dino.classList.remove("running");

  finalScore.textContent = score;

  if (score > highscore) {

    highscore = score;

    localStorage.setItem(
      "dinoHighscore",
      highscore
    );

    highscoreText.textContent =
      "HIGHSCORE: " +
      String(highscore).padStart(5, "0");
  }

  gameOverScreen.style.display = "flex";
}


function restart() {

  cancelAnimationFrame(animationId);

  for (let cactus of cacti) {
    cactus.element.remove();
  }

  cacti = [];

  gameOver = false;
  jumping = false;

  dinoY = 0;
  score = 0;
  speed = 6;

  spawnTimer = 0;
  spawnDelay = 1500;

  scoreText.textContent = "00000";

  dino.style.bottom = "10px";

  gameOverScreen.style.display = "none";

  dino.classList.add("running");

  lastTime = performance.now();

  animationId =
    requestAnimationFrame(gameLoop);
}


dino.classList.add("running");

lastTime = performance.now();

animationId =
  requestAnimationFrame(gameLoop);


document.addEventListener("keydown", function(event) {

  if (event.code === "Space") {
    event.preventDefault();
    jump();
  }

});
