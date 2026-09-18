/*RÉCUPÉRATION DES ÉLÉMENTS */

const btnFonctionnalites =
    document.getElementById("btn-fonctionnalites");

const menuFonctionnalites =
    document.getElementById("menu-fonctionnalites");

const btnLangue =
    document.getElementById("btn-langue");

const menuLangue =
    document.getElementById("menu-langue");

const modalConnexion =
    document.getElementById("modal-connexion");

const modalInscription =
    document.getElementById("modal-inscription");

const btnConnexion =
    document.getElementById("btn-connexion");

const btnInscription =
    document.getElementById("btn-inscription");

const heroConnexion =
    document.getElementById("hero-connexion");

const heroInscription =
    document.getElementById("hero-inscription");

const fermerConnexion =
    document.getElementById("fermer-connexion");

const fermerInscription =
    document.getElementById("fermer-inscription");

const passerInscription =
    document.getElementById("passer-inscription");

const passerConnexion =
    document.getElementById("passer-connexion");


/*MENU FONCTIONNALITÉS*/

btnFonctionnalites.addEventListener("click", function (event) {

    event.stopPropagation();

    menuFonctionnalites.classList.toggle("active");

    // Fermer le menu langue
    menuLangue.classList.remove("active");

});

/*MENU LANGUE*/

btnLangue.addEventListener("click", function (event) {

    event.stopPropagation();

    menuLangue.classList.toggle("active");

    // Fermer le menu fonctionnalités
    menuFonctionnalites.classList.remove("active");

});

/*FERMER LES MENUS EN CLIQUANT AILLEURS*/

document.addEventListener("click", function () {

    menuFonctionnalites.classList.remove("active");

    menuLangue.classList.remove("active");

});

/*OUVRIR LA CONNEXION */

function ouvrirConnexion() {

    modalInscription.classList.remove("active");

    modalConnexion.classList.add("active");

    document.body.style.overflow = "hidden";

}

/*OUVRIR L'INSCRIPTION*/

function ouvrirInscription() {

    modalConnexion.classList.remove("active");

    modalInscription.classList.add("active");

    document.body.style.overflow = "hidden";

}

/* FERMER LES MODALES*/

function fermerToutesLesModales() {

    modalConnexion.classList.remove("active");

    modalInscription.classList.remove("active");

    document.body.style.overflow = "";

}

/*BOUTONS CONNEXION */

btnConnexion.addEventListener(
    "click",
    ouvrirConnexion
);


heroConnexion.addEventListener(
    "click",
    ouvrirConnexion
);

/* BOUTONS INSCRIPTION */

btnInscription.addEventListener(
    "click",
    ouvrirInscription
);

heroInscription.addEventListener(
    "click",
    ouvrirInscription
);


/*FERMETURE CONNEXION */

fermerConnexion.addEventListener(
    "click",
    fermerToutesLesModales
);


/*FERMETURE INSCRIPTION */

fermerInscription.addEventListener(
    "click",
    fermerToutesLesModales
);


/*PASSER DE CONNEXION À INSCRIPTION*/

passerInscription.addEventListener(
    "click",
    ouvrirInscription
);


/*PASSER D'INSCRIPTION À CONNEXION*/

passerConnexion.addEventListener(
    "click",
    ouvrirConnexion
);


/*FERMER EN CLIQUANT SUR L'ARRIÈRE-PLAN*/

modalConnexion.addEventListener(
    "click",
    function (event) {

        if (event.target === modalConnexion) {

            fermerToutesLesModales();

        }

    }
);


modalInscription.addEventListener(
    "click",
    function (event) {

        if (event.target === modalInscription) {

            fermerToutesLesModales();

        }

    }
);

/*TOUCHE ESCAPE POUR FERMER*/

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            fermerToutesLesModales();

            menuFonctionnalites.classList.remove("active");

            menuLangue.classList.remove("active");

        }

    }
);


/*LIENS DES FONCTIONNALITÉS*/

const liensFonctionnalites =
    document.querySelectorAll(
        "#menu-fonctionnalites a"
    );

liensFonctionnalites.forEach(function (lien) {

    lien.addEventListener(
        "click",
        function () {

            menuFonctionnalites.classList.remove(
                "active"
            );

        }
    );

});

/*TRADUCTION DU SITE */

const langues = document.querySelectorAll("#menu-langue button");

