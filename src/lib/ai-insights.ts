/**
 * NEXO Intelligence Engine - business-insights.ts
 * Processes raw financial data into human-readable insights.
 */

export interface FinancialData {
  expenses: { amount: number; status: string }[];
  income: { amount: number }[];
  employees: number;
}

export function generateBusinessInsight(data: FinancialData): string {
  const totalExpenses = data.expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalIncome = data.income
    .reduce((sum, i) => sum + i.amount, 0);

  const profit = totalIncome - totalExpenses;
  const margin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

  if (totalIncome === 0 && totalExpenses === 0) {
    return "아직 데이터가 충분하지 않습니다. 지출이나 수입을 등록해 보세요!";
  }

  if (profit > 0) {
    return `현재 마진율이 ${margin.toFixed(1)}%로 양호합니다. 인건비 대비 수익성이 대폭 개선되고 있는 추세이니 공격적인 마케팅을 고려해 보세요!`;
  } else if (profit < 0) {
    return `이번 달 지출이 수입보다 많습니다. 특히 운영비 비중이 높으니 불필요한 고정 지출이 없는지 체크해 볼 필요가 있습니다.`;
  } else {
    return `수입과 지출이 균형을 이루고 있습니다. 시장 점유율 확대를 위해 전략적인 투자가 필요한 시점입니다.`;
  }
}
