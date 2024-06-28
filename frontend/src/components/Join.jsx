import PropTypes from "prop-types";

Join.propTypes = {
  creatingRoom: PropTypes.bool,
  handleCreateRoom: PropTypes.func,
  handleJoinRoom: PropTypes.func,
  error: PropTypes.string,
  setError: PropTypes.func,
  username: PropTypes.string,
  setUsername: PropTypes.func,
  roomID: PropTypes.string,
  setRoomID: PropTypes.func,
};

export default function Join({
  creatingRoom,
  handleCreateRoom,
  handleJoinRoom,
  error,
  setError,
  username,
  setUsername,
  roomID,
  setRoomID
}) {

  return (
    <section>
      <h1>MiniGames.io</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          setError(null);
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
              setRoomID(e.target.value);
              setError(null);
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
