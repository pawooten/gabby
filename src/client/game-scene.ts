import Phaser from "phaser";

import testLevel from "./test-level.json";
import { Level } from "./level";
import Star from "./star";
import Coin from "./coin";
import GameState from "./game-state";
import Header from "./header";
import Player from "./player";
import Hazard from "./hazard";

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

  private gameState: GameState | null = null;
  private header: Header | null = null;
  private player!: Player;
  private coins: Coin[] = [];
  private stars: Star[] = [];
  private hazards: Hazard[] = [];

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
    this.load.image('heart', 'assets/heart.png');
    this.load.image('start', 'assets/start.png');
    this.load.image('goal', 'assets/goal.png');
    this.load.image('silver-star', 'assets/silver-star.png');
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
          const x = center.x + (colIndex - Math.floor(row.length / 2)) * cellDimensions.width;
          const y = center.y + (rowIndex - Math.floor(cells.length / 2)) * cellDimensions.height;

          // Create hazards for blue squares
          if (cell === 'blue') {
            const hazard = new Hazard(this, x, y, cell);
            this.hazards.push(hazard);
          } else {
            this.add.image(x, y, cell);
          }
        }
      }
    }

    let totalCoins = 0;
    let startX = center.x;
    let startY = center.y;

    // Draw the items: silver coins, start, goal, silver stars
    for (const [rowIndex, row] of testLevel.items.entries()) {
      for (const [colIndex, cell] of row.split('').entries()) {
        if (cell === 'c') {
          const x = center.x + (colIndex - Math.floor(row.length / 2)) * cellDimensions.width;
          const y = center.y + (rowIndex - Math.floor(cells.length / 2)) * cellDimensions.height;
          totalCoins++;
          const coin = new Coin(this, x, y);
          this.coins.push(coin);
        }
        if (cell === 's') {
          startX = center.x + (colIndex - Math.floor(row.length / 2)) * cellDimensions.width;
          startY = center.y + (rowIndex - Math.floor(cells.length / 2)) * cellDimensions.height;
          this.add.image(startX, startY, 'start');
        }
        if (cell === 'g') {
          this.add.image(
            center.x + (colIndex - Math.floor(row.length / 2)) * cellDimensions.width,
            center.y + (rowIndex - Math.floor(cells.length / 2)) * cellDimensions.height,
            'goal'
          );
        }
        if (cell === '*') {
          const x = center.x + (colIndex - Math.floor(row.length / 2)) * cellDimensions.width;
          const y = center.y + (rowIndex - Math.floor(cells.length / 2)) * cellDimensions.height;
          const star = new Star(this, x, y);
          this.stars.push(star);
        }
      }
    }

    this.gameState = new GameState(3, level.name, totalCoins);
    this.header = new Header(this, this.gameState);
    this.player = new Player(this, startX, startY);
  }

  update(time: number, delta: number): void {
    this.header?.update();

    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors) {
      this.player.update(cursors);
    }

    // Check for coin collisions
    this.checkCoinCollisions();

    // Check for star collisions
    this.checkStarCollisions();

    // Check for hazard collisions
    this.checkHazardCollisions();
  }

  private checkCoinCollisions(): void {
    const playerPos = this.player.getPosition();
    const collisionDistance = 20; // Distance threshold for collision

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      const coinPos = coin.getPosition();

      // Calculate distance between player and coin
      const distance = Phaser.Math.Distance.Between(
        playerPos.x, playerPos.y,
        coinPos.x, coinPos.y
      );

      // Check if collision occurred
      if (distance < collisionDistance) {
        // Remove coin sprite
        coin.getSprite().destroy();

        // Remove coin from array
        this.coins.splice(i, 1);

        // Update game state
        this.gameState?.collectCoin();
      }
    }
  }

  private checkStarCollisions(): void {
    const playerPos = this.player.getPosition();
    const collisionDistance = 20; // Distance threshold for collision

    for (const star of this.stars) {
      const starPos = star.getStartPosition();

      // Calculate distance between player and star
      const distance = Phaser.Math.Distance.Between(
        playerPos.x, playerPos.y,
        starPos.x, starPos.y
      );

      // Check if collision occurred
      if (distance < collisionDistance) {
        this.player.resetToStart();
        const hasLivesLeft = this.gameState?.loseLife();

        if (hasLivesLeft) {
          console.log('Player hit a star! Lives remaining:', this.gameState?.getExtraLives());

        } else {
          console.log('Game Over!');
          // TODO: Handle game over
        }
      }
    }
  }

  private checkHazardCollisions(): void {
    const playerPos = this.player.getPosition();
    const collisionDistance = 20; // Distance threshold for collision

    for (const hazard of this.hazards) {
      const hazardPos = hazard.getPosition();

      // Calculate distance between player and hazard
      const distance = Phaser.Math.Distance.Between(
        playerPos.x, playerPos.y,
        hazardPos.x, hazardPos.y
      );

      // Check if collision occurred
      if (distance < collisionDistance) {
        this.player.resetToStart();
        const hasLivesLeft = this.gameState?.loseLife();

        if (hasLivesLeft) {
          console.log('Player hit a hazard! Lives remaining:', this.gameState?.getExtraLives());

        } else {
          console.log('Game Over!');
          // TODO: Handle game over
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