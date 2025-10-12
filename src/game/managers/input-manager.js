export class InputManager {
    static _instance = null
    static getInstance(scene) {
        if (InputManager._instance == null) {
            InputManager._instance = new InputManager(scene);
        }
        return InputManager._instance;
    }
    constructor(scene) {
        this.scene = scene;
        this.inputEnabled = true;
        this.isDragging = false;
        this.draggedObject = null;
        this.gameobjectDownOn = null;
        this.gameEventType = 'player-input';

        const inputEvents = [
            { phaserEvent: 'gameout', type: 'gameOut', eventArgumentsNames: ['time', 'event'] },
            { phaserEvent: 'gameover', type: 'gameOver', eventArgumentsNames: ['time', 'event'] },

            { phaserEvent: 'pointerdown', type: 'pointerDown', eventArgumentsNames: ['pointer', 'currentlyOver'] },
            { phaserEvent: 'pointerdownoutside', type: 'pointerDownOutside', eventArgumentsNames: ['pointer'] },
            { phaserEvent: 'pointermove', type: 'pointerMove', eventArgumentsNames: ['pointer', 'currentlyOver'] },
            { phaserEvent: 'pointerup', type: 'pointerUp', eventArgumentsNames: ['pointer', 'currentlyOver'] },
            { phaserEvent: 'pointerupoutside', type: 'pointerUpOutside', eventArgumentsNames: ['pointer'] },

            { phaserEvent: 'gameobjectover', type: 'gameObjectOver', eventArgumentsNames: ['pointer', 'gameObject', 'event'] },
            { phaserEvent: 'gameobjectmove', type: 'gameObjectMove', eventArgumentsNames: ['pointer', 'gameObject', 'event'] },
            { phaserEvent: 'gameobjectdown', type: 'gameObjectDown', eventArgumentsNames: ['pointer', 'gameObject', 'event'] },
            { phaserEvent: 'gameobjectup', type: 'gameObjectUp', eventArgumentsNames: ['pointer', 'gameObject', 'event'] },
            { phaserEvent: 'gameobjectout', type: 'gameObjectOut', eventArgumentsNames: ['pointer', 'gameObject', 'event'] },

            { phaserEvent: 'dragstart', type: 'dragStart', eventArgumentsNames: ['pointer', 'gameObject'] },
            { phaserEvent: 'drag', type: 'drag', eventArgumentsNames: ['pointer', 'gameObject', 'dragX', 'dragY'] },
            { phaserEvent: 'dragenter', type: 'dragEnter', eventArgumentsNames: ['pointer', 'gameObject', 'target'] },
            { phaserEvent: 'dragleave', type: 'dragLeave', eventArgumentsNames: ['pointer', 'gameObject', 'target'] },
            { phaserEvent: 'dragover', type: 'dragOver', eventArgumentsNames: ['pointer', 'gameObject', 'target'] },
            { phaserEvent: 'drop', type: 'drop', eventArgumentsNames: ['pointer', 'gameObject', 'target'] },
            { phaserEvent: 'dragend', type: 'dragEnd', eventArgumentsNames: ['pointer', 'gameObject', 'dropped'] },
        ]
        this.applyListeners(inputEvents)
    }
    applyListeners(inputEvents) {
        inputEvents.forEach(event => {
            const { phaserEvent, type, eventArgumentsNames } = event;
            this.scene.input.on(phaserEvent, (...args) => { this.emitEventToScene(type, eventArgumentsNames, args) }, this);
        });

    }
    emitEventToScene(type, eventArgumentNames, args) {
        if (!this.inputEnabled) return;
        let eventObject = {};
        for (let i = 0; i < eventArgumentNames.length && i < args.length; i++) {
            eventObject[eventArgumentNames[i]] = args[i]
        }
        this.scene.events.emit(this.gameEventType, type, eventObject)
    }
}