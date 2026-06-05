import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  Modal,
  FlatList,
  Switch,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import CommandBar from '../components/CommandBar';

const FONT_SIZES = Array.from({ length: 20 }, (_, i) => i + 5);
const THEMES_LIST = [
  { id: 'classic', label: 'Classic' },
  { id: 'vscode', label: 'VS Code Dark' },
  { id: 'dracula', label: 'Dracula' },
  { id: 'windows', label: 'Windows Terminal' },
  { id: 'hacker', label: 'Hacker' },
];
const BG_OPACITIES = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export default function TerminalScreen() {
  const [url, setUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const webViewRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [fontSize, setFontSize] = useState(13);
  const [showSettings, setShowSettings] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [desktopMode, setDesktopMode] = useState(false);
  const [theme, setTheme] = useState('classic');
  const [backgroundEnabled, setBackgroundEnabled] = useState(false);
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [bgOpacity, setBgOpacity] = useState(0.3);


  const STORAGE_KEY = '@sara_settings';

  // Load saved settings on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          if (s.fontSize) setFontSize(s.fontSize);
          if (s.theme) setTheme(s.theme);
          if (s.desktopMode !== undefined) setDesktopMode(s.desktopMode);
          if (s.backgroundEnabled !== undefined) setBackgroundEnabled(s.backgroundEnabled);
          if (s.bgImageUrl) setBgImageUrl(s.bgImageUrl);
          if (s.bgOpacity) setBgOpacity(s.bgOpacity);

        }
      } catch (e) {}
    })();
  }, []);

  // Save settings on any change
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
          fontSize, theme, desktopMode, backgroundEnabled, bgImageUrl, bgOpacity,
        }));
      } catch (e) {}
    })();
  }, [fontSize, theme, desktopMode, backgroundEnabled, bgImageUrl, bgOpacity]);

  const injectFontSize = useCallback(() => {
    const js = `
      (function() {
        var fs=${fontSize};
        var setSize = function() {
          if (window.term) { window.term.options.fontSize = fs; window.term.fit?.(); }
          else if (window.terminal) { window.terminal.options.fontSize = fs; window.terminal.fit?.(); }
          var e=document.getElementById('sara-fs-style');
          if(!e){e=document.createElement('style');e.id='sara-fs-style';document.head.appendChild(e);}
          e.innerHTML='.xterm-rows{font-size:'+fs+'px!important;line-height:1.15!important}.xterm{font-size:'+fs+'px!important}.terminal{font-size:'+fs+'px!important;line-height:1.15!important}';
          window.dispatchEvent(new Event('resize'));
        };
        setSize();setTimeout(setSize,500);setTimeout(setSize,1000);setTimeout(setSize,2000);
      })();
    `;
    webViewRef.current?.injectJavaScript(js);
  }, [fontSize]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleConnect = useCallback(() => {
    let u = urlInput.trim();
    if (!u) {
      Alert.alert('Error', 'Paste a terminal link from Telegram');
      return;
    }
    if (!u.startsWith('http')) {
      Alert.alert('Error', 'Invalid URL');
      return;
    }
    const sep = u.includes('?') ? '&' : '?';
    let params = 'fontSize=' + fontSize + '&desktop=' + (desktopMode ? '1' : '0');
    params += '&theme=' + theme;
    params += '&bgEnabled=' + (backgroundEnabled ? '1' : '0');
    if (backgroundEnabled) {
      params += '&bgOpacity=' + bgOpacity;
      if (bgImageUrl.trim()) {
        params += '&bgImage=' + encodeURIComponent(bgImageUrl.trim());
      }
    }
    setUrl(u + sep + params);
    setConnected(true);
    setLoading(true);
  }, [urlInput, fontSize, desktopMode, theme, backgroundEnabled, bgImageUrl, bgOpacity]);

  const handleDisconnect = useCallback(() => {
    setConnected(false);
    setUrl('');
    setLoading(false);
  }, []);

  if (!connected) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.settingsToggle}
            onPress={() => setShowSettings(!showSettings)}
          >
            <Ionicons
              name={showSettings ? 'close-circle-outline' : 'settings-outline'}
              size={24}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.inputScreen, showSettings && styles.inputScreenSettings]}>
          {showSettings ? (
            <ScrollView style={styles.settingsScroll} contentContainerStyle={styles.settingsScrollContent} keyboardShouldPersistTaps="handled">
              <View style={styles.settingsCard}>
                <Text style={styles.settingsTitle}>Settings</Text>

                <Text style={styles.settingsLabel}>Theme</Text>
                <TouchableOpacity
                  style={styles.fontPickerBtn}
                  onPress={() => setShowThemePicker(true)}
                >
                  <Text style={styles.fontPickerText}>
                    {THEMES_LIST.find((t) => t.id === theme)?.label || 'VS Code Dark'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#ffffff" />
                </TouchableOpacity>

                <Text style={styles.settingsLabel}>Font Size</Text>
                <TouchableOpacity
                  style={styles.fontPickerBtn}
                  onPress={() => setShowFontPicker(true)}
                >
                  <Text style={styles.fontPickerText}>{fontSize}px</Text>
                  <Ionicons name="chevron-down" size={18} color="#ffffff" />
                </TouchableOpacity>

                <View style={styles.settingRow}>
                  <Text style={styles.settingsLabel}>Desktop Mode</Text>
                  <Switch
                    value={desktopMode}
                    onValueChange={setDesktopMode}
                    trackColor={{ false: '#30363d', true: '#1f6feb' }}
                    thumbColor={desktopMode ? '#58a6ff' : '#8b949e'}
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingsLabel}>Background Image</Text>
                  <Switch
                    value={backgroundEnabled}
                    onValueChange={setBackgroundEnabled}
                    trackColor={{ false: '#30363d', true: '#1f6feb' }}
                    thumbColor={backgroundEnabled ? '#58a6ff' : '#8b949e'}
                  />
                </View>

                {backgroundEnabled && (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="https://example.com/image.jpg"
                      placeholderTextColor="#484f58"
                      value={bgImageUrl}
                      onChangeText={setBgImageUrl}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                    />

                    <Text style={[styles.settingsLabel, { marginTop: 12 }]}>Opacity</Text>
                    <View style={styles.opacityOptions}>
                      {BG_OPACITIES.map((o) => (
                        <TouchableOpacity
                          key={o}
                          style={[
                            styles.opacityBtn,
                            bgOpacity === o && styles.fontSizeBtnActive,
                          ]}
                          onPress={() => setBgOpacity(o)}
                        >
                          <Text
                            style={[
                              styles.opacityBtnText,
                              bgOpacity === o && styles.fontSizeTextActive,
                            ]}
                          >{Math.round(o * 100)}%</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={() => setShowSettings(false)}
                >
                  <Text style={styles.saveBtnText}>Done</Text>
                </TouchableOpacity>
              </View>

              <Modal
                visible={showFontPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowFontPicker(false)}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowFontPicker(false)}
                >
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Font Size</Text>
                    <FlatList
                      data={FONT_SIZES}
                      keyExtractor={(item) => String(item)}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.modalItem,
                            fontSize === item && styles.modalItemActive,
                          ]}
                          onPress={() => {
                            setFontSize(item);
                            setShowFontPicker(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.modalItemText,
                              fontSize === item && styles.modalItemTextActive,
                            ]}
                          >{item}px</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>

              <Modal
                visible={showThemePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowThemePicker(false)}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowThemePicker(false)}
                >
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Theme</Text>
                    <FlatList
                      data={THEMES_LIST}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.modalItem,
                            theme === item.id && styles.modalItemActive,
                          ]}
                          onPress={() => {
                            setTheme(item.id);
                            setShowThemePicker(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.modalItemText,
                              theme === item.id && styles.modalItemTextActive,
                            ]}
                          >{item.label}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            </ScrollView>
          ) : (
            <>
              <View style={styles.logoContainer}>
                <Ionicons name="terminal" size={64} color="#388bfd" />
                <Text style={styles.title}>SARA Terminal</Text>
                <Text style={styles.subtitle}>Mobile Terminal Client</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Paste terminal link from Telegram:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://xxx.trycloudflare.com/t/..."
                  placeholderTextColor="#ffffff"
                  value={urlInput}
                  onChangeText={setUrlInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  selectTextOnFocus
                />
                <TouchableOpacity style={styles.connectBtn} onPress={handleConnect}>
                  <Ionicons name="link" size={20} color="#ffffff" />
                  <Text style={styles.connectBtnText}>Connect</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.hint}>
                1. Send /terminal to SARA bot{'\n'}
                2. Copy the link from Telegram{'\n'}
                3. Paste it above and tap Connect
              </Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: keyboardHeight }]}>
      <View style={styles.webviewContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#58a6ff" />
            <Text style={styles.loadingText}>Connecting...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          userAgent={desktopMode ? DESKTOP_UA : undefined}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => {
            setLoading(false);
            injectFontSize();
          }}
          onError={() => setLoading(false)}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
        <TouchableOpacity
          onPress={handleDisconnect}
          style={styles.floatingCloseBtn}
          activeOpacity={0.6}
        >
          <Ionicons name="close-circle" size={18} color="#f85149" />
        </TouchableOpacity>
      </View>

      <CommandBar webViewRef={webViewRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  inputScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  inputScreenSettings: {
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '600',
    marginTop: 12,
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 4,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 14,
    padding: 14,
    fontFamily: 'monospace',
  },
  connectBtn: {
    backgroundColor: '#238636',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  connectBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 18,
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
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
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  settingsToggle: {
    padding: 8,
  },
  settingsCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  settingsTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  settingsLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  fontPickerBtn: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  fontPickerText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  settingRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  settingsScroll: {
    width: '100%',
    flex: 1,
  },
  settingsScrollContent: {
    alignItems: 'center',
  },
  opacityOptions: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 24,
    justifyContent: 'center',
  },
  opacityBtn: {
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 38,
  },
  opacityBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  fontSizeBtnActive: {
    backgroundColor: '#1f6feb',
    borderColor: '#58a6ff',
  },
  fontSizeTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#238636',
    borderRadius: 8,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalItemActive: {
    backgroundColor: '#1f6feb',
  },
  modalItemText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  modalItemTextActive: {
    fontWeight: '700',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 12,
  },
  floatingCloseBtn: {
    position: 'absolute',
    top: 4,
    left: 8,
    zIndex: 999,
    padding: 4,
    backgroundColor: '#0d1117dd',
    borderRadius: 12,
  },
});
