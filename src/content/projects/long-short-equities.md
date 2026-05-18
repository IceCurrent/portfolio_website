---
title: "Cross-Sectional Long-Short Momentum on the S&P 500"
slug: "long-short-equities"
date: "2025-03-15"
dateRange: "Aug 2024 – Mar 2025"
summary: "A dollar-neutral 12-1 momentum long-short strategy on the S&P 500. Over 2024, returned 25.0% with 12.8% vol and 10.7% annualised alpha against SPY at beta 0.51."
heroImageAlt: "Cumulative return curve of long-short momentum strategy against S&P 500 benchmark"
github: "https://github.com/IceCurrent/long_short_equities"
tags: ["Factor Investing", "Momentum", "Long-Short Equity", "CAPM"]
---

This project is a dollar-neutral long-short momentum strategy on the S&P 500, backtested over 2024. The signal is classical 12-1 momentum (Jegadeesh and Titman, 1993), one of the most widely replicated factor anomalies in equity markets.

## Strategy

- **Universe:** current S&P 500 constituents.
- **Signal:** 12-1 momentum, the log return from $t-252$ to $t-21$. The one-month skip avoids contamination from short-term reversal, which is a separate, opposing anomaly.
- **Portfolio:** long top 30, short bottom 30, equal-weighted within each leg, 50/50 dollar-neutral.
- **Rebalance:** monthly, on the last trading day. First rebalance 2023-12-29.
- **Benchmark:** SPY.

## Results (2024)

| Metric | Long-Short | SPY |
|---|---|---|
| Annual return | 25.0% | 26.7% |
| Annual vol | 12.8% | 12.5% |
| Sharpe | 1.95 | 2.14 |
| Sortino | 2.67 | 2.78 |
| Max drawdown | -7.8% | -8.4% |
| Alpha (annualised) | 10.7% | - |
| Beta vs SPY | 0.51 | - |

The strategy nearly matched SPY's outright return at roughly half the market beta, producing 10.7% annualised alpha and a smaller max drawdown than the index.

A few caveats. One year of monthly rebalances is twelve holding periods, so the Sharpe and alpha point estimates are indicative, not statistically tight. The universe is the current S&P 500 list, so there is mild survivorship bias. Transaction costs and borrow fees are not modelled.

## What I'd extend

**Multi-factor sleeve.** Combining momentum with quality, value, and low-vol tilts historically produces higher Sharpe and lower market correlation than any single factor alone.

**Risk-adjusted momentum.** Replacing raw 12-1 returns with idiosyncratic residuals from a Fama-French regression strips out the part of past return that is compensation for risk exposure rather than information. This often improves the signal.

Code is on [GitHub](https://github.com/IceCurrent/long_short_equities).