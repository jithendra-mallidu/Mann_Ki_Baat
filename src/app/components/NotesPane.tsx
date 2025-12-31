import { useState } from 'react';
import { Plus, X, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { NoteEditorModal } from './ui/NoteEditorModal';

export interface NoteType {
  id: string;
  date: string;
  content: string;
  chapterId: string;
}

export interface TagType {
  id: string;
  name: string;
  color: string;
}

interface NotesPaneProps {
  notes: NoteType[];
  tags: TagType[];
  selectedChapterName: string;
  onAddNote: (content: string, date: string) => void;
  onEditNote: (noteId: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
  onAddTag: (name: string, color: string) => void;
  onRemoveTag: (tagId: string) => void;
  onSearch?: () => void;
}

const TAG_COLORS = [
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Red', class: 'bg-red-500' },
  { name: 'Yellow', class: 'bg-yellow-500' },
  { name: 'Teal', class: 'bg-teal-500' },
  { name: 'Purple', class: 'bg-purple-500' },
  { name: 'Green', class: 'bg-green-500' },
];

export function NotesPane({
  notes,
  tags,
  selectedChapterName,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onAddTag,
  onRemoveTag,
  onSearch
}: NotesPaneProps) {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].class);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const handleAddNoteFromModal = (content: string) => {
    if (content.trim()) {
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      onAddNote(content, dateStr);
    }
  };

  const handleEditNoteFromModal = (content: string) => {
    if (content.trim() && editingNoteId) {
      onEditNote(editingNoteId, content);
      setEditingNoteId(null);
    }
  };

  const openEditModal = (noteId: string) => {
    setEditingNoteId(noteId);
    setIsEditorModalOpen(true);
  };

  const closeEditorModal = () => {
    setIsEditorModalOpen(false);
    setEditingNoteId(null);
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      onAddTag(newTagName, selectedColor);
      setNewTagName('');
      setIsAddingTag(false);
    }
  };

  return (
    <div className="flex-1 bg-[#1a1a1a] h-screen flex flex-col">
      {/* Header with date */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-white/40 text-xs uppercase tracking-wide">
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric'
            })}
          </h2>
          {onSearch && (
            <button
              onClick={onSearch}
              className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Search notes (Cmd+K)"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
        <h1 className="text-white text-lg font-medium">
          {selectedChapterName || 'Select a chapter'}
        </h1>
      </div>

      {/* Tags Section */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2 flex-wrap">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 bg-[#252525] rounded-lg px-3 py-1.5 hover:bg-[#2d2d2d] group transition-colors"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${tag.color}`} />
              <span className="text-white text-sm">{tag.name}</span>
              <button
                onClick={() => onRemoveTag(tag.id)}
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {isAddingTag ? (
            <div className="flex items-center gap-2 bg-[#252525] rounded-lg p-2">
              <Input
                type="text"
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="h-7 w-32 bg-[#1a1a1a] border-gray-700 text-white text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                autoFocus
              />
              <div className="flex gap-1">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.class)}
                    className={`w-5 h-5 rounded-full ${color.class} ${selectedColor === color.class ? 'ring-2 ring-white' : ''
                      }`}
                    title={color.name}
                  />
                ))}
              </div>
              <Button
                size="sm"
                onClick={handleAddTag}
                className="h-7 bg-green-600 hover:bg-green-700 text-white"
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAddingTag(false)}
                className="h-7 text-white hover:bg-[#1a1a1a]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingTag(true)}
              className="flex items-center gap-0.5 text-white/50 hover:text-white transition-colors text-sm"
            >
              <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
              <span>Add Tag</span>
            </button>
          )}
        </div>
      </div>



      {/* Note Editor Modal */}
      <NoteEditorModal
        isOpen={isEditorModalOpen}
        onClose={closeEditorModal}
        onSubmit={editingNoteId ? handleEditNoteFromModal : handleAddNoteFromModal}
        initialContent={editingNoteId ? notes.find(n => n.id === editingNoteId)?.content || '' : ''}
      />

      {/* Scrollable Notes Timeline */}
      <ScrollArea className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Timeline with vertical line */}
          <div className="relative pl-8 space-y-6">
            {/* Vertical Timeline Line */}
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-800"></div>

            {notes.length === 0 ? (
              <div className="text-white/40 text-sm text-center py-8">
                No notes yet. Start writing to capture your thoughts.
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={`relative ${hoveredNoteId === note.id ? 'z-10' : 'z-0'}`}
                  onMouseEnter={() => setHoveredNoteId(note.id)}
                  onMouseLeave={() => setHoveredNoteId(null)}
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-7 top-3 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[#1a1a1a]"></div>

                  {/* Note Card */}
                  <div
                    className={`bg-[#252525] rounded-lg p-4 border border-gray-800 transition-all duration-200 ${hoveredNoteId === note.id ? 'shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/30' : ''
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-blue-400 text-sm">{note.date}</div>
                      {hoveredNoteId === note.id && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(note.id)}
                            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteNote(note.id)}
                            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Note Content - Expand on Hover */}
                    {hoveredNoteId === note.id ? (
                      <div className="text-white/80 text-sm max-h-[300px] overflow-y-auto">
                        <div
                          className="prose prose-invert prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: note.content }}
                        />
                      </div>
                    ) : (
                      <div className="text-white/80 text-sm max-h-20 overflow-hidden">
                        <div
                          className="line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: note.content.replace(/<[^>]*>/g, ' ').substring(0, 200) }}
                        />
                      </div>
                    )}

                    {hoveredNoteId !== note.id && note.content.length > 150 && (
                      <div className="text-white/40 text-xs mt-2 italic">
                        Hover for details
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => setIsEditorModalOpen(true)}
          className="w-full flex items-center justify-center gap-1 py-2.5 px-4 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
        >
          <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
          <span className="text-sm">New Note</span>
        </button>
      </div>
    </div>
  );
}