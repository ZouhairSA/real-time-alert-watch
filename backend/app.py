
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from datetime import timedelta
import os
import json
import cv2
import requests
import numpy as np
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash
from flask_socketio import SocketIO, emit
import base64
import time
from datetime import datetime
import threading

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configure JWT
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this in production!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)

# Configure Socket.IO
socketio = SocketIO(app, cors_allowed_origins="*")

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'ai_security_v2',
    'user': 'root',
    'password': ''  # XAMPP default
}

# AI Model API Keys
AI_MODEL_KEYS = {
    "AIcrowd_v1": "api_key_crowd_123",
    "AIweapon_v1": "api_key_weapon_456",
    "AIfire_v1": "api_key_fire_789",
    "AIobject_v1": "api_key_object_012"
}

# AI Model Endpoints
AI_MODEL_ENDPOINTS = {
    "AIcrowd_v1": "https://aicrowd-v1.onrender.com/detect",
    "AIweapon_v1": "https://aiweapon-v1.onrender.com/detect",
    "AIfire_v1": "https://aifire-v1.onrender.com/detect",
    "AIobject_v1": "https://aiobject-v1.onrender.com/detect"
}

# Database connection function
def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL database: {e}")
        return None

# Authentication routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Missing username or password"}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, username, password_hash, email, role FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Invalid username or password"}), 401
    
    # Create JWT token
    access_token = create_access_token(identity={
        'id': user['id'],
        'username': user['username'],
        'email': user['email'],
        'role': user['role']
    })
    
    return jsonify({
        'message': 'Login successful',
        'token': access_token,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'role': user['role']
        }
    }), 200

# User routes
@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user = get_jwt_identity()
    
    # Check if user is admin
    if current_user.get('role') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, username, email, role, created_at FROM users")
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return jsonify(users), 200

@app.route('/api/users', methods=['POST'])
@jwt_required()
def create_user():
    current_user = get_jwt_identity()
    
    # Check if user is admin
    if current_user.get('role') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password') or not data.get('email') or not data.get('role'):
        return jsonify({"error": "Missing required fields"}), 400
    
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    role = data.get('role')
    
    # Hash password
    password_hash = generate_password_hash(password)
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash, email, role) VALUES (%s, %s, %s, %s)",
            (username, password_hash, email, role)
        )
        conn.commit()
        user_id = cursor.lastrowid
        
        # Log the action
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, timestamp) VALUES (%s, %s, NOW())",
            (current_user.get('id'), f"Created user {username}")
        )
        conn.commit()
        
    except Error as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
    cursor.close()
    conn.close()
    
    return jsonify({
        "message": "User created successfully",
        "id": user_id
    }), 201

# Similar routes for PUT/DELETE user, not shown for brevity

# Camera routes
@app.route('/api/cameras', methods=['GET'])
@jwt_required()
def get_cameras():
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    is_admin = current_user.get('role') == 'admin'
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    if is_admin:
        cursor.execute("SELECT * FROM cameras")
    else:
        cursor.execute("SELECT * FROM cameras WHERE user_id = %s", (user_id,))
    
    cameras = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return jsonify(cameras), 200

@app.route('/api/cameras', methods=['POST'])
@jwt_required()
def create_camera():
    current_user = get_jwt_identity()
    is_admin = current_user.get('role') == 'admin'
    
    if not is_admin:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('location') or not data.get('ip_address') or not data.get('user_id'):
        return jsonify({"error": "Missing required fields"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO cameras (name, location, ip_address, user_id, status) VALUES (%s, %s, %s, %s, %s)",
            (data.get('name'), data.get('location'), data.get('ip_address'), data.get('user_id'), data.get('status', 'inactive'))
        )
        conn.commit()
        camera_id = cursor.lastrowid
        
        # Log the action
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, timestamp) VALUES (%s, %s, NOW())",
            (current_user.get('id'), f"Created camera {data.get('name')}")
        )
        conn.commit()
        
    except Error as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
    cursor.close()
    conn.close()
    
    return jsonify({
        "message": "Camera created successfully",
        "id": camera_id
    }), 201

# Similar routes for PUT/DELETE camera, not shown for brevity

