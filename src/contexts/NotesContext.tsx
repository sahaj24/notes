'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Note, noteService } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  createNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
  saveNoteToStorage: (noteId: string, svgContent: string) => Promise<string>;
  getNoteFromStorage: (noteId: string) => Promise<string | null>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshNotes = async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userNotes = await noteService.getUserNotes(user.id);
      setNotes(userNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newNote = await noteService.createNote({
        ...noteData,
        user_id: user.id
      });
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>): Promise<Note> => {
    try {
      const updatedNote = await noteService.updateNote(id, updates);
      setNotes(prev => prev.map(note => note.id === id ? updatedNote : note));
      return updatedNote;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  const deleteNote = async (id: string): Promise<void> => {
    try {
      await noteService.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  const saveNoteToStorage = async (noteId: string, svgContent: string): Promise<string> => {
    try {
      return await noteService.saveNoteToStorage(noteId, svgContent);
    } catch (error) {
      console.error('Error saving note to storage:', error);
      throw error;
    }
  };

  const getNoteFromStorage = async (noteId: string): Promise<string | null> => {
    try {
      return await noteService.getNoteFromStorage(noteId);
    } catch (error) {
      console.error('Error getting note from storage:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      refreshNotes();
    } else {
      setNotes([]);
      setLoading(false);
    }
  }, [user]);

  const value = {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
    saveNoteToStorage,
    getNoteFromStorage
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};
