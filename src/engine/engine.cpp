#include <bits/stdc++.h>
#include <emscripten/emscripten.h>
#include <string>
#include <bitBoard.h>

const int pawnTable[64] = {
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0
};

const int rookTable[64] = {
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0
};

const int knightTable[64] = {
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
};

const int bishopTable[64] = {
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
};

const int queenTable[64] = {
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
};

const int kingTable[64] = {
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20
};

const int* pst[6] = { pawnTable, rookTable, knightTable, bishopTable, queenTable, kingTable };

int evaluate(BitBoard bitBoard) {
    // what it means : 0-Pawn, 1-Rook, 2-Knight, 3-Bishop, 4-Queen, 5-King
    int pieceValues[] = { 100, 500, 320, 330, 900, 20000 }; 
    int score = 0;

    for (int i = 0; i < 12; i++) {
        uint64_t pieceBoard = bitBoard.board[i];
        
        //type ignoring side
        int type = i % 6; 
        
        while (pieceBoard) {
            int sq = 63 - __builtin_ctzll(pieceBoard);
            
            int materialValue = pieceValues[type];
            int positionalValue = 0;

            if (i < 6) {
                positionalValue = pst[type][sq];
                score += (materialValue + positionalValue);
            } else {
                positionalValue = pst[type][sq ^ 56];
                score -= (materialValue + positionalValue);
            }

            pieceBoard &= pieceBoard - 1; 
        }
    }
    return (bitBoard.turn == 0) ? score : -score;
}

vector<Move> generateAllMoves(BitBoard& board) {
    vector<Move> moveList;
    moveList.reserve(35);

    int startPiece = board.turn ? 6 : 0;
    int endPiece   = board.turn ? 12 : 6;

    for (int p = startPiece; p < endPiece; p++) {
        uint64_t pieceBoard = board.board[p];
        
        while (pieceBoard) {
            int squareIdx = 63 - __builtin_ctzll(pieceBoard); 
            int r = squareIdx / 8;
            int c = squareIdx % 8;

            uint64_t movesBitboard = board.getMoves(r, c);

            while (movesBitboard) {
                int targetIdx = 63 - __builtin_ctzll(movesBitboard);
                int tr = targetIdx / 8;
                int tc = targetIdx % 8;

                bool isPawn = (p == selfPawnsBoard || p == opponentPawnsBoard);
                bool promotion = isPawn && (tr == 0 || tr == 7);

                if (promotion) {
                    moveList.emplace_back(r, c, tr, tc, 1); //rook
                    moveList.emplace_back(r, c, tr, tc, 2); //knight
                    moveList.emplace_back(r, c, tr, tc, 3); //bishop
                    moveList.emplace_back(r, c, tr, tc, 4); //queen
                } else {
                    moveList.emplace_back(r, c, tr, tc);
                }

                movesBitboard &= movesBitboard - 1;
            }

            pieceBoard &= pieceBoard - 1;
        }
    }
    return moveList;
}


// Alpha-Beta pruning
const int INF = 1000000;
const int MATE_SCORE = 19000;

int minimax(BitBoard board, int depth, int alpha, int beta){
    if(depth == 0){
        return evaluate(board);
    }

    vector<Move> moves = generateAllMoves(board);
    if (moves.empty()) {
        if (board.isCheck()) {
            return -MATE_SCORE - depth;
        }
        return 0; // Stalemate
    }

    int bestVal = -INF;

    for (const auto& move : moves) {
        BitBoard nextBoard = board;
        nextBoard.executeMove(move);

        int val = -minimax(nextBoard, depth - 1, -beta, -alpha);

        if (val > bestVal) {
            bestVal = val;
        }
        
        if (bestVal > alpha) {
            alpha = bestVal;
        }
        if (alpha >= beta) {
            break;
        }
    }

    return bestVal;
}

Move getBestMove(BitBoard board, int depth){
    vector<Move> moves = generateAllMoves(board);
    Move bestMove;
    int bestVal = -INF;
    int alpha = -INF;
    int beta = INF;

    for(const auto& move : moves){
        BitBoard nextBoard = board;
        nextBoard.executeMove(move);
        int val = -minimax(nextBoard, depth - 1, -beta, -alpha);
        
        if (val > bestVal) {
            bestVal = val;
            bestMove = move;
        }

        if (bestVal > alpha) {
            alpha = bestVal;
        }
    }

    return bestMove;
}


extern "C" {

    // EMSCRIPTEN_KEEPALIVE ensures this function isn't deleted during optimization
    EMSCRIPTEN_KEEPALIVE
    const char* getBestMoveForFEN(const char* fen) {
        // 1. Convert C-string to std::string
        std::string fenStr(fen);

        // 2. Load your BitBoard from FEN (You need to implement/expose this parser)
        BitBoard board = BitBoard::fromFEN(fenStr);

        // 3. Calculate Best Move
        Move bestMove = getBestMove(board, 4); // Depth 4

        // 4. Convert Move to String (e.g., "e2e4")
        static std::string moveStr; // static so it persists after return
        moveStr = bestMove.toString(); 

        return moveStr.c_str();
    }
}