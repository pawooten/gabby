class GameState {
  private coinsCollected: number = 0;
  private extraLives: number = 3;
  private levelName: string = '';
  private totalCoins: number = 0;

  constructor(initialLives: number = 3, levelName: string = '', totalCoins: number = 0) {
    this.extraLives = initialLives;
    this.levelName = levelName;
    this.totalCoins = totalCoins;
  }

  collectCoin(): void {
    this.coinsCollected++;
  }

  getCoinsCollected(): number {
    return this.coinsCollected;
  }

  getTotalCoins(): number {
    return this.totalCoins;
  }

  setTotalCoins(total: number): void {
    this.totalCoins = total;
  }

  getLevelName(): string {
    return this.levelName;
  }

  setLevelName(name: string): void {
    this.levelName = name;
  }

  loseLife(): boolean {
    if (this.extraLives > 0) {
      this.extraLives--;
      return true;
    }
    return false;
  }

  gainLife(): void {
    this.extraLives++;
  }

  getExtraLives(): number {
    return this.extraLives;
  }

  reset(): void {
    this.coinsCollected = 0;
    this.extraLives = 3;
  }

  isGameOver(): boolean {
    return this.extraLives <= 0;
  }
}

export default GameState;
