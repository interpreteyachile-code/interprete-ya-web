import TronTile from "../components/TronTile";

export default function Solicitud() {
  return (
    <div className="grid gap-3">
      <TronTile icon="1️⃣" title="Solicitud" desc="Ahora • agendar • videollamada." />
      <TronTile icon="2️⃣" title="Elección" desc="Trámite • reunión • entrevista • evento." />
      <TronTile icon="3️⃣" title="Conexión" desc="Asignación o elección de intérprete disponible." />
      <TronTile icon="🔳" title="QR" desc="Inicio/fin del servicio registrado de forma autónoma." />
      <TronTile icon="💳" title="Pago" desc="WebPay / MercadoPago (integración futura)." />
      <TronTile icon="⭐" title="Feedback" desc="Calificación mutua para mejorar confianza." />
    </div>
  );
}
