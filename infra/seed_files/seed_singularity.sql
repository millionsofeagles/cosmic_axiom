-- Create a Report for testing
SET @knownReportId := UUID();
INSERT INTO Report (id, engagementId, title, createdAt, updatedAt)
VALUES
(@knownReportId, '11111111-1111-1111-1111-111111111111', 'Q2 Penetration Test Report', NOW(), NOW());

INSERT INTO Section (id, reportId, type, data, position, createdAt, updatedAt)
VALUES 
(UUID(), @knownReportId,'finding', JSON_OBJECT('id', UUID(), 'title', 'SQL Injection in Login Form', 'description', 'The login form on /login does not sanitize input before constructing SQL queries, allowing attackers to bypass authentication or extract sensitive data from the database.', 'recommendation', 'Use parameterized queries (e.g., prepared statements) to prevent injection. Validate and sanitize all user input at both client and server side.', 'severity', 'High', 'reference', 'OWASP Top 10: Injection (A03:2021)', 'tags', JSON_ARRAY('sql-injection', 'owasp', 'authentication-bypass'), 'createdAt', NOW(), 'updatedAt', NOW()), 1, NOW(), NOW()),
(UUID(), @knownReportId, 'connectivity', JSON_OBJECT('results', 'All scoped assets were reachable.'), 2, NOW(), NOW());