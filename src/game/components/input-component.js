import Phaser from 'phaser';
import { BaseComponent } from './base-component';

export class InputComponent extends BaseComponent {
  constructor(gameObject, playerInputConfig = {
    isEnabled: true, isHoverable: false, isDraggable: false, isClickable: false, isDropZone: false
  }) {
    super(gameObject);
    this.isEnabled = playerInputConfig.isEnabled;
    this.isHoverable = playerInputConfig.isHoverable;
    this.isDraggable = playerInputConfig.isDraggable;
    this.isClickable = playerInputConfig.isClickable;
    this.isDropZone = playerInputConfig.isDropZone;
    this.setInteractiveZone()
  }
  
  setInteractiveZone() {
    const gameObject = this.gameObject;

    gameObject.setInteractive({
      draggable: this.isDraggable,
      dropZone: this.isDropZone,
      hitArea: new Phaser.Geom.Rectangle(
        0, 0,
        gameObject.displayWidth, gameObject.displayHeight),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains
    });

    if (this.isDraggable) { this.setDraggable() }
    
    this.gameObject.scene.events.on('player-input', this.onPlayerInput, this.gameObject)
  }

  setDraggable() {
    const gameObject = this.gameObject;
    const x = gameObject.x;
    const y = gameObject.y;

    this.isBeingDragged = false;
    this.dragStartX = x;
    this.dragStartY = y;
    this.dragMoveX = x;
    this.dragMoveY = y;
    this.dragTargetX = x;
    this.dragTargetY = y;
  }

  onPlayerInput(type,eventObject) {
    if (eventObject.gameObject !== this) return;
    if (!eventObject.gameObject.board.acceptPlayerInput) return;
    switch (type) {
      case 'gameObjectOver': 
        this?.onObjectOver?.(eventObject);
        break;
      case 'gameObjectMove': 
        this?.onObjectMove?.(eventObject);
        break;
      case 'gameObjectDown': 
        this?.onObjectDown?.(eventObject);
        break;
      case 'gameObjectUp': 
        this?.onObjectUp?.(eventObject);
        break;
      case 'gameObjectOut': 
        this?.onObjectOut?.(eventObject);
        break;
    }
  }
}