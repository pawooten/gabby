import Phaser from "phaser";

class Coin {
  private sprite: Phaser.GameObjects.Image;
  private x: number;
  private y: number;
  private rotationAngle: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string = 'silver-coin'
  ) {
    this.x = x;
    this.y = y;
    this.sprite = scene.add.image(x, y, texture);

    // Set up animation for vertical axis rotation
    scene.events.on('update', () => this.updateRotation());
  }

  private updateRotation(): void {
    // Increment rotation angle
    this.rotationAngle += 0.05;

    // Use cosine wave to scale X axis, creating rotation illusion
    // Ensure minimum width is 20% of original
    const minScale = 0.2;
    const scale = Math.abs(Math.cos(this.rotationAngle)) * (1 - minScale) + minScale;
    this.sprite.setScale(scale, 1);
  }

  getSprite(): Phaser.GameObjects.Image {
    return this.sprite;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}

export default Coin;
