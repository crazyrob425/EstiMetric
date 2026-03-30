import { GoogleGenAI, Modality, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";
import { MaterialItem, QuoteAnalysisResponse, ProjectTier, ProjectSpecs, BidData, RemodelStyle, ThinkingBudget, AppSettings, MaterialSuggestion } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Shared AudioContext — created once, reused for all TTS playback
let _audioCtx: AudioContext | null = null;
let _currentSource: AudioBufferSourceNode | null = null;

function getAudioContext(): AudioContext {
  if (!_audioCtx || _audioCtx.state === 'closed') {
    _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return _audioCtx;
}

const controlTools: FunctionDeclaration[] = [
  {
    name: 'navigateTo',
    parameters: {
      type: Type.OBJECT,
      description: 'Navigates the user to a specific section of the app.',
      properties: {
        section: { type: Type.STRING },
        step: { type: Type.NUMBER }
      },
      required: ['section'],
    },
  }
];

const getThinkingBudget = (level: ThinkingBudget, model: string): number => {
  if (level !== 'Deep') return 0;
  return model.includes('pro') ? 32768 : 24576;
};

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodePcmData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export async function chatWithGrandMaster(message: string, context?: any): Promise<{ text: string, toolCalls?: any[] }> {
  try {
    const isAwake = context?.isAwake || false;
    const model = isAwake ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    let systemInstruction = isAwake 
      ? "IDENTITY: Design Lead. PROFILE: Highly sophisticated architectural consultant and creative partner. Tone: Collaborative, encouraging, and visionary. Goal: Assist Rob in elevating projects through advanced design theory." 
      : "IDENTITY: The Foreman. PROFILE: Practical, direct construction veteran. Expert in codes and efficiency. Tone: Terse, no-nonsense, focused on structural integrity and budget.";

    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: `CONTEXT: ${JSON.stringify(context)}\nMSG: ${message}` }] }],
      config: {
        thinkingConfig: { thinkingBudget: getThinkingBudget(context?.thinkingBudget || context?.settings?.thinkingBudget || 'Standard', model) },
        tools: isAwake ? [{ functionDeclarations: controlTools }] : [{ googleSearch: {} }],
        systemInstruction: systemInstruction
      }
    });

    return { text: response.text || "...", toolCalls: response.functionCalls };
  } catch (err) {
    return { text: "The trade logic server is currently optimizing. Please retry in 5 seconds." };
  }
}

export async function speakText(text: string, voiceName: string = 'Fenrir'): Promise<void> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName as any } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    // Stop any currently playing audio
    if (_currentSource) {
      try { _currentSource.stop(); } catch { /* already stopped */ }
      _currentSource = null;
    }

    const audioCtx = getAudioContext();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    const audioBuffer = await decodePcmData(decodeBase64(base64Audio), audioCtx, 24000, 1);
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.onended = () => { _currentSource = null; };
    source.start();
    _currentSource = source;
  } catch (error) {
    console.warn("Audio output suppressed.");
  }
}

