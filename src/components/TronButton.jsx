export default function TronButton({ icon, label, onClick, hideText = false }) {
  return (
    <button onClick={onClick} className="tron-btn w-full flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center text-2xl">
        {icon}
      </div>

      {!hideText && (
        <div className="flex-1">
          <div className="font-semibold">{label}</div>
          <div className="text-xs text-white/65">👁️ Visual • ⚡ Fluido</div>
        </div>
      )}

      <div className="text-xl opacity-70">➜</div>
    </button>
  );
}
