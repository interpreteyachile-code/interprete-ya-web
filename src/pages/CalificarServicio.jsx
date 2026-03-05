import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createRating } from "../data/ratingsStore";
import { useAuth } from "../auth/AuthContext";

export default function CalificarServicio() {

  const { serviceId, interpreterId } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");

  const submit = () => {

    createRating({
      interpreterId,
      clientRut: user.rut,
      serviceId,
      stars,
      comment
    });

    alert("⭐ Evaluación enviada");

    nav("/usuario");

  };

  return (

    <div className="max-w-xl mx-auto grid gap-4">

      <div className="tron-card p-6">

        <div className="text-2xl font-semibold">
          ⭐ Calificar Intérprete
        </div>

        <div className="text-white/70 mt-2">
          Tu opinión ayuda a la comunidad
        </div>

      </div>

      <div className="tron-card p-6 grid gap-4">

        <div className="grid grid-cols-5 gap-2">

          {[1,2,3,4,5].map((n)=>(
            <button
              key={n}
              className={`tron-btn ${stars >= n ? "tron-primary" : ""}`}
              onClick={()=>setStars(n)}
            >
              ⭐
            </button>
          ))}

        </div>

        <textarea
          className="tron-input"
          placeholder="Comentario (opcional)"
          value={comment}
          onChange={(e)=>setComment(e.target.value)}
        />

        <button
          className="tron-btn tron-primary py-3"
          onClick={submit}
        >
          Enviar evaluación
        </button>

      </div>

    </div>
  );
}