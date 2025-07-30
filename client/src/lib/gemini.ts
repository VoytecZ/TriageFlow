// Gemini API integration for AI-powered triage questioning and SOAP note generation

export interface ConversationEntry {
  question: string;
  answer: string;
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface QuestioningDecision {
  needsMoreInfo: boolean;
  reasoning: string;
  suggestedFocus?: string;
}

class GeminiService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    // API key from environment variables (backend will proxy the request)
    this.apiKey = "";
    this.apiUrl = "/api/gemini";
  }

  private async makeAPICall(prompt: string): Promise<string> {
    const payload = {
      prompt: prompt
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error("Failed to communicate with AI service");
    }
  }

  async shouldContinueQuestioning(complaint: string, conversationHistory: ConversationEntry[]): Promise<QuestioningDecision> {
    // Create context from conversation history
    const historyContext = conversationHistory.map((entry, index) => 
      `${index === 0 ? 'Primary complaint' : `Question ${index}`}: ${entry.question}\nPatient response: ${entry.answer}`
    ).join('\n\n');

    const prompt = `You are a medical AI assistant conducting a patient triage interview. Based on the information gathered so far, determine if you have sufficient clinical information to write a comprehensive SOAP note, or if more questions are needed.

Primary complaint: ${complaint}

Conversation so far:
${historyContext}

Consider these clinical areas:
- Onset, duration, severity, quality of symptoms
- Associated symptoms and red flags
- Relevant medical history and medications
- Aggravating/alleviating factors
- Risk factors for serious conditions

Respond in JSON format:
{
  "needsMoreInfo": boolean,
  "reasoning": "Brief explanation of decision",
  "suggestedFocus": "If more info needed, what area to focus on next"
}

Guidelines:
- If you have enough information for a basic clinical assessment (minimum 3-4 relevant clinical details), set needsMoreInfo to false
- If critical information is missing (severity, timing, red flag symptoms, relevant history), set needsMoreInfo to true
- Avoid asking redundant questions
- Prioritize questions that could identify serious conditions`;

    try {
      const response = await this.makeAPICall(prompt);
      const decision = JSON.parse(response);
      return {
        needsMoreInfo: Boolean(decision.needsMoreInfo),
        reasoning: decision.reasoning || "",
        suggestedFocus: decision.suggestedFocus || ""
      };
    } catch (error) {
      console.error("Error determining questioning continuation:", error);
      // Default to continuing if we have fewer than 3 questions
      return {
        needsMoreInfo: conversationHistory.length < 4,
        reasoning: "Error parsing AI response, using fallback logic",
        suggestedFocus: "general clinical details"
      };
    }
  }

  async generateQuestion(complaint: string, conversationHistory: ConversationEntry[], questionNumber: number): Promise<string> {
    // Create context from conversation history
    const historyContext = conversationHistory.map((entry, index) => 
      `${index === 0 ? 'Primary complaint' : `Question ${index}`}: ${entry.question}\nPatient response: ${entry.answer}`
    ).join('\n\n');

    const prompt = `You are a medical AI assistant conducting a patient triage interview. Based on the patient's complaint and previous responses, generate ONE specific, relevant follow-up question to gather important clinical information.

Primary complaint: ${complaint}

Previous conversation:
${historyContext}

Focus on gathering information about:
- Onset, duration, severity, quality of symptoms
- Associated symptoms that could indicate serious conditions
- Relevant medical history, medications, risk factors
- Aggravating/alleviating factors
- Red flag symptoms requiring immediate attention

Generate a clear, professional medical question that:
1. Gathers specific clinical details relevant to the complaint
2. Helps assess severity, duration, or associated symptoms
3. Is appropriate for a patient to answer
4. Avoids asking for information already provided
5. Prioritizes identifying potentially serious conditions

Generate only the question, no additional text or formatting:`;

    return await this.makeAPICall(prompt);
  }

  async generateSOAPNote(complaint: string, conversationHistory: ConversationEntry[]): Promise<SOAPNote> {
    // Prepare conversation context
    const fullConversation = conversationHistory.map((entry, index) => 
      `${index === 0 ? 'Chief Complaint' : `Question ${index}`}: ${entry.question}\nPatient Response: ${entry.answer}`
    ).join('\n\n');

    const prompt = `You are a medical AI assistant. Based on the patient interview below, generate a structured SOAP note. 

Patient Interview:
${fullConversation}

Generate a SOAP note with these exact sections:

SUBJECTIVE: Summarize the patient's chief complaint and symptoms in their own words, including relevant details about onset, duration, severity, quality, and associated symptoms.

OBJECTIVE: State "No objective data collected by this application. Physical examination and vital signs should be obtained during clinical assessment."

ASSESSMENT: Provide a preliminary assessment based on the subjective data. Include possible differential diagnoses but clearly state this is a preliminary AI assessment, not a medical diagnosis.

PLAN: Recommend appropriate next steps including physician evaluation, and mention any urgent care considerations if applicable.

Format your response as JSON with keys: "subjective", "objective", "assessment", "plan"`;

    try {
      const response = await this.makeAPICall(prompt);
      
      // Try to parse as JSON first
      try {
        const jsonResponse = JSON.parse(response);
        return {
          subjective: jsonResponse.subjective || "",
          objective: jsonResponse.objective || "No objective data collected by this application. Physical examination and vital signs should be obtained during clinical assessment.",
          assessment: jsonResponse.assessment || "",
          plan: jsonResponse.plan || ""
        };
      } catch (jsonError) {
        // If JSON parsing fails, parse the text manually
        const sections = response.split(/\n(?=SUBJECTIVE|OBJECTIVE|ASSESSMENT|PLAN)/i);
        const soapNote: SOAPNote = {
          subjective: "",
          objective: "No objective data collected by this application. Physical examination and vital signs should be obtained during clinical assessment.",
          assessment: "",
          plan: ""
        };

        sections.forEach(section => {
          const trimmed = section.trim();
          if (trimmed.toLowerCase().startsWith('subjective')) {
            soapNote.subjective = trimmed.replace(/^subjective:?\s*/i, '');
          } else if (trimmed.toLowerCase().startsWith('objective')) {
            soapNote.objective = trimmed.replace(/^objective:?\s*/i, '');
          } else if (trimmed.toLowerCase().startsWith('assessment')) {
            soapNote.assessment = trimmed.replace(/^assessment:?\s*/i, '');
          } else if (trimmed.toLowerCase().startsWith('plan')) {
            soapNote.plan = trimmed.replace(/^plan:?\s*/i, '');
          }
        });

        return soapNote;
      }
    } catch (error) {
      console.error("Error generating SOAP note:", error);
      throw new Error("Failed to generate clinical assessment");
    }
  }
}

export const geminiService = new GeminiService();
