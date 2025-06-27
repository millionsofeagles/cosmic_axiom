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

-- Create Enhanced Engagements with new fields
INSERT INTO Engagement (
    id, name, description, startDate, endDate, status, 
    type, methodology, complianceFrameworks, riskTolerance,
    businessCriticalHours, criticalSystems, previousEngagements,
    budgetHours, maxConcurrentTesters,
    createdAt, updatedAt, customerId
)
VALUES
-- Acme Corporation - Network Penetration Test
(
    '11111111-1111-1111-1111-111111111111', 
    'Acme Corp Network Security Assessment', 
    'Comprehensive network penetration testing for Acme Corporation including internal and external network infrastructure, focusing on critical business systems and compliance requirements.',
    '2025-05-01', 
    '2025-05-31', 
    'PLANNED',
    'NETWORK_PENTEST',
    'BLACK_BOX',
    JSON_ARRAY('PCI_DSS', 'SOC2_TYPE2'),
    'MEDIUM',
    JSON_OBJECT('start', '09:00', 'end', '17:00', 'timezone', 'EST'),
    JSON_ARRAY('Primary Domain Controller', 'Payment Processing Server', 'Customer Database'),
    JSON_ARRAY(),
    160,
    3,
    NOW(), 
    NOW(), 
    '21111111-1111-1111-1111-111111111111'
),
-- Stellar Cybersecurity - Web Application Test
(
    '22222222-2222-2222-2222-222222222222',
    'Stellar Web Application Security Review',
    'Web application penetration testing for Stellar Cybersecurity customer portal and internal management systems.',
    '2025-05-15',
    '2025-05-25',
    'ACTIVE',
    'WEB_APP_PENTEST',
    'GRAY_BOX',
    JSON_ARRAY('OWASP_TOP_10', 'GDPR'),
    'HIGH',
    JSON_OBJECT('start', '08:00', 'end', '18:00', 'timezone', 'PST'),
    JSON_ARRAY('Customer Portal', 'Admin Dashboard', 'API Gateway'),
    JSON_ARRAY(),
    80,
    2,
    NOW(),
    NOW(),
    '32222222-2222-2222-2222-222222222222'
),
-- Orbit Industries - Cloud Security Assessment
(
    '33333333-3333-3333-3333-333333333333',
    'Orbit Cloud Infrastructure Assessment',
    'Cloud security assessment for Orbit Industries AWS infrastructure including container security, IAM review, and data protection analysis.',
    '2025-06-01',
    '2025-06-15',
    'PLANNED',
    'CLOUD_SECURITY',
    'WHITE_BOX',
    JSON_ARRAY('ISO27001', 'NIST_CSF', 'SOC2_TYPE2'),
    'CRITICAL',
    JSON_OBJECT('start', '10:00', 'end', '16:00', 'timezone', 'UTC'),
    JSON_ARRAY('Production EKS Cluster', 'RDS Database Cluster', 'S3 Data Lake'),
    JSON_ARRAY(),
    120,
    4,
    NOW(),
    NOW(),
    '43333333-3333-3333-3333-333333333333'
),
-- Additional engagements for variety
(
    '44444444-4444-4444-4444-444444444444',
    'Acme Mobile App Security Testing',
    'Security assessment of Acme Corporation mobile banking application for iOS and Android platforms.',
    '2025-07-01',
    '2025-07-10',
    'PLANNED',
    'MOBILE_APP_PENTEST',
    'BLACK_BOX',
    JSON_ARRAY('PCI_DSS', 'FFIEC'),
    'HIGH',
    JSON_OBJECT('start', '09:00', 'end', '17:00', 'timezone', 'EST'),
    JSON_ARRAY('Mobile Banking App', 'Transaction Processing'),
    JSON_ARRAY('11111111-1111-1111-1111-111111111111'),
    64,
    2,
    NOW(),
    NOW(),
    '21111111-1111-1111-1111-111111111111'
),
(
    '55555555-5555-5555-5555-555555555555',
    'Stellar Red Team Exercise',
    'Comprehensive red team exercise simulating advanced persistent threat scenarios against Stellar Cybersecurity infrastructure.',
    '2025-08-01',
    '2025-08-31',
    'PLANNED',
    'RED_TEAM',
    'BLACK_BOX',
    JSON_ARRAY('NIST_CSF'),
    'CRITICAL',
    JSON_OBJECT('start', '00:00', 'end', '23:59', 'timezone', 'PST'),
    JSON_ARRAY('Email Infrastructure', 'VPN Concentrators', 'Backup Systems'),
    JSON_ARRAY('22222222-2222-2222-2222-222222222222'),
    200,
    5,
    NOW(),
    NOW(),
    '32222222-2222-2222-2222-222222222222'
);

