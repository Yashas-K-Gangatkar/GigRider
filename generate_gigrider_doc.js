const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  TableOfContents,
} = require("docx");
const fs = require("fs");

// ── Palette: IG-1 Ink Gold (finance, investment, premium — matches Old Money aesthetic) ──
const P = {
  primary: "1A1A1A",
  body: "2A2A2A",
  secondary: "6E6560",
  accent: "C9A84C",
  surface: "FBF9F7",
  cover: {
    titleColor: "FFFFFF",
    subtitleColor: "B0B8C0",
    metaColor: "90989F",
    footerColor: "687078",
  },
  table: {
    headerBg: "C9A84C",
    headerText: "1A1A1A",
    accentLine: "C9A84C",
    innerLine: "DDD5C0",
    surface: "F5F2E8",
  },
};

const coverBg = "1A1A1A";

// Helper
const c = (hex) => hex.replace("#", "");

// ── No-borders constant for cover wrapper ──
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// ── Component builders ──
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, color: P.primary })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, color: P.primary })],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 24, color: P.primary })],
  });
}

function bodyPara(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 0 },
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, color: P.body, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } })],
  });
}

function bodyBold(label, text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 80 },
    children: [
      new TextRun({ text: label, bold: true, size: 24, color: P.primary, font: { ascii: "Times New Roman", eastAsia: "SimHei" } }),
      new TextRun({ text, size: 24, color: P.body, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } }),
    ],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 60 }, children: [] });
}

// ── Table builder ──
function makeTable(headers, rows, colWidths) {
  const totalWidth = colWidths || headers.map(() => Math.floor(100 / headers.length));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: P.table.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: P.table.accentLine },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: P.table.innerLine },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: headers.map((h, i) =>
          new TableCell({
            width: { size: totalWidth[i], type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: P.table.headerBg },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 21, color: P.table.headerText, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })] })],
          })
        ),
      }),
      ...rows.map((row, rowIdx) =>
        new TableRow({
          cantSplit: true,
          children: row.map((cell, i) =>
            new TableCell({
              width: { size: totalWidth[i], type: WidthType.PERCENTAGE },
              shading: rowIdx % 2 === 0 ? { type: ShadingType.CLEAR, fill: P.table.surface } : { type: ShadingType.CLEAR, fill: "FFFFFF" },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: cell, size: 21, color: P.body, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } })] })],
            })
          ),
        })
      ),
    ],
  });
}

// ── Cover (R1: Pure Paragraph Left, Ink Gold palette) ──
function buildCover() {
  const title = "GigRider";
  const subtitle = "Revenue Model & Pitch Preparation Document";
  const metaLines = [
    "Prepared for: Investor Presentation",
    "Date: April 2026",
    "Classification: Confidential",
  ];

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: allNoBorders,
      rows: [
        new TableRow({
          height: { value: 16838, rule: "exact" },
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: coverBg },
              verticalAlign: "top",
              borders: allNoBorders,
              children: [
                // Gold accent line at top
                new Paragraph({
                  spacing: { before: 3600 },
                  indent: { left: 1200, right: 6000 },
                  border: { top: { style: BorderStyle.SINGLE, size: 18, color: P.accent, space: 20 } },
                  children: [],
                }),
                // Title
                new Paragraph({
                  spacing: { before: 400, line: 920, lineRule: "atLeast" },
                  indent: { left: 1200 },
                  children: [
                    new TextRun({ text: title, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 80, bold: true, color: P.cover.titleColor }),
                  ],
                }),
                // Subtitle
                new Paragraph({
                  spacing: { before: 200, line: 600, lineRule: "atLeast" },
                  indent: { left: 1200 },
                  children: [
                    new TextRun({ text: subtitle, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" }, size: 28, color: P.cover.subtitleColor }),
                  ],
                }),
                // Gold accent line after subtitle
                new Paragraph({
                  spacing: { before: 400 },
                  indent: { left: 1200, right: 4000 },
                  border: { top: { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 12 } },
                  children: [],
                }),
                // Meta lines
                ...metaLines.map((line, idx) =>
                  new Paragraph({
                    spacing: { before: idx === 0 ? 600 : 80 },
                    indent: { left: 1200 },
                    children: [
                      new TextRun({ text: line, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" }, size: 20, color: P.cover.metaColor }),
                    ],
                  })
                ),
              ],
            }),
          ],
        }),
      ],
    }),
  ];
}

