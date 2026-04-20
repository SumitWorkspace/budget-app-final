/**
 * SmartEngine.js - Client-side analytics & prediction engine
 * Runs purely in the browser using transaction history.
 */

// ─── SPENDING PREDICTION ─────────────────────────────────────────────────────
/**
 * Given a full list of transactions, predicts next month's likely spend
 * by looking at the last 3 months' average expense per category.
 */
export function predictNextMonthSpend(transactions) {
  const now = new Date();

  // Build monthly buckets for the last 3 months
  const buckets = {};
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets[key] = {};
  }

  transactions.forEach((t) => {
    if (t.type !== "expense") return;
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!(key in buckets)) return;
    buckets[key][t.category] = (buckets[key][t.category] || 0) + t.amount;
  });

  // Average per category across the three months
  const categoryAvg = {};
  Object.values(buckets).forEach((month) => {
    Object.entries(month).forEach(([cat, amt]) => {
      categoryAvg[cat] = categoryAvg[cat] || { sum: 0, count: 0 };
      categoryAvg[cat].sum += amt;
      categoryAvg[cat].count += 1;
    });
  });

  const predictions = Object.entries(categoryAvg).map(([cat, { sum, count }]) => ({
    category: cat,
    predicted: Math.round(sum / count),
  })).sort((a, b) => b.predicted - a.predicted);

  const totalPredicted = predictions.reduce((s, p) => s + p.predicted, 0);

  return { predictions, totalPredicted };
}

// ─── BUDGET SUGGESTIONS ──────────────────────────────────────────────────────
/**
 * Generates actionable budget suggestions based on the current month's
 * spending vs. prior months' averages.
 */
export function generateBudgetSuggestions(transactions) {
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const currentMonthSpend = {};
  const historicSpend = {}; // last 3 months

  transactions.forEach((t) => {
    if (t.type !== "expense") return;
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (key === currentKey) {
      currentMonthSpend[t.category] = (currentMonthSpend[t.category] || 0) + t.amount;
    } else {
      // Include only last 3 months for historic average
      const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (monthsAgo >= 1 && monthsAgo <= 3) {
        historicSpend[t.category] = historicSpend[t.category] || { sum: 0, count: new Set() };
        historicSpend[t.category].sum += t.amount;
        historicSpend[t.category].count.add(key);
      }
    }
  });

  const suggestions = [];

  // Overspending alerts
  Object.entries(currentMonthSpend).forEach(([cat, curr]) => {
    const hist = historicSpend[cat];
    if (!hist) return;
    const avg = hist.sum / hist.count.size;
    const ratio = curr / avg;
    if (ratio > 1.2) {
      suggestions.push({
        type: "warning",
        category: cat,
        message: `You've overspent on **${cat}** by ${Math.round((ratio - 1) * 100)}% vs. your average.`,
        tip: `Try capping ${cat} at ₹${Math.round(avg).toLocaleString()} next month.`,
        current: Math.round(curr),
        average: Math.round(avg),
      });
    }
  });

  // Positive reinforcement — categories well under control
  Object.entries(currentMonthSpend).forEach(([cat, curr]) => {
    const hist = historicSpend[cat];
    if (!hist) return;
    const avg = hist.sum / hist.count.size;
    const ratio = curr / avg;
    if (ratio < 0.8 && avg > 500) {
      suggestions.push({
        type: "success",
        category: cat,
        message: `Great discipline on **${cat}**! You spent ${Math.round((1 - ratio) * 100)}% less than usual.`,
        tip: "Keep it up — redirect savings toward a goal.",
        current: Math.round(curr),
        average: Math.round(avg),
      });
    }
  });

  // If no current month data but there IS historic data, proactively alert
  if (Object.keys(currentMonthSpend).length === 0 && Object.keys(historicSpend).length > 0) {
    suggestions.push({
      type: "info",
      category: "General",
      message: "No expenses recorded this month yet.",
      tip: "Start logging transactions to get personalised suggestions!",
      current: 0,
      average: 0,
    });
  }

  return suggestions.slice(0, 5); // Cap at 5 most relevant
}

