import React, { useState, useEffect } from 'react';

interface AccessibilitySettingsProps {
  onDarkModeChange: (isDark: boolean) => void;
  onFontSizeChange: (size: 'small' | 'medium' | 'large') => void;
}

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  onDarkModeChange,
  onFontSizeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => {
    const saved = localStorage.getItem('fontSize');
    return (saved as 'small' | 'medium' | 'large') || 'medium';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    onDarkModeChange(isDarkMode);
  }, [isDarkMode, onDarkModeChange]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
    onFontSizeChange(fontSize);
  }, [fontSize, onFontSizeChange]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
  };

  return (
    <div className="accessibility-settings">
      <button
        className="accessibility-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Accessibility Settings"
      >
        {isDarkMode ? '🌙' : '☀️'}
      </button>

      {isOpen && (
        <div className="accessibility-menu">
          <div className="accessibility-header">
            <h3>Accessibility Settings</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>
          <div className="accessibility-content">
            <div className="setting-group">
              <label className="setting-label">Dark Mode</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-group">
              <label className="setting-label">Font Size</label>
              <div className="font-size-buttons">
                <button
                  className={`font-size-btn ${fontSize === 'small' ? 'active' : ''}`}
                  onClick={() => handleFontSizeChange('small')}
                  aria-label="Small font size"
                >
                  A
                </button>
                <button
                  className={`font-size-btn ${fontSize === 'medium' ? 'active' : ''}`}
                  onClick={() => handleFontSizeChange('medium')}
                  aria-label="Medium font size"
                >
                  A
                </button>
                <button
                  className={`font-size-btn ${fontSize === 'large' ? 'active' : ''}`}
                  onClick={() => handleFontSizeChange('large')}
                  aria-label="Large font size"
                >
                  A
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilitySettings; 