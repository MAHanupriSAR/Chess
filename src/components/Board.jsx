import Square from './Square';
import fenToBoard from '../utils/fenOperations';

import './Board.css';
import { useState } from 'react';
import getPieceColor from '../utils/getPieceColor';
import getValidMoves from '../utils/moveRules';

export default function Board({fenString}) {
    const [turn, setTurn] = useState("white");
    const [board, setBoard] = useState(() => fenToBoard(fenString));
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validMoves, setValidMoves] = useState(new Set());

    function handleSquareClick(row, col){
        if(!selectedSquare){
            if(board[row][col] && getPieceColor(board[row][col]) != turn){
                return;
            }
            if(board[row][col]){
                //if king is getting checkmated and this piece cant save it, we cant select it
                setSelectedSquare({row,col});
                const moves = getValidMoves(board[row][col], row, col, board);
                const moveSet = new Set(moves.map(m => `${m.row},${m.col}`));
                setValidMoves(moveSet);
            }
            return;
        }
        const { row: prevRow, col: prevCol } = selectedSquare;

        if (prevRow === row && prevCol === col) {
            setSelectedSquare(null);
            setValidMoves(new Set());
            return;
        }
        
        // Check for same color pieces -> switch piece selection
        if(board[row][col] && getPieceColor(board[row][col]) == getPieceColor(board[prevRow][prevCol])){
            setSelectedSquare({row,col});
            const moves = getValidMoves(board[row][col], row, col, board);
            const moveSet = new Set(moves.map(m => `${m.row},${m.col}`));
            setValidMoves(moveSet);
            return;
        }
        
        if (!validMoves.has(`${row},${col}`)) {
            return;
        }

        movePiece(prevRow, prevCol, row, col);

        setTurn(turn=="white"?"black":"white");
    }

    function movePiece(fromRow, fromCol, toRow, toCol) {
        const newBoard = board.map(r => [...r]);

        newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = null;

        setBoard(newBoard);
        setSelectedSquare(null);
        setValidMoves(new Set());
    }

    const boardSquares = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const index = row * 8 + col;
            const piece = board[row][col];
            
            //three cases can arise
            //case1: this square is the one we selected
            const isSelected = selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
            
            //case2: this square is a blank square and hence a hint square
            const isHint = validMoves.has(`${row},${col}`);

            //case3 this square contains a piece and can be captured
            const isCapture = isHint && piece !== null;

            boardSquares.push(
                <Square 
                    key={index} 
                    row={row} 
                    col={col} 
                    piece={piece}
                    isSelected={isSelected}
                    isValidMove = {isHint}
                    isCapture = {isCapture}
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