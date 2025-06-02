const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

//app.use(express.json());

// Parse incoming JSON requests
app.use(bodyParser.json());

app.post('/webhook/visitor-sign-out', (req, res) => {
// Always respond immediately
  //res.status(200).send('OK');
  const event = req.body;
  //console.log("Received sign-out event:", JSON.stringify(event, null, 2));

  // Extract visitor info and custom time limit from config
  const { signedInTimestamp, signedOutTimestamp, fullName } = event.payload.visitor;
  const allowedMinutes = parseInt(event.config.VISITOR_TIME_LIMIT, 10);

  const durationMs = new Date(signedOutTimestamp) - new Date(signedInTimestamp);
  const durationMin = Math.round(durationMs / 60000);

  const message = durationMin > allowedMinutes
    ? `⚠️ ${fullName} overstayed by ${durationMin - allowedMinutes} minutes.`
    : `✅ ${fullName} left on time.`;

  res.status(200).json({ message });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
