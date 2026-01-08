class Snake {
    constructor(world) {
        this.world = world;
        this.segments = [];
        this.direction = { x: 0, z: 1 }; // Start moving forward
        this.nextDirection = { x: 0, z: 1 };
        this.speed = 0.15; // Grid cells per second
        this.baseSpeed = 0.15; // Store the base speed for reset
        this.lastMoveTime = 0;
        this.isMoving = false;
        this.trailParticles = [];
        this.trailGeometry = null;
        this.trailMaterial = null;
        
        this.init();
    }
    
    init() {
        // Create initial snake body (3 segments) starting from the center of the board
        const centerPos = this.world.getCenterPosition();
        console.log('Snake init() - centerPos from world:', centerPos);
        console.log('Snake init() - current segments length before adding:', this.segments.length);
        
        this.addSegment(centerPos, true); // Head at center
        console.log('Snake init() - added head at:', centerPos);
        
        this.addSegment({ x: centerPos.x, z: centerPos.z - 1 }, false); // Body segment behind head
        console.log('Snake init() - added body at:', { x: centerPos.x, z: centerPos.z - 1 });
        
        this.addSegment({ x: centerPos.x, z: centerPos.z - 2 }, false); // Tail segment
        console.log('Snake init() - added tail at:', { x: centerPos.x, z: centerPos.z - 2 });
        
        console.log('Snake init() - final segments length:', this.segments.length);
        console.log('Snake init() - head position after init:', this.segments[0]?.gridPos);
        
        // Initialize trail system
        this.initTrailSystem();
    }
    
    initTrailSystem() {
        // Create purple-themed trail systems for cartoon effect
        this.trailGeometry = new THREE.BufferGeometry();
        this.trailMaterial = new THREE.PointsMaterial({
            color: 0xDD88FF, // Purple trail
            size: 0.6,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });
        
        this.trailPoints = new THREE.Points(this.trailGeometry, this.trailMaterial);
        this.world.scene.add(this.trailPoints);
        
        // Secondary glow trail in complementary purple
        this.glowTrailGeometry = new THREE.BufferGeometry();
        this.glowTrailMaterial = new THREE.PointsMaterial({
            color: 0xBB66DD, // Softer purple glow
            size: 1.4,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });
        
        this.glowTrailPoints = new THREE.Points(this.glowTrailGeometry, this.glowTrailMaterial);
        this.world.scene.add(this.glowTrailPoints);
        
        // Pink sparkling effect trail for cartoon magic
        this.sparkleGeometry = new THREE.BufferGeometry();
        this.sparkleMaterial = new THREE.PointsMaterial({
            color: 0xFFAADD, // Pink sparkles
            size: 0.25,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });
        
        this.sparklePoints = new THREE.Points(this.sparkleGeometry, this.sparkleMaterial);
        this.world.scene.add(this.sparklePoints);
        
        this.sparkleParticles = [];
    }
    
    addSegment(gridPos, isHead = false) {
        console.log('Adding segment at position:', gridPos, 'Current segments:', this.segments.length);
        
        const worldPos = this.world.gridToWorld(gridPos);
        
        let segment;
        
        if (isHead) {
            // Create snake head
            segment = this.createSnakeHead(worldPos);
        } else {
            // Create body segment
            segment = this.createBodySegment(worldPos);
        }
        
        segment.castShadow = true;
        segment.receiveShadow = true;
        
        // Store both the mesh and grid position
        this.segments.push({
            mesh: segment,
            gridPos: { ...gridPos },
            currentPos: { ...gridPos },
            targetPos: { ...gridPos },
            isHead: isHead
        });
        
        console.log('Segment added! New total:', this.segments.length);
        this.world.scene.add(segment);
    }
    
    createSnakeHead(worldPos) {
        // Create cartoon-style snake head
        const headGroup = new THREE.Group();
        
        // Main head body - round and cute
        const headGeometry = new THREE.SphereGeometry(0.55, 16, 16);
        
        // Purple gradient material for cartoon look
        const headMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B4CB8, // Main purple color
            shininess: 100,
            specular: 0x444444
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        headGroup.add(head);
        
        // Lighter belly/chin area
        const bellyGeometry = new THREE.SphereGeometry(0.48, 12, 12);
        const bellyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xE6B3FF, // Light purple/pink
            shininess: 80
        });
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.position.y = -0.15;
        belly.scale.set(0.8, 0.7, 0.8);
        headGroup.add(belly);
        
        // Large cartoon eyes
        const eyeGeometry = new THREE.SphereGeometry(0.18, 12, 12);
        const eyeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            shininess: 200
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.22, 0.1, 0.4);
        leftEye.scale.set(1, 1.1, 0.8);
        headGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.22, 0.1, 0.4);
        rightEye.scale.set(1, 1.1, 0.8);
        headGroup.add(rightEye);
        
        // Large round pupils
        const pupilGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const pupilMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x000000
        });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.22, 0.1, 0.48);
        headGroup.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.22, 0.1, 0.48);
        headGroup.add(rightPupil);
        
        // Eye highlights for cartoon look
        const highlightGeometry = new THREE.SphereGeometry(0.03, 6, 6);
        const highlightMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            emissive: 0x999999
        });
        
        const leftHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        leftHighlight.position.set(-0.19, 0.13, 0.52);
        headGroup.add(leftHighlight);
        
        const rightHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        rightHighlight.position.set(0.19, 0.13, 0.52);
        headGroup.add(rightHighlight);
        
        // Cute little tongue (not forked, more cartoon-like)
        const tongueGeometry = new THREE.CylinderGeometry(0.05, 0.03, 0.2, 8);
        const tongueMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff6666,
            shininess: 100
        });
        const tongue = new THREE.Mesh(tongueGeometry, tongueMaterial);
        tongue.rotation.x = Math.PI / 2;
        tongue.position.set(0, -0.05, 0.55);
        headGroup.add(tongue);
        
        // Store tongue for animation
        headGroup.userData.tongue = tongue;
        
        headGroup.position.set(worldPos.x, 0.5, worldPos.z);
        return headGroup;
    }
    
    createBodySegment(worldPos) {
        // Create cartoon-style body segment
        const segmentGroup = new THREE.Group();
        
        // Main body segment - round and smooth
        const bodyGeometry = new THREE.SphereGeometry(0.45, 16, 16);
        
        // Purple gradient for body segments (slightly darker than head)
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x7B3F98, // Darker purple for body
            shininess: 100,
            specular: 0x333333
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        segmentGroup.add(body);
        
        // Lighter belly area
        const bellyGeometry = new THREE.SphereGeometry(0.38, 12, 12);
        const bellyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xD6A3E8, // Light purple for belly
            shininess: 80
        });
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.position.y = -0.12;
        belly.scale.set(0.8, 0.7, 0.8);
        segmentGroup.add(belly);
        
        // Add some cartoon-style shading
        const shadingGeometry = new THREE.SphereGeometry(0.42, 12, 12);
        const shadingMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x6A3085, // Even darker purple for depth
            shininess: 90,
            transparent: true,
            opacity: 0.6
        });
        const shading = new THREE.Mesh(shadingGeometry, shadingMaterial);
        shading.position.set(-0.05, -0.05, -0.05);
        shading.scale.set(0.9, 0.9, 0.9);
        segmentGroup.add(shading);
        
        // Add subtle glow effect with purple tint
        const glowGeometry = new THREE.SphereGeometry(0.55, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x8B4CB8, // Purple glow
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        segmentGroup.add(glow);
        
        // Store for animation
        segmentGroup.userData.glow = glow;
        segmentGroup.userData.body = body;
        segmentGroup.userData.animationOffset = Math.random() * Math.PI * 2;
        
        segmentGroup.position.set(worldPos.x, 0.5, worldPos.z);
        return segmentGroup;
    }
    
    update(currentTime) {
        if (!this.isMoving) return;
        
        // Check if it's time to move
        if (currentTime - this.lastMoveTime >= this.speed * 1000) {
            this.move();
            this.lastMoveTime = currentTime;
        }
        
        // Update trail particles
        this.updateTrail();
        
        // Smooth interpolation for all segments
        this.updateSmoothMovement(currentTime);
        
        // Update animations
        this.updateAnimations(currentTime);
    }
    
    updateSmoothMovement(currentTime) {
        // Smooth interpolation between grid positions
        const interpolationFactor = (currentTime - this.lastMoveTime) / (this.speed * 1000);
        
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (segment.targetPos && segment.currentPos) {
                const worldPos = this.world.gridToWorld({
                    x: segment.currentPos.x + (segment.targetPos.x - segment.currentPos.x) * interpolationFactor,
                    z: segment.currentPos.z + (segment.targetPos.z - segment.currentPos.z) * interpolationFactor
                });
                
                segment.mesh.position.set(worldPos.x, 0.5, worldPos.z);
            }
        }
    }
    
    move() {
        // Update direction
        this.direction = { ...this.nextDirection };
        
        // Calculate new head position
        const head = this.segments[0];
        const newHeadPos = {
            x: head.gridPos.x + this.direction.x,
            z: head.gridPos.z + this.direction.z
        };
        
        // Check boundaries
        if (!this.world.isWithinBounds(newHeadPos)) {
            this.die();
            return;
        }
        
        // Check self collision
        if (this.checkCollision(newHeadPos)) {
            this.die();
            return;
        }
        
        // Store current positions for interpolation
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].currentPos = { ...this.segments[i].gridPos };
        }
        
        // Move body segments
        for (let i = this.segments.length - 1; i > 0; i--) {
            this.segments[i].gridPos = { ...this.segments[i - 1].gridPos };
            this.segments[i].targetPos = { ...this.segments[i].gridPos };
        }
        
        // Move head
        head.gridPos = newHeadPos;
        head.targetPos = { ...newHeadPos };
        
        // Rotate head to face direction
        this.rotateHead();
        
        // Add smooth movement animation
        this.animateMovement();
        
        // Add trail particles
        const worldPos = this.world.gridToWorld(head.gridPos);
        this.addTrailParticle(worldPos);
    }
    
    rotateHead() {
        const head = this.segments[0];
        if (this.direction.x === 1) {
            head.mesh.rotation.y = -Math.PI / 2;
        } else if (this.direction.x === -1) {
            head.mesh.rotation.y = Math.PI / 2;
        } else if (this.direction.z === 1) {
            head.mesh.rotation.y = 0;
        } else if (this.direction.z === -1) {
            head.mesh.rotation.y = Math.PI;
        }
    }
    
    animateMovement() {
        // Add subtle bounce effect to head
        const head = this.segments[0];
        const originalY = head.mesh.position.y;
        
        // Create a simple bounce animation
        head.mesh.position.y = originalY + 0.1;
        
        setTimeout(() => {
            if (head.mesh) {
                head.mesh.position.y = originalY;
            }
        }, 100);
    }
    
    addTrailParticle(worldPos) {
        // Add main trail particle
        const particle = {
            position: { 
                x: worldPos.x + (Math.random() - 0.5) * 0.15, 
                y: 0.5 + Math.random() * 0.3, 
                z: worldPos.z + (Math.random() - 0.5) * 0.15 
            },
            life: 1.0,
            maxLife: 1.0,
            velocity: {
                x: (Math.random() - 0.5) * 0.03,
                y: Math.random() * 0.02,
                z: (Math.random() - 0.5) * 0.03
            },
            size: 0.4 + Math.random() * 0.4
        };
        
        this.trailParticles.push(particle);
        
        // Add sparkle particles occasionally
        if (Math.random() < 0.3) {
            for (let i = 0; i < 3; i++) {
                const sparkle = {
                    position: { 
                        x: worldPos.x + (Math.random() - 0.5) * 0.4, 
                        y: 0.5 + Math.random() * 0.5, 
                        z: worldPos.z + (Math.random() - 0.5) * 0.4 
                    },
                    life: 0.5 + Math.random() * 0.5,
                    maxLife: 0.5 + Math.random() * 0.5,
                    velocity: {
                        x: (Math.random() - 0.5) * 0.05,
                        y: Math.random() * 0.03,
                        z: (Math.random() - 0.5) * 0.05
                    },
                    twinkle: Math.random() * Math.PI * 2
                };
                this.sparkleParticles.push(sparkle);
            }
        }
        
        // Limit trail length
        if (this.trailParticles.length > 80) {
            this.trailParticles.shift();
        }
        
        // Limit sparkle particles
        if (this.sparkleParticles.length > 60) {
            this.sparkleParticles.shift();
        }
        
        this.updateTrailGeometry();
    }
    
    updateTrailGeometry() {
        // Update main trail
        if (this.trailParticles.length > 0) {
            const positions = new Float32Array(this.trailParticles.length * 3);
            const colors = new Float32Array(this.trailParticles.length * 3);
            
            for (let i = 0; i < this.trailParticles.length; i++) {
                const particle = this.trailParticles[i];
                const index = i * 3;
                
                positions[index] = particle.position.x;
                positions[index + 1] = particle.position.y;
                positions[index + 2] = particle.position.z;
                
                // Purple-themed dynamic colors
                const alpha = particle.life / particle.maxLife;
                const pulseIntensity = 0.6 + 0.4 * Math.sin(performance.now() * 0.008 + i * 0.15);
                
                colors[index] = 0.9 * alpha * pulseIntensity;     // R (purple)
                colors[index + 1] = 0.5 * alpha * pulseIntensity; // G 
                colors[index + 2] = 1.0 * alpha * pulseIntensity; // B (purple)
            }
            
            this.trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.trailGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            // Update glow trail (larger, more diffuse)
            const glowPositions = new Float32Array(this.trailParticles.length * 3);
            const glowColors = new Float32Array(this.trailParticles.length * 3);
            
            for (let i = 0; i < this.trailParticles.length; i++) {
                const particle = this.trailParticles[i];
                const index = i * 3;
                
                glowPositions[index] = particle.position.x;
                glowPositions[index + 1] = particle.position.y;
                glowPositions[index + 2] = particle.position.z;
                
                const alpha = (particle.life / particle.maxLife) * 0.5;
                const glowPulse = 0.4 + 0.3 * Math.sin(performance.now() * 0.006 + i * 0.25);
                
                glowColors[index] = 0.7 * alpha * glowPulse;     // R (purple glow)
                glowColors[index + 1] = 0.4 * alpha * glowPulse; // G
                glowColors[index + 2] = 0.9 * alpha * glowPulse; // B (purple glow)
            }
            
            this.glowTrailGeometry.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));
            this.glowTrailGeometry.setAttribute('color', new THREE.BufferAttribute(glowColors, 3));
        }
        
        // Update sparkle particles
        if (this.sparkleParticles.length > 0) {
            const sparklePositions = new Float32Array(this.sparkleParticles.length * 3);
            
            for (let i = 0; i < this.sparkleParticles.length; i++) {
                const sparkle = this.sparkleParticles[i];
                const index = i * 3;
                
                sparklePositions[index] = sparkle.position.x;
                sparklePositions[index + 1] = sparkle.position.y;
                sparklePositions[index + 2] = sparkle.position.z;
            }
            
            this.sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
        }
    }
    
    updateTrail() {
        // Update trail particle life and position
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const particle = this.trailParticles[i];
            
            // Update position based on velocity with slight gravity
            particle.position.x += particle.velocity.x;
            particle.position.y += particle.velocity.y;
            particle.position.z += particle.velocity.z;
            
            // Add slight upward drift and slow down
            particle.velocity.y += 0.001;
            particle.velocity.x *= 0.995;
            particle.velocity.z *= 0.995;
            
            // Fade out over time
            particle.life -= 0.015;
            
            if (particle.life <= 0) {
                this.trailParticles.splice(i, 1);
            }
        }
        
        // Update sparkle particles
        for (let i = this.sparkleParticles.length - 1; i >= 0; i--) {
            const sparkle = this.sparkleParticles[i];
            
            // Update position
            sparkle.position.x += sparkle.velocity.x;
            sparkle.position.y += sparkle.velocity.y;
            sparkle.position.z += sparkle.velocity.z;
            
            // Sparkle motion
            sparkle.twinkle += 0.2;
            sparkle.velocity.y += 0.001; // slight upward drift
            sparkle.velocity.x *= 0.98;
            sparkle.velocity.z *= 0.98;
            
            // Fade out faster
            sparkle.life -= 0.03;
            
            if (sparkle.life <= 0) {
                this.sparkleParticles.splice(i, 1);
            }
        }
        
        this.updateTrailGeometry();
    }
    
    updateAnimations(currentTime) {
        // Animate tongue flicking (simpler cartoon style)
        if (this.segments.length > 0 && this.segments[0].mesh.userData.tongue) {
            const tongue = this.segments[0].mesh.userData.tongue;
            const flickSpeed = currentTime * 0.008;
            
            // Simple tongue animation - just in and out
            if (Math.sin(flickSpeed) > 0.8) {
                tongue.position.z = 0.55 + 0.15 * Math.sin(flickSpeed * 12);
                tongue.scale.set(1, 1, 1 + 0.2 * Math.sin(flickSpeed * 12));
            } else {
                tongue.position.z = 0.55;
                tongue.scale.set(1, 1, 1);
            }
        }
        
        // Gentle bouncing animation for cartoon feel
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (segment.mesh.userData.body && segment.mesh.userData.glow) {
                const bouncePhase = currentTime * 0.004 + segment.mesh.userData.animationOffset;
                const bounceScale = 1 + 0.03 * Math.sin(bouncePhase);
                
                // Gentle bouncing animation
                segment.mesh.userData.body.scale.set(bounceScale, bounceScale, bounceScale);
                
                // Purple glow pulsing
                const glowIntensity = 0.08 + 0.05 * Math.sin(bouncePhase * 1.5);
                segment.mesh.userData.glow.material.opacity = glowIntensity;
                
                // Subtle wave motion along the body for cartoon appeal
                const wavePhase = currentTime * 0.003 + i * 0.4;
                const wave = 0.01 * Math.sin(wavePhase);
                segment.mesh.position.y = 0.5 + wave;
            }
        }
    }
    
    grow() {
        console.log('Growing snake... Current length:', this.segments.length);
        
        // Add new segment at the tail
        const tail = this.segments[this.segments.length - 1];
        const newSegmentPos = {
            x: tail.gridPos.x - this.direction.x,
            z: tail.gridPos.z - this.direction.z
        };
        
        this.addSegment(newSegmentPos, false);
        console.log('Snake length after adding segment:', this.segments.length);
        
        // Increase speed slightly (but not too much to maintain playability)
        this.speed = Math.max(this.baseSpeed * 0.7, this.speed - 0.003);
    }
    
    checkCollision(gridPos) {
        return this.segments.some(segment => 
            segment.gridPos.x === gridPos.x && segment.gridPos.z === gridPos.z
        );
    }
    
    setSpeed(newSpeed) {
        this.speed = newSpeed;
        this.baseSpeed = newSpeed;
        console.log('Snake speed set to:', newSpeed);
    }
    
    changeDirection(newDirection) {
        // Prevent 180-degree turns
        if (this.direction.x === -newDirection.x && this.direction.z === -newDirection.z) {
            return;
        }
        
        this.nextDirection = { ...newDirection };
    }
    
    getHeadPosition() {
        return this.segments[0].gridPos;
    }
    
    getBodyPositions() {
        return this.segments.map(segment => segment.gridPos);
    }
    
    die() {
        this.isMoving = false;
        // Trigger game over event
        if (this.onDie) {
            this.onDie();
        }
    }
    
    reset() {
        console.log('Snake reset() called - starting cleanup');
        
        // Stop movement first
        this.isMoving = false;
        
        // Remove all segments from scene and properly dispose of their materials/geometries
        this.segments.forEach((segment, index) => {
            console.log(`Removing segment ${index} at position:`, segment.gridPos);
            if (segment.mesh) {
                this.world.scene.remove(segment.mesh);
                
                // Properly dispose of geometries and materials to prevent memory leaks
                if (segment.mesh.geometry) {
                    segment.mesh.geometry.dispose();
                }
                if (segment.mesh.material) {
                    if (Array.isArray(segment.mesh.material)) {
                        segment.mesh.material.forEach(material => material.dispose());
                    } else {
                        segment.mesh.material.dispose();
                    }
                }
                
                // If it's a group (like the head), dispose of children too
                if (segment.mesh.children) {
                    segment.mesh.children.forEach(child => {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(material => material.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                    });
                }
            }
        });
        
        // Clear segments array completely - use splice to ensure complete clearing
        this.segments.splice(0, this.segments.length);
        console.log('Segments cleared, length is now:', this.segments.length);
        
        // Clear and reset trail particles
        this.trailParticles = [];
        this.sparkleParticles = [];
        
        // Clear trail geometries and reset them
        if (this.trailGeometry) {
            this.trailGeometry.dispose();
            this.trailGeometry = null;
        }
        if (this.glowTrailGeometry) {
            this.glowTrailGeometry.dispose();
            this.glowTrailGeometry = null;
        }
        if (this.sparkleGeometry) {
            this.sparkleGeometry.dispose();
            this.sparkleGeometry = null;
        }
        
        // Remove trail systems from scene
        if (this.trailPoints) {
            this.world.scene.remove(this.trailPoints);
            if (this.trailMaterial) this.trailMaterial.dispose();
            this.trailPoints = null;
            this.trailMaterial = null;
        }
        if (this.glowTrailPoints) {
            this.world.scene.remove(this.glowTrailPoints);
            if (this.glowTrailMaterial) this.glowTrailMaterial.dispose();
            this.glowTrailPoints = null;
            this.glowTrailMaterial = null;
        }
        if (this.sparklePoints) {
            this.world.scene.remove(this.sparklePoints);
            if (this.sparkleMaterial) this.sparkleMaterial.dispose();
            this.sparklePoints = null;
            this.sparkleMaterial = null;
        }
        
        // Reset all properties to initial state
        this.direction = { x: 0, z: 1 }; // Always start moving forward (positive z direction)
        this.nextDirection = { x: 0, z: 1 };
        this.speed = this.baseSpeed; // Reset to base speed
        this.lastMoveTime = 0;
        this.isMoving = false;
        
        console.log('Snake reset() - about to reinitialize with center position');
        const centerPos = this.world.getCenterPosition();
        console.log('Center position from world:', centerPos);
        
        // Reinitialize everything from scratch (this will place snake at center)
        this.init();
        
        console.log('Snake reset() completed. New head position:', this.segments[0]?.gridPos);
    }
    
    start() {
        this.isMoving = true;
        this.lastMoveTime = performance.now();
    }
    
    stop() {
        this.isMoving = false;
    }
}
