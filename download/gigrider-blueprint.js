const { Document, Packer, Paragraph, TextRun, Header, Footer, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, PageNumber, BorderStyle, WidthType, ShadingType, PageBreak,
  TabStopPosition, TabStopType, NumberFormat
} = require("docx");
const fs = require("fs");

// Palette - GO-1 Graphite Orange (proposal/plan)
const P = {
  primary: "1A2330",
  body: "2C3E50",
  secondary: "607080",
  accent: "D4875A",
  surface: "F8F0EB",
  white: "FFFFFF",
  black: "000000",
  lightGray: "F5F3F0",
  midGray: "D0D0D0",
};

const DOCX_SCRIPTS = "/home/z/my-project/skills/docx/scripts";

function c(hex) { return hex.replace("#", ""); }

// Cover recipe R4 - Top Color Block
function buildCover(config) {
  const NB = { style: BorderStyle.NONE, size: 0, color: c(P.white) };
  const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [
      new TableRow({
        height: { value: 5000, rule: "exact" },
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: allNoBorders,
            shading: { type: ShadingType.CLEAR, fill: c(P.primary) },
            verticalAlign: "top",
            children: [
              new Paragraph({ spacing: { before: 2200 }, children: [] }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { line: 828, lineRule: "atLeast" },
                children: [
                  new TextRun({ text: "GIGRIDER", font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 72, bold: true, color: c(P.white) }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, line: 460, lineRule: "atLeast" },
                children: [
                  new TextRun({ text: "App Development Blueprint", font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, color: c(P.accent) }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 400 },
                children: [
                  new TextRun({ text: "One App. Every Platform. More Earnings.", font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 22, color: "B0B8C0" }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        height: { value: 11838, rule: "exact" },
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: allNoBorders,
            verticalAlign: "top",
            children: [
              new Paragraph({ spacing: { before: 1800 }, children: [] }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 100, after: 200 },
                children: [
                  new TextRun({ text: "COMPLETE GUIDE TO BUILDING A PRODUCTION-READY", font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.primary) }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 600 },
                children: [
                  new TextRun({ text: "DELIVERY PARTNER AGGREGATION APP", font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.primary) }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "What You Have Now  |  What You Need  |  Step-by-Step Roadmap  |  Costs & Timeline", font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 20, color: c(P.secondary) }),
                ],
              }),
              new Paragraph({ spacing: { before: 2000 }, children: [] }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Prepared: April 2026", font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 20, color: c(P.secondary) }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80 },
                children: [
                  new TextRun({ text: "Confidential", font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 18, color: c(P.accent) }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [
      new TextRun({ text, bold: true, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, color: c(P.primary) }),
    ],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({ text, bold: true, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, color: c(P.primary) }),
    ],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({ text, bold: true, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 26, color: c(P.body) }),
    ],
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: [
      new TextRun({ text, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 22, color: c(P.body) }),
    ],
  });
}

function bodyBold(text) {
  return new Paragraph({
    spacing: { line: 312, after: 120 },
    children: [
      new TextRun({ text, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 22, color: c(P.body), bold: true }),
    ],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    spacing: { line: 312, after: 80 },
    indent: { left: 480 + level * 360 },
    children: [
      new TextRun({ text: "\u2022  ", font: { ascii: "Calibri" }, size: 22, color: c(P.accent) }),
      new TextRun({ text, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 22, color: c(P.body) }),
    ],
  });
}

function numberedItem(num, text) {
  return new Paragraph({
    spacing: { line: 312, after: 80 },
    indent: { left: 480 },
    children: [
      new TextRun({ text: `${num}. `, font: { ascii: "Calibri" }, size: 22, color: c(P.accent), bold: true }),
      new TextRun({ text, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 22, color: c(P.body) }),
    ],
  });
}

function highlightBox(text) {
  const NB = { style: BorderStyle.NONE, size: 0, color: c(P.white) };
  const leftBorder = { style: BorderStyle.SINGLE, size: 18, color: c(P.accent) };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: NB, bottom: NB, left: leftBorder, right: NB, insideHorizontal: NB, insideVertical: NB },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: c(P.surface) },
            borders: { top: NB, bottom: NB, left: NB, right: NB },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: [
              new Paragraph({
                spacing: { line: 312 },
                children: [
                  new TextRun({ text, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 22, color: c(P.primary), bold: true }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function makeTable(headers, rows) {
  const NB = { style: BorderStyle.NONE, size: 0, color: c(P.white) };
  const headerBorder = { top: { style: BorderStyle.SINGLE, size: 6, color: c(P.accent) }, bottom: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) }, left: NB, right: NB };
  const bottomBorder = { top: NB, bottom: { style: BorderStyle.SINGLE, size: 6, color: c(P.accent) }, left: NB, right: NB };
  const rowBorder = { top: NB, bottom: { style: BorderStyle.SINGLE, size: 1, color: c(P.midGray) }, left: NB, right: NB };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(h => new TableCell({
          shading: { type: ShadingType.CLEAR, fill: c(P.surface) },
          borders: headerBorder,
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 20, color: c(P.primary) })] })],
        })),
      }),
      ...rows.map((row, idx) => new TableRow({
        children: row.map(cell => new TableCell({
          borders: idx === rows.length - 1 ? bottomBorder : rowBorder,
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: cell, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 20, color: c(P.body) })] })],
        })),
      })),
    ],
  });
}

