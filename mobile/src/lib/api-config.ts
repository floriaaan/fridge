
// On Android emulators, the host machine's localhost is accessible via 10.0.2.2
// For iOS simulators and web, it's localhost.
const BASE_URL = "http://10.200.162.11:3000"
const API_BASE_URL = `${BASE_URL}/api`
// const API_BASE_URL = "http://192.168.1.136:3000/api"

export { BASE_URL, API_BASE_URL };
