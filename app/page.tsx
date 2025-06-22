export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-black mb-6">
          What are we learning today?
        </h1>
      </div>
      <div className="w-full max-w-2xl">
        <input
          type="text"
          placeholder="Describe what you'd like to visualize..."
          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </main>
  );
}
