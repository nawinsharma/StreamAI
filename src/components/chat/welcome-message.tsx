import React from "react";
// import { QuickActions } from "./quick-actions";

interface WelcomeMessageProps {
  userName: string;
}

export const WelcomeMessage = React.memo(({ userName }: WelcomeMessageProps) => {
  return (
    // <div className="h-full flex items-center justify-center px-6">
    //   <div className="text-center max-w-2xl mx-auto">
    //     <h1 className="text-3xl font-bold">Welcome {userName}</h1>

    //     {/* Quick Actions */}
    //     {/* <QuickActions onActionClick={onActionClick} /> */}
    //   </div>
    // </div>
    <div>
      <div className="text-center max-w-2xl mx-auto py-10">
        <h1 className="text-3xl font-bold">Welcome {userName} !</h1>
      </div>
    </div>
  );
});

WelcomeMessage.displayName = 'WelcomeMessage'; 