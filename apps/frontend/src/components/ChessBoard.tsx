/* eslint-disable @typescript-eslint/no-unused-vars */

import { IMove, MOVE } from '@/pages/Arena';
import { Square, PieceSymbol, Color } from 'chess.js'
import { useState } from 'react';

const ChessBoard = ({ board, socket, chess, setBoard, color, gameId } : {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chess: any,
    color: string,
    gameId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setBoard: any,
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][],
    socket: WebSocket
    moves: IMove[]
    }) => {

    const [from, setFrom] = useState<Square | null>(null)
    const isMyTurn = chess.turn() == color;
    const isFlipped = color == 'b';
    const [_legalMoves, setLegalMoves] = useState<string[]>([])
    // const _labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const [gameOver, _setGameOver] = useState(false)

  return (
    <>
    {gameOver && <div className='absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center'>Game Over</div>}
    <div className={`w-full h-full grid grid-rows-8 ${color == 'black' ? 'rotate-180': ''}`}>
        {(isFlipped ? board.slice().reverse() : board).map((row, i) => {
            i = isFlipped ? i + 1 : 8 - i;
            return (
            <div key={i} className='flex grid-cols-8'>
            {(isFlipped ? row.slice().reverse() : row).map((square, j) => {
                j = isFlipped ? 7 - (j % 8) : j % 8;
                // const isMainBoxColor = isFlipped
                //     ? (i + j) % 2 === 0
                //     : (i + j) % 2 !== 0;
                  const squareRepresentation = (String.fromCharCode(97 + j) +
                    '' +
                    i) as Square;

                return (
                  <div key={j} onClick={
                      () => {
                        if (!isMyTurn) return;
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
                         } else {
                            // let moveResult;
                            try {
                                // moveResult = chess.move({
                                //     from: from,
                                //     to: squareRepresentation,
                                // });
                                socket.send(JSON.stringify({
                                type: MOVE,
                                payload: {
                                    gameId: gameId,
                                    move: {
                                        from: from,
                                        to: squareRepresentation
                                    }
                                },
                            }))
                            chess.move({from: from, to: squareRepresentation})
                            setFrom(null);
                            setLegalMoves([]);
                            setBoard(chess.board())
                            setFrom(null)
                        } catch (error) {
                            setFrom(null);
                            console.error(error)
                         }
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

export default ChessBoard