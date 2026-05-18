---
title: "Cross-Sectional Long-Short Momentum on the S&P 500"
slug: "long-short-equities"
date: "2025-03-15"
dateRange: "Aug 2024 – Mar 2025"
summary: "A dollar-neutral momentum long-short strategy on S&P 500 equities using the classical 12-1 signal: 17.45% annual return at 11.74% volatility, Sharpe 1.49, CAPM alpha 6.89% with beta 0.415."
heroImageAlt: "Cumulative return curve of long-short momentum strategy against S&P 500 benchmark"
github: "https://github.com/IceCurrent/long_short_equities"
tags: ["Factor Investing", "Momentum", "Long-Short Equity", "CAPM"]
---

Cross-sectional momentum — buying recent winners and shorting recent losers — is one of the most well-documented factor anomalies in equity markets (Jegadeesh and Titman, 1993). It survives in-sample under transaction costs, it has been replicated across markets and decades, and it persists despite being widely known. The economic story is unsettled: behavioral underreaction, slow diffusion of information, and limits to arbitrage all have supporting evidence and none of them is dominant.

Whether or not the underlying story matters, the empirical signal is robust enough to serve as a clean teaching case for portfolio construction, risk control, and performance attribution. This project was a Bachelor's thesis building a momentum strategy end-to-end on the S&P 500 and decomposing the resulting P&L.

## Signal and universe

The signal is the classical **12-1 momentum** measure: the trailing 12-month return excluding the most recent month. The one-month exclusion guards against short-term reversal, which is a separate, opposing anomaly — stocks that are up sharply in the last month often mean-revert over the next week or two, and including them in the momentum bucket dilutes the signal.

Universe is the S&P 500, with point-in-time membership to avoid survivorship bias. The index composition changes over time, and using the current membership for historical periods systematically biases toward winners.

## Portfolio construction

At each monthly rebalance:

1. Rank stocks by 12-1 momentum.
2. Go long the top 30 names, short the bottom 30 — the **breadth** parameter, set to 30.
3. Equal-dollar weight within each leg, so the gross long and gross short are equal by construction.

The choice of 30 (rather than full deciles of 50) is a compromise. Wider breadth diversifies idiosyncratic risk; narrower breadth concentrates on the strongest signals. Empirically the top/bottom 30 is roughly where the signal-to-noise ratio peaks for this universe.

## Risk diagnostics

Equal-dollar long-short gives near-zero net dollar exposure, but residual beta drift can still accumulate. A CAPM regression on realized strategy returns,

$$
r_t = \alpha + \beta\, r_t^{\text{mkt}} + \epsilon_t,
$$

gave $\beta = 0.415$ — modest but non-zero. A beta-hedged variant (subtracting a market overlay sized to neutralize the residual exposure) would compress this further, at the cost of additional turnover and the associated transaction costs.

The other key diagnostic is the **information coefficient** — the monthly cross-sectional Spearman rank correlation between the signal and the realized forward return. The IC is the cleanest test of whether the signal is informative *out-of-sample, across stocks*, independent of the long-short P&L (which can be driven by a few large positions). A positive average IC over the sample period validates the signal directly.

## Results

| Metric | Value |
|---|---|
| Annualized return | 17.45% |
| Annualized volatility | 11.74% |
| Sharpe ratio | 1.49 |
| Sortino ratio | 2.37 |
| CAPM alpha | 6.89% |
| CAPM beta | 0.415 |
| Maximum drawdown | 5.41% |

The Sortino-to-Sharpe ratio of 1.59 says downside volatility is meaningfully smaller than total volatility — the negative months are mild compared to the positive months, which is the desired profile for a factor strategy. Low maximum drawdown relative to the realized volatility is partly the long-short structure smoothing the downside, partly the absence of a major momentum crash in the backtest sample.

## What I'd extend

The natural extension is a multi-factor sleeve. Cross-sectional momentum is one factor; combining it with quality (return on assets, gross profitability), value (book-to-market, earnings yield), and low-volatility tilts gives a diversified factor portfolio that historically has both higher Sharpe and lower correlation to the market than any single factor alone.

The other extension is signal refinement. The 12-1 specification is the simplest momentum measure; adjusting for idiosyncratic vs. systematic momentum (using risk-adjusted residuals from a Fama-French regression instead of raw returns) often improves performance, because it strips out the part of the return that's compensation for risk exposures rather than information.

Code is on [GitHub](https://github.com/IceCurrent/long_short_equities).
