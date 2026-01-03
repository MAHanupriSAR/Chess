export default function fenToBoard(fenString) {
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