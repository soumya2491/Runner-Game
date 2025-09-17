# Subway Surfer-Style 2D Endless Runner Game - MVP

## Core Files to Create:
1. **index.html** - Main HTML structure with canvas and UI elements
2. **style.css** - Game styling, UI layout, and responsive design
3. **script.js** - Main game engine and initialization
4. **player.js** - Player character mechanics (movement, jump, slide, animation)
5. **obstacles.js** - Obstacle generation and collision system
6. **collectibles.js** - Coins and power-ups management
7. **gameManager.js** - Score system, game states, and main game loop
8. **effects.js** - Particle effects and visual feedback

## Game Features (MVP):
- **3-lane system**: Player can move left/right between lanes
- **Player mechanics**: Jump, slide, lane switching with smooth animations
- **Endless generation**: Procedural obstacles and track sections
- **Collectibles**: Coins for scoring
- **Power-ups**: Magnet, shield, speed boost (simplified versions)
- **Scoring**: Distance + coins collected
- **Controls**: Keyboard (WASD/Arrow keys) + touch/swipe for mobile
- **Visual effects**: Particle effects for coins and collisions
- **Responsive**: Works on desktop and mobile

## Technical Implementation:
- HTML5 Canvas for game rendering
- JavaScript ES6+ with modular structure
- CSS for UI and responsive layout
- Touch events for mobile support
- RequestAnimationFrame for smooth 60fps gameplay
- Simple sprite-based animations using CSS transforms

## Simplified Approach:
- Use colored rectangles/shapes instead of complex sprites initially
- Focus on core gameplay mechanics over visual polish
- Implement basic particle effects with simple shapes
- Use CSS animations for UI elements