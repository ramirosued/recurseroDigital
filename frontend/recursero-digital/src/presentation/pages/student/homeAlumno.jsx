import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import "../../styles/pages/homeAlumno.css";

export default function HomeAlumno() {
  const navigate = useNavigate();
  
  const userNameOrEmail = useUser();

  const handleJugarClick = () => {
    navigate('/alumno/juegos');
  };
  return (
    <div className="main">
      
      <section className="welcome-card">
        <h1>¡ Hola {userNameOrEmail} !</h1>
        <p>
          ¡ Bienvenido a ReDa Kids ! Una plataforma educativa diseñada para hacer que el aprendizaje de las
          matemáticas sea una experiencia divertida y emocionante.
        </p>
        <p>¡ Descubre el mundo mágico de los números mientras te divertís !</p>
        
        <h2>¡ Aprender matemáticas nunca fue tan divertido !</h2>
        <p>
          Disfruten de estos juegos, son para que aprendan habilidades matemáticas mientras se divierten. Cada juego
          tiene 3 niveles y 5 actividades, numeros impresionantes y acumula puntos.
        </p>
        <h3>
          ¡ Comienza tu aventura en las matemáticas ¡ Hoy mismo !
        </h3>
        <button className="jugar-button" onClick={handleJugarClick}>
            ¡ A JUGAR !
          </button>
      </section>
    </div>
  );
}
