# KrushiMitra Backend (Local MongoDB)

## 1) Prerequisites
- Node.js installed
- MongoDB running locally on default port `27017`

## 2) Setup
```bash
cd backend
copy .env.example .env
npm install
```

Required `.env` keys:
- `MONGO_URI`
- `MONGO_DB_NAME`
- `JWT_SECRET`
- `GROQ_API_KEY`

## 3) Run
```bash
npm run dev
```

Backend starts at:
- `http://localhost:5000`

## 4) Test Routes
- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token required)
- `GET /api/farm`
- `POST /api/farm`
- `POST /api/image/analyze` (Bearer token + multipart image)
- `POST /api/image/analyze` (multipart image, real-time Groq analysis)

Sample payload for `POST /api/farm`:
```json
{
  "farmerName": "Ramesh Patil",
  "district": "Pune",
  "crop": "Sugarcane",
  "areaHectares": 2.5
}
```

Sample payload for `POST /api/auth/signup`:
```json
{
  "name": "Ramesh Patil",
  "email": "ramesh@example.com",
  "password": "StrongPass123"
}
```

`POST /api/image/analyze`:
- `Content-Type: multipart/form-data`
- file field: `image`
- text field: `mode` (`crop` or `soil`)
- optional text field: `prompt`
