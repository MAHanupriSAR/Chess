import { boardToFen } from "./helperFunctions";

function getCastlingMask(castlingRights) {
    let mask = 0;

    if (castlingRights.whiteKingSide)  mask |= 1;
    if (castlingRights.whiteQueenSide) mask |= 2;
    if (castlingRights.blackKingSide)  mask |= 4;
    if (castlingRights.blackQueenSide) mask |= 8;

    return mask;
}

function getEnPassantSquare(enPassantTarget){
    return enPassantTarget.row*8 + enPassantTarget.col;
}

export function getComputerMove(board, selfPieceColor, castlingRights, enPassantTarget){
    const fenString = boardToFen(board);
    
}