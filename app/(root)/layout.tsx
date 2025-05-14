import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";
import { signOut } from "@/lib/actions/auth.action"; // Add this import

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
      <div className="root-layout">
        <nav className="flex items-center justify-between"> {/* Updated container */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
            <h2 className="text-primary-100">PrepLens</h2>
          </Link>

          {/* Add Sign Out Button */}
          <form action={signOut}>
            <button
                type="submit"
                className="btn-secondary" // Use your existing button style
            >
              Sign Out
            </button>
          </form>
        </nav>

        {children}
      </div>
  );
};

export default Layout;