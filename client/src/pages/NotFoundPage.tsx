import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-slate-500">Page not found</p>
      <Link to="/" className="mt-6 text-indigo-600 hover:underline">
        Go home
      </Link>
    </div>
  );
}
