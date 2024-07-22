const Room = require("../models/room");

const sendPlayers = async (io, roomID, room) => {
  const { players } = room;
  const gameData = giveRandomPersonPotato(players);

  room.state.gameData = gameData;
  await room.save();

  io.to(roomID).emit("game-data", room.state.gameData);
};

//Create a new array with the player usernames and assign a random potato
const giveRandomPersonPotato = (players) => {
  const randomIndex = getRandomElement(players);

  return players.reduce((accumulator, player, index) => {
    accumulator[player.username] = { hasPotato: index === randomIndex };
    return accumulator;
  }, {});
};

//Return random array element
const getRandomElement = (array) => {
  return Math.floor(Math.random() * array.length);
};

const giveHotPotato = async (io, roomID, giver, receiver) => {
  const potatoUpdate = {
    [`state.gameData.${giver}.hasPotato`]: false,
    [`state.gameData.${receiver}.hasPotato`]: true,
  };

  // Apply the potatoUpdate to the database
  const updatedRoom = await Room.findOneAndUpdate(
    { code: roomID },
    { $set: potatoUpdate },
    { new: true },
  );

  io.to(roomID).emit("threw-potato", updatedRoom.state.gameData);
};

module.exports = { sendPlayers, giveHotPotato };
