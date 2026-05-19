// src/components/common/Modal/Modal.tsx
import { X } from 'lucide-react';
import { useEffect } from 'react';

export type ModalVariant = 'info' | 'success' | 'warning' | 'error';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    variant?: ModalVariant;
    confirmText?: string;
    onConfirm?: () => void;
    closeOnBackdrop?: boolean;
}

const variantStyles: Record<ModalVariant, string> = {
    info: 'border-t-blue-500',
    success: 'border-t-emerald-500',
    warning: 'border-t-amber-500',
    error: 'border-t-red-500',
};

export function Modal({
    isOpen,
    onClose,
    title,
    message,
    variant = 'info',
    confirmText = 'OK',
    onConfirm,
    closeOnBackdrop = true,
}: ModalProps) {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);
    
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [isOpen]);
    
    if (!isOpen) return null;
    
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && closeOnBackdrop) {
            onClose();
        }
    };
    
    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        onClose();
    };

    const handleCancel = () => {
        onClose();
    }
    
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-[fadeIn_0.15s_ease]"
            onClick={handleBackdropClick}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
                className={`relative w-full max-w-md rounded-xl border border-white/10 border-t-[3px] bg-[#0a1628] p-6 text-white shadow-2xl animate-[slideUp_0.2s_ease] ${variantStyles[variant]}`}
            >
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md text-white/50 transition-all hover:bg-white/5 hover:text-white/90"
                >
                    <X size={18} />
                </button>
                
                {title && (
                    <h2 
                        id="modal-title" 
                        className="mb-3 pr-8 text-lg font-semibold"
                    >
                        {title}
                    </h2>
                )}
                
                <p className="mb-6 text-sm leading-relaxed text-white/80">
                    {message}
                </p>
                
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 ">
                    <button
                        onClick={handleCancel}
                        className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-teal-700"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleConfirm}
                        className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-teal-700"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}