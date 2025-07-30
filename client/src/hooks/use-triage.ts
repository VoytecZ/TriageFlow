import { useState, useCallback } from "react";
import { ConversationEntry, SOAPNote, geminiService } from "@/lib/gemini";
import { saveTriageNote } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

export interface TriageState {
  currentScreen: 'input' | 'questioning' | 'soap-note';
  currentQuestion: number;
  maxQuestions: number;
  complaint: string;
  conversationHistory: ConversationEntry[];
  generatedSoapNote: SOAPNote | null;
  isLoading: boolean;
  error: string | null;
}

export function useTriage() {
  const { toast } = useToast();
  const [state, setState] = useState<TriageState>({
    currentScreen: 'input',
    currentQuestion: 1,
    maxQuestions: 3,
    complaint: '',
    conversationHistory: [],
    generatedSoapNote: null,
    isLoading: false,
    error: null
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading, error: null }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
    toast({
      title: "Error",
      description: error,
      variant: "destructive"
    });
  }, [toast]);

  const startTriage = useCallback(async (complaint: string) => {
    if (!complaint.trim()) {
      setError("Please describe your symptoms");
      return;
    }

    setState(prev => ({
      ...prev,
      complaint: complaint.trim(),
      conversationHistory: [{
        question: "What brings you here today?",
        answer: complaint.trim()
      }],
      currentScreen: 'questioning',
      currentQuestion: 1,
      isLoading: true,
      error: null
    }));

    try {
      const question = await geminiService.generateQuestion(
        complaint.trim(),
        [{ question: "What brings you here today?", answer: complaint.trim() }],
        1
      );

      setState(prev => ({
        ...prev,
        conversationHistory: [
          ...prev.conversationHistory,
          { question, answer: '' }
        ],
        isLoading: false
      }));
    } catch (error) {
      setError("Failed to generate first question");
    }
  }, [setError]);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!answer.trim()) {
      setError("Please provide an answer");
      return;
    }

    setLoading(true);

    try {
      // Update the current question with the answer
      const updatedHistory = [...state.conversationHistory];
      updatedHistory[updatedHistory.length - 1].answer = answer.trim();

      if (state.currentQuestion < state.maxQuestions) {
        // Generate next question
        const nextQuestion = await geminiService.generateQuestion(
          state.complaint,
          updatedHistory,
          state.currentQuestion + 1
        );

        setState(prev => ({
          ...prev,
          conversationHistory: [
            ...updatedHistory,
            { question: nextQuestion, answer: '' }
          ],
          currentQuestion: prev.currentQuestion + 1,
          isLoading: false
        }));
      } else {
        // Generate SOAP note
        setState(prev => ({
          ...prev,
          conversationHistory: updatedHistory,
          currentScreen: 'soap-note',
          isLoading: true
        }));

        const soapNote = await geminiService.generateSOAPNote(
          state.complaint,
          updatedHistory
        );

        // Save to Firestore
        await saveTriageNote({
          initialComplaint: state.complaint,
          conversationHistory: updatedHistory,
          generatedSoapNote: soapNote
        });

        setState(prev => ({
          ...prev,
          generatedSoapNote: soapNote,
          isLoading: false
        }));

        toast({
          title: "Assessment Complete",
          description: "Your clinical assessment has been generated and saved.",
        });
      }
    } catch (error) {
      setError("Failed to process response");
    }
  }, [state, setLoading, setError, toast]);

  const resetTriage = useCallback(() => {
    setState({
      currentScreen: 'input',
      currentQuestion: 1,
      maxQuestions: 3,
      complaint: '',
      conversationHistory: [],
      generatedSoapNote: null,
      isLoading: false,
      error: null
    });

    toast({
      title: "Ready for New Assessment",
      description: "You can now start a new patient assessment.",
    });
  }, [toast]);

  const getCurrentQuestion = useCallback(() => {
    if (state.conversationHistory.length === 0) return null;
    const lastEntry = state.conversationHistory[state.conversationHistory.length - 1];
    return lastEntry.answer === '' ? lastEntry.question : null;
  }, [state.conversationHistory]);

  const getProgress = useCallback(() => {
    return (state.currentQuestion / state.maxQuestions) * 100;
  }, [state.currentQuestion, state.maxQuestions]);

  return {
    state,
    startTriage,
    submitAnswer,
    resetTriage,
    getCurrentQuestion,
    getProgress
  };
}
