'use client';

import { useState } from 'react';
import { TodoItem } from './ClientPage';

interface TodoItemComponentProps {
  todo: TodoItem;
  todos: TodoItem[];
  onUpdate: (updates: Partial<TodoItem>) => void;
  onDelete: () => void;
  isDark: boolean;
}

export default function TodoItemComponent({ 
  todo, 
  todos,
  onUpdate, 
  onDelete, 
  isDark 
}: TodoItemComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    description: todo.description,
    deadline: todo.deadline,
    comments: todo.comments,
    precedingTaskId: todo.precedingTaskId || '',
    reminderTime: todo.reminderTime || ''
  });

  const handleSave = () => {
    onUpdate({
      description: editData.description,
      deadline: editData.deadline,
      comments: editData.comments,
      precedingTaskId: editData.precedingTaskId || undefined,
      reminderTime: editData.reminderTime || undefined
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      description: todo.description,
      deadline: todo.deadline,
      comments: todo.comments,
      precedingTaskId: todo.precedingTaskId || '',
      reminderTime: todo.reminderTime || ''
    });
    setIsEditing(false);
  };

  const handleComplete = () => {
    onUpdate({ completed: !todo.completed });
  };

  const addToCalendar = () => {
    const startDate = new Date(todo.deadline);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Google Calendar URL
    const googleParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Task: ${todo.description}`,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: `Task Description: ${todo.description}\n\nComments: ${todo.comments || 'None'}`,
      location: 'Notes App'
    });
    
    const googleUrl = `https://calendar.google.com/calendar/render?${googleParams}`;
    
    // Show options
    const choice = window.confirm('Add to calendar?\n\nOK - Google Calendar\nCancel - Copy calendar info');
    
    if (choice) {
      window.open(googleUrl, '_blank');
    } else {
      // Copy calendar data for Apple Calendar or other apps
      const calendarData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Notes App//Todo//EN
BEGIN:VEVENT
UID:${todo.id}@notes-app
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Task: ${todo.description}
DESCRIPTION:${todo.comments || 'No additional comments'}
END:VEVENT
END:VCALENDAR`;
      
      navigator.clipboard.writeText(calendarData).then(() => {
        alert('Calendar data copied! Paste into your calendar app.');
      });
    }
  };

  // Check if task can be completed (no pending dependencies)
  const canComplete = () => {
    if (!todo.precedingTaskId) return true;
    const precedingTask = todos.find(t => t.id === todo.precedingTaskId);
    return precedingTask?.completed || false;
  };

  // Get preceding task name
  const getPrecedingTaskName = () => {
    if (!todo.precedingTaskId) return '';
    const precedingTask = todos.find(t => t.id === todo.precedingTaskId);
    return precedingTask?.description || 'Unknown task';
  };

  // Available tasks for dependency selection (exclude current task and already dependent tasks)
  const availablePrecedingTasks = todos.filter(t => 
    t.id !== todo.id && 
    !t.precedingTaskId // Prevent circular dependencies
  );

  // Check if deadline is approaching
  const isDeadlineNear = () => {
    if (!todo.deadline) return false;
    const deadline = new Date(todo.deadline);
    const now = new Date();
    const hoursDiff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24 && hoursDiff > 0; // Within 24 hours
  };

  const isOverdue = () => {
    if (!todo.deadline) return false;
    return new Date(todo.deadline) < new Date();
  };

  const reminderOptions = [
    { value: '15m', label: '15 minutes before' },
    { value: '30m', label: '30 minutes before' },
    { value: '1h', label: '1 hour before' },
    { value: '2h', label: '2 hours before' },
    { value: '1d', label: '1 day before' },
    { value: '2d', label: '2 days before' },
    { value: '1w', label: '1 week before' }
  ];

  if (isEditing) {
    return (
      <div className={`p-4 border rounded-lg space-y-3 ${
        isDark 
          ? 'border-gray-600 bg-gray-800' 
          : 'border-gray-300 bg-gray-50'
      }`}>
        <div className="space-y-2">
          <input
            type="text"
            value={editData.description}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Task description"
            className={`w-full p-2 rounded border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Deadline
              </label>
              <input
                type="datetime-local"
                value={editData.deadline}
                onChange={(e) => setEditData(prev => ({ ...prev, deadline: e.target.value }))}
                className={`w-full p-2 rounded border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Reminder
              </label>
              <select
                value={editData.reminderTime}
                onChange={(e) => setEditData(prev => ({ ...prev, reminderTime: e.target.value }))}
                className={`w-full p-2 rounded border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">No reminder</option>
                {reminderOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dependency Selection */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Depends on task (optional)
            </label>
            <select
              value={editData.precedingTaskId}
              onChange={(e) => setEditData(prev => ({ ...prev, precedingTaskId: e.target.value }))}
              className={`w-full p-2 rounded border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">No dependency</option>
              {availablePrecedingTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.description} {task.completed ? '✅' : '⏳'}
                </option>
              ))}
            </select>
          </div>
          
          <textarea
            value={editData.comments}
            onChange={(e) => setEditData(prev => ({ ...prev, comments: e.target.value }))}
            placeholder="Comments"
            rows={2}
            className={`w-full p-2 rounded border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            ✅ Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 ${
      todo.completed 
        ? isDark 
          ? 'bg-green-900/20 border-green-600' 
          : 'bg-green-50 border-green-300'
        : isDark 
          ? 'bg-gray-800 border-gray-600' 
          : 'bg-white border-gray-200'
    } ${
      isOverdue() && !todo.completed 
        ? isDark 
          ? 'ring-2 ring-red-500' 
          : 'ring-2 ring-red-400'
        : isDeadlineNear() && !todo.completed
          ? isDark 
            ? 'ring-2 ring-yellow-500' 
            : 'ring-2 ring-yellow-400'
          : ''
    }`}>
      {/* Serial Number & Checkbox */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <span className={`text-sm font-medium ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {todos.indexOf(todo) + 1}.
        </span>
        
        <button
          onClick={handleComplete}
          disabled={!canComplete()}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            todo.completed
              ? 'bg-green-600 border-green-600 text-white'
              : canComplete()
                ? isDark 
                  ? 'border-gray-500 hover:border-green-500' 
                  : 'border-gray-400 hover:border-green-500'
                : isDark 
                  ? 'border-gray-600 bg-gray-700 cursor-not-allowed' 
                  : 'border-gray-300 bg-gray-100 cursor-not-allowed'
          }`}
        >
          {todo.completed && '✓'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium ${
          todo.completed 
            ? isDark 
              ? 'text-gray-500 line-through' 
              : 'text-gray-400 line-through'
            : isDark 
              ? 'text-white' 
              : 'text-gray-900'
        }`}>
          {todo.description}
        </div>
        
        {/* Dependency info */}
        {todo.precedingTaskId && (
          <div className={`text-xs mt-1 flex items-center space-x-1 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span>🔗</span>
            <span>Depends on: {getPrecedingTaskName()}</span>
            {!canComplete() && (
              <span className="text-orange-500 font-medium">(Waiting)</span>
            )}
          </div>
        )}
        
        {/* Deadline */}
        {todo.deadline && (
          <div className={`text-sm mt-1 flex items-center space-x-2 ${
            isOverdue() && !todo.completed
              ? 'text-red-500 font-medium'
              : isDeadlineNear() && !todo.completed
                ? 'text-yellow-500 font-medium'
                : isDark 
                  ? 'text-gray-400' 
                  : 'text-gray-600'
          }`}>
            <span>📅</span>
            <span>{new Date(todo.deadline).toLocaleString()}</span>
            {isOverdue() && !todo.completed && <span>⚠️ OVERDUE</span>}
            {isDeadlineNear() && !todo.completed && <span>⏰ DUE SOON</span>}
          </div>
        )}
        
        {/* Reminder */}
        {todo.reminderTime && (
          <div className={`text-xs mt-1 flex items-center space-x-1 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span>🔔</span>
            <span>Reminder: {reminderOptions.find(r => r.value === todo.reminderTime)?.label || todo.reminderTime}</span>
          </div>
        )}
        
        {/* Comments */}
        {todo.comments && (
          <div className={`text-sm mt-2 p-2 rounded ${
            isDark 
              ? 'bg-gray-700 text-gray-300' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            💬 {todo.comments}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-1 flex-shrink-0">
        {todo.deadline && (
          <button
            onClick={addToCalendar}
            className={`p-1 rounded text-xs transition-colors ${
              isDark 
                ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
            }`}
            title="Add to calendar"
          >
            📅
          </button>
        )}
        
        <button
          onClick={() => setIsEditing(true)}
          className={`p-1 rounded text-xs transition-colors ${
            isDark 
              ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-700' 
              : 'text-gray-600 hover:text-yellow-600 hover:bg-gray-100'
          }`}
          title="Edit task"
        >
          ✏️
        </button>
        
        <button
          onClick={onDelete}
          className={`p-1 rounded text-xs transition-colors ${
            isDark 
              ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' 
              : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
          }`}
          title="Delete task"
        >
          🗑️
        </button>
      </div>
    </div>
  );
} 