# AI Model routes
@app.route('/api/models', methods=['GET'])
@jwt_required()
def get_models():
    current_user = get_jwt_identity()
    
    # Check if user is admin
    if current_user.get('role') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, endpoint_url, description, created_at FROM models")  # Not returning api_key
    models = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return jsonify(models), 200

# Detection routes
@app.route('/api/detections', methods=['GET'])
@jwt_required()
def get_detections():
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    is_admin = current_user.get('role') == 'admin'
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    # Join with cameras to get camera name
    if is_admin:
        query = """
        SELECT d.*, c.name as camera_name 
        FROM detections d
        JOIN cameras c ON d.camera_id = c.id
        ORDER BY d.timestamp DESC
        """
        cursor.execute(query)
    else:
        query = """
        SELECT d.*, c.name as camera_name 
        FROM detections d
        JOIN cameras c ON d.camera_id = c.id
        WHERE d.user_id = %s
        ORDER BY d.timestamp DESC
        """
        cursor.execute(query, (user_id,))
    
    detections = cursor.fetchall()
    cursor.close()
    conn.close()
    
    # Format metadata as JSON if it's stored as a string
    for detection in detections:
        if isinstance(detection.get('metadata'), str):
            try:
                detection['metadata'] = json.loads(detection['metadata'])
            except:
                detection['metadata'] = {}
    
    return jsonify(detections), 200

# RTSP streaming function
def capture_frames(camera_id, rtsp_url, interval=1):
    conn = get_db_connection()
    if not conn:
        print(f"Database connection error for camera {camera_id}")
        return
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cameras WHERE id = %s", (camera_id,))
    camera_data = cursor.fetchone()
    
    if not camera_data:
        print(f"Camera {camera_id} not found")
        cursor.close()
        conn.close()
        return
    
    user_id = camera_data['user_id']
    
    # Get all AI models
    cursor.execute("SELECT * FROM models")
    models = cursor.fetchall()
    cursor.close()
    conn.close()
    
    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        print(f"Error opening RTSP stream: {rtsp_url}")
        return
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print(f"Error reading frame from camera {camera_id}")
            break
        
        # Process the frame with each AI model
        for model in models:
            model_id = model['id']
            model_name = model['name']
            endpoint_url = model['endpoint_url']
            
            # Convert frame to JPEG
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            
            # Send to AI model API
            try:
                files = {'image': ('image.jpg', buffer.tobytes(), 'image/jpeg')}
                headers = {
                    'Authorization': f"Bearer {AI_MODEL_KEYS.get(model_name, '')}"
                }
                
                response = requests.post(endpoint_url, files=files, headers=headers)
                if response.status_code == 200:
                    detection_data = response.json()
                    
                    # Check if confidence score is high enough
                    if detection_data.get('confidence_score', 0) >= 0.5:
                        # Record detection in database
                        detection_type = detection_data.get('detection_type')
                        confidence_score = detection_data.get('confidence_score')
                        metadata = detection_data.get('metadata', {})
                        
                        conn2 = get_db_connection()
                        if conn2:
                            cursor2 = conn2.cursor()
                            try:
                                cursor2.execute(
                                    """
                                    INSERT INTO detections 
                                    (camera_id, user_id, model_id, detection_type, confidence_score, timestamp, metadata) 
                                    VALUES (%s, %s, %s, %s, %s, NOW(), %s)
                                    """,
                                    (camera_id, user_id, model_id, detection_type, confidence_score, json.dumps(metadata))
                                )
                                conn2.commit()
                                detection_id = cursor2.lastrowid
                                
                                # Send real-time alert via WebSocket
                                socketio.emit('detection_alert', {
                                    'id': detection_id,
                                    'camera_id': camera_id,
                                    'camera_name': camera_data['name'],
                                    'user_id': user_id,
                                    'type': detection_type,
                                    'confidence': confidence_score,
                                    'timestamp': datetime.now().isoformat(),
                                    'metadata': metadata
                                }, room=f"user_{user_id}")
                                
                            except Error as e:
                                conn2.rollback()
                                print(f"Database error: {str(e)}")
                            finally:
                                cursor2.close()
                                conn2.close()
            
            except Exception as e:
                print(f"API request error for model {model_name}: {str(e)}")
        
        # Sleep for the specified interval
        time.sleep(interval)
    
    cap.release()

