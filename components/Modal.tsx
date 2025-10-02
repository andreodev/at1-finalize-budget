


import { ReactNode, useEffect, useState } from "react";

export default function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: ReactNode }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 200);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-200 p-3 ${
                isAnimating 
                    ? 'bg-black/60 backdrop-blur-sm opacity-100' 
                    : 'bg-black/0 backdrop-blur-none opacity-0'
            }`}
            onClick={handleBackdropClick}
        >
            <div className={`bg-white p-6 rounded-xl shadow-2xl relative w-[320px] border border-gray-200 transition-all duration-200 transform ${
                isAnimating 
                    ? 'scale-100 opacity-100 translate-y-0' 
                    : 'scale-95 opacity-0 translate-y-4'
            }`}>
                <button
                    className="absolute cursor-pointer top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110"
                    onClick={onClose}
                    aria-label="Fechar"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="pr-8">
                    <h2 className="text-xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center">
                        <div>
                            
                        </div>
                        {title}
                    </h2>
                </div>
                <div className="mb-4">{children}</div>
            </div>
        </div>
    );
}