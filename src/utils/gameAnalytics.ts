/**
 * Red & Black Game Analytics and Probability Analysis
 *
 * 目标：在可控随机结果的前提下，为庄家提供可持续利润，同时保持较高的玩家留存与体验。
 * 本文件提供概率设定、模拟、方差与连胜分析、以及按「盈利/留存」场景的推荐与报告。
 */

export interface GameProbabilities {
  colorBet: {
    probability: number; // 颜色赢面
    payout: number; // 赔率（含本金），如 2 表示押100中返还200，玩家净赢 +100
    houseEdge: number; // 庄家优势（= -EV），>0 对庄家有利
    expectedValue: number; // 玩家期望收益（单位：投注额倍数，押100则乘以100）
    rtp: number; // Return To Player（含本金返还比例），例如 0.97 = 97%
  };
  suitBet: {
    probability: number;
    payout: number;
    houseEdge: number;
    expectedValue: number;
    rtp: number;
  };
}

export interface ProfitabilityScenario {
  name: string;
  description: string;
  colorProbability: number;
  suitProbability: number;
  expectedHourlyProfit: number; // 每活跃玩家每小时期望利润（货币）
  playerRetentionScore: number; // 0-100
  balanceScore: number; // 0-100（盈收/体验的平衡感）
}

export interface SimulationResult {
  totalGames: number;
  playerWins: number; // 以“赢一局”为单位（无论颜色/花色）
  houseWins: number;
  playerWinRate: number;
  houseWinRate: number;
  averagePlayerReturn: number; // 每个会话(一组局数)的平均净结果（正为玩家盈利，负为亏损）
  houseProfit: number; // 总庄家利润（应恒等于 -总玩家净结果）
}

/** 计算给定概率下的庄家优势与 RTP */
export function calculateGameProbabilities(
  colorProbability: number = 0.485, // 稍低于 50%
  suitProbability: number = 0.23 // 稍低于 25%
): GameProbabilities {
  // 颜色：2:1（含本金），玩家中则净赢 1x
  const colorPayout = 2;
  const colorExpectedValue = colorProbability * colorPayout - 1; // 玩家EV（投注1）
  const colorHouseEdge = -colorExpectedValue;
  const colorRTP = colorProbability * colorPayout;

  // 花色：4:1（含本金），玩家中则净赢 3x
  const suitPayout = 4;
  const suitExpectedValue = suitProbability * suitPayout - 1;
  const suitHouseEdge = -suitExpectedValue;
  const suitRTP = suitProbability * suitPayout;

  return {
    colorBet: {
      probability: colorProbability,
      payout: colorPayout,
      houseEdge: colorHouseEdge,
      expectedValue: colorExpectedValue,
      rtp: colorRTP,
    },
    suitBet: {
      probability: suitProbability,
      payout: suitPayout,
      houseEdge: suitHouseEdge,
      expectedValue: suitExpectedValue,
      rtp: suitRTP,
    },
  };
}

/** 预设的盈利/留存平衡场景（可根据数据再迭代） */
export function generateProfitabilityScenarios(): ProfitabilityScenario[] {
  return [
    {
      name: "Conservative Profit",
      description: "利润稳健且留存好，适合长周期",
      colorProbability: 0.485, // 颜色庄家优势约 3%
      suitProbability: 0.23, // 花色庄家优势约 8%
      expectedHourlyProfit: 150,
      playerRetentionScore: 85,
      balanceScore: 90,
    },
    {
      name: "Aggressive Profit",
      description: "利润更高，但留存风险上升",
      colorProbability: 0.47, // ~6%
      suitProbability: 0.22, // ~12%
      expectedHourlyProfit: 280,
      playerRetentionScore: 70,
      balanceScore: 75,
    },
    {
      name: "Player Friendly",
      description: "更友好留存更高，但利润较低",
      colorProbability: 0.49, // ~2%
      suitProbability: 0.24, // ~4%
      expectedHourlyProfit: 80,
      playerRetentionScore: 95,
      balanceScore: 95,
    },
    {
      name: "High Variance",
      description: "波动更大更刺激（需谨慎控制）",
      colorProbability: 0.45, // ~10%
      suitProbability: 0.28, // 花色对玩家偏利（负庄家优势）—需综合平衡
      expectedHourlyProfit: 120,
      playerRetentionScore: 80,
      balanceScore: 70,
    },
  ];
}