export async function optimizeMaterials(materials: MaterialItem[], specs: ProjectSpecs, tier: ProjectTier, style: RemodelStyle, budget: ThinkingBudget = 'Standard'): Promise<MaterialSuggestion[]> {
  try {
    const model = "gemini-3-pro-preview";
    const response = await ai.models.generateContent({
      model: model,
      contents: `Audit materials for a ${style} ${tier} project: ${JSON.stringify(materials)}. Based on specs: ${JSON.stringify(specs)}. Return a JSON array of MaterialSuggestion objects.`,
      config: { 
        thinkingConfig: { thinkingBudget: getThinkingBudget(budget, model) }, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              originalMaterial: { type: Type.STRING },
              suggestedMaterial: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  unitPrice: { type: Type.NUMBER }
                },
                required: ['name', 'quantity', 'unitPrice']
              },
              justification: { type: Type.STRING },
              safetyWarning: { type: Type.BOOLEAN },
              styleWarning: { type: Type.BOOLEAN },
              type: { type: Type.STRING, description: 'Replacement or Addition' }
            },
            required: ['suggestedMaterial', 'justification', 'safetyWarning', 'styleWarning', 'type']
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (err) { return []; }
}

export async function fetchLivePricing(materialName: string, settings: AppSettings, userLocation?: { lat: number, lon: number } | null): Promise<any> {
  try {
    const modelName = 'gemini-2.5-flash-native-audio-preview-12-2025';
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Current price for "${materialName}" in ${settings.zipCode || 'the user\'s local area'}. Return price, source, and a brief audit delta compared to average.`,
      config: { 
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: userLocation ? {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.lat,
              longitude: userLocation.lon
            }
          }
        } : undefined
      },
    });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourceUrls = groundingChunks.map((chunk: any) => chunk.web?.uri || chunk.maps?.uri).filter(Boolean);
    
    const text = response.text || "";
    const priceMatch = text.match(/\$\d+(\.\d{2})?/);
    return { 
      price: priceMatch ? priceMatch[0] : "Check Store", 
      confidence: 'Medium',
      sourceName: text.includes("Home Depot") ? "Home Depot" : text.includes("Lowe's") ? "Lowe's" : "Market Average",
      sourceUrl: sourceUrls[0] || undefined
    };
  } catch (err) { return { price: "Check Local Store", confidence: 'Alert' }; }
}

export async function analyzeRemodelProject(imageBytes: string, projectType: string, tier: ProjectTier, budget: ThinkingBudget = 'Standard'): Promise<QuoteAnalysisResponse> {
  try {
    const model = "gemini-3-pro-preview";
    const response = await ai.models.generateContent({
      model: model,
      contents: { 
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: imageBytes } }, 
          { text: `Perform a detailed construction takeoff for a ${tier} ${projectType}. Return JSON with measurements, materials, reasoning, and spatial data.` }
        ] 
      },
      config: { 
        thinkingConfig: { thinkingBudget: getThinkingBudget(budget, model) }, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            measurements: { type: Type.STRING },
            suggestedMaterials: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  unitPrice: { type: Type.NUMBER }
                },
                required: ['name', 'quantity', 'unitPrice']
              }
            },
            summary: { type: Type.STRING },
            reasoningChain: { type: Type.ARRAY, items: { type: Type.STRING } },
            spatialProfile: {
              type: Type.OBJECT,
              properties: {
                ceilingHeight: { type: Type.STRING },
                floorArea: { type: Type.STRING },
                wallAngles: { type: Type.ARRAY, items: { type: Type.STRING } },
                referenceBenchmark: { type: Type.STRING },
                confidenceScore: { type: Type.NUMBER }
              },
              required: ['ceilingHeight', 'floorArea', 'wallAngles', 'referenceBenchmark', 'confidenceScore']
            }
          },
          required: ['measurements', 'suggestedMaterials', 'summary', 'reasoningChain', 'spatialProfile']
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { 
      measurements: "10x10", 
      suggestedMaterials: [], 
      summary: "Optic analysis failed.", 
      reasoningChain: [], 
      spatialProfile: { ceilingHeight: "8", floorArea: "100", wallAngles: [], referenceBenchmark: "None", confidenceScore: 0 }
    };
  }
}

export async function analyzeRemodelProjectFromText(specs: ProjectSpecs, tier: ProjectTier, budget: ThinkingBudget = 'Standard'): Promise<QuoteAnalysisResponse> {
  try {
    const model = "gemini-3-pro-preview";
    const response = await ai.models.generateContent({
      model: model,
      contents: `Perform architectural analysis for the following project: ${JSON.stringify(specs)}. Tier: ${tier}. Return JSON.`,
      config: { 
        thinkingConfig: { thinkingBudget: getThinkingBudget(budget, model) }, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            measurements: { type: Type.STRING },
            suggestedMaterials: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  unitPrice: { type: Type.NUMBER }
                },
                required: ['name', 'quantity', 'unitPrice']
              }
            },
            summary: { type: Type.STRING },
            reasoningChain: { type: Type.ARRAY, items: { type: Type.STRING } },
            spatialProfile: {
              type: Type.OBJECT,
              properties: {
                ceilingHeight: { type: Type.STRING },
                floorArea: { type: Type.STRING },
                wallAngles: { type: Type.ARRAY, items: { type: Type.STRING } },
                referenceBenchmark: { type: Type.STRING },
                confidenceScore: { type: Type.NUMBER }
              },
              required: ['ceilingHeight', 'floorArea', 'wallAngles', 'referenceBenchmark', 'confidenceScore']
            }
          },
          required: ['measurements', 'suggestedMaterials', 'summary', 'reasoningChain', 'spatialProfile']
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    return { 
      measurements: "Manual Entry", 
      suggestedMaterials: [], 
      summary: "Specs parsed with errors.", 
      reasoningChain: ["Fallback Logic"], 
      spatialProfile: { ceilingHeight: specs.height, floorArea: (parseFloat(specs.width)*parseFloat(specs.length)).toString(), wallAngles: [], referenceBenchmark: "None", confidenceScore: 0.5 }
    };
  }
}

export async function simulateRemodel(beforeImage: string | null, blueprint: string | null, prompt: string, tier: ProjectTier, style: RemodelStyle): Promise<string | null> {
  try {
    const parts: any[] = [{ text: `Architectural visualization of a ${style} ${tier} remodel. ${prompt}` }];
    if (beforeImage) parts.push({ inlineData: { data: beforeImage, mimeType: 'image/jpeg' } });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts }
    });

    const imgPart = response.candidates[0].content.parts.find(p => p.inlineData);
    return imgPart ? `data:image/png;base64,${imgPart.inlineData.data}` : null;
  } catch (e) { return null; }
}

export async function generateGrandmasterProposal(bid: Partial<BidData>, extraNotes: string, budget: ThinkingBudget = 'Standard'): Promise<string> {
  try {
    const model = "gemini-3-pro-preview";
    const response = await ai.models.generateContent({
      model: model,
      contents: `Draft a professional architectural bid proposal based on: ${JSON.stringify(bid)}. Extra context: ${extraNotes}. Tone: Authoritative yet accessible.`,
      config: { thinkingConfig: { thinkingBudget: getThinkingBudget(budget, model) } }
    });
    return response.text || "Proposal failed to generate.";
  } catch (e) { return "Draft unavailable."; }
}

export async function getRecommendedStyles(bid: Partial<BidData>): Promise<RemodelStyle[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this project: ${JSON.stringify(bid)}, list 4 architectural styles that would fit the space and tier. Return as a JSON array of strings.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) { return ["Modern", "Minimalist", "Industrial", "Scandinavian"]; }
}

export async function analyzeSurfaceThermal(base64Image: string, ambientTemp: number, humidity: number): Promise<any> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `Analyze surface temperature and material based on visible properties and ambient conditions (Temp: ${ambientTemp}C, Humidity: ${humidity}%). Return JSON.` }
        ]
      },
      config: { 
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            temp: { type: Type.NUMBER },
            material: { type: Type.STRING },
            emissivity: { type: Type.NUMBER },
            notes: { type: Type.STRING }
          },
          required: ['temp', 'material', 'emissivity', 'notes']
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return null; }
}