// Main entry point for the Snake Game
let game = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Snake Game - Initializing...');
    
    // Get the game container
    const gameContainer = document.getElementById('game-container');
    
    if (!gameContainer) {
        console.error('Game container not found!');
        return;
    }
    
    try {
        // Initialize the game
        game = new Game(gameContainer);
        console.log('Snake Game - Initialized successfully!');
        
        // Add some helpful console messages
        console.log('Controls:');
        console.log('- Arrow keys: Move snake');
        console.log('- Space: Start/Pause game');
        console.log('- Swipe on mobile devices');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showErrorMessage('Failed to initialize game. Please refresh the page.');
    }
});

// Handle page visibility changes (pause when tab is not visible)
document.addEventListener('visibilitychange', () => {
    if (game) {
        if (document.hidden) {
            // Page is hidden, pause the game
            if (game.getGameState() === 'playing') {
                game.pauseGame();
            }
        } else {
            // Page is visible again, resume if it was paused
            if (game.getGameState() === 'paused') {
                game.resumeGame();
            }
        }
    }
});

// Handle window focus/blur events
window.addEventListener('focus', () => {
    if (game && game.getGameState() === 'paused') {
        game.resumeGame();
    }
});

window.addEventListener('blur', () => {
    if (game && game.getGameState() === 'playing') {
        game.pauseGame();
    }
});

// Error handling function
function showErrorMessage(message) {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;
        errorDiv.innerHTML = `
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                background: white;
                color: red;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">Refresh Page</button>
        `;
        gameContainer.appendChild(errorDiv);
    }
}

// Performance monitoring (optional)
if (typeof performance !== 'undefined' && performance.memory) {
    setInterval(() => {
        const memory = performance.memory;
        if (memory.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB threshold
            console.warn('High memory usage detected:', 
                Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB');
        }
    }, 10000); // Check every 10 seconds
}

// Export game instance for debugging (if needed)
window.snakeGame = game;
