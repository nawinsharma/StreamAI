"use client";

import { AIMessageComponent } from "@/components/message";
import { DocumentInterface } from "@langchain/core/documents";

export const DocumentLoading = () => (
  <AIMessageComponent>
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-600/30 shadow-lg max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-amber-200 to-yellow-200 dark:from-amber-700 dark:to-yellow-700 rounded-full animate-pulse w-32"></div>
            <div className="h-3 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-600 dark:to-yellow-600 rounded-full animate-pulse w-24"></div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-200 to-yellow-200 dark:from-amber-700 dark:to-yellow-700 animate-pulse"></div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="h-4 bg-gradient-to-r from-amber-200 to-yellow-200 dark:from-amber-700 dark:to-yellow-700 rounded-full animate-pulse w-full"></div>
          <div className="h-4 bg-gradient-to-r from-amber-200 to-yellow-200 dark:from-amber-700 dark:to-yellow-700 rounded-full animate-pulse w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-amber-200 to-yellow-200 dark:from-amber-700 dark:to-yellow-700 rounded-full animate-pulse w-1/2"></div>
        </div>
      </div>
    </div>
  </AIMessageComponent>
);

export const Document = (documents: DocumentInterface[]) => (
  <AIMessageComponent>
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-600/30 shadow-lg backdrop-blur-sm max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Document Search Results</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{documents.length} documents found</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      </div>
      
      <div className="space-y-4">
        {documents.map((doc, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-inner border border-amber-100 dark:border-amber-700/30">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Document {index + 1}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {doc.pageContent}
                </p>
                {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-amber-100 dark:border-amber-700/30">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <strong>Metadata:</strong>
                      <pre className="mt-1 text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto">
                        {JSON.stringify(doc.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </AIMessageComponent>
);
