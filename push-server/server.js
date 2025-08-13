import express from "express";
import webPush from "web-push";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const subscriptions = new Map();
const userPreferences = new Map();

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const OPENWEATHERMAP_KEY = process.env.OPENWEATHERMAP_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn("Missing VAPID keys in env");
}

webPush.setVapidDetails(
  "mailto:admin@weatherco.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Subscribe endpoint
app.post("/subscribe", (req, res) => {
  const { subscription, meta } = req.body || {};
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription" });
  }
  subscriptions.set(subscription.endpoint, { subscription, meta });
  userPreferences.set(subscription.endpoint, { time: "06:00" });
  console.log(`New subscription: ${subscription.endpoint}`);
  return res.status(201).json({ ok: true });
});

// Unsubscribe endpoint
app.post("/unsubscribe", (req, res) => {
  const { endpoint } = req.body || {};
  if (!endpoint) return res.status(400).json({ error: "Missing endpoint" });
  subscriptions.delete(endpoint);
  userPreferences.delete(endpoint);
  console.log(`Unsubscribed: ${endpoint}`);
  return res.json({ ok: true });
});

// Update notification time endpoint
app.post("/update-time", (req, res) => {
  const { time, meta } = req.body || {};
  if (!time) return res.status(400).json({ error: "Missing time" });

  for (const [endpoint, { meta: subMeta }] of subscriptions.entries()) {
    if (subMeta?.lat === meta?.lat && subMeta?.lon === meta?.lon) {
      userPreferences.set(endpoint, { time });
      console.log(`Updated time for ${endpoint}: ${time}`);
      return res.json({ ok: true });
    }
  }
  return res.status(404).json({ error: "Subscription not found" });
});

// Weather fetching function
async function fetchWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_KEY}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Weather fetch failed");
  return response.json();
}

// Individual user notification scheduling
function scheduleUserNotifications() {
  const now = new Date();

  for (const [endpoint, { subscription, meta }] of subscriptions.entries()) {
    const preferences = userPreferences.get(endpoint);
    if (!preferences?.time) continue;

    const [hours, minutes] = preferences.time.split(":").map(Number);
    const nextNotification = new Date();
    nextNotification.setHours(hours, minutes, 0, 0);

    if (nextNotification <= now) {
      nextNotification.setDate(nextNotification.getDate() + 1);
    }

    const delay = nextNotification.getTime() - now.getTime();

    setTimeout(async () => {
      try {
        const lat = meta?.lat ?? 6.5244;
        const lon = meta?.lon ?? 3.3792;
        const weatherData = await fetchWeather(lat, lon);

        if (weatherData) {
          const city = weatherData.name;
          const temp = Math.round(weatherData.main.temp);
          const desc =
            weatherData.weather?.[0]?.description || "Weather update";
          const title = `Umbrella check: ${city}`;
          const body = `${desc}, ${temp}°C. Have a great day!`;

          await webPush.sendNotification(
            subscription,
            JSON.stringify({ title, body, url: "/" })
          );
          console.log(`Sent notification to ${endpoint} for ${city}`);
        }
      } catch (err) {
        const status = err?.statusCode || err?.status || 0;
        if (status === 404 || status === 410) {
          subscriptions.delete(endpoint);
          userPreferences.delete(endpoint);
          console.log(`Removed stale subscription: ${endpoint}`);
        } else {
          console.error("Notify error", status, err?.message);
        }
      }

      // Schedule next notification for tomorrow
      scheduleUserNotifications();
    }, delay);
  }
}

// Start scheduling notifications
scheduleUserNotifications();

app.get("/health", (_req, res) =>
  res.json({
    ok: true,
    subscriptions: subscriptions.size,
    timestamp: new Date().toISOString(),
  })
);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🌂 WeatherCo Push Server listening on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});
