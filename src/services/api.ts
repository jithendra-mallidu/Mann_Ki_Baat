// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Types
export interface User {
    id: number;
    email: string;
    name?: string;
    created_at: string;
}

export interface Book {
    id: number;
    name: string;
    note_count: number;
    created_at: string;
    updated_at: string;
}

export interface Chapter {
    id: number;
    name: string;
    book_id: number;
    date: string;
    created_at: string;
    updated_at: string;
}

export interface Note {
    id: number;
    content: string;
    chapter_id: number;
    date: string;
    created_at: string;
    updated_at: string;
}

export interface Tag {
    id: number;
    name: string;
    color: string;
}

// Token management
const TOKEN_KEY = 'notekeeper_token';

export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};

// API request helper
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {
            removeToken();
            throw new Error('Unauthorized');
        }
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || 'Request failed');
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null as T;
    }

    return response.json();
}

// Auth API
export const authApi = {
    register: async (email: string, password: string, name?: string): Promise<User> => {
        return apiRequest<User>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
    },

    login: async (email: string, password: string): Promise<{ access_token: string }> => {
        const response = await apiRequest<{ access_token: string }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setToken(response.access_token);
        return response;
    },

    logout: (): void => {
        removeToken();
    },

    getCurrentUser: async (): Promise<User> => {
        return apiRequest<User>('/api/auth/me');
    },
};

// Books API
export const booksApi = {
    getAll: async (): Promise<Book[]> => {
        return apiRequest<Book[]>('/api/books');
    },

    create: async (name: string): Promise<Book> => {
        return apiRequest<Book>('/api/books', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    },

    update: async (id: number, name: string): Promise<Book> => {
        return apiRequest<Book>(`/api/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name }),
        });
    },

    delete: async (id: number): Promise<void> => {
        return apiRequest<void>(`/api/books/${id}`, {
            method: 'DELETE',
        });
    },
};

// Chapters API
export const chaptersApi = {
    getByBook: async (bookId: number): Promise<Chapter[]> => {
        return apiRequest<Chapter[]>(`/api/books/${bookId}/chapters`);
    },

    create: async (bookId: number, name: string): Promise<Chapter> => {
        return apiRequest<Chapter>(`/api/books/${bookId}/chapters`, {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    },

    update: async (id: number, name: string): Promise<Chapter> => {
        return apiRequest<Chapter>(`/api/chapters/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name }),
        });
    },

    delete: async (id: number): Promise<void> => {
        return apiRequest<void>(`/api/chapters/${id}`, {
            method: 'DELETE',
        });
    },
};

// Notes API
export const notesApi = {
    getByChapter: async (chapterId: number): Promise<Note[]> => {
        return apiRequest<Note[]>(`/api/chapters/${chapterId}/notes`);
    },

    create: async (chapterId: number, content: string): Promise<Note> => {
        return apiRequest<Note>(`/api/chapters/${chapterId}/notes`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    },

    update: async (id: number, content: string): Promise<Note> => {
        return apiRequest<Note>(`/api/notes/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ content }),
        });
    },

    delete: async (id: number): Promise<void> => {
        return apiRequest<void>(`/api/notes/${id}`, {
            method: 'DELETE',
        });
    },
};

// Tags API
export const tagsApi = {
    getAll: async (): Promise<Tag[]> => {
        return apiRequest<Tag[]>('/api/tags');
    },

    create: async (name: string, color: string): Promise<Tag> => {
        return apiRequest<Tag>('/api/tags', {
            method: 'POST',
            body: JSON.stringify({ name, color }),
        });
    },

    update: async (id: number, name?: string, color?: string): Promise<Tag> => {
        return apiRequest<Tag>(`/api/tags/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name, color }),
        });
    },

    delete: async (id: number): Promise<void> => {
        return apiRequest<void>(`/api/tags/${id}`, {
            method: 'DELETE',
        });
    },
};
