import React, { useCallback, useState } from 'react';
import internationalProjectDeliveryIcon from '../../assets/about/international-project-delivery.webp';
import founded2021Icon from '../../assets/about/founded-2021.webp';
import japanKoreaIcon from '../../assets/about/japan-korea.webp';
import industryResearchIcon from '../../assets/about/industry-research.webp';
import endToEndOwnershipIcon from '../../assets/about/end-to-end-ownership.webp';
import crossBorderDeliveryIcon from '../../assets/about/cross-border-delivery.webp';
import businessReadySystemsIcon from '../../assets/about/business-ready-systems.webp';
import ziyoTechFoundedJourneyImage from '../../assets/about/journey/ziyotech-founded.webp';
import sbCollaborationJourneyImage from '../../assets/about/journey/sb-collaboration.webp';
import internationalExpansionJourneyImage from '../../assets/about/journey/international-expansion.webp';
import dentalverseJourneyImage from '../../assets/about/journey/dentalverse-journey.webp';
import dentalverseCaseStudyImage from '../../assets/about/dentalverse-case-study.webp';
import internationalExperienceImage from '../../assets/about/core-strengths/international-experience.webp';
import deepIndustryUnderstandingImage from '../../assets/about/core-strengths/deep-industry-understanding.webp';
import fullOwnershipImage from '../../assets/about/core-strengths/full-ownership.webp';
import customSolutionsImage from '../../assets/about/core-strengths/custom-solutions.webp';
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Compass,
  Globe2,
  MapPinned,
  Palette,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import dentalverseTeamImage from '../../23.png';
import internationalDeliveryImage from '../../25.png';
import mainPromotionalVideo from '../../video_for_main.mp4';
import { ServicesVideoShowcase } from './ServicesVideoShowcase';
import { LiveProjectShowcase } from './LiveProjectShowcase';
import { CompanyProjectAccess } from './CompanyProjectAccess';
import type { ClientPortalActions, ClientPortalProject } from './ClientProjectDashboard';

