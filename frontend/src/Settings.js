import React, { useState, useEffect } from 'react';
import './App.css';

function Settings({ bgMode = "image", handleToggleBg, onSettingsChange }) {
  const [preference, setPreference] = useState('default');
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [country, setCountry] = useState('us'); // Country state

  useEffect(() => {
    const savedPreference = localStorage.getItem('minlive_preference') || 'default';
    const savedTheme = localStorage.getItem('minlive_theme') || 'dark';
    const savedLanguage = localStorage.getItem('minlive_language') || 'en';
    const savedCountry = localStorage.getItem('minlive_country') || 'us';

    setPreference(savedPreference);
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    setCountry(savedCountry);
  }, []);

  const handleThemeChange = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("minlive_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    if (onSettingsChange) onSettingsChange({ preference, theme: newTheme, language });
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('minlive_language', newLanguage);
    if (onSettingsChange) onSettingsChange({ preference, theme, language: newLanguage });
  };

  const resetSettings = () => {
    setPreference('default');
    setTheme('dark');
    setLanguage('en');
    setCountry('us');

    localStorage.removeItem('minlive_preference');
    localStorage.removeItem('minlive_theme');
    localStorage.removeItem('minlive_language');
    localStorage.removeItem('minlive_country');

    document.documentElement.setAttribute('data-theme', 'dark');

    if (onSettingsChange) onSettingsChange({ preference: 'default', theme: 'dark', language: 'en' });
  };

  return (
    <div className="page-content">
      <h2>Settings</h2>

      <div className="settings-form">
        {/* Theme */}
        <div className="form-group">
          <label htmlFor="theme-select">Theme:</label>
          <select
            id="theme-select"
            value={theme}
            onChange={handleThemeChange}
            className="settings-select"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>

        {/* Language */}
        <div className="form-group">
          <label htmlFor="language-select">Language:</label>
          <select
            id="language-select"
            value={language}
            onChange={e => handleLanguageChange(e.target.value)}
            className="settings-select"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="pt">Português</option>
            <option value="zh">中文</option>
          </select>
        </div>

        {/* Country Flag */}
        <div className="form-group">
          <label>Select Country Flag:</label>
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              localStorage.setItem("minlive_country", e.target.value);
            }}
            className="settings-select"
          >
            <option value="us">United States</option>
            <option value="in">India</option>
            <option value="gb">United Kingdom</option>
            <option value="ca">Canada</option>
            <option value="fr">France</option>
            <option value="de">Germany</option>
            <option value="jp">Japan</option>
          </select>
        </div>

        {/* Background Mode Toggle */}
        <div className="form-group">
          <label>Background Mode:</label>
          <button
            onClick={handleToggleBg}
            className="bg-toggle-btn settings-btn"
            title={bgMode === "image" ? "Switch to Video Background" : "Switch to Image Background"}
          >
            Toggle Background
          </button>
        </div>

        {/* Reset Button */}
        <div className="form-group">
          <button
            onClick={resetSettings}
            className="reset-btn settings-btn"
            title="Reset all settings to default values"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="settings-info">
        <h3>About MinLive Settings</h3>
        <p><strong>Theme:</strong> Changes the visual appearance of the application.</p>
        <p><strong>Language:</strong> Sets the display language for the interface.</p>
        <p><strong>Country Flag:</strong> Displays the selected country flag in the UI.</p>
        <p><strong>Background:</strong> Toggle between static image and animated video backgrounds.</p>
      </div>
    </div>
  );
}

export default Settings;
