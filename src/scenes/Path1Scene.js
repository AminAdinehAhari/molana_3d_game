import * as THREE from 'three';

export class Path1Scene {
    constructor(gameEngine, gameState, uiManager, sceneManager) {
        this.engine = gameEngine;
        this.state = gameState;
        this.ui = uiManager;
        this.sceneManager = sceneManager;

        this.currentPuzzle = 0;
        this.puzzles = this.getPuzzles();
    }

    init() {
        this.createEnvironment();
        this.createPath();
        this.createPuzzleStations();
        this.setupCamera();
        this.setupLighting();
        this.startJourney();

        this.engine.setUpdateFunction((delta) => this.update(delta));
    }

    getPuzzles() {
        return [
            {
                verse: 'طوطی و بقال - طوطی را در قفس بود، امّا...',
                question: 'چه چیزی طوطی را آزاد می‌کند؟',
                options: [
                    { text: 'وانمود کردن مرگ (آگاهی و تدبیر)', correct: true },
                    { text: 'فریاد زدن و اعتراض', correct: false },
                    { text: 'صبر کردن تا دیگران کمک کنند', correct: false }
                ],
                feedback: {
                    correct: 'آفرین! آگاهی و تدبیر، کلید رهایی است.',
                    wrong: 'طوطی با آگاهی و نقشه، خود را نجات داد.'
                }
            },
            {
                verse: 'سه ماهی در دریاچه - یکی هشیار بود و گفت...',
                question: 'ماهی هشیار چه کرد؟',
                options: [
                    { text: 'پیش از رسیدن صیاد، دریاچه را ترک کرد', correct: true },
                    { text: 'منتظر ماند تا ببیند چه می‌شود', correct: false },
                    { text: 'به ماهی‌های دیگر اعتماد کرد', correct: false }
                ],
                feedback: {
                    correct: 'درست است! پیشگیری از خطر، نشانه خرد است.',
                    wrong: 'ماهی هشیار پیش از خطر، راه نجات را یافت.'
                }
            },
            {
                verse: 'در زندگی، دانه‌ای در تله است...',
                question: 'دانه در دام را باید چگونه دید؟',
                options: [
                    { text: 'نشانه خطر، نه فرصت', correct: true },
                    { text: 'فرصتی برای سیر شدن', correct: false },
                    { text: 'هدیه‌ای از طبیعت', correct: false }
                ],
                feedback: {
                    correct: 'بسیار عالی! خرد، دام را از فرصت تشخیص می‌دهد.',
                    wrong: 'دانه در دام، آزمون آگاهی است.'
                }
            },
            {
                verse: 'قطب‌نما همیشه به سمت شمال حقیقی اشاره می‌کند...',
                question: 'قطب‌نمای درونی تو چیست؟',
                options: [
                    { text: 'ارزش‌ها و باورهای واقعی من', correct: true },
                    { text: 'نظر اطرافیانم', correct: false },
                    { text: 'مد و ترندهای روز', correct: false }
                ],
                feedback: {
                    correct: 'آفرین! ارزش‌های تو، راهنمای راستین تو هستند.',
                    wrong: 'قطب‌نمای درونی، ارزش‌های واقعی توست.'
                }
            }
        ];
    }

