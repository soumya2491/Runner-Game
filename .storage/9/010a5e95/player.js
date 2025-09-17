// Player Character System
export class Player {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Position and movement
        this.lane = 1; // 0 = left, 1 = center, 2 = right
        this.laneWidth = canvas.width / 3;
        this.x = this.laneWidth * this.lane + this.laneWidth / 2;
        this.y = canvas.height - 100;
        this.targetX = this.x;
        
        // Player dimensions
        this.width = 40;
        this.height = 60;
        
        // Movement states
        this.isJumping = false;
        this.isSliding = false;
        this.jumpVelocity = 0;
        this.groundY = canvas.height - 100;
        this.slideTimer = 0;
        
        // Animation
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        this.runCycle = 0;
        
        // Power-ups
        this.hasShield = false;
        this.hasMagnet = false;
        this.hasSpeedBoost = false;
        this.shieldTimer = 0;
        this.magnetTimer = 0;
        this.speedTimer = 0;
        
        // Movement smoothing
        this.moveSpeed = 8;
        this.jumpPower = -15;
        this.gravity = 0.8;
        
        // Input handling
        this.setupControls();
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'KeyA':
                case 'ArrowLeft':
                    this.moveLeft();
                    e.preventDefault();
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.moveRight();
                    e.preventDefault();
                    break;
                case 'KeyW':
                case 'ArrowUp':
                case 'Space':
                    this.jump();
                    e.preventDefault();
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.slide();
                    e.preventDefault();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'KeyS' || e.code === 'ArrowDown') {
                this.stopSliding();
            }
        });

        // Mobile controls
        document.getElementById('leftBtn').addEventListener('click', () => this.moveLeft());
        document.getElementById('rightBtn').addEventListener('click', () => this.moveRight());
        document.getElementById('jumpBtn').addEventListener('click', () => this.jump());
        document.getElementById('slideBtn').addEventListener('click', () => this.slide());

        // Touch/swipe controls
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const deltaTime = Date.now() - touchStartTime;
            
            // Only register swipes that are quick enough
            if (deltaTime < 300) {
                const minSwipeDistance = 30;
                
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (Math.abs(deltaX) > minSwipeDistance) {
                        if (deltaX > 0) {
                            this.moveRight();
                        } else {
                            this.moveLeft();
                        }
                    }
                } else {
                    // Vertical swipe
                    if (Math.abs(deltaY) > minSwipeDistance) {
                        if (deltaY < 0) {
                            this.jump();
                        } else {
                            this.slide();
                        }
                    }
                }
            }
        });
    }

    moveLeft() {
        if (this.lane > 0) {
            this.lane--;
            this.targetX = this.laneWidth * this.lane + this.laneWidth / 2;
        }
    }

    moveRight() {
        if (this.lane < 2) {
            this.lane++;
            this.targetX = this.laneWidth * this.lane + this.laneWidth / 2;
        }
    }

    jump() {
        if (!this.isJumping && !this.isSliding) {
            this.isJumping = true;
            this.jumpVelocity = this.jumpPower;
        }
    }

    slide() {
        if (!this.isJumping && !this.isSliding) {
            this.isSliding = true;
            this.slideTimer = 500; // Slide duration in ms
        }
    }

    stopSliding() {
        this.isSliding = false;
        this.slideTimer = 0;
    }

    // Power-up methods
    activateShield(duration = 5000) {
        this.hasShield = true;
        this.shieldTimer = duration;
    }

    activateMagnet(duration = 8000) {
        this.hasMagnet = true;
        this.magnetTimer = duration;
    }

    activateSpeedBoost(duration = 6000) {
        this.hasSpeedBoost = true;
        this.speedTimer = duration;
    }

    update(deltaTime) {
        // Smooth lane movement
        const dx = this.targetX - this.x;
        if (Math.abs(dx) > 1) {
            this.x += dx * 0.2;
        } else {
            this.x = this.targetX;
        }

        // Handle jumping
        if (this.isJumping) {
            this.y += this.jumpVelocity;
            this.jumpVelocity += this.gravity;
            
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.isJumping = false;
                this.jumpVelocity = 0;
            }
        }

        // Handle sliding
        if (this.isSliding) {
            this.slideTimer -= deltaTime;
            if (this.slideTimer <= 0) {
                this.stopSliding();
            }
        }

        // Update power-up timers
        if (this.hasShield) {
            this.shieldTimer -= deltaTime;
            if (this.shieldTimer <= 0) {
                this.hasShield = false;
            }
        }

        if (this.hasMagnet) {
            this.magnetTimer -= deltaTime;
            if (this.magnetTimer <= 0) {
                this.hasMagnet = false;
            }
        }

        if (this.hasSpeedBoost) {
            this.speedTimer -= deltaTime;
            if (this.speedTimer <= 0) {
                this.hasSpeedBoost = false;
            }
        }

        // Update animation
        this.runCycle += this.animationSpeed;
        if (this.runCycle >= Math.PI * 2) {
            this.runCycle = 0;
        }
    }

    render() {
        this.ctx.save();
        
        // Player body
        let playerHeight = this.height;
        let playerY = this.y;
        
        // Adjust size when sliding
        if (this.isSliding) {
            playerHeight = this.height * 0.5;
            playerY = this.y + this.height * 0.5;
        }
        
        // Player color based on state
        let playerColor = '#4ECDC4';
        if (this.hasShield) {
            playerColor = '#FFD700';
        } else if (this.hasSpeedBoost) {
            playerColor = '#FF6B6B';
        }
        
        // Draw shield effect
        if (this.hasShield) {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.x, playerY - playerHeight/2, this.width/2 + 10, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw player body
        this.ctx.fillStyle = playerColor;
        this.ctx.fillRect(this.x - this.width/2, playerY - playerHeight, this.width, playerHeight);
        
        // Draw running animation (simple leg movement)
        if (!this.isJumping && !this.isSliding) {
            const legOffset = Math.sin(this.runCycle * 4) * 5;
            this.ctx.fillStyle = '#2C3E50';
            
            // Left leg
            this.ctx.fillRect(this.x - this.width/4 - 3, playerY - 10, 6, 15 + legOffset);
            // Right leg  
            this.ctx.fillRect(this.x + this.width/4 - 3, playerY - 10, 6, 15 - legOffset);
        }
        
        // Draw head
        this.ctx.fillStyle = '#F39C12';
        this.ctx.beginPath();
        this.ctx.arc(this.x, playerY - playerHeight + 15, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw eyes
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.fillRect(this.x - 6, playerY - playerHeight + 10, 3, 3);
        this.ctx.fillRect(this.x + 3, playerY - playerHeight + 10, 3, 3);
        
        this.ctx.restore();
    }

    // Get collision bounds
    getBounds() {
        let height = this.height;
        let y = this.y;
        
        if (this.isSliding) {
            height = this.height * 0.5;
            y = this.y + this.height * 0.5;
        }
        
        return {
            x: this.x - this.width/2,
            y: y - height,
            width: this.width,
            height: height
        };
    }

    // Check collision with rectangle
    collidesWith(rect) {
        const playerBounds = this.getBounds();
        
        return playerBounds.x < rect.x + rect.width &&
               playerBounds.x + playerBounds.width > rect.x &&
               playerBounds.y < rect.y + rect.height &&
               playerBounds.y + playerBounds.height > rect.y;
    }

    // Reset player state
    reset() {
        this.lane = 1;
        this.x = this.laneWidth * this.lane + this.laneWidth / 2;
        this.targetX = this.x;
        this.y = this.groundY;
        this.isJumping = false;
        this.isSliding = false;
        this.jumpVelocity = 0;
        this.slideTimer = 0;
        this.hasShield = false;
        this.hasMagnet = false;
        this.hasSpeedBoost = false;
        this.shieldTimer = 0;
        this.magnetTimer = 0;
        this.speedTimer = 0;
        this.runCycle = 0;
    }
}