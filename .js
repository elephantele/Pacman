// board
let board;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount * tileSize;
const boardHeight = rowCount * tileSize;
let context;

let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;
let pacmanUpImage;
let pacmanDownImage;
let pacmanLeftImage;
let pacmanRightImage;
let wallImage;
let scaredGhostImage;

let gameStarted = false;
let blink = true;
let ghostX = -50;
let pacmanX = boardWidth + 50;
let paused = false;
let highScore = Number(localStorage.getItem("highScore") || 0);

// blink effect
setInterval(() => {
  blink = !blink;
}, 500);

// X = wall, O = skip, P = pac man, ' ' = food
// Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap = [
  "XXXXXXXXXXXXXXXXXXX",
  "X        X        X",
  "X XX XXX X XXX XX X",
  "X   F         F   X",
  "X XX X XXXXX X XX X",
  "X    X       X    X",
  "XXXX XXXX XXXX XXXX",
  "OOOX X       X XOOO",
  "XXXX X XXrXX X XXXX",
  "O       bpo       O",
  "XXXX X XXXXX X XXXX",
  "OOOX X       X XOOO",
  "XXXX X XXXXX X XXXX",
  "X   F     X     F X",
  "X XX XXX X XXX XX X",
  "X  X     P     X  X",
  "XX X X XXXXX X X XX",
  "X    X   X   X    X",
  "X XXXXXX X XXXXXX X",
  "X                 X",
  "XXXXXXXXXXXXXXXXXXX"
];

const walls = new Set();
const foods = new Set();
const ghosts = new Set();
const powerPellets = new Set();
let pacman;
let nextDirection = null;

let frightened = false;
let frightenedTimer = 0;

let fruit = null;
let fruitTimer = 0;
let fruitImage = new Image();
fruitImage.src = "./fruit.png";

const directions = ["U", "D", "L", "R"]; // up down left right
let score = 0;
let lives = 3;
let gameOver = false;

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  loadImages(() => {
    loadMap();
    for (let ghost of ghosts.values()) {
      const newDirection = directions[Math.floor(Math.random() * 4)];
      ghost.updateDirection(newDirection);
    }
    if (!gameStarted) {
      requestAnimationFrame(startScreenLoop);
      return;
    }

    document.addEventListener("keydown", movePacman);
    update();
  });
};

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!gameStarted) {
      gameStarted = true;
      document.addEventListener("keydown", movePacman);
      update();
    }
  }
});


function startScreenLoop() {
  if (gameStarted) {
    return;
  }
  drawStartScreen();
  requestAnimationFrame(startScreenLoop);
}

function drawStartScreen() {
  context.clearRect(0, 0, board.width, board.height);

  // bg
  context.fillStyle = "black";
  context.fillRect(0, 0, boardWidth, boardHeight);

  // title
  context.fillStyle = "yellow";
  context.font = "48px sans-serif";
  context.fillText("PAC-MAN", boardWidth / 2 - 120, boardHeight / 2 - 120);

  // animated pac-man sliding in
  context.fillStyle = "yellow";
  context.beginPath();
  context.arc(
    pacmanX,
    boardHeight / 2 - 40,
    20,
    0.2 * Math.PI,
    1.8 * Math.PI
  );
  context.lineTo(pacmanX, boardHeight / 2 - 40);
  context.fill();

  // animated ghost floating
  drawGhost(ghostX, boardHeight / 2 - 40, "red");

  // blinking "press space"
  if (blink) {
    context.fillStyle = "white";
    context.font = "22px sans-serif";
    context.fillText(
      "Press SPACE to Start",
      boardWidth / 2 - 130,
      boardHeight / 2 + 40
    );
  }

  // update animation positions
  ghostX += 1.5;
  pacmanX -= 1.5;

  // reset positions when off-screen
  if (ghostX > boardWidth + 50) {
    ghostX = -50;
  }
  if (pacmanX < -50) {
    pacmanX = boardWidth + 50;
  }
}

