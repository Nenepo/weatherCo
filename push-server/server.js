// import express from "express";
// import webPush from "web-push";
// import dotenv from "dotenv";
// import fetch from "node-fetch";
// import cors from "cors";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const subscriptions = new Map();
// const userPreferences = new Map();

// const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
// const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
// const OPENWEATHERMAP_KEY = process.env.OPENWEATHERMAP_KEY;

// if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
//   console.warn("Missing VAPID keys in env");
// }

// webPush.setVapidDetails(
//   "mailto:admin@weatherco.com",
//   VAPID_PUBLIC_KEY,
//   VAPID_PRIVATE_KEY
// );

// // Subscribe endpoint
// app.post("/subscribe", (req, res) => {
//   const { subscription, meta } = req.body || {};
//   if (!subscription || !subscription.endpoint) {
//     return res.status(400).json({ error: "Invalid subscription" });
//   }
//   subscriptions.set(subscription.endpoint, { subscription, meta });
//   userPreferences.set(subscription.endpoint, { time: "06:00" });
//   console.log(`New subscription: ${subscription.endpoint}`);
//   return res.status(201).json({ ok: true });
// });

// // Unsubscribe endpoint
// app.post("/unsubscribe", (req, res) => {
//   const { endpoint } = req.body || {};
//   if (!endpoint) return res.status(400).json({ error: "Missing endpoint" });
//   subscriptions.delete(endpoint);
//   userPreferences.delete(endpoint);
//   console.log(`Unsubscribed: ${endpoint}`);
//   return res.json({ ok: true });
// });

// // Update notification time endpoint
// app.post("/update-time", (req, res) => {
//   const { time, meta } = req.body || {};
//   if (!time) return res.status(400).json({ error: "Missing time" });

//   for (const [endpoint, { meta: subMeta }] of subscriptions.entries()) {
//     if (subMeta?.lat === meta?.lat && subMeta?.lon === meta?.lon) {
//       userPreferences.set(endpoint, { time });
//       console.log(`Updated time for ${endpoint}: ${time}`);
//       return res.json({ ok: true });
//     }
//   }
//   return res.status(404).json({ error: "Subscription not found" });
// });

// // Test notification endpoint
// app.post("/test-notification", async (req, res) => {
//   const { meta } = req.body || {};

//   try {
//     // Find subscription by location
//     let targetSubscription = null;
//     for (const [
//       endpoint,
//       { subscription, meta: subMeta },
//     ] of subscriptions.entries()) {
//       if (subMeta?.lat === meta?.lat && subMeta?.lon === meta?.lon) {
//         targetSubscription = subscription;
//         break;
//       }
//     }

//     if (!targetSubscription) {
//       return res.status(404).json({ error: "Subscription not found" });
//     }

//     // Send immediate test notification
//     const title = "🌂 Test Notification";
//     const body = "This is a test notification from WeatherCo!";

//     await webPush.sendNotification(
//       targetSubscription,
//       JSON.stringify({ title, body, url: "/" })
//     );

//     console.log("Test notification sent successfully");
//     return res.json({ ok: true });
//   } catch (error) {
//     console.error("Test notification error:", error);
//     return res.status(500).json({ error: "Failed to send test notification" });
//   }
// });

// app.post("/send-notification", async (req, res) => {
//   const { meta, message } = req.body || {};
//   console.log("Received request:", { meta, message }); // Debug log

//   try {
//     // Find subscription by location
//     let targetSubscription = null;
//     for (const [endpoint, { subscription, meta: subMeta }] of subscriptions.entries()) {
//       if (
//         subMeta?.lat &&
//         subMeta?.lon &&
//         meta?.lat &&
//         meta?.lon &&
//         Math.abs(subMeta.lat - meta.lat) < 0.0001 &&
//         Math.abs(subMeta.lon - meta.lon) < 0.0001
//       ) {
//         targetSubscription = subscription;
//         break;
//       }
//     }

//     if (!targetSubscription) {
//       console.log("No subscription found for lat:", meta?.lat, "lon:", meta?.lon);
//       return res.status(404).json({ error: "Subscription not found" });
//     }

