
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const message = document.getElementById("message");


const GRAVITY = 0.5;
const FLAP = -8;
const PIPE_WIDTH = 52;
const PIPE_GAP = 135;
const GROUND = 40;


let bird, pipes, score, bestScore;
let gameState = "START";
let pipeTimer = 0;
let speed = 2;


function init() {
  bird = {
    x: 80,
    y: 200,
    size: 24,
    velocity: 0
  };

  pipes = [];
  score = 0;
  speed = 2;
  pipeTimer = 0;
  gameState = "START";

  bestScore = localStorage.getItem("bestScore") || 0;
  message.innerText = "Press Space / Click to Start";
}


function createPipe() {
  const top = Math.random() * 220 + 40;
  pipes.push({
    x: canvas.width,
    top,
    bottom: canvas.height - top - PIPE_GAP - GROUND,
    passed: false
  });
}


function update() {
  if (gameState !== "PLAYING") return;

  bird.velocity += GRAVITY;
  bird.y += bird.velocity;

  if (bird.y < 0 || bird.y + bird.size > canvas.height - GROUND) {
    endGame();
  }

  pipeTimer++;
  if (pipeTimer > 90) {
    createPipe();
    pipeTimer = 0;
  }

  pipes.forEach(pipe => {
    pipe.x -= speed;

    if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
      pipe.passed = true;
      score++;
      speed += 0.05;
    }

    if (
      bird.x < pipe.x + PIPE_WIDTH &&
      bird.x + bird.size > pipe.x &&
      (bird.y < pipe.top ||
      bird.y + bird.size >
      canvas.height - pipe.bottom - GROUND)
    ) {
      endGame();
    }
  });

  if (pipes.length && pipes[0].x + PIPE_WIDTH < 0) {
    pipes.shift();
  }
}


function drawBird() {
  ctx.save();
  ctx.translate(bird.x + bird.size / 2, bird.y + bird.size / 2);
  ctx.rotate(bird.velocity * 0.04);


  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(0, 0, bird.size / 2, 0, Math.PI * 2);
  ctx.fill();


  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(6, -4, 2, 0, Math.PI * 2);
  ctx.fill();


  ctx.fillStyle = "orange";
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(18, -3);
  ctx.lineTo(18, 3);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBird();


  ctx.fillStyle = "#2ecc71";
  pipes.forEach(p => {
    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
    ctx.fillRect(
      p.x,
      canvas.height - p.bottom - GROUND,
      PIPE_WIDTH,
      p.bottom
    );
  });


  ctx.fillStyle = "#ded895";
  ctx.fillRect(0, canvas.height - GROUND, canvas.width, GROUND);

  // Score
  ctx.fillStyle = "white";
  ctx.font = "22px Arial";
  ctx.fillText(`Score: ${score}`, 12, 30);
  ctx.fillText(`Best: ${bestScore}`, canvas.width - 110, 30);
}


function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}


function flap() {
  if (gameState === "START") {
    gameState = "PLAYING";
    message.innerText = "";
  }
  bird.velocity = FLAP;
}

function endGame() {
  gameState = "GAMEOVER";
  bestScore = Math.max(score, bestScore);
  localStorage.setItem("bestScore", bestScore);
  message.innerText = "Game Over — Press Space / Click";
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    if (gameState === "GAMEOVER") init();
    flap();
  }
});

canvas.addEventListener("click", () => {
  if (gameState === "GAMEOVER") init();
  flap();
});

document.getElementById("pauseBtn").onclick = () => {
  if (gameState === "PLAYING") {
    gameState = "PAUSED";
    message.innerText = "Paused";
  } else if (gameState === "PAUSED") {
    gameState = "PLAYING";
    message.innerText = "";
  }
};


init();
loop();