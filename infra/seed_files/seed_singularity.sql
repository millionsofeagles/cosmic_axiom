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
