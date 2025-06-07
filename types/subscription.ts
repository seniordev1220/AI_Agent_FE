export enum PlanType {
  INDIVIDUAL = 'INDIVIDUAL',
  STANDARD = 'STANDARD',
  SMB = 'SMB',
  ENTERPRISE = 'ENTERPRISE',
}

export const PLAN_PRICES = {
  [PlanType.INDIVIDUAL]: {
    monthly: 39,
    annual: 29,
    seats: 1,
    seatPrice: 7,
  },
  [PlanType.STANDARD]: {
    monthly: 99,
    annual: 74,
    seats: 2,
    seatPrice: 7,
  },
  [PlanType.SMB]: {
    monthly: 157,
    annual: 118,
    seats: 3,
    seatPrice: 5,
  },
}; 