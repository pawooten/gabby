import Phaser from "phaser";

class Star {
  private sprite: Phaser.Physics.Arcade.Sprite;
  private startX: number;
  private startY: number;
  private readonly bounceRange: number = 100;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string = 'silver-star'
  ) {
    this.startX = x;
    this.startY = y;

    this.sprite = scene.physics.add.sprite(x, y, texture).setScale(0.5);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocityX(-50);
    body.setBounce(1, 1);
    body.setCollideWorldBounds(false);

    // Set up bounce boundaries
    scene.events.on('update', () => this.updateBounce());
  }

  private updateBounce(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Rotate clockwise continuously
    this.sprite.angle += 2;

    if (this.sprite.x <= this.startX - this.bounceRange) {
      this.sprite.x = this.startX - this.bounceRange;
      body.setVelocityX(Math.abs(body.velocity.x));
    } else if (this.sprite.x >= this.startX + this.bounceRange) {
      this.sprite.x = this.startX + this.bounceRange;
      body.setVelocityX(-Math.abs(body.velocity.x));
    }

    if (this.sprite.y <= this.startY - this.bounceRange) {
      this.sprite.y = this.startY - this.bounceRange;
      body.setVelocityY(Math.abs(body.velocity.y));
    } else if (this.sprite.y >= this.startY + this.bounceRange) {
      this.sprite.y = this.startY + this.bounceRange;
      body.setVelocityY(-Math.abs(body.velocity.y));
    }
  }

  getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  getStartPosition(): { x: number; y: number } {
    return { x: this.startX, y: this.startY };
  }
}

export default Star;