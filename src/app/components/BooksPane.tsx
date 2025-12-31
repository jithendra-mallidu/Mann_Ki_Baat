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
          {books.map((book) => {
            const isSelected = selectedBookId === book.id;
            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book.id)}
                className={`group w-full flex items-center px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${isSelected
                  ? 'bg-[#e9b44c] text-[#2d2a2e]'
                  : 'text-white/80 hover:bg-white/10'
                  }`}
                title={book.name}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectBook(book.id); }}
              >
                {/* Book icon and name - takes available space */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Book className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate">
                    {book.name}
                  </span>
                </div>

                {/* Right side: note count (default) and action buttons (on hover) */}
                <div className="flex-shrink-0 ml-2">
                  {/* Note count - visible by default */}
                  <div
                    className={`note-count text-xs px-2 py-0.5 rounded ${isSelected
                      ? 'bg-[#2d2a2e] text-white'
                      : 'bg-white/10 text-white/60'
                      }`}
                    style={{ display: 'block' }}
                  >
                    {book.noteCount}
                  </div>

                  {/* Action buttons - hidden by default */}
                  <div
                    className="action-buttons flex gap-1"
                    style={{ display: 'none' }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditBook(book.id); }}
                      className={`p-1 rounded hover:bg-black/20 transition-colors ${isSelected ? 'text-[#2d2a2e]' : 'text-white/60 hover:text-white'}`}
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteBook(book.id); }}
                      className={`p-1 rounded hover:bg-black/20 transition-colors ${isSelected ? 'text-[#2d2a2e]' : 'text-white/60 hover:text-red-400'}`}
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
