import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/pages/reporteDetalle.css";
import { API_BASE_URL } from "../../../infrastructure/config/api";

export default function ReporteDetalle() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  const [reporte, setReporte] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [studentLastname, setStudentLastname] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generarReporte = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/statistics/student/${studentId}/report`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recentDays: 10 })
      });

      if (!response.ok) {
        throw new Error('Error al generar el reporte');
      }

      const data = await response.json();
      setReporte(data.report);
      setStudentName(data.studentName);
      setStudentLastname(data.studentLastname);
      
    } catch (error) {
      console.error('Error:', error);
      setError('No se pudo generar el reporte. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generarReporte();
  }, [studentId]);

  const handleVolver = () => {
    navigate('/docente/reportes');
  };

  const handleRegenerarReporte = () => {
    generarReporte();
  };

  if (loading) {
    return (
      <div className="reporte-detalle-container">
        <button className="btn-volver" onClick={handleVolver}>
          ← Volver al listado
        </button>
        <div className="reporte-detalle-wrapper">
          <div className="reporte-header">
            <h1>Generando reporte...</h1>
          </div>
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Analizando datos del estudiante...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reporte-detalle-container">
        <button className="btn-volver" onClick={handleVolver}>
          ← Volver al listado
        </button>
        <button className="btn-regenerar" onClick={handleRegenerarReporte}>
          🔄 Reintentar
        </button>
        <div className="reporte-detalle-wrapper">
          <div className="reporte-header">
            <h1>Error al generar reporte</h1>
          </div>
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="btn-reintentar" onClick={handleRegenerarReporte}>
              Volver a intentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reporte-detalle-container">
      <button className="btn-volver" onClick={handleVolver}>
        ← Volver al listado
      </button>
      <button className="btn-regenerar" onClick={handleRegenerarReporte}>
        🔄 Volver a generar
      </button>
      <div className="reporte-detalle-wrapper">
        <div className="reporte-header">
          <h1>Reporte de {studentName} {studentLastname}</h1>
        </div>

        <div className="reporte-content">
          <div className="reporte-texto">
            {reporte && reporte.split('\n\n').map((parrafo, index) => (
              <p key={index} className="reporte-parrafo">
                {parrafo}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}