import React, { useEffect, useState } from 'react';
import { ArrowDownUp, Puzzle, Ruler, PenLine, Calculator, ArrowRight, ChevronLeft } from 'lucide-react';
import '../../../styles/pages/adminGameLevels.css';
import { API_BASE_URL } from '../../../infrastructure/config/api';

const GAME_NAMES = {
    'game-ordenamiento': 'Ordenamiento',
    'game-descomposicion': 'Descomposición',
    'game-escala': 'Escala',
    'game-escritura': 'Escritura',
    'game-calculos': 'Cálculos'
};

const GAME_ICON_COMPONENTS = {
    'game-ordenamiento': ArrowDownUp,
    'game-descomposicion': Puzzle,
    'game-escala': Ruler,
    'game-escritura': PenLine,
    'game-calculos': Calculator
};

const GAME_COLORS = {
    'game-ordenamiento': {
        bg: 'from-blue-500/10 to-blue-600/10',
        icon: 'text-blue-600',
        iconBg: 'bg-blue-100'
    },
    'game-descomposicion': {
        bg: 'from-purple-500/10 to-purple-600/10',
        icon: 'text-purple-600',
        iconBg: 'bg-purple-100'
    },
    'game-escala': {
        bg: 'from-green-500/10 to-green-600/10',
        icon: 'text-green-600',
        iconBg: 'bg-green-100'
    },
    'game-escritura': {
        bg: 'from-orange-500/10 to-orange-600/10',
        icon: 'text-orange-600',
        iconBg: 'bg-orange-100'
    },
    'game-calculos': {
        bg: 'from-pink-500/10 to-pink-600/10',
        icon: 'text-pink-600',
        iconBg: 'bg-pink-100'
    }
};

const DIFFICULTY_OPTIONS = ['Fácil', 'Medio', 'Difícil'];

