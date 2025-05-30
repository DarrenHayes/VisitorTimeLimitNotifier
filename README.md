# VisitorTimeLimitNotifier
Visitor TimeLimit Notifier

# Envoy Visitor Time Limit Notifier

This Node.js application integrates with the [Envoy Platform](https://envoy.com/developers) to notify whether a visitor has exceeded their allowed time on-premises. Upon visitor **sign-out**, the app calculates their total duration and attaches a message to the visitor log if they overstayed their configured time limit.

## Features

- Accepts a setup parameter: allowed visit duration (0–180 minutes).
- Validates configuration on install via the Envoy dashboard.
- Responds to sign-out webhook events to check and report overstays.
- Deployable on [Heroku](https://www.heroku.com/).

## Getting Started

### Prerequisites

- Node.js v16+
- Envoy dashboard access with developer privileges
- Heroku CLI installed and logged in

### Deployment Steps

1. Clone the repo:  
   `git clone https://github.com/your-username/envoy-visitor-notifier.git`

2. Add environment config if needed in `.env` or `config.js`.

3. Deploy to Heroku:  
   ```bash
   heroku create your-envoy-app-name  
   git push heroku main
