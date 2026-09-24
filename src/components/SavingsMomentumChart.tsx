import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';
import { WalletTransaction, MarketItem, Goal } from '../types/models';
import { SEED_MARKET_ITEMS } from '../data/seed';
import { Select } from './ui';
import { useT } from '../i18n';

/* ----------------------------- Chart palette ----------------------------- */
const readVar = (name: string, fallback: string): string => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

const readChartColors = () => ({
  accent: readVar('--accent', '#1F5F3F'),
  secondary: readVar('--border-strong', '#C9C9C6'),
  tertiary: readVar('--fg-muted', '#6F6F6C'),
  grid: readVar('--border', '#E4E4E1'),
  text: readVar('--fg-muted', '#6F6F6C'),
  fg: readVar('--fg', '#111111'),
  bg: readVar('--bg', '#FFFFFF'),
});

const useChartColors = () => {
  const [colors, setColors] = useState(readChartColors);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => setColors(readChartColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    return () => observer.disconnect();
  }, []);
  return colors;
};

interface SavingsMomentumChartProps {
  transactions: WalletTransaction[];
  inVisionItemIds?: string[];
  customMarketItems?: MarketItem[];
  userGoals?: Goal[];
  className?: string;
}

interface DayPoint {
  date: Date;
  dayKey: string; // YYYY-MM-DD
  label: string;
  dayEarned: number;
  daySpent: number;
  netDay: number;
  cumulativeBalance: number;
  txCount: number;
}

interface GoalOption {
  id: string;
  name: string;
  targetD$: number;
  category?: string;
  source: 'vision' | 'market' | 'goal';
}

