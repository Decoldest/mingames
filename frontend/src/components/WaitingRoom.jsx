import PropTypes from "prop-types";

WaitingRoom.propTypes = {
  roomID: PropTypes.string,
};

export default function WaitingRoom({ roomID }) {
  return (
    <section>
      <h1>{roomID}</h1>
      Waiting For players to join...
    </section>
  );
}
