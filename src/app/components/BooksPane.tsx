import { useState } from 'react';
import { Book, Plus, LogOut, Pencil, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

export interface BookType {
  id: string;
  name: string;
  noteCount: number;
}

interface BooksPaneProps {
  books: BookType[];
  selectedBookId: string | null;
  onSelectBook: (bookId: string) => void;
  onAddBook: () => void;
  onEditBook: (bookId: string) => void;
  onDeleteBook: (bookId: string) => void;
  onLogout?: () => void;
}

export function BooksPane({ books, selectedBookId, onSelectBook, onAddBook, onEditBook, onDeleteBook, onLogout }: BooksPaneProps) {
  const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);

  return (
    <div className="w-64 bg-[#2d2a2e] h-screen flex flex-col border-r border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white/60 text-xs uppercase tracking-wide mb-0.5">Library</h2>
            <h1 className="text-white text-lg font-medium">My Books</h1>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Books List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {books.map((book) => (
            <div
              key={book.id}
              className="relative"
              onMouseEnter={() => setHoveredBookId(book.id)}
              onMouseLeave={() => setHoveredBookId(null)}
            >
              <button
                onClick={() => onSelectBook(book.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${selectedBookId === book.id
                  ? 'bg-[#e9b44c] text-[#2d2a2e]'
                  : 'text-white/80 hover:bg-white/10'
                  }`}
              >
                <Book className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="text-sm truncate">{book.name}</div>
                </div>
                {hoveredBookId === book.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditBook(book.id); }}
                      className={`p-1 rounded hover:bg-black/20 ${selectedBookId === book.id ? 'text-[#2d2a2e]' : 'text-white/60 hover:text-white'}`}
                      title="Edit"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteBook(book.id); }}
                      className={`p-1 rounded hover:bg-black/20 ${selectedBookId === book.id ? 'text-[#2d2a2e]' : 'text-white/60 hover:text-red-400'}`}
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className={`text-xs px-2 py-0.5 rounded ${selectedBookId === book.id
                    ? 'bg-[#2d2a2e] text-white'
                    : 'bg-white/10 text-white/60'
                    }`}>
                    {book.noteCount}
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Add Book Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onAddBook}
          className="w-full flex items-center justify-center gap-1 py-2.5 px-4 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
        >
          <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
          <span className="text-sm">New Book</span>
        </button>
      </div>
    </div>
  );
}
