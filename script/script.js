

const navigationItems = [
    { label: "Play", href: "#game" },
    { label: "Stats", href: "#stats" },
    { label: "Leaderboard", href: "#leaderboard" }
];

const controlsData = [
    { label: "Start", action: "startGame" },
    { label: "Reset", action: "resetGame" }
];

const statsData = [
    { label: "Best", value: "0ms" },
    { label: "Average", value: "0ms" },
    { label: "Hits", value: "0" },
    { label: "Misses", value: "0" }
];

const leaderboardData = [
    { name: "Player1", score: "120ms" },
    { name: "Player2", score: "140ms" }
];

const footerLinks = [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" }
];

const gameLogMessages = [];



function renderNavItems(items) {
    return items.map(item => `
        <li><a href="${item.href}" class="hover:text-cyan-400">${item.label}</a></li>
    `).join("");
}

function renderControls(items) {
    return items.map(item => `
        <button onclick="${item.action}()" class="bg-cyan-500 px-4 py-2 rounded">
            ${item.label}
        </button>
    `).join("");
}

function renderStats(items) {
    return items.map(item => `
        <div class="bg-gray-800 p-3 rounded">
            <p>${item.label}</p>
            <p>${item.value}</p>
        </div>
    `).join("");
}

function renderLeaderboard(items) {
    return items.map(item => `
        <li>${item.name} - ${item.score}</li>
    `).join("");
}

function renderFooterLinks(items) {
    return items.map(item => `
        <li><a href="${item.href}">${item.label}</a></li>
    `).join("");
}

function renderGameLog(logs) {
    return logs.map(log => `
        <li>${log.text}</li>
    `).join("");
}




const shapeTypes = [
    { class: "bg-red-500" },
    { class: "bg-blue-500" },
    { class: "bg-green-500" }
];

function renderShape(shape, index) {
    return `
        <div 
            id="shape-${index}"
            data-is-real="true"
            class="w-16 h-16 absolute ${shape.class}"
            style="top:${Math.random()*300}px;left:${Math.random()*300}px;"
            onclick="handleShapeClick(${index})">
        </div>
    `;
}

function renderShapes(shapes) {
    return shapes.map((shape, i) => renderShape(shape, i)).join("");
}




let gameState = {
    isRunning: false,
    startTime: 0,
    reactionTimes: [],
    bestTime: 0,
    totalHits: 0,
    totalMisses: 0,
    currentShapes: [],
    gameLog: [],
    currentDifficulty: 1,
    shapeCount: 3,
    fakeTriggerChance: 0.2,
    gameDuration: 30000,
    remainingTime: 30000
};







// Game logic functions
function startGame() {
    if (gameState.isRunning) return;
    
    gameState.isRunning = true;
    gameState.startTime = Date.now();
    gameState.remainingTime = gameState.gameDuration;
    gameState.currentShapes = [];
    gameState.gameLog = [];
    
    // Generate initial shapes
    for (let i = 0; i < gameState.shapeCount; i++) {
        const randomShape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        gameState.currentShapes.push(randomShape);
    }
    
    document.getElementById("game-shapes-container").innerHTML = renderShapes(gameState.currentShapes);
    
    // Update displays
    document.getElementById("current-time-display").textContent = "Game started!";
    document.getElementById("difficulty-display").textContent = `Difficulty: Level ${gameState.currentDifficulty}`;
    
    // Add log entry
    addGameLog("Game started!", "info");
    
    // Start timer
    gameTimer();
    
    // Play sound
    playSound("start");
}

function resetGame() {
    gameState.isRunning = false;
    gameState.reactionTimes = [];
    gameState.totalHits = 0;
    gameState.totalMisses = 0;
    gameState.currentShapes = [];
    
    document.getElementById("game-shapes-container").innerHTML = "";
    document.getElementById("current-time-display").textContent = "Ready to play";
    document.getElementById("difficulty-display").textContent = `Difficulty: Level ${gameState.currentDifficulty}`;
    
    updateStatsDisplay();
    addGameLog("Game reset", "info");
    
    playSound("reset");
}

function increaseDifficulty() {
    if (gameState.currentDifficulty < 10) {
        gameState.currentDifficulty++;
        gameState.fakeTriggerChance += 0.05;
        gameState.shapeCount += 2;
        
        document.getElementById("difficulty-display").textContent = `Difficulty: Level ${gameState.currentDifficulty}`;
        addGameLog(`Difficulty increased to Level ${gameState.currentDifficulty}`, "warning");
        
        playSound("difficulty");
    }
}

function decreaseDifficulty() {
    if (gameState.currentDifficulty > 1) {
        gameState.currentDifficulty--;
        gameState.fakeTriggerChance -= 0.05;
        gameState.shapeCount -= 2;
        
        document.getElementById("difficulty-display").textContent = `Difficulty: Level ${gameState.currentDifficulty}`;
        addGameLog(`Difficulty decreased to Level ${gameState.currentDifficulty}`, "info");
        
        playSound("difficulty");
    }
}

