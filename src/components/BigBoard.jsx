import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  TextField,
  Select,
  MenuItem,
  Button,
  Avatar,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import data from "../data/intern_project_data.json";

const SCOUT_KEYS = [
  { key: "ESPN Rank", label: "ESPN" },
  { key: "Sam Vecenie Rank", label: "Vecenie" },
  { key: "Kevin O'Connor Rank", label: "O'Connor" },
  { key: "Kyle Boone Rank", label: "Boone" },
  { key: "Gary Parrish Rank", label: "Parrish" },
];

const statKeys = ["pts", "reb", "ast", "fg%", "tp%", "ft%"];

const getMedalEmoji = (rank) => {
  if (rank === 0) return "🥇";
  if (rank === 1) return "🥈";
  if (rank === 2) return "🥉";
  return null;
};

const BigBoard = () => {
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("ESPN Rank");

  const bio = data.bio;
  const rankings = data.scoutRankings;
  const logs = data.game_logs;

  const statMap = {};
  for (let log of logs) {
    const id = log.playerId;
    if (!statMap[id]) {
      statMap[id] = { count: 1, ...log };
    } else {
      for (let key in log) {
        if (typeof log[key] === "number") {
          statMap[id][key] = (statMap[id][key] || 0) + log[key];
        }
      }
      statMap[id].count += 1;
    }
  }

  const playerStats = Object.keys(statMap).map((id) => {
    const count = statMap[id].count;
    const stats = {};
    for (let key of statKeys) {
      stats[key] = +(statMap[id][key] / count).toFixed(1);
    }
    return {
      playerId: parseInt(id),
      ...stats,
    };
  });

    const playerMedals = {};
  for (let statKey of statKeys) {
    const sorted = [...playerStats].sort((a, b) => (b[statKey] ?? 0) - (a[statKey] ?? 0));
    sorted.slice(0, 3).forEach((p, index) => {
      if (!playerMedals[p.playerId]) playerMedals[p.playerId] = [];
      playerMedals[p.playerId].push(getMedalEmoji(index));
    });
  }

  const getPlayerRanksData = (playerId) =>
    rankings.find((r) => r.playerId === playerId) || {};

  const getAverageRank = (playerId) => {
    const ranks = Object.entries(getPlayerRanksData(playerId))
      .filter(([key, val]) => key !== "playerId" && typeof val === "number")
      .map(([, val]) => val);
    if (ranks.length === 0) return null;
    return (ranks.reduce((a, b) => a + b, 0) / ranks.length).toFixed(1);
  };

  const sortedPlayers = [...bio].sort((a, b) => {
    const getSortVal = (p) => {
      const r = getPlayerRanksData(p.playerId);
      if (sortOption === "avg") return parseFloat(getAverageRank(p.playerId)) || Infinity;
      return r[sortOption] ?? Infinity;
    };
    return getSortVal(a) - getSortVal(b);
  });

  const visiblePlayers = sortedPlayers.filter((player) =>
    player.name.toLowerCase().includes(search.toLowerCase())
  );

    const renderRankChips = (player) => {
    const avgRank = parseFloat(getAverageRank(player.playerId));
    const ranks = getPlayerRanksData(player.playerId);
    return SCOUT_KEYS.map(({ key, label }) => {
      const rank = ranks[key];
      let color = "default";
      if (typeof rank === "number" && !isNaN(avgRank)) {
        const diff = rank - avgRank;
        if (diff <= -5) color = "success";
        else if (diff >= 5) color = "error";
      }
      const chipLabel =
        typeof rank === "number"
          ? `${label} Rank: ${rank}`
          : `${label}: NO RANK`;
      return <Chip key={key} label={chipLabel} color={color} size="small" />;
    });
  };

    return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          backgroundColor: "#0B4DA1",
          p: 3,
          borderRadius: 2,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <img src="/mavslogo.png" alt="Mavericks Logo" style={{ height: 48 }} />
          <Typography
            variant="h4"
            sx={{ color: "white", fontWeight: "bold", fontSize: { xs: "1.8rem", md: "2.4rem" } }}
          >
            Dallas Mavericks NBA Draft Hub
          </Typography>
        </Box>
        <Link to="/stats" style={{ textDecoration: "none" }}>
          <Button variant="contained" sx={{ backgroundColor: "white", color: "#0B4DA1" }}>
            Go to StatHub
          </Button>
        </Link>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          label="Search by Name"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <Select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          size="small"
        >
          {SCOUT_KEYS.map((s) => (
            <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>
          ))}
          <MenuItem value="avg">Average Rank</MenuItem>
        </Select>
      </Box>

      {visiblePlayers.map((player, index) => {
        const avgRank = parseFloat(getAverageRank(player.playerId));
        const medals = playerMedals[player.playerId] || [];

        return (
          <Link
            to={`/player?id=${player.playerId}`}
            key={player.playerId}
            style={{ textDecoration: "none" }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 2,
                backgroundColor: index % 2 === 0 ? "white" : "#b6d8fa",
                borderRadius: 2,
                "&:hover": {
                  boxShadow: 6,
                  cursor: "pointer",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                <Avatar src={player.photoUrl} alt={player.name} sx={{ width: 60, height: 60 }} />
                <Box sx={{ minWidth: 150 }}>
                  <Typography variant="h6">{player.name} {medals.join(" ")}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Rank: {isNaN(avgRank) ? "N/A" : avgRank}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, flexGrow: 1 }}>
                  {renderRankChips(player)}
                </Box>
                <Button
                  variant="outlined"
                  component={Link}
                  to={`/stats?id=${player.playerId}`}
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Stats →
                </Button>
              </Box>
            </Paper>
          </Link>
        );
      })}
    </Box>
  );
};

export default BigBoard;
