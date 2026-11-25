# Unslop notes

Pass made with the unslop skill by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0.

## Audit (first build)

Level: light. The template was built with the skill's rules in mind (neutral surfaces, numbers-only stat cards, one main chart, sentence case, 400 and 500 weights, no gradients, glows, emoji or badges), so the signs were in the details.

- Revenue chart: midpoint curves made a running total wobble and look like noise; the axis maximum jumped to $40k for $12k of data
- Products table: the stock number turned amber whenever one glaze was low, even with 33 pieces on the shelf, so the color sat on the wrong thing
- Two primary button fills: ink on Overview, celadon on the order and product pages
- Product thumbnails: Ash white pieces faded into their tile, and open shapes had no rim, so mugs and bowls read as flat silhouettes
- Phone widths: horizontal scroll at 390px (tables inside grid items without `min-width: 0`, screen-reader labels escaping their scroll areas), and order line items squeezed into four columns at 360px
- The chart's screen-reader table stretched the Overview page about 340px below its content
- Trailing periods on short empty states ("No products match.")

## Direction

- Product: the back office of Kilnhouse Ceramics, a small studio selling wheel-thrown mugs, bowls, plates and vases online
- Character: tidy, unhurried, hands-on
- World: the studio's packing table: glaze test tiles, raw clay, brown paper and shipping labels
- Moments: the pieces themselves, drawn in code in their glazes with the unglazed clay foot showing; the month's running revenue against last month
- Signature: a glaze swatch dot beside every variant, in the product table, order lines, low-stock list and the product preview

## Passes

- Spacing: tables, rows and cards on one 4px rhythm; line items now two columns (piece, then amount with unit price under it) so they hold at 360px
- Color: near-neutral grey ramp with the faintest warmth; celadon only for the chart line, the top best seller, active tab and selection; one ink primary button everywhere; stock color only on the note ("1 glaze low"), never on the count
- Icons: lucide at 16px, stroke 1.5, in the secondary text color
- Copy: page title names the period ("November 2026"), changes say what they compare to ("vs Oct 1 to 25"), no trailing periods on short strings
- Type: DM Sans for the interface, Fraunces only for page titles; tabular figures and one money format ($0.00) across every table
- Layout: light sidebar 256 wide with grouped nav and counts, content capped at 1440; grid children get `min-width: 0` so tables scroll inside their card
- Details: chart redrawn as a monotone curve with round grid steps ($3k), muted labels, dashed last month; pots gained rims, a hairline outline and a soil top on the planter
- Visuals: no images; the product drawings are the moment
- Motion: one short fade and rise per page; hover is a color step, press a 0.98 scale

## Screenshots

- screenshot-2: Orders table with status tabs and counts
- screenshot-3: Order detail for an unfulfilled order, with line items, totals and the customer
