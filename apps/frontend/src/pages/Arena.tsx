import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SVGProps, useEffect, useState } from "react"
import { JSX } from "react/jsx-runtime"
import ChessBoard from "@/components/ChessBoard"
import { useSocket } from "@/hooks/useSocket"
import {Chess, DEFAULT_POSITION} from 'chess.js';
import { Loader, Loader2 } from "@/components/Loader"

export const INIT_GAME = 'init_game';
export const MOVE = 'move';
export const GAME_OVER = 'game_over';
export const GAME_STARTED = 'game_started';

export default function Arena() {

  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [active, setActive] = useState(false);
  const [color, setColor] = useState('white');
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    if (!socket) {
      return;
    }

    console.log('socket', socket);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('message', message);
      switch (message.type) {
        case INIT_GAME:
          setMatching(true);
          break;
        case MOVE:
          // eslint-disable-next-line no-case-declarations
          const move = message.payload;
          chess.move(move);
          setBoard(chess.board());
          console.log('move', message.payload);
          break;
        case GAME_OVER:
          console.log('game_over', message.payload);
          break;
        case GAME_STARTED:
          setChess(new Chess(DEFAULT_POSITION));
          setBoard(chess.board());
          setActive(true)
          setColor(message.payload.color);
          console.log('game_started', message.payload);
          break;
        default:
          break;
      }
    }

    return () => {
      socket.onmessage = null;
    }
  }, [socket]);

  if (!socket) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size={16}/>
      </div>
    )
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
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="truncate flex justify-between gap-16 items-center">
                <div>
                    <h3 className="text-lg font-semibold">John Doe</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">2450 ELO</p>
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
                <AvatarFallback>GM</AvatarFallback>
              </Avatar>
              <div className="truncate">
                <h3 className="text-lg font-semibold">Grandmaster</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">2600 ELO</p>
              </div>
            </div>
            </div>
          </div>
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
            {!active && <Button className="w-full" disabled={matching} onClick={
              () => {
                socket.send(JSON.stringify({
                  type: INIT_GAME,
                })
                )
                setMatching(!matching);
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
             <ChessBoard color={color} chess={chess} setBoard={setBoard} socket={socket} board={board} />
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