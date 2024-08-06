const Room = require("../models/room");
const { handlePotatoWinnerVoting } = require("./votingSocket");

const MAX_TIMER = 60000;
const TIMER_INTERVAL = 100;

const sendPlayers = async (io, roomID, room) => {
  const { players } = room;
  const gameData = giveRandomPersonPotato(players);

  room.state.gameData = gameData;
  await room.save();

  io.to(roomID).emit("game-data", gameData);
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
const startPotatoTimer = (io, roomID) => {
  let timer = MAX_TIMER;

  // Set interval to emit timer
  const timerID = setInterval(() => {
    io.to(roomID).emit("timer", (timer / 10).toFixed(1));
    timer--;
    if (timer <= 0) {
      clearInterval(timerID);
      endHotPotato(io, roomID);
    }
  }, TIMER_INTERVAL);
};

const endHotPotato = async (io, roomID) => {
  //Disable client button to pass potato
  io.to(roomID).emit("end-game");

  const room = await Room.findOne({ code: roomID }).populate("players");

  if (!room) return;

  const results = room.state.gameData;
  updateWinnersAndLoser(results, room, io, roomID);
};

const updateWinnersAndLoser = (results, room, io, roomID) => {
  const drinkData = {};

  room.players.forEach(async (player) => {
    // Update drink data - winner has drinks to give, loser drinks their wager
    if (results[player.username].hasPotato) {
      drinkData[player.username] = {
        drinksToGive: 0,
        myDrinks: Number(player.wager),
        won: false,
        message: "You got scorched by the potato",
      };
    } else {
      drinkData[player.username] = {
        drinksToGive: Number(player.wager),
        myDrinks: 0,
        won: true,
        message: "You didn't get burned by the potato.",
      };
    }
  });
  handlePotatoWinnerVoting(io, roomID, drinkData);
};

module.exports = { sendPlayers, giveHotPotato, startPotatoTimer };
