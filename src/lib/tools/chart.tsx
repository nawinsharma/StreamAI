import { tool } from "@langchain/core/tools";
import { RunnableConfig } from "@langchain/core/runnables";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";
import { z } from "zod";
import { CUSTOM_EVENT_NAME } from "@/app/server";
import { ChartJS } from "@/components/ui/chart";
import { ErrorHandler, createToolError } from "@/lib/error-handler";

const chartToolSchema = z.object({
  title: z
    .string()
    .describe(
      "The title to be displayed at the top of the generated chart. This should provide context for the data presented, such as 'Sales Performance for 2023' or 'Monthly Revenue'.",
    ),
  type: z
    .enum([
      "bar",
      "line",
      "pie",
      "scatter",
      "bubble",
      "doughnut",
      "polarArea",
      "radar",
    ])
    .describe(
      "The type of chart to generate. Choose from 'bar', 'line', 'pie', 'scatter', 'bubble', 'doughnut', 'polarArea', or 'radar'.",
    ),
  data: z
    .object({
      label: z
        .string()
        .describe(
          "A descriptive label for the data point (e.g., 'January', 'Sales').",
        ),
      value: z
        .number()
        .describe(
          "The numeric value corresponding to the label (e.g., 100, 250).",
        ),
    })
    .array(),
});

export const chartTool = tool(
  async (input, config: RunnableConfig) => {
    try {
      // Validate input data
      if (!input.data || input.data.length === 0) {
        throw new Error("Chart data is required and cannot be empty");
      }

      if (!input.title || input.title.trim() === "") {
        throw new Error("Chart title is required");
      }

      if (!input.type) {
        throw new Error("Chart type is required");
      }

      await dispatchCustomEvent(
        CUSTOM_EVENT_NAME,
        {
          output: {
            value: <ChartJS {...input} />,
            type: "append",
          },
        },
        config,
      );

      return JSON.stringify(input, null);
    } catch (error) {
      console.error("Chart generation error:", error);
      
      if (error instanceof Error) {
        ErrorHandler.handleToolError(createToolError("ChartGenerationTool", error.message, error));
      }

      return JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate chart',
        data: input 
      }, null);
    }
  },
  {
    name: "ChartGenerationTool",
    description:
      "Generates a chart (e.g., bar, line, pie) matching ChartTypeRegistry from an array of data points using Chart.js, displaying the chart for the user. Each data point includes a label (e.g., 'January', 'Sales') and a corresponding numeric value (e.g., 100, 250).",
    schema: chartToolSchema,
  },
);
