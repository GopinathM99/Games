class Food {
    constructor(world) {
        this.world = world;
        this.foodMesh = null;
        this.gridPos = null;
        this.isCollected = false;
        
        this.init();
    }
    
    init() {
        this.spawn();
    }
    
    spawn() {
        // Remove existing food if any
        if (this.foodMesh) {
            this.world.scene.remove(this.foodMesh);
        }
        
        // Generate random position
        this.gridPos = this.getRandomValidPosition();
        const worldPos = this.world.gridToWorld(this.gridPos);
        
        // Create food geometry (sphere for variety)
        const geometry = new THREE.SphereGeometry(0.4, 16, 16);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0xff6b6b,
            emissive: 0x330000,
            shininess: 100
        });
        
        this.foodMesh = new THREE.Mesh(geometry, material);
        this.foodMesh.position.set(worldPos.x, 0.5, worldPos.z);
        this.foodMesh.castShadow = true;
        this.foodMesh.receiveShadow = true;
        
        // Add floating animation
        this.addFloatingAnimation();
        
        // Add rotation animation
        this.addRotationAnimation();
        
        this.world.scene.add(this.foodMesh);
        this.isCollected = false;
    }
    
    getRandomValidPosition() {
        let attempts = 0;
        const maxAttempts = 100;
        
        while (attempts < maxAttempts) {
            const pos = this.world.getRandomGridPosition();
            
            // Check if position is not occupied by snake
            if (!this.isPositionOccupied(pos)) {
                return pos;
            }
            
            attempts++;
        }
        
        // Fallback to a position away from center if all attempts fail
        // Use a position that's likely to be free (corner area)
        const halfSize = Math.floor(this.world.gridSize / 2) - 2;
        return { x: halfSize, z: halfSize };
    }
    
    isPositionOccupied(gridPos) {
        // This will be set by the Game class to check against snake positions
        if (this.checkSnakeCollision) {
            return this.checkSnakeCollision(gridPos);
        }
        return false;
    }
    
    addFloatingAnimation() {
        if (!this.foodMesh) return;
        
        // Create floating effect
        const originalY = this.foodMesh.position.y;
        let time = 0;
        
        const animate = () => {
            if (!this.foodMesh || this.isCollected) return;
            
            time += 0.05;
            this.foodMesh.position.y = originalY + Math.sin(time) * 0.1;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    addRotationAnimation() {
        if (!this.foodMesh) return;
        
        const animate = () => {
            if (!this.foodMesh || this.isCollected) return;
            
            this.foodMesh.rotation.y += 0.02;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    collect() {
        if (this.isCollected) return false;
        
        this.isCollected = true;
        
        // Add collection effect
        this.addCollectionEffect();
        
        // Remove from scene
        if (this.foodMesh) {
            this.world.scene.remove(this.foodMesh);
            this.foodMesh = null;
        }
        
        // Spawn new food after a short delay
        setTimeout(() => {
            this.spawn();
        }, 500);
        
        return true;
    }
    
    addCollectionEffect() {
        // Create particle effect for food collection
        const particleCount = 20;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.05, 8, 8);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0xff6b6b,
                transparent: true,
                opacity: 1
            });
            
            const particle = new THREE.Mesh(geometry, material);
            
            // Random position around food
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 2;
            particle.position.set(
                Math.cos(angle) * radius,
                Math.random() * 2,
                Math.sin(angle) * radius
            );
            
            particles.add(particle);
        }
        
        // Position particles at food location
        if (this.foodMesh) {
            particles.position.copy(this.foodMesh.position);
        }
        
        this.world.scene.add(particles);
        
        // Animate particles
        let time = 0;
        const animate = () => {
            time += 0.05;
            
            particles.children.forEach((particle, index) => {
                particle.position.y += 0.1;
                particle.material.opacity = Math.max(0, 1 - time * 2);
                
                // Add some horizontal movement
                particle.position.x += (Math.random() - 0.5) * 0.1;
                particle.position.z += (Math.random() - 0.5) * 0.1;
            });
            
            if (time < 1) {
                requestAnimationFrame(animate);
            } else {
                this.world.scene.remove(particles);
            }
        };
        
        animate();
    }
    
    update() {
        // Food doesn't need regular updates, but we can add effects here
    }
    
    reset() {
        if (this.foodMesh) {
            this.world.scene.remove(this.foodMesh);
            this.foodMesh = null;
        }
        
        this.isCollected = false;
        this.init();
    }
    
    // Set callback to check snake collision
    setSnakeCollisionChecker(checker) {
        this.checkSnakeCollision = checker;
    }
}
