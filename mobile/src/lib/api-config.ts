import { Platform } from 'react-native';

// On Android emulators, the host machine's localhost is accessible via 10.0.2.2
// For iOS simulators and web, it's localhost.
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export { API_BASE_URL };
