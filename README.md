# 🌂 WeatherCo - Smart Umbrella Checker

A modern weather app that helps you decide if you need an umbrella today! Features instant weather analysis, customizable daily notifications, and push notifications that work even when the browser is closed.

## ✨ Features

- **🌂 Instant Umbrella Check**: Click the button to instantly analyze current weather conditions
- **⏰ Customizable Notifications**: Set your preferred daily notification time
- **📱 Push Notifications**: Get daily weather updates even when the browser is closed
- **🧠 Smart Weather Analysis**: Automatically detects rain, snow, drizzle, storms, and other precipitation
- **📍 Location-Based**: Uses your current location or defaults to Lagos
- **🎨 Modern UI**: Clean, responsive design with beautiful animations
- **🔒 Secure**: Uses VAPID keys for secure push notifications

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- OpenWeatherMap API key (free)
- VAPID keys for push notifications

### 1. Get API Keys

**OpenWeatherMap API Key:**

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key (1000 free calls/day)

**Generate VAPID Keys:**

```bash
npx web-push generate-vapid-keys --json
```

### 2. Local Development

1. **Clone and install:**

```bash
git clone <your-repo>
cd weatherCo
npm install
```

2. **Create environment files:**

`.env.local` (for client):

```
VITE_WEATHER_API_KEY=your_openweathermap_api_key
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
VITE_PUSH_SERVER_URL=http://localhost:4000
```

3. **Start the push server:**

```bash
npm run server
```

4. **Start the development server:**

```bash
npm run dev
```

### 3. Production Deployment

#### Deploy Push Server (Railway/Render)

1. Copy the `push-server/` folder to a new repository
2. Deploy to [Railway](https://railway.app) or [Render](https://render.com)
3. Add environment variables:
   ```
   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   OPENWEATHERMAP_KEY=your_openweathermap_api_key
   ```

#### Deploy Main App (Vercel)

1. Connect your main app to Vercel
2. Add environment variables:
   ```
   VITE_WEATHER_API_KEY=your_openweathermap_api_key
   VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
   VITE_PUSH_SERVER_URL=https://your-push-server.railway.app
   ```

## 🎯 Usage

### Manual Umbrella Check

- Click the "🌂 Check if I need an umbrella" button
- Get instant analysis with visual feedback
- See if you need an umbrella, should bundle up for snow, or if it's clear weather

### Daily Notifications

- Set your preferred notification time using the time picker
- Receive daily weather updates at your chosen time
- Notifications work even when the browser is closed

### Weather Analysis

The app intelligently analyzes weather conditions:

- **🌂 Rain**: rain, drizzle, shower, storm, thunder
- **❄️ Snow**: snow, sleet, blizzard
- **☀️ Clear**: all other conditions

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Service Worker │    │  Push Server    │
│                 │    │                 │    │                 │
│ • Weather UI    │◄──►│ • Push Handler  │◄──►│ • Subscriptions │
│ • Manual Check  │    │ • Click Handler │    │ • Scheduling    │
│ • Time Picker   │    │ • Background    │    │ • Weather API   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
weatherCo/
├── src/
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # App entry point
│   ├── push.js              # Push notification utilities
│   └── index.css            # Styles
├── public/
│   ├── sw.js                # Service worker
│   └── favicon.svg          # Umbrella favicon
├── push-server/             # Standalone push server
│   ├── server.js            # Express server
│   ├── package.json         # Server dependencies
│   └── README.md            # Server setup guide
├── server/                  # Local development server
└── DEPLOYMENT_GUIDE.md      # Complete deployment guide
```

## 🔧 API Endpoints

### Push Server Endpoints

- `POST /subscribe` - Register push subscription
- `POST /unsubscribe` - Remove push subscription
- `POST /update-time` - Update notification time preference
- `GET /health` - Server health check

### Weather API

- Uses OpenWeatherMap API for current weather data
- Automatic location detection via browser geolocation
- Fallback to Lagos, Nigeria if location denied

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run server       # Start local push server
npm run lint         # Run ESLint
```

### Environment Variables

**Client (.env.local):**

- `VITE_WEATHER_API_KEY` - OpenWeatherMap API key
- `VITE_VAPID_PUBLIC_KEY` - VAPID public key
- `VITE_PUSH_SERVER_URL` - Push server URL

**Server (.env):**

- `VAPID_PUBLIC_KEY` - VAPID public key
- `VAPID_PRIVATE_KEY` - VAPID private key
- `OPENWEATHERMAP_KEY` - OpenWeatherMap API key
- `PORT` - Server port (default: 4000)

## 🐛 Troubleshooting

### Common Issues

- **"Missing API key"**: Add `VITE_WEATHER_API_KEY` to Vercel environment variables
- **"Push notifications not configured"**: Deploy push server and add `VITE_PUSH_SERVER_URL`
- **"Already checking weather"**: Wait for current check to complete
- **CORS errors**: Ensure push server URL is correct and CORS is enabled

### Health Checks

- **Push Server**: Visit `/health` endpoint
- **Weather API**: Check browser console for API errors
- **Service Worker**: Check browser dev tools > Application > Service Workers

## 📱 Browser Support

- Chrome 42+
- Firefox 44+
- Safari 16+
- Edge 17+

Requires:

- Service Worker support
- Push API support
- Notification API support

## 🔒 Security

- VAPID keys for secure push authentication
- HTTPS required for production
- Environment variable protection
- CORS properly configured

## 📄 License

MIT License - feel free to use this project for your own weather apps!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Made with ❤️ for people who forget their umbrellas!** 🌂
