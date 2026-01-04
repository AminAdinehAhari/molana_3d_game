export class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.narrativeText = document.getElementById('narrative-text');
        this.choiceContainer = document.getElementById('choice-container');
        this.pathIndicator = document.getElementById('path-indicator');
        this.puzzleOverlay = document.getElementById('puzzle-overlay');
        this.fadeOverlay = document.getElementById('fade-overlay');
        this.instructions = document.getElementById('instructions');
    }

    showNarrative(text, duration = 0, callback = null) {
        this.narrativeText.innerHTML = text;
        this.narrativeText.classList.add('visible');

        if (duration > 0) {
            setTimeout(() => {
                this.hideNarrative();
                if (callback) callback();
            }, duration);
        }
    }

    hideNarrative() {
        this.narrativeText.classList.remove('visible');
    }

    showChoices(choices, onChoice) {
        this.choiceContainer.innerHTML = '';

        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = choice.text;
            button.addEventListener('click', () => {
                this.hideChoices();
                onChoice(choice.value, index);
            });
            this.choiceContainer.appendChild(button);
        });

        this.choiceContainer.classList.add('visible');
    }

    hideChoices() {
        this.choiceContainer.classList.remove('visible');
    }

    showPathIndicator(pathName) {
        this.pathIndicator.textContent = pathName;
        this.pathIndicator.classList.add('visible');
    }

    hidePathIndicator() {
        this.pathIndicator.classList.remove('visible');
    }

    showPuzzle(verse, options, onAnswer) {
        const puzzleHTML = `
            <div class="puzzle-verse">${verse}</div>
            <div class="puzzle-options">
                ${options.map((opt, i) => `
                    <button class="choice-button" data-index="${i}">${opt.text}</button>
                `).join('')}
            </div>
        `;

        this.puzzleOverlay.innerHTML = puzzleHTML;
        this.puzzleOverlay.classList.add('visible');

        // Add event listeners
        const buttons = this.puzzleOverlay.querySelectorAll('.choice-button');
        buttons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.hidePuzzle();
                onAnswer(options[index].correct, index);
            });
        });
    }

    hidePuzzle() {
        this.puzzleOverlay.classList.remove('visible');
    }

    fadeToBlack(duration = 2, callback = null) {
        this.fadeOverlay.classList.add('active');

        setTimeout(() => {
            if (callback) callback();
        }, duration * 1000);
    }

    fadeFromBlack(duration = 2) {
        setTimeout(() => {
            this.fadeOverlay.classList.remove('active');
        }, 100);
    }

    showInstructions(text) {
        this.instructions.textContent = text;
        this.instructions.style.opacity = '0.7';
    }

    hideInstructions() {
        this.instructions.style.opacity = '0';
    }

    showMessage(text, duration = 3000) {
        this.showNarrative(text);
        setTimeout(() => {
            this.hideNarrative();
        }, duration);
    }
}