export const SavingsMomentumChart: React.FC<SavingsMomentumChartProps> = ({
  transactions,
  inVisionItemIds = [],
  customMarketItems = [],
  userGoals = [],
  className = '',
}) => {
  const t = useT();
  const colors = useChartColors();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const [hoveredPoint, setHoveredPoint] = useState<DayPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Available Dream Goals from Vision Board, Market, and Custom Goals
  const goalOptions = useMemo<GoalOption[]>(() => {
    const list: GoalOption[] = [];
    const allMarketItems = [...SEED_MARKET_ITEMS, ...customMarketItems];

    // In-vision items first
    inVisionItemIds.forEach((id) => {
      const item = allMarketItems.find((m) => m.id === id);
      if (item) {
        list.push({
          id: item.id,
          name: item.name,
          targetD$: item.dreamDollarPrice,
          category: item.category,
          source: 'vision',
        });
      }
    });

    // Custom user goals
    userGoals.forEach((g) => {
      if (!list.some((o) => o.name.toLowerCase() === g.title.toLowerCase())) {
        list.push({
          id: g.id,
          name: g.title,
          targetD$: 1000, // Default baseline for goal if not priced
          category: g.area,
          source: 'goal',
        });
      }
    });

    // Add remaining popular market goals
    allMarketItems.forEach((item) => {
      if (!list.some((o) => o.id === item.id)) {
        list.push({
          id: item.id,
          name: item.name,
          targetD$: item.dreamDollarPrice,
          category: item.category,
          source: 'market',
        });
      }
    });

    // Sort by target price ascending
    return list.sort((a, b) => a.targetD$ - b.targetD$);
  }, [inVisionItemIds, customMarketItems, userGoals]);

  // Active tracked goal
  const [selectedGoalId, setSelectedGoalId] = useState<string>(() => {
    return goalOptions[0]?.id || 'seed-morning-ritual';
  });

  // Ensure valid selection
  useEffect(() => {
    if (goalOptions.length > 0 && !goalOptions.some((g) => g.id === selectedGoalId)) {
      setSelectedGoalId(goalOptions[0].id);
    }
  }, [goalOptions, selectedGoalId]);

  const activeGoal = useMemo(() => {
    return goalOptions.find((g) => g.id === selectedGoalId) || goalOptions[0] || {
      id: 'default-goal',
      name: t('Life Design Milestone'),
      targetD$: 1000,
      source: 'market',
    };
  }, [goalOptions, selectedGoalId, t]);

  // Calculate 30-day timeline series
  const dataPoints = useMemo<DayPoint[]>(() => {
    const points: DayPoint[] = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Generate 30 days starting from 29 days ago to today
    const dayKeys: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayKeys.push(key);
    }

    const startDateStr = dayKeys[0];

    // Compute balance strictly before the 30-day window
    const priorTransactions = transactions.filter((t) => t.dayKey < startDateStr);
    let runningBalance = priorTransactions.reduce((acc, t) => acc + t.amount, 0);

    // Group transactions by dayKey
    const txByDay = new Map<string, WalletTransaction[]>();
    transactions.forEach((tx) => {
      const existing = txByDay.get(tx.dayKey) || [];
      existing.push(tx);
      txByDay.set(tx.dayKey, existing);
    });

    dayKeys.forEach((key) => {
      const d = new Date(key + 'T12:00:00');
      const dayTxs = txByDay.get(key) || [];
      const dayEarned = dayTxs.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
      const daySpent = dayTxs.filter((t) => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);
      const netDay = dayEarned - daySpent;

      runningBalance += netDay;
      // Prevent balance underflow for visual sanity in simulation
      const currentBal = Math.max(0, runningBalance);

      points.push({
        date: d,
        dayKey: key,
        label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        dayEarned,
        daySpent,
        netDay,
        cumulativeBalance: currentBal,
        txCount: dayTxs.length,
      });
    });

    return points;
  }, [transactions]);

  // Handle ResizeObserver for responsive SVG rendering
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Momentum velocity metrics
  const velocityMetrics = useMemo(() => {
    if (dataPoints.length === 0) return { dailyAvg: 0, daysLeft: 0, isReached: false, momentumPct: 0 };
    const latestBalance = dataPoints[dataPoints.length - 1].cumulativeBalance;
    const startBalance = dataPoints[0].cumulativeBalance;
    const total30dNet = latestBalance - startBalance;
    const dailyAvg = Math.max(0, Math.round(total30dNet / 30));

    const needed = Math.max(0, activeGoal.targetD$ - latestBalance);
    const daysLeft = dailyAvg > 0 ? Math.ceil(needed / dailyAvg) : null;
    const isReached = latestBalance >= activeGoal.targetD$;
    const progressPct = Math.min(100, Math.round((latestBalance / activeGoal.targetD$) * 100));

    // Compare second half velocity vs first half velocity for acceleration index
    const firstHalfDelta = dataPoints[14].cumulativeBalance - dataPoints[0].cumulativeBalance;
    const secondHalfDelta = dataPoints[29].cumulativeBalance - dataPoints[15].cumulativeBalance;
    let momentumStatus: 'accelerating' | 'steady' | 'cooldown' = 'steady';
    if (secondHalfDelta > firstHalfDelta + 50) momentumStatus = 'accelerating';
    else if (secondHalfDelta < firstHalfDelta - 50) momentumStatus = 'cooldown';

    return {
      dailyAvg,
      daysLeft,
      isReached,
      progressPct,
      latestBalance,
      momentumStatus,
      total30dNet,
    };
  }, [dataPoints, activeGoal]);

  // Track if this is the first render to run initial draw entrance vs subsequent updates
  const isInitialMountRef = useRef<boolean>(true);

  // Render & Animate D3 chart inside SVG
  useEffect(() => {
    if (!svgRef.current || dataPoints.length === 0) return;

    const svg = d3.select(svgRef.current);
    const height = 260;
    const margin = { top: 28, right: 32, bottom: 36, left: 52 };
    const innerWidth = Math.max(100, containerWidth - margin.left - margin.right);
    const innerHeight = height - margin.top - margin.bottom;

    // X Scale: Time
    const dateExtent = d3.extent(dataPoints, (d: DayPoint) => d.date);
    const xScale = d3
      .scaleTime()
      .domain([dateExtent[0] || new Date(), dateExtent[1] || new Date()])
      .range([0, innerWidth]);

    // Y Scale: Linear Balance (with headroom to include goal line if reasonable)
    const maxBalance = d3.max(dataPoints, (d: DayPoint) => d.cumulativeBalance) || 100;
    const yMax = Math.max(maxBalance * 1.15, activeGoal.targetD$ * 1.08, 200);

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0])
      .nice();

    const yTicks = yScale.ticks(5);

    // Area & Line Generators
    const areaGenerator = d3
      .area<DayPoint>()
      .x((d: DayPoint) => xScale(d.date) || 0)
      .y0(innerHeight)
      .y1((d: DayPoint) => yScale(d.cumulativeBalance))
      .curve(d3.curveMonotoneX);

    const lineGenerator = d3
      .line<DayPoint>()
      .x((d: DayPoint) => xScale(d.date) || 0)
      .y((d: DayPoint) => yScale(d.cumulativeBalance))
      .curve(d3.curveMonotoneX);

    const barWidth = Math.max(2, (innerWidth / dataPoints.length) * 0.45);
    const significantPoints = dataPoints.filter((d: DayPoint) => d.dayEarned > 0 || d.daySpent > 0);

    const isInitial = isInitialMountRef.current;

    // Build or select persistent chart container
    let g = svg.select<SVGGElement>('g.chart-root');

    if (g.empty()) {
      svg.selectAll('*').remove(); // Clear any stale artifact

      g = svg
        .append('g')
        .attr('class', 'chart-root')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // 1. Grid group
      g.append('g').attr('class', 'grid-lines');

      // 2. Daily Bars group
      g.append('g').attr('class', 'bars-group');

      // 3. Area path
      g.append('path').attr('class', 'area-path');

      // 4. Line path
      g.append('path')
        .attr('class', 'line-path')
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke-linecap', 'round');

      // 5. Milestone dots group
      g.append('g').attr('class', 'dots-group');

      // 6. Goal Threshold group
      const goalGroup = g.append('g').attr('class', 'goal-threshold');
      goalGroup.append('line').attr('class', 'goal-line').attr('stroke-width', 1);

      goalGroup
        .append('text')
        .attr('class', 'goal-label')
        .attr('text-anchor', 'end')
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .attr('font-family', 'var(--font-sans)');

      // 7. Axes groups
      g.append('g').attr('class', 'x-axis-group').attr('transform', `translate(0, ${innerHeight})`);
      g.append('g').attr('class', 'y-axis-group');

      // 8. Hover overlay & focus crosshair
      g.append('rect')
        .attr('class', 'interactive-overlay')
        .attr('fill', 'transparent')
        .style('cursor', 'crosshair');

      const focusGroup = g.append('g').attr('class', 'focus-indicators').style('display', 'none');

      focusGroup
        .append('line')
        .attr('class', 'focus-line')
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke-width', 1)
        .attr('opacity', 0.4);

      focusGroup
        .append('circle')
        .attr('class', 'focus-circle')
        .attr('r', 5)
        .attr('stroke-width', 2);
    }

    // Theme-aware colours (re-applied on every render so dark mode follows)
    g.select('.area-path').attr('fill', colors.accent).attr('fill-opacity', 0.08);
    g.select('.line-path').attr('stroke', colors.accent);
    g.select('.goal-line').attr('stroke', colors.tertiary);
    g.select('.goal-label').attr('fill', colors.tertiary);
    g.select('.focus-line').attr('stroke', colors.fg);
    g.select('.focus-circle').attr('fill', colors.bg).attr('stroke', colors.fg);

    // Update dimensions of root container
    g.attr('transform', `translate(${margin.left},${margin.top})`);

    // Define standard transition
    const trans = svg.transition().duration(isInitial ? 850 : 650).ease(d3.easeCubicInOut);

    // --- A. Grid Lines ---
    const gridGroup = g.select<SVGGElement>('.grid-lines');
    gridGroup
      .selectAll<SVGLineElement, number>('line')
      .data(yTicks, (d) => d)
      .join(
        (enter) =>
          enter
            .append('line')
            .attr('x1', 0)
            .attr('x2', innerWidth)
            .attr('y1', (d) => yScale(d))
            .attr('y2', (d) => yScale(d))
            .attr('stroke', colors.grid)
            .attr('stroke-width', 1)
            .attr('opacity', 0)
            .call((enterLine) => enterLine.transition(trans).attr('opacity', 1)),
        (update) =>
          update.call((updateLine) =>
            updateLine
              .attr('stroke', colors.grid)
              .transition(trans)
              .attr('x1', 0)
              .attr('x2', innerWidth)
              .attr('y1', (d) => yScale(d))
              .attr('y2', (d) => yScale(d))
              .attr('opacity', 1)
          ),
        (exit) => exit.call((exitLine) => exitLine.transition(trans).attr('opacity', 0).remove())
      );

    // --- B. X & Y Axes ---
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(containerWidth > 500 ? 6 : 4)
      .tickFormat((d) => d3.timeFormat('%b %d')(d as Date))
      .tickSize(4);

    const xAxisGroup = g.select<SVGGElement>('.x-axis-group');
    xAxisGroup.attr('transform', `translate(0, ${innerHeight})`);
    if (isInitial) {
      xAxisGroup.call(xAxis);
    } else {
      xAxisGroup.transition(trans).call(xAxis);
    }
    xAxisGroup.select('.domain').attr('stroke', colors.grid);
    xAxisGroup.selectAll('.tick line').attr('stroke', colors.grid);
    xAxisGroup
      .selectAll('.tick text')
      .attr('fill', colors.text)
      .attr('font-size', '11px')
      .attr('font-family', 'var(--font-sans)')
      .attr('dy', '10px');

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `D$ ${d3.format('~s')(d as number)}`)
      .tickSize(0);

    const yAxisGroup = g.select<SVGGElement>('.y-axis-group');
    if (isInitial) {
      yAxisGroup.call(yAxis);
    } else {
      yAxisGroup.transition(trans).call(yAxis);
    }
    yAxisGroup.select('.domain').remove();
    yAxisGroup
      .selectAll('.tick text')
      .attr('fill', colors.text)
      .attr('font-size', '11px')
      .attr('font-family', 'var(--font-sans)')
      .attr('dx', '-6px');

    // --- C. Daily Activity Bars ---
    const barsGroup = g.select<SVGGElement>('.bars-group');
    barsGroup
      .selectAll<SVGRectElement, DayPoint>('.day-bar')
      .data(dataPoints, (d: DayPoint) => d.dayKey)
      .join(
        (enter) =>
          enter
            .append('rect')
            .attr('class', 'day-bar')
            .attr('x', (d: DayPoint) => (xScale(d.date) || 0) - barWidth / 2)
            .attr('y', innerHeight)
            .attr('width', barWidth)
            .attr('height', 0)
            .attr('fill', colors.secondary)
            .attr('opacity', 0)
            .attr('rx', 1)
            .call((enterRect) =>
              isInitial
                ? enterRect
                    .transition()
                    .delay((_: DayPoint, i: number) => 100 + i * 18)
                    .duration(450)
                    .ease(d3.easeQuadOut)
                    .attr('y', (d: DayPoint) => (d.dayEarned > 0 ? yScale(d.dayEarned) : innerHeight))
                    .attr('height', (d: DayPoint) => (d.dayEarned > 0 ? innerHeight - yScale(d.dayEarned) : 0))
                    .attr('opacity', 1)
                : enterRect
                    .transition(trans)
                    .attr('y', (d: DayPoint) => (d.dayEarned > 0 ? yScale(d.dayEarned) : innerHeight))
                    .attr('height', (d: DayPoint) => (d.dayEarned > 0 ? innerHeight - yScale(d.dayEarned) : 0))
                    .attr('opacity', 1)
            ),
        (update) =>
          update.call((updateRect) =>
            updateRect
              .attr('fill', colors.secondary)
              .transition(trans)
              .attr('x', (d: DayPoint) => (xScale(d.date) || 0) - barWidth / 2)
              .attr('y', (d: DayPoint) => (d.dayEarned > 0 ? yScale(d.dayEarned) : innerHeight))
              .attr('width', barWidth)
              .attr('height', (d: DayPoint) => (d.dayEarned > 0 ? innerHeight - yScale(d.dayEarned) : 0))
              .attr('opacity', 1)
          ),
        (exit) =>
          exit.call((exitRect) =>
            exitRect.transition(trans).attr('y', innerHeight).attr('height', 0).attr('opacity', 0).remove()
          )
      );

    // --- D. Area Path ---
    const areaPath = g.select<SVGPathElement>('.area-path');
    if (isInitial) {
      areaPath
        .datum(dataPoints)
        .attr('d', areaGenerator)
        .attr('opacity', 0)
        .transition()
        .duration(900)
        .ease(d3.easeCubicOut)
        .attr('opacity', 1);
    } else {
      areaPath.datum(dataPoints).transition(trans).attr('d', areaGenerator).attr('opacity', 1);
    }

    // --- E. Momentum Line Path ---
    const linePath = g.select<SVGPathElement>('.line-path');
    if (isInitial) {
      linePath.datum(dataPoints).attr('d', lineGenerator);
      const pathNode = linePath.node();
      if (pathNode) {
        const totalLength = pathNode.getTotalLength();
        linePath
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(1000)
          .ease(d3.easeCubicOut)
          .attr('stroke-dashoffset', 0);
      }
    } else {
      linePath
        .datum(dataPoints)
        .attr('stroke-dasharray', null)
        .attr('stroke-dashoffset', null)
        .transition(trans)
        .attr('d', lineGenerator);
    }

    // --- F. Milestone Dots (Days with Activity) ---
    const dotsGroup = g.select<SVGGElement>('.dots-group');
    dotsGroup
      .selectAll<SVGCircleElement, DayPoint>('.milestone-dot')
      .data(significantPoints, (d: DayPoint) => d.dayKey)
      .join(
        (enter) =>
          enter
            .append('circle')
            .attr('class', 'milestone-dot')
            .attr('cx', (d: DayPoint) => xScale(d.date) || 0)
            .attr('cy', (d: DayPoint) => yScale(d.cumulativeBalance))
            .attr('r', 0)
            .attr('opacity', 0)
            .attr('fill', (d: DayPoint) => (d.dayEarned > 0 ? colors.bg : colors.tertiary))
            .attr('stroke', (d: DayPoint) => (d.dayEarned > 0 ? colors.accent : colors.tertiary))
            .attr('stroke-width', 1.5)
            .call((enterCircle) =>
              isInitial
                ? enterCircle
                    .transition()
                    .delay((_: DayPoint, i: number) => 400 + i * 28)
                    .duration(400)
                    .ease(d3.easeCubicOut)
                    .attr('r', 3)
                    .attr('opacity', 1)
                : enterCircle
                    .transition(trans)
                    .attr('r', 3)
                    .attr('opacity', 1)
            ),
        (update) =>
          update.call((updateCircle) =>
            updateCircle
              .transition(trans)
              .attr('cx', (d: DayPoint) => xScale(d.date) || 0)
              .attr('cy', (d: DayPoint) => yScale(d.cumulativeBalance))
              .attr('fill', (d: DayPoint) => (d.dayEarned > 0 ? colors.bg : colors.tertiary))
              .attr('stroke', (d: DayPoint) => (d.dayEarned > 0 ? colors.accent : colors.tertiary))
              .attr('r', 3)
              .attr('opacity', 1)
          ),
        (exit) =>
          exit.call((exitCircle) =>
            exitCircle.transition(trans).attr('r', 0).attr('opacity', 0).remove()
          )
      );

    // --- G. Goal Target Line & Label ---
    const goalGroup = g.select<SVGGElement>('.goal-threshold');
    const goalLine = goalGroup.select<SVGLineElement>('.goal-line');
    const goalLabel = goalGroup.select<SVGTextElement>('.goal-label');
    const goalText = t('Goal: {name} (D$ {amount})', { name: t(activeGoal.name), amount: activeGoal.targetD$.toLocaleString() });

    if (activeGoal.targetD$ <= yMax) {
      const goalY = yScale(activeGoal.targetD$);
      goalGroup.style('display', null);

      if (isInitial) {
        goalLine
          .attr('x1', 0)
          .attr('x2', 0)
          .attr('y1', goalY)
          .attr('y2', goalY)
          .attr('opacity', 0)
          .transition()
          .duration(750)
          .ease(d3.easeCubicOut)
          .attr('x2', innerWidth)
          .attr('opacity', 1);

        goalLabel
          .attr('x', innerWidth - 6)
          .attr('y', goalY - 6)
          .attr('opacity', 0)
          .text(goalText)
          .transition()
          .delay(350)
          .duration(500)
          .attr('opacity', 1);
      } else {
        goalLine
          .transition(trans)
          .attr('x1', 0)
          .attr('x2', innerWidth)
          .attr('y1', goalY)
          .attr('y2', goalY)
          .attr('opacity', 1);

        goalLabel
          .text(goalText)
          .transition(trans)
          .attr('x', innerWidth - 6)
          .attr('y', goalY - 6)
          .attr('opacity', 1);
      }
    } else {
      goalGroup.transition(trans).style('opacity', 0).on('end', () => goalGroup.style('display', 'none'));
    }

    // --- H. Interactive Overlay & Focus Group Bindings ---
    const overlay = g.select<SVGRectElement>('.interactive-overlay');
    overlay.attr('width', innerWidth).attr('height', innerHeight);

    const focusGroup = g.select<SVGGElement>('.focus-indicators');
    const focusLine = focusGroup.select<SVGLineElement>('.focus-line');
    const focusCircle = focusGroup.select<SVGCircleElement>('.focus-circle');
    focusLine.attr('y2', innerHeight);

    const bisectDate = d3.bisector<DayPoint, Date>((d) => d.date).left;

    overlay
      .on('mouseenter', () => focusGroup.style('display', null))
      .on('mouseleave', () => {
        focusGroup.style('display', 'none');
        setHoveredPoint(null);
        setTooltipPos(null);
      })
      .on('mousemove', (event: MouseEvent) => {
        const [mx] = d3.pointer(event, overlay.node());
        const x0 = xScale.invert(mx);
        const index = bisectDate(dataPoints, x0, 1);
        const d0 = dataPoints[index - 1];
        const d1 = dataPoints[index];
        let selected = d0;
        if (d1 && x0) {
          selected = x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime() ? d1 : d0;
        }

        if (selected) {
          const cx = xScale(selected.date) || 0;
          const cy = yScale(selected.cumulativeBalance);

          focusLine.attr('x1', cx).attr('x2', cx);
          focusCircle.attr('cx', cx).attr('cy', cy);

          setHoveredPoint(selected);
          setTooltipPos({
            x: cx + margin.left,
            y: cy + margin.top,
          });
        }
      });

    // Mark initial entrance complete
    isInitialMountRef.current = false;
  }, [dataPoints, containerWidth, activeGoal, t, colors]);

  return (
    <div className={`bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-6 ${className}`}>
      {/* Header & goal selector */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Savings Momentum')}</h3>
          <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">
            {t('Your balance over the last 30 days and how far it is from a goal.')}
          </p>
        </div>

        <div className="w-full sm:w-56">
          <label htmlFor="goal-momentum-select" className="block text-[12px] text-[var(--fg-muted)] mb-1">
            {t('Track Goal:')}
          </label>
          <Select
            id="goal-momentum-select"
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="bg-[var(--bg)]"
            options={goalOptions.map((g) => ({
              value: g.id,
              label: `${t(g.name)} (D$ ${g.targetD$.toLocaleString()})`,
            }))}
          />
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">
            +D$ {velocityMetrics.dailyAvg}
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Per day, last 30 days')}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
            {t('Total Net: +D$ {amount}', { amount: velocityMetrics.total30dNet.toLocaleString() })}
          </div>
        </div>

        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">
            D$ {activeGoal.targetD$.toLocaleString()}
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Goal Target')}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5 truncate">{t(activeGoal.name)}</div>
        </div>

        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--accent)] leading-none">
            {velocityMetrics.progressPct}%
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Goal Progress')}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
            {t('D$ {amount} reached', { amount: velocityMetrics.latestBalance?.toLocaleString() ?? '0' })}
          </div>
        </div>

        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">
            {velocityMetrics.isReached
              ? t('Reached')
              : velocityMetrics.daysLeft !== null
              ? t('~{n} days', { n: velocityMetrics.daysLeft })
              : t('Action required')}
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Est. Completion')}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
            {t('Trajectory: {status}', {
              status:
                velocityMetrics.momentumStatus === 'accelerating'
                  ? t('accelerating')
                  : velocityMetrics.momentumStatus === 'cooldown'
                  ? t('cooldown')
                  : t('steady'),
            })}
          </div>
        </div>
      </div>

      {/* D3 SVG Chart Container */}
      <div ref={containerRef} className="relative w-full">
        <svg
          ref={svgRef}
          width="100%"
          height={260}
          className="overflow-visible select-none"
        />

        {hoveredPoint && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[12px] p-3 min-w-[170px] -translate-x-1/2 -translate-y-full -mt-2"
            style={{
              left: `${Math.min(Math.max(tooltipPos.x, 90), containerWidth - 90)}px`,
              top: `${Math.max(tooltipPos.y, 70)}px`,
            }}
          >
            <div className="flex justify-between items-center gap-3 pb-2 mb-2 border-b border-[var(--border)]">
              <span className="font-semibold text-[var(--fg)]">{hoveredPoint.label}</span>
              <span className="text-[var(--fg-muted)]">{hoveredPoint.dayKey}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center gap-3">
                <span className="text-[var(--fg-muted)]">{t('Ledger Balance:')}</span>
                <span className="font-medium text-[var(--fg)]">
                  D$ {hoveredPoint.cumulativeBalance.toLocaleString()}
                </span>
              </div>

              {hoveredPoint.dayEarned > 0 && (
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[var(--fg-muted)]">{t('Earned Today:')}</span>
                  <span className="font-medium text-[var(--accent)]">+D$ {hoveredPoint.dayEarned}</span>
                </div>
              )}

              {hoveredPoint.daySpent > 0 && (
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[var(--fg-muted)]">{t('Spent Today:')}</span>
                  <span className="font-medium text-[var(--fg)]">-D$ {hoveredPoint.daySpent}</span>
                </div>
              )}

              <div className="flex justify-between items-center gap-3 pt-2 border-t border-[var(--border)] text-[var(--fg-muted)]">
                <span>{t('Goal Target ({name}):', { name: t(activeGoal.name) })}</span>
                <span className="font-medium text-[var(--fg)]">
                  {Math.min(100, Math.round((hoveredPoint.cumulativeBalance / activeGoal.targetD$) * 100))}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[12px] text-[var(--fg-muted)]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-[var(--accent)] rounded-full" />
          <span>{t('Balance')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-[var(--border-strong)] rounded-[3px]" />
          <span>{t('Earned that day')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-px bg-[var(--fg-muted)]" />
          <span>{t('Goal Threshold')}</span>
        </div>
      </div>
    </div>
  );
};
