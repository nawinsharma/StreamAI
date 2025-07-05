import { BaseMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { StateGraph, START, END } from "@langchain/langgraph";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import {
  chartTool,
  imageTool,
  searchTool,
  weatherTool,
  audioTool,
  youtubeTool,
  documentTool,
} from "./tools";

interface AgentExecutorStore {
  input: string;
  chat_history: BaseMessage[];
  result?: string;
  toolCall?: {
    name: string;
    parameters: Record<string, any>;
  };
  toolResult?: Record<string, any>;
  error?: string;
}

const invokeModel = async (
  state: AgentExecutorStore,
  config?: RunnableConfig,
): Promise<Partial<AgentExecutorStore>> => {
  try {
    const initialPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a helpful assistant. You are provided a list of tools, and an input from the user.\n
               Your job is to determine whether or not you have a tool which can handle the users input,
               or respond with plain text.
              `,
      ],
      new MessagesPlaceholder({
        variableName: "chat_history",
        optional: true,
      }),
      ["human", "{input}"],
    ]);

    const tools = [
      chartTool,
      searchTool,
      weatherTool,
      imageTool,
      audioTool,
      youtubeTool,
      documentTool,
    ];

    const llm = new ChatOpenAI({
      temperature: 0,
      model: "gpt-4-turbo",
      streaming: true,
    }).bindTools(tools);

    const chain = initialPrompt.pipe(llm);

    const result = await chain.invoke(
      {
        input: state.input,
        chat_history: state.chat_history,
      },
      config,
    );

    if (result.tool_calls && result.tool_calls.length > 0) {
      return {
        toolCall: {
          name: result.tool_calls[0].name,
          parameters: result.tool_calls[0].args,
        },
      };
    }

    return {
      result: result.content as string,
    };
  } catch (error) {
    console.error("Error in invokeModel:", error);
    return {
      error: `Failed to process your request: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

const invokeToolsOrReturn = (state: AgentExecutorStore) => {
  if (state.error) {
    return END;
  }
  if (state.toolCall) {
    return "invokeTools";
  }
  if (state.result) {
    return END;
  }
  throw new Error("No tool call or result found");
};

const invokeTools = async (
  state: AgentExecutorStore,
  config?: RunnableConfig,
): Promise<Partial<AgentExecutorStore>> => {
  try {
    if (!state.toolCall) {
      throw new Error("No tool call found.");
    }

    const toolMap = {
      [chartTool.name]: chartTool,
      [searchTool.name]: searchTool,
      [weatherTool.name]: weatherTool,
      [imageTool.name]: imageTool,
      [audioTool.name]: audioTool,
      [youtubeTool.name]: youtubeTool,
      [documentTool.name]: documentTool,
    };

    const selectedTool = toolMap[state.toolCall.name];

    if (!selectedTool) {
      throw new Error(`Tool '${state.toolCall.name}' not found`);
    }

    const toolResult = await (selectedTool as any).invoke(
      state.toolCall.parameters,
      config,
    );

    // Check if the tool result contains an error
    const parsedResult = typeof toolResult === 'string' ? JSON.parse(toolResult) : toolResult;
    if (parsedResult.error) {
      return {
        error: `Tool execution failed: ${parsedResult.error}`,
      };
    }

    return {
      toolResult: parsedResult,
    };
  } catch (error) {
    console.error("Error in invokeTools:", error);
    return {
      error: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

export function agentExecutor() {
  const workflow = new StateGraph<AgentExecutorStore>({
    channels: {
      input: null,
      chat_history: null,
      result: null,
      toolCall: null,
      toolResult: null,
      error: null,
    },
  })
    .addNode("invokeModel", invokeModel)
    .addNode("invokeTools", invokeTools)
    .addConditionalEdges("invokeModel", invokeToolsOrReturn)
    .addEdge(START, "invokeModel")
    .addEdge("invokeTools", END);

  const graph = workflow.compile();
  return graph;
}
