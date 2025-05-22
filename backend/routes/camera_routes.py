
from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from mysql.connector import Error
from services.db_service import get_db_connection
from services.camera_service import generate_frames

camera_bp = Blueprint('camera', __name__)

@camera_bp.route('', methods=['GET'])
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

@camera_bp.route('', methods=['POST'])
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

@camera_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_camera(id):
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    is_admin = current_user.get('role') == 'admin'
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cameras WHERE id = %s", (id,))
    camera = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not camera:
        return jsonify({"error": "Camera not found"}), 404
    
    if not is_admin and camera['user_id'] != user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    return jsonify(camera), 200

@camera_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_camera(id):
    current_user = get_jwt_identity()
    is_admin = current_user.get('role') == 'admin'
    
    if not is_admin:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor()
    
    try:
        # Check if camera exists
        cursor.execute("SELECT id FROM cameras WHERE id = %s", (id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": "Camera not found"}), 404
        
        # Build update query dynamically
        update_fields = []
        params = []
        
        fields = ['name', 'location', 'ip_address', 'status', 'user_id']
        for field in fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                params.append(data[field])
        
        if not update_fields:
            cursor.close()
            conn.close()
            return jsonify({"error": "No valid fields to update"}), 400
        
        # Complete params with camera ID
        params.append(id)
        
        # Execute update
        query = f"UPDATE cameras SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, params)
        conn.commit()
        
        # Log action
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, timestamp) VALUES (%s, %s, NOW())",
            (current_user.get('id'), f"Updated camera {id}")
        )
        conn.commit()
        
    except Error as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
    cursor.close()
    conn.close()
    
    return jsonify({"message": "Camera updated successfully"}), 200

@camera_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_camera(id):
    current_user = get_jwt_identity()
    is_admin = current_user.get('role') == 'admin'
    
    if not is_admin:
        return jsonify({"error": "Unauthorized"}), 403
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor()
    
    try:
        # Check if camera exists
        cursor.execute("SELECT name FROM cameras WHERE id = %s", (id,))
        camera = cursor.fetchone()
        
        if not camera:
            cursor.close()
            conn.close()
            return jsonify({"error": "Camera not found"}), 404
        
        camera_name = camera[0]
        
        # Delete camera
        cursor.execute("DELETE FROM cameras WHERE id = %s", (id,))
        conn.commit()
        
        # Log action
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, timestamp) VALUES (%s, %s, NOW())",
            (current_user.get('id'), f"Deleted camera {camera_name}")
        )
        conn.commit()
        
    except Error as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
    cursor.close()
    conn.close()
    
    return jsonify({"message": "Camera deleted successfully"}), 200

@camera_bp.route('/<int:camera_id>/stream')
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
    
    return Response(
        generate_frames(camera.get('ip_address')),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

