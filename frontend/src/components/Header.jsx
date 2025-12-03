export default function Header({ onMenuClick, user }) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Left side - Menu button */}
        <button
          onClick={onMenuClick}
          className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
        >
          <span className="text-2xl">☰</span>
        </button>

        {/* Center - Title */}
        <div className="flex-1 ml-6">
          <h2 className="text-lg font-semibold text-gray-900">Attendance Overview</h2>
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center gap-6">
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <span className="text-xl">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <span className="text-xl">⚙️</span>
          </button>

          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Workspace Owner</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
