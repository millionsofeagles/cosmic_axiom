INSERT INTO FindingTemplate (
    id, title, description, recommendation, impact, severity, reference, tags, createdAt, updatedAt
) VALUES
(UUID(), 'Unrestricted File Upload',
'Unrestricted file uploads allow attackers to upload arbitrary files, such as web shells, executables, or malicious scripts, to the server. Without proper validation, these files may be executed or made accessible publicly, enabling remote code execution, defacement, or further compromise of the system.',
'Implement strict server-side validation of file types based on MIME types and extensions. Store uploaded files outside the web root and use randomized file names or directories. Disallow execution permissions on uploaded files.',
'A successful exploitation can lead to full server compromise, including arbitrary code execution, persistent backdoors, defacement, or lateral movement to other systems.',
'HIGH', 'CWE-434', JSON_ARRAY('web', 'upload', 'input-validation'), NOW(), NOW()),

(UUID(), 'Insecure Direct Object Reference (IDOR)',
'IDOR flaws occur when applications expose internal implementation objects, such as files, database records, or URLs, without proper access controls. Attackers can manipulate these identifiers to gain unauthorized access to other users data.',
'Enforce object-level authorization checks on the server side. Avoid using sequential or guessable identifiers. Implement access control middleware and validate object ownership for each request.',
'Successful IDOR exploitation may result in unauthorized data disclosure or modification, breaching confidentiality and integrity of sensitive records.',
'MEDIUM', 'CWE-639', JSON_ARRAY('authorization', 'api', 'web'), NOW(), NOW()),

(UUID(), 'SQL Injection',
'SQL injection occurs when unsanitized input is concatenated into SQL queries, allowing attackers to modify queries, extract data, or escalate privileges.',
'Use parameterized queries or ORM frameworks that prevent injection. Validate all user input and apply least-privilege access to the database.',
'Attackers can exfiltrate sensitive data, tamper with records, or gain administrative access to backend systems.',
'CRITICAL', 'CWE-89', JSON_ARRAY('database', 'input-validation', 'web'), NOW(), NOW()),

(UUID(), 'Cross-Site Scripting (XSS)',
'XSS vulnerabilities allow attackers to inject and execute malicious JavaScript in users’ browsers, potentially stealing credentials or session tokens.',
'Sanitize user input and encode output. Use CSP headers and frameworks like React that auto-escape content.',
'Exploitation can lead to session hijacking, impersonation, phishing, and malware distribution.',
'HIGH', 'CWE-79', JSON_ARRAY('web', 'client', 'javascript'), NOW(), NOW()),

(UUID(), 'Weak Password Policy',
'Allowing short, simple, or common passwords makes brute-force and credential stuffing attacks more likely.',
'Enforce minimum length and complexity rules. Use breach password checks and multi-factor authentication.',
'Weak passwords reduce overall security posture and are a common attack vector for account takeover.',
'LOW', 'CWE-521', JSON_ARRAY('authentication', 'policy'), NOW(), NOW()),

(UUID(), 'Missing Rate Limiting',
'Lack of request throttling enables attackers to abuse authentication endpoints for brute-force attacks or overwhelm the server.',
'Implement IP-based or user-based rate limiting. Apply exponential backoff, CAPTCHA, or lockout mechanisms.',
'Leads to credential abuse, denial of service, or spam/fraud on exposed endpoints.',
'MEDIUM', 'CWE-770', JSON_ARRAY('api', 'rate-limit', 'authentication'), NOW(), NOW()),

(UUID(), 'Exposed Sensitive Data in URL',
'Passing sensitive tokens, passwords, or PII in URLs risks exposure via logs, caches, browser history, and referrer headers.',
'Send sensitive data in POST request bodies. Enforce HTTPS. Use short-lived tokens.',
'May result in unauthorized disclosure of credentials or sensitive records, violating privacy standards.',
'MEDIUM', 'CWE-598', JSON_ARRAY('privacy', 'api', 'url'), NOW(), NOW()),

(UUID(), 'Directory Traversal',
'Directory traversal vulnerabilities occur when user input is used to construct file paths without validation, enabling access to unauthorized files.',
'Sanitize file paths. Use allowlists for accessible paths. Avoid dynamic inclusion of file names based on user input.',
'Attackers may read sensitive files like /etc/passwd or config files, leading to information disclosure or privilege escalation.',
'HIGH', 'CWE-22', JSON_ARRAY('filesystem', 'input-validation'), NOW(), NOW()),

(UUID(), 'Hardcoded Credentials',
'Storing credentials directly in source code or config files risks exposure through reverse engineering or leaks.',
'Store credentials in secure secrets managers. Rotate secrets regularly and monitor access.',
'Hardcoded credentials can lead to unauthorized access to internal services, APIs, or databases.',
'CRITICAL', 'CWE-798', JSON_ARRAY('secrets', 'code', 'security'), NOW(), NOW()),

(UUID(), 'Improper Certificate Validation',
'Accepting any certificate or failing to validate hostname or trust chain makes SSL/TLS ineffective.',
'Use strict TLS validation libraries. Enable hostname checking. Implement certificate pinning where appropriate.',
'Allows man-in-the-middle attacks, resulting in traffic interception, data theft, or impersonation.',
'HIGH', 'CWE-295', JSON_ARRAY('ssl', 'encryption', 'client'), NOW(), NOW());
