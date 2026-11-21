import React from 'react';
import { ArrowLeft, ShieldCheck, Scale } from 'lucide-react';

type Section = { title: string; paragraphs: string[]; bullets?: string[] };

const privacySections: Section[] = [
  {
    title: '1. Who we are and this notice',
    paragraphs: [
      'This Privacy Policy explains how ZiyoTech handles information when you visit ziyotech.net, use its public AI assistant, create an account, or send a project enquiry. ZiyoTech is the operator of this website and is located in Seoul, South Korea.',
      'This notice describes the current website implementation. Some processing details depend on Firebase, Google Gemini, your browser, and hosting providers. Their applicable terms and settings can affect processing and retention.'
    ],
  },
  {
    title: '2. Information handled and why',
    paragraphs: ['Depending on the feature you use, the website may handle the following information:'],
    bullets: [
      'Project enquiries: name, business name if supplied, email, phone or Telegram contact, requested service, project description, preferred language, source, status, and submission time. The enquiry is written to the Firebase Firestore project when configured; the site also keeps a local browser copy for its current application state.',
      'Accounts: Firebase user identifier, email, display name, profile photo URL, sign-in provider, email-verification status, registration time, and last sign-in time. The application also maintains account and session records in its backend SQLite database. Authentication is provided through Firebase; backend sessions use cookies.',
      'AI assistant: messages, recent conversation context, and any image you choose to attach are sent to the website backend and then to the configured Gemini API to produce a reply. The frontend keeps conversation history in application memory. The website chat route does not currently write chat message content to its SQLite database. The Gemini provider may process or retain requests under the terms and settings applicable to the configured API product.',
      'Live AI Talk: browser speech recognition converts microphone speech into text for the assistant. The website sends recognized text through the same assistant flow. The website code does not upload raw microphone recordings to its own assistant endpoint. Speech recognition may be provided or processed by your browser or its service provider; handling depends on that provider and browser settings. AI replies may be spoken using the browser’s speech synthesis.',
      'Optional detailed analytics: only after you choose “Allow detailed analytics,” the site uses pseudonymous visitor and session identifiers, page paths, broad device and browser categories, referral source, and activity/visit timing to produce analytics. This is not an account registration requirement.',
      'Automatic aggregate visits: eligible top-level public page entries are counted in hourly totals. This counter does not store a visitor or session identifier, cookie, page path, browser details, or IP address. A full browser refresh and in-app route changes are not counted as new entries; separate tabs or browser profiles may each be counted. It is an aggregate entry count, not a count of unique people.'
    ],
  },
  {
    title: '3. Cookies and privacy choices',
    paragraphs: [
      'Essential cookies support authenticated sessions and request-protection checks. Optional detailed analytics is off unless you grant consent. Your detailed-analytics choice is saved in this browser’s local storage; when accepted, pseudonymous analytics identifiers are stored in cookies. You can change the choice using the website’s Privacy Choices control. Declining disables detailed analytics; it does not disable the separately described anonymous aggregate entry counter.',
      'The website may also use browser storage to retain application state, including a local copy of project enquiries. Clearing browser data can remove that local copy.'
    ],
  },
  {
    title: '4. Service providers and disclosures',
    paragraphs: [
      'Information is sent to service providers only as needed for the features you use. The current implementation uses Firebase Authentication and Firestore, and the Gemini API for AI replies. Your browser may also communicate with a speech-recognition provider when you use voice input. Hosting and other infrastructure providers may process technical data needed to deliver the site. We do not have verified, complete provider-contract and subprocessor details in the website configuration available for this notice.',
      'Information may also be disclosed where required by law or to protect the service, its users, or legal rights.'
    ],
  },
  {
    title: '5. International processing',
    paragraphs: [
      'Because Firebase, Gemini, browser services, and hosting may operate in multiple regions, information may be processed outside the country where you use the website. The exact locations and transfer safeguards depend on the selected project regions and provider terms. Do not submit information you are not authorized to share.'
    ],
  },
  {
    title: '6. Retention',
    paragraphs: [
      'The current analytics service deletes detailed analytics records after 90 days and retains hourly aggregate visit totals for up to 400 days. Browser analytics identifiers have their own expiry periods and do not extend the server record retention period.',
      'The code currently has no automatic expiry for project enquiry records in Firestore or account profile records in SQLite. Firebase may separately retain authentication records under its service terms. AI conversation content is not persisted by the website chat route in SQLite, but browser memory is temporary and Gemini processing or retention is governed by the applicable Google API terms and settings. These retention arrangements should be reviewed and finalized by ZiyoTech.'
    ],
  },
  {
    title: '7. Your choices and requests',
    paragraphs: [
      'You may decline optional detailed analytics or change that choice through Privacy Choices. You may ask ZiyoTech to access, correct, or delete information associated with you, subject to applicable law and verification of your request. Contact contact@ziyotech.net. This address is displayed as the public contact; the current site links it to doniyormak.1@gmail.com.',
      'The website does not currently provide a self-service account or enquiry deletion control. If a request concerns Firebase authentication or browser speech processing, ZiyoTech may need to direct you to the relevant provider or explain what it can access and change.'
    ],
  },
  {
    title: '8. Security',
    paragraphs: [
      'ZiyoTech uses technical controls in the application, including server-side authentication checks and protected session cookies. No website or transmission method can be guaranteed completely secure. Please avoid sending passwords, payment-card details, sensitive personal information, or confidential third-party material to the public AI assistant or enquiry form.'
    ],
  },
  {
    title: '9. Children and changes',
    paragraphs: [
      'The website is intended for people seeking business and technology services, not for children. Do not submit a child’s personal information. ZiyoTech may revise this notice when the website or its processing changes; the date shown at the top indicates the latest edit.'
    ],
  },
  {
    title: '10. Contact',
    paragraphs: ['Privacy questions and requests: contact@ziyotech.net.'],
  },
];

