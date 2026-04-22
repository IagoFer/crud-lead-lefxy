export type LeadStage = 'NEW' | 'CONTACTED' | 'PROPOSAL' | 'WON' | 'LOST';

export interface Lead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  stage: LeadStage;
  channel: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Interaction {
  _id: string;
  leadId: string;
  type: 'MESSAGE' | 'CALL' | 'NOTE';
  content: string;
  createdAt: string;
}

export interface FollowUp {
  _id: string;
  leadId: Lead | string;
  status: 'PENDING' | 'COMPLETED';
  dueAt: string;
}
