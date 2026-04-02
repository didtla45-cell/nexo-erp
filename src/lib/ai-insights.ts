/**
 * NEXO Intelligence Engine - ai-insights.ts
 * 지민이의 지능형 비즈니스 분석 엔진
 */

export interface BusinessData {
  expenses: { amount: number; status: string }[];
  income: { amount: number }[];
  employees: number;
  lowStockItems: { name: string; current_stock: number }[];
  activeDealsCount: number;
}

export function generateBusinessInsight(data: BusinessData): string {
  const totalExpenses = data.expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalIncome = data.income
    .reduce((sum, i) => sum + i.amount, 0);

  const profit = totalIncome - totalExpenses;
  const margin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

  // 1. 기본 인사말 및 재무 요약
  let briefing = `좋은 아침입니다, 대표님! 현재 우리 회사의 재무 상태를 분석해 보았어요. `;

  if (totalIncome > 0 || totalExpenses > 0) {
    if (profit > 0) {
      briefing += `이번 달은 약 ₩${profit.toLocaleString()}의 순이익이 예상되며 마진율은 ${margin.toFixed(1)}%로 매우 건강한 상태입니다. `;
    } else {
      briefing += `최근 지출이 수입보다 ₩${Math.abs(profit).toLocaleString()} 정도 많아 운영 자금 흐름을 점검해 보시는 게 좋겠습니다. `;
    }
  } else {
    briefing += `아직 등록된 재무 데이터가 부족하여 분석을 시작하는 단계입니다. `;
  }

  // 2. 재고 이슈 브리핑 (품목명 나열)
  if (data.lowStockItems.length > 0) {
    const itemNames = data.lowStockItems.map(i => i.name).join(", ");
    briefing += `\n\n⚠️ 특히 중요한 점은, 현재 [${itemNames}] 품목의 재고가 부족합니다. 발주 타이밍을 놓치지 않도록 확인해 주세요. `;
  } else {
    briefing += `\n\n✅ 모든 품목의 재고가 안정적으로 관리되고 있습니다. `;
  }

  // 3. 영업 및 인사 브리핑
  if (data.activeDealsCount > 0) {
    briefing += `\n\n💼 현재 ${data.activeDealsCount}건의 영업 딜이 진행 중입니다. 곧 좋은 소식이 들려올 것 같네요! `;
  }

  briefing += `\n\n오늘도 대표님의 결단력 있는 비즈니스를 지민이가 응원할게요! ✨`;

  return briefing;
}
