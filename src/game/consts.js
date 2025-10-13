// 	static theme = [

// ];
// 	static strokePrprts = {

// };
export const STYLE_COLORS = {
  CHERRY: { primary: 0xe80448, lighter: 0xff9a9a, darker: 0x550043 },
  PINEAPPLE: { primary: 0xffc144, lighter: 0xffe45a, darker: 0x9f1b0f },
  BANANA: { primary: 0xffce3a, lighter: 0xfffdb8, darker: 0x893838 },
  GREEN_APPLE: { primary: 0x77bd28, lighter: 0xeeff99, darker: 0x18642e },
  BLUEBERRIES: { primary: 0x5589db, lighter: 0x9dceff, darker: 0x20215c },
  GRAPES: { primary: 0x6852c0, lighter: 0xf5c4f9, darker: 0x3a1d5b },
}

export const STYLE_TILE_RECT = {
  BASE_WIDTH: 20,
  BASE_HEIGHT: 20,
  RADIUS: 2,
  WIDTH_SCALE: 3,
  HEIGHT_SCALE: 3,
  STROKE_WIDTH: 4,
  STROKE_COLOR_IDLE: 0x221111,
  STROKE_COLOR_SELECTED: 0xf3ff7d,
  STROKE_COLOR_HOVER: 0xfff1e8,
}
export const TIME_CONSTS = {
  TILE_SWAP: {
    duration: 250,
    ease: 'Back.easeInOut',       // 'Linear', 'Cubic', 'Elastic', 'Bounce', 'Back'
    completeDelay: 100,
  },
  TILE_SHAKE: {
    ease: 'Linear',
    duration: 150,
    completeDelay: 100,
  },
  TILE_DROP: {
    duration: 200,
    staggerDelay: 20,
    completeDelay: 100,
    ease: 'Bounce.easeOut',
  },
  COMBO_DESTROY: {
    duration: 200,
    delay: 10,
    completeDelay: 25,
    props: {
      alpha: {
        from: 1,
        to: 0,
        ease: 'Sine.easeOut',
      },
      scale: {
        from: 1,
        to: 2,
        ease: 'Sine.easeIn'
      },
    }
  },
  TILE_DESTROY: {
    duration: 500,
    staggerDelay: 100,
    completeDelay: 100,
  },
}
export const STYLE_BOARD_RECT = {
  TILE_GAP: 8,
  EMITTER_CONFIG:   {
            lifespan: 600,
            speed: { min: 150, max: 300, random: true, ease: 'Sine.easeOut' },
            alpha: { start: 1, end: 0, random: true, ease: 'Sine.easeIn'},
            scale: { start: 0, end: 2, random: true, ease: 'Sine.easeOut' },
            angle: { min: 0, max: 360 , random: true },
            rotate: { start: 0, end: 360, random: true },
            emitting: false
        }
}
