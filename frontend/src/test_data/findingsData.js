const findingsData = [
    {
        id: 1,
        title: "SQL Injection",
        severity: "Critical",
        description: "Unsanitized input leads to execution of arbitrary SQL queries.",
        reference: "OWASP A03: Injection",
        recommendation: "Use parameterized queries or prepared statements to safely handle user input."
    },
    {
        id: 2,
        title: "Cross-Site Scripting (XSS)",
        severity: "High",
        description: "Improper escaping of user input in web pages.",
        reference: "OWASP A07: XSS",
        recommendation: "Properly encode and sanitize all user-generated content before rendering."
    },
    {
        id: 3,
        title: "Broken Authentication",
        severity: "Critical",
        description: "Compromised or poorly implemented authentication mechanisms.",
        reference: "OWASP A02: Broken Auth",
        recommendation: "Implement multi-factor authentication and securely handle credential storage."
    },
    {
        id: 4,
        title: "Sensitive Data Exposure",
        severity: "High",
        description: "Sensitive data like passwords or tokens sent in cleartext.",
        reference: "OWASP A01: Sensitive Data",
        recommendation: "Use TLS/SSL for data in transit and encrypt sensitive data at rest."
    },
    {
        id: 5,
        title: "Security Misconfiguration",
        severity: "Medium",
        description: "Improper configuration of servers, databases, or software.",
        reference: "OWASP A05: Security Misconfig",
        recommendation: "Harden configurations, disable default accounts, and conduct regular security reviews."
    },
    {
        id: 6,
        title: "Cross-Site Request Forgery (CSRF)",
        severity: "High",
        description: "Attacker tricks user into submitting a malicious request.",
        reference: "OWASP A08: CSRF",
        recommendation: "Implement anti-CSRF tokens and require reauthentication for critical actions."
    },
    {
        id: 7,
        title: "Insecure Direct Object References (IDOR)",
        severity: "High",
        description: "Accessing unauthorized resources by manipulating URLs or IDs.",
        reference: "OWASP A01: Broken Access Control",
        recommendation: "Enforce proper authorization checks at the object level server-side."
    },
    {
        id: 8,
        title: "Unvalidated Redirects and Forwards",
        severity: "Medium",
        description: "Redirecting users based on unvalidated input.",
        reference: "OWASP A10: Unvalidated Redirects",
        recommendation: "Validate and whitelist all redirect URLs to trusted destinations."
    },
    {
        id: 9,
        title: "XML External Entities (XXE)",
        severity: "High",
        description: "Injection of malicious XML data that accesses internal files.",
        reference: "OWASP A04: XML Entities",
        recommendation: "Disable external entity resolution in XML parsers."
    },
    {
        id: 10,
        title: "Directory Traversal",
        severity: "High",
        description: "Accessing unauthorized files by manipulating file paths.",
        reference: "CWE-22: Path Traversal",
        recommendation: "Validate and sanitize all file path inputs and use safe file access APIs."
    },
    {
        id: 11,
        title: "Broken Access Control",
        severity: "Critical",
        description: "Improperly enforced access permissions on sensitive resources.",
        reference: "OWASP A01: Broken Access Control",
        recommendation: "Implement strict access control checks for every request."
    },
    {
        id: 12,
        title: "Weak Password Policies",
        severity: "Medium",
        description: "Users allowed to set weak, easily guessable passwords.",
        reference: "NIST SP 800-63B",
        recommendation: "Require complex passwords and enforce periodic password changes."
    },
    {
        id: 13,
        title: "Hardcoded Credentials",
        severity: "High",
        description: "Credentials stored directly in source code.",
        reference: "CWE-798: Hardcoded Credentials",
        recommendation: "Move credentials to secure environment variables or secrets management systems."
    },
    {
        id: 14,
        title: "Insecure Deserialization",
        severity: "Critical",
        description: "Manipulation of serialized data leads to remote code execution.",
        reference: "OWASP A08: Insecure Deserialization",
        recommendation: "Avoid insecure deserialization. Implement integrity checks like digital signatures."
    },
    {
        id: 15,
        title: "Using Components with Known Vulnerabilities",
        severity: "Medium",
        description: "Libraries with known security issues are used.",
        reference: "OWASP A06: Vulnerable Components",
        recommendation: "Regularly update third-party libraries and use software composition analysis tools."
    },
    {
        id: 16,
        title: "Insufficient Logging and Monitoring",
        severity: "Medium",
        description: "Lack of detection for attacks and incidents.",
        reference: "OWASP A09: Insufficient Monitoring",
        recommendation: "Implement centralized logging, alerting, and regular review of security events."
    },
    {
        id: 17,
        title: "Open Redirects",
        severity: "Low",
        description: "Redirecting users without validation can aid phishing attacks.",
        reference: "CWE-601: Open Redirect",
        recommendation: "Validate destination URLs and avoid passing them as user-controlled parameters."
    },
    {
        id: 18,
        title: "Information Leakage",
        severity: "Low",
        description: "Exposing stack traces, server info, or environment variables.",
        reference: "CWE-200: Information Exposure",
        recommendation: "Disable detailed error messages and remove unnecessary system information from responses."
    },
    {
        id: 19,
        title: "Poor Session Management",
        severity: "High",
        description: "Sessions remain valid too long or aren't securely handled.",
        reference: "OWASP A02: Broken Auth",
        recommendation: "Implement secure cookie flags, timeouts, and reauthentication for sensitive actions."
    },
    {
        id: 20,
        title: "Denial of Service (DoS)",
        severity: "Medium",
        description: "Resource exhaustion attacks crash or slow down the service.",
        reference: "CWE-400: Uncontrolled Resource Consumption",
        recommendation: "Implement rate limiting, resource quotas, and input validation."
    }
];

export default findingsData;
