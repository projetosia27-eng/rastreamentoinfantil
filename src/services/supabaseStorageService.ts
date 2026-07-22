import { supabase } from './supabaseClient';

export const supabaseStorageService = {
  /**
   * Uploads a file to a specific Supabase storage bucket
   * @param bucketName The bucket where the file should be saved (defaults to 'guardian-kids')
   * @param filePath The file path destination inside the bucket (e.g. 'avatars/lucas.png')
   * @param file The file object (Blob, File, or ArrayBuffer)
   */
  uploadFile: async (bucketName: string, filePath: string, file: File | Blob): Promise<{ path: string; publicUrl: string }> => {
    if (!supabase) throw new Error('Supabase client is not initialized. Please configure credentials first.');

    // Upload the file
    const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      // If error is about bucket not existing, we throw a descriptive error with a hint on how to fix it in Supabase dashboard
      if (error.message.includes('Bucket not found')) {
        throw new Error(`Bucket "${bucketName}" not found. Please create a public storage bucket named "${bucketName}" in your Supabase console under Storage, or check policies.`);
      }
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  },

  /**
   * Retrieves the public URL of an existing file
   */
  getPublicUrl: (bucketName: string, filePath: string): string => {
    if (!supabase) return '';
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Delete a file from storage
   */
  deleteFile: async (bucketName: string, filePath: string): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.storage.from(bucketName).remove([filePath]);
    if (error) throw error;
  },

  /**
   * List files within a bucket folder path
   */
  listFiles: async (bucketName: string, folderPath: string = '') => {
    if (!supabase) return [];
    const { data, error } = await supabase.storage.from(bucketName).list(folderPath, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw error;
    return data || [];
  }
};
