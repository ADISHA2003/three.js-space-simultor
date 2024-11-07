// Import necessary libraries
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.module.js';

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x000000); // Space background color
renderer.shadowMap.enabled = true;

// Resize the renderer and camera when the window size changes
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lighting setup
const ambientLight = new THREE.AmbientLight(0x404040, 1.2); // Global light for scene
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(0, 500, 500).normalize();
scene.add(directionalLight);

// Sun (center of the solar system)
const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planet data (name, color, size, distance, and orbital speed)
const planets = [
    { name: "Mercury", color: 0xaaaaaa, size: 0.4, distance: 15, speed: 0.1 / Math.sqrt(15) },  
    { name: "Venus", color: 0xffa500, size: 0.9, distance: 25, speed: 0.1 / Math.sqrt(25) },
    { name: "Earth", color: 0x0000ff, size: 1, distance: 35, speed: 0.1 / Math.sqrt(35) },
    { name: "Mars", color: 0xff4500, size: 0.5, distance: 45, speed: 0.1 / Math.sqrt(45) },
    { name: "Jupiter", color: 0xffd700, size: 3, distance: 60, speed: 0.1 / Math.sqrt(60) },
    { name: "Saturn", color: 0xc2b280, size: 2.5, distance: 75, speed: 0.1 / Math.sqrt(75) },
    { name: "Uranus", color: 0x00ffff, size: 2, distance: 90, speed: 0.1 / Math.sqrt(90) },
    { name: "Neptune", color: 0x00008b, size: 2, distance: 105, speed: 0.1 / Math.sqrt(105) },
];

// Array to hold the planet objects
const planetObjects = [];

