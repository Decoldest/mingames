const Room = require("../models/room");
const COUNTDOWN_DURATION = 6000;
const COUNTDOWN_INTERVAL = 1000;
const squirtleRaceUpdateInterval = 5000;
const MAX_SPEED = 50;
const MIN_SPEED = 30;
const INITIAL_X = 100;

const { handleRaceWinnerVoting } = require("./votingSocket");

const addRacerSquirtle = async (
  socket,
  io,
  squirtle,
  trainer,
  roomID,
  callback,
) => {
  try {
    if (!squirtle) {
      return callback({
        success: false,
        message: "Please enter a name.",
      });
    }

    const room = await Room.findOne({ code: roomID });

    const newSquirtle = {
      name: squirtle,
      trainer,
      id: socket.id,
      x: INITIAL_X,
      y: Math.floor(Math.random() * (600 - 100)) + 100,
    };

    // Initialize gameData if it's null
    if (!room.state.gameData) {
      room.state.gameData = {
        racers: [],
      };
    }

    room.state.gameData = {
      ...room.state.gameData,
      racers: [...room.state.gameData.racers, newSquirtle],
    };

    await room.save();

    callback({
      success: true,
      message: "Waiting for other players to name their Squirtle...",
    });

    checkAllSquirtlesNamed(room, roomID, io);
  } catch (error) {
    console.error("Error adding squirtle: ", error);
    callback({
      success: false,
      message: "An error occurred while adding the squirtle.",
    });
  }
};

//Sends an event to client if all players have a squirtle
const checkAllSquirtlesNamed = async (room, roomID, io) => {
  if (room.players.length === room.state.gameData.racers.length) {
    io.to(roomID).emit("game-data", room.state.gameData);
    io.to(roomID).emit("squirtle-squad-in");
    startCountDown(room, roomID, io);
  }
};

//Emit a countdown to the client
const startCountDown = async (room, roomID, io) => {
  let remainingTime = COUNTDOWN_DURATION;

  const intervalID = setInterval(async () => {
    remainingTime -= COUNTDOWN_INTERVAL;

    if (remainingTime <= 0) {
      clearInterval(intervalID);
      io.to(roomID).emit("countdown", "Go!");
      startSquirtleRace(room.state.gameData.racers, roomID, room, io);
    } else {
      let timerMessage =
        remainingTime > COUNTDOWN_DURATION - 3000
          ? "Squirtles Ready!"
          : Math.ceil(remainingTime / 1000);

      io.to(roomID).emit("countdown", timerMessage);
    }
  }, COUNTDOWN_INTERVAL);
};

//Start race by emmiting starting velocities
const startSquirtleRace = async (racers, roomID, room, io) => {
  //Immediately send velocities
  let velocities = generateRandVelocities(racers);
  io.to(roomID).emit("setVelocities", velocities);

  //Save isRacing in state to check if updates should be sent
  room.state.gameData.isRacing = true;
  await room.save();

  //Update velocities at set intervals
  const raceInterval = setInterval(() => {
    if (!room.state.gameData.isRacing) {
      clearInterval(raceInterval);
      return;
    }

    const velocities = generateRandVelocities(racers);

    io.to(roomID).emit("setVelocities", velocities);
  }, squirtleRaceUpdateInterval);

  setTimeout(() => {
    clearInterval(raceInterval);
  }, 10000);
};

const generateRandVelocities = (squirtles) => {
  const minCeiled = Math.ceil(MIN_SPEED);
  const maxFloored = Math.floor(MAX_SPEED);
  return squirtles.reduce((arr, squirtle) => {
    arr[squirtle.id] =
      Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled;
    return arr;
  }, {});
};

async function squirtleWon(roomID, io, squirtle) {
  await Room.findOneAndUpdate(
    { code: roomID },
    {
      $set: {
        "state.gameData.isRacing": false,
      },
    },
  );
  const winner = squirtle.name;
  const trainer = squirtle.trainer;

  io.to(roomID).emit("winner", winner, trainer);
  updateWinnerAndLosers(trainer, roomID, io);
}

const updateWinnerAndLosers = async (trainer, roomID, io) => {
  const room = await Room.findOne({ code: roomID }).populate("players");

  const drinkData = {};

  room.players.forEach((player) => {
    // Update drink data - winner has drinks to give, losers drink their wager
    if (player.username === trainer) {
      drinkData[player.username] = {
        drinksToGive: Number(player.wager),
        myDrinks: 0,
        won: true,
        message: "Your squirtle won! LFGGGG!",
      };
    } else {
      drinkData[player.username] = {
        drinksToGive: 0,
        myDrinks: Number(player.wager),
        won: false,
        message: "You lost! Get better bud!",
      };
    }
  });

  // Wait 2 seconds before starting voting process
  setTimeout(function () {
    
    eWinnerVoting(io, roomID, drinkData);
  }, 3000);
};

module.exports = {
  addRacerSquirtle,
  squirtleWon,
};
