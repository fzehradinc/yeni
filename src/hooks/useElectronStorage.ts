import { useWebStorage } from './useWebStorage';


// Web Storage Hook (Electron yerine)
export const useElectronStorage = () => {
  // Web storage hook'unu kullan
  return useWebStorage();
};

// Geriye uyumluluk için tip tanımları kaldırıldı