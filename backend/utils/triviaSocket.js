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

    io.to(roomID).emit("game-data", { triviaData: data.results, round: 0 });
  } catch (error) {
    console.error("Error fetching trivia question: ", error);
  }
};

const handleTriviaAnswers = async (roomID, correctAnswer, choice) => {
  const player = await Player.findOne({ socketID: socket.id });
  if (choice === correctAnswer) {
    
  }
};

module.exports = { sendTriviaQuestions, handleTriviaAnswers };
