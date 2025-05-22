
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from datetime import timedelta
import os
from config import DB_CONFIG, AI_MODEL_KEYS, AI_MODEL_ENDPOINTS
from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.camera_routes import camera_bp
from routes.detection_routes import detection_bp
from routes.model_routes import model_bp
from services.db_service import setup_database
from services.camera_service import start_camera_threads

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key')  # Change this in production!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)

# Configure Socket.IO
socketio = SocketIO(app, cors_allowed_origins="*")

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(camera_bp, url_prefix='/api/cameras')
app.register_blueprint(detection_bp, url_prefix='/api/detections')
app.register_blueprint(model_bp, url_prefix='/api/models')

if __name__ == '__main__':
    # Setup database
    setup_database()
    
    # Start background threads for active cameras
    start_camera_threads(socketio)
    
    # Start the Socket.IO server
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=(os.environ.get('FLASK_DEBUG', 'True') == 'True'))

