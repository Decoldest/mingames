const Room = require("../models/room");
const defaultSpeed = 0;

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
      speed: defaultSpeed,
      id: socket.id,
      x: Math.floor(Math.random() * 500) + 50,
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
  }
};

module.exports = {
  addRacerSquirtle,
};
