const Room = require("../models/room");
const countdownDuration = 6000;
const countdownInterval = 1000;
const squirtleRaceUpdateInterval = 5000;
const maxSpeed = 30;
const minSpeed = 20;

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
      x: 75,
      y: Math.floor(Math.random() * 500) + 50,
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
  room.state.gameData = {
    ...room.state.gameData,
    remainingTime: countdownDuration,
  };

  const intervalId = setInterval(async () => {
    room.state.gameData.remainingTime -= countdownInterval;

    if (room.state.gameData.remainingTime <= 0) {
      clearInterval(intervalId);
      io.to(roomID).emit("countdown", "Go!");
      startSquirtleRace(room.state.gameData.racers, roomID, room, io);
    } else {
      let timerMessage =
        room.state.gameData.remainingTime > countdownDuration - 3000
          ? "Squirtles Ready!"
          : Math.ceil(room.state.gameData.remainingTime / 1000);
      io.to(roomID).emit("countdown", timerMessage);
      await room.save();
    }
  }, countdownInterval);
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
  }, 100000);
};

const generateRandVelocities = (squirtles) => {
  const minCeiled = Math.ceil(minSpeed);
  const maxFloored = Math.floor(maxSpeed);
  return squirtles.reduce((arr, squirtle) => {
    arr[squirtle.id] =
      Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled;
    return arr;
  }, {});
};

function squirtleWon(roomID, io, squirtle) {
  Room.findOneAndUpdate(
    { code: roomID },
    {
      $set: {
        "state.gameData.isRacing": false,
      },
    },
  );
  const { winner, trainer } = squirtle;
  io.to(roomID).emit("winner", winner, trainer);
}

module.exports = {
  addRacerSquirtle,
  squirtleWon,
};
