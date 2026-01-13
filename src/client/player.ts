import Phaser from "phaser";

class Player {
  private sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private speed: number = 200;
  private gridSize: number = 32;
  private isMoving: boolean = false;
  private startPosition: { x: number; y: number };

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string = 'purple-outlined-circle'
  ) {
    this.scene = scene;
    this.startPosition = { x, y };
    this.sprite = scene.physics.add.sprite(x, y, texture);
    this.sprite.setCollideWorldBounds(true);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    // Only allow movement if not currently moving
    if (this.isMoving) {
      return;
    }

    // Check for key press and move in grid units (allows holding)
    if (cursors.left.isDown) {
      this.moveInGrid(-this.gridSize, 0);
    } else if (cursors.right.isDown) {
      this.moveInGrid(this.gridSize, 0);
    } else if (cursors.up.isDown) {
      this.moveInGrid(0, -this.gridSize);
    } else if (cursors.down.isDown) {
      this.moveInGrid(0, this.gridSize);
    }
  }

  private moveInGrid(deltaX: number, deltaY: number): void {
    this.isMoving = true;
    const targetX = this.sprite.x + deltaX;
    const targetY = this.sprite.y + deltaY;

    this.scene.tweens.add({
      targets: this.sprite,
      x: targetX,
      y: targetY,
      duration: 150,
      ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
      }
    });
  }

  getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  getSpeed(): number {
    return this.speed;
  }

  resetToStart(): void {
    this.sprite.setPosition(this.startPosition.x, this.startPosition.y);
    this.isMoving = false;
  }
}

export default Player;
