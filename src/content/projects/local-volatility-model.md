---
title: "Local Volatility Calibration and PDE-Based Greeks Validation"
slug: "local-volatility-model"
date: "2026-04-15"
dateRange: "Jan 2026 – Apr 2026"
summary: "A Dupire local-volatility pipeline for SPX options. Raw quotes are cleaned and smoothed with arbitrage-free SVI calibration on 5,000+ contracts. The resulting local-vol surface drives a Crank-Nicolson PDE pricer for prices and Greeks."
heroImageAlt: "Dupire local volatility surface visualization in log-moneyness and maturity"
github: "https://github.com/IceCurrent/local_volatility_model"
tags: ["Local Volatility", "PDE Methods", "SVI Calibration", "Greeks"]
---

This project is an end-to-end local volatility pipeline for SPX options. I built a Dupire local-volatility model from raw quotes, calibrated it on more than 5,000 contracts, and then used it inside a Crank-Nicolson PDE pricer to compute prices and Greeks that are consistent with the calibrated surface.

The motivation is the most basic fact about options markets. Black-Scholes assumes constant volatility, but the market trades a smile. Implied vols differ across strikes and maturities, sometimes substantially. Any usable pricing or risk system has to handle that.

## Two ways to handle the smile

There are two standard responses.

**Stochastic volatility models** like Heston, SABR, and rough Heston promote volatility itself to a random process with its own dynamics. They are the right choice when you care about forward-vol behavior, vol-of-vol dynamics, or anything that depends on the joint distribution of spot and vol.

**Local volatility**, due to Dupire (1994), takes a different angle. Instead of asking what dynamics the vol process should have, local vol asks a calibration question. Given today's market prices of European options, what deterministic function $\sigma(S, t)$ would exactly reproduce them under a Black-Scholes-like SDE? If you can find that function, you have a model that is consistent with the entire vanilla surface by construction.

Local vol has well-known limits. It under-prices forward skew, gives wrong vega exposures on some forward-starting structures, and is not the right tool for cliquets or vol-of-vol sensitive products. But it remains the workhorse for vanilla risk management. The whole vanilla book on a desk often runs on local vol, with stochastic vol overlays only where the local-vol assumptions break.

## The pipeline

The pipeline goes from raw quotes to a price-and-Greek engine in six steps.

### Step 1: Data cleaning and no-arbitrage checks

The data is from OptionsDX, 2023 SPX quotes. This is a low-vol regime, which is worth keeping in mind when interpreting the calibrated parameters. Cleaning involves several filters:

- **Liquidity.** Require minimum open interest and volume on each contract.
- **Intrinsic bounds.** Call prices must satisfy $C \geq \max(S - K, 0)$, and analogously for puts. Violations are static arbitrages and usually data errors.
- **Bid-ask sanity.** Drop crossed quotes, one-sided markets, and contracts with spreads wide enough to make the mid meaningless.
- **Put-call consistency.** Large divergences between call and put implied vols at the same strike and maturity get flagged as data quality issues.

The output is a clean set of contracts with usable mid-quote prices.

### Step 2: Implied volatility extraction

For each contract I invert Black-Scholes numerically to get the implied vol from the mid-quote, using a secant root finder. The pipeline converges on about 94% of contracts. The rest are dropped, typically deep-out-of-the-money options where vega is small and the inversion is numerically ill-conditioned.

Implied vols then get mapped to log-forward moneyness $k = \ln(K/F)$, which is the natural coordinate for the next step.

### Step 3: SVI parameterization

The raw IV grid is noisy and irregular, and you cannot just feed it into the Dupire formula. Direct numerical differentiation of noisy data produces garbage. The standard fix is to fit a smooth, well-behaved curve to the implied vols at each maturity slice. SVI (Stochastic Volatility Inspired, due to Gatheral) is the workhorse tool. For each maturity, total implied variance $w(k) = \sigma_{imp}^2 \, T$ is fit to

$$
w(k) = a + b \left\{ \rho(k - m) + \sqrt{(k - m)^2 + \sigma^2} \right\}.
$$

Five parameters per slice: level $a$, wing steepness $b$, skew $\rho$, shift $m$, curvature $\sigma$. The form is flexible enough to fit equity, FX, and rates smiles without modification, and it produces analytical derivatives, which matters for the Dupire step. The overall fit RMSE on the calibrated surface is 2.47% in implied vol.

### Step 4: No-arbitrage constraints

A smooth fit is not enough. The fitted surface has to be arbitrage-free, otherwise the Dupire formula can produce negative local variances, and the model will price exotic products at levels that admit risk-free profits.

Two static arbitrages have to be ruled out.

