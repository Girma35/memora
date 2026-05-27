import { Button } from "./ui/button";

export function NavBar() {
    return (
        <header className="flex justify-between">
            <p>memora</p>
            <div className="flex gap-4">
            <Button>Login</Button>
            <Button>Register</Button>
            </div>
        </header>
    )
}   