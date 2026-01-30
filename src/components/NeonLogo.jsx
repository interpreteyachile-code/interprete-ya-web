import logo from "../assets/logo.png"; // 👈 cambia el nombre si tu archivo es distinto

export default function NeonLogo({ size = 86 }) {
  return (
    <div
      className="relative floaty"
      style={{ width: size, height: size }}
      aria-label="logo"
    >
      <div className="absolute inset-0 rounded-[26px] border border-cyan-300/35 bg-cyan-300/10 shadow-[0_0_20px_rgba(0,255,255,.18)]" />
      <div className="absolute -inset-[2px] rounded-[28px] opacity-70 pointer-events-none"
        style={{
          background:
            "radial-gradient(120px 80px at 20% 10%, rgba(0,255,255,.30), transparent 60%)," +
            "radial-gradient(120px 80px at 80% 30%, rgba(124,58,237,.22), transparent 60%)",
          filter: "drop-shadow(0 0 10px rgba(0,255,255,.22))",
        }}
      />
      <div className="absolute inset-[6px] rounded-[22px] overflow-hidden border border-white/10">
        <img
          src={logo}
          alt="logo"
          className="w-full h-full object-cover"
          draggable="false"
        />
      </div>
    </div>
  );
}
