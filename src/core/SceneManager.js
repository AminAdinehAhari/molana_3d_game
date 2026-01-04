import { StartScene } from '../scenes/StartScene.js';
import { Path1Scene } from '../scenes/Path1Scene.js';
import { Path2Scene } from '../scenes/Path2Scene.js';
import { Path3Scene } from '../scenes/Path3Scene.js';

export class SceneManager {
    constructor(gameEngine, gameState, uiManager) {
        this.gameEngine = gameEngine;
        this.gameState = gameState;
        this.uiManager = uiManager;

        this.currentSceneInstance = null;
        this.scenes = {
            start: StartScene,
            path1: Path1Scene,
            path2: Path2Scene,
            path3: Path3Scene
        };
    }

    startGame() {
        this.loadScene('start');
    }

    loadScene(sceneName) {
        // Clean up current scene
        if (this.currentSceneInstance && this.currentSceneInstance.dispose) {
            this.currentSceneInstance.dispose();
        }

        // Clear the engine scene
        this.gameEngine.clearScene();

        // Update game state
        this.gameState.setScene(sceneName);

        // Create and initialize new scene
        const SceneClass = this.scenes[sceneName];
        if (SceneClass) {
            this.currentSceneInstance = new SceneClass(
                this.gameEngine,
                this.gameState,
                this.uiManager,
                this
            );
            this.currentSceneInstance.init();
        } else {
            console.error(`Scene ${sceneName} not found`);
        }
    }

    transitionToPath(pathNumber) {
        this.uiManager.fadeToBlack(1.5, () => {
            this.loadScene(`path${pathNumber}`);
            this.uiManager.fadeFromBlack(1.5);
        });
    }
}
