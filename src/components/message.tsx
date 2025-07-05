import { ReactNode } from "react";

export interface MessageTextProps {
  content: string;
}

export function AIMessageComponent({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end mb-6 animate-in slide-in-from-right-2 duration-300">
      <div className="flex items-end space-x-3 max-w-[85%]">
        <div className="flex flex-col items-end space-y-2">
          <div className="px-6 py-4 rounded-3xl rounded-br-lg bg-gradient-to-br from-blue-200 to-blue-300 text-white shadow-lg border border-blue-400/20 backdrop-blur-sm">
            <div className="text-sm leading-relaxed font-medium">{children}</div>
          </div>
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function AIMessageText(props: MessageTextProps) {
  return (
    <div className="flex justify-end mb-6 animate-in slide-in-from-right-2 duration-300">
      <div className="flex items-end space-x-3 max-w-[85%]">
        <div className="flex flex-col items-end space-y-2">
          <div className="px-6 py-4 rounded-3xl rounded-br-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border border-blue-400/20 backdrop-blur-sm">
            <div 
              className="text-sm leading-relaxed font-medium"
              dangerouslySetInnerHTML={{
                __html: props.content.replace(/\n/g, "<br />"),
              }}
            />
          </div>
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function HumanMessageText(props: MessageTextProps) {
  return (
    <div className="flex justify-start mb-6 animate-in slide-in-from-left-2 duration-300">
      <div className="flex items-end space-x-3 max-w-[85%]">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex flex-col items-start space-y-2">
          <div className="px-6 py-4 rounded-3xl rounded-bl-lg bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 shadow-lg border border-gray-200/50 backdrop-blur-sm">
            <div className="text-sm leading-relaxed font-medium">{props.content}</div>
          </div>
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AISkeletonLoading() {
  return (
    <div className="flex justify-end mb-6 animate-in slide-in-from-right-2 duration-300">
      <div className="flex items-end space-x-3 max-w-[85%]">
        <div className="flex flex-col items-end space-y-2">
          <div className="px-6 py-4 rounded-3xl rounded-br-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border border-blue-400/20 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-white/90 font-medium">AI is thinking...</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
