const Room = require("../models/room");

const MAX_TIMER = 600;
const TIMER_INTERVAL = 100;

const sendPlayersAndStartTimer = async (io, roomID, room) => {
  const { players } = room;
  const gameData = giveRandomPersonPotato(players);

  room.state.gameData = gameData;
  await room.save();

  io.to(roomID).emit("game-data", room.state.gameData);

  startTimer(io, roomID);
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

// Start for game and emit time
const startTimer = (io, roomID) => {
  let timer = MAX_TIMER;

  // Set interval to emit timer
  const timerID = setInterval(() => {
    io.to(roomID).emit("timer", (timer / 10).toFixed(1));
    timer--;
    if (timer <= 0) {
      clearInterval(timerID);
    }
  }, TIMER_INTERVAL);
};

module.exports = { sendPlayersAndStartTimer, giveHotPotato };
