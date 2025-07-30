import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Plus, FileCheck, MessageSquare, Stethoscope, Brain, ClipboardList, AlertTriangle } from "lucide-react";
import { SOAPNote } from "@/lib/gemini";

interface SOAPNoteDisplayProps {
  soapNote: SOAPNote | null;
  isLoading: boolean;
  onNewAssessment: () => void;
  onViewNotes: () => void;
}

export function SOAPNoteDisplay({ soapNote, isLoading, onNewAssessment, onViewNotes }: SOAPNoteDisplayProps) {
  return (
    <div className="animate-slide-up">
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="medical-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-medical-green-500 h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete</h2>
            <p className="text-lg text-gray-600">Your information has been compiled into a clinical note</p>
          </div>

          {/* Loading State for SOAP Generation */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-pulse-slow w-12 h-12 border-4 border-medical-green-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Generating clinical assessment
                <span className="loading-dots"></span>
              </p>
              <p className="text-sm text-gray-500 mt-2">AI is analyzing your responses and creating a structured note</p>
            </div>
          )}

          {/* SOAP Note Display */}
          {!isLoading && soapNote && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Clinical Assessment Note</h3>
                
                {/* Subjective */}
                <div className="mb-6 p-4 bg-white rounded-lg border">
                  <h4 className="text-lg font-semibold text-medical-blue-600 mb-3 flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Subjective (S)
                  </h4>
                  <div className="text-gray-800 leading-relaxed">
                    {soapNote.subjective}
                  </div>
                </div>

                {/* Objective */}
                <div className="mb-6 p-4 bg-white rounded-lg border">
                  <h4 className="text-lg font-semibold text-medical-blue-600 mb-3 flex items-center">
                    <Stethoscope className="mr-2 h-5 w-5" />
                    Objective (O)
                  </h4>
                  <div className="text-gray-800 leading-relaxed">
                    {soapNote.objective}
                  </div>
                </div>

                {/* Assessment */}
                <div className="mb-6 p-4 bg-white rounded-lg border">
                  <h4 className="text-lg font-semibold text-medical-blue-600 mb-3 flex items-center">
                    <Brain className="mr-2 h-5 w-5" />
                    Assessment (A)
                  </h4>
                  <div className="text-gray-800 leading-relaxed mb-2">
                    {soapNote.assessment}
                  </div>
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      This is an AI-generated preliminary assessment and does not constitute a medical diagnosis.
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Plan */}
                <div className="mb-6 p-4 bg-white rounded-lg border">
                  <h4 className="text-lg font-semibold text-medical-blue-600 mb-3 flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5" />
                    Plan (P)
                  </h4>
                  <div className="text-gray-800 leading-relaxed">
                    {soapNote.plan}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={onNewAssessment}
                  className="flex-1 medical-blue-500 hover:bg-medical-blue-600 h-12"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Assessment
                </Button>
                <Button 
                  onClick={onViewNotes}
                  variant="outline"
                  className="flex-1 border-medical-blue-500 text-medical-blue-500 hover:bg-medical-blue-50 h-12"
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  View All Notes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
