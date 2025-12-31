import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

export interface ChapterType {
  id: string;
  name: string;
  date: string;
  bookId: string;
}

interface ChaptersPaneProps {
  chapters: ChapterType[];
  selectedChapterId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onAddChapter: () => void;
  onEditChapter: (chapterId: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  selectedBookName: string;
}

export function ChaptersPane({
  chapters,
  selectedChapterId,
  onSelectChapter,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  selectedBookName
}: ChaptersPaneProps) {
  const [hoveredChapterId, setHoveredChapterId] = useState<string | null>(null);

  return (
    <div className="w-80 bg-[#1e1e1e] h-screen flex flex-col border-r border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-white/40 text-xs uppercase tracking-wide mb-0.5">Previous 30 Days</h2>
        <h1 className="text-white text-lg font-medium">{selectedBookName || 'Select a book'}</h1>
      </div>

      {/* Chapters List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {chapters.length === 0 ? (
            <div className="text-white/40 text-sm text-center py-8">
              No chapters yet. Create one to get started.
            </div>
          ) : (
            chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="relative"
                onMouseEnter={() => setHoveredChapterId(chapter.id)}
                onMouseLeave={() => setHoveredChapterId(null)}
              >
                <button
                  onClick={() => onSelectChapter(chapter.id)}
                  className={`w-full p-4 rounded-lg text-left transition-colors relative group ${selectedChapterId === chapter.id
                    ? 'bg-[#2d2d2d] border border-gray-700'
                    : 'bg-[#252525] hover:bg-[#2d2d2d] border border-transparent'
                    }`}
                >
                  <div className="flex items-start justify-between pr-12">
                    <div className="flex-1">
                      <div className="text-white mb-1">{chapter.name}</div>
                      <div className="text-white/40 text-xs">{chapter.date}</div>
                    </div>
                  </div>

                  <div className="absolute right-2 top-4">
                    {hoveredChapterId === chapter.id && (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onEditChapter(chapter.id); }}
                          className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteChapter(chapter.id); }}
                          className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add Chapter Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onAddChapter}
          className="w-full flex items-center justify-center gap-1 py-2.5 px-4 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
        >
          <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
          <span className="text-sm">New Chapter</span>
        </button>
      </div>
    </div>
  );
}