//     // Use client-provided message if available
//     if (message) {
//       console.log("Sending client-provided message:", message);
//       await webPush.sendNotification(
//         targetSubscription,
//         JSON.stringify({
//           title: "🌦 Umbrella Check",
//           body: message,
//           url: "/",
//         })
//       );
//       console.log("✅ Sent client-provided umbrella message:", message);
//       return res.json({ ok: true });
//     }

//     // Fallback to weather-based message
//     console.log("No client-provided message, using fallback");
//     const lat = meta?.lat ?? 6.5244;
//     const lon = meta?.lon ?? 3.3792;
//     const weatherData = await fetchWeather(lat, lon);

//     const city = weatherData?.name || "your area";
//     const temp = weatherData?.main?.temp ? Math.round(weatherData.main.temp) : "";
//     const desc = weatherData?.weather?.[0]?.description || "Weather update";
//     const title = `Umbrella check: ${city}`;
//     const body = `${desc}, ${temp}°C. Have a great day!`;

//     await webPush.sendNotification(
//       targetSubscription,
//       JSON.stringify({ title, body, url: "/" })
//     );

//     console.log("✅ Sent fallback weather-based message:", body);
//     return res.json({ ok: true });
//   } catch (error) {
//     console.error("❌ Notification error:", error);
//     return res.status(500).json({ error: "Failed to send notification" });
//   }
// });

// // Weather fetching function
// async function fetchWeather(lat, lon) {
//   const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_KEY}&units=metric`;
//   const response = await fetch(url);
//   if (!response.ok) throw new Error("Weather fetch failed");
//   return response.json();
// }

// // // Individual user notification scheduling
// // function scheduleUserNotifications() {
// //   const now = new Date();
// //   console.log(`Scheduling notifications at ${now.toISOString()}`);

// //   for (const [endpoint, { subscription, meta }] of subscriptions.entries()) {
// //     const preferences = userPreferences.get(endpoint);
// //     if (!preferences?.time) {
// //       console.log(`No time preference for ${endpoint}`);
// //       continue;
// //     }

// //     const [hours, minutes] = preferences.time.split(":").map(Number);
// //     const nextNotification = new Date();
// //     nextNotification.setHours(hours, minutes, 0, 0);

// //     if (nextNotification <= now) {
// //       nextNotification.setDate(nextNotification.getDate() + 1);
// //       console.log(
// //         `Time already passed today, scheduling for tomorrow: ${nextNotification.toISOString()}`
// //       );
// //     } else {
// //       console.log(`Scheduling for today: ${nextNotification.toISOString()}`);
// //     }

// //     const delay = nextNotification.getTime() - now.getTime();
// //     console.log(
// //       `Delay for ${endpoint}: ${delay}ms (${Math.round(
// //         delay / 1000 / 60
// //       )} minutes)`
// //     );

// //     setTimeout(async () => {
// //       console.log(`Sending scheduled notification to ${endpoint}`);
// //       try {
// //         const lat = meta?.lat ?? 6.5244;
// //         const lon = meta?.lon ?? 3.3792;
// //         const weatherData = await fetchWeather(lat, lon);

// //         if (weatherData) {
// //           const city = weatherData.name;
// //           const temp = Math.round(weatherData.main.temp);
// //           const desc =
// //             weatherData.weather?.[0]?.description || "Weather update";
// //           const title = `Umbrella check: ${city}`;
// //           const body = `${desc}, ${temp}°C. Have a great day!`;

// //           await webPush.sendNotification(
// //             subscription,
// //             JSON.stringify({ title, body, url: "/" })
// //           );
// //           console.log(`✅ Sent notification to ${endpoint} for ${city}`);
// //         }
// //       } catch (err) {
// //         const status = err?.statusCode || err?.status || 0;
// //         if (status === 404 || status === 410) {
// //           subscriptions.delete(endpoint);
// //           userPreferences.delete(endpoint);
// //           console.log(`❌ Removed stale subscription: ${endpoint}`);
// //         } else {
// //           console.error("❌ Notify error", status, err?.message);
// //         }
// //       }

