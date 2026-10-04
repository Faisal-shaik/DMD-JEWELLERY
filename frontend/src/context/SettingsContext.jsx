import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchSettings } from '../services/api';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    business_name: 'DMD JEWELLERY',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    maps_url: '',
    opening_time: '10:00 AM',
    closing_time: '08:30 PM',
    holiday: 'Sunday',
    about_text: 'DMD JEWELLERY offers timeless elegance with beautifully crafted gold, diamond, and silver jewellery.',
    logo_url: '/dmd_logo.jpg',
    social: {},
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const res = await fetchSettings();
      if (res.data.success && res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.warn('Could not load shop settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, reloadSettings: loadSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
