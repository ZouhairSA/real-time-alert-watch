
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from mysql.connector import Error
from services.db_service import get_db_connection

model_bp = Blueprint('model', __name__)

@model_bp.route('', methods=['GET'])
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

@model_bp.route('', methods=['POST'])
@jwt_required()
def create_model():
    current_user = get_jwt_identity()
    
    # Check if user is admin
    if current_user.get('role') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('endpoint_url') or not data.get('api_key'):
        return jsonify({"error": "Missing required fields"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO models (name, endpoint_url, api_key, description)
            VALUES (%s, %s, %s, %s)
            """,
            (data.get('name'), data.get('endpoint_url'), data.get('api_key'), data.get('description', ''))
        )
        conn.commit()
        model_id = cursor.lastrowid
        
        # Log action
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, timestamp) VALUES (%s, %s, NOW())",
            (current_user.get('id'), f"Created AI model {data.get('name')}")
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
        "message": "AI model created successfully",
        "id": model_id
    }), 201

@model_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_model(id):
    current_user = get_jwt_identity()
    
    # Check if user is admin
    if current_user.get('role') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, endpoint_url, description, created_at FROM models WHERE id = %s", (id,))
    model = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not model:
        return jsonify({"error": "AI model not found"}), 404
    
    return jsonify(model), 200

@model_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_model(id):
    current_user = get_jwt_identity()
    
    # Check if user is admin
    if current_user.get('role') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor()
    
    try:
        # Check if model exists
        cursor.execute("SELECT id FROM models WHERE id = %s", (id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": "AI model not found"}), 404
        
        # Build update query
        update_fields = []
        params = []
        
        if 'name' in data:
            update_fields.append("name = %s")
            params.append(data['name'])
        
        if 'endpoint_url' in data:
            update_fields.append("endpoint_url = %s")
            params.append(data['endpoint_url'])
        
        if 'api_key' in data:
            update_fields.append("api_key = %s")
            params.append(data['api_key'])
        
        if 'description' in data:
            update_fields.append("description = %s")
            params.append(data['description'])
        
        if not update_fields:
            cursor.close()
            conn.close()
            return jsonify({"error": "No valid fields to update"}), 400
        
        # Complete params with model ID
        params.append(id)
        
        # Execute update
        query = f"UPDATE models SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, params)
        conn.commit()
        
        # Log action
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, timestamp) VALUES (%s, %s, NOW())",
            (current_user.get('id'), f"Updated AI model {id}")
        )
        conn.commit()
        
    except Error as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
    cursor.close()
    conn.close()
    
    return jsonify({"message": "AI model updated successfully"}), 200

@model_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_model(id):
    current_user = get_jwt_identity()
    
    # Check if user is admin
    if current_user.get('role') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor()
    
    try:
        # Check if model exists and get name
        cursor.execute("SELECT name FROM models WHERE id = %s", (id,))
        model = cursor.fetchone()
        
        if not model:
            cursor.close()
            conn.close()
            return jsonify({"error": "AI model not found"}), 404
        
        model_name = model[0]
        
        # Check if model is in use
        cursor.execute("SELECT COUNT(*) FROM detections WHERE model_id = %s", (id,))
        count = cursor.fetchone()[0]
        
        if count > 0:
            cursor.close()
            conn.close()
            return jsonify({"error": "Cannot delete model that is in use"}), 400
        
        # Delete model
        cursor.execute("DELETE FROM models WHERE id = %s", (id,))
        conn.commit()
        
        # Log action
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, timestamp) VALUES (%s, %s, NOW())",
            (current_user.get('id'), f"Deleted AI model {model_name}")
        )
        conn.commit()
        
    except Error as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
    cursor.close()
    conn.close()
    
    return jsonify({"message": "AI model deleted successfully"}), 200

