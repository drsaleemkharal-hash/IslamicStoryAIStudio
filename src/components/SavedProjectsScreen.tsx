import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GeneratedStory } from '../types';
import {
  FolderHeart,
  Search,
  Trash2,
  Edit2,
  Check,
  ExternalLink,
  Copy,
  Download,
  Upload,
  Clock,
  Sparkles,
  Clapperboard,
  BookOpen,
} from 'lucide-react';

export const SavedProjectsScreen: React.FC = () => {
  const {
    savedProjects,
    saveProject,
    deleteProject,
    setCurrentStory,
    setActiveTab,
    theme,
    language,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredProjects = savedProjects.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.titleUrdu.toLowerCase().includes(q) ||
      p.topic.toLowerCase().includes(q)
    );
  });

  const handleOpenProject = (story: GeneratedStory) => {
    setCurrentStory(story);
    setActiveTab('generator');
    showToast(language === 'ur' ? 'پروجیکٹ کھول دیا گیا' : 'Project opened in Story Studio');
  };

  const handleOpenInPrompts = (story: GeneratedStory) => {
    setCurrentStory(story);
    setActiveTab('prompts');
  };

  const startRename = (story: GeneratedStory) => {
    setEditingId(story.id);
    setEditTitle(language === 'ur' ? story.titleUrdu : story.title);
  };

  const saveRename = (story: GeneratedStory) => {
    if (editTitle.trim()) {
      const updated = {
        ...story,
        title: editTitle,
        titleUrdu: editTitle,
        updatedAt: Date.now(),
      };
      saveProject(updated);
    }
    setEditingId(null);
  };

  const handleExportAll = () => {
    const dataStr = JSON.stringify(savedProjects, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Islamic_Story_AI_Projects_Backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(language === 'ur' ? 'بیک اپ ڈاؤنلوڈ ہو گیا!' : 'All projects exported as JSON!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          parsed.forEach((proj) => saveProject(proj));
          showToast(language === 'ur' ? 'بیک اپ کامیابی سے امپورٹ ہو گیا!' : 'Backup imported successfully!');
        }
      } catch (err) {
        showToast('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
            <FolderHeart className="w-4 h-4 text-amber-400" />
            <span>
              {language === 'ur'
                ? 'میرے محفوظ شدہ پروجیکٹس'
                : 'My Saved Projects'}
            </span>
          </h2>
          <p className="text-xs text-emerald-200/80 font-urdu leading-tight">
            آپ کے تمام محفوظ کردہ کہانیاں اور AI ویڈیو پرامپٹس
          </p>
        </div>

        {/* Export / Import Backup actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-xs active:scale-95 transition-all"
            title="Export all projects as JSON"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-xs cursor-pointer active:scale-95 transition-all">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Restore</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            language === 'ur'
              ? 'محفوظ پروجیکٹس تلاش کریں...'
              : 'Search saved projects...'
          }
          className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm border ${
            theme === 'dark'
              ? 'bg-emerald-950/40 border-emerald-800/50 text-white placeholder-emerald-400/40'
              : 'bg-white border-emerald-200 text-gray-900'
          }`}
        />
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div
          className={`p-8 text-center rounded-2xl border space-y-3 ${
            theme === 'dark'
              ? 'bg-emerald-950/20 border-emerald-800/30'
              : 'bg-emerald-50/50 border-emerald-200'
          }`}
        >
          <FolderHeart className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">
            {language === 'ur' ? 'کوئی پروجیکٹ نہیں ملا' : 'No Saved Projects Found'}
          </h3>
          <p className="text-xs text-emerald-300/80 max-w-xs mx-auto">
            {language === 'ur'
              ? 'کہانی ساز یا ویڈیو پرامپٹ اسٹوڈیو میں جا کر کوئی کہانی تیار کریں اور محفوظ کریں!'
              : 'Create a story or video prompt in the studio and tap Save!'}
          </p>
          <button
            onClick={() => setActiveTab('generator')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs"
          >
            {language === 'ur' ? 'نئی کہانی بنائیں' : 'Create New Story'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`p-3.5 sm:p-4 rounded-2xl border space-y-2.5 transition-all ${
                theme === 'dark'
                  ? 'bg-emerald-950/30 border-emerald-800/40 hover:border-emerald-700/60'
                  : 'bg-white border-emerald-100 shadow-sm'
              }`}
            >
              {/* Title and rename */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {editingId === project.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="px-2 py-1 rounded text-xs bg-emerald-950 border border-emerald-600 text-white flex-1"
                        autoFocus
                      />
                      <button
                        onClick={() => saveRename(project)}
                        className="p-1 rounded bg-amber-500 text-emerald-950 hover:bg-amber-400"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <h3
                        className={`text-sm sm:text-base font-bold text-white truncate cursor-pointer hover:text-amber-400 transition-colors ${
                          language === 'ur' ? 'font-urdu' : ''
                        }`}
                        onClick={() => handleOpenProject(project)}
                      >
                        {language === 'ur' ? project.titleUrdu : project.title}
                      </h3>
                      <button
                        onClick={() => startRename(project)}
                        className="p-1 text-emerald-400 hover:text-white"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[10px] text-emerald-300/70 pt-0.5">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </span>
                    <span>•</span>
                    <span className="capitalize">{project.style}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-semibold">
                      {project.scenes?.length || 0} Scenes
                    </span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors"
                  title="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Story excerpt */}
              <p
                className={`text-xs text-emerald-100/80 line-clamp-2 leading-relaxed ${
                  language === 'ur' ? 'font-urdu text-right' : ''
                }`}
              >
                {language === 'ur' ? project.urduNarration : project.storyContent}
              </p>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-emerald-800/30 text-xs">
                <button
                  onClick={() => handleOpenProject(project)}
                  className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'کہانی کھولیں' : 'Open Story'}</span>
                </button>

                <button
                  onClick={() => handleOpenInPrompts(project)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 flex items-center gap-1 text-[11px]"
                >
                  <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ur' ? 'ویڈیو پرامپٹس' : 'View Prompts'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
