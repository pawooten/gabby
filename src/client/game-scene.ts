import Phaser from "phaser";
class GameScene extends Phaser.Scene {

  private readonly colorSquaresByName = new Map<string, string>([
    ['red', 'assets/red-square.png'],
    ['blue', 'assets/blue-square.png'],
    ['green', 'assets/green-square.png'],
    ['orange', 'assets/orange-square.png'],
    ['purple', 'assets/purple-square.png'],
    ['yellow', 'assets/yellow-square.png']
  ]);

  preload() {
    for (const color of this.colorSquaresByName.keys()) {
      if (!color) {
        throw new Error(`Color name is undefined ${color}`);
      }
      this.load.image(color, this.colorSquaresByName.get(color));
    }
  }

  create() {
    this.add.image(400, 300, 'yellow');
    this.add.image(200, 150, 'blue');
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: GameScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 200 }
    }
  }
};

export const exampleGame = new Phaser.Game(config);