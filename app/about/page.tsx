import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          About Us
        </h1>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <p className="text-lg text-gray-700 mb-6">
            This is the about page of our application. Here you can learn more about our company and mission.
          </p>
          <div className="space-y-4">
            <Link 
              href="/" 
              className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 