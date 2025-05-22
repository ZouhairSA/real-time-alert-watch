
import os

# Database configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'database': os.environ.get('DB_NAME', 'ai_security_v2'),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', '')  # XAMPP default
}

# AI Model API Keys
AI_MODEL_KEYS = {
    "AIcrowd_v1": os.environ.get('API_KEY_CROWD', "api_key_crowd_123"),
    "AIweapon_v1": os.environ.get('API_KEY_WEAPON', "api_key_weapon_456"),
    "AIfire_v1": os.environ.get('API_KEY_FIRE', "api_key_fire_789"),
    "AIobject_v1": os.environ.get('API_KEY_OBJECT', "api_key_object_012")
}

# AI Model Endpoints
AI_MODEL_ENDPOINTS = {
    "AIcrowd_v1": os.environ.get('ENDPOINT_CROWD', "https://aicrowd-v1.onrender.com/detect"),
    "AIweapon_v1": os.environ.get('ENDPOINT_WEAPON', "https://aiweapon-v1.onrender.com/detect"),
    "AIfire_v1": os.environ.get('ENDPOINT_FIRE', "https://aifire-v1.onrender.com/detect"),
    "AIobject_v1": os.environ.get('ENDPOINT_OBJECT', "https://aiobject-v1.onrender.com/detect")
}

