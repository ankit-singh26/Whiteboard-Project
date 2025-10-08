import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import WhiteBoard from "./pages/WhiteBoard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board/:id" element={<WhiteBoard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
