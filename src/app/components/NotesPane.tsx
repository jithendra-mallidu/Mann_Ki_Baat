import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';

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
  onAddTag: (name: string, color: string) => void;
  onRemoveTag: (tagId: string) => void;
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
  onAddTag,
  onRemoveTag
}: NotesPaneProps) {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].class);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      onAddNote(newNoteContent, dateStr);
      setNewNoteContent('');
    }
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
        <h2 className="text-white/40 text-xs uppercase tracking-wide mb-0.5">
          {new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
          })}
        </h2>
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

      {/* Notes Timeline */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-3xl">
          {/* New Note Input */}
          <div className="mb-6">
            <div className="bg-[#252525] rounded-lg p-4 border border-gray-800">
              <div className="text-white/60 text-sm mb-3">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <Textarea
                placeholder="Write your notes here..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="bg-[#1a1a1a] border-gray-700 text-white min-h-[120px] resize-none"
              />
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={handleAddNote}
                  disabled={!newNoteContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Note
                </Button>
              </div>
            </div>
          </div>

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
                  className="relative"
                  onMouseEnter={() => setHoveredNoteId(note.id)}
                  onMouseLeave={() => setHoveredNoteId(null)}
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-7 top-3 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[#1a1a1a]"></div>

                  {/* Note Card */}
                  <div
                    className={`bg-[#252525] rounded-lg p-4 border border-gray-800 transition-all duration-200 ${hoveredNoteId === note.id ? 'shadow-lg shadow-blue-500/20' : ''
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-blue-400 text-sm">{note.date}</div>
                    </div>

                    {/* Note Content - Expand on Hover */}
                    <div
                      className={`text-white/80 text-sm overflow-hidden transition-all duration-300 ${hoveredNoteId === note.id
                        ? 'max-h-[1000px]'
                        : 'max-h-20 line-clamp-3'
                        }`}
                    >
                      <pre className="whitespace-pre-wrap font-sans">{note.content}</pre>
                    </div>

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
    </div>
  );
}