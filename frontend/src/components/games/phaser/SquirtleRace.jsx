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
    this.gameData = data.gameData;
    this.roomID = data.roomID;

    this.racers = this.gameData.racers;
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("map", "assets/map.jpeg");
    this.load.spritesheet("squirtle", "assets/squirtle-walking.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    const self = this;
    this.socket = socket;
    this.gameWidth = this.sys.game.canvas.width;
    this.gameHeight = this.sys.game.canvas.height;
    this.racing = true;

    this.squirtles = this.physics.add.group();
    this.add.image(0, 0, "map").setOrigin(0, 0);

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
    this.squirtles.children.iterate((squirtle) => {
      squirtle.anims.play("wait");
    });

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

      player.setData("name", squirtleInfo.name);
      player.setData("trainer", squirtleInfo.trainer);

      const playerName = self.add.text(
        squirtleInfo.x,
        squirtleInfo.y - 5,
        squirtleInfo.name,
        {
          fontSize: "16px",
          fill: "#fff",
        },
      );
      const positionX = self.add.text(
        squirtleInfo.x,
        squirtleInfo.y + 20,
        `X: ${squirtleInfo.x}`,
        {
          fontSize: "16px",
          fill: "#fff",
        },
      );
      playerName.setOrigin(0.5, 0.5);
      positionX.setOrigin(0.5, 0.5);
      player.nameText = playerName;
      player.positionXText = positionX;

      self.squirtles.add(player, "johnny");
    }

    this.socket.on("setVelocities", (velocities) => {
      if (this.racing === true) {
        this.updateVelocities(velocities);
      }
    });

    this.socket.on("winner", (winner, trainer) => {
      this.racing = false;

      this.squirtles.children.iterate((squirtle) => {
        squirtle.setVelocityX(0);
        squirtle.anims.play("wait", true);
      });
      console.log(winner, trainer);
    });
  }

  //Updates all squirtle velocities when event sent by server
  updateVelocities(velocities) {
    this.squirtles.children.iterate((squirtle) => {
      squirtle.setVelocityX(velocities[squirtle.id]);
      squirtle.anims.play("walk", true);
    });
  }

  update() {
    if (this.racing) {
      this.squirtles.children.iterate((squirtle) => {
        squirtle.nameText.setPosition(squirtle.x, squirtle.y - 50);
        squirtle.positionXText.setPosition(squirtle.x, squirtle.y + 20);
        squirtle.positionXText.setText(`X: ${squirtle.x.toFixed(2)}`);
        this.checkWonRace(squirtle, this.roomID);
      });
    }
  }

  checkWonRace(squirtle, roomID) {
    if (squirtle.body.x >= this.gameWidth - 50) {
      const { name, trainer } = squirtle.data.values;
      this.socket.emit("won-race", { name, trainer }, roomID);
    }
  }
}

SquirtleRace.propTypes = {
  data: PropTypes.object,
};

export default function SquirtleRace({ data }) {
  const config = {
    type: Phaser.AUTO,
    parent: "squirtle-race-container",
    width: 1280,
    height: 720,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    pixelArt: true,
    antialias: false,
    fps: {
      target: 30,
      forceSetTimeOut: true,
    },
    autoFocus: false,
  };
  const game = new Phaser.Game(config);
  game.scene.add("RaceMain", RaceMain, true, data);

  return (
    <section>
      <div id="squirtle-race-container"></div>
    </section>
  );
}
