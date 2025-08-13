# 🌂 WeatherCo Complete Deployment Guide

## Step 1: Generate VAPID Keys

```bash
npx web-push generate-vapid-keys --json
```

Save both keys - you'll need them for both deployments.

## Step 2: Deploy Push Server to Railway

### Option A: Deploy from this repo

1. Go to [Railway](https://railway.app)
2. Create new project
3. Connect your GitHub repo
4. Set root directory to `push-server/`
5. Add environment variables:
   ```
   VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   OPENWEATHERMAP_KEY=your_openweathermap_key
   ```

### Option B: Deploy standalone push server

1. Copy the `push-server/` folder to a new repo
2. Deploy to Railway/Render/Heroku
3. Add the same environment variables

## Step 3: Deploy Main App to Vercel

1. Push your main app to GitHub
2. Connect to Vercel
3. Add environment variables:
   ```
   VITE_WEATHER_API_KEY=your_openweathermap_key
   VITE_VAPID_PUBLIC_KEY=your_public_key
   VITE_PUSH_SERVER_URL=https://your-push-server-name.railway.app
   ```

**Note**: Replace `your-push-server-name` with the actual name Railway gives your deployed app. For example, if Railway names your app `weatherco-push-server-production`, your URL would be:

```
VITE_PUSH_SERVER_URL=https://weatherco-push-server-production.railway.app
```

## Step 4: Test Push Notifications

1. Open your Vercel app
2. Allow notifications
3. Set your preferred time
4. Wait for your scheduled notification!

## Alternative: Render Deployment

If Railway doesn't work, use Render:

1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect your repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables

## Troubleshooting

- **Push server not responding**: Check Railway/Render logs
- **Notifications not working**: Verify VAPID keys match
- **Weather API errors**: Check OpenWeatherMap API key
- **CORS errors**: Ensure push server URL is correct

## Health Check

Visit `https://your-push-server-name.railway.app/health` to see:

- Server status
- Active subscriptions
- Current timestamp
