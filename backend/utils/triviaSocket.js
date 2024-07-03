const { response } = require("../app");
const Player = require("../models/player");
const Room = require("../models/room");

const sendTriviaQuestions = async (io, roomID) => {
  try {
    console.log("getting trivia data");
    const response = await fetch(
      "https://opentdb.com/api.php?amount=5&type-multiple",
      {
        mode: "cors",
      },
    );
    const data = await response.json();
    const round = 0;

    //Update database game data
    await Room.findOneAndUpdate(
      {
        code: roomID,
      },
      { state: { gameData: { data, round } } },
    );

    //Send trivia data to everyone in the room
    io.to(roomID).emit("game-data", { triviaData: data, round: round });
  } catch (error) {
    console.error("Error fetching trivia question: ", error);
  }
};

const handleTriviaAnswers = async (socket, correctAnswer, choice) => {
  try {
    await Player.findOneAndUpdate(
      {
        socketID: socket.id,
      },
      { wonBet: choice === correctAnswer },
      { new: true },
    );
  } catch (error) {
    console.log("Error setting trivia result: ", error);
  }
};

const setNextTriviaQuestion = async (io, roomID) => {
  try {
    const room = await Room.findOne({ code: roomID });

    if (!room) {
      console.log("Room not found");
      return;
    }

    const newRound = room.state.gameData.round + 1;

    if (room.state.round >= 5) {
      //End Game
      //io.to(roomID).emit("game-over");
      return;
    }
    // Update the room state
    room.state.gameData.round = newRound;
    await room.save();

    //Emit updated round to client
    io.to(roomID).emit("change-round", newRound);
  } catch (error) {
    console.log("Error changing round: ", error);
  }
};

module.exports = {
  sendTriviaQuestions,
  handleTriviaAnswers,
  setNextTriviaQuestion,
};
