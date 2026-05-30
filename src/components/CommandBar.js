import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const KEY_JS = (key, code, ctrl = false) => {
  const c = ctrl ? ', ctrlKey: true' : '';
  return `document.querySelector('.xterm-helper-textarea')?.dispatchEvent(new KeyboardEvent('keydown',{key:'${key}',keyCode:${code},which:${code}${c},bubbles:true}));void 0;`;
};

const KEYS_ROW1 = [
  { label: 'ESC',  js: KEY_JS('Escape', 27) },
  { label: '/',    js: KEY_JS('/', 191) },
  { label: '-',    js: KEY_JS('-', 189) },
  { label: 'HOME', js: KEY_JS('Home', 36) },
  { label: '↑',    js: KEY_JS('ArrowUp', 38) },
  { label: 'END',  js: KEY_JS('End', 35) },
  { label: 'PGUP', js: KEY_JS('PageUp', 33) },
];

const KEYS_ROW2_BASE = [
  { label: '←', js: KEY_JS('ArrowLeft', 37) },
  { label: '↓', js: KEY_JS('ArrowDown', 40) },
  { label: '→', js: KEY_JS('ArrowRight', 39) },
  { label: 'PGDN', js: KEY_JS('PageDown', 34) },
];

const CTRL_COMBOS = [
  { label: 'C', key: 'c', code: 67 },
  { label: 'D', key: 'd', code: 68 },
  { label: 'Z', key: 'z', code: 90 },
  { label: 'L', key: 'l', code: 76 },
  { label: 'A', key: 'a', code: 65 },
];

export default function CommandBar({ webViewRef }) {
  const [ctrlMode, setCtrlMode] = useState(false);
  const [altMode, setAltMode] = useState(false);
  const [showCtrlCombos, setShowCtrlCombos] = useState(false);

  const inject = useCallback((js) => {
    webViewRef?.current?.injectJavaScript(js);
  }, [webViewRef]);

  const handleCtrlCombo = (combo) => {
    inject(KEY_JS(combo.key, combo.code, true));
    setCtrlMode(false);
    setShowCtrlCombos(false);
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 4) }]}>
      {showCtrlCombos && (
        <View style={styles.ctrlComboRow}>
          {CTRL_COMBOS.map((c) => (
            <TouchableOpacity
              key={c.label}
              style={[styles.ctrlKey]}
              onPress={() => handleCtrlCombo(c)}
            >
              <Text style={styles.ctrlKeyText}>^ {c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.row}>
        {KEYS_ROW1.map((k) => (
          <TouchableOpacity
            key={k.label}
            style={styles.key}
            onPress={() => inject(k.js)}
          >
            <Text style={styles.keyText}>{k.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.key}
          onPress={() => {
            inject(KEY_JS('Tab', 9));
          }}
        >
          <Text style={styles.keyText}>⇥ TAB</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.key, ctrlMode && styles.keyActive]}
          onPress={() => {
            setCtrlMode(!ctrlMode);
            setShowCtrlCombos(!showCtrlCombos);
          }}
        >
          <Text style={[styles.keyText, ctrlMode && styles.keyTextActive]}>CTRL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.key, altMode && styles.keyActive]}
          onPress={() => setAltMode(!altMode)}
        >
          <Text style={[styles.keyText, altMode && styles.keyTextActive]}>ALT</Text>
        </TouchableOpacity>

        {KEYS_ROW2_BASE.map((k) => (
          <TouchableOpacity
            key={k.label}
            style={styles.key}
            onPress={() => inject(k.js)}
          >
            <Text style={styles.keyText}>{k.label}</Text>
          </TouchableOpacity>
        ))}
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
  ctrlComboRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
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
  ctrlKey: {
    backgroundColor: '#1f6feb',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#58a6ff',
  },
  ctrlKeyText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
});
