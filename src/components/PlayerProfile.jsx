import React, { useState } from "react";
import {
  Box,
  Typography,
  Divider,
  LinearProgress,
  Switch,
  FormControlLabel,
  TextField,
  Button,
} from "@mui/material";
import { useLocation, Link } from "react-router-dom";
import data from "../data/intern_project_data.json";

const getOrdinalSuffix = (n) => {
  const j = n % 10, k = n % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

const getGradientColor = (percentile) => {
  if (percentile <= 50) {
    const p = percentile / 50;
    return `rgb(${Math.round(139 + (128 - 139) * p)}, ${Math.round(0 + 128 * p)}, ${Math.round(0 + 128 * p)})`; // red to gray
  } else {
    const p = (percentile - 50) / 50;
    return `rgb(${Math.round(128 - 128 * p)}, ${Math.round(128 + (127 * p))}, ${Math.round(128 - 128 * p)})`; // gray to green
  }
};

const calculatePercentile = (value, allValues) => {
  if (!value || allValues.length === 0) return null;
  const sorted = [...allValues].sort((a, b) => a - b);
  const index = sorted.findIndex((v) => v >= value);
  if (index === -1) return 100;
  const percentile = (index / sorted.length) * 100;
  return Math.round(percentile);
};

const PlayerProfile = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const playerId = parseInt(params.get("id"));

  const player = data.bio.find((p) => p.playerId === playerId);
  const playerMeasurements = data.measurements.find((m) => m.playerId === playerId);
  const allMeasurements = data.measurements;

  const [useMaxVertical, setUseMaxVertical] = useState(true);
  const [scoutingNote, setScoutingNote] = useState("");
  const [submittedNotes, setSubmittedNotes] = useState([]);

  if (!player) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5">Player not found</Typography>
      </Box>
    );
  }

  const handleSubmit = () => {
    if (scoutingNote.trim()) {
      setSubmittedNotes([...submittedNotes, scoutingNote.trim()]);
      setScoutingNote("");
    }
  };

  const vertKey = useMaxVertical ? "maxVertical" : "noStepVertical";

  const getAllValues = (key) =>
    allMeasurements.map((m) => parseFloat(m[key])).filter((v) => !isNaN(v));

  const vertical = playerMeasurements?.[vertKey];
  const wingspan = playerMeasurements?.wingspan;
  const sprint = playerMeasurements?.sprint;

  const verticalPercentile = calculatePercentile(vertical, getAllValues(vertKey));
  const wingspanPercentile = calculatePercentile(wingspan, getAllValues("wingspan"));
  const sprintPercentile = calculatePercentile(sprint, getAllValues("sprint"));

  const renderBar = (label, value, percentile) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" gutterBottom>
        {label}: {value ?? "N/A"}{" "}
        {percentile != null && `(${percentile}${getOrdinalSuffix(percentile)} %)`}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={percentile ?? 0}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: "#eee",
          "& .MuiLinearProgress-bar": {
            backgroundColor: getGradientColor(percentile ?? 0),
          },
        }}
      />
    </Box>
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="body2" sx={{ mb: 2 }}>
        <Link to="/" style={{ textDecoration: "none", color: "#1976d2", fontWeight: "bold" }}>
          ← Back to Big Board
        </Link>
      </Typography>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {player.name}
      </Typography>

      {player.photoUrl && (
        <img
          src={player.photoUrl}
          alt={player.name}
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "1rem",
          }}
        />
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="body1"><strong>Height:</strong> {player.height || "N/A"}</Typography>
      <Typography variant="body1"><strong>Weight:</strong> {player.weight || "N/A"}</Typography>
      <Typography variant="body1"><strong>Team:</strong> {player.currentTeam || "N/A"}</Typography>
      <Typography variant="body1"><strong>League:</strong> {player.league || "N/A"}</Typography>


      <Divider sx={{ my: 3 }} />

      <FormControlLabel
        control={
          <Switch
            checked={useMaxVertical}
            onChange={() => setUseMaxVertical(!useMaxVertical)}
          />
        }
        label={`Showing ${useMaxVertical ? "Max" : "No-Step"} Vertical`}
      />

      <Box sx={{ mt: 2 }}>
        {renderBar(useMaxVertical ? "Max Vertical" : "No-Step Vertical", vertical, verticalPercentile)}
        {renderBar("Wingspan", wingspan, wingspanPercentile)}
        {renderBar("Sprint Speed", sprint, sprintPercentile)}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6">Add Scouting Report</Typography>
      <TextField
        multiline
        minRows={3}
        value={scoutingNote}
        onChange={(e) => setScoutingNote(e.target.value)}
        placeholder="Enter your scouting notes..."
        fullWidth
        sx={{ my: 2 }}
      />
      <Button variant="contained" onClick={handleSubmit}>Submit Report</Button>

      {submittedNotes.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Submitted Reports</Typography>
          {submittedNotes.map((note, idx) => (
            <Typography key={idx} variant="body2" sx={{ mt: 1 }}>
              - {note}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PlayerProfile;
