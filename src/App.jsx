import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BigBoard from './components/BigBoard';
import PlayerProfile from './components/PlayerProfile';
import StatHub from './components/StatHub';

function App() {
  const [players, setPlayers] = useState([]);

  // You can load and pass players here later if needed
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BigBoard players={players} />} />
        <Route path="/player" element={<PlayerProfile />} />
        <Route path="/stats" element={<StatHub />} />
      </Routes>
    </Router>
  );
}

export default App;