# Camera stream endpoint (MJPEG)
@app.route('/api/cameras/<int:camera_id>/stream')
@jwt_required()
def stream_camera(camera_id):
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    is_admin = current_user.get('role') == 'admin'
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cameras WHERE id = %s", (camera_id,))
    camera = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not camera:
        return jsonify({"error": "Camera not found"}), 404
    
    if not is_admin and camera.get('user_id') != user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    def generate_frames():
        cap = cv2.VideoCapture(camera.get('ip_address'))
        if not cap.isOpened():
            return
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Convert to JPEG
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# WebSocket connection handling
@socketio.on('connect')
def handle_connect():
    # Authentication would be handled here in production
    print("Client connected")

@socketio.on('subscribe')
def handle_subscribe(data):
    user_id = data.get('user_id')
    if user_id:
        # Subscribe to user-specific room
        join_room(f"user_{user_id}")
        print(f"User {user_id} subscribed to notifications")

# Start background tasks for all active cameras
def start_camera_threads():
    conn = get_db_connection()
    if not conn:
        print("Database connection error when starting camera threads")
        return
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cameras WHERE status = 'active'")
    active_cameras = cursor.fetchall()
    cursor.close()
    conn.close()
    
    for camera in active_cameras:
        camera_thread = threading.Thread(
            target=capture_frames,
            args=(camera['id'], camera['ip_address']),
            daemon=True
        )
        camera_thread.start()

# Start the server with Socket.IO
if __name__ == '__main__':
    # Create database tables if they don't exist
    try:
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor()
            
            # Check if tables exist, create if not
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                role ENUM('admin', 'user') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS cameras (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                location VARCHAR(100) NOT NULL,
                ip_address VARCHAR(100) NOT NULL,
                status ENUM('active', 'inactive') NOT NULL DEFAULT 'inactive',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """)
            
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS models (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                endpoint_url VARCHAR(255) NOT NULL,
                api_key VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS detections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                camera_id INT NOT NULL,
                user_id INT NOT NULL,
                model_id INT NOT NULL,
                detection_type VARCHAR(50) NOT NULL,
                confidence_score FLOAT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata JSON,
                video_clip_path VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE,
                INDEX (camera_id),
                INDEX (user_id)
            )
            """)
            
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                action VARCHAR(255) NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """)
            
            conn.commit()
            
            # Insert default models if they don't exist
            cursor.execute("SELECT COUNT(*) as count FROM models")
            model_count = cursor.fetchone()[0]
            
            if model_count == 0:
                models_data = [
                    ("AIcrowd_v1", "https://aicrowd-v1.onrender.com/detect", "api_key_crowd_123", "Crowd detection model"),
                    ("AIweapon_v1", "https://aiweapon-v1.onrender.com/detect", "api_key_weapon_456", "Weapon detection model"),
                    ("AIfire_v1", "https://aifire-v1.onrender.com/detect", "api_key_fire_789", "Fire and smoke detection model"),
                    ("AIobject_v1", "https://aiobject-v1.onrender.com/detect", "api_key_object_012", "Object recognition model")
                ]
                
                for model_data in models_data:
                    cursor.execute(
                        "INSERT INTO models (name, endpoint_url, api_key, description) VALUES (%s, %s, %s, %s)",
                        model_data
                    )
                
                conn.commit()
                
            # Insert default admin user if no users exist
            cursor.execute("SELECT COUNT(*) as count FROM users")
            user_count = cursor.fetchone()[0]
            
            if user_count == 0:
                # Create default admin (username: admin, password: admin123)
                cursor.execute(
                    "INSERT INTO users (username, password_hash, email, role) VALUES (%s, %s, %s, %s)",
                    ("admin", generate_password_hash("admin123"), "admin@example.com", "admin")
                )
                
                # Create default user (username: user1, password: user123)
                cursor.execute(
                    "INSERT INTO users (username, password_hash, email, role) VALUES (%s, %s, %s, %s)",
                    ("user1", generate_password_hash("user123"), "user1@example.com", "user")
                )
                
                conn.commit()
            
            cursor.close()
            conn.close()
        
    except Error as e:
        print(f"Error setting up database: {e}")
    
    # Start background threads for active cameras
    start_camera_threads()
    
    # Start the Socket.IO server
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
