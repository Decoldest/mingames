const Room = require("../models/room");
const MAX_TIMER = 60000;
const TIMER_INTERVAL = 100;

const { handleButtonPressVoting } = require("./votingSocket");

const sendButtons = async (io, roomID, room) => {
  const { players } = room;

  const gameData = setButtonValues(players);

  room.state.gameData = gameData;
  await room.save();

  io.to(roomID).emit("game-data", gameData);
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

  io.to(roomID).emit("add-score", newScore);
};

// Start for game and emit time
const startButtonTimer = (io, roomID) => {
  let timer = MAX_TIMER;

  // Set interval to emit timer
  const timerID = setInterval(() => {
    io.to(roomID).emit("timer", (timer / 10).toFixed(1));
    timer--;
    if (timer <= 0) {
      clearInterval(timerID);
      endButtonGame(io, roomID);
    }
  }, TIMER_INTERVAL);
};

const endButtonGame = (io, roomID) => {
  io.to(roomID).emit("end-game");
};

const handleButtonResults = async (results, io, roomID) => {
  const room = await Room.findOne({ code: roomID }).populate("players");
  const { players } = room;

  const maxValue = Math.max(...Object.values(results));

  const drinkData = players.reduce((acc, player) => {
    const { username, wager } = player;
    //Handle ties
    const isWinner = results[username] === maxValue;
    acc[username] = {
      drinksToGive: isWinner ? Number(wager) : 0,
      myDrinks: isWinner ? 0 : Number(wager),
      won: isWinner,
      message: isWinner
        ? "You must have some practice."
        : "Just click faster bro.",
    };
    return acc;
  }, {});

  handleButtonPressVoting(io, roomID, drinkData);
};

module.exports = { sendButtons, updateScore, handleButtonResults, startButtonTimer };
