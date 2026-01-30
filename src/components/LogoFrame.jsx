import logo from "../assets/logo.png";

export default function LogoFrame() {
  return (
    <div className="logo-frame">
      <img className="logo-img" src={logo} alt="Logo" />
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="tron-chip">🤟</div>
        <div className="tron-chip">🔒</div>
      </div>
    </div>
  );
}
