---
title: "Cointegration-Based Pairs Trading on AAPL and MSFT"
slug: "pairs-trading"
date: "2025-08-31"
dateRange: "Jul 2025 – Aug 2025"
summary: "A cointegration-based statistical arbitrage strategy on the AAPL-MSFT spread. Parameters fit on 2023 prices and frozen for out-of-sample trading on 2024 and 2025, producing a net Sharpe of 1.58 over the two-year test window."
heroImageAlt: "Time series of AAPL-MSFT spread z-score with entry and exit signals marked"
github: "https://github.com/IceCurrent/pairs_trading"
tags: ["Statistical Arbitrage", "Cointegration", "Mean Reversion"]
---

This project is a cointegration-based pairs trading strategy on AAPL and MSFT. Cointegration and the hedge ratio are estimated on 2023 prices, the parameters are frozen, and the strategy is then traded out-of-sample on 2024 and 2025. Net Sharpe over the two-year test window is 1.58.

Two assets are cointegrated when their prices wander individually but some linear combination is stationary. Correlation says the prices move together; cointegration says the spread reverts. AAPL and MSFT are a natural candidate: shared US large-cap tech beta, but different products and earnings sensitivities.

## Setup

Engle-Granger on 2023 prices gives an ADF statistic of -3.40 with p-value 0.042. Marginal at the 5% level, but enough to proceed.

OLS on the same 2023 window gives the hedge ratio $\beta = 0.4024$ and intercept $\alpha = 46.4843$. The spread is

$$
S_t = P_t^{\text{AAPL}} - (\alpha + \beta \, P_t^{\text{MSFT}}),
$$

with in-sample mean $\mu = 0.00$ and standard deviation $\sigma = 5.46$. The trading signal is the z-score of $S_t$ against these. Enter when $|z| > 2$, exit when $|z| < 0.5$, one-bar execution lag. Parameters are not refit during the test window, so the strategy has to survive on stale 2023 estimates through all of 2024 and 2025.

Fitting the spread as an Ornstein-Uhlenbeck process gives a mean-reversion half-life of about 8.2 trading days, which sets the natural holding period of a trade.

## Results

Out-of-sample backtest on 2024-2025, 502 trading days:

| Metric | Value |
| --- | --- |
| Total return | +62.68% |
| Annualised return | +27.67% |
| Annualised vol | 16.27% |
| Sharpe | 1.58 |
| Sortino | 3.18 |
| Max drawdown | -11.73% |
| Win rate | 85.7% (6 of 7) |
| Trades | 7 |

Seven trades is a small sample, so the confidence interval around the Sharpe is wide. The Sortino-to-Sharpe ratio near 2 reflects the absence of a structural break in the test window.

The strategy stays profitable up to 100 bps round-trip cost (Sharpe drops from 1.58 to 1.39), since average trade length is long enough that commissions barely move the needle.

## Stops actively hurt

The single most useful finding from the backtest: adding a 5% stop-loss with a 10-day time-stop turns the +62.7% return into -18.6%.

The strategy depends on the spread mean-reverting on its 8.2-day half-life. A 10-day time-stop closes positions exactly when they would have reverted, and a 5% stop-loss exits during the noisy widening that often precedes the actual reversion. For a slow-reverting cointegrated pair, the mean reversion is the alpha. Anything that interrupts it before it completes destroys the strategy.

The right risk control here is not a stop. It is a structural-break detector that closes the position when the cointegration relationship itself has broken.

## What I'd extend

**Regime detection.** Cointegrated relationships break, sometimes slowly and sometimes abruptly. A rolling cointegration test with a structural-break detector, or a Bayesian regime-switching cointegration model, would handle that better than the current always-on approach.

**Portfolio breadth.** Seven trades on one pair is not enough to evaluate a strategy with any precision. A portfolio of cointegrated baskets, weighted by signal strength and capped by per-pair risk, would smooth the PnL and increase the statistical power of the evaluation.

Code is on [GitHub](https://github.com/IceCurrent/pairs_trading).