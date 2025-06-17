import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to My App
        </h1>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <p className="text-lg text-gray-700 mb-6">
            This is the main page of our application. You can navigate to other pages using the links below.
          </p>
          <div className="space-y-4">
            <Link 
              href="/about" 
              className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Go to About Page
            </Link>
            <Link 
              href="/contact" 
              className="block w-full text-center bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
            >
              Go to Contact Page
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
