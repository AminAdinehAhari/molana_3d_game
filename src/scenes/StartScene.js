import * as THREE from 'three';

export class StartScene {
    constructor(gameEngine, gameState, uiManager, sceneManager) {
        this.engine = gameEngine;
        this.state = gameState;
        this.ui = uiManager;
        this.sceneManager = sceneManager;

        this.clickableObjects = [];
        this.pathMeshes = [];
    }

    init() {
        this.createEnvironment();
        this.createHub();
        this.createPaths();
        this.createPlayer();
        this.setupCamera();
        this.setupLighting();
        this.startIntroduction();

        // Set clickable objects
        this.engine.setClickableObjects(this.clickableObjects);

        // Set update function for animations
        this.engine.setUpdateFunction((delta) => this.update(delta));
    }

    createEnvironment() {
        // Sky
        const skyColor = new THREE.Color(0x0a0a1a);
        this.engine.scene.background = skyColor;
        this.engine.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.05);

        // Ground plane (dark, mystical)
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        this.engine.scene.add(ground);

        // Add stars
        this.createStars();
    }

    createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];

        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = Math.random() * 100 + 20;
            const z = (Math.random() - 0.5) * 200;
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        this.engine.scene.add(stars);
    }

    createHub() {
        // Central circular platform
        const hubGeometry = new THREE.CylinderGeometry(4, 4, 0.5, 32);
        const hubMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d2d44,
            roughness: 0.6,
            metalness: 0.4,
            emissive: 0x111122,
            emissiveIntensity: 0.2
        });
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        hub.position.y = 0.25;
        hub.castShadow = true;
        hub.receiveShadow = true;
        this.engine.scene.add(hub);

        // Add glowing edge
        const edgeGeometry = new THREE.TorusGeometry(4, 0.1, 16, 100);
        const edgeMaterial = new THREE.MeshBasicMaterial({
            color: 0x6666ff,
            transparent: true,
            opacity: 0.6
        });
        const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edge.rotation.x = Math.PI / 2;
        edge.position.y = 0.5;
        this.engine.scene.add(edge);
        this.glowingEdge = edge;

        // Central pillar with light
        const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 16);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x4444aa,
            emissive: 0x2222ff,
            emissiveIntensity: 0.5
        });
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.y = 2;
        this.engine.scene.add(pillar);
    }

    createPaths() {
        const pathData = [
            {
                name: 'path1',
                angle: 0,
                color: 0xd4af37, // Golden
                emissive: 0xffd700,
                label: 'راه آگاهی و پژوهش',
                position: new THREE.Vector3(0, 0.1, -8)
            },
            {
                name: 'path2',
                angle: (2 * Math.PI) / 3,
                color: 0x4a90e2, // Blue
                emissive: 0x2266cc,
                label: 'راه تقلید',
                position: new THREE.Vector3(7, 0.1, 4)
            },
            {
                name: 'path3',
                angle: (4 * Math.PI) / 3,
                color: 0xff6b9d, // Pink/Red
                emissive: 0xff3366,
                label: 'راه غفلت',
                position: new THREE.Vector3(-7, 0.1, 4)
            }
        ];

        pathData.forEach((data, index) => {
            this.createPath(data, index + 1);
        });
    }

    createPath(data, pathNumber) {
        // Path platform
        const pathGeometry = new THREE.BoxGeometry(2, 0.3, 4);
        const pathMaterial = new THREE.MeshStandardMaterial({
            color: data.color,
            roughness: 0.5,
            metalness: 0.3,
            emissive: data.emissive,
            emissiveIntensity: 0.3
        });
        const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
        pathMesh.position.copy(data.position);
        pathMesh.castShadow = true;
        pathMesh.receiveShadow = true;

        // Store data for interaction
        pathMesh.userData = {
            pathNumber: pathNumber,
            pathName: data.name,
            label: data.label,
            onClick: () => this.selectPath(pathNumber, data.label)
        };

        this.engine.scene.add(pathMesh);
        this.clickableObjects.push(pathMesh);
        this.pathMeshes.push(pathMesh);

        // Add glow point light
        const pathLight = new THREE.PointLight(data.emissive, 1, 10);
        pathLight.position.copy(data.position);
        pathLight.position.y += 1;
        this.engine.scene.add(pathLight);

        // Add floating symbol above path
        this.createPathSymbol(data.position, data.color);
    }

    createPathSymbol(position, color) {
        const symbolGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const symbolMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
        symbol.position.copy(position);
        symbol.position.y += 2;
        this.engine.scene.add(symbol);

        // Store for animation
        if (!this.floatingSymbols) this.floatingSymbols = [];
        this.floatingSymbols.push({
            mesh: symbol,
            baseY: symbol.position.y,
            offset: Math.random() * Math.PI * 2
        });
    }

    createPlayer() {
        // Simple player representation (will be hidden but exists for reference)
        const playerGeometry = new THREE.CapsuleGeometry(0.3, 1, 8, 16);
        const playerMaterial = new THREE.MeshStandardMaterial({
            color: this.state.gender === 'boy' ? 0x4488ff : 0xff88cc,
            roughness: 0.7
        });
        this.player = new THREE.Mesh(playerGeometry, playerMaterial);
        this.player.position.set(0, 1, 0);
        this.player.castShadow = true;
        this.engine.scene.add(this.player);
    }

    setupCamera() {
        this.engine.camera.position.set(0, 5, 10);
        this.engine.camera.lookAt(0, 1, 0);
    }

    setupLighting() {
        // Mystical ambient light
        const ambient = new THREE.AmbientLight(0x4444aa, 0.4);
        this.engine.scene.add(ambient);

        // Main light from above
        const mainLight = new THREE.DirectionalLight(0x8888ff, 0.6);
        mainLight.position.set(0, 20, 0);
        mainLight.castShadow = true;
        this.engine.scene.add(mainLight);

        // Atmospheric hemisphere light
        const hemiLight = new THREE.HemisphereLight(0x0a0a1a, 0x000000, 0.3);
        this.engine.scene.add(hemiLight);
    }

    startIntroduction() {
        // Show introduction text
        setTimeout(() => {
            this.ui.showNarrative(
                'برای رسیدن به گنج خودشناسی،<br>مسیر خود را انتخاب کن.',
                4000,
                () => {
                    this.ui.showInstructions('روی یکی از مسیرها کلیک کنید');
                }
            );
        }, 1000);

        // Animate camera rotation
        this.startCameraRotation();
    }

    startCameraRotation() {
        this.cameraRotating = true;
        this.cameraAngle = 0;
    }

    selectPath(pathNumber, pathLabel) {
        this.ui.hideInstructions();
        this.ui.hideNarrative();

        // Store choice
        this.state.setPath(`path${pathNumber}`);
        this.state.addChoice(`selected_path_${pathNumber}`);

        // Show path name
        this.ui.showMessage(pathLabel, 2000);

        // Transition to path scene
        setTimeout(() => {
            this.sceneManager.transitionToPath(pathNumber);
        }, 2500);
    }

    update(delta) {
        // Animate glowing edge
        if (this.glowingEdge) {
            this.glowingEdge.rotation.z += delta * 0.2;
        }

        // Animate floating symbols
        if (this.floatingSymbols) {
            this.floatingSymbols.forEach(symbol => {
                symbol.mesh.position.y = symbol.baseY + Math.sin(Date.now() * 0.001 + symbol.offset) * 0.3;
                symbol.mesh.rotation.y += delta;
            });
        }

        // Animate path platforms (pulsing)
        this.pathMeshes.forEach((mesh, index) => {
            const pulse = Math.sin(Date.now() * 0.002 + index) * 0.5 + 0.5;
            mesh.material.emissiveIntensity = 0.2 + pulse * 0.3;
        });

        // Slow camera rotation
        if (this.cameraRotating && !this.engine.isMouseDown) {
            this.cameraAngle += delta * 0.1;
            const radius = 10;
            this.engine.camera.position.x = Math.sin(this.cameraAngle) * radius;
            this.engine.camera.position.z = Math.cos(this.cameraAngle) * radius;
            this.engine.camera.lookAt(0, 1, 0);
        }
    }

    dispose() {
        this.cameraRotating = false;
        this.clickableObjects = [];
        this.pathMeshes = [];
        this.floatingSymbols = [];
    }
}
