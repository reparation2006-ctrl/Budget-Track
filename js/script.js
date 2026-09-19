/*
  BUDGET TRACK — synchronisation centrale
  ------------------------------------------------------------
  Toutes les pages Budget Track peuvent partager les mêmes données
  en utilisant localStorage + BroadcastChannel.

  Structure d'une transaction :
  {
    id: "unique-id",
    type: "income" | "expense",
    amount: 5230,
    category: "Salaire",
    description: "Salaire janvier",
    date: "2026-09-19T08:30:00.000Z"
  }

  IMPORTANT POUR TA PAGE TRANSACTIONS EXISTANTE :
  1) charge ce même script (ou reprends l'objet BudgetTrackStore ci-dessous)
  2) utilise BudgetTrackStore.addTransaction({...})
     pour chaque nouvelle transaction.
  3) utilise BudgetTrackStore.updateTransaction(id, data)
     et BudgetTrackStore.deleteTransaction(id) pour les modifications.
  Ainsi le tableau de bord se met à jour automatiquement, même dans
  un autre onglet.
*/

(() => {
  "use strict";

  const STORAGE_KEY = "budgetTrackDataV1";
  const CHANNEL_NAME = "budgetTrackSyncV1";
  const CURRENCY = "XAF";

  const CATEGORY_COLORS = [
    "#1769d1", "#18a5b4", "#6e9ddc", "#84b5eb", "#9ebfe6",
    "#3b82c4", "#0f9b75", "#7657c7", "#e68b37", "#d95565"
  ];

  const DEFAULT_DATA = {
    transactions: [],
    notifications: [],
    profileImage: "",
    theme: "light",
    updatedAt: null
  };

  const $ = (selector) => document.querySelector(selector);

  function uid() {
    return "tx_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_DATA);
      const data = JSON.parse(raw);
      return {
        ...DEFAULT_DATA,
        ...data,
        transactions: Array.isArray(data.transactions) ? data.transactions : [],
        notifications: Array.isArray(data.notifications) ? data.notifications : []
      };
    } catch (error) {
      console.error("BudgetTrack: données invalides", error);
      return structuredClone(DEFAULT_DATA);
    }
  }

  function saveData(data, source = "dashboard") {
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (channel) {
      channel.postMessage({ type: "data-updated", source, at: data.updatedAt });
    }
    renderAll(data);
  }

  function normalizeTransaction(transaction) {
    const t = { ...transaction };
    t.id = t.id || uid();
    t.type = t.type === "income" || t.type === "recette" ? "income" : "expense";
    t.amount = Math.abs(Number(t.amount) || 0);
    t.category = String(t.category || "Autre");
    t.description = String(t.description || t.category || "Transaction");
    t.date = t.date || new Date().toISOString();
    return t;
  }

  const BudgetTrackStore = {
    getData: () => loadData(),

    getTransactions: () => loadData().transactions,

    addTransaction(transaction) {
      const data = loadData();
      const t = normalizeTransaction(transaction);
      data.transactions.push(t);

      data.notifications.unshift({
        id: uid(),
        title: t.type === "income" ? "Nouvelle recette" : "Nouvelle dépense",
        message: `${t.description} · ${formatMoney(t.amount)}`,
        date: new Date().toISOString(),
        read: false
      });

      data.notifications = data.notifications.slice(0, 30);
      saveData(data, "transactions");
      return t;
    },

    updateTransaction(id, changes) {
      const data = loadData();
      const index = data.transactions.findIndex(t => t.id === id);
      if (index === -1) return false;
      data.transactions[index] = normalizeTransaction({
        ...data.transactions[index],
        ...changes,
        id
      });
      saveData(data, "transactions");
      return true;
    },

    deleteTransaction(id) {
      const data = loadData();
      data.transactions = data.transactions.filter(t => t.id !== id);
      saveData(data, "transactions");
      return true;
    },

    replaceTransactions(transactions) {
      const data = loadData();
      data.transactions = transactions.map(normalizeTransaction);
      saveData(data, "transactions");
    },

    setTheme(theme) {
      const data = loadData();
      data.theme = theme === "dark" ? "dark" : "light";
      saveData(data, "settings");
    },

    setProfileImage(dataUrl) {
      const data = loadData();
      data.profileImage = dataUrl;
      saveData(data, "profile");
    },

    markNotificationsRead() {
      const data = loadData();
      data.notifications = data.notifications.map(n => ({ ...n, read: true }));
      saveData(data, "notifications");
    }
  };

  // Rend le store accessible depuis ta page Transactions existante.
  window.BudgetTrackStore = BudgetTrackStore;

  let channel = null;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener("message", (event) => {
      if (event.data?.type === "data-updated") {
        renderAll(loadData());
        setSyncStatus("Synchronisé à l'instant");
      }
    });
  } catch (error) {
    console.warn("BroadcastChannel non disponible, localStorage reste actif.");
  }

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      renderAll(loadData());
      setSyncStatus("Synchronisé à l'instant");
    }
  });

  function formatMoney(value) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: CURRENCY,
      minimumFractionDigits: 2
    }).format(Number(value) || 0);
  }

  function formatDate(date) {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(d);
  }

  function currentMonthTransactions(transactions) {
    const now = new Date();
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }

  function getSummary(transactions) {
    const month = currentMonthTransactions(transactions);

    const income = month
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = month
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const allIncome = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const allExpense = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: allIncome - allExpense,
      monthBalance: income - expense
    };
  }

  function getExpenseCategories(transactions) {
    const map = new Map();
    transactions
      .filter(t => t.type === "expense")
      .forEach(t => map.set(t.category, (map.get(t.category) || 0) + t.amount));

    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }

  function renderAll(data = loadData()) {
    applyTheme(data.theme);
    renderProfile(data.profileImage);
    renderKpis(data.transactions);
    renderRecentTransactions(data.transactions);
    renderChart(data.transactions);
    renderNotifications(data.notifications);
    setSyncStatus("Données synchronisées");
  }

  function renderKpis(transactions) {
    const summary = getSummary(transactions);

    $("#balanceValue").textContent = formatMoney(summary.balance);
    $("#incomeValue").textContent = formatMoney(summary.income);
    $("#expenseValue").textContent = formatMoney(summary.expense);

    $("#balanceTrend").textContent =
      summary.monthBalance >= 0
        ? `↗ +${formatMoney(summary.monthBalance)} ce mois`
        : `↘ ${formatMoney(summary.monthBalance)} ce mois`;

    $("#balanceTrend").className =
      "kpi-trend " + (summary.monthBalance >= 0 ? "positive" : "negative");

    $("#incomeTrend").textContent = "↗ Ce mois";
    $("#expenseTrend").textContent = "↘ Ce mois";
  }

  function renderRecentTransactions(transactions) {
    const tbody = $("#recentTransactions");
    const empty = $("#recentEmpty");
    if (!tbody) return;

    const recent = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);

    tbody.innerHTML = "";

    if (!recent.length) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    recent.forEach(t => {
      const tr = document.createElement("tr");
      const sign = t.type === "income" ? "+" : "−";
      const amountClass = t.type === "income" ? "amount-income" : "amount-expense";

      tr.innerHTML = `
        <td>
          <div class="transaction-name">
            <span class="transaction-symbol">${t.type === "income" ? "↗" : "↘"}</span>
            <span>${escapeHtml(t.description)}</span>
          </div>
        </td>
        <td><span class="category-pill">${escapeHtml(t.category)}</span></td>
        <td>${formatDate(t.date)}</td>
        <td class="${amountClass}">${sign}${formatMoney(t.amount)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderChart(transactions) {
    const categories = getExpenseCategories(transactions);
    const total = categories.reduce((sum, c) => sum + c.value, 0);

    $("#chartTotal").textContent = formatMoney(total);

    const legend = $("#expenseLegend");
    legend.innerHTML = "";

    categories.slice(0, 8).forEach((item, index) => {
      const percent = total ? Math.round((item.value / total) * 100) : 0;
      const row = document.createElement("div");
      row.className = "legend-item";
      row.innerHTML = `
        <span class="legend-dot" style="background:${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}"></span>
        <span class="legend-name">${escapeHtml(item.name)}</span>
        <span class="legend-value">${percent}%</span>
      `;
      legend.appendChild(row);
    });

    if (!categories.length) {
      legend.innerHTML = `<div class="empty-state"><strong>Aucune dépense</strong><p>Le graphique apparaîtra après la première dépense.</p></div>`;
    }

    drawDonut(categories, total);
  }

  function drawDonut(categories, total) {
    const canvas = $("#expenseChart");
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const size = Math.max(280, Math.min(rect.width || 350, 350));
    const dpr = window.devicePixelRatio || 1;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * .34;
    const lineWidth = size * .17;

    ctx.clearRect(0, 0, size, size);

    if (!total) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue("--border").trim();
      ctx.stroke();
      return;
    }

    let angle = -Math.PI / 2;

    categories.forEach((item, index) => {
      const slice = (item.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, angle, angle + slice);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
      ctx.lineCap = "butt";
      ctx.stroke();
      angle += slice;
    });
  }

  function renderNotifications(notifications) {
    const list = $("#notificationList");
    const unread = notifications.filter(n => !n.read).length;
    $("#notificationDot").hidden = unread === 0;

    if (!notifications.length) {
      list.innerHTML = `<div class="empty-state"><strong>Aucune notification</strong><p>Tu es à jour.</p></div>`;
      return;
    }

    list.innerHTML = notifications.slice(0, 8).map(n => `
      <div class="notification-item">
        <div class="notification-bullet">${n.read ? "✓" : "!"}</div>
        <div>
          <strong>${escapeHtml(n.title)}</strong>
          <span>${escapeHtml(n.message)} · ${formatDate(n.date)}</span>
        </div>
      </div>
    `).join("");
  }

  function renderProfile(profileImage) {
    const image = $("#profileImage");
    const initials = $("#profileInitials");

    if (profileImage) {
      image.src = profileImage;
      image.hidden = false;
      initials.hidden = true;
    } else {
      image.hidden = true;
      initials.hidden = false;
    }
  }

  function applyTheme(theme) {
    const safeTheme = theme === "dark" ? "dark" : "light";
    document.body.dataset.theme = safeTheme;
    document.querySelectorAll(".theme-option").forEach(option => {
      option.classList.toggle("selected", option.dataset.theme === safeTheme);
    });
  }

  function setSyncStatus(text) {
    $("#syncText").textContent = text;
    $("#syncTime").textContent = `· ${new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(new Date())}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function exportCSV() {
    const data = loadData();
    const transactions = [...data.transactions]
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const summary = getSummary(transactions);
    const rows = [
      ["Budget Track — Export"],
      [],
      ["Résumé", "Valeur"],
      ["Solde actuel", summary.balance.toFixed(2)],
      ["Recettes du mois", summary.income.toFixed(2)],
      ["Dépenses du mois", summary.expense.toFixed(2)],
      [],
      ["ID", "Type", "Montant", "Catégorie", "Description", "Date"]
    ];

    transactions.forEach(t => {
      rows.push([
        t.id,
        t.type === "income" ? "Recette" : "Dépense",
        t.amount.toFixed(2),
        t.category,
        t.description,
        new Date(t.date).toISOString()
      ]);
    });

    const csv = "\uFEFF" + rows.map(row =>
      row.map(cell => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(";")
    ).join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `budget-track-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showToast("Export CSV terminé.");
  }

  let toastTimer;
  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.hidden = true, 2800);
  }

  function openSettings() {
    $("#settingsModal").hidden = false;
    applyTheme(loadData().theme);
  }

  function closeSettings() {
    $("#settingsModal").hidden = true;
  }

  function setupEvents() {
    $("#settingsBtn").addEventListener("click", openSettings);
    $("#closeSettings").addEventListener("click", closeSettings);
    $("#closeSettings2").addEventListener("click", closeSettings);

    $("#settingsModal").addEventListener("click", event => {
      if (event.target === $("#settingsModal")) closeSettings();
    });

    document.querySelectorAll(".theme-option").forEach(option => {
      option.addEventListener("click", () => {
        BudgetTrackStore.setTheme(option.dataset.theme);
        applyTheme(option.dataset.theme);
        showToast(`Thème ${option.dataset.theme === "dark" ? "sombre" : "clair"} activé.`);
      });
    });

    const notificationBtn = $("#notificationBtn");
    const notificationPanel = $("#notificationPanel");

    notificationBtn.addEventListener("click", event => {
      event.stopPropagation();
      const opening = notificationPanel.hidden;
      notificationPanel.hidden = !opening;
      notificationBtn.setAttribute("aria-expanded", String(opening));
    });

    notificationPanel.addEventListener("click", event => event.stopPropagation());

    $("#markNotificationsRead").addEventListener("click", () => {
      BudgetTrackStore.markNotificationsRead();
      showToast("Notifications marquées comme lues.");
    });

    document.addEventListener("click", () => {
      notificationPanel.hidden = true;
      notificationBtn.setAttribute("aria-expanded", "false");
    });

    $("#profileBtn").addEventListener("click", () => $("#profileInput").click());

    $("#profileInput").addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showToast("Sélectionne une image.");
        return;
      }

      if (file.size > 3 * 1024 * 1024) {
        showToast("Image trop volumineuse. Maximum conseillé : 3 Mo.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        BudgetTrackStore.setProfileImage(reader.result);
        showToast("Photo de profil mise à jour.");
      };
      reader.readAsDataURL(file);
    });

    $("#exportBtn").addEventListener("click", exportCSV);

    window.addEventListener("resize", () => renderChart(loadData().transactions));

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeSettings();
        notificationPanel.hidden = true;
      }
    });
  }

  // Initialisation.
  document.addEventListener("DOMContentLoaded", () => {
    setupEvents();
    renderAll(loadData());
  });
})();

