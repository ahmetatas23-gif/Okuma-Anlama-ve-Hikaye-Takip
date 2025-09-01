const SUPABASE_URL = 'https://gmzdeptaipfacmfdexnd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtemRlcHRhaXBmYWNtZmRleG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3Mzk2NzAsImV4cCI6MjA3MjMxNTY3MH0.uFenHsXWA0esrAoAYJ3MK6UoEW-8uNOc8CzYrJVyt5k';

let supabaseClient = null;

function initializeSupabase(url, key) {
  if (!url || !key) {
    console.error('Supabase URL ve Anon Key gereklidir!');
    return false;
  }
  
  try {
    supabaseClient = supabase.createClient(url, key);
    console.log('Supabase client başarıyla başlatıldı');
    return true;
  } catch (error) {
    console.error('Supabase client başlatma hatası:', error);
    return false;
  }
}

async function checkSupabaseConnection() {
  if (!supabaseClient) {
    throw new Error('Supabase client başlatılmamış');
  }
  
  try {
    const { data, error } = await supabaseClient.from('students').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Supabase bağlantı hatası:', error);
    throw error;
  }
}

async function createTables() {
  if (!supabaseClient) {
    throw new Error('Supabase client başlatılmamış');
  }

  console.log('Tablolar Supabase Dashboard\'dan oluşturulmalıdır:');
  console.log(`
    -- Students tablosu
    CREATE TABLE students (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      student_number VARCHAR(50) UNIQUE NOT NULL,
      tc_number VARCHAR(11) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Tests tablosu
    CREATE TABLE tests (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      text TEXT NOT NULL,
      text_display_mode VARCHAR(50) DEFAULT 'withQuestions',
      questions JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Test Results tablosu
    CREATE TABLE test_results (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
      test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
      assigned BOOLEAN DEFAULT true,
      completed BOOLEAN DEFAULT false,
      score INTEGER,
      answers JSONB,
      stars INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0,
      test_duration INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Student Profiles tablosu
    CREATE TABLE student_profiles (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
      total_points INTEGER DEFAULT 0,
      badges JSONB DEFAULT '[]',
      tests_completed INTEGER DEFAULT 0,
      tests_with_high_score INTEGER DEFAULT 0,
      fast_completions INTEGER DEFAULT 0,
      retake_successes INTEGER DEFAULT 0,
      average_stars DECIMAL(3,2) DEFAULT 0,
      total_stars INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Teachers tablosu (oturum yönetimi için)
    CREATE TABLE teachers (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Teacher Sessions tablosu
    CREATE TABLE teacher_sessions (
      id SERIAL PRIMARY KEY,
      teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
      session_token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Indexes
    CREATE INDEX idx_students_tc_number ON students(tc_number);
    CREATE INDEX idx_students_student_number ON students(student_number);
    CREATE INDEX idx_test_results_student_id ON test_results(student_id);
    CREATE INDEX idx_test_results_test_id ON test_results(test_id);
    CREATE INDEX idx_student_profiles_student_id ON student_profiles(student_id);
    CREATE INDEX idx_teacher_sessions_token ON teacher_sessions(session_token);
    CREATE INDEX idx_teacher_sessions_expires ON teacher_sessions(expires_at);
  `);
}

const SupabaseHelper = {
  students: {
    async getAll() {
      const { data, error } = await supabaseClient
        .from('students')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },

    async create(student) {
      const { data, error } = await supabaseClient
        .from('students')
        .insert([student])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabaseClient
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabaseClient
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },

    async findByCredentials(tcNumber, studentNumber) {
      const { data, error } = await supabaseClient
        .from('students')
        .select('*')
        .eq('tc_number', tcNumber)
        .eq('student_number', studentNumber)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  },

  tests: {
    async getAll() {
      const { data, error } = await supabaseClient
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async create(test) {
      const { data, error } = await supabaseClient
        .from('tests')
        .insert([test])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async getById(id) {
      const { data, error } = await supabaseClient
        .from('tests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabaseClient
        .from('tests')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  testResults: {
    async getByStudent(studentId) {
      const { data, error } = await supabaseClient
        .from('test_results')
        .select(`
          *,
          tests (id, title),
          students (id, name)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async getAll() {
      const { data, error } = await supabaseClient
        .from('test_results')
        .select(`
          *,
          tests (id, title),
          students (id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async create(result) {
      const { data, error } = await supabaseClient
        .from('test_results')
        .insert([result])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabaseClient
        .from('test_results')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async assignTest(studentId, testId) {
      const { data, error } = await supabaseClient
        .from('test_results')
        .insert([{
          student_id: studentId,
          test_id: testId,
          assigned: true,
          completed: false
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  studentProfiles: {
    async getByStudent(studentId) {
      const { data, error } = await supabaseClient
        .from('student_profiles')
        .select('*')
        .eq('student_id', studentId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    async create(profile) {
      const { data, error } = await supabaseClient
        .from('student_profiles')
        .insert([profile])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(studentId, updates) {
      const { data, error } = await supabaseClient
        .from('student_profiles')
        .update(updates)
        .eq('student_id', studentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  teachers: {
    async login(username, password) {
      const { data, error } = await supabaseClient
        .from('teachers')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) throw error;
      
      if (data.password_hash !== password) {
        throw new Error('Geçersiz şifre');
      }
      
      const sessionToken = generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat
      
      const { data: session, error: sessionError } = await supabaseClient
        .from('teacher_sessions')
        .insert([{
          teacher_id: data.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        }])
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      
      return { teacher: data, session };
    },

    async validateSession(sessionToken) {
      const { data, error } = await supabaseClient
        .from('teacher_sessions')
        .select(`
          *,
          teachers (*)
        `)
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error) throw error;
      return data;
    },

    async logout(sessionToken) {
      const { error } = await supabaseClient
        .from('teacher_sessions')
        .delete()
        .eq('session_token', sessionToken);
      
      if (error) throw error;
    }
  }
};

function generateSessionToken() {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

window.SupabaseHelper = SupabaseHelper;
window.initializeSupabase = initializeSupabase;
window.checkSupabaseConnection = checkSupabaseConnection;
window.createTables = createTables;


