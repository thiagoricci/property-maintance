export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-bold mb-6 text-black">Property Maintenance AI</h1>
        <p className="text-xl text-black mb-8">
          AI-powered property maintenance analysis for property managers and landlords
        </p>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-black">Features</h2>
            <ul className="text-left text-black space-y-2">
              <li>✓ Instant AI-powered maintenance diagnosis</li>
              <li>✓ Urgency classification and cost estimates</li>
              <li>✓ Contractor recommendations</li>
              <li>✓ Request history and tracking</li>
            </ul>
          </div>
          <div className="space-x-4">
            <a
              href="/login"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Login
            </a>
            <a
              href="/signup"
              className="inline-block px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
