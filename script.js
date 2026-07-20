const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const page = document.body.dataset.page;

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll("[data-page-link]").forEach((link) => {
  if (link.dataset.pageLink === page) {
    link.classList.add("is-active");
    link.setAttribute("aria-current", "page");
  }
});

const busPopup = document.querySelector("#bus-popup");
const busPopupStorageKey = "bus-popup-hidden-until";

function closeBusPopup() {
  if (!busPopup) return;
  busPopup.hidden = true;
}

function isBusPopupHiddenToday() {
  try {
    return Number(localStorage.getItem(busPopupStorageKey)) > Date.now();
  } catch {
    return false;
  }
}

if (busPopup && !isBusPopupHiddenToday()) {
  busPopup.hidden = false;

  busPopup.querySelectorAll("[data-bus-popup-close]").forEach((button) => {
    button.addEventListener("click", closeBusPopup);
  });

  busPopup.querySelector("[data-bus-popup-hide]")?.addEventListener("click", () => {
    try {
      localStorage.setItem(busPopupStorageKey, String(Date.now() + 24 * 60 * 60 * 1000));
    } catch {
      // Storage can be unavailable in private browsing; closing still works.
    }
    closeBusPopup();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeBusPopup();
  });
}

const gameTabs = document.querySelectorAll("[data-game-tab]");
const gamePanels = document.querySelectorAll("[data-game-panel]");

gameTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    gameTabs.forEach((item) => item.classList.remove("is-active"));
    gamePanels.forEach((panel) => panel.classList.remove("is-active"));
    tab.classList.add("is-active");
    document.querySelector(`[data-game-panel="${tab.dataset.gameTab}"]`)?.classList.add("is-active");
  });
});

const numbleForm = document.querySelector("#numble-form");
const numbleInput = document.querySelector("#numble-input");
const numbleMessage = document.querySelector("#numble-message");
const numbleGuesses = document.querySelector("#numble-guesses");
const numbleReset = document.querySelector("#numble-reset");
let numbleAnswer = [];
let numbleCount = 0;

function makeNumbleAnswer() {
  const digits = [];
  while (digits.length < 3) {
    const value = String(Math.floor(Math.random() * 10));
    if (!digits.includes(value)) digits.push(value);
  }
  return digits;
}

function resetNumble() {
  numbleAnswer = makeNumbleAnswer();
  numbleCount = 0;
  if (numbleGuesses) numbleGuesses.innerHTML = "";
  if (numbleMessage) numbleMessage.textContent = "중복 없는 세 자리 숫자를 맞혀 보세요.";
  if (numbleInput) {
    numbleInput.value = "";
    numbleInput.disabled = false;
  }
}

function submitNumble(event) {
  event.preventDefault();
  const guess = (numbleInput?.value || "").trim();
  if (!/^\d{3}$/.test(guess) || new Set(guess).size !== 3) {
    numbleMessage.textContent = "중복 없는 숫자 3개를 입력해 주세요.";
    return;
  }

  numbleCount += 1;
  const digits = guess.split("");
  let strike = 0;
  let ball = 0;

  digits.forEach((digit, index) => {
    if (numbleAnswer[index] === digit) strike += 1;
    else if (numbleAnswer.includes(digit)) ball += 1;
  });

  const item = document.createElement("div");
  item.className = "guess-item";
  item.innerHTML = `<span>${numbleCount}. ${guess}</span><span>${strike}S ${ball}B</span>`;
  numbleGuesses?.prepend(item);

  if (strike === 3) {
    numbleMessage.textContent = `${numbleCount}번 만에 성공했습니다. 멋진 감각이에요.`;
    numbleInput.disabled = true;
  } else {
    numbleMessage.textContent = "좋아요. 힌트를 보고 다시 시도해 보세요.";
  }

  numbleInput.value = "";
}

if (numbleForm) {
  resetNumble();
  numbleForm.addEventListener("submit", submitNumble);
  numbleReset?.addEventListener("click", resetNumble);
}

const board2048 = document.querySelector("#board-2048");
const score2048 = document.querySelector("#score-2048");
const message2048 = document.querySelector("#message-2048");
const reset2048 = document.querySelector("#reset-2048");
let grid2048 = [];
let currentScore = 0;

function emptyGrid() {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function randomEmptyCell() {
  const cells = [];
  grid2048.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value === 0) cells.push([rowIndex, colIndex]);
    });
  });
  return cells[Math.floor(Math.random() * cells.length)];
}

function addTile() {
  const cell = randomEmptyCell();
  if (!cell) return;
  grid2048[cell[0]][cell[1]] = Math.random() < 0.9 ? 2 : 4;
}

function render2048() {
  if (!board2048) return;
  board2048.innerHTML = "";
  grid2048.flat().forEach((value) => {
    const tile = document.createElement("div");
    tile.className = "tile-2048";
    tile.dataset.value = value ? String(value) : "";
    tile.textContent = value ? String(value) : "";
    board2048.append(tile);
  });
  if (score2048) score2048.textContent = String(currentScore);
}

