-- Create an admin user
INSERT INTO User (id, email, name, role, passwordHash, createdAt, updatedAt)
VALUES (
    UUID(),  -- or use a fixed UUID if preferred
    'admin@cosmic-axiom.io',
    'Administrator',
    'ADMIN',
    '$2b$10$T1ezt3YlKUEXrlh0dYO9zuYrsoRznQhVnco49Wr8X6Vc.0CWhCluC',  -- bcrypt hash for 'admin123'
    NOW(),
    NOW()
);

INSERT IGNORE INTO Role (name, description) VALUES ('ADMIN', 'System administrator');
