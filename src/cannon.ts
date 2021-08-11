import * as PIXI from "pixi.js";
import { loader, loaderHandler } from './base.game';

export class Cannon {
  private app: PIXI.Application = null;
  private car: PIXI.Sprite = null; // 砲座
  private cannon: PIXI.Sprite = null; // 砲管
  private cannonContainer: PIXI.Container = null; // 砲管
  // 是否為順時針
  private isClockwiseDirection: boolean = false

  private degreeConfig = {
    max: 100,
    min: 1
  }
  private rotationSpeed: number = 0.015;

  public sprite: PIXI.Graphics = null;
  public currentDegree: number = 0;
  public isRotating: boolean = false;

  constructor(app: PIXI.Application) {
    this.app = app;
  }

  get rotation(): number {
    return this.cannonContainer.rotation;
  }

  get carHeight(): number {
    return this.car.height;
  }

  get carY(): number {
    return this.car.y;
  }

  async init(): Promise<this> {
    await loaderHandler('car', './images/img-car.png');
    await loaderHandler('cannon', './images/img-cannon.png');
    await loaderHandler('smog', './images/img-smog.png');

    this.sprite = new PIXI.Graphics();
    this.car = new PIXI.Sprite(loader.resources['car'].texture);
    this.cannon = new PIXI.Sprite(loader.resources['cannon'].texture);
    this.cannonContainer = new PIXI.Container();
    this.cannonContainer.addChild(this.cannon);
    
    this.sprite.addChild(this.cannonContainer);
    this.sprite.addChild(this.car);
    
    this.car.position.set(0, this.sprite.height - this.car.height);

    // window['cannon'] = this.cannon;
    // window['car'] = this.car;
    // window['sprite'] = this.sprite;
    // window['cannonContainer'] = this.cannonContainer;
    // const stage = new Graphics()
    // stage.beginFill(0x1099bb);
    // stage.drawRect(0, 0, this.screenSize.width, this.screenSize.height)
    // stage.endFill();

    this.cannon.anchor.x = .5;
    this.cannon.anchor.y = .6;
    this.cannonContainer.pivot.x = .5;
    this.cannonContainer.pivot.y = .6; // 重心移動到中間
    this.cannonContainer.position.set(this.car.width / 1.6, this.car.height / 9);


    this.sprite.height = (this.sprite.height / this.sprite.width) * (this.app.screen.width / 3);
    this.sprite.width = this.app.screen.width / 3;

    this.sprite.x = 15;
    this.sprite.y = this.app.screen.height - ((this.app.screen.width / this.app.screen.height) * (this.app.screen.height/ 2.7));

    this.cannonContainer.rotation = -45 * (Math.PI / 180);

    this.app.ticker.add(this.rotationHandler, this);

    return this;
  }

  addChild(sprite: PIXI.Sprite): void {
    this.cannonContainer.addChild(sprite);
    this.cannonContainer.children.sort(() => -1);
  }

  removeChild(sprite: PIXI.Sprite): void {
    this.cannonContainer.removeChild(sprite);
  }

  async rotationHandler(): Promise<void> {

    if (!this.isRotating) return;

    if (this.currentDegree >= this.degreeConfig.max) {
      this.isClockwiseDirection = true
    } else if (this.currentDegree <= this.degreeConfig.min) {
      this.isClockwiseDirection = false
    }

    if (this.isClockwiseDirection) {

      this.cannonContainer.rotation += this.rotationSpeed;
    } else {
      this.cannonContainer.rotation -= this.rotationSpeed;
    }

    this.currentDegree = Math.abs(this.cannonContainer.rotation / (Math.PI / 180))

    // console.log("this.currentDegree", this.currentDegree)



    // this.shell.x = this.shellInitPosition.x - (this.shellInitPosition.x *

    //     Math.sin((this.currentDegree * (Math.PI / 180)))
    // );

    // this.shell.x = 
    // (this.cannon.x * (
    //     this.currentDegree * (Math.PI / 180))) + 
    // this.shellInitPosition.x - (
    //     this.shellInitPosition.x * Math.sin(this.currentDegree * (Math.PI / 180)));





    // console.log(`this.shellInitPosition.x`, this.shellInitPosition.x)
    // console.log(`Math.sin((this.currentDegree * (Math.PI / 180))`, Math.sin((this.currentDegree * (Math.PI / 180))))

    // console.log(`this.shell.x`, this.shell.x)

    // this.shell.y = this.x

  }

  fire(): void {
    const smog = new PIXI.Sprite(loader.resources['smog'].texture)
    window['smog'] = smog;
    this.cannon.addChild(smog);
    smog.anchor.x = .5;
    smog.anchor.y = .5;
    smog.rotation = 1;
    smog.x = this.cannon.width / 1.5;
    smog.y = -this.cannon.height / 5;
    

    this.app.ticker.add(() => {
      if(smog.alpha <= 0) {
        this.cannon.removeChild(smog)
        return;
      }
      smog.x += 1;
      smog.alpha -= 0.01;
    })
  }
}