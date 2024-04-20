import  { useState } from "react";
import { HoveredLink, Menu, MenuItem } from "./ui/navbar-menu";
import { cn } from "@/utils/cn";
import {  SignInButton, SignOutButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

export function Navbar() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <NavbarFnc className="top-2" />
    </div>
  );
}

function NavbarFnc({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="Play Game">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/web-dev">Against Bot</HoveredLink>
            <HoveredLink href="/interface-design">Multi Player</HoveredLink>
            <HoveredLink href="/seo">Create Room</HoveredLink>
            <HoveredLink href="/branding">Join Room</HoveredLink>
          </div>
        </MenuItem>
        <SignedOut>
        <SignInButton>
            <button className="cursor-pointer text-white hover:opacity-[0.9] dark:text-white"> 
                Log In
            </button>
        </SignInButton>
        </SignedOut>
        <SignedIn>
        <SignOutButton>
            <button className="cursor-pointer text-white hover:opacity-[0.9] dark:text-white"> 
                Log Out
            </button>
        </SignOutButton>
        </SignedIn>
        <SignUpButton>
        <button className="cursor-pointer text-white hover:opacity-[0.9] dark:text-white"> 
            Create an Account
        </button>
        </SignUpButton>
        <SignedIn>
            <UserButton afterSignOutUrl='/sign-in' />
        </SignedIn>
      </Menu>
    </div>
  );
}
