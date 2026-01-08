class World {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.gridSize = 20;
        this.cellSize = 1;
        this.gridHelper = null;
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLighting();
        this.createGrid();
        this.createBoundaries();
        this.handleResize();
        
        // Add event listener for window resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        
        // Create atmospheric gradient background
        const loader = new THREE.TextureLoader();
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Create cartoon-friendly gradient background
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, '#2D1B3D');
        gradient.addColorStop(0.5, '#1A0F2E');
        gradient.addColorStop(1, '#0E0519');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        const backgroundTexture = new THREE.CanvasTexture(canvas);
        this.scene.background = backgroundTexture;
        
        // Softer fog for cartoon atmosphere
        this.scene.fog = new THREE.Fog(0x1A0F2E, 35, 70);
    }
    
    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        
        // Position camera directly above for top-down view
        this.camera.position.set(0, 25, 0);
        this.camera.lookAt(0, 0, 0);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    createLighting() {
        // Enhanced ambient light with mystical blue tint
        const ambientLight = new THREE.AmbientLight(0x223344, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light from above
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 30, 0);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -25;
        directionalLight.shadow.camera.right = 25;
        directionalLight.shadow.camera.top = 25;
        directionalLight.shadow.camera.bottom = -25;
        directionalLight.shadow.bias = -0.0001;
        this.scene.add(directionalLight);
        
        // Dynamic point light that follows the snake with purple theme
        this.snakeLight = new THREE.PointLight(0xDD88FF, 1.0, 12);
        this.snakeLight.position.set(0, 8, 0);
        this.snakeLight.castShadow = true;
        this.snakeLight.shadow.mapSize.width = 1024;
        this.snakeLight.shadow.mapSize.height = 1024;
        this.scene.add(this.snakeLight);
        
        // Atmospheric lights with cartoon purple theme
        const atmosphericLight1 = new THREE.PointLight(0xBB77DD, 0.5, 20);
        atmosphericLight1.position.set(-15, 5, -15);
        this.scene.add(atmosphericLight1);
        
        const atmosphericLight2 = new THREE.PointLight(0xFF99CC, 0.4, 20);
        atmosphericLight2.position.set(15, 5, 15);
        this.scene.add(atmosphericLight2);
        
        // Rim lighting with purple theme
        const rimLight1 = new THREE.DirectionalLight(0xCC88FF, 0.25);
        rimLight1.position.set(-20, 10, -20);
        this.scene.add(rimLight1);
        
        const rimLight2 = new THREE.DirectionalLight(0xFFAADD, 0.2);
        rimLight2.position.set(20, 10, 20);
        this.scene.add(rimLight2);
        
        // Store lights for animation
        this.lights = {
            atmospheric1: atmosphericLight1,
            atmospheric2: atmosphericLight2,
            snake: this.snakeLight
        };
    }
    
    createGrid() {
        // Create enhanced ground plane with texture
        const groundGeometry = new THREE.PlaneGeometry(this.gridSize + 2, this.gridSize + 2);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x112233,
            shininess: 30,
            transparent: true,
            opacity: 0.8
        });
        
        // Add hexagonal pattern to ground
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Create hexagonal grid pattern
        ctx.fillStyle = '#0a1520';
        ctx.fillRect(0, 0, 512, 512);
        
        ctx.strokeStyle = '#BB77DD';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.4;
        
        const hexSize = 20;
        for (let y = 0; y < 512; y += hexSize * 1.5) {
            for (let x = 0; x < 512; x += hexSize * Math.sqrt(3)) {
                const offsetX = (y / (hexSize * 1.5)) % 2 * (hexSize * Math.sqrt(3) / 2);
                this.drawHexagon(ctx, x + offsetX, y, hexSize);
            }
        }
        
        const groundTexture = new THREE.CanvasTexture(canvas);
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(2, 2);
        
        groundMaterial.map = groundTexture;
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Purple-themed grid helper
        this.gridHelper = new THREE.GridHelper(this.gridSize, this.gridSize, 0xBB77DD, 0x553377);
        this.gridHelper.position.y = -0.49;
        this.gridHelper.material.opacity = 0.15;
        this.gridHelper.material.transparent = true;
        this.scene.add(this.gridHelper);
    }
    
    drawHexagon(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const hexX = x + size * Math.cos(angle);
            const hexY = y + size * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(hexX, hexY);
            } else {
                ctx.lineTo(hexX, hexY);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    createBoundaries() {
        const boundaryMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2c3e50, 
            transparent: true, 
            opacity: 0.3 
        });
        
        // Create boundary walls
        const wallGeometry = new THREE.BoxGeometry(this.gridSize, 1, 0.1);
        
        // Top wall
        const topWall = new THREE.Mesh(wallGeometry, boundaryMaterial);
        topWall.position.set(0, 0.5, -this.gridSize / 2);
        this.scene.add(topWall);
        
        // Bottom wall
        const bottomWall = new THREE.Mesh(wallGeometry, boundaryMaterial);
        bottomWall.position.set(0, 0.5, this.gridSize / 2);
        this.scene.add(bottomWall);
        
        // Left wall
        const leftWall = new THREE.Mesh(wallGeometry, boundaryMaterial);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-this.gridSize / 2, 0.5, 0);
        this.scene.add(leftWall);
        
        // Right wall
        const rightWall = new THREE.Mesh(wallGeometry, boundaryMaterial);
        rightWall.rotation.y = Math.PI / 2;
        rightWall.position.set(this.gridSize / 2, 0.5, 0);
        this.scene.add(rightWall);
    }
    
    handleResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    render() {
        this.updateLighting();
        this.renderer.render(this.scene, this.camera);
    }
    
    updateLighting() {
        const time = performance.now() * 0.001;
        
        // Animate atmospheric lights
        if (this.lights) {
            // Pulsing effect on atmospheric lights
            this.lights.atmospheric1.intensity = 0.6 + 0.2 * Math.sin(time * 2);
            this.lights.atmospheric2.intensity = 0.5 + 0.2 * Math.sin(time * 1.5 + Math.PI);
            
            // Gentle movement of atmospheric lights
            this.lights.atmospheric1.position.x = -15 + 3 * Math.sin(time * 0.5);
            this.lights.atmospheric1.position.z = -15 + 3 * Math.cos(time * 0.3);
            
            this.lights.atmospheric2.position.x = 15 + 3 * Math.sin(time * 0.7 + Math.PI);
            this.lights.atmospheric2.position.z = 15 + 3 * Math.cos(time * 0.4 + Math.PI);
        }
    }
    
    updateSnakeLight(snakeHeadPosition) {
        if (this.lights && this.lights.snake && snakeHeadPosition) {
            // Follow the snake head with dynamic lighting
            this.lights.snake.position.x = snakeHeadPosition.x;
            this.lights.snake.position.z = snakeHeadPosition.z;
            
            // Gentle pulsing intensity for cartoon feel
            const time = performance.now() * 0.004;
            this.lights.snake.intensity = 1.0 + 0.2 * Math.sin(time * 2.5);
        }
    }
    
    // Convert world coordinates to grid coordinates
    worldToGrid(worldPos) {
        return {
            x: Math.round(worldPos.x / this.cellSize),
            z: Math.round(worldPos.z / this.cellSize)
        };
    }
    
    // Convert grid coordinates to world coordinates
    gridToWorld(gridPos) {
        return {
            x: gridPos.x * this.cellSize,
            z: gridPos.z * this.cellSize
        };
    }
    
    // Check if position is within game boundaries
    isWithinBounds(gridPos) {
        const halfSize = this.gridSize / 2;
        return gridPos.x >= -halfSize && gridPos.x <= halfSize && 
               gridPos.z >= -halfSize && gridPos.z <= halfSize;
    }
    
    // Get random grid position within bounds
    getRandomGridPosition() {
        const halfSize = this.gridSize / 2 - 1;
        return {
            x: Math.floor(Math.random() * this.gridSize) - halfSize,
            z: Math.floor(Math.random() * this.gridSize) - halfSize
        };
    }
    
    // Get the center position of the grid
    // The grid coordinate system has (0,0) at the center
    // Grid extends from -gridSize/2 to +gridSize/2 in both x and z directions
    getCenterPosition() {
        return { x: 0, z: 0 };
    }
}
