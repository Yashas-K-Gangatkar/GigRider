const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  TableOfContents,
} = require("docx");
const fs = require("fs");

// ── Palette: Legal Wood (formal, authoritative for legal documents) ──
const P = {
  primary: "28201C",
  body: "36302C",
  secondary: "6E6560",
  accent: "7A5C3A",
  surface: "FBF9F7",
  table: {
    headerBg: "7A5C3A",
    headerText: "FFFFFF",
    accentLine: "7A5C3A",
    innerLine: "DDD8CC",
    surface: "F5F3ED",
  },
};

const coverBg = "28201C";

const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// ── Component builders ──
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, color: P.primary })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, color: P.primary })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 24, color: P.primary })],
  });
}

function para(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, color: P.body, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } })],
  });
}

function boldPara(label, text) {
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

// ── COVER for Provisional Patent ──
function buildCover(config) {
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
                new Paragraph({
                  spacing: { before: 3000 },
                  indent: { left: 1200, right: 6000 },
                  border: { top: { style: BorderStyle.SINGLE, size: 18, color: P.accent, space: 20 } },
                  children: [],
                }),
                new Paragraph({
                  spacing: { before: 300, line: 600, lineRule: "atLeast" },
                  indent: { left: 1200 },
                  children: [
                    new TextRun({ text: "PROVISIONAL PATENT", font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 44, bold: true, color: "D4AF37" }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 80, line: 600, lineRule: "atLeast" },
                  indent: { left: 1200 },
                  children: [
                    new TextRun({ text: "SPECIFICATION", font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 44, bold: true, color: "D4AF37" }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 400 },
                  indent: { left: 1200, right: 4000 },
                  border: { top: { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 12 } },
                  children: [],
                }),
                new Paragraph({
                  spacing: { before: 400, line: 500, lineRule: "atLeast" },
                  indent: { left: 1200 },
                  children: [
                    new TextRun({ text: config.title, font: { ascii: "Times New Roman" }, size: 24, color: "FFFFFF" }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 400, line: 400, lineRule: "atLeast" },
                  indent: { left: 1200 },
                  children: [
                    new TextRun({ text: "Applicant: " + config.applicant, font: { ascii: "Times New Roman" }, size: 20, color: "B0B8C0" }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 80 },
                  indent: { left: 1200 },
                  children: [
                    new TextRun({ text: "Filing Date: " + config.date, font: { ascii: "Times New Roman" }, size: 20, color: "B0B8C0" }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 80 },
                  indent: { left: 1200 },
                  children: [
                    new TextRun({ text: "Jurisdiction: " + config.jurisdiction, font: { ascii: "Times New Roman" }, size: 20, color: "B0B8C0" }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 80 },
                  indent: { left: 1200 },
                  children: [
                    new TextRun({ text: "Classification: CONFIDENTIAL", font: { ascii: "Times New Roman" }, size: 20, color: "D4AF37" }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];
}

// ── PATENT 1: Multi-Platform Aggregation + Auto-Rank ──
function buildPatent1() {
  const children = [];

  children.push(h1("Provisional Patent Specification - Patent I"));
  children.push(h2("Title of Invention"));
  children.push(para("System and Method for Multi-Platform Delivery Order Aggregation, Prioritization, and Unified Presentation for Gig Economy Workers"));

  children.push(h2("Field of the Invention"));
  children.push(para("The present invention relates generally to the field of mobile computing applications and more particularly to a system and method for aggregating, prioritizing, and presenting delivery orders from multiple independent delivery platforms onto a single unified interface for gig economy delivery workers. The invention further relates to automated order ranking algorithms that optimize rider earnings and efficiency by considering multiple real-time variables across heterogeneous platform data streams."));

  children.push(h2("Background of the Invention"));
  children.push(para("The gig economy delivery sector has experienced explosive growth globally, with an estimated 15 million delivery riders operating in India alone and over 50 million worldwide. These riders typically operate on multiple delivery platforms simultaneously, such as Swiggy, Zomato, Uber Eats, DoorDash, Deliveroo, and others, in order to maximize their daily earnings and minimize idle time between deliveries. However, each of these platforms operates as a closed ecosystem, requiring riders to run multiple applications simultaneously on separate devices or switch between applications on a single device."));
  children.push(para("This fragmented operational model creates several significant problems. First, riders frequently miss high-value or time-sensitive orders from one platform while they are engaged with another platform's application, resulting in estimated lost earnings of 30% of potential daily income. Second, riders cannot efficiently compare orders across platforms in real-time to select the most profitable combination of deliveries, leading to suboptimal routing and wasted fuel. Third, the cognitive load of monitoring multiple applications simultaneously increases the risk of traffic accidents, as riders are compelled to check multiple screens while riding. Fourth, riders lack a unified view of their total earnings, platform-specific performance metrics, and financial history, which prevents informed decision-making about which platforms to prioritize during different times of day."));
  children.push(para("Prior art solutions exist in the form of basic notification aggregation tools and gig worker management applications such as Para (formerly known as ParaWorks) and Shiftie. However, these solutions suffer from critical limitations. Para was limited to a single market (United States), supported only a limited number of platforms, and did not provide intelligent cross-platform order prioritization or geographic batching. Para was subsequently acquired by DoorDash, effectively removing it as an independent multi-platform solution. Shiftie operates primarily in the United Kingdom and focuses on earnings tracking rather than real-time order aggregation and intelligent prioritization. Neither solution provides a system that dynamically ranks orders across multiple platforms using real-time variables including delivery distance, estimated earnings, pickup proximity, countdown urgency, platform reliability scores, and rider-specific historical performance data."));

  children.push(h2("Summary of the Invention"));
  children.push(para("The present invention provides a system and method for aggregating delivery orders from multiple independent delivery platforms into a single unified interface, automatically ranking said orders using a multi-variable prioritization algorithm, and presenting them to a gig economy delivery worker in a manner that maximizes the worker's earnings per unit of time and distance traveled."));
  children.push(para("In one aspect, the invention provides a method comprising the steps of: (a) establishing authenticated notification listeners for each of a plurality of delivery platform applications installed on or accessible from a user's mobile device; (b) intercepting and parsing order notification data from each platform, wherein said data includes at least order identifier, pickup location, delivery location, estimated earnings, countdown timer, and platform source; (c) normalizing said parsed data into a unified data structure regardless of the originating platform's native data format; (d) applying a multi-variable ranking algorithm to each normalized order, wherein said algorithm computes a priority score based on at least: estimated earnings per unit distance, estimated earnings per unit time, countdown urgency factor, pickup proximity factor, platform reliability factor, and rider historical performance factor; (e) presenting said ranked orders in a single unified feed on the user's mobile device, ordered by computed priority score; and (f) enabling the user to accept or decline individual orders through said unified interface, wherein acceptance triggers the corresponding platform's native acceptance mechanism."));
  children.push(para("In another aspect, the invention provides a non-transitory computer-readable medium storing instructions that, when executed by a processor, perform the steps described above."));
  children.push(para("In yet another aspect, the invention provides a system comprising: a notification aggregation module configured to intercept and parse order notifications from a plurality of delivery platform applications; a data normalization module configured to transform heterogeneous platform data into a unified data structure; a multi-variable ranking engine configured to compute priority scores for each normalized order; a unified presentation interface configured to display ranked orders in a single feed; and an order acceptance relay module configured to trigger platform-native acceptance mechanisms in response to user actions on the unified interface."));

  children.push(h2("Detailed Description of the Invention"));

  children.push(h3("1. System Architecture"));
  children.push(para("The system operates on a mobile computing device (smartphone or tablet) and comprises the following functional modules, each implemented as software components executing on the device's processor. The architecture is designed to operate with minimal battery consumption and network overhead, as delivery riders typically work long shifts with limited access to charging facilities."));

  children.push(h3("1.1 Notification Aggregation Module"));
  children.push(para("This module establishes notification listeners for each delivery platform application installed on the user's device. The module operates through one or more of the following access methods depending on the operating system and platform compatibility: (a) Android Notification Listener Service, which receives all notifications posted by delivery platform applications and filters for order-related notifications based on predefined platform-specific notification patterns; (b) Android Accessibility Service, which monitors screen content changes within delivery platform applications and extracts order data from visible UI elements; (c) Platform API Integration, where available, connecting directly to platform application programming interfaces to receive order data; and (d) Background Service Polling, as a fallback mechanism for platforms that do not generate standard notifications."));
  children.push(para("Each notification is parsed according to platform-specific extraction rules that identify and extract the following data fields: order identifier (unique reference for the order), pickup location (latitude and longitude or address), delivery destination (latitude and longitude or address), estimated earnings (monetary compensation offered), countdown timer (time remaining to accept the order), order type (food delivery, grocery delivery, parcel delivery, etc.), customer rating (if available), and platform source identifier. These extraction rules are maintained in a configurable rule set that can be updated remotely without requiring application updates, enabling rapid adaptation to platform UI changes."));

  children.push(h3("1.2 Data Normalization Module"));
  children.push(para("Because each delivery platform presents order data in a different format, structure, and level of detail, the Data Normalization Module transforms all incoming order data into a Unified Order Data Structure (UODS). The UODS comprises the following standardized fields: orderId (string), platformSource (enum), pickupLatitude (float), pickupLongitude (float), deliveryLatitude (float), deliveryLongitude (float), estimatedEarnings (float, in local currency), estimatedDistance (float, in kilometers), estimatedDuration (integer, in minutes), countdownSecondsRemaining (integer), orderCategory (enum), customerRating (float, 0-5), timestamp (ISO 8601), and platformConfidenceScore (float, 0-1, indicating the reliability of the extracted data). Fields not directly available from platform data are computed using geographic calculation modules (distance and duration from coordinates) or assigned default values based on historical data for the specific platform and geographic region."));

  children.push(h3("1.3 Multi-Variable Ranking Engine (Auto-Rank)"));
  children.push(para("The Multi-Variable Ranking Engine is the core innovation of the present invention. It computes a composite Priority Score for each normalized order using the following formula and component scores, enabling riders to focus on the most profitable and efficient orders without manually comparing across platforms."));

  children.push(para("Priority Score (P) = w1 * EarningsPerKilometer + w2 * EarningsPerMinute + w3 * CountdownUrgencyFactor + w4 * PickupProximityFactor + w5 * PlatformReliabilityFactor + w6 * RiderHistoryFactor"));
  children.push(para("Where: w1 through w6 are configurable weight parameters, initially set to [0.25, 0.20, 0.20, 0.15, 0.10, 0.10] and dynamically adjusted based on rider behavior and outcomes. Each component is computed as follows:"));

  children.push(makeTable(
    ["Component", "Computation", "Range", "Description"],
    [
      ["EarningsPerKilometer", "estimatedEarnings / estimatedDistance", "0 to 100", "Measures earnings efficiency per unit distance traveled. Higher values indicate more profitable deliveries per kilometer."],
      ["EarningsPerMinute", "estimatedEarnings / estimatedDuration", "0 to 10", "Measures earnings efficiency per unit time invested. Higher values indicate more profitable deliveries per minute."],
      ["CountdownUrgencyFactor", "1 - (secondsRemaining / maxCountdownSeconds)", "0 to 1", "Orders closer to expiry receive higher urgency scores, ensuring time-sensitive orders are not missed."],
      ["PickupProximityFactor", "1 - (distanceToPickup / maxProximityThreshold)", "0 to 1", "Orders with pickup locations closer to the rider's current location receive higher scores, minimizing dead-heading time."],
      ["PlatformReliabilityFactor", "historicalCompletionRate for platform", "0 to 1", "Platforms with higher historical order completion rates and fewer cancellations receive higher scores."],
      ["RiderHistoryFactor", "rider's personal success rate on platform", "0 to 1", "Reflects the rider's own historical performance on each platform, personalizing the ranking."],
    ],
    [20, 30, 10, 40]
  ));

  children.push(emptyLine());
  children.push(para("The weight parameters are not static. They are dynamically adjusted through a machine learning feedback loop that observes rider acceptance patterns and delivery outcomes. When a rider consistently accepts orders with high EarningsPerKilometer scores, the w1 weight is incrementally increased. When a rider frequently misses orders with low CountdownUrgencyFactor scores, the w3 weight is adjusted upward. This adaptive personalization ensures that the ranking engine becomes more accurate and useful over time for each individual rider."));

  children.push(h3("1.4 Unified Presentation Interface"));
  children.push(para("The Unified Presentation Interface displays all ranked orders in a single, scrollable feed on the rider's mobile device. Each order card in the feed displays: the platform source (identified by a color-coded badge and logo), estimated earnings prominently displayed, pickup and delivery locations, countdown timer (animated, with visual urgency indicators as time decreases), estimated distance and duration, and the computed Priority Score visualized as a quality indicator. The feed is continuously updated in real-time as new orders arrive from any connected platform, and existing orders are automatically removed when their countdown timers expire or when they are accepted by other riders."));

  children.push(h3("1.5 Order Acceptance Relay Module"));
  children.push(para("When a rider accepts an order through the unified interface, the Order Acceptance Relay Module triggers the corresponding platform's native acceptance mechanism. This is accomplished through one of the following methods, selected based on platform compatibility: (a) programmatic tap simulation on the platform application's accept button via Accessibility Service; (b) direct API call to the platform's order acceptance endpoint; or (c) notification action reply that mimics the platform's notification-based acceptance flow. The relay module confirms successful acceptance by monitoring the platform application's state change and provides visual and haptic feedback to the rider. If acceptance fails (due to the order being taken by another rider or a network error), the module immediately notifies the rider and removes the order from the feed."));

  children.push(h3("2. Auto-Accept Rules Engine"));
  children.push(para("The system further includes an Auto-Accept Rules Engine that allows riders to define criteria for automatic order acceptance, eliminating the need to manually review and accept every order. Riders can configure rules based on: minimum earnings threshold (e.g., accept all orders above Rs 80), maximum delivery distance (e.g., accept orders within 5 km only), platform preferences (e.g., prioritize Swiggy orders during lunch hours), geographic zones (e.g., accept orders originating from a specific area), and time-of-day rules (e.g., accept all Zomato orders between 7 PM and 10 PM). The Auto-Accept Rules Engine evaluates incoming orders against the rider's configured rule set and automatically triggers the Order Acceptance Relay Module for orders that match all specified criteria. This feature is particularly valuable during peak hours when order volume is high and manual review is impractical."));

  children.push(h3("3. Smart Stack Module"));
  children.push(para("The Smart Stack Module extends the Multi-Variable Ranking Engine by identifying groups of orders that can be efficiently batched together for simultaneous delivery. The module computes geographic proximity between pickup locations and delivery destinations of multiple active orders, identifies orders whose combined route distance is less than the sum of individual route distances (indicating a potential efficiency gain), and presents these order groups as a stacked delivery option. The Smart Stack score for a batch is computed as: StackScore = CombinedEarnings / CombinedRouteDistance - Sum(IndividualEarnings / IndividualDistances). A positive StackScore indicates that the batched delivery is more efficient than individual deliveries. The Smart Stack Module also considers time constraints, ensuring that all orders in a stack can be delivered within their respective delivery windows."));

  children.push(h2("Claims (Outline for Complete Specification)"));
  children.push(para("The following claims outline is provided for the provisional specification and will be expanded and refined in the complete specification. Claim 1: A method for aggregating delivery orders from multiple independent delivery platforms onto a single unified interface, comprising the steps of intercepting order notifications, parsing platform-specific data, normalizing to a unified data structure, computing priority scores, and presenting ranked orders. Claim 2: The method of Claim 1, wherein the priority score is computed using a weighted combination of earnings per distance, earnings per time, countdown urgency, pickup proximity, platform reliability, and rider history factors. Claim 3: The method of Claim 2, wherein the weight parameters are dynamically adjusted through a machine learning feedback loop based on rider acceptance patterns. Claim 4: The method of Claim 1, further comprising an auto-accept rules engine that automatically accepts orders matching rider-defined criteria. Claim 5: The method of Claim 1, further comprising a smart stack module that identifies and presents geographically batchable order groups. Claim 6: A non-transitory computer-readable medium storing instructions for performing the method of Claims 1-5. Claim 7: A system comprising a notification aggregation module, data normalization module, multi-variable ranking engine, unified presentation interface, and order acceptance relay module."));

  children.push(h2("Drawings (Description of Figures to be Provided)"));
  children.push(para("The following drawings will be prepared for the complete specification: Figure 1 shows the overall system architecture diagram illustrating the relationship between all functional modules. Figure 2 shows the notification interception and parsing flow for multiple delivery platforms. Figure 3 shows the Unified Order Data Structure (UODS) schema. Figure 4 shows the Multi-Variable Ranking Engine algorithm flowchart. Figure 5 shows the adaptive weight adjustment feedback loop. Figure 6 shows the Unified Presentation Interface layout and order card design. Figure 7 shows the Order Acceptance Relay Module operation flow. Figure 8 shows the Auto-Accept Rules Engine decision tree. Figure 9 shows the Smart Stack Module geographic batching algorithm flowchart."));

  children.push(h2("Deposit and Biological Material"));
  children.push(para("Not applicable. The invention does not involve any biological material."));

  return children;
}

// ── PATENT 2: Credit Scoring ──
function buildPatent2() {
  const children = [];

  children.push(h1("Provisional Patent Specification - Patent II"));
  children.push(h2("Title of Invention"));
  children.push(para("System and Method for Multi-Platform Gig Worker Credit Scoring Based on Cross-Platform Delivery Performance Data"));

  children.push(h2("Field of the Invention"));
  children.push(para("The present invention relates generally to the field of financial technology and credit scoring, and more particularly to a system and method for generating credit scores for gig economy workers based on their aggregated delivery performance data across multiple independent delivery platforms, enabling financial institutions to assess creditworthiness of workers who lack traditional credit history."));

  children.push(h2("Background of the Invention"));
  children.push(para("Gig economy delivery workers represent a rapidly growing segment of the global workforce, with an estimated 50 million active delivery riders worldwide. Despite representing a significant economic demographic, these workers are systematically excluded from traditional financial services. Banks and non-banking financial companies (NBFCs) rely primarily on credit bureau data, income tax returns, and formal employment records to assess creditworthiness. Gig workers, by definition, lack formal employment records, have irregular income patterns, and frequently have thin or non-existent credit files. This creates a paradox: the workers who most need access to credit for vehicle purchase, maintenance, and emergency expenses are precisely the workers who cannot obtain it."));
  children.push(para("Existing attempts to address this gap include platform-specific financial products offered by some delivery platforms (e.g., Swiggy's loan program in India), but these are limited to riders who operate exclusively or primarily on that single platform. No existing system aggregates delivery performance data across multiple platforms to create a comprehensive view of a rider's work consistency, reliability, and earning capacity. This is a critical gap because most active riders operate on 2-4 platforms simultaneously, and their aggregate performance across all platforms provides a far more accurate and comprehensive picture of their creditworthiness than any single platform's data alone."));

  children.push(h2("Summary of the Invention"));
  children.push(para("The present invention provides a system and method for generating a Multi-Platform Gig Credit Score (MPGCS) that leverages aggregated delivery performance data from multiple independent delivery platforms to assess the creditworthiness of gig economy delivery workers. The system collects, normalizes, and analyzes cross-platform delivery data including order completion rates, on-time delivery rates, customer ratings, earnings consistency, active working hours, and platform diversity metrics to compute a credit score that is predictive of the worker's ability and willingness to repay financial obligations."));
  children.push(para("In one aspect, the invention provides a method comprising: (a) collecting delivery performance data from a plurality of delivery platforms on which a gig worker is registered; (b) normalizing said data into a unified performance data structure; (c) computing a Multi-Platform Gig Credit Score using a weighted combination of at least: cross-platform order completion rate, cross-platform on-time delivery rate, earnings stability index, platform diversity score, active working consistency index, and customer satisfaction composite; (d) making said credit score available to partnered financial institutions through a secure API; and (e) enabling automated loan origination, insurance underwriting, and savings product recommendations based on said score."));

  children.push(h2("Detailed Description of the Invention"));

  children.push(h3("1. Data Collection and Normalization"));
  children.push(para("The system collects the following performance metrics from each connected delivery platform for each rider: total orders received, total orders completed, total orders cancelled (by rider), average delivery time, percentage of on-time deliveries, average customer rating, total earnings (daily, weekly, monthly), number of active days per month, average daily active hours, peak earning hours, and platform-specific performance tier or badge level. These metrics are normalized across platforms using platform-specific adjustment factors that account for differences in platform standards (e.g., a 4.5 rating on Platform A may be equivalent to a 4.2 on Platform B due to different rating distributions)."));

  children.push(h3("2. Multi-Platform Gig Credit Score Computation"));
  children.push(para("The MPGCS is computed as a score ranging from 300 to 900, calibrated to be comparable with traditional credit bureau scores for financial institution integration. The score comprises the following weighted components:"));

  children.push(makeTable(
    ["Component", "Weight", "Description", "Data Source"],
    [
      ["Order Completion Rate", "20%", "Ratio of completed orders to total received orders across all platforms", "All connected platforms"],
      ["On-Time Delivery Rate", "15%", "Percentage of deliveries completed within the estimated delivery window across all platforms", "All connected platforms"],
      ["Earnings Stability Index", "20%", "Coefficient of variation of monthly earnings over the past 6 months; lower variation indicates higher stability", "All connected platforms, aggregated"],
      ["Platform Diversity Score", "10%", "Number of active platforms and distribution of earnings across them; multi-platform operation indicates resilience", "Platform registration data"],
      ["Working Consistency Index", "15%", "Regular active hours per week with low variance; indicates reliable work habits", "All connected platforms, aggregated"],
      ["Customer Satisfaction Composite", "10%", "Weighted average of customer ratings across all platforms, adjusted for platform-specific rating distributions", "All connected platforms"],
      ["Tenure and Trend Factor", "10%", "Length of gig work history and trend direction of recent performance metrics", "All connected platforms, historical"],
    ],
    [20, 8, 42, 20]
  ));

  children.push(emptyLine());
  children.push(para("The score is recomputed on a rolling basis using the most recent 6 months of data, with an exponential decay function that weights recent performance more heavily than older performance. This ensures that the score reflects the rider's current trajectory and work habits rather than being anchored to historical performance that may no longer be representative."));

  children.push(h3("3. Financial Institution Integration"));
  children.push(para("The MPGCS is made available to partnered financial institutions (banks, NBFCs, insurance companies) through a secure REST API. The API provides: (a) the composite MPGCS score, (b) component-level breakdowns for underwriting transparency, (c) trend indicators showing whether the score is improving, stable, or declining, and (d) verification of the rider's identity and platform accounts. Financial institutions use this data to automate loan origination decisions, set interest rates based on risk tiers, determine insurance premium levels, and establish credit limits for revolving credit products. The system also provides a pre-qualification engine that shows riders which financial products they qualify for before they apply, reducing application friction and improving conversion rates."));

  children.push(h2("Claims (Outline for Complete Specification)"));
  children.push(para("Claim 1: A method for generating a credit score for a gig economy worker based on aggregated delivery performance data from multiple independent delivery platforms. Claim 2: The method of Claim 1, wherein the credit score comprises weighted components including order completion rate, on-time delivery rate, earnings stability index, platform diversity score, working consistency index, customer satisfaction composite, and tenure and trend factor. Claim 3: The method of Claim 1, further comprising normalizing performance data across platforms using platform-specific adjustment factors. Claim 4: The method of Claim 1, further comprising providing said credit score to financial institutions through a secure API for automated loan origination and insurance underwriting. Claim 5: A system for computing and distributing multi-platform gig credit scores, comprising a data aggregation module, a normalization module, a credit scoring engine, and a financial institution API module."));

  children.push(h2("Drawings (Description of Figures to be Provided)"));
  children.push(para("Figure 1: System architecture diagram. Figure 2: Data normalization flow across heterogeneous platform data. Figure 3: MPGCS computation algorithm flowchart. Figure 4: Financial institution API integration architecture. Figure 5: Pre-qualification engine user interface flow. Figure 6: Score trend analysis and reporting visualization."));

  return children;
}

// ── PATENT 3: Geographic Batching ──
function buildPatent3() {
  const children = [];

  children.push(h1("Provisional Patent Specification - Patent III"));
  children.push(h2("Title of Invention"));
  children.push(para("System and Method for Geographic Delivery Batching Across Independent Delivery Platforms for Gig Economy Workers"));

  children.push(h2("Field of the Invention"));
  children.push(para("The present invention relates generally to the field of logistics optimization and route planning, and more particularly to a system and method for identifying and presenting geographically batchable delivery order combinations that originate from multiple independent delivery platforms, enabling gig economy delivery workers to execute multiple deliveries in a single optimized route."));

  children.push(h2("Background of the Invention"));
  children.push(para("Delivery workers in the gig economy frequently receive orders from multiple platforms simultaneously. Currently, there is no mechanism for a delivery worker to identify when two or more orders from different platforms can be efficiently combined into a single delivery route. As a result, workers either accept only one order at a time (leading to suboptimal earnings and longer idle periods) or accept multiple orders without geographic awareness (leading to overlapping routes, missed delivery windows, and customer dissatisfaction). Existing route optimization solutions operate within a single platform's ecosystem and cannot access order data from competing platforms, creating a fundamental limitation that no single platform can overcome independently."));

  children.push(h2("Summary of the Invention"));
  children.push(para("The present invention provides a system and method for identifying delivery orders from multiple independent platforms that can be efficiently batched together based on geographic proximity of pickup and delivery locations, compatible delivery time windows, and combined route optimization. The system computes a Stack Score for each potential order combination that quantifies the efficiency gain (or loss) of executing the orders as a batch compared to individually, and presents viable stacks to the rider with estimated combined earnings, route visualization, and time feasibility analysis."));

  children.push(h2("Detailed Description of the Invention"));

  children.push(h3("1. Cross-Platform Order Proximity Detection"));
  children.push(para("The system continuously monitors active orders from all connected delivery platforms and computes geographic proximity between: (a) pickup locations of different orders, (b) delivery destinations of different orders, and (c) pickup locations of one order and delivery destinations of another order. Proximity is measured using Haversine distance calculations between GPS coordinates, with configurable proximity thresholds that vary based on local geographic conditions (e.g., urban vs. suburban vs. rural areas). Orders whose pickup locations are within the pickup proximity threshold (default 2 km) and whose delivery destinations are within the delivery proximity threshold (default 3 km) are flagged as potential stack candidates."));

  children.push(h3("2. Route Optimization and Stack Scoring"));
  children.push(para("For each group of flagged stack candidates, the system computes an optimized delivery route using a modified Traveling Salesman Problem (TSP) solver that considers real-time traffic data, one-way street restrictions, and mode-of-transport constraints (e.g., bicycle vs. motorcycle vs. car). The Stack Score is then computed as: StackScore = (CombinedEarnings / OptimizedRouteDistance) - Average(IndividualEarnings / IndividualDistances). A StackScore greater than zero indicates that the batched delivery is more efficient than individual deliveries. The system also computes a Time Feasibility Score that verifies all orders in the stack can be delivered within their respective countdown and delivery windows, accounting for realistic transit times with a safety margin."));

  children.push(h3("3. Stack Presentation and Acceptance"));
  children.push(para("Viable stacks with positive StackScores and passing Time Feasibility Scores are presented to the rider in the unified interface as stacked delivery options. Each stack card displays: the constituent orders with their platform badges, combined total earnings, optimized route visualization on a map, estimated total distance and duration compared to individual delivery totals, and the StackScore prominently displayed. The rider can accept the entire stack with a single tap, which triggers sequential acceptance of each individual order through the Order Acceptance Relay Module."));

  children.push(h2("Claims (Outline for Complete Specification)"));
  children.push(para("Claim 1: A method for identifying geographically batchable delivery orders from multiple independent delivery platforms, comprising the steps of monitoring active orders, computing geographic proximity between order locations, generating optimized delivery routes, and computing stack efficiency scores. Claim 2: The method of Claim 1, wherein the stack efficiency score is computed as the difference between batched delivery efficiency and average individual delivery efficiency. Claim 3: The method of Claim 1, further comprising a time feasibility analysis that verifies all orders in a stack can be delivered within their respective delivery windows. Claim 4: A system for cross-platform geographic delivery batching, comprising an order proximity detection module, a route optimization engine, a stack scoring module, and a unified stack presentation interface."));

  children.push(h2("Drawings (Description of Figures to be Provided)"));
  children.push(para("Figure 1: System architecture for cross-platform geographic batching. Figure 2: Order proximity detection algorithm flowchart. Figure 3: Route optimization with multi-platform order constraints. Figure 4: Stack Score computation flowchart. Figure 5: Stack presentation interface layout. Figure 6: Sequential acceptance flow for stacked orders."));

  return children;
}

// ── NDA Template ──
function buildNDA() {
  const children = [];

  children.push(h1("Non-Disclosure Agreement (NDA) Template"));
  children.push(para("This Non-Disclosure Agreement (the \"Agreement\") is entered into as of the date of signature below (the \"Effective Date\") by and between:"));
  children.push(emptyLine());
  children.push(boldPara("Disclosing Party: ", "GigRider Technologies Private Limited (\"Company\"), a company incorporated under the laws of India, having its registered office at [Registered Address]"));
  children.push(boldPara("Receiving Party: ", "[Investor/Company Name], a [entity type] incorporated under the laws of [jurisdiction], having its principal office at [Address]"));
  children.push(emptyLine());

  children.push(h2("1. Definition of Confidential Information"));
  children.push(para("\"Confidential Information\" means any and all information disclosed by the Company to the Receiving Party, whether orally, in writing, electronically, or by any other means, including but not limited to: (a) business plans, strategies, and projections; (b) technology, software, algorithms, source code, and technical specifications; (c) patent applications and intellectual property; (d) financial data, revenue models, and pricing strategies; (e) customer lists, rider data, and platform integration methods; (f) marketing plans and competitive analysis; and (g) any other information that a reasonable person would understand to be confidential or proprietary in nature."));

  children.push(h2("2. Obligations of Receiving Party"));
  children.push(para("The Receiving Party agrees to: (a) hold all Confidential Information in strict confidence and not disclose it to any third party without the prior written consent of the Company; (b) use the Confidential Information solely for the purpose of evaluating a potential investment or business relationship with the Company; (c) restrict access to the Confidential Information to its employees, officers, directors, and advisors who have a genuine need to know and who are bound by confidentiality obligations no less restrictive than those contained in this Agreement; (d) not reverse engineer, decompile, or disassemble any software or technology disclosed; and (e) not use the Confidential Information to compete with the Company or to assist any third party in competing with the Company."));

  children.push(h2("3. Exclusions"));
  children.push(para("Confidential Information does not include information that: (a) was publicly known prior to disclosure; (b) becomes publicly known through no wrongful act of the Receiving Party; (c) was already in the Receiving Party's possession prior to disclosure; (d) is independently developed by the Receiving Party without reference to the Confidential Information; or (e) is rightfully obtained from a third party without restriction on disclosure."));

  children.push(h2("4. Term"));
  children.push(para("This Agreement shall remain in effect for a period of three (3) years from the Effective Date. The obligations of confidentiality shall survive the termination of this Agreement for a period of five (5) years from the date of termination."));

  children.push(h2("5. Return of Materials"));
  children.push(para("Upon the written request of the Company, or upon the termination of discussions between the parties, the Receiving Party shall promptly return or destroy all copies of Confidential Information in its possession and certify in writing that it has done so."));

  children.push(h2("6. Remedies"));
  children.push(para("The Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to the Company for which monetary damages would be inadequate. Accordingly, the Company shall be entitled to seek injunctive relief in addition to all other remedies available at law or in equity."));

  children.push(h2("7. Governing Law"));
  children.push(para("This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising under this Agreement shall be subject to the exclusive jurisdiction of the courts of [City, India]."));

  children.push(h2("8. Signatures"));
  children.push(emptyLine());
  children.push(boldPara("For the Company (Disclosing Party):", ""));
  children.push(para("Name: [Authorized Signatory Name]"));
  children.push(para("Title: [Title]"));
  children.push(para("Date: [Date]"));
  children.push(para("Signature: ________________________"));
  children.push(emptyLine());
  children.push(boldPara("For the Receiving Party:", ""));
  children.push(para("Name: [Authorized Signatory Name]"));
  children.push(para("Title: [Title]"));
  children.push(para("Date: [Date]"));
  children.push(para("Signature: ________________________"));

  return children;
}

// ── FILING CHECKLIST ──
function buildChecklist() {
  const children = [];

  children.push(h1("Provisional Patent Filing Checklist"));
  children.push(para("This checklist provides a step-by-step guide for filing the three provisional patent applications with the Indian Patent Office. Each step must be completed before proceeding to the next. The total process can be completed in a single day for all three patents if all materials are prepared in advance."));

  children.push(h2("Pre-Filing Preparation"));
  children.push(makeTable(
    ["Step", "Action", "Status", "Notes"],
    [
      ["1", "Finalize invention descriptions for all 3 patents", "[ ]", "Use the Provisional Specifications in this document as the base"],
      ["2", "Prepare flowchart diagrams for each patent", "[ ]", "Hand-drawn or digital flowcharts are acceptable for provisional filing"],
      ["3", "Conduct prior art search on Google Patents and IPO website", "[ ]", "Search for: delivery aggregation, gig worker credit scoring, multi-platform batching"],
      ["4", "Confirm inventor names and addresses", "[ ]", "All contributing inventors must be listed"],
      ["5", "Decide applicant entity (individual, startup, or company)", "[ ]", "Startup status reduces filing fees by 50%"],
    ],
    [8, 40, 10, 42]
  ));

  children.push(h2("Filing Documents (Per Patent)"));
  children.push(makeTable(
    ["Form", "Description", "Fee (Startup)", "Fee (Individual)"],
    [
      ["Form 1", "Application for Grant of Patent", "Rs 800", "Rs 1,600"],
      ["Form 2", "Provisional Specification", "Rs 800", "Rs 1,600"],
      ["Form 5", "Declaration of Inventorship", "No fee", "No fee"],
      ["Form 3", "Statement and Undertaking (foreign applications)", "No fee", "No fee"],
      ["Form 26", "Power of Attorney (if using agent)", "No fee", "No fee"],
    ],
    [15, 40, 22, 23]
  ));

  children.push(h2("Filing Methods"));
  children.push(para("Online filing (recommended): File through the Indian Patent Office e-filing portal at ipindiaonline.gov.in. Create an account, upload all forms and the provisional specification as PDF documents, and pay fees online. You receive an immediate filing receipt with your application number and filing date. This is the fastest method and is available 24/7."));
  children.push(para("Offline filing: Submit physical copies of all forms and specifications at the nearest Patent Office (Kolkata, Mumbai, Delhi, or Chennai). Filing date is the date of physical submission."));

  children.push(h2("Post-Filing Actions"));
  children.push(makeTable(
    ["Timeline", "Action", "Critical?"],
    [
      ["Within 12 months", "File Complete Specification with detailed claims for each patent", "YES - Failure to file within 12 months abandons the application"],
      ["Within 12 months", "File PCT international application if global protection is desired", "Recommended for international expansion plans"],
      ["Within 12 months", "Engage a registered patent attorney to draft complete claims", "Strongly recommended - claims are the most critical part of a patent"],
      ["Ongoing", "Mark all marketing materials and presentations with \"Patent Pending\"", "Important for deterrence and investor confidence"],
      ["Ongoing", "Maintain invention logs with dated records of all development", "Important for proving priority if challenged"],
    ],
    [15, 60, 25]
  ));

  children.push(h2("Cost Summary for All Three Patents"));
  children.push(makeTable(
    ["Item", "Cost per Patent", "Total (3 Patents)"],
    [
      ["Provisional filing fee (startup)", "Rs 1,600", "Rs 4,800"],
      ["Provisional filing fee (individual)", "Rs 3,200", "Rs 9,600"],
      ["Patent attorney (complete spec, per patent)", "Rs 30,000-80,000", "Rs 90,000-2,40,000"],
      ["PCT international filing (per patent)", "Rs 50,000-1,00,000", "Rs 1,50,000-3,00,000"],
      ["Total (India only, startup)", "", "Rs 94,800-2,44,800"],
      ["Total (India + PCT, startup)", "", "Rs 2,44,800-5,44,800"],
    ],
    [40, 30, 30]
  ));

  children.push(h2("Important Reminders"));
  children.push(para("First, file the provisional patent BEFORE making any public disclosure of the invention details. India provides a 12-month grace period, but most foreign jurisdictions do not. Second, do not publish source code, algorithm details, or system architecture diagrams on any public platform (GitHub, blogs, social media) before filing. Third, have every person who sees the technical details sign an NDA before disclosure. Fourth, the provisional specification does not require formal claims, but it must describe the invention with sufficient detail that a person skilled in the art can understand and reproduce it. The specifications in this document meet this requirement. Fifth, once filed, you can immediately and legally use the term \"Patent Pending\" in all presentations, marketing materials, and product descriptions."));

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
  sections: [
    // Cover Section
    {
      properties: {
        page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } },
      },
      children: buildCover({
        title: "System and Method for Multi-Platform Delivery Order Aggregation, Prioritization, and Unified Presentation for Gig Economy Workers",
        applicant: "GigRider Technologies Private Limited",
        date: "April 2026",
        jurisdiction: "Republic of India",
      }),
    },
    // Body Section (all content)
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
              children: [new TextRun({ text: "GigRider Technologies \u2014 Provisional Patent Specifications & NDA", size: 18, color: "808080", font: { ascii: "Times New Roman" } })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "CONFIDENTIAL \u2014 ", size: 16, color: "999999", font: { ascii: "Times New Roman" } }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" })],
            }),
          ],
        }),
      },
      children: [
        ...buildPatent1(),
        ...buildPatent2(),
        ...buildPatent3(),
        ...buildNDA(),
        ...buildChecklist(),
      ],
    },
  ],
});

// ── Generate ──
const outputPath = "/home/z/my-project/download/GigRider_Provisional_Patents_and_NDA.docx";
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log("Document generated at: " + outputPath);
});
