export function Footer() {
  return (
    <footer className="mt-20 text-center">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="text-slate-600 space-y-2">
          <p className="text-lg font-semibold">
            Powered by Real-Time Market Data & AI
          </p>
          <div className="flex justify-center items-center space-x-6 text-sm">
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Alpha Vantage API</span>
            </span>
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Groq AI</span>
            </span>
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Next.js</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            Built with Next.js, TypeScript & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
