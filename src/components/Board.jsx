import Square from './Square';
import './Board.css';
import { useEffect, useState } from 'react';

import {fenToBoard, getPieceColor} from '../utils/helperFunctions';
import {getValidMoves} from '../utils/moveRules';
import { executeMove, updateCastlingRights, initialCastlingRights, isGameOver } from '../utils/gamelogic';
import { getComputerMove } from '../engine/chessEngine';

import moveSoundFile from '../assets/sounds/move_self.mp3';
import captureSoundFile from '../assets/sounds/capture.mp3'

export default function Board({ fenString, vsComputer, playerColor, onReset }) {
    const selfPieceColor = playerColor;
    const opponentPieceColor = selfPieceColor==="white" ? "black" : "white";

    const [turn, setTurn] = useState(selfPieceColor);
    const [board, setBoard] = useState(() => fenToBoard(fenString));
    const [castlingRights, setCastlingRights] = useState(initialCastlingRights);

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
                const move = getComputerMove(board, opponentPieceColor, selfPieceColor, castlingRights);
                if (move) {
                    performMove(move.fromRow, move.fromCol, move.toRow, move.toCol)
                }
            }, 50);
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
                selectPiece(row, col);
            }
            return;
        }
        const { row: prevRow, col: prevCol } = selectedSquare;

        if (prevRow === row && prevCol === col) {
            deselectPiece();
            return;
        }
        
        // Check for same color pieces -> switch piece selection
        if(board[row][col] && getPieceColor(board[row][col]) == getPieceColor(board[prevRow][prevCol])){
            selectPiece(row, col);
            return;
        }
        
        if (!validMoves.has(`${row},${col}`)) {
            return;
        }

        performMove(prevRow, prevCol, row, col);
    }

    function selectPiece(row, col){
        setSelectedSquare({row,col});
        const validMoves = getValidMoves(board[row][col], row, col, board, selfPieceColor, castlingRights);
        const moveSet = new Set(validMoves.map(m => `${m.row},${m.col}`));
        setValidMoves(moveSet);
    }

    function deselectPiece(){
        setSelectedSquare(null);
        setValidMoves(new Set());
    }

    function performMove(fromRow, fromCol, toRow, toCol){
        const isCapture = board[toRow][toCol] !== null;
        const newRights = updateCastlingRights(castlingRights, fromRow, fromCol, toRow, toCol, board);
        const newBoard = executeMove(board, fromRow, fromCol, toRow, toCol);

        setCastlingRights(newRights);
        setBoard(newBoard);
        setTurn(turn === "white" ? "black" : "white");
        deselectPiece();

        new Audio(isCapture ? captureSoundFile : moveSoundFile).play();
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
                {/* <i className="fa-jelly fa-solid fa-arrow-left"></i> */}
                {/* <i className="fa-solid fa-caret-left"></i> */}
                {/* <i className="fa-solid fa-circle-arrow-left"></i> */}
                {/* <i className="fa-solid fa-circle-chevron-left"></i> */}
                {/* <i className="fa-solid fa-circle-left"></i> */}
                <i className="fa-regular fa-circle-left"></i>
                {/* <i className="fa-solid fa-left-long"></i> */}
            </button>
        </div>
    );
}