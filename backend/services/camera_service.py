
import threading
import time
import cv2
import json
import requests
from datetime import datetime
from mysql.connector import Error
from flask_socketio import join_room
from config import AI_MODEL_KEYS
from services.db_service import get_db_connection

def capture_frames(camera_id, rtsp_url, socketio, interval=1):
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

def generate_frames(camera_ip_address):
    cap = cv2.VideoCapture(camera_ip_address)
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

def start_camera_threads(socketio):
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
            args=(camera['id'], camera['ip_address'], socketio),
            daemon=True
        )
        camera_thread.start()
        print(f"Started camera thread for camera {camera['id']} - {camera['name']}")

