import Phaser from "phaser";

class Example extends Phaser.Scene {
  preload() {
    this.load.image('gabby', 'assets/gabby.png');
  }

  create() {
    this.add.image(400, 300, 'gabby').setScale(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: Example,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 200 }
    }
  }
};

export const exampleGame = new Phaser.Game(config);