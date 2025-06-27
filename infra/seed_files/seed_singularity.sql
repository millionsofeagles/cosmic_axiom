-- Set report UUID to use across inserts
SET @knownReportId := UUID();

-- Create Report
INSERT INTO Report (
    id, engagementId, title, createdAt, updatedAt,
    executiveSummary, methodology, toolsAndTechniques, conclusion
)
VALUES (
    @knownReportId,
    '11111111-1111-1111-1111-111111111111',
    'Q2 Penetration Test Report',
    NOW(), NOW(),
    'This report provides a comprehensive assessment of the security posture of the target environment, identifying critical risks and areas of exposure. Our objective was to simulate real-world attack scenarios to evaluate how well the organization could detect, respond to, and remediate threats. The findings herein are prioritized by severity and potential business impact, with actionable recommendations to enhance security resilience.',
    'The assessment was conducted using a hybrid approach combining automated scanning tools with manual techniques to maximize coverage and depth. Our methodology aligns with industry frameworks such as OWASP Testing Guide and NIST SP 800-115. We performed reconnaissance, vulnerability discovery, exploitation, privilege escalation, and lateral movement where applicable. All testing activities were conducted within the authorized scope and timeframe defined in the Rules of Engagement.',
    'The tools used during this assessment included Nmap, Burp Suite, Metasploit, and custom scripts for exploitation and validation. These tools were selected based on the testing scope, target technology stack, and engagement timeline. Each tool was carefully configured to minimize disruption while maximizing visibility into vulnerabilities and misconfigurations.',
    'The engagement revealed several critical and high-risk findings that require immediate attention. While certain defenses were effective, others exhibited gaps in detection and prevention. Addressing the highlighted vulnerabilities and implementing the provided recommendations will significantly improve the organization''s security posture. Continued monitoring, regular testing, and user awareness training are encouraged to maintain a mature and resilient cybersecurity program.'
);

-- Insert finding into ReportFinding
SET @findingId := UUID();
INSERT INTO ReportFinding (
    id, reportId, title, description, recommendation, impact, severity, reference, tags, affectedSystems, createdAt, updatedAt
)
VALUES (
    @findingId,
    @knownReportId,
    'SQL Injection in Login Form',
    'The login form on /login does not sanitize input before constructing SQL queries, allowing attackers to bypass authentication or extract sensitive data from the database.',
    'Use parameterized queries (e.g., prepared statements) to prevent injection. Validate and sanitize all user input at both client and server side.',
    'Successful exploitation may allow an attacker to access, modify, or delete data from the backend database without authentication, posing a critical threat to confidentiality and integrity.',
    'HIGH',
    'OWASP Top 10: Injection (A03:2021)',
    JSON_ARRAY('sql-injection', 'owasp', 'authentication-bypass'),
    JSON_ARRAY('Login Portal', 'Authentication Service'),
    NOW(), NOW()
);

-- Link finding to section
INSERT INTO Section (
    id, reportId, type, position, reportFindingId, createdAt, updatedAt
)
VALUES (
    UUID(), @knownReportId, 'FINDING', 1, @findingId, NOW(), NOW()
);

-- Add a connectivity section (no finding link)
INSERT INTO Section (
    id, reportId, type, position, createdAt, updatedAt
)
VALUES (
    UUID(), @knownReportId, 'CONNECTIVITY', 2, NOW(), NOW()
);

