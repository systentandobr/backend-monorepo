// src/types/userProfile.ts
export type UserProfile = {
    personalType: string;
    financialProfile: string;
    entrepreneurType: string;
    recommendedFocus: string[];
    suggestedHabits: {name: string, category: string, frequency: string}[];
    suggestedInvestments: {type: string, allocation: number, risk: string}[];
    suggestedBusinessOpportunities: {name: string, investmentLevel: string, timeRequired: string}[];
    strengths: string[];
    weaknesses: string[];
    recommendations: {
      personal: string[];
      financial: string[];
      career: string[];
    };
  };