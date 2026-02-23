import React, { useState, useEffect } from "react";
import "../../styles/pages/addUserForm.css";

export default function EditTeacherForm({ onClose, onSubmit, teacher, courses = [] }) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    password: "",
    selectedCourses: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (teacher) {
      const nameParts = teacher.name ? teacher.name.split(' ') : ['', ''];
      const firstName = teacher.firstName || nameParts[0] || '';
      const lastName = teacher.lastName || teacher.surname || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '') || '';
      
      setFormData({
        name: firstName,
        surname: lastName,
        username: teacher.username || "",
        email: teacher.email || "",
        password: "",
        selectedCourses: teacher.courses ? teacher.courses.map(c => c.id) : [],
      });
    }
  }, [teacher]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCourseToggle = (courseId) => {
    setFormData(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter(id => id !== courseId)
        : [...prev.selectedCourses, courseId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.surname.trim()) {
      newErrors.surname = "El apellido es requerido";
    }

    if (!formData.username.trim()) {
      newErrors.username = "El username es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no tiene un formato válido";
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({ 
        teacherId: teacher.id,
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password || null,
        courseIds: formData.selectedCourses
      });
    }
  };

  return (
    <div className="add-user-overlay">
      <div className="add-user-modal">
        <div className="modal-header">
          <h2>Editar Docente</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="name">Nombre *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
              placeholder="Ingrese el nombre"
              autoFocus
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="surname">Apellido *</label>
            <input
              type="text"
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              className={errors.surname ? "error" : ""}
              placeholder="Ingrese el apellido"
            />
            {errors.surname && (
              <span className="error-message">{errors.surname}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? "error" : ""}
              placeholder="Ingrese el username"
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              placeholder="Ingrese el email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña (dejar vacío para no cambiar)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
              placeholder="Ingrese la nueva contraseña"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label>Cursos (selecciona uno o más)</label>
            <div className="courses-checkbox-list">
              {courses.map(course => (
                <label key={course.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.selectedCourses.includes(course.id)}
                    onChange={() => handleCourseToggle(course.id)}
                  />
                  {course.name}
                </label>
              ))}
            </div>
            {formData.selectedCourses.length > 0 && (
              <p className="selected-count">
                {formData.selectedCourses.length} curso(s) seleccionado(s)
              </p>
            )}
          </div>

          <div className="form-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-btn">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