function ConfigEditor({ gameId, config, onChange }) {
    const [localConfig, setLocalConfig] = useState(config || {});

    useEffect(() => {
        setLocalConfig(config || {});
    }, [config]);

    const handleChange = (field, value) => {
        const newConfig = { ...localConfig, [field]: value };
        setLocalConfig(newConfig);
        onChange(newConfig);
    };

    const getGameType = (gameId) => {
        if (gameId.includes('ordenamiento')) return 'ordenamiento';
        if (gameId.includes('descomposicion')) return 'descomposicion';
        if (gameId.includes('escala')) return 'escala';
        if (gameId.includes('escritura')) return 'escritura';
        if (gameId.includes('calculos')) return 'calculos';
        return 'default';
    };

    const gameType = getGameType(gameId);

    switch (gameType) {
        case 'ordenamiento':
            return (
                <div className="config-editor">
                    <div className="config-row">
                        <div className="config-field">
                            <label>Mínimo:</label>
                            <input
                                type="number"
                                value={localConfig.min || ''}
                                onChange={(e) => handleChange('min', parseInt(e.target.value) || 0)}
                                className="config-input"
                            />
                        </div>
                        <div className="config-field">
                            <label>Máximo:</label>
                            <input
                                type="number"
                                value={localConfig.max || ''}
                                onChange={(e) => handleChange('max', parseInt(e.target.value) || 0)}
                                className="config-input"
                            />
                        </div>
                        <div className="config-field">
                            <label>Cantidad de números:</label>
                            <input
                                type="number"
                                value={localConfig.numbersCount || 6}
                                onChange={(e) => handleChange('numbersCount', parseInt(e.target.value) || 6)}
                                className="config-input"
                                min="1"
                            />
                        </div>
                        <div className="config-field">
                            <label>Color:</label>
                            <input
                                type="text"
                                value={localConfig.color || 'blue'}
                                onChange={(e) => handleChange('color', e.target.value)}
                                className="config-input"
                                placeholder="blue"
                            />
                        </div>
                    </div>
                </div>
            );

        case 'descomposicion':
            return (
                <div className="config-editor">
                    <div className="config-row">
                        <div className="config-field">
                            <label>Mínimo:</label>
                            <input
                                type="number"
                                value={localConfig.min || ''}
                                onChange={(e) => handleChange('min', parseInt(e.target.value) || 0)}
                                className="config-input"
                            />
                        </div>
                        <div className="config-field">
                            <label>Máximo:</label>
                            <input
                                type="number"
                                value={localConfig.max || ''}
                                onChange={(e) => handleChange('max', parseInt(e.target.value) || 0)}
                                className="config-input"
                            />
                        </div>
                        <div className="config-field">
                            <label>Rango (texto):</label>
                            <input
                                type="text"
                                value={localConfig.range || ''}
                                onChange={(e) => handleChange('range', e.target.value)}
                                className="config-input"
                                placeholder="1 al 50"
                            />
                        </div>
                        <div className="config-field">
                            <label>Color:</label>
                            <input
                                type="text"
                                value={localConfig.color || ''}
                                onChange={(e) => handleChange('color', e.target.value)}
                                className="config-input"
                                placeholder="blue"
                            />
                        </div>
                    </div>
                </div>
            );

        case 'escala':
            return (
                <div className="config-editor">
                    <div className="config-row">
                        <div className="config-field">
                            <label>Mínimo:</label>
                            <input
                                type="number"
                                value={localConfig.min || ''}
                                onChange={(e) => handleChange('min', parseInt(e.target.value) || 0)}
                                className="config-input"
                            />
                        </div>
                        <div className="config-field">
                            <label>Máximo:</label>
                            <input
                                type="number"
                                value={localConfig.max || ''}
                                onChange={(e) => handleChange('max', parseInt(e.target.value) || 0)}
                                className="config-input"
                            />
                        </div>
                        <div className="config-field">
                            <label>Operación:</label>
                            <input
                                type="number"
                                value={localConfig.operation || ''}
                                onChange={(e) => handleChange('operation', parseInt(e.target.value) || 0)}
                                className="config-input"
                                placeholder="10"
                            />
                        </div>
                        <div className="config-field">
                            <label>Rango (texto):</label>
                            <input
                                type="text"
                                value={localConfig.range || ''}
                                onChange={(e) => handleChange('range', e.target.value)}
                                className="config-input"
                                placeholder="1 al 50"
                            />
                        </div>
                        <div className="config-field">
                            <label>Color:</label>
                            <input
                                type="text"
                                value={localConfig.color || ''}
                                onChange={(e) => handleChange('color', e.target.value)}
                                className="config-input"
                                placeholder="blue"
                            />
                        </div>
                    </div>
                </div>
            );

        case 'escritura':
            return (
                <div className="config-editor">
                    <div className="config-row">
                        <div className="config-field">
                            <label>Mínimo:</label>
                            <input
                                type="number"
                                value={localConfig.min || ''}
                                onChange={(e) => handleChange('min', parseInt(e.target.value) || 0)}
                                className="config-input"
                            />
                        </div>
                        <div className="config-field">
                            <label>Máximo:</label>
                            <input
                                type="number"
                                value={localConfig.max || ''}
                                onChange={(e) => handleChange('max', parseInt(e.target.value) || 0)}
                                className="config-input"
                            />
                        </div>
                        <div className="config-field">
                            <label>Rango (texto):</label>
                            <input
                                type="text"
                                value={localConfig.range || ''}
                                onChange={(e) => handleChange('range', e.target.value)}
                                className="config-input"
                                placeholder="1 - 50"
                            />
                        </div>
                    </div>
                </div>
            );

        case 'calculos':
            return (
                <div className="config-editor">
                    <div className="config-row">
                        <div className="config-field">
                            <label>Mínimo:</label>
                            <input
                                type="number"
                                value={localConfig.min || ''}
                                onChange={(e) => handleChange('min', parseInt(e.target.value) || 0)}
                                className="config-input"
                            />
                        </div>
                        <div className="config-field">
                            <label>Máximo:</label>
                            <input
                                type="number"
                                value={localConfig.max || ''}
                                onChange={(e) => handleChange('max', parseInt(e.target.value) || 0)}
                                className="config-input"
                            />
                        </div>
                        <div className="config-field">
                            <label>Mínimo Resultado:</label>
                            <input
                                type="number"
                                value={localConfig.minResult || ''}
                                onChange={(e) => handleChange('minResult', parseInt(e.target.value) || 0)}
                                className="config-input"
                            />
                        </div>
                        <div className="config-field">
                            <label>Máximo Resultado:</label>
                            <input
                                type="number"
                                value={localConfig.maxResult || ''}
                                onChange={(e) => handleChange('maxResult', parseInt(e.target.value) || 0)}
                                className="config-input"
                            />
                        </div>
                        {localConfig.operation !== undefined && (
                            <div className="config-field">
                                <label>Operación:</label>
                                <input
                                    type="text"
                                    value={localConfig.operation || ''}
                                    onChange={(e) => handleChange('operation', e.target.value)}
                                    className="config-input"
                                    placeholder="suma, resta, multiplicacion"
                                />
                            </div>
                        )}
                        {localConfig.hasUnknown !== undefined && (
                            <div className="config-field">
                                <label>Con incógnita:</label>
                                <input
                                    type="checkbox"
                                    checked={localConfig.hasUnknown || false}
                                    onChange={(e) => handleChange('hasUnknown', e.target.checked)}
                                    className="config-input"
                                />
                            </div>
                        )}
                        {localConfig.multiplier && (
                            <div className="config-field">
                                <label>Multiplicadores (JSON array):</label>
                                <input
                                    type="text"
                                    value={Array.isArray(localConfig.multiplier) ? JSON.stringify(localConfig.multiplier) : localConfig.multiplier}
                                    onChange={(e) => {
                                        try {
                                            const parsed = JSON.parse(e.target.value);
                                            if (Array.isArray(parsed)) {
                                                handleChange('multiplier', parsed);
                                            }
                                        } catch {
                                            handleChange('multiplier', e.target.value);
                                        }
                                    }}
                                    className="config-input"
                                    placeholder='[10, 100, 1000]'
                                />
                            </div>
                        )}
                        {localConfig.color && (
                            <div className="config-field">
                                <label>Color:</label>
                                <input
                                    type="text"
                                    value={localConfig.color || ''}
                                    onChange={(e) => handleChange('color', e.target.value)}
                                    className="config-input"
                                />
                            </div>
                        )}
                        {localConfig.icon && (
                            <div className="config-field">
                                <label>Icono:</label>
                                <input
                                    type="text"
                                    value={localConfig.icon || ''}
                                    onChange={(e) => handleChange('icon', e.target.value)}
                                    className="config-input"
                                />
                            </div>
                        )}
                    </div>
                </div>
            );

        default:
            return (
                <div className="config-editor">
                    <textarea
                        value={JSON.stringify(localConfig, null, 2)}
                        onChange={(e) => {
                            try {
                const parsed = JSON.parse(e.target.value);
                setLocalConfig(parsed);
                onChange(parsed);
              } catch {
              }
                        }}
                        className="config-json"
                        rows="4"
                    />
                </div>
            );
    }
}

