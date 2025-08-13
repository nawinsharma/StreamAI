import { BaseMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { StateGraph, START, END } from "@langchain/langgraph";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

interface AgentExecutorStore {
  input: string;
  chat_history: BaseMessage[];
  result?: string;
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
        `You are a helpful assistant. You are provided a list of tools, and an input from the user.
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

    const llm = new ChatOpenAI({
      temperature: 0,
      model: "gpt-4-turbo",
      streaming: true,
    });

    const chain = initialPrompt.pipe(llm);

    const result = await chain.invoke(
      {
        input: state.input,
        chat_history: state.chat_history,
      },
      config,
    );

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

export function agentExecutor() {
  const workflow = new StateGraph<AgentExecutorStore>({
    channels: {
      input: null,
      chat_history: null,
      result: null,
      error: null,
    },
  })
    .addNode("invokeModel", invokeModel)
    .addEdge(START, "invokeModel")
    .addEdge("invokeModel", END);

  const graph = workflow.compile();
  return graph;
}
