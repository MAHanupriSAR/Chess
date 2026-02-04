
# Chess Engine
A compact chess application combining a React frontend with a C++ engine compiled to WebAssembly (WASM).

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Engine](#engine)
    - [Board Representation](#board-representation)
    - [Search & Evaluation](#search--evaluation)
- [Project Structure](#project-structure)
- [Setup](#setup)
    - [Prerequisites](#prerequisites)
    - [Install & Run](#install--run)
- [Limitations & Roadmap](#limitations--roadmap)
- [License](#license)

## Overview
This project runs a custom chess engine in the browser using WebAssembly for move generation and search. The UI is built with React (Vite) and communicates with the compiled engine for move generation in PvE mode.

## Features
- Move validation including En Passant, Castling (kingside/queenside), and Pawn Promotion
- Check and Checkmate detection
- Game modes: PvP (local) and PvE (against the engine)
- Side selection: play as White or Black

## Engine
The engine is implemented in C++ and compiled to WebAssembly for use in the browser.

### Board Representation
- Uses bitboards (64-bit integers) to represent board state efficiently.

### Search & Evaluation
- Search algorithm: Minimax with Alpha-Beta pruning
- Fixed search depth (currently 5 plies)
- Evaluation consists of material counting and piece-square tables (PST). Basic checkmate/stalemate scoring is included.

## Project Structure
```
src/
├── components/     # React UI (Board, GameMenu, Pieces, Squares)
├── engine/         # C++ source + generated WASM glue (engine.cpp, bitBoard.*)
│   ├── engine.cpp
│   ├── bitBoard.cpp/h
│   └── engine.js    # WASM glue/runtime wrapper
├── utils/          # JS game logic and helpers (move validation, workers)
└── assets/         # SVG pieces, alternative piece sets, sounds
```

Key files:
- [src/main.jsx](src/main.jsx#L1) - App entry
- [src/components/Board.jsx](src/components/Board.jsx#L1) - Board rendering
- [src/engine/engine.js](src/engine/engine.js#L1) - WASM loader/shim

## Setup

### Prerequisites
- Node.js
- C++ compiler (only required if you rebuild the WASM engine)
- Emscripten (only required if you recompile the C++ to WASM)

### Install & Run
Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

If you need to recompile the engine to WASM, follow the steps in the `engine/` folder and ensure Emscripten is configured.

## Limitations & Roadmap

### Current Limitations
- Engine search depth is hardcoded to 5 plies
- No iterative deepening or time management
- No opening book or endgame tablebases

### Roadmap
- [x] Implement check/checkmate detection
- [x] Handle En Passant & Castling
- [x] Pawn Promotion
- [x] Basic engine (Minimax)
- [ ] Move ordering optimizations
- [ ] Quiescence search
- [ ] Time control management / iterative deepening