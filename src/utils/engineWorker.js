import { boardToFen } from "./helperFunctions";
import Module from "./engine.js";

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

export const getComputerMove = async (board, color, castling, enPassant) => {
    const wasm = await Module();
    
    const rawString = wasm.ccall(
        "getComputerMoveWrapper", 
        "string", 
        ["string", "string", "number", "number"], 
        [boardToFen(board), color, castling, enPassant]
    );

    console.log("Raw C++ Output:", rawString);

    const parts = rawString.split(' ').map(Number); 

    return {
        fromRow: parts[0],
        fromCol: parts[1],
        toRow:   parts[2],
        toCol:   parts[3],
        promotion: parts[4]
    };
};