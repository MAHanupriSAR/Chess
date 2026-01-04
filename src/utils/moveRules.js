import getPieceColor from "./getPieceColor";

export default function getValidMoves(piece, selfRow, selfCol, board){
    const type = piece.toLowerCase();
    const selfColor = getPieceColor(piece);
    const isWhite = piece === piece.toUpperCase();
    const moves = [];

    function checkAndAdd(targetRow,targetCol){
        if (targetRow < 0 || targetRow > 7 || targetCol < 0 || targetCol > 7) {
            return false;
        }

        if(!board[targetRow]){
            return false;
        }

        if(!board[targetRow][targetCol]){
            moves.push({row:targetRow, col:targetCol});
            return true;
        }
        else{
            const targetPiece = board[targetRow][targetCol];
            const targetColor = getPieceColor(targetPiece);
            if(targetColor !== selfColor){
                moves.push({row:targetRow,col:targetCol});
            }
            return false;   
        }
    }

    if(type === 'p'){ //pawn
        const doubleForward = selfColor === "white" ? selfRow === 6 : selfRow === 1;
        const dir = isWhite ? -1 : 1;

        if(board[selfRow + dir] && !board[selfRow+dir][selfCol]){
            moves.push({row: selfRow+dir, col: selfCol});
            if(doubleForward && !board[selfRow+2*dir][selfCol]){
                moves.push({row:selfRow+2*dir, col:selfCol});
            }
        }
        
        //capture
        [[dir,1],[dir,-1]].forEach(([dr, dc])=>{
            const targetRow = selfRow + dr;
            const targetCol = selfCol + dc;
            if(board[targetRow] && board[targetRow][targetCol]){
                const targetPiece = board[targetRow][targetCol]
                const targetColor = getPieceColor(targetPiece);
                if(targetColor != selfColor){
                    moves.push({row:targetRow, col:targetCol});
                }
            }
        })
    }

    //knight
    if (type === 'n') {
        const offsets = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
        offsets.forEach(([dr, dc]) => checkAndAdd(selfRow + dr, selfCol + dc));
    }

    //rook
    if(type === 'r' || type === 'q'){
        const dirs =  [[-1, 0], [1, 0], [0, -1], [0, 1]];
        dirs.forEach(([dr, dc])=>{
            for(let i = 1; i<8; i++){
                if(!checkAndAdd(selfRow + i*dr , selfCol + i*dc))break;
            }
        })
    }

    //bishop
    if(type === 'b' || type === 'q'){   
        const dirs =  [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        dirs.forEach(([dr, dc])=>{
            for(let i = 1; i<8; i++){
                if(!checkAndAdd(selfRow + i*dr , selfCol + i*dc))break;
            }
        })
    }

    //king
    if (type === 'k') {
        const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        dirs.forEach(([dr, dc]) => checkAndAdd(selfRow + dr, selfCol + dc));
    }


    return moves;
}