import Phaser from 'phaser';
import { BaseGameObject } from './base-game-object';
import { FruitTile } from './fruit-tile';
import { STYLE_BOARD_RECT, STYLE_TILE_RECT, TIME_CONSTS } from '../consts';

export class BoardGameObject extends BaseGameObject {
    constructor(scene, cellColumns, cellRows) {
        super(scene);
        const { TILE_GAP: tileGap, EMITTER_CONFIG: emitterConfig } = STYLE_BOARD_RECT
        const { BASE_WIDTH: baseWidth, BASE_HEIGHT: baseHeight, WIDTH_SCALE: widthScale, HEIGHT_SCALE: heightScale } = STYLE_TILE_RECT
        this.cellColumns = cellColumns
        this.cellRows = cellRows
        this.type = 'board'

        this.board = new Array(this.cellColumns)
        this.cellSize = { width: baseWidth * widthScale, height: baseHeight * heightScale }
        this.gravityQueue = [];

        this.height = this.cellRows * this.cellSize.height + (this.cellRows - 1) * tileGap
        this.width = this.cellColumns * this.cellSize.width + (this.cellColumns - 1) * tileGap
        this.firstSelectedTile = null;
        this.secondSelectedTile = null;

        this.emitter = this.scene.add.particles(0, 0, null, emitterConfig)
        this.add(this.emitter)
        this.buildBoard();
        this.populateBoard();
        this.acceptPlayerInput = false;
        this.scene.events.on('board-action', this.onBoardAction, this)
    }
    enablePlayerInput() {
        this.acceptPlayerInput = true;
    }
    disablePlayerInput() {
        this.acceptPlayerInput = false;
    }
    onBoardAction(type, eventObject) {
        switch (type) {
            case 'tile-interacted':
                this?.onTileInteracted?.(eventObject);
                break;
            case 'tile-selected':
                this?.onTileSelected?.(eventObject);
                break;
            case 'tile-deselected':
                this?.onTileDeselected?.(eventObject);
                break;
            case 'attempt-move':
                this?.onAttemptMove?.(eventObject);
        }
    }
    buildBoard() {
        for (let column = 0; column < this.cellColumns; column++) {
            this.board[column] = new Array(this.cellRows)
            for (let row = 0; row < this.cellRows; row++) {
                this.board[column][row] = null;
            }
        }
    }
    populateBoard() {
        const appendedTiles = [];
        for (let row = this.cellRows - 1; row >= 0; row--) {
            for (let column = this.cellColumns - 1; column >= 0; column--) {
                const effectiveRow = row;
                const effectiveColumn = (effectiveRow % 2 === 0) ? column : this.cellColumns - column - 1
                if (this.board[effectiveColumn][effectiveRow] === null) {
                    const fruit = new FruitTile(this.scene, this, effectiveColumn, effectiveRow)
                    this.board[effectiveColumn][effectiveRow] = fruit;
                    this.add(fruit)
                    appendedTiles.push(fruit)
                }
            }
        }
        this.appendNewTiles(appendedTiles)
    }
    appendNewTiles(appendedTiles) {
        const { TILE_DROP: tileDropTweenConfigDefaults } = TIME_CONSTS
        const upperBound = -this.scene.cameras.main.displayHeight;
        appendedTiles.forEach((tile) => { tile.setY(upperBound); })
        this.gravityQueue.push(...appendedTiles);

        this.tweenTilesDrop()
    }
    getCell(column, row) {
        return ((
            x >= 0 &&
            y >= 0 &&
            x < this.cellColumns &&
            y < this.cellColumns) ?
            this.board[column][row]
            : undefined
        )
    }
    getCellPosition(xIndex, yIndex) {
        const x = this.getCellPositionX(xIndex);
        const y = this.getCellPositionX(yIndex);
        return (x && y) ? [x, y] : undefined
    }
    getCellPositionX(xIndex) {
        const { TILE_GAP: tileGap } = STYLE_BOARD_RECT
        const cellAndGapWidth = (this.cellSize.width + tileGap);
        const halfWidth = (this.width - this.cellSize.width) / 2
        return ((
            xIndex >= 0 &&
            xIndex < this.cellColumns) ?
            ((xIndex) * cellAndGapWidth) - halfWidth
            : undefined
        )
    }
    getCellPositionY(yIndex) {
        const { TILE_GAP: tileGap } = STYLE_BOARD_RECT
        const cellAndGapWidth = (this.cellSize.height + tileGap);
        const halfHeight = (this.height - this.cellSize.height) / 2
        return ((
            yIndex >= 0 &&
            yIndex < this.cellRows) ?
            ((yIndex) * cellAndGapWidth) - halfHeight
            : undefined
        )
    }
    onTileInteracted(eventObject) {
        const { gameObject: tile } = eventObject;
        const eventPayload = { tile, board: this }
        const eventType = (tile.isSelected == false) ? 'tile-selected' : 'tile-deselected'
        this.scene.events.emit('board-action', eventType, eventPayload);
    }
    onTileSelected(eventPayload) {
        const { tile } = eventPayload;

        if (this.firstSelectedTile == null) {
            this.firstSelectedTile = tile;
            return;
        } else {
            this.secondSelectedTile = tile;
            const attemptedMovePayload = { firstTile: this.firstSelectedTile, secondTile: this.secondSelectedTile, board: this.board };
            this.disablePlayerInput();
            this.scene.events.emit('board-action', 'attempt-move', attemptedMovePayload)
        }

    }
    onAttemptMove(attemptedMovePayload) {
        //RULES
        const { firstTile, secondTile } = attemptedMovePayload
        const isValidMove = this.checkMoveValidity(attemptedMovePayload);

        if (isValidMove) {
            this.onValidMove({ firstTile, secondTile })
        } else {
            this.onInvalidMove({ firstTile, secondTile })
        }

    }
    checkMoveValidity(attemptedMovePayload){
        const {firstTile,secondTile} = attemptedMovePayload
        const { boardX: firstBoardX, boardY: firstBoardY } = firstTile;
        const { boardX: secondBoardX, boardY: secondBoardY } = secondTile;

        return (this.checkTilesProximity(attemptedMovePayload) && this.checkSwappedTilesForCombos(attemptedMovePayload)) 
    }
    checkSwappedTilesForCombos(attemptedMovePayload){
        const {firstTile,secondTile} = attemptedMovePayload
        const { boardX: firstBoardX, boardY: firstBoardY } = firstTile;
        const { boardX: secondBoardX, boardY: secondBoardY } = secondTile;
        this.board[firstBoardX][firstBoardY] = secondTile;
        this.board[secondBoardX][secondBoardY] = firstTile;
        const combos = this.checkForCombos();
        this.board[firstBoardX][firstBoardY] = firstTile;
        this.board[secondBoardX][secondBoardY] = secondTile;
        return (combos.length > 0)
    }
    checkTilesProximity(attemptedMovePayload) {
        const { boardX: firstBoardX, boardY: firstBoardY } = attemptedMovePayload.firstTile;
        const { boardX: secondBoardX, boardY: secondBoardY } = attemptedMovePayload.secondTile;

        const isOnSamecolumn = (firstBoardX === secondBoardX);
        const isOnSameRow = (firstBoardY === secondBoardY);
        const isOneToTheLeft = (firstBoardY === secondBoardY - 1)
        const isOneToTheRight = (firstBoardY === secondBoardY + 1)
        const isOneUpwards = (firstBoardX === secondBoardX - 1)
        const isOneDownwards = (firstBoardX === secondBoardX + 1)

        const conditionA = (isOnSamecolumn && (isOneToTheLeft || isOneToTheRight));
        const conditionB = (isOnSameRow && (isOneUpwards || isOneDownwards))

        if (conditionA != conditionB) {
            return true
        } else
            return false
    }

