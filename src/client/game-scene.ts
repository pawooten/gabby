import Phaser from "phaser";

import testLevel from "./test-level.json";
import { Level } from "./level";

class GameScene extends Phaser.Scene {

  private readonly colorSquaresByName = new Map<string, string>([
    ['red', 'assets/red-square.png'],
    ['blue', 'assets/blue-square.png'],
    ['green', 'assets/green-square.png'],
    ['orange', 'assets/orange-square.png'],
    ['purple', 'assets/purple-square.png'],
    ['yellow', 'assets/yellow-square.png']
  ]);
  private readonly colorNamesByAbbreviation = new Map<string, string>([
    ['r', 'red'],
    ['b', 'blue'],
    ['g', 'green'],
    ['o', 'orange'],
    ['p', 'purple'],
    ['y', 'yellow']
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
    const level: Level = testLevel;
    const cells: string[][] = [];
    for (const row of testLevel.data) {
      cells.push(row.split('').map(abbr => this.colorNamesByAbbreviation.get(abbr) || ''));
    }

    const cellDimensions = { width: 32, height: 32 };
    const center = { x: 400, y: 300 };

    // 28 cells per row


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