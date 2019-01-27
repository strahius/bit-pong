import _LEVELS from '../../config/levels.json';

const LEVEL_NUMBERS_DISTANCE = 64;

export default class LevelMenuScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'LevelMenuScene',
    });
  }

  create() {
    const completedLevels =
      JSON.parse(localStorage.getItem('completed-levels')) || [];

    for (let levelNumber = 1; levelNumber <= _LEVELS.length; levelNumber += 1) {
      let colour = 'black';
      if (completedLevels.includes(levelNumber)) {
        colour = 'green';
      }
      const levelText = this.add.text(0, 0, levelNumber.toString(), {
        fontFamily: 'Arial',
        fill: colour,
        fontSize: 64,
      });
      levelText.setPosition(levelNumber * LEVEL_NUMBERS_DISTANCE, 16);

      // make the text interactive
      levelText.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, levelText.width, levelText.height),
        Phaser.Geom.Rectangle.Contains
      );

      const { scene } = this;
      levelText.on('pointerdown', () =>
        scene.start('GameplayScene', { levelNumber })
      );
    }
  }
}