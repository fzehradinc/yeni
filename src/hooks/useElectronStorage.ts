import { useWebStorage } from './useWebStorage';

/**
 * Web Storage Hook - Artık tamamen web tabanlı
 * Electron bağımlılıkları kaldırıldı, localStorage/IndexedDB kullanır
 */
export const useElectronStorage = () => {
  // Web storage hook'unu kullan
  return useWebStorage();
};

// Geriye uyumluluk için tip tanımları
export interface StorageHook {
  isReady: boolean;
  isElectron: boolean;
  readJsonFile: (filename: string) => Promise<any>;
  writeJsonFile: (filename: string, data: any) => Promise<boolean>;
  updateYayinDurumu: (moduleName: string, isPublished: boolean) => Promise<boolean>;
  saveFile: (filename: string, data: string, encoding?: string) => Promise<boolean>;
  readFile: (filename: string, encoding?: string) => Promise<string | null>;
  fileExists: (filename: string) => Promise<boolean>;
  getAppInfo: () => Promise<any>;
  exportData: () => Promise<boolean>;
  importData: () => Promise<boolean>;
}