-- Structured RoE Templates with Professional Content
-- This replaces the comprehensive_roe_content.sql with templates designed for the new hybrid approach

-- Clear existing templates
DELETE FROM RoeTemplate;
DELETE FROM RoeSectionTemplate;

-- Create professional RoE templates with structured data
INSERT INTO RoeTemplate (id, name, description, isDefault, sections, createdAt, updatedAt) VALUES

-- Standard Network Penetration Test Template
(UUID(), 'Network Penetration Test', 'Comprehensive template for network infrastructure assessments', true, JSON_ARRAY(
    JSON_OBJECT(
        'type', 'AUTHORIZATION',
        'position', 0,
        'title', 'Authorization & Legal Framework',
        'content', '',
        'data', JSON_OBJECT(
            'authorizingOfficial', '',
            'authorizingTitle', '',
            'emergencyContactRequired', false
        )
    ),
    JSON_OBJECT(
        'type', 'SCOPE',
        'position', 1,
        'title', 'Scope Definition & Asset Classification',
        'content', 'This engagement focuses on network infrastructure security assessment including firewalls, routers, switches, and network services.',
        'data', JSON_OBJECT(\n            'inScopeAssets', JSON_ARRAY(),\n            'outOfScopeAssets', JSON_ARRAY(),\n            'thirdPartyApproval', false,\n            'dataExfiltrationRestricted', true,\n            'geoRestrictions', false\n        )
    ),
    JSON_OBJECT(
        'type', 'TESTING_WINDOW',
        'position', 2,
        'title', 'Testing Schedule & Business Coordination',
        'content', 'Testing will be coordinated to minimize business impact while ensuring comprehensive coverage of network infrastructure.',
        'data', JSON_OBJECT(\n            'inScopeAssets', JSON_ARRAY(),\n            'outOfScopeAssets', JSON_ARRAY(),\n            'thirdPartyApproval', false,\n            'dataExfiltrationRestricted', true,\n            'geoRestrictions', false\n        )
    ),
    JSON_OBJECT(
        'type', 'METHODOLOGY',
        'position', 3,
        'title', 'Testing Methodology',
        'content', 'Network penetration testing will follow industry-standard methodologies including NIST SP 800-115 and OWASP Testing Guide.',
        'data', JSON_OBJECT(\n            'inScopeAssets', JSON_ARRAY(),\n            'outOfScopeAssets', JSON_ARRAY(),\n            'thirdPartyApproval', false,\n            'dataExfiltrationRestricted', true,\n            'geoRestrictions', false\n        )
    ),
    JSON_OBJECT(
        'type', 'RESTRICTIONS',
        'position', 4,
        'title', 'Restrictions & Limitations',
        'content', 'Testing restrictions designed to protect production systems and maintain business continuity.',
        'data', JSON_OBJECT(\n            'inScopeAssets', JSON_ARRAY(),\n            'outOfScopeAssets', JSON_ARRAY(),\n            'thirdPartyApproval', false,\n            'dataExfiltrationRestricted', true,\n            'geoRestrictions', false\n        )
    ),
    JSON_OBJECT(
        'type', 'COMMUNICATION',
        'position', 5,
        'title', 'Communication Protocols',
        'content', 'Established communication channels for coordination, status updates, and emergency escalation.',
        'data', JSON_OBJECT(\n            'inScopeAssets', JSON_ARRAY(),\n            'outOfScopeAssets', JSON_ARRAY(),\n            'thirdPartyApproval', false,\n            'dataExfiltrationRestricted', true,\n            'geoRestrictions', false\n        )
    )
), NOW(), NOW()),

