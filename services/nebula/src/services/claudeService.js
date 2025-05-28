import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
    apiKey: process.env.AI_API_KEY,
});

export const generateContent = async ({ prompt, sectionType, reportData, engagementData, customerData, findingsData, scopeData }) => {
    try {
        // Build context from all the data
        const context = buildContext({ reportData, engagementData, customerData, findingsData, scopeData });
        
        // Create section-specific system prompt
        const systemPrompt = createSystemPrompt(sectionType, context);
        
        // Generate content using Claude
        const response = await anthropic.messages.create({
            model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
            max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 2000,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });

        return {
            content: response.content[0].text,
            tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
            model: response.model
        };

    } catch (error) {
        console.error('Claude API error:', error);
        throw new Error('Failed to generate content with Claude');
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

You are writing the EXECUTIVE SUMMARY section. This should:
- Provide a high-level overview of the assessment
- Summarize key findings and overall security posture
- Focus on business risk and impact
- Be understandable by non-technical executives
- Include overall recommendations
- Be 2-4 paragraphs maximum
- Start with a brief description of what was tested`,

        methodology: `${basePrompt}

You are writing the METHODOLOGY section. This should:
- Describe the approach taken during the assessment
- Explain the testing phases (reconnaissance, scanning, exploitation, post-exploitation)
- Mention industry standards followed (OWASP, NIST, PTES)
- Describe the scope and limitations
- Be technical but clear
- Be 2-3 paragraphs maximum`,

        tools: `${basePrompt}

You are writing the TOOLS & TECHNIQUES section. This should:
- List the primary tools and techniques used
- Group by category (network scanning, vulnerability assessment, exploitation, etc.)
- Mention both automated tools and manual testing approaches
- Be concise and organized
- Focus on the most important tools used
- Be 1-2 paragraphs or a brief bulleted list`,

        conclusion: `${basePrompt}

You are writing the CONCLUSION section. This should:
- Summarize the overall security posture
- Highlight the most critical issues that need immediate attention
- Provide high-level recommendations
- Mention positive security measures observed
- End with next steps or recommendations for ongoing security
- Be 2-3 paragraphs maximum
- Focus on actionable outcomes`
    };

    return sectionSpecificPrompts[sectionType] || basePrompt;
};