// ghost drawing helper
function drawGhost(x, y, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, 20, Math.PI, 0);
  context.lineTo(x + 20, y + 20);
  context.lineTo(x + 10, y + 10);
  context.lineTo(x, y + 20);
  context.lineTo(x - 10, y + 10);
  context.lineTo(x - 20, y + 20);
  context.closePath();
  context.fill();

  // eyes
  context.fillStyle = "white";
  context.beginPath();
  context.arc(x - 7, y - 5, 5, 0, 2 * Math.PI);
  context.arc(x + 7, y - 5, 5, 0, 2 * Math.PI);
  context.fill();

  context.fillStyle = "blue";
  context.beginPath();
  context.arc(x - 7, y - 5, 2, 0, 2 * Math.PI);
  context.arc(x + 7, y - 5, 2, 0, 2 * Math.PI);
  context.fill();
}

function loadImages(callback) {
  let imagesToLoad = 10;

  function onLoad() {
    imagesToLoad--;
    if (imagesToLoad === 0) {
      callback();
    }
  }

  function load(imgRef, src) {
    const img = new Image();
    img.onload = onLoad;
    img.src = src;
    return img;
  }

  wallImage = load(wallImage, "./wall.png");
  blueGhostImage = load(blueGhostImage, "./blueGhost.png");
  orangeGhostImage = load(orangeGhostImage, "./orangeGhost.png");
  pinkGhostImage = load(pinkGhostImage, "./pinkGhost.png");
  redGhostImage = load(redGhostImage, "./redGhost.png");
  pacmanUpImage = load(pacmanUpImage, "./pacmanUp.png");
  pacmanDownImage = load(pacmanDownImage, "./pacmanDown.png");
  pacmanLeftImage = load(pacmanLeftImage, "./pacmanLeft.png");
  pacmanRightImage = load(pacmanRightImage, "./pacmanRight.png");
  scaredGhostImage = load(scaredGhostImage, "./scaredGhost.png");
}

