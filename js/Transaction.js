const transactions = [
      { date: "2024-10-12", description: "Supermarché Carrefour", category: "Alimentation", amount: -84.50, status: "completed", icon: "🛒" },
      { date: "2024-10-11", description: "Salaire Octobre", category: "Revenus", amount: 2500, status: "completed", icon: "▥" },
      { date: "2024-10-10", description: "Netflix - Abonnement", category: "Divertissement", amount: -13.99, status: "completed", icon: "▶" },
      { date: "2024-10-09", description: "Station-service Total", category: "Transport", amount: -62.30, status: "pending", icon: "⛽" },
      { date: "2024-10-08", description: "Restaurant Le Bistrot", category: "Restauration", amount: -45.20, status: "completed", icon: "🍴" },
      { date: "2024-10-07", description: "Pharmacie Citypharma", category: "Santé", amount: -22.10, status: "failed", icon: "✚" },
      { date: "2024-10-06", description: "Loyer appartement", category: "Logement", amount: -780, status: "completed", icon: "⌂" },
      { date: "2024-10-04", description: "Cinéma Pathé", category: "Divertissement", amount: -18, status: "completed", icon: "▶" },
      { date: "2024-10-02", description: "Boulangerie du coin", category: "Alimentation", amount: -8.40, status: "completed", icon: "🥖" },
      { date: "2024-09-29", description: "Remboursement mutuelle", category: "Revenus", amount: 120, status: "completed", icon: "▥" }
    ];
    const categoryClasses = { Alimentation: "food", Revenus: "income", Divertissement: "fun", Transport: "transport", Restauration: "food", Santé: "health", Logement: "home" };
    const statusLabels = { completed: "Complété", pending: "En attente", failed: "Échoué" };
    let currentPage = 1, pageSize = 6;
    const $ = id => document.getElementById(id);
    const formatDate = value => new Date(value + "T12:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
    const formatAmount = value => `${value >= 0 ? "+" : "-"}${Math.abs(value).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} FCFA`;

    function filteredTransactions() {
      const query = $("search").value.trim().toLowerCase(), category = $("categoryFilter").value, status = $("statusFilter").value, period = $("periodFilter").value;
      const latestDate = transactions.reduce((latest, item) => item.date > latest ? item.date : latest, "");
      const cutoff = period === "all" || !latestDate ? "" : new Date(new Date(latestDate + "T12:00:00").getTime() - Number(period) * 86400000).toISOString().slice(0, 10);
      return transactions.filter(item => (!query || `${item.description} ${item.category}`.toLowerCase().includes(query)) && (!category || item.category === category) && (!status || item.status === status) && (!cutoff || item.date >= cutoff));
    }
    function render() {
      const results = filteredTransactions(), totalPages = Math.max(1, Math.ceil(results.length / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;
      const visible = results.slice((currentPage - 1) * pageSize, currentPage * pageSize);
      $("transactionRows").innerHTML = visible.length ? visible.map(item => `<tr>
        <td>${formatDate(item.date)}</td><td><div class="description"><span class="category-icon ${categoryClasses[item.category] || "fun"}">${item.icon || "•"}</span>${item.description}</div></td>
        <td><span class="tag ${categoryClasses[item.category] || "fun"}">${item.category}</span></td><td class="amount ${item.amount >= 0 ? "positive" : "negative"}">${formatAmount(item.amount)}</td>
        <td><span class="status ${item.status}">${statusLabels[item.status]}</span></td><td><button class="more" aria-label="Actions pour ${item.description}" title="Supprimer" data-remove="${transactions.indexOf(item)}">•••</button></td></tr>`).join("") : `<tr><td colspan="6"><div class="empty">Aucune transaction ne correspond à votre recherche.</div></td></tr>`;
      $("resultCount").textContent = results.length ? `Affichage de ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, results.length)} sur ${results.length} transaction${results.length > 1 ? "s" : ""}` : "0 transaction";
      $("pagination").innerHTML = Array.from({ length: totalPages }, (_, i) => `<button class="page-btn ${i + 1 === currentPage ? "active" : ""}" data-page="${i + 1}">${i + 1}</button>`).join("");
    }
    ["search", "categoryFilter", "statusFilter", "periodFilter"].forEach(id => $(id).addEventListener("input", () => { currentPage = 1; render(); }));
    $("resetButton").addEventListener("click", () => { $("search").value = ""; $("categoryFilter").value = ""; $("statusFilter").value = ""; $("periodFilter").value = "all"; currentPage = 1; render(); });
    $("filterButton").addEventListener("click", () => { currentPage = 1; render(); });
    $("pagination").addEventListener("click", event => { if (event.target.dataset.page) { currentPage = Number(event.target.dataset.page); render(); } });
    $("transactionRows").addEventListener("click", event => { const index = event.target.dataset.remove; if (index !== undefined && confirm("Supprimer cette transaction ?")) { transactions.splice(Number(index), 1); render(); } });
    function toggleModal(open) { $("modalBackdrop").classList.toggle("open", open); if (open) { $("newDate").value = new Date().toISOString().slice(0, 10); $("newDescription").focus(); } }
    $("openModal").addEventListener("click", () => toggleModal(true)); $("closeModal").addEventListener("click", () => toggleModal(false)); $("cancelModal").addEventListener("click", () => toggleModal(false));
    $("modalBackdrop").addEventListener("click", event => { if (event.target === $("modalBackdrop")) toggleModal(false); });
    $("newAmount").addEventListener("input", event => { const amount = Number(event.target.value); event.target.setCustomValidity(Number.isFinite(amount) && amount !== 0 ? "" : "Saisissez un montant différent de zéro."); });
    $("transactionForm").addEventListener("submit", event => { event.preventDefault(); if (!event.target.reportValidity()) return; const amount = Number($("newAmount").value); transactions.unshift({ date: $("newDate").value, description: $("newDescription").value.trim(), category: $("newCategory").value, amount, status: $("newStatus").value, icon: categoryClasses[$("newCategory").value] === "income" ? "▥" : "•" }); event.target.reset(); toggleModal(false); currentPage = 1; render(); });
    render();

   
