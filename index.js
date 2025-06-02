const express = require('express');
//const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

//app.use(bodyParser.json());
app.use(express.json());

app.post('/visitor-sign-out', async (req, res) => {
  try {
    const event = req.body;
    const config = event.config || {};
    const allowedMinutes = parseInt(config.VISITOR_TIME_LIMIT, 10);

    if (isNaN(allowedMinutes) || allowedMinutes < 0 || allowedMinutes > 180) {
      console.error('Invalid VISITOR_TIME_LIMIT configuration.');
      return res.status(400).json({ error: 'Invalid VISITOR_TIME_LIMIT configuration.' });
    }

    const visitor = event.payload.visitor;
    //const signedInTime = new Date(visitor.signedInTimestamp);
    //const signedOutTime = new Date(visitor.signedOutTimestamp);
    const signedInTime = new Date(visitor.signed_in_at);
    const signedOutTime = new Date(visitor.signed_out_at);
    const durationMinutes = Math.round((signedOutTime - signedInTime) / 60000);
    const fullName = visitor.fullName;

    const message = durationMinutes > allowedMinutes
      ? `⚠️ ${fullName} overstayed by ${durationMinutes - allowedMinutes} minutes.`
      : `✅ ${fullName} left on time.`;

    console.log(message);
    return res.status(200).json({ message });

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
