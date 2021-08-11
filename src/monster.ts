import * as PIXI from "pixi.js";
import { loader, loaderHandler } from './base.game';

export interface MoveMode {
  xSpeed: number,
  ySpeed: number,
  circleSpeed: number,
  radius: number
}

export interface IlevelReward {
  level: number
  score: number
  gamePoint:  { min: number, max: number }
}

export enum Direction {
  left = 1,
  right = 2,
  up = 3,
  down = 4,
}


export class Monster {
  private app: PIXI.Application = null

  private boomEffect: PIXI.Sprite = null; // 炸裂特效
  private monster: PIXI.AnimatedSprite = null; // 怪物
  private currentDirectionX: Direction = Direction.right; // 水平移動方向
  private currentDirectionY: Direction = Direction.down; // 垂直移動方向
  private level: number = 1; // 等級

  public x: number = 0; // x座標
  public y: number = 0; // y座標

  private moveModes: MoveMode[] = [
    { xSpeed: 1, ySpeed: 0, circleSpeed: 0, radius: 0 }, // mode 1
    { xSpeed: 0, ySpeed: 1, circleSpeed: 0, radius: 0 }, // mode 2
    { xSpeed: 1, ySpeed: 1, circleSpeed: 0, radius: 0 }, // mode 3
    { xSpeed: 0, ySpeed: 0, circleSpeed: 5, radius: 60 }, // mode 4
    { xSpeed: .5, ySpeed: .5, circleSpeed: 5, radius: 30 }, // mode 5
  ]


  public sprite: PIXI.Graphics = null;

  constructor(app: PIXI.Application) {
    this.app = app;
  }


  get score(): number {
    return 1;
  }

  get gamePoint(): number {
    return 1;
  }

  get moveMode(): MoveMode {
    if (this.level === 1) {
      return { xSpeed: 0, ySpeed: 0, circleSpeed: 0, radius: 0 }; // 1等 不動
    }

    if (this.level <= 5) {
      // 5等內
      return this.moveModes[this.level - 2];
    }

    let index = (this.level - 1) % 5;

    if (this.level > 10) {
      // 大於10等 對參數加成
      let { xSpeed, ySpeed, circleSpeed, radius } = this.moveModes[index];
      let plus = Math.floor(((this.level - 1) / 5));
      radius = radius + (5 * plus);
      return {
        xSpeed: xSpeed * plus,
        ySpeed: ySpeed * plus,
        circleSpeed,
        radius: radius > 100 ? 100 : radius,
      }
    }

    return this.moveModes[index];
  }


  async init(): Promise<this> {
    if (!loader.resources['monster00']) await loaderHandler('monster00', './images/img-monster00/config.json');
    if (!loader.resources['monster01']) await loaderHandler('monster01', './images/img-monster01/config.json');
    if (!loader.resources['monster02']) await loaderHandler('monster02', './images/img-monster02/config.json');
    if (!loader.resources['boom']) await loaderHandler('boom', './images/img-boom.png');

    this.sprite = new PIXI.Graphics();
    this.boomEffect = new PIXI.Sprite(loader.resources['boom'].texture);
    this.sprite.addChild(this.boomEffect);
    this.boomEffect.visible = false;

    return this;
  }

