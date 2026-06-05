import React, { useState } from 'react';
import { TouchableOpacity, Modal, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FloatingMenu({ currentScreen, onNavigate }) {
  const [showMenu, setShowMenu] = useState(false);
  const insets = useSafeAreaInsets();

  const iconName = currentScreen === 'telegram' ? 'terminal' : 'paper-plane';
  const nextLabel = currentScreen === 'telegram' ? 'Terminal' : 'Telegram';

  return (
    <>
      <TouchableOpacity
        style={[styles.fab, { top: insets.top + -32 }]}
        activeOpacity={0.7}
        onPress={() => setShowMenu(true)}
      >
        <Ionicons name={iconName} size={18} color="#58a6ff" />
      </TouchableOpacity>

      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={[styles.menuCard, { top: insets.top + 48 }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setShowMenu(false); onNavigate('Telegram'); }}
            >
              <Ionicons name="paper-plane" size={18} color="#58a6ff" />
              <Text style={styles.menuLabel}>Telegram</Text>
              {currentScreen === 'telegram' && <Ionicons name="checkmark" size={14} color="#238636" />}
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setShowMenu(false); onNavigate('Terminal'); }}
            >
              <Ionicons name="terminal" size={18} color="#58a6ff" />
              <Text style={styles.menuLabel}>Terminal</Text>
              {currentScreen === 'terminal' && <Ionicons name="checkmark" size={14} color="#238636" />}
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setShowMenu(false); onNavigate('Terminal'); }}
            >
              <Ionicons name="settings-outline" size={18} color="#58a6ff" />
              <Text style={styles.menuLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 92,
    width: 60,
    height: 24,
    borderRadius: 17,
    backgroundColor: 'rgba(88, 166, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(88, 166, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    // zIndex: 50,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuCard: {
    position: 'absolute',
    right: 10,
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    gap: 10,
  },
  menuLabel: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#30363d',
    marginHorizontal: 12,
  },
});
