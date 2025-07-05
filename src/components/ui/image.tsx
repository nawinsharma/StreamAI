"use client";

import { AIMessageComponent, AIMessageText } from "@/components/message";

export const DallEIamgeLoading = () => (
  <AIMessageComponent>
    <div className="px-6 py-4 rounded-3xl rounded-bl-lg bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 shadow-lg border border-gray-200/50 backdrop-blur-sm">
      <div className="text-sm leading-relaxed font-medium">
        <span className="animate-pulse">Generating image</span>
        <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
        <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
        <span className="animate-pulse" style={{ animationDelay: '0.6s' }}>.</span>
      </div>
    </div>
  </AIMessageComponent>
);

export const DalleImage = ({ url }: { url: string | undefined }) => (
  <>
    {url ? (
      <AIMessageComponent>
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200/50 shadow-lg backdrop-blur-sm max-w-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Generated Image</h3>
                <p className="text-sm text-gray-600">Created with DALL-E</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-inner border border-pink-100">
            <img 
              src={url} 
              alt="AI generated image" 
              className="w-full h-auto rounded-lg shadow-sm"
              loading="lazy"
            />
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Generated successfully</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Ready</span>
            </div>
          </div>
        </div>
      </AIMessageComponent>
    ) : (
      <AIMessageText content="The image is not generated" />
    )}
  </>
);