function loadMap() {
  walls.clear();
  foods.clear();
  ghosts.clear();
  powerPellets.clear();

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < columnCount; c++) {
      const row = tileMap[r];
      const tileMapChar = row[c];

      const x = c * tileSize;
      const y = r * tileSize;

      if (tileMapChar == "X") {
        const wall = new Block(wallImage, x, y, tileSize, tileSize);
        walls.add(wall);
      } else if (tileMapChar == "b") {
        const ghost = new Block(blueGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar == "o") {
        const ghost = new Block(orangeGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar == "p") {
        const ghost = new Block(pinkGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar == "r") {
        const ghost = new Block(redGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar == "P") {
        pacman = new Block(pacmanRightImage, x, y, tileSize, tileSize);
      } else if (tileMapChar == " ") {
        const food = new Block(null, x + 14, y + 14, 4, 4);
        foods.add(food);
      } else if (tileMapChar == "F") {
        const pellet = new Block(null, x + 10, y + 10, 12, 12);
        powerPellets.add(pellet);
      } else if (tileMapChar == "O") {
        continue;
      }
    }
  }
}

function update() {
  if (gameOver) {
    return;
  }
  if (paused) {
    return;
  }

  // fruit randomly spawned
  if (!fruit && Math.random() < 0.002) {
    fruit = new Block(fruitImage, tileSize * 9, tileSize * 10, 24, 24);
    fruitTimer = 400; // ~20 secs
  }

  move();
  draw();
  setTimeout(update, 50); // 20 FPS
}

function draw() {
  context.clearRect(0, 0, board.width, board.height);

  context.drawImage(
    pacman.image,
    pacman.x,
    pacman.y,
    pacman.width,
    pacman.height
  );

  for (let ghost of ghosts.values()) {
    context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
  }

  for (let wall of walls.values()) {
    context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
  }

  context.fillStyle = "white";
  for (let food of foods.values()) {
    context.fillRect(food.x, food.y, food.width, food.height);
  }

  if (fruit) {
    context.drawImage(fruit.image, fruit.x, fruit.y, fruit.width, fruit.height);
  }

  // draw power pellets
  context.fillStyle = "orange";
  for (let pellet of powerPellets.values()) {
    context.beginPath();
    context.arc(pellet.x + 6, pellet.y + 6, 6, 0, 2 * Math.PI);
    context.fill();
  }

  // score + high score
  context.fillStyle = "white";
  context.font = "14px sans-serif";
  if (gameOver) {
    context.fillText("Game Over: " + String(score), tileSize / 2, tileSize / 2);
  } else {
    context.fillText(
      "x" + String(lives) + " " + String(score),
      tileSize / 2,
      tileSize / 2
    );
  }
  context.fillText("HI " + String(highScore), tileSize * 10, tileSize / 2);
}

function move() {
  // buffered turning: try nextDirection first
 // buffered turning: try nextDirection first
if (nextDirection) {
    let oldX = pacman.x;
    let oldY = pacman.y;
    let oldDir = pacman.direction;
    let oldVX = pacman.velocityX;
    let oldVY = pacman.velocityY;

    // change direction WITHOUT moving
    pacman.direction = nextDirection;
    pacman.updateVelocity();

    // test movement
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    let blocked = false;
    for (let wall of walls.values()) {
        if (collision(pacman, wall)) {
            blocked = true;
            break;
        }
    }

    if (blocked) {
        // revert
        pacman.x = oldX;
        pacman.y = oldY;
        pacman.direction = oldDir;
        pacman.velocityX = oldVX;
        pacman.velocityY = oldVY;
    } else {
        // successful turn
        nextDirection = null;
    }
}

  // normal movement
  pacman.x += pacman.velocityX;
  pacman.y += pacman.velocityY;

  // frightened mode timer + flashing
  if (frightened) {
    frightenedTimer--;

    for (let ghost of ghosts.values()) {
      if (frightenedTimer < 60) {
        if (Math.floor(frightenedTimer / 5) % 2 === 0) {
          ghost.image = scaredGhostImage;
        } else {
          ghost.image = ghost.originalImage;
        }
      } else {
        ghost.image = scaredGhostImage;
      }
    }

    if (frightenedTimer <= 0) {
      frightened = false;
      for (let ghost of ghosts.values()) {
        ghost.frightened = false;
        ghost.image = ghost.originalImage;
      }
    }
  }

  // high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  // fruit timer
  if (fruit) {
    fruitTimer--;
    if (fruitTimer <= 0) {
      fruit = null;
    }
  }

  // tunnel warp
  if (pacman.x < -pacman.width) {
    pacman.x = boardWidth;
  } else if (pacman.x > boardWidth) {
    pacman.x = -pacman.width;
  }

  // check wall collisions
  for (let wall of walls.values()) {
    if (collision(pacman, wall)) {
      pacman.x -= pacman.velocityX;
      pacman.y -= pacman.velocityY;
      break;
    }
  }

  // check ghosts collision + movement
  for (let ghost of ghosts.values()) {
    if (collision(ghost, pacman)) {
      if (ghost.frightened) {
        // Pac-Man eats ghost
        score += 200;
        ghost.reset();
        ghost.frightened = false;
        ghost.image = ghost.originalImage;
        continue;
      } else {
        // Pac-Man gets hit
        lives -= 1;
        if (lives == 0) {
          gameOver = true;
          return;
        }
        resetPositions();
        return;
      }
    }

    // simple AI: keep moving, bounce off walls
    ghost.x += ghost.velocityX;
    ghost.y += ghost.velocityY;

    for (let wall of walls.values()) {
      if (
        collision(ghost, wall) ||
        ghost.x <= 0 ||
        ghost.x + ghost.width >= boardWidth ||
        ghost.y < 0 ||
        ghost.y + ghost.height > boardHeight
      ) {
        ghost.x -= ghost.velocityX;
        ghost.y -= ghost.velocityY;
        const newDirection = directions[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
      }
    }

    // ghost tunnel warp
    if (ghost.x < -ghost.width) {
      ghost.x = boardWidth;
    } else if (ghost.x > boardWidth) {
      ghost.x = -ghost.width;
    }
  }

  // check food collision
  let foodEaten = null;
  for (let food of foods.values()) {
    if (collision(pacman, food)) {
      foodEaten = food;
      score += 10;
      break;
    }
  }
if(foodEaten){
    foods.delete(foodEaten);
}

  // power pellet collision
  let pelletEaten = null;
  for (let pellet of powerPellets.values()) {
    if (collision(pacman, pellet)) {
      pelletEaten = pellet;
      frightened = true;
      frightenedTimer = 300; // ~15 secs
      score += 50;

      for (let ghost of ghosts.values()) {
        ghost.frightened = true;
        ghost.image = scaredGhostImage;
        // give scared ghosts a new random direction so they keep moving
        const newDirection = directions[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
      }
      break;
    }
  }
  powerPellets.delete(pelletEaten);

  // fruit collision
  if (fruit && collision(pacman, fruit)) {
    score += 100;
    fruit = null;
  }

  // next level
  if (foods.size == 0 && powerPellets.size == 0) {
    loadMap();
    resetPositions();
  }
}

function movePacman(e) {
  if (gameOver) {
    loadMap();
    resetPositions();
    lives = 3;
    score = 0;
    gameOver = false;
    update();
    return;
  }

  if (e.code === "ArrowUp" || e.code === "KeyW") {
    nextDirection = "U";
    pacman.image = pacmanUpImage;   
  }
  else if (e.code === "ArrowDown" || e.code === "KeyS") {
    nextDirection = "D";
    pacman.image = pacmanDownImage;
  }
  else if (e.code === "ArrowLeft" || e.code === "KeyA") {
    nextDirection = "L";
    pacman.image = pacmanLeftImage;
  }
  else if (e.code === "ArrowRight" || e.code === "KeyD") {
    nextDirection = "R";
    pacman.image = pacmanRightImage;
  }
}

function collision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function resetPositions() {
  pacman.reset();
  pacman.velocityX = 0;
  pacman.velocityY = 0;
  for (let ghost of ghosts.values()) {
    ghost.reset();
    const newDirection = directions[Math.floor(Math.random() * 4)];
    ghost.updateDirection(newDirection);
  }
}

class Block {
  constructor(image, x, y, width, height) {
    this.image = image;
    this.originalImage = image;
    this.frightened = false;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.startX = x;
    this.startY = y;

    this.direction = "R";
    this.velocityX = 0;
    this.velocityY = 0;
  }

  updateDirection(direction) {
    const prevDirection = this.direction;
    this.direction = direction;
    this.updateVelocity();
    this.x += this.velocityX;
    this.y += this.velocityY;

    for (let wall of walls.values()) {
      if (collision(this, wall)) {
        this.x -= this.velocityX;
        this.y -= this.velocityY;
        this.direction = prevDirection;
        this.updateVelocity();
        return;
      }
    }
  }

  updateVelocity() {
    if (this.direction == "U") {
      this.velocityX = 0;
      this.velocityY = -tileSize / 4;
    } else if (this.direction == "D") {
      this.velocityX = 0;
      this.velocityY = tileSize / 4;
    } else if (this.direction == "L") {
      this.velocityX = -tileSize / 4;
      this.velocityY = 0;
    } else if (this.direction == "R") {
      this.velocityX = tileSize / 4;
      this.velocityY = 0;
    }
  }

  reset() {
  this.x = this.startX;
  this.y = this.startY;
  this.direction = "R";
  this.updateVelocity();
  this.frightened = false;
  this.image = this.originalImage;
}
}
