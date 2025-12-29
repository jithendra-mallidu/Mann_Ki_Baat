import { useState, useEffect, useCallback } from 'react';
import { LoginPage } from './components/LoginPage';
import { BooksPane, BookType } from './components/BooksPane';
import { ChaptersPane, ChapterType } from './components/ChaptersPane';
import { NotesPane, NoteType, TagType } from './components/NotesPane';
import { InputModal } from './components/ui/input-modal';
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
type ModalType = 'book' | 'chapter' | null;

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
          onLogout={handleLogout}
        />
        <ChaptersPane
          chapters={filteredChapters}
          selectedChapterId={selectedChapterId}
          onSelectChapter={setSelectedChapterId}
          onAddChapter={handleOpenChapterModal}
          selectedBookName={selectedBook?.name || ''}
        />
        <NotesPane
          notes={filteredNotes}
          tags={tags}
          selectedChapterName={selectedChapter?.name || ''}
          onAddNote={handleAddNote}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
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
    </>
  );
}
