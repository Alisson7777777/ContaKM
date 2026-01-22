
export interface DailyEntry {
  id: string;
  date: string; // ISO format
  kmDriven: number;
  fuelSpent: number;
  foodSpent: number;
  parkingSpent: number;
  washSpent: number;
  tollsSpent: number;
  otherSpent: number;
  otherSpentName: string;
  uberEarnings: number;
  pop99Earnings: number;
  inDriveEarnings: number;
  privateEarnings: number;
}

export interface CostItem {
  id: string;
  description: string;
  value: number;
}

export interface MaintenanceItem extends CostItem {}

export interface DriverCosts {
  fuelPrice: number;
  consumption: number;
  isGnvEnabled: boolean;
  gnvPrice: number;
  gnvConsumption: number;
  monthlyMileage: number;
  workHoursPerDay: number;
  workDaysPerWeek: number;
  maintenance: number;
  maintenanceItems: MaintenanceItem[];
  insurance: number;
  annualIpva: number;
  annualLicensing: number;
  loanPayment: number;
  isRented: boolean; 
  rentalCost: number; 
  foodExpenses: number;
  depreciation: number;
  cleaning: number;
  dataPlan: number;
  appFees: number;
  others: number;
  othersName: string;
  othersItems: CostItem[];
  targetProfitPerKm: number;
  dailyEntries: DailyEntry[]; 
}

export interface CategoryBreakdown {
  name: string;
  monthly: number;
  perKm: number;
  percentage: number;
  color: string;
  [key: string]: string | number;
}

export interface CalculationResults {
  fuelCostMonthly: number;
  fuelCostPerKm: number;
  totalMonthlyCost: number;
  costPerKm: number;
  costPerHour: number;
  suggestedMinFarePerKm: number;
  suggestedMinFarePerHour: number;
  breakEvenDaily: number;
  profitMarginPercentage: number;
  breakdown: CategoryBreakdown[];
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  month: string;
  costPerKm: number;
  totalMonthlyCost: number;
  monthlyMileage: number;
  suggestedMinFarePerKm: number;
  isGnv: boolean;
  isRented: boolean;
}
