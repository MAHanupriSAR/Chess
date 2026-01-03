import Square from './Square';
import fenToBoard from '../utils/fenOperations';
import './Board.css';

export default function Board({fenString}) {
    const boardConfig = fenToBoard(fenString);
    const boardSquares = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const index = row * 8 + col;
            const piece = boardConfig[row][col];
            boardSquares.push(
                <Square key={index} row={row} col={col} piece={piece}/>
            );
        }
    }
    function handleClick(e){
        console.log(e.target);
    }
    return (
        <div onClick={handleClick} className="board">
            {boardSquares}
        </div>
    );
}