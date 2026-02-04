# Chess Engine
A chess application integrating a React frontend with a C++ engine compiled to WebAssembly.

# Overview
This project runs a custom chess engine in the browser using WebAssembly for move generation and search. The UI is built with React 19 and Vite.

# Game Logic
- **Move Validation**: Validates standard moves including En Passant, Castling (Kingside/Queenside), and Pawn Promotion.
- **Game States**: Detects Check and Checkmate.
- **Modes**:
- - PvP : Local Multiplayer
- - PvE : Player v/s Computer
- **Side Selection**: Play as White or Black against the engine.

# Engine Implementation
The engine is written in C++ and compiled to WASM. It currently uses:
- **Board Representation**: Bitboards (64-bit integers) for board state.
- **Search Algorithm**: Minimax with Alpha-Beta pruning.
- **Search Depth**: Fixed depth of 5 plies.
## Evaluation:
- - Material counting.
- - Piece-Square Tables (PST) for positional scoring.
- - Basic stalemate and checkmate detection scores.

# Project Structure
src/
├── components/     # React UI (Board, GameMenu)
├── engine/         # C++ source files
│   ├── engine.cpp  # Minimax & evaluation logic
│   └── bitBoard.h  # Bitboard definitions
├── utils/          # JavaScript logic for game rules/workers
└── assets/         # SVG pieces and sounds

# Setup and Build
Prerequisites
- Node.js
- C++ Compiler (for engine rebuilding, if applicable)
- Emscripten (if recompiling WASM)
## Installation
`npm install`
## Development
`npm run dev`
## Production Build
`npm run build`

# Current Limitations and To-Do
Based on the current codebase and roadmap:
- **Engine**: Search depth is hardcoded to 5. No time management or iterative deepening implemented yet.
- **Opening Book**: No opening book; engine calculates from move 1.
- **Endgame**: No endgame tablebases.
## Roadmap
[x] Check/Checkmate logic
[x] En Passant & Castling
[x] Pawn Promotion
[x] Basic Engine (Minimax)
[ ] Move ordering optimizations
[ ] Quiescence search to reduce horizon effect
[ ] Time control management