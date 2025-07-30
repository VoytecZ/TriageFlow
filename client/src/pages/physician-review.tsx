import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Clock, Users, MessageSquare, ArrowRight, Eye } from "lucide-react";
import { TriageNote, subscribeToTriageNotes, getNotesStats } from "@/lib/firestore";
import { NoteDetailModal } from "@/components/note-detail-modal";
import { Link } from "wouter";

export default function PhysicianReview() {
  const [notes, setNotes] = useState<TriageNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<TriageNote | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Set up real-time listener for notes
    const unsubscribe = subscribeToTriageNotes((fetchedNotes) => {
      setNotes(fetchedNotes);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const stats = getNotesStats(notes);

  const formatTimestamp = (timestamp: any) => {
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      
      if (hours < 24) {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch {
      return "Unknown time";
    }
  };

  const handleNoteClick = (note: TriageNote) => {
    setSelectedNote(note);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Physician Review Dashboard</h1>
              <p className="text-gray-600">Review all submitted patient assessments</p>
            </div>
            <Link href="/">
              <Button variant="outline" className="hover:bg-gray-50">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Patient View
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="medical-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="medical-blue-500 p-3 rounded-lg">
                    <FileText className="text-white h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-medical-blue-600">{stats.totalNotes}</p>
                    <p className="text-medical-blue-600">Total Notes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="medical-green-50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="medical-green-500 p-3 rounded-lg">
                    <Clock className="text-white h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-medical-green-600">{stats.todayNotes}</p>
                    <p className="text-medical-green-600">Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-orange-500 p-3 rounded-lg">
                    <Users className="text-white h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-orange-600">{stats.uniqueUsers}</p>
                    <p className="text-orange-600">Unique Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes List */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent Assessments</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Live updates enabled</span>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-medical-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600">Loading patient notes...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-gray-400 h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
                  <p className="text-gray-600">Patient assessments will appear here once submitted</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => handleNoteClick(note)}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="medical-blue-50 p-2 rounded-lg">
                            <FileText className="text-medical-blue-600 h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatTimestamp(note.timestamp)}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">User:</span>
                              <Badge variant="secondary" className="text-xs">
                                {note.userId}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-600 mb-1">Chief Complaint:</p>
                        <p className="text-gray-800 line-clamp-2">{note.initialComplaint}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <MessageSquare className="mr-1 h-4 w-4" />
                          <span>{note.conversationHistory.length} questions answered</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-medical-blue-500 hover:text-medical-blue-600">
                          <Eye className="mr-1 h-4 w-4" />
                          View Details
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Note Detail Modal */}
      <NoteDetailModal
        note={selectedNote}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
