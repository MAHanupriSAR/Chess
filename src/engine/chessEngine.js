import {getValidMoves} from "../utils/moveRules";
import {getPieceColor} from "../utils/helperFunctions";

export function getComputerMove(board, computerColor, selfPieceColor, castlingRights) {
    let allSafeMoves = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            const pieceType = piece.toLowerCase();
            
            if (piece && getPieceColor(piece) === computerColor) {
                
                const validMoves = getValidMoves(piece, row, col, board, selfPieceColor, castlingRights);

                validMoves.forEach(move => {
                    allSafeMoves.push({
                        fromRow: row,
                        fromCol: col,
                        toRow: move.row,
                        toCol: move.col,
                        promoteTo: (pieceType==='p' && (toRow === 0 || toRow===7)) ? 'q' : null
                    });
                });
            }
        }
    }

    if (allSafeMoves.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * allSafeMoves.length);
    return allSafeMoves[randomIndex];
}