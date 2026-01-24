import { boardToFen } from "./helperFunctions";
import Module from "../engine/engine";

function getCastlingMask(castlingRights) {
    let mask = 0;

    if (castlingRights.whiteKingSide)  mask |= 1;
    if (castlingRights.whiteQueenSide) mask |= 2;
    if (castlingRights.blackKingSide)  mask |= 4;
    if (castlingRights.blackQueenSide) mask |= 8;

    return mask;
}

function getEnPassantSquare(enPassantTarget){
    if (!enPassantTarget) {
        return -1; 
    }
    return enPassantTarget.row*8 + enPassantTarget.col;
}

export const getComputerMove = async (board, color, castling, enPassant) => {
    const wasm = await Module();
    
    const rawString = wasm.ccall(
        "getComputerMoveWrapper", 
        "string", 
        ["string", "string", "number", "number"], 
        [boardToFen(board), color, getCastlingMask(castling), getEnPassantSquare(enPassant)]
    );

    console.log("Raw C++ Output:", rawString);

    const parts = rawString.split(' ');

    return {
        fromRow: parseInt(parts[0]),
        fromCol: parseInt(parts[1]),
        toRow:   parseInt(parts[2]),
        toCol:   parseInt(parts[3]),
        promoteTo: parts[4] // This will now be "q", "r", "n", "b", or "None"
    };
};