// ── TOC section ──
function buildTOC() {
  return [
    new Paragraph({
      spacing: { before: 200, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Table of Contents", font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, bold: true, color: P.primary })],
    }),
    new TableOfContents("TOC", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    new Paragraph({
      spacing: { before: 100 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Right-click the Table of Contents and select \u201cUpdate Field\u201d to refresh page numbers.", italics: true, size: 18, color: "999999", font: { ascii: "Times New Roman" } }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ── Body content ──
function buildBody() {
  const children = [];

  // =============================================
  // PART I: REVENUE MODEL
  // =============================================
  children.push(heading1("Part I: Revenue Model"));
  children.push(bodyPara("GigRider is positioned as the ultimate productivity platform for gig economy delivery riders, aggregating orders from all major delivery platforms into a single, streamlined interface. The revenue model below has been designed to scale from a modest user base to billions in annual revenue through diversified, high-margin income streams. Rather than relying solely on a low-cost subscription, GigRider leverages its unique position at the intersection of riders, platforms, restaurants, and financial institutions to create a multi-layered monetization engine that grows exponentially with network effects."));

  // ── 1. Freemium Subscription Tiers ──
  children.push(heading2("1. Freemium Subscription Tiers"));
  children.push(bodyPara("The subscription model has been completely restructured from a single flat fee to a tiered system that captures value at every rider segment. The free tier ensures maximum adoption and network effects, while premium tiers unlock features that directly translate to higher earnings for riders. This structure creates a natural upgrade path where riders experience the value before paying, resulting in conversion rates typically 3-5x higher than forcing payment upfront. The key insight is that riders who earn more through GigRider are willing to pay more, creating a virtuous cycle."));

  children.push(makeTable(
    ["Tier", "Monthly Price", "Key Features", "Target Segment"],
    [
      ["Free", "Zero", "Basic order aggregation from up to 2 platforms, manual accept/decline, basic earnings tracker", "New riders, casual part-timers"],
      ["Pro", "Rs 299/month", "Unlimited platform connections, Auto-Rank mode, Smart Stack, countdown timers, priority support", "Active riders completing 20+ orders/day"],
      ["Elite", "Rs 799/month", "Everything in Pro + auto-accept rules, financial services access (loans, insurance), tax filing, exclusive high-value order alerts, dedicated support", "Full-time professional riders"],
      ["Fleet", "Rs 1,999/month", "Multi-rider dashboard for fleet managers, analytics per rider, centralized payouts, bulk financial products", "Fleet operators managing 5+ riders"],
    ],
    [15, 18, 40, 27]
  ));

  children.push(emptyLine());
  children.push(bodyBold("Revenue Projection: ", "With 500,000 active riders and a 12% conversion to Pro, 5% to Elite, and 1% to Fleet, monthly subscription revenue alone reaches Rs 2.79 Crore (Rs 27.9 million). At 5 million riders, this scales to Rs 27.9 Crore per month, or Rs 334.8 Crore annually. The freemium model ensures that the free tier acts as a powerful acquisition funnel, while the premium features deliver demonstrable ROI that justifies the cost."));

  // ── 2. Commission per Order ──
  children.push(heading2("2. Commission Per Order (Transaction Fee)"));
  children.push(bodyPara("Every order that flows through GigRider represents a transaction that can be monetized at a small percentage. This is the highest-scale revenue stream because it grows directly with rider activity, not just rider count. A 2-3% commission on each order accepted through GigRider is negligible for the rider (who saves time and fuel by using the app) but generates massive aggregate revenue. This model mirrors how payment gateways and fintech platforms operate: the individual transaction fee is tiny, but at scale, it creates a revenue powerhouse."));
  children.push(bodyPara("Consider a typical Indian delivery rider completing 25 orders per day with an average order value of Rs 250. At a 2% commission, GigRider earns Rs 5 per order, or Rs 125 per rider per day. With 100,000 active riders, daily commission revenue reaches Rs 1.25 Crore, translating to Rs 37.5 Crore monthly or Rs 450 Crore annually. This stream alone justifies billion-dollar valuations at scale, and it compounds naturally as order volumes grow across platforms and geographies."));
  children.push(bodyBold("Strategic Advantage: ", "Unlike platforms that charge restaurants 20-30%, GigRider's 2-3% rider-side commission is entirely defensible because riders save far more than Rs 5 per order through reduced idle time, fewer missed orders, and optimized route stacking. The rider's net income increases even after the commission, making this a win-win proposition."));

  // ── 3. Financial Services ──
  children.push(heading2("3. Financial Services (Fintech)"));
  children.push(bodyPara("Delivery riders are among the most underserved populations in financial services. They lack access to credit, insurance, and savings products because traditional banks consider them high-risk due to irregular income patterns. GigRider sits on a goldmine of data: real-time earnings, work patterns, platform ratings, and delivery consistency. This data enables precise credit scoring that no bank can match, opening up massive financial services revenue streams with minimal default risk."));

  children.push(heading3("3.1 Micro-Loans and Vehicle Financing"));
  children.push(bodyPara("Riders frequently need capital for vehicle purchase, repair, or upgrade. GigRider can partner with NBFCs and banks to offer instant micro-loans based on the rider's earnings history and delivery performance. A two-wheeler loan of Rs 50,000-80,000 at 18-24% interest (typical for this segment) generates Rs 9,000-19,200 in interest per loan per year. GigRider earns a 2-5% origination fee (Rs 1,000-4,000 per loan) plus a servicing commission of 1-2% annually. With 50,000 loans disbursed per year, origination revenue alone reaches Rs 5-20 Crore, plus recurring servicing income."));

  children.push(heading3("3.2 Insurance Products"));
  children.push(bodyPara("Delivery riders face high accident risks but almost universally lack insurance. GigRider can offer pay-per-trip accident insurance (Rs 5-10 per day covers Rs 5 Lakh accident cover), weekly health top-ups, and vehicle insurance. Partnering with insurers, GigRider earns 15-25% commission per policy. If 200,000 riders pay Rs 200/month for insurance, premium volume reaches Rs 4 Crore/month, with GigRider retaining Rs 60 Lakh-1 Crore monthly as commission. This is a high-margin, recurring revenue stream that also dramatically improves rider welfare."));

  children.push(heading3("3.3 Savings and Emergency Fund"));
  children.push(bodyPara("GigRider can auto-deduct a small percentage (2-5%) of daily earnings into a liquid mutual fund or savings wallet, earning the spread between fund returns and rider payouts (typically 1-2%). Additionally, the platform can charge a Rs 29/month fee for the savings account with benefits like instant withdrawal, goal-based saving, and financial literacy content. This creates sticky users and generates steady fee income."));

  // ── 4. Data Monetization ──
  children.push(heading2("4. Data Monetization and Analytics"));
  children.push(bodyPara("GigRider aggregates real-time delivery data across all platforms in every city it operates in. This data is extraordinarily valuable to multiple stakeholders. Restaurants want to know which areas have the most active riders and fastest delivery times. Dark kitchens need demand heatmaps to choose optimal locations. Urban planners require delivery traffic data for infrastructure decisions. Delivery platforms themselves lack cross-platform visibility that GigRider uniquely provides. The data monetization strategy sells aggregated, anonymized intelligence while fully protecting rider privacy."));
  children.push(bodyPara("Revenue streams include: (a) City-level delivery analytics subscriptions for restaurants and chains at Rs 5,000-25,000/month per city; (b) Demand heatmap APIs for dark kitchen operators at Rs 10,000-50,000/month; (c) Custom research reports for investors and urban planners at Rs 1-5 Lakh per report; and (d) Platform intelligence products showing cross-platform market share and rider availability at Rs 50,000-2,00,000/month. With just 500 enterprise clients averaging Rs 25,000/month, data revenue reaches Rs 1.25 Crore monthly."));

  // ── 5. B2B Enterprise API ──
  children.push(heading2("5. B2B Enterprise API and SaaS"));
  children.push(bodyPara("GigRider's core aggregation technology is a valuable product in itself. Any company that needs to interact with multiple delivery platforms programmatically can benefit from GigRider's unified API. This includes restaurant chains managing orders across Swiggy, Zomato, and Uber Eats simultaneously; dark kitchens optimizing dispatch; cloud kitchen aggregators; and even new delivery platforms that want to integrate quickly with the existing ecosystem. By offering this as a B2B SaaS product, GigRider unlocks an entirely separate revenue vertical with high-margin recurring income."));
  children.push(bodyPara("Pricing models include: per-API-call fees (Rs 0.50-2.00 per call), monthly SaaS subscriptions (Rs 10,000-1,00,000/month based on volume), and custom enterprise contracts (Rs 5-20 Lakh/year). A mid-size restaurant chain making 5,000 API calls daily at Rs 1/call generates Rs 1.5 Lakh/month from a single client. With 100 enterprise clients, this stream reaches Rs 1.5 Crore monthly with near-zero marginal cost."));

  // ── 6. White-Label Licensing ──
  children.push(heading2("6. White-Label Licensing and International Expansion"));
  children.push(bodyPara("The delivery rider aggregation problem exists in every country. Rather than building operations in each market, GigRider can license its technology as a white-label solution to local partners who understand their market's regulatory landscape and platform ecosystem. This is the franchise model applied to technology: GigRider provides the core platform, partner customizes for local platforms and regulations, and both share revenue. This enables global scale without proportional operational cost increases."));
  children.push(bodyPara("White-label deals are structured as: Rs 20-50 Lakh one-time setup fee per market, 15-25% revenue share on all income streams in that market, and annual technology maintenance fees of Rs 5-15 Lakh. If GigRider signs 20 international partners across Southeast Asia, Middle East, Africa, and Latin America, setup fees alone generate Rs 4-10 Crore upfront, plus Rs 10-25 Crore annually in revenue share and maintenance fees. This is capital-efficient global expansion."));

  // ── 7. Advertising and Sponsored Placements ──
  children.push(heading2("7. Advertising and Sponsored Placements"));
  children.push(bodyPara("GigRider's home screen is prime real estate viewed by riders dozens of times per day during active delivery hours. This captive audience is highly valuable for targeted advertising. Restaurants can sponsor their orders to appear first in the feed (ensuring faster acceptance and pickup). Fuel companies, vehicle manufacturers, tyre brands, and mobile network providers want direct access to this demographic. Insurance and financial product companies will pay premium CPMs to reach riders at the moment they are earning money and thinking about their finances."));
  children.push(bodyPara("Ad revenue models include: sponsored order placement (Rs 5-20 per sponsored order shown), banner ads on the earnings screen (Rs 50,000-2,00,000/month per city), push notification partnerships (Rs 2-5 per click-through), and branded vehicle decals/sponsorships (Rs 500-1,500/month per rider). With 100,000 active riders viewing 50 screens daily, monthly impressions exceed 150 million, creating significant advertising inventory valued at Rs 50 Lakh-2 Crore monthly."));

  // ── 8. Rider Marketplace ──
  children.push(heading2("8. Rider Marketplace (Direct Restaurant Connect)"));
  children.push(bodyPara("Many restaurants, especially small and medium establishments, want delivery riders but cannot afford the 20-30% commission charged by delivery platforms. GigRider can create a marketplace where restaurants post delivery gigs directly and riders accept them, bypassing the platform entirely. GigRider charges a 5-8% transaction fee on each direct delivery, which is far less than what platforms charge restaurants, while riders earn more per delivery. This creates a powerful alternative delivery channel that grows organically as restaurants seek to reduce platform dependency."));
  children.push(bodyPara("With 10,000 restaurants posting an average of 20 deliveries daily at an average value of Rs 150, daily marketplace GMV reaches Rs 3 Crore. At 5% transaction fee, daily revenue is Rs 15 Lakh, or Rs 4.5 Crore monthly. This stream also creates powerful network effects: more restaurants attract more riders, and more riders attract more restaurants."));

  // ── 9. Training and Certification ──
  children.push(heading2("9. Training, Certification, and Value-Added Services"));
  children.push(bodyPara("GigRider can offer paid courses and certifications that help riders increase their earnings and professional standing. Courses include: Food Safety and Handling Certification (required by many platforms, Rs 499), Advanced Navigation and Route Optimization (Rs 299), Customer Service Excellence (Rs 199), and Gig Economy Financial Literacy (Rs 149). Certifications can be displayed on rider profiles and may qualify them for higher-paying orders or premium fleet placements. This stream also includes tax filing services (Rs 499-999 per filing), GST registration assistance (Rs 1,499), and legal document services. With 100,000 course enrollments per year averaging Rs 350, this generates Rs 3.5 Crore annually with very high margins."));

  // ── 10. Referral and Partnership Revenue ──
  children.push(heading2("10. Referral and Partnership Revenue"));
  children.push(bodyPara("GigRider riders are a concentrated demographic with specific, predictable needs: mobile recharges, fuel, vehicle servicing, helmets, rain gear, and more. By partnering with telecom companies (exclusive recharge plans), petrol pumps (discounted fuel cards), service centers (preferred servicing rates), and equipment brands (bulk purchase deals), GigRider earns referral commissions of 3-10% on every transaction routed through the platform. A rider spending Rs 3,000/month on fuel and Rs 500 on mobile recharges through GigRider partnerships generates Rs 105-350 in monthly commission per rider. With 200,000 riders using partner services, this stream reaches Rs 2.1-7 Crore monthly."));

  // ── Revenue Summary Table ──
  children.push(heading2("Revenue Summary: Combined Projection at Scale"));
  children.push(bodyPara("The following table summarizes the projected monthly revenue from each stream at two scale milestones: 500,000 active riders (Year 2-3) and 5,000,000 active riders (Year 4-5). These are conservative estimates based on industry benchmarks and comparable business models in the fintech, SaaS, and marketplace domains."));

  children.push(makeTable(
    ["Revenue Stream", "500K Riders (Monthly)", "5M Riders (Monthly)", "Margin"],
    [
      ["Subscription Tiers", "Rs 2.79 Crore", "Rs 27.9 Crore", "85-90%"],
      ["Commission per Order (2%)", "Rs 18.75 Crore", "Rs 187.5 Crore", "70-80%"],
      ["Financial Services (Loans/Insurance/Savings)", "Rs 3.5 Crore", "Rs 35 Crore", "40-60%"],
      ["Data Monetization", "Rs 1.25 Crore", "Rs 12.5 Crore", "90-95%"],
      ["B2B Enterprise API/SaaS", "Rs 1.5 Crore", "Rs 15 Crore", "85-95%"],
      ["White-Label Licensing", "Rs 0.5 Crore", "Rs 8 Crore", "80-90%"],
      ["Advertising & Sponsored Placements", "Rs 1 Crore", "Rs 10 Crore", "75-85%"],
      ["Rider Marketplace", "Rs 2.25 Crore", "Rs 22.5 Crore", "60-70%"],
      ["Training & Certification", "Rs 0.3 Crore", "Rs 3 Crore", "85-90%"],
      ["Referral & Partnership Revenue", "Rs 2 Crore", "Rs 20 Crore", "70-80%"],
      ["TOTAL", "Rs 33.84 Crore", "Rs 341.4 Crore", ""],
    ],
    [30, 20, 20, 15]
  ));

  children.push(emptyLine());
  children.push(bodyBold("Annual Revenue at Scale: ", "At 500K riders: Rs 406 Crore/year (approximately USD 48 million). At 5M riders: Rs 4,097 Crore/year (approximately USD 488 million). With continued international expansion and white-label licensing, the Rs 5,000+ Crore (USD 600M+) annual revenue milestone is achievable within 6-7 years, supporting a multi-billion dollar valuation."));

  // =============================================
  // PART II: PRESENTATION PREPARATION
  // =============================================
  children.push(heading1("Part II: Presentation Preparation"));
  children.push(bodyPara("This section provides comprehensive preparation material for the GigRider investor presentation. It includes the pitch narrative structure, key talking points for each slide, anticipated questions with prepared responses, competitive positioning, and a demo flow guide. The goal is to equip the presenter with everything needed to deliver a compelling, confident, and data-backed presentation that clearly communicates GigRider's billion-dollar potential."));

  // ── Slide-by-Slide Guide ──
  children.push(heading2("1. Pitch Deck Structure and Slide Guide"));
  children.push(bodyPara("The recommended pitch deck follows a proven 12-slide structure used by Y Combinator startups and venture-backed companies. Each slide serves a specific purpose in building the investor's understanding and excitement. The key is to tell a story: start with a problem the investor can feel, show the solution that makes them lean forward, prove the market is massive, demonstrate traction, and close with an irresistible ask."));

  children.push(heading3("Slide 1: Title and Hook"));
  children.push(bodyPara("Open with the GigRider logo and a single powerful line: \"One App. Every Order. More Money.\" This immediately communicates the value proposition. Below the tagline, include the presenter's name and the date. The visual should use the Old Money aesthetic: cream background, deep navy typography, gold accents. No clutter. The first impression must scream premium and confident. Investors decide in the first 30 seconds whether to pay attention, so this slide must be visually striking and instantly clear."));

  children.push(heading3("Slide 2: The Problem"));
  children.push(bodyPara("Paint a vivid picture: \"India has 15 million delivery riders. Each rider juggling 2-4 phones, missing orders, burning fuel between pickups, and losing Rs 200-500 daily in missed earnings.\" Use a powerful image of a rider with multiple phones mounted on their handlebar. State the problem in three bullets: (1) Riders miss 30% of orders because they cannot monitor all platforms simultaneously; (2) Riders waste 45 minutes daily switching between apps and navigating separately; (3) Riders have zero financial services access despite being the backbone of a Rs 50,000 Crore industry. Make the investor feel the pain."));

  children.push(heading3("Slide 3: The Solution"));
  children.push(bodyPara("Introduce GigRider in one sentence: \"GigRider aggregates every delivery platform onto one phone, so riders never miss an order and always earn more.\" Show a side-by-side comparison: BEFORE (multiple phones, chaos, missed orders) vs. AFTER (single phone, organized feed, auto-ranking). Demo the app briefly on this slide if possible. Highlight the three killer features: Live Order Feed with countdown timers, Auto-Rank Mode that prioritizes the best orders, and Smart Stack that batches nearby deliveries. Make the investor think: \"Of course this should exist.\""));

  children.push(heading3("Slide 4: Market Size (TAM/SAM/SOM)"));
  children.push(bodyPara("Present a clear market sizing: Total Addressable Market (TAM) of Rs 10,00,000 Crore (USD 120B) representing the global gig delivery economy; Serviceable Addressable Market (SAM) of Rs 2,50,000 Crore (USD 30B) for India and Southeast Asia; Serviceable Obtainable Market (SOM) of Rs 25,000 Crore (USD 3B) representing the 5 million riders GigRider can realistically reach in 5 years. Use concentric circles visual. Emphasize that the market is growing 25% annually and that no existing player addresses the rider productivity gap."));

  children.push(heading3("Slide 5: Business Model"));
  children.push(bodyPara("Present the 10 revenue streams from Part I of this document, but focus on the top 4 that drive 80% of revenue: Commission per Order (55%), Subscription Tiers (8%), Financial Services (10%), and Rider Marketplace (7%). Use a pie chart. Emphasize that the commission model aligns incentives: GigRider only earns when riders earn more. Compare this to platform business models where revenue extraction hurts the supply side. This is a fundamentally better model because everyone wins."));

  children.push(heading3("Slide 6: Traction and Milestones"));
  children.push(bodyPara("Even at prototype stage, present clear progress: (1) Product prototype built with Old Money UI and complete user flow; (2) Auth system with OTP login ready; (3) Core features functional: Live Order Feed, Auto-Rank, Smart Stack; (4) Revenue model designed and validated against industry benchmarks; (5) Legal strategy developed to operate within platform terms of service. If any early user testing data exists, include it. Show a roadmap with 6-month, 12-month, and 24-month milestones. Investors fund momentum, not just ideas."));

  children.push(heading3("Slide 7: Competitive Landscape"));
  children.push(bodyPara("Show a 2x2 matrix with axes of \"Rider Focus\" (x) and \"Platform Coverage\" (y). GigRider occupies the top-right quadrant (high rider focus, multi-platform). Competitors like Para and Shiftie are in the top-left (rider-focused but limited platform coverage). Individual delivery apps are bottom-right (single platform, no rider focus). Show that no one else does what GigRider does at this scale. Mention that Para was acquired by DoorDash, validating the space but leaving the multi-platform opportunity open globally."));

  children.push(heading3("Slide 8: Go-to-Market Strategy"));
  children.push(bodyPara("Outline the three-phase GTM: Phase 1 (Months 1-6) focuses on 3 Indian cities (Bangalore, Mumbai, Delhi) targeting 50,000 riders through referral programs and rider community partnerships; Phase 2 (Months 7-18) expands to 15 cities and launches financial services with NBFC partnerships; Phase 3 (Months 19-36) enters international markets through white-label licensing and direct operations in Southeast Asia and Middle East. The key acquisition channel is rider-to-rider referral: every rider who earns 20% more using GigRider tells 5 others. This viral coefficient of 5 is extraordinary."));

  children.push(heading3("Slide 9: Team"));
  children.push(bodyPara("Present the founding team with clear role assignments and relevant expertise. Highlight why this team is uniquely positioned to build GigRider. Include advisors if any. If the team is small, emphasize the depth of domain knowledge, the speed of execution (prototype already built), and the strategic advisory network. Investors bet on teams, not just ideas. Show that the team has the technical capability to build the product, the financial acumen to design the revenue model, and the legal awareness to navigate platform relationships."));

  children.push(heading3("Slide 10: Financial Projections"));
  children.push(bodyPara("Show a simple table with 5-year projections: Year 1 (Rs 8 Crore revenue, 100K riders), Year 2 (Rs 80 Crore, 500K riders), Year 3 (Rs 250 Crore, 2M riders), Year 4 (Rs 800 Crore, 4M riders), Year 5 (Rs 2,500 Crore, 7M riders including international). Plot the revenue curve on a chart. Note that breakeven occurs in Year 2 when subscription + commission revenue exceeds operational costs. Emphasize that financial services revenue has a 12-18 month lag but becomes the highest-margin stream once established."));

  children.push(heading3("Slide 11: The Ask"));
  children.push(bodyPara("State clearly: \"We are raising Rs 25 Crore (USD 3M) in seed funding for 10% equity, valuing GigRider at Rs 250 Crore (USD 30M).\" Break down the use of funds: 40% engineering and product development, 25% rider acquisition and marketing, 20% financial services partnerships and regulatory, 15% operations and team. Show that this runway achieves 500K riders and Rs 80 Crore annual revenue run-rate, setting up for a strong Series A at a 5-10x valuation step-up. Make the math obvious: this is a 10x+ return opportunity."));

  children.push(heading3("Slide 12: Closing Vision"));
  children.push(bodyPara("End with the big vision: \"GigRider will become the operating system for 50 million delivery riders worldwide. We are not just building an app; we are building the financial and productivity infrastructure for the gig economy's backbone.\" Close with the same Old Money aesthetic as the opening, creating a bookend effect. Leave the investor with the feeling that this is inevitable, not optional. The last line on screen: \"Every rider deserves one app. Every order. More money.\" Then: \"Thank you. Questions?\""));

  // ── Anticipated Q&A ──
  children.push(heading2("2. Anticipated Investor Questions and Responses"));

  children.push(heading3("Q: Won't delivery platforms block GigRider?"));
  children.push(bodyPara("GigRider is a rider productivity tool, not a competing delivery platform. We do not route orders, set prices, or interact with customers. We aggregate notifications that riders already receive on their own devices. Legally, this is equivalent to a notification manager app. Precedent exists: Para (acquired by DoorDash for USD 50M+) operated the same model in the US. Shiftie operates in the UK without platform interference. Our legal strategy positions GigRider as a personal productivity assistant, similar to how email aggregators work with multiple email providers without being blocked. Additionally, platforms benefit from riders who complete more deliveries, so there is an alignment of interests."));

  children.push(heading3("Q: How do you prevent the commission model from alienating riders?"));
  children.push(bodyPara("The 2% commission is transparent and voluntary: riders on the Free tier pay zero commission, while Pro and Elite riders pay commission only on orders they accept through GigRider. The key is that riders earn 15-25% more using GigRider (through reduced idle time, smarter order stacking, and fewer missed orders), so even after a 2% commission, their net income increases by 13-23%. We demonstrate this in the app with an \"Earnings Boost\" counter showing how much more they have earned compared to manual platform switching. Riders who see Rs 500 extra daily earnings will happily pay Rs 5 per order."));

  children.push(heading3("Q: What about competition from platforms building their own multi-app features?"));
  children.push(bodyPara("No delivery platform has an incentive to help riders use a competitor's platform. Swiggy will never show Zomato orders, and vice versa. This structural conflict of interest means multi-platform aggregation can only come from a neutral third party. Even if a platform tried, riders would not trust it to fairly rank orders from competitors. GigRider's neutrality is its moat. Additionally, our technology integrates at the notification level, not the API level, making it technically different from what platforms can build internally."));

  children.push(heading3("Q: How do you verify the financial projections?"));
  children.push(bodyPara("Our projections are benchmarked against three comparable business models: (1) Commission-based: Paytm and PhonePe proved that 1-2% transaction fees generate massive revenue at scale; (2) Fintech: BharatPe and KreditBee demonstrated that gig worker lending is profitable with proper data-driven underwriting; (3) SaaS/API: Razorpay and BillDesk showed that per-transaction API fees create billion-dollar businesses. We use conservative conversion rates (12% subscription conversion vs. industry average of 15-20%), conservative commission rates (2% vs. potential 3-5%), and conservative rider growth projections (linear vs. the exponential growth seen in ride-hailing). Every number has a precedent."));

  // ── Demo Flow Guide ──
  children.push(heading2("3. Live Demo Flow Guide"));
  children.push(bodyPara("A live demo is the most powerful part of the presentation. It transforms GigRider from a concept into a tangible product that investors can see and feel. The demo should be rehearsed at least 10 times and should take exactly 3-4 minutes. The key is to show the \"magic moment\" as quickly as possible: the instant when orders from multiple platforms appear in a single, organized feed. Below is the recommended demo flow with exact screens to navigate and narration for each step."));

  children.push(makeTable(
    ["Step", "Screen/Action", "Narration"],
    [
      ["1", "Splash Screen", "\"This is GigRider. Let me show you how it works for a real rider.\""],
      ["2", "Login Screen", "\"Riders log in with their phone number. Simple, familiar, fast.\""],
      ["3", "OTP Entry", "\"Demo OTP for the presentation. In production, real OTP verification.\""],
      ["4", "Home Screen - Live Order Feed", "\"Here is the magic moment: orders from Swiggy, Zomato, and Uber Eats all appearing in ONE feed. Notice the countdown timers, platform badges, and earnings displayed upfront.\""],
      ["5", "Auto-Rank Toggle", "\"With one tap, Auto-Rank reorders the feed so the highest-earning, closest orders are always on top. Riders never miss the best orders again.\""],
      ["6", "Smart Stack", "\"Smart Stack groups nearby deliveries together. Instead of three separate trips, the rider does one efficient loop. More money, less fuel.\""],
      ["7", "Earnings Dashboard", "\"All earnings across platforms in one view. No more checking four separate apps to know how much you made today.\""],
      ["8", "Profile & Financial Services", "\"And this is where GigRider becomes more than an app. Insurance, loans, savings - all accessible because we know the rider's earnings in real-time.\""],
    ],
    [8, 25, 67]
  ));

  // ── Key Metrics to Highlight ──
  children.push(heading2("4. Key Metrics to Highlight in the Pitch"));
  children.push(bodyPara("Investors remember numbers, not adjectives. The following metrics should be woven throughout the presentation and repeated in the closing. Each metric has been chosen because it addresses a specific investor concern: market size, unit economics, scalability, or defensibility."));

  children.push(makeTable(
    ["Metric", "Value", "Why It Matters"],
    [
      ["Total delivery riders in India", "15 million", "Massive addressable user base"],
      ["Average orders missed per rider per day", "8-12 orders (30%)", "Quantifies the problem clearly"],
      ["GigRider earnings uplift for riders", "15-25% more daily income", "Proves value proposition with hard numbers"],
      ["Projected Year 5 revenue", "Rs 2,500 Crore (USD 300M)", "Shows billion-dollar trajectory"],
      ["Commission revenue at 5M riders", "Rs 187.5 Crore/month", "Single largest stream, highly scalable"],
      ["Breakeven timeline", "18-24 months", "Capital-efficient path to profitability"],
      ["Rider referral viral coefficient", "5x (each rider tells 5 others)", "Organic growth engine reduces CAC"],
      ["Para acquisition by DoorDash", "USD 50M+", "Validates the space and exit potential"],
      ["Platform commission on restaurants", "20-30%", "Our 2% rider commission is 10-15x cheaper"],
      ["Gig economy CAGR (2024-2030)", "25% annually", "Market tailwind for growth"],
    ],
    [30, 25, 45]
  ));

  // ── Closing Tips ──
  children.push(heading2("5. Presentation Delivery Tips"));
  children.push(bodyPara("The presentation is not just about the slides; it is about how you deliver them. Here are the critical delivery tips that can make the difference between a polite \"we will think about it\" and an enthusiastic \"when can we meet again?\" First, start with energy. The first 30 seconds set the tone for the entire meeting. Walk in confidently, make eye contact, and open with the problem statement, not a greeting. Make the investor feel the rider's pain before you show the solution. Second, use the demo as your secret weapon. Nothing convinces like seeing the product work. Practice the demo until it is second nature, and always have a screenshot backup in case of technical issues."));
  children.push(bodyPara("Third, own the numbers. Investors will test whether you truly understand your financial model. If someone asks about unit economics at 1 million riders, you should be able to calculate it on the spot. Fourth, never be defensive about competition. Acknowledge Para and Shiftie, then explain why GigRider is different (multi-platform, India-first, financial services layer). Fifth, close with conviction. The ask slide is not the time for uncertainty. State the amount, the equity, the valuation, and the milestone it achieves as if it is the most obvious investment decision in the world. Finally, remember that investors invest in people. Show passion, depth of knowledge, and the resilience to build a billion-dollar company."));

  return children;
}

// ── Assemble Document ──
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" },
          size: 24,
          color: P.body,
        },
        paragraph: {
          spacing: { line: 312 },
        },
      },
      heading1: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, bold: true, color: P.primary },
        paragraph: { spacing: { before: 360, after: 160, line: 312 } },
      },
      heading2: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, bold: true, color: P.primary },
        paragraph: { spacing: { before: 280, after: 120, line: 312 } },
      },
      heading3: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 24, bold: true, color: P.primary },
        paragraph: { spacing: { before: 200, after: 100, line: 312 } },
      },
    },
  },
  numbering: {
    config: [],
  },
  sections: [
    // Section 1: Cover
    {
      properties: {
        page: {
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: buildCover(),
    },
    // Section 2: TOC
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" })],
            }),
          ],
        }),
      },
      children: buildTOC(),
    },
    // Section 3: Body
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "GigRider \u2014 Revenue Model & Pitch Preparation", size: 18, color: "808080", font: { ascii: "Times New Roman" } })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" })],
            }),
          ],
        }),
      },
      children: buildBody(),
    },
  ],
});

// ── Generate ──
const outputPath = "/home/z/my-project/download/GigRider_Revenue_Model_and_Pitch_Prep.docx";
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log("Document generated at: " + outputPath);
});
