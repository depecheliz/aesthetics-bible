import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { Button } from '../ui/Button';
import { ThemedText } from '../typography/ThemedText';
import { getPreviewImageUrls, type SavedPreview } from '../../lib/services/previewGeneration';

export function PreviewResult({ preview }: { preview: SavedPreview }) {
  const [urls, setUrls] = useState<{ before: string; after: string } | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    getPreviewImageUrls(preview)
      .then((result) => {
        if (active) {
          setUrls(result);
          setError('');
        }
      })
      .catch(() => {
        if (active) setError('The images could not load. Refresh to try again.');
      });
    const timer = setInterval(() => setRefresh((value) => value + 1), 8 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [preview, refresh]);
  const imageError = useCallback(
    () => setError('An image could not load or its link expired. Refresh to try again.'),
    [],
  );
  return (
    <View>
      <ThemedText variant="eyebrow">AI VISUALIZATION</ThemedText>
      {error ? (
        <ThemedText accessibilityRole="alert">{error}</ThemedText>
      ) : urls ? (
        <BeforeAfterSlider
          key={urls.after}
          beforeImage={{ uri: urls.before }}
          afterImage={{ uri: urls.after }}
          afterLabel="PREVIEW"
          onImageError={imageError}
        />
      ) : (
        <ActivityIndicator accessibilityLabel="Loading preview images" />
      )}
      <Button
        label="Refresh images"
        variant="ghost"
        onPress={() => {
          setError('');
          setUrls(null);
          setRefresh((value) => value + 1);
        }}
      />
      <ThemedText variant="caption">
        Saved privately. An illustrative possibility, not a predicted treatment outcome.
      </ThemedText>
    </View>
  );
}
