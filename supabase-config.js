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
    // Öğrenci işlemleri
    students: {
        // Yeni öğrenci kaydet
        async register(studentData) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            try {
                const { data, error } = await client
                    .from('students')
                    .insert([{
                        name: studentData.name,
                        student_number: studentData.student_number,
                        tc_number: studentData.tc_number
                    }])
                    .select()
                    .single();
                
                if (error) {
                    console.error('Öğrenci kayıt hatası:', error);
                    return { data: null, error: error.message };
                }
                
                // Öğrenci kaydedildikten sonra profil oluştur
                await this.createProfile(data.id);
                
                return { data, error: null };
            } catch (err) {
                console.error('Öğrenci kayıt işlemi hatası:', err);
                return { data: null, error: err.message };
            }
        },

        // Öğrenci giriş (TC kimlik ve öğrenci numarası ile)
        async login(tcNumber, studentNumber) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            try {
                const { data, error } = await client
                    .from('students')
                    .select('*')
                    .eq('tc_number', tcNumber)
                    .eq('student_number', studentNumber)
                    .single();
                
                if (error) {
                    console.error('Öğrenci giriş hatası:', error);
                    return { data: null, error: 'Giriş bilgileri hatalı' };
                }
                
                return { data, error: null };
            } catch (err) {
                console.error('Öğrenci giriş işlemi hatası:', err);
                return { data: null, error: 'Giriş işlemi başarısız' };
            }
        },

        // Öğrenci profili oluştur
        async createProfile(studentId) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            try {
                const { data, error } = await client
                    .from('student_profiles')
                    .insert([{
                        student_id: studentId,
                        total_points: 0,
                        badges: [],
                        tests_completed: 0,
                        tests_with_high_score: 0,
                        fast_completions: 0,
                        retake_successes: 0,
                        average_stars: 0.00,
                        total_stars: 0
                    }]);
                
                return { data, error };
            } catch (err) {
                console.error('Profil oluşturma hatası:', err);
                return { data: null, error: err.message };
            }
        },

        // Tüm öğrencileri getir
        async getAll() {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('students')
                .select('*')
                .order('created_at', { ascending: false });
        },

        // ID ile öğrenci getir
        async getById(id) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('students')
                .select('*')
                .eq('id', id)
                .single();
        }
    },

    // Test işlemleri
    tests: {
        // Yeni test oluştur
        async create(testData) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('tests')
                .insert([testData])
                .select()
                .single();
        },

        // Tüm testleri getir
        async getAll() {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('tests')
                .select('*')
                .order('created_at', { ascending: false });
        },

        // ID ile test getir
        async getById(id) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('tests')
                .select('*')
                .eq('id', id)
                .single();
        },

        // Test güncelle
        async update(id, updates) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('tests')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
        },

        // Test sil
        async delete(id) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('tests')
                .delete()
                .eq('id', id);
        }
    },

    // Test sonuçları işlemleri
    testResults: {
        // Test sonucu kaydet
        async save(resultData) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            try {
                const { data, error } = await client
                    .from('test_results')
                    .insert([{
                        student_id: resultData.student_id,
                        test_id: resultData.test_id,
                        completed: resultData.completed || false,
                        score: resultData.score || 0,
                        points: resultData.points || 0,
                        stars: resultData.stars || 0,
                        answers: resultData.answers || {},
                        test_duration: resultData.test_duration || 0
                    }])
                    .select()
                    .single();
                
                if (error) {
                    console.error('Test sonucu kaydetme hatası:', error);
                    return { data: null, error: error.message };
                }
                
                // Test sonucu kaydedildikten sonra öğrenci profilini güncelle
                await SupabaseHelper.studentProfiles.updateAfterTest(resultData.student_id, resultData);
                
                return { data, error: null };
            } catch (err) {
                console.error('Test sonucu kaydetme işlemi hatası:', err);
                return { data: null, error: err.message };
            }
        },

        // Öğrencinin test sonuçlarını getir
        async getByStudent(studentId) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('test_results')
                .select(`
                    *,
                    tests (
                        title,
                        description,
                        difficulty_level
                    )
                `)
                .eq('student_id', studentId)
                .order('created_at', { ascending: false });
        },

        // Belirli bir testin sonuçlarını getir
        async getByTest(testId) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('test_results')
                .select(`
                    *,
                    students (
                        name,
                        student_number
                    )
                `)
                .eq('test_id', testId)
                .order('score', { ascending: false });
        },

        // Öğrencinin belirli bir testteki sonucunu getir
        async getByStudentAndTest(studentId, testId) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('test_results')
                .select('*')
                .eq('student_id', studentId)
                .eq('test_id', testId)
                .single();
        }
    },

    // Öğrenci profilleri işlemleri
    studentProfiles: {
        // Öğrenci profilini getir
        async getByStudent(studentId) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            return await client
                .from('student_profiles')
                .select('*')
                .eq('student_id', studentId)
                .single();
        },

        // Test sonrası profil güncelleme
        async updateAfterTest(studentId, testResult) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            try {
                // Mevcut profili getir
                const { data: profile, error: profileError } = await this.getByStudent(studentId);
                if (profileError) {
                    console.error('Profil getirme hatası:', profileError);
                    return { data: null, error: profileError.message };
                }
                
                // Yeni değerleri hesapla
                const newTestsCompleted = profile.tests_completed + 1;
                const newTotalPoints = profile.total_points + (testResult.points || 0);
                const newTotalStars = profile.total_stars + (testResult.stars || 0);
                const newAverageStars = newTotalStars / newTestsCompleted;
                const newHighScoreTests = (testResult.score >= 80) ? profile.tests_with_high_score + 1 : profile.tests_with_high_score;
                
                // Profili güncelle
                const { data, error } = await client
                    .from('student_profiles')
                    .update({
                        total_points: newTotalPoints,
                        tests_completed: newTestsCompleted,
                        tests_with_high_score: newHighScoreTests,
                        average_stars: newAverageStars,
                        total_stars: newTotalStars
                    })
                    .eq('student_id', studentId)
                    .select()
                    .single();
                
                return { data, error };
            } catch (err) {
                console.error('Profil güncelleme hatası:', err);
                return { data: null, error: err.message };
            }
        },

        // Rozet ekle
        async addBadge(studentId, badgeId) {
            const client = getSupabaseClient();
            if (!client) return { data: null, error: 'Supabase client bulunamadı' };
            
            try {
                const { data: profile, error: profileError } = await this.getByStudent(studentId);
                if (profileError) return { data: null, error: profileError.message };
                
                const currentBadges = profile.badges || [];
                if (!currentBadges.includes(badgeId)) {
                    currentBadges.push(badgeId);
                    
                    const { data, error } = await client
                        .from('student_profiles')
                        .update({ badges: currentBadges })
                        .eq('student_id', studentId)
                        .select()
                        .single();
                    
                    return { data, error };
                }
                
                return { data: profile, error: null };
            } catch (err) {
                console.error('Rozet ekleme hatası:', err);
                return { data: null, error: err.message };
            }
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

