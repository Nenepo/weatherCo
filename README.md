# WeatherCo - React + Vite

This app fetches your local weather and can send daily push notifications with an "umbrella check" at your preferred time. It uses a service worker and a minimal Node push server.

## Features

- **Manual Umbrella Check**: Click the button to instantly check if you need an umbrella
- **Customizable Notification Time**: Set your preferred daily notification time
- **Push Notifications**: Get daily weather updates even when the browser is closed
- **Smart Weather Analysis**: Automatically detects rain, snow, and other precipitation

Setup:

1. Generate VAPID keys

```
npx web-push generate-vapid-keys --json
```

2. Create `.env` in project root (copy from `.env.example`) and fill:

```
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
OPENWEATHERMAP_KEY=...
PORT=4000
```

3. Create `.env.local` for Vite client env:

```
VITE_VAPID_PUBLIC_KEY=...
VITE_PUSH_SERVER_URL=http://localhost:4000
VITE_WEATHER_API_KEY=... # OpenWeatherMap API key for client fetches
```

4. Install deps and run the push server:

```
npm i
npm run server
```

5. Run the app:

```
npm run dev
```

When permission is granted, the app registers a push subscription with the server. The server schedules daily notifications at each user's preferred time and sends weather updates with umbrella recommendations.

## Usage

1. **Manual Check**: Click the "🌂 Check if I need an umbrella" button for an instant weather analysis
2. **Set Notification Time**: Use the time picker to set when you want daily notifications
3. **Daily Updates**: Receive push notifications at your chosen time with weather conditions and umbrella recommendations