// //       // Schedule next notification for tomorrow
// //       scheduleUserNotifications();
// //     }, delay);
// //   }
// // }

// // // Start scheduling notifications
// // scheduleUserNotifications();



// app.get("/health", (_req, res) =>
//   res.json({
//     ok: true,
//     subscriptions: subscriptions.size,
//     timestamp: new Date().toISOString(),
//   })
// );

// const port = process.env.PORT || 4000;
// app.listen(port, () => {
//   console.log(`🌂 WeatherCo Push Server listening on port ${port}`);
//   console.log(`📊 Health check: http://localhost:${port}/health`);
// });

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
    if (
      subMeta?.lat &&
      subMeta?.lon &&
      meta?.lat &&
      meta?.lon &&
      Math.abs(subMeta.lat - meta.lat) < 0.0001 &&
      Math.abs(subMeta.lon - meta.lon) < 0.0001
    ) {
      userPreferences.set(endpoint, { time });
      console.log(`Updated time for ${endpoint}: ${time}`);
      return res.json({ ok: true });
    }
  }
  return res.status(404).json({ error: "Subscription not found" });
});

// Test notification endpoint
app.post("/test-notification", async (req, res) => {
  const { meta } = req.body || {};

  try {
    let targetSubscription = null;
    for (const [endpoint, { subscription, meta: subMeta }] of subscriptions.entries()) {
      if (
        subMeta?.lat &&
        subMeta?.lon &&
        meta?.lat &&
        meta?.lon &&
        Math.abs(subMeta.lat - meta.lat) < 0.0001 &&
        Math.abs(subMeta.lon - meta.lon) < 0.0001
      ) {
        targetSubscription = subscription;
        break;
      }
    }

    if (!targetSubscription) {
      console.log("No subscription found for lat:", meta?.lat, "lon:", meta?.lon);
      return res.status(404).json({ error: "Subscription not found" });
    }

    const title = "🌂 Test Notification";
    const body = "This is a test notification from WeatherCo!";

    await webPush.sendNotification(
      targetSubscription,
      JSON.stringify({ title, body, url: "/" })
    );

    console.log("✅ Test notification sent successfully");
    return res.json({ ok: true });
  } catch (error) {
    console.error("❌ Test notification error:", error);
    return res.status(500).json({ error: "Failed to send test notification" });
  }
});

// Send notification endpoint
app.post("/send-notification", async (req, res) => {
  const { meta, message } = req.body || {};
  console.log("Received request:", { meta, message });

  try {
    let targetSubscription = null;
    for (const [endpoint, { subscription, meta: subMeta }] of subscriptions.entries()) {
      if (
        subMeta?.lat &&
        subMeta?.lon &&
        meta?.lat &&
        meta?.lon &&
        Math.abs(subMeta.lat - meta.lat) < 0.0001 &&
        Math.abs(subMeta.lon - meta.lon) < 0.0001
      ) {
        targetSubscription = subscription;
        break;
      }
    }

    if (!targetSubscription) {
      console.log("No subscription found for lat:", meta?.lat, "lon:", meta?.lon);
      return res.status(404).json({ error: "Subscription not found" });
    }

    // Require client-provided message
    if (!message) {
      console.log("No client-provided message");
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("Sending client-provided message:", message);
    await webPush.sendNotification(
      targetSubscription,
      JSON.stringify({
        title: "🌦 Umbrella Check",
        body: message,
        url: "/",
      })
    );
    console.log("✅ Sent client-provided umbrella message:", message);
    return res.json({ ok: true });
  } catch (error) {
    console.error("❌ Notification error:", error);
    return res.status(500).json({ error: "Failed to send notification" });
  }
});

// Weather fetching function
// async function fetchWeather(lat, lon) {
//   const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_KEY}&units=metric`;
//   try {
//     const response = await fetch(url);
//     if (!response.ok) throw new Error(`Weather fetch failed: ${response.status}`);
//     return response.json();
//   } catch (error) {
//     console.error("❌ Weather fetch error:", error);
//     throw error;
//   }
// }

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