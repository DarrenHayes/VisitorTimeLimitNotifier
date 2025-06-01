const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/visitor-sign-out', async (req, res) => {
  const payload = req.body.payload;
  const visitor = payload.visitor;
  const signInTime = new Date(visitor.signed_in_at);
  const signOutTime = new Date(visitor.signed_out_at);
  const duration = (signOutTime - signInTime) / 60000; // duration in minutes

  // Retrieve the configured time limit from your storage or environment
  const timeLimit = parseInt(process.env.VISITOR_TIME_LIMIT) || 60;

  if (duration > timeLimit) {
    // Attach a message to the visitor entry
    try {
      await axios.post(
        `https://api.envoy.com/v1/entries/${visitor.id}/messages`,
        {
          message: `Visitor overstayed by ${Math.round(duration - timeLimit)} minutes.`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.ENVOY_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error attaching message:', error);
    }
  }

  res.status(200).send('Webhook received');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
