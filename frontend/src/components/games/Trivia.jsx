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
      <div>
        <h2>Round: {round + 1} / 5</h2>
        {/* Decode html before displaying */}
        <h3>{he.decode(currentQuestion.question)}</h3>
        {!waitingMessage && (
          <div>
            {currentAnswers.map((answer, index) => (
              <button
                key={index}
                onClick={() => {
                  sendQuestionChoice(correct_answer, answer);
                  setWaitingMessage("Waiting for other players to answer...");
                }}
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
