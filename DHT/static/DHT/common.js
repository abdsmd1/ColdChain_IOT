// Fonctions partagées entre le dashboard et la page d'archives
const API_URL = "/api/get";
const REFRESH_MS = 5000;        // rafraîchissement des données
const OFFLINE_AFTER_S = 30;     // capteur considéré hors ligne après 30 s sans mesure

// ---------- Seuils (chaîne du froid) ----------
const DEFAULT_THRESHOLDS = { min: 2, max: 8 };

function getThresholds() {
  try {
    const t = JSON.parse(localStorage.getItem("coldchain_thresholds"));
    if (t && !isNaN(t.min) && !isNaN(t.max)) return t;
  } catch (e) { /* stockage indisponible */ }
  return { ...DEFAULT_THRESHOLDS };
}

function saveThresholds(min, max) {
  try { localStorage.setItem("coldchain_thresholds", JSON.stringify({ min, max })); } catch (e) {}
}

// ---------- Récupération des mesures ----------
async function fetchMeasures() {
  const res = await fetch(API_URL, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const json = await res.json();
  return (json.data || [])
    .filter(m => m.temp !== null && m.dt)
    .map(m => ({ id: m.id, temp: m.temp, hum: m.hum, date: new Date(m.dt) }))
    .sort((a, b) => a.date - b.date);
}

// ---------- Détection des incidents ----------
// Un incident = suite de mesures consécutives hors de la plage [min, max].
// Il est clôturé dès qu'une mesure revient dans la plage.
function computeIncidents(measures, { min, max }) {
  const incidents = [];
  let current = null;

  for (const m of measures) {
    const out = m.temp < min || m.temp > max;
    if (out) {
      if (!current) {
        current = { start: m.date, end: null, count: 0, tmax: m.temp, tmin: m.temp, last: m.date };
      }
      current.count++;
      current.tmax = Math.max(current.tmax, m.temp);
      current.tmin = Math.min(current.tmin, m.temp);
      current.last = m.date;
    } else if (current) {
      current.end = m.date;
      incidents.push(current);
      current = null;
    }
  }
  if (current) incidents.push(current);   // incident encore en cours

  incidents.forEach((inc, i) => { inc.id = i + 1; });
  return incidents.reverse();              // le plus récent en premier
}

// ---------- Formatage ----------
const fmtDate = d => d.toLocaleString("fr-FR", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit", second: "2-digit",
});
const fmtTime = d => d.toLocaleTimeString("fr-FR");

function fmtDuration(ms) {
  let s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60);   s -= m * 60;
  if (h) return `${h} h ${m} min ${s} s`;
  if (m) return `${m} min ${s} s`;
  return `${s} s`;
}

function fmtAgo(date) {
  const s = Math.round((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `il y a ${Math.max(s, 0)} s`;
  return `il y a ${fmtDuration(s * 1000)}`;
}

function setOnline(isOnline) {
  const pill = document.getElementById("sensor-pill");
  if (!pill) return;
  pill.className = "pill " + (isOnline ? "online" : "offline");
  pill.querySelector("span:last-child").textContent = isOnline ? "Capteur en ligne" : "Capteur hors ligne";
}

function showBanner(msg) {
  const b = document.getElementById("banner");
  if (!b) return;
  b.textContent = msg || "";
  b.classList.toggle("show", !!msg);
}
