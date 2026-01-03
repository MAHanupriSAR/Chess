import './Piece.css';

import b_p from '../assets/black_pieces/p.svg';
import b_r from '../assets/black_pieces/r.svg';
import b_n from '../assets/black_pieces/n.svg';
import b_b from '../assets/black_pieces/b.svg';
import b_q from '../assets/black_pieces/q.svg';
import b_k from '../assets/black_pieces/k.svg';

import w_p from '../assets/white_pieces/p.svg';
import w_r from '../assets/white_pieces/r.svg';
import w_n from '../assets/white_pieces/n.svg';
import w_b from '../assets/white_pieces/b.svg';
import w_q from '../assets/white_pieces/q.svg';
import w_k from '../assets/white_pieces/k.svg';

const pieceImages = {
   // Black (lowercase in FEN)
   'p': b_p, 'r': b_r, 'n': b_n, 'b': b_b, 'q': b_q, 'k': b_k,
   // White (uppercase in FEN)
   'P': w_p, 'R': w_r, 'N': w_n, 'B': w_b, 'Q': w_q, 'K': w_k
};

export default function Piece({ piece }) {
   if (!piece) return null;

   return (
      <img src={pieceImages[piece]} alt={piece} className="chess_piece" />
   );
}