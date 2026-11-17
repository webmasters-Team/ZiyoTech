# ZiyoTech Sales AI MVP

This project contains the first working MVP for the ZiyoTech AI Sales Agent.

## What it does

- Understands customer messages in Uzbek, Russian, and English
- Searches a product catalog instead of inventing products
- Recommends products based on the customer request and budget
- Collects leads and can hand off to a human salesperson
- Works with Telegram-first messaging

## Tech stack

- Node.js + Express
- React + TypeScript frontend
- PostgreSQL roadmap
- Google Gemini API integration
- Telegram-ready bot architecture

## Run locally

1. Install dependencies

   npm install

2. Start the backend

   npm run dev:server

3. Test the API

   curl http://localhost:4000/api/health

4. Send a sample sales message

   curl -X POST http://localhost:4000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"Menga 3 million so\'mga yaxshi telefon kerak","customerName":"Ali","channel":"telegram"}'

## Notes

- This is a demo MVP using a sample product catalog.
- Real Telegram Bot API and PostgreSQL integration will be added in the next phase.
- The AI engine is intentionally catalog-grounded so it does not invent product names or prices.
