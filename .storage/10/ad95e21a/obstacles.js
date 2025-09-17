// Obstacle System
export class ObstacleManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.obstacles = [];
        this.laneWidth = canvas.width / 3;
        this.spawnTimer = 0;
        this.spawnInterval = 1500; // Base spawn interval in ms
        this.gameSpeed = 2;
        this.difficulty = 1;
        this.lastSpawnLane = -1;
    }

    update(deltaTime, gameSpeed) {
        this.gameSpeed = gameSpeed;
        this.spawnTimer += deltaTime;
        
        // Spawn new obstacles
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnObstacle();
            this.spawnTimer = 0;
            
            // Gradually increase difficulty
            this.difficulty += 0.001;
            this.spawnInterval = Math.max(800, 1500 - (this.difficulty * 100));
        }
        
        // Update existing obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.y += this.gameSpeed * (1 + this.difficulty * 0.1);
            
            // Remove obstacles that are off screen
            if (obstacle.y > this.canvas.height + 100) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    spawnObstacle() {
        // Choose a random lane, but avoid spawning in the same lane consecutively
        let lane;
        do {
            lane = Math.floor(Math.random() * 3);
        } while (lane === this.lastSpawnLane && Math.random() < 0.7);
        
        this.lastSpawnLane = lane;
        
        const x = this.laneWidth * lane + this.laneWidth / 2;
        const obstacleType = this.getRandomObstacleType();
        
        let obstacle;
        
        switch (obstacleType) {
            case 'barrier':
                obstacle = this.createBarrier(x, lane);
                break;
            case 'pit':
                obstacle = this.createPit(x, lane);
                break;
            case 'moving':
                obstacle = this.createMovingObstacle(x, lane);
                break;
            default:
                obstacle = this.createBarrier(x, lane);
        }
        
        this.obstacles.push(obstacle);
    }

    getRandomObstacleType() {
        const types = ['barrier', 'barrier', 'pit', 'moving']; // Weighted towards barriers
        return types[Math.floor(Math.random() * types.length)];
    }

    createBarrier(x, lane) {
        return {
            x: x - 20,
            y: -50,
            width: 40,
            height: 60,
            lane: lane,
            type: 'barrier',
            color: '#E74C3C'
        };
    }

    createPit(x, lane) {
        return {
            x: x - 30,
            y: -20,
            width: 60,
            height: 20,
            lane: lane,
            type: 'pit',
            color: '#2C3E50'
        };
    }

    createMovingObstacle(x, lane) {
        return {
            x: x - 25,
            y: -40,
            width: 50,
            height: 40,
            lane: lane,
            type: 'moving',
            color: '#9B59B6',
            moveDirection: Math.random() < 0.5 ? -1 : 1,
            moveSpeed: 1 + Math.random() * 2,
            originalX: x - 25
        };
    }

    render() {
        this.ctx.save();
        
        for (const obstacle of this.obstacles) {
            this.ctx.fillStyle = obstacle.color;
            
            switch (obstacle.type) {
                case 'barrier':
                    this.renderBarrier(obstacle);
                    break;
                case 'pit':
                    this.renderPit(obstacle);
                    break;
                case 'moving':
                    this.renderMovingObstacle(obstacle);
                    break;
            }
        }
        
        this.ctx.restore();
    }

    renderBarrier(obstacle) {
        // Draw main barrier
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Add warning stripes
        this.ctx.fillStyle = '#F1C40F';
        for (let i = 0; i < 3; i++) {
            this.ctx.fillRect(
                obstacle.x + 5, 
                obstacle.y + i * 20 + 5, 
                obstacle.width - 10, 
                5
            );
        }
    }

    renderPit(obstacle) {
        // Draw pit opening
        this.ctx.fillRect(obstacle.x, this.canvas.height - 80, obstacle.width, obstacle.height);
        
        // Add danger indicators
        this.ctx.fillStyle = '#E74C3C';
        this.ctx.fillRect(obstacle.x, this.canvas.height - 85, obstacle.width, 5);
        this.ctx.fillRect(obstacle.x, this.canvas.height - 60, obstacle.width, 5);
    }

    renderMovingObstacle(obstacle) {
        // Update position for moving obstacles
        obstacle.x += obstacle.moveDirection * obstacle.moveSpeed;
        
        // Bounce off lane boundaries
        const laneLeft = this.laneWidth * obstacle.lane;
        const laneRight = laneLeft + this.laneWidth;
        
        if (obstacle.x <= laneLeft || obstacle.x + obstacle.width >= laneRight) {
            obstacle.moveDirection *= -1;
        }
        
        // Draw moving obstacle
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Add movement indicator
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(
            obstacle.x + obstacle.width/2, 
            obstacle.y + obstacle.height/2, 
            8, 0, Math.PI * 2
        );
        this.ctx.fill();
    }

    // Check collision with player
    checkCollisions(player) {
        const playerBounds = player.getBounds();
        
        for (const obstacle of this.obstacles) {
            // Skip collision if player has shield
            if (player.hasShield) continue;
            
            // Different collision logic for different obstacle types
            if (obstacle.type === 'pit') {
                // Pit collision only when player is on ground and not jumping
                if (!player.isJumping && player.collidesWith({
                    x: obstacle.x,
                    y: this.canvas.height - 80,
                    width: obstacle.width,
                    height: obstacle.height
                })) {
                    return obstacle;
                }
            } else {
                // Regular collision detection
                if (player.collidesWith(obstacle)) {
                    return obstacle;
                }
            }
        }
        
        return null;
    }

    // Get obstacles in range for magnet effect
    getObstaclesInRange(x, y, range) {
        return this.obstacles.filter(obstacle => {
            const dx = obstacle.x + obstacle.width/2 - x;
            const dy = obstacle.y + obstacle.height/2 - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= range;
        });
    }

    // Clear all obstacles
    clear() {
        this.obstacles = [];
        this.spawnTimer = 0;
        this.difficulty = 1;
        this.lastSpawnLane = -1;
    }

    // Reset difficulty
    reset() {
        this.clear();
        this.spawnInterval = 1500;
    }
}