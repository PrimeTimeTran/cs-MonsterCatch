let canvas;
let ctx;

canvas = document.createElement("canvas");
ctx = canvas.getContext("2d");
canvas.width = 512;
// canvas.width = window.innerWidth
canvas.height = 480;
document.body.appendChild(canvas);

let bgReady, heroReady, monsterReady;
let bgImage, heroImage, monsterImage;

let elapsedTime = 0;
let startTime = Date.now();
const SECONDS_PER_ROUND = 15;

let score = 0;
let timer;

function onResetGame() {
  const currentHighScore = localStorage.getItem("highscore");
  if (score > currentHighScore) {
    const username = document.getElementById('username').value
    const highscoreInfo = [username, score]
    localStorage.setItem("highscore", JSON.stringify(highscoreInfo));
  }
  score = 0;
  elapsedTime = 0;
  document.getElementById("score").innerHTML = 0;
}



let heroX = canvas.width / 2;
let heroY = canvas.height / 2;

let monsterX = 100;
let monsterY = 100;

let keysDown = {};


function randomlyPlace(num) {
  return Math.floor(Math.random() * num);
}

function moveHeroIfUserIsPressingDownOnTheArrowKeys() {
  if (38 in keysDown) {
    heroY -= 5;
  }
  if (40 in keysDown) {
    heroY += 5;
  }
  if (37 in keysDown) {
    heroX -= 5;
  }
  if (39 in keysDown) {
    heroX += 5;
  }
}

function moveHeroToOtherSideIfTheyWentOffScreen() {
  if (heroX <= 0) {
    heroX = canvas.width - 10;
  }
  if (heroX >= canvas.width) {
    heroX = 0;
  }
  if (heroY <= 0) {
    heroY = canvas.height - 10;
  }
  if (heroY >= canvas.height) {
    heroY = 0;
  }
}

function checkIfHeroCaughtMonster() {
  const heroCaughtMonster =
    heroX <= monsterX + 32 &&
    monsterX <= heroX + 32 &&
    heroY <= monsterY + 32 &&
    monsterY <= heroY + 32;

  if (heroCaughtMonster) {
    score += 1;
    let currentHighScore = localStorage.getItem("highscore");
    currentHighScore = JSON.parse(currentHighScore)
    currentHighScore = currentHighScore && currentHighScore[1] 
    const newGame = currentHighScore === null
    const newHighScore = score > currentHighScore
    const shouldUpdateNewHighScore = newGame || newHighScore
    if (shouldUpdateNewHighScore) {
      const username = document.getElementById('username').value
      const highscoreInfo = [username, score]

      localStorage.setItem("highscore", JSON.stringify(highscoreInfo));
    }
    monsterX = randomlyPlace(502);
    monsterY = randomlyPlace(470);
    document.getElementById("score").innerHTML = score;
  }
}

function checkIfOutOfTime(isOutOfTime) {
  console.log('checkIfOutOfTime'  )
  if (isOutOfTime) {
    clearInterval(timer);
    return;
  }
}

function stopClock() {
  clearInterval(timer);
}

function updateUI() {
  const highScore = localStorage.getItem("highscore");
  document.getElementById("highscore").innerHTML = highScore;
  document.getElementById("timer").innerHTML = SECONDS_PER_ROUND - elapsedTime;
}

let update = function() {
  const isOutOfTime = SECONDS_PER_ROUND - elapsedTime <= 0;
  if (isOutOfTime) return;
  moveHeroIfUserIsPressingDownOnTheArrowKeys();
  moveHeroToOtherSideIfTheyWentOffScreen();
  checkIfHeroCaughtMonster();
  updateUI();
};

timer = setInterval(() => {
  elapsedTime += 1;
  document.getElementById("timer").innerHTML = SECONDS_PER_ROUND - elapsedTime;
}, 1000);

var render = function() {
  if (bgReady) {
    ctx.drawImage(bgImage, 0, 0);
  }
  if (heroReady) {
    ctx.drawImage(heroImage, heroX, heroY);
  }
  if (monsterReady) {
    ctx.drawImage(monsterImage, monsterX, monsterY);
  }

  const isOutOfTime = SECONDS_PER_ROUND - elapsedTime <= 0;

  if (isOutOfTime) {
    stopClock()
    ctx.fillText(`Hi GAME OVER!!!`, 20, 100);
  } else {
    ctx.fillText(
      `Seconds Remaining: ${SECONDS_PER_ROUND - elapsedTime}`,
      20,
      100
    );
  }
};

var w = window;
requestAnimationFrame =
  w.requestAnimationFrame ||
  w.webkitRequestAnimationFrame ||
  w.msRequestAnimationFrame ||
  w.mozRequestAnimationFrame;

function loadImages() {
  bgImage = new Image();
  bgImage.onload = function() {
    bgReady = true;
  };
  bgImage.src = "images/background.png";
  heroImage = new Image();
  heroImage.onload = function() {
    heroReady = true;
  };
  heroImage.src = "images/hero.png";

  monsterImage = new Image();
  monsterImage.onload = function() {
    monsterReady = true;
  };
  monsterImage.src = "images/monster.png";
}

function setupKeyboardListeners() {
  addEventListener(
    "keydown",
    function(key) {
      keysDown[key.keyCode] = true;
    },
    false
  );

  addEventListener(
    "keyup",
    function(key) {
      delete keysDown[key.keyCode];
    },
    false
  );
}

var main = function() {
  update();
  render();
  requestAnimationFrame(main);
};

loadImages();
setupKeyboardListeners();
main();
