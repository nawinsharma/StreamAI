"use client";

import { AIMessageComponent, AIMessageText } from "@/components/message";

export const DallEIamgeLoading = () => (
  <AIMessageComponent>
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200/50 shadow-lg max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full animate-pulse w-32"></div>
            <div className="h-3 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full animate-pulse w-24"></div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-200 to-rose-200 animate-pulse"></div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-inner border border-pink-100">
        <div className="space-y-4">
          <div className="h-4 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full animate-pulse"></div>
          <div className="h-4 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full animate-pulse w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full animate-pulse w-1/2"></div>
        </div>
        
        <div className="mt-6 bg-gradient-to-r from-pink-200 to-rose-200 rounded-lg h-64 animate-pulse flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/50 flex items-center justify-center">
            <svg className="w-10 h-10 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-center">
          <div className="h-8 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full animate-pulse w-32"></div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Generating image...</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
          <span>Processing</span>
        </div>
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
