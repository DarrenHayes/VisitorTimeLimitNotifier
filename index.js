// Import the Express framework to create the server
const express = require('express');
//const bodyParser = require('body-parser');

// Load environment variables from a .env file into process.env
const dotenv = require('dotenv');

// Initialize an Express application
const app = express();
// Load environment variables
dotenv.config();

// Define the port the app will listen on, defaulting to 3000 if not set
const PORT = process.env.PORT || 3000;

// Enable Express to parse incoming JSON requests (replaces body-parser)
//app.use(bodyParser.json());
app.use(express.json());

// Define the POST endpoint for Envoy's "visitor-signed-out" webhook
app.post('/visitor-sign-out', async (req, res) => {
  try {
    // Parse the JSON body of the incoming webhook event
    const event = req.body;
    // Retrieve the configuration value set during app setup
    const config = event.config || {};
    const allowedMinutes = parseInt(config.VISITOR_TIME_LIMIT, 10);

    // Validate the allowed time limit value
    if (isNaN(allowedMinutes) || allowedMinutes < 0 || allowedMinutes > 180) {
      console.error('Invalid VISITOR_TIME_LIMIT configuration.');
      return res.status(400).json({ error: 'Invalid VISITOR_TIME_LIMIT configuration.' });
    }

    // Extract visitor sign-in and sign-out timestamps from the payload
    const visitor = event.payload.visitor;
    const signedInTime = new Date(visitor.signedInTimestamp);
    const signedOutTime = new Date(visitor.signedOutTimestamp);
    // Calculate the visit duration in minutes
    const durationMinutes = Math.round((signedOutTime - signedInTime) / 60000);
    // Extract visitor's full name for messaging
    const fullName = visitor.fullName;

    // Create a custom message depending on whether the visitor overstayed
    const message = durationMinutes > allowedMinutes
      ? `⚠️ ${fullName} overstayed by ${durationMinutes - allowedMinutes} minutes.`
      : `✅ ${fullName} left on time.`;

    // Log the message to the console (useful for debugging/log auditing)
    console.log(message);
    // Respond back to Envoy with a message to be displayed in the dashboard
    return res.status(200).json({ message });

  } catch (err) {
    // Catch any unexpected runtime errors and log them
    console.error('Unexpected error:', err);
    // Return a generic internal server error to the client
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
