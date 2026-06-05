import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import FloatingMenu from '../components/FloatingMenu';
import { setFileBrowserUrl, getFileBrowserUrl } from '../shared/fileBrowserStore';

export default function FileBrowserScreen({ route }) {
  const webViewRef = useRef(null);
  const navigation = useNavigation();
  const url = route?.params?.url || '';

  useEffect(() => {
    if (url) setFileBrowserUrl(url);
  }, [url]);

  useEffect(() => {
    const onBackPress = () => {
      if (webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        cacheEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        originWhitelist={['*']}
      />
      <FloatingMenu
        currentScreen="files"
        onNavigate={(screen) => {
          if (screen === 'FileBrowser') { navigation.navigate('FileBrowser', { url: getFileBrowserUrl() }); }
          else { navigation.navigate(screen === 'settings' ? 'Terminal' : screen); }
        }}
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
});
