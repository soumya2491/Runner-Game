// Particle Effects System
export class EffectsManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
    }

    // Create coin collection effect
    createCoinEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                life: 1.0,
                decay: 0.02,
                size: Math.random() * 4 + 2,
                color: '#FFD700',
                type: 'coin'
            });
        }
    }

    // Create collision effect
    createCollisionEffect(x, y) {
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12 - 3,
                life: 1.0,
                decay: 0.03,
                size: Math.random() * 6 + 3,
                color: '#FF6B6B',
                type: 'collision'
            });
        }
    }

    // Create power-up effect
    createPowerUpEffect(x, y, color = '#4ECDC4') {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10 - 2,
                life: 1.0,
                decay: 0.015,
                size: Math.random() * 5 + 3,
                color: color,
                type: 'powerup'
            });
        }
    }

    // Create speed trail effect
    createSpeedTrail(x, y) {
        this.particles.push({
            x: x + Math.random() * 20 - 10,
            y: y + Math.random() * 20 - 10,
            vx: -8 - Math.random() * 4,
            vy: (Math.random() - 0.5) * 2,
            life: 0.8,
            decay: 0.04,
            size: Math.random() * 3 + 1,
            color: '#FFFFFF',
            type: 'trail'
        });
    }

    // Update all particles
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply gravity for some particle types
            if (particle.type === 'coin' || particle.type === 'collision') {
                particle.vy += 0.3;
            }
            
            // Reduce life
            particle.life -= particle.decay;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    // Render all particles
    render() {
        this.ctx.save();
        
        for (const particle of this.particles) {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            
            // Different rendering for different particle types
            if (particle.type === 'trail') {
                // Render as elongated shape for speed trails
                this.ctx.fillRect(particle.x, particle.y, particle.size * 3, particle.size);
            } else {
                // Render as circle for other particles
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        this.ctx.restore();
    }

    // Screen shake effect
    createScreenShake(intensity = 5, duration = 300) {
        const startTime = Date.now();
        const originalTransform = this.canvas.style.transform;
        
        const shake = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                const currentIntensity = intensity * (1 - progress);
                const x = (Math.random() - 0.5) * currentIntensity;
                const y = (Math.random() - 0.5) * currentIntensity;
                
                this.canvas.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(shake);
            } else {
                this.canvas.style.transform = originalTransform;
            }
        };
        
        shake();
    }

    // Clear all particles
    clear() {
        this.particles = [];
    }
}

// UI Effects
export class UIEffects {
    static showScorePopup(score, x, y) {
        const popup = document.createElement('div');
        popup.textContent = `+${score}`;
        popup.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: #FFD700;
            font-size: 20px;
            font-weight: bold;
            pointer-events: none;
            z-index: 1000;
            animation: scorePopup 1s ease-out forwards;
        `;
        
        // Add animation keyframes if not already added
        if (!document.querySelector('#scorePopupStyle')) {
            const style = document.createElement('style');
            style.id = 'scorePopupStyle';
            style.textContent = `
                @keyframes scorePopup {
                    0% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(-50px) scale(1.2); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1000);
    }

    static flashPowerUpIndicator(indicatorId, duration) {
        const indicator = document.getElementById(indicatorId);
        if (indicator) {
            indicator.classList.remove('hidden');
            const timer = indicator.querySelector('.powerup-timer');
            if (timer) {
                timer.style.animation = `powerupTimer ${duration}ms linear`;
            }
            
            setTimeout(() => {
                indicator.classList.add('hidden');
            }, duration);
        }
    }

    static updateUI(score, coins, distance) {
        document.getElementById('score').textContent = score;
        document.getElementById('coins').textContent = coins;
        document.getElementById('distance').textContent = `${Math.floor(distance)}m`;
    }
}