/**
 * 法务文档正文（隐私政策 / 服务条款）。
 *
 * 维护说明：
 * - 只有 en 与 zh-CN 两个版本；zh-TW 复用 zh-CN，其余语言回落 en 并在页面上标注。
 * - 联系邮箱、生效日期集中在文件顶部，改动只需一处。
 * - 正文变化（新增第三方服务、接入支付等）需同步更新 LEGAL_UPDATED。
 */

export const LEGAL_CONTACT_EMAIL = "172993974@qq.com";
export const LEGAL_UPDATED = "2026-10-26";

export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

export type LegalSection = {
  id: string;
  heading: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  title: string;
  subtitle: string;
  updatedLabel: string;
  tocLabel: string;
  highlights: string[];
  sections: LegalSection[];
};

export type LegalDocKey = "privacy" | "terms";

const zhPrivacy: LegalDoc = {
  title: "隐私政策",
  subtitle: "我们收集什么、如何使用，以及你可以如何控制",
  updatedLabel: "生效日期",
  tocLabel: "目录",
  highlights: [
    "我们不出售你的个人数据，也不用于第三方广告画像。",
    "券商、交易所与 AI 凭证加密存储，仅用于代你发起请求。",
    "你可以随时查看、导出或申请删除你的账户数据。",
  ],
  sections: [
    {
      id: "scope",
      heading: "适用范围与运营者",
      blocks: [
        {
          kind: "p",
          text: "本政策适用于 q-stock（钱力股，含网站 q-stock.cn 及其子域、H5 页面，以下称“本服务”）。本服务由个人开发者运营（以下称“我们”）。就本政策而言，我们是你个人数据的处理者。",
        },
        {
          kind: "p",
          text: "本政策不适用于你通过本服务访问的第三方服务（例如券商、行情供应商、AI 模型提供商），这些服务适用其各自的隐私政策。",
        },
      ],
    },
    {
      id: "collect",
      heading: "我们收集的信息",
      blocks: [
        { kind: "p", text: "为提供服务，我们收集以下类别的信息：" },
        {
          kind: "ul",
          items: [
            "账户信息：邮箱地址、密码哈希、第三方登录标识（如你选择 Google/GitHub 登录）、邀请码与注册时间。",
            "你创建的内容：自选列表、价格提醒（含接收邮箱）、模拟交易订单与成交记录、复盘笔记与情绪标记、AI 对话记录与生成结果、策略与回测参数。",
            "你配置的凭证：券商（长桥/富途）、加密交易所（币安/OKX）、AI 模型服务的 API Key。",
            "使用与设备信息：访问日志（IP、浏览器标识、请求路径、时间）、语言与时区偏好、主题与涨跌色设置、汇总统计（Google Analytics）。",
            "通信内容：你发送给我们的邮件、反馈或问题报告。",
          ],
        },
      ],
    },
    {
      id: "credentials",
      heading: "凭证与敏感信息",
      blocks: [
        {
          kind: "p",
          text: "你提交的第三方 API Key 使用服务端密钥加密后存入数据库，仅在为你发起行情、资讯或 AI 请求时于服务端解密使用；界面上不会回显完整 Key，日志中不记录明文。",
        },
        {
          kind: "p",
          text: "我们不收集你的身份证件、银行卡号、券商账户登录密码或资金账户信息。本服务不提供开户、出入金、撮合或资产托管。",
        },
        {
          kind: "p",
          text: "若你认为凭证已泄露，请立即在对应的券商、交易所或 AI 平台吊销，并在设置页删除或替换。",
        },
      ],
    },
    {
      id: "purpose",
      heading: "使用目的与依据",
      blocks: [
        {
          kind: "ul",
          items: [
            "提供核心功能：行情展示、自选、价格提醒、模拟交易、AI 分析与复盘。",
            "账户与安全：登录、找回密码、防滥用、AI 配额管理。",
            "服务改进：汇总统计、故障排查、性能优化。",
            "通知：价格提醒与自选摘要，仅在你开启时发送。",
            "合规：响应有权机关依法提出的要求，或行使、抗辩法律主张。",
          ],
        },
        {
          kind: "p",
          text: "我们不会将你的个人数据用于产生法律效果的自动化决策，也不会基于你的数据向你投放第三方广告。",
        },
      ],
    },
    {
      id: "sharing",
      heading: "第三方服务与共享",
      blocks: [
        {
          kind: "p",
          text: "为实现功能，部分数据会传输给以下类型的第三方处理者：",
        },
        {
          kind: "ul",
          items: [
            "行情与资讯：长桥、富途、Finnhub、Adanos 等（传输标的代码与时间范围；使用你自己的凭证时，请求以你的名义发出）。",
            "AI 模型：DeepSeek、OpenAI 兼容服务、Google Gemini、Anthropic 等（传输你提交分析的提示词、标的与图表摘要）。",
            "邮件：Resend 或你自行配置的 SMTP 服务（传输收件邮箱与提醒内容）。",
            "基础设施：云主机与 CDN、数据库服务。",
            "统计分析：Google Analytics（可能涉及 Cookie 与设备标识）。",
          ],
        },
        {
          kind: "p",
          text: "我们不会出售你的个人数据。除上述处理者、法律要求或为保护我们与你及其他用户的权利所必需外，我们不会向第三方披露你的数据。",
        },
        {
          kind: "p",
          text: "请注意：使用 BYOK 时，请求由第三方按其自身条款处理；若该第三方位于境外，可能构成数据出境。",
        },
      ],
    },
    {
      id: "cookies",
      heading: "Cookie 与本地存储",
      blocks: [
        {
          kind: "p",
          text: "我们使用必要的 Cookie 维持登录会话与安全校验，并在浏览器本地存储语言、主题、涨跌色等偏好。Google Analytics 可能设置分析类 Cookie。",
        },
        {
          kind: "p",
          text: "你可以通过浏览器设置清除或拒绝 Cookie；拒绝必要 Cookie 将导致无法登录。",
        },
      ],
    },
    {
      id: "cross-border",
      heading: "存储地点与跨境传输",
      blocks: [
        {
          kind: "p",
          text: "本服务部署于云服务器，数据库位于服务部署区域。因使用境外行情、AI 与邮件服务，部分请求内容（标的代码、提示词、收件邮箱）可能传输至境外。",
        },
        {
          kind: "p",
          text: "我们会选择具备相应合规资质的服务商，并要求其在约定范围内处理数据。若你位于欧盟、英国等地区，相关传输依据为履行与你之间的合同所必需。",
        },
      ],
    },
    {
      id: "retention",
      heading: "保留期限",
      blocks: [
        {
          kind: "p",
          text: "账户数据在账户存续期间保留。你通过邮件申请删除账户后，我们在核实身份后 30 日内删除或匿名化相关数据，法律法规要求留存的除外。访问日志通常保留不超过 90 天，安全事件调查期间可延长。备份数据按备份周期滚动覆盖。",
        },
      ],
    },
    {
      id: "security",
      heading: "数据安全",
      blocks: [
        {
          kind: "p",
          text: "我们采取的措施包括：密码哈希存储、凭证加密、全站 HTTPS、最小权限的访问控制、依赖与镜像的安全更新。",
        },
        {
          kind: "p",
          text: "互联网环境不存在绝对安全。若发生影响你权益的数据安全事件，我们将依法通知你并向主管部门报告。",
        },
      ],
    },
    {
      id: "rights",
      heading: "你的权利",
      blocks: [
        {
          kind: "ul",
          items: [
            "访问与更正：在设置页查看并修改账户信息、自选与提醒。",
            "删除：发送邮件至下方联系邮箱申请删除账户，我们在核实身份后 30 日内处理。",
            "导出：可邮件申请获取账户数据副本（JSON 格式）。",
            "撤回同意：关闭提醒邮件、删除已保存的凭证、退出登录。",
            "投诉：向我们或你所在地的数据保护机构提出。",
          ],
        },
        {
          kind: "p",
          text: "我们将在 15 个工作日内响应你的请求；法律另有规定或请求明显重复、过度的除外。",
        },
      ],
    },
    {
      id: "minors",
      heading: "未成年人",
      blocks: [
        {
          kind: "p",
          text: "本服务面向年满 18 周岁的用户。我们不主动收集未成年人的个人数据；若发现相关账户，将予以删除并清理其数据。",
        },
      ],
    },
    {
      id: "updates",
      heading: "政策更新",
      blocks: [
        {
          kind: "p",
          text: "我们可能更新本政策。重大变更将通过站内公告或邮件提示，并更新本页顶部的生效日期。更新后继续使用即视为接受；如不同意，请停止使用并申请删除账户。",
        },
      ],
    },
    {
      id: "contact",
      heading: "联系我们",
      blocks: [
        {
          kind: "p",
          text: `如对本政策有疑问、需要行使上述权利或进行投诉，请联系：${LEGAL_CONTACT_EMAIL}。我们通常在 15 个工作日内回复。`,
        },
      ],
    },
  ],
};