-- Web Application Security Assessment Template
(UUID(), 'Web Application Assessment', 'Template for web application security testing', false, JSON_ARRAY(
    JSON_OBJECT(
        'type', 'AUTHORIZATION',
        'position', 0,
        'title', 'Authorization & Legal Framework',
        'content', '',
        'data', JSON_OBJECT(
            'authorizingOfficial', '',
            'authorizingTitle', '',
            'emergencyContactRequired', true
        )
    ),
    JSON_OBJECT(
        'type', 'SCOPE',
        'position', 1,
        'title', 'Application Scope & Boundaries',
        'content', 'This assessment covers web application security including authentication, authorization, data validation, and session management.',
        'data', JSON_OBJECT(\n            'inScopeAssets', JSON_ARRAY(),\n            'outOfScopeAssets', JSON_ARRAY(),\n            'thirdPartyApproval', false,\n            'dataExfiltrationRestricted', true,\n            'geoRestrictions', false\n        )
    ),
    JSON_OBJECT(
        'type', 'TESTING_WINDOW',
        'position', 2,
        'title', 'Testing Schedule & Coordination',
        'content', 'Application testing requires careful coordination with development teams and may impact application performance.',
        'data', JSON_OBJECT(\n            'inScopeAssets', JSON_ARRAY(),\n            'outOfScopeAssets', JSON_ARRAY(),\n            'thirdPartyApproval', false,\n            'dataExfiltrationRestricted', true,\n            'geoRestrictions', false\n        )
    ),
    JSON_OBJECT(
        'type', 'METHODOLOGY',
        'position', 3,
        'title', 'Application Testing Methodology',
        'content', 'Web application testing follows OWASP Testing Guide v4 and includes both automated and manual testing techniques.',
        'data', JSON_OBJECT(\n            'inScopeAssets', JSON_ARRAY(),\n            'outOfScopeAssets', JSON_ARRAY(),\n            'thirdPartyApproval', false,\n            'dataExfiltrationRestricted', true,\n            'geoRestrictions', false\n        )
    ),
    JSON_OBJECT(
        'type', 'RESTRICTIONS',
        'position', 4,
        'title', 'Application Testing Constraints',
        'content', 'Specific restrictions for web application testing to prevent data corruption or service disruption.',
        'data', JSON_OBJECT(\n            'inScopeAssets', JSON_ARRAY(),\n            'outOfScopeAssets', JSON_ARRAY(),\n            'thirdPartyApproval', false,\n            'dataExfiltrationRestricted', true,\n            'geoRestrictions', false\n        )
    )
), NOW(), NOW()),

-- Cloud Security Assessment Template
(UUID(), 'Cloud Security Assessment', 'Template for cloud infrastructure and service security evaluation', false, JSON_ARRAY(
    JSON_OBJECT(
        'type', 'AUTHORIZATION',
        'position', 0,
        'title', 'Cloud Authorization Framework',
        'content', '',
        'data', JSON_OBJECT(
            'authorizingOfficial', '',
            'authorizingTitle', '',
            'emergencyContactRequired', true
        )
    ),
    JSON_OBJECT(
        'type', 'SCOPE',
        'position', 1,
        'title', 'Cloud Service Scope',
        'content', 'Assessment covers cloud infrastructure, container security, serverless functions, and cloud-native application security.',
        'data', JSON_OBJECT(\n            'inScopeAssets', JSON_ARRAY(),\n            'outOfScopeAssets', JSON_ARRAY(),\n            'thirdPartyApproval', false,\n            'dataExfiltrationRestricted', true,\n            'geoRestrictions', false\n        )
    ),
    JSON_OBJECT(
        'type', 'METHODOLOGY',
        'position', 2,
        'title', 'Cloud Security Methodology',
        'content', 'Cloud assessment follows CIS Controls, AWS/Azure/GCP security frameworks, and NIST Cloud Computing guidelines.',
        'data', JSON_OBJECT(\n            'inScopeAssets', JSON_ARRAY(),\n            'outOfScopeAssets', JSON_ARRAY(),\n            'thirdPartyApproval', false,\n            'dataExfiltrationRestricted', true,\n            'geoRestrictions', false\n        )
    ),
    JSON_OBJECT(
        'type', 'LEGAL',
        'position', 3,
        'title', 'Cloud Compliance & Legal',
        'content', 'Special consideration for multi-tenancy, data residency, and cloud provider shared responsibility models.',
        'data', JSON_OBJECT(\n            'inScopeAssets', JSON_ARRAY(),\n            'outOfScopeAssets', JSON_ARRAY(),\n            'thirdPartyApproval', false,\n            'dataExfiltrationRestricted', true,\n            'geoRestrictions', false\n        )
    )
), NOW(), NOW());

-- Update existing section templates to focus on content that still needs narrative
UPDATE RoeSectionTemplate SET 
    title = 'Authorization Details',
    content = 'Note: Authorization sections now use structured templates. Use this field only for additional organization-specific authorization requirements.'
WHERE sectionType = 'AUTHORIZATION';

-- Create or update other section templates with professional guidance
INSERT INTO RoeSectionTemplate (id, sectionType, title, content, createdAt, updatedAt) VALUES
(UUID(), 'SCOPE', 'Scope Definition Guidelines', 
'SCOPE DEFINITION BEST PRACTICES:

• Clearly define in-scope vs out-of-scope assets
• Include specific IP ranges, domains, and applications
• Identify critical systems requiring special handling
• Document any third-party systems or dependencies
• Specify geographic or jurisdictional limitations

The scope definition will be enhanced with data from your engagement configuration including asset inventory, critical systems, and compliance requirements.',
NOW(), NOW()),

