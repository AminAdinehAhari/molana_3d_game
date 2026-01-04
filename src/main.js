import * as THREE from 'three';
import { GameEngine } from './core/GameEngine.js';
import { SceneManager } from './core/SceneManager.js';
import { UIManager } from './ui/UIManager.js';
import { GameState } from './core/GameState.js';

// Initialize game
let gameEngine, sceneManager, uiManager, gameState;

window.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    // Initialize game state
    gameState = new GameState();

    // Initialize UI Manager
    uiManager = new UIManager(gameState);

    // Initialize game engine
    gameEngine = new GameEngine(gameState, uiManager);

    // Initialize scene manager
    sceneManager = new SceneManager(gameEngine, gameState, uiManager);

    // Set up gender selection
    setupGenderSelection();

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1000);
}

function setupGenderSelection() {
    const boyBtn = document.getElementById('btn-boy');
    const girlBtn = document.getElementById('btn-girl');
    const genderSelect = document.getElementById('gender-select');

    boyBtn.addEventListener('click', () => {
        gameState.setGender('boy');
        genderSelect.classList.remove('visible');
        setTimeout(() => {
            sceneManager.startGame();
        }, 500);
    });

    girlBtn.addEventListener('click', () => {
        gameState.setGender('girl');
        genderSelect.classList.remove('visible');
        setTimeout(() => {
            sceneManager.startGame();
        }, 500);
    });

    // Show gender selection after loading
    setTimeout(() => {
        genderSelect.classList.add('visible');
    }, 1500);
}