-- Seed default report template
INSERT INTO DefaultReportTemplate (
    id, executiveSummary, methodology, toolsAndTechniques, conclusion
) VALUES (
    'singleton',
    'This report provides a comprehensive assessment of the security posture of the target environment, identifying critical risks and areas of exposure. Our objective was to simulate real-world attack scenarios to evaluate how well the organization could detect, respond to, and remediate threats. The findings herein are prioritized by severity and potential business impact, with actionable recommendations to enhance security resilience.',
    'The assessment was conducted using a hybrid approach combining automated scanning tools with manual techniques to maximize coverage and depth. Our methodology aligns with industry frameworks such as OWASP Testing Guide and NIST SP 800-115. We performed reconnaissance, vulnerability discovery, exploitation, privilege escalation, and lateral movement where applicable. All testing activities were conducted within the authorized scope and timeframe defined in the Rules of Engagement.',
    'The tools used during this assessment included Nmap, Burp Suite, Metasploit, and custom scripts for exploitation and validation. These tools were selected based on the testing scope, target technology stack, and engagement timeline. Each tool was carefully configured to minimize disruption while maximizing visibility into vulnerabilities and misconfigurations.',
    'The engagement revealed several critical and high-risk findings that require immediate attention. While certain defenses were effective, others exhibited gaps in detection and prevention. Addressing the highlighted vulnerabilities and implementing the provided recommendations will significantly improve the organization''s security posture. Continued monitoring, regular testing, and user awareness training are encouraged to maintain a mature and resilient cybersecurity program.'
);

