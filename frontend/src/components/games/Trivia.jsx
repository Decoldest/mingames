import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import he from "he";
import { socket } from "../../socket";

Trivia.propTypes = {
  gameData: PropTypes.object,
  roomID: PropTypes.string,
  waitingMessage: PropTypes.string,
  setWaitingMessage: PropTypes.func,
};

export default function Trivia({
  gameData,
  roomID,
  waitingMessage,
  setWaitingMessage,
}) {
  const [triviaData, setTriviaData] = useState(null);
  const [round, setRound] = useState(null);

  useEffect(() => {
    //Set game data
    if (gameData) {
      const { triviaData, round } = gameData;
      setTriviaData(triviaData.results);
      setRound(round);
    }
  }, [gameData]);

  if (!triviaData || round === null) return <div>Loading...</div>;

  const currentQuestion = triviaData[round];

  //Shuffle question so it does not have the correct answer in constant position
  const { correct_answer, incorrect_answers } = currentQuestion;
  const currentAnswers = shuffleAnswers(
    incorrect_answers.concat(correct_answer),
  );

  //Send answer back to server
  const sendQuestionChoice = (correctAnswer, choice) => {
    socket.emit("trivia-answered", roomID, correctAnswer, choice);
    setWaitingMessage("");
  };

  return (
    <>
      <div className="trivia-container">
        <div className="trivia-header">
          <h3>Trivia</h3>
          <h3>Question {round + 1} of 5</h3>
        </div>
        {/* Decode html before displaying */}
        <div>
          <p>{he.decode(currentQuestion.category)}</p>
          <h1>{he.decode(currentQuestion.question)}</h1>
        </div>
        {!waitingMessage && (
          <div className="trivia-buttons-grid">
            {currentAnswers.map((answer, index) => (
              <button
                key={index}
                onClick={() => {
                  sendQuestionChoice(correct_answer, answer);
                  setWaitingMessage("Waiting for other players to answer...");
                }}
                className="game-button"
              >
                {he.decode(answer)}
              </button>
            ))}
          </div>
        )}
      </div>

      {waitingMessage && <h2>{waitingMessage}</h2>}
    </>
  );
}

// Shuffle answers so the orders are random, otherwise the correct answer would have constant position
const shuffleAnswers = (answers) => {
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }
  return answers;
};
