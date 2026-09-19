/* ==========================================================================
   BudgetTrack – Page Statistiques
   --------------------------------------------------------------------------
   Tout ce qui s'affiche (cartes, camembert, courbe, légende, sélecteur de
   mois) est CALCULÉ à partir d'une liste de transactions. Pour brancher les
   vraies données, il suffit de modifier la fonction chargerTransactions()
   (section 1). Le reste ne bouge pas.

   Format attendu d'une transaction :
     {
       date:      "2026-09-15",      // AAAA-MM-JJ
       type:      "depense",         // "depense" ou "revenu"
       categorie: "Alimentation",    // utilisé pour le camembert
       montant:   436                // nombre positif, en euros
     }

   Bibliothèques externes : aucune (les graphiques sont dessinés en SVG).
   ========================================================================== */

(() => {
  "use strict";

  /* ------------------------------------------------------------------------
     0. RÉGLAGES
     ------------------------------------------------------------------------ */
  const LOCALE = "fr-FR";
  const DEVISE = "EUR";
  const NB_MOIS_GRAPHIQUE = 6;
  const MOIS_COURTS = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

  const COULEURS_CATEGORIES = ["#0b5ed7", "#2f74e3", "#5b92ec", "#8db0f2", "#b8cef8", "#6f7fe8", "#98a4f0"];
  const COULEUR_LIGNE = "#1a56db";
  const COULEUR_TEXTE = "#0d1b5e";
  const COULEUR_GRILLE = "#dbe4f5";

  const formatEuro = new Intl.NumberFormat(LOCALE, { style: "currency", currency: DEVISE });
  const formatNombre = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0, useGrouping: false });


  /* ------------------------------------------------------------------------
     1. DONNÉES  ← C'EST ICI QU'ON BRANCHE LES VRAIES DONNÉES
     ------------------------------------------------------------------------ */

  /**
   * Renvoie la liste des transactions de l'utilisateur.
   * Pour l'instant : données d'exemple. Quand le back-end est prêt, remplacer
   * le contenu par exemple par :
   *
   *   const reponse = await fetch("/api/transactions");
   *   if (!reponse.ok) throw new Error("Erreur " + reponse.status);
   *   return await reponse.json();
   */
  async function chargerTransactions() {
    return creerDonneesExemple();
  }

  /** Données d'exemple (à supprimer une fois les vraies données branchées). */
  function creerDonneesExemple() {
    const mois = {
      "2026-04": { revenus: 2300, depenses: { Alimentation: 630, Logement: 540, Transport: 270, Loisirs: 216, "Santé": 144 } },
      "2026-05": { revenus: 2400, depenses: { Alimentation: 560, Logement: 480, Transport: 240, Loisirs: 192, "Santé": 128 } },
      "2026-06": { revenus: 2400, depenses: { Alimentation: 508, Logement: 435, Transport: 217, Loisirs: 174, "Santé": 116 } },
      "2026-07": { revenus: 2450, depenses: { Alimentation: 490, Logement: 420, Transport: 210, Loisirs: 168, "Santé": 112 } },
      "2026-08": { revenus: 2500, depenses: { Alimentation: 474, Logement: 406, Transport: 203, Loisirs: 162, "Santé": 108 } },
      "2026-09": { revenus: 2800, depenses: { Alimentation: 436, Logement: 374, Transport: 187, Loisirs: 149, "Santé": 99 } },
    };

    const transactions = [];
    for (const [cle, m] of Object.entries(mois)) {
      transactions.push({ date: `${cle}-01`, type: "revenu", categorie: "Salaire", montant: m.revenus });
      for (const [categorie, montant] of Object.entries(m.depenses)) {
        transactions.push({ date: `${cle}-15`, type: "depense", categorie, montant });
      }
    }
    return transactions;
  }


  /* ------------------------------------------------------------------------
     2. CALCULS
     ------------------------------------------------------------------------ */

  /** Regroupe les transactions par mois : Map("2026-09" → { revenus, depenses, categories }). */
  function agregerParMois(transactions) {
    const mois = new Map();
    for (const t of transactions) {
      const cle = String(t.date).slice(0, 7);
      const m = mois.get(cle) ?? { revenus: 0, depenses: 0, categories: new Map() };
      const montant = Number(t.montant) || 0;

      if (t.type === "revenu") {
        m.revenus += montant;
      } else if (t.type === "depense") {
        m.depenses += montant;
        m.categories.set(t.categorie, (m.categories.get(t.categorie) ?? 0) + montant);
      }
      mois.set(cle, m);
    }
    return mois;
  }

  /**
   * Indicateurs d'un mois. Renvoie null s'il n'y a aucune transaction ce mois-là.
   * Solde = revenus − dépenses du mois ; taux d'épargne = solde / revenus.
   */
  function calculerMois(mois, cle) {
    const m = mois.get(cle);
    if (!m) return null;
    const solde = m.revenus - m.depenses;
    return {
      revenus: m.revenus,
      depenses: m.depenses,
      solde,
      tauxEpargne: m.revenus > 0 ? Math.trunc((solde / m.revenus) * 100) : 0,
      categories: m.categories,
    };
  }

  /** Décale une clé de mois : decalerMois("2026-01", -1) → "2025-12". */
  function decalerMois(cle, decalage) {
    const [annee, numero] = cle.split("-").map(Number);
    const d = new Date(annee, numero - 1 + decalage, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  function cleMoisCourant() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  function libelleMois(cle) {
    const [annee, numero] = cle.split("-").map(Number);
    return `${MOIS_COURTS[numero - 1]} ${annee}`;
  }

  /** Texte + style de la ligne « ↑ 12% vs mois dernier ». */
  function calculerVariation(actuel, precedent, { inverse = false, enPoints = false } = {}) {
    if (precedent == null || (!enPoints && precedent === 0)) {
      return { texte: "Pas de mois précédent", classe: "" };
    }
    const ecart = enPoints ? actuel - precedent : ((actuel - precedent) / Math.abs(precedent)) * 100;
    const arrondi = Math.round(Math.abs(ecart));
    if (arrondi === 0) return { texte: "Stable vs mois dernier", classe: "" };

    const hausse = ecart > 0;
    const favorable = inverse ? !hausse : hausse; // pour les dépenses, une baisse est une bonne nouvelle
    return {
      texte: `${hausse ? "↑" : "↓"} ${arrondi}${enPoints ? " pts" : "%"} vs mois dernier`,
      classe: favorable ? "est-positive" : "est-negative",
    };
  }

  /** Catégories triées de la plus grosse à la plus petite, avec part et couleur. */
  function preparerCategories(mapCategories, totalDepenses) {
    return [...mapCategories]
      .map(([nom, montant]) => ({ nom, montant, part: totalDepenses > 0 ? montant / totalDepenses : 0 }))
      .filter((c) => c.montant > 0)
      .sort((a, b) => b.montant - a.montant)
      .map((c, i) => ({ ...c, couleur: COULEURS_CATEGORIES[i % COULEURS_CATEGORIES.length] }));
  }


  /* ------------------------------------------------------------------------
     3. OUTILS SVG
     ------------------------------------------------------------------------ */
  const NS_SVG = "http://www.w3.org/2000/svg";

  function el(nom, attributs = {}, parent = null) {
    const e = document.createElementNS(NS_SVG, nom);
    for (const [k, v] of Object.entries(attributs)) e.setAttribute(k, v);
    parent?.appendChild(e);
    return e;
  }

  function texteSvg(parent, contenu, attributs) {
    const t = el("text", { "font-family": "inherit", fill: COULEUR_TEXTE, ...attributs }, parent);
    t.textContent = contenu;
    return t;
  }

  function messageVide(texte) {
    const p = document.createElement("p");
    p.className = "stats-vide";
    p.textContent = texte;
    return p;
  }

  /** Angles en radians, 0 = haut, sens horaire. */
  function trancheDonut(cx, cy, R, r, a0, a1) {
    const point = (rayon, a) => [cx + rayon * Math.sin(a), cy - rayon * Math.cos(a)];
    const grand = a1 - a0 > Math.PI ? 1 : 0;
    const [x0, y0] = point(R, a0);
    const [x1, y1] = point(R, a1);
    const [x2, y2] = point(r, a1);
    const [x3, y3] = point(r, a0);
    return `M${x0} ${y0}A${R} ${R} 0 ${grand} 1 ${x1} ${y1}L${x2} ${y2}A${r} ${r} 0 ${grand} 0 ${x3} ${y3}Z`;
  }

  /** Pas « rond » pour les graduations (1, 2, 2.5, 5, 10 × 10^n). */
  function pasAgreable(brut) {
    const exposant = Math.floor(Math.log10(brut));
    const fraction = brut / 10 ** exposant;
    const base = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
    return base * 10 ** exposant;
  }


  /* ------------------------------------------------------------------------
     4. GRAPHIQUE : DÉPENSES PAR CATÉGORIE (anneau)
     ------------------------------------------------------------------------ */
  function dessinerAnneau(conteneur, categories) {
    conteneur.replaceChildren();
    if (categories.length === 0) {
      conteneur.append(messageVide("Aucune dépense enregistrée ce mois-ci."));
      return;
    }

    const w = conteneur.clientWidth;
    const h = conteneur.clientHeight;
    if (!w || !h) return;

    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, "aria-hidden": "true" }, conteneur);
    const cx = w / 2;
    const cy = h / 2;

    // Étiquettes avec traits de repère seulement si la place le permet
    let R = Math.min(h / 2 - 10, w / 2 - 150);
    const avecEtiquettes = w >= 440 && R >= 55;
    if (!avecEtiquettes) R = Math.min(h / 2 - 10, w / 2 - 10);
    const r = R * 0.38;

    let angle = 0;
    const tranches = categories.map((c) => {
      const debut = angle;
      angle += c.part * 2 * Math.PI;
      return { ...c, debut, fin: angle };
    });

    for (const t of tranches) {
      const fin = Math.min(t.fin, t.debut + 2 * Math.PI - 0.0005); // évite l'arc « vide » quand il n'y a qu'une catégorie
      const chemin = el("path", {
        d: trancheDonut(cx, cy, R, r, t.debut, fin),
        fill: t.couleur,
        stroke: "#fff",
        "stroke-width": 2,
        "stroke-linejoin": "round",
      }, svg);
      el("title", {}, chemin).textContent = `${t.nom} : ${formatEuro.format(t.montant)} (${Math.round(t.part * 100)}%)`;
    }

    if (!avecEtiquettes) return;

    // Étiquettes réparties à droite et à gauche, sans chevauchement
    const droite = [];
    const gauche = [];
    for (const t of tranches) {
      const milieu = (t.debut + t.fin) / 2;
      (Math.sin(milieu) >= 0 ? droite : gauche).push({ t, milieu, y: cy - (R + 4) * Math.cos(milieu) });
    }

    for (const [cote, liste] of [[1, droite], [-1, gauche]]) {
      const ECART = 20;
      const HAUT = 12;
      const BAS = h - 12;
      liste.sort((a, b) => a.y - b.y);
      liste.forEach((it, i) => { it.ty = i === 0 ? Math.max(it.y, HAUT) : Math.max(it.y, liste[i - 1].ty + ECART); });
      for (let i = liste.length - 1; i >= 0; i--) {
        const limite = i === liste.length - 1 ? BAS : liste[i + 1].ty - ECART;
        liste[i].ty = Math.min(liste[i].ty, limite);
      }

      for (const { t, milieu, ty } of liste) {
        const depart = [cx + R * Math.sin(milieu), cy - R * Math.cos(milieu)];
        const coude = [cx + cote * (R + 18), ty];
        const fin = [cx + cote * (R + 32), ty];
        el("polyline", {
          points: [depart, coude, fin].map((p) => p.join(",")).join(" "),
          fill: "none",
          stroke: COULEUR_TEXTE,
          "stroke-opacity": 0.55,
          "stroke-width": 1.2,
        }, svg);
        texteSvg(svg, `${t.nom} ${Math.round(t.part * 100)}%`, {
          x: fin[0] + cote * 6,
          y: ty,
          dy: "0.35em",
          "text-anchor": cote === 1 ? "start" : "end",
          "font-size": 14,
          "font-weight": 500,
        });
      }
    }
  }

  function remplirLegende(liste, categories) {
    liste.replaceChildren(
      ...categories.map((c) => {
        const li = document.createElement("li");
        li.style.setProperty("--couleur", c.couleur);
        li.textContent = `${c.nom} · ${formatEuro.format(c.montant)}`;
        return li;
      })
    );
  }


  /* ------------------------------------------------------------------------
     5. GRAPHIQUE : ÉVOLUTION DU SOLDE (courbe + aire)
     ------------------------------------------------------------------------ */
  function dessinerCourbe(conteneur, serie) {
    conteneur.replaceChildren();
    if (!serie.some((p) => p.donnee)) {
      conteneur.append(messageVide("Pas encore de données sur cette période."));
      return;
    }

    const w = conteneur.clientWidth;
    const h = conteneur.clientHeight;
    if (!w || !h) return;

    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, "aria-hidden": "true" }, conteneur);

    // Marges : haut = étiquettes de valeur, gauche = graduations, bas = mois
    const marge = { haut: 30, droite: 18, bas: 30, gauche: 54 };
    const gauche = marge.gauche;
    const droite = w - marge.droite;
    const haut = marge.haut;
    const bas = h - marge.bas;

    // Échelle verticale : de 0 (ou du plus petit solde s'il est négatif) à un maximum « rond »
    const valeurs = serie.map((p) => p.valeur);
    const min = Math.min(0, ...valeurs);
    const max = Math.max(0, ...valeurs);
    const pas = pasAgreable(((max - min) || 1) / 4);
    const echelleMin = Math.floor(min / pas) * pas;
    const echelleMax = Math.max(Math.ceil(max / pas) * pas, echelleMin + pas);
    const y = (v) => bas - ((v - echelleMin) / (echelleMax - echelleMin)) * (bas - haut);

    // Grille + graduations
    for (let g = echelleMin; g <= echelleMax + pas / 2; g += pas) {
      el("line", { x1: gauche, x2: droite, y1: y(g), y2: y(g), stroke: COULEUR_GRILLE, "stroke-width": 1 }, svg);
      texteSvg(svg, `${formatNombre.format(g)}€`, {
        x: gauche - 10, y: y(g), dy: "0.35em", "text-anchor": "end", "font-size": 13, fill: "#4c5a7d",
      });
    }

    // Position des points (petite marge intérieure pour ne pas coller aux bords)
    const interieur = 26;
    const n = serie.length;
    const x = (i) => (n === 1 ? (gauche + droite) / 2 : gauche + interieur + (i * (droite - gauche - 2 * interieur)) / (n - 1));
    const points = serie.map((p, i) => [x(i), y(p.valeur)]);

    // Aire sous la courbe (dégradé)
    const degrade = el("linearGradient", { id: "degrade-solde", x1: 0, y1: 0, x2: 0, y2: 1 }, el("defs", {}, svg));
    el("stop", { offset: "0%", "stop-color": COULEUR_LIGNE, "stop-opacity": 0.3 }, degrade);
    el("stop", { offset: "100%", "stop-color": COULEUR_LIGNE, "stop-opacity": 0.06 }, degrade);

    const ligneZero = y(Math.max(echelleMin, Math.min(0, echelleMax)));
    el("path", {
      d: `M${points[0][0]} ${ligneZero}` + points.map((p) => `L${p[0]} ${p[1]}`).join("") + `L${points[n - 1][0]} ${ligneZero}Z`,
      fill: "url(#degrade-solde)",
    }, svg);

    // Courbe
    el("polyline", {
      points: points.map((p) => p.join(",")).join(" "),
      fill: "none",
      stroke: COULEUR_LIGNE,
      "stroke-width": 2.5,
      "stroke-linejoin": "round",
      "stroke-linecap": "round",
    }, svg);

    // Points, valeurs et mois
    serie.forEach((p, i) => {
      const [px, py] = points[i];
      const dernier = i === n - 1;
      const cercle = el("circle", {
        cx: px, cy: py, r: dernier ? 5.5 : 3.5, fill: COULEUR_LIGNE,
        stroke: "#fff", "stroke-width": dernier ? 2 : 0,
      }, svg);
      el("title", {}, cercle).textContent = `${p.libelle} : ${formatEuro.format(p.valeur)}`;

      texteSvg(svg, `${formatNombre.format(p.valeur)}€`, {
        x: px, y: py - 12, "text-anchor": "middle", "font-size": 13, "font-weight": 500,
      });
      texteSvg(svg, p.libelle, {
        x: px, y: h - 8, "text-anchor": "middle", "font-size": 14, fill: "#4c5a7d",
      });
    });
  }


  /* ------------------------------------------------------------------------
     6. AFFICHAGE DE LA PAGE
     ------------------------------------------------------------------------ */
  const $ = (selecteur) => document.querySelector(selecteur);

  const etat = {
    mois: new Map(),   // données agrégées par mois
    cle: null,         // mois affiché, ex. "2026-09"
    categories: [],    // catégories du mois affiché
    serie: [],         // points de la courbe
  };

  function remplirSelecteurDeMois() {
    const selecteur = $("#stats-mois");
    const cles = [...etat.mois.keys()].sort().reverse(); // le plus récent en premier
    if (cles.length === 0) cles.push(cleMoisCourant());
    if (!cles.includes(etat.cle)) etat.cle = cles[0];

    selecteur.replaceChildren(...cles.map((c) => new Option(libelleMois(c), c)));
    selecteur.value = etat.cle;
  }

  function afficherCartes(actuel, precedent) {
    const vide = { revenus: 0, depenses: 0, solde: 0, tauxEpargne: 0 };
    const a = actuel ?? vide;
    const p = precedent;

    const lignes = {
      depenses: [formatEuro.format(a.depenses), calculerVariation(a.depenses, p?.depenses, { inverse: true })],
      revenus:  [formatEuro.format(a.revenus),  calculerVariation(a.revenus, p?.revenus)],
      solde:    [formatEuro.format(a.solde),    calculerVariation(a.solde, p?.solde)],
      epargne:  [`${a.tauxEpargne}%`,           calculerVariation(a.tauxEpargne, p?.tauxEpargne, { enPoints: true })],
    };

    for (const [nom, [valeur, variation]] of Object.entries(lignes)) {
      $(`[data-valeur="${nom}"]`).textContent = valeur;
      const zone = $(`[data-variation="${nom}"]`);
      zone.textContent = variation.texte;
      zone.className = `stats-variation ${variation.classe}`.trim();
    }
  }

  function calculerSerieSolde() {
    const serie = [];
    for (let i = NB_MOIS_GRAPHIQUE - 1; i >= 0; i--) {
      const cle = decalerMois(etat.cle, -i);
      const m = calculerMois(etat.mois, cle);
      serie.push({
        libelle: MOIS_COURTS[Number(cle.slice(5)) - 1],
        valeur: m ? m.solde : 0, // un mois sans transaction compte pour 0 €
        donnee: Boolean(m),
      });
    }
    return serie;
  }

  function dessinerGraphiques() {
    const zoneAnneau = $("#graphique-categories");
    const zoneCourbe = $("#graphique-solde");

    dessinerAnneau(zoneAnneau, etat.categories);
    remplirLegende($("#legende-categories"), etat.categories);
    zoneAnneau.setAttribute(
      "aria-label",
      etat.categories.length
        ? "Dépenses par catégorie : " + etat.categories.map((c) => `${c.nom} ${Math.round(c.part * 100)}%`).join(", ")
        : "Dépenses par catégorie : aucune dépense ce mois-ci"
    );

    dessinerCourbe(zoneCourbe, etat.serie);
    zoneCourbe.setAttribute(
      "aria-label",
      "Évolution du solde : " + etat.serie.map((p) => `${p.libelle} ${formatEuro.format(p.valeur)}`).join(", ")
    );

    const croissance = $("#croissance-moyenne");
    if (etat.serie.some((p) => p.donnee) && etat.serie.length > 1) {
      const moyenne = Math.round((etat.serie.at(-1).valeur - etat.serie[0].valeur) / (etat.serie.length - 1));
      croissance.textContent = `Croissance moyenne : ${moyenne >= 0 ? "+" : "−"}${formatNombre.format(Math.abs(moyenne))}€ / mois`;
    } else {
      croissance.textContent = "";
    }
  }

  function afficher() {
    const actuel = calculerMois(etat.mois, etat.cle);
    const precedent = calculerMois(etat.mois, decalerMois(etat.cle, -1));

    afficherCartes(actuel, precedent);

    etat.categories = actuel ? preparerCategories(actuel.categories, actuel.depenses) : [];
    etat.serie = calculerSerieSolde();
    dessinerGraphiques();
  }

  function definirDonnees(transactions) {
    etat.mois = agregerParMois(transactions);
    remplirSelecteurDeMois();
    afficher();
  }

  async function initialiser() {
    const zoneErreur = $("#stats-erreur");
    let transactions = [];

    try {
      transactions = await chargerTransactions();
    } catch (erreur) {
      console.error("BudgetTrack – chargement des transactions impossible :", erreur);
      zoneErreur.textContent = "Impossible de charger vos transactions. Vérifiez votre connexion puis actualisez la page.";
      zoneErreur.hidden = false;
    }

    $("#stats-mois").addEventListener("change", (evenement) => {
      etat.cle = evenement.target.value;
      afficher();
    });

    // Redessine les graphiques quand la taille de leur bloc change (rotation du téléphone, fenêtre redimensionnée…)
    const observateur = new ResizeObserver(() => dessinerGraphiques());
    observateur.observe($("#graphique-categories"));
    observateur.observe($("#graphique-solde"));

    definirDonnees(transactions);
  }

  /**
   * Pour les autres pages : après l'ajout ou la suppression d'une transaction,
   * appeler   BudgetTrackStats.mettreAJour(nouvelleListe)
   * pour rafraîchir la page Statistiques sans la recharger.
   */
  window.BudgetTrackStats = { mettreAJour: definirDonnees };

  initialiser();
})();
