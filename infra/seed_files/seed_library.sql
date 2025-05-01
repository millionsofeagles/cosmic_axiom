INSERT INTO FindingTemplate (
    id, title, description, recommendation, severity, reference, tags, createdAt, updatedAt
) VALUES 
(
    UUID(),
    'Unrestricted File Upload',
    'The application allows users to upload arbitrary files without validation. This could be exploited to upload web shells or malicious scripts.',
    'Implement server-side checks for MIME types, restrict allowed extensions, and store uploaded files outside the web root.',
    'HIGH',
    'CWE-434',
    JSON_ARRAY('web', 'upload', 'input-validation'),
    NOW(), NOW()
),
(
    UUID(),
    'Insecure Direct Object Reference (IDOR)',
    'Sensitive objects (like user records) are accessible by changing a parameter value in the request URL or body.',
    'Apply access control checks on every request using object ownership validation.',
    'MEDIUM',
    'CWE-639',
    JSON_ARRAY('authorization', 'api', 'web'),
    NOW(), NOW()
);
