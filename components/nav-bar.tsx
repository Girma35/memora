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
				<span className="font-bold text-2xl tracking-tight text-white">Memora</span>
			</div>
			
			<NavigationMenu className="hidden lg:flex">
				<NavigationMenuList>
					{NAVIGATION_LIST.map((item) => (
						<NavigationMenuItem key={item.href}>
							<Link href={item.href} legacyBehavior passHref>
								<NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 focus:bg-white/5 data-[active]:bg-white/5 data-[state=open]:bg-white/5")}>
									{item.title}
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>
					))}
				</NavigationMenuList>
			</NavigationMenu>

			<div className="flex items-center gap-4">
				<Button className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-md px-6">
					Resume Session
				</Button>
				<button className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-zinc-400 hover:text-white border-0 outline-none">
					<Bell className="size-5" />
				</button>
				<button className="flex items-center justify-center size-10 rounded-full bg-white/5 border border-white/10 overflow-hidden cursor-pointer hover:bg-white/10 transition-colors">
					<User className="size-5 text-zinc-400 hover:text-white" />
				</button>
			</div>
		</header>
	);
}