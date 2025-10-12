import Phaser from 'phaser';
import { BaseGameObject } from './base-game-object';

export class BaseTile extends BaseGameObject {
  constructor(scene, board, boardX = null, boardY = null) {
    super(scene);
    this.board = board;
    this.boardX = boardX;
    this.boardY = boardY;
    this.type = 'tile';
    this.isInteractable = false;
  }
}