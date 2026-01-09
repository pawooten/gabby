import Phaser from "phaser";

import testLevel from "./test-level.json";
import { Level } from "./level";

class GameScene extends Phaser.Scene {

  private readonly colorSquaresByName = new Map<string, string>([
    ['red', 'assets/red-square.png'],
    ['blue', 'assets/blue-square.png'],
    ['green', 'assets/green-square.png'],
    ['green-outlined-square', 'assets/green-outlined-square.png'],
    ['orange', 'assets/orange-square.png'],
    ['purple', 'assets/purple-square.png'],
    ['yellow', 'assets/yellow-square.png']
  ]);
  private readonly colorNamesByAbbreviation = new Map<string, string>([
    ['r', 'red'],
    ['b', 'blue'],
    ['g', 'green-outlined-square'],
    ['o', 'orange'],
    ['p', 'purple'],
    ['y', 'yellow']
  ]);

  preload() {
    // Load color square images
    for (const color of this.colorSquaresByName.keys()) {
      if (!color) {
        throw new Error(`Color name is undefined ${color}`);
      }
      this.load.image(color, this.colorSquaresByName.get(color));
    }

    this.load.image('purple-outlined-circle', 'assets/purple-outlined-circle.png');
    this.load.image('silver-coin', 'assets/silver-coin.png');
    this.load.image('start', 'assets/start.png');
    this.load.image('goal', 'assets/goal.png');
  }

  create() {
    const level: Level = testLevel;
    const cells: string[][] = [];
    for (const row of testLevel.static) {
      cells.push(row.split('').map(abbr => this.colorNamesByAbbreviation.get(abbr) || ''));
    }

    const cellDimensions = { width: 32, height: 32 };
    const center = { x: 400, y: 300 };

    // Draw the static layer
    for (const [rowIndex, row] of cells.entries()) {
      for (const [colIndex, cell] of row.entries()) {
        if (cell) {
          this.add.image(
            center.x + (colIndex - Math.floor(row.length / 2)) * cellDimensions.width,
            center.y + (rowIndex - Math.floor(cells.length / 2)) * cellDimensions.height,
            cell
          );
        }
      }
    }

    // Draw the silver coins
    for (const [rowIndex, row] of testLevel.items.entries()) {
      for (const [colIndex, cell] of row.split('').entries()) {
        if (cell === 'c') {
          this.add.image(
            center.x + (colIndex - Math.floor(row.length / 2)) * cellDimensions.width,
            center.y + (rowIndex - Math.floor(cells.length / 2)) * cellDimensions.height,
            'silver-coin'
          );
        }
        if (cell === 's') {
          this.add.image(
            center.x + (colIndex - Math.floor(row.length / 2)) * cellDimensions.width,
            center.y + (rowIndex - Math.floor(cells.length / 2)) * cellDimensions.height,
            'start'
          );
        }
        if (cell === 'g') {
          this.add.image(
            center.x + (colIndex - Math.floor(row.length / 2)) * cellDimensions.width,
            center.y + (rowIndex - Math.floor(cells.length / 2)) * cellDimensions.height,
            'goal'
          );
        }
      }
    }
    this.add.image(center.x, center.y, 'purple-outlined-circle');
  }

  update(time: number, delta: number): void {
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors && Phaser.Input.Keyboard.JustDown(cursors.space)) {
      console.log('Space key pressed');
    }
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