const traductions = {
    fr: {
        nom: "Français",
        htmlLang: "fr",
        titre: "BudgetTrack - Gestion du budget étudiant",
        textes: {
            "nav > a:nth-of-type(1)": "Accueil",
            "#btn-fonctionnalites": "Fonctionnalités <span class=\"fleche\">▼</span>",
            "#menu-fonctionnalites a:nth-child(1)": "📊 Dashboard",
            "#menu-fonctionnalites a:nth-child(2)": "💳 Transactions",
            "#menu-fonctionnalites a:nth-child(3)": "📈 Statistiques",
            "#menu-fonctionnalites a:nth-child(4)": "💰 Budget",
            "#menu-fonctionnalites a:nth-child(5)": "⌛ Épargne",
            "nav > a:nth-of-type(2)": "À propos",
            "nav > a:nth-of-type(3)": "Contact",
            "#btn-connexion": "Se connecter",
            "#btn-inscription": "S'inscrire",
            ".hero-label": "Votre budget étudiant, simplement",
            ".hero h1": "Gérez votre budget<br>étudiant <span>simplement.</span>",
            ".hero-description": "Suivez vos revenus, vos dépenses,<br>votre budget et votre épargne depuis un seul endroit.",
            "#hero-connexion": "Se connecter",
            "#hero-inscription": "S'inscrire",
            ".features-section .section-header h2": "Nos fonctionnalités",
            ".features-section .section-header p": "Découvrez les outils proposés par BudgetTrack<br>pour gérer votre budget étudiant.",
            "#dashboard h3": "Dashboard",
            "#dashboard p": "Consultez rapidement votre solde,<br>vos revenus et vos dépenses.",
            "#transactions h3": "Transactions",
            "#transactions p": "Enregistrez et consultez vos revenus<br>et vos dépenses.",
            "#statistiques h3": "Statistiques",
            "#statistiques p": "Visualisez l'évolution de vos dépenses<br>et de votre budget.",
            "#budget h3": "Budget",
            "#budget p": "Définissez votre budget mensuel<br>et suivez votre consommation.",
            "#epargne h3": "Épargne",
            "#epargne p": "Définissez votre objectif d'épargne<br>et suivez votre progression.",
            ".about-section h2": "À propos de BudgetTrack",
            ".about-section p": "BudgetTrack est une solution simple<br>destinée aux étudiants pour les aider<br>à mieux organiser leurs finances<br>quotidiennes.",
            ".contact-section h2": "Contactez-nous",
            ".contact-section .section-header p": "Une question ou une suggestion ?<br>N'hésitez pas à nous contacter.",
            ".contact-item:first-child h3": "Téléphone",
            ".contact-item:nth-child(2) h3": "E-mail",
            ".footer-logo p": "Gestion simple du budget étudiant.",
            ".footer-links a:nth-child(1)": "Accueil",
            ".footer-links a:nth-child(2)": "Fonctionnalités",
            ".footer-links a:nth-child(3)": "À propos",
            ".footer-links a:nth-child(4)": "Contact",
            ".footer-bottom p": "© 2026 BudgetTrack.<br>Tous droits réservés.",
            "#modal-connexion h2": "Se connecter",
            "#modal-connexion .modal-description": "Connectez-vous à votre compte BudgetTrack.",
            "#modal-connexion label[for='email-connexion']": "Adresse e-mail",
            "#modal-connexion label[for='password-connexion']": "Mot de passe",
            "#modal-connexion button[type='submit']": "Se connecter",
            "#modal-connexion .modal-switch": "Vous n'avez pas encore de compte ? <button type=\"button\" id=\"passer-inscription\">S'inscrire</button>",
            "#modal-inscription h2": "Créer un compte",
            "#modal-inscription .modal-description": "Créez votre compte BudgetTrack.",
            "#modal-inscription label[for='nom']": "Nom",
            "#modal-inscription label[for='prenom']": "Prénom",
            "#modal-inscription label[for='email-inscription']": "Adresse e-mail",
            "#modal-inscription label[for='password-inscription']": "Mot de passe",
            "#modal-inscription label[for='confirmation-password']": "Confirmer le mot de passe",
            "#modal-inscription button[type='submit']": "Créer mon compte",
            "#modal-inscription .modal-switch": "Vous avez déjà un compte ? <button type=\"button\" id=\"passer-connexion\">Se connecter</button>"
        },
        attributs: {
            "#email-connexion": ["placeholder", "Votre adresse e-mail"],
            "#password-connexion": ["placeholder", "Votre mot de passe"],
            "#nom": ["placeholder", "Votre nom"],
            "#prenom": ["placeholder", "Votre prénom"],
            "#email-inscription": ["placeholder", "Votre adresse e-mail"],
            "#password-inscription": ["placeholder", "Créer un mot de passe"],
            "#confirmation-password": ["placeholder", "Confirmer le mot de passe"],
            ".logo": ["alt", "Logo BudgetTrack"],
            ".hero-image img": ["alt", "Aperçu du dashboard BudgetTrack"],
            "#dashboard img": ["alt", "Aperçu du dashboard"],
            "#transactions img": ["alt", "Aperçu des transactions"],
            "#statistiques img": ["alt", "Aperçu des statistiques"],
            "#budget img": ["alt", "Aperçu de la gestion du budget"],
            "#epargne img": ["alt", "Aperçu de la gestion de l'épargne"],
            "meta[name='description']": ["content", "BudgetTrack - Gestion simple du budget étudiant"]
        }
    },
    en: {
        nom: "English",
        htmlLang: "en",
        titre: "BudgetTrack - Student Budget Management",
        textes: {
            "nav > a:nth-of-type(1)": "Home",
            "#btn-fonctionnalites": "Features <span class=\"fleche\">▼</span>",
            "#menu-fonctionnalites a:nth-child(1)": "📊 Dashboard",
            "#menu-fonctionnalites a:nth-child(2)": "💳 Transactions",
            "#menu-fonctionnalites a:nth-child(3)": "📈 Statistics",
            "#menu-fonctionnalites a:nth-child(4)": "💰 Budget",
            "#menu-fonctionnalites a:nth-child(5)": "⌛ Savings",
            "nav > a:nth-of-type(2)": "About",
            "nav > a:nth-of-type(3)": "Contact",
            "#btn-connexion": "Log in",
            "#btn-inscription": "Sign up",
            ".hero-label": "Your student budget, made simple",
            ".hero h1": "Manage your<br>student <span>budget simply.</span>",
            ".hero-description": "Track your income, expenses,<br>budget and savings in one place.",
            "#hero-connexion": "Log in",
            "#hero-inscription": "Sign up",
            ".features-section .section-header h2": "Our features",
            ".features-section .section-header p": "Discover the tools offered by BudgetTrack<br>to manage your student budget.",
            "#dashboard h3": "Dashboard",
            "#dashboard p": "Quickly check your balance,<br>income and expenses.",
            "#transactions h3": "Transactions",
            "#transactions p": "Record and review your income<br>and expenses.",
            "#statistiques h3": "Statistics",
            "#statistiques p": "Track changes in your expenses<br>and budget.",
            "#budget h3": "Budget",
            "#budget p": "Set your monthly budget<br>and track your spending.",
            "#epargne h3": "Savings",
            "#epargne p": "Set a savings goal<br>and track your progress.",
            ".about-section h2": "About BudgetTrack",
            ".about-section p": "BudgetTrack is a simple solution<br>designed to help students<br>better organize their daily finances.",
            ".contact-section h2": "Contact us",
            ".contact-section .section-header p": "Have a question or suggestion?<br>Feel free to contact us.",
            ".contact-item:first-child h3": "Phone",
            ".contact-item:nth-child(2) h3": "Email",
            ".footer-logo p": "Simple student budget management.",
            ".footer-links a:nth-child(1)": "Home",
            ".footer-links a:nth-child(2)": "Features",
            ".footer-links a:nth-child(3)": "About",
            ".footer-links a:nth-child(4)": "Contact",
            ".footer-bottom p": "© 2026 BudgetTrack.<br>All rights reserved.",
            "#modal-connexion h2": "Log in",
            "#modal-connexion .modal-description": "Log in to your BudgetTrack account.",
            "#modal-connexion label[for='email-connexion']": "Email address",
            "#modal-connexion label[for='password-connexion']": "Password",
            "#modal-connexion button[type='submit']": "Log in",
            "#modal-connexion .modal-switch": "Don't have an account yet? <button type=\"button\" id=\"passer-inscription\">Sign up</button>",
            "#modal-inscription h2": "Create an account",
            "#modal-inscription .modal-description": "Create your BudgetTrack account.",
            "#modal-inscription label[for='nom']": "Last name",
            "#modal-inscription label[for='prenom']": "First name",
            "#modal-inscription label[for='email-inscription']": "Email address",
            "#modal-inscription label[for='password-inscription']": "Password",
            "#modal-inscription label[for='confirmation-password']": "Confirm password",
            "#modal-inscription button[type='submit']": "Create my account",
            "#modal-inscription .modal-switch": "Already have an account? <button type=\"button\" id=\"passer-connexion\">Log in</button>"
        },
        attributs: {
            "#email-connexion": ["placeholder", "Your email address"],
            "#password-connexion": ["placeholder", "Your password"],
            "#nom": ["placeholder", "Your last name"],
            "#prenom": ["placeholder", "Your first name"],
            "#email-inscription": ["placeholder", "Your email address"],
            "#password-inscription": ["placeholder", "Create a password"],
            "#confirmation-password": ["placeholder", "Confirm your password"],
            ".logo": ["alt", "BudgetTrack logo"],
            ".hero-image img": ["alt", "BudgetTrack dashboard preview"],
            "#dashboard img": ["alt", "Dashboard preview"],
            "#transactions img": ["alt", "Transactions preview"],
            "#statistiques img": ["alt", "Statistics preview"],
            "#budget img": ["alt", "Budget management preview"],
            "#epargne img": ["alt", "Savings management preview"],
            "meta[name='description']": ["content", "BudgetTrack - Simple student budget management"]
        }
    },
    es: {
        nom: "Español",
        htmlLang: "es",
        titre: "BudgetTrack - Gestión del presupuesto estudiantil",
        textes: {
            "nav > a:nth-of-type(1)": "Inicio",
            "#btn-fonctionnalites": "Funciones <span class=\"fleche\">▼</span>",
            "#menu-fonctionnalites a:nth-child(1)": "📊 Panel",
            "#menu-fonctionnalites a:nth-child(2)": "💳 Transacciones",
            "#menu-fonctionnalites a:nth-child(3)": "📈 Estadísticas",
            "#menu-fonctionnalites a:nth-child(4)": "💰 Presupuesto",
            "#menu-fonctionnalites a:nth-child(5)": "⌛ Ahorros",
            "nav > a:nth-of-type(2)": "Acerca de",
            "nav > a:nth-of-type(3)": "Contacto",
            "#btn-connexion": "Iniciar sesión",
            "#btn-inscription": "Registrarse",
            ".hero-label": "Tu presupuesto estudiantil, de forma sencilla",
            ".hero h1": "Gestiona tu presupuesto<br>estudiantil <span>fácilmente.</span>",
            ".hero-description": "Controla tus ingresos, gastos,<br>presupuesto y ahorros desde un solo lugar.",
            "#hero-connexion": "Iniciar sesión",
            "#hero-inscription": "Registrarse",
            ".features-section .section-header h2": "Nuestras funciones",
            ".features-section .section-header p": "Descubre las herramientas de BudgetTrack<br>para gestionar tu presupuesto estudiantil.",
            "#dashboard h3": "Panel",
            "#dashboard p": "Consulta rápidamente tu saldo,<br>ingresos y gastos.",
            "#transactions h3": "Transacciones",
            "#transactions p": "Registra y consulta tus ingresos<br>y gastos.",
            "#statistiques h3": "Estadísticas",
            "#statistiques p": "Visualiza la evolución de tus gastos<br>y tu presupuesto.",
            "#budget h3": "Presupuesto",
            "#budget p": "Define tu presupuesto mensual<br>y controla tu consumo.",
            "#epargne h3": "Ahorros",
            "#epargne p": "Define un objetivo de ahorro<br>y sigue tu progreso.",
            ".about-section h2": "Acerca de BudgetTrack",
            ".about-section p": "BudgetTrack es una solución sencilla<br>para ayudar a los estudiantes<br>a organizar mejor sus finanzas diarias.",
            ".contact-section h2": "Contáctanos",
            ".contact-section .section-header p": "¿Tienes una pregunta o sugerencia?<br>No dudes en contactarnos.",
            ".contact-item:first-child h3": "Teléfono",
            ".contact-item:nth-child(2) h3": "Correo electrónico",
            ".footer-logo p": "Gestión sencilla del presupuesto estudiantil.",
            ".footer-links a:nth-child(1)": "Inicio",
            ".footer-links a:nth-child(2)": "Funciones",
            ".footer-links a:nth-child(3)": "Acerca de",
            ".footer-links a:nth-child(4)": "Contacto",
            ".footer-bottom p": "© 2026 BudgetTrack.<br>Todos los derechos reservados.",
            "#modal-connexion h2": "Iniciar sesión",
            "#modal-connexion .modal-description": "Inicia sesión en tu cuenta de BudgetTrack.",
            "#modal-connexion label[for='email-connexion']": "Correo electrónico",
            "#modal-connexion label[for='password-connexion']": "Contraseña",
            "#modal-connexion button[type='submit']": "Iniciar sesión",
            "#modal-connexion .modal-switch": "¿Aún no tienes una cuenta? <button type=\"button\" id=\"passer-inscription\">Registrarse</button>",
            "#modal-inscription h2": "Crear una cuenta",
            "#modal-inscription .modal-description": "Crea tu cuenta de BudgetTrack.",
            "#modal-inscription label[for='nom']": "Apellido",
            "#modal-inscription label[for='prenom']": "Nombre",
            "#modal-inscription label[for='email-inscription']": "Correo electrónico",
            "#modal-inscription label[for='password-inscription']": "Contraseña",
            "#modal-inscription label[for='confirmation-password']": "Confirmar contraseña",
            "#modal-inscription button[type='submit']": "Crear mi cuenta",
            "#modal-inscription .modal-switch": "¿Ya tienes una cuenta? <button type=\"button\" id=\"passer-connexion\">Iniciar sesión</button>"
        },
        attributs: {
            "#email-connexion": ["placeholder", "Tu correo electrónico"],
            "#password-connexion": ["placeholder", "Tu contraseña"],
            "#nom": ["placeholder", "Tu apellido"],
            "#prenom": ["placeholder", "Tu nombre"],
            "#email-inscription": ["placeholder", "Tu correo electrónico"],
            "#password-inscription": ["placeholder", "Crea una contraseña"],
            "#confirmation-password": ["placeholder", "Confirma la contraseña"],
            ".logo": ["alt", "Logotipo de BudgetTrack"],
            ".hero-image img": ["alt", "Vista previa del panel de BudgetTrack"],
            "#dashboard img": ["alt", "Vista previa del panel"],
            "#transactions img": ["alt", "Vista previa de las transacciones"],
            "#statistiques img": ["alt", "Vista previa de las estadísticas"],
            "#budget img": ["alt", "Vista previa de la gestión del presupuesto"],
            "#epargne img": ["alt", "Vista previa de la gestión de los ahorros"],
            "meta[name='description']": ["content", "BudgetTrack - Gestión sencilla del presupuesto estudiantil"]
        }
    }
};

