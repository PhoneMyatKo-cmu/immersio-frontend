interface BottomSheetProps {
    isOpen:   boolean
    onClose:  () => void
    children: React.ReactNode
}

export default function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sheet */}
            <div className={`
                fixed bottom-0 left-0 right-0 z-50
                bg-greygreen rounded-t-2xl
                transition-transform duration-300 ease-out
                max-h-[75vh] overflow-y-auto
                scrollbar-thin 
                scrollbar-thumb-teal-500
                scrollbar-track-black
                md:hidden
                ${isOpen ? "translate-y-0" : "translate-y-full"}
            `}>
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-white/20 rounded-full" />
                </div>

                {children}
            </div>
        </>
    )
}