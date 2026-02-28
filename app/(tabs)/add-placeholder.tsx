// This file exists only so expo-router registers the tab.
// The actual "Add Task" flow opens /add as a modal, triggered by the
// custom AddTabButton in _layout.tsx — this screen is never shown.
import { View } from 'react-native';
export default function AddPlaceholder() { return <View />; }