import PropTypes from "prop-types";
import "./Join.scss";

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
  return (
    <section className="join flex flex-col items-center justify-start py-12 w-5/6 sm:w-3/4 lg:w-2/3 mx-auto rounded-2xl">
  <h1>MiniGames.io</h1>
  {creatingRoom ? (
    <div className="flex flex-col gap-10 md:gap-16 w-5/6">
      <div className="w-full">
        <label htmlFor="username">Username</label>
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
      <div className="flex flex-col w-full md:flex-row gap-4 md:gap-20">
        <div className="flex-grow md:w-1/2">
          <h5>Starting The Party?</h5>
          <button onClick={handleCreateRoom} className="w-full main-button">Create Room</button>
        </div>
        <div className="flex-grow md:w-1/2">
          <h5>Joining A Party?</h5>
          <div className="flex flex-row w-full gap-2">
            <input
              type="text"
              value={roomID}
              onChange={(e) => {
                roomHandler(e.target.value);
                errorHandler(null);
              }}
              placeholder="Enter Room Code"
              className="shrink"
            />
            <button onClick={handleJoinRoom} className="main-button"
            >Join</button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full">
      <p>Joining room: {roomID}</p>
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
      <button onClick={handleJoinRoom} className="w-full main-button">Join Room</button>
    </div>
  )}
  {error && <div className="error">{error}</div>}
</section>

  );
}
