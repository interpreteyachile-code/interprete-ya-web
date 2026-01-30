import TronTile from "../components/TronTile";

export default function Ecosistema() {
  return (
    <div className="grid gap-3">
      <TronTile
        icon="🎯"
        title="Objetivo Central"
        desc="Empoderamiento y autogestión: trabajo, accesibilidad y defensa LSCh."
      />
      <TronTile
        icon="🔁"
        title="Círculo Virtuoso"
        desc="Más usuarios → más intérpretes/empresas → más ingresos → más proyectos."
      />
      <TronTile
        icon="✅"
        title="Validación por la comunidad"
        desc="Reputación y retroalimentación directa, transparente y visual."
      />
    </div>
  );
}