function appliquerLangue(code) {
    const traduction = traductions[code] || traductions.fr;

    Object.entries(traduction.textes).forEach(function ([selecteur, texte]) {
        const element = document.querySelector(selecteur);

        if (element) {
            element.innerHTML = texte;
        }
    });

    Object.entries(traduction.attributs).forEach(function ([selecteur, attribut]) {
        const element = document.querySelector(selecteur);

        if (element) {
            element.setAttribute(attribut[0], attribut[1]);
        }
    });

    document.documentElement.lang = traduction.htmlLang;
    document.title = traduction.titre;
    btnLangue.innerHTML = "🌐 " + traduction.nom + " <span>▼</span>";
    menuLangue.classList.remove("active");

    const nouveauPasserInscription =
        document.getElementById("passer-inscription");
    const nouveauPasserConnexion =
        document.getElementById("passer-connexion");

    if (nouveauPasserInscription) {
        nouveauPasserInscription.addEventListener("click", ouvrirInscription);
    }

    if (nouveauPasserConnexion) {
        nouveauPasserConnexion.addEventListener("click", ouvrirConnexion);
    }

    localStorage.setItem("budgetTrackLangue", code);
}

langues.forEach(function (langue, index) {
    langue.addEventListener("click", function () {
        const codes = ["fr", "en", "es"];
        appliquerLangue(codes[index] || "fr");
    });
});

const langueEnregistree = localStorage.getItem("budgetTrackLangue");
appliquerLangue(traductions[langueEnregistree] ? langueEnregistree : "fr");