function handleShapeClick(index) {
    if (!gameState.isRunning) return;
    
    const shapeElement = document.getElementById(`shape-${index}`);
    const isReal = shapeElement.getAttribute("data-is-real") === "true";
    
    if (isReal) {
        const reactionTime = Date.now() - gameState.startTime;
        gameState.reactionTimes.push(reactionTime);
        gameState.totalHits++;
        
        // Update best time
        if (reactionTime < gameState.bestTime || gameState.bestTime === 0) {
            gameState.bestTime = reactionTime;
            localStorage.setItem("bestReactionTime", reactionTime);
        }
        
        // Visual effect
        shapeElement.classList.add("clicked");
        
        // Update display
        document.getElementById("current-time-display").textContent = `Reaction: ${reactionTime}ms`;
        
        // Add log
        addGameLog(`Hit! ${reactionTime}ms`, "success");
        
        // Play sound
        playSound("hit");
        
        // Generate new shape
        setTimeout(() => {
            const randomShape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
            gameState.currentShapes[index] = randomShape;
            document.getElementById(`shape-${index}`).outerHTML = renderShape(randomShape, index);
        }, 300);
    } else {
        // Fake trigger - punish player
        gameState.totalMisses++;
        
        // Screen shake
        document.getElementById("game-shapes-container").classList.add("screen-shake");
        
        // Add log
        addGameLog("Fake trigger! Miss!", "warning");
        
        // Play sound
        playSound("fail");
        
        // Remove shake effect
        setTimeout(() => {
            document.getElementById("game-shapes-container").classList.remove("screen-shake");
        }, 300);
        
        // Remove fake shape
        shapeElement.style.opacity = "0";
        setTimeout(() => {
            shapeElement.remove();
        }, 200);
    }
    
    updateStatsDisplay();
}

function gameTimer() {
    if (!gameState.isRunning) return;
    
    gameState.remainingTime -= 100;
    
    if (gameState.remainingTime <= 0) {
        endGame();
        return;
    }
    
    // Randomly add new shapes
    if (Math.random() < 0.3) {
        const randomShape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        gameState.currentShapes.push(randomShape);
        const newIndex = gameState.currentShapes.length - 1;
        document.getElementById("game-shapes-container").innerHTML += renderShape(randomShape, newIndex);
    }
    
    setTimeout(gameTimer, 100);
}

function endGame() {
    gameState.isRunning = false;
    
    const averageTime = gameState.reactionTimes.length > 0 ? 
        Math.round(gameState.reactionTimes.reduce((a, b) => a + b) / gameState.reactionTimes.length) : 0;
    
    document.getElementById("current-time-display").textContent = `Game over! Avg: ${averageTime}ms`;
    addGameLog(`Game ended. Average reaction: ${averageTime}ms`, "info");
    
    playSound("end");
    
    // Clear shapes
    document.getElementById("game-shapes-container").innerHTML = "";
}

function addGameLog(message, type) {
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    gameState.gameLog.push({text: message, type: type, time: time});
    
    document.getElementById("game-log-list").innerHTML = renderGameLog(gameState.gameLog);
}

function updateStatsDisplay() {
    const averageTime = gameState.reactionTimes.length > 0 ? 
        Math.round(gameState.reactionTimes.reduce((a, b) => a + b) / gameState.reactionTimes.length) : 0;
    
    statsData[0].value = `${gameState.bestTime}ms`;
    statsData[1].value = `${averageTime}ms`;
    statsData[2].value = `${gameState.totalHits}`;
    statsData[3].value = `${gameState.totalMisses}`;
    
    document.getElementById("stats-container").innerHTML = renderStats(statsData);
}

function playSound(type) {
    // In a real implementation, you would use actual audio files
    // This is a placeholder for sound effect logic
    console.log(`Sound effect: ${type}`);
}

// Initialize the page
document.getElementById("nav-menu").innerHTML = renderNavItems(navigationItems);
document.getElementById("stats-container").innerHTML = renderStats(statsData);
document.getElementById("controls-container").innerHTML = renderControls(controlsData);
document.getElementById("leaderboard-list").innerHTML = renderLeaderboard(leaderboardData);
document.getElementById("footer-links").innerHTML = renderFooterLinks(footerLinks);
document.getElementById("game-log-list").innerHTML = renderGameLog(gameLogMessages);
document.getElementById("current-time-display").textContent = "Click Start to play!";
document.getElementById("difficulty-display").textContent = "Difficulty: Level 1";

// Delegated event handling for navigation
document.addEventListener("click", function(event) {
    const link = event.target.closest("a[href^='#']");
    if (!link) return;
    event.preventDefault();
    const targetId = link.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
});

// Load best time from localStorage
if (localStorage.getItem("bestReactionTime")) {
    gameState.bestTime = parseInt(localStorage.getItem("bestReactionTime"));
    statsData[0].value = `${gameState.bestTime}ms`;
    document.getElementById("stats-container").innerHTML = renderStats(statsData);
}