**Butterfly arbitrage.** A call price grid that is not convex in strike implies a negative risk-neutral density. I enforced this during calibration via the Gatheral-Jacquier slope bounds on the SVI parameters, which translate the convexity condition into hard constraints on $(a, b, \rho, m, \sigma)$.

**Calendar arbitrage.** Total variance must be non-decreasing in maturity at every log-moneyness. SVI fits are done slice-by-slice, so nothing in the per-slice fit enforces this across slices. I cleaned residual calendar arbitrage with an isotonic projection on the surface of total variance, with light clipping where needed.

### Step 5: The Dupire formula

With a clean, arbitrage-free implied-variance surface, Dupire gives the local variance directly:

$$
\sigma_{loc}^2(k, T) = \frac{\partial_T w}{1 - \frac{k}{w}\partial_k w + \frac{1}{4}\left(\frac{k^2}{w^2} - \frac{1}{w} - \frac{1}{4}\right)(\partial_k w)^2 + \frac{1}{2}\partial^2_{kk} w}.
$$

The derivatives are taken on the SVI-fitted surface, not on the raw quotes. The smoothing in Step 3 is doing all the work here. Direct numerical differentiation of a raw IV grid produces local variances that are dominated by noise, often negative, and the formula becomes useless. With SVI in front, the derivatives are analytical functions of the parameters and the Dupire formula is well-posed.

### Step 6: PDE pricer and Greeks

For pricing, I solve the local-volatility Black-Scholes PDE,

$$
\partial_t V + \frac{1}{2}\sigma_{loc}^2(S, t)\, S^2 \, \partial^2_{SS} V + (r-q) S\, \partial_S V - rV = 0,
$$

with the appropriate payoff at terminal time and standard boundary conditions (intrinsic value on the deep in-the-money side, approximately zero on the deep out-of-the-money side). Numerical setup:

- **Crank-Nicolson** in time. Second-order accurate, unconditionally stable, fast.
- **Log-moneyness grid** $x = \ln(K/F)$. More uniform than a raw strike grid, and concentrates points usefully across the relevant moneyness range.
- **Backward time stepping** from terminal payoff to today.
- Local vol $\sigma_{loc}(S, t)$ is interpolated from the calibrated SVI surface at each grid point.

Greeks come essentially for free. Delta and gamma are read off the PDE grid via finite differences in $S$. Theta comes from the time step. Vega is more subtle. A vega shift means perturbing the implied-vol surface, recomputing Dupire, and re-running the PDE. I used a parallel shift of the IV surface as the canonical vega bump.

## Results

Some headline numbers on the 2023 SPX surface:

- SVI implied-vol RMSE across the calibrated surface: **2.47%**.
- Average relative pricing error across maturities: **1.1% to 5.5%**, decreasing with maturity. The short end is where SVI struggles most, which matches the well-known difficulty of fitting steep short-dated skews with a five-parameter form.
- Grid convergence at $(N_x, N_t) = (601, 2000)$: price error 0.11, delta error 0.015, vega error 0.69, theta error 0.07. Vega and theta improve substantially as the grid is refined, which is what you would hope for.
- The full pipeline runs over 5,000+ contracts fast enough to fit inside a daily risk loop.

## What I'd extend

A few directions feel natural.

**Andreasen-Huge.** Their one-step calibration produces a local-vol surface directly from option prices, skipping the SVI intermediary. Structurally cleaner, no smoothing artifacts in the local vol, and worth implementing as a comparison.

**Forward-skew stress tests.** Local vol is known to under-price forward skew. The cleanest way to see this is to price cliquets or forward-starting options against the calibrated surface and compare to a Heston benchmark. Quantifying the gap is more instructive than reading about it.

**Crisis-regime calibration.** The 2023 surface is a low-vol regime. Recalibrating during something like the March 2020 COVID period would stress both the SVI fit and the calendar-arbitrage cleanup. A different beast entirely.

**Delta-hedging backtests.** The real test of any pricing model is whether the hedges actually work. Daily delta rebalancing against historical SPX paths, with PnL attribution, would be the right validation.

Code is on [GitHub](https://github.com/IceCurrent/local_volatility_model).

## References

Andreasen, J. and Huge, B. (2011). Volatility interpolation. *Risk*, March 2011, 86–89.

Dupire, B. (1994). Pricing with a smile. *Risk*, 7(1), 18–20.

Gatheral, J. (2004). A parsimonious arbitrage-free implied volatility parameterization with application to the valuation of volatility derivatives. Presentation at Global Derivatives & Risk Management, Madrid.

Gatheral, J. and Jacquier, A. (2014). Arbitrage-free SVI volatility surfaces. *Quantitative Finance*, 14(1), 59–71.