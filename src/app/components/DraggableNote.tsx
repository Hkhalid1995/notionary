'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Note } from '../context/NotesContext';
import TaskItemWithDateTime from './TaskItemWithDateTime';

interface DraggableNoteProps {
  note: Note;
  index: number;
  onDelete: () => void;
  onUpdate: (updatedNote: Partial<Note>) => void;
}

export default function DraggableNote({ note, index, onDelete, onUpdate }: DraggableNoteProps) {
  return (
    <Draggable draggableId={note.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <TaskItemWithDateTime
            note={note}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </Draggable>
  );
} 