# URL Shortener Web Application

A modern web application for shortening URLs with real-time updates using React, Vite, and WebSocket.

## Features

- User authentication with email/password
- Two-factor authentication (2FA)
- URL shortening with validation date
- Real-time updates using WebSocket
- Responsive and modern UI using Material-UI
- Copy to clipboard functionality
- URL management (view, delete)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend API running on `http://localhost:8080`

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd url-shortenr-web
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
VITE_API_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## API Endpoints

The application expects the following API endpoints:

### Authentication
- POST `/api/auth/login` - Login with email and password
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/2fa/setup` - Setup 2FA
- POST `/api/auth/2fa/verify` - Verify 2FA code

### URL Management
- POST `/api/urls/shorten` - Create shortened URL
- GET `/api/urls` - Get all shortened URLs
- DELETE `/api/urls/:id` - Delete shortened URL

## WebSocket Events

The application listens for the following WebSocket events:
- `urlUpdate` - Real-time updates for new shortened URLs

## Technologies Used

- React
- Vite
- TypeScript
- Material-UI
- React Router
- Formik & Yup
- Socket.IO Client
- React Query
- Date-fns

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
