export class BaseComponent {
  constructor(gameObject) {
    this.gameObject = gameObject;
    this.scene = gameObject.scene;
    this.attach();
  }

  attach() {
    const propName = `_${this.constructor.name}`;
    let prop = this.gameObject[propName];
    if (prop) {
      console.log(this.gameObject, "already has", propName)
    }
    this.gameObject[propName] = this;
  }

  static getComp(gameObject) {
    if (!gameObject) return null;
    return gameObject[`_${this.name}`] || null;
  }

  static removeComp(gameObject) {
    if (!gameObject) return;
    delete gameObject[`_${this.name}`];
  }

  init() { }
  destroy() { }
}