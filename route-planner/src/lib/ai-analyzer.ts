import OpenAI from 'openai'

export interface JobAnalysis {
  riskLevel: 'low' | 'medium' | 'high'
  flags: string[]
  recommendations: string[]
  estimatedComplexity: number // 1-10 scale
  additionalRequirements: string[]
}

export class AIAnalyzer {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    })
  }

  async analyzeJobNotes(
    jobType: string,
    notes: string,
    postcodes: string[]
  ): Promise<JobAnalysis> {
    const prompt = `
Analyze this job for potential risks and requirements:

Job Type: ${jobType}
Number of Stops: ${postcodes.length}
Job Notes: "${notes}"

Please analyze and provide:
1. Risk level (low/medium/high)
2. Any flags or concerns
3. Recommendations for the team
4. Estimated complexity (1-10 scale)
5. Additional requirements or considerations

Common risk factors to look for:
- Tight spaces, narrow doorways
- Difficult access (stairs, no lift)
- Time constraints (early morning, overnight)
- Special equipment needed
- Fragile or hazardous materials
- Security requirements
- Weather considerations
- Parking restrictions

Respond in JSON format with the following structure:
{
  "riskLevel": "low|medium|high",
  "flags": ["flag1", "flag2"],
  "recommendations": ["rec1", "rec2"],
  "estimatedComplexity": 1-10,
  "additionalRequirements": ["req1", "req2"]
}
`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert logistics coordinator analyzing job requirements for potential risks and resource needs. Provide detailed analysis in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      // Parse the JSON response
      const analysis = JSON.parse(content) as JobAnalysis

      // Validate and set defaults
      return {
        riskLevel: analysis.riskLevel || 'low',
        flags: analysis.flags || [],
        recommendations: analysis.recommendations || [],
        estimatedComplexity: analysis.estimatedComplexity || 3,
        additionalRequirements: analysis.additionalRequirements || []
      }
    } catch (error) {
      console.error('AI Analysis failed:', error)
      
      // Return default analysis if AI fails
      return {
        riskLevel: 'medium',
        flags: ['AI analysis unavailable'],
        recommendations: ['Manual review recommended'],
        estimatedComplexity: 5,
        additionalRequirements: ['Review job notes manually']
      }
    }
  }

  async generateJobSummary(
    jobType: string,
    clientName: string,
    postcodes: string[],
    totalTime: number,
    teamSize: number
  ): Promise<string> {
    const prompt = `
Generate a professional job summary for:

Client: ${clientName}
Job Type: ${jobType}
Number of Stops: ${postcodes.length}
Estimated Time: ${Math.round(totalTime / 60)} hours
Team Size: ${teamSize}

Create a brief, professional summary suitable for scheduling and team briefing.
`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional logistics coordinator. Create concise, clear job summaries for field teams.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 200
      })

      return response.choices[0]?.message?.content || 'Summary generation failed'
    } catch (error) {
      console.error('Summary generation failed:', error)
      return `${jobType} job for ${clientName} - ${postcodes.length} stops, ${teamSize} team members, ${Math.round(totalTime / 60)} hours estimated`
    }
  }

  async categorizeUrgency(
    notes: string,
    preferredDate: string | null
  ): Promise<{ level: 'low' | 'medium' | 'high' | 'urgent'; reason: string }> {
    const prompt = `
Analyze the urgency level for this job:

Notes: "${notes}"
Preferred Date: ${preferredDate || 'Not specified'}

Determine urgency level based on:
- Time-sensitive language
- Business impact
- Client requirements
- Seasonal factors

Respond in JSON format:
{
  "level": "low|medium|high|urgent",
  "reason": "Brief explanation"
}
`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a logistics coordinator analyzing job urgency levels.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 150
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      const analysis = JSON.parse(content)
      return {
        level: analysis.level || 'medium',
        reason: analysis.reason || 'Standard priority'
      }
    } catch (error) {
      console.error('Urgency analysis failed:', error)
      return {
        level: 'medium',
        reason: 'Unable to analyze urgency'
      }
    }
  }
}

export const aiAnalyzer = new AIAnalyzer()