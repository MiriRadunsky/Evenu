import { useState, useEffect, useRef } from 'react';
import { 
  Accessibility,
  Type, 
  Contrast, 
  Link as LinkIcon, 
  BookOpen, 
  MousePointer,
  Keyboard,
  X,
  RotateCcw
} from 'lucide-react';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  highlightLinks: boolean;
  readableFont: boolean;
  cursorSize: 'normal' | 'large';
  keyboardNav: boolean;
}

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 100,
    highContrast: false,
    highlightLinks: false,
    readableFont: false,
    cursorSize: 'normal',
    keyboardNav: false,
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('accessibilitySettings', JSON.stringify(updated));
    applySettings(updated);
  };

  const applySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;

    root.style.fontSize = `${settings.fontSize}%`;

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.highlightLinks) {
      root.classList.add('highlight-links');
    } else {
      root.classList.remove('highlight-links');
    }

    if (settings.readableFont) {
      root.classList.add('readable-font');
    } else {
      root.classList.remove('readable-font');
    }

    if (settings.cursorSize === 'large') {
      root.classList.add('large-cursor');
    } else {
      root.classList.remove('large-cursor');
    }

    if (settings.keyboardNav) {
      root.classList.add('keyboard-nav');
    } else {
      root.classList.remove('keyboard-nav');
    }
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 100,
      highContrast: false,
      highlightLinks: false,
      readableFont: false,
      cursorSize: 'normal',
      keyboardNav: false,
    };
    setSettings(defaultSettings);
    localStorage.removeItem('accessibilitySettings');
    applySettings(defaultSettings);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      const firstFocusable = menuRef.current?.querySelector('button');
      firstFocusable?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      {/* Accessibility Button - Narrow Rectangle Peeking from Left Side (RTL) */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleButtonKeyDown}
        className="accessibility-button fixed left-0 bottom-20 z-50 py-5 px-2.5 rounded-r-2xl bg-gradient-to-b from-[#d4a960] to-[#c89645] text-white shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 hover:px-3.5 focus:outline-none focus:ring-4 focus:ring-[#d4a960] focus:ring-offset-2 group"
        aria-label="פתיחת תפריט נגישות"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="נגישות"
        tabIndex={0}
        style={{ minHeight: '120px', minWidth: '48px' }}
      >
        <Accessibility className="w-7 h-7 flex-shrink-0" aria-hidden="true" />
        <span 
          className="text-xs font-bold tracking-wider select-none" 
          style={{ 
            writingMode: 'vertical-rl', 
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            letterSpacing: '0.1em'
          }}
        >
          נגישות
        </span>
      </button>

      {/* Accessibility Menu Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div 
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-menu-title"
            className="fixed left-16 bottom-20 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border-2 border-[#d4a960] overflow-hidden animate-in slide-in-from-left"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#d4a960] to-[#c89645] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-white" aria-hidden="true" />
                <h3 id="accessibility-menu-title" className="text-lg font-bold text-white">הגדרות נגישות</h3>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="סגור תפריט נגישות"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[70vh] overflow-y-auto" dir="rtl">
              <div className="space-y-4">
                {/* Font Size */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Type className="w-5 h-5 text-[#d4a960]" />
                    <label className="font-semibold text-gray-900">גודל טקסט</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateSettings({ fontSize: Math.max(80, settings.fontSize - 10) })}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4a960]"
                      aria-label="הקטן טקסט"
                    >
                      A-
                    </button>
                    <span className="flex-1 text-center font-medium text-gray-700" role="status" aria-live="polite">
                      {settings.fontSize}%
                    </span>
                    <button
                      onClick={() => updateSettings({ fontSize: Math.min(150, settings.fontSize + 10) })}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4a960]"
                      aria-label="הגדל טקסט"
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* High Contrast */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => updateSettings({ highContrast: !settings.highContrast })}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4a960] ${
                      settings.highContrast 
                        ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                    role="switch"
                    aria-checked={settings.highContrast}
                    aria-label="ניגודיות גבוהה"
                  >
                    <div className="flex items-center gap-2">
                      <Contrast className="w-5 h-5" aria-hidden="true" />
                      <span className="font-semibold">ניגודיות גבוהה</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      settings.highContrast ? 'bg-white/30' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        settings.highContrast ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </button>
                </div>

                {/* Highlight Links */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => updateSettings({ highlightLinks: !settings.highlightLinks })}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4a960] ${
                      settings.highlightLinks 
                        ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                    role="switch"
                    aria-checked={settings.highlightLinks}
                    aria-label="הדגש קישורים"
                  >
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-5 h-5" aria-hidden="true" />
                      <span className="font-semibold">הדגש קישורים</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      settings.highlightLinks ? 'bg-white/30' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        settings.highlightLinks ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </button>
                </div>

                {/* Readable Font */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => updateSettings({ readableFont: !settings.readableFont })}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4a960] ${
                      settings.readableFont 
                        ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                    role="switch"
                    aria-checked={settings.readableFont}
                    aria-label="גופן קריא"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" aria-hidden="true" />
                      <span className="font-semibold">גופן קריא</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      settings.readableFont ? 'bg-white/30' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        settings.readableFont ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </button>
                </div>

                {/* Large Cursor */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => updateSettings({ 
                      cursorSize: settings.cursorSize === 'normal' ? 'large' : 'normal' 
                    })}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4a960] ${
                      settings.cursorSize === 'large' 
                        ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                    role="switch"
                    aria-checked={settings.cursorSize === 'large'}
                    aria-label="סמן גדול"
                  >
                    <div className="flex items-center gap-2">
                      <MousePointer className="w-5 h-5" aria-hidden="true" />
                      <span className="font-semibold">סמן גדול</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      settings.cursorSize === 'large' ? 'bg-white/30' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        settings.cursorSize === 'large' ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </button>
                </div>

                {/* Keyboard Navigation */}
                <div className="pb-4">
                  <button
                    onClick={() => updateSettings({ keyboardNav: !settings.keyboardNav })}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4a960] ${
                      settings.keyboardNav 
                        ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                    role="switch"
                    aria-checked={settings.keyboardNav}
                    aria-label="ניווט מקלדת"
                  >
                    <div className="flex items-center gap-2">
                      <Keyboard className="w-5 h-5" aria-hidden="true" />
                      <span className="font-semibold">ניווט מקלדת</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      settings.keyboardNav ? 'bg-white/30' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        settings.keyboardNav ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </button>
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetSettings}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="איפוס כל הגדרות הנגישות"
                >
                  <RotateCcw className="w-5 h-5" aria-hidden="true" />
                  <span>איפוס הגדרות</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
