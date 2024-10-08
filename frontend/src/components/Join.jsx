import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import '@fontsource/caveat-brush';
import "./Join.scss";
import back from "../assets/back.svg";


Join.propTypes = {
  creatingRoom: PropTypes.bool,
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
  creatingRoom,
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
  const errorRef = useRef(null);

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

  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);


  return (
    <section className="join flex flex-col items-center justify-start">
      <h1 className="title">Booze Bash</h1>
      <p>{`I hope you're thirsty`}</p>
      {!creatingRoom ? (
        <div className="flex flex-col gap-4 md:gap-10 w-full ">
          <NameTag
            username={username}
            usernameHandler={usernameHandler}
            errorHandler={errorHandler}
          />
          <button onClick={handleJoinRoom} className="w-full main-button join-button">
            Join Room
          </button>
        </div>
      ) : view === "landing" ? (
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
          <NameTag
            username={username}
            usernameHandler={usernameHandler}
            errorHandler={errorHandler}
          />
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
              <button onClick={handleJoinRoom} className="w-full main-button join-button">
                Join Room
              </button>
            </div>
          )}
        </div>
      )}

{error && <div ref={errorRef} className="error">{error}</div>}
</section>
  );
}

NameTag.propTypes = {
  username: PropTypes.string,
  usernameHandler: PropTypes.func,
  errorHandler: PropTypes.func,
};

function NameTag({ username, usernameHandler, errorHandler }) {
  return (
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
        autoComplete="off"
        placeholder="Enter your name"
        className="w-full"
      />
    </div>
  );
}
