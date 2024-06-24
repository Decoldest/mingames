const mongoose = require("mongoose");

const Schema = mongoose.Schema;


const roomSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  players: [{ type: Schema.Types.ObjectId, ref: "Player" }],
  isJoin: {
    type: Boolean,
    default: true,
  },
  wagers: {
    type: Map,
    of: Number,
    default: {},
  },
  votes: {
    type: Map,
    of: Number,
    default: {},
  },
});

const Room = mongoose.model("room", roomSchema);
module.exports = Room;
