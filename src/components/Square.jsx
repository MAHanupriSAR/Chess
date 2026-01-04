import './Square.css'
import Piece from './Piece';

export default function Square({ row, col, piece, handleClick, isSelected, isValidMove, isCapture, isInteractive }){
    const isBlack = (row + col) % 2 === 1;
    let colorClass = isBlack ? "black_square" : "white_square";
    if (isSelected) {
        colorClass = "selected";
    }
    if(isInteractive){
        colorClass += " interactive"
    }
    if(isValidMove){
        colorClass += " valid_move";
    }
    if(isCapture){
        colorClass += " capture_hint";
    }
    return (
        <div className={`square ${colorClass}`} onClick={handleClick}>
            <Piece piece={piece}></Piece>
        </div>
    );
}