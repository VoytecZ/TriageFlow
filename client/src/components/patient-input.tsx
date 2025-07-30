import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Play, Info } from "lucide-react";

interface PatientInputProps {
  onStartTriage: (complaint: string) => void;
  isLoading: boolean;
}

export function PatientInput({ onStartTriage, isLoading }: PatientInputProps) {
  const [complaint, setComplaint] = useState("");

  const handleSubmit = () => {
    onStartTriage(complaint);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="medical-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="text-medical-blue-500 h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Tell us about your symptoms</h2>
            <p className="text-lg text-gray-600">Our AI will ask a few questions to better understand your condition</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <label htmlFor="primaryComplaint" className="block text-sm font-medium text-gray-700 mb-2">
              What brings you here today? Describe your main concern:
            </label>
            <Textarea
              id="primaryComplaint"
              placeholder="For example: I have been experiencing severe headaches for the past 3 days..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
            
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !complaint.trim()}
              className="w-full mt-6 medical-blue-500 hover:bg-medical-blue-600 h-12"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Starting Assessment...
                </div>
              ) : (
                <div className="flex items-center">
                  <Play className="mr-2 h-4 w-4" />
                  Start Triage Assessment
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Demo Instructions Card */}
      <Card className="medical-green-50 border-medical-green-500">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Info className="text-medical-green-600 mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-medical-green-600 mb-2">Demo Instructions</h3>
              <p className="text-sm text-gray-700">
                This is a demonstration of AI-powered patient triage. For optimal demo results, 
                try complaints related to: headaches, sore throat, or abdominal pain. 
                The system will generate 2-3 follow-up questions and create a SOAP-like note.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
