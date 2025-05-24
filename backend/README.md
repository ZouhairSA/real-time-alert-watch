# AI Security V2 - Backend API

This folder contains the backend API for the AI Security V2 application. The API is built using Flask and provides endpoints for authentication, users, cameras, detections, and AI models.

## Project Structure

```
backend/
├── app.py                 # Main application entry point
├── config.py              # Configuration variables
├── wsgi.py                # WSGI entry point for production deployment
├── requirements.txt       # Python dependencies
├── routes/                # API route handlers
│   ├── auth_routes.py     # Authentication routes
│   ├── user_routes.py     # User management routes
│   ├── camera_routes.py   # Camera management routes
│   ├── detection_routes.py # Detection data routes
│   └── model_routes.py    # AI model management routes
└── services/              # Business logic services
    ├── db_service.py      # Database connection and setup
    └── camera_service.py  # Camera processing and frame generation
```

## Setup Instructions

### 1. Environment Setup

1. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Upgrade pip:
   ```bash
   python -m pip install --upgrade pip
   ```

3. Install dependencies:
   ```bash
   pip install flask==2.2.3 flask-cors==3.0.10 flask-jwt-extended==4.4.4 flask-socketio==5.3.3 mysql-connector-python==8.0.32 python-dotenv==1.0.0 werkzeug==2.2.3 gunicorn==20.1.0 python-engineio==4.8.0 python-socketio==5.10.0
   ```

### 2. Database Configuration

1. Create a MySQL database:
   ```sql
   CREATE DATABASE ai_security_v2;
   ```

2. Create a `.env` file in the backend directory with the following content:
   ```
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=ai_security_v2
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET_KEY=your-secret-key-here

   # Server Configuration
   PORT=5000
   FLASK_DEBUG=True
   ```

### 3. Running the Application

1. Start the backend server:
   ```bash
   python app.py
   ```
   The server will start on http://localhost:5000

2. For production deployment:
   ```bash
   python wsgi.py
   ```

## Production Deployment

For production deployment to hosting services like InfinityFree:

1. Configure the database connection in `config.py` with your hosting provider's MySQL credentials
2. Set environment variables for configuration (especially sensitive data like API keys)
3. Use the WSGI entry point: `wsgi.py`

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login

### Users
- GET `/api/users` - Get all users (admin only)
- POST `/api/users` - Create a new user (admin only)
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user (admin only)

### Cameras
- GET `/api/cameras` - Get all cameras (filtered by user permission)
- POST `/api/cameras` - Create a new camera (admin only)
- GET `/api/cameras/:id` - Get camera by ID
- PUT `/api/cameras/:id` - Update camera (admin only)
- DELETE `/api/cameras/:id` - Delete camera (admin only)
- GET `/api/cameras/:id/stream` - Stream camera feed (MJPEG)

### Detections
- GET `/api/detections` - Get all detections (filtered by user permission)
- GET `/api/detections/:id` - Get detection by ID
- DELETE `/api/detections/:id` - Delete detection (admin only)

### AI Models
- GET `/api/models` - Get all AI models (admin only)
- POST `/api/models` - Create a new AI model (admin only)
- GET `/api/models/:id` - Get AI model by ID (admin only)
- PUT `/api/models/:id` - Update AI model (admin only)
- DELETE `/api/models/:id` - Delete AI model (admin only)

## WebSocket Events

- Connection: Client connects to websocket server
- Subscribe: Client subscribes to notifications for a specific user
- Detection Alert: Server sends real-time detection alerts to subscribed clients