  private move(): void {
    let { xSpeed, ySpeed, circleSpeed, radius } = this.moveMode;
    const halfWidth = this.sprite.width / 2;

    if (this.x + this.sprite.width >= this.app.screen.width) {
      this.currentDirectionX = Direction.left;
    } else if (this.x < 0) {
      this.currentDirectionX = Direction.right;
    }

    if (this.y + this.sprite.height >= this.app.screen.height / 2) {
      this.currentDirectionY = Direction.up;
    } else if (this.y < 0) {
      this.currentDirectionY = Direction.down;
    }

    const isRandom = this.level > 15 ? Math.floor(Math.random() * 2) === 0 : false;
    // 大於15等後開始隨機速度
    let moveX = isRandom && !!xSpeed ? (Math.random() * xSpeed) + 1 : xSpeed;
    let moveY = isRandom && !!ySpeed ? (Math.random() * ySpeed) + 1 : ySpeed;
    // let moveCircle = isRandom ? (Math.floor(Math.random() * circleSpeed)) + 1 : circleSpeed;

    switch (this.currentDirectionX) {
      case Direction.right:

        break;
      case Direction.left:
        moveX = -Math.abs(moveX);
        break;
    }
    switch (this.currentDirectionY) {
      case Direction.up:
        moveY = -Math.abs(moveY);
        break;
      case Direction.down:

        break;
    }


    this.x += moveX;
    this.y += moveY;


    if (circleSpeed) {
      // 盡量避免旋轉超出螢幕
      if (this.x + radius + halfWidth > this.app.screen.width) {
        this.x = this.app.screen.width - radius - halfWidth;
        this.currentDirectionX = Direction.left;
      } else if (this.x - radius - halfWidth < 0) {
        this.x = 0 + radius + halfWidth;
        this.currentDirectionX = Direction.right;
      }
      if (this.y - radius - halfWidth < 0) {
        this.y = 0 + radius + halfWidth;
        this.currentDirectionY = Direction.down;
      }

      let round = +new Date() / 1000 * circleSpeed;
      this.sprite.x = this.x + Math.cos(round) * radius - halfWidth;
      this.sprite.y = this.y + Math.sin(round) * radius - halfWidth;
    } else {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
    }
  }

  private start() {
    this.app.ticker.add(this.move, this);
  }

  private stop() {
    this.app.ticker.remove(this.move, this);
  }

  setMonster(level: number): void {
    this.level = level;

    const monster = `monster0${(this.level - 1) % 3}`

    const monsterFrames = Object.keys(loader.resources[monster].textures)
    .map(key => PIXI.Texture.from(key))

    this.monster = new PIXI.AnimatedSprite(monsterFrames);
    this.monster.animationSpeed = 0.1;
    this.monster.play();

    // 加入怪物、隱藏爆炸效果
    this.sprite.addChild(this.monster);
    this.sprite.alpha = 1;
    this.boomEffect.visible = false;


    // 根據等級調整怪物大小
    let scale = this.level >= 5 ? 1 - (this.level * 0.01) : 1;
    if (scale <= 0.5) scale = 0.5;

    if (monster === 'monster01') {
      // 這隻怪物比較狹長一點，微調大小
      scale *= 0.85;
    }

    this.sprite.height = (this.sprite.height / this.sprite.width) * (this.app.screen.width / 3);
    this.sprite.width = this.app.screen.width / 3;
    this.sprite.scale.x *= scale;
    this.sprite.scale.y *= scale;

    // 設置初始位置
    this.x = Math.floor(Math.random() * (this.app.screen.width - this.sprite.width));
    this.y = this.app.screen.height / 7;
    this.sprite.x = this.x
    this.sprite.y = this.y

    this.start();
  }


  boom(): Promise<void> {
    this.stop();
    this.boomEffect.visible = true;
    this.boomEffect.x = this.monster.x - Math.abs((this.boomEffect.width / 2 - this.monster.width / 2) /2);
    this.boomEffect.y = this.monster.y - Math.abs((this.boomEffect.height / 2 - this.monster.height / 2) / 2);
    // this.boomEffect.height = (this.boomEffect.height / this.boomEffect.width) * this.monster.width;
    // this.boomEffect.width = this.monster.width;

    this.sprite.removeChild(this.monster);
    // 炸裂
    return new Promise((resolve) => {

      const effect = () => {
        if (this.sprite.alpha <= 0) {
          this.app.ticker.remove(effect, this);
          resolve();
          return;
        }
        this.sprite.alpha -= 0.01;
      }
      this.app.ticker.add(effect, this);
    })
  }
}
