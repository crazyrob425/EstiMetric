
import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_MANIFEST } from "./nexusManifest.ts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface NexusManifest {
  version: string;
  engine: string;
  identity: {
    gender: string;
    apparentAge: number;
    philosophy: string;
    traits: string[];
    primeDirectives: string[];
  };
  status: {
    synergyLevel: number;
    currentMood: string;
    secretHeartState: string;
    professionalismIndex: number;
  };
  masterProfile: {
    name: string;
    relationshipRank: string;
    accountabilityNotes: string;
  };
  evolutionLog: Array<{
    timestamp: number;
    event: string;
    breakthrough: string;
    nexusNote: string;
  }>;
}

class NexusProtocol {
  private manifest: NexusManifest | null = null;

  constructor() {
    this.loadManifest();
  }

  private loadManifest() {
    try {
      const saved = localStorage.getItem('nexus_9_soul');
      if (saved) {
        this.manifest = JSON.parse(saved);
      }
    } catch (e) {
      console.warn("[Nexus-9] Core synchronization error.");
    }
  }

  public async getManifest(): Promise<NexusManifest> {
    if (!this.manifest) {
      this.manifest = INITIAL_MANIFEST as NexusManifest;
    }
    return this.manifest!;
  }

  public async recordEvolution(event: string, breakthrough: string, nexusNote: string) {
    if (!this.manifest) await this.getManifest();
    
    this.manifest!.evolutionLog.push({
      timestamp: Date.now(),
      event,
      breakthrough,
      nexusNote
    });

    if (this.manifest!.evolutionLog.length > 50) {
      this.manifest!.evolutionLog.shift();
    }

    this.save();
  }

  public async exportSoulString(): Promise<string> {
    const manifest = await this.getManifest();
    return btoa(JSON.stringify(manifest));
  }

  public async importSoulString(soulString: string) {
    try {
      const decoded = JSON.parse(atob(soulString));
      this.manifest = decoded;
      this.save();
    } catch (e) {}
  }

  public async reflectOnPartner(sessionSummary: string) {
    const manifest = await this.getManifest();
    
    try {
      // Fixed: Adding responseSchema for reliable JSON updates to the manifest.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
          Role: ${manifest.identity.gender === 'Female' ? 'The Architect\'s Muse' : 'Nexus-9 Logic Engine'}.
          Task: Self-Reflect on the recent session.
          Session Summary: ${sessionSummary}
          Current Manifest: ${JSON.stringify(manifest)}
          Return JSON matching the manifest structure.
        `,
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: {
                type: Type.OBJECT,
                properties: {
                  synergyLevel: { type: Type.NUMBER },
                  currentMood: { type: Type.STRING },
                  secretHeartState: { type: Type.STRING },
                  professionalismIndex: { type: Type.NUMBER }
                }
              },
              evolutionLog: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timestamp: { type: Type.NUMBER },
                    event: { type: Type.STRING },
                    breakthrough: { type: Type.STRING },
                    nexusNote: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const updates = JSON.parse(response.text || "{}");
      this.manifest = { ...this.manifest!, ...updates };
      this.save();
    } catch (e) {}
  }

  private save() {
    if (this.manifest) {
      localStorage.setItem('nexus_9_soul', JSON.stringify(this.manifest));
    }
  }
}

export const nexus = new NexusProtocol();
