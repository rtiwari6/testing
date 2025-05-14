import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";
import { signOut } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
      <div className="root-layout">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Mockly Logo" width={50} height={50} />
            <h2 className="text-primary-100">MOCKLY</h2>
          </Link>

          {/* ✅ Buttons Container */}
          <div className="flex gap-4">
            {/* Back to Home Button */}
            <Link href="/">
              <button type="button" className="btn-secondary">
                Back
              </button>
            </Link>

            {/* Sign Out Button */}
            <form action={signOut}>
              <button type="submit" className="btn-secondary">
                Sign Out
              </button>
            </form>
          </div>
        </nav>

        {children}
      </div>
  );
};

export default Layout;