(UUID(), 'METHODOLOGY', 'Testing Methodology Framework',
'INDUSTRY-STANDARD METHODOLOGIES:

This assessment follows established security testing frameworks:

• NIST SP 800-115: Technical Guide to Information Security Testing
• OWASP Testing Guide: Web application security methodology  
• PTES (Penetration Testing Execution Standard): Comprehensive testing framework
• OSSTMM (Open Source Security Testing Methodology Manual): Scientific approach

TESTING PHASES:
1. Information Gathering & Reconnaissance
2. Threat Modeling & Attack Surface Analysis
3. Vulnerability Assessment & Validation
4. Exploitation & Impact Assessment
5. Post-Exploitation & Lateral Movement
6. Risk Analysis & Remediation Planning

Testing methodology will be tailored based on engagement type and testing parameters configured in your engagement settings.',
NOW(), NOW()),

(UUID(), 'RESTRICTIONS', 'Testing Restrictions & Safeguards',
'PROFESSIONAL TESTING SAFEGUARDS:

• No destructive testing without explicit approval
• Rate limiting to prevent service degradation
• Backup verification before any system changes
• Immediate cessation upon client request
• Documentation of all testing activities

SPECIFIC RESTRICTIONS:
These restrictions will be automatically populated based on your testing parameters configuration including:
- Allowed/forbidden testing techniques
- Rate limiting specifications  
- Social engineering boundaries
- Data handling restrictions
- Service availability requirements

Additional custom restrictions can be specified in your testing parameters.',
NOW(), NOW()),

(UUID(), 'COMMUNICATION', 'Communication & Escalation Protocols',
'COMMUNICATION FRAMEWORK:

PRIMARY CONTACTS:
- Technical Lead: [Auto-filled from engagement]
- Business Contact: [Auto-filled from customer]
- Emergency Contact: [Auto-filled if required]

COMMUNICATION SCHEDULE:
- Daily status updates during active testing
- Immediate notification of critical findings
- Weekly summary reports for management
- Final debrief upon completion

ESCALATION PROCEDURES:
1. Technical Issues → Technical Lead
2. Business Impact → Business Contact  
3. Emergency Situations → Emergency Contact + Management
4. Security Incidents → All stakeholders + Legal (if required)

Contact details and escalation matrix will be populated from your engagement configuration.',
NOW(), NOW()),

(UUID(), 'EMERGENCY', 'Emergency Response Procedures',
'EMERGENCY RESPONSE PROTOCOLS:

IMMEDIATE RESPONSE TRIGGERS:
• System unavailability or performance degradation
• Unexpected security alerts or incidents
• Discovery of active threats or compromises
• Data integrity concerns
• Regulatory or compliance implications

EMERGENCY ACTIONS:
1. Immediate cessation of testing activities
2. Notification of all stakeholders within 30 minutes
3. Preservation of evidence and testing logs
4. Coordination with incident response teams
5. Documentation of emergency circumstances

EMERGENCY CONTACTS:
Emergency contact information will be automatically populated from your engagement settings and customer contact database.',
NOW(), NOW()),

(UUID(), 'LEGAL', 'Legal Framework & Compliance',
'LEGAL & COMPLIANCE CONSIDERATIONS:

REGULATORY COMPLIANCE:
Compliance frameworks will be automatically included based on your engagement configuration:
• Industry-specific regulations (HIPAA, PCI DSS, SOX, etc.)
• Geographic regulations (GDPR, CCPA, etc.)
• Sector requirements (Financial, Healthcare, Government, etc.)

LEGAL PROTECTIONS:
• Master Service Agreement and Statement of Work
• Professional liability and cyber liability insurance
• Limitation of liability and indemnification clauses
• Confidentiality and non-disclosure agreements
• Compliance with applicable laws and regulations

LIABILITY LIMITATIONS:
• Testing limited to authorized scope and methodology
• No warranty of security completeness
• Client responsibility for remediation implementation
• Standard industry limitations of liability
• Professional services insurance coverage details

Legal framework details will be enhanced with your specific compliance requirements and industry regulations.',
NOW(), NOW())

ON DUPLICATE KEY UPDATE
content = VALUES(content),
updatedAt = NOW();