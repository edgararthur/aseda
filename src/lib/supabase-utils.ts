import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export async function getCount<T>(query: PostgrestFilterBuilder<any, any, T[], any, unknown>): Promise<number> {
    const { data, error } = await query.select('id', { count: 'exact', head: true });
    
    if (error) {
        throw error;
    }
    
    return data?.length || 0;
}

export async function getPaginatedData<T>(
    query: PostgrestFilterBuilder<any, any, T[], any, unknown>,
    page: number,
    rowsPerPage: number
): Promise<{ data: T[], totalPages: number }> {
    // Get total count
    const totalCount = await getCount(query);
    const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

    // Calculate pagination range
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage - 1;

    // Fetch paginated data
    const { data, error } = await query
        .range(start, end)
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return {
        data: data || [],
        totalPages
    };
} 