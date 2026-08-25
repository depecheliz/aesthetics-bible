/**
 * Private photo storage interface. Backed by Supabase Storage in a later
 * phase. Photos are high-sensitivity: private by default, authenticated
 * access, signed URLs, explicit delete, account-deletion cascade. No
 * public bucket assumptions belong anywhere behind this interface.
 */

export interface PrivatePhotoStorage {
  uploadPhoto(userId: string, fileUri: string): Promise<string>;
  getSignedUrl(photoId: string): Promise<string>;
  deletePhoto(photoId: string): Promise<void>;
  deleteAllPhotosForUser(userId: string): Promise<void>;
}
