"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  if (isAuthPage) {
    return null;
  }

  return (
    <footer className="bg-white border-t sticky bottom-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Connecté en tant que</p>
              {/* <p className="text-sm font-bold text-gray-900">{user.name}</p> */}
            </div>
            <Button
              variant="outline"
              size="sm"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            >
                <LogOut className="size-4 mr-2" />
                Se deconnecter
            </Button>
          </div>
        </div>
      </footer>
  );
}

