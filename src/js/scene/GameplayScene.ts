import LEVELS from "../../../config/levels.json";
import { Ball } from "../sprite/Ball";
import { Player } from "../sprite/Player";
import { Cup } from "../sprite/Cup";
import { Table } from "../sprite/Table";
import RetryLevelPopup from "../sprite/RetryLevelPopup";
import CompleteLevelPopup from "../sprite/CompleteLevelPopup";
import { ComponentManager } from "../behaviour/ComponentManager";
import HealthBar from "../hud/HealthBar";
import LevelBar from "../hud/LevelBar";
import * as constants from "../constants";
import { initCategories } from "../collision";
import { initCollisions } from "../CollisionManager";

export enum GameplaySceneStatus {
  PLAY,
  RETRY,
  COMPLETE,
}

export class GameplayScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameplayScene",
    });
    this.levelNumber = 1;
  }

  create(data): void {
    const config = this.sys.game.CONFIG;
    this.levelNumber = this.getLevelNumber(data);
    this.status = GameplaySceneStatus.PLAY;
    initCategories(this);

    ComponentManager.Clear();

    const level = LEVELS[this.levelNumber - 1];
    const {
      tables: confTables = [],
      tables_half: confTablesHalf = [],
      cups: confCups = [],
      balls: ballsConf = [],
      player: playerConf,
    } = level;

    ballsConf.forEach((ballConf) => {
      const ball = new Ball(
        this,
        ballConf.x,
        ballConf.y,
        constants.TEXTURE_ATLAS,
        "ball",
        ballConf.isStatic
      );
      this.add.existing(ball);
    });

    const player = new Player(
      this,
      playerConf.x,
      playerConf.y,
      constants.TEXTURE_ATLAS,
      playerConf.name,
      Phaser.Math.DegToRad(playerConf.angle || 0)
    );
    this.add.existing(player);
    const ballIds = player.body.parts.map((part) => part.id);

    initCollisions(this, player);

    // @TODO: Table should be rendered after the cup
    confTables.forEach((confTable) => {
      const table = new Table(
        this,
        confTable.x,
        confTable.y,
        constants.TEXTURE_ATLAS,
        "table",
        Phaser.Math.DegToRad(confTable.angle || 0)
      );
      this.add.existing(table);
    });

    confTablesHalf.forEach((confTable) => {
      const table = new Table(
        this,
        confTable.x,
        confTable.y,
        constants.TEXTURE_ATLAS,
        "table_half",
        Phaser.Math.DegToRad(confTable.angle || 0)
      );
      this.add.existing(table);
    });

    const cups = [];
    confCups.forEach((confCup) => {
      const cup = new Cup(
        this,
        confCup.x,
        confCup.y,
        confCup.angle,
        ballIds,
        confCup.behaviours
      );
      this.add.existing(cup);
      cups.push(cup);
    });

    ((): void => new LevelBar(this, this.levelNumber))();

    // @TODO: How do I get lives number here
    const healthBar = new HealthBar(this, player.livesNumber);
    const retryLevelPopup = new RetryLevelPopup(
      this,
      config.centerX,
      config.centerY
    );

    player.on("dead", () => {
      healthBar.update(player.livesNumber);
      if (player.livesNumber === 0) {
        retryLevelPopup.popup();
      }
    });

    this.completeLevelPopup = new CompleteLevelPopup(
      this,
      config.centerX,
      config.centerY
    );

    if (process.env.DEBUG) {
      this.debug();
    }
  }

  update(time, delta): void {
    ComponentManager.Update(delta);
  }

  getStatus(): GameplaySceneStatus {
    return this.status;
  }

  setStatus(status: GameplaySceneStatus): void {
    this.status = status;
  }

  complete(): void {
    this.completeLevelPopup.popup();
  }

  getLevelNumber(data): void {
    const { result, levelNumber } = data;

    if (levelNumber) {
      return levelNumber;
    }

    switch (result) {
      case "fail":
        return this.levelNumber;
      case "success":
        return this.levelNumber + 1;
      default:
        return this.levelNumber;
    }
  }

  debug(): void {
    // Add a red border
    const config = this.sys.game.CONFIG;
    const size = 2;
    const border = this.add.rectangle(
      config.centerX,
      config.centerY,
      config.width - size,
      config.height - size
    );
    border.setStrokeStyle(size, "0xFF0000");

    const levelMap = {
      1: "ONE",
      2: "TWO",
      3: "THREE",
      4: "FOUR",
      5: "FIVE",
    };
    for (const [key, value] of Object.entries(levelMap)) {
      const keyObj = this.input.keyboard.addKey(value); // Get key object
      keyObj.on("down", () => {
        this.scene.start("GameplayScene", { levelNumber: key });
      });
    }
    const keyObj = this.input.keyboard.addKey("RIGHT"); // Get key object
    keyObj.on("down", () => {
      this.scene.start("GameplayScene", { levelNumber: this.levelNumber + 1 });
    });
    const keyObj = this.input.keyboard.addKey("LEFT"); // Get key object
    keyObj.on("down", () => {
      this.scene.start("GameplayScene", { levelNumber: this.levelNumber - 1 });
    });
  }
}