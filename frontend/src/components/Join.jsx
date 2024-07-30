import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "./Join.scss";
import back from "../assets/back.svg";

Join.propTypes = {
  handleCreateRoom: PropTypes.func,
  handleJoinRoom: PropTypes.func,
  error: PropTypes.string,
  errorHandler: PropTypes.func,
  username: PropTypes.string,
  usernameHandler: PropTypes.func,
  roomID: PropTypes.string,
  roomHandler: PropTypes.func,
};

export default function Join({
  handleCreateRoom,
  handleJoinRoom,
  error,
  errorHandler,
  username,
  usernameHandler,
  roomID,
  roomHandler,
}) {
  const [view, setView] = useState("landing");

  const handleBack = () => {
    setView("landing");
    // Go back to landing
    window.history.back();
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        setView("landing");
      }
      console.log(window.history);
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <section className="join flex flex-col items-center justify-start">
      <h1 className="title">Booze Bash</h1>
      <p>{`I hope you're thirsty`}</p>
      {view === "landing" ? (
        <div className="flex flex-col items-center sm:flex-row gap-6 md:gap-16 w-full">
          <button
            onClick={() => {
              setView("create");
              window.history.pushState({ view: "create" }, "");
            }}
            className="flex-grow main-button"
          >
            Create Party
          </button>
          <button
            onClick={() => {
              setView("join");
              window.history.pushState({ view: "join" }, "");
            }}
            className="flex-grow main-button"
          >
            Join Party
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 md:gap-16 w-full">
          <button
            onClick={() => {
              handleBack();
              errorHandler(null);
            }}
            className="back-button"
          >
            <img src={back} alt="Left Arrow" className="w-4" />
            Back
          </button>
          <div className="tag self-center">
            <h2>HELLO</h2>
            <p>my name is</p>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                usernameHandler(e.target.value);
                errorHandler(null);
              }}
              placeholder="Enter your name"
              className="w-full"
            />
          </div>
          {view === "create" ? (
            <button
              onClick={handleCreateRoom}
              className="w-full main-button self-center"
            >
              Create Room
            </button>
          ) : (
            <div className="flex flex-col w-full md:flex-row gap-4 items-center">
              <input
                type="text"
                value={roomID}
                onChange={(e) => {
                  roomHandler(e.target.value);
                  errorHandler(null);
                }}
                placeholder="Enter Room Code"
                className="flex-grow room-code"
              />
              <button onClick={handleJoinRoom} className="w-full main-button">
                Join Room
              </button>
            </div>
          )}
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </section>
  );
}
