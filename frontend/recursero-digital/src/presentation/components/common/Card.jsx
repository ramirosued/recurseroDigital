import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiRequest } from '../../../infrastructure/config/api';
import '../../styles/components/card.css';
import DefaultGameImage from '../../../assets/JuegoOrdenamiento-fontpage.png';

const imageModules = import.meta.glob('../../../assets/*', { eager: true });
const IMAGE_MAP = Object.entries(imageModules).reduce((acc, [path, module]) => {
  const fileName = path.split('/').pop();
  if (fileName && module && typeof module === 'object' && 'default' in module) {
    acc[fileName] = module.default;
  }
  return acc;
}, {});

const resolveGameImage = (imageUrl) => {
  if (!imageUrl) {
    return IMAGE_MAP['JuegoOrdenamiento-fontpage.png'] || DefaultGameImage;
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  const fileName = imageUrl.split('/').pop();
  if (fileName && IMAGE_MAP[fileName]) {
    return IMAGE_MAP[fileName];
  }

  return DefaultGameImage;
};

export function Card() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiRequest('/student/me/games');

        if (response.ok && response.data && Array.isArray(response.data.games)) {
          const transformedGames = response.data.games
            .filter((courseGame) => courseGame?.game)
            .map((courseGame) => {
              const gameData = courseGame.game;
              return {
                id: gameData.id,
                name: gameData.name,
                description: gameData.description,
                imageUrl: resolveGameImage(gameData.imageUrl),
                route: gameData.route || '/alumno/juegos',
                difficultyLevel: gameData.difficultyLevel ?? 1,
                orderIndex: courseGame.orderIndex ?? 0
              };
            });

          setGames(transformedGames);
        } else {
          setGames([]);
          setError('No fue posible obtener los juegos del curso.');
        }
      } catch (fetchError) {
        console.error('Error al cargar juegos:', fetchError);
        setError('Error al cargar los juegos. Inténtalo nuevamente.');
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleJugar = (route) => {
    navigate(route);
  };

  if (loading) {
    return <div className="container">Cargando juegos...</div>;
  }

  if (error ||games.length === 0) {
    return <div className="container">Por el momento no tienes juegos asignados.</div>;
  }

    return (
        <>
            <div className='contenedor-card'>
                {games
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((game) => (
                        <box className="card" key={game.id}>
                            <img src={game.imageUrl} alt={game.name} className="imagegame"/>
                            <div className='textgame'>
                                <h2 className="titlegame">{game.name}</h2>
                                <p className="descriptiongame">{game.description}</p>
                                <button className="buttongame" onClick={() => handleJugar(game.route)}>Jugar</button>
                            </div>
                        </box>
                    ))
                }
            </div>
        </>
    )
}
