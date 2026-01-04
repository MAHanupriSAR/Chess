export default function getValidMoves(piece, row, col, board) {
    const type = piece.toLowerCase();
    const isWhite = piece === piece.toUpperCase();
    const moves = [];

    // Helper to add move if valid
    const checkAndAdd = (r, c) => {
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const target = board[r][c];
            // Add if empty OR if capturing enemy
            // We don't add if it's our own piece
            if (target === null) {
                moves.push({ row: r, col: c });
                return true; // Continue sliding (for rooks/bishops)
            } else {
                const isTargetWhite = target === target.toUpperCase();
                if (isWhite !== isTargetWhite) {
                    moves.push({ row: r, col: c }); // Capture
                }
                return false; // Stop sliding (blocked)
            }
        }
        return false; // Out of bounds
    };

    // PAWN LOGIC 
    if (type === 'p') {
        const dir = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;

        // 1. Forward
        if (board[row + dir] && board[row + dir][col] === null) {
            moves.push({ row: row + dir, col: col });
            //Double Forward (only if clear path)
            if (row === startRow && board[row + 2 * dir] && board[row + 2 * dir][col] === null) {
                moves.push({ row: row + 2 * dir, col: col });
            }
        }
        // 3. Captures
        [[dir, -1], [dir, 1]].forEach(([dr, dc]) => {
            const tr = row + dr, tc = col + dc;
            if (board[tr] && board[tr][tc]) { // Check bounds & existence
                const target = board[tr][tc];
                const isTargetWhite = target === target.toUpperCase();
                if (isWhite !== isTargetWhite) moves.push({ row: tr, col: tc });
            }
        });
    }

    // --- KNIGHT LOGIC ---
    if (type === 'n') {
        const offsets = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
        offsets.forEach(([dr, dc]) => checkAndAdd(row + dr, col + dc));
    }

    // --- ROOK LOGIC (Sliding) ---
    if (type === 'r' || type === 'q') {
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        dirs.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                if (!checkAndAdd(row + dr * i, col + dc * i)) break;
            }
        });
    }

    // --- BISHOP LOGIC (Sliding) ---
    if (type === 'b' || type === 'q') {
        const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        dirs.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                if (!checkAndAdd(row + dr * i, col + dc * i)) break;
            }
        });
    }

    // --- KING LOGIC ---
    if (type === 'k') {
        const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        dirs.forEach(([dr, dc]) => checkAndAdd(row + dr, col + dc));
    }

    return moves;
}