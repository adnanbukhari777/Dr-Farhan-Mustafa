import React, { useState } from 'react';
import { PageId, ServiceItem } from './types';
import { VERIFIED_SERVICES } from './data/clinicData';
import { CMSProvider, useCMS } from './context/CMSContext';

// Layout Components
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { NavOverlay } from './components/NavOverlay';
import { Footer } from './components/Footer';
import { MobileStickyCTA } from './components/MobileStickyCTA';
import { FloatingAIButton } from './components/FloatingAIButton';
import { AIModal } from './components/AIModal';
import { AdminPortal } from './components/admin/AdminPortal';

// Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { FeesPage } from './pages/FeesPage';
import { PatientFormsPage } from './pages/PatientFormsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { BlogPage } from './pages/BlogPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(VERIFIED_SERVICES[0]);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);

  // Scroll to top on page navigation
  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectService = (service: ServiceItem) => {
    setSelectedService(service);
  };

  // If in Admin CMS mode, render the Admin Portal
  if (currentPage === 'admin') {
    return <AdminPortal onBackToPublicSite={() => handleNavigate('home')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#0A0A0A] selection:bg-[#2097A2] selection:text-white font-sans antialiased">
      
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Top Announcement Strip */}
      <AnnouncementBar onNavigate={handleNavigate} />

      {/* Fixed Desktop & Mobile Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
      />

      {/* Full-screen Navigation Overlay */}
      <NavOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* AI Receptionist Modal */}
      <AIModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Main Dynamic Page Content */}
      <main id="main-content" className="flex-grow pb-16 md:pb-0" tabIndex={-1}>
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectService={handleSelectService}
            onOpenAI={() => setIsAIOpen(true)}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'services' && (
          <ServicesPage
            onNavigate={handleNavigate}
            onSelectService={handleSelectService}
          />
        )}

        {currentPage === 'service-detail' && (
          <ServiceDetailPage
            service={selectedService}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'appointments' && (
          <AppointmentsPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'fees' && (
          <FeesPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'patient-forms' && (
          <PatientFormsPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'resources' && (
          <ResourcesPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'reviews' && (
          <ReviewsPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'blog' && (
          <BlogPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'contact' && (
          <ContactPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'privacy' && (
          <LegalPage initialTab="privacy" onNavigate={handleNavigate} />
        )}

        {currentPage === 'terms' && (
          <LegalPage initialTab="terms" onNavigate={handleNavigate} />
        )}

        {currentPage === 'disclaimer' && (
          <LegalPage initialTab="disclaimer" onNavigate={handleNavigate} />
        )}
      </main>

      {/* Floating AI Button (Desktop) */}
      <FloatingAIButton onOpen={() => setIsAIOpen(true)} />

      {/* Mobile Sticky CTA Bar */}
      <MobileStickyCTA
        onNavigate={handleNavigate}
        onOpenAI={() => setIsAIOpen(true)}
      />

      {/* Large Teal Footer */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
}

export default function App() {
  return (
    <CMSProvider>
      <AppContent />
    </CMSProvider>
  );
}
