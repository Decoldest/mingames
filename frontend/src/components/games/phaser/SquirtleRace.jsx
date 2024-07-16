import Phaser from "phaser";
import { socket } from "../../../socket";
import PropTypes from "prop-types";
import Countdown from "./Countdown";

class RaceMain extends Phaser.Scene {
  constructor() {
    super({ key: "RaceMain" });
    this.socket = null;
    this.squirtles = {};
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
    this.squirtles = this.physics.add.group();
    this.add.image(0, 0, "sky").setOrigin(0, 0);

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
      frameRate: 12,
      repeat: -1,
    });

    this.racers.forEach((racer) => {
      addPlayer(self, racer);
    });

    //Call waiting animation for all squirtles
    this.wait();

    const timerLabel = this.add.text(300, 100, "", { fontSize: 40 });
    timerLabel.setOrigin(0.5, 0.5);

    this.countdown = new Countdown(this, timerLabel);

    // Handle keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();

    //Helper function to add a squirtle sprite into the game
    function addPlayer(self, squirtleInfo) {
      const player = self.physics.add
        .sprite(squirtleInfo.x, squirtleInfo.y, "squirtle")
        .setOrigin(0.5, 0.5);

      player.setScale(2);
      player.id = squirtleInfo.id;

      self.squirtles.add(player);
    }

    this.socket.on("setVelocities", (velocities) => {
      console.log(velocities);
      this.updateVelocities(velocities);
    });
  }

  wait() {
    this.squirtles.getChildren().forEach((squirtle) => {
      squirtle.anims.play("wait", true);
    });
  }

  //Updates all squirtle velocities when event sent by server
  updateVelocities(velocities) {
    this.squirtles.getChildren().forEach((squirtle) => {
      squirtle.setVelocityX(velocities[squirtle.id]);
      squirtle.anims.play("walk", true);
    });
  }

  update() {}

  handleCountdownFinished() {}
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
    pixelArt: true,
    antialias: false,
  };
  const game = new Phaser.Game(config);
  game.scene.add("RaceMain", RaceMain, true, gameData);

  return (
    <section>
      <div id="squirtle-race-container"></div>
    </section>
  );
}
