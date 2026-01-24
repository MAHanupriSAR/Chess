#include <emscripten.h>
#include <string> // Required for std::to_string
#include "engine.h"


using namespace std;

extern "C" {
    static string result;

    EMSCRIPTEN_KEEPALIVE
    const char* getComputerMoveWrapper(const char* fen, const char* color, int castling, int enPassant) {
        
        string fenString(fen);
        string colorString(color);

        Move best = getBestMove(fenString, colorString, castling, enPassant);

        result = to_string(best.getFromRow()) + " " +
                 to_string(best.getFromCol()) + " " +
                 to_string(best.getToRow())   + " " +
                 to_string(best.getToCol())   + " " +
                 to_string(best.getPromo());

        // .c_str() returns the raw pointer to the string's internal text
        return result.c_str();
    }
}