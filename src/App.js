// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Portfolio from "./portfolio/Portfolio";
import SignIn from "./login/SignIn";
import Code from "./code/Code";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/code" element={<Code />} />
      </Routes>
    </Router>
  );
}

export default App;
