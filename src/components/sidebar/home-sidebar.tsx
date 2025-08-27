"use client";

import React, { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import MainSection from "@/components/sidebar/main-section";
import SidebarFooterSection from "@/components/sidebar/sidebar-footer";

interface HomeSidebarProps {
  isMobile?: boolean;
}

const HomeSidebar = ({ isMobile = false }: HomeSidebarProps) => {
  const { state } = useSidebar();
  
  useEffect(() => {
    if (!isMobile) {
      document.documentElement.setAttribute('data-sidebar-collapsed', state === 'collapsed' ? 'true' : 'false');
    }
    
    return () => {
      if (!isMobile) {
        document.documentElement.removeAttribute('data-sidebar-collapsed');
      }
    };
  }, [state, isMobile]);
  
  return (
    <div className={isMobile ? "h-full flex flex-col" : ""}>
      <Sidebar
        collapsible={isMobile ? "none" : "icon"}
        className={`bg-background border-none ${
          isMobile 
            ? 'w-full h-full' 
            : 'w-[18rem] group-data-[collapsible=icon]:w-10 transition-all duration-300 ease-in-out'
        } flex flex-col z-50`}
      >
        <SidebarContent className="bg-background">
          <MainSection isMobile={isMobile} />
        </SidebarContent> 
        
        <SidebarFooter className={`p-4 bg-background ${
          !isMobile ? 'group-data-[collapsible=icon]:opacity-0 transition-all duration-500 ease-in-out' : ''
        }`}>
          <SidebarFooterSection />
        </SidebarFooter>
      </Sidebar>
    </div>
  );
};

export default HomeSidebar;