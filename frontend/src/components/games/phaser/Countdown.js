import { socket } from "../../../socket";

export default class Countdown {
  /** @type {Phaser.Scene} */
  scene;

  /** @type {Phaser.GameObjects.Text} */
  label;

  /**
   *
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.Text} label
   */
  constructor(scene, label) {
    this.scene = scene;
    this.label = label;

    // Listen for countdown updates from the server
    socket.on("countdown", (message) => {
      this.updateCountdown(message);
    });
  }

  /**
   *
   * @param {string | number} message
   */
  updateCountdown(message) {
    this.label.setText(message.toString());

    if (message === "Go!") {
      // Hide the label after displaying "Go!" for 500 ms
      this.scene.time.delayedCall(500, () => {
        this.label.setVisible(false);
      });
    }
  }
}
