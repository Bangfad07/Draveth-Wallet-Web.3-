// Draveth Wallet - Help System dengan IBM Granite Integration
// Menggunakan Replicate API untuk mengakses IBM Granite model

class HelpSystem {
  constructor() {
    // Konfigurasi API - dalam produksi, gunakan environment variables
    this.config = {
      replicateApiToken:
        window.CONFIG?.REPLICATE?.API_TOKEN ||
        localStorage.getItem("replicate_api_token") ||
        "",
      // Fallback ke model yang tersedia jika IBM Granite tidak ada
      graniteModel: "meta/llama-2-7b-chat",
      maxTokens: 1000,
      temperature: 0.7,
    };

    this.isLoading = false;
    this.init();
  }

  init() {
    this.createHelpModal();
    this.bindEvents();
  }

  // Membuat modal help dengan informasi lengkap
  createHelpModal() {
    const modalHTML = `
      <div id="help-modal" class="modal" aria-hidden="true" role="dialog" aria-labelledby="help-title">
        <div class="modal__backdrop" data-action="close-help"></div>
        <div class="modal__dialog help-modal__dialog">
          <header class="modal__header">
            <h3 id="help-title" class="modal__title">BANTUAN DRAVETH WALLET</h3>
            <button class="modal__close" data-action="close-help" aria-label="Tutup">
              ✕
            </button>
          </header>
          <div class="modal__body help-modal__body">
            <div class="help-content">
              <div class="help-section help-section--ai">
                <h4 class="help-section__title">🤖 Tanya AI Assistant</h4>
                <p class="help-section__text">
                  Punya pertanyaan spesifik? Tanyakan langsung ke AI Assistant yang didukung IBM Granite!
                </p>
                <div class="ai-chat">
                  <div class="ai-messages" id="ai-messages"></div>
                  <div class="ai-input-group">
                    <input type="text" id="ai-question" class="ai-input" placeholder="Tanyakan sesuatu tentang Draveth Wallet..." maxlength="500">
                    <button id="ai-send" class="ai-send-btn" disabled>
                      <span class="ai-send-text">Kirim</span>
                      <span class="ai-loading" style="display: none;">⏳</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="help-section">
                <h4 class="help-section__title">Selamat Datang di Draveth Wallet!</h4>
                <p class="help-section__text">
                  Draveth Wallet merupakan gerbang digital yang memberi Anda kontrol penuh atas aset kripto dan interaksi dengan aplikasi desentralisasi (dApps). 
                  Lewat wallet ini Anda bisa mengelola token, menandatangani transaksi, dan terhubung ke banyak jaringan (chain) seperti Solana, Binance Smart Chain (BSC), Base, dan Ethereum - masing-masing punya kelebihan dan penggunaan khas.
                </p>
              </div>

              <div class="help-section">
                <h4 class="help-section__title">Apa yang bisa Anda lakukan di wallet ini?</h4>
                <ul class="help-list">
                  <li><strong>Kirim & Terima Token</strong> — kirim aset antar alamat di chain yang sama.</li>
                  <li><strong>Kelola Multi-chain</strong> — berpindah jaringan (Solana, BSC, Base, Ethereum) dan lihat saldo per chain.</li>
                  <li><strong>Swap / Swap Liquidity</strong> — tukar token langsung dari wallet.</li>
                  <li><strong>Staking & Yield</strong> — delegasi atau staking token di jaringan yang mendukung untuk dapat imbal hasil.</li>
                  <li><strong>Bridge antar chain</strong> — pindahkan aset antar jaringan (hati-hati: biaya & waktu berbeda per bridge).</li>
                  <li><strong>Riwayat Transaksi & Keamanan</strong> — lihat riwayat on-chain; aktifkan pengaturan keamanan (PIN, biometrik, hardware wallet).</li>
                </ul>
              </div>

              <div class="help-section">
                <h4 class="help-section__title">Perbedaan singkat tiap chain:</h4>
                <div class="chain-info">
                  <div class="chain-item">
                    <strong>Solana</strong> — sangat cepat, biaya sangat rendah; token berstandar SPL; cocok untuk NFT & aplikasi dengan banyak transaksi.
                  </div>
                  <div class="chain-item">
                    <strong>Binance Smart Chain (BSC)</strong> — EVM-compatible (mirip Ethereum), biaya lebih murah; token berstandar BEP-20.
                  </div>
                  <div class="chain-item">
                    <strong>Base & Ethereum</strong> — keduanya EVM-compatible; Ethereum adalah jaringan paling luas ekosistemnya (ERC-20/ERC-721/ERC-1155) tetapi biaya gas bisa tinggi; Base biasanya menawarkan biaya lebih rendah dibanding Ethereum utama.
                  </div>
                </div>
              </div>

              <div class="help-section">
                <h4 class="help-section__title">Cara membuat akun (Create Wallet)</h4>
                <ol class="help-list help-list--numbered">
                  <li>Pilih Create New Wallet di aplikasi/ekstensi.</li>
                  <li>Buat password/PIN yang kuat untuk akses lokal.</li>
                  <li>Wallet akan menampilkan seed phrase (12/24 kata) — tulis manual dan simpan di tempat aman (offline).</li>
                  <li>Konfirmasi seed phrase sesuai instruksi.</li>
                  <li>Setelah selesai, aktifkan proteksi tambahan (biometrik / PIN / koneksi hardware wallet jika tersedia).</li>
                </ol>
              </div>

              <div class="help-section">
                <h4 class="help-section__title">Cara mengimpor akun:</h4>
                <p class="help-section__text">
                  Pilih Import Wallet → masukkan seed phrase 12 kata atau private key → pilih jaringan yang ingin ditambahkan. 
                  Setelah impor, cek alamat & saldo.
                </p>
              </div>

              <div class="help-section help-section--warning">
                <h4 class="help-section__title">Tips keamanan penting (baca sebelum melakukan create/export)</h4>
                <ul class="help-list help-list--warning">
                  <li><strong>JANGAN</strong> bagikan seed phrase/private key ke siapapun. Wallet yang tahu seed = akses penuh.</li>
                  <li>Simpan seed phrase offline (kertas, safe deposit box, hardware wallet).</li>
                  <li>Waspadai situs phishing — selalu cek URL & domain dApp.</li>
                  <li>Gunakan hardware wallet untuk aset besar.</li>
                  <li>Gunakan jaringan yang benar saat mengirim token (mengirim token antar chain tanpa bridge dapat menghilangkan aset).</li>
                </ul>
              </div>
            </div>
          </div>
          <footer class="modal__footer help-modal__footer">
            <button class="btn btn--primary" data-action="close-help">Tutup</button>
          </footer>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  // Bind event listeners
  bindEvents() {
    // Help button click
    document.addEventListener("click", (e) => {
      const helpBtn = e.target.closest('[data-action="help"]');
      if (helpBtn) {
        e.preventDefault();
        this.openHelpModal();
        return;
      }

      // Close help modal
      const closeBtn = e.target.closest('[data-action="close-help"]');
      if (closeBtn) {
        e.preventDefault();
        this.closeHelpModal();
        return;
      }

      // AI send button
      const aiSendBtn = e.target.closest("#ai-send");
      if (aiSendBtn && !aiSendBtn.disabled) {
        e.preventDefault();
        this.sendAIQuestion();
        return;
      }
    });

    // AI input enter key
    const aiInput = document.getElementById("ai-question");
    if (aiInput) {
      aiInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && e.target.value.trim() !== "") {
          this.sendAIQuestion();
        }
      });

      aiInput.addEventListener("input", (e) => {
        const sendBtn = document.getElementById("ai-send");
        if (sendBtn) {
          sendBtn.disabled = e.target.value.trim() === "";
        }
      });
    }
  }

  // Buka modal help
  openHelpModal() {
    const modal = document.getElementById("help-modal");
    if (modal) {
      modal.classList.add("is-open");
      document.body.classList.add("has-modal");

      // Focus ke input AI setelah modal terbuka
      setTimeout(() => {
        const aiInput = document.getElementById("ai-question");
        if (aiInput) {
          aiInput.focus();
        }
      }, 300);
    }
  }

  // Tutup modal help
  closeHelpModal() {
    const modal = document.getElementById("help-modal");
    if (modal) {
      modal.classList.remove("is-open");
      document.body.classList.remove("has-modal");
    }
  }

  // Kirim pertanyaan ke AI
  async sendAIQuestion() {
    const input = document.getElementById("ai-question");
    const sendBtn = document.getElementById("ai-send");
    const messagesContainer = document.getElementById("ai-messages");

    if (!input || !sendBtn || !messagesContainer) return;

    const question = input.value.trim();
    if (!question) return;

    // Validasi API token
    if (!this.config.replicateApiToken) {
      this.addMessage(
        "ai",
        "⚠️ API token tidak ditemukan. Silakan hubungi administrator untuk mengatur API token Replicate."
      );
      return;
    }

    // Tampilkan loading state
    this.setLoadingState(true);

    // Tambahkan pesan user
    this.addMessage("user", question);

    // Clear input
    input.value = "";
    sendBtn.disabled = true;

    try {
      // Panggil AI via Replicate API
      const response = await this.callGraniteAPI(question);

      // Tambahkan response AI
      this.addMessage("ai", response);
    } catch (error) {
      console.error("Error calling AI API:", error);
      // Fallback response jika API tidak tersedia
      const fallbackResponse = this.getFallbackResponse(question);
      this.addMessage("ai", fallbackResponse);
    } finally {
      this.setLoadingState(false);
    }
  }

  // Set loading state untuk AI
  setLoadingState(loading) {
    const sendBtn = document.getElementById("ai-send");
    const sendText = sendBtn?.querySelector(".ai-send-text");
    const loadingText = sendBtn?.querySelector(".ai-loading");

    if (loading) {
      if (sendText) sendText.style.display = "none";
      if (loadingText) loadingText.style.display = "inline";
      if (sendBtn) sendBtn.disabled = true;
    } else {
      if (sendText) sendText.style.display = "inline";
      if (loadingText) loadingText.style.display = "none";
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  // Tambahkan pesan ke chat
  addMessage(sender, message) {
    const messagesContainer = document.getElementById("ai-messages");
    if (!messagesContainer) return;

    const messageEl = document.createElement("div");
    messageEl.className = `ai-message ai-message--${sender}`;

    const senderLabel = sender === "user" ? "Anda" : "AI Assistant";
    const senderIcon = sender === "user" ? "👤" : "🤖";

    messageEl.innerHTML = `
      <div class="ai-message__header">
        <span class="ai-message__icon">${senderIcon}</span>
        <span class="ai-message__sender">${senderLabel}</span>
        <span class="ai-message__time">${new Date().toLocaleTimeString(
          "id-ID",
          { hour: "2-digit", minute: "2-digit" }
        )}</span>
      </div>
      <div class="ai-message__content">${this.formatMessage(message)}</div>
    `;

    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Format pesan dengan markdown sederhana
  formatMessage(message) {
    return message
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  // Fallback response jika API tidak tersedia
  getFallbackResponse(question) {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("cara") && lowerQuestion.includes("buat")) {
      return 'Untuk membuat wallet baru di Draveth:\n\n1. Klik "create a new wallet" di halaman utama\n2. Buat password yang kuat\n3. Simpan seed phrase dengan aman (12-24 kata)\n4. Konfirmasi seed phrase\n5. Aktifkan proteksi tambahan (PIN/biometrik)';
    }

    if (lowerQuestion.includes("import") || lowerQuestion.includes("impor")) {
      return 'Untuk mengimpor wallet:\n\n1. Klik "I Already Have a Wallet"\n2. Pilih metode import (seed phrase/private key/hardware wallet)\n3. Masukkan data wallet Anda\n4. Pilih jaringan yang didukung\n5. Verifikasi alamat dan saldo';
    }

    if (lowerQuestion.includes("keamanan") || lowerQuestion.includes("aman")) {
      return "Tips keamanan Draveth Wallet:\n\n• JANGAN bagikan seed phrase ke siapapun\n• Simpan seed phrase offline (kertas/hardware wallet)\n• Waspadai situs phishing\n• Gunakan hardware wallet untuk aset besar\n• Pastikan menggunakan jaringan yang benar saat transaksi";
    }

    if (lowerQuestion.includes("chain") || lowerQuestion.includes("jaringan")) {
      return "Draveth mendukung multiple blockchain:\n\n• **Solana**: Cepat, biaya rendah, cocok untuk NFT\n• **BSC**: EVM-compatible, biaya murah\n• **Ethereum**: Ekosistem luas, biaya gas tinggi\n• **Base**: EVM-compatible, biaya lebih rendah dari Ethereum";
    }

    if (lowerQuestion.includes("fitur") || lowerQuestion.includes("fungsi")) {
      return "Fitur utama Draveth Wallet:\n\n• Kirim & terima token\n• Multi-chain support\n• Swap token\n• Staking & yield farming\n• Bridge antar chain\n• Riwayat transaksi\n• Keamanan tingkat enterprise";
    }

    return "Terima kasih atas pertanyaan Anda! Draveth Wallet adalah wallet kripto multi-chain yang aman dan mudah digunakan. Untuk informasi lebih detail, silakan baca panduan lengkap di atas atau hubungi tim support kami.";
  }

  // Panggil IBM Granite API via Replicate
  async callGraniteAPI(question) {
    const systemPrompt = `Anda adalah AI Assistant untuk Draveth Wallet, sebuah wallet kripto multi-chain. 
    Berikan jawaban yang informatif, akurat, dan mudah dipahami dalam bahasa Indonesia. 
    Fokus pada topik cryptocurrency, blockchain, wallet security, dan penggunaan Draveth Wallet.
    
    Informasi Draveth Wallet:
    - Mendukung Solana, BSC, Base, dan Ethereum
    - Fitur: kirim/terima token, swap, staking, bridge antar chain
    - Keamanan: seed phrase, hardware wallet support, biometrik
    - Multi-chain wallet dengan interface yang user-friendly
    
    Jawab pertanyaan dengan singkat, jelas, dan praktis.`;

    const fullPrompt = `${systemPrompt}\n\nPertanyaan user: ${question}`;

    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions`, {
        method: "POST",
        headers: {
          Authorization: `Token ${this.config.replicateApiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.graniteModel,
          input: {
            prompt: fullPrompt,
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            top_p: 0.9,
            stop_sequences: ["Human:", "Assistant:", "\n\n"],
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API Error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const prediction = await response.json();

      // Poll untuk hasil (karena Replicate adalah async API)
      return await this.pollPredictionResult(prediction.id);
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  }

  // Poll hasil prediction dari Replicate
  async pollPredictionResult(predictionId) {
    const maxAttempts = 10; // 10 detik timeout (lebih reasonable)
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              Authorization: `Token ${this.config.replicateApiToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Polling Error: ${response.status}`);
        }

        const prediction = await response.json();

        if (prediction.status === "succeeded") {
          return prediction.output || "Tidak ada response dari AI.";
        } else if (prediction.status === "failed") {
          throw new Error(
            "Prediction failed: " + (prediction.error || "Unknown error")
          );
        }

        // Wait 1 second before next poll
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      } catch (error) {
        console.error("Polling error:", error);
        throw error;
      }
    }

    throw new Error("Timeout waiting for AI response");
  }
}

// Initialize Help System ketika DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.helpSystem = new HelpSystem();
});

// Export untuk penggunaan global
window.HelpSystem = HelpSystem;
