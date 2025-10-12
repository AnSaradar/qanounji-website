import { LandingNavbar } from '@/components/landing-navbar';
import { HeroSection } from '@/modules/landing/components/hero-section';
import { FeaturesSection } from '@/modules/landing/components/features-section';
import { Footer } from '@/modules/landing/components/footer';
import { locales } from '@/i18n/config';

export default function Home() {
  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </>
  );
}

// Pre-generate localized paths to avoid 404 on dynamic segment
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

