-- Create a Report for testing
SET @knownReportId := UUID();
INSERT INTO Report (id, engagementId, title, createdAt, updatedAt, executiveSummary, methodology, toolsAndTechniques, conclusion)
VALUES
(@knownReportId,
'11111111-1111-1111-1111-111111111111',
'Q2 Penetration Test Report',
NOW(),
NOW(),
'This report provides a comprehensive assessment of the security posture of the target environment, identifying critical risks and areas of exposure. Our objective was to simulate real-world attack scenarios to evaluate how well the organization could detect, respond to, and remediate threats. The findings herein are prioritized by severity and potential business impact, with actionable recommendations to enhance security resilience.',
'The assessment was conducted using a hybrid approach combining automated scanning tools with manual techniques to maximize coverage and depth. Our methodology aligns with industry frameworks such as OWASP Testing Guide and NIST SP 800-115. We performed reconnaissance, vulnerability discovery, exploitation, privilege escalation, and lateral movement where applicable. All testing activities were conducted within the authorized scope and timeframe defined in the Rules of Engagement.',
'The tools used during this assessment included Nmap, Burp Suite, Metasploit, and custom scripts for exploitation and validation. These tools were selected based on the testing scope, target technology stack, and engagement timeline. Each tool was carefully configured to minimize disruption while maximizing visibility into vulnerabilities and misconfigurations.',
'The engagement revealed several critical and high-risk findings that require immediate attention. While certain defenses were effective, others exhibited gaps in detection and prevention. Addressing the highlighted vulnerabilities and implementing the provided recommendations will significantly improve the organization''s security posture. Continued monitoring, regular testing, and user awareness training are encouraged to maintain a mature and resilient cybersecurity program.'
);

INSERT INTO Section (id, reportId, type, data, position, createdAt, updatedAt)
VALUES 
(UUID(), @knownReportId,'finding', JSON_OBJECT('id', UUID(), 'title', 'SQL Injection in Login Form', 'description', 'The login form on /login does not sanitize input before constructing SQL queries, allowing attackers to bypass authentication or extract sensitive data from the database.', 'recommendation', 'Use parameterized queries (e.g., prepared statements) to prevent injection. Validate and sanitize all user input at both client and server side.', 'severity', 'High', 'reference', 'OWASP Top 10: Injection (A03:2021)', 'tags', JSON_ARRAY('sql-injection', 'owasp', 'authentication-bypass'), 'createdAt', NOW(), 'updatedAt', NOW()), 1, NOW(), NOW()),
(UUID(), @knownReportId, 'connectivity', JSON_OBJECT('results', 'All scoped assets were reachable.'), 2, NOW(), NOW());

INSERT INTO DefaultReportTemplate (id, executiveSummary, methodology, toolsAndTechniques, conclusion)
VALUES (
  'singleton',
  -- Executive Summary
  'This report provides a comprehensive assessment of the security posture of the target environment, identifying critical risks and areas of exposure. Our objective was to simulate real-world attack scenarios to evaluate how well the organization could detect, respond to, and remediate threats. The findings herein are prioritized by severity and potential business impact, with actionable recommendations to enhance security resilience.',
  
  -- Methodology
  'The assessment was conducted using a hybrid approach combining automated scanning tools with manual techniques to maximize coverage and depth. Our methodology aligns with industry frameworks such as OWASP Testing Guide and NIST SP 800-115. We performed reconnaissance, vulnerability discovery, exploitation, privilege escalation, and lateral movement where applicable. All testing activities were conducted within the authorized scope and timeframe defined in the Rules of Engagement.',

  -- Tools and Techniques
  'The tools used during this assessment included Nmap, Burp Suite, Metasploit, and custom scripts for exploitation and validation. These tools were selected based on the testing scope, target technology stack, and engagement timeline. Each tool was carefully configured to minimize disruption while maximizing visibility into vulnerabilities and misconfigurations.',
  
  -- Conclusion
  'The engagement revealed several critical and high-risk findings that require immediate attention. While certain defenses were effective, others exhibited gaps in detection and prevention. Addressing the highlighted vulnerabilities and implementing the provided recommendations will significantly improve the organization''s security posture. Continued monitoring, regular testing, and user awareness training are encouraged to maintain a mature and resilient cybersecurity program.'
);
