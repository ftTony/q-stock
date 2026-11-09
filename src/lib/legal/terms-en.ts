import {
  LEGAL_CONTACT_EMAIL,
  type LegalDoc,
} from "./legal-shared";

export const enTerms: LegalDoc = {
  title: "Terms of Service",
  subtitle: "Read before use; registering or continuing to use means you agree",
  updatedLabel: "Effective",
  tocLabel: "Contents",
  highlights: [
    "This is a learning and tooling product, not investment advice, and it offers no trading access.",
    "Paper trading involves no real money and its results do not represent live returns.",
    "Quotes come from third parties and may be delayed or inaccurate; rely on your broker and the exchange.",
  ],
  sections: [
    {
      id: "acceptance",
      heading: "Acceptance",
      blocks: [
        {
          kind: "p",
          text: "These terms are an agreement between you and us governing your use of q-stock (Qianli Gu), including q-stock.cn, its subdomains and H5 pages (the “Service”). By registering, signing in or using the Service, you confirm that you have read and agree to these terms, the Privacy Policy and the Disclaimer. If you do not agree, do not use the Service.",
        },
        {
          kind: "p",
          text: "If you use the Service on behalf of an organisation, you represent that you are authorised to do so and that the organisation accepts responsibility under these terms.",
        },
      ],
    },
    {
      id: "service",
      heading: "The Service",
      blocks: [
        {
          kind: "p",
          text: "The Service is an information and tooling product for personal learning and technical practice. It includes multi-market quotes, candlestick and indicator charts, watchlists and price alerts, peer comparison, AI chart reads and chat, paper trading, strategy replay and review.",
        },
        {
          kind: "p",
          text: "We are not a securities firm, investment adviser, broker or asset manager. We do not open accounts, route orders, move funds, custody assets or provide investment advice. All quotes and news come from third parties and may be delayed, incomplete or incorrect; see the Disclaimer.",
        },
        {
          kind: "p",
          text: "Paper trading is for practice only and involves no real money. Simulated fills do not represent prices or returns achievable in live markets.",
        },
      ],
    },
    {
      id: "account",
      heading: "Accounts and eligibility",
      blocks: [
        {
          kind: "ul",
          items: [
            "You must be at least 18 years old and have full legal capacity.",
            "You must provide a valid email address and keep your password and credentials secure.",
            "Your account is personal: you may not transfer, lend or share it. You bear any loss caused by your failure to safeguard it.",
            "Notify us immediately if you become aware of unauthorised use of your account.",
          ],
        },
      ],
    },
    {
      id: "conduct",
      heading: "Acceptable use",
      blocks: [
        { kind: "p", text: "When using the Service you must not:" },
        {
          kind: "ul",
          items: [
            "Scrape data in bulk with crawlers, scripts or automation, or bypass rate limits, quotas or authentication.",
            "Resell or redistribute quotes, news or AI output, or use them to build a product that materially competes with the Service.",
            "Reverse engineer, crack, attack or scan the Service for vulnerabilities, or interfere with its operation.",
            "Upload unlawful, infringing or malicious content, or use the Service for money laundering, market manipulation or other unlawful activity.",
            "Circumvent legal restrictions that apply in your jurisdiction.",
          ],
        },
        {
          kind: "p",
          text: "If you breach these rules, we may restrict features, suspend or terminate your account, and pursue legal remedies.",
        },
      ],
    },
    {
      id: "third-party",
      heading: "Third-party data and credentials",
      blocks: [
        {
          kind: "p",
          text: "You may configure your own broker, exchange or AI provider credentials (BYOK). You represent and warrant that you are entitled to use those credentials and that such use does not breach the provider's terms. Any restriction, ban or claim arising from your use of credentials is your responsibility.",
        },
        {
          kind: "p",
          text: "We may also configure shared market-data sources. The accuracy, completeness and availability of market data are determined by the data providers, and we make no warranty regarding them.",
        },
      ],
    },
    {
      id: "payment",
      heading: "Paid offerings, licensing and refunds",
      blocks: [
        {
          kind: "p",
          text: "Some offerings (for example source code, deployment services or custom development) may be paid. Scope, price and delivery are governed by the relevant checkout page or a separate written agreement.",
        },
        {
          kind: "p",
          text: "Unless mandatory law or the offer page states otherwise, digital content and one-off services are non-refundable once delivered or commenced.",
        },
        {
          kind: "p",
          text: "Open-source components are licensed under the licence shipped with their repository. Commercial use must comply with that licence (for example AGPL-3.0) or a separate commercial licence.",
        },
        {
          kind: "p",
          text: "We may change prices or billing models; completed orders are unaffected.",
        },
      ],
    },
    {
      id: "ip",
      heading: "Intellectual property",
      blocks: [
        {
          kind: "p",
          text: "The software, interface design, copy, charts and brand marks of the Service belong to us or the respective rights holders. You receive only a limited, non-transferable licence necessary to use the Service.",
        },
        {
          kind: "p",
          text: "Content you create (watchlists, notes, strategy parameters) remains yours. You grant us the licence to store, process and display it as needed to provide the Service.",
        },
        {
          kind: "p",
          text: "You may not copy, modify, distribute, lease or sell any part of the Service without permission.",
        },
      ],
    },
    {
      id: "changes",
      heading: "Changes, availability and termination",
      blocks: [
        {
          kind: "p",
          text: "We may add, change or retire features, and may suspend the Service for maintenance, upgrades, third-party failures or events beyond our control. We aim to give notice but do not guarantee uninterrupted availability.",
        },
        {
          kind: "p",
          text: "You may stop using the Service and request deletion of your account at any time. We may terminate your access if you materially breach these terms.",
        },
      ],
    },
    {
      id: "liability",
      heading: "Disclaimers and limitation of liability",
      blocks: [
        {
          kind: "p",
          text: "The Service is provided “as is” and “as available”, without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose and non-infringement.",
        },
        {
          kind: "p",
          text: "To the maximum extent permitted by law, we are not liable for investment losses, lost profits, lost data, loss of goodwill, or any indirect, incidental or consequential damages.",
        },
        {
          kind: "p",
          text: "Where liability cannot be fully excluded, our aggregate liability is limited to the amount you actually paid for the Service in the preceding 12 months (zero for free users). Nothing here excludes liability that cannot be excluded by law, such as for wilful misconduct or gross negligence.",
        },
      ],
    },
    {
      id: "indemnity",
      heading: "Indemnity",
      blocks: [
        {
          kind: "p",
          text: "You agree to indemnify us against claims, penalties or losses (including reasonable legal fees) arising from your breach of these terms, infringement of third-party rights, or unlawful use of the Service.",
        },
      ],
    },
    {
      id: "third-party-links",
      heading: "Third-party links and services",
      blocks: [
        {
          kind: "p",
          text: "The Service may link to third-party sites, brokers or data services. We do not control and are not responsible for their content or conduct; you should read and follow their terms.",
        },
      ],
    },
    {
      id: "law",
      heading: "Governing law and disputes",
      blocks: [
        {
          kind: "p",
          text: "These terms are governed by the laws of the People's Republic of China (excluding, for this purpose, the laws of the Hong Kong SAR, the Macao SAR and the Taiwan region).",
        },
        {
          kind: "p",
          text: "Disputes should first be resolved through good-faith negotiation. Failing that, either party may bring an action before the competent people's court at the operator's place of residence.",
        },
        {
          kind: "p",
          text: "If you are located elsewhere, nothing in this section removes mandatory consumer-protection rights available to you under your local law.",
        },
      ],
    },
    {
      id: "updates",
      heading: "Changes to these terms",
      blocks: [
        {
          kind: "p",
          text: "We may update these terms. Updates will be published on this page with a new effective date, and material changes will be announced on the site or by email. Continued use means acceptance of the updated terms.",
        },
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      blocks: [
        {
          kind: "p",
          text: `Questions about these terms: ${LEGAL_CONTACT_EMAIL}.`,
        },
      ],
    },
  ],
};
