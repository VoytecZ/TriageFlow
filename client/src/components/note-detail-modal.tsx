import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Stethoscope, Brain, ClipboardList, User, Clock } from "lucide-react";
import { TriageNote } from "@/lib/firestore";

interface NoteDetailModalProps {
  note: TriageNote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoteDetailModal({ note, open, onOpenChange }: NoteDetailModalProps) {
  if (!note) return null;

  const formatTimestamp = (timestamp: any) => {
    try {
      const date = timestamp.toDate();
      return date.toLocaleString();
    } catch {
      return "Unknown time";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Patient Assessment Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Patient Information */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <User className="mr-2 h-4 w-4" />
                Patient Information
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="font-medium mr-2">User ID:</span>
                  <Badge variant="secondary">{note.userId}</Badge>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  <span className="font-medium mr-2">Timestamp:</span>
                  {formatTimestamp(note.timestamp)}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Complete Conversation History */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Complete Conversation History</h4>
            <div className="space-y-3">
              {note.conversationHistory.map((entry, index) => (
                <div 
                  key={index} 
                  className={`border-l-4 pl-4 py-2 ${
                    index === 0 ? 'border-medical-blue-500' : 'border-gray-300'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-600">
                    {index === 0 ? 'Primary Complaint:' : `Q${index}: ${entry.question}`}
                  </p>
                  <p className="text-gray-800">{entry.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Generated SOAP Note */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Generated SOAP Note</h4>
            <Card>
              <CardContent className="p-4 space-y-4">
                {/* Subjective */}
                <div>
                  <h5 className="font-medium text-medical-blue-600 mb-2 flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Subjective (S)
                  </h5>
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {note.generatedSoapNote.subjective}
                  </p>
                </div>
                
                {/* Objective */}
                <div>
                  <h5 className="font-medium text-medical-blue-600 mb-2 flex items-center">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Objective (O)
                  </h5>
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {note.generatedSoapNote.objective}
                  </p>
                </div>
                
                {/* Assessment */}
                <div>
                  <h5 className="font-medium text-medical-blue-600 mb-2 flex items-center">
                    <Brain className="mr-2 h-4 w-4" />
                    Assessment (A)
                  </h5>
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {note.generatedSoapNote.assessment}
                  </p>
                </div>
                
                {/* Plan */}
                <div>
                  <h5 className="font-medium text-medical-blue-600 mb-2 flex items-center">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Plan (P)
                  </h5>
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {note.generatedSoapNote.plan}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
