# Project title
Draveth Wallet 

# Description
Draveth Wallet adalah aplikasi wallet cryptocurrency multi-chain berbasis web dengan desain gothic cyberpunk yang elegan. Aplikasi ini memungkinkan pengguna untuk mengelola aset digital mereka di berbagai blockchain termasuk Solana, Binance Smart Chain (BSC), Ethereum, dan Base. Dilengkapi dengan sistem autentikasi yang aman, interface yang intuitif, dan AI Assistant berbasis IBM Granite untuk membantu pengguna dalam navigasi dan pemahaman fitur-fitur wallet.

# Technologies used
1. Frontend:
  - HTML5 - Struktur aplikasi web
  - CSS3 - Styling dengan tema gothic cyberpunk
    + CSS Grid & Flexbox untuk layout responsif
    + Custom animations dan transitions
    + Glassmorphism effects
  - Vanilla JavaScript (ES6+) - Logic aplikasi tanpa framework
    + Modular class-based architecture
    + Async/await untuk operasi asynchronous
    + Event delegation untuk performance optimal

2. Fonts & Icons
  - Google Fonts:
    + UnifrakturMaguntia (Gothic typography untuk branding)
    + Orbitron (Modern sci-fi font untuk konten)

3. External APIs
  - Replicate API - Platform untuk menjalankan AI models
  - IBM Granite 3.0 - AI model untuk assistant (via Replicate)
  - Meta Llama 2 - Fallback AI model

4. Storage
  - LocalStorage - Menyimpan data user dan konfigurasi
  - SessionStorage - Manajemen session autentikasi

5. Security
  - Client-side Password Hashing - Hash password menggunakan simple hash algorithm
  - Session Management - Token-based authentication dengan expiry
  - Seed Phrase Generation - Random word generation untuk wallet recovery

# Features
1. Authentication System
  ✅ User registration dengan username dan password
  ✅ Secure login dengan session management
  ✅ Password hashing untuk keamanan
  ✅ Session expiry (24 jam)
  ✅ Auto-redirect untuk protected routes
  ✅ Logout functionality

2. Wallet Creation & Import
  ✅ Create new wallet dengan seed phrase (12 kata)
  ✅ Seed phrase refresh untuk keamanan
  ✅ Import wallet via seed phrase (12 kata)
  ✅ Import wallet via private key dengan network selection
  ✅ Hardware wallet connection preparation (Ledger)
  ✅ Username availability checker
  ✅ Terms of service agreement

3. Multi-Chain Support
  ✅ Solana - Cepat, biaya rendah
  ✅ Ethereum - Ekosistem luas
  ✅ Binance Smart Chain (BSC) - EVM-compatible
  ✅ Base - Layer 2 solution
  ✅ SUI - High-performance blockchain

4. Dashboard Features
  ✅ Balance display (native token & USD value)
  ✅ Asset management (token list dengan icon)
  ✅ Quick actions: Send, Receive, Buy, Swap
  ✅ User profile dengan username display
  ✅ Responsive grid layout

5. Security Features
  ✅ Password visibility toggle
  ✅ Seed phrase confirmation requirement
  ✅ Multiple modal validations
  ✅ Safe password creation flow
  ✅ Network-specific private key import

6. AI Assistant 🤖
  ✅ Real-time chat interface
  ✅ Context-aware responses tentang Draveth Wallet
  ✅ Fallback responses untuk offline mode
  ✅ Pertanyaan umum tentang:
      + Cara membuat wallet
      + Import wallet
      + Keamanan dan best practices
      + Perbedaan blockchain networks
      + Fitur-fitur wallet
  ✅ Loading states dan error handling
  ✅ Chat history dengan timestamps

7. Help System
  ✅ Comprehensive help modal
  ✅ Step-by-step guides untuk:
      + Membuat akun baru
      + Mengimpor wallet
      + Tips keamanan
      + Perbedaan antar blockchain
  ✅ AI-powered Q&A
  ✅ Network information cards

8. User Experience
  ✅ Loading overlays untuk transisi smooth
  ✅ Modal-based workflows
  ✅ Dynamic routing system dengan browser history
  ✅ Responsive design (mobile-friendly)
  ✅ Keyboard navigation (Enter key support)
  ✅ Accessibility features (ARIA labels)
  ✅ Custom scrollbar styling

9. Visual Design
  ✅ Gothic cyberpunk aesthetic
  ✅ Gold (#CC9901) dan maroon (#800000) color scheme
  ✅ Noise textures dan grid backgrounds
  ✅ Gradient effects
  ✅ Smooth animations (fade, slide, pop-in)
  ✅ Box shadows dengan glow effects
  ✅ Custom button states (hover, active, disabled)

# Setup instructions
  Prerequisites  
    ✨Web browser modern (Chrome, Firefox, Safari, Edge)
    ✨Text editor atau IDE (VS Code, Sublime Text, dll.)
    ✨Web server lokal (Live Server extension, Python SimpleHTTPServer, atau XAMPP)
  Installation:
    - Clone atau Download Project  
    - Atur Struktur File
    - Konfigurasi API (Opsional untuk AI Features) Buka config.js dan tambahkan Replicate API token
         const CONFIG = {
                 REPLICATE: {
                               API_TOKEN: "your_replicate_api_token_here",
                               // ... rest of config
                            }
                         };
      Atau tambahkan via localStorage di browser console
          localStorage.setItem("replicate_api_token", "your_token_here");
    - Cara mendapatkan API token:
        + Daftar di Replicate.com
        + Buka Settings → API Tokens
        + Generate new token dan copy
    - Jalankan Aplikasi Opsi 1: VS Code Live Server
        + Install extension "Live Server"
        + Right-click pada index.html
        + Pilih "Open with Live Server"
        + Browser akan otomatis terbuka di http://localhost:5500

Opsi 2: Python Simple Server (bash)  
    #Python 3
    python -m http.server 8000
    #Python 2
    python -m SimpleHTTPServer 8000
    #Buka browser: http://localhost:8000

Privacy & Security:
🔒 No Data Collection: Percakapan AI tidak disimpan di server
🔒 API Token Encryption: Token disimpan secure di localStorage atau environment variables
🔒 Client-Side Processing: Semua logic berjalan di browser user
🔒 Timeout Protection: Auto-timeout setelah 30 detik untuk mencegah hanging

# AI support explanation
🤖 Context-Aware: Memahami konteks Draveth Wallet dan blockchain
🤖 Intelligent Fallback: Tetap berfungsi tanpa internet
🤖 Real-time Chat: Interface chat dengan timestamps
🤖 Security: No data collection, client-side processing
