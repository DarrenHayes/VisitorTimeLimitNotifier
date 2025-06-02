const express = require('express');
//const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Parse incoming JSON requests
//app.use(bodyParser.json());

app.post('/visitor-sign-out', async (req, res) => {
  try {
    const event = req.body;
    if (!event?.payload?.visitor) throw new Error("Missing visitor data");

    const { signedInTimestamp, signedOutTimestamp, fullName } = event.payload.visitor;
    const allowedMinutes = parseInt(event.config.VISITOR_TIME_LIMIT, 10);

    const durationMs = new Date(signedOutTimestamp) - new Date(signedInTimestamp);
    const durationMin = Math.round(durationMs / 60000);

    const message = durationMin > allowedMinutes
      ? `⚠️ ${fullName} overstayed by ${durationMin - allowedMinutes} minutes.`
      : `✅ ${fullName} left on time.`;

    console.log("Result:", message);
    return res.status(200).json({ message: "✅ Webhook received" });

  } catch (error) {
    console.error("Error processing visitor-sign-out:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
