# Historic Auctions

## New Zealand 1990

In 1990, New Zealand conducted an auction to sell licenses to use radio spectrum. As auction format, a sort of simultaneous second-price auction was chosen. Assuming that the licenses are all identical (thus, perfect substitutes), an extension of the single-item second-price auction could be to let the bidders with the highest bid win an item each, paying the price of the next-hightest bid.

However, here, it was chosen to let bidders place a bid on each individual item. Only in a very specific case, this would be a rule that leads to an efficient outcome: If the goods are completely independent, neither substitutes nor complements. This is probably never the case in a spectrum auction, so this choice put the bidders in a difficult situation, forcing them to speculate on the other bidder's behavior. As Milgrom (2004) put it:

> Should a bidder bid for only one license? If so, which one? If everyone else plans to bid for just one license and picks randomly, perhaps there will be some license that attracts no bids. Bidding a small amount for every license might then be a good strategy. On the other hand, if many spread around small bids like that, then bidding a moderate amount for a single license would have a high chance of success. When the values are so interdependent, unlinked, independent auctions inevitably involve guesswork that gets in the way of an efficient allocation.

As a result of this choice, the outcome of the New Zealand spectrum auction of 1990 had some problematic features:

- Bidders paid prices far below their bids. One extreme case is that a bidder who bid NZ$100,000 only paid the second-highest bid of NZ$6 for a license.

- The revenue ended up being much less than the New Zealand government expected (NZ$36 million vs. NZ$240 million)

---

Sources:

1. Milgrom, Paul, and Paul Robert Milgrom. _Putting auction theory to work_. Cambridge University Press, 2004.\
   See <http://www.eecs.harvard.edu/~parkes/cs700/patw.pdf>

2. McMillan, John. "Selling spectrum rights." _Journal of Economic Perspectives_ 8.3 (1994): 145-162.\
   See <https://pubs.aeaweb.org/doi/pdfplus/10.1257/jep.8.3.145>

## Switzerland 2000 (March)

The Swiss Wireless Local Loop (WLL) auction for licenses to use radio spectrum in March 2000 is an example of a sequential second-price auction auction\*. In total, there were three nation-wide licenses and five regional licenses per region (in 9 regions) auctioned off. To showcase the auction format's weak points, it's sufficient to look at the outcome related to the three national licenses.

The [Results](https://www.newsd.admin.ch/newsd/message/attachments/1712.pdf) show that the supposedly most valuable license (56MHz block in the 26GHz frequency band, nation-wide) had a reserve price of CHF 8.2 million, which is CHF 1.35 million higher than the reserve price of the other nation-wide licenses (28MHz block in the 3.4GHz frequency band).
In practice, the 3.4GHz licenses were auctioned off first in this sequential auction, followed by the 26Ghz license. As the results show, the first two licenses were auctioned off at a much higher price than the supposedly most valuable 26GHz license.

This could show a typical drawback of a sequential auction: It is very difficult for a bidder to find the optimal strategy, because she has to make assumptions about the next auctions' prices. Cramton (2002) formulates the consequences as follows:

> Bidders are likely to regret having purchased early at high prices, or not having purchased early at low prices. The guesswork about future auction outcomes makes strategies in sequential auctions complex, and the outcomes less efficient.

This is most likely part of the reason why the largest license was priced much less than the two smaller licenses. However, a particular activity rule in the auction that was imposed by the auctioneer may play an important role as well. As stated in the [press release](https://www.admin.ch/gov/de/start/dokumentation/medienmitteilungen.msg-id-6350.html), the winner of the nation-wide 26GHz license would be limited to bid on the 28MHz regional licenses only (i.e., she would not be permitted to bid on the regional 56MHz or 112MHz licenses). This made the 3.4 GHz licenses (relatively) more attractive, and the nation-wide 26GHz licenses (relatively) less attractive. Indeed, both winners of the first two licenses went on to win multiple 56MHz licenses in the individual regions. Thus, this activity rule could very well be an explanation for the higher prices on the first two licenses.

\* _To be precise, Switzerland was conducting sequential ascending price auctions. However, a second-price auction has very similar properties and is easier to demonstrate, thus serves our purpose better._

---

Sources:

- Results (German): <https://www.newsd.admin.ch/newsd/message/attachments/1712.pdf>)
- Press release (German): <https://www.admin.ch/gov/de/start/dokumentation/medienmitteilungen.msg-id-6350.html>
- Cramton, Peter. "Spectrum auctions." _Handbook of telecommunications economics_ 1 (2002): 605-639.\
  See <http://www.cramton.umd.edu/papers2000-2004/01hte-spectrum-auctions.pdf>

## Switzerland 2000 (December)

The Swiss auction for UMTS licenses in December 2000 is an example for a so-called "bidder meltdown". This happens when _n_ bidders are each interested in one license are bidding on _n_ licenses and the auction format allows a certain coordination among the bidder on who gets what.

The auction format in this auction was a simultaneous ascending price auction, which does indeed allow a certain coordination among the bidders. Knowing that, bidders that presume they would fail against the more powerful bidders could retreating already in advance, leaving only the four most powerful bidders in the auction.

This is exactly what happened in the UMTS auction in Switzerland in 2000. The number of bidders shrank from initially 10 to four, and four licenses were auctioned off in total. As a consequence, each bidder only paid the (in the Swiss case way too low) reserve price, which results in a very low revenue (namely one-fiftieth of what the Swiss government had once hoped for). The efficiency is not harmed by this particular phenomenon.

The following table from Wolfstetter (2001) puts this into perspective with other UMTS auctions in the 2000:

![Bidder Meltdown Table (Wolfstetter (2001))](media/bidder-meltdown.png ':size=500')

---

Sources:

- Wolfstetter, Elmar. "The Swiss UMTS spectrum auction flop: Bad luck or bad design?." (2001).\
  See: <https://edoc.hu-berlin.de/bitstream/handle/18452/4327/50.pdf>
- Klemperer, Paul. "How (not) to run auctions: The European 3G telecom auctions." _European Economic Review_ 46.4-5 (2002): 829-845.\
  See <http://www.nuffield.ox.ac.uk/Economics/papers/2002/w5/runauction.pdf>

## Notes --- TODO: delete once clarified

These explanations may "give away" some of the story. We may want to think about having a "general FAQ" which is available to all users all the time. And a "after you've run it, debrief" which describes what you should have taken away from the experience after you've had it. This is also something for students to review later when they are going back over course materials for them to remember what it is they have done. We might want to think a little bit about how we could split things up this way, what we would want in each, and what format we want to deliver the debrief in. One thought is we might want to integrate into something like Bridge sooner rather than later, so we could deliver "debrief" material following the experience using that platform. (though of course there are lots of other ways to achieve this goal). Something to think through. --> Need to discuss this on one of the next calls with Ben!
