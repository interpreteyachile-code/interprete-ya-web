import TronTile from "../components/TronTile";

export default function Alianzas() {
  return (
    <div className="grid gap-3">
      <TronTile
        icon="🤝"
        title="Empresas Aliadas"
        desc="Convenios directos para accesibilidad e inclusión laboral."
      />
      <TronTile
        icon="🏛️"
        title="Organizaciones Sordas"
        desc="Colaboración con corporaciones/federaciones (sin representarlas)."
      />
      <TronTile
        icon="📈"
        title="Impacto"
        desc="Autosustentable: % pequeño por transacción para mantener el sistema."
      />
    </div>
  );
}
