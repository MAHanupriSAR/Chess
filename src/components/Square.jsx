import './Square.css'
import Piece from './Piece';

export default function Square({ row, col, piece, handleClick, isSelected }){
    const isBlack = (row + col) % 2 === 1;
    let colorClass = isBlack ? "black_square" : "white_square";
    if (isSelected) {
        colorClass = "selected";
    }
    return (
        <div className={`square ${colorClass}`} onClick={handleClick}>
            <Piece piece={piece}></Piece>
        </div>
    );
}