import { useState, useEffect, useCallback } from 'react';
import { LoginPage } from './components/LoginPage';
import { BooksPane, BookType } from './components/BooksPane';
import { ChaptersPane, ChapterType } from './components/ChaptersPane';
import { NotesPane, NoteType, TagType } from './components/NotesPane';
import { InputModal } from './components/ui/input-modal';
import { SearchModal } from './components/SearchModal';
import {
  isAuthenticated,
  authApi,
  booksApi,
  chaptersApi,
  notesApi,
  tagsApi,
  Book,
  Chapter,
  Note,
  Tag
} from '../services/api';

// Convert API types to component types
const toBookType = (book: Book): BookType => ({
  id: String(book.id),
  name: book.name,
  noteCount: book.note_count,
});

const toChapterType = (chapter: Chapter): ChapterType => ({
  id: String(chapter.id),
  name: chapter.name,
  date: chapter.date,
  bookId: String(chapter.book_id),
});

const toNoteType = (note: Note): NoteType => ({
  id: String(note.id),
  date: note.date,
  content: note.content,
  chapterId: String(note.chapter_id),
});

const toTagType = (tag: Tag): TagType => ({
  id: String(tag.id),
  name: tag.name,
  color: tag.color,
});

// Modal types
type ModalType = 'book' | 'chapter' | 'editBook' | 'editChapter' | null;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [books, setBooks] = useState<BookType[]>([]);
  const [chapters, setChapters] = useState<ChapterType[]>([]);
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          await authApi.getCurrentUser();
          setIsLoggedIn(true);
        } catch {
          setIsLoggedIn(false);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load books when logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadBooks();
      loadTags();
    }
  }, [isLoggedIn]);

  // Load chapters when book is selected
  useEffect(() => {
    if (selectedBookId) {
      loadChapters(Number(selectedBookId));
    } else {
      setChapters([]);
      setSelectedChapterId(null);
    }
  }, [selectedBookId]);

  // Load notes when chapter is selected
  useEffect(() => {
    if (selectedChapterId) {
      loadNotes(Number(selectedChapterId));
    } else {
      setNotes([]);
    }
  }, [selectedChapterId]);

  const loadBooks = async () => {
    try {
      const data = await booksApi.getAll();
      setBooks(data.map(toBookType));
      // Select first book if none selected
      if (data.length > 0 && !selectedBookId) {
        setSelectedBookId(String(data[0].id));
      }
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  };

  const loadChapters = async (bookId: number) => {
    try {
      const data = await chaptersApi.getByBook(bookId);
      setChapters(data.map(toChapterType));
      // Select first chapter if none selected
      if (data.length > 0) {
        setSelectedChapterId(String(data[0].id));
      } else {
        setSelectedChapterId(null);
      }
    } catch (error) {
      console.error('Failed to load chapters:', error);
    }
  };

  const loadNotes = async (chapterId: number) => {
    try {
      const data = await notesApi.getByChapter(chapterId);
      setNotes(data.map(toNoteType));
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const loadTags = async () => {
    try {
      const data = await tagsApi.getAll();
      setTags(data.map(toTagType));
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleLogin = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  const handleLogout = useCallback(() => {
    authApi.logout();
    setIsLoggedIn(false);
    setBooks([]);
    setChapters([]);
    setNotes([]);
    setTags([]);
    setSelectedBookId(null);
    setSelectedChapterId(null);
  }, []);

  // Modal handlers
  const handleOpenBookModal = () => setActiveModal('book');
  const handleOpenChapterModal = () => {
    if (!selectedBookId) {
      alert('Please create and select a book first before adding chapters.');
      return;
    }
    setActiveModal('chapter');
  };
  const handleCloseModal = () => setActiveModal(null);

  const handleCreateBook = async (bookName: string) => {
    try {
      const newBook = await booksApi.create(bookName);
      setBooks(prev => [...prev, toBookType(newBook)]);
      setSelectedBookId(String(newBook.id));
    } catch (error) {
      console.error('Failed to create book:', error);
    }
  };

  const handleCreateChapter = async (chapterName: string) => {
    if (!selectedBookId) return;
    try {
      const newChapter = await chaptersApi.create(Number(selectedBookId), chapterName);
      setChapters(prev => [...prev, toChapterType(newChapter)]);
      setSelectedChapterId(String(newChapter.id));
      loadBooks(); // Refresh to update note count
    } catch (error) {
      console.error('Failed to create chapter:', error);
    }
  };

  const handleAddNote = async (content: string, _date: string) => {
    if (!selectedChapterId) {
      alert('Please create and select a chapter first before adding notes.');
      return;
    }
    try {
      const newNote = await notesApi.create(Number(selectedChapterId), content);
      setNotes(prev => [toNoteType(newNote), ...prev]);
      loadBooks(); // Refresh to update note count
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleAddTag = async (name: string, color: string) => {
    try {
      const newTag = await tagsApi.create(name, color);
      setTags(prev => [...prev, toTagType(newTag)]);
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    try {
      await tagsApi.delete(Number(tagId));
      setTags(prev => prev.filter(tag => tag.id !== tagId));
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  // Edit handlers
  const handleOpenEditBookModal = (bookId: string) => {
    setEditingBookId(bookId);
    setActiveModal('editBook');
  };

  const handleOpenEditChapterModal = (chapterId: string) => {
    setEditingChapterId(chapterId);
    setActiveModal('editChapter');
  };

  const handleEditBook = async (newName: string) => {
    if (!editingBookId) return;
    try {
      const updatedBook = await booksApi.update(Number(editingBookId), newName);
      setBooks(prev => prev.map(book =>
        book.id === editingBookId ? toBookType(updatedBook) : book
      ));
      setEditingBookId(null);
    } catch (error) {
      console.error('Failed to update book:', error);
    }
  };

  const handleEditChapter = async (newName: string) => {
    if (!editingChapterId) return;
    try {
      const updatedChapter = await chaptersApi.update(Number(editingChapterId), newName);
      setChapters(prev => prev.map(chapter =>
        chapter.id === editingChapterId ? toChapterType(updatedChapter) : chapter
      ));
      setEditingChapterId(null);
    } catch (error) {
      console.error('Failed to update chapter:', error);
    }
  };

  const handleEditNote = async (noteId: string, newContent: string) => {
    try {
      const updatedNote = await notesApi.update(Number(noteId), newContent);
      setNotes(prev => prev.map(note =>
        note.id === noteId ? toNoteType(updatedNote) : note
      ));
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  // Delete handlers
  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book? All chapters and notes will be deleted.')) return;
    try {
      await booksApi.delete(Number(bookId));
      setBooks(prev => prev.filter(book => book.id !== bookId));
      if (selectedBookId === bookId) {
        setSelectedBookId(null);
      }
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter? All notes will be deleted.')) return;
    try {
      await chaptersApi.delete(Number(chapterId));
      setChapters(prev => prev.filter(chapter => chapter.id !== chapterId));
      if (selectedChapterId === chapterId) {
        setSelectedChapterId(null);
      }
      loadBooks(); // Refresh note counts
    } catch (error) {
      console.error('Failed to delete chapter:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await notesApi.delete(Number(noteId));
      setNotes(prev => prev.filter(note => note.id !== noteId));
      loadBooks(); // Refresh note counts
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  // Search handler
  const handleSelectSearchResult = async (bookId: number, chapterId: number) => {
    // Navigate to the selected book and chapter
    setSelectedBookId(String(bookId));
    setSelectedChapterId(String(chapterId));

    // Load chapters if not already loaded for this book
    if (selectedBookId !== String(bookId)) {
      await loadChapters(bookId);
    }

    // Load notes for the selected chapter
    if (selectedChapterId !== String(chapterId)) {
      await loadNotes(chapterId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a1a1a]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const selectedBook = books.find(b => b.id === selectedBookId);
  const selectedChapter = chapters.find(c => c.id === selectedChapterId);
  const filteredChapters = chapters.filter(c => c.bookId === selectedBookId);
  const filteredNotes = notes.filter(n => n.chapterId === selectedChapterId);

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <BooksPane
          books={books}
          selectedBookId={selectedBookId}
          onSelectBook={setSelectedBookId}
          onAddBook={handleOpenBookModal}
          onEditBook={handleOpenEditBookModal}
          onDeleteBook={handleDeleteBook}
          onLogout={handleLogout}
        />
        <ChaptersPane
          chapters={filteredChapters}
          selectedChapterId={selectedChapterId}
          onSelectChapter={setSelectedChapterId}
          onAddChapter={handleOpenChapterModal}
          onEditChapter={handleOpenEditChapterModal}
          onDeleteChapter={handleDeleteChapter}
          selectedBookName={selectedBook?.name || ''}
        />
        <NotesPane
          notes={filteredNotes}
          tags={tags}
          selectedChapterName={selectedChapter?.name || ''}
          onAddNote={handleAddNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onSearch={() => setIsSearchOpen(true)}
        />
      </div>

      {/* Create Book Modal */}
      <InputModal
        isOpen={activeModal === 'book'}
        onClose={handleCloseModal}
        onSubmit={handleCreateBook}
        title="Create New Book"
        placeholder="Enter book name..."
        submitText="Create Book"
      />

      {/* Create Chapter Modal */}
      <InputModal
        isOpen={activeModal === 'chapter'}
        onClose={handleCloseModal}
        onSubmit={handleCreateChapter}
        title="Create New Chapter"
        placeholder="Enter chapter name..."
        submitText="Create Chapter"
      />

      {/* Edit Book Modal */}
      <InputModal
        isOpen={activeModal === 'editBook'}
        onClose={() => { handleCloseModal(); setEditingBookId(null); }}
        onSubmit={handleEditBook}
        title="Edit Book"
        placeholder="Enter book name..."
        submitText="Save"
        initialValue={books.find(b => b.id === editingBookId)?.name || ''}
      />

      {/* Edit Chapter Modal */}
      <InputModal
        isOpen={activeModal === 'editChapter'}
        onClose={() => { handleCloseModal(); setEditingChapterId(null); }}
        onSubmit={handleEditChapter}
        title="Edit Chapter"
        placeholder="Enter chapter name..."
        submitText="Save"
        initialValue={chapters.find(c => c.id === editingChapterId)?.name || ''}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNote={handleSelectSearchResult}
      />
    </>
  );
}
