import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        ♞ LearnChess
      </Link>
      <div className="navbar-links">
        <Link href="/">Lecciones</Link>
        <Link href="/admin">Admin</Link>
      </div>
    </nav>
  );
}
