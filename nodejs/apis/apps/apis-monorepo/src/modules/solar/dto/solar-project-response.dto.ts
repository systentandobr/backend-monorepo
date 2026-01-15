export interface ProjectPhaseHistoryResponse {
  phase: string;
  startDate: Date;
  endDate?: Date;
  status: string;
  notes?: string;
}

export interface LocationResponse {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
}

export interface SolarProjectResponseDto {
  id: string;
  unitId: string;
  name: string;
  totalCapacityKW: number;
  terrainArea: number;
  installationDate?: Date;
  projectPhase: string;
  projectPhases: ProjectPhaseHistoryResponse[];
  totalInvestment: number;
  currentCostPerKWH: number;
  utilityCostPerKWH: number;
  location: LocationResponse;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}
