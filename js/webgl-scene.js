/**
 * WebGL Scene - Three.js Mayan-inspired 3D background
 */

class WebGLScene {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.glyphs = [];
        this.clock = new THREE.Clock();
        
        this.init();
        this.animate();
        this.handleResize();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0F0F1E, 0.002);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x40E0D0, 0.5);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xFF6B9D, 1, 100);
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x7FFFD4, 0.8, 100);
        pointLight2.position.set(-10, -10, -10);
        this.scene.add(pointLight2);

        // Create particle system
        this.createParticles();

        // Create rotating Mayan glyphs
        this.createGlyphs();

        // Add textured planes
        this.createTexturedPlanes();
    }

    createParticles() {
        const particleCount = 1500;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            // Random positions
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i + 1] = (Math.random() - 0.5) * 100;
            positions[i + 2] = (Math.random() - 0.5) * 100;

            // Neon pastel colors
            const colorChoice = Math.random();
            if (colorChoice < 0.33) {
                // Pastel neon pink/red
                colors[i] = 1.0;      // R
                colors[i + 1] = 0.42; // G
                colors[i + 2] = 0.62; // B
            } else if (colorChoice < 0.66) {
                // Turquoise
                colors[i] = 0.25;     // R
                colors[i + 1] = 0.88; // G
                colors[i + 2] = 0.82; // B
            } else {
                // Aquamarine
                colors[i] = 0.5;      // R
                colors[i + 1] = 1.0;  // G
                colors[i + 2] = 0.83; // B
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createGlyphs() {
        // Create simple geometric shapes representing Mayan glyphs
        const glyphGeometries = [
            new THREE.TorusGeometry(2, 0.5, 8, 12),
            new THREE.OctahedronGeometry(2),
            new THREE.TetrahedronGeometry(2),
            new THREE.BoxGeometry(2, 2, 2)
        ];

        const materials = [
            new THREE.MeshStandardMaterial({
                color: 0xFF6B9D,
                metalness: 0.3,
                roughness: 0.7,
                emissive: 0xFF6B9D,
                emissiveIntensity: 0.2
            }),
            new THREE.MeshStandardMaterial({
                color: 0x40E0D0,
                metalness: 0.3,
                roughness: 0.7,
                emissive: 0x40E0D0,
                emissiveIntensity: 0.2
            }),
            new THREE.MeshStandardMaterial({
                color: 0x7FFFD4,
                metalness: 0.5,
                roughness: 0.5,
                emissive: 0x7FFFD4,
                emissiveIntensity: 0.3
            })
        ];

        // Create 5 glyphs at different positions
        for (let i = 0; i < 5; i++) {
            const geometry = glyphGeometries[Math.floor(Math.random() * glyphGeometries.length)];
            const material = materials[Math.floor(Math.random() * materials.length)];
            const glyph = new THREE.Mesh(geometry, material);

            // Position glyphs
            glyph.position.x = (Math.random() - 0.5) * 40;
            glyph.position.y = (Math.random() - 0.5) * 40;
            glyph.position.z = (Math.random() - 0.5) * 40;

            // Random rotation
            glyph.rotation.x = Math.random() * Math.PI;
            glyph.rotation.y = Math.random() * Math.PI;

            // Store rotation speed
            glyph.userData.rotationSpeed = {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            };

            this.glyphs.push(glyph);
            this.scene.add(glyph);
        }
    }

    createTexturedPlanes() {
        // Create textured planes in the background
        const geometry = new THREE.PlaneGeometry(15, 15);
        const material = new THREE.MeshStandardMaterial({
            color: 0x1A1A2E,
            metalness: 0.1,
            roughness: 0.9,
            transparent: true,
            opacity: 0.3
        });

        for (let i = 0; i < 3; i++) {
            const plane = new THREE.Mesh(geometry, material);
            plane.position.z = -20 - i * 10;
            plane.position.x = (Math.random() - 0.5) * 30;
            plane.position.y = (Math.random() - 0.5) * 30;
            plane.rotation.z = Math.random() * Math.PI;
            this.scene.add(plane);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        // Rotate particles slowly
        if (this.particles) {
            this.particles.rotation.y += 0.0005;
            this.particles.rotation.x = Math.sin(elapsed * 0.1) * 0.1;
        }

        // Rotate glyphs
        this.glyphs.forEach(glyph => {
            glyph.rotation.x += glyph.userData.rotationSpeed.x;
            glyph.rotation.y += glyph.userData.rotationSpeed.y;
            glyph.rotation.z += glyph.userData.rotationSpeed.z;

            // Gentle floating motion
            glyph.position.y += Math.sin(elapsed + glyph.position.x) * 0.002;
        });

        // Slowly rotate camera
        this.camera.position.x = Math.sin(elapsed * 0.05) * 2;
        this.camera.position.y = Math.cos(elapsed * 0.03) * 2;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        window.addEventListener('resize', () => {
            // Update camera
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();

            // Update renderer
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    }
}

// Initialize WebGL scene when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js is loaded
    if (typeof THREE !== 'undefined') {
        new WebGLScene();
    } else {
        console.error('Three.js not loaded');
    }
});
