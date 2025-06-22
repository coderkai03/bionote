import AnkiGenerator from "../components/AnkiGenerator";

export default function AnkiPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Anki Flashcard Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create personalized study materials using artificial intelligence.
            Generate high-quality flashcards for any topic and export them
            directly to Anki.
          </p>
        </div>

        <AnkiGenerator />

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              How to Import into Anki
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Method 1: CSV Import
                </h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Download the CSV file from this tool</li>
                  <li>2. Open Anki</li>
                  <li>3. Go to File → Import</li>
                  <li>4. Select the downloaded CSV file</li>
                  <li>5. Choose your deck and note type</li>
                  <li>6. Map columns: Front, Back, Tags</li>
                  <li>7. Click Import</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Method 2: Manual Entry
                </h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Review the generated flashcards</li>
                  <li>2. Open Anki</li>
                  <li>3. Create a new deck</li>
                  <li>4. Add cards manually using the content</li>
                  <li>5. Copy and paste front/back content</li>
                  <li>6. Add tags as needed</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
