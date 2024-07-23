const Room = require("../models/room");

const sendButtonsAndStartTimer = async (io, roomID, room) => {
  const { players } = room;

  const gameData = setButtonValues(players);

  room.state.gameData = gameData;
  await room.save();

  io.to(roomID).emit("game-data", gameData);

  // startTimer(io, roomID);
};

const setButtonValues = (players) => {
  return players.reduce((accumulator, player) => {
    accumulator[player.username] = 0;
    return accumulator;
  }, {});
};

const updateScore = (io, roomID, username, score) => {
  const newScore = {
    [username]: score,
  };
  console.log(newScore);

  io.to(roomID).emit("add-score", newScore);
};

module.exports = { sendButtonsAndStartTimer, updateScore };
