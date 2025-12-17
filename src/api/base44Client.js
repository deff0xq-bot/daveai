import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const createEntityProxy = (tableName) => {
  return {
    async create(data) {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    async list(orderBy = '-created_date', limit = 100) {
      const order = orderBy.startsWith('-') ? 'desc' : 'asc';
      const column = orderBy.replace('-', '');
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(column, { ascending: order === 'asc' })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
    async filter(conditions, orderBy = 'created_date', limit = 100) {
      const order = orderBy.startsWith('-') ? 'desc' : 'asc';
      const column = orderBy.replace('-', '');
      let query = supabase.from(tableName).select('*');

      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query
        .order(column, { ascending: order === 'asc' })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
    async update(id, data) {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
  };
};

export const base44 = {
  auth: {
    async me() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error('Not authenticated');
      return { email: user.email, id: user.id, ...user.user_metadata };
    },
    async updateMe(data) {
      const { data: result, error } = await supabase.auth.updateUser({
        data: data
      });
      if (error) throw error;
      return result.user;
    },
    async signInWithPassword(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return data;
    },
    async signUp(email, password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;
      return data;
    },
    logout() {
      return supabase.auth.signOut();
    }
  },
  entities: {
    Project: createEntityProxy('projects'),
    Message: createEntityProxy('messages'),
    CreditTransaction: createEntityProxy('credit_transactions'),
    Deployment: createEntityProxy('deployments'),
    Subscription: createEntityProxy('subscriptions'),
    CodeVersion: createEntityProxy('code_versions')
  },
  integrations: {
    Core: {
      async InvokeLLM({ prompt, add_context_from_internet, file_urls }) {
        return 'Generated response from AI';
      },
      async UploadFile({ file }) {
        const fileName = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(fileName, file);
        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName);

        return { file_url: publicUrl };
      },
      async GenerateImage({ prompt }) {
        return { url: 'https://via.placeholder.com/512' };
      }
    }
  }
};

export { supabase };
