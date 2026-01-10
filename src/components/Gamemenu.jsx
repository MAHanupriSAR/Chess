import React, { useState } from 'react';
import './GameMenu.css';

export default function GameMenu({ onStartGame }) {
    const [showComputerOptions, setShowComputerOptions] = useState(false);

    return (
        <div className="game-menu">
            <h1 className="menu-title">Chess</h1>
            
            {!showComputerOptions ? (
                <div className="menu-options">
                    <button 
                        className="menu-btn"
                        onClick={() => onStartGame({ vsComputer: false, playerColor: 'white' })}
                    >
                        Play vs Human
                    </button>

                    <button 
                        className="menu-btn"
                        onClick={() => setShowComputerOptions(true)}
                    >
                        Play vs Computer
                    </button>
                </div>
            ) : (
                <div className="menu-options">
                    <h3 className="menu-sub-title">Choose Side</h3>
                    <div className="color-selection">
                        <button 
                            className="menu-btn"
                            onClick={() => onStartGame({ vsComputer: true, playerColor: 'white' })}
                        >
                            White
                        </button>
                        <button 
                            className="menu-btn"
                            onClick={() => onStartGame({ vsComputer: true, playerColor: 'black' })}
                        >
                            Black
                        </button>
                    </div>
                    <button 
                        className="menu-btn back-btn"
                        onClick={() => setShowComputerOptions(false)}
                    >
                        Back
                    </button>
                </div>
            )}
        </div>
    );
}