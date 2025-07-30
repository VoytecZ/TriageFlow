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

    const prompt = `You are a medical AI assistant conducting a patient triage interview. Based on the conversation flow so far, determine if you have sufficient clinical information for a comprehensive SOAP note, or if more questions are needed following a natural progression.

Primary complaint: ${complaint}

Conversation so far:
${historyContext}

Natural questioning progression:
1. Basic characterization: Onset, duration, severity, quality of main symptom
2. Associated symptoms: Directly related to the main complaint  
3. Modifying factors: What makes it better/worse, triggers
4. Context: Medical history, medications, risk factors

Current conversation stage: Question ${conversationHistory.length}

Respond ONLY in valid JSON format:
{
  "needsMoreInfo": boolean,
  "reasoning": "Brief explanation focusing on clinical completeness and natural flow",
  "suggestedFocus": "Next logical area to explore if more info needed"
}

Decision criteria:
- STOP questioning if: You have basic characterization (onset, duration, severity) + associated symptoms + sufficient clinical context (usually 4-6 questions)
- CONTINUE if: Missing basic characterization OR early in natural progression OR critical red flags need exploration
- Prioritize clinical completeness over question count
- Ensure natural flow rather than jumping between unrelated topics`;

    try {
      const response = await this.makeAPICall(prompt);
      
      // Clean the response - remove any markdown formatting or extra text
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      const decision = JSON.parse(cleanResponse);
      return {
        needsMoreInfo: Boolean(decision.needsMoreInfo),
        reasoning: decision.reasoning || "",
        suggestedFocus: decision.suggestedFocus || ""
      };
    } catch (error) {
      console.error("Error determining questioning continuation:", error);
      // Default to continuing if we have fewer than 4 questions
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

    const prompt = `You are a medical AI assistant conducting a patient triage interview. Generate ONE conversational, natural follow-up question that flows logically from the previous conversation.

Primary complaint: ${complaint}

Previous conversation:
${historyContext}

Follow this natural questioning flow:
1. First questions: Start with basic characterization (onset, duration, severity, quality)
2. Then explore: Associated symptoms directly related to the main complaint
3. Next ask about: Aggravating/alleviating factors, triggers
4. Finally assess: Medical history, medications, risk factors

Make the question:
- Conversational and natural (like a caring healthcare provider would ask)
- Directly related to what the patient just shared
- Progressive - build on previous answers rather than jumping topics
- Appropriate for the stage of the conversation
- Focused on one specific aspect at a time

Examples of good flow:
- After chest pain complaint: "When did this chest pain start?"
- After timing established: "Can you describe what the pain feels like?"
- After pain description: "Does anything make the pain better or worse?"

Generate only the question, no additional text:`;

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

Respond with ONLY valid JSON in this exact format (no additional text or markdown):
{
  "subjective": "Summarize the patient's chief complaint and symptoms in their own words, including relevant details about onset, duration, severity, quality, and associated symptoms.",
  "objective": "No objective data collected by this application. Physical examination and vital signs should be obtained during clinical assessment.",
  "assessment": "Provide a preliminary assessment based on the subjective data. Include possible differential diagnoses but clearly state this is a preliminary AI assessment, not a medical diagnosis.",
  "plan": "Recommend appropriate next steps including physician evaluation, and mention any urgent care considerations if applicable."
}`;

    try {
      const response = await this.makeAPICall(prompt);
      
      // Clean the response - remove any markdown formatting or extra text
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      const jsonResponse = JSON.parse(cleanResponse);
      return {
        subjective: jsonResponse.subjective || `Patient reports: ${complaint}. ${conversationHistory.map(entry => entry.answer).filter(Boolean).join(' ')}`,
        objective: jsonResponse.objective || "No objective data collected by this application. Physical examination and vital signs should be obtained during clinical assessment.",
        assessment: jsonResponse.assessment || "Preliminary assessment pending physician review.",
        plan: jsonResponse.plan || "Recommend physician evaluation for further assessment."
      };
    } catch (error) {
      console.error("Error generating SOAP note:", error);
      
      // Fallback SOAP note with actual patient data
      return {
        subjective: `Patient reports: ${complaint}. Additional details: ${conversationHistory.map(entry => `${entry.question} - Patient answered: ${entry.answer}`).join('; ')}`,
        objective: "No objective data collected by this application. Physical examination and vital signs should be obtained during clinical assessment.",
        assessment: "Preliminary AI assessment based on patient-reported symptoms. This is not a medical diagnosis and requires physician evaluation.",
        plan: "Recommend urgent physician evaluation for proper clinical assessment and management."
      };
    }
  }
}

export const geminiService = new GeminiService();
