import { Game as MainGame } from './scenes/Game';
import { AUTO, Scale, Game } from 'phaser';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const seed = 212//Math.floor(Math.random()*1000)
console.log(seed)
const config = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Scale.NONE,
        autoCenter: Scale.CENTER_BOTH
    },
    seed: [`${seed}`],
    pixelArt: true,
    roundPixels: true,
    scene: [
        MainGame
    ]
};

const StartGame = (parent) => {
    return new Game({ ...config, parent });
}

export default StartGame;
