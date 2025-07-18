import { useState, useEffect } from 'react';
import { useElectronStorage } from './useElectronStorage';

export const useTransferButtons = () => {
  const [showTransferButtons, setShowTransferButtons] = useState(true);
  const [loading, setLoading] = useState(false);
  const storage = useElectronStorage();

  // UI config'i yükle
  useEffect(() => {
    const loadUIConfig = async () => {
      if (!storage.isReady) return;

      try {
        const uiConfig = await storage.readJsonFile('ui_config.json');
        if (uiConfig && typeof uiConfig.showTransferButtons === 'boolean') {
          setShowTransferButtons(uiConfig.showTransferButtons);
          console.log('🎛️ UI Config yüklendi:', uiConfig);
        }
      } catch (error) {
        console.error('❌ UI Config yükleme hatası:', error);
      }
    };

    loadUIConfig();
  }, [storage.isReady]);

  // UI config'i kaydet
  const saveUIConfig = async (config: { showTransferButtons: boolean }) => {
    try {
      const success = await storage.writeJsonFile('ui_config.json', config);
      if (success) {
        console.log('💾 UI Config kaydedildi:', config);
      }
      return success;
    } catch (error) {
      console.error('❌ UI Config kaydetme hatası:', error);
      return false;
    }
  };

  // YENİ FONKSİYON: Transfer butonlarını tekrar göster
  const showTransferButtonsAgain = async () => {
    try {
      console.log('🔧 Transfer butonları tekrar gösteriliyor...');
      
      // UI config'i güncelle
      const success = await saveUIConfig({ showTransferButtons: true });
      if (success) {
        setShowTransferButtons(true);
        console.log('✅ Transfer butonları tekrar görünür hale getirildi');
        
        // localStorage'dan da temizle (fallback için)
        try {
          localStorage.removeItem('transferButtonsHidden');
        } catch (error) {
          // localStorage hatası önemli değil
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Transfer butonlarını gösterme hatası:', error);
      return false;
    }
  };

  // Dışa aktarım fonksiyonu - DÜZELTİLDİ
  const handleExport = async () => {

    setLoading(true);
    
    try {
      console.log('📦 Dışa aktarım başlatılıyor...');
      
      // Web storage'dan dışa aktarım
      const success = await storage.exportData();
      
      if (success) {
        alert('✅ Veriler başarıyla dışa aktarıldı!\n\n📁 JSON dosyası indirildi.\n📦 Tüm modül verileri dahil edildi.');
        console.log('📦 Dışa aktarım tamamlandı');
      } else {
        alert('❌ Dışa aktarım işlemi başarısız oldu.\n\nOlası nedenler:\n• Tarayıcı indirme engellendi\n• Veri bulunamadı');
      }
    } catch (error) {
      console.error('❌ Dışa aktarım hatası:', error);
      alert('❌ Dışa aktarım sırasında hata oluştu.\n\nHata: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // İçe aktarım fonksiyonu - DÜZELTİLDİ
  const handleImport = async () => {

    const confirmMessage = `⚠️ İçe aktarım işlemi hakkında önemli bilgiler:

🔄 Bu işlem:
• Mevcut tüm verilerin üzerine yazacaktır
• Organizasyon şemaları, eğitim materyalleri, süreç akışları, prosedürler ve SSS verilerini değiştirecektir
• Yüklenen tüm dosyaları değiştirecektir
• Bu işlem geri alınamaz

💾 Güvenlik:
• Web ortamında veriler localStorage'da saklanır
• Sayfa yenilendiğinde veriler korunur

📁 Dosya seçimi: 
• Sadece .json uzantılı yedek dosyaları kabul edilir
• Dosya seçim penceresi açılacaktır

Devam etmek istediğinizden emin misiniz?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    
    try {
      console.log('📥 İçe aktarım başlatılıyor...');
      
      // Web storage'a içe aktarım
      const success = await storage.importData();
      
      if (success) {
        alert('✅ Veriler başarıyla içe aktarıldı!\n\n🔄 Değişikliklerin görünmesi için sayfa yeniden yüklenecek.\n\n⏱️ Lütfen bekleyin...');
        console.log('📥 İçe aktarım tamamlandı - Sayfa yenileniyor...');
        
        // Sayfayı yenile
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert('❌ İçe aktarım işlemi iptal edildi veya başarısız oldu.\n\nOlası nedenler:\n• Dosya seçimi iptal edildi\n• Geçersiz JSON dosyası\n• Dosya okuma hatası');
      }
    } catch (error) {
      console.error('❌ İçe aktarım hatası:', error);
      alert('❌ İçe aktarım sırasında hata oluştu.\n\nHata: ' + error.message + '\n\nMevcut verileriniz korunmuştur.');
    } finally {
      setLoading(false);
    }
  };

  // Butonları gizleme fonksiyonu
  const hideTransferButtons = async () => {
    const confirmMessage = `🔒 İçe-Dışa Aktarım butonlarını gizlemek istediğinizden emin misiniz?

Bu işlem sonrası:
• ❌ Dışa Aktar butonu görünmez olacak
• ❌ İçe Aktar butonu görünmez olacak  
• ❌ Bu gizleme butonu da görünmez olacak

⚠️ Önemli:
• Bu işlem kalıcıdır
• Butonları tekrar göstermek için uygulamayı yeniden kurmanız gerekebilir
• Canlı sistem modu aktif olacaktır

🎯 Kullanım amacı:
• Son kullanıcılar için temiz arayüz
• Yayın sonrası sadeleştirme
• Kurumsal dağıtım için hazırlık

Devam etmek istiyor musunuz?`;

    if (confirm(confirmMessage)) {
      try {
        const success = await saveUIConfig({ showTransferButtons: false });
        if (success) {
          setShowTransferButtons(false);
          alert('🔒 İçe-Dışa Aktarım butonları başarıyla gizlendi!\n\n✨ Canlı sistem modu aktif edildi.\n🎯 Arayüz son kullanıcılar için optimize edildi.');
          console.log('🔒 Transfer butonları gizlendi');
        }
      } catch (error) {
        console.error('❌ Buton gizleme hatası:', error);
        alert('❌ Butonlar gizlenirken hata oluştu.\n\nHata: ' + error.message);
      }
    }
  };

  return {
    showTransferButtons,
    loading,
    handleExport,
    handleImport,
    hideTransferButtons,
    showTransferButtonsAgain // YENİ FONKSİYON EXPORT EDİLDİ
  };
};

// Electron tip tanımları kaldırıldı