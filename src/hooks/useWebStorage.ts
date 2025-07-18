import { useState, useEffect, useCallback } from 'react';

// Web Storage Hook - Electron yerine localStorage/IndexedDB kullanır
export const useWebStorage = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  // JSON dosyası oku - localStorage'dan
  const readJsonFile = useCallback(async (filename: string) => {
    if (!isReady) return null;
    
    try {
      const key = filename.replace('.json', '');
      const data = localStorage.getItem(`pds_${key}`);
      console.log(`📖 [WEB] JSON dosyası okundu: ${filename}`, data ? 'Veri var' : 'Veri yok');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`❌ [WEB] JSON okuma hatası (${filename}):`, error);
      return null;
    }
  }, [isReady]);

  // JSON dosyası yaz - localStorage'a
  const writeJsonFile = useCallback(async (filename: string, data: any) => {
    if (!isReady) return false;
    
    try {
      const key = filename.replace('.json', '');
      localStorage.setItem(`pds_${key}`, JSON.stringify(data));
      console.log(`💾 [WEB] JSON dosyası kaydedildi: ${filename}`);
      return true;
    } catch (error) {
      console.error(`❌ [WEB] JSON yazma hatası (${filename}):`, error);
      return false;
    }
  }, [isReady]);

  // Yayın durumunu güncelle
  const updateYayinDurumu = useCallback(async (moduleName: string, isPublished: boolean) => {
    if (!isReady) return false;
    
    try {
      console.log(`🚀 [WEB] Yayın durumu güncelleniyor: ${moduleName} = ${isPublished}`);
      
      // Mevcut yayın durumlarını al
      const currentData = localStorage.getItem('pds_yayinda');
      const yayinData = currentData ? JSON.parse(currentData) : {
        "TB2_TB3_Entegrasyon_Grubu": false,
        "Akinci_Entegrasyon_Grubu": false,
        "Kizilelma_Entegrasyon_Grubu": false,
        "On_Montaj_Grubu": false,
        "Kalite_Kontrol_Takimi": false,
        "Hafif_Platformlar_Takimi": false,
        "Surec_Yonetimi_Takimi": false,
        "Gelistirme_Grubu": false,
        "Surdurulebilir_Uretim_Takimi": false,
        "Saha_Operasyonlari_Ekibi": false,
        "Idari_Isler_Ekibi": false,
        "EgitimModulu": false,
        "SSSModulu": false,
        "SurecAkislari": false,
        "ProsedurTalimatlar": false
      };
      
      yayinData[moduleName] = isPublished;
      localStorage.setItem('pds_yayinda', JSON.stringify(yayinData));
      
      console.log(`🚀 [WEB] Yayın durumu güncellendi: ${moduleName} = ${isPublished}`);
      return true;
    } catch (error) {
      console.error(`❌ [WEB] Yayın durumu güncelleme hatası:`, error);
      return false;
    }
  }, [isReady]);

  // Dosya kaydet - Base64 olarak localStorage'a
  const saveFile = useCallback(async (filename: string, data: string, encoding: string = 'utf8') => {
    if (!isReady) return false;
    
    try {
      // Dosya boyutu kontrolü
      const dataSize = new Blob([data]).size;
      const maxSize = 2.5 * 1024 * 1024; // 2.5MB limit
      
      if (dataSize > maxSize) {
        console.warn(`⚠️ [WEB] Dosya boyutu sınırı aşıldı: ${(dataSize / 1024 / 1024).toFixed(1)} MB`);
        throw new Error(`Dosya çok büyük: ${(dataSize / 1024 / 1024).toFixed(1)} MB (max: 2.5 MB)`);
      }
      
      // Eski dosyaları temizle (alan açmak için)
      const keys = Object.keys(localStorage);
      const fileKeys = keys.filter(key => key.startsWith('pds_file_')).sort();
      
      if (fileKeys.length > 10) { // En fazla 10 dosya tut
        const oldestKeys = fileKeys.slice(0, fileKeys.length - 10);
        oldestKeys.forEach(key => {
          localStorage.removeItem(key);
          console.log(`🗑️ [WEB] Eski dosya temizlendi: ${key}`);
        });
      }
      
      localStorage.setItem(`pds_file_${filename}`, data);
      console.log(`💾 [WEB] Dosya kaydedildi: ${filename} (${(dataSize / 1024).toFixed(1)} KB)`);
      return true;
    } catch (error) {
      console.error(`❌ [WEB] Dosya kaydetme hatası (${filename}):`, error);
      
      if (error.name === 'QuotaExceededError') {
        // Acil temizlik yap
        const keys = Object.keys(localStorage);
        const fileKeys = keys.filter(key => key.startsWith('pds_file_'));
        fileKeys.forEach(key => localStorage.removeItem(key));
        
        // Tekrar dene
        try {
          localStorage.setItem(`pds_file_${filename}`, data);
          console.log(`💾 [WEB] Dosya acil temizlik sonrası kaydedildi: ${filename}`);
          return true;
        } catch (retryError) {
          console.error(`❌ [WEB] Acil temizlik sonrası da başarısız:`, retryError);
          return false;
        }
      }
      
      return false;
    }
  }, [isReady]);

  // Dosya oku - localStorage'dan
  const readFile = useCallback(async (filename: string, encoding: string = 'utf8') => {
    if (!isReady) return null;
    
    try {
      const data = localStorage.getItem(`pds_file_${filename}`);
      console.log(`📖 [WEB] Dosya okundu: ${filename}`, data ? `${data.length} karakter` : 'Bulunamadı');
      return data;
    } catch (error) {
      console.error(`❌ [WEB] Dosya okuma hatası (${filename}):`, error);
      return null;
    }
  }, [isReady]);

  // Dosya var mı kontrol et
  const fileExists = useCallback(async (filename: string) => {
    if (!isReady) return false;
    
    const exists = localStorage.getItem(`pds_file_${filename}`) !== null;
    console.log(`🔍 [WEB] Dosya varlık kontrolü: ${filename} = ${exists}`);
    return exists;
  }, [isReady]);

  // Uygulama bilgilerini al
  const getAppInfo = useCallback(async () => {
    return {
      version: '1.0.0-web',
      name: 'Personel Destek Sistemi (Web)',
      dataPath: 'localStorage',
      isDev: import.meta.env.DEV
    };
  }, []);

  // Web için veri dışa aktarma
  const exportData = useCallback(async () => {
    try {
      console.log('📦 [WEB] Veri dışa aktarımı başlatılıyor...');
      
      // Tüm PDS verilerini topla
      const exportData: { [key: string]: any } = {};
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith('pds_')) {
          const cleanKey = key.replace('pds_', '');
          const value = localStorage.getItem(key);
          if (value) {
            try {
              exportData[cleanKey] = JSON.parse(value);
            } catch {
              exportData[cleanKey] = value; // String olarak sakla
            }
          }
        }
      });
      
      // JSON dosyası olarak indir
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `personel_destek_yedek_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      link.click();
      
      console.log('📦 [WEB] Veri dışa aktarımı tamamlandı');
      return true;
    } catch (error) {
      console.error('❌ [WEB] Dışa aktarım hatası:', error);
      return false;
    }
  }, []);

  // Web için veri içe aktarma
  const importData = useCallback(async () => {
    return new Promise<boolean>((resolve) => {
      try {
        console.log('📥 [WEB] Veri içe aktarımı başlatılıyor...');
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) {
            resolve(false);
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const importedData = JSON.parse(event.target?.result as string);
              
              // Mevcut verileri yedekle
              const backup: { [key: string]: string | null } = {};
              const keys = Object.keys(localStorage);
              keys.forEach(key => {
                if (key.startsWith('pds_')) {
                  backup[key] = localStorage.getItem(key);
                }
              });
              
              // Yeni verileri yükle
              Object.keys(importedData).forEach(key => {
                const value = importedData[key];
                const storageKey = `pds_${key}`;
                
                if (typeof value === 'object') {
                  localStorage.setItem(storageKey, JSON.stringify(value));
                } else {
                  localStorage.setItem(storageKey, value);
                }
              });
              
              console.log('📥 [WEB] Veri içe aktarımı tamamlandı');
              resolve(true);
            } catch (error) {
              console.error('❌ [WEB] İçe aktarım parse hatası:', error);
              resolve(false);
            }
          };
          
          reader.onerror = () => {
            console.error('❌ [WEB] Dosya okuma hatası');
            resolve(false);
          };
          
          reader.readAsText(file);
        };
        
        input.click();
      } catch (error) {
        console.error('❌ [WEB] İçe aktarım hatası:', error);
        resolve(false);
      }
    });
  }, []);

  return {
    isReady,
    isElectron: false, // Web ortamı
    readJsonFile,
    writeJsonFile,
    updateYayinDurumu,
    saveFile,
    readFile,
    fileExists,
    getAppInfo,
    exportData,
    importData
  };
};