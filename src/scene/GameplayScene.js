import _LEVELS from '../../config/levels.json';
import Ball from '../sprite/Ball';
import Cup from '../sprite/Cup';
import Table from '../sprite/Table';
import RetryLevelPopup from '../sprite/RetryLevelPopup';
import HealthBar from '../hud/HealthBar';
import * as constants from '../constants';

class GameplayScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameplayScene',
    });
    this.levelNumber = 1;
    this.livesNumber = constants.MAX_LIVES;
    this.tableIds = [];
    this.ball = null;
  }

  create(data) {
    const config = this.sys.game.CONFIG;
    this.levelNumber = this.getLevelNumber(data);
    this.livesNumber = this.getLivesNumber(data);

    const level = _LEVELS[this.levelNumber - 1];
    const { tables: confTables = [], cup: confCup } = level;

    this.ball = new Ball(this, 125, config.centerY, 'ball');
    this.add.existing(this.ball);

    confTables.forEach(confTable => {
      const table = new Table(
        this,
        confTable.x,
        confTable.y,
        'table',
        confTable.angle
      );
      this.add.existing(table);
      this.tableIds.push(table.body.id);
    });

    this.cup = new Cup(
      this,
      confCup.x,
      confCup.y,
      confCup.angle,
      this.ball.body.id
    );
    this.add.existing(this.cup);

    this.healthBar = new HealthBar(this, this.livesNumber, this.ball);
    this.retryLevelPopup = new RetryLevelPopup(
      this,
      config.centerX,
      config.centerY
    );

    this.ball.once('dead', () => {
      if (this.livesNumber === 1) {
        this.livesNumber = 0;
        this.healthBar.update(this.livesNumber);
        this.retryLevelPopup.popup();
      } else if (this.livesNumber !== 0) {
        this.scene.restart({ result: 'fail' });
      }
    });
    // If this was the last attempt, do not restart the scene, but show the retry popup
    if (__DEV__) {
      this.debug();
    }
  }

  update(time, delta) {
    this.ball.update();
  }

  getLevelNumber(data) {
    const { result, levelNumber } = data;

    if (levelNumber) {
      return levelNumber;
    }

    switch (result) {
      case 'fail':
        return this.levelNumber;
      case 'success':
        return this.levelNumber + 1;
      default:
        return this.levelNumber;
    }
  }

  getLivesNumber(data) {
    const { result } = data;

    switch (result) {
      case 'fail':
        return this.livesNumber - 1;
      case 'retry':
        return constants.MAX_LIVES;
      default:
        return constants.MAX_LIVES;
    }
  }

  debug() {
    // Add a red border
    const config = this.sys.game.CONFIG;
    const size = 2;
    const border = this.add.rectangle(
      config.centerX,
      config.centerY,
      config.width - size,
      config.height - size
    );
    border.setStrokeStyle(size, '0xFF0000');
  }
}

export default GameplayScene;