// Create planets
planets.forEach(planet => {
    const planetGeometry = new THREE.SphereGeometry(planet.size, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({ color: planet.color });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;
    planetMesh.position.set(planet.distance, 0, 0);
    scene.add(planetMesh);

    planetObjects.push({
        mesh: planetMesh,
        distance: planet.distance,
        speed: planet.speed,
        angle: Math.random() * Math.PI * 2 // Randomize initial angle
    });

    // Add moons to Earth
    if (planet.name === "Earth") {
        addMoon(planetMesh);
    }

    // If the planet is Saturn, add rings
    if (planet.name === "Saturn") {
        addSaturnRings(planetMesh);
    }
});

// Function to create a moon that orbits around Earth
function addMoon(earthMesh) {
    const moonGeometry = new THREE.SphereGeometry(0.5, 16, 16); // Smaller size for the moon
    const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.castShadow = true;
    moon.receiveShadow = true;
    earthMesh.add(moon); // Attach moon to Earth

    // Set moon's initial position relative to Earth
    moon.position.set(5, 0, 0); // 5 units away from Earth
    moon.orbitAngle = Math.random() * Math.PI * 2; // Randomize initial orbit angle

    // Update function to animate moon's orbit around Earth
    moon.updateOrbit = function() {
        this.orbitAngle += 0.02; // Moon's orbital speed
        this.position.set(Math.cos(this.orbitAngle) * 5, 0, Math.sin(this.orbitAngle) * 5);
    };

    return moon;
}

// Update planetObjects to store moons as well
planetObjects.forEach(planet => {
    if (planet.name === "Earth") {
        planet.moon = addMoon(planet.mesh); // Add moon to Earth
    }
});

// Function to create rings for Saturn
function addSaturnRings(planetMesh) {
    const ringGeometry = new THREE.RingGeometry(planetMesh.scale.x * 3, planetMesh.scale.x * 4, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xd3c0ad, // Light brown color for the rings
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;  // Align the ring horizontally
    planetMesh.add(ring);

    // Add additional rings with different sizes and opacity for variation
    const ring2 = new THREE.RingGeometry(planetMesh.scale.x * 4.5, planetMesh.scale.x * 5.5, 64);
    const ring2Material = new THREE.MeshBasicMaterial({
        color: 0xc2b280, // Slightly darker brown for outer ring
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    const ring2Mesh = new THREE.Mesh(ring2, ring2Material);
    ring2Mesh.rotation.x = Math.PI / 2;
    planetMesh.add(ring2Mesh);

    const ring3 = new THREE.RingGeometry(planetMesh.scale.x * 5.5, planetMesh.scale.x * 7, 64);
    const ring3Material = new THREE.MeshBasicMaterial({
        color: 0x7c7c7c, // Dark gray for outermost ring
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });
    const ring3Mesh = new THREE.Mesh(ring3, ring3Material);
    ring3Mesh.rotation.x = Math.PI / 2;
    planetMesh.add(ring3Mesh);
}

// Function to create stars in the background
function createStars(count) {
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3); // x, y, z positions for each star
    const sizes = new Float32Array(count); // Size of each star
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff, // White color for stars
        size: 2, // Increase size of stars
        opacity: 1, // Full opacity for stars
        transparent: true, // Allow transparency for blending
        sizeAttenuation: true, // Make stars smaller as they get further away
    });

    // Generate random positions for stars
    for (let i = 0; i < count; i++) {
        positions[i * 3] = Math.random() * 2000 - 1000; // x position
        positions[i * 3 + 1] = Math.random() * 2000 - 1000; // y position
        positions[i * 3 + 2] = Math.random() * 2000 - 1000; // z position
        sizes[i] = Math.random() * 5 + 1; // Random size for each star
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1)); // Set star sizes

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

createStars(1000); // Add 1000 stars for a space-like effect

// Function to create shooting stars (meteors)
function createShootingStars(count) {
    const meteorGeometry = new THREE.BufferGeometry();
    const meteorPositions = new Float32Array(count * 3); // x, y, z positions for each meteor
    const meteorVelocities = new Float32Array(count * 3); // x, y, z velocities for each meteor

    const meteorMaterial = new THREE.PointsMaterial({
        color: 0xffffff, // Bright yellow color for meteors
        size: 5,
        opacity: 1,
        transparent: true,
        sizeAttenuation: true,
    });

    // Generate random meteors
    for (let i = 0; i < count; i++) {
        meteorPositions[i * 3] = Math.random() * 2000 - 1000;
        meteorPositions[i * 3 + 1] = Math.random() * 2000 - 1000;
        meteorPositions[i * 3 + 2] = Math.random() * 2000 - 1000;

        meteorVelocities[i * 3] = Math.random() * 10 - 5; // Random velocity in x direction
        meteorVelocities[i * 3 + 1] = Math.random() * 10 - 5; // Random velocity in y direction
        meteorVelocities[i * 3 + 2] = Math.random() * 10 - 5; // Random velocity in z direction
    }

    meteorGeometry.setAttribute('position', new THREE.BufferAttribute(meteorPositions, 3));
    const meteors = new THREE.Points(meteorGeometry, meteorMaterial);
    scene.add(meteors);

    // Update meteor positions to animate them
    function animateMeteors() {
        for (let i = 0; i < count; i++) {
            meteorPositions[i * 3] += meteorVelocities[i * 3];
            meteorPositions[i * 3 + 1] += meteorVelocities[i * 3 + 1];
            meteorPositions[i * 3 + 2] += meteorVelocities[i * 3 + 2];

            // Reset position if meteor moves too far
            if (meteorPositions[i * 3] > 1000 || meteorPositions[i * 3 + 1] > 1000 || meteorPositions[i * 3 + 2] > 1000) {
                meteorPositions[i * 3] = Math.random() * 2000 - 1000;
                meteorPositions[i * 3 + 1] = Math.random() * 2000 - 1000;
                meteorPositions[i * 3 + 2] = Math.random() * 2000 - 1000;
            }
        }

        meteorGeometry.attributes.position.needsUpdate = true;
    }

    return animateMeteors;
}

const updateMeteors = createShootingStars(5);

// Camera movement setup (keyboard controls)
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const cameraSpeed = 1;  // Camera movement speed

// Keyboard event listeners for camera movement
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') moveForward = true;
    if (e.key === 'ArrowDown') moveBackward = true;
    if (e.key === 'ArrowLeft') moveLeft = true;
    if (e.key === 'ArrowRight') moveRight = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') moveForward = false;
    if (e.key === 'ArrowDown') moveBackward = false;
    if (e.key === 'ArrowLeft') moveLeft = false;
    if (e.key === 'ArrowRight') moveRight = false;
});

// Camera setup
camera.position.set(0, 50, 150);

// Function to animate the scene and update planets and camera position
function animate() {
    requestAnimationFrame(animate);

    // Rotate planets around the Sun
    planetObjects.forEach(planet => {
        planet.angle += planet.speed;
        planet.mesh.position.set(
            Math.cos(planet.angle) * planet.distance,
            0,
            Math.sin(planet.angle) * planet.distance
        );
    });

    // Update the moon's orbit around Earth
    planetObjects.forEach(planet => {
        if (planet.name === "Earth" && planet.moon) {
            planet.moon.updateOrbit(); // Call the updateOrbit function for the moon
        }
    });

    // Move the camera based on keypresses
    if (moveForward) camera.position.z -= cameraSpeed;
    if (moveBackward) camera.position.z += cameraSpeed;
    if (moveLeft) camera.position.x -= cameraSpeed;
    if (moveRight) camera.position.x += cameraSpeed;

    // Camera follows the sun for a better viewing experience
    camera.lookAt(sun.position);

    updateMeteors(); // Update shooting stars (meteors)

    renderer.render(scene, camera);
}

// Start animation
animate();
