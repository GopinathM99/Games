# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser-based games collection built with vanilla JavaScript and Three.js. Currently contains a 3D Snake game with plans for additional games (Pong, Breakout, Tetris, Air Hockey).

## Running the Project

No build step required. Games are static HTML/JS/CSS that run directly in the browser.

```bash
# Option 1: Open directly
open snake/index.html

# Option 2: Local server (better for development)
python -m http.server 8000
# or
npx http-server
```

## Architecture

### Snake Game (`snake/`)

The game uses a component-based architecture with vanilla JS classes that communicate through a central Game orchestrator:

**Core Classes:**
- `Game` (scripts/Game.js) - Main orchestrator. Manages game loop via `requestAnimationFrame`, coordinates all components, handles UI state (`speedSelect`, `menu`, `playing`, `paused`, `gameOver`)
- `World` (scripts/World.js) - Three.js scene setup. Creates renderer, camera (fixed top-down), lighting system, grid, and boundaries. Provides coordinate conversion between grid and world space
- `Snake` (scripts/Snake.js) - Snake entity with segments array. Handles movement, collision detection, trail particle system, and animations. Each segment stores both mesh and grid position
- `Food` (scripts/Food.js) - Food spawning and collection with particle effects
- `Input` (scripts/Input.js) - Keyboard and touch input handling

**Key Patterns:**
- Grid-based movement: Snake operates on a 20x20 grid centered at (0,0). `World.gridToWorld()` and `World.worldToGrid()` convert between coordinate systems
- Smooth animation: Segments store `currentPos`, `targetPos`, and `gridPos`. Movement interpolates between grid positions for fluid motion
- Component communication: Components hold references to World for scene access. Game connects them (e.g., `snake.onDie = () => this.gameOver()`)

**Three.js Usage:**
- Uses CDN-loaded Three.js r128
- Scene has fog, custom lighting with point lights following the snake
- Snake segments are Groups containing multiple meshes (body, belly, glow effects)
- Trail system uses particle BufferGeometry with custom vertex colors

## File Structure

```
snake/
├── index.html          # Entry point, loads Three.js from CDN then game scripts
├── scripts/
│   ├── main.js         # Bootstrap, creates Game instance
│   ├── Game.js         # Game loop, state machine, UI handling
│   ├── World.js        # Three.js scene, camera, lighting, grid
│   ├── Snake.js        # Snake entity, movement, particles
│   ├── Food.js         # Food spawning, collection effects
│   └── Input.js        # Keyboard/touch input
└── styles/
    └── main.css        # Game UI styles
```

## Adding New Games

Follow the existing structure:
1. Create a new folder at the project root (e.g., `pong/`)
2. Include an `index.html` entry point
3. Organize scripts in `scripts/` and styles in `styles/`
4. Update root README.md to list the new game
