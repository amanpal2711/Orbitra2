# Orbitra Itinerary

A full-stack MERN application for creating, managing, and sharing AI-assisted travel itineraries from uploaded travel documents.

## Project Structure

```text
orbitra-itinerary/
|-- client/          React + Vite + Tailwind CSS
|-- server/          Node.js + Express + MongoDB
|   |-- config/      Database and service configuration
|   |-- controllers/ Route controllers
|   |-- middleware/  Auth and upload middleware
|   |-- models/      Mongoose models
|   |-- routes/      API routes
|   `-- utils/       AI and parsing utilities
|-- package.json     Root scripts for running both apps
`-- README.md
```

## Prerequisites

- Node.js 18 or higher
- MongoDB, local or hosted
- Cloudinary credentials for document uploads
- Google Generative AI API key for itinerary generation

## Setup

Install dependencies:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-vercel-app.vercel.app
# FRONTEND_URLS=https://your-vercel-app.vercel.app,https://your-vercel-preview.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
```

Create `client/.env`:

```env
VITE_API_URL=/api
```

## Development

Run the client and server together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:server
npm run dev:client
```

- Server: `http://localhost:5000`
- Client: `http://localhost:3000`

## Production Build

```bash
npm run build --prefix client
npm start --prefix server
```

## Deployment

### Backend on Render

- If you deploy from the repository root, use `npm run build` as the build command and `npm start` as the start command
- If you deploy the backend as its own Render service with root directory `server`, use `npm install` as the build command and `npm start` as the start command
- Set `MONGODB_URI`, `JWT_SECRET`, Cloudinary credentials, and `GOOGLE_GENERATIVE_AI_API_KEY`
- Set `FRONTEND_URL` to your Vercel deployment URL
- If you use Vercel preview deployments, add them to `FRONTEND_URLS`

### Frontend on Vercel

- Set the project root directory to `client`
- Use `npm run build` as the build command
- Use `dist` as the output directory
- Set `VITE_API_URL` to your Render backend URL, for example `https://your-render-service.onrender.com/api`
- Keep `client/vercel.json` in place so React Router routes resolve to `index.html`

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/itineraries/generate`
- `GET /api/itineraries`
- `GET /api/itineraries/:id`
- `POST /api/itineraries/:id/share`
- `POST /api/itineraries/:id/claim`
- `GET /api/itineraries/share/:shareToken`
- `DELETE /api/itineraries/:id`

## License

MIT