function compactLine(line) {
  const values = line.filter(Boolean);
  const result = [];
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === values[index + 1]) {
      const merged = values[index] * 2;
      currentScore += merged;
      result.push(merged);
      index += 1;
    } else {
      result.push(values[index]);
    }
  }
  while (result.length < 4) result.push(0);
  return result;
}

function rotateGrid(grid) {
  return grid[0].map((_, index) => grid.map((row) => row[index]).reverse());
}

function move2048(direction) {
  let rotated = grid2048.map((row) => [...row]);
  const rotations = { left: 0, down: 1, right: 2, up: 3 }[direction];
  for (let count = 0; count < rotations; count += 1) rotated = rotateGrid(rotated);

  const before = JSON.stringify(rotated);
  rotated = rotated.map(compactLine);
  const moved = before !== JSON.stringify(rotated);

  for (let count = 0; count < (4 - rotations) % 4; count += 1) rotated = rotateGrid(rotated);
  if (!moved) return;

  grid2048 = rotated;
  addTile();
  render2048();
  if (grid2048.flat().includes(2048)) {
    message2048.textContent = "2048 달성. 잠깐의 승리감을 챙겨 가세요.";
  } else if (!grid2048.flat().includes(0) && !canMove2048()) {
    message2048.textContent = "더 이상 움직일 수 없습니다. 새 게임으로 다시 시작해 보세요.";
  } else {
    message2048.textContent = "좋아요. 계속 합쳐 보세요.";
  }
}

function canMove2048() {
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      if (grid2048[row][col] === 0) return true;
      if (grid2048[row][col] === grid2048[row]?.[col + 1]) return true;
      if (grid2048[row][col] === grid2048[row + 1]?.[col]) return true;
    }
  }
  return false;
}

function resetGame2048() {
  grid2048 = emptyGrid();
  currentScore = 0;
  addTile();
  addTile();
  render2048();
  if (message2048) message2048.textContent = "방향키나 스와이프로 움직일 수 있습니다.";
}

if (board2048) {
  resetGame2048();
  reset2048?.addEventListener("click", resetGame2048);
  document.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("click", () => move2048(button.dataset.move));
  });
  document.addEventListener("keydown", (event) => {
    const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
    if (map[event.key] && document.querySelector('[data-game-panel="twenty48"]')?.classList.contains("is-active")) {
      event.preventDefault();
      move2048(map[event.key]);
    }
  });

  let swipeStartX = 0;
  let swipeStartY = 0;

  board2048.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];
      swipeStartX = touch.clientX;
      swipeStartY = touch.clientY;
    },
    { passive: true }
  );

  board2048.addEventListener(
    "touchmove",
    (event) => {
      event.preventDefault();
    },
    { passive: false }
  );

  board2048.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - swipeStartX;
    const deltaY = touch.clientY - swipeStartY;
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) return;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      move2048(deltaX > 0 ? "right" : "left");
    } else {
      move2048(deltaY > 0 ? "down" : "up");
    }
  });
}

const reactionPad = document.querySelector("#reaction-pad");
const reactionMessage = document.querySelector("#reaction-message");
const reactionLast = document.querySelector("#reaction-last");
const reactionBest = document.querySelector("#reaction-best");
const reactionReset = document.querySelector("#reaction-reset");
let reactionState = "idle";
let reactionTimer = 0;
let reactionStartedAt = 0;
let bestReaction = null;

function setReaction(state, label, message) {
  reactionState = state;
  reactionPad.classList.toggle("is-waiting", state === "waiting");
  reactionPad.classList.toggle("is-ready", state === "ready");
  reactionPad.textContent = label;
  reactionMessage.textContent = message;
}

function resetReaction() {
  clearTimeout(reactionTimer);
  setReaction("idle", "시작", "버튼을 누르면 준비가 시작됩니다.");
  if (reactionLast) reactionLast.textContent = "-";
}

if (reactionPad) {
  reactionPad.addEventListener("click", () => {
    if (reactionState === "idle") {
      const delay = 1000 + Math.random() * 2600;
      setReaction("waiting", "기다리기", "초록색이 될 때까지 기다려 주세요.");
      reactionTimer = window.setTimeout(() => {
        reactionStartedAt = performance.now();
        setReaction("ready", "누르기", "지금 누르세요.");
      }, delay);
      return;
    }

    if (reactionState === "waiting") {
      clearTimeout(reactionTimer);
      setReaction("idle", "다시 시작", "조금 빨랐어요. 다시 시작해 보세요.");
      return;
    }

    if (reactionState === "ready") {
      const record = Math.round(performance.now() - reactionStartedAt);
      bestReaction = bestReaction === null ? record : Math.min(bestReaction, record);
      if (reactionLast) reactionLast.textContent = `${record}ms`;
      if (reactionBest) reactionBest.textContent = `${bestReaction}ms`;
      setReaction("idle", "다시 시작", `${record}ms 기록입니다.`);
    }
  });

  reactionReset?.addEventListener("click", () => {
    bestReaction = null;
    if (reactionBest) reactionBest.textContent = "-";
    resetReaction();
  });
}
