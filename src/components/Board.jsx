import Square from './Square';
import fenToBoard from '../utils/fenOperations';

import './Board.css';
import { useEffect, useState } from 'react';
import getPieceColor from '../utils/getPieceColor';
import getValidMoves from '../utils/moveRules';
import { isMoveSafe, isGameOver } from '../utils/checkmateLogic';
import { getComputerMove } from '../engine/chessEngine';

import moveSoundFile from '../assets/sounds/move_self.mp3';
import captureSoundFile from '../assets/sounds/capture.mp3'

export default function Board({ fenString, vsComputer, playerColor, onReset }) {
    const selfPieceColor = playerColor;
    const opponentPieceColor = selfPieceColor==="white" ? "black" : "white";
    const [turn, setTurn] = useState(selfPieceColor);
    const [board, setBoard] = useState(() => fenToBoard(fenString));
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validMoves, setValidMoves] = useState(new Set());
    const [gameStatus, setGameStatus] = useState(null);

    useEffect(()=>{
        const result = isGameOver(board, turn);
        if(result){
            setGameStatus(result);
            alert(`Game Over: ${result.toUpperCase()}!`);
        }
    },[board, turn]);

    useEffect(()=>{
        if(vsComputer && turn === opponentPieceColor && !gameStatus){
            const timer = setTimeout(() => {
                const move = getComputerMove(board, opponentPieceColor);
                
                if (move) {
                    movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
                    setTurn(selfPieceColor);
                }
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [turn, board, gameStatus])

    function handleSquareClick(row, col){
        if(gameStatus)return;
        if(vsComputer && turn === opponentPieceColor)return;
        if(!selectedSquare){
            if(board[row][col] && getPieceColor(board[row][col]) != turn){
                return;
            }
            if(board[row][col]){
                setSelectedSquare({row,col});
                const validMoves = getValidMoves(board[row][col], row, col, board, selfPieceColor);
                const safeAndValidMoves = validMoves.filter((validMove)=>{
                    return isMoveSafe(board, row, col, validMove.row, validMove.col, turn, selfPieceColor);
                });
                const moveSet = new Set(safeAndValidMoves.map(m => `${m.row},${m.col}`));
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
            const validMoves = getValidMoves(board[row][col], row, col, board, selfPieceColor);
            const safeAndValidMoves = validMoves.filter((validMove)=>{
                return isMoveSafe(board, row, col, validMove.row, validMove.col, turn, selfPieceColor);
            });
            const moveSet = new Set(safeAndValidMoves.map(m => `${m.row},${m.col}`));
            setValidMoves(moveSet);
            return;
        }
        
        if (!validMoves.has(`${row},${col}`)) {
            return;
        }

        movePiece(prevRow, prevCol, row, col);

        setTurn(turn==selfPieceColor?opponentPieceColor:selfPieceColor);
    }

    function movePiece(fromRow, fromCol, toRow, toCol) {
        const newBoard = board.map(r => [...r]);

        const isCapture = newBoard[toRow][toCol] !== null;

        newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = null;

        setBoard(newBoard);
        setSelectedSquare(null);
        setValidMoves(new Set());

        if(!isCapture){ 
            new Audio(moveSoundFile).play();
        }
        else{
            new Audio(captureSoundFile).play();
        }
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

            //a sqaure will be interactive only when it satisfies following:
            //color of piece in square = turn
            //it is a hint
            //it is a capture
            let isInteractive = false;
            if(vsComputer){
                isInteractive = (piece && getPieceColor(piece)===selfPieceColor && getPieceColor(piece)===turn) ||isHint || isCapture
            }
            else{
                isInteractive = (piece && getPieceColor(piece)===turn) ||isHint || isCapture
            }

            boardSquares.push(
                <Square 
                    key={index} 
                    row={row} 
                    col={col} 
                    piece={piece}
                    isSelected={isSelected}
                    isValidMove = {isHint}
                    isCapture = {isCapture}
                    isInteractive={isInteractive}
                    handleClick={() => handleSquareClick(row, col)}
                />
            );
        }
    }
    // return (
    //     <div className="board">
    //         {boardSquares}
    //     </div>
    // );
    return (
        <div className="board-container">
            <div className="board">
                {boardSquares}
            </div>
            <button className="exit-btn" onClick={onReset}>
                ←
            </button>
        </div>
    );
}