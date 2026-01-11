import {getPieceColor} from "./helperFunctions";
import {getValidMoves} from "./moveRules";

export function isGameOver(board,turnColor,selfPieceColor){
    let hasLegalMove = false;

    for(let row = 0; row<8; row++){
        for(let col = 0; col<8; col++){
            const piece = board[row][col];
            if(!piece) continue;
            if(getPieceColor(piece) !== turnColor) continue;
            const moves = getValidMoves(piece, row, col, board, selfPieceColor);
            if(moves) hasLegalMove = true;
            if(hasLegalMove) break;
        }
        if(hasLegalMove) break;
    }

    if(hasLegalMove) return null;

    if(isCheck(board, turnColor)){
        return "checkmate";
    }
    else{
        return "stalemate";
    }
}

export const initialCastlingRights = {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true
};

export function executeMove(currentBoard, fromRow, fromCol, toRow, toCol) {
    const newBoard = currentBoard.map(r => [...r]);
    const piece = newBoard[fromRow][fromCol];
    const pieceType = piece.toLowerCase();

    // 1. Move the Piece
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;

    // 2. Handle Castling (Move the Rook)
    if (pieceType === 'k' && Math.abs(toCol - fromCol) === 2) {
        const isKingSide = toCol > fromCol;
        const rookCol = isKingSide ? 7 : 0;
        const rookTargetCol = isKingSide ? 5 : 3;
        
        // Move Rook
        const rook = newBoard[fromRow][rookCol];
        newBoard[fromRow][rookTargetCol] = rook;
        newBoard[fromRow][rookCol] = null;
    }

    return newBoard;
}

export function updateCastlingRights(prevRights, fromRow, fromCol, toRow, toCol, board) {
    const newRights = { ...prevRights };
    const piece = board[fromRow][fromCol];
    const pieceType = piece.toLowerCase();
    const color = getPieceColor(piece);

    // Helper to revoke
    const revoke = (c, side) => { newRights[`${c}${side}Side`] = false; };

    // 1. King Moves -> Revoke both
    if (pieceType === 'k') {
        revoke(color, 'King');
        revoke(color, 'Queen');
    }

    // 2. Rook Moves -> Revoke specific side
    if (pieceType === 'r') {
        if (fromCol === 0) revoke(color, 'Queen');
        if (fromCol === 7) revoke(color, 'King');
    }

    // 3. Rook Captured -> Revoke opponent's side
    if (board[toRow][toCol]) { // If there was a piece at target
        const captured = board[toRow][toCol];
        if (captured.toLowerCase() === 'r') {
            const capturedColor = getPieceColor(captured);
            // Check original rook positions (0 and 7)
            if (toCol === 0) revoke(capturedColor, 'Queen');
            if (toCol === 7) revoke(capturedColor, 'King');
        }
    }

    return newRights;
}