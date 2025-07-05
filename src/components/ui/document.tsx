"use client";

import { AIMessageComponent } from "@/components/message";
import { DocumentInterface } from "@langchain/core/documents";

export const DocumentLoading = () => (
  <AIMessageComponent>
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200/50 shadow-lg max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full animate-pulse w-32"></div>
            <div className="h-3 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full animate-pulse w-24"></div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-200 to-yellow-200 animate-pulse"></div>
      </div>
      
      <div className="space-y-4">
        {Array(3).fill(null).map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-inner border border-amber-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-4 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full animate-pulse w-48"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full animate-pulse"></div>
              <div className="h-3 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full animate-pulse w-3/4"></div>
              <div className="h-3 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full animate-pulse w-1/2"></div>
            </div>
            <div className="mt-3 pt-3 border-t border-amber-100">
              <div className="h-3 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full animate-pulse w-24"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Loading documents...</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          <span>Processing</span>
        </div>
      </div>
    </div>
  </AIMessageComponent>
);

export const Document = (documents: DocumentInterface[]) => (
  <AIMessageComponent>
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200/50 shadow-lg backdrop-blur-sm max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Document Search Results</h3>
            <p className="text-sm text-gray-600">{documents.length} documents found</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      </div>
      
      <div className="space-y-4">
        {Object.values(documents).map((doc, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-inner border border-amber-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h5 className="font-semibold text-gray-900 text-sm line-clamp-2">
                {doc.metadata.title || `Document ${index + 1}`}
              </h5>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>#{index + 1}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 mb-3">
              {doc.pageContent}
            </p>
            
            {doc.metadata.source && (
              <div className="pt-3 border-t border-amber-100">
                <a
                  href={doc.metadata.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Read more</span>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{documents.length} documents processed</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Complete</span>
        </div>
      </div>
    </div>
  </AIMessageComponent>
);
