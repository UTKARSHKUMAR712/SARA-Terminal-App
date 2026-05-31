import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { buildInjectionScript, INTERCEPT_SCRIPT } from '../theme/telegram_theme';
import FloatingMenu from '../components/FloatingMenu';

const TELEGRAM_URL = 'https://web.telegram.org/k/#@sara712_bot';

export default function TelegramScreen() {
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);
  const navigation = useNavigation();

  const handleNavStateChange = useCallback((request) => {
    const url = request.url || '';
    if (url.includes('/t/') && url.includes('trycloudflare.com')) {
      navigation.navigate('Terminal', { url });
      return false;
    }
    return true;
  }, [navigation]);

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'terminal' && data.url) {
        navigation.navigate('Terminal', { url: data.url });
      }
    } catch (e) {}
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [])
  );

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: TELEGRAM_URL }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        cacheEnabled
        startInLoadingState
        injectedJavaScript={buildInjectionScript() + '\n' + INTERCEPT_SCRIPT}
        onShouldStartLoadWithRequest={handleNavStateChange}
        onMessage={handleMessage}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        originWhitelist={['*']}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#58a6ff" />
          <Text style={styles.loadingText}>Loading SARA...</Text>
        </View>
      )}

      <FloatingMenu
        currentScreen="telegram"
        onNavigate={(screen) => navigation.navigate(screen === 'settings' ? 'Terminal' : screen)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0d1117',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 12,
  },
});
