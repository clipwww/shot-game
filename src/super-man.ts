import * as PIXI from "pixi.js";
import { loader, loaderHandler } from './base.game';
import { Cannon } from './cannon';


export class SuperMan {
  private app: PIXI.Application = null
  private cannon: Cannon = null;
  private spriteFolderPath: string;

  public man: PIXI.AnimatedSprite = null;
  public ball: PIXI.Sprite = null;
  public isReady: boolean = false;

  constructor(app: PIXI.Application, cannon: Cannon, spriteFolderPath: string) {
    this.app = app;
    this.cannon = cannon;
    this.spriteFolderPath = spriteFolderPath || './images/superman04';
  }

  async initMan(): Promise<PIXI.AnimatedSprite> {
    if (!loader.resources['super-man']) await loaderHandler('super-man', `${this.spriteFolderPath}/config.json`);
    console.log(loader, loader.resources['super-man'].data);

    const superManFrames: PIXI.Texture[] = Object.keys(loader.resources['super-man'].textures)
    .map(key => PIXI.Texture.from(key))

    this.man = new PIXI.AnimatedSprite(superManFrames);
    this.man.x = 0;
    this.man.anchor.y = 1;
    this.man.y = this.cannon.carY + this.cannon.carHeight;
    this.man.animationSpeed = 0.1;
    // this.man.play();

    // window['man'] = this.man;

    return this.man;
  }

  async initBall(): Promise<PIXI.Sprite> {
    this.isReady = false;
    if (!loader.resources['ball']) await loaderHandler('ball', `${this.spriteFolderPath}/ball.png`);
    this.ball = new PIXI.Sprite(loader.resources['ball'].texture);
    this.ball.visible = true;
    this.ball.anchor.x = .5;
    this.ball.anchor.y = .5;
    this.ball.x = 0;
    this.ball.y = -(this.ball.height / 6);
    this.ball.rotation = 90 * (Math.PI / 180);

    // window['ball'] = this.ball;

    return this.ball;
  }

  ready(): Promise<void> {
    return new Promise((reslove) => {
      const animate = () => {
        if (this.man.alpha > 0) {
          this.man.alpha -= 0.05;
          return;
        }
    
        if (this.ball.x <= this.ball.width / 2) {
          this.ball.x += 1;
        } else {
          this.isReady = true;
          this.app.ticker.remove(animate, this)
          reslove();
          return;
        }
      }
      this.app.ticker.add(animate, this);
    })
  }

}
