import Phaser from 'phaser';
import { BaseTile } from './base-tile';
import { InputComponent } from '../components/input-component';
import { STYLE_COLORS, STYLE_TILE_RECT } from '../consts';

const FRUIT_TYPES = {
  CHERRY: { name: '🔴', spriteKey: 'cherry', color: STYLE_COLORS.CHERRY, },
  PINEAPPLE: { name: '🟠', spriteKey: 'pineapple', color: STYLE_COLORS.PINEAPPLE },
  BANANA: { name: '🟡', spriteKey: 'banana', color: STYLE_COLORS.BANANA },
  GREEN_APPLE: { name: '🟢', spriteKey: 'green-apple', color: STYLE_COLORS.GREEN_APPLE },
  BLUEBERRIES: { name: '🔵', spriteKey: 'blueberries', color: STYLE_COLORS.BLUEBERRIES },
  GRAPES: { name: '🟣', spriteKey: 'grapes', color: STYLE_COLORS.GRAPES },
}
const fruitTypesArr = [FRUIT_TYPES.CHERRY, FRUIT_TYPES.PINEAPPLE, FRUIT_TYPES.BANANA, FRUIT_TYPES.GREEN_APPLE, FRUIT_TYPES.BLUEBERRIES, FRUIT_TYPES.GRAPES];

export class FruitTile extends BaseTile {
  constructor(scene, board, boardX = null, boardY = null) {
    super(scene, board, boardX, boardY);
    this.type = 'fruit-tile'
    this.tileType = this.getRandomizedFruitType();
    this.name = this.tileType.name;
    this.isSelected = false;
    this.createTileBody();

    const inputConfig = { isEnabled: true, isHoverable: false, isDraggable: false, isClickable: false, isDropZone: false }
    this.addComponent(InputComponent, inputConfig)

    this.scene.events.on('board-action', this.onBoardAction, this)
  }
  getRandomizedFruitType() {
    const rndNum = Math.floor(Phaser.Math.RND.between(0, fruitTypesArr.length-1))
    return fruitTypesArr[rndNum]
  }
  createTileBody() {
    const { BASE_WIDTH, BASE_HEIGHT, WIDTH_SCALE, HEIGHT_SCALE, STROKE_WIDTH, RADIUS, STROKE_COLOR_IDLE } = STYLE_TILE_RECT
    const tileWidth = BASE_WIDTH * WIDTH_SCALE;
    const tileHeight = BASE_HEIGHT * HEIGHT_SCALE;

    const fruitType = this.tileType;
    this.face = new Phaser.GameObjects.Rectangle(
      this.scene,
      0, 0,
      tileWidth, tileHeight,
      fruitType.color.primary
    ).setStrokeStyle(STROKE_WIDTH, STROKE_COLOR_IDLE);
    this.sprite = new Phaser.GameObjects.Image(
      this.scene,
      0, 0,
      fruitType.spriteKey
    ).setScale(WIDTH_SCALE, HEIGHT_SCALE);


    this.add([this.face, this.sprite])
    this.width = tileWidth
    this.height = tileHeight

  }
  onBoardAction(type, eventObject) {
    if (eventObject.tile !== this) return;
    switch (type) {
      case 'tile-selected':
        this?.onTileSelected?.();
        break;
      case 'tile-deselected':
        this?.onTileDeselected?.();
        break;
    }
  }
  onObjectOver() {
    const { STROKE_WIDTH, STROKE_COLOR_HOVER } = STYLE_TILE_RECT
    const strokeColorHover = this.tileType.color.lighter
    this.face.setStrokeStyle(STROKE_WIDTH, strokeColorHover)
  }
  onObjectMove() {
  }
  onObjectDown() {
    const { STROKE_WIDTH, STROKE_COLOR_SELECTED } = STYLE_TILE_RECT
    const strokeColorHover = this.tileType.color.darker
    this.face.setStrokeStyle(STROKE_WIDTH, strokeColorHover)
  }
  onObjectUp(eventObject) {
    this.interact(eventObject)
    this.onObjectOver()
  }
  interact(eventObject) {
    this.scene.events.emit('board-action', 'tile-interacted', eventObject)
  }
  onObjectOut() {
    this.getIdleColor();
  }
  onTileSelected() {
    this.isSelected = true;
    this.getIdleColor();
  }
  onTileDeselected() {
    this.isSelected = false;
    this.getIdleColor();
  }
  getIdleColor() {
    const { STROKE_WIDTH, STROKE_COLOR_IDLE, STROKE_COLOR_SELECTED } = STYLE_TILE_RECT
    const strokeColorHover = STROKE_COLOR_SELECTED
    const color = (this.isSelected) ? strokeColorHover : STROKE_COLOR_IDLE
    this.face.setStrokeStyle(STROKE_WIDTH, color)
  }
}