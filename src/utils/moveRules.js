import { isCheck, isMoveSafe } from "./checkmateLogic";
import {getPieceColor} from "./helperFunctions";

export function getValidMoves(piece, pieceRow, pieceCol, board, selfPieceColor, castlingRights = null){
    const type = piece.toLowerCase();
    const pieceColor = getPieceColor(piece);
    const pieceIsSelfPiece = pieceColor === selfPieceColor;
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
            const targetPieceColor = getPieceColor(targetPiece);
            if(targetPieceColor !== pieceColor){
                moves.push({row:targetRow,col:targetCol});
            }
            return false;   
        }
    }

    if(type === 'p'){ //pawn
        const doubleForward = pieceColor === selfPieceColor ? pieceRow === 6 : pieceRow === 1;
        const dir = pieceIsSelfPiece ? -1 : 1;

        if(board[pieceRow + dir] && !board[pieceRow+dir][pieceCol]){
            moves.push({row: pieceRow+dir, col: pieceCol});
            if(doubleForward && !board[pieceRow+2*dir][pieceCol]){
                moves.push({row:pieceRow+2*dir, col:pieceCol});
            }
        }
        
        //capture
        [[dir,1],[dir,-1]].forEach(([dr, dc])=>{
            const targetRow = pieceRow + dr;
            const targetCol = pieceCol + dc;
            if(board[targetRow] && board[targetRow][targetCol]){
                const targetPiece = board[targetRow][targetCol]
                const targetPieceColor = getPieceColor(targetPiece);
                if(targetPieceColor != pieceColor){
                    moves.push({row:targetRow, col:targetCol});
                }
            }
        })
    }

    //knight
    if (type === 'n') {
        const offsets = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
        offsets.forEach(([dr, dc]) => checkAndAdd(pieceRow + dr, pieceCol + dc));
    }

    //rook
    if(type === 'r' || type === 'q'){
        const dirs =  [[-1, 0], [1, 0], [0, -1], [0, 1]];
        dirs.forEach(([dr, dc])=>{
            for(let i = 1; i<8; i++){
                if(!checkAndAdd(pieceRow + i*dr , pieceCol + i*dc))break;
            }
        })
    }

    //bishop
    if(type === 'b' || type === 'q'){   
        const dirs =  [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        dirs.forEach(([dr, dc])=>{
            for(let i = 1; i<8; i++){
                if(!checkAndAdd(pieceRow + i*dr , pieceCol + i*dc))break;
            }
        })
    }

    //king
    if (type === 'k') {
        const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        dirs.forEach(([dr, dc]) => checkAndAdd(pieceRow + dr, pieceCol + dc));

        if(castlingRights){
            if(castlingRights[`${pieceColor}KingSide`]){
                if(!board[pieceRow][5] && !board[pieceRow][6]){
                    moves.push({ row: pieceRow, col: 6 });
                }
            }
            if(castlingRights[`${pieceColor}QueenSide`]){
                if(!board[pieceRow][1] && !board[pieceRow][2] && !board[pieceRow][3]){
                    moves.push({ row: pieceRow, col: 2 });
                }
            }
        }
    }
    
    return moves.filter((move)=>{
        if(!isMoveSafe(board, pieceRow, pieceCol, move.row, move.col, pieceColor, selfPieceColor)){
            return false;
        }

        if(type === 'k' && Math.abs(move.col-pieceCol)===2){
            if(isCheck(board, pieceColor, selfPieceColor)){
                return false;
            }
            const transitCol = (pieceCol + move.col)/2;
            if(!isMoveSafe(board, pieceRow, pieceCol, pieceRow, transitCol, pieceColor, selfPieceColor)){
                return false;
            }
        }

        return true;
    })
}