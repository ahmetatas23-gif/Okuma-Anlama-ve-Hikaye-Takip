// Supabase Konfigürasyon Dosyası
// Bu dosya Okuma Anlama ve Hikaye Takip Platformu için Supabase bağlantı ayarlarını içerir

// Supabase proje bilgileri
const SUPABASE_URL = 'https://gmzdeptaipfacmfdexnd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtemRlcHRhaXBmYWNtZmRleG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3Mzk2NzAsImV4cCI6MjA3MjMxNTY3MH0.uFenHsXWA0esrAoAYJ3MK6UoEW-8uNOc8CzYrJVyt5k';

// Supabase client'ını oluştur
let supabaseClient = null;

// Supabase'i başlat
function initializeSupabase( ) {
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

// Supabase Helper fonksiyonları (GÜNCELLENMİŞ VE DÜZELTİLMİŞ HALİ)
const SupabaseHelper = {
    // Öğrenci işlemleri
    students: {
        async getAll() {
            const client = getSupabaseClient();
            if (!client) return [];
            const { data, error } = await client.from('students').select('*');
            if (error) throw error;
            return data;
        },
        async create(studentData) {
            const client = getSupabaseClient();
            if (!client) throw new Error('Supabase client bulunamadı');
            const { data, error } = await client.from('students').insert([studentData]).select().single();
            if (error) throw error;
            return data;
        }
    },

    // Test işlemleri
    tests: {
        async getAll() {
            const client = getSupabaseClient();
            if (!client) return [];
            const { data, error } = await client.from('tests').select('*');
            if (error) throw error;
            return data;
        },
        async create(testData) {
            const client = getSupabaseClient();
            if (!client) throw new Error('Supabase client bulunamadı');
            const { data, error } = await client.from('tests').insert([testData]).select().single();
            if (error) throw error;
            return data;
        }
    },

    // Test sonuçları işlemleri
    testResults: {
        async getAll() {
            const client = getSupabaseClient();
            if (!client) return [];
            const { data, error } = await client.from('test_results').select('*, students(name), tests(title)');
            if (error) throw error;
            return data;
        },
        async assignTest(studentId, testId) {
            const client = getSupabaseClient();
            if (!client) throw new Error('Supabase client bulunamadı');
            const { data, error } = await client.from('test_results').insert([{ student_id: studentId, test_id: testId }]).select().single();
            if (error) throw error;
            return data;
        },
        async update(resultId, updates) {
            const client = getSupabaseClient();
            if (!client) throw new Error('Supabase client bulunamadı');
            const { data, error } = await client.from('test_results').update(updates).eq('id', resultId).select().single();
            if (error) throw error;
            return data;
        }
    },

    // Öğrenci profili işlemleri
    studentProfiles: {
        async create(profileData) {
            const client = getSupabaseClient();
            if (!client) throw new Error('Supabase client bulunamadı');
            const { data, error } = await client.from('student_profiles').insert([profileData]).select().single();
            if (error) throw error;
            return data;
        },
        async update(studentId, updates) {
            const client = getSupabaseClient();
            if (!client) throw new Error('Supabase client bulunamadı');
            const { data, error } = await client.from('student_profiles').update(updates).eq('student_id', studentId).select().single();
            if (error) throw error;
            return data;
        }
    },
    
    // Öğretmen işlemleri
    teachers: {
        async login(username, password) {
            console.log("Öğretmen girişi denemesi:", username);
            return null;
        },
        async logout(sessionToken) {
            console.log('Öğretmen oturumu sonlandırıldı');
            return { data: true, error: null };
        }
    }
}; // <-- Hatanın kaynağı muhtemelen buradaki eksik noktalı virgüldü.

// Sayfa yüklendiğinde Supabase'i başlat
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabase();
});

// Global değişkenleri window objesine ekle
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.SupabaseHelper = SupabaseHelper;
window.getSupabaseClient = getSupabaseClient;
