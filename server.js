require("dotenv").config();

const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = "https://api.football-data.org/v4";
const API_TOKEN = process.env.FOOTBALL_API_TOKEN;

if (!API_TOKEN) {
  console.warn("WARNING: FOOTBALL_API_TOKEN belum di-set di file .env");
}

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-Auth-Token": API_TOKEN,
  },
  timeout: 50000,
});

const competitionMap = {
  PL: "PL",
  PD: "PD",
  SA: "SA",
  BL1: "BL1",
  FL1: "FL1",
  CL: "CL",
};

const statusMap = {
  IN_PLAY: "IN_PLAY",
  LIVE: "IN_PLAY",
  SCHEDULED: "SCHEDULED",
  FINISHED: "FINISHED",
};

app.get("/api/test", async (req, res) => {
  try {
    const response = await api.get("/competitions");
    res.json({
      success: true,
      count: response.data.count,
      message: "API token works",
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
});

app.get("/api/matches", async (req, res) => {
  try {
    const competition = competitionMap[req.query.competition] || "PL";
    const rawStatus = req.query.status || "IN_PLAY";
    const status = statusMap[rawStatus] || "IN_PLAY";

    const response = await api.get(`/competitions/${competition}/matches`, {
      params: { status },
    });

    res.json(response.data);
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Gagal mengambil data matches";

    res.status(statusCode).json({
      error: true,
      message,
    });
  }
});

app.get("/api/standings", async (req, res) => {
  try {
    const competition = competitionMap[req.query.competition] || "PL";

    const response = await api.get(`/competitions/${competition}/standings`);

    res.json(response.data);
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Gagal mengambil data standings";

    res.status(statusCode).json({
      error: true,
      message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});