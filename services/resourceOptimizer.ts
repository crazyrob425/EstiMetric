
import { GoogleGenAI, Type } from "@google/genai";
import { StorageService } from "./storageService.ts";
import { fetchLivePricing, simulateRemodel } from "./geminiService.ts";
import { AppSettings } from "../types.ts";
import { gmsa } from "./systemsArchitect.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface SystemState {
  charging: boolean;
  onWifi: boolean;
  batteryLevel: number;
  storageUsage: number;
}

export interface WorkOrder {
  id: string;
  task: 'SYNC_PRICES' | 'CLEAN_CATALOG' | 'EXPAND_INSPIRATION' | 'GMSA_MAINTENANCE';
  priority: 'LOW' | 'HIGH';
  lastRun: number;
}

class ResourceOptimizer {
  private state: SystemState = { charging: false, onWifi: false, batteryLevel: 1, storageUsage: 0 };
  private workOrders: WorkOrder[] = [
    { id: '1', task: 'SYNC_PRICES', priority: 'LOW', lastRun: 0 },
    { id: '2', task: 'CLEAN_CATALOG', priority: 'LOW', lastRun: 0 },
    { id: '3', task: 'EXPAND_INSPIRATION', priority: 'LOW', lastRun: 0 },
    { id: '4', task: 'GMSA_MAINTENANCE', priority: 'HIGH', lastRun: 0 }
  ];

  constructor() {
    this.initTelemetry().catch(() => {});
  }

  private async initTelemetry() {
    try {
        if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
          const battery: any = await (navigator as any).getBattery();
          const updateBattery = () => {
            this.state.charging = battery.charging;
            this.state.batteryLevel = battery.level;
          };
          battery.addEventListener('chargingchange', updateBattery);
          battery.addEventListener('levelchange', updateBattery);
          updateBattery();
        }

        const conn = (navigator as any).connection;
        if (conn) {
          const updateConn = () => {
            this.state.onWifi = conn.type === 'wifi' || (conn.effectiveType === '4g' && !conn.saveData);
          };
          conn.addEventListener('change', updateConn);
          updateConn();
        }

        this.state.storageUsage = await StorageService.getUsageEstimate();
    } catch(e) {}
  }

  public getSystemStatus() {
    return {
      isOptimal: this.state.charging && this.state.onWifi,
      state: this.state,
      activeTasks: this.workOrders.filter(w => Date.now() - w.lastRun > 86400000)
    };
  }

  public async runMaintenanceCycle(settings: AppSettings) {
    if (!this.state.charging && this.state.batteryLevel < 0.3) return;

    const optimal = this.state.charging && this.state.onWifi;
    
    if (optimal && this.shouldRun('GMSA_MAINTENANCE', 18)) {
      await gmsa.runDailyMaintenance(settings);
      this.markDone('GMSA_MAINTENANCE');
    }

    if (optimal && this.shouldRun('SYNC_PRICES', 12)) {
      await this.performPriceSync(settings);
      this.markDone('SYNC_PRICES');
    }

    if (this.shouldRun('CLEAN_CATALOG', 168)) {
      await this.pruneLowQualityAssets();
      this.markDone('CLEAN_CATALOG');
    }

    if (optimal && this.shouldRun('EXPAND_INSPIRATION', 24)) {
      await this.expandCatalog(settings);
      this.markDone('EXPAND_INSPIRATION');
    }
  }

  private shouldRun(task: string, hours: number) {
    const order = this.workOrders.find(o => o.task === task);
    if (!order) return false;
    return (Date.now() - order.lastRun) > (hours * 3600000);
  }

  private markDone(task: string) {
    const order = this.workOrders.find(o => o.task === task);
    if (order) order.lastRun = Date.now();
  }

  private async performPriceSync(settings: AppSettings) {
    const coreMaterials = ["2x4x8 Stud", "Sheetrock 4x8", "Quikrete 80lb", "Copper Pipe 1/2in"];
    for (const mat of coreMaterials) {
      try {
        const price = await fetchLivePricing(mat, settings);
        localStorage.setItem(`price_cache_${mat.replace(/\s/g, '_')}`, JSON.stringify({
          price: price.price,
          time: Date.now()
        }));
      } catch (e) {}
    }
  }

  private async pruneLowQualityAssets() {
    try {
      const refs = await StorageService.getAllReferences();
      if (refs.length < 10) return;
      // Fixed: Adding responseSchema for catalog pruning IDs list.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Evaluate IDs for pruning: ${JSON.stringify(refs.map(r => ({id: r.id, title: r.title, age: Date.now() - r.timestamp})))}`,
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ids: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['ids']
          }
        }
      });
      const toDelete = JSON.parse(response.text || "{}").ids || [];
      for (const id of toDelete) await StorageService.deleteReference(id);
    } catch (e) {}
  }

  private async expandCatalog(settings: AppSettings) {
    const roomTypes = ['Luxury Kitchen', 'Modern Bath', 'Industrial Loft', 'Art Deco Lounge'];
    const selected = roomTypes[Math.floor(Math.random() * roomTypes.length)];
    try {
      const imgData = await simulateRemodel(null, null, `High quality architectural render of ${selected}`, 'Ultra-Luxury', settings.defaultRemodelStyle);
      if (imgData) {
        await StorageService.saveReference({
          url: imgData,
          category: selected,
          title: `AI Generated ${selected}`,
          isCustom: false
        });
      }
    } catch (e) {}
  }
}

export const optimizer = new ResourceOptimizer();
