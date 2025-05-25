import React, { useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Select,
  MenuItem,
  Avatar,
} from "@mui/material";
import { useLocation, Link } from "react-router-dom";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import data from "../data/intern_project_data.json";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const statKeys = [
  { key: "pts", label: "PPG" },
  { key: "reb", label: "RPG" },
  { key: "ast", label: "APG" },
  { key: "fg%", label: "FG%" },
  { key: "tp%", label: "3P%" },
  { key: "ft%", label: "FT%" },
];

const getMedalIcon = (rank) => {
  if (rank === 0) return "🥇";
  if (rank === 1) return "🥈";
  if (rank === 2) return "🥉";
  return null;
};

const radarOptions = {
  scales: {
    r: {
      beginAtZero: true,
      min: 0,
      max: 100,
      ticks: {
        stepSize: 20,
        backdropColor: "transparent",
      },
      pointLabels: {
        font: { size: 14 },
      },
    },
  },
  plugins: {
    legend: { position: "top" },
  },
};

const StatHub = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const playerId = parseInt(params.get("id"));

  const gameLogs = data.game_logs;

  const computeStats = () => {
    const grouped = {};
    for (const g of gameLogs) {
      const id = g.playerId;
      if (!grouped[id]) grouped[id] = { ...g, count: 1 };
      else {
        for (const key in g) {
          if (typeof g[key] === "number" && key !== "playerId") {
            grouped[id][key] += g[key];
          }
        }
        grouped[id].count++;
      }
    }

    const results = [];
    for (const id in grouped) {
      const p = data.bio.find((b) => b.playerId === parseInt(id));
      if (!p) continue;
      const g = grouped[id];
      const count = g.count;
      results.push({
        playerId: parseInt(id),
        name: p.name,
        photoUrl: p.photoUrl,
        pts: +(g.pts / count).toFixed(1),
        reb: +(g.reb / count).toFixed(1),
        ast: +(g.ast / count).toFixed(1),
        "fg%": +(g["fg%"] / count).toFixed(1),
        "tp%": +(g["tp%"] / count).toFixed(1),
        "ft%": +(g["ft%"] / count).toFixed(1),
      });
    }

    // Add percentile values
    statKeys.forEach(({ key }) => {
      const values = results.map((p) => p[key]).filter((v) => !isNaN(v)).sort((a, b) => a - b);
      results.forEach((p) => {
        const rank = values.findIndex((v) => v >= p[key]);
        const percentile = (rank / values.length) * 100;
        p[`${key}_percentile`] = Math.round(percentile);
      });
    });

    return results;
  };

  const allStats = computeStats();
  const [sortKey, setSortKey] = useState("pts");
  const [compareId, setCompareId] = useState("");

  const sorted = [...allStats].sort((a, b) => (b[sortKey] ?? 0) - (a[sortKey] ?? 0));
  const selected = allStats.find((p) => p.playerId === playerId);
  const compareTo = allStats.find((p) => p.playerId === parseInt(compareId));

  const radarData = selected
    ? {
        labels: statKeys.map((s) => s.label),
        datasets: [
          {
            label: selected.name,
            data: statKeys.map((s) => selected[`${s.key}_percentile`]),
            backgroundColor: "rgba(0, 128, 0, 0.2)",
            borderColor: "green",
            borderWidth: 2,
          },
          compareTo && {
            label: compareTo.name,
            data: statKeys.map((s) => compareTo[`${s.key}_percentile`]),
            backgroundColor: "rgba(255, 0, 0, 0.2)",
            borderColor: "red",
            borderWidth: 2,
          },
        ].filter(Boolean),
      }
    : null;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="body2" sx={{ mb: 2 }}>
        <Link to="/" style={{ textDecoration: "none", color: "#1976d2", fontWeight: "bold" }}>
          ← Back to Big Board
        </Link>
      </Typography>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
        Player Stats Hub
      </Typography>

      {selected && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar src={selected.photoUrl} alt={selected.name} sx={{ width: 80, height: 80 }} />
            <Typography variant="h5" fontWeight="bold">
              {selected.name}
            </Typography>
          </Box>

          <Box sx={{ mb: 4, p: 2, border: "2px solid #1976d2", borderRadius: 2, backgroundColor: "#e3f2fd" }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#1976d2" }}>
              {selected.name} — Your Selected Player
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              PPG: {selected.pts} | RPG: {selected.reb} | APG: {selected.ast}
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              FG%: {selected["fg%"]} | 3P%: {selected["tp%"]} | FT%: {selected["ft%"]}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Compare with another player
            </Typography>
            <Select
              value={compareId}
              onChange={(e) => setCompareId(e.target.value)}
              displayEmpty
              size="small"
            >
              <MenuItem value="">None</MenuItem>
              {allStats
                .filter((p) => p.playerId !== playerId)
                .map((p) => (
                  <MenuItem key={p.playerId} value={p.playerId}>
                    {p.name}
                  </MenuItem>
                ))}
            </Select>
          </Box>

          {radarData && (
            <Box sx={{ maxWidth: 600, mb: 4 }}>
              <Radar data={radarData} options={radarOptions} />
              <Typography variant="caption" sx={{ mt: 1, fontStyle: "italic", color: "gray" }}>
                * All radar values are percentiles (0 = lowest, 100 = highest)
              </Typography>
            </Box>
          )}
        </>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          Sort By
        </Typography>
        <Select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          size="small"
        >
          {statKeys.map((s) => (
            <MenuItem key={s.key} value={s.key}>
              {s.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {sorted.map((p, i) => (
        <Box key={p.playerId} sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={selected?.playerId === p.playerId ? "bold" : "normal"}>
            {getMedalIcon(i)} {p.name}
          </Typography>
          <Typography variant="body2">
            PPG: {p.pts} | RPG: {p.reb} | APG: {p.ast}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            FG%: {p["fg%"]} | 3P%: {p["tp%"]} | FT%: {p["ft%"]}
          </Typography>
          <Divider />
        </Box>
      ))}
    </Box>
  );
};

export default StatHub;
