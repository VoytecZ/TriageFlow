import { collection, addDoc, onSnapshot, query, Timestamp } from "firebase/firestore";
import { db, auth, initializeAuth } from "./firebase";
import { ConversationEntry, SOAPNote } from "./gemini";

export interface TriageNote {
  id?: string;
  userId: string;
  initialComplaint: string;
  conversationHistory: ConversationEntry[];
  generatedSoapNote: SOAPNote;
  timestamp: Timestamp;
}

// Get the collection path based on app configuration
function getCollectionPath(): string {
  const appId = (window as any).__app_id || 'default';
  return `artifacts/${appId}/public/data/triage_notes`;
}

export async function saveTriageNote(noteData: Omit<TriageNote, 'id' | 'userId' | 'timestamp'>): Promise<string> {
  try {
    // Try to get current user, initialize auth if needed
    let user = auth.currentUser;
    let userId: string;
    
    if (!user) {
      console.log("No current user, attempting authentication...");
      const authUser = await initializeAuth();
      userId = authUser?.uid || `demo-user-${Date.now()}`;
    } else {
      userId = user.uid;
    }

    // Check if Firebase is properly configured
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
      console.warn("Firebase not configured, saving to localStorage for demo");
      const demoNote = {
        id: `demo-${Date.now()}`,
        userId: userId,
        ...noteData,
        timestamp: { seconds: Date.now() / 1000, nanoseconds: 0 }
      };
      
      const existingNotes = JSON.parse(localStorage.getItem('demo-triage-notes') || '[]');
      existingNotes.unshift(demoNote);
      localStorage.setItem('demo-triage-notes', JSON.stringify(existingNotes));
      
      return demoNote.id;
    }

    const collectionPath = getCollectionPath();
    const docRef = await addDoc(collection(db, collectionPath), {
      userId: userId,
      ...noteData,
      timestamp: Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    console.error("Error saving triage note:", error);
    
    // Fallback to localStorage for demo
    console.warn("Falling back to localStorage for demo purposes");
    const demoUserId = auth.currentUser?.uid || `demo-user-${Date.now()}`;
    const demoNote = {
      id: `demo-${Date.now()}`,
      userId: demoUserId,
      ...noteData,
      timestamp: { seconds: Date.now() / 1000, nanoseconds: 0 }
    };
    
    const existingNotes = JSON.parse(localStorage.getItem('demo-triage-notes') || '[]');
    existingNotes.unshift(demoNote);
    localStorage.setItem('demo-triage-notes', JSON.stringify(existingNotes));
    
    return demoNote.id;
  }
}

export function subscribeToTriageNotes(callback: (notes: TriageNote[]) => void): () => void {
  try {
    // Check if Firebase is properly configured
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
      console.warn("Firebase not configured, using localStorage for demo");
      
      // Initial load from localStorage
      const loadDemoNotes = () => {
        const storedNotes = JSON.parse(localStorage.getItem('demo-triage-notes') || '[]');
        callback(storedNotes);
      };
      
      loadDemoNotes();
      
      // Set up interval to check for changes (simple demo polling)
      const interval = setInterval(loadDemoNotes, 1000);
      
      return () => clearInterval(interval);
    }

    const collectionPath = getCollectionPath();
    const notesQuery = query(collection(db, collectionPath));

    return onSnapshot(notesQuery, (snapshot) => {
      const notes: TriageNote[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notes.push({
          id: doc.id,
          userId: data.userId,
          initialComplaint: data.initialComplaint,
          conversationHistory: data.conversationHistory,
          generatedSoapNote: data.generatedSoapNote,
          timestamp: data.timestamp
        });
      });

      // Sort by timestamp (newest first) in JavaScript since orderBy is avoided
      notes.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
      
      callback(notes);
    }, (error) => {
      console.error("Error listening to triage notes:", error);
      
      // Fallback to localStorage demo mode
      console.warn("Falling back to localStorage demo mode");
      const storedNotes = JSON.parse(localStorage.getItem('demo-triage-notes') || '[]');
      callback(storedNotes);
    });
  } catch (error) {
    console.error("Error setting up notes subscription:", error);
    
    // Fallback to localStorage demo mode
    const storedNotes = JSON.parse(localStorage.getItem('demo-triage-notes') || '[]');
    callback(storedNotes);
    
    return () => {};
  }
}

export function getNotesStats(notes: TriageNote[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Timestamp.fromDate(today);

  const todayNotes = notes.filter(note => 
    note.timestamp.seconds >= todayTimestamp.seconds
  );

  const uniqueUsers = new Set(notes.map(note => note.userId));

  return {
    totalNotes: notes.length,
    todayNotes: todayNotes.length,
    uniqueUsers: uniqueUsers.size
  };
}
