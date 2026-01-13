import Phaser from "phaser";
import GameState from "./game-state";

class Header {
  private scene: Phaser.Scene;
  private gameState: GameState;
  private levelNameText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;

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

    // Level name (top left)
    this.levelNameText = this.scene.add.text(
      padding,
      padding,
      `Level: ${this.gameState.getLevelName()}`,
      {
        fontSize,
        fontFamily,
        color
      }
    );

    // Coins collected (top center)
    this.coinsText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      padding,
      `Coins: ${this.gameState.getCoinsCollected()} / ${this.gameState.getTotalCoins()}`,
      {
        fontSize,
        fontFamily,
        color
      }
    );
    this.coinsText.setOrigin(0.5, 0);

    // Extra lives (top right)
    this.livesText = this.scene.add.text(
      this.scene.cameras.main.width - padding,
      padding,
      `Lives: ${this.gameState.getExtraLives()}`,
      {
        fontSize,
        fontFamily,
        color
      }
    );
    this.livesText.setOrigin(1, 0);
  }

  update(): void {
    // Update text to reflect current game state
    this.levelNameText.setText(`Level: ${this.gameState.getLevelName()}`);
    this.coinsText.setText(`Coins: ${this.gameState.getCoinsCollected()} / ${this.gameState.getTotalCoins()}`);
    this.livesText.setText(`Lives: ${this.gameState.getExtraLives()}`);
  }
}

export default Header;
