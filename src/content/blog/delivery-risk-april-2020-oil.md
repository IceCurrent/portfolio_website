---
title: "Delivery Risk in Futures Contracts"
slug: "delivery-risk-april-2020-oil"
date: "2026-04-22"
summary: "In April 2020, the NYMEX May WTI futures contract settled at -$37.63 per barrel — the first negative settlement in WTI's history. A walk through the delivery mechanics, the Cushing storage crunch, and the role of passive ETF flows in pushing the contract through zero."
tags: ["Derivatives", "Futures Markets", "Market Microstructure"]
draft: false
---

In April 2020, the NYMEX May 2020 WTI crude oil futures contract (ticker CLM20) produced one of the most dramatic dislocations ever observed in a major derivatives market. On April 20, the contract settled at **−$37.63 per barrel**, marking the first negative settlement price in the history of the WTI benchmark.[^1] What initially appears to be an extraordinary anomaly in commodity markets becomes easier to understand once the mechanics of physical delivery are taken seriously. The episode provides a clear illustration of how delivery risk in physically settled futures contracts can dominate market outcomes when financial participants approach expiration without the operational capacity to take delivery.

## The supply-demand backdrop

The backdrop was a historic collapse in oil demand caused by the COVID-19 pandemic. Global travel restrictions and lockdowns sharply reduced transportation fuel consumption, while oil production remained elevated in early 2020 following a breakdown in coordination among major producing countries in March. U.S. refinery inputs fell to roughly 13 million barrels per day by mid-April, approximately 24% below the level observed one year earlier.[^2] The resulting supply imbalance caused crude inventories to rise rapidly across the United States.

## Storage at Cushing

The delivery point for NYMEX WTI futures is Cushing, Oklahoma, a major storage and pipeline hub in the U.S. crude oil network. As the supply surplus grew, available storage capacity at Cushing tightened significantly. By mid-April 2020, approximately 76% of the hub's working storage capacity of roughly 76 million barrels was already filled.[^2] In practice, much of the remaining capacity was either leased or operationally constrained. This meant that traders holding long futures positions close to expiration faced a real logistical problem: unless they exited their contracts, they could be obligated to take delivery of physical crude oil with no available storage.

## Expiration mechanics

The May 2020 contract was scheduled to expire on April 21, leaving April 20 as the final full trading day. By that point, most market participants who did not intend to take delivery had already rolled their positions into later contracts. Open interest had fallen dramatically from approximately 635,000 contracts in early April to about 108,000 contracts by April 20.[^1] However, even this residual open interest represented a substantial quantity of crude oil that would need to be delivered if positions were not closed.

The price action on April 20 illustrates how delivery constraints can dominate market dynamics near expiration. The May contract had settled at $18.27 per barrel on April 17. During trading on April 20, the price initially declined gradually before collapsing during the afternoon session. The contract reached an intraday low of −$40.32 per barrel shortly before the settlement window and ultimately settled at −$37.63 per barrel.[^1]

At the same time, later-dated contracts remained positive. The June 2020 WTI futures contract settled at $20.43 per barrel on the same day.[^2] The resulting May–June spread widened dramatically, reaching roughly **−$58 per barrel** by settlement. This extreme contango reflected the market's valuation of immediate storage constraints: crude oil deliverable in May effectively carried a large negative convenience value relative to oil deliverable one month later.

## Passive flows and the roll

An important structural factor behind the dislocation was the presence of large passive financial participants. Commodity index funds and exchange-traded products obtain oil exposure through rolling futures contracts rather than taking delivery. These vehicles typically follow predetermined roll schedules that shift exposure from the expiring contract into the next maturity. In March and early April 2020, investor inflows into oil exchange-traded funds increased sharply as retail investors attempted to buy the decline in crude prices. Research by the Bank for International Settlements documents that inflows into oil ETFs surged in late March and early April, placing additional pressure on futures markets during the roll process.[^3]

## A note

I first came across this episode while listening to a finance podcast and ended up digging deeper to understand the delivery mechanics embedded in futures contracts. In my coursework, futures have mostly been discussed from a financial perspective, often focusing on pricing, hedging, and cash-settled contracts. The logistical side of physically settled futures — storage capacity, transportation constraints, operational considerations — was something I had not previously thought about in detail. That realization reminded me of advice from a guest speaker in my FIM 601 class, who emphasized the value of actively listening to finance podcasts as a way to encounter real market situations beyond the classroom. This incident stood out as a good example of that, and it ultimately motivated me to write this piece.

[^1]: U.S. Commodity Futures Trading Commission. *Interim Staff Report: Trading in NYMEX WTI Crude Oil Futures Contract Leading to the Negative Settlement Price on April 20, 2020*. CFTC, 2020.
[^2]: U.S. Energy Information Administration. "Why did WTI crude oil futures prices turn negative?" *Today in Energy*, April 2020.
[^3]: Bank for International Settlements. "The Oil Market Turmoil of April 2020." *BIS Quarterly Review*, 2021.
