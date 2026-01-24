#ifndef BIT_BOARD_H // Header Guard: prevents double inclusion
#define BIT_BOARD_H


#include <bits/stdc++.h>
#include "helperFunctions.h"

using namespace std;

class Move {
private:
    int fromRow, fromCol;
    int toRow, toCol;
    int promotionPiece;

public:
    Move() 
        : fromRow(-1), fromCol(-1), toRow(-1), toCol(-1), promotionPiece(-1) {}

    Move(int fR, int fC, int tR, int tC, int promo = -1) 
        : fromRow(fR), fromCol(fC), toRow(tR), toCol(tC), promotionPiece(promo) {}

    int getFromRow() const { return fromRow; }
    int getFromCol() const { return fromCol; }
    int getToRow()   const { return toRow; }
    int getToCol()   const { return toCol; }
    int getPromo()   const { return promotionPiece; }
};

enum BoardIndex {
    selfPawnsBoard = 0,
    selfRooksBoard = 1,
    selfKnightsBoard = 2,
    selfBishopsBoard = 3,
    selfQueensBoard = 4,
    selfKingBoard = 5,
    opponentPawnsBoard = 6,
    opponentRooksBoard = 7,
    opponentKnightsBoard = 8,
    opponentBishopsBoard = 9,
    opponentQueensBoard = 10,
    opponentKingBoard = 11,
};

const int self_occ = 0;
const int opponent_occ = 1;
const int both_occ = 2;

const int CASTLE_SK = 1; //bit to access the bit denoting self king-rook side castle
const int CASTLE_SQ = 2; //bit to access the bit denoting self king-queen side castle
const int CASTLE_OK = 4; //bit to access the bit denoting opponent king-rook side castle
const int CASTLE_OQ = 8; //bit to access the bit denoting opponent king-queen side castle

class BitBoard {
public:
    uint64_t board[12];
    uint64_t occupancies[3]; // Typically: 0=self, 1=opponent, 2=Both
    bool turn;  //turn = 0=>self, turn=1=>opponent
    bool selfIsWhite;
    int castlingRights;
    int enPassantTarget;
    static constexpr int castlingRightsMask[64] = {
        7, 15, 15, 15, 3, 15, 15, 11,   // Rank 8 (0-7): a8(clear BQ), e8(clear BK/BQ), h8(clear BK)
        15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15,
        13, 15, 15, 15, 12, 15, 15, 14  // Rank 1 (56-63): a1(clear WQ), e1(clear WK/WQ), h1(clear WK)
    };

    BitBoard(string fenString, string selfColor, bool turn, int castlingRights, int enPassantTarget) {
        for (int i = 0; i < 12; i++) board[i] = 0;
        for (int i = 0; i < 3; i++) occupancies[i] = 0;
        selfIsWhite = (selfColor == "white");
        this->turn = turn;
        this->castlingRights = castlingRights;
        this->enPassantTarget = enPassantTarget;

        int firstSpace = fenString.find(' ');
        string boardFen = fenString.substr(0, firstSpace);

        int currentRow = 0;
        int currentCol = 0;

        for (char c : boardFen) {
            if (c == '/') {
                currentRow++;
                currentCol = 0;
                continue;
            }

            if (isdigit(c)) {
                int num = c - '0';
                currentCol += num;
                continue;
            }

            int square = currentRow * 8 + currentCol;

            bool isPieceWhite = isupper(c);
            bool isPieceSelf = (selfIsWhite == isPieceWhite);
            
            // Base index: Self starts at 0, Opponent starts at 6
            int baseIndex = isPieceSelf ? 0 : 6;
            
            int pieceIndex = -1;
            char lowerC = tolower(c);
            
            switch (lowerC) {
                case 'p': pieceIndex = baseIndex + 0; break; // Pawn
                case 'r': pieceIndex = baseIndex + 1; break; // Rook
                case 'n': pieceIndex = baseIndex + 2; break; // Knight
                case 'b': pieceIndex = baseIndex + 3; break; // Bishop
                case 'q': pieceIndex = baseIndex + 4; break; // Queen
                case 'k': pieceIndex = baseIndex + 5; break; // King
            }

            if (pieceIndex != -1) {
                setBit(this->board[pieceIndex], square);
                if (isupper(c)) {
                    setBit(this->occupancies[self_occ], square);
                } 
                else {
                    setBit(this->occupancies[opponent_occ], square);
                }
                setBit(this->occupancies[both_occ], square);
            }
            currentCol++;
        }
    }

    int getPieceType(int row, int col){
        int square = row * 8 + col;

        int pieceType = -1;
        for (int i = 0; i < 12; i++) {
            if (getBit(board[i], square)) {
                pieceType = i;
                break;
            }
        }

        return pieceType;
    }

