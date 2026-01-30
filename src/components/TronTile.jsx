export default function TronTile({ icon, title, desc }) {
  return (
    <div className="tron-card p-5">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl border border-cyan-300/40 bg-cyan-300/10 shadow-neon grid place-items-center text-2xl">
          {icon}
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-white/70 mt-1">{desc}</div>
        </div>
      </div>
    </div>
  );
}