    log(...args) {
        this.scene.events.emit('log', 'checkForCombos', ...args)
    }
    checkForCombos() {
        const combos = [];
        let verticalChecked = new Set();
        let horizontalChecked = new Set();
        
        for (let row = 0; row < this.cellRows; row++) {
            this.log('groupCollapsed', `ROW: ${row}`)
            for (let col = 0; col < this.cellColumns; col++) {
                if (this.board[col][row] == null) { continue; }
                let currentTile = this.board[col][row];
                let currentType = currentTile.tileType;
                this.log('groupCollapsed', `(${col},${row}) is of TYPE:${currentType.name}`)

                // check vertically
                const verticallyCheckedThatTile = verticalChecked.has(currentTile)
                verticalChecked.add(currentTile)

                const comboV = new Set();
                comboV.add(currentTile);
                this.log('groupCollapsed', `CHECKING VERTICALLY? ${!verticallyCheckedThatTile}`)
                for (let y = row + 1; y < this.cellRows; y++) {
                    if (verticallyCheckedThatTile) { break }
                    const tile = this.board[col][y];
                    this.log('group', `(${col},${y}) IS TYPE:${tile.tileType.name}`)

                    if (tile && tile.tileType && tile.tileType === currentType) {
                        this.log('log', `IS MATCHING TYPE ${currentType.name}=${tile.tileType.name}`)
                        this.log('groupEnd');
                        comboV.add(tile);
                    } else {
                        this.log('log', `NOT MATCHING TYPE ${currentType.name}≠${tile.tileType.name}- BREAK SEARCH`)
                        this.log('groupEnd')
                        break;
                    }
                }
                if (comboV.size >= 3) {
                    this.log('log', `COMBO FOUND OF LENGTH ${comboV.length}`);
                    verticalChecked = verticalChecked.union(comboV)
                    combos.push(comboV);
                } else {
                    this.log('log', `NOT A COMBO (LENGTH ${comboV.length})`)
                }
                this.log('groupEnd');

                // check horizontally
                const horizontallyCheckedThatTile = horizontalChecked.has(currentTile)
                horizontalChecked.add(currentTile)
                const comboH = new Set();
                comboH.add(currentTile);
                this.log('groupCollapsed', `CHECKING HORIZONTALLY? ${!horizontallyCheckedThatTile}`)
                for (let x = col + 1; x < this.cellColumns; x++) {
                    if (horizontallyCheckedThatTile) {
                        break;
                    }
                    const tile = this.board[x][row];
                    this.log('group', `CHECKING: (${x},${row}) IS TYPE:${tile.tileType.name}`)

                    if (tile && tile.tileType && tile.tileType === currentType) {
                        this.log('log', `MATCHING TYPE ${currentType.name}===${tile.tileType.name}`)
                        this.log('groupEnd');
                        comboH.add(tile);
                    } else {
                        this.log('log', `NOT MATCHING TYPE - BREAK SEARCH`)
                        this.log('groupEnd')
                        break;
                    }

                }
                if (comboH.size >= 3) {
                    this.log('log', `COMBO FOUND OF LENGTH ${comboH.length}`);
                    horizontalChecked = horizontalChecked.union(comboH)
                    combos.push(comboH);
                } else {
                    this.log('log', `NOT A COMBO (LENGTH ${comboH.length})`)
                }
                this.log('groupEnd'); this.log('groupEnd');
            }this.log('groupEnd');
        }this.log('groupEnd');

        // for all combos, check
        combos.forEach((thisCombo,comboIndx,combosArr)=>{
            // each tile
            thisCombo.forEach((tile)=>{
                // against each other combo
                combosArr.forEach((checkedCombo, ccIndx) => {
                    // (but not itself)
                    if (checkedCombo == thisCombo) return;
                    // to see if it includes the same tile
                    if (checkedCombo.has(tile)) {
                        // if so, splice the array on which the same tile was found 
                        const splicedCombo = combosArr.splice(ccIndx,1)[0];
                        // and push all of it's tile to the thisCombo arr
                        splicedCombo.forEach((tile)=>{thisCombo.add(tile)})
                    }
                })
            })
        });
        //this.destroyComboTiles(combos)
        return combos
    }
    checkForCombosAfterMove(){
        const combos = this.checkForCombos();
        if (combos.length > 0) {
            this.log('groupCollapsed', `Combos found: ${combos.length}`);
            this.destroyComboTiles(combos)
        } else {
            this.log('groupCollapsed', `No combos found`);
            this.endTurn();
        }
    }
    destroyComboTiles(combos) {
        let tilesToRemove = [];
        const { TILE_DESTROY: tileDestroyTweenConfigDefaults, COMBO_DESTROY: comboDestroyTweenConfigDefaults } = TIME_CONSTS
        this.scene.tweens.chain({
            targets: null,
            tweens: combos.map((thisCombo, indx, arr) => {
                const thisComboArr = Array.from(thisCombo)
                return {
                    targets: thisComboArr,
                    ...comboDestroyTweenConfigDefaults,
                    onStart: (tween, targets) => {
                        targets.forEach((tileInCombo) => {
                            const { x, y, tileType } = tileInCombo;
                            const { spriteKey } = tileType
                            this.emitter.setToTop()
                            this.emitter.setTexture(spriteKey)
                            this.emitter.emitParticleAt(x, y, 50)
                        })
                    },
                    onComplete: () => {
                        tilesToRemove.push(...thisComboArr)

                        this.log('log', `Done destroying combo #${indx + 1}`)
                    }
                }
            }),
            ...tileDestroyTweenConfigDefaults,
            delay: this.scene.tweens.stagger(tileDestroyTweenConfigDefaults.staggerDelay, { ease: 'Linear' }),
            onComplete: () => {
                tilesToRemove.forEach((tile, indx) => {
                    const { boardX, boardY } = tile;
                    this.board[boardX][boardY] = null;
                    tile.destroy();
                })
                this.log('log', `Done destroying all combos`);
                this.applyGravity();
                this.log('groupEnd');
                this.log('groupEnd');
            }
        })
    }
    applyGravity() {
        const cellsToApplyGravityTo = [];
        // Start from the last row (bottom)
        for (let row = this.cellRows - 1; row >= 0; row--) {
            // Start from the last column (right)
            for (let column = this.cellColumns - 1; column >= 0; column--) {
                // if this current cell is null,
                if (this.board[column][row] === null) {
                    let didFindSomeTileAbove = false;
                    // start checking for a non-null cell above it, one row at a time.
                    for (let yDiff = 1; row - yDiff >= 0; yDiff++) {
                        let nextTileAbove = this.board[column][row - yDiff];
                        // if the cell is actually not null,
                        if (nextTileAbove !== null) {
                            // put the found cell in the correct board coordinates.
                            // also, update the boardY prop on that tile object.
                            this.board[column][row] = nextTileAbove;
                            this.board[column][row - yDiff] = null;
                            nextTileAbove.boardY = row
                            cellsToApplyGravityTo.push(nextTileAbove);
                            break;
                        }
                    }
                }
            }
        }
        this.gravityQueue.push(...cellsToApplyGravityTo)
        this.populateBoard();
    }
    tweenTilesDrop(tweenConfigExtra) {
        const cells = this.gravityQueue;
        cells.sort((firstTile, secondTile) => secondTile.boardY - firstTile.boardY);
        const { TILE_DROP: tileDropTweenConfigDefaults } = TIME_CONSTS
        this.scene.tweens.add({
            targets: cells,
            props: {
                x: {
                    getStart: (target, key, value) => {
                        return this.getCellPositionX(target.boardX)
                    }
                },
                y: {
                    getEnd: (target, key, value) => {
                        return this.getCellPositionY(target.boardY)
                    }
                },
            },
            ...tileDropTweenConfigDefaults,
            ...tweenConfigExtra,
            onComplete: () => { this.gravityQueue = []; this.checkForCombosAfterMove() },
            delay: this.scene.tweens.stagger(tileDropTweenConfigDefaults.staggerDelay, { ease: 'Linear' }),
        })
    }
    onValidMove(ValidMovePayload) {
        const { TILE_SWAP: swapTweenConfigDefaults } = TIME_CONSTS
        const { firstTile, secondTile } = ValidMovePayload;
        this.scene.tweens.add(
            {
                targets: [firstTile, secondTile],
                props: {
                    x: {
                        getEnd: (target) => {
                            if (target === firstTile) {
                                const newX = this.getCellPositionX(secondTile.boardX)
                                return newX
                            } else if (target === secondTile) {
                                const newX = this.getCellPositionX(firstTile.boardX)
                                return newX
                            }
                        },
                    },
                    y: {
                        getEnd: (target) => {
                            if (target === firstTile) {
                                return this.getCellPositionY(secondTile.boardY)
                            }
                            else if (target === secondTile) {
                                return this.getCellPositionY(firstTile.boardY)
                            }
                        },
                    }
                },
                ...swapTweenConfigDefaults,
                onComplete: () => {
                    this.log('log', `Complete Move`);
                    const firstTileBoardX = firstTile.boardX
                    const firstTileBoardY = firstTile.boardY
                    firstTile.boardX = secondTile.boardX
                    firstTile.boardY = secondTile.boardY
                    secondTile.boardX = firstTileBoardX
                    secondTile.boardY = firstTileBoardY
                    this.board[firstTile.boardX][firstTile.boardY] = firstTile
                    this.board[secondTile.boardX][secondTile.boardY] = secondTile
                    this.endMove();
                }
            }
        )
    }
    endMove() {
        this.checkForCombosAfterMove();
        this.dropSelection();
    }
    endTurn() {
        this.log('log', `END TURN`);
        this.enablePlayerInput();
        this.dropSelection();
    }
    onInvalidMove(InvalidMovePayload) {
        const { TILE_SWAP: shakeTweenConfigDefaults } = TIME_CONSTS
        const orgX = InvalidMovePayload.secondTile.x;
        const shakeWidth = 12
        this.scene.tweens.add({
            targets: InvalidMovePayload.secondTile,
            x: [orgX, orgX - shakeWidth, orgX, orgX + shakeWidth, orgX],
            interpolation: 'bezier',
            ...shakeTweenConfigDefaults,
            onComplete: () => {
                this.endTurn();
            }
        })
    }
    onTileDeselected(eventPayload) {
        if (this.firstSelectedTile === eventPayload.tile) {
            this.firstSelectedTile = null;
        }
        if (this.secondSelectedTile === eventPayload.tile) {
            this.secondSelectedTile = null;
        }
    }
    dropSelection() {
        this.scene.events.emit('board-action', 'tile-deselected', { tile: this.firstSelectedTile, board: this.board })
        this.scene.events.emit('board-action', 'tile-deselected', { tile: this.secondSelectedTile, board: this.board })
        this.secondSelectedTile = null;
    }

}