import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardStats from '../../components/teacher/DashboardStats';
import '../../styles/pages/teacherStatistics.css';

const TeacherStatistics = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const cursoGuardado = localStorage.getItem('cursoSeleccionado');
    if (cursoGuardado) {
      const curso = JSON.parse(cursoGuardado);
      setSelectedCourse(curso.id);
    } else {
      navigate('/docente');
    }
  }, [navigate]);

  if (!selectedCourse) {
    return <div className="loading">Cargando curso...</div>;
  }

  return (
    <div className="teacher-statistics">
      <div className="statistics-content">
        <DashboardStats courseId={selectedCourse} />
      </div>
    </div>
  );
};

export default TeacherStatistics;

