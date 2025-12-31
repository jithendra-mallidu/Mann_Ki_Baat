import { useState, useEffect, useRef } from 'react';
import { Search, FileText, Book as BookIcon, FolderOpen, X } from 'lucide-react';
import { notesApi, SearchResult } from '../../services/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (bookId: number, chapterId: number) => void;
}

export function SearchModal({ isOpen, onClose, onSelectNote }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchNotes = async () => {
      if (!query.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);
      try {
        const searchResults = await notesApi.search(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchNotes, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    onSelectNote(result.book_id, result.chapter_id);
    onClose();
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const handleClose = () => {
    onClose();
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const stripHtml = (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getTruncatedContent = (content: string, maxLength: number = 120): string => {
    const plainText = stripHtml(content);
    if (plainText.length <= maxLength) return plainText;

    const lowerText = plainText.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const queryIndex = lowerText.indexOf(lowerQuery);

    if (queryIndex !== -1) {
      const start = Math.max(0, queryIndex - 40);
      const end = Math.min(plainText.length, queryIndex + query.length + 80);
      const excerpt = plainText.substring(start, end);
      return (start > 0 ? '...' : '') + excerpt + (end < plainText.length ? '...' : '');
    }

    return plainText.substring(0, maxLength) + '...';
  };

  if (!isOpen) return null;

  const showResults = hasSearched && (results.length > 0 || !isLoading);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
        <div className="bg-[#2d2a2e] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white text-xl font-medium">Search Notes</h2>
              <button
                onClick={handleClose}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search across all your notes..."
                className="w-full bg-[#1e1e1e] text-white placeholder-white/40 pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Results */}
          {showResults && (
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-white/40">
                  Searching...
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="mx-auto h-12 w-12 text-white/20 mb-3" />
                  <p className="text-white/60 text-sm">No notes found</p>
                  <p className="text-white/40 text-xs mt-1">
                    Try a different search term
                  </p>
                </div>
              ) : (
                <div className="p-4">
                  <div className="text-xs text-white/40 mb-3 px-2">
                    {results.length} result{results.length === 1 ? '' : 's'}
                  </div>
                  <div className="space-y-2">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        className="w-full text-left p-4 rounded-lg bg-[#252525] hover:bg-[#2d2d2d] border border-transparent hover:border-white/10 transition-all group"
                      >
                        {/* Note content preview */}
                        <div className="text-sm text-white mb-3 line-clamp-2">
                          {getTruncatedContent(result.content)}
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-xs text-white/50">
                          <div className="flex items-center gap-1.5">
                            <BookIcon className="h-3 w-3" />
                            <span>{result.book_name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FolderOpen className="h-3 w-3" />
                            <span>{result.chapter_name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-3 w-3" />
                            <span>{result.date}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer hint when no search yet */}
          {!hasSearched && (
            <div className="p-6 text-center text-white/40 text-sm border-t border-white/10">
              <p>Start typing to search your notes</p>
              <p className="text-xs text-white/30 mt-1">
                Search for exact phrases or keywords within your notes
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
