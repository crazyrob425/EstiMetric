import { chatWithGrandMaster } from "./geminiService.ts";

/**
 * Foreman Intelligence Core (Native Implementation)
 * A robust, dependency-free state machine for trade reasoning.
 * 100% Native TypeScript. Zero external logic libraries.
 */

interface ForemanState {
  messages: any[];
  routing: string;
  hardware: string;
  context: any;
}

export const hardwareStatus = "Native Core Online";

// Node 1: Triage (Determines complexity based on keywords)
const triageNode = (input: string): 'deep' | 'fast' => {
  const lowerInput = input.toLowerCase();
  const needsDeep = 
    lowerInput.includes("permit") || 
    lowerInput.includes("analyze") || 
    lowerInput.includes("structure") || 
    lowerInput.includes("blueprint") ||
    lowerInput.includes("code") ||
    lowerInput.includes("load") ||
    lowerInput.includes("span");

  return needsDeep ? 'deep' : 'fast';
};

// Node 2: Fast Path (Standard Logic)
const fastNode = async (input: string, context: any) => {
  const response = await chatWithGrandMaster(input, { ...context, speedPriority: true });
  return {
    content: response.text,
    hardware: "FLASH-LITE-CORE"
  };
};

// Node 3: Deep Path (Pro Reasoning)
const deepNode = async (input: string, context: any) => {
  const response = await chatWithGrandMaster(input, { ...context, thinkingBudget: 'Deep' });
  return {
    content: response.text,
    hardware: "PRO-LOGIC-NODE"
  };
};

/**
 * Executes the Foreman's logic flow manually.
 * This guarantees no import errors or polyfill crashes.
 */
export async function runForemanGraph(userInput: string, appState: any) {
  try {
    const currentState: ForemanState = {
      messages: [{ role: 'user', content: userInput }],
      routing: 'INITIALIZING',
      hardware: 'BOOT',
      context: appState
    };

    const route = triageNode(userInput);
    currentState.routing = route;

    let result;
    if (route === 'deep') {
      result = await deepNode(userInput, appState);
    } else {
      result = await fastNode(userInput, appState);
    }

    currentState.messages.push({ role: 'assistant', content: result.content });
    currentState.hardware = result.hardware;

    return {
      messages: currentState.messages,
      routing: currentState.routing,
      hardware: currentState.hardware
    };

  } catch (error) {
    console.error("[ForemanCore] Logic Fracture:", error);
    
    // Failsafe: Direct call if logic routing fails
    const fallback = await chatWithGrandMaster(userInput, appState);
    return {
      messages: [{ role: 'user', content: userInput }, { role: 'assistant', content: fallback.text }],
      routing: 'EMERGENCY_RECOVERY',
      hardware: 'FAILSAFE-MODE'
    };
  }
}