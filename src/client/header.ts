import Phaser from "phaser";
import GameState from "./game-state";
import Coin from "./coin";

class Header {
  private scene: Phaser.Scene;
  private gameState: GameState;
  private background!: Phaser.GameObjects.Rectangle;
  private levelNameText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private coin!: Coin;
  private livesText!: Phaser.GameObjects.Text;
  private heartImage!: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, gameState: GameState) {
    this.scene = scene;
    this.gameState = gameState;
    this.createHeader();
  }

  private createHeader(): void {
    const padding = 10;
    const fontSize = '16px';
    const fontFamily = 'Arial';
    const color = '#ffffff';
    const headerHeight = 60;
    const margin = 20;
    const centerX = this.scene.cameras.main.width / 2;
    const headerWidth = 200;

    // Add lilac background with border
    this.background = this.scene.add.rectangle(
      centerX,
      headerHeight / 2 + margin / 2,
      headerWidth,
      headerHeight,
      0xC8A2C8 // Lilac color
    );
    this.background.setOrigin(0.5, 0.5);
    this.background.setStrokeStyle(2, 0x9370DB); // Darker purple border

    // Level name (centered at top)
    this.levelNameText = this.scene.add.text(
      centerX,
      padding + margin / 2,
      `${this.gameState.getLevelName()}`,
      {
        fontSize,
        fontFamily,
        color
      }
    );
    this.levelNameText.setOrigin(0.5, 0);

    // Coins collected (left side, below level name)
    const statsY = padding + 25 + margin / 2;

    // Add coin icon using Coin class
    this.coin = new Coin(this.scene, centerX - 80, statsY + 8);
    this.coin.getSprite().setScale(0.5);

    this.coinsText = this.scene.add.text(
      centerX - 50,
      statsY,
      `${this.gameState.getCoinsCollected()} / ${this.gameState.getTotalCoins()}`,
      {
        fontSize,
        fontFamily,
        color
      }
    );
    this.coinsText.setOrigin(0, 0);

    // Extra lives (right side, below level name)
    // Add heart icon
    this.heartImage = this.scene.add.image(centerX + 30, statsY + 8, 'heart');
    this.heartImage.setScale(0.5);

    this.livesText = this.scene.add.text(
      centerX + 60,
      statsY,
      `${this.gameState.getExtraLives()}`,
      {
        fontSize,
        fontFamily,
        color
      }
    );
    this.livesText.setOrigin(0, 0);
  }

  update(): void {
    // Update text to reflect current game state
    this.levelNameText.setText(`${this.gameState.getLevelName()}`);
    this.coinsText.setText(`${this.gameState.getCoinsCollected()} / ${this.gameState.getTotalCoins()}`);
    this.livesText.setText(`${this.gameState.getExtraLives()}`);
  }
}

export default Header;
