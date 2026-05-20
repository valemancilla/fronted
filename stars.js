/**
 * stars.js - Premium Cinematic Starfield Engine
 * Creates a highly realistic, interactive, and beautifully animated canvas starry sky background.
 * Optimized for performance (runs smoothly on requestAnimationFrame) and supports high-DPI screens.
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;

    // Detect if we are on the dashboard (only dashboard has .dashboard-container)
    const isDashboard = document.querySelector('.dashboard-container') !== null;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let devicePixelRatio = window.devicePixelRatio || 1;

    // Configuration
    const STAR_COUNT = Math.floor((width * height) / 6000); // Dynamic density based on screen size
    const MAX_PARALLAX_PX = 35; // Maximum shift in pixels for foreground stars
    const AUTO_DRIFT_SPEED = 0.000015; // Slow ambient drift speed

    const stars = [];

    // Interactive mouse state with inertia
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const ease = 0.06; // Interpolation factor (0.01 - 0.1 for high inertia/smooth feeling)

    // Palette harmonized with futuristic cyan, purple, and blue theme
    const colors = [
        'rgba(255, 255, 255, ',   // Elegant Ice White (75% probability)
        'rgba(0, 242, 254, ',     // Cyber Cyan (15% probability)
        'rgba(157, 80, 229, ',    // Neon Purple (10% probability)
    ];

    function getRandomColorTemplate() {
        const rand = Math.random();
        if (rand < 0.75) return colors[0];
        if (rand < 0.90) return colors[1];
        return colors[2];
    }

    class Star {
        constructor() {
            this.reset(true);
        }

        reset(isInitial = false) {
            // Relative positions (0 to 1) so resizing is clean
            this.x = Math.random();
            this.y = Math.random();
            
            // Depth layers: 0.1 (far background) to 1.2 (very close foreground)
            this.z = Math.random() * 1.1 + 0.1; 
            
            // Base size based on depth layer (larger = closer)
            // Range: 0.5px to ~2.8px
            this.baseSize = (this.z * 1.6) + 0.4;
            
            // Random base opacity influenced by depth
            this.baseOpacity = (this.z * 0.4) + 0.2; // Farther stars are dimmer
            this.opacity = this.baseOpacity;
            
            // Twinkling properties
            this.twinkleSpeed = Math.random() * 0.02 + 0.005;
            this.twinklePhase = Math.random() * Math.PI * 2;
            
            this.colorTemplate = getRandomColorTemplate();
            
            // Flare effect only for bright foreground stars (approx. 6% of stars)
            this.hasFlare = this.z > 0.85 && Math.random() < 0.25;
        }

        update(time, deltaTime) {
            // Unified cinematic slow flight/drift vector
            // The speed is scaled by Z to create stunning continuous 3D travel
            // We use a very slow angular sway over time (period of several minutes)
            // Major float direction is diagonally up and left (matching typical space backdrops)
            const baseDriftSpeed = 0.0000015; // Extremely elegant, slow, and relaxing speed factor
            
            // Very slow oscillation of the camera vector to avoid repetitive direction
            const swayAngle = time * 0.00003; 
            const driftX = (-0.75 + Math.sin(swayAngle) * 0.2) * baseDriftSpeed * this.z * deltaTime;
            const driftY = (-0.45 + Math.cos(swayAngle) * 0.15) * baseDriftSpeed * this.z * deltaTime;
            
            this.x += driftX;
            this.y += driftY;

            // Wrap coordinates around screen edges
            if (this.x < 0) this.x += 1;
            if (this.x > 1) this.x -= 1;
            if (this.y < 0) this.y += 1;
            if (this.y > 1) this.y -= 1;

            // Twinkle simulation: Smooth sine wave oscillation around base opacity
            const twinkle = Math.sin(time * this.twinkleSpeed + this.twinklePhase);
            // Twinkling amplitude is larger for foreground stars, making them sparkle more
            const amplitude = this.z > 0.8 ? 0.4 : 0.2;
            this.opacity = this.baseOpacity + twinkle * amplitude;
            
            // Keep opacity in safe bounds [0.05, 1]
            this.opacity = Math.max(0.05, Math.min(1, this.opacity));
        }

        draw() {
            // Apply camera parallax based on mouse offset and depth (Z)
            // Outer boundaries are safe because the canvas is styled to be slightly larger or clipped cleanly
            let drawX = (this.x * width) + (mouse.x * this.z * MAX_PARALLAX_PX);
            let drawY = (this.y * height) + (mouse.y * this.z * MAX_PARALLAX_PX);

            // Double check bounds wrap-around for visual continuity during large movements
            if (drawX < -50) drawX += width + 100;
            if (drawX > width + 50) drawX -= width + 100;
            if (drawY < -50) drawY += height + 100;
            if (drawY > height + 50) drawY -= height + 100;

            const size = this.baseSize;
            const alpha = this.opacity;

            // 1. Draw Star Core
            ctx.beginPath();
            ctx.arc(drawX, drawY, size / 2, 0, Math.PI * 2);
            ctx.fillStyle = this.colorTemplate + alpha + ')';
            ctx.fill();

            // 2. Draw Glow for Foreground Stars
            if (this.z > 0.7) {
                ctx.beginPath();
                const glowSize = size * (this.z > 1.0 ? 3.5 : 2.5);
                const glowGrad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, glowSize);
                glowGrad.addColorStop(0, this.colorTemplate + (alpha * 0.4) + ')');
                glowGrad.addColorStop(0.3, this.colorTemplate + (alpha * 0.15) + ')');
                glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
                
                ctx.arc(drawX, drawY, glowSize, 0, Math.PI * 2);
                ctx.fillStyle = glowGrad;
                ctx.fill();
            }

            // 3. Draw Stylized Cross Lens Flare for Brightest Stars
            if (this.hasFlare) {
                // Flare lines size pulses in sync with twinkle
                const flareLength = size * (3.5 + Math.sin(Date.now() * this.twinkleSpeed + this.twinklePhase) * 1.5);
                const flareAlpha = alpha * 0.45;

                ctx.strokeStyle = this.colorTemplate + flareAlpha + ')';
                ctx.lineWidth = 0.45;

                // Horizontal flare line
                ctx.beginPath();
                ctx.moveTo(drawX - flareLength, drawY);
                ctx.lineTo(drawX + flareLength, drawY);
                ctx.stroke();

                // Vertical flare line
                ctx.beginPath();
                ctx.moveTo(drawX, drawY - flareLength);
                ctx.lineTo(drawX, drawY + flareLength);
                ctx.stroke();
            }
        }
    }

    // Initialize stars
    function init() {
        stars.length = 0;
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push(new Star());
        }
    }

    // Adapt screen size
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        devicePixelRatio = window.devicePixelRatio || 1;

        // Apply scale factor for high-resolution displays
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        
        // CSS display size stays 100vw x 100vh
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        ctx.scale(devicePixelRatio, devicePixelRatio);

        // Reinitialize stars to match new aspect ratio and density
        init();
    }

    // Track mouse input only on dashboard
    if (isDashboard) {
        window.addEventListener('mousemove', (e) => {
            // Calculate normalized position relative to center of the viewport
            mouse.targetX = (e.clientX / window.innerWidth) - 0.5;
            mouse.targetY = (e.clientY / window.innerHeight) - 0.5;
        });

        // Reset mouse target when cursor leaves the window
        window.addEventListener('mouseleave', () => {
            mouse.targetX = 0;
            mouse.targetY = 0;
        });
    }

    // Smooth inertia interpolation loop
    function updateParallax() {
        mouse.x += (mouse.targetX - mouse.x) * ease;
        mouse.y += (mouse.targetY - mouse.y) * ease;
    }

    // Main animation loop
    let lastTime = 0;
    function animate(time) {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate frame time delta for frame-rate independence (capped at 50ms)
        if (!lastTime) lastTime = time;
        const deltaTime = Math.min(50, time - lastTime);
        lastTime = time;

        // Update inertia offset
        updateParallax();

        // Update and draw each star
        for (let i = 0; i < stars.length; i++) {
            stars[i].update(time, deltaTime);
            stars[i].draw();
        }

        requestAnimationFrame(animate);
    }

    // Start Everything
    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(animate);
});
