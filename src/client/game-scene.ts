import Phaser from "phaser";

import { Level } from "./level";
import level_0_1 from "./levels/0-1.json";
import level_1_1 from "./levels/1-1.json";
import Star from "./star";
import Coin from "./coin";
import GameState from "./game-state";
import Header from "./header";
import Player from "./player";
import Hazard from "./hazard";
import { Constants } from "./constants";

class GameScene extends Phaser.Scene {

  private readonly levels = new Map<string, Level>([
    ['0-1', level_0_1 as Level],
    ['1-1', level_1_1 as Level]
  ]);

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
  private deathLocationMarkers: Phaser.GameObjects.Graphics[] = [];
  private level: Level | null = null;

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
    // Get level name from URL query parameter, default to '0-1'
    const urlParams = new URLSearchParams(window.location.search);
    const levelName = urlParams.get('level') || '0-1';

    // Get the level from compiled levels
    this.level = this.levels.get(levelName) || this.levels.get('0-1')!;

    if (!this.level) {
      console.error('Failed to load level data');
      return;
    }

    const cells: string[][] = [];
    for (const row of this.level.static) {
      cells.push(row.split('').map(abbr => this.colorNamesByAbbreviation.get(abbr) || ''));
    }

    const cellDimensions = { width: Constants.Cell.Size, height: Constants.Cell.Size };
    const center = { x: Constants.Center.x, y: Constants.Center.y };

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
    for (const [rowIndex, row] of this.level.items.entries()) {
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

    this.gameState = new GameState(3, this.level.name, totalCoins);
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
        this.drawDeathLocationMarker(starPos.x, starPos.y);
        this.player.resetToStart();
        const hasLivesLeft = this.gameState?.loseLife();

        if (hasLivesLeft) {
          console.log('Player hit a star! Lives remaining:', this.gameState?.getExtraLives());

        } else {
          console.log('Game Over!');
          this.clearDeathLocationMarkers();
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
        this.drawDeathLocationMarker(hazardPos.x, hazardPos.y);
        this.player.resetToStart();
        const hasLivesLeft = this.gameState?.loseLife();

        if (hasLivesLeft) {
          console.log('Player hit a hazard! Lives remaining:', this.gameState?.getExtraLives());

        } else {
          console.log('Game Over!');
          this.clearDeathLocationMarkers();
          // TODO: Handle game over
        }
      }
    }
  }

  private drawDeathLocationMarker(x: number, y: number): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(
      Constants.DeathLocationMarker.LineWidth, Constants.DeathLocationMarker.Color, Constants.DeathLocationMarker.Alpha);
    graphics.beginPath();
    graphics.moveTo(x - Constants.DeathLocationMarker.Size, y - Constants.DeathLocationMarker.Size);
    graphics.lineTo(x + Constants.DeathLocationMarker.Size, y + Constants.DeathLocationMarker.Size);
    graphics.moveTo(x + Constants.DeathLocationMarker.Size, y - Constants.DeathLocationMarker.Size);
    graphics.lineTo(x - Constants.DeathLocationMarker.Size, y + Constants.DeathLocationMarker.Size);
    graphics.strokePath();
    this.deathLocationMarkers.push(graphics);
  }

  private clearDeathLocationMarkers(): void {
    // Clear all death markers when game is over
    for (const marker of this.deathLocationMarkers) {
      marker.destroy();
    }
    this.deathLocationMarkers = [];
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