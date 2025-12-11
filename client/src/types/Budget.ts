
export interface BudgetHistoryItem {
  oldValue: number;
  newValue: number;
  changedAt: string;
  changedBy?: {
    _id: string;
    name?: string;
    email?: string;
  } | string;
  reason?: string;
}