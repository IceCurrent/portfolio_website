---
title: "American Options Pricing under the Volterra-Heston Model"
slug: "volterra-heston-model"
date: "2025-03-01"
dateRange: "Aug 2024 – Mar 2025"
summary: "An end-to-end options pricer built on the Volterra-Heston (rough Heston) model. Calibrated to SPX market data, with American option pricing via the lifted approximation of Chevalier, Pulido and Zúñiga (2021) and Longstaff-Schwartz regression."
heroImageAlt: "Diagram of implied volatility surface produced by the Volterra-Heston model"
github: "https://github.com/IceCurrent/volterra_heston_model"
tags: ["Stochastic Volatility", "Rough Volatility", "Monte Carlo", "American Options"]
---

This project is an end-to-end options pricing framework built on the Volterra-Heston model. I calibrated it to SPX options data and priced American options using a numerical technique from Chevalier, Pulido and Zúñiga (2021).

The motivation is straightforward. Classical pricing models miss the shape of the SPX smile at short maturities, and the Volterra-Heston model fixes that. The cost is a much harder pricing problem, and the rest of this writeup is about the machinery that makes it work.

## How options actually get priced

A standard pricing pipeline has three steps.

First, pick a model for the dynamics of the underlying and its volatility. Black-Scholes, Heston, SABR, local vol are the usual choices.

Second, calibrate it to the market. Find the parameters that make the model reproduce today's prices of liquid vanilla options as closely as possible. After calibration the model is consistent with what is already trading.

Third, use the calibrated model to price what isn't quoted. Exotics, American-style products, path-dependent payoffs. The same model also gives you hedge ratios.

Most of the engineering effort goes into step two. The optimizer evaluates European option prices thousands of times during calibration as it searches the parameter space, so the European pricer has to be fast and stable. The classical Heston model has been the workhorse for two decades because it gives semi-closed-form European prices via Fourier inversion, and it captures the broad shape of the equity vol surface reasonably well.

## Where classical Heston falls short

The model works across most of the surface, but it struggles in one corner that matters a lot in practice: short-dated options.

Two empirical facts about SPX cause the trouble. The first is the shape of the skew near expiry. The at-the-money skew decays with maturity as a power law of roughly $T^{H-1/2}$, with a small Hurst exponent $H \approx 0.1$. As maturity shrinks, the skew gets sharply steeper. Classical Heston is driven by ordinary Brownian motion, which corresponds to $H = 1/2$, and produces a skew that flattens too fast as $T$ goes to zero. Weekly and daily options look much steeper than the model predicts, no matter how you choose the parameters.

The second is microstructural. Realized log-volatility measured at high frequency behaves like a rough process. Its sample paths are far less regular than standard Brownian motion. Classical Heston's variance is too smooth to match this. You can hide one symptom by stretching parameters, but you break another part of the smile in the process. The model just doesn't have enough memory in its volatility dynamics.

## The Volterra-Heston model

Volterra-Heston fixes both problems at once. Variance is still mean-reverting and still driven by a stochastic shock, but the shock is propagated through a fractional kernel of the form $K(t-s) \sim (t-s)^{H-1/2}$ instead of being absorbed instantly. Old shocks fade slowly, recent shocks dominate, and the variance process picks up the kind of long-memory, rough behavior that empirical log-volatility exhibits. The at-the-money skew it produces follows the right power law into the short end.

The downside is severe. Because the kernel mixes all past shocks into the current state, the variance is non-Markovian. The future does not depend only on the current variance level, it depends on the entire history of shocks that led to it. This breaks every standard pricing tool. PDE methods need a finite-dimensional state, so they do not apply. Trees and lattices need the Markov property, so they do not apply either. Monte Carlo technically works, but a naive simulation has to integrate against the full path history at every step, and cost grows quadratically in the number of timesteps.

## The structure that saves us

The model has one redeeming property that makes everything else possible: it is affine. Even though variance is non-Markovian, the characteristic function of the log-price (the Fourier transform of its distribution) can be written in closed form, up to the solution of a deterministic integral equation called a Volterra-Riccati equation. This generalizes the Riccati ODE that drives the classical Heston characteristic function.

What this means in practice is that European prices are computable without simulating any paths. Solve the equation for the characteristic function, invert via Fourier, get a strip of prices across strikes.

For the inversion I use the Carr-Madan FFT method. The raw call price is not integrable across strikes, so you first dampen it by an exponential factor in log-strike, then take the Fourier transform of the dampened payoff against the characteristic function. One FFT recovers the full grid of prices in strike. The output is a grid of European prices, or after Black-Scholes inversion, a grid of implied vols. Fast enough to sit inside a calibration loop.

## Calibrating to the SPX surface

With fast European pricing in place, calibration is straightforward in structure if not in practice.

1. Pull the SPX implied vol surface and build a target IV grid on (strike, maturity).
2. For a candidate parameter set, run the full pipeline: Volterra-Riccati, then characteristic function, then Carr-Madan FFT, then Black-Scholes inversion. Output is a model IV grid.
3. Score the candidate by a vega-weighted RMSE between model and market IVs. Vega weighting concentrates the fit where IV matters most for prices and naturally down-weights the deep wings, where IV inversion is numerically delicate.
4. Optimize. I use a two-phase approach: differential evolution for the global search over a non-convex landscape, then Levenberg-Marquardt for local refinement.

