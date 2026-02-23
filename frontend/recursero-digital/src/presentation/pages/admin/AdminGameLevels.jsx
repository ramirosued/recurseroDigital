import React, { useEffect, useState } from 'react';
import '../../../styles/pages/adminGameLevels.css';
import { API_BASE_URL } from '../../../infrastructure/config/api';

const GAME_NAMES = {
    'game-ordenamiento': 'Ordenamiento',
    'game-descomposicion': 'Descomposición',
    'game-escala': 'Escala',
    'game-escritura': 'Escritura',
    'game-calculos': 'Cálculos'
};

export default function AdminGameLevels() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingLevel, setEditingLevel] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadGames = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE_URL}/games/all-with-levels`);
                
                if (!response.ok) {
                    throw new Error('Error al cargar juegos');
                }
                
                const data = await response.json();
                setGames(data.games || []);
            } catch (err) {
                console.error('Error al cargar juegos:', err);
                setError('No se pudieron cargar los juegos');
            } finally {
                setLoading(false);
            }
        };
        
        loadGames();
    }, []);

    const handleEditLevel = (level) => {
        setEditingLevel(level.id);
        setEditForm({
            name: level.name,
            description: level.description,
            difficulty: level.difficulty,
            activitiesCount: level.activitiesCount,
            config: JSON.stringify(level.config, null, 2),
            isActive: level.isActive
        });
    };

    const handleCancelEdit = () => {
        setEditingLevel(null);
        setEditForm({});
    };

    const handleSaveLevel = async (levelId) => {
        try {
            setSaving(true);
            let config;
            try {
                config = JSON.parse(editForm.config);
            } catch (e) {
                alert('Error: La configuración JSON no es válida');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/games/levels/${levelId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: editForm.name,
                    description: editForm.description,
                    difficulty: editForm.difficulty,
                    activitiesCount: parseInt(editForm.activitiesCount),
                    config: config,
                    isActive: editForm.isActive
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar');
            }

            const loadGames = async () => {
                const response = await fetch(`${API_BASE_URL}/games/all-with-levels`);
                const data = await response.json();
                setGames(data.games || []);
            };

            await loadGames();
            setEditingLevel(null);
            setEditForm({});
        } catch (err) {
            console.error('Error al guardar nivel:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getGameDisplayName = (gameId) => {
        return GAME_NAMES[gameId] || gameId.replace('game-', '').charAt(0).toUpperCase() + gameId.replace('game-', '').slice(1);
    };

    const formatConfig = (config) => {
        const parts = [];
        if (config.min !== undefined && config.max !== undefined) {
            parts.push(`Rango: ${config.min} - ${config.max}`);
        }
        if (config.operation !== undefined) {
            if (typeof config.operation === 'number') {
                parts.push(`Operación: ±${config.operation}`);
            } else {
                parts.push(`Operación: ${config.operation}`);
            }
        }
        if (config.numbersCount !== undefined) {
            parts.push(`Números: ${config.numbersCount}`);
        }
        if (config.color) {
            parts.push(`Color: ${config.color}`);
        }
        return parts.length > 0 ? parts.join(' | ') : 'Sin configuración específica';
    };

    if (loading) {
        return (
            <div className="admin-game-levels">
                <div className="loading">Cargando configuraciones...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-game-levels">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="admin-game-levels">
            <div className="page-header">
                <h1>Configuración de Juegos</h1>
                <p>Gestiona los niveles y configuraciones de cada juego</p>
            </div>

            {games.length === 0 ? (
                <div className="no-games">
                    <p>No hay juegos configurados</p>
                </div>
            ) : (
                <div className="games-grid">
                    {games.map((game) => (
                        <div key={game.gameId} className="game-card">
                            <div className="game-card-header">
                                <h2>{getGameDisplayName(game.gameId)}</h2>
                                <div className="game-stats">
                                    <span className="stat-badge">
                                        {game.totalLevels} {game.totalLevels === 1 ? 'Nivel' : 'Niveles'}
                                    </span>
                                    <span className="stat-badge active">
                                        {game.activeLevels} Activos
                                    </span>
                                </div>
                            </div>

                            <div className="game-levels">
                                {game.levels.length === 0 ? (
                                    <p className="no-levels">No hay niveles configurados</p>
                                ) : (
                                    game.levels.map((level) => (
                                        <div 
                                            key={level.id} 
                                            className={`level-item ${!level.isActive ? 'inactive' : ''}`}
                                        >
                                            {editingLevel === level.id ? (
                                                <div className="level-edit-form">
                                                    <div className="form-group">
                                                        <label>Nombre:</label>
                                                        <input
                                                            type="text"
                                                            value={editForm.name || ''}
                                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Descripción:</label>
                                                        <textarea
                                                            value={editForm.description || ''}
                                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                                            className="form-textarea"
                                                            rows="2"
                                                        />
                                                    </div>
                                                    <div className="form-row">
                                                        <div className="form-group">
                                                            <label>Dificultad:</label>
                                                            <select
                                                                value={editForm.difficulty || ''}
                                                                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                                                                className="form-select"
                                                            >
                                                                <option value="Fácil">Fácil</option>
                                                                <option value="Intermedio">Intermedio</option>
                                                                <option value="Avanzado">Avanzado</option>
                                                            </select>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Actividades:</label>
                                                            <input
                                                                type="number"
                                                                value={editForm.activitiesCount || ''}
                                                                onChange={(e) => handleInputChange('activitiesCount', e.target.value)}
                                                                className="form-input"
                                                                min="1"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Configuración (JSON):</label>
                                                        <textarea
                                                            value={editForm.config || ''}
                                                            onChange={(e) => handleInputChange('config', e.target.value)}
                                                            className="form-textarea config-json"
                                                            rows="6"
                                                        />
                                                    </div>
                                                    <div className="form-group checkbox-group">
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                checked={editForm.isActive !== false}
                                                                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                                            />
                                                            Nivel activo
                                                        </label>
                                                    </div>
                                                    <div className="form-actions">
                                                        <button
                                                            onClick={() => handleSaveLevel(level.id)}
                                                            disabled={saving}
                                                            className="btn-save"
                                                        >
                                                            {saving ? 'Guardando...' : 'Guardar'}
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            disabled={saving}
                                                            className="btn-cancel"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="level-header">
                                                        <div className="level-info">
                                                            <h3>
                                                                Nivel {level.level}: {level.name}
                                                                {!level.isActive && <span className="inactive-badge">Inactivo</span>}
                                                            </h3>
                                                            <p className="level-description">{level.description}</p>
                                                        </div>
                                                        <div className="level-meta">
                                                            <span className="difficulty-badge">{level.difficulty}</span>
                                                            <span className="activities-badge">{level.activitiesCount} actividades</span>
                                                        </div>
                                                    </div>
                                                    <div className="level-config">
                                                        <strong>Configuración:</strong>
                                                        <p>{formatConfig(level.config)}</p>
                                                        {level.config.range && (
                                                            <p><strong>Rango textual:</strong> {level.config.range}</p>
                                                        )}
                                                    </div>
                                                    <div className="level-actions">
                                                        <button
                                                            onClick={() => handleEditLevel(level)}
                                                            className="btn-edit"
                                                        >
                                                            ✏️ Editar
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

