const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  socketID: {
    type: String,
    required: true,
  },
  wager: {
    type: Number,
    default: -1,
  },
  isPartyLeader: {
    type: Boolean,
  },
  wonBet: {
    type: Boolean,
  },
});

const Player = mongoose.model("player", playerSchema);
module.exports = Player;
