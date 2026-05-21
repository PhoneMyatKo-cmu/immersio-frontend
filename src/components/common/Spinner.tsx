export default function Spinner() {
  return (
      <div className="flex-col justify-center items-center opacity-90 px-8 py-7 rounded-2xl bg-amber-950">
          <div className="  mb-2">Processing...</div>
      <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );
}