let canvas;
let ctx;

canvas = document.createElement("canvas");
ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

let timer;
let score = 0;
let keysDown = {};
let monsterX = 100;
let monsterY = 100;
let elapsedTime = 0;
let heroX = canvas.width / 2;
let heroY = canvas.height / 2;
const SECONDS_PER_ROUND = 10;

let bgReady, heroReady, monsterReady;
let bgImage, heroImage, monsterImage;

const defaultState = {
  gameStarted: false,
  currentUser: null,
  currentHighScore: {
    user: null,
    score: null
  },
  topScores: []
};

function getAppState() {
  return JSON.parse(localStorage.getItem("appState")) || defaultState;
}

function save(appState) {
  localStorage.setItem("appState", JSON.stringify(appState));
}

function randomlyPlace(num) {
  return Math.floor(Math.random() * num);
}

function startGame() {
  const appState = getAppState();
  appState.currentUser =
    document.getElementById("username").value || "Anomymous";
  appState.gameStarted = true;
  save(appState);

  timer = setInterval(() => {
    elapsedTime += 1;
    document.getElementById("timer").innerHTML =
      SECONDS_PER_ROUND - elapsedTime;
  }, 1000);
}

function move() {
  if (38 in keysDown) heroY -= 5;
  if (40 in keysDown) heroY += 5;
  if (37 in keysDown) heroX -= 5;
  if (39 in keysDown) heroX += 5;
}

function wrapAround() {
  if (heroX <= 0) heroX = canvas.width - 10;
  if (heroX >= canvas.width) heroX = 0;
  if (heroY <= 0) heroY = canvas.height - 10;
  if (heroY >= canvas.height) heroY = 0;
}

function updateScores() {
  score += 1;
  const appState = getAppState();
  const newHighScore = score > appState.currentHighScore.score;
  if (newHighScore) {
    appState.currentHighScore = {
      score: score,
      date: new Date(),
      user: appState.currentUser || "Anonymous"
    };
    save(appState);
  }
  monsterX = randomlyPlace(502);
  monsterY = randomlyPlace(470);
  document.getElementById("score").innerHTML = score;
}

function checkMonsterCaught() {
  const monsterCaught =
    heroX <= monsterX + 32 &&
    monsterX <= heroX + 32 &&
    heroY <= monsterY + 32 &&
    monsterY <= heroY + 32;

  if (monsterCaught) updateScores();
}

function stopClock() {
  clearInterval(timer);
}

function updateUI() {
  const appState = getAppState();
  const highScore = appState.currentHighScore.score;
  const user = appState.currentHighScore.user;
  let scoresHTML = '<h3>History</h3>'
  appState.topScores.map(score => {
    scoresHTML +=`<li> ${score.user}${score.score}</li>`;
  });
  document.getElementById("highscore").innerHTML = `${user} : ${highScore}`;
  document.getElementById("timer").innerHTML = SECONDS_PER_ROUND - elapsedTime;
  document.getElementById("topScores").innerHTML = scoresHTML 
}

const update = function() {
  const isGameOver = SECONDS_PER_ROUND - elapsedTime <= 0;
  const appState = getAppState();
  if (appState.gameStarted == false) return;
  if (isGameOver) {
    appState.topScores.push({
      score: score,
      date: new Date(),
      user: appState.currentUser
    });
    appState.gameStarted = false;
    save(appState);
  }
  if (appState.gameStarted) {
    move();
    wrapAround();
    checkMonsterCaught();
    updateUI();
  }
  
};

const render = function() {
  if (bgReady) {
    ctx.drawImage(bgImage, 0, 0);
  }
  if (heroReady) {
    ctx.drawImage(heroImage, heroX, heroY);
  }
  if (monsterReady) {
    ctx.drawImage(monsterImage, monsterX, monsterY);
  }

  const isGameOver = SECONDS_PER_ROUND - elapsedTime <= 0;

  if (isGameOver) {
    stopClock();
    ctx.font = "20px Georgia";
    ctx.fillStyle = "black";
    ctx.fillRect(180, 200, 150, 100);
    ctx.fillStyle = "#FF0000";
    ctx.fillText("Game Over!", 200, 250);
  } else {
    ctx.fillText(
      `Seconds Remaining: ${SECONDS_PER_ROUND - elapsedTime}`,
      20,
      100
    );
  }
};

const w = window;
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

const main = function() {
  update();
  render();
  requestAnimationFrame(main);
};

loadImages();
setupKeyboardListeners();
main();
