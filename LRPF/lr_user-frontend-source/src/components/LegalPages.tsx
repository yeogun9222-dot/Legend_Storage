import { motion } from 'motion/react';

type LegalPageProps = {
  type: 'terms' | 'privacy-policy' | 'risk-notice';
  onBack: () => void;
};

type SimpleLegalPage = {
  title: string;
  updated: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
};

const SIMPLE_LEGAL_PAGES: Record<'terms' | 'privacy-policy', SimpleLegalPage> = {
  terms: {
    title: 'Terms of Service',
    updated: 'Last Updated: January 9, 2026',
    intro: 'These Terms of Service govern access to and use of LONGRISE.',
    sections: [
      { title: '1. Acceptance of Terms', body: 'By accessing or using LONGRISE, you agree to these Terms of Service. If you do not agree, you should not use the platform. LONGRISE provides access to AI-powered gaming and futures strategy systems. Users may choose product plans, allocate funds, and allow automated systems to operate according to platform rules.' },
      { title: '2. Platform Nature', body: 'LONGRISE is a Web3-based platform using AI systems, digital assets, platform credits, and automated strategy tools. Users acknowledge that LONGRISE is not a bank, securities broker, licensed investment advisor, or guaranteed income service. All platform activity involves risk.' },
      { title: '3. User Eligibility', body: 'By using LONGRISE, you confirm that you are legally permitted to use the platform in your jurisdiction, are not located in a prohibited region, are not using the platform for illegal purposes, and understand the risks of AI-powered gaming and futures strategy systems. LONGRISE may restrict access to users or regions at its discretion.' },
      { title: '4. Account Registration', body: 'Users may be required to provide an email address and phone number for account creation, account recovery, security verification, platform notices, and customer support. Users are responsible for keeping account information accurate and secure.' },
      { title: '5. Product Plans and Participation', body: 'Users may choose available product plans according to the platform current policy. Product conditions, reward structures, CNYT rewards, settlement rules, and withdrawal conditions may vary by product plan and may be updated by LONGRISE. Users must review all product details before participation.' },
      { title: '6. No Guaranteed Profit', body: 'LONGRISE does not guarantee fixed profit, stable income, uninterrupted withdrawals, or capital preservation. Displayed returns, rankings, estimates, or past performance are for reference only and do not guarantee future results.' },
      { title: '7. AI Execution Risk', body: 'The platform may use automated AI systems for casino-related strategy execution and futures strategy operations. AI systems may be affected by volatility, market conditions, liquidity conditions, technical errors, external platform risks, and operational controls. Users accept all risks related to automated execution.' },
      { title: '8. Digital Asset and Token Risk', body: 'CNYT or other platform-related digital assets may fluctuate in value. Token rewards, utility, lock-up conditions, distribution schedules, and conversion policies may change depending on platform policy, ecosystem conditions, or operational requirements. Digital assets should not be treated as guaranteed cash value.' },
      { title: '9. Purchases, Refunds, and Cancellations', body: 'All purchases are final unless otherwise specified by LONGRISE. Refunds, reversals, or cancellations may not be available once participation has begun or digital asset operations have been executed. Any refund or cancellation request may be reviewed according to platform policy, product status, system execution status, and applicable operational rules.' },
      { title: '10. Withdrawals and Restrictions', body: 'Withdrawals, settlements, rewards, and account operations may be subject to platform review, security checks, treasury conditions, abnormal activity monitoring, regional restrictions, maintenance, or technical delay. LONGRISE may delay, limit, reject, or review transactions if necessary.' },
      { title: '11. Prohibited Activities', body: 'Users must not use false information, attempt fraud, abuse, hacking, or system manipulation, exploit bugs or loopholes, use the platform for money laundering or illegal activity, or violate local laws or platform rules. LONGRISE may suspend or terminate accounts involved in prohibited activity.' },
      { title: '12. Service Changes', body: 'LONGRISE may update, modify, suspend, or discontinue any part of the platform, including product plans, reward rules, token policies, access conditions, or technical features.' },
      { title: '13. Limitation of Liability', body: 'LONGRISE, its operators, affiliates, partners, and service providers shall not be liable for losses caused by market volatility, gaming outcomes, AI system performance, technical failures, third-party services, user mistakes, or regulatory restrictions.' },
      { title: '14. User Responsibility', body: 'Users are fully responsible for their participation decisions, local legal compliance, account security, and financial outcomes. Users should only participate with funds they can afford to lose.' },
      { title: '15. Updates to Terms', body: 'LONGRISE may update these Terms of Service from time to time. Continued use of the platform after updates means that users accept the revised terms.' },
      { title: '16. Contact', body: 'For questions about these Terms, users may contact LONGRISE through the official support channels provided on the platform.' },
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    updated: 'Last Updated: January 9, 2026',
    intro: 'This Privacy Policy explains how LONGRISE collects, uses, stores, and protects user information.',
    sections: [
      { title: '1. Introduction', body: 'This Privacy Policy explains how LONGRISE collects, uses, stores, and protects user information. LONGRISE is a Web3-based platform. We aim to collect only the information necessary to provide account access, security verification, platform notices, and customer support.' },
      { title: '2. Information We Collect', body: 'LONGRISE may collect email address, phone number, account login and verification records, platform usage records, wallet-related activity records if users connect or use digital asset features, and device, browser, and technical log information for security and fraud prevention. We do not intentionally collect unnecessary personal information.' },
      { title: '3. How We Use Information', body: 'We may use collected information to create and manage user accounts, verify user identity or account access, provide security notifications, send platform notices, support deposits, withdrawals, rewards, and account operations, respond to customer support requests, prevent fraud, abuse, hacking, or illegal activity, and comply with legal, regulatory, or operational requirements.' },
      { title: '4. Email and Phone Number Usage', body: 'Email addresses and phone numbers may be used for login verification, password or account recovery, transaction or account alerts, customer support, important policy or platform updates, and security checks. LONGRISE will not sell user email addresses or phone numbers to third parties.' },
      { title: '5. Web3 and Wallet Data', body: 'If users connect or use wallet-related features, certain blockchain transactions may be publicly visible on the blockchain. Blockchain records are not controlled by LONGRISE and may be permanent, public, and irreversible. Users should understand that Web3 activity may not be fully private.' },
      { title: '6. Cookies and Technical Data', body: 'LONGRISE may use cookies or similar technologies to improve platform functionality, remember user preferences, analyze usage, and protect against abuse. Users may disable cookies in their browser, but some platform features may not work properly.' },
      { title: '7. Data Sharing', body: 'LONGRISE may share limited information only when necessary with technical service providers, security and fraud prevention providers, customer support tools, payment, wallet, or infrastructure providers, and legal or regulatory authorities when required. We do not sell personal information.' },
      { title: '8. Data Security', body: 'LONGRISE uses reasonable technical and organizational measures to protect user information. However, no online platform can guarantee complete security. Users are responsible for protecting their own accounts, passwords, devices, and wallet access.' },
      { title: '9. Data Retention', body: 'LONGRISE may retain user information as long as necessary for account operation, customer support, fraud prevention, legal compliance, dispute resolution, and platform security. When information is no longer needed, it may be deleted, anonymized, or securely stored according to platform policy.' },
      { title: '10. User Rights', body: 'Depending on the user location, users may request access to their personal information, correction of inaccurate information, deletion of certain information, withdrawal of consent where applicable, or support contact regarding privacy concerns. Some requests may be limited by legal, security, fraud prevention, or operational requirements.' },
      { title: '11. International Use', body: 'LONGRISE may operate globally. User information may be processed or stored in countries different from the user location. By using the platform, users acknowledge that data may be handled across jurisdictions.' },
      { title: '12. Minors', body: 'LONGRISE is not intended for minors. Users must meet the legal age requirement in their jurisdiction to use the platform. If we learn that a minor has provided information, we may suspend the account and delete related information where appropriate.' },
      { title: '13. Changes to This Policy', body: 'LONGRISE may update this Privacy Policy from time to time. Updated versions will be posted on the platform. Continued use of the platform after updates means users accept the revised policy.' },
      { title: '14. Contact', body: 'For privacy-related questions, users may contact LONGRISE through the official support channels provided on the platform.' },
    ],
  },
};

const RISK_SECTIONS = [
  {
    num: '01',
    title: '1. General Notice',
    paragraphs: [
      'LONGRISE provides access to AI-powered gaming and futures strategy systems. By using the platform, users acknowledge that all participation involves financial risk.',
      'Users do not manually execute casino bets or futures trades. AI systems operate automated strategies based on internal algorithms, market conditions, gaming statistics, liquidity conditions, and risk management systems.',
      'Participation in the platform does not guarantee profit or capital preservation.',
    ],
  },
  {
    num: '02',
    title: '2. Variable Returns',
    paragraphs: [
      'Displayed returns, estimated yields, rankings, and historical performance are not guaranteed results.',
      'Monthly returns may vary depending on AI strategy performance, gaming outcomes, futures market volatility, liquidity conditions, platform treasury conditions, and operational risk controls.',
      'Past performance does not guarantee future results.',
    ],
  },
  {
    num: '03',
    title: '3. Capital Risk',
    paragraphs: [
      'Users acknowledge that deposited funds may be exposed to partial or total loss under certain market or operational conditions.',
      'LONGRISE does not guarantee fixed returns, guaranteed monthly profit, uninterrupted withdrawals, or permanent liquidity availability.',
      "All participation is conducted at the user's own discretion and responsibility.",
    ],
  },
  {
    num: '04',
    title: '4. AI Execution Systems',
    paragraphs: [
      'LONGRISE uses automated AI systems for gaming execution and futures strategy operations.',
      'These systems may experience unexpected volatility, execution delays, model failure, liquidity shortages, external platform risks, or technical interruptions.',
      'AI systems are continuously adjusted and monitored, but no system can eliminate risk entirely.',
    ],
  },
  {
    num: '05',
    title: '5. Token Rewards (CNYT)',
    paragraphs: [
      'CNYT rewards are utility-based platform rewards and may fluctuate in value.',
      'CNYT distribution schedules, reward ratios, utility structures, and platform policies may change depending on operational requirements and ecosystem conditions.',
      'CNYT should not be interpreted as guaranteed financial return or stable-value compensation.',
    ],
  },
  {
    num: '06',
    title: '6. Withdrawal & Operational Policies',
    paragraphs: [
      'Withdrawals, settlements, reward distributions, and account operations may be subject to internal compliance review, platform maintenance, treasury management, security procedures, abnormal activity monitoring, and regional operational restrictions.',
      'LONGRISE reserves the right to delay, review, restrict, or reject operations considered abnormal, fraudulent, or high risk.',
    ],
  },
  {
    num: '07',
    title: '7. Regional Restrictions',
    paragraphs: [
      'Users are responsible for understanding and complying with local laws and regulations in their jurisdiction.',
      'Access to LONGRISE may be restricted in service-restricted jurisdictions.',
      'Users located in service-restricted jurisdictions should not access or use the platform.',
    ],
  },
  {
    num: '08',
    title: '8. Responsible Participation',
    paragraphs: [
      'LONGRISE is designed for users who understand the risks associated with speculative systems, gaming-related industries, and leveraged financial environments.',
      'Users should never participate using funds they cannot afford to lose.',
      'If participation causes financial stress, addiction-related behavior, or personal hardship, users should discontinue use immediately.',
    ],
  },
  {
    num: '09',
    title: '9. Acceptance of Risk',
    paragraphs: [
      'By accessing or using LONGRISE, users acknowledge that they have read, understood, and accepted all risks associated with the platform.',
      'Users accept full responsibility for their participation decisions and financial outcomes.',
      'LONGRISE, its operators, affiliates, partners, and system providers shall not be held liable for losses arising from user participation, market volatility, gaming outcomes, technical failures, or third-party platform events.',
    ],
  },
];

const SimpleLegalPageView = ({ page, onBack }: { page: SimpleLegalPage; onBack: () => void }) => (
  <motion.section
    key={page.title}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="min-h-screen bg-black pt-28 text-[#f5f5f5]"
  >
    <header className="border-b border-luxury-gold/10 bg-[radial-gradient(circle_at_top_left,rgba(127,29,29,.35),transparent_35%),linear-gradient(180deg,#000,#070101)] px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-[980px]">
        <button
          onClick={onBack}
          className="mb-10 rounded-[10px] border border-luxury-gold/25 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-zinc-300 transition-colors hover:border-luxury-gold/60 hover:text-luxury-gold"
        >
          Back
        </button>
        <h1 className="font-serif text-5xl font-black leading-[0.95] text-white lg:text-7xl">{page.title}</h1>
        <div className="mt-6 text-[13px] uppercase tracking-[0.08em] text-zinc-400">{page.updated}</div>
        <p className="mt-6 max-w-[760px] text-lg leading-8 text-zinc-300">{page.intro}</p>
      </div>
    </header>

    <main className="px-6 py-14 lg:py-20">
      <div className="mx-auto max-w-[980px]">
        {page.sections.map((section) => (
          <section key={section.title} className="mb-[18px] rounded-2xl border border-luxury-gold/15 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-7">
            <h2 className="mb-3.5 font-serif text-2xl text-luxury-gold lg:text-[28px]">{section.title}</h2>
            <p className="text-[15px] leading-7 text-gray-300">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  </motion.section>
);

const RiskNoticePage = ({ onBack }: { onBack: () => void }) => (
  <motion.section
    key="risk-notice"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="min-h-screen bg-black pt-28 text-[#f5f5f4]"
  >
    <header className="border-b border-luxury-gold/10 px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={onBack}
          className="mb-10 rounded-[10px] border border-luxury-gold/25 bg-white/[0.03] px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:border-luxury-gold/60 hover:text-luxury-gold"
        >
          Back to Homepage
        </button>
        <div className="inline-flex items-center gap-2.5 rounded-[10px] border border-luxury-gold/30 bg-red-950/30 px-3.5 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-luxury-gold">
          <i className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_18px_#22c55e]" />
          Risk Information
        </div>
        <h1 className="mt-6 font-serif text-5xl font-black leading-[0.9] tracking-tight text-white lg:text-[92px]">
          Risk Notice for<br /><span className="text-luxury-gold">AI Gaming Systems</span>
        </h1>
        <p className="mt-6 max-w-[820px] text-lg leading-8 text-zinc-300">
          LONGRISE uses AI-powered gaming and futures strategy systems. This notice explains key risks related to variable returns, automated execution, CNYT rewards, withdrawals, regional restrictions, and responsible participation.
        </p>
        <div className="mt-8 grid grid-cols-[auto_1fr] gap-4 rounded-[14px] border border-luxury-gold/20 bg-gradient-to-r from-red-950/50 via-luxury-gold/10 to-black/30 p-5">
          <b className="font-serif text-3xl leading-none text-luxury-gold">!</b>
          <span className="text-sm leading-6 text-gray-200">This document is provided for user awareness before participation. It is not financial advice, investment advice, legal advice, or a guarantee of profit.</span>
        </div>
      </div>
    </header>

    <main className="px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <section className="mb-6 grid grid-cols-1 gap-3.5 lg:grid-cols-3">
          {[
            ['No Guaranteed Profit', 'Displayed returns and rankings are not guaranteed future results.'],
            ['AI Execution Risk', 'Automated systems may face volatility, delay, failure, or liquidity issues.'],
            ['User Responsibility', 'Users are responsible for participation decisions and local legal compliance.'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-[14px] border border-white/10 bg-gradient-to-b from-white/[0.055] to-white/[0.018] p-5">
              <strong className="mb-2 block font-serif text-xl text-luxury-gold">{title}</strong>
              <span className="text-sm leading-6 text-zinc-400">{body}</span>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {RISK_SECTIONS.map((section) => (
            <article key={section.num} className="relative overflow-hidden rounded-2xl border border-luxury-gold/20 bg-[radial-gradient(circle_at_90%_10%,rgba(251,191,36,.08),transparent_26%),linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.018))] p-7 shadow-[0_24px_70px_rgba(0,0,0,.5)]">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-luxury-gold to-transparent" />
              <div className="absolute right-5 top-5 font-serif text-6xl font-black leading-none text-luxury-gold/20">{section.num}</div>
              <h2 className="relative z-10 mb-4 font-serif text-2xl text-white">{section.title}</h2>
              <div className="relative z-10 space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-zinc-300">{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-luxury-gold/20 bg-luxury-gold/10 p-7">
          <h2 className="mb-3 font-serif text-3xl text-white">User Acknowledgement</h2>
          <p className="text-sm leading-7 text-zinc-300">By accessing or using LONGRISE, users confirm that they have read and understood this Risk Notice and accept the risks associated with AI-powered gaming and futures strategy systems.</p>
        </section>
      </div>
    </main>
  </motion.section>
);

export const LegalPage = ({ type, onBack }: LegalPageProps) => {
  if (type === 'risk-notice') {
    return <RiskNoticePage onBack={onBack} />;
  }

  return <SimpleLegalPageView page={SIMPLE_LEGAL_PAGES[type]} onBack={onBack} />;
};
