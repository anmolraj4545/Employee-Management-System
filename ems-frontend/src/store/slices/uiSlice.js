import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../utils/constants';

function loadThemeMode() {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME_MODE) || 'light';
  } catch {
    return 'light';
  }
}

function loadSidebarCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
  } catch {
    return false;
  }
}

const initialState = {
  themeMode: loadThemeMode(),
  sidebarCollapsed: loadSidebarCollapsed(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(STORAGE_KEYS.THEME_MODE, state.themeMode);
      } catch {
        // localStorage unavailable (e.g. private browsing) — UI preference just won't persist
      }
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      try {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(state.sidebarCollapsed));
      } catch {
        // ignore
      }
    },
  },
});

export const { toggleTheme, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
