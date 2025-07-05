"use client";

import { useRef, useEffect } from "react";
import { Chart, ChartTypeRegistry, registerables } from "chart.js";
import { AIMessageComponent } from "@/components/message";

// Register all available components
Chart.register(...registerables);

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ChartJSProps {
  type: string;
  title: string;
  data: ChartDataPoint[];
}

const getBackgroundColors = (count: number) => {
  const colors = [
    'rgba(59, 130, 246, 0.8)',   // Blue
    'rgba(16, 185, 129, 0.8)',   // Green
    'rgba(245, 158, 11, 0.8)',   // Yellow
    'rgba(239, 68, 68, 0.8)',    // Red
    'rgba(139, 92, 246, 0.8)',   // Purple
    'rgba(236, 72, 153, 0.8)',   // Pink
    'rgba(14, 165, 233, 0.8)',   // Sky
    'rgba(34, 197, 94, 0.8)',    // Emerald
  ];
  
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

export const ChartJS = (props: ChartJSProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const backgroundColor = getBackgroundColors(props.data.length);

  const downloadChart = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${props.title}-chart.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    if (ctx) {
      // reactStrictMode calling twice
      // Destroy previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create a new chart
      chartInstanceRef.current = new Chart(ctx, {
        type: props.type as keyof ChartTypeRegistry,
        data: {
          labels: props.data.map((d) => d.label),
          datasets: [
            {
              label: props.title,
              data: props.data.map((d) => d.value),
              backgroundColor,
              borderColor: backgroundColor.map(color => color.replace('0.8', '1')),
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12,
                  weight: 'bold' as const
                }
              }
            },
            title: {
              display: true,
              text: props.title,
              font: {
                size: 16,
                weight: 'bold' as const
              },
              padding: {
                top: 10,
                bottom: 20
              }
            }
          },
          scales: {
            y: {
              type: "linear",
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                font: {
                  size: 11
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  size: 11
                }
              }
            }
          },
          elements: {
            point: {
              radius: 6,
              hoverRadius: 8
            }
          }
        },
      });
    }

    // Cleanup function to destroy the chart when component unmounts
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <AIMessageComponent>
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200/50 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Data Visualization</h3>
              <p className="text-sm text-gray-600">{props.type.charAt(0).toUpperCase() + props.type.slice(1)} Chart</p>
            </div>
          </div>
          <button
            onClick={downloadChart}
            className="p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm border border-gray-200 group"
            title="Download chart"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-inner border border-indigo-100">
          <div style={{ width: "600px", height: "400px" }}>
            <canvas ref={canvasRef} />
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>{props.data.length} data points</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Interactive</span>
          </div>
        </div>
      </div>
    </AIMessageComponent>
  );
};
