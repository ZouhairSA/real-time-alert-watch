
-- Insert users (password hashes are for: 'admin123' and 'user123')
INSERT INTO users (username, password_hash, email, role) VALUES 
('admin', '$2b$12$1xxxxxxxxxxxxxxxxxxxxuZLbwxnpY0o58unSvIPxddLxGystC.', 'admin@example.com', 'admin'),
('user1', '$2b$12$2xxxxxxxxxxxxxxxxxxxxuTBEwGiNs13/z0OZ.Ht8nZxD8QUqu.', 'user1@example.com', 'user'),
('user2', '$2b$12$3xxxxxxxxxxxxxxxxxxxxu5YD5A9VVt6/9Lhgbf0ahEpVYm3KO.', 'user2@example.com', 'user');

-- Insert cameras
INSERT INTO cameras (user_id, name, location, ip_address, status) VALUES
(2, 'Main Entrance', 'Front Gate', 'rtsp://192.168.1.101:554/stream', 'active'),
(2, 'Parking Lot', 'North Side', 'rtsp://192.168.1.102:554/stream', 'active'),
(2, 'Staff Entrance', 'East Wing', 'rtsp://192.168.1.103:554/stream', 'inactive'),
(3, 'Server Room', 'Basement', 'rtsp://192.168.1.104:554/stream', 'active');

-- Insert models
INSERT INTO models (name, endpoint_url, api_key, description) VALUES
('AIcrowd_v1', 'https://aicrowd-v1.onrender.com/detect', 'api_key_crowd_123', 'Crowd detection model'),
('AIweapon_v1', 'https://aiweapon-v1.onrender.com/detect', 'api_key_weapon_456', 'Weapon detection model'),
('AIfire_v1', 'https://aifire-v1.onrender.com/detect', 'api_key_fire_789', 'Fire and smoke detection model'),
('AIobject_v1', 'https://aiobject-v1.onrender.com/detect', 'api_key_object_012', 'Object recognition model');

-- Insert sample detections
INSERT INTO detections (camera_id, user_id, model_id, detection_type, confidence_score, timestamp, metadata) VALUES
(1, 2, 2, 'weapon', 0.87, '2025-05-22 14:32:15', '{"weapon_type": "handgun", "bounding_box": [124, 195, 83, 45]}'),
(2, 2, 1, 'crowd', 0.93, '2025-05-22 14:35:22', '{"density": 0.76, "movement": "rapid"}'),
(4, 3, 3, 'fire', 0.68, '2025-05-22 14:40:05', '{"flame_detected": true, "smoke_detected": true}'),
(1, 2, 4, 'object', 0.95, '2025-05-22 14:45:30', '{"object_type": "suitcase", "bounding_box": [220, 310, 100, 120]}');