interface AboutSectionProps {
  onNavigate: (page: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigate }) => {
  const [clientPortal, setClientPortal] = useState<{ authenticated: boolean; companyName: string; projects: ClientPortalProject[]; onLogout?: () => Promise<void>; actions?: ClientPortalActions }>({ authenticated: false, companyName: '', projects: [] });
  const handleClientAuthenticated = useCallback((companyName: string, projects: ClientPortalProject[], logout: () => Promise<void>, actions: ClientPortalActions) => {
    setClientPortal({ authenticated: true, companyName, projects, onLogout: logout, actions });
  }, []);
  const handleClientSignedOut = useCallback(() => setClientPortal({ authenticated: false, companyName: '', projects: [] }), []);
  const stats = [
    { value: '2021', label: 'Founded', icon: founded2021Icon },
    { value: 'Japan + Korea', label: 'International projects', icon: japanKoreaIcon },
    { value: '6 months', label: 'Industry research', icon: industryResearchIcon },
    { value: '100%', label: 'End-to-end ownership', icon: endToEndOwnershipIcon },
  ];

  const journey = [
    {
      year: '2021',
      title: 'ZiyoTech Founded',
      text: 'The beginning of our journey in software development and international technology collaboration.',
      icon: ziyoTechFoundedJourneyImage,
    },
    {
      year: 'Tokyo, Japan',
      title: 'SB Collaboration',
      text: 'Our first international collaboration established the foundation for cross-border development.',
      icon: sbCollaborationJourneyImage,
    },
    {
      year: 'South Korea',
      title: 'International Expansion',
      text: 'We expanded our expertise through collaborations with Korean companies and custom engineering projects.',
      icon: internationalExpansionJourneyImage,
    },
    {
      year: 'Seoul, Korea',
      title: 'Dentalverse',
      text: 'We delivered a complete software platform after six months of deep dentistry research and product engineering.',
      icon: dentalverseJourneyImage,
    },
  ];

  const pillars = [
    {
      title: 'International Experience',
      desc: 'Experience collaborating with companies in Japan and South Korea.',
      icon: internationalExperienceImage,
    },
    {
      title: 'Deep Industry Understanding',
      desc: 'We study the industry before we design the system.',
      icon: deepIndustryUnderstandingImage,
    },
    {
      title: 'Full Ownership',
      desc: 'From research and design to development, architecture, and deployment.',
      icon: fullOwnershipImage,
    },
    {
      title: 'Custom Solutions',
      desc: 'Every platform is shaped around the client’s real business needs.',
      icon: customSolutionsImage,
    },
  ];

  return (
    <section id="about" className="relative overflow-hidden py-14 sm:py-20 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.06),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            About ZiyoTech
          </div>

          <h2 className="text-3xl font-black tracking-[-0.05em] text-white sm:text-5xl lg:text-[4rem]">
            Engineering technology without borders.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Founded in 2021, ZiyoTech is a software development and AI solutions company delivering international technology projects across Japan and South Korea.
            <span className="mt-2 block text-slate-400">
              We combine engineering discipline, industry research, and AI-enabled automation to build resilient digital systems for modern businesses.
            </span>
          </p>
        </div>

        <div className="mb-16 grid grid-cols-1 items-stretch gap-7 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-[30px] border border-slate-800 bg-[#0a1017] p-7 shadow-[0_30px_90px_rgba(2,6,23,0.45)] sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/35 bg-slate-900 text-blue-300">
                <img src={internationalProjectDeliveryIcon} alt="" aria-hidden="true" className="h-full w-full object-cover object-center" />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400">Global presence</div>
                <h3 className="text-xl font-bold text-white">International project delivery</h3>
              </div>
            </div>

            <div className="space-y-5 text-sm leading-relaxed text-slate-300 sm:text-[15px]">
              <p>
                Our journey began with our first international collaboration with <span className="font-semibold text-white">SB</span>, based in Tokyo, Japan. That partnership established the foundation for our cross-border product and engineering practice.
              </p>

              <p>
                We later expanded into South Korea, working with Korean companies to develop custom software engineering capabilities and industry-specific digital systems.
              </p>

              <p>
                Today, our work spans AI-powered sales agents, business automation, digital platforms, and custom software solutions built to solve practical operational challenges at scale.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.slice(0, 4).map(({ value, label, icon }) => (
                <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <img src={icon} alt="" aria-hidden="true" className="mb-3 h-7 w-7 rounded-lg border border-cyan-300/35 object-cover object-center" />
                  <div className="text-lg font-black text-white">{value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.17em] text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:h-full">
            <div className="aspect-video w-full shrink-0 overflow-hidden rounded-[30px] border border-slate-800 bg-slate-900 shadow-[0_20px_60px_rgba(2,6,23,0.5)]">
              <img
                src={internationalDeliveryImage}
                alt="International team collaborating on a dental software project"
                className="h-full w-full object-cover object-center grayscale-[0.12]"
              />
            </div>
            <div className="grid grid-cols-2 items-stretch gap-4 lg:shrink-0">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="mb-3 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/35 bg-blue-500/10 text-blue-300">
                  <img src={crossBorderDeliveryIcon} alt="" aria-hidden="true" className="h-full w-full object-cover object-center" />
                </div>
                <div className="text-sm font-bold text-white">Cross-border delivery</div>
                <div className="mt-1 text-xs text-slate-400">Japan • Korea • global teams</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="mb-3 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/35 bg-slate-800 text-slate-200">
                  <img src={businessReadySystemsIcon} alt="" aria-hidden="true" className="h-full w-full object-cover object-center" />
                </div>
                <div className="text-sm font-bold text-white">Business-ready systems</div>
                <div className="mt-1 text-xs text-slate-400">Built for real workflows</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16 rounded-[32px] border border-slate-800 bg-[#0b1320] p-6 sm:p-8 lg:p-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">Our journey</div>
              <h3 className="text-2xl font-black text-white sm:text-3xl">A track record of international execution</h3>
            </div>
            <div className="hidden h-px flex-1 bg-gradient-to-r from-blue-500/0 via-slate-700 to-blue-500/0 sm:block" />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {journey.map(({ year, title, text, icon }) => (
              <div key={title} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="mb-4 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/35 bg-slate-800">
                  <img src={icon} alt="" aria-hidden="true" className="h-full w-full object-cover object-center" />
                </div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">{year}</div>
                <h4 className="mb-2 text-lg font-bold text-white">{title}</h4>
                <p className="text-sm leading-relaxed text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative min-h-[420px] overflow-hidden rounded-[30px] border border-slate-800 bg-slate-900">
            <img
              src={dentalverseTeamImage}
              alt="Four professionals collaborating on a dental software project"
              className="absolute inset-0 h-full w-full object-cover object-center grayscale-[0.16]"
            />
          </div>

          <div className="rounded-[30px] border border-slate-800 bg-[#0a121d] p-7 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/35 bg-slate-800">
                <img src={dentalverseCaseStudyImage} alt="" aria-hidden="true" className="h-full w-full object-cover object-center" />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">Case study</div>
                <h3 className="text-2xl font-black text-white">Dentalverse</h3>
              </div>
            </div>

            <p className="mb-6 text-base leading-relaxed text-slate-300">
              One of our most significant achievements is Dentalverse, a comprehensive software platform developed for a project in Seoul, South Korea. Before starting development, our team spent six months studying dentistry to understand the industry’s processes, terminology, workflows, and technical requirements.
            </p>

            <div className="grid gap-3">
              {[
                'Industry Research: six months of focused dentistry study and workflow analysis.',
                'UI/UX Design: building a clear, conversion-oriented user experience.',
                'Frontend Development: delivering the complete end-user application.',
                'Backend Engineering: creating scalable system logic and integrations.',
                'Database Architecture: implementing a secure and resilient data foundation.',
                'Deployment: preparing and launching the platform end to end.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
                  <span className="text-sm leading-relaxed text-slate-200">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Target className="h-4 w-4 text-blue-300" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">What it means</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                Dentalverse demonstrates our ability to transform complex industry requirements into complete digital products. We do not merely code — we study the domain, understand operational realities, and build around real business needs.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="mb-8 text-center">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">Why businesses choose ZiyoTech</div>
            <h3 className="text-3xl font-black text-white">Our core strengths</h3>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {pillars.map(({ title, desc, icon }) => (
              <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition-all hover:-translate-y-0.5 hover:border-slate-700">
                <div className="mb-4 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/35 bg-slate-800">
                  <img src={icon} alt="" aria-hidden="true" className="h-full w-full object-cover object-center" />
                </div>
                <h4 className="mb-2 text-lg font-bold text-white">{title}</h4>
                <p className="text-sm leading-relaxed text-slate-300">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <CompanyProjectAccess
          onAuthenticated={handleClientAuthenticated}
          onSignedOut={handleClientSignedOut}
        />
        <LiveProjectShowcase
          onNavigate={onNavigate}
          clientAuthenticated={clientPortal.authenticated}
          clientProjects={clientPortal.authenticated ? clientPortal.projects : undefined}
          clientCompanyName={clientPortal.companyName}
          onClientLogout={clientPortal.onLogout}
          clientActions={clientPortal.actions}
        />

        <div className="rounded-[32px] border border-slate-800 bg-linear-to-r from-slate-900 via-[#0a1521] to-[#07121d] p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">Our mission</div>
              <h3 className="text-2xl font-black text-white sm:text-4xl">To turn complex business challenges into clear, scalable technology.</h3>
              <p className="mt-4 text-base leading-relaxed text-slate-300">
                Through deep industry understanding, engineering excellence, and thoughtful AI implementation, we help businesses transform ambitious ideas into dependable digital products.
              </p>
            </div>

            <div className="rounded-[26px] border border-slate-700 bg-[#0a111b] p-6">
              <div className="mb-4 flex items-center gap-2 text-slate-200">
                <Palette className="h-5 w-5 text-blue-300" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Vision</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                To become a trusted international technology partner, empowering businesses worldwide through custom software, artificial intelligence, and intelligent automation.
              </p>
              <button
                onClick={() => onNavigate('contact')}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-slate-100 to-slate-300 px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_16px_32px_rgba(148,163,184,0.2)] transition-all hover:scale-[1.01]"
              >
                Start a project
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <ServicesVideoShowcase source={mainPromotionalVideo} />
      </div>
    </section>
  );
};
