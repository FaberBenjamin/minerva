import { db } from './firebase';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import type { Note } from '../types';

/**
 * Generates a unique ID for a note
 */
function generateNoteId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Loads all notes for a volunteer
 */
export async function loadVolunteerNotes(volunteerId: string): Promise<Note[]> {
  try {
    const volunteerRef = doc(db, 'volunteers', volunteerId);
    const volunteerDoc = await getDoc(volunteerRef);

    if (!volunteerDoc.exists()) {
      throw new Error('Volunteer not found');
    }

    const data = volunteerDoc.data();
    const notes = data.notes || [];

    // Sort by createdAt descending (newest first)
    return notes.sort((a: Note, b: Note) => {
      const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error loading volunteer notes:', error);
    throw error;
  }
}

/**
 * Saves a new note for a volunteer
 */
export async function saveNote(
  volunteerId: string,
  text: string,
  author: string,
  authorId: string
): Promise<Note> {
  try {
    const volunteerRef = doc(db, 'volunteers', volunteerId);

    const newNote: Note = {
      id: generateNoteId(),
      text: text.trim(),
      author,
      authorId,
      createdAt: Timestamp.now(),
      updatedAt: null,
    };

    await updateDoc(volunteerRef, {
      notes: arrayUnion(newNote),
    });

    return newNote;
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
}

/**
 * Updates an existing note
 */
export async function updateNote(
  volunteerId: string,
  noteId: string,
  newText: string
): Promise<void> {
  try {
    const volunteerRef = doc(db, 'volunteers', volunteerId);
    const volunteerDoc = await getDoc(volunteerRef);

    if (!volunteerDoc.exists()) {
      throw new Error('Volunteer not found');
    }

    const data = volunteerDoc.data();
    const notes = data.notes || [];

    // Find the note to update
    const noteIndex = notes.findIndex((n: Note) => n.id === noteId);
    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    // Update the note
    const updatedNotes = [...notes];
    updatedNotes[noteIndex] = {
      ...updatedNotes[noteIndex],
      text: newText.trim(),
      updatedAt: Timestamp.now(),
    };

    await updateDoc(volunteerRef, {
      notes: updatedNotes,
    });
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
}

/**
 * Deletes a note
 */
export async function deleteNote(
  volunteerId: string,
  noteId: string
): Promise<void> {
  try {
    const volunteerRef = doc(db, 'volunteers', volunteerId);
    const volunteerDoc = await getDoc(volunteerRef);

    if (!volunteerDoc.exists()) {
      throw new Error('Volunteer not found');
    }

    const data = volunteerDoc.data();
    const notes = data.notes || [];

    // Find and remove the note
    const noteToRemove = notes.find((n: Note) => n.id === noteId);
    if (!noteToRemove) {
      throw new Error('Note not found');
    }

    await updateDoc(volunteerRef, {
      notes: arrayRemove(noteToRemove),
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}

/**
 * Gets the count of notes for a volunteer
 */
export function getNotesCount(volunteer: any): number {
  return volunteer?.notes?.length || 0;
}
