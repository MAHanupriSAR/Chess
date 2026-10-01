# Chess

A fully-featured, browser-based chess application built with **React + Vite**, powered by a custom **C++ chess engine** compiled to **WebAssembly**. Play against a friend locally or challenge the built-in AI opponent.

---

## Preview

> Play chess directly in your browser — no installation required beyond `npm install`.

---

## Features

- **Two game modes**
  - **Human vs Human** — pass-and-play on the same device
  - **Human vs Computer** — play against an AI powered by a real C++ engine (compiled to WASM)
- **Side selection** — choose to play as White or Black when facing the computer
- **Full chess rule implementation**
  - All standard piece movements (Pawn, Rook, Knight, Bishop, Queen, King)
  - **Castling** — both kingside and queenside, with proper legality checks
  - **En passant** — correctly detected and handled
  - **Pawn promotion** — interactive modal to choose promotion piece (Queen, Rook, Bishop, Knight)
  - **Check detection** — king is highlighted in red when in check
  - **Checkmate & Stalemate detection** — game ends with an appropriate alert
- **Visual aids**
  - Move hints for legal destination squares
  - Capture indicators on enemy pieces
  - Selected piece highlight
  - King-in-check highlight
- **Sound effects** — distinct sounds for normal moves and captures
- **FEN-based board initialization** — board state driven by standard FEN strings

---

## Project Structure

```
Chess/
├── index.html                  # App entry point
├── vite.config.js              # Vite configuration
├── package.json                # NPM scripts and dependencies
├── eslint.config.js            # ESLint configuration
│
└── src/
    ├── main.jsx                # React root mount
    │
    ├── components/             # React UI components
    │   ├── App.jsx             # Root component — routes between menu and board
    │   ├── App.css
    │   ├── Board.jsx           # Core game board — manages all game state
    │   ├── Board.css
    │   ├── Gamemenu.jsx        # Main menu (mode selection, side selection)
    │   ├── Gamemenu.css
    │   ├── Piece.jsx           # Renders individual chess piece images
    │   ├── Piece.css
    │   ├── Square.jsx          # Individual board square with visual states
    │   └── Square.css
    │
    ├── utils/                  # Pure JS game logic (used by the React board)
    │   ├── moveRules.js        # Pseudo-legal move generation for all pieces
    │   ├── checkmateLogic.js   # Check detection and move safety filtering
    │   ├── gamelogic.js        # Move execution, castling rights, game-over logic
    │   ├── helperFunctions.js  # FEN parsing, board-to-FEN, piece color utils
    │   ├── engineWorker.js     # Bridge: calls WASM engine for computer moves
    │   └── moveRules_backup.js # Backup / legacy move rules
    │
    ├── engine/                 # C++ chess engine + compiled WebAssembly output
    │   ├── bitBoard.h          # BitBoard class — board representation & move gen
    │   ├── bitBoard.cpp
    │   ├── engine.h            # Minimax + alpha-beta pruning + PST evaluation
    │   ├── engine.cpp
    │   ├── helperFunctions.h   # C++ bit manipulation helpers
    │   ├── helperFunctions.cpp
    │   ├── wasmAPI.cpp         # Emscripten-exported C API for JS interop
    │   ├── engine.js           # Emscripten-generated JS glue (do not edit)
    │   ├── engine.wasm         # Compiled WebAssembly binary (do not edit)
    │   └── commands.txt        # Emscripten build command reference
    │
    └── assets/
        ├── background.jpg      # Board background image
        ├── pieces/             # Primary piece image set
        │   ├── white_pieces/
        │   └── black_pieces/
        ├── pieces2/            # Alternate piece image set
        └── sounds/
            ├── move_self.mp3   # Sound for normal moves
            └── capture.mp3     # Sound for capture moves
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Build Tool | Vite 7 |
| Styling | Vanilla CSS |
| Chess Engine | Custom C++ compiled to WebAssembly via Emscripten |
| Engine Interop | Emscripten `ccall` / `cwrap` via a JS module |
| Linting | ESLint 9 with `eslint-plugin-react-hooks` |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Chess

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` (or the port Vite reports).

### Building for Production

```bash
npm run build
```

The optimized static files will be output to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## Chess Engine Deep Dive

