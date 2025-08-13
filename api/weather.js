export default async function handler(req, res) {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: "Missing lat/lon parameters" });
    }
  
    const apiKey = process.env.OPENWEATHERMAP_KEY;
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily&units=metric&appid=${apiKey}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weather" });
    }
  }
  