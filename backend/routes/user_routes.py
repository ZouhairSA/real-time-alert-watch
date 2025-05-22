
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from mysql.connector import Error
from services.db_service import get_db_connection

user_bp = Blueprint('user', __name__)

@user_bp.route('', methods=['GET'])
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

@user_bp.route('', methods=['POST'])
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

@user_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_user(id):
    current_user = get_jwt_identity()
    
    # Check if user is admin or the requested user
    if current_user.get('role') != 'admin' and current_user.get('id') != id:
        return jsonify({"error": "Unauthorized"}), 403
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, username, email, role, created_at FROM users WHERE id = %s", (id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user), 200

@user_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    current_user = get_jwt_identity()
    
    # Check if user is admin or the requested user
    if current_user.get('role') != 'admin' and current_user.get('id') != id:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor()
    
    try:
        # Build update query dynamically based on provided fields
        update_fields = []
        params = []
        
        if 'email' in data:
            update_fields.append("email = %s")
            params.append(data['email'])
        
        if 'password' in data and data['password']:
            update_fields.append("password_hash = %s")
            params.append(generate_password_hash(data['password']))
        
        # Only admin can change role
        if 'role' in data and current_user.get('role') == 'admin':
            update_fields.append("role = %s")
            params.append(data['role'])
        
        if not update_fields:
            return jsonify({"error": "No valid fields to update"}), 400
        
        # Complete the parameter list with the user ID
        params.append(id)
        
        # Execute update query
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, params)
        conn.commit()
        
        # Log the action
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, timestamp) VALUES (%s, %s, NOW())",
            (current_user.get('id'), f"Updated user {id}")
        )
        conn.commit()
        
    except Error as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
    affected_rows = cursor.rowcount
    cursor.close()
    conn.close()
    
    if affected_rows == 0:
        return jsonify({"error": "User not found or no changes made"}), 404
    
    return jsonify({"message": "User updated successfully"}), 200

@user_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    current_user = get_jwt_identity()
    
    # Only admin can delete users
    if current_user.get('role') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    # Prevent deleting own account
    if current_user.get('id') == id:
        return jsonify({"error": "Cannot delete your own account"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection error"}), 500
    
    cursor = conn.cursor()
    
    try:
        # Log the action before deletion to capture username
        cursor.execute("SELECT username FROM users WHERE id = %s", (id,))
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            conn.close()
            return jsonify({"error": "User not found"}), 404
        
        username = user[0]
        
        # Delete user
        cursor.execute("DELETE FROM users WHERE id = %s", (id,))
        conn.commit()
        
        # Log the action
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, timestamp) VALUES (%s, %s, NOW())",
            (current_user.get('id'), f"Deleted user {username}")
        )
        conn.commit()
        
    except Error as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
    cursor.close()
    conn.close()
    
    return jsonify({"message": "User deleted successfully"}), 200

