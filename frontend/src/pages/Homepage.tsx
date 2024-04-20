import { Button } from "@/components/ui/button"
import chess_cover_img from "/chess_cover.jpeg"
import chess_pieces_img from "/chess_pieces.jpeg"
import { SVGProps } from "react"
import { JSX } from "react/jsx-runtime"
import { useNavigate } from "react-router-dom"


export default function Homepage() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">Chess Mastery</h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                Elevate your chess game with our comprehensive platform. Compete against players worldwide, master
                strategies through interactive tutorials, and unlock your full potential.
              </p>
              <Button
                className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                onClick={() => navigate("/arena")}
              >
                Start Playing
              </Button>
            </div>
            <div className="flex justify-center">
              <img
                alt="Chess Board"
                className="aspect-[3/2] rounded-xl object-cover"
                height={400}
                src={chess_cover_img}
                width={600}
              />
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex justify-center">
              <img
                alt="Chess Pieces"
                className="aspect-[5/4] rounded-xl object-cover"
                height={400}
                src={chess_pieces_img}
                width={500}
              />
            </div>
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                About the Game
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Unleash Your Chess Potential
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Chess is a timeless game of strategy and intellect. Our platform offers a comprehensive experience, from
                interactive tutorials to challenging online matches against players from around the world. Elevate your
                chess skills and become a true master of the game.
              </p>
              <Button
                className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
              >
                Start Playing
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="space-y-4 text-center">
            <div className="inline-block rounded-lg bg-gray-200 px-3 py-1 text-sm dark:bg-gray-700">Key Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Elevate Your Chess Experience
            </h2>
            <p className="max-w-[700px] mx-auto text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Our chess platform offers a wide range of features to help you improve your game and enjoy the thrill of
              competition.
            </p>
          </div>
          <div className="grid gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg p-6 shadow-sm dark:bg-gray-950">
              <GamepadIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              <h3 className="text-lg font-semibold mt-2">Diverse Game Modes</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Explore a variety of game modes, from classic chess to time-limited challenges, to keep your skills
                sharp.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm dark:bg-gray-950">
              <UsersIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              <h3 className="text-lg font-semibold mt-2">Online Multiplayer</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Challenge players from around the world in real-time matches and climb the global leaderboard.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm dark:bg-gray-950">
              <BookOpenIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              <h3 className="text-lg font-semibold mt-2">Interactive Tutorials</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Learn from the best with our comprehensive chess tutorials, covering openings, tactics, and advanced
                strategies.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function BookOpenIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}


function GamepadIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <rect width="20" height="12" x="2" y="6" rx="2" />
    </svg>
  )
}


function UsersIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}