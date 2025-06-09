'use client';

import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Note } from '../context/NotesContext';
import DraggableNote from './DraggableNote';

interface DroppableNotesListProps {
  notes: Note[];
  onDragEnd: (result: DropResult) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedNote: Partial<Note>) => void;
}

export default function DroppableNotesList({
  notes,
  onDragEnd,
  onDelete,
  onUpdate,
}: DroppableNotesListProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="notes">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-4"
          >
            {notes.map((note, index) => (
              <DraggableNote
                key={note.id}
                note={note}
                index={index}
                onDelete={() => onDelete(note.id)}
                onUpdate={(updatedNote) => onUpdate(note.id, updatedNote)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
} 