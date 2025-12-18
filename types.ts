
export type Category = 
  | '뇌과학' 
  | '심리학' 
  | '자기계발' 
  | '생산성' 
  | '직장생활' 
  | '독서법' 
  | '공부법' 
  | '재테크'
  | '건강'
  | 'IT/기술'
  | '동기부여'
  | '반려견/묘';

export interface TopicSuggestion {
  id: number;
  title: string;
}

export interface ScriptOutline {
  intro: string;
  problem: string;
  points: {
    title: string;
    details: string[];
  }[];
  conclusion: string;
  closing: string;
}

export enum AppState {
  CATEGORY_SELECTION = 0,
  TOPIC_SUGGESTION = 1,
  OUTLINE_GENERATION = 2,
  SCRIPT_GENERATION = 3,
  APPROVED = 4
}
