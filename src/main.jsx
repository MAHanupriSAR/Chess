import { createRoot } from 'react-dom/client'
import './index.css'
import Board from './components/Board'

createRoot(document.getElementById('root')).render(
  <Board fenString="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"></Board>
)