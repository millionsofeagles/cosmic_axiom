import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2';

export const generateContent = async ({ prompt, sectionType, reportData, engagementData, customerData, findingsData, scopeData }) => {
    try {
        // Build context from all the data
        const context = buildContext({ reportData, engagementData, customerData, findingsData, scopeData });
        
        // Create section-specific system prompt
        const systemPrompt = createSystemPrompt(sectionType, context);
        
        // Combine system prompt and user prompt for Ollama
        const fullPrompt = prompt ? 
            `${systemPrompt}\n\nUser request: ${prompt}\n\nPlease provide a professional response following the guidelines above.` : 
            systemPrompt;

        // Generate content using Ollama
        const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt: fullPrompt,
            stream: false,
            options: {
                temperature: 0.7,
                top_p: 0.9,
                num_predict: parseInt(process.env.AI_MAX_TOKENS) || 2000
            }
        });

        return {
            content: response.data.response,
            tokensUsed: response.data.eval_count || 0,
            model: OLLAMA_MODEL
        };

    } catch (error) {
        console.error('Ollama API error:', error.response?.data || error.message);
        throw new Error('Failed to generate content with Ollama');
    }
};

const buildContext = ({ reportData, engagementData, customerData, findingsData, scopeData }) => {
    const context = {
        customer: {
            name: customerData?.name || 'Unknown Client',
            industry: customerData?.industry || 'Not specified'
        },
        engagement: {
            name: engagementData?.name || 'Security Assessment',
            description: engagementData?.description || '',
            startDate: engagementData?.startDate ? new Date(engagementData.startDate).toLocaleDateString() : 'Not specified',
            endDate: engagementData?.endDate ? new Date(engagementData.endDate).toLocaleDateString() : 'Not specified',
            status: engagementData?.status || 'Unknown'
        },
        findings: {
            total: findingsData?.length || 0,
            bySeverity: {
                critical: findingsData?.filter(f => f.severity === 'CRITICAL').length || 0,
                high: findingsData?.filter(f => f.severity === 'HIGH').length || 0,
                medium: findingsData?.filter(f => f.severity === 'MEDIUM').length || 0,
                low: findingsData?.filter(f => f.severity === 'LOW').length || 0
            },
            titles: findingsData?.map(f => f.title) || []
        },
        scope: {
            total: scopeData?.length || 0,
            inScope: scopeData?.filter(s => s.inScope).length || 0,
            outOfScope: scopeData?.filter(s => !s.inScope).length || 0,
            addresses: scopeData?.map(s => s.address) || []
        }
    };

    return context;
};

const createSystemPrompt = (sectionType, context) => {
    const basePrompt = `You are an expert cybersecurity consultant writing a professional penetration testing report. 

CONTEXT:
- Client: ${context.customer.name}
- Engagement: ${context.engagement.name}
- Assessment Period: ${context.engagement.startDate} to ${context.engagement.endDate}
- Total Findings: ${context.findings.total} (Critical: ${context.findings.bySeverity.critical}, High: ${context.findings.bySeverity.high}, Medium: ${context.findings.bySeverity.medium}, Low: ${context.findings.bySeverity.low})
- Scope: ${context.scope.total} systems tested (${context.scope.inScope} in scope, ${context.scope.outOfScope} out of scope)

KEY FINDINGS:
${context.findings.titles.slice(0, 10).map(title => `- ${title}`).join('\n')}

WRITING GUIDELINES:
- Use professional, clear, and concise language
- Focus on business impact and risk
- Be specific and actionable
- Use proper penetration testing terminology
- Write in third person
- Maintain a formal but accessible tone`;

    const sectionSpecificPrompts = {
        executive: `${basePrompt}

TASK: Write ONLY the Executive Summary section of a penetration testing report.

Requirements:
- Start directly with the content (no titles or headers)
- Write 2-4 paragraphs maximum
- First paragraph: Brief overview of what was tested and when
- Second paragraph: High-level summary of key findings and overall security posture
- Third paragraph: Business impact and risk assessment
- Final paragraph: Key recommendations for executive leadership
- Use clear, non-technical language suitable for C-level executives
- Focus on business risk, not technical details

Generate the Executive Summary now:`,

        methodology: `${basePrompt}

TASK: Write ONLY the Methodology section of a penetration testing report.

Requirements:
- Start directly with the content (no titles or headers)
- Write 2-3 paragraphs maximum
- First paragraph: Overview of the testing approach and phases
- Second paragraph: Industry standards and frameworks followed (OWASP, NIST, PTES)
- Third paragraph: Scope boundaries and any limitations encountered
- Include testing phases: reconnaissance, scanning, vulnerability assessment, exploitation, post-exploitation
- Be technical but accessible to IT professionals
- Maintain professional terminology

Generate the Methodology section now:`,

        tools: `${basePrompt}

TASK: Write ONLY the Tools & Techniques section of a penetration testing report.

Requirements:
- Start directly with the content (no titles or headers)
- Format as a categorized list or 1-2 paragraphs
- Include categories: Network Scanning, Vulnerability Assessment, Web Application Testing, Exploitation, Post-Exploitation
- Mix of automated tools (Nmap, Burp Suite, Metasploit, etc.) and manual techniques
- Brief description of each tool's purpose
- Keep it concise and professional
- Focus on industry-standard tools

Generate the Tools & Techniques section now:`,

        conclusion: `${basePrompt}

TASK: Write ONLY the Conclusion section of a penetration testing report.

Requirements:
- Start directly with the content (no titles or headers)
- Write 2-3 paragraphs maximum
- First paragraph: Overall security posture assessment
- Second paragraph: Most critical findings requiring immediate attention
- Final paragraph: Positive security measures observed and next steps
- Include actionable recommendations
- Emphasize continuous security improvement
- End on a constructive note while maintaining urgency for critical issues
- Balance between highlighting risks and acknowledging good practices

Generate the Conclusion section now:`
    };

    return sectionSpecificPrompts[sectionType] || basePrompt;
};