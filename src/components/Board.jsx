import Square from './Square';
import fenToBoard from '../utils/fenOperations';

import './Board.css';
import { useState } from 'react';
import getPieceColor from '../utils/getPieceColor';

export default function Board({fenString}) {
    
    const [board, setBoard] = useState(() => fenToBoard(fenString));
    const [selectedSquare, setSelectedSquare] = useState(null);

    function handleSquareClick(row, col){
        if(!selectedSquare){
            if(board[row][col]){
                setSelectedSquare({row,col});
            }
            return;
        }
        const { row: prevRow, col: prevCol } = selectedSquare;

        if (prevRow === row && prevCol === col) {
            setSelectedSquare(null);
            return;
        }
        
        // Check for same color pieces
        if(board[row][col] && getPieceColor(board[row][col]) == getPieceColor(board[prevRow][prevCol])){
            setSelectedSquare({row,col});
            return;
        }
        
        movePiece(prevRow, prevCol, row, col);
    }

    function movePiece(fromRow, fromCol, toRow, toCol) {
        const newBoard = board.map(r => [...r]);

        newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = null;

        setBoard(newBoard);
        setSelectedSquare(null);
    }

    const boardSquares = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const index = row * 8 + col;
            const piece = board[row][col];

            const isSelected = selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
            boardSquares.push(
                <Square 
                    key={index} 
                    row={row} 
                    col={col} 
                    piece={piece}
                    isSelected={isSelected}
                    handleClick={() => handleSquareClick(row, col)}
                />
            );
        }
    }
    return (
        <div className="board">
            {boardSquares}
        </div>
    );
}