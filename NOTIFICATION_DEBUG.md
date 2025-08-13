# 🔍 Notification Debugging Guide

## 🚨 Why You're Not Getting Notifications

### **Issue 1: Time Already Passed**

If you set the time to a time that's already passed today, the notification will be scheduled for tomorrow.

**Example:**

- Current time: 2:30 PM
- You set notification time: 1:00 PM
- Result: Notification scheduled for tomorrow at 1:00 PM

### **Issue 2: Push Server Not Deployed**

If your push server isn't deployed or running, notifications won't work.

### **Issue 3: Environment Variables Missing**

Missing VAPID keys or API keys will prevent notifications.

## 🔧 How to Debug

### **Step 1: Test Immediate Notification**

1. Enable notifications in the app
2. Click the "🔔 Test Notification" button
3. You should get an immediate notification

### **Step 2: Check Push Server Status**

Visit your push server health endpoint:

```
https://your-railway-url.railway.app/health
```

You should see:

```json
{
  "ok": true,
  "subscriptions": 1,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### **Step 3: Check Railway Logs**

1. Go to your Railway project
2. Click on your service
3. Go to "Deployments" tab
4. Click on latest deployment
5. Check the logs for:
   - "New subscription: [endpoint]"
   - "Scheduling notifications at [time]"
   - "✅ Sent notification to [endpoint]"

### **Step 4: Check Browser Console**

1. Open browser dev tools (F12)
2. Go to Console tab
3. Look for:
   - "Push subscription registered"
   - Any error messages

## 🕐 Setting the Right Time

### **For Testing Today:**

1. Check current time
2. Set notification time to 1-2 minutes from now
3. Wait for the notification

### **Example:**

- Current time: 2:30 PM
- Set notification time: 2:32 PM
- Wait 2 minutes for notification

## 🐛 Common Issues & Solutions

### **"Push notifications not configured"**

- Add `VITE_PUSH_SERVER_URL` to Vercel environment variables
- Make sure your Railway push server is deployed

### **"Failed to enable notifications"**

- Check if VAPID keys are correct
- Verify OpenWeatherMap API key
- Check browser notification permissions

### **"Test notification sent" but no notification appears**

- Check browser notification settings
- Make sure notifications are allowed for your site
- Check if browser is in focus (some browsers don't show notifications when focused)

### **Scheduled notifications not working**

- Check Railway logs for scheduling messages
- Verify the time you set is in the future
- Check if push server is running continuously

## 📱 Mobile vs Desktop

### **Mobile:**

- Notifications work even when app is closed
- May need to allow notifications in browser settings
- Some mobile browsers have different notification behavior

### **Desktop:**

- Notifications work when browser is open
- May not work when browser is completely closed
- Check system notification settings

## 🔄 Testing Process

1. **Deploy push server to Railway**
2. **Add environment variables to Vercel**
3. **Enable notifications in app**
4. **Click "Test Notification"** (should work immediately)
5. **Set time to 1-2 minutes from now**
6. **Wait for scheduled notification**

## 📊 Debugging Checklist

- [ ] Push server deployed to Railway
- [ ] Environment variables set in Vercel
- [ ] VAPID keys generated and configured
- [ ] OpenWeatherMap API key working
- [ ] Notifications enabled in app
- [ ] Test notification works
- [ ] Time set to future time
- [ ] Railway logs show scheduling
- [ ] Browser notifications allowed

## 🆘 Still Not Working?

1. **Check Railway logs** for errors
2. **Verify all environment variables** are set
3. **Test with immediate notification** first
4. **Check browser notification permissions**
5. **Try different browser** (Chrome works best)
6. **Check if push server is responding** at health endpoint
