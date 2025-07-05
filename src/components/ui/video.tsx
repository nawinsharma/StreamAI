"use client";

import { AIMessageComponent, AIMessageText } from "@/components/message";

export const VideoLoading = () => (
  <AIMessageComponent>
    <div className="w-[600px] bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200/50 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-red-200 to-orange-200 rounded-full animate-pulse w-32"></div>
            <div className="h-3 bg-gradient-to-r from-red-100 to-orange-100 rounded-full animate-pulse w-24"></div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-200 to-orange-200 animate-pulse"></div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-inner border border-red-100">
        <div className="space-y-3">
          <div className="h-4 bg-gradient-to-r from-red-200 to-orange-200 rounded-full animate-pulse"></div>
          <div className="h-4 bg-gradient-to-r from-red-200 to-orange-200 rounded-full animate-pulse w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-red-200 to-orange-200 rounded-full animate-pulse w-1/2"></div>
        </div>
        
        <div className="mt-4 bg-gradient-to-r from-red-200 to-orange-200 rounded-lg h-48 animate-pulse flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Loading video...</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Processing</span>
        </div>
      </div>
    </div>
  </AIMessageComponent>
);

export const Video = ({ videoId }: { videoId: string }) => {
  const width = 600;
  const height = (width * 9) / 16;

  return (
    <>
      {videoId ? (
        <AIMessageComponent>
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200/50 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Video Content</h3>
                  <p className="text-sm text-gray-600">YouTube Video</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-inner border border-red-100">
              <div
                style={{
                  position: "relative",
                  width: `${width}px`,
                  height: `${height}px`,
                }}
                className="rounded-lg overflow-hidden"
              >
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube Video"
                  style={{ position: "absolute", top: 0, left: 0 }}
                  className="rounded-lg"
                />
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Video ID: {videoId}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Ready to play</span>
              </div>
            </div>
          </div>
        </AIMessageComponent>
      ) : (
        <AIMessageText content="No valid YouTube URL found" />
      )}
    </>
  );
};
