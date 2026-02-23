import React, { useState, useRef } from "react";
import "../../styles/pages/bulkUploadForm.css";

export default function BulkUploadForm({ onClose, onSubmit }) {
  const [csvFile, setCsvFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const fileInputRef = useRef(null);

  const requiredFields = ["nombre", "apellido", "username", "password", "dni"];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError("");
    
    if (!file) {
      setCsvFile(null);
      setParsedData([]);
      setPreviewData([]);
      return;
    }

    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      setError("Por favor selecciona un archivo CSV válido.");
      return;
    }

    setCsvFile(file);
    parseCSV(file);
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length < 2) {
          setError("El archivo CSV debe tener al menos una línea de encabezados y una línea de datos.");
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const missingFields = requiredFields.filter(field =>
          !headers.includes(field.toLowerCase())
        );
        
        if (missingFields.length > 0) {
          setError("Faltan los siguientes campos requeridos en el CSV: " + missingFields.join(', '));
          return;
        }

        const dataLines = lines.slice(1);
        
        if (dataLines.length > 100) {
          setError("El archivo no puede contener más de 100 estudiantes.");
          return;
        }

        const parsed = dataLines.map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          const student = {};
          
          headers.forEach((header, i) => {
            student[header] = values[i] || '';
          });

          const errors = [];
          if (!student.nombre) errors.push('nombre requerido');
          if (!student.apellido) errors.push('apellido requerido');
          if (!student.username) errors.push('username requerido');
          if (!student.password) errors.push('password requerido');
          if (!student.dni) errors.push('dni requerido');
          if (student.dni && !/^\d{7,8}$/.test(student.dni)) {
            errors.push('DNI debe tener 7-8 dígitos');
          }

          return {
            ...student,
            lineNumber: index + 1,
            errors,
            isValid: errors.length === 0
          };
        });

        const validStudents = parsed.filter(s => s.isValid);
        const invalidStudents = parsed.filter(s => !s.isValid);

        if (invalidStudents.length > 0) {
          const errorMsg = "Se encontraron " + invalidStudents.length + " estudiantes con errores:\n" +
            invalidStudents.map(s => 
              "Línea " + s.lineNumber + ": " + s.errors.join(', ')
            ).join('\n');
          setError(errorMsg);
        }

        setParsedData(validStudents);
        setPreviewData(validStudents);
        
        if (validStudents.length === 0) {
          setError("No se encontraron estudiantes válidos en el archivo.");
        }

      } catch (err) {
        setError("Error al procesar el archivo CSV. Verifica el formato.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!parsedData.length) {
      setError("No hay datos válidos para cargar.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const studentsData = parsedData.map(student => ({
        nombre: student.nombre,
        apellido: student.apellido,
        username: student.username,
        password: student.password,
        dni: student.dni
      }));

      await onSubmit(studentsData);
      onClose();
    } catch (err) {
      setError(err.message || "Error al cargar estudiantes");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = "nombre,apellido,username,password,dni\nJuan,Perez,jperez,123456,12345678\nMaria,Garcia,mgarcia,123456,87654321";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_estudiantes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setCsvFile(null);
    setParsedData([]);
    setPreviewData([]);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="add-user-overlay" onClick={onClose}>
      <div className="add-user-modal bulk-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Carga Masiva de Estudiantes</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form className="bulk-upload-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message-admin">
              <pre>{error}</pre>
            </div>
          )}

          <div className="upload-section">
            <div className="upload-instructions">
              <h3>Formato de archivo CSV</h3>
              <ul>
                <li>Sube un archivo CSV con los siguientes campos: <strong>nombre, apellido, username, password, dni</strong></li>
                <li>El DNI debe tener 7-8 dígitos</li>
                <li>Todos los campos son obligatorios y deben estar correctamente formateados</li>
              </ul>
              <button 
                type="button" 
                className="download-template-btn"
                onClick={downloadTemplate}
              >
                📥 Descargar Plantilla
              </button>
            </div>

            <div className="file-upload-area">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="file-input"
                id="csvFile"
              />
              <label htmlFor="csvFile" className="file-upload-label">
                {csvFile ? csvFile.name : "Seleccionar archivo CSV"}
              </label>
              {csvFile && (
                <button 
                  type="button" 
                  className="reset-file-btn"
                  onClick={handleReset}
                >
                  🗑️ Cambiar archivo
                </button>
              )}
            </div>
          </div>

          {previewData.length > 0 && (
            <div className="preview-section">
              <h3>Vista Previa de Datos ({previewData.length} estudiantes)</h3>
              <div className="preview-table-container">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Línea</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Username</th>
                      <th>DNI</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((student, index) => (
                      <tr key={index} className={student.isValid ? 'valid' : 'invalid'}>
                        <td>{student.lineNumber}</td>
                        <td>{student.nombre}</td>
                        <td>{student.apellido}</td>
                        <td>{student.username}</td>
                        <td>{student.dni}</td>
                        <td>
                          {student.isValid ? (
                            <span className="status-valid">✓ Válido</span>
                          ) : (
                            <span className="status-invalid">✗ Error</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {previewData.length > 0 && (
                <div className="upload-summary">
                  <p><strong>Estudiantes válidos:</strong> {parsedData.length}</p>
                  <p><strong>Estudiantes con errores:</strong> {previewData.filter(s => !s.isValid).length}</p>
                  <p><strong>Total procesados:</strong> {previewData.length}</p>
                </div>
              )}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading || !parsedData.length}
            >
              {isLoading ? "Cargando..." : "Cargar " + parsedData.length + " Estudiantes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}