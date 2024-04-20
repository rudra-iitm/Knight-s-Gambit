
import { MOVE } from '@/pages/Arena';
import { Square, PieceSymbol, Color } from 'chess.js'
import { useState } from 'react';

const ChessBoard = ({ board, socket, chess, setBoard, color } : {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chess: any,
    color: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setBoard: any,
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][],
    socket: WebSocket
    }) => {

    const [from, setFrom] = useState<Square | null>(null)
  return (
    <div className={`w-full h-full grid grid-rows-8 ${color == 'black' ? 'rotate-180': ''}`}>
        {board.map((row, i) => (
            <div key={i} className='flex grid-cols-8'>
            {row.map((square, j) => {
                const sq = String.fromCharCode(96 + (j%8) + 1) + "" + (8 - i) as Square;

                return (
                  <div key={j} onClick={
                      () => {
                         if (!from) {
                          setFrom(() => square?.square ?? null)
                         } else {
                            try {
                            socket.send(JSON.stringify({
                                type: MOVE,
                                move: {
                                    from: from,
                                    to: sq
                                }
                            }))
                            chess.move({from: from, to: sq})
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
        ))}
    </div>
  ) 
}

export default ChessBoard