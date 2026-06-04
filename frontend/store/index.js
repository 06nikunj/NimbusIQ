import { configureStore } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { api } from './apiSlice.js'

// ---- SIDEBAR SLICE ----
// Controls whether sidebar is open or closed
const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: { isOpen: true },
  reducers: {
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen
    }
  }
})

// ---- THEME SLICE ----
// Controls dark mode on/off
const themeSlice = createSlice({
  name: 'theme',
  initialState: { isDark: true },
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark
    }
  }
})

export const { toggleSidebar } = sidebarSlice.actions
export const { toggleTheme } = themeSlice.actions

const store = configureStore({
  reducer: {
    sidebar: sidebarSlice.reducer,
    theme: themeSlice.reducer,
    [api.reducerPath]: api.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)
})

export default store
