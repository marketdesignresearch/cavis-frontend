# Auction Setup

When you start creating an auction, you can choose between many different combinations of auction types and domains, of which each can have some more customization options.
This section explains the different auction types & domains and the respective parameters that can be chosen.

## Auction Types

### Single-Item Auction

The most simple case CAVis covers is the single item auction: Multiple bidders have some value for an item, they submit a bid, and the bidder with the highest bid wins. There are two types of payment rules implemented:

- **First Price Rule**: The winner pays the own bid. Playing truthfully (i.e., submitting a bid equal to the private value), is not a dominant strategy, because the payoff is always zero - normally, the bidders would bid some amount below their private value.
- **Second Price Rule**: The winner pays the second-highest bid. Here, truthful bidding is actually a dominant strategy. A single-item auction that follows this payment rule is also called a _Vickrey auction_.

### Sequential Multi-Item Auction

We call a Sequential Auction an auction on multiple items, the items are auctioned off one by one. It is therefore a multi-round auction with $n$ rounds, where $n$ is the number of items. Normally, the bidders know about the last round's allocations and may adapt their strategies over time.

In CAVis, you can explore the bidder's values in the same way as in combinatorial auctions with multiple items, but each bidder will only be allowed to place a bid on a specific item per round. This item is visually emphasized in the UI.

The same payment rules as in the single-item auction can be chosen. They will be applied per round and aggregated in the end, since the rounds can be considered as individual auctions.

One historic example of a Sequential Auction is described took place in [New Zealand in 1990](historic-auctions?id=new-zealand-1990).

### Simultaneous Multi-Item Auction

In a Simultaneous Auction, bidders submit all their bids in one round, but are only allowed to bid on single items (i.e., package bids are not allowed). In terms of outcome rules, this is equivalent to the Sequential Auction, but the bidders have no way to adapt their strategy over time.

Again, in CAVis you can explore the auction setting like in a combinatorial auction, but bidders are only allowed to place bids on single items. And as before, on the collected bids, the first-price or second-price payment rule can be applied.

Two examples of historical Simultaneous Auctions happened in [March](historic-auctions?id=switzerland-2000-march) and [December](historic-auctions?id=switzerland-2000-december) 2000 in Switzerland.

### VCG Auction

The VCG Auction is the first combinatorial auction in the list here. Thus, bidding on bundles is allowed, and it happens in a single-round, sealed-bid manner.

Who gets what (the allocation rule) can be more complex to determine, as it requires a mixed integer program (MIP) to be solved. Let $X$ be the set of all possible allocations, with reported values of all bidders $N$ for these allocations. Then the optimal (i.e., efficiency-maximizing) allocation the following:

$$
x^{*}(\hat{v}) = \arg\max_{x \in X} \sum_{i \in N} \hat{v}_i(x) .
$$

Each winner then pays an amount that represents the externality that is imposed on the other bidders by bidder $i$ (in other words: what did the others miss because bidder $i$ was present in this auction?). Formally:

$$
p_i(\hat{v}) = \sum_{j \neq i} \hat{v}_j(a^{-i}) - \sum_{j \neq i} \hat{v}_j(a^*) ,
$$

where $a^{-i}$ represents the efficient allocation if bidder $i$ would not be present.

In CAVis, all the collected bids are considered as XOR bids. This allows us the representation of arbitrary sub-additive value functions. The equations above in the world of XOR bids translates to a simple XOR Winner Determination Problem (WDP) as an allocation rule. For the payment rule, $a^{-i}$ is the optimal solution of this WDP with all the bids of bidder $i$ removed.

### Combinatorial Clock Auction (CCA)

