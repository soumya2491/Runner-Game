// Collectibles System (Coins and Power-ups)
export class CollectibleManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.collectibles = [];
        this.laneWidth = canvas.width / 3;
        this.spawnTimer = 0;
        this.coinSpawnInterval = 800;
        this.powerUpSpawnInterval = 8000;
        this.powerUpTimer = 0;
        this.gameSpeed = 2;
    }

    update(deltaTime, gameSpeed) {
        this.gameSpeed = gameSpeed;
        this.spawnTimer += deltaTime;
        this.powerUpTimer += deltaTime;
        
        // Spawn coins more frequently
        if (this.spawnTimer >= this.coinSpawnInterval) {
            this.spawnCoin();
            this.spawnTimer = 0;
        }
        
        // Spawn power-ups less frequently
        if (this.powerUpTimer >= this.powerUpSpawnInterval) {
            this.spawnPowerUp();
            this.powerUpTimer = 0;
        }
        
        // Update existing collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            collectible.y += this.gameSpeed;
            
            // Update animation
            collectible.animationTime += deltaTime;
            
            // Remove collectibles that are off screen
            if (collectible.y > this.canvas.height + 50) {
                this.collectibles.splice(i, 1);
            }
        }
    }

    spawnCoin() {
        // Sometimes spawn coin patterns
        if (Math.random() < 0.3) {
            this.spawnCoinPattern();
        } else {
            this.spawnSingleCoin();
        }
    }

    spawnSingleCoin() {
        const lane = Math.floor(Math.random() * 3);
        const x = this.laneWidth * lane + this.laneWidth / 2;
        
        this.collectibles.push({
            x: x,
            y: -30,
            width: 20,
            height: 20,
            type: 'coin',
            value: 10,
            animationTime: 0,
            collected: false
        });
    }

    spawnCoinPattern() {
        const pattern = Math.random();
        
        if (pattern < 0.33) {
            // Horizontal line of coins
            for (let lane = 0; lane < 3; lane++) {
                const x = this.laneWidth * lane + this.laneWidth / 2;
                this.collectibles.push({
                    x: x,
                    y: -30,
                    width: 20,
                    height: 20,
                    type: 'coin',
                    value: 10,
                    animationTime: Math.random() * 1000,
                    collected: false
                });
            }
        } else if (pattern < 0.66) {
            // Vertical line of coins in one lane
            const lane = Math.floor(Math.random() * 3);
            const x = this.laneWidth * lane + this.laneWidth / 2;
            
            for (let i = 0; i < 4; i++) {
                this.collectibles.push({
                    x: x,
                    y: -30 - (i * 40),
                    width: 20,
                    height: 20,
                    type: 'coin',
                    value: 10,
                    animationTime: i * 200,
                    collected: false
                });
            }
        } else {
            // Zigzag pattern
            for (let i = 0; i < 3; i++) {
                const lane = i % 3;
                const x = this.laneWidth * lane + this.laneWidth / 2;
                this.collectibles.push({
                    x: x,
                    y: -30 - (i * 50),
                    width: 20,
                    height: 20,
                    type: 'coin',
                    value: 10,
                    animationTime: i * 300,
                    collected: false
                });
            }
        }
    }

    spawnPowerUp() {
        const lane = Math.floor(Math.random() * 3);
        const x = this.laneWidth * lane + this.laneWidth / 2;
        const powerUpTypes = ['magnet', 'shield', 'speed'];
        const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        this.collectibles.push({
            x: x,
            y: -40,
            width: 30,
            height: 30,
            type: type,
            value: 0,
            animationTime: 0,
            collected: false
        });
    }

    render() {
        this.ctx.save();
        
        for (const collectible of this.collectibles) {
            if (collectible.collected) continue;
            
            switch (collectible.type) {
                case 'coin':
                    this.renderCoin(collectible);
                    break;
                case 'magnet':
                    this.renderPowerUp(collectible, '#E67E22', '🧲');
                    break;
                case 'shield':
                    this.renderPowerUp(collectible, '#F1C40F', '🛡️');
                    break;
                case 'speed':
                    this.renderPowerUp(collectible, '#E74C3C', '⚡');
                    break;
            }
        }
        
        this.ctx.restore();
    }

    renderCoin(coin) {
        const rotation = (coin.animationTime * 0.005) % (Math.PI * 2);
        const scale = 0.8 + Math.sin(coin.animationTime * 0.01) * 0.2;
        
        this.ctx.save();
        this.ctx.translate(coin.x, coin.y);
        this.ctx.rotate(rotation);
        this.ctx.scale(scale, 1);
        
        // Draw coin
        this.ctx.fillStyle = '#F1C40F';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, coin.width/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add coin details
        this.ctx.strokeStyle = '#D68910';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Inner circle
        this.ctx.fillStyle = '#D68910';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, coin.width/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    renderPowerUp(powerUp, color, emoji) {
        const pulse = 0.8 + Math.sin(powerUp.animationTime * 0.008) * 0.2;
        const glow = Math.sin(powerUp.animationTime * 0.01) * 0.5 + 0.5;
        
        this.ctx.save();
        this.ctx.translate(powerUp.x, powerUp.y);
        this.ctx.scale(pulse, pulse);
        
        // Draw glow effect
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10 + glow * 10;
        
        // Draw power-up background
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, powerUp.width/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw power-up border
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Draw emoji/symbol
        this.ctx.shadowBlur = 0;
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(emoji, 0, 0);
        
        this.ctx.restore();
    }

    // Check collisions with player
    checkCollisions(player, effectsManager) {
        const playerBounds = player.getBounds();
        const collected = [];
        
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            if (collectible.collected) continue;
            
            let shouldCollect = false;
            
            // Check direct collision
            if (this.isColliding(playerBounds, collectible)) {
                shouldCollect = true;
            }
            
            // Check magnet effect for coins
            if (!shouldCollect && collectible.type === 'coin' && player.hasMagnet) {
                const distance = this.getDistance(
                    player.x, player.y,
                    collectible.x, collectible.y
                );
                
                if (distance < 100) {
                    // Move coin towards player
                    const dx = player.x - collectible.x;
                    const dy = player.y - collectible.y;
                    const magnetForce = 0.2;
                    
                    collectible.x += dx * magnetForce;
                    collectible.y += dy * magnetForce;
                    
                    if (distance < 30) {
                        shouldCollect = true;
                    }
                }
            }
            
            if (shouldCollect) {
                collectible.collected = true;
                collected.push(collectible);
                
                // Create collection effect
                if (collectible.type === 'coin') {
                    effectsManager.createCoinEffect(collectible.x, collectible.y);
                } else {
                    effectsManager.createPowerUpEffect(collectible.x, collectible.y);
                }
                
                // Remove from array
                this.collectibles.splice(i, 1);
            }
        }
        
        return collected;
    }

    isColliding(playerBounds, collectible) {
        return playerBounds.x < collectible.x + collectible.width &&
               playerBounds.x + playerBounds.width > collectible.x &&
               playerBounds.y < collectible.y + collectible.height &&
               playerBounds.y + playerBounds.height > collectible.y;
    }

    getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Clear all collectibles
    clear() {
        this.collectibles = [];
        this.spawnTimer = 0;
        this.powerUpTimer = 0;
    }

    // Reset spawn timers
    reset() {
        this.clear();
    }
}