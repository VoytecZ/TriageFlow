import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bot, ArrowRight } from "lucide-react";

interface QuestioningFlowProps {
  currentQuestion: string | null;
  questionNumber: number;
  maxQuestions: number;
  conversationHistory: Array<{ question: string; answer: string }>;
  isLoading: boolean;
  onSubmitAnswer: (answer: string) => void;
}

export function QuestioningFlow({
  currentQuestion,
  questionNumber,
  maxQuestions,
  conversationHistory,
  isLoading,
  onSubmitAnswer
}: QuestioningFlowProps) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmitAnswer(answer.trim());
      setAnswer("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  const progress = (questionNumber / maxQuestions) * 100;

  return (
    <div className="animate-slide-up space-y-6">
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Assessment Questions</h2>
            <div className="flex items-center space-x-4 text-medical-blue-500">
              <span className="text-sm font-medium">Question {questionNumber} of {maxQuestions}</span>
              <div className="w-24">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-medical-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">
                AI is analyzing your response
                <span className="loading-dots"></span>
              </p>
            </div>
          )}

          {/* Question Display */}
          {!isLoading && currentQuestion && (
            <div className="space-y-6">
              <div className="medical-blue-50 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <div className="medical-blue-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-medical-blue-600 mb-1">AI Assistant</p>
                    <p className="text-gray-800">{currentQuestion}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label htmlFor="questionAnswer" className="block text-sm font-medium text-gray-700">
                  Your response:
                </label>
                <Textarea
                  id="questionAnswer"
                  placeholder="Please provide as much detail as possible..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[80px] resize-none"
                />
                
                <Button 
                  onClick={handleSubmit}
                  disabled={!answer.trim()}
                  className="medical-blue-500 hover:bg-medical-blue-600"
                >
                  <span className="mr-2">Submit Answer</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation History */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation Summary</h3>
          <div className="space-y-4">
            {conversationHistory.map((entry, index) => (
              <div key={index} className="space-y-2">
                {index === 0 ? (
                  <div className="border-l-4 border-medical-blue-500 pl-4 py-2">
                    <p className="text-sm font-medium text-medical-blue-600">Primary Complaint:</p>
                    <p className="text-gray-800">{entry.answer}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border-l-4 border-gray-300 pl-4 py-2">
                      <p className="text-sm font-medium text-gray-600">Question {index}:</p>
                      <p className="text-gray-800">{entry.question}</p>
                    </div>
                    {entry.answer && (
                      <div className="border-l-4 border-green-300 pl-4 py-2 ml-2">
                        <p className="text-sm font-medium text-green-600">Your Answer:</p>
                        <p className="text-gray-800">{entry.answer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
