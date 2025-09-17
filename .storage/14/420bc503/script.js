// Main Game Script - Endless Runner
import { Player } from './player.js';
import { ObstacleManager } from './obstacles.js';
import { CollectibleManager } from './collectibles.js';
import { GameManager } from './gameManager.js';
import { EffectsManager, UIEffects } from './effects.js';

class EndlessRunnerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Make canvas responsive
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize game systems
        this.player = new Player(this.canvas, this.ctx);
        this.obstacleManager = new ObstacleManager(this.canvas, this.ctx);
        this.collectibleManager = new CollectibleManager(this.canvas, this.ctx);
        this.gameManager = new GameManager(this.canvas, this.ctx);
        this.effectsManager = new EffectsManager(this.canvas, this.ctx);
        
        // Game loop
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        
        // Start the game loop
        requestAnimationFrame(this.gameLoop);
        
        // Add visibility change handler to pause game when tab is not active
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.gameManager.pause();
            } else {
                this.gameManager.resume();
            }
        });
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Set canvas size based on container
        const maxWidth = Math.min(800, containerRect.width - 40);
        const maxHeight = Math.min(600, containerRect.height - 40);
        
        // Maintain aspect ratio
        const aspectRatio = 800 / 600;
        let canvasWidth = maxWidth;
        let canvasHeight = maxWidth / aspectRatio;
        
        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = maxHeight * aspectRatio;
        }
        
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        
        // Update player and obstacle positions if they exist
        if (this.player) {
            this.player.laneWidth = this.canvas.width / 3;
            this.player.groundY = this.canvas.height - 100;
            this.player.y = this.player.groundY;
            this.player.targetX = this.player.laneWidth * this.player.lane + this.player.laneWidth / 2;
            this.player.x = this.player.targetX;
        }
        
        if (this.obstacleManager) {
            this.obstacleManager.laneWidth = this.canvas.width / 3;
        }
        
        if (this.collectibleManager) {
            this.collectibleManager.laneWidth = this.canvas.width / 3;
        }
        
        if (this.gameManager) {
            this.gameManager.initializeLanes();
        }
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game systems
        this.update(deltaTime);
        
        // Render everything
        this.render();
        
        // Continue the game loop
        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        // Only update if game is playing
        if (!this.gameManager.isPlaying()) {
            return;
        }
        
        const gameSpeed = this.gameManager.getCurrentSpeed();
        
        // Update all game systems
        this.gameManager.update(deltaTime);
        this.player.update(deltaTime);
        this.obstacleManager.update(deltaTime, gameSpeed);
        this.collectibleManager.update(deltaTime, gameSpeed);
        this.effectsManager.update();
        
        // Check for collectible collisions
        const collectedItems = this.collectibleManager.checkCollisions(this.player, this.effectsManager);
        
        for (const item of collectedItems) {
            if (item.type === 'coin') {
                this.gameManager.handleCoinCollection(
                    item.value, 
                    item.x, 
                    item.y, 
                    UIEffects
                );
            } else {
                // Power-up
                this.gameManager.handlePowerUpCollection(
                    item.type, 
                    this.player, 
                    UIEffects
                );
            }
        }
        
        // Check for obstacle collisions
        const hitObstacle = this.obstacleManager.checkCollisions(this.player);
        if (hitObstacle) {
            const gameEnded = this.gameManager.handleCollision(this.player, this.effectsManager);
            if (gameEnded) {
                // Reset all systems for next game
                this.player.reset();
                this.obstacleManager.reset();
                this.collectibleManager.reset();
                this.effectsManager.clear();
            }
        }
        
        // Create speed trail effect when speed boost is active
        if (this.player.hasSpeedBoost && Math.random() < 0.3) {
            this.effectsManager.createSpeedTrail(this.player.x, this.player.y);
        }
        
        // Add distance-based score
        if (Math.floor(this.gameManager.distance) % 10 === 0 && this.gameManager.distance > 0) {
            this.gameManager.addScore(1);
        }
    }

    render() {
        // Clear canvas and render background
        this.gameManager.renderBackground();
        
        // Only render game objects if playing
        if (this.gameManager.isPlaying()) {
            // Render game objects in order (back to front)
            this.collectibleManager.render();
            this.obstacleManager.render();
            this.player.render();
            this.effectsManager.render();
        }
        
        // Render game over overlay if needed
        this.gameManager.renderGameOverOverlay();
        
        // Debug info (can be removed in production)
        if (this.gameManager.isPlaying()) {
            this.renderDebugInfo();
        }
    }

    renderDebugInfo() {
        // Optional debug information
        if (window.location.hash === '#debug') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(10, 10, 200, 100);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`Speed: ${this.gameManager.getCurrentSpeed().toFixed(2)}`, 15, 25);
            this.ctx.fillText(`Obstacles: ${this.obstacleManager.obstacles.length}`, 15, 40);
            this.ctx.fillText(`Collectibles: ${this.collectibleManager.collectibles.length}`, 15, 55);
            this.ctx.fillText(`Player Lane: ${this.player.lane}`, 15, 70);
            this.ctx.fillText(`Jumping: ${this.player.isJumping}`, 15, 85);
            this.ctx.fillText(`Sliding: ${this.player.isSliding}`, 15, 100);
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new EndlessRunnerGame();
    
    // Make game globally accessible for debugging
    window.game = game;
    
    console.log('🎮 Endless Runner Game Loaded!');
    console.log('Controls:');
    console.log('- WASD or Arrow Keys to move');
    console.log('- Touch/Swipe on mobile');
    console.log('- Add #debug to URL for debug info');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.game) {
        if (document.hidden) {
            window.game.gameManager.pause();
        } else {
            window.game.gameManager.resume();
        }
    }
});

// Prevent context menu on canvas (for mobile)
document.getElementById('gameCanvas').addEventListener('contextmenu', (e) => {
    e.preventDefault();
});