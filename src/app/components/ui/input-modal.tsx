import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (value: string) => void;
    title: string;
    placeholder?: string;
    submitText?: string;
    initialValue?: string;
}

export function InputModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    placeholder = 'Enter value...',
    submitText = 'Create',
    initialValue = '',
}: InputModalProps) {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setValue(initialValue);
            // Focus input when modal opens
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, initialValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onSubmit(value.trim());
            setValue('');
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onKeyDown={handleKeyDown}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#2d2a2e] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <h2 className="text-white text-lg font-medium">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-5">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        className="w-full h-12 bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/40 rounded-xl focus:ring-2 focus:ring-[#e9b44c] focus:border-transparent"
                    />

                    {/* Footer */}
                    <div className="flex justify-end gap-3 mt-5">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:text-white px-5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!value.trim()}
                            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-5 disabled:opacity-50"
                        >
                            {submitText}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
