/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AndroidFrame } from './components/AndroidFrame';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { StoryGeneratorScreen } from './components/StoryGeneratorScreen';
import { VideoPromptsScreen } from './components/VideoPromptsScreen';
import { VoiceoverScreen } from './components/VoiceoverScreen';
import { SavedProjectsScreen } from './components/SavedProjectsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { Toast } from './components/Toast';

const MainAppContent: React.FC = () => {
  const { activeTab, theme } = useApp();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'generator':
        return <StoryGeneratorScreen />;
      case 'prompts':
        return <VideoPromptsScreen />;
      case 'voiceover':
        return <VoiceoverScreen />;
      case 'saved':
        return <SavedProjectsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <AndroidFrame>
      <div
        className={`flex-1 flex flex-col min-h-full transition-colors ${
          theme === 'dark' ? 'bg-[#031c14] text-emerald-100' : 'bg-slate-50 text-slate-900'
        }`}
      >
        <Navbar />
        <main className="flex-1 flex flex-col">
          {renderActiveScreen()}
        </main>
        <BottomNav />
        <Toast />
      </div>
    </AndroidFrame>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
