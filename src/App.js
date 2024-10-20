// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Portfolio from "./portfolio/Portfolio";
import SignIn from "./login/SignIn";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
    </Router>
  );
}

export default App;
