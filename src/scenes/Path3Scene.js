import * as THREE from 'three';

export class Path3Scene {
    constructor(gameEngine, gameState, uiManager, sceneManager) {
        this.engine = gameEngine;
        this.state = gameState;
        this.ui = uiManager;
        this.sceneManager = sceneManager;

        this.currentStation = 0;
        this.stations = this.getStations();
        this.negligenceScore = 0;
        this.groundStability = 1.0;
    }

    init() {
        this.createEnvironment();
        this.createPath();
        this.createAttractions();
        this.createPlayer();
        this.setupCamera();
        this.setupLighting();
        this.startJourney();

        this.engine.setUpdateFunction((delta) => this.update(delta));
    }

    getStations() {
        return [
            {
                type: 'restaurant',
                question: 'رستوران پرطمطراق! می‌خواهی وارد شوی؟',
                choices: [
                    { text: 'نه، باید به هدفم برسم', value: 'aware', score: 0 },
                    { text: 'چرا که نه! بیایم خوش بگذرانم', value: 'negligent', score: 10 }
                ],
                prompt: 'چه کسی هستی و چه می‌خواهی؟'
            },
            {
                type: 'cinema',
                question: 'سینما! فیلم‌های جذاب! می‌روی؟',
                choices: [
                    { text: 'نه، وقت ندارم', value: 'aware', score: 0 },
                    { text: 'حتماً! چه اشکالی دارد؟', value: 'negligent', score: 10 }
                ],
                prompt: 'آینده‌ات را چگونه می‌بینی؟'
            },
            {
                type: 'mall',
                question: 'مرکز خرید بزرگ! می‌خواهی خرید کنی؟',
                choices: [
                    { text: 'نه، به چیزهای مهم‌تر فکر می‌کنم', value: 'aware', score: 0 },
                    { text: 'آره! بریم خرید کنیم', value: 'negligent', score: 10 }
                ],
                prompt: 'هدف زندگی‌ات چیست؟'
            },
            {
                type: 'game',
                question: 'سالن بازی! بازی‌های هیجان‌انگیز!',
                choices: [
                    { text: 'نه، این‌ها فقط حواس‌پرتی هستند', value: 'aware', score: 0 },
                    { text: 'وای چقدر باحاله! می‌رم', value: 'negligent', score: 10 }
                ],
                prompt: 'چه چیزی برایت ارزش دارد؟'
            },
            {
                type: 'party',
                question: 'مهمانی شبانه! همه می‌رقصند!',
                choices: [
                    { text: 'نه، به خودم می‌رسم', value: 'aware', score: 0 },
                    { text: 'بریم! زندگی همین است!', value: 'negligent', score: 10 }
                ],
                prompt: 'کی می‌خواهی به خودت فکر کنی؟'
            }
        ];
    }

    createEnvironment() {
        // Colorful, attractive sky
        const skyColor = new THREE.Color(0xff88cc);
        this.engine.scene.background = skyColor;
        this.engine.scene.fog = new THREE.Fog(0xff88cc, 15, 50);

        // Colorful ground
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0xff66aa,
            roughness: 0.6,
            metalness: 0.2
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.engine.scene.add(this.ground);
    }

