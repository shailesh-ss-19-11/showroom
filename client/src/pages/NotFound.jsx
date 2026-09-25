import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl font-black text-brand">404</p>
      <h1 className="mt-3 text-2xl font-extrabold text-ink">Page not found</h1>
      <p className="mt-2 text-ink-soft">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark">
        Back to Home
      </Link>
    </div>
  );
}
