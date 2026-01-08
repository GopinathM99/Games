class Game {
    constructor(container) {
        this.container = container;
        this.world = null;
        this.snake = null;
        this.food = null;
        this.input = null;
        
        this.gameState = 'speedSelect'; // 'speedSelect', 'menu', 'playing', 'paused', 'gameOver'
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.currentSpeedLevel = 'normal';
        
        // Speed configurations
        this.speedLevels = {
            easy: { speed: 0.25, name: 'Easy', emoji: '🐌' },
            normal: { speed: 0.15, name: 'Normal', emoji: '🐍' },
            fast: { speed: 0.1, name: 'Fast', emoji: '⚡' },
            expert: { speed: 0.06, name: 'Expert', emoji: '🚀' }
        };
        
        this.lastFrameTime = 0;
        this.isRunning = false;
        this.foodCollectedThisFrame = false; // Prevent multiple collisions per frame
        
        this.init();
    }
    
    init() {
        // Initialize components
        this.world = new World(this.container);
        this.snake = new Snake(this.world);
        this.food = new Food(this.world);
        this.input = new Input();
        
        // Set up event handlers
        this.setupEventHandlers();
        
        // Set up food collision checker
        this.food.setSnakeCollisionChecker((pos) => this.snake.checkCollision(pos));
        
        // Set up snake death handler
        this.snake.onDie = () => this.gameOver();
        
        // Start game loop
        this.startGameLoop();
        
        // Update UI
        this.updateUI();
        
        // Show initial speed selection
        this.showSpeedControlScreen();
    }
    
    setupEventHandlers() {
        // Restart button
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restart());
        }
        
        // Change speed button
        const changeSpeedBtn = document.getElementById('change-speed-btn');
        if (changeSpeedBtn) {
            changeSpeedBtn.addEventListener('click', () => this.showSpeedSelection());
        }
        
        // Start game button
        const startGameBtn = document.getElementById('start-game-btn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.startGameFromSpeedSelect());
        }
        
        // Speed selection buttons
        const speedButtons = document.querySelectorAll('.speed-btn');
        speedButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                speedButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                // Update current speed level
                this.currentSpeedLevel = e.target.dataset.speed;
            });
        });
        
        // Space key to start/pause - use proper event listener
        document.addEventListener('keydown', (event) => {
            console.log('Key pressed:', event.code, 'Game state:', this.gameState);
            if (event.code === 'Space') {
                event.preventDefault();
                console.log('Space key pressed!');
                if (this.gameState === 'menu') {
                    console.log('Starting game from menu...');
                    this.startGame();
                } else if (this.gameState === 'playing') {
                    console.log('Pausing game...');
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    console.log('Resuming game...');
                    this.resumeGame();
                } else if (this.gameState === 'speedSelect') {
                    console.log('Starting game from speed selection...');
                    this.startGameFromSpeedSelect();
                }
            }
        });
    }
    
    startGameLoop() {
        this.isRunning = true;
        this.gameLoop();
    }
    
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Update game components
        this.update(deltaTime);
        
        // Render the scene
        this.world.render();
        
        // Continue the loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Handle input
        this.handleInput();
        
        // Reset food collection flag each frame
        this.foodCollectedThisFrame = false;
        
        // Update game components based on state
        if (this.gameState === 'playing') {
            this.snake.update(performance.now());
            this.food.update();
            this.checkFoodCollision();
            this.updateCamera();
            
            // Update lighting to follow the snake
            const snakeHeadPos = this.snake.getHeadPosition();
            const worldPos = this.world.gridToWorld(snakeHeadPos);
            this.world.updateSnakeLight(worldPos);
        }
    }
    
    handleInput() {
        // Get movement direction from input
        const direction = this.input.getMovementDirection();
        if (direction && this.gameState === 'playing') {
            this.snake.changeDirection(direction);
        }
    }
    
    checkFoodCollision() {
        // Skip if we already collected food this frame
        if (this.foodCollectedThisFrame) return;
        
        const snakeHead = this.snake.getHeadPosition();
        const foodPos = this.food.gridPos;
        
        // Only check collision if food exists and hasn't been collected
        if (foodPos && !this.food.isCollected && snakeHead.x === foodPos.x && snakeHead.z === foodPos.z) {
            // Snake ate food
            console.log('Food collision detected! Snake length before:', this.snake.segments.length);
            this.foodCollectedThisFrame = true; // Set flag to prevent multiple collisions
            this.food.collect();
            this.snake.grow();
            console.log('Snake length after growth:', this.snake.segments.length);
            this.score += 10;
            this.updateUI();
            
            // Update high score
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('snakeHighScore', this.highScore);
            }
        }
    }
    
    updateCamera() {
        // Static camera - no movement, just look at center of board
        this.world.camera.position.set(0, 25, 0);
        this.world.camera.lookAt(0, 0, 0);
    }
    
    showSpeedSelection() {
        this.gameState = 'speedSelect';
        this.hideGameOverScreen();
        this.showSpeedControlScreen();
        this.updateGameStatus('Choose your speed level');
    }
    
    startGameFromSpeedSelect() {
        this.hideSpeedControlScreen();
        this.startGame();
    }
    
    startGame() {
        console.log('Starting game...');
        this.gameState = 'playing';
        this.score = 0;
        
        // Set snake speed based on selected level
        const speedConfig = this.speedLevels[this.currentSpeedLevel];
        this.snake.setSpeed(speedConfig.speed);
        
        this.snake.start();
        this.updateUI();
        this.updateGameStatus(`Use arrow keys to move - ${speedConfig.emoji} ${speedConfig.name} Mode`);
        console.log('Game started! Current state:', this.gameState, 'Speed:', this.currentSpeedLevel);
    }
    
    pauseGame() {
        this.gameState = 'paused';
        this.snake.stop();
        this.updateGameStatus('Game paused - Press SPACE to resume');
    }
    
    resumeGame() {
        this.gameState = 'playing';
        this.snake.start();
        this.updateGameStatus('Use arrow keys to move');
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.snake.stop();
        this.showGameOverScreen();
        this.updateGameStatus('Game Over!');
    }
    
    restart() {
        // Reset components
        this.snake.reset();
        this.food.reset();
        
        // Reset game state
        this.gameState = 'speedSelect';
        this.score = 0;
        
        // Reset camera to top-down view
        this.world.camera.position.set(0, 25, 0);
        this.world.camera.lookAt(0, 0, 0);
        
        // Update UI
        this.updateUI();
        this.hideGameOverScreen();
        this.showSpeedSelection();
    }
    
    updateUI() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `Score: ${this.score}`;
        }
    }
    
    updateGameStatus(message) {
        const statusElement = document.getElementById('game-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
    
    showGameOverScreen() {
        const gameOverScreen = document.getElementById('game-over-screen');
        const finalScoreElement = document.getElementById('final-score');
        const speedLevelElement = document.getElementById('game-speed-level');
        
        if (gameOverScreen && finalScoreElement) {
            finalScoreElement.textContent = this.score;
            if (speedLevelElement) {
                const speedConfig = this.speedLevels[this.currentSpeedLevel];
                speedLevelElement.textContent = `${speedConfig.emoji} ${speedConfig.name}`;
            }
            gameOverScreen.classList.remove('hidden');
        }
    }
    
    hideGameOverScreen() {
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
    }
    
    showSpeedControlScreen() {
        const speedControlScreen = document.getElementById('speed-control');
        if (speedControlScreen) {
            speedControlScreen.classList.remove('hidden');
        }
    }
    
    hideSpeedControlScreen() {
        const speedControlScreen = document.getElementById('speed-control');
        if (speedControlScreen) {
            speedControlScreen.classList.add('hidden');
        }
    }
    
    // Get current game state
    getGameState() {
        return this.gameState;
    }
    
    // Get current score
    getScore() {
        return this.score;
    }
    
    // Get high score
    getHighScore() {
        return this.highScore;
    }
    
    // Pause the game loop
    pause() {
        this.isRunning = false;
    }
    
    // Resume the game loop
    resume() {
        this.isRunning = true;
        this.gameLoop();
    }
    
    // Cleanup resources
    destroy() {
        this.isRunning = false;
        this.input.destroy();
        
        // Remove event listeners
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.removeEventListener('click', this.restart);
        }
    }
}
