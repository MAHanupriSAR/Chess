import './Square.css'
import Piece from './Piece';

export default function Square({row, col, piece}){
    const isBlack = (row + col) % 2 === 1;
    const colorClass = isBlack ? "black_square" : "white_square";
    return (
        <div className={`square ${colorClass}`}>
            <Piece piece={piece}></Piece>
        </div>
    );
}