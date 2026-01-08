class Input {
    constructor() {
        this.keys = {};
        this.touchStart = null;
        this.touchEnd = null;
        this.minSwipeDistance = 50;
        
        this.init();
    }
    
    init() {
        this.setupKeyboardEvents();
        this.setupTouchEvents();
    }
    
    setupKeyboardEvents() {
        // Key down events
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            // Prevent default behavior for arrow keys and space
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
                event.preventDefault();
            }
        });
        
        // Key up events
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }
    
    setupTouchEvents() {
        document.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.touchStart = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        });
        
        document.addEventListener('touchend', (event) => {
            event.preventDefault();
            if (!this.touchStart) return;
            
            this.touchEnd = {
                x: event.changedTouches[0].clientX,
                y: event.changedTouches[0].clientY
            };
            
            this.handleSwipe();
            this.touchStart = null;
            this.touchEnd = null;
        });
        
        // Prevent scrolling on touch devices
        document.addEventListener('touchmove', (event) => {
            event.preventDefault();
        });
    }
    
    handleSwipe() {
        if (!this.touchStart || !this.touchEnd) return;
        
        const deltaX = this.touchEnd.x - this.touchStart.x;
        const deltaY = this.touchEnd.y - this.touchStart.y;
        
        // Determine if it's a horizontal or vertical swipe
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > this.minSwipeDistance) {
                if (deltaX > 0) {
                    // Right swipe
                    this.keys['ArrowRight'] = true;
                    setTimeout(() => this.keys['ArrowRight'] = false, 100);
                } else {
                    // Left swipe
                    this.keys['ArrowLeft'] = true;
                    setTimeout(() => this.keys['ArrowLeft'] = false, 100);
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > this.minSwipeDistance) {
                if (deltaY > 0) {
                    // Down swipe
                    this.keys['ArrowDown'] = true;
                    setTimeout(() => this.keys['ArrowDown'] = false, 100);
                } else {
                    // Up swipe
                    this.keys['ArrowUp'] = true;
                    setTimeout(() => this.keys['ArrowUp'] = false, 100);
                }
            }
        }
    }
    
    // Check if a specific key is pressed
    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }
    
    // Get movement direction based on pressed keys
    getMovementDirection() {
        if (this.isKeyPressed('ArrowUp')) {
            return { x: 0, z: -1 };
        } else if (this.isKeyPressed('ArrowDown')) {
            return { x: 0, z: 1 };
        } else if (this.isKeyPressed('ArrowLeft')) {
            return { x: -1, z: 0 };
        } else if (this.isKeyPressed('ArrowRight')) {
            return { x: 1, z: 0 };
        }
        
        return null;
    }
    
    // Check if space is pressed (for game start/pause)
    isSpacePressed() {
        return this.isKeyPressed('Space');
    }
    
    // Check if any movement key is pressed
    isAnyMovementKeyPressed() {
        return this.isKeyPressed('ArrowUp') || 
               this.isKeyPressed('ArrowDown') || 
               this.isKeyPressed('ArrowLeft') || 
               this.isKeyPressed('ArrowRight');
    }
    
    // Clear all keys (useful for resetting input state)
    clearKeys() {
        this.keys = {};
    }
    
    // Get touch position for UI interactions
    getTouchPosition(event) {
        const rect = event.target.getBoundingClientRect();
        return {
            x: event.touches[0].clientX - rect.left,
            y: event.touches[0].clientY - rect.top
        };
    }
    
    // Check if touch is within a specific area
    isTouchInArea(touchPos, area) {
        return touchPos.x >= area.x && 
               touchPos.x <= area.x + area.width &&
               touchPos.y >= area.y && 
               touchPos.y <= area.y + area.height;
    }
    
    // Add custom key mapping
    addKeyMapping(keyCode, action) {
        if (this.keys[keyCode]) {
            action();
        }
    }
    
    // Remove event listeners (cleanup)
    destroy() {
        document.removeEventListener('keydown', this.setupKeyboardEvents);
        document.removeEventListener('keyup', this.setupKeyboardEvents);
        document.removeEventListener('touchstart', this.setupTouchEvents);
        document.removeEventListener('touchend', this.setupTouchEvents);
        document.removeEventListener('touchmove', this.setupTouchEvents);
    }
}