/** 模拟会话，修正为玩家/庄家收益守恒 */
export function simulateGameSessions(
  numberOfSessions: number = 10000,
  gamesPerSession: number = 100,
  betAmount: number = 100,
  colorProbability: number = 0.485,
  suitProbability: number = 0.23,
  colorBetWeight: number = 0.6 // 60%下颜色，40%下花色
): SimulationResult {
  let totalPlayerWins = 0;
  let totalHouseWins = 0;
  let totalPlayerReturn = 0;
  let totalHouseProfit = 0;

  for (let session = 0; session < numberOfSessions; session++) {
    let sessionPlayerReturn = 0;
    let sessionHouseProfit = 0;
    let sessionPlayerWins = 0;
    let sessionHouseWins = 0;

    for (let game = 0; game < gamesPerSession; game++) {
      const isColorBet = Math.random() < colorBetWeight;

      if (isColorBet) {
        const wins = Math.random() < colorProbability;
        if (wins) {
          sessionPlayerReturn += betAmount; // 玩家净赢 +1x
          sessionHouseProfit -= betAmount; // 庄家净亏 -1x
          sessionPlayerWins++;
        } else {
          sessionPlayerReturn -= betAmount;
          sessionHouseProfit += betAmount;
          sessionHouseWins++;
        }
      } else {
        const wins = Math.random() < suitProbability;
        if (wins) {
          sessionPlayerReturn += betAmount * 3; // 玩家净赢 +3x
          sessionHouseProfit -= betAmount * 3;
          sessionPlayerWins++;
        } else {
          sessionPlayerReturn -= betAmount;
          sessionHouseProfit += betAmount;
          sessionHouseWins++;
        }
      }
    }

    totalPlayerReturn += sessionPlayerReturn;
    totalHouseProfit += sessionHouseProfit;
    totalPlayerWins += sessionPlayerWins;
    totalHouseWins += sessionHouseWins;
  }

  const totalGames = numberOfSessions * gamesPerSession;

  // 数值对齐（浮点保险）
  const epsilon = 1e-9;
  if (Math.abs(totalHouseProfit + totalPlayerReturn) > epsilon) {
    totalHouseProfit = -totalPlayerReturn;
  }

  return {
    totalGames,
    playerWins: totalPlayerWins,
    houseWins: totalHouseWins,
    playerWinRate: totalPlayerWins / totalGames,
    houseWinRate: totalHouseWins / totalGames,
    averagePlayerReturn: totalPlayerReturn / numberOfSessions,
    houseProfit: totalHouseProfit,
  };
}

/** 方差/连胜连败分析：支持可配置概率与下注权重 */
export function analyzeGameVariance(
  games: number = 1000,
  colorProbability: number = 0.485,
  suitProbability: number = 0.23,
  colorBetWeight: number = 0.6
): {
  longestWinStreak: number;
  longestLossStreak: number;
  winStreaks: number[];
  lossStreaks: number[];
  variance: number; // Bernoulli 方差 p*(1-p) 的经验估计
} {
  const results: boolean[] = [];
  const winStreaks: number[] = [];
  const lossStreaks: number[] = [];

  for (let i = 0; i < games; i++) {
    const isColorBet = Math.random() < colorBetWeight;
    const p = isColorBet ? colorProbability : suitProbability;
    results.push(Math.random() < p);
  }

  let currentW = 0;
  let currentL = 0;
  let longestW = 0;
  let longestL = 0;

  for (const r of results) {
    if (r) {
      if (currentL > 0) {
        lossStreaks.push(currentL);
        currentL = 0;
      }
      currentW++;
      if (currentW > longestW) longestW = currentW;
    } else {
      if (currentW > 0) {
        winStreaks.push(currentW);
        currentW = 0;
      }
      currentL++;
      if (currentL > longestL) longestL = currentL;
    }
  }
  if (currentW > 0) winStreaks.push(currentW);
  if (currentL > 0) lossStreaks.push(currentL);

  const winRate = results.filter(Boolean).length / games;
  const variance = winRate * (1 - winRate);

  return {
    longestWinStreak: longestW,
    longestLossStreak: longestL,
    winStreaks,
    lossStreaks,
    variance,
  };
}

