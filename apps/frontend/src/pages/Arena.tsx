import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SVGProps, useEffect, useState } from "react"
import { JSX } from "react/jsx-runtime"
import ChessBoard from "@/components/ChessBoard"
import { useSocket } from "@/hooks/useSocket"
import {Chess, Square} from 'chess.js';
import { Loader, Loader2 } from "@/components/Loader"
import { useUser } from "@clerk/clerk-react"
import { useNavigate, useParams } from "react-router-dom"

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const OPPONENT_DISCONNECTED = "opponent_disconnected";
export const GAME_OVER = "game_over";
export const JOIN_ROOM = "join_room";
export const GAME_JOINED = "game_joined"
export const GAME_ALERT = "game_alert"
export const GAME_ADDED = "game_added"
export const GAME_STARTED = "game_started"

export interface IMove {
  from: Square; to: Square
}

interface Metadata {
  blackPlayer: { id: string, name: string };
  whitePlayer: {id: string, name: string };
}

export default function Arena() {

  const socket = useSocket();
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { isSignedIn, user, isLoaded } = useUser();
  console.log('userId', user?.id)
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [color, setColor] = useState('w');
  const [matching, setMatching] = useState(false);
  const [started, setStarted] = useState(false)
  const [gameMetadata, setGameMetadata] = useState<Metadata | null>(null)
  const [result, setResult] = useState<"WHITE_WINS" | "BLACK_WINS" | "DRAW" | typeof OPPONENT_DISCONNECTED | null>(null);
  const [moves, setMoves] = useState<IMove[]>([]);
  const [added, setAdded] = useState(false);
  const [gameID, setGameID] = useState('');
  console.log(gameMetadata)

  useEffect(() => {
  console.log('GAME', gameId)

    if (!socket) {
      return;
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('message', message);
      switch (message.type) {
        case GAME_ADDED:
          setAdded(true);
          break;
        case INIT_GAME:
          // eslint-disable-next-line no-case-declarations
          setBoard(chess.board());
          setStarted(true);
          navigate(`/arena/${message.payload.gameId}`)
          console.log('move', message.payload);
          setGameMetadata({
            blackPlayer: message.payload.blackPlayer,
            whitePlayer: message.payload.whitePlayer
        })
          break;
        case MOVE:
          // eslint-disable-next-line no-case-declarations
          const move = message.payload;
          console.log('move', move);
          // eslint-disable-next-line no-case-declarations
          const moves = chess.moves({verbose: true});
          if (moves.map(x => JSON.stringify(x)).includes(JSON.stringify(move))) return;
          try {
            chess.move(move);
          } catch (error) {
            console.log(error);
            return;
          }
          console.log('moved successfully');
          setBoard(chess.board());
            setMoves(moves => [...moves, move])
          break;
        case GAME_OVER:
          setResult(message.payload.result);
          break;
        case OPPONENT_DISCONNECTED:
          setResult(OPPONENT_DISCONNECTED);
          break;
        case GAME_JOINED:
          setGameMetadata({
            blackPlayer: message.payload.blackPlayer,
            whitePlayer: message.payload.whitePlayer
          })
          setStarted(true);
          setMoves(message.payload.moves);
          message.payload.moves.map(move => chess.move(move))
          break;
        default:
          alert(message.payload.message)
          break;
      }
    }

    if (gameId !== "random") {
      socket.send(JSON.stringify({
          type: JOIN_ROOM, 
          payload: {
              gameId
          }
      }))
  }

    return () => {
      socket.onmessage = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, chess]);

  if (!socket || !isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size={16}/>
      </div>
    )
  }

  if (!isSignedIn) {
    navigate('/');
  }

  return (
    <div key="1" className="grid min-h-screen w-full grid-cols-[300px_1fr] bg-gray-100 dark:bg-gray-950">
      <div className="flex flex-col gap-6 border-r bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="space-y-4">
          <div className="flex items-center justify-between overflow-hidden">
            <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>{gameMetadata?.whitePlayer.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="truncate flex justify-between gap-16 items-center">
                <div>
                    <h3 className="text-lg font-semibold">{gameMetadata?.whitePlayer.name}</h3>
                </div>
                <div>
                <Button size="icon" variant={'outline'}>
                    <SettingsIcon className="h-5 w-5" />
                        <span className="sr-only">Settings</span>
                </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>{gameMetadata?.blackPlayer.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="truncate">
                <h3 className="text-lg font-semibold">{gameMetadata?.blackPlayer.name}</h3>
              </div>
            </div>
            </div>
          </div>
          {started && (
        <div className={`flex font-semibold items-center justify-center rounded-lg  p-3 ${(user?.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w') ===
        chess.turn()
          ? 'bg-green-500'
          : "bg-red-500"}`}>
          {(user?.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w') ===
          chess.turn()
            ? 'Your turn'
            : "Opponent's turn"}
        </div>
      )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Wins</p>
              <p className="text-2xl font-bold">142</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Losses</p>
              <p className="text-2xl font-bold">38</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Draws</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
        </div>
        <div>
            {!started && gameId == 'random' && <Button className="w-full" onClick={
              () => {
                socket.send(JSON.stringify({
                  type: INIT_GAME,
                })
                )
                setStarted(!started);
              }
            }>
                {matching ? <div className="flex justify-center items-center gap-4">
                  <Loader2 />
                  <div>
                    Matching
                  </div>
                </div> : 'Start Game'}
            </Button>}
        </div>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Recent Games</h4>
          <div className="grid gap-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>GM</AvatarFallback>
                </Avatar>
                <div>
                  <h5 className="text-sm font-medium">Grandmaster</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2600 ELO</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">1 - 0</p>
                <Badge className="rounded-full px-2 py-1 text-xs" variant="outline">
                  Win
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>FM</AvatarFallback>
                </Avatar>
                <div>
                  <h5 className="text-sm font-medium">Fide Master</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2400 ELO</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">0 - 1</p>
                <Badge className="rounded-full px-2 py-1 text-xs" variant="outline">
                  Loss
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>IM</AvatarFallback>
                </Avatar>
                <div>
                  <h5 className="text-sm font-medium">International Master</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2500 ELO</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">0.5 - 0.5</p>
                <Badge className="rounded-full px-2 py-1 text-xs" variant="outline">
                  Draw
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center bg-gray-100 p-6 dark:bg-gray-950">
        <div className="h-[750px] w-[750px] rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900" >
             <ChessBoard moves={moves} gameId={gameId || ''} color={
                          user?.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w'
                        } chess={chess} setBoard={setBoard} socket={socket} board={board} />
        </div>
      </div>
    </div>
  )
}

function SettingsIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}