const termsSections: Section[] = [
  {
    title: '1. Agreement and the website',
    paragraphs: [
      'These Terms govern access to ziyotech.net and its public website features. By using the site, you agree to these Terms to the extent permitted by applicable law. If you do not agree, discontinue use. Separate written proposals, statements of work, or service agreements govern any commissioned project and take precedence for that engagement where they conflict with these website terms.',
      'ZiyoTech operates the website from Seoul, South Korea.'
    ],
  },
  {
    title: '2. Website and AI features',
    paragraphs: [
      'The site provides information about ZiyoTech and may offer forms, account features, an AI assistant, and browser-based voice input and output. Features can change or be unavailable. The AI assistant generates responses using the configured Gemini service and may make mistakes, omit context, or provide outdated or incomplete information. Treat responses as general assistance, not legal, financial, medical, security, or other professional advice. Verify important information independently.',
      'Do not rely on an AI response as a binding quote, project commitment, guarantee, or statement of ZiyoTech policy. Contact ZiyoTech for confirmation.'
    ],
  },
  {
    title: '3. Accounts and security',
    paragraphs: [
      'You are responsible for providing accurate account information, keeping access to your sign-in method secure, and promptly notifying ZiyoTech if you believe your account is being misused. Authentication may use Firebase and Google or email/password sign-in. Account access is subject to verification and the terms of those providers.',
      'Do not attempt to bypass access controls, impersonate another person, interfere with the site, probe or exploit systems without authorization, or use the site to distribute malware or unlawful material.'
    ],
  },
  {
    title: '4. Enquiries and submitted content',
    paragraphs: [
      'When you submit an enquiry, you confirm that the contact details are yours or that you are authorized to provide them, and that your description does not violate another person’s rights. You grant ZiyoTech permission to use the submitted material to receive, assess, and respond to your enquiry. Submitting a form does not itself create a contract or guarantee acceptance of a project.',
      'You remain responsible for the content you submit. Do not upload confidential, regulated, sensitive, or third-party information unless you have authority and have assessed the relevant privacy and security risks.'
    ],
  },
  {
    title: '5. Intellectual property',
    paragraphs: [
      'Website text, branding, design, software, and other materials are owned by ZiyoTech or used with permission, except where identified otherwise. You may view and use the site for personal or internal business evaluation. You may not copy, publish, modify, distribute, reverse engineer, or commercially exploit site materials except as allowed by law or with written permission.',
      'Ownership and licensing for deliverables created for a client are determined by the applicable written project agreement. You retain rights to content you submit, while allowing the limited processing needed to operate the feature you use.'
    ],
  },
  {
    title: '6. Third-party services and links',
    paragraphs: [
      'Parts of the site depend on third-party services, including Firebase, Gemini, and browser-provided capabilities. Third-party services have their own terms, privacy notices, availability, and processing practices. ZiyoTech does not control those services. External links are provided for convenience and do not imply endorsement.'
    ],
  },
  {
    title: '7. Availability and changes',
    paragraphs: [
      'ZiyoTech may update, suspend, or discontinue a website feature for maintenance, security, operational, or business reasons. The site is provided on an “as available” basis. To the extent allowed by applicable law, ZiyoTech does not promise uninterrupted availability, error-free operation, or that every feature will meet a particular need.',
      'Nothing in these Terms excludes or limits a right or remedy that cannot lawfully be excluded or limited.'
    ],
  },
  {
    title: '8. Liability',
    paragraphs: [
      'To the extent permitted by applicable law, ZiyoTech is not responsible for indirect or consequential loss arising from use of the public website, reliance on AI-generated content, or interruption of a third-party service. This does not limit liability that applicable law does not permit ZiyoTech to limit, including liability for fraud or other non-excludable obligations.'
    ],
  },
  {
    title: '9. Governing rules and disputes',
    paragraphs: [
      'These Terms do not limit mandatory rights or protections under laws that apply to you. Any dispute may be brought before a court with jurisdiction under applicable law.'
    ],
  },
  {
    title: '10. Contact and updates',
    paragraphs: [
      'Questions about these Terms: contact@ziyotech.net. ZiyoTech may update these Terms as the website changes; the latest edit date is shown above. Continued use after an update means acceptance only where that result is recognized by applicable law.'
    ],
  },
];

