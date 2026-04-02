
export type ProjectTier = 'Standard' | 'Premium' | 'Ultra-Luxury';
export type RemodelStyle = 'Modern' | 'Rustic' | 'Minimalist' | 'Industrial' | 'Scandinavian' | 'Art Deco' | 'Bohemian' | 'Mid-Century' | 'Coastal' | 'Farmhouse' | 'Victorian';
export type ThinkingBudget = 'Standard' | 'Deep';
export type PricingSource = 'Average' | 'HomeDepot' | 'Lowes' | 'DunnLumber';
export type LocationMode = 'Geolocation' | 'ZipCode';

export interface MaterialItem {
  name: string;
  quantity: string;
  unitPrice: number;
  source?: string;
  confidence?: 'High' | 'Medium' | 'Low' | 'Alert';
  lastVerified?: number;
  sourceUrl?: string;
  mapUrl?: string;
  amazonPrice?: string;
  auditDelta?: number;
}

export interface MaterialSuggestion {
  originalMaterial?: string;
  suggestedMaterial: MaterialItem;
  justification: string;
  safetyWarning: boolean;
  styleWarning: boolean;
  type: 'Replacement' | 'Addition';
}

export interface BidHistoryEntry extends Omit<BidData, 'revisions'> {
  revisionDate: string;
}

export interface ProjectSpecs {
  roomType: string;
  width: string;
  length: string;
  height: string;
  scope: 'Full Gut' | 'Surface' | 'Partial';
  notes: string;
}

export interface SpatialData {
  ceilingHeight: string;
  floorArea: string;
  wallAngles: string[];
  referenceBenchmark: string;
  confidenceScore: number;
}

export interface BidData {
  id: string;
  clientName: string;
  projectName: string;
  projectTier: ProjectTier;
  beforePhoto: string | null;
  inspirationPhoto: string | null;
  afterMockup: string | null;
  textDescription: ProjectSpecs | null;
  measurements: string;
  materials: MaterialItem[];
  laborCost: number;
  companyName: string;
  contactInfo: string;
  status: 'Draft' | 'Sent' | 'Approved';
  date: string;
  aiReasoningLog?: string[];
  revisions?: BidHistoryEntry[];
  spatialProfile?: SpatialData;
  customerRequests?: string[];
  structuralRisks?: string[];
}

export interface QuoteAnalysisResponse {
  measurements: string;
  suggestedMaterials: MaterialItem[];
  summary: string;
  reasoningChain: string[];
  spatialProfile: SpatialData;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  membershipTier: 'Free' | 'Pro' | 'Elite' | 'Enterprise';
  isBeta: boolean;
  createdAt: string;
}

export interface AppSettings {
  cameraCountdown: number;
  defaultProjectTier: ProjectTier;
  defaultRemodelStyle: RemodelStyle;
  defaultLaborCost: number;
  materialMarkupPercent: number;
  thinkingBudget: ThinkingBudget;
  preferredVoice: 'Fenrir' | 'Charon' | 'Kore' | 'Puck' | 'Zephyr';
  autoSnapEdges: boolean;
  exportFormat: 'PDF' | 'DOCX' | 'PNG';
  bccEmail: string;
  currencySymbol: string;
  companyName: string;
  pricingLocationMode: LocationMode;
  zipCode: string;
  pricingSource: PricingSource;
  showAmazonComparison: boolean;
}

export interface BetaFeedbackSubmission {
  id: string;
  message: string;
  email?: string;
  category: 'Bug' | 'Suggestion' | 'Feature Request';
  screenshotDataUrl?: string;
  activeTab: 'home' | 'vault' | 'toolbox' | 'foreman' | 'new';
  userAgent: string;
  createdAt: string;
  source: 'android-beta';
  userId?: string | null;
}
