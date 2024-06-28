import Homepage from "./components/Homepage";
import Room from "./components/Room";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./components/UserContext"

function App() {
  return (
    <>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={<Homepage />} />
            <Route path="/:roomID" element={<Room />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </>
  );
}

export default App;