// ─── SAVINGS RATE TREND ──────────────────────────────────────────────────────
export function computeSavingsRateTrend(transactions) {
  const monthly = {};
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthly[key] = monthly[key] || { income: 0, expense: 0 };
    if (t.type === "income") monthly[key].income += t.amount;
    else monthly[key].expense += t.amount;
  });

  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // last 6 months
    .map(([key, { income, expense }]) => {
      const [year, month] = key.split("-");
      const label = new Date(year, parseInt(month) - 1).toLocaleString("default", { month: "short" });
      const savings = income - expense;
      const rate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;
      return { month: label, savings, rate: parseFloat(rate), income, expense };
    });
}

// ─── WEEKLY SPENDING DIGEST ──────────────────────────────────────────────────
/**
 * Compares expenses from the last 7 days against the 7 days prior.
 */
export function computeWeeklyDigest(transactions) {
  const now = new Date();
  const currentWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);

  let currentWeekSpend = 0;
  let lastWeekSpend = 0;

  transactions.forEach(t => {
    if (t.type !== "expense") return;
    const d = new Date(t.date);
    
    if (d >= currentWeekStart && d <= now) {
      currentWeekSpend += t.amount;
    } else if (d >= lastWeekStart && d < currentWeekStart) {
      lastWeekSpend += t.amount;
    }
  });

  let percentageChange = 0;
  let trend = "stable";

  if (lastWeekSpend > 0) {
    percentageChange = ((currentWeekSpend - lastWeekSpend) / lastWeekSpend) * 100;
  } else if (currentWeekSpend > 0) {
    percentageChange = 100; // 100% increase if last week was 0
  }

  if (percentageChange > 5) trend = "up";
  else if (percentageChange < -5) trend = "down";

  return {
    currentWeekSpend,
    lastWeekSpend,
    percentageChange: Math.round(Math.abs(percentageChange)),
    trend,
    isGood: trend === "down" || trend === "stable" // Less spending is good
  };
}

// ─── ANOMALY DETECTION ───────────────────────────────────────────────────────
/**
 * Detects if a newly added expense is significantly higher than the historic average
 * for that specific category. Returns an alert object if anomalous.
 */
export function detectAnomaly(transactions, newExpenseAmount, category) {
  if (!newExpenseAmount || !category) return null;

  let totalSpend = 0;
  let count = 0;

  transactions.forEach(t => {
    if (t.type === "expense" && t.category === category) {
      totalSpend += t.amount;
      count += 1;
    }
  });

  if (count === 0) return null; // Not enough historic data to compare

  const average = totalSpend / count;
  
  // Rule: Anomaly if > 200% of average AND absolute amount is somewhat significant (e.g., > 50)
  if (newExpenseAmount > average * 2 && newExpenseAmount > 50) {
    const percentage = Math.round(((newExpenseAmount - average) / average) * 100);
    return {
      isAnomaly: true,
      average: Math.round(average),
      percentage,
      message: `Unusually high expense! This is ${percentage}% higher than your average ${category} spending.`
    };
  }

  return null;
}

// ─── GAMIFICATION: HEALTH SCORE ──────────────────────────────────────────────
/**
 * Computes a 0-100 Financial Health Score based on:
 * - 40% Savings Rate (Last 30 Days)
 * - 40% Budget Discipline (Absence of anomaly/overspend)
 * - 20% Goal Progression
 */
