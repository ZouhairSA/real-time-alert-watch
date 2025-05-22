
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash
from config import DB_CONFIG

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL database: {e}")
        return None

def setup_database():
    try:
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor()
            
            # Create tables if they don't exist
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
            
            print("Database setup completed successfully")
        else:
            print("Failed to connect to database for setup")
            
    except Error as e:
        print(f"Error setting up database: {e}")