    bool isSquareAttacked(int square){
        int row = square/8;
        int col = square % 8;

        int pieceType = getPieceType(square/8, square%8);
        bool isPieceSelf = (pieceType <= selfKingBoard);

        int attackerPawnsBoard = (isPieceSelf) ? opponentPawnsBoard : selfPawnsBoard;
        int attackerRooksBoard = (isPieceSelf) ? opponentRooksBoard : selfRooksBoard;
        int attackerBishopsBoard = (isPieceSelf) ? opponentBishopsBoard : selfBishopsBoard;
        int attackerQueensBoard = (isPieceSelf) ? opponentQueensBoard : selfQueensBoard;
        int attackerKingBoard = (isPieceSelf) ? opponentKingBoard : selfQueensBoard;
        int attackerKnightsBoard = (isPieceSelf) ? opponentKnightsBoard : selfKnightsBoard;

        //if we can cut theirs, they can cut ours
        int up = -1, down = +1;
        int selfMoveDirection = (attackerPawnsBoard == opponentPawnsBoard) ? up : down ;
        int newRow = row + selfMoveDirection; 
        //imagine we moved the piece at (row, col) to (row,col-1) or (row, col+1). If attacker's pawn is present there then attacker can cut ours.
        if(newRow >= 0 && newRow < 8){
            if(col - 1 >=0){
                if(getBit(board[attackerPawnsBoard], newRow*8 + (col-1))) return true;
            }
            if(col+1 <8){
                if(getBit(board[attackerPawnsBoard], newRow*8 + (col+1))) return true;
            }
        }

        //knight check
        int drN[] = {-2, -1, 1, 2, 2, 1, -1, -2};
        int dcN[] = {1, 2, 2, 1, -1, -2, -2, -1};
        for (int i = 0; i < 8; i++) {
            int tr = row + drN[i];
            int tc = col + dcN[i];
            if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
                if (getBit(board[attackerKnightsBoard], tr * 8 + tc)) return true;
            }
        }

