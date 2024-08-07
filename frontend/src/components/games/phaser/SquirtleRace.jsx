import Phaser from "phaser";
import { socket } from "../../../socket";
import PropTypes from "prop-types";
import Countdown from "./Countdown";
import { useEffect, useRef } from "react";

class RaceMain extends Phaser.Scene {
  constructor() {
    super({ key: "RaceMain" });
    this.socket = null;
    this.squirtles = {};
    this.mySquirtle = null;
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

    // Call waiting animation for all squirtles
    this.squirtles.children.iterate((squirtle) => {
      squirtle.anims.play("wait");

      // Save the user's squirtle in reference for win condition checking
      if (squirtle.id === this.socket.id) {
        this.mySquirtle = squirtle;
      }
    });

    // Draw timer and start countdown
    const timerLabel = this.add.text(this.gameWidth / 2, 300, "", {
      fontSize: 40,
    });
    timerLabel.setOrigin(0.5, 0.5);

    this.countdown = new Countdown(this, timerLabel);

    //Helper function to add a squirtle sprite into the game
    function addPlayer(self, squirtleInfo) {
      const player = self.physics.add
        .sprite(squirtleInfo.x, squirtleInfo.y, "squirtle")
        .setOrigin(0.5, 0.5);

      player.setScale(2);
      const { id, name, trainer } = squirtleInfo;
      player.id = id;
      player.name = name;
      player.trainer = trainer;

      // Add nametag on top of squirtle
      const playerName = self.add.text(
        squirtleInfo.x,
        squirtleInfo.y - 10,
        squirtleInfo.name,
        {
          fontSize: "16px",
          fill: "#fff",
        },
      );

      playerName.setOrigin(0.5, 0.5);
      player.nameText = playerName;

      self.squirtles.add(player);
    }

    // Update velocities on setVelocities event
    this.socket.on("setVelocities", (velocities) => {
      if (this.racing === true) {
        this.updateVelocities(velocities);
      }
    });

    this.socket.on("winner", (winner, trainer) => {
      this.racing = false;

      // Stop animations and movement
      this.stop();

      this.add
        .text(
          this.gameWidth / 2,
          300,
          `${trainer}'s squirtle "${winner}" won!`,
          {
            fontSize: 40,
          },
        )
        .setOrigin(0.5, 0.5);
    });
  }

  stop() {
    this.squirtles.children.iterate((squirtle) => {
      squirtle.setVelocityX(0);
      squirtle.anims.play("wait", true);
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
        squirtle.nameText.setPosition(squirtle.x, squirtle.y - 10);
      });
      this.checkWonRace(this.mySquirtle, this.roomID);
    }
  }

  checkWonRace(squirtle, roomID) {
    if (squirtle.body.x >= this.gameWidth - 60) {
      const { name, trainer } = squirtle;
      this.socket.emit("won-race", { name, trainer }, roomID);
    }
  }
}

SquirtleRace.propTypes = {
  data: PropTypes.object,
};

export default function SquirtleRace({ data }) {
  const gameRef = useRef(null);

  useEffect(() => {
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
      callbacks: {
        postBoot: (game) => {
          const canvas = game.canvas;
          const container = document.getElementById("squirtle-race-container");
          container.appendChild(canvas);
        },
      },
    };
    const game = new Phaser.Game(config);
    game.scene.add("RaceMain", RaceMain, true, data);
    gameRef.current = game;

    // Show orientation change on small screens credit - Tajammal Maqbool
    const OnChangeScreen = () => {
      let isLandscape = screen.orientation.type.includes("landscape");
      let rotateAlert = document.getElementById("rotateAlert");
      if (rotateAlert) {
        if (isLandscape) {
          if (rotateAlert.classList.contains("flex")) {
            rotateAlert.classList.replace("flex", "hidden");
          } else {
            rotateAlert.classList.add("hidden");
          }
        } else {
          if (rotateAlert.classList.contains("hidden")) {
            rotateAlert.classList.replace("hidden", "flex");
          } else {
            rotateAlert.classList.add("flex");
          }
        }
      }
    };
    OnChangeScreen();

    let _orientation =
      screen.orientation || screen.mozOrientation || screen.msOrientation;
    _orientation.addEventListener("change", function () {
      OnChangeScreen();
    });
    window.addEventListener("resize", function () {
      OnChangeScreen();
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }

      _orientation.removeEventListener("change", OnChangeScreen);
      window.removeEventListener("resize", OnChangeScreen);
    };
  }, [data]);

  return (
    <>
      <div id="squirtle-race-container" className="h-screen w-screen">
        <div
          className="hidden flex-col items-center justify-center bg-[#93c8d0] w-full h-screen"
          id="rotateAlert"
        >
          <svg
            className="w-20 h-20 sm:w-32 sm:h-32 fill-white"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21.323 8.616l-4.94-4.94a1.251 1.251 0 0 0-1.767 0l-10.94 10.94a1.251 1.251 0 0 0 0 1.768l4.94 4.94a1.25 1.25 0 0 0 1.768 0l10.94-10.94a1.251 1.251 0 0 0 0-1.768zM14 5.707L19.293 11 11.5 18.793 6.207 13.5zm-4.323 14.91a.25.25 0 0 1-.354 0l-1.47-1.47.5-.5-2-2-.5.5-1.47-1.47a.25.25 0 0 1 0-.354L5.5 14.207l5.293 5.293zm10.94-10.94l-.617.616L14.707 5l.616-.616a.25.25 0 0 1 .354 0l4.94 4.94a.25.25 0 0 1 0 .353zm1.394 6.265V18a3.003 3.003 0 0 1-3 3h-3.292l1.635 1.634-.707.707-2.848-2.847 2.848-2.848.707.707L15.707 20h3.304a2.002 2.002 0 0 0 2-2v-2.058zM4 9H3V7a3.003 3.003 0 0 1 3-3h3.293L7.646 2.354l.707-.707 2.848 2.847L8.354 7.34l-.707-.707L9.28 5H6a2.002 2.002 0 0 0-2 2z" />
            <path fill="none" d="M0 0h24v24H0z" />
          </svg>
          <span className="font-sans text-white text-center block text-md sm:text-2xl">
            Please rotate your device to landscape mode
          </span>
        </div>
      </div>
    </>
  );
}
