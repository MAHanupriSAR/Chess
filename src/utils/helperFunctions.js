export function fenToBoard(fenString) {
    const [piecePlacement] = fenString.split(" ");
    
    const board = []; 
    
    let currentRow = [];

    for (let char of piecePlacement) {
        if (char === '/') {
            board.push(currentRow);
            currentRow = [];
        } else if (!isNaN(char)) {
            // 2. Numbers mean empty spaces
            const emptySpaces = parseInt(char);
            for (let i = 0; i < emptySpaces; i++) {
                currentRow.push(null);
            }
        } else {
            // 3. Letters mean pieces
            currentRow.push(char);
        }
    }
    board.push(currentRow);

    return board;
}

export function boardToFen(board) {
    let fen = "";

    for (let r = 0; r < 8; r++) {
        let emptyCount = 0;

        for (let c = 0; c < 8; c++) {
            const square = board[r][c];

            if (square === null) {
                emptyCount++;
            } else {
                if (emptyCount > 0) {
                    fen += emptyCount;
                    emptyCount = 0;
                }
                fen += square;
            }
        }

        if (emptyCount > 0) {
            fen += emptyCount;
        }

        if (r < 7) {
            fen += "/";
        }
    }
}

export function getPieceColor(piece){
    const isLowerCase = str => str === str.toLowerCase();
    return isLowerCase(piece)? "black" : "white";
}