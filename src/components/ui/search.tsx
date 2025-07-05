"use client";

import { AIMessageComponent } from "@/components/message";

export const SearchLoading = () => (
  <AIMessageComponent>
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200/50 shadow-lg max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-emerald-200 to-green-200 rounded-full animate-pulse w-32"></div>
            <div className="h-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full animate-pulse w-24"></div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-200 to-green-200 animate-pulse"></div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-inner border border-emerald-100">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-200 to-green-200 animate-spin flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-emerald-200 to-green-200 rounded-full animate-pulse w-48"></div>
            <div className="h-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full animate-pulse w-32"></div>
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          {Array(3).fill(null).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 bg-gradient-to-r from-emerald-200 to-green-200 rounded-full animate-pulse"></div>
              <div className="h-3 bg-gradient-to-r from-emerald-200 to-green-200 rounded-full animate-pulse w-3/4"></div>
              <div className="h-3 bg-gradient-to-r from-emerald-200 to-green-200 rounded-full animate-pulse w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Searching...</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span>Processing</span>
        </div>
      </div>
    </div>
  </AIMessageComponent>
);
