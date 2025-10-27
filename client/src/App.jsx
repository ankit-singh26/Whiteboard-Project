import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import WhiteBoard from "./pages/WhiteBoard";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/whiteboard/:roomId" element={<WhiteBoard />} />
      </Routes>
    </>
  );
}

export default App;
