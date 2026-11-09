import {
  LEGAL_CONTACT_EMAIL,
  type LegalDoc,
} from "./legal-shared";

export const enPrivacy: LegalDoc = {
  title: "Privacy Policy",
  subtitle: "What we collect, how we use it, and how you stay in control",
  updatedLabel: "Effective",
  tocLabel: "Contents",
  highlights: [
    "We do not sell your personal data or use it for third-party ad profiling.",
    "Broker, exchange and AI credentials are stored encrypted and used only to make requests on your behalf.",
    "You can review, export or request deletion of your account data at any time.",
  ],
  sections: [
    {
      id: "scope",
      heading: "Scope and operator",
      blocks: [
        {
          kind: "p",
          text: "This policy applies to q-stock (Qianli Gu), including q-stock.cn and its subdomains and H5 pages (the “Service”). The Service is operated by an individual developer (“we”, “us”). For the purposes of this policy, we act as the controller of your personal data.",
        },
        {
          kind: "p",
          text: "This policy does not cover third-party services you reach through the Service, such as brokers, market-data vendors and AI model providers. Those services apply their own privacy policies.",
        },
      ],
    },
    {
      id: "collect",
      heading: "Information we collect",
      blocks: [
        { kind: "p", text: "To operate the Service, we collect the following categories of information:" },
        {
          kind: "ul",
          items: [
            "Account data: email address, password hash, third-party sign-in identifiers (if you use Google or GitHub), invite code and registration time.",
            "Content you create: watchlists, price alerts (including the destination email), paper-trading orders and fills, review notes and sentiment tags, AI conversations and generated output, strategy and backtest parameters.",
            "Credentials you configure: API keys for brokers (Longbridge, Futu), crypto exchanges (Binance, OKX) and AI model providers.",
            "Usage and device data: access logs (IP address, browser identifier, request path, timestamp), language and time-zone preferences, theme and price-color settings, and aggregate analytics (Google Analytics).",
            "Communications: emails, feedback or issue reports you send us.",
          ],
        },
      ],
    },
    {
      id: "credentials",
      heading: "Credentials and sensitive information",
      blocks: [
        {
          kind: "p",
          text: "API keys you submit are encrypted with a server-side key before being written to the database, and are decrypted only on the server when making quote, news or AI requests on your behalf. We never display a complete key in the interface, and never write it in plaintext to logs.",
        },
        {
          kind: "p",
          text: "We do not collect identity documents, bank card numbers, broker login passwords or funding-account details. The Service does not open accounts, move funds, match orders or custody assets.",
        },
        {
          kind: "p",
          text: "If you believe a credential has leaked, revoke it at the relevant broker, exchange or AI provider immediately, then delete or replace it in Settings.",
        },
      ],
    },
    {
      id: "purpose",
      heading: "Why we use it",
      blocks: [
        {
          kind: "ul",
          items: [
            "To deliver core features: quotes, watchlists, price alerts, paper trading, AI analysis and review.",
            "For account and security purposes: sign-in, password reset, abuse prevention and AI quota management.",
            "To improve the Service: aggregate analytics, troubleshooting and performance tuning.",
            "To send notifications: price alerts and watchlist digests, only when enabled by you.",
            "To comply with law, respond to lawful requests, or establish and defend legal claims.",
          ],
        },
        {
          kind: "p",
          text: "We do not use your personal data for automated decision-making that produces legal effects, and we do not use it to serve third-party advertising.",
        },
      ],
    },
    {
      id: "sharing",
      heading: "Third parties and sharing",
      blocks: [
        { kind: "p", text: "To provide the Service, some data is transmitted to the following categories of processors:" },
        {
          kind: "ul",
          items: [
            "Market data and news: Longbridge, Futu, Finnhub, Adanos and similar vendors (ticker symbols and time ranges; when you use your own credentials, requests are made in your name).",
            "AI models: DeepSeek, OpenAI-compatible endpoints, Google Gemini, Anthropic and similar providers (the prompts, symbols and chart summaries you submit for analysis).",
            "Email: Resend or your own SMTP server (destination address and alert content).",
            "Infrastructure: cloud hosting, CDN and database providers.",
            "Analytics: Google Analytics (which may involve cookies and device identifiers).",
          ],
        },
        {
          kind: "p",
          text: "We do not sell your personal data. We disclose it to third parties only as described above, where required by law, or where necessary to protect our rights and those of you and other users.",
        },
        {
          kind: "p",
          text: "Note that with BYOK, requests are processed by third parties under their own terms. Where such a provider is located outside your country, the request may constitute a cross-border transfer.",
        },
      ],
    },
    {
      id: "cookies",
      heading: "Cookies and local storage",
      blocks: [
        {
          kind: "p",
          text: "We use strictly necessary cookies to maintain your session and security checks, and store preferences such as language, theme and price-color convention in your browser. Google Analytics may set analytics cookies.",
        },
        {
          kind: "p",
          text: "You can clear or block cookies in your browser settings; blocking the necessary cookies will prevent sign-in.",
        },
      ],
    },
    {
      id: "cross-border",
      heading: "Where data is stored",
      blocks: [
        {
          kind: "p",
          text: "The Service runs on cloud servers, with its database in the hosting region. Because we rely on overseas market-data, AI and email providers, some request content (symbols, prompts, destination email) may be transferred outside that region.",
        },
        {
          kind: "p",
          text: "We select providers with appropriate compliance standing and require them to process data within the agreed scope. Where you are in the EEA or the UK, the basis for transfer is performance of our contract with you.",
        },
      ],
    },
    {
      id: "retention",
      heading: "Retention",
      blocks: [
        {
          kind: "p",
          text: "Account data is retained while your account exists. After you request deletion by email, we verify your identity and then delete or anonymise the associated data within 30 days, except where law requires retention. Access logs are generally kept for no more than 90 days and may be retained longer during a security investigation. Backups rotate on their normal cycle.",
        },
      ],
    },
    {
      id: "security",
      heading: "Security",
      blocks: [
        {
          kind: "p",
          text: "Measures include hashed passwords, encrypted credentials, HTTPS across the site, least-privilege access control, and routine dependency and image updates.",
        },
        {
          kind: "p",
          text: "No internet service is perfectly secure. If a security incident affects your rights, we will notify you and the competent authority as required by law.",
        },
      ],
    },
    {
      id: "rights",
      heading: "Your rights",
      blocks: [
        {
          kind: "ul",
          items: [
            "Access and correction: view and edit your account details, watchlists and alerts in Settings.",
            "Deletion: request account deletion by email; we process it after verifying your identity.",
            "Portability: request a copy of your account data in JSON by email.",
            "Withdraw consent: turn off alert emails, delete stored credentials, or sign out.",
            "Complaint: contact us, or lodge a complaint with your local data-protection authority.",
          ],
        },
        {
          kind: "p",
          text: "We respond within 15 business days, except where law provides otherwise or a request is manifestly repetitive or excessive.",
        },
      ],
    },
    {
      id: "minors",
      heading: "Minors",
      blocks: [
        {
          kind: "p",
          text: "The Service is intended for users aged 18 or older. We do not knowingly collect data from minors; if we learn of such an account, we will delete it and its data.",
        },
      ],
    },
    {
      id: "updates",
      heading: "Changes to this policy",
      blocks: [
        {
          kind: "p",
          text: "We may update this policy. Material changes will be announced on the site or by email, and the effective date above will be updated. Continued use after an update means acceptance; if you disagree, stop using the Service and request deletion of your account.",
        },
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      blocks: [
        {
          kind: "p",
          text: `For questions about this policy, to exercise your rights, or to complain, contact ${LEGAL_CONTACT_EMAIL}. We usually reply within 15 business days.`,
        },
      ],
    },
  ],
};

