
export function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }
    const too_many_pages = totalPages > 5;
    if (too_many_pages) {
        if (currentPage > 3) {
            pages.unshift('...');
        }
        if (currentPage < totalPages - 2) {
            pages.push('...');
        }
    }

    return (
        <div className="flex justify-center mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="mx-1 px-3 py-1 rounded bg-teal-600 text-white hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-teal-600"
            >
                Previous
            </button>
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...'}
                    className={`mx-1 px-3 py-1 rounded ${
                        page === currentPage
                            ? 'bg-teal-400 text-white border-2 border-teal-100'
                            : 'bg-teal-600 text-white hover:bg-teal-400'
                    } ${page === '...' ? 'cursor-default' : ''}`}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="mx-1 px-3 py-1 rounded bg-teal-600 text-white hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-teal-600"
            >
                Next
            </button>
        </div>
    );
}