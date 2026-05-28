import Link from "next/link";
import { Button } from "./ui/button";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
	NAVIGATION_LIST,
} from "./ui/navigation-menu";

export function NavBar() {
	return (
		<header className="flex items-center justify-between p-4 border-b">
			<p className="font-bold text-xl">memora</p>
			
			<NavigationMenu>
				<NavigationMenuList>
					{NAVIGATION_LIST.map((item) => (
						<NavigationMenuItem key={item.href}>
							<Link href={item.href} legacyBehavior passHref>
								<NavigationMenuLink className={navigationMenuTriggerStyle()}>
									{item.title}
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>
					))}
				</NavigationMenuList>
			</NavigationMenu>

			<div className="flex gap-4">
				<Button variant="outline">Login</Button>
				<Button>Register</Button>
			</div>
		</header>
	);
}