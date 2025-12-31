import { useState, useEffect, useRef } from 'react';
import {
    X,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Subscript,
    Superscript,
    AArrowUp,
    AArrowDown,
    Type,
    Palette,
    Highlighter,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    Indent,
    Outdent,
    RemoveFormatting,
    Table
} from 'lucide-react';
import { Button } from './button';

interface NoteEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (content: string) => void;
    initialContent?: string;
}

const FONTS = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Courier New', value: '"Courier New", monospace' },
    { name: 'Times New Roman', value: '"Times New Roman", serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
];

const TEXT_COLORS = [
    { name: 'White', value: '#ffffff' },
    { name: 'Light Gray', value: '#d1d5db' },
    { name: 'Gray', value: '#9ca3af' },
    { name: 'Dark Gray', value: '#4b5563' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Cyan', value: '#06b6d4' },
];

const HIGHLIGHT_COLORS = [
    { name: 'None', value: 'transparent' },
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Lime', value: '#bef264' },
    { name: 'Cyan', value: '#67e8f9' },
    { name: 'Pink', value: '#f9a8d4' },
    { name: 'Orange', value: '#fed7aa' },
    { name: 'Purple', value: '#d8b4fe' },
    { name: 'Red', value: '#fca5a5' },
    { name: 'Green', value: '#86efac' },
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

export function NoteEditorModal({
    isOpen,
    onClose,
    onSubmit,
    initialContent = '',
}: NoteEditorModalProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [currentFont, setCurrentFont] = useState(FONTS[0].value);
    const [currentFontSize, setCurrentFontSize] = useState(16);
    const [showFontPicker, setShowFontPicker] = useState(false);
    const [showFontSizePicker, setShowFontSizePicker] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);

    // Table context menu state
    const [tableContextMenu, setTableContextMenu] = useState<{
        x: number;
        y: number;
        cell: HTMLTableCellElement;
    } | null>(null);

    // Column resize state
    const resizeRef = useRef<{
        isResizing: boolean;
        startX: number;
        startWidth: number;
        cell: HTMLTableCellElement | null;
        colIndex: number;
    }>({
        isResizing: false,
        startX: 0,
        startWidth: 0,
        cell: null,
        colIndex: -1
    });

    useEffect(() => {
        if (isOpen && editorRef.current) {
            editorRef.current.innerHTML = initialContent;
            setTimeout(() => editorRef.current?.focus(), 100);
        }
    }, [isOpen, initialContent]);

    useEffect(() => {
        const handleClickOutside = () => {
            setShowFontPicker(false);
            setShowFontSizePicker(false);
            setShowColorPicker(false);
            setShowHighlightPicker(false);
            setTableContextMenu(null);
        };
        if (showFontPicker || showFontSizePicker || showColorPicker || showHighlightPicker || tableContextMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showFontPicker, showFontSizePicker, showColorPicker, showHighlightPicker, tableContextMenu]);

    // Column resize handlers
    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const cell = target.closest('td, th') as HTMLTableCellElement;
            if (!cell || !editorRef.current?.contains(cell)) return;

            // Check if click is near the right edge of the cell (within 8px)
            const rect = cell.getBoundingClientRect();
            const isNearRightEdge = e.clientX >= rect.right - 8;

            if (isNearRightEdge) {
                e.preventDefault();
                resizeRef.current = {
                    isResizing: true,
                    startX: e.clientX,
                    startWidth: cell.offsetWidth,
                    cell: cell,
                    colIndex: cell.cellIndex
                };
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!resizeRef.current.isResizing || !resizeRef.current.cell) return;

            const diff = e.clientX - resizeRef.current.startX;
            const newWidth = Math.max(50, resizeRef.current.startWidth + diff);

            // Apply width to all cells in this column
            const table = resizeRef.current.cell.closest('table');
            if (table) {
                const colIndex = resizeRef.current.colIndex;
                Array.from(table.rows).forEach(row => {
                    if (row.cells[colIndex]) {
                        (row.cells[colIndex] as HTMLTableCellElement).style.width = `${newWidth}px`;
                    }
                });
            }
        };

        const handleMouseUp = () => {
            if (resizeRef.current.isResizing) {
                resizeRef.current.isResizing = false;
                resizeRef.current.cell = null;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    // Text formatting
    const handleBold = () => execCommand('bold');
    const handleItalic = () => execCommand('italic');
    const handleUnderline = () => execCommand('underline');
    const handleStrikethrough = () => execCommand('strikethrough');
    const handleSubscript = () => execCommand('subscript');
    const handleSuperscript = () => execCommand('superscript');

    // Alignment
    const handleAlignLeft = () => execCommand('justifyLeft');
    const handleAlignCenter = () => execCommand('justifyCenter');
    const handleAlignRight = () => execCommand('justifyRight');
    const handleAlignJustify = () => execCommand('justifyFull');

    // Lists - Custom implementation since execCommand is unreliable
    const handleBulletList = () => {
        if (!editorRef.current) return;
        editorRef.current.focus();

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            // No selection, insert at end
            const ul = document.createElement('ul');
            const li = document.createElement('li');
            li.innerHTML = '<br>';
            ul.appendChild(li);
            editorRef.current.appendChild(ul);

            // Place cursor in the li
            const range = document.createRange();
            range.setStart(li, 0);
            range.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(range);
        } else {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString();

            const ul = document.createElement('ul');
            const li = document.createElement('li');
            li.textContent = selectedText || '';
            if (!selectedText) li.innerHTML = '<br>';
            ul.appendChild(li);

            range.deleteContents();
            range.insertNode(ul);

            // Place cursor in the li
            const newRange = document.createRange();
            newRange.selectNodeContents(li);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    };

    const handleNumberedList = () => {
        if (!editorRef.current) return;
        editorRef.current.focus();

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            // No selection, insert at end
            const ol = document.createElement('ol');
            const li = document.createElement('li');
            li.innerHTML = '<br>';
            ol.appendChild(li);
            editorRef.current.appendChild(ol);

            // Place cursor in the li
            const range = document.createRange();
            range.setStart(li, 0);
            range.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(range);
        } else {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString();

            const ol = document.createElement('ol');
            const li = document.createElement('li');
            li.textContent = selectedText || '';
            if (!selectedText) li.innerHTML = '<br>';
            ol.appendChild(li);

            range.deleteContents();
            range.insertNode(ol);

            // Place cursor in the li
            const newRange = document.createRange();
            newRange.selectNodeContents(li);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    };

    // Indentation
    const handleIndent = () => execCommand('indent');
    const handleOutdent = () => execCommand('outdent');

    // Table insertion
    const handleInsertTable = () => {
        if (!editorRef.current) return;
        editorRef.current.focus();

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // Create header row
        const headerRow = document.createElement('tr');
        for (let i = 0; i < 3; i++) {
            const th = document.createElement('th');
            th.innerHTML = `Header ${i + 1}`;
            headerRow.appendChild(th);
        }
        thead.appendChild(headerRow);

        // Create 2 body rows
        for (let r = 0; r < 2; r++) {
            const row = document.createElement('tr');
            for (let c = 0; c < 3; c++) {
                const td = document.createElement('td');
                td.innerHTML = '<br>';
                row.appendChild(td);
            }
            tbody.appendChild(row);
        }

        table.appendChild(thead);
        table.appendChild(tbody);

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(table);

            // Add a line break after the table for easier continued editing
            const br = document.createElement('br');
            table.parentNode?.insertBefore(br, table.nextSibling);
        } else {
            editorRef.current.appendChild(table);
        }
    };

    // Handle right-click on table with smart positioning
    const handleTableContextMenu = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const cell = target.closest('td, th') as HTMLTableCellElement;
        if (cell) {
            e.preventDefault();

            // Menu dimensions (approximate)
            const menuWidth = 180;
            const menuHeight = 280;

            // Calculate position with viewport bounds checking
            let x = e.clientX;
            let y = e.clientY;

            // Check if menu would go off-screen on the right
            if (x + menuWidth > window.innerWidth) {
                x = e.clientX - menuWidth;
            }

            // Check if menu would go off-screen at the bottom
            if (y + menuHeight > window.innerHeight) {
                y = e.clientY - menuHeight;
            }

            // Ensure menu doesn't go off left or top edge
            x = Math.max(10, x);
            y = Math.max(10, y);

            setTableContextMenu({
                x,
                y,
                cell: cell
            });
        }
    };

    // Table manipulation functions
    const addRowAbove = () => {
        if (!tableContextMenu) return;
        const row = tableContextMenu.cell.parentElement as HTMLTableRowElement;
        const newRow = row.cloneNode(true) as HTMLTableRowElement;
        Array.from(newRow.cells).forEach(cell => { cell.innerHTML = '<br>'; });
        row.parentNode?.insertBefore(newRow, row);
        setTableContextMenu(null);
    };

    const addRowBelow = () => {
        if (!tableContextMenu) return;
        const row = tableContextMenu.cell.parentElement as HTMLTableRowElement;
        const newRow = row.cloneNode(true) as HTMLTableRowElement;
        Array.from(newRow.cells).forEach(cell => { cell.innerHTML = '<br>'; });
        row.parentNode?.insertBefore(newRow, row.nextSibling);
        setTableContextMenu(null);
    };

    const addColumnLeft = () => {
        if (!tableContextMenu) return;
        const cellIndex = tableContextMenu.cell.cellIndex;
        const table = tableContextMenu.cell.closest('table');
        if (!table) return;

        Array.from(table.rows).forEach(row => {
            const newCell = row.cells[0]?.tagName === 'TH' && row.rowIndex === 0
                ? document.createElement('th')
                : document.createElement('td');
            newCell.innerHTML = row.rowIndex === 0 && row.cells[0]?.tagName === 'TH' ? 'Header' : '<br>';
            row.insertBefore(newCell, row.cells[cellIndex]);
        });
        setTableContextMenu(null);
    };

    const addColumnRight = () => {
        if (!tableContextMenu) return;
        const cellIndex = tableContextMenu.cell.cellIndex;
        const table = tableContextMenu.cell.closest('table');
        if (!table) return;

        Array.from(table.rows).forEach(row => {
            const newCell = row.cells[0]?.tagName === 'TH' && row.rowIndex === 0
                ? document.createElement('th')
                : document.createElement('td');
            newCell.innerHTML = row.rowIndex === 0 && row.cells[0]?.tagName === 'TH' ? 'Header' : '<br>';
            row.insertBefore(newCell, row.cells[cellIndex + 1] || null);
        });
        setTableContextMenu(null);
    };

    const deleteRow = () => {
        if (!tableContextMenu) return;
        const row = tableContextMenu.cell.parentElement as HTMLTableRowElement;
        const table = row.closest('table');
        if (table && table.rows.length > 1) {
            row.remove();
        }
        setTableContextMenu(null);
    };

    const deleteColumn = () => {
        if (!tableContextMenu) return;
        const cellIndex = tableContextMenu.cell.cellIndex;
        const table = tableContextMenu.cell.closest('table');
        if (!table) return;

        const hasMultipleColumns = table.rows[0]?.cells.length > 1;
        if (hasMultipleColumns) {
            Array.from(table.rows).forEach(row => {
                if (row.cells[cellIndex]) {
                    row.cells[cellIndex].remove();
                }
            });
        }
        setTableContextMenu(null);
    };

    const deleteTable = () => {
        if (!tableContextMenu) return;
        const table = tableContextMenu.cell.closest('table');
        table?.remove();
        setTableContextMenu(null);
    };

    // Clear formatting
    const handleClearFormatting = () => execCommand('removeFormat');

    const handleFontSizeChange = (increase: boolean) => {
        const currentIndex = FONT_SIZES.indexOf(currentFontSize);
        let newIndex = increase ? currentIndex + 1 : currentIndex - 1;
        newIndex = Math.max(0, Math.min(newIndex, FONT_SIZES.length - 1));
        const newSize = FONT_SIZES[newIndex];
        setCurrentFontSize(newSize);
        applyFontSize(newSize);
    };

    const applyFontSize = (size: number) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            // No text selected - just update the default for new text
            return;
        }

        // Apply to selected text only
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;

        try {
            range.surroundContents(span);
        } catch {
            // If selection spans multiple elements, use execCommand fallback
            execCommand('fontSize', '7');
            const fontElements = editorRef.current?.querySelectorAll('font[size="7"]');
            fontElements?.forEach((el) => {
                (el as HTMLElement).removeAttribute('size');
                (el as HTMLElement).style.fontSize = `${size}px`;
            });
        }

        editorRef.current?.focus();
    };

    const handleFontSizeSelect = (size: number) => {
        setCurrentFontSize(size);
        applyFontSize(size);
        setShowFontSizePicker(false);
    };

    const handleFontChange = (fontValue: string) => {
        setCurrentFont(fontValue);
        execCommand('fontName', fontValue);
        setShowFontPicker(false);
    };

    const handleColorChange = (color: string) => {
        execCommand('foreColor', color);
        setShowColorPicker(false);
    };

    const handleHighlightChange = (color: string) => {
        if (color === 'transparent') {
            execCommand('removeFormat');
        } else {
            execCommand('hiliteColor', color);
        }
        setShowHighlightPicker(false);
    };

    const handleSubmit = () => {
        const content = editorRef.current?.innerHTML || '';
        if (content.trim() && content !== '<br>') {
            onSubmit(content);
            if (editorRef.current) {
                editorRef.current.innerHTML = '';
            }
            onClose();
        }
    };

    const closeAllPickers = () => {
        setShowFontPicker(false);
        setShowFontSizePicker(false);
        setShowColorPicker(false);
        setShowHighlightPicker(false);
    };

    const ToolbarButton = ({
        onClick,
        title,
        children
    }: {
        onClick: () => void;
        title: string;
        children: React.ReactNode
    }) => (
        <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title={title}
        >
            {children}
        </button>
    );

    const Divider = () => <div className="w-px h-6 bg-white/20 mx-1" />;

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onKeyDown={handleKeyDown}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#2d2a2e] rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-white text-lg font-medium">Write Note</h2>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Formatting Toolbar - Row 1 */}
                <div className="flex items-center gap-0.5 px-3 py-2 border-b border-white/10 bg-[#252525] flex-wrap">
                    {/* Font Family Picker */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                closeAllPickers();
                                setShowFontPicker(!showFontPicker);
                            }}
                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors min-w-[120px]"
                            title="Font family"
                        >
                            <Type className="w-4 h-4" />
                            <span className="text-sm truncate">
                                {FONTS.find(f => f.value === currentFont)?.name || 'Inter'}
                            </span>
                        </button>

                        {showFontPicker && (
                            <div
                                className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg py-1 min-w-[160px] z-20 shadow-xl max-h-[300px] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {FONTS.map((font) => (
                                    <button
                                        key={font.name}
                                        onClick={() => handleFontChange(font.value)}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${currentFont === font.value ? 'text-blue-400 bg-white/5' : 'text-white/80'
                                            }`}
                                        style={{ fontFamily: font.value }}
                                    >
                                        {font.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Divider />

                    {/* Font Size Picker */}
                    <div className="relative flex items-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                closeAllPickers();
                                setShowFontSizePicker(!showFontSizePicker);
                            }}
                            className="px-2 py-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors min-w-[50px] text-center text-sm"
                            title="Font size"
                        >
                            {currentFontSize}
                        </button>

                        {showFontSizePicker && (
                            <div
                                className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg py-1 min-w-[60px] z-20 shadow-xl max-h-[200px] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {FONT_SIZES.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => handleFontSizeSelect(size)}
                                        className={`w-full text-center px-3 py-1.5 text-sm hover:bg-white/10 transition-colors ${currentFontSize === size ? 'text-blue-400 bg-white/5' : 'text-white/80'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        )}

                        <ToolbarButton onClick={() => handleFontSizeChange(true)} title="Increase font size">
                            <AArrowUp className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton onClick={() => handleFontSizeChange(false)} title="Decrease font size">
                            <AArrowDown className="w-4 h-4" />
                        </ToolbarButton>
                    </div>

                    <Divider />

                    {/* Text Color */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                closeAllPickers();
                                setShowColorPicker(!showColorPicker);
                            }}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                            title="Text color"
                        >
                            <Palette className="w-4 h-4" />
                        </button>

                        {showColorPicker && (
                            <div
                                className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg p-2 z-20 shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="grid grid-cols-5 gap-1">
                                    {TEXT_COLORS.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => handleColorChange(color.value)}
                                            className="w-7 h-7 rounded hover:scale-110 transition-transform border border-white/20"
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Highlight Color */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                closeAllPickers();
                                setShowHighlightPicker(!showHighlightPicker);
                            }}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                            title="Highlight color"
                        >
                            <Highlighter className="w-4 h-4" />
                        </button>

                        {showHighlightPicker && (
                            <div
                                className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg p-2 z-20 shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="grid grid-cols-3 gap-1">
                                    {HIGHLIGHT_COLORS.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => handleHighlightChange(color.value)}
                                            className={`w-7 h-7 rounded hover:scale-110 transition-transform border ${color.value === 'transparent'
                                                ? 'border-white/40 bg-transparent relative after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:via-transparent after:to-red-500/50'
                                                : 'border-white/20'
                                                }`}
                                            style={{ backgroundColor: color.value !== 'transparent' ? color.value : undefined }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Divider />

                    {/* Alignment */}
                    <ToolbarButton onClick={handleAlignLeft} title="Align left">
                        <AlignLeft className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={handleAlignCenter} title="Align center">
                        <AlignCenter className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={handleAlignRight} title="Align right">
                        <AlignRight className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={handleAlignJustify} title="Justify">
                        <AlignJustify className="w-4 h-4" />
                    </ToolbarButton>

                    <Divider />

                    {/* Indentation */}
                    <ToolbarButton onClick={handleOutdent} title="Decrease indent">
                        <Outdent className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={handleIndent} title="Increase indent">
                        <Indent className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* Formatting Toolbar - Row 2 */}
                <div className="flex items-center gap-0.5 px-3 py-2 border-b border-white/10 bg-[#252525] flex-wrap">
                    {/* Basic Formatting */}
                    <ToolbarButton onClick={handleBold} title="Bold (Ctrl+B)">
                        <Bold className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={handleItalic} title="Italic (Ctrl+I)">
                        <Italic className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={handleUnderline} title="Underline (Ctrl+U)">
                        <Underline className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={handleStrikethrough} title="Strikethrough">
                        <Strikethrough className="w-4 h-4" />
                    </ToolbarButton>

                    <Divider />

                    {/* Subscript/Superscript */}
                    <ToolbarButton onClick={handleSubscript} title="Subscript">
                        <Subscript className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={handleSuperscript} title="Superscript">
                        <Superscript className="w-4 h-4" />
                    </ToolbarButton>

                    <Divider />

                    {/* Lists */}
                    <ToolbarButton onClick={handleBulletList} title="Bullet list">
                        <List className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={handleNumberedList} title="Numbered list">
                        <ListOrdered className="w-4 h-4" />
                    </ToolbarButton>

                    <Divider />

                    {/* Table */}
                    <ToolbarButton onClick={handleInsertTable} title="Insert table">
                        <Table className="w-4 h-4" />
                    </ToolbarButton>

                    <Divider />

                    {/* Clear Formatting */}
                    <ToolbarButton onClick={handleClearFormatting} title="Clear formatting">
                        <RemoveFormatting className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* Editor Area */}
                <div className="flex-1 overflow-hidden p-6">
                    <div
                        ref={editorRef}
                        contentEditable
                        className="w-full h-full min-h-[300px] max-h-full overflow-y-auto bg-[#1a1a1a] rounded-xl p-4 text-white outline-none border border-white/10 focus:ring-2 focus:ring-[#e9b44c] focus:border-transparent"
                        style={{
                            fontFamily: currentFont,
                            fontSize: `${currentFontSize}px`,
                        }}
                        data-placeholder="Write your notes here..."
                        onFocus={(e) => {
                            if (e.currentTarget.innerHTML === '') {
                                e.currentTarget.dataset.empty = 'true';
                            }
                        }}
                        onInput={(e) => {
                            const target = e.currentTarget;
                            if (target.innerHTML === '' || target.innerHTML === '<br>') {
                                target.dataset.empty = 'true';
                            } else {
                                delete target.dataset.empty;
                            }
                        }}
                        onContextMenu={handleTableContextMenu}
                    />
                </div>

                {/* Table Context Menu */}
                {tableContextMenu && (
                    <div
                        className="fixed bg-[#2d2a2e] border border-white/20 rounded-lg shadow-xl py-1 z-50"
                        style={{ left: tableContextMenu.x, top: tableContextMenu.y }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={addRowAbove}
                            className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                        >
                            Insert row above
                        </button>
                        <button
                            onClick={addRowBelow}
                            className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                        >
                            Insert row below
                        </button>
                        <div className="h-px bg-white/10 my-1" />
                        <button
                            onClick={addColumnLeft}
                            className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                        >
                            Insert column left
                        </button>
                        <button
                            onClick={addColumnRight}
                            className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                        >
                            Insert column right
                        </button>
                        <div className="h-px bg-white/10 my-1" />
                        <button
                            onClick={deleteRow}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 hover:text-red-300"
                        >
                            Delete row
                        </button>
                        <button
                            onClick={deleteColumn}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 hover:text-red-300"
                        >
                            Delete column
                        </button>
                        <button
                            onClick={deleteTable}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 hover:text-red-300"
                        >
                            Delete table
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center p-4 border-t border-white/10">
                    <span className="text-white/40 text-sm">
                        {new Date().toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </span>
                    <div className="flex gap-3">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:text-white px-5"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-5"
                        >
                            Add Note
                        </Button>
                    </div>
                </div>
            </div>

            {/* Placeholder and List styling */}
            <style>{`
                [data-empty="true"]:before {
                    content: attr(data-placeholder);
                    color: rgba(255, 255, 255, 0.4);
                    pointer-events: none;
                    position: absolute;
                }
                [contenteditable] ul {
                    list-style-type: disc;
                    padding-left: 2.5em;
                    margin: 0.5em 0;
                }
                [contenteditable] ol {
                    list-style-type: decimal;
                    padding-left: 2.5em;
                    margin: 0.5em 0;
                }
                [contenteditable] li {
                    margin: 0.25em 0;
                }
                [contenteditable] table {
                    border-collapse: collapse;
                    width: auto;
                    margin: 0.5em 0;
                    table-layout: fixed;
                }
                [contenteditable] th,
                [contenteditable] td {
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    padding: 8px 12px;
                    text-align: left;
                    min-width: 50px;
                    position: relative;
                    overflow: hidden;
                }
                [contenteditable] th {
                    background-color: rgba(255, 255, 255, 0.1);
                    font-weight: 600;
                }
                [contenteditable] th:hover,
                [contenteditable] td:hover {
                    border-right: 3px solid rgba(59, 130, 246, 0.5);
                    cursor: col-resize;
                }
            `}</style>
        </div>
    );
}
