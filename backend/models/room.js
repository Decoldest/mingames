const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const roomSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  players: [{ type: Schema.Types.ObjectId, ref: "player" }],
  wagers: {
    type: Map,
    of: Number,
    default: {},
  },
  state: {
    waiting: { type: Boolean, default: true },
    playing: { type: Boolean, default: false },
    isWagering: { type: Boolean, default: false },
    votingData: { type: Object },
    selectedGame: { type: String },
    gameData: { type: Object, default: null },
  },
});

const Room = mongoose.model("room", roomSchema);
module.exports = Room;