The CCA is an auction format proposed by [Cramton in 2013](http://www.cramton.umd.edu/papers2005-2009/cramton-spectrum-auction-design.pdf) that has grown in popularity in the last years for large-scale auctions like spectrum auctions. Details can be found in the original publication, but we summarize the core concepts that are relevant for CAVis here.

CCA is a multi-round auction that has (at least) two phases: A clock phase and a supplementary phase. The clock phase serves mainly as a price discovery process while at the same time some (hopefully useful) bids are collected from the bidder. The supplementary phase gives the bidders the opportunity to submit some additional bids to express some preferences that have not been collected in the clock phase.
Finally, the complete collection of bids from all the rounds form the basis to determine the allocation (as in the VCG auction) and the payment (given some payment rule).

The **clock phase** starts off with some starting prices prices (zero, or given by the auctioneer). In CAVis, we're only considering linear prices, which means that the price for a bundle is equal to the sum of the individual item's prices that are contained in the bundle. The auctioneer asks each bidder, what bundle he/she would pick given these prices. This bundle, priced at the current prices, is collected as a bid.
The auctioneer then calculates, for each item, the over-demand in this round: How many times more has each item been demanded than it is available? Depending on this over-demand, the auctioneer raises the prices of the items for the next round according to a price update rule that can be arbitrarily complex. In CAVis, we're offering a simple relative price update:  
_If a good is over-demanded, raise the price by $X\%$_ (and in case the price is zero and thus a relative update does not do anything, increment by $Y$). $X$ and $Y$ can be defined by the user.  
In the next round, the auctioneer asks again for the best bundle given the updated prices, and the process repeats itself. The stop criterion can, like the price update rule, vary; In CAVis (and often in practice), the clock phase ends once there is no more over-demand (and thus the prices would not change anymore in our case).

The **supplementary phase** (or often called _supplementary round_, because it is only consisting of one round) gives the bidders the chance to submit up to $Z$ additional bids, where $Z$ can again be defined by the user in CAVis. In practice, there are normally rather strict _activity rules_ that impose constraints on these additional bids (e.g., not higher than 1.2x times the highest bid from the clock phase) to encourage truthful behavior in the clock phase. If such rules are not in place, it can be a profitable strategy for a bidder to be very passive in the clock phase and then submitting game-changing bids in the supplementary round.  
In the current state, CAVis does not contain such activity rules, so the bidders are free to bid any amount on any bundle in the single supplementary round. Following a truthful strategy by default, a bidder would therefore bid the true value on the profit-maximizing $Z$ bundles given the last round's prices.

Apart from the usual settings, if you select CCA in the auction setup, you will have some more parameters which you can set:

| Parameter                              | Description                                                                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| # of Supplementary Bids                | The $Z$ in the above explanation. Default is `10`.                                                                                 |
| Price Updates                          | The $X$ in the above explanation. Default is `0.1`.                                                                                |
| Initial Price Update if Price equals 0 | The $Y$ in the above explanation. Default is `1`.                                                                                  |
| Payment Rule                           | Which payment rule to use to determine the payments. Possible choices: <ul><li>`VCG`<li>`CCG`</ul> Default is `VCG`.               |
| Maximum number of rounds               | A hard limit on the maximum number of rounds in the clock phase. After, even if there is still over-demand, the clock-phase stops. |

### PVM Auction

[TBD]

## Domains

### Additive Value Domain

An additive value domain consists bidders that have additive values: The total value for a bundle is always the sum of the individual item's values contained in the bundle. Thus, for none of the bidders, there are no complements or substitutes among the items. For bidder $i$ and a bundle $B$ representing a set of individual items, value $v(B)$ is the following:

$$
v(B) = \sum_{m \in B} v(m).
$$

You can set a range for the bidder's values for the items; the actual value will be drawn from a uniform distribution within this range.

### Unit-Demand Value Domain

This is an example of an extremely sub-additive domain, which makes most sense if thought about as a domain where some identical goods are auctioned off that are perfect substitutes. Each bidder wants exactly one item and values this case with $U$ and has zero value for additional items, but it does not matter which item. If a bidder wins nothing, the value is zero:

$$
v(B) =
\begin{cases}
    0 & \quad\text{if } B = \emptyset, \\
    U & \quad\text{else}. \\
\end{cases}
$$

You can set a range for the bidder's value $U$.

### Local-Local-Global (LLG) Domain

This is a simple preset for a domain consisting of two items, two local bidders (each interested in one of the items) and a global bidder (interested in only the two items). In a VCG auction, depending on the value of the global bidder for the two items, this domain is known for showing a particular case where the VCG price is not in the core.

You can set whether you want this domain produce an interesting case or not. Interesting means that the global bidder's value for the two items is in between the higher local-bidder-value and the sum of both local bidder's values. In that case, the total payment of the local bidders (who will win the auction) will end up being less than the global bidder's value for both items.

### Synergy Domain

This is a general domain to introduce synergy in the bidders' value functions. A positive synergy means that for this bidder, the goods in the bundle are complements. A negative synergy represents substitutes. If the synergy is "neutral" (`0` in our case), we'd end up in an additive value domain (though if that's your goal, please use the native additive value domain, since its implementation is much more computationally efficient). The special parameter to set here is the Synergy Factor $s$, who influences the bonus / penalty on the additive valuation for larger bundles. For example, if the synergy is set to `0.2`, a bundle of size 2 would give a 20% bonus on the additive valuation, a bundle of size 3 40%, etc. Formally, this results in the following value function:

$$
v(B) = s \cdot (size(B) - 1) \cdot \sum_{m \in B} v(m).
$$

### SATS-Domains

[TBD]

#### Global Synergy Value Model (GSVM)

[TBD]

#### Local Synergy Value Model (LSVM)

[TBD]