const enPrivacy: LegalDoc = {
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

const zhTerms: LegalDoc = {
  title: "服务条款",
  subtitle: "使用前请阅读；注册或继续使用即表示同意",
  updatedLabel: "生效日期",
  tocLabel: "目录",
  highlights: [
    "本服务是学习与工具产品，不构成投资建议，不提供交易通道。",
    "模拟交易不涉及真实资金，结果不代表实盘收益。",
    "行情来自第三方，可能延迟或不准确，请以券商与交易所数据为准。",
  ],
  sections: [
    {
      id: "acceptance",
      heading: "条款的接受",
      blocks: [
        {
          kind: "p",
          text: "本条款是你与我们之间关于使用 q-stock（钱力股，含 q-stock.cn 及其子域、H5 页面，以下称“本服务”）的协议。注册、登录或使用本服务，即表示你已阅读并同意本条款、《隐私政策》与《免责声明》。若不同意，请勿使用本服务。",
        },
        {
          kind: "p",
          text: "若你代表组织使用本服务，视为你已获得该组织授权，并由该组织承担相应责任。",
        },
      ],
    },
    {
      id: "service",
      heading: "服务说明",
      blocks: [
        {
          kind: "p",
          text: "本服务是面向个人学习与技术实践的信息与工具产品，包括多市场行情展示、K 线与技术指标、自选与价格提醒、同行对比、AI 图表解读与对话、模拟交易、策略回放与复盘。",
        },
        {
          kind: "p",
          text: "本服务不是证券公司、投资顾问、经纪商或资产管理人，不提供开户、交易通道、资金划转、资产托管或投资建议。所有行情与资讯来自第三方，可能延迟、缺失或存在错误，详见《免责声明》。",
        },
        {
          kind: "p",
          text: "模拟交易仅用于练习，不涉及真实资金，其成交价格与结果不代表实盘中可以取得的成交或收益。",
        },
      ],
    },
    {
      id: "account",
      heading: "账户与资格",
      blocks: [
        {
          kind: "ul",
          items: [
            "你须年满 18 周岁，并具备完全民事行为能力。",
            "你应提供真实有效的邮箱，并妥善保管密码与登录凭证。",
            "账户仅供你本人使用，不得转让、出借或共享；因保管不善造成的损失由你承担。",
            "发现未经授权使用你的账户时，应立即通知我们。",
          ],
        },
      ],
    },
    {
      id: "conduct",
      heading: "使用规范",
      blocks: [
        { kind: "p", text: "使用本服务时，你不得：" },
        {
          kind: "ul",
          items: [
            "使用爬虫、脚本或自动化工具批量抓取数据，或绕过访问频率限制、配额与鉴权机制。",
            "将本服务的行情、资讯或 AI 输出转售、再分发，或用于构建与本服务实质竞争的产品。",
            "反向工程、破解、攻击、扫描漏洞，或干扰服务的正常运行。",
            "上传违法、侵权或恶意内容，或利用本服务从事洗钱、市场操纵等违法活动。",
            "以任何方式规避你所在司法辖区的法律限制。",
          ],
        },
        {
          kind: "p",
          text: "违反上述规范，我们可限制相关功能、暂停或终止你的账户，并保留追究法律责任的权利。",
        },
      ],
    },
    {
      id: "third-party",
      heading: "第三方数据与凭证",
      blocks: [
        {
          kind: "p",
          text: "你可以在设置页配置自己的券商、交易所或 AI 服务凭证（BYOK）。你声明并保证：你有权使用该凭证，且该使用不违反相应服务商的条款。因你的凭证使用导致第三方限制、封禁或索赔的，由你自行承担。",
        },
        {
          kind: "p",
          text: "平台侧也可能配置公共行情源。行情数据的准确性、完整性与可用性由数据提供方决定，我们不对其作出保证。",
        },
      ],
    },
    {
      id: "payment",
      heading: "付费、许可与退款",
      blocks: [
        {
          kind: "p",
          text: "部分内容（如源码、部署服务、定制开发）可能需要付费，具体范围、价格与交付方式以下单页面或双方书面约定为准。",
        },
        {
          kind: "p",
          text: "除法律强制规定或页面另有说明外，数字内容与一次性服务一经交付或开始执行，不支持退款。",
        },
        {
          kind: "p",
          text: "开源部分按其仓库所附许可证使用；商业使用请遵守对应许可证（如 AGPL-3.0）或另行取得商业授权。",
        },
        {
          kind: "p",
          text: "我们可能调整价格或计费方式，已完成的订单不受影响。",
        },
      ],
    },
    {
      id: "ip",
      heading: "知识产权",
      blocks: [
        {
          kind: "p",
          text: "本服务的软件、界面设计、文案、图表与品牌标识归我们或相应权利人所有。你仅获得为使用本服务所必需的、不可转让的有限许可。",
        },
        {
          kind: "p",
          text: "你创建的内容（自选、笔记、策略参数等）归你所有；你授予我们为提供服务所必需的存储、处理与展示许可。",
        },
        {
          kind: "p",
          text: "未经许可，不得复制、修改、传播、出租或出售本服务的任何部分。",
        },
      ],
    },
    {
      id: "changes",
      heading: "服务变更、中断与终止",
      blocks: [
        {
          kind: "p",
          text: "我们可能新增、修改或下线功能，也可能因维护、升级、第三方故障或不可抗力中断服务。我们会尽力提前告知，但不保证服务不中断。",
        },
        {
          kind: "p",
          text: "你可随时停止使用并申请删除账户。若你严重违反本条款，我们可终止向你提供服务。",
        },
      ],
    },
    {
      id: "liability",
      heading: "免责与责任限制",
      blocks: [
        {
          kind: "p",
          text: "本服务按“现状”与“可用”状态提供，不作任何明示或默示保证，包括适销性、特定用途适用性与不侵权。",
        },
        {
          kind: "p",
          text: "在法律允许的最大范围内，我们不对你的投资损失、利润损失、数据丢失、商誉损失或任何间接、附带、后果性损害承担责任。",
        },
        {
          kind: "p",
          text: "若责任无法完全排除，我们的累计责任以你过去 12 个月内为本服务实际支付的金额为限（免费用户为零）。本条不排除依法不得排除的责任，例如故意或重大过失造成的损害。",
        },
      ],
    },
    {
      id: "indemnity",
      heading: "赔偿",
      blocks: [
        {
          kind: "p",
          text: "因你违反本条款、侵犯第三方权利或违法使用本服务，导致我们遭受索赔、处罚或损失（含合理的律师费），你应予以赔偿。",
        },
      ],
    },
    {
      id: "third-party-links",
      heading: "第三方链接与服务",
      blocks: [
        {
          kind: "p",
          text: "本服务可能包含指向第三方网站、券商或数据服务的链接。我们不控制其内容与行为，也不对其承担责任；你应自行阅读并遵守其条款。",
        },
      ],
    },
    {
      id: "law",
      heading: "适用法律与争议解决",
      blocks: [
        {
          kind: "p",
          text: "本条款适用中华人民共和国法律（为本条款之目的，不含香港特别行政区、澳门特别行政区与台湾地区法律）。",
        },
        {
          kind: "p",
          text: "因本条款产生的争议，双方应先友好协商；协商不成的，任一方可向运营者所在地有管辖权的人民法院提起诉讼。",
        },
        {
          kind: "p",
          text: "若你位于其他司法辖区，本条不排除当地强制性法律赋予你的消费者保护权利。",
        },
      ],
    },
    {
      id: "updates",
      heading: "条款更新",
      blocks: [
        {
          kind: "p",
          text: "我们可能更新本条款，更新后将在本页公布并标注生效日期。重大变更将通过站内公告或邮件提示。继续使用即视为接受更新后的条款。",
        },
      ],
    },
    {
      id: "contact",
      heading: "联系我们",
      blocks: [
        {
          kind: "p",
          text: `如对本条款有疑问，请联系：${LEGAL_CONTACT_EMAIL}。`,
        },
      ],
    },
  ],
};

const enTerms: LegalDoc = {
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

const DOCS: Record<LegalDocKey, Record<"en" | "zh-CN", LegalDoc>> = {
  privacy: { en: enPrivacy, "zh-CN": zhPrivacy },
  terms: { en: enTerms, "zh-CN": zhTerms },
};

const ZH_VARIANTS = new Set(["zh-CN", "zh-TW", "zh-HK"]);

/**
 * 正文语言解析：中文（简/繁）取 zh-CN，其余回落英文。
 * fallback 为 true 时页面会提示当前语言版本的效力说明。
 */
export function resolveLegalDoc(
  key: LegalDocKey,
  locale: string,
): { doc: LegalDoc; fallback: boolean } {
  if (ZH_VARIANTS.has(locale)) {
    return { doc: DOCS[key]["zh-CN"], fallback: locale !== "zh-CN" };
  }
  if (locale === "en") return { doc: DOCS[key].en, fallback: false };
  return { doc: DOCS[key].en, fallback: true };
}