/** （保守）资金管理建议：保证可玩性同时控制破产风险 */
export function analyzeOptimalStrategy(bankroll: number = 1000): {
  maxBetSize: number;
  recommendedBetSize: number;
  kellyBetSize: number; // 对玩家而言，若总体为负EV，Kelly=0
  survivalProbability: number; // 简化近似
} {
  const maxBetSize = Math.floor(bankroll * 0.1);
  const recommendedBetSize = Math.floor(bankroll * 0.02);
  const survivalProbability = calculateSurvivalProbability(
    bankroll,
    recommendedBetSize
  );

  return {
    maxBetSize,
    recommendedBetSize,
    kellyBetSize: 0,
    survivalProbability,
  };
}

function calculateSurvivalProbability(
  bankroll: number,
  betSize: number
): number {
  const ratio = betSize / bankroll;
  if (ratio <= 0.01) return 0.95;
  if (ratio <= 0.02) return 0.85;
  if (ratio <= 0.05) return 0.7;
  if (ratio <= 0.1) return 0.5;
  return 0.25;
}

/** 分析单一盈利场景（用于报告/对比） */
export function analyzeScenario(scenario: ProfitabilityScenario): {
  probabilities: GameProbabilities;
  simulation: SimulationResult;
  variance: ReturnType<typeof analyzeGameVariance>;
  profitAnalysis: {
    dailyProfitPer100Players: number;
    monthlyProfitPer100Players: number;
    breakEvenPlayerCount: number;
    riskAssessment: string;
  };
} {
  const probabilities = calculateGameProbabilities(
    scenario.colorProbability,
    scenario.suitProbability
  );
  const simulation = simulateGameSessions(
    10000,
    100,
    100,
    scenario.colorProbability,
    scenario.suitProbability,
    0.6
  );
  const variance = analyzeGameVariance(
    1000,
    scenario.colorProbability,
    scenario.suitProbability,
    0.6
  );

  // 盈利测算（示例参数，可外部注入）
  const avgHourlyProfitPerPlayer = scenario.expectedHourlyProfit;
  const dailyProfitPer100Players = avgHourlyProfitPerPlayer * 100 * 8; // 8 小时活跃
  const monthlyProfitPer100Players = dailyProfitPer100Players * 30;
  const operatingCostPerMonth = 50000;
  const breakEvenPlayerCount = Math.ceil(
    operatingCostPerMonth / (monthlyProfitPer100Players / 100)
  );

  let riskAssessment = "Low Risk";
  if (
    probabilities.colorBet.houseEdge > 0.05 ||
    probabilities.suitBet.houseEdge > 0.15
  ) {
    riskAssessment = "High Risk - May affect player retention";
  } else if (
    probabilities.colorBet.houseEdge > 0.03 ||
    probabilities.suitBet.houseEdge > 0.1
  ) {
    riskAssessment = "Medium Risk";
  }

  return {
    probabilities,
    simulation,
    variance,
    profitAnalysis: {
      dailyProfitPer100Players,
      monthlyProfitPer100Players,
      breakEvenPlayerCount,
      riskAssessment,
    },
  };
}

/**
 * 统一、无冲突的报告：按场景输出推荐方案与结果
 * 注意：已删除旧的同名版本，避免类型与含义冲突
 */
