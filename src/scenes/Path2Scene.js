import * as THREE from 'three';

export class Path2Scene {
    constructor(gameEngine, gameState, uiManager, sceneManager) {
        this.engine = gameEngine;
        this.state = gameState;
        this.ui = uiManager;
        this.sceneManager = sceneManager;

        this.currentChoice = 0;
        this.choices = this.getChoices();
        this.faceChanges = 0;
    }

    init() {
        this.createEnvironment();
        this.createCity();
        this.createCrowd();
        this.createMirror();
        this.createPlayer();
        this.setupCamera();
        this.setupLighting();
        this.startJourney();

        this.engine.setUpdateFunction((delta) => this.update(delta));
    }

    getChoices() {
        return [
            {
                question: 'در جمع دوستان، نظری خلاف همه داری. چه می‌کنی؟',
                options: [
                    { text: 'نظر خودم را با احترام می‌گویم', value: 'authentic', score: 10 },
                    { text: 'سکوت می‌کنم و موافقت می‌کنم', value: 'imitate', score: -10 }
                ]
            },
            {
                question: 'سبک لباس یک اینفلوئنسر مشهور همه را جذب کرده. تو چه می‌کنی؟',
                options: [
                    { text: 'سبک خودم را حفظ می‌کنم', value: 'authentic', score: 10 },
                    { text: 'دقیقاً مثل او لباس می‌پوشم', value: 'imitate', score: -10 }
                ]
            },
            {
                question: 'همه در شبکه‌های اجتماعی زندگی مجللی نشان می‌دهند. تو چطور؟',
                options: [
                    { text: 'واقعی و صادق هستم', value: 'authentic', score: 10 },
                    { text: 'برای لایک، تصاویر جعلی می‌گذارم', value: 'imitate', score: -10 }
                ]
            },
            {
                question: 'همکلاسی‌هایت از یک رشته تحصیلی خاص تعریف می‌کنند. تو چه انتخاب می‌کنی؟',
                options: [
                    { text: 'به علاقه و استعداد خودم فکر می‌کنم', value: 'authentic', score: 10 },
                    { text: 'همان رشته را انتخاب می‌کنم', value: 'imitate', score: -10 }
                ]
            },
            {
                question: 'در گروه، همه از یک سریال صحبت می‌کنند. تو ندیده‌ای.',
                options: [
                    { text: 'صادقانه می‌گویم ندیده‌ام', value: 'authentic', score: 10 },
                    { text: 'وانمود می‌کنم که دیده‌ام', value: 'imitate', score: -10 }
                ]
            }
        ];
    }

    createEnvironment() {
        // Urban sky
        const skyColor = new THREE.Color(0x87ceeb);
        this.engine.scene.background = skyColor;
        this.engine.scene.fog = new THREE.Fog(0xcccccc, 20, 60);

        // Urban ground
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.7,
            metalness: 0.3
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.engine.scene.add(ground);

        // Add grid pattern
        const gridHelper = new THREE.GridHelper(200, 50, 0x888888, 0x444444);
        gridHelper.position.y = 0.01;
        this.engine.scene.add(gridHelper);
    }

    createCity() {
        // Create buildings
        for (let i = 0; i < 40; i++) {
            const x = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;

            // Keep center clear for path
            if (Math.abs(x) < 8 && z > -40 && z < 10) continue;

            const height = 10 + Math.random() * 30;
            const width = 3 + Math.random() * 5;
            const depth = 3 + Math.random() * 5;

            this.createBuilding(x, z, width, height, depth);
        }

        // Create billboards
        this.createBillboards();
    }

    createBuilding(x, z, width, height, depth) {
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.6, 0.1, Math.random() * 0.3 + 0.4),
            roughness: 0.7,
            metalness: 0.3
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        this.engine.scene.add(building);

