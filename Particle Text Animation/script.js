const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particleArray = [];

// Configuration State
const config = {
    text: "Particles",
    radius: 100,
    returnSpeed: 0.1,
    particleSize: 3,
    color: '#ffffff',
    isRainbow: false,
    density: 4,
    connectParticles: false
};

// DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const textInput = document.getElementById('textInput');
    const radiusInput = document.getElementById('radiusInput');
    const speedInput = document.getElementById('speedInput');
    const sizeInput = document.getElementById('sizeInput');
    const rainbowInput = document.getElementById('rainbowInput');
    const colorInput = document.getElementById('colorInput');
    const densityInput = document.getElementById('densityInput');
    const connectInput = document.getElementById('connectInput');
    const togglePanel = document.getElementById('togglePanel');
    const settingsPanel = document.querySelector('.settings-panel');

    console.log("Controls loaded:", { textInput, radiusInput });

    // Event Listeners for Controls
    if (textInput) textInput.addEventListener('input', (e) => {
        config.text = e.target.value || " ";
        init();
    });

    if (radiusInput) radiusInput.addEventListener('input', (e) => {
        config.radius = parseInt(e.target.value);
        console.log("Radius:", config.radius);
    });

    if (speedInput) speedInput.addEventListener('input', (e) => config.returnSpeed = parseFloat(e.target.value));
    if (sizeInput) sizeInput.addEventListener('input', (e) => config.particleSize = parseFloat(e.target.value));
    if (rainbowInput) rainbowInput.addEventListener('change', (e) => config.isRainbow = e.target.checked);

    if (colorInput) colorInput.addEventListener('input', (e) => {
        config.color = e.target.value;
        config.isRainbow = false;
        if (rainbowInput) rainbowInput.checked = false;
    });

    if (densityInput) densityInput.addEventListener('input', (e) => {
        config.density = parseInt(e.target.value);
        init();
    });

    if (connectInput) connectInput.addEventListener('change', (e) => config.connectParticles = e.target.checked);

    const resetBtn = document.getElementById('resetBtn');

    // Panel Toggle
    if (togglePanel) togglePanel.addEventListener('click', () => {
        settingsPanel.classList.toggle('closed');
    });

    // Reset Function
    if (resetBtn) resetBtn.addEventListener('click', () => {
        // Reset Config
        config.radius = 100;
        config.returnSpeed = 0.1;
        config.particleSize = 3;
        config.color = '#ffffff';
        config.isRainbow = false;
        config.density = 4;
        config.connectParticles = false;

        // Update UI
        radiusInput.value = 100;
        speedInput.value = 0.1;
        sizeInput.value = 3;
        colorInput.value = '#ffffff';
        rainbowInput.checked = false;
        densityInput.value = 4;
        connectInput.checked = false;

        // Re-init
        init();
    });

    // Start
    init();
    animate();
});


// Mouse Tracking
const mouse = {
    x: null,
    y: null,
    radius: 150
}

window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        // Seed random hue for rainbow mode
        this.hue = Math.random() * 360;
    }

    draw() {
        if (config.isRainbow) {
            // cycle hue over time or position
            // ctx.fillStyle = 'hsl(' + (this.hue + adjustX) + ', 100%, 50%)'; 
            // Simpler:
            ctx.fillStyle = 'hsl(' + this.hue + ', 100%, 60%)';
        } else {
            ctx.fillStyle = config.color;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, config.particleSize, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;

        // Use Config Radius
        let maxDistance = config.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < maxDistance) {
            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                // Use Config Return Speed
                this.x -= dx * config.returnSpeed;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy * config.returnSpeed;
            }
        }
    }
}

function init() {
    particleArray = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let fontSize = Math.min(window.innerWidth / 6, 150);
    ctx.font = 'bold ' + fontSize + 'px Orbitron';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(config.text, canvas.width / 2, canvas.height / 2);

    const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Clear the text we just drew to sample
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Use Config Density (Step)
    // IMPORTANT: config.density input is 1 (high) to 20 (low). 
    // Slider min=1, max=10? 
    // Let's interpret densityInput: 1=Highest Quality (Step 1), 10=Lowest (Step 10).
    // Or invert label: "Density" usually means Higher Number = More Particles.
    // UI: "Density (Lower is higher)" -> Input value is step size.
    const step = config.density;

    for (let y = 0, y2 = textCoordinates.height; y < y2; y += step) {
        for (let x = 0, x2 = textCoordinates.width; x < x2; x += step) {
            if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                particleArray.push(new Particle(x, y));
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].draw();
        particleArray[i].update();
    }

    if (config.connectParticles) {
        connect();
    }

    requestAnimationFrame(animate);
}

function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particleArray.length; a++) {
        for (let b = a; b < particleArray.length; b++) {
            let dx = particleArray[a].x - particleArray[b].x;
            let dy = particleArray[a].y - particleArray[b].y;

            if (Math.abs(dx) > 25 || Math.abs(dy) > 25) continue;

            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 25) {
                opacityValue = 1 - (distance / 25);
                ctx.strokeStyle = config.isRainbow ?
                    'rgba(255,255,255,' + opacityValue + ')' :
                    hexToRgbA(config.color, opacityValue);
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particleArray[a].x, particleArray[a].y);
                ctx.lineTo(particleArray[b].x, particleArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// Helper for color conversion
function hexToRgbA(hex, alpha) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
    }
    return `rgba(255,255,255,${alpha})`;
}

// Resize
window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

// Wait for fonts (Double check) - but don't re-init if already running?
// Actually, re-init is safe.
document.fonts.ready.then(function () {
    init();
});
