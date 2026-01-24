#include <emscripten.h>
#include <string> // Required for std::to_string
#include "engine.h"


using namespace std;

extern "C" {
    static string result;

    EMSCRIPTEN_KEEPALIVE
    const char* getComputerMoveWrapper(const char* fen, const char* color, int castling, int enPassant, int depth) {
        
        string fenString(fen);
        string colorString(color);

        Move best = getBestMove(fenString, colorString, castling, enPassant, depth);

        string moveString = to_string(best.getFromRow()) + " " +
                 to_string(best.getFromCol()) + " " +
                 to_string(best.getToRow())   + " " +
                 to_string(best.getToCol())   + " " ;

        int p = best.getPromo();    

        if (p == 1) moveString += "r";      // Rook
        else if (p == 2) moveString += "n"; // Knight
        else if (p == 3) moveString += "b"; // Bishop
        else if (p == 4) moveString += "q"; // Queen
        else moveString += "None";          // No promotion

        result = moveString;

        //return pointer to internal string
        return result.c_str();
    }
}