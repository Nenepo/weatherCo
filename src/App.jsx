import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { initPushAndRegisterOnServer } from "./push.js";
// import { send } from "vite";

export default function App() {
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [weather, setWeather] = useState(null);
  const [notificationTime, setNotificationTime] = useState("06:00");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingWeather, setIsCheckingWeather] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState("default");

  // Function to fetch weather from API
  const fetchWeather = async (lat, lon) => {
    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

      if (!apiKey) {
        toast.error(
          "Missing API key. Please check your environment variables."
        );
        console.error("VITE_WEATHER_API_KEY is not set");
        return null;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          toast.error(
            "Invalid API key. Please check your OpenWeatherMap API key."
          );
        } else if (response.status === 429) {
          toast.error("API rate limit exceeded. Please try again later.");
        } else {
          toast.error(`Weather API error: ${response.status}`);
        }
        console.error("Weather API error:", response.status, errorData);
        return null;
      }

      const data = await response.json();
      setWeather(data);
      return data;
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        toast.error("Network error. Please check your internet connection.");
      } else {
        toast.error("Error fetching weather data");
      }
      console.error("Weather fetch error:", error);
      return null;
    }
  };

  // Function to check if umbrella is needed
  const checkUmbrella = (weatherData) => {
    if (!weatherData) return;

    const conditions = weatherData.weather[0].main.toLowerCase();
    const description = weatherData.weather[0].description.toLowerCase();
    const temp = weatherData.main.temp;

    const rainKeywords = ["rain", "drizzle", "shower", "storm", "thunder"];
    const snowKeywords = ["snow", "sleet", "blizzard"];

    const isRainy = rainKeywords.some(
      (keyword) => conditions.includes(keyword) || description.includes(keyword)
    );
    const isSnowy = snowKeywords.some(
      (keyword) => conditions.includes(keyword) || description.includes(keyword)
    );

    if (isRainy) {
      toast.success("🌂 You'll need an umbrella today!", {
        duration: 5000,
        icon: "🌂",
      });
    } else if (isSnowy) {
      toast.success("❄️ Bundle up! Snow expected today", {
        duration: 5000,
        icon: "❄️",
      });
    } else {
      toast.success("☀️ No umbrella needed today!", {
        duration: 5000,
        icon: "☀️",
      });
    }
  };

  // Manual umbrella check
  const handleUmbrellaCheck = async () => {
    if (!location.lat || !location.lon) {
      toast.error("Location not available");
      return;
    }

    // Prevent multiple simultaneous checks
    if (isCheckingWeather) {
      toast.error("Already checking weather...");
      return;
    }

    setIsCheckingWeather(true);
    const loadingToast = toast.loading("Checking weather...");

    try {
      const weatherData = await fetchWeather(location.lat, location.lon);
      if (weatherData) {
        checkUmbrella(weatherData);
      }
    } finally {
      setIsCheckingWeather(false);
      toast.dismiss(loadingToast);
    }
  };

  // Enable notifications manually
  const handleEnableNotifications = async () => {
    if (!import.meta.env.VITE_PUSH_SERVER_URL) {
      toast.error("Push server not configured");
      return;
    }

    if (!location.lat || !location.lon) {
      toast.error("Location not available");
      return;
    }

    try {
      const success = await initPushAndRegisterOnServer({
        lat: location.lat,
        lon: location.lon,
      });

      if (success) {
        setIsSubscribed(true);
        setNotificationPermission("granted");
        toast.success(
          "Notifications enabled! You'll get daily weather updates."
        );
      } else {
        toast.error(
          "Failed to enable notifications. Please check permissions."
        );
      }
    } catch (error) {
      toast.error("Error enabling notifications");
      console.error(error);
    }
  };

    // Update notification time preference and immediately check weather
  const handleTimeChange = async (newTime) => {
    const loadingToast = toast.loading("Updating notification time...");
    
    try {
      setNotificationTime(newTime);
      
      // Update the server with new time if subscribed
      if (
        isSubscribed &&
        location.lat &&
        location.lon &&
        import.meta.env.VITE_PUSH_SERVER_URL
      ) {
        await fetch(import.meta.env.VITE_PUSH_SERVER_URL + "/update-time", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            time: newTime,
            meta: { lat: location.lat, lon: location.lon },
          }),
        });
      }

      // Fetch fresh weather data and check umbrella need
      const freshWeatherData = await fetchWeather(location.lat, location.lon);
      if (freshWeatherData) {
        checkUmbrella(freshWeatherData);
      }

      // Send browser notification about time update if allowed
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("⏰ Notification Time Updated", {
          body: `Daily weather alerts now set for ${newTime}`,
          icon: "/umbrella.png", // optional: add an icon in /public
        });
      }

      toast.dismiss(loadingToast);
      toast.success(`Notification time updated to ${newTime}`);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update notification time");
      console.error("Error updating notification time:", error);
    }
  };

  // Test notification immediately
  const handleTestNotification = async () => {
    if (!import.meta.env.VITE_PUSH_SERVER_URL) {
      toast.error("Push server not configured");
      return;
    }

    if (!isSubscribed) {
      toast.error("Please enable notifications first");
      return;
    }

    try {
      const response = await fetch(
        import.meta.env.VITE_PUSH_SERVER_URL + "/test-notification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meta: { lat: location.lat, lon: location.lon },
          }),
        }
      );

      if (response.ok) {
        toast.success("Test notification sent! Check your notifications.");
      } else {
        toast.error("Failed to send test notification");
      }
    } catch (error) {
      toast.error("Error sending test notification");
      console.error(error);
    }
  };

  // Check notification permission status
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Ask for location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lon: longitude });
          fetchWeather(latitude, longitude);
          // Don't auto-subscribe - let user choose
          console.log("Location obtained, ready for manual notification setup");
        },
        () => {
          // If user denies location, use Lagos
          toast("Using Lagos as default location");
          const lagosLat = 6.5244;
          const lagosLon = 3.3792;
          setLocation({ lat: lagosLat, lon: lagosLon });
          fetchWeather(lagosLat, lagosLon);
          // Don't auto-subscribe - let user choose
          console.log(
            "Using default location, ready for manual notification setup"
          );
        }
      );
    } else {
      toast.error("Geolocation not supported");
    }
  }, []);

  // Schedule notification at user-set time
  useEffect(() => {
    if (
      !isSubscribed ||
      notificationPermission !== "granted" ||
      !import.meta.env.VITE_PUSH_SERVER_URL
    )
      return;

    // Parse notificationTime ("HH:mm")
    const [hours, minutes] = notificationTime.split(":").map(Number);
    const now = new Date();
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);

    // If the target time has already passed today, schedule for tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    const msUntilNotification = target - now;

    const timeoutId = setTimeout(async () => {
      try {
        await fetch(
          import.meta.env.VITE_PUSH_SERVER_URL + "/send-notification",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              meta: { lat: location.lat, lon: location.lon },
            }),
          }
        );
        console.log("Notification sent successfully");
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }, msUntilNotification);

    console.log("Notification scheduled for", target.toLocaleString());

    // Cleanup timeout if dependencies change
    return () => clearTimeout(timeoutId);
  }, [
    notificationTime,
    isSubscribed,
    notificationPermission,
    location.lat,
    location.lon,
  ]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6">
      <h1 className="text-3xl font-bold mb-6">🌂 Umbrella Check</h1>

      {weather ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-80 max-w-full">
          <h2 className="text-xl font-semibold mb-2">{weather.name}</h2>
          <p className="text-gray-600 mb-3">{weather.weather[0].description}</p>
          <p className="text-3xl font-bold mb-4">
            {Math.round(weather.main.temp)}°C
          </p>

          {/* Manual Umbrella Check Button */}
          <button
            onClick={handleUmbrellaCheck}
            disabled={isCheckingWeather}
            className={`w-full font-semibold py-3 px-4 rounded-lg mb-4 transition-colors ${
              isCheckingWeather
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {isCheckingWeather
              ? "⏳ Checking..."
              : "🌂 Check if I need an umbrella"}
          </button>

          {/* Notification Settings */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Daily Notification</h3>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="notification-time"
                className="text-sm text-gray-600"
              >
                Time:
              </label>
              <input
                id="notification-time"
                type="time"
                value={notificationTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="space-y-2">
              {!import.meta.env.VITE_PUSH_SERVER_URL ? (
                <p className="text-xs text-gray-500">
                  🔧 Push notifications not configured
                </p>
              ) : isSubscribed ? (
                <div className="space-y-2">
                  <p className="text-xs text-green-600">
                    ✅ You'll get daily weather updates
                  </p>
                  <button
                    onClick={handleTestNotification}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold py-2 px-3 rounded transition-colors"
                  >
                    🔔 Test Notification
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">
                    Get daily weather notifications
                  </p>
                  <button
                    onClick={handleEnableNotifications}
                    className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 px-3 rounded transition-colors"
                  >
                    🔔 Enable Notifications
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md w-80">
          <p>Loading weather...</p>
        </div>
      )}
    </div>
  );
}
