export default function getPieceColor(piece){
    const isLowerCase = str => str === str.toLowerCase();
    return isLowerCase(piece)? "black" : "white";
}