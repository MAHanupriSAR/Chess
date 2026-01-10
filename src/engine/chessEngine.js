import getValidMoves from "../utils/moveRules";
import { isMoveSafe } from "../utils/checkmateLogic";
import getPieceColor from "../utils/getPieceColor";

export function getComputerMove(board, computerColor) {
    let allSafeMoves = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            
            if (piece && getPieceColor(piece) === computerColor) {
                
                const validMoves = getValidMoves(piece, row, col, board);

                const safeMoves = validMoves.filter(move => 
                    isMoveSafe(board, row, col, move.row, move.col, computerColor)
                );

                safeMoves.forEach(move => {
                    allSafeMoves.push({
                        fromRow: row,
                        fromCol: col,
                        toRow: move.row,
                        toCol: move.col
                    });
                });
            }
        }
    }

    if (allSafeMoves.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * allSafeMoves.length);
    return allSafeMoves[randomIndex];
}