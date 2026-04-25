import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      brand: 'UMURAVA',
      tagline: 'Precision Talent Acquisition.',
      nav: {
        dashboard: 'Dashboard', jobs: 'Jobs', candidates: 'Candidates', screenings: 'Screenings',
        reports: 'Reports', insights: 'Precision Match', aiActivity: 'Audit Log',
        account: 'Account', team: 'Team', billing: 'Billing', help: 'Help',
        main: 'MAIN', analytics: 'ANALYTICS', settings: 'SETTINGS',
      },
      auth: {
        login: 'Log in', register: 'Sign up', email: 'Email', password: 'Password',
        confirmPassword: 'Confirm password', firstName: 'First name', lastName: 'Last name',
        forgot: 'Forgot password?', noAccount: "Don't have an account?",
        haveAccount: 'Already have an account?', continueGoogle: 'Continue with Google',
        welcome: 'Welcome back', createAccount: 'Create your account',
        verifyEmail: 'Verify your email', verifySubtitle: 'Enter the 6-digit code sent to your email',
        verify: 'Verify', resend: 'Resend code',
      },
      dashboard: {
        greeting: 'Good morning', subtitle: "Here's what's happening with your hiring today.",
        totalJobs: 'Total Jobs Posted', totalCandidates: 'Total Candidates',
        screeningsRun: 'Screenings This Month', avgMatch: 'Avg. Match Score',
        screeningActivity: 'Screening Activity', topSkills: 'Top Skills in Demand',
        scoreDist: 'Candidate Score Distribution', recentActivity: 'Recent Activity',
        postJob: 'Post New Job', uploadCandidates: 'Upload Candidates', runScreening: 'Run Screening',
      },
      common: {
        search: 'Search...', cancel: 'Cancel', save: 'Save', create: 'Create', delete: 'Delete',
        edit: 'Edit', view: 'View', export: 'Export', filter: 'Filter', loading: 'Loading...',
      },
    },
  },
  fr: {
    translation: {
      brand: 'UMURAVA', tagline: 'Acquisition de talents de précision.',
      nav: {
        dashboard: 'Tableau de bord', jobs: 'Offres', candidates: 'Candidats', screenings: 'Sélections',
        reports: 'Rapports', insights: 'Match de précision', aiActivity: 'Journal d\'audit',
        account: 'Compte', team: 'Équipe', billing: 'Facturation', help: 'Aide',
        main: 'PRINCIPAL', analytics: 'ANALYTIQUE', settings: 'PARAMÈTRES',
      },
      auth: {
        login: 'Connexion', register: "S'inscrire", email: 'E-mail', password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe', firstName: 'Prénom', lastName: 'Nom',
        forgot: 'Mot de passe oublié?', noAccount: "Vous n'avez pas de compte?",
        haveAccount: 'Déjà un compte?', continueGoogle: 'Continuer avec Google',
        welcome: 'Bon retour', createAccount: 'Créez votre compte',
        verifyEmail: 'Vérifiez votre e-mail', verifySubtitle: 'Entrez le code à 6 chiffres envoyé à votre e-mail',
        verify: 'Vérifier', resend: 'Renvoyer le code',
      },
      dashboard: {
        greeting: 'Bonjour', subtitle: "Voici ce qui se passe avec vos recrutements aujourd'hui.",
        totalJobs: "Offres d'emploi", totalCandidates: 'Candidats totaux',
        screeningsRun: 'Sélections ce mois', avgMatch: 'Score moyen',
        screeningActivity: 'Activité de sélection', topSkills: 'Compétences en demande',
        scoreDist: 'Distribution des scores', recentActivity: 'Activité récente',
        postJob: 'Publier une offre', uploadCandidates: 'Importer des candidats', runScreening: 'Lancer une sélection',
      },
      common: {
        search: 'Rechercher...', cancel: 'Annuler', save: 'Enregistrer', create: 'Créer',
        delete: 'Supprimer', edit: 'Modifier', view: 'Voir', export: 'Exporter', filter: 'Filtrer', loading: 'Chargement...',
      },
    },
  },
  rw: {
    translation: {
      brand: 'UMURAVA', tagline: 'Guhitamo Abakozi b\'Indashyikirwa.',
      nav: {
        dashboard: 'Imbonerahamwe', jobs: 'Akazi', candidates: 'Abakandida', screenings: 'Igenzura',
        reports: 'Raporo', insights: 'Igereranya ry\'Amanota', aiActivity: 'Raporo y\'Igenzura',
        account: 'Konti', team: 'Itsinda', billing: 'Kwishyura', help: 'Ubufasha',
        main: 'IBIKURU', analytics: 'ISESENGURA', settings: 'IGENAMITERERE',
      },
      auth: {
        login: 'Injira', register: 'Iyandikishe', email: 'Imeyili', password: 'Ijambobanga',
        confirmPassword: 'Emeza ijambobanga', firstName: 'Izina', lastName: 'Irindi zina',
        forgot: 'Wibagiwe ijambobanga?', noAccount: 'Ntufite konti?', haveAccount: 'Usanzwe ufite konti?',
        continueGoogle: 'Komeza na Google', welcome: 'Murakaza neza',
        createAccount: 'Fungura konti yawe', verifyEmail: 'Emeza imeyili yawe',
        verifySubtitle: 'Andika kode y\'imibare 6 yoherejwe kuri imeyili yawe',
        verify: 'Emeza', resend: 'Ohereza kode bundi',
      },
      dashboard: {
        greeting: 'Mwaramutse', subtitle: 'Dore ibibera mu gushaka abakozi bawe uyu munsi.',
        totalJobs: 'Akazi katanzwe', totalCandidates: 'Abakandida bose',
        screeningsRun: 'Igenzura uku kwezi', avgMatch: 'Ipima rusange',
        screeningActivity: 'Ibikorwa byo gusuzuma', topSkills: 'Ubumenyi bukenewe',
        scoreDist: 'Igabanya ry\'amanota', recentActivity: 'Ibikorwa biheruka',
        postJob: 'Tanga akazi gashya', uploadCandidates: 'Shyiraho abakandida', runScreening: 'Tangira gusuzuma',
      },
      common: {
        search: 'Shakisha...', cancel: 'Reka', save: 'Bika', create: 'Kora', delete: 'Siba',
        edit: 'Hindura', view: 'Reba', export: 'Sohora', filter: 'Yungurura', loading: 'Birapakira...',
      },
    },
  },
  sw: {
    translation: {
      brand: 'UMURAVA', tagline: 'Upataji wa Vipaji kwa Usahihi.',
      nav: {
        dashboard: 'Dashibodi', jobs: 'Kazi', candidates: 'Wagombea', screenings: 'Uchunguzi',
        reports: 'Ripoti', insights: 'Ulinganisho Sahihi', aiActivity: 'Kumbukumbu za Ukaguzi',
        account: 'Akaunti', team: 'Timu', billing: 'Malipo', help: 'Msaada',
        main: 'KUU', analytics: 'UCHANGANUZI', settings: 'MIPANGILIO',
      },
      auth: {
        login: 'Ingia', register: 'Jisajili', email: 'Barua pepe', password: 'Nenosiri',
        confirmPassword: 'Thibitisha nenosiri', firstName: 'Jina la kwanza', lastName: 'Jina la mwisho',
        forgot: 'Umesahau nenosiri?', noAccount: 'Huna akaunti?', haveAccount: 'Una akaunti tayari?',
        continueGoogle: 'Endelea na Google', welcome: 'Karibu tena',
        createAccount: 'Fungua akaunti yako', verifyEmail: 'Thibitisha barua pepe yako',
        verifySubtitle: 'Ingiza msimbo wa tarakimu 6 uliotumwa kwa barua pepe yako',
        verify: 'Thibitisha', resend: 'Tuma tena',
      },
      dashboard: {
        greeting: 'Habari ya asubuhi', subtitle: 'Hivi ndivyo unavyoendelea na uajiri leo.',
        totalJobs: 'Kazi Zilizotangazwa', totalCandidates: 'Wagombea Wote',
        screeningsRun: 'Uchunguzi Mwezi Huu', avgMatch: 'Wastani wa Alama',
        screeningActivity: 'Shughuli za Uchunguzi', topSkills: 'Ujuzi Unaohitajika',
        scoreDist: 'Mgawanyo wa Alama', recentActivity: 'Shughuli za Hivi Karibuni',
        postJob: 'Tangaza Kazi Mpya', uploadCandidates: 'Pakia Wagombea', runScreening: 'Anza Uchunguzi',
      },
      common: {
        search: 'Tafuta...', cancel: 'Ghairi', save: 'Hifadhi', create: 'Unda', delete: 'Futa',
        edit: 'Hariri', view: 'Tazama', export: 'Hamisha', filter: 'Chuja', loading: 'Inapakia...',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  });

export default i18n;

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];
