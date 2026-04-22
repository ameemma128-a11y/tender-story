import { createContext, useContext, useState, ReactNode } from "react";

export type UILang = "en" | "fr" | "es" | "pt" | "ko" | "ja" | "ar" | "de" | "it";

export const UI_LANGUAGES: { id: UILang; label: string; native: string }[] = [
  { id: "en", label: "English", native: "English" },
  { id: "fr", label: "French", native: "Français" },
  { id: "es", label: "Spanish", native: "Español" },
  { id: "pt", label: "Portuguese", native: "Português" },
  { id: "ko", label: "Korean", native: "한국어" },
  { id: "ja", label: "Japanese", native: "日本語" },
  { id: "ar", label: "Arabic", native: "العربية" },
  { id: "de", label: "German", native: "Deutsch" },
  { id: "it", label: "Italian", native: "Italiano" },
];

type Translations = Record<string, string>;

const TRANSLATIONS: Record<UILang, Translations> = {
  en: {
    library: "Library", write: "Write", exit: "Exit", enter: "Enter",
    tagline: "Every imagination deserves to be written.",
    cta: "Begin your story", cta2: "Create your story",
    how: "How it works", steps: "Three simple steps.",
    steps_sub: "One story made for you.",
    s1_title: "Pick a world", s1_desc: "Choose a genre that sparks you — from royal romance to fantasy academies.",
    s2_title: "Bring your characters", s2_desc: "Real, fictional, or somewhere in between. Build the cast you want to read about.",
    s3_title: "Read your story", s3_desc: "An immersive scene, written for you in seconds. Save it, share it, keep it forever.",
    closing: "Your next story is", closing_bold: "waiting.",
    closing_sub: "Bring your imagination to the page. It only takes a few seconds.",
    bookshelf: "Bookshelf", bookshelf_sub: "Every story you've written, kept close.",
    new_story: "Write a new story", empty: "Your shelf is empty.", write_first: "Write your first",
    sign_in: "Sign in to your account", create_account: "Create an account",
    email: "Email", password: "Password", loading: "Loading…",
  },
  fr: {
    library: "Bibliothèque", write: "Écrire", exit: "Quitter", enter: "Entrer",
    tagline: "Chaque imagination mérite d'être écrite.",
    cta: "Commencer mon histoire", cta2: "Créer mon histoire",
    how: "Comment ça marche", steps: "Trois étapes simples.",
    steps_sub: "Une histoire écrite pour vous.",
    s1_title: "Choisir un univers", s1_desc: "Sélectionnez un genre — de la romance royale aux académies fantastiques.",
    s2_title: "Vos personnages", s2_desc: "Réels, fictifs ou quelque part entre les deux. Construisez le casting que vous voulez lire.",
    s3_title: "Lire votre histoire", s3_desc: "Une scène immersive, écrite pour vous en quelques secondes. Sauvegardez-la, partagez-la.",
    closing: "Votre prochaine histoire vous", closing_bold: "attend.",
    closing_sub: "Donnez vie à votre imagination. Cela ne prend que quelques secondes.",
    bookshelf: "Bibliothèque", bookshelf_sub: "Toutes vos histoires, toujours proches.",
    new_story: "Écrire une nouvelle histoire", empty: "Votre bibliothèque est vide.", write_first: "Écrire la première",
    sign_in: "Connexion à votre compte", create_account: "Créer un compte",
    email: "Email", password: "Mot de passe", loading: "Chargement…",
  },
  es: {
    library: "Biblioteca", write: "Escribir", exit: "Salir", enter: "Entrar",
    tagline: "Cada imaginación merece ser escrita.",
    cta: "Comenzar mi historia", cta2: "Crear mi historia",
    how: "Cómo funciona", steps: "Tres pasos simples.",
    steps_sub: "Una historia hecha para ti.",
    s1_title: "Elige un mundo", s1_desc: "Elige un género que te inspire — desde romance real hasta academias de fantasía.",
    s2_title: "Tus personajes", s2_desc: "Reales, ficticios o algo intermedio. Construye el elenco que quieres leer.",
    s3_title: "Lee tu historia", s3_desc: "Una escena inmersiva, escrita para ti en segundos. Guárdala, compártela.",
    closing: "Tu próxima historia te", closing_bold: "espera.",
    closing_sub: "Dale vida a tu imaginación. Solo toma unos segundos.",
    bookshelf: "Biblioteca", bookshelf_sub: "Cada historia que has escrito, siempre cerca.",
    new_story: "Escribir una nueva historia", empty: "Tu biblioteca está vacía.", write_first: "Escribir la primera",
    sign_in: "Inicia sesión en tu cuenta", create_account: "Crear una cuenta",
    email: "Email", password: "Contraseña", loading: "Cargando…",
  },
  pt: {
    library: "Biblioteca", write: "Escrever", exit: "Sair", enter: "Entrar",
    tagline: "Cada imaginação merece ser escrita.",
    cta: "Começar minha história", cta2: "Criar minha história",
    how: "Como funciona", steps: "Três passos simples.",
    steps_sub: "Uma história feita para você.",
    s1_title: "Escolha um mundo", s1_desc: "Escolha um gênero que te inspire — do romance real às academias de fantasia.",
    s2_title: "Seus personagens", s2_desc: "Reais, fictícios ou algo no meio. Monte o elenco que você quer ler.",
    s3_title: "Leia sua história", s3_desc: "Uma cena imersiva, escrita para você em segundos. Salve, compartilhe.",
    closing: "Sua próxima história está", closing_bold: "esperando.",
    closing_sub: "Dê vida à sua imaginação. Leva apenas alguns segundos.",
    bookshelf: "Biblioteca", bookshelf_sub: "Cada história que você escreveu, sempre perto.",
    new_story: "Escrever uma nova história", empty: "Sua biblioteca está vazia.", write_first: "Escrever a primeira",
    sign_in: "Entre na sua conta", create_account: "Criar uma conta",
    email: "Email", password: "Senha", loading: "Carregando…",
  },
  ko: {
    library: "서재", write: "쓰기", exit: "나가기", enter: "입장",
    tagline: "모든 상상은 글로 쓰일 자격이 있습니다.",
    cta: "내 이야기 시작하기", cta2: "내 이야기 만들기",
    how: "이용 방법", steps: "세 가지 간단한 단계.",
    steps_sub: "당신만을 위한 이야기.",
    s1_title: "세계 선택", s1_desc: "장르를 선택하세요 — 로맨스부터 판타지 아카데미까지.",
    s2_title: "캐릭터 소개", s2_desc: "실제이든 가상이든. 읽고 싶은 캐스팅을 구성하세요.",
    s3_title: "이야기 읽기", s3_desc: "몇 초 만에 당신을 위해 쓰인 몰입감 있는 장면. 저장하고 공유하세요.",
    closing: "다음 이야기가 당신을", closing_bold: "기다립니다.",
    closing_sub: "상상력을 글로 옮겨보세요. 단 몇 초면 됩니다.",
    bookshelf: "서재", bookshelf_sub: "당신이 쓴 모든 이야기, 항상 가까이.",
    new_story: "새 이야기 쓰기", empty: "서재가 비어 있습니다.", write_first: "첫 번째 이야기 쓰기",
    sign_in: "계정에 로그인", create_account: "계정 만들기",
    email: "이메일", password: "비밀번호", loading: "로딩 중…",
  },
  ja: {
    library: "書架", write: "書く", exit: "退出", enter: "入る",
    tagline: "すべての想像は、書かれる価値がある。",
    cta: "物語を始める", cta2: "物語を作る",
    how: "使い方", steps: "シンプルな3ステップ。",
    steps_sub: "あなたのための物語。",
    s1_title: "世界を選ぶ", s1_desc: "ジャンルを選んでください — ロマンスからファンタジーアカデミーまで。",
    s2_title: "キャラクターを連れてくる", s2_desc: "実在、架空、どちらでも。読みたいキャストを作りましょう。",
    s3_title: "物語を読む", s3_desc: "数秒であなたのために書かれた没入感のある場面。保存して共有しましょう。",
    closing: "次の物語が", closing_bold: "待っています。",
    closing_sub: "想像力をページに込めましょう。ほんの数秒でできます。",
    bookshelf: "書架", bookshelf_sub: "書いたすべての物語を、いつでも手元に。",
    new_story: "新しい物語を書く", empty: "書架は空です。", write_first: "最初の物語を書く",
    sign_in: "アカウントにサインイン", create_account: "アカウントを作成",
    email: "メール", password: "パスワード", loading: "読み込み中…",
  },
  ar: {
    library: "المكتبة", write: "اكتب", exit: "خروج", enter: "دخول",
    tagline: "كل خيال يستحق أن يُكتب.",
    cta: "ابدأ قصتي", cta2: "أنشئ قصتي",
    how: "كيف يعمل", steps: "ثلاث خطوات بسيطة.",
    steps_sub: "قصة مصنوعة لك.",
    s1_title: "اختر عالماً", s1_desc: "اختر نوعاً يلهمك — من رومانسية ملكية إلى أكاديميات الخيال.",
    s2_title: "أحضر شخصياتك", s2_desc: "حقيقيون أو خياليون. ابنِ الطاقم الذي تريد قراءته.",
    s3_title: "اقرأ قصتك", s3_desc: "مشهد غامر، مكتوب لك في ثوانٍ. احفظه وشاركه.",
    closing: "قصتك التالية", closing_bold: "تنتظرك.",
    closing_sub: "أعطِ خيالك صوتاً. لا يستغرق سوى ثوانٍ.",
    bookshelf: "رف الكتب", bookshelf_sub: "كل قصة كتبتها، دائماً في متناولك.",
    new_story: "اكتب قصة جديدة", empty: "رفك فارغ.", write_first: "اكتب أولى قصصك",
    sign_in: "تسجيل الدخول", create_account: "إنشاء حساب",
    email: "البريد الإلكتروني", password: "كلمة المرور", loading: "جاري التحميل…",
  },
  de: {
    library: "Bibliothek", write: "Schreiben", exit: "Abmelden", enter: "Eintreten",
    tagline: "Jede Vorstellung verdient es, geschrieben zu werden.",
    cta: "Meine Geschichte beginnen", cta2: "Meine Geschichte erstellen",
    how: "So funktioniert es", steps: "Drei einfache Schritte.",
    steps_sub: "Eine Geschichte, gemacht für dich.",
    s1_title: "Wähle eine Welt", s1_desc: "Wähle ein Genre — von royaler Romanze bis zur Fantasy-Akademie.",
    s2_title: "Bringe deine Charaktere", s2_desc: "Real, fiktiv oder irgendwo dazwischen. Baue die Besetzung auf, die du lesen möchtest.",
    s3_title: "Lies deine Geschichte", s3_desc: "Eine immersive Szene, in Sekunden für dich geschrieben. Speichere und teile sie.",
    closing: "Deine nächste Geschichte", closing_bold: "wartet.",
    closing_sub: "Bring deine Fantasie auf die Seite. Es dauert nur wenige Sekunden.",
    bookshelf: "Regal", bookshelf_sub: "Jede Geschichte, die du geschrieben hast, immer nah.",
    new_story: "Neue Geschichte schreiben", empty: "Dein Regal ist leer.", write_first: "Erste Geschichte schreiben",
    sign_in: "In dein Konto einloggen", create_account: "Konto erstellen",
    email: "E-Mail", password: "Passwort", loading: "Lädt…",
  },
  it: {
    library: "Libreria", write: "Scrivi", exit: "Esci", enter: "Entra",
    tagline: "Ogni immaginazione merita di essere scritta.",
    cta: "Inizia la mia storia", cta2: "Crea la mia storia",
    how: "Come funziona", steps: "Tre semplici passi.",
    steps_sub: "Una storia fatta per te.",
    s1_title: "Scegli un mondo", s1_desc: "Scegli un genere — dalla romance reale alle accademie fantasy.",
    s2_title: "Porta i tuoi personaggi", s2_desc: "Reali, fittizi o qualcosa nel mezzo. Costruisci il cast che vuoi leggere.",
    s3_title: "Leggi la tua storia", s3_desc: "Una scena immersiva, scritta per te in secondi. Salvala e condividila.",
    closing: "La tua prossima storia ti", closing_bold: "aspetta.",
    closing_sub: "Porta la tua immaginazione sulla pagina. Bastano pochi secondi.",
    bookshelf: "Libreria", bookshelf_sub: "Ogni storia che hai scritto, sempre vicina.",
    new_story: "Scrivi una nuova storia", empty: "Il tuo scaffale è vuoto.", write_first: "Scrivi la prima",
    sign_in: "Accedi al tuo account", create_account: "Crea un account",
    email: "Email", password: "Password", loading: "Caricamento…",
  },
};

interface LanguageContextType {
  lang: UILang;
  setLang: (l: UILang) => void;
  tr: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  tr: (k) => k,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const saved = (localStorage.getItem("tender_lang") as UILang) || "en";
  const [lang, setLangState] = useState<UILang>(saved);

  const setLang = (l: UILang) => {
    localStorage.setItem("tender_lang", l);
    setLangState(l);
  };

  const tr = (key: string): string =>
    TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, tr }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