export function computeHealthScore(transactions, goals = []) {
  let score = 0;
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  let recentIncome = 0;
  let recentExpense = 0;

  transactions.forEach(t => {
    const d = new Date(t.date);
    if (d >= thirtyDaysAgo && d <= now) {
      if (t.type === "income") recentIncome += t.amount;
      else recentExpense += t.amount;
    }
  });

  // 1. Savings Rate (Max 40 points)
  // If you save 20% or more of your income, you get full 40 points.
  if (recentIncome > 0) {
    const savingsRate = ((recentIncome - recentExpense) / recentIncome) * 100;
    if (savingsRate >= 20) score += 40;
    else if (savingsRate > 0) score += (savingsRate / 20) * 40;
  }

  // 2. Budget Discipline (Max 40 points)
  // Deduct points for recent anomalies
  let anomalies = 0;
  transactions.filter(t => t.type === "expense" && new Date(t.date) >= thirtyDaysAgo).forEach(t => {
    const isAnomaly = detectAnomaly(transactions, t.amount, t.category);
    if (isAnomaly) anomalies++;
  });
  
  let disciplinePoints = 40 - (anomalies * 10);
  if (disciplinePoints < 0) disciplinePoints = 0;
  score += disciplinePoints;

  // 3. Goal Progression (Max 20 points)
  if (goals.length > 0) {
    let totalProgress = 0;
    goals.forEach(g => {
      totalProgress += Math.min((g.currentAmount / g.targetAmount), 1);
    });
    const avgProgress = totalProgress / goals.length;
    score += avgProgress * 20;
  } else {
    score += 10; // Neutral default if no goals
  }

  return Math.min(Math.round(score), 100);
}

// ─── GAMIFICATION: ACHIEVEMENTS ──────────────────────────────────────────────
/**
 * Evaluates the user's data to unlock badges/achievements.
 */
export function evaluateAchievements(transactions, goals = []) {
  const achievements = [
    { id: 'first_step', title: 'First Step', description: 'Log your first transaction', icon: '🌱', unlocked: false },
    { id: 'goal_setter', title: 'Goal Setter', description: 'Create your first savings goal', icon: '🎯', unlocked: false },
    { id: 'goal_crusher', title: 'Goal Crusher', description: 'Complete a savings goal to 100%', icon: '🏆', unlocked: false },
    { id: 'high_roller', title: 'High Roller', description: 'Log a single income over 5,000', icon: '💰', unlocked: false },
    { id: 'budget_master', title: 'Budget Master', description: 'Log 50 transactions', icon: '👑', unlocked: false },
  ];

  if (transactions.length > 0) {
    achievements.find(a => a.id === 'first_step').unlocked = true;
  }

  if (transactions.length >= 50) {
    achievements.find(a => a.id === 'budget_master').unlocked = true;
  }

  if (transactions.some(t => t.type === "income" && t.amount >= 5000)) {
    achievements.find(a => a.id === 'high_roller').unlocked = true;
  }

  if (goals.length > 0) {
    achievements.find(a => a.id === 'goal_setter').unlocked = true;
  }

  if (goals.some(g => g.currentAmount >= g.targetAmount)) {
    achievements.find(a => a.id === 'goal_crusher').unlocked = true;
  }

  return achievements;
}

// ─── SUBSCRIPTION DETECTOR ───────────────────────────────────────────────────
/**
 * Detects recurring monthly subscriptions by finding identical titles and amounts
 * in expenses that appear multiple times.
 */
export function detectSubscriptions(transactions) {
  const expenseTracker = {};

  transactions.forEach(t => {
    if (t.type !== "expense") return;
    const key = `${t.title.toLowerCase()}_${t.amount}`;
    
    if (!expenseTracker[key]) {
      expenseTracker[key] = {
        title: t.title,
        amount: t.amount,
        category: t.category,
        dates: []
      };
    }
    expenseTracker[key].dates.push(new Date(t.date));
  });

  const subscriptions = [];
  let totalMonthlyFixedCost = 0;

  Object.values(expenseTracker).forEach(group => {
    if (group.dates.length >= 2) {
      // Sort dates descending to get latest
      group.dates.sort((a, b) => b - a);
      const lastPaid = group.dates[0];

      subscriptions.push({
        title: group.title,
        amount: group.amount,
        category: group.category,
        frequency: "Monthly",
        lastPaid: lastPaid
      });
      totalMonthlyFixedCost += group.amount;
    }
  });

  return {
    subscriptions: subscriptions.sort((a, b) => b.amount - a.amount),
    totalMonthlyFixedCost
  };
}
