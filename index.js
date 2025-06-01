const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON requests
app.use(bodyParser.json());

app.post('/visitor-sign-out', (req, res) => {
  const event = req.body;
  console.log("Received sign-out event:", JSON.stringify(event, null, 2));

  // Extract visitor info and custom time limit from config
  const { signedInTimestamp, signedOutTimestamp, fullName } = event.payload.visitor;
  const allowedMinutes = parseInt(event.config.allowed_minutes, 10);

  const durationMs = new Date(signedOutTimestamp) - new Date(signedInTimestamp);
  const durationMin = Math.round(durationMs / 60000);

  const message = durationMin > allowedMinutes
    ? `⚠️ ${fullName} overstayed by ${durationMin - allowedMinutes} minutes.`
    : `✅ ${fullName} left on time.`;

  return res.status(200).json({ message });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
