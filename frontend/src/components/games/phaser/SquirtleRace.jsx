import Phaser from "phaser";
import { socket } from "../../../socket";
import PropTypes from "prop-types";

class RaceMain extends Phaser.Scene {
  constructor() {
    super({ key: "RaceMain" });
    this.socket = null;
    this.squirtles = [];
  }

  init(data) {
    this.gameData = data;
    this.racers = this.gameData.racers;
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.spritesheet("squirtle", "assets/squirtle-walking.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    const self = this;
    this.socket = socket;
    this.otherPlayers = [];
    this.add.image(0, 0, "sky").setOrigin(0, 0);

    this.racers.forEach((racer) => {
      console.log("adding ", racer);
      this.addPlayer(self, racer);
    });

    // Define animations
    this.anims.create({
      key: "wait",
      frames: [
        { key: "squirtle", frame: 0 },
        { key: "squirtle", frame: 2 },
      ],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("squirtle", { start: 0, end: 1 }),
      frameRate: 8, // Adjust frame rate to match your animation
      repeat: -1,
    });

    // Handle keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {}

  addPlayer(self, squirtleInfo) {
    const player = self.physics.add
      .sprite(squirtleInfo.x, squirtleInfo.y, "squirtle")
      .setOrigin(0.5, 0.5);

    player.id = squirtleInfo.id;

    this.squirtles[player.id] = player;
  }

  addOtherPlayer(self, squirtleInfo) {
    const otherPlayer = self.physics.add
      .sprite(squirtleInfo.x, squirtleInfo.y, "squirtle")
      .setOrigin(0.5, 0.5);

    otherPlayer.playerID = squirtleInfo.id;
  }
}

SquirtleRace.propTypes = {
  gameData: PropTypes.object,
};

export default function SquirtleRace({ gameData }) {
  const config = {
    type: Phaser.AUTO,
    parent: "squirtle-race-container",
    width: 800,
    height: 600,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
  };
  const game = new Phaser.Game(config);
  game.scene.add("RaceMain", RaceMain, true, gameData);

  return (
    <section>
      <div id="squirtle-race-container"></div>
    </section>
  );
}
