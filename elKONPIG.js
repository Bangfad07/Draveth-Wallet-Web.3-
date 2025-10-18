// Draveth Wallet - Configuration File
// File ini berisi konfigurasi untuk API dan environment variables

const CONFIG = {
  // Replicate API Configuration
  REPLICATE: {
    // API Token akan diambil dari localStorage atau environment variable
    API_TOKEN:
      (typeof process !== "undefined" && process.env?.REPLICATE_API_TOKEN) ||
      localStorage.getItem("replicate_api_token") ||
      "",
    // Model yang digunakan untuk AI Assistant
    AI_MODEL: "meta/llama-2-7b-chat", // Fallback model jika IBM Granite tidak tersedia
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7,
    TOP_P: 0.9,
  },

  // IBM Granite Configuration (jika tersedia)
  GRANITE: {
    MODEL_ID: "ibm/granite-3.0-8b-instruct",
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7,
  },

  // Help System Configuration
  HELP_SYSTEM: {
    ENABLE_AI_CHAT: true,
    FALLBACK_RESPONSES: true,
    MAX_CHAT_HISTORY: 10,
    API_TIMEOUT: 30000, // 30 detik
  },

  // Security Configuration
  SECURITY: {
    // Dalam produksi, gunakan environment variables
    ENCRYPT_API_KEYS: true, // Set true untuk enkripsi API keys
    USE_IBM_GRANITE_CREDENTIALS: true, // Set true untuk menggunakan IBM Granite credential management
  },
};

// Export untuk penggunaan global
if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}

// Export untuk Node.js (jika diperlukan)
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
