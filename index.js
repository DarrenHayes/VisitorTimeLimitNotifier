// Import required modules
//require('dotenv').config();  //Safe to include for local; only affects local dev
const VISITOR_TIME_LIMIT = process.env.VISITOR_TIME_LIMIT; // for use with Heroku.  Add variable to Heroku
const ENVOY_API_TOKEN = process.env.ENVOY_API_TOKEN;  // for use with Heroku. Add variable to Heroku

const express = require('express');
const { middleware, errorMiddleware } = require('@envoy/envoy-integrations-sdk');

const bodyParser = require('body-parser');
const axios = require('axios');

// Create an instance of Express
const app = express();


//app.use(middleware());
app.use(bodyParser.json());


// Define the port the server will run on
//const PORT = 3000;  //for local testing
const PORT = process.env.PORT || 3000;

// Middleware: Parse JSON requests
app.use(express.json());

// Basic route for local test
app.get('/', (req, res) => {
  res.send('Hello, World! Welcome to my Time Limot Notifier app.');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//place VisitorTimeLimitNotifier route here
app.post('/visitor-signed-out', async (req, res) => {
  try {
    const { payload } = req.body;
    const visitor = payload.visitor;
    const visitorId = visitor.id;

    const signedIn = new Date(visitor.signedInTimestamp);
    const signedOut = new Date(visitor.signedOutTimestamp);
    const duration = Math.round((signedOut - signedIn) / 60000); // duration in minutes

    // Retrieve the configured time limit from your storage or environment
    const timeLimit = parseInt(process.env.VISITOR_TIME_LIMIT || "180", 10); // fallback default

    // Attach a message to the visitor entry
    if (duration > timeLimit) {
      const message = `⚠️ Visitor overstayed by ${duration - timeLimit} minutes.`;

      await axios.post(
        `https://api.envoy.com/v1/entries/${visitorId}/messages`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${process.env.ENVOY_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log('Listening on port 3000...');
});
