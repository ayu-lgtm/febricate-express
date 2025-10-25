// src/pages/Unauthorized.jsx
import { LockClosedIcon } from "@heroicons/react/24/solid";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4 text-center text-gray-800">
      <LockClosedIcon className="h-16 w-16 text-red-500 mb-6" />

      <h1 className="text-3xl font-bold mb-2">Access Denied</h1>

      <p className="text-gray-600 max-w-md">
        You do not have the required access to view this page or module.
      </p>

      <p className="text-sm text-gray-500 mt-4 max-w-md">
        If you believe you should have access, kindly raise an{" "}
        <span className="font-semibold text-blue-600">AIMS request</span> or
        contact your reporting manager for appropriate role mapping.
      </p>

      <p className="text-xs text-gray-400 mt-6">
        Note: Role-based access is strictly governed for compliance and security purposes.
      </p>
    </div>
  );
}