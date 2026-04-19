/**
 * en espera para Supabase.
 * Se mantiene para poder reactivar supa más adelante
 * sin cambiar la lógica de negocio ni la presentación.
 */

// import { createClient } from '@supabase/supabase-js';

// export const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

type SupabaseError = { message: string } | null;

type SupabaseInsertResult<T> = Promise<{ data: T[]; error: SupabaseError }>;
type SupabaseSelectResult<T> = Promise<{ data: T[]; error: SupabaseError }>;

type SupabaseTableClient = {
  insert<T>(data: T[]): SupabaseInsertResult<T>;
  select<T>(query?: string): SupabaseSelectResult<T>;
};

export const supabase = {
  from: (tabla: string): SupabaseTableClient => {
    void tabla;

    return {
      insert: async <T>(data: T[]) => ({ data, error: null }),
      select: async <T>(query?: string) => {
        void query;
        return { data: [] as T[], error: null };
      },
    };
  },
};