export default function AdminGameConfig() {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [levels, setLevels] = useState([]);
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
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/games/all-with-levels`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
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

    const handleSelectGame = (game) => {
        setSelectedGame(game);
        setLevels(game.levels || []);
        setEditingLevel(null);
        setEditForm({});
    };

    const handleBackToGames = () => {
        setSelectedGame(null);
        setLevels([]);
        setEditingLevel(null);
        setEditForm({});
    };

    const handleEditLevel = (level) => {
        setEditingLevel(level.id);
        setEditForm({
            name: level.name,
            description: level.description,
            difficulty: level.difficulty,
            activitiesCount: level.activitiesCount,
            config: level.config || {},
            isActive: true
        });
    };

    const handleCancelEdit = () => {
        setEditingLevel(null);
        setEditForm({});
    };

    const handleInputChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleConfigChange = (newConfig) => {
        setEditForm(prev => ({
            ...prev,
            config: newConfig
        }));
    };

    const handleSaveLevel = async (levelId) => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/games/levels/${levelId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editForm.name,
                    description: editForm.description,
                    difficulty: editForm.difficulty,
                    activitiesCount: parseInt(editForm.activitiesCount),
                    config: editForm.config,
                    isActive: true
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar');
            }

            const loadGames = async () => {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/games/all-with-levels`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                setGames(data.games || []);
                const updatedGame = data.games.find(g => g.gameId === selectedGame.gameId);
                if (updatedGame) {
                    setSelectedGame(updatedGame);
                    setLevels(updatedGame.levels || []);
                }
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

    const getGameDisplayName = (gameId) => {
        return GAME_NAMES[gameId] || gameId.replace('game-', '').charAt(0).toUpperCase() + gameId.replace('game-', '').slice(1);
    };

    if (loading) {
        return (
            <div className="admin-game-levels">
                <div className="loading">Cargando juegos...</div>
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

    if (!selectedGame) {
        return (
            <div className="admin-game-levels">
                <div className="page-header">
                    <h1>Configuración de Juegos</h1>
                    <p>Selecciona un juego para gestionar sus niveles</p>
                </div>

                {games.length === 0 ? (
                    <div className="no-games">
                        <p>No hay juegos configurados</p>
                    </div>
                ) : (
                    <div className="games-grid-modern">
                        {games.map((game) => {
                            const totalActivities = game.levels?.reduce((sum, level) => sum + (level.activitiesCount || 0), 0) || 0;
                            const IconComponent = GAME_ICON_COMPONENTS[game.gameId];
                            const colors = GAME_COLORS[game.gameId] || {
                                bg: 'from-gray-500/10 to-gray-600/10',
                                icon: 'text-gray-600',
                                iconBg: 'bg-gray-100'
                            };

                            return (
                                <div
                                    key={game.gameId}
                                    onClick={() => handleSelectGame(game)}
                                    className="game-card-v0"
                                >
                                    <div className={`game-card-gradient ${colors.bg}`} />

                                    <div className="game-card-content">
                                        <div className="game-card-header-v0">
                                            <div className="game-icon-wrapper-v0">
                                                <div className={`game-icon-bg ${colors.iconBg}`}>
                                                    {IconComponent && <IconComponent className={`game-icon-svg ${colors.icon}`} />}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="game-title-v0">
                                                    {getGameDisplayName(game.gameId)}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="game-stats-v0">
                                            <div className="game-stat-col">
                                                <span className="stat-number-v0">{game.totalLevels}</span>
                                                <span className="stat-label-v0">Niveles</span>
                                            </div>
                                            <div className="game-stat-col">
                                                <span className="stat-number-v0">{totalActivities}</span>
                                                <span className="stat-label-v0">Actividades</span>
                                            </div>
                                        </div>

                                        <div className="game-action-v0">
                                            <span>Gestionar</span>
                                            <ArrowRight className="arrow-icon-v0" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="admin-game-levels">
            <div className="page-header">
                <div className="page-header-top">
                    <button 
                        onClick={handleBackToGames}
                        className="btn-back-v0"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Volver a juegos
                    </button>
                </div>
                <h1>{getGameDisplayName(selectedGame.gameId)}</h1>
                <p>Gestiona los niveles y configuraciones</p>
            </div>

            {levels.length === 0 ? (
                <div className="no-levels">
                    <p>No hay niveles configurados para este juego</p>
                    <button 
                        onClick={handleBackToGames}
                        className="btn-back-v0"
                        style={{ marginTop: '1rem' }}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Volver a juegos
                    </button>
                </div>
            ) : (
                <div className="levels-table-container">
                    <table className="levels-table">
                        <thead>
                            <tr>
                                <th>Nivel</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Dificultad</th>
                                <th>Actividades</th>
                                <th>Configuración</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {levels.map((level) => (
                                <tr key={level.id} className={!level.isActive ? 'inactive-row' : ''}>
                                    {editingLevel === level.id ? (
                                        <>
                                            <td>{level.level}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={editForm.name || ''}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    className="table-input"
                                                />
                                            </td>
                                            <td>
                                                <textarea
                                                    value={editForm.description || ''}
                                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                                    className="table-textarea"
                                                    rows="2"
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={editForm.difficulty || ''}
                                                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                                                    className="table-select"
                                                >
                                                    {DIFFICULTY_OPTIONS.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={editForm.activitiesCount || ''}
                                                    onChange={(e) => handleInputChange('activitiesCount', e.target.value)}
                                                    className="table-input"
                                                    min="1"
                                                />
                                            </td>
                                            <td>
                                                <ConfigEditor
                                                    gameId={selectedGame.gameId}
                                                    config={editForm.config}
                                                    onChange={handleConfigChange}
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleSaveLevel(level.id)}
                                                    disabled={saving}
                                                    className="btn-save-small"
                                                >
                                                    {saving ? '...' : '✓'}
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    disabled={saving}
                                                    className="btn-cancel-small"
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{level.level}</td>
                                            <td>{level.name}</td>
                                            <td>{level.description}</td>
                                            <td>{level.difficulty}</td>
                                            <td>{level.activitiesCount}</td>
                                            <td>
                                                <div className="config-preview">
                                                    {level.config?.min !== undefined && level.config?.max !== undefined && (
                                                        <span>Rango: {level.config.min} - {level.config.max}</span>
                                                    )}
                                                    {level.config?.numbersCount && (
                                                        <span>Números: {level.config.numbersCount}</span>
                                                    )}
                                                    {level.config?.operation !== undefined && (
                                                        <span>Op: {level.config.operation}</span>
                                                    )}
                                                    {level.config?.range && (
                                                        <span>Rango: {level.config.range}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleEditLevel(level)}
                                                    className="btn-edit-small"
                                                >
                                                    ✏️
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

