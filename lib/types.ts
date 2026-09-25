export type WorkflowStage = 'discover' | 'position' | 'shape' | 'visualize' | 'challenge' | 'deliver';

export interface DiscoveryData {
  problem: string;
  targetAudience: string[];
  userNeeds: string[];
  context: string;
  goals: string[];
  constraints: string[];
  assumptions: string[];
  openQuestions: string[];
  painPoints: string[];
}

export interface PositioningDirection {
  id: string;
  name: string;
  description: string;
  whyItFits: string;
  strength: string;
  risk: string;
}

export interface PositioningData {
  directions: PositioningDirection[];
  selectedDirectionId?: string;
  category?: string;
  positioningStatement?: string;
  valueProposition?: string;
  differentiator?: string;
  customerPromise?: string;
}

export interface PersonalityTrait {
  trait: string;
  why: string;
  appearance: string;
}

export interface NamingTerritory {
  id: string;
  territory: string;
  names: {
    name: string;
    concept: string;
    why: string;
    weakness: string;
  }[];
}

export interface ShapeData {
  personalityTraits: PersonalityTrait[];
  traitsToAvoid: string[];
  namingTerritories: NamingTerritory[];
  selectedNamingTerritoryId?: string;
  selectedName?: string;
  tagline?: string;
  oneLinePitch?: string;
  messagingHierarchy: {
    hero: string;
    supporting: string;
    cta: string;
  };
}

export interface VisualIdentityData {
  primaryColor: string;
  secondaryColors: string[];
  accentColor: string;
  typography: {
    heading: string;
    body: string;
    rationale: string;
  };
  logoConcept: string;
  shapeLanguage: string;
  imageryDirection: string;
  visualAvoid: string[];
  visualMood: string;
}

export interface CritiqueIssue {
  category: string;
  severity: 'low' | 'medium' | 'high';
  problem: string;
  reason: string;
  suggestion: string;
}

export interface CritiqueData {
  overallStatus: string;
  issues: CritiqueIssue[];
  strengths: string[];
  recommendedChanges: string[];
}

export interface LaunchAsset {
  type: string;
  content: string;
}

export interface DeliverData {
  launchAssets: LaunchAsset[];
  finalSummary: string;
}

export interface BrandProject {
  id: string;
  name: string;
  roughIdea: string;
  targetAudience?: string;
  industry?: string;
  market?: string;
  goal?: string;
  constraints?: string;
  currentStage: WorkflowStage;
  completedStages: WorkflowStage[];
  
  discover?: DiscoveryData;
  positioning?: PositioningData;
  shape?: ShapeData;
  visualIdentity?: VisualIdentityData;
  critique?: CritiqueData;
  deliver?: DeliverData;

  updatedAt: number;
}
