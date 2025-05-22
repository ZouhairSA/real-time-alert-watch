
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.db_service import get_db_connection
import json

detection_bp = Blueprint('detection', __name__)

@detection_bp.route('', methods=['GET'])
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

@detection_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_detection(id):
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    is_admin = current_user.get('role') == 'admin'
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT d.*, c.name as camera_name, m.name as model_name
    FROM detections d
    JOIN cameras c ON d.camera_id = c.id
    JOIN models m ON d.model_id = m.id
    WHERE d.id = %s
    """
    cursor.execute(query, (id,))
    detection = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    if not detection:
        return jsonify({"error": "Detection not found"}), 404
    
    if not is_admin and detection['user_id'] != user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    # Parse metadata if it's a string
    if isinstance(detection.get('metadata'), str):
        try:
            detection['metadata'] = json.loads(detection['metadata'])
        except:
            detection['metadata'] = {}
    
    return jsonify(detection), 200

@detection_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_detection(id):
    current_user = get_jwt_identity()
    is_admin = current_user.get('role') == 'admin'
    
    if not is_admin:
        return jsonify({"error": "Unauthorized"}), 403
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor()
    
    try:
        # Check if detection exists
        cursor.execute("SELECT id FROM detections WHERE id = %s", (id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": "Detection not found"}), 404
        
        # Delete detection
        cursor.execute("DELETE FROM detections WHERE id = %s", (id,))
        conn.commit()
        
        # Log action
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, timestamp) VALUES (%s, %s, NOW())",
            (current_user.get('id'), f"Deleted detection {id}")
        )
        conn.commit()
        
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
    cursor.close()
    conn.close()
    
    return jsonify({"message": "Detection deleted successfully"}), 200

