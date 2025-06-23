'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import NoteCard from './NoteCard';
import NoteGroup from './NoteGroup';
import CreateNoteModal from './CreateNoteModal';
import EditNoteModal from './EditNoteModal';
import NotionaryLogo from './NotionaryLogo';

export interface TodoItem {
  id: string;
  completed: boolean;
  description: string;
  deadline: string;
  comments: string;
  precedingTaskId?: string;
  reminderTime?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  todos: TodoItem[];
  color: string;
  createdAt: string;
  updatedAt: string;
  workspaceId?: string;
  groupId?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  order?: number;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  noteIds: string[];
  isExpanded: boolean;
  workspaceId?: string;
  order?: number;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
  description?: string;
  isDefault?: boolean;
}

export default function ClientPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Load data from database on mount
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const loadData = async () => {
      try {
        // Load workspaces
        const workspacesResponse = await fetch('/api/workspaces');
        if (workspacesResponse.ok) {
          const workspacesData = await workspacesResponse.json();
          setWorkspaces(workspacesData);
          
          // Set current workspace
          const defaultWorkspace = workspacesData.find((w: Workspace) => w.isDefault);
          if (defaultWorkspace) {
            setCurrentWorkspaceId(defaultWorkspace.id);
          } else if (workspacesData.length > 0) {
            setCurrentWorkspaceId(workspacesData[0].id);
          }
        }

        // Load groups
        const groupsResponse = await fetch('/api/groups');
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json();
          setGroups(groupsData.map((g: any) => ({
            ...g,
            noteIds: [],
            isExpanded: true
          })));
        }

        // Load notes
        const notesResponse = await fetch('/api/notes');
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          setNotes(notesData.map((n: any) => ({
            ...n,
            todos: []
          })));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [session, status, router]);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    console.log('Initial theme load - savedTheme:', savedTheme);
    
    if (savedTheme) {
      const isDarkTheme = savedTheme === 'dark';
      console.log('Setting initial theme to:', isDarkTheme ? 'dark' : 'light');
      setIsDark(isDarkTheme);
      
      // Apply dark mode to document immediately
      if (isDarkTheme) {
        document.documentElement.classList.add('dark');
        console.log('Added dark class to document on mount');
      } else {
        document.documentElement.classList.remove('dark');
        console.log('Removed dark class from document on mount');
      }
    } else {
      console.log('No saved theme found, using default light mode');
      // Ensure light mode is applied
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Save theme preference
  useEffect(() => {
    console.log('Theme changed to:', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Apply dark mode to document
    if (isDark) {
      document.documentElement.classList.add('dark');
      console.log('Added dark class to document');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('Removed dark class from document');
    }
  }, [isDark]);

  const createWorkspace = useCallback(async (name: string, color: string, description?: string, icon?: string) => {
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          color,
          description,
          icon,
        }),
      });

      if (response.ok) {
        const newWorkspace = await response.json();
        setWorkspaces(prev => [...prev, newWorkspace]);
        return newWorkspace.id;
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
    }
    return '';
  }, [workspaces, currentWorkspaceId]);

  const updateWorkspace = useCallback(async (workspaceId: string, updates: Partial<Workspace>) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedWorkspace = await response.json();
        setWorkspaces(prev => prev.map(workspace =>
          workspace.id === workspaceId ? updatedWorkspace : workspace
        ));
      }
    } catch (error) {
      console.error('Error updating workspace:', error);
    }
  }, [workspaces, currentWorkspaceId]);

  const deleteWorkspace = useCallback(async (workspaceId: string) => {
    if (workspaces.length <= 1) {
      alert('You must have at least one workspace!');
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Move notes and groups to another workspace before deleting
        const remainingWorkspaces = workspaces.filter(w => w.id !== workspaceId);
        const targetWorkspaceId = remainingWorkspaces[0].id;

        setNotes(prev => prev.map(note =>
          note.workspaceId === workspaceId 
            ? { ...note, workspaceId: targetWorkspaceId }
            : note
        ));

        setGroups(prev => prev.map(group =>
          group.workspaceId === workspaceId 
            ? { ...group, workspaceId: targetWorkspaceId }
            : group
        ));

        setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
        
        if (currentWorkspaceId === workspaceId) {
          setCurrentWorkspaceId(targetWorkspaceId);
        }
      }
    } catch (error) {
      console.error('Error deleting workspace:', error);
    }
  }, [workspaces, currentWorkspaceId]);

  const createNote = useCallback(async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...noteData,
          workspaceId: currentWorkspaceId,
        }),
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes(prev => [...prev, { ...newNote, todos: [] }]);
        return newNote.id;
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
    return '';
  }, [currentWorkspaceId]);

  const updateNote = useCallback(async (noteId: string, updates: Partial<Note>) => {
    try {
      console.log('Updating note:', noteId, 'with updates:', updates);
      
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        console.log('Successfully updated note:', updatedNote);
        setNotes(prev => prev.map(note =>
          note.id === noteId ? { ...updatedNote, todos: note.todos } : note
        ));
        return updatedNote;
      } else {
        console.error('Failed to update note:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
    return null;
  }, [notes]);

  const deleteNote = useCallback(async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
        setGroups(prev => prev.map(group => ({
          ...group,
          noteIds: group.noteIds.filter(id => id !== noteId)
        })));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }, [notes, groups]);

  const createGroup = useCallback(async (noteIds: string[], name: string = 'New Group') => {
    try {
      console.log('Creating group with notes:', noteIds);
      
      // First create the group
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          color: '#4F46E5',
          workspaceId: currentWorkspaceId,
        }),
      });

      if (response.ok) {
        const newGroup = await response.json();
        console.log('Created group:', newGroup);
        
        // Update all notes to belong to this group at once
        const updatePromises = noteIds.map(noteId => 
          fetch(`/api/notes/${noteId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              groupId: newGroup.id,
            }),
          })
        );
        
        await Promise.all(updatePromises);
        
        // Update local notes state to reflect the group assignment
        setNotes(prev => prev.map(note => 
          noteIds.includes(note.id) 
            ? { ...note, groupId: newGroup.id }
            : note
        ));
        
        // Add group to local state with the correct noteIds
        const groupWithNotes = {
          ...newGroup,
          noteIds: noteIds, // Use the actual noteIds that were added to the group
          isExpanded: true
        };
        
        setGroups(prev => [...prev, groupWithNotes]);
        
        console.log('Successfully created group and updated all notes');
        return newGroup.id;
      } else {
        console.error('Failed to create group:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
    return '';
  }, [currentWorkspaceId]);

  const updateGroup = useCallback(async (groupId: string, updates: Partial<Group>) => {
    try {
      console.log('Updating group:', groupId, 'with updates:', updates);
      
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedGroup = await response.json();
        console.log('Successfully updated group:', updatedGroup);
        
        // Update local state with the new group data while preserving local-only properties
        setGroups(prev => prev.map(group => {
          if (group.id === groupId) {
            return {
              ...updatedGroup,
              noteIds: group.noteIds || [], // Preserve local noteIds
              isExpanded: group.isExpanded // Preserve local isExpanded state
            };
          }
          return group;
        }));
        
        console.log('Updated local groups state');
      } else {
        console.error('Failed to update group:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error updating group:', error);
    }
  }, []);

  const deleteGroup = useCallback(async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove group from notes in local state
        setNotes(prev => prev.map(note =>
          note.groupId === groupId ? { ...note, groupId: undefined } : note
        ));
        
        // Remove group from groups list
        setGroups(prev => prev.filter(group => group.id !== groupId));
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  }, [notes, groups]);

  const handleLogout = useCallback(async () => {
    await signOut({ callbackUrl: '/' });
  }, []);

  const onDragStart = useCallback((start: any) => {
    setDraggedNoteId(start.draggableId);
  }, []);

  const updateGroupNoteIds = useCallback((groupId: string, noteIds: string[]) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, noteIds } : group
    ));
  }, []);

  const onDragEnd = useCallback(async (result: DropResult) => {
    setDraggedNoteId(null);
    
    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;

    console.log('Drag end:', { draggableId, source: source.droppableId, destination: destination.droppableId });

    // If dropping in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Handle group-to-group dragging
    if (draggableId.startsWith('group-') && destination.droppableId.startsWith('group-')) {
      const sourceGroupId = draggableId.replace('group-', '');
      const targetGroupId = destination.droppableId.replace('group-', '');
      
      console.log('Group-to-group drag detected:', { sourceGroupId, targetGroupId });
      
      // Don't allow dropping a group into itself
      if (sourceGroupId === targetGroupId) {
        console.log('Cannot drop group into itself');
        return;
      }
      
      console.log('Group-to-group drag: moving notes from group', sourceGroupId, 'to group', targetGroupId);
      
      // Get all notes from the source group
      const sourceGroupNotes = notes.filter(note => note.groupId === sourceGroupId);
      console.log('Notes in source group:', sourceGroupNotes.length, sourceGroupNotes.map(n => n.id));
      
      if (sourceGroupNotes.length === 0) {
        console.log('No notes found in source group, just deleting the group');
        deleteGroup(sourceGroupId);
        return;
      }
      
      // Move all notes from source group to target group
      const updatePromises = sourceGroupNotes.map(note => 
        fetch(`/api/notes/${note.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupId: targetGroupId,
          }),
        })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setNotes(prev => prev.map(note => 
        sourceGroupNotes.some(sn => sn.id === note.id)
          ? { ...note, groupId: targetGroupId }
          : note
      ));
      
      // Update the target group's noteIds
      const targetGroup = groups.find(g => g.id === targetGroupId);
      if (targetGroup) {
        const newNoteIds = [...(targetGroup.noteIds || []), ...sourceGroupNotes.map(n => n.id)];
        updateGroupNoteIds(targetGroupId, newNoteIds);
      }
      
      // Delete the source group
      console.log('Deleting source group:', sourceGroupId);
      deleteGroup(sourceGroupId);
      
      return;
    }

    // Handle dropping on the main workspace (remove from any group)
    if (destination.droppableId === 'workspace') {
      // If dragging a group to workspace, ungroup all notes in that group
      if (draggableId.startsWith('group-')) {
        const sourceGroupId = draggableId.replace('group-', '');
        const sourceGroupNotes = notes.filter(note => note.groupId === sourceGroupId);
        
        console.log('Dragging group to workspace, ungrouping', sourceGroupNotes.length, 'notes');
        
        // Ungroup all notes in the source group
        const updatePromises = sourceGroupNotes.map(note => 
          fetch(`/api/notes/${note.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              groupId: null,
            }),
          })
        );
        
        await Promise.all(updatePromises);
        
        // Update local state
        setNotes(prev => prev.map(note => 
          sourceGroupNotes.some(sn => sn.id === note.id)
            ? { ...note, groupId: undefined }
            : note
        ));
        
        // Delete the source group
        deleteGroup(sourceGroupId);
        return;
      }
      
      // Remove note from any existing group by setting groupId to undefined
      const updateResponse = await fetch(`/api/notes/${draggableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: null,
        }),
      });
      
      if (updateResponse.ok) {
        // Update local state
        setNotes(prev => prev.map(note => 
          note.id === draggableId
            ? { ...note, groupId: undefined }
            : note
        ));
        
        // Check if the source group should be disbanded
        const draggedNote = notes.find(note => note.id === draggableId);
        if (draggedNote?.groupId) {
          const remainingNotesInGroup = notes.filter(note => note.groupId === draggedNote.groupId);
          if (remainingNotesInGroup.length <= 1) {
            // Disband the group by removing groupId from all notes
            const remainingNotes = notes.filter(note => note.groupId === draggedNote.groupId);
            const ungroupPromises = remainingNotes.map(note => 
              fetch(`/api/notes/${note.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  groupId: null,
                }),
              })
            );
            
            await Promise.all(ungroupPromises);
            
            // Update local state
            setNotes(prev => prev.map(note => 
              remainingNotes.some(rn => rn.id === note.id)
                ? { ...note, groupId: undefined }
                : note
            ));
            
            deleteGroup(draggedNote.groupId);
          } else {
            // Update the source group's noteIds to remove the dragged note
            const sourceGroup = groups.find(g => g.id === draggedNote.groupId);
            if (sourceGroup) {
              const newNoteIds = (sourceGroup.noteIds || []).filter(id => id !== draggableId);
              updateGroupNoteIds(draggedNote.groupId, newNoteIds);
            }
          }
        }
      }
      return;
    }

    // Handle dropping on another note or group to create/join group
    if (destination.droppableId.startsWith('group-') || destination.droppableId.startsWith('note-')) {
      let targetGroupId = '';
      
      if (destination.droppableId.startsWith('note-')) {
        // Dropping on another note - create new group
        const targetNoteId = destination.droppableId.replace('note-', '');
        
        if (targetNoteId !== draggableId) {
          // Remove both notes from any existing groups first
          const draggedNote = notes.find(note => note.id === draggableId);
          const targetNote = notes.find(note => note.id === targetNoteId);
          
          const notesToUngroup: Note[] = [];
          if (draggedNote?.groupId) notesToUngroup.push(draggedNote);
          if (targetNote?.groupId) notesToUngroup.push(targetNote);
          
          if (notesToUngroup.length > 0) {
            const ungroupPromises = notesToUngroup.map(note => 
              fetch(`/api/notes/${note.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  groupId: null,
                }),
              })
            );
            
            await Promise.all(ungroupPromises);
            
            // Update local state
            setNotes(prev => prev.map(note => 
              notesToUngroup.some(ung => ung.id === note.id)
                ? { ...note, groupId: undefined }
                : note
            ));
            
            // Check if any groups should be disbanded
            for (const note of notesToUngroup) {
              if (note.groupId) {
                const remainingNotesInGroup = notes.filter(n => n.groupId === note.groupId);
                if (remainingNotesInGroup.length <= 1) {
                  const remainingNotes = notes.filter(n => n.groupId === note.groupId);
                  const finalUngroupPromises = remainingNotes.map(n => 
                    fetch(`/api/notes/${n.id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        groupId: null,
                      }),
                    })
                  );
                  
                  await Promise.all(finalUngroupPromises);
                  
                  // Update local state
                  setNotes(prev => prev.map(n => 
                    remainingNotes.some(rn => rn.id === n.id)
                      ? { ...n, groupId: undefined }
                      : n
                  ));
                  
                  deleteGroup(note.groupId);
                }
              }
            }
          }

          // Create new group with both notes
          createGroup([targetNoteId, draggableId], 'New Group');
        }
        return;
      } else {
        // Dropping on existing group
        targetGroupId = destination.droppableId.replace('group-', '');
      }
      
      // Get the current note to check if it's already in the target group
      const draggedNote = notes.find(note => note.id === draggableId);
      
      // If the note is already in the target group, do nothing
      if (draggedNote?.groupId === targetGroupId) {
        return;
      }
      
      // Remove note from any existing group first
      if (draggedNote?.groupId) {
        const updateResponse = await fetch(`/api/notes/${draggableId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupId: null,
          }),
        });
        
        if (updateResponse.ok) {
          // Update local state
          setNotes(prev => prev.map(note => 
            note.id === draggableId
              ? { ...note, groupId: undefined }
              : note
          ));
          
          // Check if source group should be disbanded
          const remainingNotesInGroup = notes.filter(note => note.groupId === draggedNote.groupId);
          if (remainingNotesInGroup.length <= 1) {
            const remainingNotes = notes.filter(note => note.groupId === draggedNote.groupId);
            const ungroupPromises = remainingNotes.map(note => 
              fetch(`/api/notes/${note.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  groupId: null,
                }),
              })
            );
            
            await Promise.all(ungroupPromises);
            
            // Update local state
            setNotes(prev => prev.map(note => 
              remainingNotes.some(rn => rn.id === note.id)
                ? { ...note, groupId: undefined }
                : note
            ));
            
            deleteGroup(draggedNote.groupId);
          } else {
            // Update the source group's noteIds to remove the dragged note
            const sourceGroup = groups.find(g => g.id === draggedNote.groupId);
            if (sourceGroup) {
              const newNoteIds = (sourceGroup.noteIds || []).filter(id => id !== draggableId);
              updateGroupNoteIds(draggedNote.groupId, newNoteIds);
            }
          }
        }
      }

      // Add note to the target group by updating the note's groupId
      const addToGroupResponse = await fetch(`/api/notes/${draggableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: targetGroupId,
        }),
      });
      
      if (addToGroupResponse.ok) {
        // Update local state
        setNotes(prev => prev.map(note => 
          note.id === draggableId
            ? { ...note, groupId: targetGroupId }
            : note
        ));
        
        // Update the target group's noteIds
        const targetGroup = groups.find(g => g.id === targetGroupId);
        if (targetGroup) {
          const newNoteIds = [...(targetGroup.noteIds || []), draggableId];
          updateGroupNoteIds(targetGroupId, newNoteIds);
        }
      }
      
      return;
    }
  }, [notes, groups, createGroup, deleteGroup, updateGroupNoteIds]);

  const getAllWorkspaceItems = useCallback(() => {
    const workspaceNotes = notes.filter(note => 
      note.workspaceId === currentWorkspaceId || (!note.workspaceId && currentWorkspaceId === workspaces.find(w => w.isDefault)?.id)
    );
    
    const workspaceGroups = groups.filter(group => 
      group.workspaceId === currentWorkspaceId || (!group.workspaceId && currentWorkspaceId === workspaces.find(w => w.isDefault)?.id)
    );

    const ungroupedNotes = workspaceNotes.filter(note => !note.groupId);
    
    // Use actual note.groupId to determine which notes belong to which groups
    // This ensures we're in sync with the database state
    const groupedNotes = workspaceGroups
      .map(group => {
        const groupNotes = workspaceNotes.filter(note => note.groupId === group.id);
        return {
          ...group,
          notes: groupNotes,
          noteIds: groupNotes.map(note => note.id) // Update noteIds to match actual state
        };
      })
      .filter(group => group.notes.length > 0); // Only include groups that have notes

    // Debug logging
    console.log('Workspace notes:', workspaceNotes.length);
    console.log('Workspace groups:', workspaceGroups.length);
    console.log('Ungrouped notes:', ungroupedNotes.length);
    console.log('Grouped notes:', groupedNotes.length);
    console.log('Groups with notes:', groupedNotes.map(g => ({ id: g.id, noteCount: g.notes.length, noteIds: g.noteIds })));

    return { ungroupedNotes, groupedNotes };
  }, [notes, groups, workspaces, currentWorkspaceId]);

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EEF2FF] to-[#F3F4F6] dark:from-[#1E1B4B] dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4F46E5] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const { ungroupedNotes, groupedNotes } = getAllWorkspaceItems();
  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);
  
  // Calculate total items (individual notes + groups)
  const totalIndividualNotes = ungroupedNotes?.length || 0;
  const totalGroups = groupedNotes?.length || 0;
  const totalItems = totalIndividualNotes + totalGroups;

  // Create workspaceItems array for drag and drop
  const workspaceItems = [
    ...groupedNotes.map(group => ({ type: 'group' as const, item: group })),
    ...ungroupedNotes.map(note => ({ type: 'note' as const, item: note }))
  ];

  // Define colors for groups
  const colors = [
    '#E5E7EB', // Gray
    '#FEF3C7', // Yellow
    '#DBEAFE', // Blue
    '#D1FAE5', // Green
    '#FCE7F3', // Pink
    '#F3E8FF', // Purple
    '#FED7D7', // Red
  ];

  // Create descriptive text
  const getDescriptionText = () => {
    // Calculate total notes (ungrouped + grouped)
    const totalNotesInGroups = groupedNotes.reduce((sum, group) => sum + group.notes.length, 0);
    const totalAllNotes = totalIndividualNotes + totalNotesInGroups;
    
    if (totalAllNotes === 0) return 'No notes yet';
    if (totalAllNotes === 1) return '1 note';
    
    const parts = [];
    if (totalAllNotes > 0) {
      parts.push(`${totalAllNotes} note${totalAllNotes === 1 ? '' : 's'}`);
    }
    if (totalGroups > 0) {
      parts.push(`${totalGroups} group${totalGroups === 1 ? '' : 's'}`);
    }
    
    return parts.join(' • ');
  };

  // Function to calculate available positions for ungrouped notes
  const getAvailablePositions = () => {
    const occupiedPositions = new Set();
    
    // Mark positions occupied by groups
    groupedNotes.forEach((group) => {
      const firstNote = group.notes[0];
      if (!firstNote || !notes) return;
      
      const originalIndex = notes.findIndex(note => note.id === firstNote.id);
      if (originalIndex === -1) return;
      
      const col = originalIndex % 4;
      const row = Math.floor(originalIndex / 4);
      occupiedPositions.add(`${col}-${row}`);
    });
    
    // Calculate positions for ungrouped notes
    const positions: { left: string; top: string }[] = [];
    let currentIndex = 0;
    
    for (let row = 0; row < 10; row++) { // Limit to 10 rows
      for (let col = 0; col < 4; col++) {
        if (!occupiedPositions.has(`${col}-${row}`)) {
          if (currentIndex < ungroupedNotes.length) {
            positions.push({
              left: `${col * 25}%`,
              top: `${row * 200}px`
            });
            currentIndex++;
          } else {
            break;
          }
        }
      }
      if (currentIndex >= ungroupedNotes.length) break;
    }
    
    return positions;
  };

  const availablePositions = getAvailablePositions();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700/50 transition-colors duration-300">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <NotionaryLogo size="lg" showText={true} isDark={isDark} />
              
              {/* Workspace Selector with Clear Dropdown Button */}
              <div className="relative group">
                <button
                  className="workspace-selector-btn flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 min-w-0"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    {currentWorkspace?.icon && (
                      <span className="text-lg flex-shrink-0">{currentWorkspace.icon}</span>
                    )}
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: currentWorkspace?.color || '#4F46E5' }}
                    />
                    <span className="truncate max-w-32">
                      {currentWorkspace?.name || 'My Workspace'}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Workspace Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4">
                    {/* Create New Workspace Button */}
                    <button
                      onClick={() => setShowWorkspaceModal(true)}
                      className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Create New Workspace</span>
                    </button>

                    {/* Workspace List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {workspaces.map((workspace) => (
                        <button
                          key={workspace.id}
                          onClick={() => setCurrentWorkspaceId(workspace.id)}
                          className={`w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-all duration-200 ${
                            currentWorkspaceId === workspace.id
                              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {workspace.icon && (
                            <span className="text-lg flex-shrink-0">{workspace.icon}</span>
                          )}
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: workspace.color || '#4F46E5' }}
                          />
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {workspace.name}
                            </div>
                            {workspace.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {workspace.description}
                              </div>
                            )}
                          </div>
                          {currentWorkspaceId === workspace.id && (
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Create Note Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary px-4 py-2 font-semibold rounded-lg flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">New Note</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* User Menu & Logout */}
              <div className="relative group">
                <button className="flex items-center space-x-2">
                  <div className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {session.user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:block font-semibold text-sm text-gray-800 dark:text-gray-200">{session.user?.name}</span>
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-600">Signed in as</div>
                    <div className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 font-semibold truncate">{session.user?.email}</div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="space-y-12">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {currentWorkspace?.name || 'My Workspace'}
              </h1>
              <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {getDescriptionText()}
              </p>
            </div>
            
            {totalItems === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="mx-auto h-24 w-24 text-indigo-300 dark:text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">Your workspace is empty</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Let's create your first note to get started.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
                >
                  <span>Create First Note</span>
                </button>
              </div>
            ) : (
              <Droppable droppableId="workspace" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-2 rounded-xl transition-colors duration-300 min-h-[400px] ${
                      snapshot.isDraggingOver ? 'bg-indigo-100/50 dark:bg-indigo-900/20' : ''
                    }`}
                  >
                    {workspaceItems.map((item, index) => (
                      <Draggable 
                        key={item.type === 'group' ? `group-${item.item.id}` : `note-${item.item.id}`} 
                        draggableId={item.type === 'group' ? `group-${item.item.id}` : item.item.id} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`transition-all duration-300 ${
                              snapshot.isDragging ? 'transform rotate-2 scale-105 z-20 shadow-2xl' : 'z-10'
                            }`}
                          >
                            {item.type === 'group' ? (
                              <NoteGroup
                                group={item.item as Group}
                                notes={notes.filter(note => (item.item as Group).noteIds.includes(note.id))}
                                isDark={isDark}
                                draggedNoteId={draggedNoteId}
                                onUpdateGroup={updateGroup}
                                onDeleteGroup={deleteGroup}
                                onUpdateNote={updateNote}
                                onDeleteNote={deleteNote}
                                onOpenNote={(noteId: string) => {
                                  setEditingNoteId(noteId);
                                }}
                                colors={colors}
                                isWorkspaceView={true}
                              />
                            ) : (
                              <NoteCard
                                note={item.item as Note}
                                isDark={isDark}
                                isDragging={snapshot.isDragging}
                                onUpdate={updateNote}
                                onDelete={deleteNote}
                              />
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </div>
        </DragDropContext>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateNoteModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createNote}
          isDark={isDark}
        />
      )}

      {editingNoteId && (
        <EditNoteModal
          note={notes.find(n => n.id === editingNoteId)!}
          onClose={() => setEditingNoteId(null)}
          onUpdate={(noteId, updates) => {
            updateNote(noteId, updates);
            setEditingNoteId(null);
          }}
          isDark={isDark}
        />
      )}

      {showWorkspaceModal && (
        <WorkspaceModal
          isDark={isDark}
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspaceId}
          colors={['#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#6366F1']}
          onClose={() => setShowWorkspaceModal(false)}
          onCreate={createWorkspace}
          onUpdate={updateWorkspace}
          onDelete={deleteWorkspace}
          onSwitch={setCurrentWorkspaceId}
        />
      )}
    </div>
  );
}

// Workspace Modal Component
interface WorkspaceModalProps {
  isDark: boolean;
  workspaces: Workspace[];
  currentWorkspaceId: string;
  colors: string[];
  onClose: () => void;
  onCreate: (name: string, color: string, description?: string, icon?: string) => Promise<string>;
  onUpdate: (id: string, updates: Partial<Workspace>) => void;
  onDelete: (id: string) => void;
  onSwitch: (id: string) => void;
}

function WorkspaceModal({
  isDark,
  workspaces,
  currentWorkspaceId,
  colors,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  onSwitch
}: WorkspaceModalProps) {
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceColor, setNewWorkspaceColor] = useState(colors[0]);
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  const [newWorkspaceIcon, setNewWorkspaceIcon] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Modern color palette for light and dark modes
  const lightModeColors = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981',
    '#06B6D4', '#6366F1', '#F97316', '#84CC16', '#A855F7', '#14B8A6'
  ];
  
  const darkModeColors = [
    '#60A5FA', '#A78BFA', '#F472B6', '#F87171', '#FBBF24', '#34D399',
    '#22D3EE', '#818CF8', '#FB923C', '#A3E635', '#C084FC', '#2DD4BF'
  ];

  const currentColors = isDark ? darkModeColors : lightModeColors;

  // Common emojis for workspaces
  const commonEmojis = ['📝', '💼', '🎯', '🚀', '💡', '📊', '🎨', '📚', '🏠', '⭐', '🔥', '💎', '🌱', '🎪', '🏆', '💻'];

  const handleCreate = useCallback(async () => {
    if (newWorkspaceName.trim()) {
      setIsCreating(true);
      try {
        const workspaceId = await onCreate(
          newWorkspaceName.trim(),
          newWorkspaceColor,
          newWorkspaceDescription.trim(),
          newWorkspaceIcon
        );
        if (workspaceId) {
          setNewWorkspaceName('');
          setNewWorkspaceColor(currentColors[0]);
          setNewWorkspaceDescription('');
          setNewWorkspaceIcon('');
          onClose();
        }
      } catch (error) {
        console.error('Error creating workspace:', error);
      } finally {
        setIsCreating(false);
      }
    }
  }, [newWorkspaceName, newWorkspaceColor, newWorkspaceDescription, newWorkspaceIcon, onCreate, onClose, currentColors]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Create New Workspace</h2>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Workspace Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Workspace Name *
              </label>
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Enter workspace name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Workspace Icon
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between hover:border-blue-500 transition-all duration-200"
                >
                  <span className="flex items-center space-x-3">
                    {newWorkspaceIcon ? (
                      <span className="text-2xl">{newWorkspaceIcon}</span>
                    ) : (
                      <span className="text-gray-400">🎯</span>
                    )}
                    <span className={newWorkspaceIcon ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                      {newWorkspaceIcon ? 'Selected' : 'Choose an icon'}
                    </span>
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg z-10 p-4">
                    <div className="grid grid-cols-8 gap-2">
                      {commonEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setNewWorkspaceIcon(emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="w-8 h-8 text-xl hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Workspace Color
              </label>
              <div className="grid grid-cols-6 gap-3">
                {currentColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewWorkspaceColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                      newWorkspaceColor === color
                        ? 'border-gray-900 dark:border-white scale-110 shadow-lg'
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={newWorkspaceDescription}
                onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                placeholder="Describe your workspace..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!newWorkspaceName.trim() || isCreating}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {isCreating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Workspace'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 