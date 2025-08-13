import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { initPushAndRegisterOnServer } from "./push.js";

export default function App() {
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [weather, setWeather] = useState(null);
  const [notificationTime, setNotificationTime] = useState("06:00");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingWeather, setIsCheckingWeather] = useState(false);

  // Function to fetch weather from API
  const fetchWeather = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${
          import.meta.env.VITE_WEATHER_API_KEY
        }&units=metric`
      );

      if (!response.ok) throw new Error("Failed to fetch weather");

      const data = await response.json();
      setWeather(data);
      return data;
    } catch (error) {
      toast.error("Error fetching weather");
      console.error(error);
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

  // Update notification time preference
  const handleTimeChange = async (newTime) => {
    setNotificationTime(newTime);
    if (isSubscribed && location.lat && location.lon) {
      try {
        await fetch(import.meta.env.VITE_PUSH_SERVER_URL + "/update-time", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            time: newTime,
            meta: { lat: location.lat, lon: location.lon },
          }),
        });
        toast.success("Notification time updated!");
      } catch (error) {
        toast.error("Failed to update notification time");
      }
    }
  };

  // Ask for location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lon: longitude });
          fetchWeather(latitude, longitude);
          // Register for push with rough location as metadata
          initPushAndRegisterOnServer({ lat: latitude, lon: longitude }).then(
            (ok) => {
              if (ok) {
                console.log("Push subscription registered");
                setIsSubscribed(true);
              }
            }
          );
        },
        () => {
          // If user denies location, use Lagos
          toast("Using Lagos as default location");
          const lagosLat = 6.5244;
          const lagosLon = 3.3792;
          setLocation({ lat: lagosLat, lon: lagosLon });
          fetchWeather(lagosLat, lagosLon);
          initPushAndRegisterOnServer({ lat: lagosLat, lon: lagosLon }).then(
            (ok) => {
              if (ok) {
                setIsSubscribed(true);
              }
            }
          );
        }
      );
    } else {
      toast.error("Geolocation not supported");
    }
  }, []);

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
            <p className="text-xs text-gray-500">
              {isSubscribed
                ? "✅ You'll get daily weather updates"
                : "Click to enable notifications"}
            </p>
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