        // Add windows
        const windowMaterial = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.3 ? 0xffff00 : 0x000000,
            transparent: true,
            opacity: 0.8
        });

        const windowSize = 0.3;
        const windowsPerFloor = Math.floor(width / 1);
        const floors = Math.floor(height / 2);

        for (let f = 0; f < floors; f++) {
            for (let w = 0; w < windowsPerFloor; w++) {
                const windowGeometry = new THREE.PlaneGeometry(windowSize, windowSize);
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(
                    x - width / 2 + 0.5 + w,
                    1 + f * 2,
                    z + depth / 2 + 0.01
                );
                this.engine.scene.add(window);
            }
        }
    }

    createBillboards() {
        this.billboards = [];

        for (let i = 0; i < 5; i++) {
            const z = -5 - i * 8;
            const side = i % 2 === 0 ? 6 : -6;

            const billboardGeometry = new THREE.PlaneGeometry(4, 3);
            const billboardMaterial = new THREE.MeshBasicMaterial({
                color: 0xff66aa,
                transparent: true,
                opacity: 0.9
            });
            const billboard = new THREE.Mesh(billboardGeometry, billboardMaterial);
            billboard.position.set(side, 3, z);
            billboard.rotation.y = side > 0 ? -Math.PI / 4 : Math.PI / 4;
            this.engine.scene.add(billboard);

            this.billboards.push(billboard);
        }
    }

    createCrowd() {
        this.npcs = [];

        // Create NPCs walking around
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 15;
            const z = (Math.random() - 0.5) * 40;

            const npc = this.createNPC(x, z);
            this.npcs.push(npc);
        }
    }

    createNPC(x, z) {
        const npcGroup = new THREE.Group();

        // Body
        const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5),
            roughness: 0.7
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        npcGroup.add(body);

        // Head (simple sphere)
        const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffdbac,
            roughness: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;
        npcGroup.add(head);

        npcGroup.position.set(x, 0, z);
        npcGroup.castShadow = true;

        this.engine.scene.add(npcGroup);

        return {
            group: npcGroup,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                0,
                (Math.random() - 0.5) * 0.5
            ),
            originalX: x,
            originalZ: z
        };
    }

    createMirror() {
        const mirrorZ = -45;

        // Mirror frame
        const frameGeometry = new THREE.BoxGeometry(5, 7, 0.3);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.3,
            metalness: 0.7
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, 3.5, mirrorZ);
        this.engine.scene.add(frame);

        // Mirror surface (reflective-looking)
        const mirrorGeometry = new THREE.PlaneGeometry(4, 6);
        const mirrorMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            roughness: 0.1,
            metalness: 0.9,
            emissive: 0x222222,
            emissiveIntensity: 0.3
        });
        this.mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        this.mirror.position.set(0, 3.5, mirrorZ + 0.2);
        this.engine.scene.add(this.mirror);

        this.mirrorPosition = mirrorZ;
    }

    createPlayer() {
        // Player representation
        const playerGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
        const playerMaterial = new THREE.MeshStandardMaterial({
            color: this.state.gender === 'boy' ? 0x4488ff : 0xff88cc,
            roughness: 0.7
        });
        this.player = new THREE.Mesh(playerGeometry, playerMaterial);
        this.player.position.set(0, 1.2, 0);
        this.player.castShadow = true;
        this.engine.scene.add(this.player);

        // Player head (for face changes)
        const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        this.originalFaceColor = this.state.gender === 'boy' ? 0xffdbac : 0xffc9a8;
        const headMaterial = new THREE.MeshStandardMaterial({
            color: this.originalFaceColor,
            roughness: 0.8
        });
        this.playerHead = new THREE.Mesh(headGeometry, headMaterial);
        this.playerHead.position.set(0, 2.2, 0);
        this.engine.scene.add(this.playerHead);
    }

    setupCamera() {
        this.engine.camera.position.set(0, 2, 8);
        this.engine.camera.lookAt(0, 2, 0);
    }

    setupLighting() {
        // Bright artificial lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.engine.scene.add(ambient);

        // Main light
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(10, 30, 10);
        mainLight.castShadow = true;
        this.engine.scene.add(mainLight);

        // Street lights
        for (let i = 0; i < 10; i++) {
            const z = i * -5;
            const streetLight = new THREE.PointLight(0xffaa00, 0.5, 15);
            streetLight.position.set(5, 4, z);
            this.engine.scene.add(streetLight);

            const streetLight2 = new THREE.PointLight(0xffaa00, 0.5, 15);
            streetLight2.position.set(-5, 4, z);
            this.engine.scene.add(streetLight2);
        }
    }

    startJourney() {
        this.ui.showPathIndicator('مسیر تقلید');

        setTimeout(() => {
            this.ui.showNarrative(
                'جاده پهن و راحت است.<br>اما آیا خودت را حفظ می‌کنی؟',
                4000,
                () => {
                    this.showNextChoice();
                }
            );
        }, 1000);
    }

    showNextChoice() {
        if (this.currentChoice >= this.choices.length) {
            this.reachMirror();
            return;
        }

        const choice = this.choices[this.currentChoice];

        this.ui.showNarrative(choice.question, 2000, () => {
            this.ui.showChoices(
                choice.options.map(opt => ({ text: opt.text, value: opt })),
                (chosenOption) => {
                    this.handleChoice(chosenOption);
                }
            );
        });
    }

    handleChoice(chosenOption) {
        this.state.addChoice(chosenOption.value);

        if (chosenOption.value === 'imitate') {
            this.state.addImitationScore(10);
            this.changeFace();
            this.ui.showMessage('چیزی از تو کم شد...', 2000);
        } else {
            this.state.addAwarenessScore(5);
            this.ui.showMessage('خودت را حفظ کردی!', 2000);
        }

        // Move player forward
        this.movePlayerForward();

        setTimeout(() => {
            this.currentChoice++;
            this.showNextChoice();
        }, 2500);
    }

    changeFace() {
        this.faceChanges++;

        // Change face color to gray (losing identity)
        const grayness = this.faceChanges / this.choices.length;
        const newColor = new THREE.Color(this.originalFaceColor).lerp(
            new THREE.Color(0x888888),
            grayness
        );
        this.playerHead.material.color = newColor;
    }

    movePlayerForward() {
        const targetZ = -8 - this.currentChoice * 7;

        const movePlayer = () => {
            this.player.position.z -= 0.1;
            this.playerHead.position.z -= 0.1;
            this.engine.camera.position.z -= 0.1;

            if (this.player.position.z > targetZ) {
                requestAnimationFrame(movePlayer);
            }
        };

        movePlayer();
    }

    reachMirror() {
        // Move to mirror
        const mirrorCameraPos = new THREE.Vector3(0, 2, this.mirrorPosition + 5);
        const mirrorLookAt = new THREE.Vector3(0, 3, this.mirrorPosition);

        this.engine.transitionCamera(mirrorCameraPos, mirrorLookAt, 2, () => {
            this.showMirrorEnding();
        });
    }

    showMirrorEnding() {
        const imitationRatio = this.faceChanges / this.choices.length;

        if (imitationRatio > 0.6) {
            // Bad ending
            this.ui.showNarrative(
                'در آینه، چهره‌های دیگران را می‌بینی.<br><br>تقلید، هویت واقعی تو را نابود کرد.',
                6000
            );
        } else {
            // Medium ending
            this.ui.showNarrative(
                'چهره‌ات هنوز شناخته می‌شود.<br><br>روح تو متعلق به مسیر آگاهی است.<br>می‌توانستی بهتر انتخاب کنی.',
                6000
            );
        }

        // Fade to black
        setTimeout(() => {
            this.ui.fadeToBlack(3);
        }, 7000);
    }

    update(delta) {
        // Animate NPCs
        if (this.npcs) {
            this.npcs.forEach(npc => {
                npc.group.position.add(npc.velocity.clone().multiplyScalar(delta));

                // Boundary check
                if (Math.abs(npc.group.position.x - npc.originalX) > 10) {
                    npc.velocity.x *= -1;
                }
                if (Math.abs(npc.group.position.z - npc.originalZ) > 20) {
                    npc.velocity.z *= -1;
                }

                // Rotate to face movement direction
                if (npc.velocity.length() > 0) {
                    const angle = Math.atan2(npc.velocity.x, npc.velocity.z);
                    npc.group.rotation.y = angle;
                }
            });
        }

        // Animate billboards
        if (this.billboards) {
            this.billboards.forEach((billboard, index) => {
                const pulse = Math.sin(Date.now() * 0.003 + index) * 0.5 + 0.5;
                billboard.material.opacity = 0.7 + pulse * 0.3;
            });
        }
    }

    dispose() {
        this.npcs = [];
        this.billboards = [];
    }
}
