export default function Footer() {
  return (
    <footer className="bg-linear-to-t from-slate-900 to-slate-800 border-t border-slate-700 text-white py-8 px-6 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Web Name */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-2xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CineVault
            </h2>
            <p className="text-slate-400 text-sm mt-1">Your Gateway to Entertainment</p>
          </div>

          {/* Creator Info */}
          <div className="text-center md:text-right">
            <p className="text-slate-300 text-sm">
              Created by <span className="font-semibold text-purple-400">Mohammed Raza</span>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 mt-6 pt-6 text-center">
          <p className="text-slate-500 text-xs">
            Discover and share your favorite movies and TV shows
          </p>
        </div>
      </div>
    </footer>
  );
}