The output is a calibrated parameter set: Hurst exponent $H$, vol-of-vol, mean reversion speed, long-run variance, spot variance, and spot-vol correlation. The model is now consistent with the vanilla market and ready to price.

## Pricing American options

The hard part starts here. For American options, Fourier methods are not enough.

Early exercise depends on the joint distribution of the state at every future date. At each potential exercise date you need to compare the immediate exercise payoff to the conditional expected value of holding. The characteristic function only encodes the terminal distribution, so it cannot answer this question. You have to simulate paths and compute conditional expectations along them.

But simulation is exactly where non-Markovianity hurts. Carrying the full path history at every step is computationally crippling.

## Lifting the kernel

Chevalier, Pulido and Zúñiga (2021) solve this. Their idea is to approximate the fractional kernel as a sum of exponentials,

$$
K(t) \approx \sum_{i=1}^{N} c_i \, e^{-\gamma_i t}.
$$

Each exponential mode corresponds to an Ornstein-Uhlenbeck-like factor that is Markovian on its own. The original non-Markovian variance is replaced by a sum of these factors, $V_t = \sum_i V_t^{(i)}$, and the joint vector $(V_t^{(1)}, \ldots, V_t^{(N)})$ is Markovian on the lifted state space. The cost is dimensionality. Instead of one variance you carry $N$ factors. The gain is that per-step cost is now constant in time, and the full toolkit of Markovian Monte Carlo applies.

The important result in the paper is that American option prices computed on the lifted model converge to the true Volterra-Heston American prices as $N$ grows. That is what makes the approximation rigorous rather than ad-hoc. There is explicit theoretical control on the error for the American problem specifically, not only for European pricing where the affine structure already gave us a fast pricer.

In practice, $N$ between five and ten exponential modes captures the fractional kernel well across the maturity range relevant for SPX.

## Longstaff-Schwartz on the lifted state

With Markovian dynamics in hand, I apply the Longstaff-Schwartz algorithm:

1. Simulate paths of the lifted state forward under the calibrated dynamics.
2. Walk backward in time. At each exercise date, regress the discounted realized future payoff (the value of holding) on basis functions of the current state.
3. The regression gives an estimate of the conditional expected continuation value. Compare it to the immediate exercise payoff. The optimal policy is to exercise when intrinsic dominates continuation.
4. Roll back to time zero and take the sample mean of cashflows under the resulting exercise policy.

A few implementation choices that mattered:

- Full-truncation Euler discretization on the variance factors, to handle the square-root singularity at zero variance without producing negative draws.
- Degree-three Laguerre polynomials in the variance factors and the log-underlying as the regression basis. Standard choice, sufficient here.
- Bisection at the wings when inverting Black-Scholes to implied vol, since Newton's method is unstable in the deep out-of-the-money region where vega is small.

## Validation

The pricer was checked along three axes. Put-call parity holds within Monte Carlo noise across the strike and maturity grid. No-arbitrage bounds on European prices hold outside MC error. Convergence sweeps over the number of exponential factors $N$, the number of timesteps, and the number of paths produce stable error bands consistent with $1/\sqrt{N}$ Monte Carlo scaling.

The at-the-money skew of the resulting implied vol surface decays at the expected power-law rate in maturity, which is the qualitative signature that motivated using a rough-volatility model in the first place.

## What I'd extend

Tighter error bounds on the lifting, written as a joint function of $N$ and the kernel-fitting metric, would help trade speed against accuracy more deliberately. On the calibration side, replacing the cubic-spline IV surface with an SVI parameterization and GPU-parallelizing the Volterra-Riccati solves would cut the current end-to-end runtime significantly. On the product side, multi-asset American payoffs like basket and max-call options, and American exotics with path-dependent exercise boundaries, are the obvious next steps.

Code is on [GitHub](https://github.com/IceCurrent/volterra_heston_model).

## References

Abi Jaber, E., Larsson, M., and Pulido, S. (2019). Affine Volterra processes. *Annals of Applied Probability*, 29(5), 3155–3200.

Carr, P. and Madan, D. (1999). Option valuation using the fast Fourier transform. *Journal of Computational Finance*, 2(4), 61–73.

Chevalier, E., Pulido, S., and Zúñiga, E. (2021). American options in the Volterra Heston model. HAL preprint hal-03178306. [https://hal.science/hal-03178306](https://hal.science/hal-03178306)

El Euch, O. and Rosenbaum, M. (2019). The characteristic function of rough Heston models. *Mathematical Finance*, 29(1), 3–38.

Gatheral, J., Jaisson, T., and Rosenbaum, M. (2018). Volatility is rough. *Quantitative Finance*, 18(6), 933–949.

Heston, S. L. (1993). A closed-form solution for options with stochastic volatility with applications to bond and currency options. *Review of Financial Studies*, 6(2), 327–343.

Longstaff, F. A. and Schwartz, E. S. (2001). Valuing American options by simulation: a simple least-squares approach. *Review of Financial Studies*, 14(1), 113–147.