interface TabProps {
    titles: { title: any; id: any }[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    activeTab: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    onClick: (tab: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
    className?: string;
}

export default function Tab({ titles, activeTab, onClick, className }: TabProps) {

    return (
        <div className={`flex mb-4 ${className}`}>
            {titles.map(({ title, id }) => (
                <button
                    className={`flex-1 mx-0.5 px-3 py-1 rounded ${activeTab === id ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    onClick={() => onClick(id)}
                    key={id}
                >
                    {title}
                </button>
            ))}
        </div>
    );
}