-- Create Enhanced Scope Entries with new categorization
INSERT INTO Scope (
    id, engagementId, address, description, inScope, notes,
    environment, criticality, assetType, techStack, authBoundary,
    dataClassification, geoRestrictions, thirdPartyDeps,
    createdAt, updatedAt
)
VALUES
-- Acme Corporation Network Pentest Scope
('s1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '192.168.1.0/24', 'Internal corporate network', TRUE, 'Primary office network segment', 'PRODUCTION', 'HIGH', 'NETWORK', JSON_ARRAY('Windows Server', 'Active Directory', 'Exchange'), 'acme.local', 'CONFIDENTIAL', NULL, JSON_ARRAY(), NOW(), NOW()),
('s1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', '10.0.0.0/16', 'Data center network', TRUE, 'Critical infrastructure segment', 'PRODUCTION', 'CRITICAL', 'INFRASTRUCTURE', JSON_ARRAY('VMware vSphere', 'NetApp Storage', 'Cisco Switches'), 'datacenter.acme.local', 'RESTRICTED', JSON_OBJECT('regions', JSON_ARRAY('US-EAST')), JSON_ARRAY('Cloud Backup Provider'), NOW(), NOW()),
('s1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'acme.com', 'Public web presence', TRUE, 'Corporate website and customer portal', 'PRODUCTION', 'MEDIUM', 'WEB_APPLICATION', JSON_ARRAY('React', 'Node.js', 'PostgreSQL'), 'auth.acme.com', 'INTERNAL', NULL, JSON_ARRAY('CDN Provider', 'Payment Gateway'), NOW(), NOW()),
('s1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', '172.16.0.0/12', 'Development network', FALSE, 'Development and testing environment - out of scope', 'DEVELOPMENT', 'LOW', 'NETWORK', JSON_ARRAY('Docker', 'Jenkins'), 'dev.acme.local', 'INTERNAL', NULL, JSON_ARRAY(), NOW(), NOW()),

-- Stellar Cybersecurity Web App Scope
('s2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'portal.stellar.com', 'Customer portal application', TRUE, 'Main customer-facing web application', 'PRODUCTION', 'HIGH', 'WEB_APPLICATION', JSON_ARRAY('Vue.js', 'Laravel', 'MySQL', 'Redis'), 'sso.stellar.com', 'CONFIDENTIAL', NULL, JSON_ARRAY('Auth0', 'Stripe'), NOW(), NOW()),
('s2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'api.stellar.com', 'REST API backend', TRUE, 'API supporting customer portal', 'PRODUCTION', 'CRITICAL', 'API', JSON_ARRAY('PHP', 'Laravel', 'PostgreSQL'), 'api.stellar.com', 'RESTRICTED', NULL, JSON_ARRAY('Third-party Analytics'), NOW(), NOW()),
('s2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'admin.stellar.com', 'Administrative dashboard', TRUE, 'Internal admin interface', 'PRODUCTION', 'HIGH', 'WEB_APPLICATION', JSON_ARRAY('React Admin', 'Node.js'), 'ldap.stellar.com', 'RESTRICTED', NULL, JSON_ARRAY(), NOW(), NOW()),

-- Orbit Industries Cloud Scope
('s3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'orbit-prod.amazonaws.com', 'AWS Production Environment', TRUE, 'Primary AWS production account', 'PRODUCTION', 'CRITICAL', 'CLOUD_RESOURCE', JSON_ARRAY('EKS', 'RDS', 'S3', 'Lambda'), 'AWS IAM', 'RESTRICTED', JSON_OBJECT('regions', JSON_ARRAY('us-east-1', 'us-west-2')), JSON_ARRAY('AWS Managed Services'), NOW(), NOW()),
('s3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'k8s.orbit.com', 'Kubernetes cluster endpoints', TRUE, 'Production Kubernetes workloads', 'PRODUCTION', 'CRITICAL', 'INFRASTRUCTURE', JSON_ARRAY('Kubernetes', 'Istio', 'Prometheus'), 'k8s-rbac', 'RESTRICTED', NULL, JSON_ARRAY('Container Registry'), NOW(), NOW()),
('s3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'orbit-staging.amazonaws.com', 'AWS Staging Environment', FALSE, 'Staging environment - out of scope for this assessment', 'STAGING', 'MEDIUM', 'CLOUD_RESOURCE', JSON_ARRAY('EKS', 'RDS'), 'AWS IAM', 'INTERNAL', NULL, JSON_ARRAY(), NOW(), NOW()),

-- Mobile App Scope
('s4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 'mobile-api.acme.com', 'Mobile banking API', TRUE, 'API backend for mobile applications', 'PRODUCTION', 'CRITICAL', 'API', JSON_ARRAY('Spring Boot', 'Oracle Database', 'Redis'), 'oauth2.acme.com', 'RESTRICTED', NULL, JSON_ARRAY('Payment Processor', 'Credit Bureau'), NOW(), NOW()),
('s4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 'iOS App Store', 'Acme Banking iOS App', TRUE, 'iOS mobile application', 'PRODUCTION', 'HIGH', 'MOBILE_APP', JSON_ARRAY('Swift', 'Core Data'), 'Keychain', 'CONFIDENTIAL', NULL, JSON_ARRAY('Apple Services'), NOW(), NOW()),
('s4444444-4444-4444-4444-444444444443', '44444444-4444-4444-4444-444444444444', 'Google Play Store', 'Acme Banking Android App', TRUE, 'Android mobile application', 'PRODUCTION', 'HIGH', 'MOBILE_APP', JSON_ARRAY('Kotlin', 'Room Database'), 'Android Keystore', 'CONFIDENTIAL', NULL, JSON_ARRAY('Google Services'), NOW(), NOW()),

-- Red Team Scope
('s5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', '0.0.0.0/0', 'Full infrastructure', TRUE, 'Complete Stellar infrastructure for red team exercise', 'PRODUCTION', 'CRITICAL', 'INFRASTRUCTURE', JSON_ARRAY('Various'), 'Multiple', 'RESTRICTED', NULL, JSON_ARRAY('Multiple'), NOW(), NOW());

-- Create Testing Parameters for each engagement
INSERT INTO TestingParameters (
    id, engagementId,
    automatedScanningAllowed, manualTestingAllowed,
    maxRequestsPerSecond, maxConcurrentConnections,
    loadTestingAllowed, stressTestingAllowed,
    socialEngineeringAllowed, phishingAllowed, vishingAllowed, physicalTestingAllowed,
    bruteForceAllowed, passwordSprayingAllowed, credentialStuffingAllowed, defaultCredsTestingAllowed,
    dataExfiltrationAllowed, maxDataExfilSize, screenshotAllowed,
    dosTestingAllowed, disruptiveTestingAllowed,
    customRestrictions,
    createdAt, updatedAt
)
VALUES
-- Acme Corporation Network Pentest Parameters (Conservative)
(
    UUID(), '11111111-1111-1111-1111-111111111111',
    TRUE, TRUE,
    10, 50,
    FALSE, FALSE,
    FALSE, FALSE, FALSE, FALSE,
    FALSE, TRUE, FALSE, TRUE,
    FALSE, NULL, TRUE,
    FALSE, FALSE,
    JSON_ARRAY('No testing during business hours 9AM-5PM EST', 'Coordinate with IT before any network scans'),
    NOW(), NOW()
),
-- Stellar Web App Parameters (Moderate)
(
    UUID(), '22222222-2222-2222-2222-222222222222',
    TRUE, TRUE,
    20, 100,
    TRUE, FALSE,
    TRUE, TRUE, FALSE, FALSE,
    TRUE, TRUE, TRUE, TRUE,
    TRUE, '1MB', TRUE,
    FALSE, FALSE,
    JSON_ARRAY('Phishing emails only to designated test accounts', 'No real customer data exfiltration'),
    NOW(), NOW()
),
-- Orbit Cloud Assessment Parameters (Comprehensive)
(
    UUID(), '33333333-3333-3333-3333-333333333333',
    TRUE, TRUE,
    50, 200,
    TRUE, TRUE,
    FALSE, FALSE, FALSE, FALSE,
    TRUE, TRUE, TRUE, TRUE,
    TRUE, '10MB', TRUE,
    FALSE, FALSE,
    JSON_ARRAY('AWS CloudTrail monitoring required', 'Coordinate with DevOps team for any infrastructure changes'),
    NOW(), NOW()
),
-- Mobile App Parameters (Mobile-specific)
(
    UUID(), '44444444-4444-4444-4444-444444444444',
    TRUE, TRUE,
    15, 75,
    FALSE, FALSE,
    TRUE, TRUE, TRUE, FALSE,
    TRUE, TRUE, FALSE, TRUE,
    FALSE, NULL, TRUE,
    FALSE, FALSE,
    JSON_ARRAY('Testing on dedicated devices only', 'No jailbreaking/rooting of production devices'),
    NOW(), NOW()
),
-- Red Team Parameters (Aggressive)
(
    UUID(), '55555555-5555-5555-5555-555555555555',
    TRUE, TRUE,
    100, 500,
    TRUE, TRUE,
    TRUE, TRUE, TRUE, TRUE,
    TRUE, TRUE, TRUE, TRUE,
    TRUE, '100MB', TRUE,
    FALSE, TRUE,
    JSON_ARRAY('24/7 testing allowed', 'Real-world attack simulation', 'Physical access attempts allowed'),
    NOW(), NOW()
);