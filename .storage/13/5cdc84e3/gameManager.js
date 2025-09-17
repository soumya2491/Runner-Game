// Game Manager - Controls game state, scoring, and main game loop
export class GameManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Game state
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        this.score = 0;
        this.coins = 0;
        this.distance = 0;
        this.gameSpeed = 2;
        this.baseSpeed = 2;
        
        // Timing
        this.lastTime = 0;
        this.distanceTimer = 0;
        
        // Background
        this.backgroundY = 0;
        this.laneLines = [];
        this.initializeLanes();
        
        // UI elements
        this.setupUI();
    }

    initializeLanes() {
        const laneWidth = this.canvas.width / 3;
        this.laneLines = [
            laneWidth,
            laneWidth * 2
        ];
    }

    setupUI() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Restart button
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
    }

    startGame() {
        this.gameState = 'playing';
        this.hideScreen('startScreen');
        this.resetGame();
    }

    restartGame() {
        this.gameState = 'playing';
        this.hideScreen('gameOverScreen');
        this.resetGame();
    }

    resetGame() {
        this.score = 0;
        this.coins = 0;
        this.distance = 0;
        this.gameSpeed = this.baseSpeed;
        this.distanceTimer = 0;
        this.backgroundY = 0;
        this.updateUI();
    }

    gameOver() {
        this.gameState = 'gameOver';
        this.showGameOverScreen();
    }

    showGameOverScreen() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalCoins').textContent = this.coins;
        document.getElementById('finalDistance').textContent = `${Math.floor(this.distance)}m`;
        this.showScreen('gameOverScreen');
    }

    showScreen(screenId) {
        document.getElementById(screenId).classList.remove('hidden');
    }

    hideScreen(screenId) {
        document.getElementById(screenId).classList.add('hidden');
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update distance
        this.distanceTimer += deltaTime;
        if (this.distanceTimer >= 100) { // Update every 100ms
            this.distance += 1;
            this.distanceTimer = 0;
        }
        
        // Gradually increase game speed
        this.gameSpeed = this.baseSpeed + (this.distance * 0.001);
        
        // Update background
        this.updateBackground();
        
        // Update UI
        this.updateUI();
    }

    updateBackground() {
        this.backgroundY += this.gameSpeed;
        if (this.backgroundY >= 100) {
            this.backgroundY = 0;
        }
    }

    renderBackground() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw ground
        this.ctx.fillStyle = '#90EE90';
        this.ctx.fillRect(0, this.canvas.height - 120, this.canvas.width, 120);
        
        // Draw lane dividers
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([20, 20]);
        
        for (const laneX of this.laneLines) {
            this.ctx.beginPath();
            
            // Draw dashed lines that move with the background
            for (let y = -40 + this.backgroundY; y < this.canvas.height; y += 40) {
                this.ctx.moveTo(laneX, y);
                this.ctx.lineTo(laneX, y + 20);
            }
            
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
        
        // Draw some background elements (clouds, buildings, etc.)
        this.renderBackgroundElements();
    }

    renderBackgroundElements() {
        // Simple clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        const cloudPositions = [
            { x: 100, y: 80 },
            { x: 300, y: 60 },
            { x: 600, y: 90 },
            { x: 150, y: 40 }
        ];
        
        for (const cloud of cloudPositions) {
            this.renderCloud(cloud.x, cloud.y);
        }
        
        // Simple buildings in background
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        const buildingHeights = [40, 60, 35, 80, 50];
        
        for (let i = 0; i < buildingHeights.length; i++) {
            const x = i * 160;
            const height = buildingHeights[i];
            this.ctx.fillRect(x, this.canvas.height - 120 - height, 150, height);
        }
    }

    renderCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.arc(x + 20, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 40, y, 15, 0, Math.PI * 2);
        this.ctx.arc(x + 15, y - 10, 12, 0, Math.PI * 2);
        this.ctx.arc(x + 25, y - 10, 12, 0, Math.PI * 2);
        this.ctx.fill();
    }

    addScore(points) {
        this.score += points;
        this.updateUI();
    }

    addCoins(amount) {
        this.coins += amount;
        this.score += amount * 10; // Coins also add to score
        this.updateUI();
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('coins').textContent = this.coins;
        document.getElementById('distance').textContent = `${Math.floor(this.distance)}m`;
    }

    // Handle power-up collection
    handlePowerUpCollection(powerUpType, player, uiEffects) {
        switch (powerUpType) {
            case 'magnet':
                player.activateMagnet(8000);
                uiEffects.flashPowerUpIndicator('magnetIndicator', 8000);
                break;
            case 'shield':
                player.activateShield(5000);
                uiEffects.flashPowerUpIndicator('shieldIndicator', 5000);
                break;
            case 'speed':
                player.activateSpeedBoost(6000);
                uiEffects.flashPowerUpIndicator('speedIndicator', 6000);
                break;
        }
        
        this.addScore(50); // Bonus points for power-ups
    }

    // Handle coin collection
    handleCoinCollection(coinValue, coinX, coinY, uiEffects) {
        this.addCoins(1);
        this.addScore(coinValue);
        
        // Show score popup
        const canvasRect = this.canvas.getBoundingClientRect();
        uiEffects.showScorePopup(
            coinValue, 
            canvasRect.left + coinX, 
            canvasRect.top + coinY
        );
    }

    // Handle collision
    handleCollision(player, effectsManager) {
        if (player.hasShield) {
            // Shield absorbs the hit
            player.hasShield = false;
            player.shieldTimer = 0;
            document.getElementById('shieldIndicator').classList.add('hidden');
            effectsManager.createPowerUpEffect(player.x, player.y, '#FFD700');
            return false; // Don't end game
        } else {
            // Game over
            effectsManager.createCollisionEffect(player.x, player.y);
            effectsManager.createScreenShake(8, 500);
            this.gameOver();
            return true; // End game
        }
    }

    // Get current game speed (used by other systems)
    getCurrentSpeed() {
        return this.gameSpeed;
    }

    // Check if game is playing
    isPlaying() {
        return this.gameState === 'playing';
    }

    // Render game over overlay
    renderGameOverOverlay() {
        if (this.gameState === 'gameOver') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        }
    }

    // Pause/resume functionality
    pause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        }
    }

    resume() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }
}