export function generateAnalyticsReport(
  scenarioName: string = "Conservative Profit"
): {
  recommendedScenario: ProfitabilityScenario;
  analysis: ReturnType<typeof analyzeScenario>;
  allScenarios: ProfitabilityScenario[];
  summary: string;
} {
  const scenarios = generateProfitabilityScenarios();
  const recommendedScenario =
    scenarios.find((s) => s.name === scenarioName) || scenarios[0];
  const analysis = analyzeScenario(recommendedScenario);

  const summary = `
Red & Black Game Analytics - ${recommendedScenario.name}

CUSTOM PROBABILITIES:
- Color: ${(recommendedScenario.colorProbability * 100).toFixed(
    1
  )}% win, 2:1 payout
  House Edge: ${(analysis.probabilities.colorBet.houseEdge * 100).toFixed(
    1
  )}% | RTP: ${(analysis.probabilities.colorBet.rtp * 100).toFixed(1)}%
- Suit: ${(recommendedScenario.suitProbability * 100).toFixed(
    1
  )}% win, 4:1 payout
  House Edge: ${(analysis.probabilities.suitBet.houseEdge * 100).toFixed(
    1
  )}% | RTP: ${(analysis.probabilities.suitBet.rtp * 100).toFixed(1)}%

SIMULATION (${analysis.simulation.totalGames.toLocaleString()} games):
- Player win rate: ${(analysis.simulation.playerWinRate * 100).toFixed(2)}%
- House win rate: ${(analysis.simulation.houseWinRate * 100).toFixed(2)}%
- Avg player loss per session: ${Math.max(
    0,
    -analysis.simulation.averagePlayerReturn
  ).toFixed(2)}

PROFITABILITY:
- Daily profit (100 players): $${analysis.profitAnalysis.dailyProfitPer100Players.toLocaleString()}
- Monthly profit (100 players): $${analysis.profitAnalysis.monthlyProfitPer100Players.toLocaleString()}
- Break-even players: ${analysis.profitAnalysis.breakEvenPlayerCount}
- Risk: ${analysis.profitAnalysis.riskAssessment}

PLAYER EXPERIENCE:
- Longest win streak (sim): ${analysis.variance.longestWinStreak}
- Longest loss streak (sim): ${analysis.variance.longestLossStreak}
- Variance indicator: ${(analysis.variance.variance * 100).toFixed(2)}%
`.trim();

  return { recommendedScenario, analysis, allScenarios: scenarios, summary };
}

/** 针对你的目标给出的默认推荐设置（可直接用于上线） */
export function getRecommendedSettings(): {
  colorWinProbability: number;
  suitWinProbability: number;
  expectedHouseEdge: number; // 颜色与花色按 60/40 权重的平均近似（仅做参考）
  rationale: string;
} {
  const colorWinProbability = 0.485;
  const suitWinProbability = 0.23;
  const probs = calculateGameProbabilities(
    colorWinProbability,
    suitWinProbability
  );
  // 近似综合优势：按常见下注权重 0.6/0.4 求加权
  const expectedHouseEdge =
    probs.colorBet.houseEdge * 0.6 + probs.suitBet.houseEdge * 0.4;

  return {
    colorWinProbability,
    suitWinProbability,
    expectedHouseEdge,
    rationale: `
选择「Conservative Profit: 在保证庄家长期正收益的同时,玩家体感接近公平。
- 颜色 48.5%：玩家几乎感知不到明显吃紧，体验自然
- 花色 23%：仍具吸引力的高赔率，但为庄家提供稳定优势
- 模拟显示会话层面玩家净值缓慢波动，有“赢感”，但总体向庄家贡献
`.trim(),
  };
}

/** 统一导出 */
export const GameAnalytics = {
  calculateGameProbabilities,
  simulateGameSessions,
  analyzeGameVariance,
  analyzeOptimalStrategy,
  generateProfitabilityScenarios,
  analyzeScenario,
  generateAnalyticsReport, // 场景版（保留）
  getRecommendedSettings,
};
