import { useLocation, useNavigate } from "react-router-dom";

const items = [
  { path: "/", icon: "🏠" },
  { path: "/solicitud", icon: "📅" },
  { path: "/cursos", icon: "🎓" },
  { path: "/denuncias", icon: "⚖️" },
  { path: "/alianzas", icon: "🤝" },
];

export default function BottomNav() {
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 px-3 md:hidden">
      <div className="tron-card p-2 flex justify-between gap-2">
        {items.map((it) => {
          const active = loc.pathname === it.path;
          return (
            <button
              key={it.path}
              className={
                "tron-btn w-14 h-12 grid place-items-center text-xl " +
                (active ? "border-cyan-300/60 shadow-[0_0_18px_rgba(0,255,255,.18)]" : "")
              }
              onClick={() => nav(it.path)}
              aria-label={it.path}
              title={it.path}
            >
              {it.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
