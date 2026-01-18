import {getPieceColor} from "./helperFunctions";

export function isCheck(board, kingColor, selfPieceColor) {
    let kingRow, kingCol;
    const kingChar = kingColor === "white" ? "K" : "k";

    outerLoop: for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === kingChar) {
                kingRow = r;
                kingCol = c;
                break outerLoop;
            }
        }
    }

    if (kingRow === undefined) return false;

    const enemyColor = kingColor === "white" ? "black" : "white";

    // Check if Knight cuts king
    const knightOffsets = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
    for (const [dr, dc] of knightOffsets) {
        const r = kingRow + dr, c = kingCol + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const piece = board[r][c];
            if (piece && getPieceColor(piece) === enemyColor && piece.toLowerCase() === 'n') {
                return true;
            }
        }
    }

    // 3. Check Sliding Threats (Rooks, Bishops, Queens)
    // We send out a "Ray" in 8 directions. The first piece we hit is the only one that matters.
    const directions = [
        { dr: -1, dc: 0, types: ['r', 'q'] }, // Up (Rook/Queen)
        { dr: 1, dc: 0, types: ['r', 'q'] },  // Down
        { dr: 0, dc: -1, types: ['r', 'q'] }, // Left
        { dr: 0, dc: 1, types: ['r', 'q'] },  // Right
        { dr: -1, dc: -1, types: ['b', 'q'] }, // Top-Left (Bishop/Queen)
        { dr: -1, dc: 1, types: ['b', 'q'] },  // Top-Right
        { dr: 1, dc: -1, types: ['b', 'q'] },  // Bottom-Left
        { dr: 1, dc: 1, types: ['b', 'q'] }    // 
    ];

    for (const dir of directions) {
        let r = kingRow + dir.dr;
        let c = kingCol + dir.dc;

        // Keep moving in this direction until we hit a wall or a piece
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const piece = board[r][c];
            if (piece) {
                // If we hit a piece, stop the ray.
                if (getPieceColor(piece) === enemyColor) {
                    // Check if this enemy piece can actually attack in this direction
                    if (dir.types.includes(piece.toLowerCase())) {
                        return true;
                    }
                }
                break; // Blocked by a piece (either friend or foe)
            }
            r += dir.dr;
            c += dir.dc;
        }
    }

    // 4. Check Pawn Threats
    // Pawns only attack diagonally forward.
    // selfPieceColor King looks "Up" (-1) for opponentPieceColor Pawns. opponentPieceColor King looks "Down" (+1).
    const pawnDir = kingColor === selfPieceColor ? -1 : 1; 
    const pawnOffsets = [[pawnDir, -1], [pawnDir, 1]];
    
    for (const [dr, dc] of pawnOffsets) {
        const r = kingRow + dr, c = kingCol + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const piece = board[r][c];
            if (piece && getPieceColor(piece) === enemyColor && piece.toLowerCase() === 'p') {
                return true;
            }
        }
    }

    // 5. Check King Threats (Rare, but Kings can't stand next to each other)
    const kingOffsets = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    for(const [dr,dc] of kingOffsets){
         const r = kingRow + dr, c = kingCol + dc;
         if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const piece = board[r][c];
            if (piece && getPieceColor(piece) === enemyColor && piece.toLowerCase() === 'k') {
                return true;
            }
         }
    }

    return false;
}

// --- OPTIMIZATION 2: Make/Unmake (Zero Memory Allocation) ---
// Standard engines don't "copy" the board (which is slow). 
// They make the move on the real board, check safety, and then undo it immediately.

// export function isMoveSafe(board, fromRow, fromCol, toRow, toCol, turnColor, selfPieceColor) {
//     const movingPiece = board[fromRow][fromCol];
//     const capturedPiece = board[toRow][toCol]; // Save what was there (if any)

//     // 1. MAKE Move (Modify board in-place)
//     board[toRow][toCol] = movingPiece;
//     board[fromRow][fromCol] = null;

//     // 2. CHECK Safety
//     // We pass the SAME board object, which is now temporarily updated.
//     const safe = !isCheck(board, turnColor, selfPieceColor);
     
//     // 3. UNMAKE Move (Restore board exactly as it was)
//     board[fromRow][fromCol] = movingPiece;
//     board[toRow][toCol] = capturedPiece;

//     return safe;
// }

export function isMoveSafe(board, fromRow, fromCol, toRow, toCol, turnColor, selfPieceColor, enPassantTarget) {
    const movingPiece = board[fromRow][fromCol];
    const capturedPiece = board[toRow][toCol];

    const isCastling = movingPiece.toLowerCase() === 'k' && Math.abs(toCol - fromCol) === 2;
    const isEnPassant = movingPiece.toLowerCase() === 'p' && enPassantTarget && toRow === enPassantTarget.row && toCol === enPassantTarget.col;
    
    let rookRow, rookCol, rookTargetCol, rookPiece;
    let epCapturedRow, epCapturedCol, epCapturedPiece;

    if (isCastling) {
        rookRow = fromRow;
        const isKingSide = toCol > fromCol;
        rookCol = isKingSide ? 7 : 0;
        rookTargetCol = isKingSide ? 5 : 3;
        rookPiece = board[rookRow][rookCol];

        // 1a. MOVE ROOK (Simulate)
        board[rookRow][rookTargetCol] = rookPiece;
        board[rookRow][rookCol] = null;
    }

    if (isEnPassant) {
        epCapturedRow = fromRow; // The pawn is on the same row as the starting position
        epCapturedCol = toCol;   // The column we moved to
        epCapturedPiece = board[epCapturedRow][epCapturedCol];
        board[epCapturedRow][epCapturedCol] = null;
    }

    // 1b. MOVE KING/PIECE (Modify board in-place)
    board[toRow][toCol] = movingPiece;
    board[fromRow][fromCol] = null;

    // 2. CHECK Safety
    // We pass the SAME board object, which is now temporarily updated.
    const safe = !isCheck(board, turnColor, selfPieceColor);

    // 3. UNMAKE Move (Restore board exactly as it was)
    board[fromRow][fromCol] = movingPiece;
    board[toRow][toCol] = capturedPiece;

    // 3a. UNMAKE ROOK (Restore)
    if (isCastling) {
        board[rookRow][rookCol] = rookPiece;
        board[rookRow][rookTargetCol] = null;
    }
    if (isEnPassant) {
        board[epCapturedRow][epCapturedCol] = epCapturedPiece;
    }

    return safe;
}