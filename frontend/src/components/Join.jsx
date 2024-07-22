import PropTypes from "prop-types";

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
    <section>
      <h1>MiniGames.io</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => {
          usernameHandler(e.target.value);
          errorHandler(null);
        }}
        placeholder="Enter your name"
      />
      {creatingRoom && (
        <>
          <button onClick={handleCreateRoom}>Create Room</button>
          <input
            type="text"
            value={roomID}
            onChange={(e) => {
              roomHandler(e.target.value);
              errorHandler(null);
            }}
            placeholder="Enter Room ID"
          />
        </>
      )}
      <button onClick={handleJoinRoom}>Join Room</button>
      {error && <div className="error">{error}</div>}
    </section>
  );
}
