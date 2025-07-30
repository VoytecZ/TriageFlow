import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, UserRound } from "lucide-react";
import { PatientInput } from "@/components/patient-input";
import { QuestioningFlow } from "@/components/questioning-flow";
import { SOAPNoteDisplay } from "@/components/soap-note-display";
import { useTriage } from "@/hooks/use-triage";
import { initializeAuth, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const {
    state,
    startTriage,
    submitAnswer,
    resetTriage,
    getCurrentQuestion,
    getProgress
  } = useTriage();

  useEffect(() => {
    // Initialize Firebase authentication
    const initAuth = async () => {
      try {
        const currentUser = await initializeAuth();
        setUser(currentUser);
        toast({
          title: "Connected",
          description: "Successfully connected to the system",
        });
      } catch (error) {
        console.error("Authentication failed:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the system",
          variant: "destructive"
        });
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Connecting to system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="medical-blue-500 p-2 rounded-lg">
                <Stethoscope className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Triage System</h1>
                <p className="text-sm text-gray-600">Smart Patient Assessment</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/physician-review">
                <Button 
                  variant="outline"
                  className="border-medical-blue-500 text-medical-blue-500 hover:bg-medical-blue-50"
                >
                  <UserRound className="mr-2 h-4 w-4" />
                  Physician View
                </Button>
              </Link>
              {user && (
                <div className="text-sm text-gray-500">
                  <span>User: </span>
                  <Badge variant="secondary">{user.uid}</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state.currentScreen === 'input' && (
          <PatientInput
            onStartTriage={startTriage}
            isLoading={state.isLoading}
          />
        )}

        {state.currentScreen === 'questioning' && (
          <QuestioningFlow
            currentQuestion={getCurrentQuestion()}
            questionNumber={state.currentQuestion}
            maxQuestions={state.maxQuestions}
            conversationHistory={state.conversationHistory.filter(entry => entry.answer !== '')}
            isLoading={state.isLoading}
            onSubmitAnswer={submitAnswer}
          />
        )}

        {state.currentScreen === 'soap-note' && (
          <SOAPNoteDisplay
            soapNote={state.generatedSoapNote}
            isLoading={state.isLoading}
            onNewAssessment={resetTriage}
            onViewNotes={() => window.location.href = '/physician-review'}
          />
        )}
      </main>
    </div>
  );
}
