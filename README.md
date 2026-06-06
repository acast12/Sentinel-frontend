# Sentinel — Dashboard

Next.js dashboard for the Sentinel air quality monitor. Displays live and historical temperature, humidity, eCO2, and TVOC readings from the backend API.

## Stack

- **Next.js + TypeScript** — framework and language
- **Tailwind CSS** — styling
- **Recharts** — sensor data charts

## Features

- Live readings with color coded status indicators (Good / Warning / Poor)
- Historical charts with 1H, 6H, 24H, and 7D time range selector
- Air quality guidelines reference panel
- Recent alerts table
- Loading skeletons on first render
- Polls backend every 5 seconds

## Setup

1. Copy `.env.local.example` to `.env.local` and fill in your backend URL
2. `npm install`
3. `npm run dev`

## Environment Variables

NEXT_PUBLIC_API_URL=http://localhost:3001

## Deployment

Deployed on Vercel. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL in the Vercel environment variables dashboard.
