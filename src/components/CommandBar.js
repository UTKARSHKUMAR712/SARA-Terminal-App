import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const KEY_JS = (key, code, mods = {}) => {
  const flags = [];
  if (mods.ctrl) flags.push('ctrlKey:true');
  if (mods.alt) flags.push('altKey:true');
  if (mods.shift) flags.push('shiftKey:true');
  const extra = flags.length ? ', ' + flags.join(',') : '';
  return `document.querySelector('.xterm-helper-textarea')?.dispatchEvent(new KeyboardEvent('keydown',{key:'${key}',keyCode:${code},which:${code}${extra},bubbles:true}));void 0;`;
};

const KEYS_ROW1 = [
  { label: 'ESC',  js: KEY_JS('Escape', 27) },
  { label: '/',    js: KEY_JS('/', 191) },
  { label: '-',    js: KEY_JS('-', 189) },
  { label: 'ALT',  isMod: true },
  { label: '↑',    code: 38, key: 'ArrowUp' },
  { label: 'END',  js: KEY_JS('End', 35) },
  { label: 'PGUP', js: KEY_JS('PageUp', 33) },
];

const KEYS_ROW2_BASE = [
  { label: '⇥ TAB', js: KEY_JS('Tab', 9) },
  { label: '⇧ SHIFT', isMod: true },
  { label: 'CTRL', isMod: true },
  { label: '←', code: 37, key: 'ArrowLeft' },
  { label: '↓', code: 40, key: 'ArrowDown' },
  { label: '→', code: 39, key: 'ArrowRight' },
  { label: 'PGDN', js: KEY_JS('PageDown', 34) },
];

export default function CommandBar({ webViewRef }) {
  const [ctrlMode, setCtrlMode] = useState(false);
  const [altMode, setAltMode] = useState(false);
  const [shiftMode, setShiftMode] = useState(false);
  const ctrlInputRef = useRef(null);

  const inject = useCallback((js) => {
    webViewRef?.current?.injectJavaScript(js);
  }, [webViewRef]);

  const handleKeyWithMods = (item) => {
    if (item.js) {
      inject(item.js);
    } else {
      inject(KEY_JS(item.key, item.code, { ctrl: ctrlMode, alt: altMode, shift: shiftMode }));
    }
    if (ctrlMode) setCtrlMode(false);
    if (altMode) setAltMode(false);
    if (shiftMode) setShiftMode(false);
  };

  const handleCtrlTextChange = (text) => {
    if (text.length > 0) {
      const char = text[text.length - 1];
      const code = char.toUpperCase().charCodeAt(0);
      inject(KEY_JS(char.toLowerCase(), code, { ctrl: true }));
      setCtrlMode(false);
    }
  };

  useEffect(() => {
    if (ctrlMode && ctrlInputRef.current) {
      setTimeout(() => ctrlInputRef.current?.focus(), 100);
    }
  }, [ctrlMode]);

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 4) }]}>
      {ctrlMode && (
        <View style={styles.ctrlInputRow}>
          <Text style={styles.ctrlInputLabel}>^ Type a key...</Text>
          <TextInput
            ref={ctrlInputRef}
            style={styles.ctrlInput}
            autoFocus
            maxLength={1}
            onChangeText={handleCtrlTextChange}
            onBlur={() => setCtrlMode(false)}
          />
        </View>
      )}

      <View style={styles.row}>
        {KEYS_ROW1.map((k) => {
          if (k.isMod) {
            return (
              <TouchableOpacity
                key={k.label}
                style={[styles.key, (k.label === 'ALT' && altMode && styles.keyActive)]}
                onPress={() => {
                  if (k.label === 'ALT') setAltMode(!altMode);
                }}
              >
                <Text style={[styles.keyText, (k.label === 'ALT' && altMode && styles.keyTextActive)]}>{k.label}</Text>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={k.label}
              style={[styles.key, shiftMode && k.key && styles.keyActive]}
              onPress={() => handleKeyWithMods(k)}
            >
              <Text style={[styles.keyText, shiftMode && k.key && styles.keyTextActive]}>{k.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.row}>
        {KEYS_ROW2_BASE.map((k) => {
          if (k.isMod) {
            return (
              <TouchableOpacity
                key={k.label}
                style={[styles.key, 
                  (k.label === '⇧ SHIFT' && shiftMode && styles.keyActive) ||
                  (k.label === 'CTRL' && ctrlMode && styles.keyActive)
                ]}
                onPress={() => {
                  if (k.label === '⇧ SHIFT') setShiftMode(!shiftMode);
                  if (k.label === 'CTRL') {
                    setCtrlMode(!ctrlMode);
                    if (!ctrlMode) {
                      setTimeout(() => ctrlInputRef.current?.focus(), 200);
                    }
                  }
                }}
              >
                <Text style={[styles.keyText, 
                  (k.label === '⇧ SHIFT' && shiftMode && styles.keyTextActive) ||
                  (k.label === 'CTRL' && ctrlMode && styles.keyTextActive)
                ]}>{k.label}</Text>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={k.label}
              style={[styles.key, shiftMode && k.key && styles.keyActive]}
              onPress={() => handleKeyWithMods(k)}
            >
              <Text style={[styles.keyText, shiftMode && k.key && styles.keyTextActive]}>{k.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161b22',
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 4,
  },
  ctrlInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
    backgroundColor: '#0d1117',
  },
  ctrlInputLabel: {
    color: '#58a6ff',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  ctrlInput: {
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#58a6ff',
    borderRadius: 6,
    color: '#ffffff',
    fontSize: 16,
    width: 50,
    height: 36,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  key: {
    backgroundColor: '#21262d',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
    minWidth: 34,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  keyActive: {
    backgroundColor: '#1f6feb',
    borderColor: '#58a6ff',
  },
  keyText: {
    color: '#c9d1d9',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  keyTextActive: {
    color: '#ffffff',
  },
});
