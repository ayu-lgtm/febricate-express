// src/pages/LoadingScreen.jsx
export default function LoadingScreen() {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-blue-50 text-blue-800">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50 mb-6"></div>
          <p className="text-xl font-semibold">🔄 Logging in... please wait</p>
          <p className="text-sm mt-2 text-gray-500">Authenticating via Tata Steel SSO</p>
        </div>
      );
    }
    