        //king check
        int drK[] = {-1, -1, -1, 0, 0, 1, 1, 1};
        int dcK[] = {-1, 0, 1, -1, 1, -1, 0, 1};
        for (int i = 0; i < 8; i++) {
            int tr = row + drK[i];
            int tc = col + dcK[i];
            if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
                if (getBit(board[attackerKingBoard], tr * 8 + tc)) return true;
            }
        }

        // SLIDING CHECKS (Rook/Queen) 
        int drR[] = {-1, 1, 0, 0}; 
        int dcR[] = {0, 0, -1, 1};
        for (int i = 0; i < 4; i++) {
            for (int dist = 1; dist < 8; dist++) {
                int tr = row + drR[i] * dist;
                int tc = col + dcR[i] * dist;
                if (tr < 0 || tr >= 8 || tc < 0 || tc >= 8) break;
                
                int target = tr * 8 + tc;
                if (getBit(board[attackerRooksBoard], target) || getBit(board[attackerRooksBoard], target)) return true;
                if (getBit(occupancies[both_occ], target)) break;
            }
        }

        // SLIDING CHECKS (Bishop/Queen) 
        int drB[] = {-1, -1, 1, 1}; 
        int dcB[] = {-1, 1, -1, 1};
        for (int i = 0; i < 4; i++) {
            for (int dist = 1; dist < 8; dist++) {
                int tr = row + drB[i] * dist;
                int tc = col + dcB[i] * dist;
                if (tr < 0 || tr >= 8 || tc < 0 || tc >= 8) break;
                
                int target = tr * 8 + tc;
                if (getBit(board[attackerBishopsBoard], target) || getBit(board[attackerQueensBoard], target)) return true;
                if (getBit(occupancies[both_occ], target)) break;
            }
        }

        return false;
    }

    bool isCheck(){
        int kingIndex = (turn == 0) ? selfKingBoard : opponentKingBoard;
        uint64_t kingBit = board[kingIndex];
        int kingSquare = 63 - __builtin_ctzll(kingBit);
        return isSquareAttacked(kingSquare);
    }
    bool isCheck(bool side){
        //0 = self
        //1 = opponent
        int kingIndex = (side == 0) ? selfKingBoard : opponentKingBoard;
        uint64_t kingBit = board[kingIndex];
        int kingSquare = 63 - __builtin_ctzll(kingBit);
        return isSquareAttacked(kingSquare);
    }

    uint64_t filterSafeMoves(uint64_t validMoves, int fromRow, int fromCol){
        uint64_t safeMoves = 0;
        while(validMoves){
            int targetBitIndex = __builtin_ctzll(validMoves);
            int toSquare = 63 - targetBitIndex;
            int toRow = toSquare / 8;
            int toCol = toSquare % 8;
            BitBoard tempBoard = *this;
            tempBoard.executeMove(fromRow, fromCol, toRow, toCol);
            // 2. The Hack: Flip turn BACK to the original mover.
            // Why? executeMove() made it the Opponent's turn.
            // But we want to know if *WE* (the original mover) are in check.
            tempBoard.turn = !tempBoard.turn;
            if (!tempBoard.isCheck()) {
                setBit(safeMoves, toSquare);
            }
            
            validMoves &= ~(1ULL << targetBitIndex);
        }
        return safeMoves;
    }

    uint64_t getMoves(int row, int col){
        uint64_t attacks = 0;

        int pieceType = getPieceType(row, col);

        if (pieceType == -1) return 0;

        bool isPieceSelf = (pieceType <= selfKingBoard);
        int friendlyOcc = isPieceSelf ? self_occ : opponent_occ;
        int enemyOcc    = isPieceSelf ? opponent_occ : self_occ;

        if (pieceType == selfPawnsBoard || pieceType == opponentPawnsBoard){
            int forward = isPieceSelf ? -1 : 1;
            int startPawnRow = isPieceSelf ? 6 : 1;
            int nextRow = row + forward;
            if (nextRow >= 0 && nextRow < 8){
                int target = nextRow * 8 + col;

                //single push
                if (!getBit(occupancies[both_occ], target)) {
                    setBit(attacks, target);
                    
                    // Double Push
                    if (row == startPawnRow) {
                        int doubleTarget = (row + (forward * 2)) * 8 + col;
                        if (!getBit(occupancies[both_occ], doubleTarget)) {
                            setBit(attacks, doubleTarget);
                        }
                    }
                }
                if (col > 0) { 
                    int capLeft = nextRow * 8 + (col - 1);
                    if (getBit(occupancies[enemyOcc], capLeft) || capLeft == enPassantTarget) setBit(attacks, capLeft);
                }
                if (col < 7) { 
                    int capRight = nextRow * 8 + (col + 1);
                    if (getBit(occupancies[enemyOcc], capRight) || capRight == enPassantTarget) setBit(attacks, capRight);
                }   
            }
        }


        // --- KNIGHTS ---
        else if (pieceType == selfKnightsBoard || pieceType == opponentKnightsBoard) {
            int dr[] = {-2, -1, 1, 2, 2, 1, -1, -2};
            int dc[] = {1, 2, 2, 1, -1, -2, -2, -1};
            for (int i = 0; i < 8; i++) {
                int r = row + dr[i];
                int c = col + dc[i];
                if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                    int target = r * 8 + c;
                    if (!getBit(occupancies[friendlyOcc], target)) {
                        setBit(attacks, target);
                    }
                }
            }
        }

        // --- KINGS ---
        else if (pieceType == selfKingBoard || pieceType == opponentKingBoard) {        
            int dr[] = {-1, -1, -1, 0, 0, 1, 1, 1};
            int dc[] = {-1, 0, 1, -1, 1, -1, 0, 1};
            for (int i = 0; i < 8; i++) {
                int r = row + dr[i];
                int c = col + dc[i];
                if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                    int target = r * 8 + c;
                    if (!getBit(occupancies[friendlyOcc], target)) {
                        setBit(attacks, target);
                    }
                }
            }

            bool side = (pieceType == selfKingBoard) ? 0 : 1;
            if(!isCheck(side)){
                if(isPieceSelf){
                    if((castlingRights & CASTLE_SK) && !getBit(occupancies[both_occ], 61) && !getBit(occupancies[both_occ], 62)){
                        if(!isSquareAttacked(61) && !isSquareAttacked(62)){
                            setBit(attacks, 62);
                        }
                    }
                    if((castlingRights & CASTLE_SQ) && !getBit(occupancies[both_occ], 59) && !getBit(occupancies[both_occ], 58) && !getBit(occupancies[both_occ], 57)){
                        if(!isSquareAttacked(59) && !isSquareAttacked(58)){
                            setBit(attacks, 58);
                        }
                    }
                }

                else{
                    if((castlingRights & CASTLE_OK) && !getBit(occupancies[both_occ], 5) && !getBit(occupancies[both_occ], 6)){
                        if(!isSquareAttacked(5) && !isSquareAttacked(6)){
                            setBit(attacks, 6);
                        }
                    }
                    if((castlingRights & CASTLE_OQ) && !getBit(occupancies[both_occ], 3) && !getBit(occupancies[both_occ], 2) && !getBit(occupancies[both_occ], 1)){
                        if(!isSquareAttacked(2) && !isSquareAttacked(3)){
                            setBit(attacks, 2);
                        }
                    }
                }
            }
        }
        // --- SLIDING PIECES ---
        else {
            int dr[] = {-1, -1, 1, 1, -1, 1, 0, 0}; 
            int dc[] = {-1, 1, -1, 1, 0, 0, -1, 1};
            
            int startDir = 0, endDir = 8;
            
            if (pieceType == selfBishopsBoard || pieceType == opponentBishopsBoard) { 
                endDir = 4; 
            }
            else if (pieceType == selfRooksBoard || pieceType == opponentRooksBoard) { 
                startDir = 4; 
            }
            
            for (int dir = startDir; dir < endDir; dir++) {
                for (int dist = 1; dist < 8; dist++) {
                    int r = row + dr[dir] * dist;
                    int c = col + dc[dir] * dist;
                    
                    if (r < 0 || r >= 8 || c < 0 || c >= 8) break; 
                    
                    int target = r * 8 + c;
                    if (getBit(occupancies[friendlyOcc], target)) break; 
                    
                    setBit(attacks, target);
                    
                    if (getBit(occupancies[enemyOcc], target)) break; 
                }
            }
        }

        return filterSafeMoves(attacks, row, col);
    }

    void executeMove(int fromRow, int fromCol, int toRow, int toCol, int promotionOffset = 4){ // promotionoffset = 4 = queen by default
        int fromSquare = fromRow*8 + fromCol;
        int toSquare = toRow*8 + toCol;

        int movingPieceType = getPieceType(fromRow, fromCol);
        if (movingPieceType == -1) return;

        bool isSelf = (movingPieceType <= selfKingBoard);


        //handle capture
        //enpassant capture
        if((movingPieceType == selfPawnsBoard || movingPieceType == opponentPawnsBoard) && toSquare == enPassantTarget && !getBit(occupancies[both_occ], toSquare)){
            int forward = isSelf ? -1 : 1;
            int victimSquare = toSquare - (forward * 8);
            // Remove the victim pawn
            int victimIndex = isSelf ? opponentPawnsBoard : selfPawnsBoard;
            popBit(board[victimIndex], victimSquare);
        }
        //normal capture
        else{
            int enemyStart = isSelf ? 6 : 0;
            int enemyEnd   = isSelf ? 12 : 6;
            for (int i = enemyStart; i < enemyEnd; i++) {
                if (getBit(board[i], toSquare)) {
                    popBit(board[i], toSquare);
                    break;
                }
            }
        }

        //move the main piece
        popBit(board[movingPieceType], fromSquare);
        setBit(board[movingPieceType], toSquare);

        //pawn promotions
        if (movingPieceType == selfPawnsBoard || movingPieceType == opponentPawnsBoard){
            if((isSelf && toRow == 0) || (!isSelf && toRow == 7)){
                popBit(board[movingPieceType], toSquare);

                int queenIndex = movingPieceType + promotionOffset;
                setBit(board[queenIndex], toSquare);
            }
        }

        //handling castling rights
        if (movingPieceType == selfKingBoard || movingPieceType == opponentKingBoard){
            if (abs(fromCol - toCol) == 2){
                //king-rook side castle
                if (toCol == 6){
                    int rookFrom = fromRow * 8 + 7;
                    int rookTo   = fromRow * 8 + 5;
                    int rookIdx  = (movingPieceType == selfKingBoard) ? selfRooksBoard : opponentRooksBoard;
                    popBit(board[rookIdx], rookFrom);
                    setBit(board[rookIdx], rookTo);
                }
                //queen side castle
                else{
                    int rookFrom = fromRow * 8 + 0; // a-file
                    int rookTo   = fromRow * 8 + 3; // d-file
                    int rookIdx  = (movingPieceType == selfKingBoard) ? selfRooksBoard : opponentRooksBoard;
                    popBit(board[rookIdx], rookFrom);
                    setBit(board[rookIdx], rookTo);
                }
            }
        }

        // 5. Update Castling Rights (using the mask)
        castlingRights &= castlingRightsMask[fromSquare];
        castlingRights &= castlingRightsMask[toSquare];

        enPassantTarget = -1;
        if (movingPieceType == selfPawnsBoard || movingPieceType == opponentPawnsBoard) {
            if (abs(fromRow - toRow) == 2) {
                int skippedRow = (fromRow + toRow) / 2;
                enPassantTarget = skippedRow * 8 + fromCol;
            }
        }

        occupancies[self_occ] = 0;
        occupancies[opponent_occ] = 0;
        occupancies[both_occ] = 0;

        for (int i = 0; i < 12; i++) {
            bool pieceIsSelf = (i <= selfKingBoard);
            occupancies[pieceIsSelf ? self_occ : opponent_occ] |= board[i];
            occupancies[both_occ] |= board[i];
        }

        turn = !turn;
    }

    void executeMove(const Move& move) {
        executeMove(move.getFromRow(), move.getFromCol(), 
                    move.getToRow(),   move.getToCol(), 
                    move.getPromo());
    }
};


#endif