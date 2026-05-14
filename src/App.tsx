/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TechnicalEvaluator from './components/TechnicalEvaluator';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import MockInterview from './components/MockInterview';
import PortfolioReviewer from './components/PortfolioReviewer';
import UserProfile from './components/UserProfile';
import ReadinessAssessment from './components/ReadinessAssessment';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Onboarding } from './components/Onboarding';

import { VisualEnvironment } from './components/VisualEnvironment';

function AppContent() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      const onboarded = localStorage.getItem(`onboarded_${user._id}`);
      if (!onboarded) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`onboarded_${user._id}`, 'true');
      setShowOnboarding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} startTour={() => setShowOnboarding(true)} />;
      case 'technical':
        return <TechnicalEvaluator />;
      case 'resume':
        return <ResumeAnalyzer />;
      case 'communication':
        return <MockInterview />;
      case 'portfolio':
        return <PortfolioReviewer />;
      case 'readiness':
        return <ReadinessAssessment />;
      case 'profile':
        return <UserProfile />;
      default:
        return <Dashboard setActiveTab={setActiveTab} startTour={() => setShowOnboarding(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex font-sans">
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 lg:ml-72 min-h-screen">
        <div className="p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <VisualEnvironment>
        <AppContent />
      </VisualEnvironment>
    </AuthProvider>
  );
}
