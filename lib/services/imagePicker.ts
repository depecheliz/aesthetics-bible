import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Real photo-library picker + compression for AI Preview's source photo.
 * No mock/stub here — this runs for real wherever it's called, independent
 * of whether generation itself is live (see previewProviderStatus.ts).
 */

export type PickedPhoto = {
  uri: string;
  width: number;
  height: number;
};

// Downscaling to this max dimension keeps upload size and provider cost
// predictable without visibly degrading a portrait photo.
const MAX_DIMENSION = 1440;
const JPEG_QUALITY = 0.8;

export type PickPhotoResult =
  | { status: 'picked'; photo: PickedPhoto }
  | { status: 'cancelled' }
  | { status: 'permission_denied' };

export async function pickAndCompressPhoto(): Promise<PickPhotoResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { status: 'permission_denied' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 1,
  });

  if (result.canceled || !result.assets?.[0]) {
    return { status: 'cancelled' };
  }

  const asset = result.assets[0];
  const longestSide = Math.max(asset.width, asset.height);
  const scale = longestSide > MAX_DIMENSION ? MAX_DIMENSION / longestSide : 1;

  const manipulated = await ImageManipulator.manipulateAsync(
    asset.uri,
    scale < 1 ? [{ resize: { width: Math.round(asset.width * scale), height: Math.round(asset.height * scale) } }] : [],
    { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
  );

  return {
    status: 'picked',
    photo: { uri: manipulated.uri, width: manipulated.width, height: manipulated.height },
  };
}
