import * as constants from "./constants";
import LEVELS from "../../config/levels.json";

const IMMOBILE_SPEED = 0.362;
const IMMOBILE_ANGULAR_SPEED = 0.0006;
const FOUNTAIN_DURATION = 2500;

export function iterate(obj, stack): void {
  const keyList = [];
  function _iterate(objInner, stackInner) {
    for (const property in objInner) {
      if (objInner.hasOwnProperty(property)) {
        if (typeof objInner[property] === "object") {
          _iterate(objInner[property], stackInner + "." + property);
        } else {
          const keys = {};
          keys[property] = objInner[property];
          keyList.push(keys);
        }
      }
    }
    return keyList;
  }
  return _iterate(obj, stack);
}

export function closestPointToCircle(
  centerX,
  centerY,
  currentX,
  currentY,
  radius
) {
  const angle = Phaser.Math.Angle.Between(centerX, centerY, currentX, currentY);
  const x = centerX + radius * Math.cos(angle);
  const y = centerY + radius * Math.sin(angle);

  return { x, y };
}

export function isInCircle(x, y, currentX, currentY, radius): boolean {
  return Phaser.Math.Distance.Between(x, y, currentX, currentY) <= radius;
}

export function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function mobileAndTabletCheck(): boolean {
  let check = false;
  ((a): void => {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}

export function isOutsideWorld(sprite): boolean {
  const { width, height } = sprite.scene.sys.game.CONFIG;

  const rect = new Phaser.Geom.Rectangle(0, -height, width, 2 * height);
  return !rect.contains(sprite.x, sprite.y);
}

export function isSpriteImmobile(sprite): boolean {
  const now = new Date();
  const fountainCollidedAt = sprite.getData("fountain_collided_at");
  const fountainDuration = sprite.getData("fountain_duration");

  const collidedRecently =
    fountainCollidedAt &&
    now - fountainCollidedAt < constants.FOUNTAIN_TIME_DIFF;

  if (collidedRecently && fountainDuration > FOUNTAIN_DURATION) {
    return true;
  }

  return (
    sprite.body.speed < IMMOBILE_SPEED &&
    sprite.body.angularVelocity < IMMOBILE_ANGULAR_SPEED
  );
}

export function getOldCompletedLevels() {
  const levels =
    JSON.parse(localStorage.getItem(constants.LOCAL_STORAGE_ROOT_OLD)) || {};

  return levels;
}

export function getCompletedLevels() {
  const root =
    JSON.parse(localStorage.getItem(constants.LOCAL_STORAGE_ROOT)) || {};
  const levels = root[constants.LOCAL_STORAGE_LEVELS] || {};
  return levels;
}

export function getStorageRoot() {
  const root = JSON.parse(localStorage.getItem(constants.LOCAL_STORAGE_ROOT));
  return root;
}

export function getLevelByNumber(number) {
  return LEVELS.filter((level) => number === level.order)[0];
}

export function getLevelByName(name) {
  return LEVELS.filter((level) => name === level.name)[0];
}

export function getVersion(): string {
  const root =
    JSON.parse(localStorage.getItem(constants.LOCAL_STORAGE_ROOT)) || {};
  const version = root[constants.LOCAL_STORAGE_VERSION];
  return version;
}

export function addSmallNumber(scene, number, x, y): void {
  const numberText = number.toString();
  const firstDigit = parseInt(numberText[0]);
  let secondDigit = null;
  let offsetDiff = 0;
  let firstDigitOffsetX = 0;
  const firstDigitKey = constants.LEVEL_DIGIT_SMALL_MAP[firstDigit];
  const firstDigitImage = scene.add
    .image(x, y, constants.TEXTURE_ATLAS, firstDigitKey)
    .setDepth(constants.MAX_DEPTH);
  let numberWidth = firstDigitImage.width;

  if (number > 9) {
    secondDigit = parseInt(numberText[1]);
    const secondDigitKey = constants.LEVEL_DIGIT_SMALL_MAP[secondDigit];
    const secondDigitImage = scene.add
      .image(0, 0, constants.TEXTURE_ATLAS, secondDigitKey)
      .setDepth(constants.MAX_DEPTH);

    const secondDigitOffsetX = secondDigitImage.width;
    firstDigitOffsetX = firstDigitImage.width;
    // @HACK digit "1" has different width, so needs some special treatment
    if (secondDigit === 1) {
      offsetDiff = -Math.abs(firstDigitOffsetX - secondDigitOffsetX) / 2;
    } else {
      offsetDiff = Math.abs(firstDigitOffsetX - secondDigitOffsetX) / 2;
    }

    secondDigitImage.setPosition(x + firstDigitImage.width + offsetDiff, y);
    numberWidth += offsetDiff + secondDigitImage.width;
  }

  return numberWidth;
}
