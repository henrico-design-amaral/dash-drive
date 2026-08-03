export type DriverDay = {
  date: string;
  label: string;
  weekday: string;
  shift: string;
  platform: string;
  gross: number;
  profit: number;
  expense: number;
  hours: number;
  hoursLabel: string;
  rideHours?: number;
  rideHoursLabel?: string;
  km: number;
  passengerKm?: number;
  trips: number;
  fuelCost: number;
  fuelEfficiency?: number;
  fuelPrice?: number;
  fuelPurchase?: number;
  fuelLiters?: number;
  cashExpense?: number;
  cashBalance?: number;
  notes?: string;
};

export const meta = {
  app: 'Dash Drive',
  source: 'MotoristaOPS — Dashboard Financeiro e Logístico',
  month: 'agosto/2026',
  generatedAt: '2026-08-02T22:35:00-03:00',
  status: 'snapshot-from-excel',
  rules: [
    'Todo fechamento diário deve atualizar a planilha MotoristaOPS e o site Dash Drive.',
    'Lucro operacional ainda não inclui reserva de manutenção por km.',
    'Abastecimento é saída de caixa; combustível operacional é calculado pelo consumo do dia para evitar dupla contagem.'
  ]
};

export const monthly = {
  gross: 141.52,
  operationalProfit: 83.77,
  operationalExpense: 57.75,
  cashBalance: 72.23,
  workedDays: 1,
  confirmedHours: 2.6667,
  confirmedKm: 49,
  passengerKm: 0,
  totalTrips: 13,
  ticketAverage: 10.89,
  revenuePerHour: 53.07,
  profitPerHour: 31.41,
  revenuePerKm: 2.89,
  profitPerKm: 1.71,
  kmOccupancy: 0,
  tripsPerHour: 4.88,
  margin: 59.2,
  bestWeekday: 'Domingo',
  topPlatform: 'Uber',
  fuelPrice: 3.25,
  weightedEfficiency: 7.0
};

export const latestDay: DriverDay = {
  date: '2026-08-02',
  label: '02/08/2026',
  weekday: 'Dom',
  shift: 'Não informado',
  platform: 'Uber',
  gross: 141.52,
  profit: 83.77,
  expense: 57.75,
  hours: 2.6666666667,
  hoursLabel: '2h40',
  km: 49,
  trips: 13,
  fuelCost: 22.75,
  fuelEfficiency: 7.0,
  fuelPrice: 3.25,
  fuelPurchase: 34.29,
  fuelLiters: 10.55,
  cashExpense: 69.29,
  cashBalance: 72.23,
  notes: 'Fechamento confirmado: lavagem de R$ 35,00 como despesa operacional; abastecimento de R$ 34,29 registrado no caixa. Combustível operacional estimado em R$ 22,75 pelo consumo de 7 km/L.'
};

export const days: DriverDay[] = [
  { date: '2026-07-09', label: '09/07/2026', weekday: 'Qui', shift: 'Não informado', platform: 'Uber', gross: 142.57, profit: 119.07, expense: 23.50, hours: 3, hoursLabel: '3h00', km: 59.23, passengerKm: 59.23, trips: 10, fuelCost: 23.50, fuelEfficiency: 9.3 },
  { date: '2026-07-13', label: '13/07/2026', weekday: 'Seg', shift: 'Noite', platform: 'Uber', gross: 145.02, profit: 109.52, expense: 35.50, hours: 3.7833, hoursLabel: '3h47', rideHours: 2.0914, rideHoursLabel: '2h05', km: 83.7, passengerKm: 47.54, trips: 11, fuelCost: 35.50, fuelEfficiency: 8.7 },
  { date: '2026-07-20', label: '20/07/2026', weekday: 'Seg', shift: 'Misto', platform: 'Uber + 99', gross: 440.80, profit: 330.92, expense: 109.88, hours: 13.0667, hoursLabel: '13h04', km: 256.1, passengerKm: 193.16, trips: 25, fuelCost: 109.88, fuelEfficiency: 8.6 },
  { date: '2026-07-21', label: '21/07/2026', weekday: 'Ter', shift: 'Misto', platform: 'Uber + 99', gross: 264.63, profit: 207.46, expense: 57.17, hours: 7.5, hoursLabel: '7h30', km: 106.9, passengerKm: 88.33, trips: 18, fuelCost: 57.17, fuelEfficiency: 6.9 },
  { date: '2026-07-22', label: '22/07/2026', weekday: 'Qua', shift: 'Não informado', platform: 'Uber', gross: 204.68, profit: 161.55, expense: 43.13, hours: 5.5, hoursLabel: '5h30', rideHours: 3.7514, rideHoursLabel: '3h45', km: 90, passengerKm: 69.06, trips: 16, fuelCost: 43.13, fuelEfficiency: 7.7 },
  { date: '2026-07-23', label: '23/07/2026', weekday: 'Qui', shift: 'Misto', platform: 'Uber + 99', gross: 169.70, profit: 127.36, expense: 42.34, hours: 5.1667, hoursLabel: '5h10', km: 104.4, trips: 9, fuelCost: 42.34, fuelEfficiency: 9.1 },
  { date: '2026-07-25', label: '25/07/2026', weekday: 'Sáb', shift: 'Não informado', platform: 'Uber', gross: 123.00, profit: 95.33, expense: 27.68, hours: 3.3667, hoursLabel: '3h22', km: 67.5, trips: 8, fuelCost: 27.68, fuelEfficiency: 9.0 },
  { date: '2026-07-27', label: '27/07/2026', weekday: 'Seg', shift: 'Misto', platform: 'Uber', gross: 510.27, profit: 419.12, expense: 91.15, hours: 12.3167, hoursLabel: '12h19', km: 248.5, trips: 23, fuelCost: 91.15, fuelEfficiency: 8.8 },
  { date: '2026-07-28', label: '28/07/2026', weekday: 'Ter', shift: 'Não informado', platform: 'Uber', gross: 117.01, profit: 100.38, expense: 16.63, hours: 2.5, hoursLabel: '2h30', km: 44.8, trips: 4, fuelCost: 16.63, fuelEfficiency: 9.0 },
  { date: '2026-07-29', label: '29/07/2026', weekday: 'Qua', shift: 'Não informado', platform: 'Uber', gross: 415.43, profit: 335.77, expense: 79.66, hours: 10.3667, hoursLabel: '10h22', km: 205.1, trips: 24, fuelCost: 79.66, fuelEfficiency: 8.6 },
  { date: '2026-07-30', label: '30/07/2026', weekday: 'Qui', shift: 'Misto', platform: 'Uber', gross: 347.31, profit: 284.78, expense: 62.53, hours: 9.0833333333, hoursLabel: '9h05', rideHours: 7.3833333333, rideHoursLabel: '7h23', km: 161, passengerKm: 140.4, trips: 21, fuelCost: 62.53, fuelEfficiency: 8.6 },
  latestDay
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const formatNumber = (value: number, digits = 1) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);

export const ratio = (part: number | undefined, total: number) =>
  part && total ? (part / total) * 100 : null;
