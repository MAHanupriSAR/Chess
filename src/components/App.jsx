import { useState } from 'react';
import Board from './Board';
import GameMenu from './Gamemenu';
import './App.css';

export default function App() {
    const [gameConfig, setGameConfig] = useState(null); 

    function handleStartGame(config) {
        setGameConfig(config);
    }

    function handleReset() {
        setGameConfig(null);
    }

    return (
        <div className="app-container">
            {!gameConfig ? (
                <GameMenu onStartGame={handleStartGame} />
            ) : (
                <Board
                    fenString= {gameConfig.playerColor==="white"?"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1":"RNBQKBNR/PPPPPPPP/8/8/8/8/pppppppp/rnbqkbnr w KQkq - 0 1"}
                    vsComputer={gameConfig.vsComputer}
                    playerColor={gameConfig.playerColor || 'white'}
                    onReset={handleReset}
                />
            )}
        </div>
    );
}