    createEnvironment() {
        // Natural sky with golden light
        const skyColor = new THREE.Color(0x87ceeb);
        this.engine.scene.background = skyColor;
        this.engine.scene.fog = new THREE.Fog(0xd4af37, 10, 50);

        // Ground - natural terrain
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d5a3d,
            roughness: 0.9,
            metalness: 0.1
        });

        // Add terrain variation
        const positions = groundGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] = Math.random() * 2;
        }
        groundGeometry.attributes.position.needsUpdate = true;
        groundGeometry.computeVertexNormals();

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.engine.scene.add(ground);

        // Add trees
        this.createTrees();

        // Add mountains in distance
        this.createMountains();
    }

    createTrees() {
        for (let i = 0; i < 30; i++) {
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;

            // Skip if too close to path
            if (Math.abs(x) < 5 && z < 10 && z > -30) continue;

            this.createTree(x, z);
        }
    }

    createTree(x, z) {
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3c2a,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 1.5, z);
        trunk.castShadow = true;
        this.engine.scene.add(trunk);

        // Foliage
        const foliageGeometry = new THREE.ConeGeometry(1.5, 3, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5016,
            roughness: 0.8
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(x, 4.5, z);
        foliage.castShadow = true;
        this.engine.scene.add(foliage);
    }

    createMountains() {
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const distance = 40;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;

            const height = 15 + Math.random() * 10;
            const mountainGeometry = new THREE.ConeGeometry(8, height, 4);
            const mountainMaterial = new THREE.MeshStandardMaterial({
                color: 0x6b6b6b,
                roughness: 0.9,
                metalness: 0.1
            });
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
            mountain.position.set(x, height / 2, z);
            mountain.rotation.y = Math.random() * Math.PI;
            this.engine.scene.add(mountain);
        }
    }

    createPath() {
        // Narrow winding path
        const pathGeometry = new THREE.PlaneGeometry(3, 30);
        const pathMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            roughness: 0.8
        });
        const path = new THREE.Mesh(pathGeometry, pathMaterial);
        path.rotation.x = -Math.PI / 2;
        path.position.set(0, 0.1, -10);
        path.receiveShadow = true;
        this.engine.scene.add(path);
    }

    createPuzzleStations() {
        this.puzzleStations = [];

        for (let i = 0; i < this.puzzles.length; i++) {
            const z = -5 - i * 7;
            this.createPuzzleStation(0, z, i);
        }

        // Create final door
        this.createFinalDoor();
    }

    createPuzzleStation(x, z, index) {
        // Platform
        const platformGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 16);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.5,
            metalness: 0.3,
            emissive: 0xffd700,
            emissiveIntensity: 0.2
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(x, 0.25, z);
        platform.castShadow = true;
        this.engine.scene.add(platform);

        // Floating orb
        const orbGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const orbMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.8
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(x, 2, z);
        this.engine.scene.add(orb);

        // Light
        const light = new THREE.PointLight(0xffd700, 1, 10);
        light.position.set(x, 2, z);
        this.engine.scene.add(light);

        this.puzzleStations.push({
            platform,
            orb,
            light,
            position: new THREE.Vector3(x, 1, z),
            index
        });
    }

    createFinalDoor() {
        const z = -5 - this.puzzles.length * 7;

        // Door frame
        const frameGeometry = new THREE.BoxGeometry(4, 6, 0.5);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.3,
            metalness: 0.7,
            emissive: 0xffaa00,
            emissiveIntensity: 0.5
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, 3, z);
        this.engine.scene.add(frame);

        // Door itself
        const doorGeometry = new THREE.BoxGeometry(3, 5, 0.3);
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3c2a,
            roughness: 0.7
        });
        this.door = new THREE.Mesh(doorGeometry, doorMaterial);
        this.door.position.set(0, 2.5, z - 0.2);
        this.engine.scene.add(this.door);

        this.doorPosition = z;
    }

    setupCamera() {
        this.engine.camera.position.set(0, 3, 5);
        this.engine.camera.lookAt(0, 1, 0);
    }

    setupLighting() {
        // Golden sunlight
        const sunLight = new THREE.DirectionalLight(0xffd700, 1);
        sunLight.position.set(10, 20, 5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.engine.scene.add(sunLight);

        // Ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.engine.scene.add(ambient);

        // Hemisphere light
        const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3d5a3d, 0.6);
        this.engine.scene.add(hemiLight);
    }

    startJourney() {
        this.ui.showPathIndicator('مسیر آگاهی و پژوهش');

        setTimeout(() => {
            this.ui.showNarrative(
                'این مسیر سخت است، اما به حقیقت می‌رسد.<br>در هر ایستگاه، معمایی برایت است.',
                4000,
                () => {
                    this.moveToPuzzle(0);
                }
            );
        }, 1000);
    }

    moveToPuzzle(index) {
        if (index >= this.puzzles.length) {
            this.reachEnd();
            return;
        }

        const station = this.puzzleStations[index];
        const targetPos = station.position.clone();
        targetPos.z += 5;
        targetPos.y = 3;

        this.engine.transitionCamera(
            targetPos,
            station.position,
            2,
            () => {
                this.showPuzzle(index);
            }
        );
    }

    showPuzzle(index) {
        const puzzle = this.puzzles[index];

        this.ui.showPuzzle(
            puzzle.verse + '<br><br>' + puzzle.question,
            puzzle.options,
            (isCorrect, chosenIndex) => {
                this.handlePuzzleAnswer(index, isCorrect, chosenIndex);
            }
        );
    }

    handlePuzzleAnswer(index, isCorrect, chosenIndex) {
        const puzzle = this.puzzles[index];

        if (isCorrect) {
            this.state.incrementPuzzlesSolved();
            this.state.addAwarenessScore(10);

            this.ui.showMessage(puzzle.feedback.correct, 2500);

            setTimeout(() => {
                this.currentPuzzle++;
                this.moveToPuzzle(this.currentPuzzle);
            }, 3000);
        } else {
            this.state.addAwarenessScore(-5);

            this.ui.showNarrative(puzzle.feedback.wrong, 3000, () => {
                // Show puzzle again
                this.showPuzzle(index);
            });
        }
    }

    reachEnd() {
        // Move camera to door
        const doorCameraPos = new THREE.Vector3(0, 3, this.doorPosition + 8);
        const doorLookAt = new THREE.Vector3(0, 3, this.doorPosition);

        this.engine.transitionCamera(doorCameraPos, doorLookAt, 2, () => {
            this.openDoor();
        });
    }

    openDoor() {
        this.ui.showNarrative('تبریک! کلید طلایی را یافتی.', 2000);

        // Animate door opening
        let angle = 0;
        const openDoor = () => {
            angle += 0.05;
            this.door.rotation.y = -angle;

            if (angle < Math.PI / 2) {
                requestAnimationFrame(openDoor);
            } else {
                this.showEnding();
            }
        };

        setTimeout(() => {
            openDoor();
        }, 2500);
    }

    showEnding() {
        this.ui.fadeToBlack(2, () => {
            // Change scene to sky
            this.engine.scene.background = new THREE.Color(0xffffff);
            this.engine.scene.fog = new THREE.Fog(0xffffff, 5, 20);

            setTimeout(() => {
                this.ui.fadeFromBlack(2);
                this.ui.showNarrative(
                    'به هویت واقعی خود خوش آمدی.<br><br>تو با آگاهی و پژوهش، راه خود را یافتی.',
                    8000
                );
            }, 500);
        });
    }

    update(delta) {
        // Animate floating orbs
        if (this.puzzleStations) {
            this.puzzleStations.forEach((station, index) => {
                const offset = index * Math.PI * 0.5;
                station.orb.position.y = 2 + Math.sin(Date.now() * 0.001 + offset) * 0.3;
                station.orb.rotation.y += delta;
                station.light.intensity = 1 + Math.sin(Date.now() * 0.002 + offset) * 0.5;
            });
        }
    }

    dispose() {
        this.puzzleStations = [];
    }
}
