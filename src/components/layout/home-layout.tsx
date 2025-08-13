import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import HomeSidebar from "../sidebar/home-sidebar";
import { MobileSidebarSheet } from "../sidebar/mobile-sidebar-sheet";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="w-full">
        <div className="min-h-screen flex w-full">
          <div className="md:hidden fixed top-[7px] left-4 z-50">
            <MobileSidebarSheet />
          </div>
          
          <div className="hidden md:block">
            <HomeSidebar />
          </div>
          
          <SidebarInset className="w-full flex flex-col">
            <main className="relative w-full mx-auto overflow-hidden flex-1">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default HomeLayout;