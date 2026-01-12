# Fruit Ninja - Hand Tracking

A browser-based Fruit Ninja clone that uses your webcam for hand-tracking to slice falling fruits.

## Features

- **Hand Tracking**: Uses MediaPipe Hands to detect your index finger position
- **Slicing Mechanics**: Move your finger fast across fruits to slice them
- **8 Fruit Types**: Apples, oranges, watermelons, bananas, grapes, strawberries, peaches, and cherries
- **Combo System**: Slice fruits quickly for multiplier bonuses
- **3 Lives**: Miss a fruit and lose a life
- **Visual Effects**:
  - Glowing slice trail following your hand
  - Juice particle explosions when slicing
  - Fruits split into halves that tumble away
  - Dynamic difficulty (fruits spawn faster as score increases)

## How to Play

### Option 1: Open directly
```bash
open index.html
```

### Option 2: Local server (recommended)
```bash
python -m http.server 8000
# Then open http://localhost:8000/fruit-ninja/
```

Or using Node.js:
```bash
npx http-server
```

## Controls

1. Allow camera access when prompted
2. Click "Start Game" when the hand tracking loads
3. Move your index finger in front of the camera to slice falling fruits
4. The webcam preview appears in the top-right corner so you can see your hand position

## Requirements

- Modern browser with webcam support (Chrome, Firefox, Edge)
- Webcam access permission
- Internet connection (for loading MediaPipe libraries from CDN)

## Technologies Used

- Vanilla JavaScript
- HTML5 Canvas
- MediaPipe Hands for hand tracking
