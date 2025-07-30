import { collection, addDoc, onSnapshot, query, Timestamp } from "firebase/firestore";
import { db, auth } from "./firebase";
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
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const collectionPath = getCollectionPath();
    const docRef = await addDoc(collection(db, collectionPath), {
      userId: user.uid,
      ...noteData,
      timestamp: Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    console.error("Error saving triage note:", error);
    throw new Error("Failed to save assessment");
  }
}

export function subscribeToTriageNotes(callback: (notes: TriageNote[]) => void): () => void {
  try {
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
      callback([]);
    });
  } catch (error) {
    console.error("Error setting up notes subscription:", error);
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
