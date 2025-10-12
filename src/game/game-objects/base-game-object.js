import Phaser from 'phaser';

export class BaseGameObject extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);
    this.scene = scene;
    this.components = [];

    this.once('addedtoscene', function () {
      for (const comp of this.components) {
        if (typeof comp.init === 'function') {
          comp.init();
        }
      }
    });
  }
  addComponent(ComponentClass, ...args) {
    const comp = new ComponentClass(this, ...args);
    this.components.push(comp);
  }
}