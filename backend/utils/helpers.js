const Player = require("../models/player");
const Room = require("../models/room");

// Error helper
const handleError = (socket, errorMessage, caughtError = null) => {
  socket.emit("error", errorMessage);
  console.log(errorMessage, caughtError);
};

// Create and return player
const createPlayer = async (username, socketID, isPartyLeader = false) => {
  const player = new Player({
    username,
    socketID,
    isPartyLeader,
    wonBet: null,
  });
  return await player.save();
};

const createRoom = async(playerID, roomID) => {
  const room = new Room({
    code: roomID,
    players: [playerID],
    isJoin: true,
    wagers: {},
    votes: {},
    state: {
      waiting: true,
      playing: false,
      isWagering: false,
      selectedGame: null,
    },
  });
  return await room.save();
}



module.exports = { handleError, createPlayer, createRoom };
