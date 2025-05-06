-- Create Customers
INSERT INTO Customer (id, name, createdAt, updatedAt)
VALUES 
('21111111-1111-1111-1111-111111111111', 'Acme Corporation', NOW(), NOW()),
('32222222-2222-2222-2222-222222222222', 'Stellar Cybersecurity', NOW(), NOW()),
('43333333-3333-3333-3333-333333333333', 'Orbit Industries', NOW(), NOW());

-- Create Contacts
-- For Acme Corporation
SET @acme_id = (SELECT id FROM Customer WHERE name = 'Acme Corporation');

INSERT INTO Contact (id, customerId, name, email, phone, isPrimary, createdAt, updatedAt)
VALUES 
(UUID(), @acme_id, 'Alice Johnson', 'alice@acme.com', '555-1234', TRUE, NOW(), NOW()),
(UUID(), @acme_id, 'Bob Smith', 'bob@acme.com', '555-5678', FALSE, NOW(), NOW());

-- For Stellar Cybersecurity
SET @stellar_id = (SELECT id FROM Customer WHERE name = 'Stellar Cybersecurity');

INSERT INTO Contact (id, customerId, name, email, phone, isPrimary, createdAt, updatedAt)
VALUES 
(UUID(), @stellar_id, 'Clara Nguyen', 'clara@stellar.com', '555-8765', TRUE, NOW(), NOW());

-- For Orbit Industries
SET @orbit_id = (SELECT id FROM Customer WHERE name = 'Orbit Industries');

INSERT INTO Contact (id, customerId, name, email, phone, isPrimary, createdAt, updatedAt)
VALUES 
(UUID(), @orbit_id, 'David Lee', 'david@orbit.com', '555-3456', TRUE, NOW(), NOW()),
(UUID(), @orbit_id, 'Ellen Ray', 'ellen@orbit.com', '555-9988', FALSE, NOW(), NOW());

INSERT INTO Engagement (id, name, description, startDate, endDate, status, createdAt, updatedAt, customerId)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Test Engagement', 'Testing manual seeding', '2025-05-01', '2025-05-31', 'PLANNED', NOW(), NOW(), '21111111-1111-1111-1111-111111111111'),
(UUID(), 'Test Engagement 2', 'Testing manual seeding 2', '2025-05-02', '2025-05-4', 'PLANNED', NOW(), NOW(), '32222222-2222-2222-2222-222222222222');