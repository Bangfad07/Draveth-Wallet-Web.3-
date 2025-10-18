// Draveth Wallet - Authentication & Dynamic Routing System
(function () {
  const SCREENS = Array.from(document.querySelectorAll(".screen"));
  const loaderOverlay = document.getElementById("loader-overlay");

  // Authentication System
  class AuthManager {
    constructor() {
      this.currentUser = null;
      this.sessionKey = "draveth_session";
      this.init();
    }

    init() {
      // Check for existing session
      const session = this.getSession();
      if (session && this.isSessionValid(session)) {
        this.currentUser = session.user;
        this.updateUI();
      }
    }

    // Hash password menggunakan simple hash
    hashPassword(password) {
      let hash = 0;
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash.toString();
    }

    // Simulate user database (in real app, this would be server-side)
    getUsers() {
      const users = localStorage.getItem("draveth_users");
      return users ? JSON.parse(users) : {};
    }

    saveUsers(users) {
      localStorage.setItem("draveth_users", JSON.stringify(users));
    }

    // Register new user
    register(username, password, walletData = {}) {
      const users = this.getUsers();
      if (users[username]) {
        return { success: false, message: "Username sudah digunakan" };
      }

      const hashedPassword = this.hashPassword(password);
      users[username] = {
        password: hashedPassword,
        walletData: walletData,
        createdAt: new Date().toISOString(),
      };

      this.saveUsers(users);
      return { success: true, message: "Registrasi berhasil" };
    }

    // Login user
    login(username, password) {
      const users = this.getUsers();
      const user = users[username];

      if (!user) {
        return { success: false, message: "Username tidak ditemukan" };
      }

      const hashedPassword = this.hashPassword(password);
      if (user.password !== hashedPassword) {
        return { success: false, message: "Password salah" };
      }

      // Create session
      const session = {
        user: { username, walletData: user.walletData },
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      this.setSession(session);
      this.currentUser = session.user;
      this.updateUI();

      return { success: true, message: "Login berhasil" };
    }

    // Logout user
    logout() {
      this.clearSession();
      this.currentUser = null;
      this.updateUI();
      router.navigate("/login");
    }

    // Session management
    setSession(session) {
      sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
    }

    getSession() {
      const session = sessionStorage.getItem(this.sessionKey);
      return session ? JSON.parse(session) : null;
    }

    clearSession() {
      sessionStorage.removeItem(this.sessionKey);
    }

    isSessionValid(session) {
      if (!session || !session.expiresAt) return false;
      return new Date(session.expiresAt) > new Date();
    }

    isAuthenticated() {
      const session = this.getSession();
      return session && this.isSessionValid(session) && this.currentUser;
    }

    updateUI() {
      // Update UI based on authentication status
      const isAuth = this.isAuthenticated();

      // Show/hide elements based on auth status
      const authElements = document.querySelectorAll('[data-auth="required"]');
      const guestElements = document.querySelectorAll('[data-auth="guest"]');

      authElements.forEach((el) => {
        el.style.display = isAuth ? "block" : "none";
      });

      guestElements.forEach((el) => {
        el.style.display = isAuth ? "none" : "block";
      });

      // Update user info in dashboard
      if (isAuth && this.currentUser) {
        const usernameEl = document.querySelector("#dashboard-username");
        if (usernameEl) {
          usernameEl.textContent = this.currentUser.username;
        }
      }
    }
  }

  // Dynamic Routing System
  class Router {
    constructor() {
      this.routes = {
        "/": "splash",
        "/login": "login",
        "/dashboard": "dashboard",
        "/extension": "extension",
      };
      this.protectedRoutes = ["/dashboard"];
      this.init();
    }

    init() {
      // Handle browser back/forward
      window.addEventListener("popstate", (e) => {
        this.handleRoute();
      });

      // Handle initial route
      this.handleRoute();
    }

    navigate(path, replace = false) {
      if (replace) {
        history.replaceState(null, "", path);
      } else {
        history.pushState(null, "", path);
      }
      this.handleRoute();
    }

    handleRoute() {
      const path = window.location.pathname;
      const route = this.routes[path] || "splash";

      // Check if route is protected
      if (this.protectedRoutes.includes(path) && !auth.isAuthenticated()) {
        this.navigate("/login", true);
        return;
      }

      // Redirect authenticated users away from login
      if (path === "/login" && auth.isAuthenticated()) {
        this.navigate("/dashboard", true);
        return;
      }

      this.showScreen(route);
    }

    showScreen(name) {
      SCREENS.forEach((s) => s.classList.remove("screen--active"));
      const target = document.querySelector(`.screen[data-screen="${name}"]`);
      if (target) target.classList.add("screen--active");
    }
  }

  // Initialize systems
  const auth = new AuthManager();
  const router = new Router();

  function showScreen(name) {
    router.showScreen(name);
  }

  function withLoader(next) {
    loaderOverlay.classList.add("is-active");
    setTimeout(() => {
      try {
        next();
      } finally {
        setTimeout(() => loaderOverlay.classList.remove("is-active"), 250);
      }
    }, 900); // a few seconds feel snappy; keep < 1.2s
  }

  function navigateTo(name) {
    withLoader(() => showScreen(name));
  }

  // Login form handler
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value;
      const errorEl = document.getElementById("login-error");

      if (!username || !password) {
        errorEl.textContent = "Username dan password harus diisi";
        errorEl.classList.remove("hidden");
        return;
      }

      // Show loading
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Memproses...";
      submitBtn.disabled = true;

      // Simulate login delay
      setTimeout(() => {
        const result = auth.login(username, password);

        if (result.success) {
          errorEl.classList.add("hidden");
          router.navigate("/dashboard");
        } else {
          errorEl.textContent = result.message;
          errorEl.classList.remove("hidden");
        }

        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 1000);
    });
  }

  // Logout handler
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      auth.logout();
    });
  }

  // Password toggle for login form
  document.addEventListener("click", (e) => {
    const toggle = e.target.closest(".password-toggle");
    if (toggle) {
      e.preventDefault();
      const targetId = toggle.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (input) {
        const isPassword = input.getAttribute("type") === "password";
        input.setAttribute("type", isPassword ? "text" : "password");
      }
    }
  });

  // Register link handler
  const registerLink = document.getElementById("register-link");
  if (registerLink) {
    registerLink.addEventListener("click", (e) => {
      e.preventDefault();
      // Close login screen and go to splash to start registration
      router.navigate("/");
    });
  }

  // Wire buttons with data-nav (updated for router)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-nav]");
    if (!btn) return;
    const target = btn.getAttribute("data-nav");
    e.preventDefault();

    if (target === "seed") {
      // Open import modal instead of navigating to seed screen
      const importModal = document.getElementById("import-modal");
      if (importModal) {
        importModal.classList.add("is-open");
        document.body.classList.add("has-modal");
      }
    } else if (target === "dashboard") {
      // Check authentication before navigating to dashboard
      if (auth.isAuthenticated()) {
        router.navigate("/dashboard");
      } else {
        router.navigate("/login");
      }
    } else if (target === "login") {
      router.navigate("/login");
    } else if (target === "splash") {
      router.navigate("/");
    } else {
      // For other routes, use the old navigation system
      navigateTo(target);
    }
  });

  // Help button action - removed alert, now handled by help-system.js
  // The help system is now managed by the HelpSystem class in help-system.js

  // Recovery modal logic
  const modal = document.getElementById("recovery-modal");
  const gridEl = document.getElementById("recovery-grid");
  const confirmSaved = document.getElementById("confirm-saved");
  const btnContinue = document.getElementById("recovery-continue");

  // Flag untuk tracking asal modal sebelum password/username
  let passwordModalFrom = null;
  let usernameModalFrom = null;
  if (btnContinue) {
    btnContinue.addEventListener("click", function () {
      // Continue dari RECOVERY PHRASE (create wallet)
      document
        .querySelectorAll(".modal.is-open")
        .forEach((m) => m.classList.remove("is-open"));
      passwordModalFrom = "recovery";
      usernameModalFrom = "password";
      const passwordModal = document.getElementById("password-modal");
      if (passwordModal) {
        passwordModal.classList.add("is-open");
        document.body.classList.add("has-modal");
      } else {
        document.body.classList.remove("has-modal");
      }
    });
  }

  // Tombol kembali pada RECOVERY PHRASE (kembali ke halaman login)
  const recoveryBackBtn2 = document.querySelector(
    "#recovery-modal .modal__back"
  );
  if (recoveryBackBtn2) {
    recoveryBackBtn2.addEventListener("click", function () {
      // Tutup semua modal
      document
        .querySelectorAll(".modal.is-open")
        .forEach((m) => m.classList.remove("is-open"));
      document.body.classList.remove("has-modal");
      // Kembali ke halaman utama (splash)
      showScreen("splash");
    });
  }

  // Tombol kembali pada Import Your Private Key (kembali ke Import Wallet)
  const importPrivateBackBtn = document.querySelector(
    "#import-private-modal .modal__back"
  );
  if (importPrivateBackBtn) {
    importPrivateBackBtn.addEventListener("click", function () {
      const importPrivateModal = document.getElementById(
        "import-private-modal"
      );
      if (importPrivateModal) importPrivateModal.classList.remove("is-open");
      const importModal = document.getElementById("import-modal");
      if (importModal) {
        importModal.classList.add("is-open");
        document.body.classList.add("has-modal");
      }
      passwordModalFrom = null;
      usernameModalFrom = null;
    });
  }

  // Tombol IMPORT pada Import Your Private Key (buka Create A Password)
  const importPrivateForm = document.getElementById("import-private-form");
  if (importPrivateForm) {
    importPrivateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const importPrivateModal = document.getElementById(
        "import-private-modal"
      );
      if (importPrivateModal) importPrivateModal.classList.remove("is-open");
      passwordModalFrom = "import-private";
      usernameModalFrom = "password";
      const passwordModal = document.getElementById("password-modal");
      if (passwordModal) {
        passwordModal.classList.add("is-open");
        document.body.classList.add("has-modal");
      }
    });
  }

  const WORD_BANK = [
    "Table",
    "Chair",
    "Window",
    "Pencil",
    "Book",
    "Apple",
    "Banana",
    "Orange",
    "Mango",
    "Pineapple",
    "Carrot",
    "Tomato",
    "Cabbage",
    "Onion",
    "Potato",
    "Dog",
    "Cat",
    "Elephant",
    "Tiger",
    "Bird",
    "Fish",
    "Rabbit",
    "Cow",
    "Horse",
    "Lion",
    "Doctor",
    "Teacher",
    "Farmer",
    "Chef",
    "Engineer",
    "Nurse",
    "Pilot",
    "Police",
    "Firefighter",
    "Mechanic",
    "Artist",
  ];

  function pickRecoveryWords() {
    const words = [...WORD_BANK];
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return words.slice(0, 12);
  }

  function renderGrid(words) {
    if (!gridEl) return;
    gridEl.innerHTML = "";
    words.forEach((w) => {
      const li = document.createElement("li");
      li.textContent = w;
      gridEl.appendChild(li);
    });
  }

  function openRecovery() {
    if (!modal) return;
    const words = pickRecoveryWords();
    renderGrid(words);
    if (confirmSaved) confirmSaved.checked = false;
    if (btnContinue) btnContinue.disabled = true;
    modal.classList.add("is-open");
    document.body.classList.add("has-modal");
  }

  function closeRecovery() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.classList.remove("has-modal");
  }

  document.addEventListener("click", (e) => {
    const openBtn = e.target.closest('[data-action="open-recovery"]');
    if (openBtn) {
      e.preventDefault();
      openRecovery();
      return;
    }
    const closeBtn = e.target.closest('[data-action="close-recovery"]');
    if (closeBtn) {
      e.preventDefault();
      closeRecovery();
      return;
    }
  });

  // Refresh words
  document.addEventListener("click", (e) => {
    const refresh = e.target.closest("#recovery-refresh");
    if (!refresh) return;
    e.preventDefault();
    const words = pickRecoveryWords();
    renderGrid(words);
  });

  if (confirmSaved && btnContinue) {
    confirmSaved.addEventListener("change", () => {
      btnContinue.disabled = !confirmSaved.checked;
    });
    btnContinue.addEventListener("click", () => {
      if (confirmSaved.checked) {
        // go to password modal instead of dashboard
        closeRecovery();
        const pwModal = document.getElementById("password-modal");
        if (pwModal) {
          pwModal.classList.add("is-open");
          document.body.classList.add("has-modal");
        }
      } else {
        // open notice modal
        const notice = document.getElementById("notice-modal");
        if (notice) {
          notice.classList.add("is-open");
        }
      }
    });
  }

  // Notice modal OK and close
  document.addEventListener("click", (e) => {
    const ok = e.target.closest("#notice-ok");
    const closeNotice = e.target.closest('[data-action="close-notice"]');
    if (!ok && !closeNotice) return;
    e.preventDefault();
    const notice = document.getElementById("notice-modal");
    if (notice) notice.classList.remove("is-open");
  });

  // Import modal interactions
  document.addEventListener("click", (e) => {
    const closeImport = e.target.closest('[data-action="close-import"]');
    if (closeImport) {
      e.preventDefault();
      const importModal = document.getElementById("import-modal");
      if (importModal) {
        importModal.classList.remove("is-open");
        document.body.classList.remove("has-modal");
      }
      return;
    }

    const importRecovery = e.target.closest(
      '[data-action="show-recovery-input"]'
    );
    if (importRecovery) {
      e.preventDefault();
      const importModal = document.getElementById("import-modal");
      if (importModal) importModal.classList.remove("is-open");
      const recoveryInputModal = document.getElementById(
        "recovery-input-modal"
      );
      if (recoveryInputModal) {
        recoveryInputModal.classList.add("is-open");
        document.body.classList.add("has-modal");
      }
      return;
    }

    const importPrivate = e.target.closest('[data-action="import-private"]');
    if (importPrivate) {
      e.preventDefault();
      // Tutup Import Wallet modal
      const importModal = document.getElementById("import-modal");
      if (importModal) importModal.classList.remove("is-open");
      // Buka Import Private Key modal
      const importPrivateModal = document.getElementById(
        "import-private-modal"
      );
      if (importPrivateModal) {
        importPrivateModal.classList.add("is-open");
        document.body.classList.add("has-modal");
      }
      return;
    }

    const importHardware = e.target.closest('[data-action="import-hardware"]');
    if (importHardware) {
      e.preventDefault();
      alert("Hardware wallet connection feature coming soon!");
      return;
    }

    // Close Import Private Modal
    const closeImportPrivate = e.target.closest(
      '[data-action="close-import-private"]'
    );
    if (closeImportPrivate) {
      e.preventDefault();
      const importPrivateModal = document.getElementById(
        "import-private-modal"
      );
      if (importPrivateModal) importPrivateModal.classList.remove("is-open");
      // Kembali ke Import Wallet saja, tanpa layar awal
      const importModal = document.getElementById("import-modal");
      if (importModal) {
        importModal.classList.add("is-open");
        document.body.classList.add("has-modal");
      } else {
        document.body.classList.remove("has-modal");
      }
      return;
    }
  });

  // Import Wallet validation and modal logic
  const importWalletBtn = document.getElementById("import-wallet-btn");
  if (importWalletBtn) {
    importWalletBtn.addEventListener("click", function () {
      const recoveryInputModal = document.getElementById(
        "recovery-input-modal"
      );
      const successModal = document.getElementById("import-success-modal");
      const errorModal = document.getElementById("import-error-modal");
      const loaderOverlay = document.getElementById("loader-overlay");
      const allowedWords = [
        "Table",
        "Chair",
        "Window",
        "Pencil",
        "Book",
        "Apple",
        "Banana",
        "Orange",
        "Mango",
        "Pineapple",
        "Carrot",
        "Tomato",
        "Cabbage",
        "Onion",
        "Potato",
        "Dog",
        "Cat",
        "Elephant",
        "Tiger",
        "Bird",
        "Fish",
        "Rabbit",
        "Cow",
        "Horse",
        "Lion",
        "Doctor",
        "Teacher",
        "Farmer",
        "Chef",
        "Engineer",
        "Nurse",
        "Pilot",
        "Police",
        "Firefighter",
        "Mechanic",
        "Artist",
      ];
      // Ambil semua input
      const inputs = recoveryInputModal.querySelectorAll(".recovery-word");
      const words = Array.from(inputs).map((input) => input.value.trim());
      // Validasi: semua terisi dan semua ada di allowedWords (case-insensitive)
      const isValid =
        words.length === 12 &&
        words.every((w) =>
          allowedWords.some((aw) => aw.toLowerCase() === w.toLowerCase())
        );
      if (isValid) {
        // Loading 2 detik
        if (recoveryInputModal) recoveryInputModal.classList.remove("is-open");
        document.body.classList.remove("has-modal");
        if (loaderOverlay) loaderOverlay.classList.add("is-active");
        setTimeout(() => {
          if (loaderOverlay) loaderOverlay.classList.remove("is-active");
          if (successModal) {
            successModal.classList.add("is-open");
            document.body.classList.add("has-modal");
          }
        }, 2000);
      } else {
        // Tampilkan error modal
        if (recoveryInputModal) recoveryInputModal.classList.remove("is-open");
        if (errorModal) {
          errorModal.classList.add("is-open");
          document.body.classList.add("has-modal");
        }
      }
    });
  }

  // Tombol kembali di RECOVERY YOUR PHRASE (kembali ke Import Wallet)
  const recoveryBackBtn = document.querySelector(
    "#recovery-input-modal .modal__back"
  );
  if (recoveryBackBtn) {
    recoveryBackBtn.addEventListener("click", function () {
      const recoveryInputModal = document.getElementById(
        "recovery-input-modal"
      );
      const importModal = document.getElementById("import-modal");
      if (recoveryInputModal) recoveryInputModal.classList.remove("is-open");
      if (importModal) {
        importModal.classList.add("is-open");
        document.body.classList.add("has-modal");
      }
      passwordModalFrom = null;
      usernameModalFrom = null;
    });
  }

  // Success modal: CONTINUE button
  const importSuccessContinue = document.getElementById(
    "import-success-continue"
  );
  if (importSuccessContinue) {
    importSuccessContinue.addEventListener("click", function () {
      const successModal = document.getElementById("import-success-modal");
      if (successModal) successModal.classList.remove("is-open");
      document.body.classList.remove("has-modal");

      // Get the username and password from the modals
      const username = document.getElementById("username")?.value?.trim();
      const password = document.getElementById("pw1")?.value;

      if (username && password) {
        // Register the user with imported wallet data
        const result = auth.register(username, password, {
          walletType: "imported",
          importedAt: new Date().toISOString(),
        });

        if (result.success) {
          // Auto login after registration
          const loginResult = auth.login(username, password);
          if (loginResult.success) {
            router.navigate("/dashboard");
            return;
          }
        }
      }

      // Fallback to password modal
      passwordModalFrom = "success";
      const passwordModal = document.getElementById("password-modal");
      if (passwordModal) {
        passwordModal.classList.add("is-open");
        document.body.classList.add("has-modal");
      }
    });
  }

  // Error modal: OK button
  const importErrorOk = document.getElementById("import-error-ok");
  if (importErrorOk) {
    importErrorOk.addEventListener("click", function () {
      const errorModal = document.getElementById("import-error-modal");
      const recoveryInputModal = document.getElementById(
        "recovery-input-modal"
      );
      if (errorModal) errorModal.classList.remove("is-open");
      if (recoveryInputModal) recoveryInputModal.classList.add("is-open");
      document.body.classList.add("has-modal");
    });
  }

  // Password & Username modal interactions (back/continue sesuai flow)
  document.addEventListener("click", (e) => {
    // Tombol kembali di Password Modal
    const back = e.target.closest('[data-action="back-to-recovery"]');
    if (back) {
      e.preventDefault();

      // Pastikan modal notice tertutup saat kembali
      const notice = document.getElementById("notice-modal");
      if (notice) notice.classList.remove("is-open");

      const pwModal = document.getElementById("password-modal");
      if (pwModal) pwModal.classList.remove("is-open");

      // Kembali ke modal sesuai asal
      if (passwordModalFrom === "recovery") {
        // Flow create wallet
        const recoveryModal = document.getElementById("recovery-modal");
        if (recoveryModal) {
          recoveryModal.classList.add("is-open");
          document.body.classList.add("has-modal");
        }
      } else if (passwordModalFrom === "import-private") {
        // Flow import private key
        const importPrivateModal = document.getElementById(
          "import-private-modal"
        );
        if (importPrivateModal) {
          importPrivateModal.classList.add("is-open");
          document.body.classList.add("has-modal");
        }
      } else if (
        passwordModalFrom === "recovery-input" ||
        passwordModalFrom === "success"
      ) {
        // Flow recovery phrase
        const recoveryInputModal = document.getElementById(
          "recovery-input-modal"
        );
        if (recoveryInputModal) {
          recoveryInputModal.classList.add("is-open");
          document.body.classList.add("has-modal");
        }
      }
      return;
    }
    // Tombol kembali di Username Modal
    const backToPassword = e.target.closest('[data-action="back-to-password"]');
    if (backToPassword) {
      e.preventDefault();

      // Pastikan modal notice tertutup saat kembali
      const notice = document.getElementById("notice-modal");
      if (notice) notice.classList.remove("is-open");

      const usernameModal = document.getElementById("username-modal");
      if (usernameModal) usernameModal.classList.remove("is-open");
      // Kembali ke password modal
      const pwModal = document.getElementById("password-modal");
      if (pwModal) {
        pwModal.classList.add("is-open");
        document.body.classList.add("has-modal");
      }
      return;
    }
    // Toggle password visibility
    const toggleBtn = e.target.closest('[data-action="toggle-visibility"]');
    if (toggleBtn) {
      e.preventDefault();
      const targetId = toggleBtn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (input) {
        const isPassword = input.getAttribute("type") === "password";
        input.setAttribute("type", isPassword ? "text" : "password");
        const pressed = toggleBtn.getAttribute("aria-pressed") === "true";
        toggleBtn.setAttribute("aria-pressed", (!pressed).toString());
      }
      return;
    }
  });

  const pwContinue = document.getElementById("password-continue");
  if (pwContinue) {
    pwContinue.addEventListener("click", () => {
      // Pastikan modal notice tertutup terlebih dahulu
      const notice = document.getElementById("notice-modal");
      if (notice) notice.classList.remove("is-open");

      const p1 = document.getElementById("pw1");
      const p2 = document.getElementById("pw2");
      const agree = document.getElementById("agree-terms");
      const pw1 = p1 ? p1.value : "";
      const pw2 = p2 ? p2.value : "";
      const agreed = !!(agree && agree.checked);

      // Validasi password terlebih dahulu
      if (!pw1 || !pw2 || pw1 !== pw2) {
        const text = notice ? notice.querySelector(".modal__desc") : null;
        if (text)
          text.textContent =
            "Password tidak valid. Pastikan kedua password sama.";
        if (notice) notice.classList.add("is-open");
        return;
      }

      // Validasi terms of service
      if (!agreed) {
        const text = notice ? notice.querySelector(".modal__desc") : null;
        if (text)
          text.textContent =
            "Silakan centang kotak 'I Agree To The Terms Of Service' untuk melanjutkan.";
        if (notice) notice.classList.add("is-open");
        return;
      }

      // Jika semua validasi berhasil, lanjutkan ke username modal
      const pwModal = document.getElementById("password-modal");
      if (pwModal) pwModal.classList.remove("is-open");
      const usernameModal = document.getElementById("username-modal");
      if (usernameModal) {
        usernameModal.classList.add("is-open");
        document.body.classList.add("has-modal");
      }
      // Set asal username modal untuk tombol kembali
      usernameModalFrom = "password";
    });
  }

  // Username modal interactions
  const usernameInput = document.getElementById("username");
  const usernameStatus = document.getElementById("username-status");
  const usernameContinue = document.getElementById("username-continue");

  // Simulated taken usernames for demo
  const takenUsernames = [
    "admin",
    "test",
    "user",
    "wallet",
    "crypto",
    "bitcoin",
    "ethereum",
    "solana",
  ];

  function checkUsernameAvailability(username) {
    if (!username) {
      usernameStatus.textContent = "";
      usernameStatus.className = "username-status";
      return;
    }

    const isTaken = takenUsernames.includes(username.toLowerCase());
    if (isTaken) {
      usernameStatus.textContent = `@${username} has been used by someone else`;
      usernameStatus.className = "username-status taken";
    } else {
      usernameStatus.textContent = `@${username} avail`;
      usernameStatus.className = "username-status available";
    }
  }

  if (usernameInput) {
    usernameInput.addEventListener("input", (e) => {
      checkUsernameAvailability(e.target.value.trim());
    });
  }

  if (usernameContinue) {
    usernameContinue.addEventListener("click", () => {
      const username = usernameInput ? usernameInput.value.trim() : "";
      if (!username) {
        const notice = document.getElementById("notice-modal");
        const text = notice ? notice.querySelector(".modal__desc") : null;
        if (text) text.textContent = "Silakan masukkan username";
        if (notice) notice.classList.add("is-open");
        return;
      }
      // Check if username is taken
      const isTaken = takenUsernames.includes(username.toLowerCase());
      if (isTaken) {
        const notice = document.getElementById("notice-modal");
        const text = notice ? notice.querySelector(".modal__desc") : null;
        if (text)
          text.textContent =
            "Username sudah digunakan. Silakan pilih username lain.";
        if (notice) notice.classList.add("is-open");
        return;
      }
      // success -> proceed to Welcome modal
      const usernameModal = document.getElementById("username-modal");
      if (usernameModal) usernameModal.classList.remove("is-open");
      const welcomeModal = document.getElementById("welcome-modal");
      if (welcomeModal) {
        welcomeModal.classList.add("is-open");
        document.body.classList.add("has-modal");
      }
      // Reset asal modal setelah selesai
      passwordModalFrom = null;
      usernameModalFrom = null;
    });
  }

  // Welcome modal get started
  const getStarted = document.getElementById("welcome-get-started");
  if (getStarted) {
    getStarted.addEventListener("click", (e) => {
      e.preventDefault();
      // Tutup welcome modal
      const welcomeModal = document.getElementById("welcome-modal");
      if (welcomeModal) welcomeModal.classList.remove("is-open");
      document.body.classList.remove("has-modal");

      // Get the username and password from the modals
      const username = document.getElementById("username")?.value?.trim();
      const password = document.getElementById("pw1")?.value;

      if (username && password) {
        // Register the user
        const result = auth.register(username, password, {
          walletType: "new",
          createdAt: new Date().toISOString(),
        });

        if (result.success) {
          // Auto login after registration
          const loginResult = auth.login(username, password);
          if (loginResult.success) {
            router.navigate("/dashboard");
            return;
          }
        }
      }

      // Fallback to extension screen
      router.navigate("/extension");
    });
  }

  // Download Extension button
  document.addEventListener("click", (e) => {
    const dl = e.target.closest("#download-extension");
    if (!dl) return;
    e.preventDefault();
    // Placeholder: buka tautan ekstensi (ganti dengan URL asli jika ada)
    window.open("https://example.com/draveth-extension", "_blank");
  });

  // Seed form submit
  const seedForm = document.getElementById("seed-form");
  if (seedForm) {
    seedForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const seed = seedForm.seed.value.trim();
      if (!seed || seed.split(/\s+/).length < 12) {
        alert("Seed phrase minimal 12 kata.");
        return;
      }
      navigateTo("dashboard");
    });
  }
})();
