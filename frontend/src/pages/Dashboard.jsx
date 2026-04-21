import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Bell, Download, MapPin, Plus, ShieldAlert } from "lucide-react";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import { useUser } from "@/context/UserContext";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

// Fix default marker icons.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const createBarnIcon = (isDark) => {
  const color = isDark ? "#6f9f6f" : "#3a6b3a";
  const bg = isDark ? "#142014" : "#ffffff";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.25"/>
      </filter>
      <g filter="url(#shadow)">
        <path d="M16 36 L16 36 C16 36 4 24 4 16 A12 12 0 0 1 28 16 C28 24 16 36 16 36Z" fill="${color}"/>
        <circle cx="16" cy="15" r="9" fill="${bg}"/>
        <g transform="translate(9, 8)" fill="${color}">
          <path d="M7 0 L0 5 L1 5 L1 12 L13 12 L13 5 L14 5 Z M7 2 L12 5.7 L12 11 L8.5 11 L8.5 7.5 L5.5 7.5 L5.5 11 L2 11 L2 5.7 Z"/>
        </g>
      </g>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "barn-marker-icon",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    tooltipAnchor: [0, -40],
  });
};

function StatCard({ title, value, subtitle, accent, onClick, urgent, colors }) {
  return (
    <Card
      onClick={onClick}
      className="rounded-2xl border-l-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderLeftColor: accent,
        borderColor: colors.cardBorder,
        background: colors.card,
        boxShadow: colors.shadow,
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: colors.label }}>
            {title}
          </p>
          {urgent ? (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
              style={{ background: colors.badgeHighBg, color: colors.badgeHighText }}
            >
              Urgent
            </span>
          ) : null}
        </div>
        <p
          className="mt-4 text-[36px] leading-none"
          style={{ fontFamily: "Fraunces, serif", fontWeight: 300, color: colors.value }}
        >
          {value}
        </p>
        <p className="mt-2 text-sm" style={{ color: colors.muted }}>
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { mongoUser } = useUser();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [dismissWarningBanner, setDismissWarningBanner] = useState(false);

  const [animals, setAnimals] = useState([]);
  const [farms, setFarms] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [healthSnapshots, setHealthSnapshots] = useState([]);
  const [sensorEvents, setSensorEvents] = useState([]);

  const isDark =
    theme === "dark" ||
    (theme === "system" && typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false);

  const colors = isDark
    ? {
        surface: "#111711",
        text: "#e8efe4",
        heading: "#edf5ea",
        muted: "#99ab97",
        label: "#89a087",
        value: "#e8efe4",
        accent: "#6f9f6f",
        accentStrong: "#5e8c5e",
        card: "#182118",
        cardSubtle: "#1d271d",
        cardBorder: "#2b3a2b",
        shadow: "0 1px 4px rgba(0,0,0,0.35)",
        mapBorder: "#314131",
        rowHover: "#202c20",
        progressTrack: "#2b372b",
        badgeHighBg: "#542821",
        badgeHighText: "#ffb9ae",
        badgeMediumBg: "#4a3a1e",
        badgeMediumText: "#e5c173",
        badgeLowBg: "#233323",
        badgeLowText: "#9fc59f",
        danger: "#d86a5d",
        warning: "#c69a32",
        mapOverlay: "rgba(17,23,17,0.72)",
      }
    : {
        surface: "#f7f4ee",
        text: "#1d231d",
        heading: "#1f2f1f",
        muted: "#6f6a5f",
        label: "#7b7468",
        value: "#182418",
        accent: "#3a6b3a",
        accentStrong: "#2e582e",
        card: "#ffffff",
        cardSubtle: "#faf8f3",
        cardBorder: "#e8e2d6",
        shadow: "0 1px 4px rgba(0,0,0,0.06)",
        mapBorder: "#e5decf",
        rowHover: "#faf7f1",
        progressTrack: "#ece6db",
        badgeHighBg: "#f9d9d5",
        badgeHighText: "#7f2419",
        badgeMediumBg: "#f6ead0",
        badgeMediumText: "#7a5a1b",
        badgeLowBg: "#dde9dd",
        badgeLowText: "#254625",
        danger: "#c0392b",
        warning: "#b8860b",
        mapOverlay: "rgba(247,244,238,0.72)",
      };

  useEffect(() => {
    setMounted(true);
    if (mongoUser) {
      fetchDashboardData();
    }
  }, [mongoUser]);

  const fetchDashboardData = async () => {
    if (!mongoUser) return;

    try {
      const base = import.meta.env.VITE_API_BASE_URL;
      const params = { farmerId: mongoUser._id };

      const [animalsRes, farmsRes, alertsRes, vaccRes, healthRes, sensorRes] =
        await Promise.all([
          axios.get(`${base}/api/animals`, { params }).catch(() => ({ data: [] })),
          axios.get(`${base}/api/farms`, { params }).catch(() => ({ data: [] })),
          axios.get(`${base}/api/alerts`, { params }).catch(() => ({ data: [] })),
          axios
            .get(`${base}/api/vaccination-events`, { params })
            .catch(() => ({ data: [] })),
          axios
            .get(`${base}/api/health-snapshots`, { params })
            .catch(() => ({ data: [] })),
          axios
            .get(`${base}/api/sensor-events?type=heartRate`, { params })
            .catch(() => ({ data: [] })),
        ]);

      setAnimals(Array.isArray(animalsRes.data) ? animalsRes.data : []);
      setFarms(Array.isArray(farmsRes.data) ? farmsRes.data : []);
      setAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : []);
      setVaccinations(Array.isArray(vaccRes.data) ? vaccRes.data : []);
      setHealthSnapshots(Array.isArray(healthRes.data) ? healthRes.data : []);
      setSensorEvents(Array.isArray(sensorRes.data) ? sensorRes.data : []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeAlerts = alerts.filter((a) => !a.isResolved);
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "high");

  const vaccinationsDue = vaccinations.filter((v) => {
    if (v.eventType !== "scheduled") return false;
    const eventDate = new Date(v.date);
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return eventDate >= now && eventDate <= weekFromNow;
  });

  const avgHealthScore =
    healthSnapshots.length > 0
      ? Math.round(
          healthSnapshots.reduce((sum, h) => sum + (h.score || 0), 0) /
            healthSnapshots.length
        )
      : 0;

  const speciesCount = animals.reduce((acc, a) => {
    const key = (a.species || "other").toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const speciesEntries = Object.entries(speciesCount);

  const breedingAnimals = animals.filter(
    (a) => a.gender === "female" && Number(a.age) >= 12
  );
  const lactatingAnimals = animals.filter(
    (a) => a.gender === "female" && Number(a.age) >= 24
  );
  const seasonalAnimals = animals.filter((a) =>
    ["sheep", "goat"].includes((a.species || "").toLowerCase())
  );

  const recentSensorCutoff = Date.now() - 30 * 60 * 1000;
  const liveSensors = sensorEvents.filter((e) => {
    const ts = new Date(e.createdAt || e.timestamp || 0).getTime();
    return Number.isFinite(ts) && ts >= recentSensorCutoff;
  }).length;

  const offlineSensors = Math.max(sensorEvents.length - liveSensors, 0);

  const farmMarkers = farms
    .map((farm) => {
      if (!farm.location) return null;
      const parts = farm.location.split(",").map((c) => parseFloat(c.trim()));
      if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
        return null;
      }
      const farmAnimals = animals.filter(
        (a) => a.farmId === farm._id || a.farmId?._id === farm._id
      );
      return {
        ...farm,
        lat: parts[0],
        lng: parts[1],
        animalCount: farmAnimals.length,
      };
    })
    .filter(Boolean);

  const centerLat =
    farmMarkers.length > 0
      ? farmMarkers.reduce((sum, f) => sum + f.lat, 0) / farmMarkers.length
      : 20.5937;

  const centerLng =
    farmMarkers.length > 0
      ? farmMarkers.reduce((sum, f) => sum + f.lng, 0) / farmMarkers.length
      : 78.9629;

  const recentAlerts = activeAlerts.slice(0, 6);

  const healthSegments = useMemo(() => {
    const critical = Math.min(criticalAlerts.length, animals.length);
    const watch = Math.max(activeAlerts.length - critical, 0);
    const healthy = Math.max(animals.length - activeAlerts.length, 0);
    const total = Math.max(animals.length, 1);

    return [
      {
        label: "Healthy",
        value: healthy,
        percent: Math.round((healthy / total) * 100),
        tone: colors.accent,
      },
      {
        label: "Under Watch",
        value: watch,
        percent: Math.round((watch / total) * 100),
        tone: colors.warning,
      },
      {
        label: "Critical",
        value: critical,
        percent: Math.round((critical / total) * 100),
        tone: colors.danger,
      },
    ];
  }, [animals.length, activeAlerts.length, criticalAlerts.length, colors]);

  const donutPalette = isDark
    ? ["#6f9f6f", "#93b782", "#c69a32", "#9f8a66", "#d86a5d"]
    : ["#3a6b3a", "#6f915b", "#b8860b", "#c7b08a", "#9e7b4b"];

  const donutStyle = useMemo(() => {
    if (!speciesEntries.length) {
      return {
        background: `conic-gradient(${isDark ? "#374637" : "#d7d1c6"} 0deg 360deg)`,
      };
    }

    let current = 0;
    const slices = speciesEntries.map(([, count], index) => {
      const deg = (count / animals.length) * 360;
      const from = current;
      const to = current + deg;
      current = to;
      return `${donutPalette[index % donutPalette.length]} ${from}deg ${to}deg`;
    });

    return {
      background: `conic-gradient(${slices.join(",")})`,
    };
  }, [speciesEntries, animals.length, donutPalette, isDark]);

  const severityStyles = {
    high: { background: colors.badgeHighBg, color: colors.badgeHighText },
    medium: { background: colors.badgeMediumBg, color: colors.badgeMediumText },
    low: { background: colors.badgeLowBg, color: colors.badgeLowText },
  };

  const mapTileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <Layout loading={loading}>
      <div
        className="min-h-screen rounded-3xl p-6 lg:p-8 transition-colors"
        style={{
          background: colors.surface,
          color: colors.text,
          fontFamily: "DM Sans, Geist, sans-serif",
        }}
      >
        {!dismissWarningBanner && criticalAlerts.length > 0 ? (
          <div
            className="mb-6 rounded-2xl border px-5 py-4"
            style={{
              borderColor: isDark ? "#7b433a" : "#e7b5ab",
              background: isDark ? "#3b211e" : "#f8dfd8",
              color: isDark ? "#ffc3b9" : "#7f2419",
              boxShadow: colors.shadow,
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="relative inline-flex h-3 w-3">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                    style={{ background: colors.danger }}
                  />
                  <span
                    className="relative inline-flex h-3 w-3 rounded-full"
                    style={{ background: colors.danger }}
                  />
                </span>
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm font-semibold">
                  {criticalAlerts.length} urgent warning
                  {criticalAlerts.length > 1 ? "s" : ""} need immediate attention.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDismissWarningBanner(true)}
                className="rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ background: isDark ? "#4c2b27" : "#f2cbc2" }}
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p
              className="text-5xl leading-tight"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 300, color: colors.heading }}
            >
              Your Farm <span className="italic" style={{ color: colors.accent }}>Overview</span>
            </p>
            <p className="mt-2 text-sm" style={{ color: colors.muted }}>
              A calm, complete pulse of your farm operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-11 rounded-xl px-4"
              style={{
                borderColor: colors.cardBorder,
                background: colors.card,
                color: colors.accent,
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              className="h-11 rounded-xl border px-4 text-white"
              style={{ borderColor: colors.accentStrong, background: colors.accent }}
              onClick={() => navigate("/animals/create")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Animal
            </Button>
            <button
              type="button"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border"
              style={{
                borderColor: colors.cardBorder,
                background: colors.card,
                color: colors.accent,
              }}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span
                className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full"
                style={{ background: colors.danger }}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Animals"
            value={animals.length}
            subtitle={`${speciesEntries.length} types registered`}
            accent={colors.accent}
            onClick={() => navigate("/animals")}
            colors={colors}
          />
          <StatCard
            title="Farms"
            value={farms.length}
            subtitle="Active managed properties"
            accent={isDark ? "#93b782" : "#6f915b"}
            onClick={() => navigate("/farms")}
            colors={colors}
          />
          <StatCard
            title="Warnings"
            value={activeAlerts.length}
            subtitle={
              criticalAlerts.length
                ? `${criticalAlerts.length} critical`
                : "No urgent alerts"
            }
            accent={colors.danger}
            urgent={criticalAlerts.length > 0}
            onClick={() => navigate("/alerts")}
            colors={colors}
          />
          <StatCard
            title="Shots Due"
            value={vaccinationsDue.length}
            subtitle="In the next 7 days"
            accent={colors.warning}
            onClick={() => navigate("/calendar")}
            colors={colors}
          />
          <StatCard
            title="Govt Schemes"
            value={12}
            subtitle="Programs available this season"
            accent={isDark ? "#d2b172" : "#8a6f31"}
            onClick={() => navigate("/schemes")}
            colors={colors}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="rounded-2xl border" style={{ borderColor: colors.cardBorder, background: colors.card, boxShadow: colors.shadow }}>
            <CardHeader className="pb-3 pt-6 px-6">
              <CardTitle className="text-[13px] uppercase tracking-[0.14em]" style={{ color: colors.label }}>
                Animal Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <p className="text-[40px] leading-none" style={{ fontFamily: "Fraunces, serif", fontWeight: 300, color: colors.value }}>
                {avgHealthScore || "--"}
                <span className="ml-2 text-base" style={{ color: colors.muted }}>/100</span>
              </p>
              {healthSegments.map((segment) => (
                <div key={segment.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs" style={{ color: colors.muted }}>
                    <span>{segment.label}</span>
                    <span>{segment.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full" style={{ background: colors.progressTrack }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${segment.percent}%`, background: segment.tone }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border" style={{ borderColor: colors.cardBorder, background: colors.card, boxShadow: colors.shadow }}>
            <CardHeader className="pb-3 pt-6 px-6">
              <CardTitle className="text-[13px] uppercase tracking-[0.14em]" style={{ color: colors.label }}>
                Device Readings
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border p-4" style={{ borderColor: colors.cardBorder, background: colors.cardSubtle }}>
                  <p className="text-xs uppercase tracking-[0.12em]" style={{ color: colors.muted }}>Live</p>
                  <p className="mt-2 text-[34px] leading-none" style={{ fontFamily: "Fraunces, serif", fontWeight: 300, color: colors.value }}>
                    {liveSensors}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: colors.accent }}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors.accent }} />
                    online in last 30 min
                  </div>
                </div>
                <div className="rounded-xl border p-4" style={{ borderColor: colors.cardBorder, background: colors.cardSubtle }}>
                  <p className="text-xs uppercase tracking-[0.12em]" style={{ color: colors.muted }}>Offline</p>
                  <p className="mt-2 text-[34px] leading-none" style={{ fontFamily: "Fraunces, serif", fontWeight: 300, color: colors.value }}>
                    {offlineSensors}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: colors.danger }}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors.danger }} />
                    not reporting recently
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border" style={{ borderColor: colors.cardBorder, background: colors.card, boxShadow: colors.shadow }}>
            <CardHeader className="pb-3 pt-6 px-6">
              <CardTitle className="text-[13px] uppercase tracking-[0.14em]" style={{ color: colors.label }}>
                Animals by Type
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex items-center gap-5">
                <div className="relative h-28 w-28 rounded-full" style={donutStyle} aria-label="Animal type distribution">
                  <div className="absolute inset-[13px] rounded-full" style={{ background: colors.card }} />
                </div>
                <div className="space-y-2">
                  {speciesEntries.slice(0, 4).map(([species, count], index) => (
                    <div key={species} className="flex items-center gap-2 text-sm" style={{ color: colors.muted }}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: donutPalette[index % donutPalette.length] }} />
                      <span className="capitalize">{species}</span>
                      <span className="font-semibold" style={{ color: colors.accent }}>{count}</span>
                    </div>
                  ))}
                  {speciesEntries.length === 0 ? (
                    <p className="text-sm" style={{ color: colors.muted }}>No animal types yet</p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="rounded-2xl border border-l-4" style={{ borderColor: colors.cardBorder, borderLeftColor: colors.warning, background: colors.card, boxShadow: colors.shadow }}>
            <CardContent className="p-6">
              <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: colors.label }}>Breeding Animals</p>
              <p className="mt-4 text-[38px] leading-none" style={{ fontFamily: "Fraunces, serif", fontWeight: 300, color: colors.value }}>
                {breedingAnimals.length}
              </p>
              <p className="mt-2 text-sm" style={{ color: colors.muted }}>Ready for breeding cycle</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-l-4" style={{ borderColor: colors.cardBorder, borderLeftColor: colors.accent, background: colors.card, boxShadow: colors.shadow }}>
            <CardContent className="p-6">
              <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: colors.label }}>Lactating Animals</p>
              <p className="mt-4 text-[38px] leading-none" style={{ fontFamily: "Fraunces, serif", fontWeight: 300, color: colors.value }}>
                {lactatingAnimals.length}
              </p>
              <p className="mt-2 text-sm" style={{ color: colors.muted }}>Current milk producers</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-l-4" style={{ borderColor: colors.cardBorder, borderLeftColor: isDark ? "#c8ad78" : "#8f6b38", background: colors.card, boxShadow: colors.shadow }}>
            <CardContent className="p-6">
              <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: colors.label }}>Seasonal Animals</p>
              <p className="mt-4 text-[38px] leading-none" style={{ fontFamily: "Fraunces, serif", fontWeight: 300, color: colors.value }}>
                {seasonalAnimals.length}
              </p>
              <p className="mt-2 text-sm" style={{ color: colors.muted }}>Sheep and goat cycle group</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <Card className="rounded-2xl border xl:col-span-8" style={{ borderColor: colors.cardBorder, background: colors.card, boxShadow: colors.shadow }}>
            <CardHeader className="px-6 pt-6 pb-3">
              <CardTitle className="flex items-center gap-2 text-sm" style={{ color: colors.accent }}>
                <MapPin className="h-4 w-4" />
                Farm Map
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="h-[420px] overflow-hidden rounded-xl border relative" style={{ borderColor: colors.mapBorder }}>
                {mounted ? (
                  <MapContainer
                    center={[centerLat, centerLng]}
                    zoom={farmMarkers.length > 0 ? 7 : 5}
                    style={{ height: "100%", width: "100%" }}
                    attributionControl={false}
                  >
                    <TileLayer url={mapTileUrl} maxZoom={20} />

                    {farmMarkers.map((farm) => (
                      <Marker
                        key={farm._id}
                        position={[farm.lat, farm.lng]}
                        icon={createBarnIcon(isDark)}
                        eventHandlers={{ click: () => navigate(`/farms/${farm._id}`) }}
                      >
                        <Tooltip direction="top" offset={[0, -5]}>
                          <div className="text-sm">
                            <p className="font-semibold">{farm.name}</p>
                            <p className="text-xs" style={{ color: colors.muted }}>
                              {farm.animalCount} animal{farm.animalCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </Tooltip>
                      </Marker>
                    ))}
                  </MapContainer>
                ) : null}

                {farmMarkers.length === 0 && !loading ? (
                  <div className="absolute inset-0 z-[1000] flex items-center justify-center backdrop-blur-[1px]" style={{ background: colors.mapOverlay }}>
                    <div className="rounded-xl border px-5 py-4 text-center" style={{ borderColor: colors.cardBorder, background: colors.card }}>
                      <MapPin className="mx-auto mb-2 h-6 w-6" style={{ color: colors.muted }} />
                      <p className="text-sm" style={{ color: colors.muted }}>No farms with location pinned yet</p>
                      <Button
                        variant="link"
                        className="mt-1"
                        style={{ color: colors.accent }}
                        onClick={() => navigate("/farms/create")}
                      >
                        Add your farm
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border xl:col-span-4" style={{ borderColor: colors.cardBorder, background: colors.card, boxShadow: colors.shadow }}>
            <CardHeader className="px-6 pt-6 pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-sm" style={{ color: colors.accent }}>
                  <ShieldAlert className="h-4 w-4" />
                  Recent Warnings
                </CardTitle>
                <Button
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  style={{ color: colors.muted }}
                  onClick={() => navigate("/alerts")}
                >
                  See all
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {recentAlerts.length === 0 ? (
                <div className="px-6 pb-6 text-center">
                  <Bell className="mx-auto mb-3 h-7 w-7" style={{ color: colors.muted }} />
                  <p className="text-sm" style={{ color: colors.muted }}>No warnings right now</p>
                </div>
              ) : (
                <div>
                  {recentAlerts.map((alert) => (
                    <div
                      key={alert._id}
                      className="border-t px-6 py-4 first:border-t-0"
                      style={{ borderColor: colors.cardBorder, background: "transparent" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.rowHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <Badge
                          className="border-none text-[10px] font-bold uppercase tracking-[0.12em]"
                          style={severityStyles[alert.severity] || severityStyles.low}
                        >
                          {(alert.severity || "low").toUpperCase()}
                        </Badge>
                        <span className="text-[11px]" style={{ color: colors.muted }}>
                          {new Date(alert.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: colors.value }}>
                        {alert.animalId?.name || "Unknown animal"}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: colors.muted }}>{alert.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
