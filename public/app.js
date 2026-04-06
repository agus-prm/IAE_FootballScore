const competitionSelect = document.getElementById("competition-select");
const statusSelect = document.getElementById("status-select");
const loadBtn = document.getElementById("load-btn");

const matchesContainer = document.getElementById("matches-container");
const standingsBody = document.getElementById("standings-body");
const matchesInfo = document.getElementById("matches-info");

const heroLiveCount = document.getElementById("hero-live-count");
const heroCompetitionName = document.getElementById("hero-competition-name");
const heroMatchday = document.getElementById("hero-matchday");

const summaryLeague = document.getElementById("summary-league");
const summaryTopTeam = document.getElementById("summary-top-team");
const summaryTopPoints = document.getElementById("summary-top-points");

function formatDate(utcDate) {
  if (!utcDate) return "-";

  const date = new Date(utcDate);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderMatches(matches) {
  matchesContainer.innerHTML = "";

  if (!matches || !matches.length) {
    matchesContainer.innerHTML = `
      <div class="empty-box">
        Tidak ada pertandingan untuk filter ini.
      </div>
    `;
    return;
  }

  matches.forEach((match) => {
    const homeScore = match.score?.fullTime?.home ?? "-";
    const awayScore = match.score?.fullTime?.away ?? "-";

    const isScheduled =
      match.status === "SCHEDULED" || match.status === "TIMED";

    const scoreDisplay = isScheduled
      ? `<span style="color:#94a3b8; font-size:0.95rem;">vs</span>`
      : `<span class="score">${homeScore} - ${awayScore}</span>`;

    let statusBadgeClass = "badge-status";

    if (match.status === "IN_PLAY") {
      statusBadgeClass += " badge-live";
    } else if (match.status === "FINISHED") {
      statusBadgeClass += " badge-finished";
    } else {
      statusBadgeClass += " badge-scheduled";
    }

    matchesContainer.innerHTML += `
      <div class="match-card">
        <div class="match-top">
          <div>
            <p class="match-date">${formatDate(match.utcDate)}</p>
            <div style="margin-top:12px;">
              <span class="${statusBadgeClass}">
                ${match.status || "-"}
              </span>
            </div>
          </div>

          <div class="match-layout">
            <div class="team-name">${match.homeTeam?.name || "-"}</div>
            <div>${scoreDisplay}</div>
            <div class="team-name">${match.awayTeam?.name || "-"}</div>
          </div>
        </div>
      </div>
    `;
  });
}

function renderStandings(standingsTable) {
  standingsBody.innerHTML = "";

  if (!standingsTable || !standingsTable.length) {
    standingsBody.innerHTML = `
      <tr>
        <td colspan="8" style="padding:16px; text-align:center; color:#94a3b8;">
          Data standings tidak tersedia.
        </td>
      </tr>
    `;
    return;
  }

  standingsTable.forEach((team) => {
    standingsBody.innerHTML += `
      <tr>
        <td>${team.position ?? "-"}</td>
        <td>${team.team?.name || "-"}</td>
        <td class="center">${team.playedGames ?? "-"}</td>
        <td class="center">${team.won ?? "-"}</td>
        <td class="center">${team.draw ?? "-"}</td>
        <td class="center">${team.lost ?? "-"}</td>
        <td class="center">${team.goalDifference ?? "-"}</td>
        <td class="center points">${team.points ?? "-"}</td>
      </tr>
    `;
  });
}

function setLoading() {
  matchesContainer.innerHTML = `
    <div class="empty-box">
      Loading matches...
    </div>
  `;

  standingsBody.innerHTML = `
    <tr>
      <td colspan="8" style="padding:16px; text-align:center; color:#94a3b8;">
        Loading standings...
      </td>
    </tr>
  `;

  matchesInfo.textContent = "Loading data...";
}

async function loadDashboard() {
  const competition = competitionSelect.value;
  const status = statusSelect.value;

  setLoading();

  try {
    const [matchesRes, standingsRes] = await Promise.all([
      fetch(`/api/matches?competition=${competition}&status=${status}`),
      fetch(`/api/standings?competition=${competition}`)
    ]);

    const matchesData = await matchesRes.json();
    const standingsData = await standingsRes.json();

    if (!matchesRes.ok) {
      throw new Error(matchesData.message || "Gagal mengambil matches");
    }

    if (!standingsRes.ok) {
      throw new Error(standingsData.message || "Gagal mengambil standings");
    }

    const matches = matchesData.matches || [];
    const standings = standingsData.standings || [];
    const totalStanding = standings.find((item) => item.type === "TOTAL");
    const table = totalStanding?.table || [];

    heroLiveCount.textContent = matches.length;
    heroCompetitionName.textContent = matchesData.competition?.name || "-";
    heroMatchday.textContent =
      standingsData.season?.currentMatchday ||
      matches[0]?.matchday ||
      "-";

    summaryLeague.textContent = standingsData.competition?.name || "-";
    summaryTopTeam.textContent = table[0]?.team?.name || "-";
    summaryTopPoints.textContent = table[0]?.points || "-";

    matchesInfo.textContent = `Showing ${matches.length} matches • ${matchesData.competition?.name || "-"}`;

    renderMatches(matches);
    renderStandings(table);
  } catch (error) {
    matchesContainer.innerHTML = `
      <div class="error-box">
        ${error.message}
      </div>
    `;

    standingsBody.innerHTML = `
      <tr>
        <td colspan="8" style="padding:16px; text-align:center; color:#f87171;">
          ${error.message}
        </td>
      </tr>
    `;

    matchesInfo.textContent = "Failed to load data";
  }
}

loadBtn.addEventListener("click", loadDashboard);
loadDashboard();