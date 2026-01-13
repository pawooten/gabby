import Phaser from "phaser";

class Hazard {
  private sprite: Phaser.GameObjects.Image;
  private x: number;
  private y: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string
  ) {
    this.x = x;
    this.y = y;
    this.sprite = scene.add.image(x, y, texture);
  }

  getSprite(): Phaser.GameObjects.Image {
    return this.sprite;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}

export default Hazard;