// ─── Document ───
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 22, color: c(P.body) },
        paragraph: { spacing: { line: 312 } },
      },
    },
  },
  sections: [
    // Cover section
    {
      properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 }, size: { width: 11906, height: 16838 } } },
      children: [buildCover({})],
    },
    // Body section
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          size: { width: 11906, height: 16838 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(P.secondary) }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ── SECTION 1: What You Have Now ──
        heading1("1. What You Have Right Now"),
        body("You currently have a fully functional, interactive web prototype of GigRider. This is a demonstrable, clickable, animated web application that showcases every major feature of the app concept. It runs in any modern browser and can be presented to investors, partners, or developers to communicate the exact vision for the product. Think of it as a high-fidelity blueprint that anyone can experience firsthand."),
        body("The prototype includes seven complete screens: a splash screen with animated logo and progress bar, a home dashboard with live order feed showing incoming orders from multiple delivery platforms simultaneously, an earnings tracker with platform-wise breakdowns and animated counters, a platforms management screen with connection toggles and auto-accept rules configuration, an activity log with filtering, a profile screen with rider statistics and achievements, and a bottom navigation bar with smooth screen transitions. Every button is tappable, every toggle works, and every animation plays as designed."),
        highlightBox("PROTOTYPE = Your pitch deck that investors can actually TOUCH and USE. This is incredibly valuable for fundraising."),
        body("However, a web prototype is not a production app. It uses mock data instead of real delivery platform APIs. It runs in a browser, not as a native Android app. It has no backend server, no database, no user authentication, and no push notifications. The sections below explain exactly what is needed to transform this prototype into a real, revenue-generating product."),

        // ── SECTION 2: What Is Required ──
        heading1("2. What Is Required for a Full Production App"),
        body("Building a production-ready app involves multiple layers of technology, legal compliance, and operational infrastructure. This section breaks down every requirement into clear categories so you understand exactly what you are building toward."),

        heading2("2.1 Technical Architecture"),
        body("A production app needs a three-tier architecture: a mobile frontend (Android app), a backend server (API + database), and third-party integrations (delivery platform APIs). Each tier has specific technology choices and development requirements that must be carefully planned and implemented."),

        heading3("2.1.1 Mobile App (Android)"),
        body("The mobile app is what riders install on their phones. It must be fast, reliable, and work even with poor internet connectivity since delivery riders frequently operate in areas with weak network signals. The app must also minimize battery consumption because riders are on the road for 8 to 12 hours daily."),
        makeTable(
          ["Requirement", "Details", "Why It Matters"],
          [
            ["Native Android App", "Built with Kotlin or React Native (Kotlin preferred for performance)", "Riders need speed; hybrid apps can lag with real-time order feeds"],
            ["Minimum Android Version", "Android 8.0 (API 26) and above", "Covers 95% of rider devices in India and emerging markets"],
            ["Background Service", "Foreground service that keeps listening for orders even when app is minimized", "If the app sleeps, riders miss orders; this is the #1 technical challenge"],
            ["Push Notifications", "Firebase Cloud Messaging (FCM) for instant order alerts", "Riders must see new orders within 1-2 seconds of posting"],
            ["Offline Mode", "Local caching of active deliveries, earnings data", "Riders go through dead zones; app must still show current delivery info"],
            ["GPS & Navigation", "Google Maps SDK integration for route display", "Riders need turn-by-turn navigation without switching apps"],
            ["Battery Optimization", "Efficient location tracking (not constant GPS polling)", "8-12 hour shifts mean battery life is critical"],
          ]
        ),

        heading3("2.1.2 Backend Server"),
        body("The backend is the brain of GigRider. It connects to each delivery platform, receives order notifications, routes them to the appropriate rider, and handles all business logic including auto-accept rules, earnings calculations, and payout processing."),
        makeTable(
          ["Component", "Technology", "Purpose"],
          [
            ["API Server", "Node.js with Express or NestJS (TypeScript)", "Handles all rider app requests, order routing, user management"],
            ["Database", "PostgreSQL (primary) + Redis (caching)", "Stores rider profiles, earnings, delivery history; Redis for real-time data"],
            ["Message Queue", "RabbitMQ or AWS SQS", "Buffers incoming orders from platforms before routing to riders"],
            ["WebSocket Server", "Socket.io or native WebSocket", "Real-time order push to rider apps (sub-second delivery)"],
            ["Authentication", "JWT + OAuth 2.0", "Secure rider login, platform account linking"],
            ["File Storage", "AWS S3 or Cloudflare R2", "Store rider documents (ID, vehicle registration, insurance)"],
            ["Monitoring", "Datadog or New Relic", "Track API health, order delivery latency, error rates"],
          ]
        ),

        heading3("2.1.3 Delivery Platform Integration"),
        body("This is the most critical and challenging part of the entire system. You need to receive orders from Swiggy, Zomato, Uber Eats, DoorDash, and other platforms in real-time. There are three possible approaches, each with different trade-offs in terms of legality, reliability, and scalability."),
        numberedItem(1, "Official API Partnership (Best, hardest to get): Approach each platform for a formal partnership API. Swiggy and Zomato have developer programs. This gives you direct, reliable, legal access to order data. However, platforms may be reluctant because they want riders using only their app."),
        numberedItem(2, "Notification Listener Service (Most practical): Build an Android background service that reads push notifications from each delivery app. When Swiggy sends a notification about a new order, your service captures it, extracts the order details, and displays it in GigRider. This is legal because you are reading notifications sent to the rider's own phone. Apps like Para (for Uber/Lyft drivers) used this exact approach successfully."),
        numberedItem(3, "Accessibility Service (Fallback): Android's accessibility API can read screen content from other apps. This is how apps like Google Read Aloud work. It is more invasive but provides more detailed data. Use this only if notification capture is insufficient for some platforms."),
        highlightBox("LEGAL POSITION: Reading notifications on the user's own device is LEGAL. You are not hacking, scraping, or violating terms of service. The rider explicitly installs your app and grants notification access permission."),

        heading2("2.2 Legal Requirements"),
        body("Legal compliance is non-negotiable for a startup that handles financial transactions and personal data. Below are the key legal requirements you must address, organized by category and priority."),

        heading3("2.2.1 Business Registration"),
        bullet("Register as a Private Limited Company (recommended) or LLP"),
        bullet("Obtain GST registration (mandatory in India for any business above 20 lakh annual turnover)"),
        bullet("Apply for Startup India recognition (tax benefits, easier compliance for first 3 years)"),
        bullet("Open a current bank account in the company name"),
        bullet("Trademark the name 'GigRider' and your logo (file before launching publicly)"),

        heading3("2.2.2 Data Protection & Privacy"),
        bullet("Comply with India's Digital Personal Data Protection Act 2023 (DPDP Act)"),
        bullet("Draft a comprehensive Privacy Policy explaining what data you collect and why"),
        bullet("Draft Terms of Service for riders"),
        bullet("Implement data encryption at rest (database) and in transit (HTTPS/WSS)"),
        bullet("Allow riders to export and delete their data (right to erasure)"),
        bullet("If expanding to EU: GDPR compliance becomes mandatory"),

        heading3("2.2.3 Financial Compliance"),
        bullet("RBI guidelines for payment intermediaries if you hold rider earnings before payout"),
        bullet("Partner with a RBI-licensed Payment Gateway (Razorpay, Cashfree) for payouts"),
        bullet("KYC verification for riders before enabling withdrawals (PAN card + bank account verification)"),
        bullet("Maintain proper accounting records and file annual tax returns"),
        bullet("If offering insurance: partner with a licensed insurance provider"),

        heading3("2.2.4 Platform Compliance"),
        bullet("Review each delivery platform's Terms of Service regarding third-party apps"),
        bullet("Notification listening is generally permitted (user controls their device)"),
        bullet("Never use official platform logos or trademarks in your marketing without permission"),
        bullet("Never claim to be affiliated with or endorsed by any delivery platform"),
        bullet("Consider reaching out to platforms proactively for partnership discussions"),

        heading2("2.3 Team Requirements"),
        body("Building a production app requires a team with diverse skills. While you can start small and scale, certain roles are essential from day one. Below is the recommended team structure for the MVP phase, followed by the scaling phase."),

        makeTable(
          ["Role", "MVP Phase", "Scaling Phase", "Key Responsibilities"],
          [
            ["Android Developer", "1 (Senior)", "2-3", "Native app, notification listener, GPS integration"],
            ["Backend Developer", "1 (Senior)", "2-3", "API server, database, WebSocket, integrations"],
            ["UI/UX Designer", "1 (Part-time)", "1 (Full-time)", "Mobile-first design, rider user research"],
            ["Product Manager", "You (Founder)", "1 Dedicated", "Feature prioritization, platform partnerships"],
            ["QA Engineer", "0 (Developers test)", "1", "Automated testing, device compatibility"],
            ["DevOps Engineer", "0 (Use managed services)", "1", "CI/CD, monitoring, scaling infrastructure"],
            ["Legal Advisor", "Consultant", "Part-time", "Compliance, contracts, partnerships"],
          ]
        ),

        heading2("2.4 Infrastructure & Costs"),
        body("Below is a realistic cost breakdown for building and running GigRider over the first 12 months. Costs are estimated for an India-based startup and assume you use cloud infrastructure (AWS/Google Cloud) with managed services to minimize DevOps overhead."),

        makeTable(
          ["Category", "MVP (Months 1-6)", "Scale (Months 7-12)", "Notes"],
          [
            ["Cloud Infrastructure", "5,000 - 10,000/month", "30,000 - 80,000/month", "AWS/Google Cloud; scales with users"],
            ["Android Developer Salary", "1,00,000 - 1,50,000/month", "2,00,000 - 3,00,000/month", "Senior Kotlin developer in India"],
            ["Backend Developer Salary", "1,00,000 - 1,50,000/month", "2,00,000 - 3,00,000/month", "Node.js + PostgreSQL expertise"],
            ["UI/UX Designer", "30,000 - 50,000/month", "60,000 - 80,000/month", "Part-time freelancer for MVP"],
            ["Google Play Developer Account", "One-time $25 (approx. 2,100)", "Same", "Required to publish on Play Store"],
            ["Apple Developer Account", "One-time $99/year (approx. 8,300)", "Same", "Required if building iOS version later"],
            ["Firebase / Push Services", "Free tier (up to 10K users)", "5,000 - 15,000/month", "FCM is free; analytics has paid tiers"],
            ["Payment Gateway (Razorpay)", "2% per transaction", "1.5% per transaction (volume discount)", "For rider payout withdrawals"],
            ["Maps API (Google)", "Free tier (28K loads/month)", "15,000 - 50,000/month", "Per-load pricing above free tier"],
            ["Legal & Compliance", "50,000 - 1,00,000 one-time", "20,000/month retainer", "Company registration, T&C, privacy policy"],
            ["Total (6 months)", "Approx. 15-25 Lakhs", "Approx. 30-60 Lakhs (6 months)", "Excludes marketing and office costs"],
          ]
        ),

        highlightBox("MVP BUDGET: 15-25 Lakhs INR for 6 months. This gets you a working app with real users on the Play Store."),

        // ── SECTION 3: Step-by-Step Roadmap ──
        heading1("3. Step-by-Step Roadmap"),
        body("This roadmap is designed to take you from the current prototype to a revenue-generating product in 6 months. Each phase has clear deliverables, success metrics, and decision points. The approach is deliberately lean: build the minimum viable product, get real riders using it, learn from their feedback, and iterate."),

        heading2("Phase 1: Foundation (Month 1)"),
        body("The first month is all about setting up the legal and technical foundation. No code is written for the production app yet. Instead, you establish the business entity, secure your brand, set up development infrastructure, and begin platform partnership conversations. This phase is unglamorous but absolutely critical. Skipping it leads to legal problems and technical debt later."),
        bullet("Register the company as a Private Limited Entity"),
        bullet("File trademark application for 'GigRider' name and logo"),
        bullet("Set up cloud infrastructure (AWS or Google Cloud account, domain, email)"),
        bullet("Create Google Play Developer Account ($25 one-time)"),
        bullet("Set up development workflow: GitHub repository, CI/CD pipeline, staging environment"),
        bullet("Draft Privacy Policy and Terms of Service (hire a startup lawyer)"),
        bullet("Begin outreach to Swiggy and Zomato developer partnership teams"),
        bullet("Hire the first Android developer (or find a technical co-founder)"),
        body("Success Metric: Company registered, trademark filed, developer hired or co-founder confirmed, development environment ready."),

        heading2("Phase 2: Core Backend + Notification Listener (Month 2-3)"),
        body("This is where the real technical work begins. The two most important engineering challenges are building the notification listener (which captures orders from each delivery platform) and the real-time WebSocket server (which pushes orders to riders instantly). Everything else depends on these two systems working reliably."),
        bullet("Build Android notification listener service that captures orders from Swiggy, Zomato, Uber Eats, DoorDash"),
        bullet("Implement notification parsing: extract restaurant name, pickup/drop location, earnings, delivery time from each platform's notification format"),
        bullet("Build backend API server with user authentication (phone OTP login), rider registration, and profile management"),
        bullet("Set up PostgreSQL database with schema for riders, orders, earnings, platforms, and payout records"),
        bullet("Implement WebSocket server for real-time order push to rider apps"),
        bullet("Build the auto-accept rules engine on the backend (minimum payout, maximum distance, preferred platforms)"),
        bullet("Implement GPS tracking and location-based features"),
        body("Success Metric: Notification listener successfully captures orders from at least 2 platforms. Backend can push orders to a test device in under 2 seconds."),

        heading2("Phase 3: Android App Development (Month 3-4)"),
        body("With the backend and notification listener working, you now build the actual Android app that riders will install. This is where the UI/UX from the prototype gets translated into native Android screens with real data flowing through them. The app must be fast, battery-efficient, and reliable because riders depend on it for their livelihood."),
        bullet("Build native Android screens based on the prototype design (Kotlin with Jetpack Compose)"),
        bullet("Implement real-time order feed with platform-colored cards and countdown timers"),
        bullet("Integrate Google Maps SDK for pickup/drop navigation"),
        bullet("Build earnings dashboard with real data from the backend"),
        bullet("Implement platform connection flow (rider logs into each platform through GigRider)"),
        bullet("Build auto-accept rules configuration screen with real backend integration"),
        bullet("Implement push notification handling (FCM)"),
        bullet("Battery optimization: use WorkManager for background tasks, efficient location updates"),
        bullet("Offline mode: cache active delivery and today's earnings locally"),
        body("Success Metric: Fully functional Android app that shows real orders from 2+ platforms, with navigation and earnings tracking working end-to-end."),

        heading2("Phase 4: Testing & Pilot (Month 5)"),
        body("Before launching publicly, you need to test the app with real delivery riders. This is the most important phase because it reveals problems you never anticipated. Riders will use the app in ways you did not expect, on devices you did not test, in network conditions you did not plan for. A controlled pilot with 20 to 50 riders gives you the feedback needed to fix critical issues before a wider launch."),
        bullet("Recruit 20-50 delivery riders in one city for a closed beta test"),
        bullet("Provide them with the app and collect daily feedback through a WhatsApp group"),
        bullet("Monitor crash rates, battery consumption, and order delivery latency"),
        bullet("Fix critical bugs discovered during the pilot"),
        bullet("Test payment flow: can riders actually withdraw their earnings?"),
        bullet("Test on at least 10 different Android device models (Samsung, Xiaomi, Realme, OnePlus, Vivo)"),
        bullet("Verify notification listener works reliably across different Android versions and battery optimization settings"),
        bullet("Measure key metrics: order capture rate, notification-to-screen latency, battery drain per hour"),
        body("Success Metric: 80%+ of pilot riders say they prefer GigRider over switching between multiple apps. Crash rate below 1%. Order capture rate above 95%."),

        heading2("Phase 5: Play Store Launch & Growth (Month 6+)"),
        body("With a tested, stable app and positive pilot feedback, you are ready to launch publicly on the Google Play Store. The launch is not the finish line; it is the starting line. Post-launch, the focus shifts to growth, partnerships, and monetization."),
        bullet("Publish on Google Play Store with optimized listing (ASO - App Store Optimization)"),
        bullet("Create rider onboarding flow: phone verification, KYC, platform connection tutorials"),
        bullet("Launch in one city first (Bangalore or Mumbai recommended for density of delivery riders)"),
        bullet("Partner with rider communities on WhatsApp and Telegram for word-of-mouth growth"),
        bullet("Implement referral program: existing riders earn bonus points for inviting other riders"),
        bullet("Begin monetization: launch Pro subscription (auto-accept rules, smart stack, analytics)"),
        bullet("Approach delivery platforms for official partnership discussions (now you have user data to negotiate with)"),
        bullet("Start fundraising conversations with investors (you now have a working product, real users, and traction)"),
        body("Success Metric: 1,000+ active riders within 3 months of launch. 10%+ converting to paid Pro subscribers."),

        // ── SECTION 4: Revenue Model ──
        heading1("4. Revenue Model"),
        body("GigRider has multiple revenue streams that can be activated progressively as the user base grows. The key principle is that the core app must always be free for riders. Charging riders to see their own orders would kill adoption. Instead, monetization comes from premium features, platform partnerships, and financial services."),

        makeTable(
          ["Revenue Stream", "How It Works", "Potential Monthly Revenue (at 10K riders)", "When to Activate"],
          [
            ["Pro Subscription", "Auto-accept rules, Smart Stack, advanced analytics, priority support", "5-10 Lakhs (at 99/month, 5-10% conversion)", "Month 6 (launch)"],
            ["Platform Partnerships", "Delivery platforms pay referral fees for rider signups and retention", "2-5 Lakhs (negotiated per platform)", "Month 8-10"],
            ["Featured Placement", "Platforms can boost their orders in the GigRider feed", "1-3 Lakhs", "Month 10-12"],
            ["Rider Financial Services", "Micro-loans, insurance, emergency cash (commission-based)", "3-8 Lakhs (via partnerships)", "Month 12+"],
            ["In-App Advertising", "Non-intrusive ads for rider gear, bike servicing, telecom plans", "1-2 Lakhs (CPM model)", "Month 8+"],
            ["Data Insights", "Anonymized earnings and market data reports for platforms/analysts", "2-5 Lakhs", "Month 12+"],
          ]
        ),

        highlightBox("TOTAL POTENTIAL at 10K riders: 14-33 Lakhs/month. At 100K riders: 1.4-3.3 Crores/month. This is why investors will be interested."),

        // ── SECTION 5: What I Can Build Now ──
        heading1("5. What I Can Build for You Right Now"),
        body("While a full production app requires the infrastructure, team, and processes described above, I can significantly enhance the current prototype to make it more impressive for presentations and investor meetings. Below are concrete improvements I can implement immediately."),

        heading2("5.1 Enhanced Prototype Features"),
        bullet("Add a backend API with Prisma database: real user registration, login, saved preferences, persistent earnings data"),
        bullet("Implement real-time order simulation: orders appear dynamically with realistic timing instead of being static mock data"),
        bullet("Add order sound effects and vibration feedback when new orders arrive"),
        bullet("Build an onboarding flow (language selection, vehicle type, platform sign-in screens)"),
        bullet("Create a detailed order acceptance animation with full-screen order details and map preview"),
        bullet("Add a day/night mode that automatically switches based on time (riders work nights too)"),
        bullet("Build a PWA (Progressive Web App) version that can be installed on Android from the browser"),
        bullet("Add multi-language support (Hindi, Tamil, Telugu, Kannada for Indian riders)"),

        heading2("5.2 Investor Presentation Materials"),
        bullet("Generate a professional pitch deck (PDF) with market size, competitive analysis, and financial projections"),
        bullet("Create a product demo video script for recording a walkthrough"),
        bullet("Build a landing page website for GigRider that collects early rider signups"),
        bullet("Generate detailed technical specification document for developers to follow"),

        heading2("5.3 Limitations of What I Can Build"),
        body("It is important to be transparent about what cannot be built in this environment. I cannot create a native Android APK file, set up a real Google Play Store listing, implement actual push notifications to mobile devices, connect to real Swiggy or Zomato APIs, process real payments, or deploy a production backend server. These require real infrastructure, platform partnerships, and mobile development tooling that go beyond a web development environment. However, everything I build here serves as the exact specification and working reference for the developers who will implement the production version."),

        // ── SECTION 6: Decision Framework ──
        heading1("6. Your Next Steps: Decision Framework"),
        body("You are at a crossroads. Based on your resources, timeline, and commitment level, here are three possible paths forward. Each has different risk profiles, costs, and time to market."),

        heading2("Path A: Bootstrap (Low Cost, Slower)"),
        bullet("Budget: 5-10 Lakhs INR"),
        bullet("Timeline: 8-12 months to launch"),
        bullet("You: Learn Android development yourself (Kotlin), build the app on weekends and evenings"),
        bullet("Hire: 1 freelance backend developer part-time"),
        bullet("Risk: Slow execution, you might lose motivation, competitors could emerge"),
        bullet("Best for: If you have limited funds but strong technical aptitude and patience"),

        heading2("Path B: Find a Technical Co-Founder (Medium Cost, Faster)"),
        bullet("Budget: 15-25 Lakhs INR"),
        bullet("Timeline: 4-6 months to launch"),
        bullet("You: Focus on business development, partnerships, and fundraising"),
        bullet("Co-founder: Handles all technical development (Android + backend)"),
        bullet("Risk: Finding the right co-founder takes time; equity split must be fair"),
        bullet("Best for: If you have some savings and strong business/networking skills"),

        heading2("Path C: Raise Pre-Seed Funding (Higher Cost, Fastest)"),
        bullet("Budget: 50 Lakhs - 1 Crore INR (raised from angels/incubators)"),
        bullet("Timeline: 3-4 months to launch"),
        bullet("You: Lead the company as CEO, hire a small team of 2-3 developers"),
        bullet("Team: Senior Android dev + backend dev + designer"),
        bullet("Risk: Giving up equity early, pressure to show traction quickly"),
        bullet("Best for: If your prototype presentation gets investors excited and you want to move fast"),

        highlightBox("RECOMMENDATION: Start with Path B. Use the current prototype to find a technical co-founder who shares your vision. That person can build the MVP while you handle business and partnerships. Then raise a pre-seed round to scale."),

        body("The prototype you have right now is your most powerful asset. It proves the concept works, shows the user experience, and demonstrates that you have thought through the product deeply. Most founders come to investors with slide decks. You are coming with a working demo. That is a massive advantage. Use it wisely."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/home/z/my-project/download/GigRider-Development-Blueprint.docx", buf);
  console.log("Document generated successfully!");
});
