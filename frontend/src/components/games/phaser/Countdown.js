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
    this.countdownListener = (message) => {
      this.updateCountdown(this, message);
    };
    socket.on("countdown", this.countdownListener);
  }

  /**
   *
   * @param {string | number} message
   */
  updateCountdown(self, message) {
    self.label.setText(message.toString());

    if (message === "Go!") {
      // Hide the label after displaying "Go!" for 500 ms
      self.scene.time.delayedCall(500, () => {
        self.label.setVisible(false);
      });
    }
  }

  destroy() {
    // Remove the countdown listener to prevent memory leaks or unwanted updates
    socket.off("countdown", this.countdownListener);

    if (this.label) {
      this.label.destroy();
      this.label = null;
    }
  }
}
