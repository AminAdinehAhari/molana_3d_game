export class GameState {
    constructor() {
        this.gender = null;
        this.currentScene = 'start';
        this.chosenPath = null;
        this.choices = [];
        this.puzzlesSolved = 0;
        this.imitationScore = 0; // Higher = more imitation
        this.awarenessScore = 0; // Higher = more awareness
    }

    setGender(gender) {
        this.gender = gender;
    }

    setScene(sceneName) {
        this.currentScene = sceneName;
    }

    setPath(pathName) {
        this.chosenPath = pathName;
    }

    addChoice(choice) {
        this.choices.push({
            scene: this.currentScene,
            choice: choice,
            timestamp: Date.now()
        });
    }

    incrementPuzzlesSolved() {
        this.puzzlesSolved++;
    }

    addImitationScore(points) {
        this.imitationScore += points;
    }

    addAwarenessScore(points) {
        this.awarenessScore += points;
    }

    getState() {
        return {
            gender: this.gender,
            currentScene: this.currentScene,
            chosenPath: this.chosenPath,
            choices: this.choices,
            puzzlesSolved: this.puzzlesSolved,
            imitationScore: this.imitationScore,
            awarenessScore: this.awarenessScore
        };
    }
}
