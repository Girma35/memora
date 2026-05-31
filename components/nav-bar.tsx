import Link from "next/link";
import { Button } from "./ui/button";
import { Bell, User } from "lucide-react";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
	NAVIGATION_LIST,
} from "./ui/navigation-menu";
import { cn } from "@/lib/utils";

export function NavBar() {
	return (
		<header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#121212] text-white">
			<div className="flex items-center gap-2">
				<Link
					href="/"
					className="font-bold text-2xl tracking-tight text-white hover:opacity-80 transition"
				>
					Memora
				</Link>
			</div>
			<NavigationMenu className="hidden lg:flex">
				<NavigationMenuList>
					{NAVIGATION_LIST.map((item) => (
						<NavigationMenuItem key={item.href}>
							<NavigationMenuLink
								asChild
								className={cn(
									navigationMenuTriggerStyle(),
									"bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 focus:bg-white/5 data-[active]:bg-white/5 data-[state=open]:bg-white/5",
								)}
							>
								<Link href={item.href}>{item.title}</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
					))}
				</NavigationMenuList>
			</NavigationMenu>
			<div className="flex items-center gap-4">
				<Button asChild className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-md px-6">
					<Link href="/workspace">Resume Session</Link>
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
				>
					<Bell />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white"
				>
					<User />
				</Button>
			</div>
		</header>
	);
}
