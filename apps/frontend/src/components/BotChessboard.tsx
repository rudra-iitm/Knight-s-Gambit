/* eslint-disable @typescript-eslint/no-unused-vars */

import { IMove, MOVE } from '@/pages/Arena';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { Square, PieceSymbol, Color, Chess } from 'chess.js'
import { useState } from 'react';

const BotChessBoard = () => {

    const { isSignedIn, user, isLoaded } = useUser();
    console.log('userId', user?.id)
    console.log('isSignedIn', isSignedIn)
    const [chess, _setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [_color, _setColor] = useState('w');
    const [matching, _setMatching] = useState(false);
    const [_result, setResult] = useState<"WHITE_WINS" | "BLACK_WINS" | "DRAW" | typeof OPPONENT_DISCONNECTED | null>(null);
    const [_added, setAdded] = useState(false);

    const [from, setFrom] = useState<Square | null>(null)
    const [_legalMoves, setLegalMoves] = useState<string[]>([])
    // const _labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const [gameOver, _setGameOver] = useState(false)

  return (
    <>
    {gameOver && <div className='absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center'>Game Over</div>}
    <div className={`w-full h-full grid grid-rows-8`}>
        {(board).map((row, i) => {
            i = 8 - i;
            return (
            <div key={i} className='flex grid-cols-8'>
            {(row).map((square, j) => {
                j = j % 8;
                // const isMainBoxColor = isFlipped
                //     ? (i + j) % 2 === 0
                //     : (i + j) % 2 !== 0;
                  const squareRepresentation = (String.fromCharCode(97 + j) +
                    '' +
                    i) as Square;

                return (
                  <div key={j} onClick={
                      async () => {
                        if (from === squareRepresentation) {
                            setFrom(null);
                          }
                         if (!from) {
                          setFrom(() => squareRepresentation)
                          setLegalMoves(
                            chess
                              .moves({ verbose: true, square: square?.square })
                              .map((move: any) => move.to),
                          );
                         } 
                         else {
                            console.log('from', from)
                            console.log('to', squareRepresentation)
                            chess.move({from: from, to: squareRepresentation})
                            const { data } = await axios.post('http://localhost:3000/bot/move', { fen: chess.fen() });
                            console.log(data.from, data.to)
                            setBoard(chess.board())
                            setFrom(null);
                            chess.move({from: data.from, to: data.to})
                            setLegalMoves([]);
                            setBoard(chess.board())
                            setFrom(null)
                         }
                        
                      }
                  } className={`w-full h-full ${(i+j)%2 ? 'bg-gray-200' : 'bg-primary'}`}>
                      <div className='flex justify-center items-center h-full'>
                          <img src={`/pieces/${square?.type}-${square?.color}.png`} alt="" />
                      </div>
                  </div>
                );
            })}
            </div>
            );
        })}
    </div>
    </>
  ) 
}

export default BotChessBoard