    createPath() {
        // Wide, attractive path
        const pathGeometry = new THREE.PlaneGeometry(8, 50);
        const pathMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa66,
            roughness: 0.5,
            emissive: 0xff8844,
            emissiveIntensity: 0.2
        });
        this.path = new THREE.Mesh(pathGeometry, pathMaterial);
        this.path.rotation.x = -Math.PI / 2;
        this.path.position.set(0, 0.05, -20);
        this.path.receiveShadow = true;
        this.engine.scene.add(this.path);
    }

    createAttractions() {
        this.attractions = [];

        this.stations.forEach((station, index) => {
            const z = -5 - index * 8;
            this.createAttraction(station.type, 0, z, index);
        });

        // Create swamp at end
        this.createSwamp();
    }

    createAttraction(type, x, z, index) {
        const group = new THREE.Group();

        // Main building/attraction
        const size = 4;
        const height = 5;
        const buildingGeometry = new THREE.BoxGeometry(size, height, size);

        let color;
        switch (type) {
            case 'restaurant':
                color = 0xff6666;
                break;
            case 'cinema':
                color = 0x6666ff;
                break;
            case 'mall':
                color = 0xffaa00;
                break;
            case 'game':
                color = 0x00ff88;
                break;
            case 'party':
                color = 0xff00ff;
                break;
            default:
                color = 0xff88cc;
        }

        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.4,
            metalness: 0.3,
            emissive: color,
            emissiveIntensity: 0.3
        });

        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = height / 2;
        building.castShadow = true;
        group.add(building);

        // Neon lights
        const light = new THREE.PointLight(color, 2, 15);
        light.position.y = height + 1;
        group.add(light);

        // Spinning sign
        const signGeometry = new THREE.BoxGeometry(3, 0.5, 0.1);
        const signMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.y = height + 2;
        group.add(sign);

        group.position.set(x, 0, z);
        this.engine.scene.add(group);

        this.attractions.push({
            group,
            light,
            sign,
            type,
            index
        });
    }

    createSwamp() {
        const swampZ = -5 - this.stations.length * 8;

        // Dark swamp
        const swampGeometry = new THREE.CircleGeometry(8, 32);
        const swampMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a3d1a,
            roughness: 0.9,
            metalness: 0.1,
            emissive: 0x0a1a0a,
            emissiveIntensity: 0.2
        });
        this.swamp = new THREE.Mesh(swampGeometry, swampMaterial);
        this.swamp.rotation.x = -Math.PI / 2;
        this.swamp.position.set(0, 0.02, swampZ);
        this.engine.scene.add(this.swamp);

        // Fog particles
        const particleCount = 50;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = [];

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = Math.random() * 6;
            const x = Math.cos(angle) * radius;
            const y = Math.random() * 2;
            const z = swampZ + Math.sin(angle) * radius;
            particlePositions.push(x, y, z);
        }

        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0x1a3d1a,
            size: 0.5,
            transparent: true,
            opacity: 0.5
        });

        this.swampParticles = new THREE.Points(particleGeometry, particleMaterial);
        this.engine.scene.add(this.swampParticles);

        this.swampPosition = swampZ;
    }

    createPlayer() {
        const playerGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
        const playerMaterial = new THREE.MeshStandardMaterial({
            color: this.state.gender === 'boy' ? 0x4488ff : 0xff88cc,
            roughness: 0.7
        });
        this.player = new THREE.Mesh(playerGeometry, playerMaterial);
        this.player.position.set(0, 1.2, 0);
        this.player.castShadow = true;
        this.engine.scene.add(this.player);

        this.playerSinking = false;
    }

    setupCamera() {
        this.engine.camera.position.set(0, 3, 8);
        this.engine.camera.lookAt(0, 1, 0);
    }

    setupLighting() {
        // Bright, colorful lighting
        const ambient = new THREE.AmbientLight(0xffccff, 0.6);
        this.engine.scene.add(ambient);

        // Main light
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.7);
        mainLight.position.set(5, 20, 5);
        mainLight.castShadow = true;
        this.engine.scene.add(mainLight);

        // Colorful accent lights
        const accentLight1 = new THREE.PointLight(0xff00ff, 1, 30);
        accentLight1.position.set(-10, 5, -20);
        this.engine.scene.add(accentLight1);

        const accentLight2 = new THREE.PointLight(0x00ffff, 1, 30);
        accentLight2.position.set(10, 5, -20);
        this.engine.scene.add(accentLight2);
    }

    startJourney() {
        this.ui.showPathIndicator('مسیر غفلت');

        setTimeout(() => {
            this.ui.showNarrative(
                'جاده رنگارنگ و جذاب است!<br>اما مراقب باش، غفلت بهای سنگینی دارد.',
                4000,
                () => {
                    this.showNextStation();
                }
            );
        }, 1000);
    }

    showNextStation() {
        if (this.currentStation >= this.stations.length) {
            this.reachSwamp();
            return;
        }

        const station = this.stations[this.currentStation];

        // Move camera to station
        const stationZ = -5 - this.currentStation * 8;
        const cameraPos = new THREE.Vector3(0, 3, stationZ + 6);
        const lookAt = new THREE.Vector3(0, 2, stationZ);

        this.engine.transitionCamera(cameraPos, lookAt, 1.5, () => {
            this.showStationChoice(station);
        });
    }

    showStationChoice(station) {
        this.ui.showNarrative(station.question, 2000, () => {
            this.ui.showChoices(
                station.choices.map(c => ({ text: c.text, value: c })),
                (choice) => {
                    this.handleStationChoice(choice, station);
                }
            );
        });
    }

    handleStationChoice(choice, station) {
        this.state.addChoice(choice.value);

        if (choice.value === 'negligent') {
            this.negligenceScore += choice.score;
            this.groundStability -= 0.15;

            // Show shallow question
            this.ui.showMessage('یک سوال...', 1500);

            setTimeout(() => {
                this.ui.showNarrative(
                    station.prompt + '<br><br>(بی‌تفاوت عبور می‌کنی)',
                    3000,
                    () => {
                        this.showWarning();
                    }
                );
            }, 1800);
        } else {
            this.ui.showMessage('انتخاب خوبی بود!', 2000);

            setTimeout(() => {
                this.moveToNextStation();
            }, 2500);
        }
    }

    showWarning() {
        if (this.groundStability < 0.5) {
            this.ui.showMessage('زمین در حال فرو رفتن است!', 2000);
        }

        setTimeout(() => {
            this.moveToNextStation();
        }, 2500);
    }

    moveToNextStation() {
        this.currentStation++;

        // Move player
        const targetZ = -5 - this.currentStation * 8;
        this.movePlayerTo(targetZ);

        setTimeout(() => {
            this.showNextStation();
        }, 2000);
    }

    movePlayerTo(targetZ) {
        const movePlayer = () => {
            this.player.position.z -= 0.15;
            this.engine.camera.position.z -= 0.15;

            // Player sinks slightly if negligent
            if (this.groundStability < 1.0) {
                this.player.position.y = 1.2 - (1.0 - this.groundStability) * 0.8;
            }

            if (this.player.position.z > targetZ) {
                requestAnimationFrame(movePlayer);
            }
        };

        movePlayer();
    }

    reachSwamp() {
        // Camera transition to swamp
        const swampCameraPos = new THREE.Vector3(0, 4, this.swampPosition + 8);
        const swampLookAt = new THREE.Vector3(0, 0, this.swampPosition);

        this.engine.transitionCamera(swampCameraPos, swampLookAt, 2, () => {
            this.sinkIntoSwamp();
        });
    }

    sinkIntoSwamp() {
        if (this.negligenceScore > 30) {
            // Full sink
            this.ui.showMessage('غفلت، تو را فرو می‌برد...', 2000);

            this.playerSinking = true;
            this.sinkingSpeed = 0.02;

            setTimeout(() => {
                this.showBadEnding();
            }, 4000);
        } else {
            // Partial warning
            this.ui.showNarrative(
                'لبه باتلاق ایستادی.<br><br>خوشبختانه چند بار درست انتخاب کردی.<br>اما می‌توانستی بهتر باشی.',
                6000
            );

            setTimeout(() => {
                this.ui.fadeToBlack(3);
            }, 7000);
        }
    }

    showBadEnding() {
        this.ui.fadeToBlack(2, () => {
            // Very dark scene
            this.engine.scene.background = new THREE.Color(0x000000);
            this.engine.scene.fog = new THREE.Fog(0x000000, 1, 5);

            setTimeout(() => {
                this.ui.fadeFromBlack(1);
                this.ui.showNarrative(
                    'این خواب سنگین،<br>به بیداری تلخی ختم می‌شود.<br><br>غفلت، گنج خودشناسی را از تو دزدید.',
                    8000
                );
            }, 500);
        });
    }

    update(delta) {
        // Animate attractions
        if (this.attractions) {
            this.attractions.forEach(attraction => {
                // Rotate signs
                attraction.sign.rotation.y += delta;

                // Pulsing lights
                const pulse = Math.sin(Date.now() * 0.003 + attraction.index) * 0.5 + 0.5;
                attraction.light.intensity = 1.5 + pulse;
            });
        }

        // Sink player if needed
        if (this.playerSinking) {
            this.player.position.y -= this.sinkingSpeed;
            this.player.rotation.x += delta * 0.5;

            if (this.player.position.y < -2) {
                this.playerSinking = false;
            }
        }

        // Animate swamp particles
        if (this.swampParticles) {
            const positions = this.swampParticles.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.01;
            }
            this.swampParticles.geometry.attributes.position.needsUpdate = true;
        }

        // Ground instability effect
        if (this.groundStability < 1.0 && this.ground) {
            this.ground.rotation.z = Math.sin(Date.now() * 0.001) * (1 - this.groundStability) * 0.1;
        }
    }

    dispose() {
        this.attractions = [];
        this.playerSinking = false;
    }
}
