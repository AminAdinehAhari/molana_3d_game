import * as THREE from 'three';

export class GameEngine {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;

        this.container = document.getElementById('game-container');
        this.clock = new THREE.Clock();

        this.setupRenderer();
        this.setupScene();
        this.setupCamera();
        this.setupLights();
        this.setupControls();

        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.02);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0, 1, 0);
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);

        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        this.scene.add(mainLight);

        // Hemisphere light for sky
        const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x222222, 0.5);
        this.scene.add(hemiLight);
    }

    setupControls() {
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.isMouseDown = false;
        this.previousMouseX = 0;
        this.cameraRotationY = 0;
        this.targetCameraRotationY = 0;

        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', () => this.onMouseUp());
        window.addEventListener('click', (e) => this.onClick(e));
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        if (this.isMouseDown) {
            const deltaX = event.clientX - this.previousMouseX;
            this.targetCameraRotationY += deltaX * 0.005;
        }

        this.previousMouseX = event.clientX;
    }

    onMouseDown(event) {
        this.isMouseDown = true;
        this.previousMouseX = event.clientX;
    }

    onMouseUp() {
        this.isMouseDown = false;
    }

    onClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        if (this.clickableObjects && this.clickableObjects.length > 0) {
            const intersects = this.raycaster.intersectObjects(this.clickableObjects);

            if (intersects.length > 0) {
                const clickedObject = intersects[0].object;
                if (clickedObject.userData.onClick) {
                    clickedObject.userData.onClick();
                }
            }
        }
    }

    setClickableObjects(objects) {
        this.clickableObjects = objects;
    }

    clearScene() {
        while(this.scene.children.length > 0) {
            const object = this.scene.children[0];
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(mat => mat.dispose());
                } else {
                    object.material.dispose();
                }
            }
            this.scene.remove(object);
        }

        // Re-add lights
        this.setupLights();
    }

    updateCameraRotation() {
        // Smooth camera rotation
        this.cameraRotationY += (this.targetCameraRotationY - this.cameraRotationY) * 0.1;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        this.updateCameraRotation();

        // Custom update function for current scene
        if (this.onUpdate) {
            this.onUpdate(delta);
        }

        this.renderer.render(this.scene, this.camera);
    }

    setUpdateFunction(func) {
        this.onUpdate = func;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    transitionCamera(targetPosition, targetLookAt, duration = 2, onComplete = null) {
        const startPosition = this.camera.position.clone();
        const startLookAt = new THREE.Vector3(0, 1, 0);

        let elapsed = 0;

        const transition = () => {
            elapsed += this.clock.getDelta();
            const t = Math.min(elapsed / duration, 1);

            // Ease in-out
            const eased = t < 0.5
                ? 2 * t * t
                : -1 + (4 - 2 * t) * t;

            this.camera.position.lerpVectors(startPosition, targetPosition, eased);

            const currentLookAt = new THREE.Vector3();
            currentLookAt.lerpVectors(startLookAt, targetLookAt, eased);
            this.camera.lookAt(currentLookAt);

            if (t < 1) {
                requestAnimationFrame(transition);
            } else if (onComplete) {
                onComplete();
            }
        };

        transition();
    }
}
