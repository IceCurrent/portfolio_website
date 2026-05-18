---
title: "A Modular Backtesting Engine for Algorithmic Trading"
slug: "algorithmic-backtesting-engine"
date: "2025-11-30"
dateRange: "Aug 2025 – Nov 2025"
summary: "A Python backtesting framework organized around four loosely-coupled modules covering strategy execution, performance metrics, plotting, and dynamic stop-loss management. Strict input/output contracts at module boundaries make lookahead and alignment bugs structurally hard to write. Available on PyPI as ncBacktester."
heroImageAlt: "Backtesting engine module architecture diagram"
github: "https://github.com/IceCurrent/fim_500_algo_trading"
tags: ["Backtesting", "Technical Indicators", "Machine Learning"]
---

This project is a modular Python backtesting framework for systematic trading strategies. It is organized around four loosely-coupled components covering execution, performance measurement, visualization, and risk control. The package is available on PyPI as [`ncBacktester`](https://pypi.org/project/ncBacktester/0.1.1/).

The backtester is the most important piece of infrastructure in any quantitative trading workflow, and it is also the most common source of silent bugs. Lookahead, survivorship bias, optimistic transaction costs, in-sample overfitting. These are not exotic failure modes. They are the standard reasons a clean-looking research strategy stops working when real money goes behind it.

Most off-the-shelf options have problems. The event-loop frameworks like Quantopian, Backtrader, and Zipline lock you into a specific abstraction that is hard to extend cleanly. Raw pandas pipelines are too low-level, and every researcher reinvents the same bugs in a slightly different way. The middle ground I wanted was a thin framework that enforces correct interfaces and leaves strategy logic open. This was a team build, and the result is what now sits on PyPI.

## Architecture

Four modules, each with a single responsibility, talking to each other through strict input/output contracts.

**Strategy Executor.** Takes a signal stream and a price stream as input and produces a position stream as output. The signal at time $t$ is only allowed to depend on data available up to time $t$. The contract is enforced at the module boundary, so a strategy that accidentally peeks into the future fails to construct rather than fails silently in the P&L.

**Performance Metrics.** Sharpe, Sortino, Calmar, maximum drawdown, hit rate, average win/loss, turnover. Decoupled from the executor, so the same metrics module can be pointed at any position stream. Comparing strategies side by side is a function call, not a code change.

**Plotting.** Cumulative-return curves, drawdown plots, signal-on-price overlays, rolling Sharpe time series. Consistent styling across every strategy tested in the same harness, which makes side-by-side comparison readable rather than a parade of mismatched matplotlib defaults.

**Dynamic Stop-Loss Manager.** Trailing stops parameterized by recent realized volatility. The stop widens in noisy regimes and tightens in calmer ones, which avoids being stopped out by ordinary volatility while still controlling tail losses.

## Signal generation

The harness ships with a library of vectorized rolling technical indicators:

- **RSI** (Relative Strength Index): momentum oscillator, standard 14-day window.
- **MACD**: moving-average convergence/divergence, 12/26/9 default.
- **Stochastic Oscillator**: short-horizon overbought/oversold.
- **Aroon**: trend strength and direction.
- **EMA**: exponential moving averages at multiple horizons.

All are pure pandas operations. Every indicator at time $t$ depends only on data through $t$, by construction.

For binary signal prediction (hold or flat), the project included two classifiers trained on the indicator features. Logistic regression as the linear baseline, and XGBoost for non-linear interactions and feature-importance diagnostics. Both were trained walk-forward. At each rebalance point, the model is retrained on data strictly before the decision. Walk-forward is the only honest way to evaluate a model that will be used to make real-time decisions, since anything else lets information from the future leak into training and inflates measured performance.

## What I'd extend

Two directions stand out.

**Transaction-cost modeling.** A constant basis-point haircut is the standard placeholder, and it badly underestimates real-world costs for anything but small trades in very liquid names. Realistic slippage is a function of order size, average daily volume, and bid-ask spread, with a market-impact term that scales with the square root of size in most models. Adding this would materially change the rankings of higher-turnover strategies.

**Portfolio-level backtesting.** The current harness is single-asset. Running a multi-asset strategy needs position-sizing across assets, netting across instruments, and a portfolio-level risk module. None of that is a simple extension of the single-asset code, but it is the obvious next step for the framework to be useful on anything beyond a single-name strategy.

The package is on PyPI as [`ncBacktester`](https://pypi.org/project/ncBacktester/0.1.1/). Code is on [GitHub](https://github.com/IceCurrent/fim_500_algo_trading).