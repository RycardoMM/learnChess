import Link from "next/link";

const LEVELS = [
  { value: "basico", label: "Básico" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <p className="sidebar-title">Niveles</p>
      <ul className="sidebar-list">
        {LEVELS.map(({ value, label }) => (
          <li key={value}>
            <Link href={`/#nivel-${value}`}>{label}</Link>
          </li>
        ))}
      </ul>
      <p className="sidebar-title">Jugar</p>
      <ul className="sidebar-list">
        <li>
          <Link href="/play">Contra la IA</Link>
        </li>
      </ul>
    </nav>
  );
}