function LegalDocumentPage({ kind, onNavigate }: { kind: 'privacy' | 'terms'; onNavigate: (page: string) => void }) {
  const isPrivacy = kind === 'privacy';
  const sections = isPrivacy ? privacySections : termsSections;
  return (
    <article className="bg-[#080C14] min-h-[65vh] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => onNavigate('home')} className="mb-8 inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 rounded">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to home
        </button>
        <header className="rounded-3xl border border-slate-700/80 bg-gradient-to-br from-[#111d31] to-[#0b1220] p-6 sm:p-10 mb-8">
          <div className="flex items-center gap-3 mb-4 text-cyan-300">
            {isPrivacy ? <ShieldCheck className="w-6 h-6" aria-hidden="true" /> : <Scale className="w-6 h-6" aria-hidden="true" />}
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">ZiyoTech · Legal information</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{isPrivacy ? 'Privacy Policy' : 'Terms of Service'}</h1>
          <p className="mt-3 text-sm text-slate-300">Last updated: November 20, 2026</p>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300">
            {isPrivacy
              ? 'This page explains what information the current ZiyoTech website handles, why it is used, and the choices available to visitors.'
              : 'These terms describe the basic rules for using the ZiyoTech public website and its informational and AI features.'}
          </p>
        </header>
        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-7">
              <h2 className="text-lg sm:text-xl font-semibold text-white">{section.title}</h2>
              {section.paragraphs.map((paragraph, index) => <p key={index} className="mt-3 text-sm leading-7 text-slate-300">{paragraph}</p>)}
              {section.bullets && <ul className="mt-3 list-disc space-y-3 pl-5 text-sm leading-7 text-slate-300">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
            </section>
          ))}
        </div>
        <p className="mt-8 text-xs leading-6 text-slate-500">Contact: <a className="text-cyan-300 underline underline-offset-4" href="mailto:doniyormak.1@gmail.com">contact@ziyotech.net</a></p>
      </div>
    </article>
  );
}

export const PrivacyPolicyPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => <LegalDocumentPage kind="privacy" onNavigate={onNavigate} />;
export const TermsOfServicePage = ({ onNavigate }: { onNavigate: (page: string) => void }) => <LegalDocumentPage kind="terms" onNavigate={onNavigate} />;
