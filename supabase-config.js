// Supabase Konfigürasyon Dosyası
// Bu dosya Okuma Anlama ve Hikaye Takip Platformu için Supabase bağlantı ayarlarını içerir

// Supabase proje bilgileri
const SUPABASE_URL = 'https://klbgkxnwnbxqxtvxfshe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsYmdreG53bmJ4cXh0dnhmc2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzM1ODAsImV4cCI6MjA3MjIwOTU4MH0.nababKyMKhOxgb-zP8R_Ho1GaCBW3fprc1_BKk7H4oE';

// Supabase client'ını oluştur
let supabaseClient = null;

// Supabase'i başlat
function initializeSupabase() {
    try {
        if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase başarıyla başlatıldı');
            return true;
        } else {
            console.error('❌ Supabase SDK yüklenmemiş veya konfigürasyon eksik');
            return false;
        }
    } catch (error) {
        console.error('❌ Supabase başlatma hatası:', error);
        return false;
    }
}

// Supabase client'ını al
function getSupabaseClient() {
    if (!supabaseClient) {
        initializeSupabase();
    }
    return supabaseClient;
}

// Supabase Helper fonksiyonları
const SupabaseHelper = {
    // Görev (task) işlemleri
    tasks: {
        // Tüm görevleri getir
        async getAll() {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });
        },

        // Yeni görev ekle
        async add(task) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('tasks')
                .insert([task]);
        },

        // Görev güncelle
        async update(id, updates) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('tasks')
                .update(updates)
                .eq('id', id);
        },

        // Görev sil
        async delete(id) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('tasks')
                .delete()
                .eq('id', id);
        }
    },

    // Öğrenci işlemleri
    students: {
        // Öğrenci kaydet
        async register(studentData) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('students')
                .insert([studentData]);
        },

        // Öğrenci giriş
        async login(username, password) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('students')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();
        }
    },

    // Öğretmen işlemleri
    teachers: {
        // Öğretmen giriş
        async login(username, password) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('teachers')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();
        },

        // Öğretmen çıkış
        async logout(sessionToken) {
            // Basit logout işlemi
            console.log('Öğretmen oturumu sonlandırıldı');
            return { data: true, error: null };
        }
    },

    // Test sonuçları işlemleri
    testResults: {
        // Test sonucu kaydet
        async save(resultData) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('test_results')
                .insert([resultData]);
        },

        // Test sonuçlarını getir
        async getByStudent(studentId) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('test_results')
                .select('*')
                .eq('student_id', studentId)
                .order('created_at', { ascending: false });
        }
    }
};

// Sayfa yüklendiğinde Supabase'i başlat
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabase();
});

// Global değişkenleri window objesine ekle
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.SupabaseHelper = SupabaseHelper;
window.getSupabaseClient = getSupabaseClient;

