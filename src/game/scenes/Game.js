import { Scene } from 'phaser';
import { InputManager } from '../managers/input-manager';
import { BoardGameObject } from '../game-objects/board-game-object';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    preload() {
        this.load.setPath("assets/fonts/")
        this.load.font('pixellari', "Pixellari.ttf")
        this.load.setPath("assets/fruit_sprites/")
        this.load.image('banana', "yellow bananas.png")
        this.load.image('blueberries', "blueberry.png")
        this.load.image('cherry', "red cherry.png")
        this.load.image('grapes', "purple grapes.png")
        this.load.image('green-apple', "green apple.png")
        this.load.image('pineapple', "orange pineapple.png")
    }

    create() {
        this.inputManager = InputManager.getInstance(this);

        this.board = new BoardGameObject(this, 8 + 2, 6 + 2).setPosition(this.cameras.default.centerX, this.cameras.default.centerY)
        this.add.existing(this.board)
        this.events.on('board-action', (type, eventObject) => {
            switch (type) {
                case 'tile-interacted': break;
                case 'tile-selected': break;
                case 'tile-deselected': break;
                case 'attempt-move': break;
                case 'log': {
                    console.log(...eventObject)
                    break;
                }
            }
        });
        const logging = false;
        this.events.on('log', (type, func, message) => {
            if (logging === true) {
                switch (type) {
                    case 'checkForCombos': {
                        console[func](message)
                        break;
                    }
                    case 'destroyComboTiles': break;
                    case 'tile-deselected': break;
                    case 'attempt-move': break;
                    case 'log': {
                        console.log(message)
                        break;
                    }
                }
            }
        });
    }
}

// 	static returnRandomID() {
//     let c = Math.floor(Math.random() * Square.theme.length);
//     return c;
// }