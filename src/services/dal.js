import { SupabaseProvider } from './providers/supabase.provider';

// Detect if we're running inside Electron
const isElectron = () => typeof window !== 'undefined' && window.electronAPI;

// Store the single instance
let dalInstance = null;

export function getDAL() {
  if (!dalInstance) {
    if (isElectron()) {
      // Offline Mode (Phase 5)
      // dalInstance = new SQLiteProvider();
      throw new Error("SQLite Provider not yet implemented");
    } else {
      // Online Mode
      dalInstance = new SupabaseProvider();
    }
  }
  return dalInstance;
}