-- Seed RoE section templates with professional default content
INSERT INTO RoeSectionTemplate (id, sectionType, title, content, createdAt, updatedAt) VALUES
(UUID(), 'AUTHORIZATION', 'Authorization & Approval', 
'This penetration testing engagement has been authorized by [CLIENT ORGANIZATION] and is conducted under the explicit authorization of:

Authorizing Official: [NAME]
Title/Position: [TITLE]
Date of Authorization: [DATE]
Authorization Reference: [REF NUMBER]

This engagement is approved for the testing period specified below and covers only the systems and applications explicitly listed in the scope section. All testing activities will be conducted in accordance with applicable laws, regulations, and organizational policies.

The testing team is authorized to:
- Perform vulnerability assessments and penetration testing
- Attempt to exploit identified vulnerabilities within defined constraints
- Access systems and data only as necessary for security testing purposes
- Document findings and provide remediation recommendations

Any activities outside the scope of this authorization require explicit written approval from the authorizing official.', NOW(), NOW()),

(UUID(), 'SCOPE', 'Scope Definition', 
'The following defines the approved scope for this penetration testing engagement:

IN-SCOPE SYSTEMS:
- [System/Application 1] - [IP Range/URLs]
- [System/Application 2] - [IP Range/URLs]
- [System/Application 3] - [IP Range/URLs]

IN-SCOPE ACTIVITIES:
- Network vulnerability scanning
- Web application security testing
- Social engineering testing (if applicable)
- Wireless network testing (if applicable)
- Physical security testing (if applicable)

OUT-OF-SCOPE SYSTEMS:
- Production databases containing live customer data
- Critical infrastructure systems
- Third-party hosted services
- [Any other excluded systems]

OUT-OF-SCOPE ACTIVITIES:
- Denial of Service (DoS) attacks
- Data destruction or modification
- Access to personal information beyond what is necessary for testing
- Testing during business-critical periods

Any questions regarding scope should be directed to the primary point of contact before proceeding.', NOW(), NOW()),

(UUID(), 'TESTING_WINDOW', 'Testing Window & Schedule', 
'AUTHORIZED TESTING PERIOD:
Start Date: [START DATE]
End Date: [END DATE]
Testing Hours: [TIME RANGE, e.g., 9:00 AM - 6:00 PM EST]

BLACKOUT PERIODS:
The following periods are excluded from testing activities:
- [Date/Time] - [Reason, e.g., system maintenance]
- [Date/Time] - [Reason, e.g., business critical period]
- Weekends (unless specifically authorized)
- Federal holidays

TESTING PHASES:
Phase 1 (Days 1-3): Reconnaissance and vulnerability discovery
Phase 2 (Days 4-7): Exploitation and privilege escalation attempts
Phase 3 (Days 8-10): Documentation and report preparation

NOTIFICATION REQUIREMENTS:
- 24-hour advance notice for any high-impact testing
- Immediate notification of critical findings
- Daily status updates to be provided to [CONTACT]

All testing activities must cease immediately at the end of the authorized period unless explicitly extended in writing.', NOW(), NOW()),

(UUID(), 'METHODOLOGY', 'Testing Methodology', 
'This penetration test will follow industry-standard methodologies and frameworks:

TESTING APPROACH:
The assessment will employ a "black box" testing approach, simulating an external attacker with no prior knowledge of internal systems. Testing will progress through the following phases:

1. RECONNAISSANCE
   - Open Source Intelligence (OSINT) gathering
   - Network discovery and enumeration
   - Service identification and banner grabbing

2. VULNERABILITY ASSESSMENT
   - Automated vulnerability scanning
   - Manual verification of critical findings
   - Custom testing for application-specific issues

3. EXPLOITATION
   - Controlled exploitation attempts
   - Privilege escalation testing
   - Lateral movement assessment

4. POST-EXPLOITATION
   - Data access verification
   - Persistence mechanism testing
   - Impact assessment

STANDARDS & FRAMEWORKS:
- OWASP Testing Guide v4.0
- NIST SP 800-115 Technical Guide to Information Security Testing
- PTES (Penetration Testing Execution Standard)
- OWASP Top 10 Web Application Security Risks

All testing will be conducted with appropriate care to minimize business disruption while providing comprehensive security coverage.', NOW(), NOW()),

(UUID(), 'RESTRICTIONS', 'Restrictions & Limitations', 
'The following restrictions apply to all testing activities:

TECHNICAL RESTRICTIONS:
- No Denial of Service (DoS) or Distributed Denial of Service (DDoS) attacks
- No data destruction, modification, or corruption
- No access to or testing of systems containing live customer data
- No testing of backup or disaster recovery systems
- Maximum of [X] concurrent connections per target system
- No password brute-forcing beyond [X] attempts per account

OPERATIONAL RESTRICTIONS:
- Testing limited to approved hours and dates
- No testing during system maintenance windows
- Immediate cessation of testing upon request from client
- No social engineering targeting executive leadership
- No physical access attempts without explicit authorization

DATA HANDLING RESTRICTIONS:
- Screenshots and evidence collection limited to demonstration purposes
- No extraction or retention of sensitive data
- All test artifacts to be securely destroyed post-engagement
- No sharing of findings with unauthorized parties

LEGAL & COMPLIANCE RESTRICTIONS:
- All activities must comply with applicable laws and regulations
- No testing of third-party systems without written consent
- Adherence to client confidentiality and non-disclosure agreements
- Respect for intellectual property and trade secrets

Violation of any restriction may result in immediate termination of the engagement.', NOW(), NOW()),

(UUID(), 'COMMUNICATION', 'Communication Protocols', 
'EMERGENCY CONTACTS:
Primary Contact: [NAME] - [PHONE] - [EMAIL]
Secondary Contact: [NAME] - [PHONE] - [EMAIL]
Security Operations Center: [PHONE] - [EMAIL]

COMMUNICATION SCHEDULE:
- Daily status calls at [TIME]
- Weekly progress reports via email
- Immediate notification for critical findings
- End-of-day summary reports

REPORTING STRUCTURE:
Critical Findings (CVSS 9.0+): Immediate phone call + email
High Findings (CVSS 7.0-8.9): Within 4 hours via email
Medium/Low Findings: Documented in weekly reports

COMMUNICATION CHANNELS:
Primary: Email to [EMAIL ADDRESS]
Secondary: Phone to [PHONE NUMBER]
Secure: Encrypted email or secure file transfer portal
Emergency: Direct phone contact to [EMERGENCY CONTACT]

ESCALATION PROCEDURES:
Level 1: Testing team → Project manager
Level 2: Project manager → Client CISO/IT Director
Level 3: Client CISO → Executive leadership

All communications regarding testing activities, findings, or concerns should follow the established chain of communication to ensure proper handling and response.', NOW(), NOW()),

(UUID(), 'EMERGENCY', 'Emergency Procedures', 
'IMMEDIATE RESPONSE PROCEDURES:
In the event of a critical system failure, security incident, or unintended impact during testing:

1. IMMEDIATE ACTIONS:
   - STOP all testing activities immediately
   - Document the current activity being performed
   - Preserve system state if possible
   - Contact emergency contacts immediately

2. NOTIFICATION CHAIN:
   Primary Emergency Contact: [NAME] - [PHONE]
   Client Security Operations: [PHONE]
   Testing Team Lead: [NAME] - [PHONE]
   
3. CRITICAL FINDINGS RESPONSE:
   For CVSS 9.0+ findings or active exploitation:
   - Immediate verbal notification (within 15 minutes)
   - Written confirmation within 1 hour
   - Detailed documentation within 24 hours

4. SYSTEM IMPACT PROCEDURES:
   If testing causes system instability:
   - Immediate cessation of all testing
   - Notification to system administrators
   - Assistance with recovery if requested
   - Incident documentation and lessons learned

5. DATA BREACH PROCEDURES:
   If unauthorized data access occurs:
   - Immediate documentation of data accessed
   - Notification to data protection officer
   - Secure handling per client data policies
   - Legal and compliance team notification

AFTER-HOURS EMERGENCY:
24/7 Emergency Line: [PHONE]
Emergency Email: [EMAIL]

All emergency procedures should be tested and verified before testing commencement.', NOW(), NOW()),

(UUID(), 'LEGAL', 'Legal & Compliance Considerations', 
'LEGAL FRAMEWORK:
This penetration testing engagement is conducted under the following legal protections and constraints:

AUTHORIZATION DOCUMENTATION:
- Signed Statement of Work (SOW)
- Executed Non-Disclosure Agreement (NDA)
- Rules of Engagement (this document)
- Liability and insurance documentation

COMPLIANCE REQUIREMENTS:
- GDPR compliance for data protection
- SOX compliance for financial data systems
- HIPAA compliance for healthcare information (if applicable)
- PCI DSS requirements for payment card data
- Industry-specific regulatory requirements

LIABILITY LIMITATIONS:
- Testing activities covered under professional liability insurance
- Client acknowledgment of inherent testing risks
- Limitation of liability to direct damages only
- Mutual indemnification provisions

INTELLECTUAL PROPERTY:
- Client retains ownership of all proprietary information
- Testing methodologies remain property of testing organization
- No reverse engineering of proprietary systems
- Respect for software licensing and usage rights

DATA PROTECTION:
- All data handled in accordance with applicable privacy laws
- Minimal data collection principle
- Secure storage and transmission requirements
- Data retention and destruction policies

REGULATORY CONSIDERATIONS:
- Compliance with local cybersecurity laws
- Adherence to export control regulations
- Professional licensing and certification requirements
- Industry-specific testing standards

Any legal questions or concerns should be directed to the appropriate legal counsel before proceeding with testing activities.', NOW(), NOW()),

(UUID(), 'CUSTOM', 'Custom Section', 
'This is a custom section that can be tailored to specific engagement requirements.

You may use this section to document:
- Special client requirements
- Unique technical considerations  
- Additional stakeholder information
- Project-specific procedures
- Custom testing methodologies
- Industry-specific compliance requirements
- Special handling instructions

Please modify the title and content of this section to meet your specific needs.', NOW(), NOW());

-- Create sample RoE documents that showcase the enriched engagement data
INSERT INTO RulesOfEngagement (
    id, engagementId, title, version, status, classification,
    authorizedBy, authorizedTitle, authorizedDate,
    testingWindow, emergencyContact,
    createdAt, updatedAt
)
VALUES
-- Acme Corporation Network Pentest RoE
(
    'roe11111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Rules of Engagement - Acme Corporation Network Security Assessment',
    '1.0',
    'APPROVED',
    'CONFIDENTIAL',
    'Alice Johnson',
    'IT Security Manager',
    '2025-04-15',
    JSON_OBJECT(
        'start', '2025-05-01 09:00:00',
        'end', '2025-05-31 17:00:00',
        'blackoutPeriods', JSON_ARRAY(
            'Memorial Day Weekend (May 24-26, 2025)',
            'System Maintenance Window (May 15, 2025 02:00-06:00)',
            'Board Meeting Day (May 20, 2025)'
        )
    ),
    JSON_OBJECT(
        'name', 'Alice Johnson',
        'phone', '555-1234',
        'email', 'alice@acme.com',
        'availability', '24/7 during testing period'
    ),
    NOW(),
    NOW()
),
-- Stellar Web App RoE
(
    'roe22222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Rules of Engagement - Stellar Cybersecurity Web Application Security Review',
    '1.2',
    'ACTIVE',
    'CONFIDENTIAL',
    'Clara Nguyen',
    'Chief Security Officer',
    '2025-05-10',
    JSON_OBJECT(
        'start', '2025-05-15 08:00:00',
        'end', '2025-05-25 18:00:00',
        'blackoutPeriods', JSON_ARRAY(
            'Customer Portal Maintenance (May 18, 2025 01:00-05:00)'
        )
    ),
    JSON_OBJECT(
        'name', 'Clara Nguyen',
        'phone', '555-8765',
        'email', 'clara@stellar.com',
        'availability', 'Business hours PST, emergency 24/7'
    ),
    NOW(),
    NOW()
),
-- Orbit Cloud Assessment RoE
(
    'roe33333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'Rules of Engagement - Orbit Industries Cloud Infrastructure Assessment',
    '1.0',
    'DRAFT',
    'RESTRICTED',
    'David Lee',
    'Chief Technology Officer',
    NULL,
    JSON_OBJECT(
        'start', '2025-06-01 10:00:00',
        'end', '2025-06-15 16:00:00',
        'blackoutPeriods', JSON_ARRAY(
            'Production Deployment Window (June 5, 2025 12:00-14:00)',
            'AWS Scheduled Maintenance (June 10, 2025 03:00-07:00)'
        )
    ),
    JSON_OBJECT(
        'name', 'David Lee',
        'phone', '555-3456',
        'email', 'david@orbit.com',
        'availability', 'Business hours UTC, critical issues 24/7'
    ),
    NOW(),
    NOW()
);

-- Create RoE sections for the Acme engagement showcasing different section types
INSERT INTO RoeSection (
    id, roeId, type, position, title, content, data,
    createdAt, updatedAt
)
VALUES
-- Authorization section
(
    UUID(),
    'roe11111-1111-1111-1111-111111111111',
    'AUTHORIZATION',
    1,
    'Authorization & Approval',
    'This Network Penetration Testing engagement has been authorized by Acme Corporation and is conducted under the explicit authorization of Alice Johnson, IT Security Manager. This engagement is specifically designed for PCI DSS and SOC2 Type 2 compliance validation, focusing on the organization''s payment processing infrastructure and critical business systems.',
    JSON_OBJECT(
        'complianceFrameworks', JSON_ARRAY('PCI_DSS', 'SOC2_TYPE2'),
        'riskLevel', 'MEDIUM',
        'businessContext', 'Payment processing and customer data protection'
    ),
    NOW(),
    NOW()
),
-- Enhanced scope section with enriched data
(
    UUID(),
    'roe11111-1111-1111-1111-111111111111',
    'SCOPE',
    2,
    'Scope Definition & Asset Classification',
    'The following scope has been defined based on the network penetration testing engagement type, with assets categorized by criticality and environment. This assessment covers production infrastructure only, with development systems explicitly excluded.',
    JSON_OBJECT(
        'inScopeAssets', JSON_ARRAY(
            '192.168.1.0/24 (Corporate Network - HIGH criticality)',
            '10.0.0.0/16 (Data Center - CRITICAL criticality)',
            'acme.com (Web Applications - MEDIUM criticality)'
        ),
        'outOfScopeAssets', JSON_ARRAY(
            '172.16.0.0/12 (Development Network)',
            'Disaster Recovery Site',
            'Third-party SaaS applications'
        ),
        'criticalSystems', JSON_ARRAY(
            'Primary Domain Controller',
            'Payment Processing Server',
            'Customer Database'
        ),
        'complianceZones', JSON_ARRAY(
            'PCI DSS Cardholder Data Environment',
            'SOC2 Critical Business Systems'
        )
    ),
    NOW(),
    NOW()
),
-- Testing window with business context
(
    UUID(),
    'roe11111-1111-1111-1111-111111111111',
    'TESTING_WINDOW',
    3,
    'Testing Schedule & Business Considerations',
    'Testing is scheduled for 160 hours over a 4-week period with a maximum of 3 concurrent testers. Business critical hours (9:00 AM - 5:00 PM EST) require coordination with IT staff, and certain high-impact testing will be restricted during peak business operations.',
    JSON_OBJECT(
        'totalBudgetHours', 160,
        'maxConcurrentTesters', 3,
        'businessCriticalHours', JSON_OBJECT(
            'start', '09:00',
            'end', '17:00',
            'timezone', 'EST'
        ),
        'testingPhases', JSON_ARRAY(
            'Week 1-2: External reconnaissance and vulnerability discovery',
            'Week 3: Internal network testing and privilege escalation',
            'Week 4: Lateral movement testing and documentation'
        )
    ),
    NOW(),
    NOW()
),
-- Methodology section with testing parameters
(
    UUID(),
    'roe11111-1111-1111-1111-111111111111',
    'METHODOLOGY',
    4,
    'Approved Testing Methodology & Parameters',
    'This black-box network penetration test will follow NIST SP 800-115 guidelines with automated scanning and manual testing techniques. Testing parameters have been configured for conservative operation to minimize business impact.',
    JSON_OBJECT(
        'testingApproach', 'BLACK_BOX',
        'allowedMethods', JSON_ARRAY(
            'Automated vulnerability scanning (max 10 req/sec)',
            'Manual penetration testing',
            'Password spraying (limited attempts)',
            'Default credential testing'
        ),
        'restrictions', JSON_ARRAY(
            'No brute force attacks',
            'No DoS testing',
            'No data exfiltration',
            'No disruptive testing'
        ),
        'frameworks', JSON_ARRAY(
            'NIST SP 800-115',
            'OWASP Testing Guide',
            'PCI DSS Testing Procedures'
        )
    ),
    NOW(),
    NOW()
),
-- Restrictions based on testing parameters
(
    UUID(),
    'roe11111-1111-1111-1111-111111111111',
    'RESTRICTIONS',
    5,
    'Testing Restrictions & Limitations',
    'Strict limitations are in place to protect business operations and comply with PCI DSS requirements. All testing must coordinate with IT staff during business hours (9AM-5PM EST) and avoid any activities that could impact payment processing systems.',
    JSON_OBJECT(
        'technicalRestrictions', JSON_ARRAY(
            'Maximum 10 requests per second',
            'Maximum 50 concurrent connections',
            'No load or stress testing',
            'No social engineering activities'
        ),
        'operationalRestrictions', JSON_ARRAY(
            'No testing during business hours without IT coordination',
            'Immediate notification required for any payment system access',
            'No modification of production data',
            'Screenshots only for proof-of-concept documentation'
        ),
        'complianceRestrictions', JSON_ARRAY(
            'PCI DSS data handling requirements',
            'SOC2 audit trail maintenance',
            'No access to live cardholder data'
        )
    ),
    NOW(),
    NOW()
),
-- Communication protocols
(
    UUID(),
    'roe11111-1111-1111-1111-111111111111',
    'COMMUNICATION',
    6,
    'Communication Protocols & Escalation',
    'Communication procedures are established to ensure proper coordination with Acme Corporation stakeholders and immediate escalation of critical findings that could impact payment processing or customer data security.',
    JSON_OBJECT(
        'contacts', JSON_ARRAY(
            JSON_OBJECT(
                'role', 'Primary Technical Contact',
                'name', 'Alice Johnson',
                'phone', '555-1234',
                'email', 'alice@acme.com',
                'availability', '24/7 during testing period'
            ),
            JSON_OBJECT(
                'role', 'Secondary Contact',
                'name', 'Bob Smith',
                'phone', '555-5678',
                'email', 'bob@acme.com',
                'availability', 'Business hours EST'
            )
        ),
        'escalationMatrix', JSON_ARRAY(
            'Level 1: Testing team → Alice Johnson (IT Security)',
            'Level 2: Alice Johnson → CTO',
            'Level 3: CTO → Executive team'
        ),
        'reportingSchedule', JSON_ARRAY(
            'Daily status calls at 5:00 PM EST',
            'Weekly executive summary reports',
            'Immediate notification for CRITICAL findings',
            '4-hour notification for HIGH findings'
        )
    ),
    NOW(),
    NOW()
);

-- Create sample RoE template for different engagement types
INSERT INTO RoeTemplate (
    id, name, description, isDefault,
    sections,
    createdAt, updatedAt
)
VALUES
(
    UUID(),
    'Network Penetration Test Template',
    'Standard template for network-based penetration testing engagements',
    TRUE,
    JSON_ARRAY(
        JSON_OBJECT(
            'type', 'AUTHORIZATION',
            'title', 'Network Testing Authorization',
            'content', 'This network penetration testing engagement has been authorized for the purpose of evaluating network security controls and identifying potential vulnerabilities in the organization''s network infrastructure.'
        ),
        JSON_OBJECT(
            'type', 'SCOPE',
            'title', 'Network Scope Definition',
            'content', 'The scope includes all network segments, devices, and services within the defined IP ranges. Critical infrastructure and business systems have been identified and will receive special attention during testing.'
        ),
        JSON_OBJECT(
            'type', 'METHODOLOGY',
            'title', 'Network Testing Methodology',
            'content', 'Testing will follow a structured approach including network discovery, vulnerability assessment, exploitation attempts, and post-exploitation activities where appropriate.'
        ),
        JSON_OBJECT(
            'type', 'RESTRICTIONS',
            'title', 'Network Testing Restrictions',
            'content', 'Specific restrictions apply to network testing including rate limiting, DoS prevention, and coordination requirements during business hours.'
        )
    ),
    NOW(),
    NOW()
),
(
    UUID(),
    'Web Application Security Template',
    'Template optimized for web application penetration testing',
    FALSE,
    JSON_ARRAY(
        JSON_OBJECT(
            'type', 'AUTHORIZATION',
            'title', 'Web Application Testing Authorization',
            'content', 'Authorization for comprehensive web application security testing including OWASP Top 10 validation and application-specific vulnerability assessment.'
        ),
        JSON_OBJECT(
            'type', 'SCOPE',
            'title', 'Web Application Scope',
            'content', 'Testing scope includes all web applications, APIs, and supporting infrastructure within the defined URLs and domains.'
        ),
        JSON_OBJECT(
            'type', 'METHODOLOGY',
            'title', 'Web Application Testing Approach',
            'content', 'Structured web application testing including automated scanning, manual verification, authentication testing, and business logic validation.'
        )
    ),
    NOW(),
    NOW()
),
(
    UUID(),
    'Cloud Security Assessment Template',
    'Template for cloud infrastructure security assessments',
    FALSE,
    JSON_ARRAY(
        JSON_OBJECT(
            'type', 'AUTHORIZATION',
            'title', 'Cloud Security Testing Authorization',
            'content', 'Authorization for cloud infrastructure security assessment including IAM review, container security, and data protection analysis.'
        ),
        JSON_OBJECT(
            'type', 'SCOPE',
            'title', 'Cloud Infrastructure Scope',
            'content', 'Assessment covers cloud services, configurations, and security controls within the specified cloud accounts and regions.'
        ),
        JSON_OBJECT(
            'type', 'METHODOLOGY',
            'title', 'Cloud Security Methodology',
            'content', 'Cloud-specific testing approach including configuration review, IAM analysis, network security validation, and compliance verification.'
        ),
        JSON_OBJECT(
            'type', 'RESTRICTIONS',
            'title', 'Cloud Testing Restrictions',
            'content', 'Special considerations for cloud testing including service disruption prevention, cost management, and compliance requirements.'
        )
    ),
    NOW(),
    NOW()
);
