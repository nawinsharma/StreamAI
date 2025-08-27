"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import HomeSidebar from "./home-sidebar";

export function MobileSidebarSheet() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden cursor-pointer"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle Menu"
        >
          <Menu className="size-4 text-foreground font-bold cursor-pointer" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <SheetContent
          side="left"
          className="p-0 w-[14.5rem] [&>button]:hidden" 
          // Allow closing by tapping outside (overlay). Keep Esc disabled for mobile UX.
          onEscapeKeyDown={(e) => e.preventDefault()}
          onClick={(e) => {
            // Auto-close the sheet on navigation in mobile view
            const target = e.target as HTMLElement | null;
            const anchor = target?.closest("a");
            if (anchor) {
              setOpen(false);
            }
          }}
        >
          <span className="sr-only">Navigation Menu</span>
          <div className="h-full">
            <HomeSidebar isMobile={true} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}