The AI opponent is driven by a fully custom chess engine written in **C++** and compiled to **WebAssembly** using [Emscripten](https://emscripten.org/). This means the engine runs natively at near-native speed inside the browser — no server round-trips required.

### Architecture

```
JS (React) → engineWorker.js → engine.js (WASM glue) → engine.wasm (C++ logic)
```

### BitBoard Representation (`bitBoard.h`)

The engine represents the board using **12 `uint64_t` bitboards** — one per piece type per color:

| Index | Piece |
|---|---|
| 0 | Self Pawns |
| 1 | Self Rooks |
| 2 | Self Knights |
| 3 | Self Bishops |
| 4 | Self Queens |
| 5 | Self King |
| 6 | Opponent Pawns |
| 7 | Opponent Rooks |
| 8 | Opponent Knights |
| 9 | Opponent Bishops |
| 10 | Opponent Queens |
| 11 | Opponent King |

Additionally, 3 **occupancy bitboards** track self, opponent, and combined piece positions for fast attack detection.

### Move Generation

The `BitBoard::getMoves(row, col)` method generates all pseudo-legal moves for a piece using bitwise operations:

- **Pawns**: Single push, double push from starting rank, diagonal captures, en passant
- **Knights**: Fixed offset L-shaped jumps
- **Bishops**: Diagonal ray sliding, blocked by occupancy
- **Rooks**: Horizontal/vertical ray sliding, blocked by occupancy
- **Queens**: Combined bishop + rook rays
- **Kings**: One-square in all 8 directions + castling (with attacked-square checks)

All generated moves are passed through `filterSafeMoves()`, which simulates each move and verifies the king is not left in check, ensuring only **fully legal moves** are returned.

### Castling Rights

Castling is tracked as a **4-bit integer bitmask**:

| Bit | Meaning |
|---|---|
| Bit 0 (`CASTLE_SK`) | Self kingside castling available |
| Bit 1 (`CASTLE_SQ`) | Self queenside castling available |
| Bit 2 (`CASTLE_OK`) | Opponent kingside castling available |
| Bit 3 (`CASTLE_OQ`) | Opponent queenside castling available |

Rights are revoked automatically using a `castlingRightsMask[64]` array whenever the king or a rook moves or is captured.

### Search Algorithm (`engine.h`)

The engine uses **Negamax** (a symmetrical form of Minimax) with **Alpha-Beta pruning**:

```
searchBestMove(BitBoard, depth)
  └── for each legal move:
        └── minimax(nextBoard, depth-1, alpha, beta) [negamax style]
              ├── Leaf: evaluate(board)
              └── Prune branches where alpha >= beta
```

**Default search depth**: **5 plies**

#### Static Evaluation

The `evaluate()` function scores the position from the current player's perspective using:

1. **Material values**:

| Piece | Value |
|---|---|
| Pawn | 100 |
| Knight | 320 |
| Bishop | 330 |
| Rook | 500 |
| Queen | 900 |
| King | 20,000 |

2. **Piece-Square Tables (PST)**: Each piece type has a 64-entry table rewarding positionally strong squares (e.g., knights prefer the center, kings prefer the back rank in middlegame). The engine evaluates both material and position for every piece on both sides.

#### Checkmate/Stalemate in Search

- **Checkmate**: Scored as `-MATE_SCORE - depth` to prefer faster mates
- **Stalemate**: Scored as `0` (draw)

### WebAssembly API (`wasmAPI.cpp`)

The C++ engine exposes a single function to JavaScript via Emscripten's `ccall`:

```c
const char* getComputerMoveWrapper(
    const char* fen,       // FEN string of current board
    const char* color,     // "white" or "black" (self's color)
    int castling,          // 4-bit castling rights mask
    int enPassant,         // En passant target square index (-1 if none)
    int depth              // Search depth (default: 5)
);
```

Returns a space-separated string: `"fromRow fromCol toRow toCol promotionPiece"`  
Example: `"6 4 4 4 None"` (e2→e4, no promotion)

### Compiling the Engine

To recompile the C++ engine after modifications, you need [Emscripten](https://emscripten.org/docs/getting_started/downloads.html) installed and activated (`emsdk activate`). Run this command from `src/engine/`:

```bash
emcc wasmAPI.cpp -o engine.js -s WASM=1 -s "EXPORTED_RUNTIME_METHODS=['ccall','cwrap']" -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_ES6=1 -O3
```

This produces `engine.js` (the JS glue module) and `engine.wasm` (the binary).

---

## JavaScript Game Logic

The JavaScript layer independently implements full chess rules for the interactive UI layer (used for move validation, hint rendering, check highlighting, etc.).

### `utils/moveRules.js`
`getValidMoves(piece, row, col, board, selfColor, castlingRights, enPassantTarget)`

Generates all legal moves for a given piece, handling:
- Pawn direction based on player color
- En passant captures
- King castling (with in-check and transit-square safety checks)
- All sliding piece ray generation

All moves are filtered through `isMoveSafe()` before being returned.

### `utils/checkmateLogic.js`
- `isCheck(board, turnColor, selfColor)` — determines if the given color's king is in check
- `isMoveSafe(board, fromRow, fromCol, toRow, toCol, ...)` — simulates a move and checks if it leaves own king in check

### `utils/gamelogic.js`
- `executeMove(board, from, to, promotionChoice, enPassantTarget)` — returns a new board state after executing a move (handles castling rook movement, en passant capture, promotion)
- `updateCastlingRights(prevRights, from, to, board)` — revokes castling rights based on king/rook movement or rook capture
- `isGameOver(board, turnColor, selfColor, castlingRights, enPassantTarget)` — returns `"checkmate"`, `"stalemate"`, or `null`

### `utils/helperFunctions.js`
- `fenToBoard(fenString)` — parses a FEN string into an 8×8 2D array
- `boardToFen(board)` — serializes the board back to FEN (used to pass state to the WASM engine)
- `getPieceColor(piece)` — returns `"white"` or `"black"` based on piece character case

### `utils/engineWorker.js`
Bridge between React and the WASM module:
- Converts castling rights object → 4-bit integer mask
- Converts en passant target object → square index integer
- Calls `wasm.ccall("getComputerMoveWrapper", ...)` with correct arguments
- Parses the returned string into a structured move object

---

## How to Play

1. **Launch** the app and you'll see the main menu.
2. **Choose mode**: *Play vs Human* or *Play vs Computer*.
3. If playing vs Computer, **select your side** (White or Black).
4. The game begins with the standard starting position.
5. **Click a piece** to select it — valid destination squares are highlighted.
6. **Click a highlighted square** to move.
7. Click the same piece again (or any other friendly piece) to change selection.
8. If a pawn reaches the opposite end, a **promotion modal** appears — click your desired piece.
9. The game announces **checkmate** or **stalemate** when the game ends.
10. Click the **← back button** (circle-left icon) to return to the main menu.

---

## Configuration

### Vite Config (`vite.config.js`)

Standard Vite + React configuration with the `@vitejs/plugin-react` plugin. No special WASM handling is required since the WASM file is loaded dynamically via the Emscripten-generated JS module at runtime.

### ESLint (`eslint.config.js`)

Configured with:
- `@eslint/js` recommended rules
- `eslint-plugin-react-hooks` for React Hooks best practices
- `eslint-plugin-react-refresh` for Vite fast-refresh compatibility

---

## Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.0 | UI framework |
| `react-dom` | ^19.2.0 | DOM rendering |

### Development Dependencies

| Package | Version | Purpose |
|---|---|---|
| `vite` | ^7.2.4 | Build tool and dev server |
| `@vitejs/plugin-react` | ^5.1.1 | React Fast Refresh + JSX transform |
| `eslint` | ^9.39.1 | Linting |
| `@eslint/js` | ^9.39.1 | ESLint JS rules |
| `eslint-plugin-react-hooks` | ^7.0.1 | Hooks linting |
| `eslint-plugin-react-refresh` | ^0.4.24 | Refresh-safe linting |
| `globals` | ^16.5.0 | Global variable definitions for ESLint |
| `@types/react` | ^19.2.5 | TypeScript types for React |
| `@types/react-dom` | ^19.2.3 | TypeScript types for React DOM |

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Start Vite dev server with HMR |
| Build | `npm run build` | Build optimized production bundle to `dist/` |
| Preview | `npm run preview` | Serve the production build locally |
| Lint | `npm run lint` | Run ESLint on the codebase |

---

## 🔮 Potential Improvements

- [ ] **Move history / notation panel** — display moves in algebraic notation
- [ ] **Undo / take-back move** — allow reverting the last move
- [ ] **Difficulty levels** — expose configurable search depth for the AI
- [ ] **Iterative deepening** — improve engine move quality on a fixed time budget
- [ ] **Move ordering** — order captures and checks first to improve pruning efficiency
- [ ] **Transposition table** — cache previously evaluated positions for speedup
- [ ] **Timer / clock** — add per-player countdown clocks
- [ ] **Board flip** — automatically orient board from the player's perspective
- [ ] **Drag-and-drop** — alternative piece movement in addition to click-to-move
- [ ] **Multiplayer online** — WebSocket-based real-time play

---

## License

This project is open source. Feel free to fork, modify, and use it as you like.

---

*Built with React, C++, and WebAssembly.*
