import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { HeartButton } from "@/components/HeartButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Plus, Trash2 } from "lucide-react";

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────

const TC: Record<string, Record<string, string>> = {
  en: {
    step:"Step", of:"of",
    s1:"Step One", s1_title:"Pick your genres.", s1_sub:"Select any combination — or describe your own idea.",
    your_idea:"Have your own idea?", your_idea_ph:"Describe your story concept here…",
    tab_romance:"Romance", tab_universe:"Universe", tab_action:"Action",
    s2:"Step Two", s2_title:"Set the universe.", s2_sub:"Where does this take place? Pick any.",
    world_notes:"Describe the world in your own words", world_ph:"A coastal town in winter, a neon-lit megacity, a dying empire…",
    s3:"Step Three", s3_title:"Are you in this story?", s3_sub:"Step into the narrative — or let someone else take the lead.",
    yes_me:"Yes, put me in the story", yes_me_sub:"I want to be the protagonist",
    no_me:"No, create a protagonist for me", no_me_sub:"The AI will build a character",
    your_name:"Your name", your_name_ph:"The name you want to go by in this story…",
    pronouns:"How should the story refer to you?",
    she:"She / Her", he:"He / Him", they:"They / Them", no_pref:"No preference",
    your_nature:"Your nature", your_nature_sub:"— pick any",
    describe_you:"Describe yourself", optional:"(optional)",
    choose_protag:"Choose a protagonist", or_define:"Or define your own",
    protag_ph:"A young cartographer with a secret past…",
    s4:"Step Four", s4_title:"Who else is in your story?", s4_sub:"Add up to 4 characters — real, fictional, or imagined.",
    character:"Character", char_name_ph:"Their name…", char_hint:"Real, fictional, half-remembered. No one will know.",
    their_personality:"Their personality", anything_else:"Anything else about them?",
    char_notes_ph:"A scar above their brow, a habit of humming when nervous…",
    add_character:"Add another character",
    s5:"Step Five", s5_title:"How does it all start?", s5_sub:"Choose the opening of your story.",
    s6:"Step Six", s6_title:"Set the tone.", s6_sub:"Pick the emotional flavor of your story.",
    mood_label:"Describe the exact mood you want",
    mood_ph:"Slow-burning ache, tender silences, a single touch that undoes everything…",
    s7:"Step Seven", s7_title:"How does it end?", s7_sub:"Set the destination of your story.",
    custom_ending:"Define your own ending",
    ending_ph:"They meet again years later, in a city neither of them meant to visit…",
    s8:"Step Eight", s8_title:"Choose the length.", s8_sub:"How long do you want your story to be?",
    s9:"Step Nine", s9_title:"Choose your story language.", s9_sub:"Your story will be written entirely in this language.",
    back:"Back", continue_btn:"Continue", write:"Write my story", writing:"Writing…",
    selected:"selected",
    prot1:"A mysterious soul with a hidden past", prot2:"A fierce and unyielding spirit",
    prot3:"A gentle dreamer lost in their own world", prot4:"A sharp mind who sees what others miss",
    open_i:"In the action", open_i_d:"We open right in the middle of a scene",
    open_ii:"A chance encounter", open_ii_d:"The characters meet unexpectedly",
    open_iii:"A conflict", open_iii_d:"They start in opposition or tension",
    open_iv:"A slow introduction", open_iv_d:"Progressive, atmospheric buildup",
    end_i:"Happy ending", end_i_d:"They end up together",
    end_ii:"Tragic ending", end_ii_d:"Separation, sacrifice, or death",
    end_iii:"Open ending", end_iii_d:"Ambiguous — the reader decides",
    end_iv:"Cliffhanger", end_iv_d:"Suspended — leaves you wanting more",
    len_short:"Short scene", len_chapter:"One chapter", len_multi:"Multi-chapter",
  },
  fr: {
    step:"Étape", of:"sur",
    s1:"Étape Un", s1_title:"Choisissez vos genres.", s1_sub:"Sélectionnez n'importe quelle combinaison — ou décrivez votre propre idée.",
    your_idea:"Votre propre idée ?", your_idea_ph:"Décrivez votre concept d'histoire ici…",
    tab_romance:"Romance", tab_universe:"Univers", tab_action:"Action",
    s2:"Étape Deux", s2_title:"Définissez l'univers.", s2_sub:"Où se déroule l'histoire ? Choisissez.",
    world_notes:"Décrivez le monde avec vos propres mots", world_ph:"Une ville côtière en hiver, une mégapole lumineuse, un empire en déclin…",
    s3:"Étape Trois", s3_title:"Êtes-vous dans cette histoire ?", s3_sub:"Entrez dans le récit — ou laissez quelqu'un d'autre prendre les rênes.",
    yes_me:"Oui, mettez-moi dans l'histoire", yes_me_sub:"Je veux être le protagoniste",
    no_me:"Non, créez un protagoniste pour moi", no_me_sub:"L'IA créera un personnage",
    your_name:"Votre prénom", your_name_ph:"Le prénom que vous voulez utiliser dans cette histoire…",
    pronouns:"Comment l'histoire doit-elle vous désigner ?",
    she:"Elle", he:"Il", they:"Iel", no_pref:"Sans préférence",
    your_nature:"Votre personnalité", your_nature_sub:"— choisissez",
    describe_you:"Décrivez-vous", optional:"(optionnel)",
    choose_protag:"Choisissez un protagoniste", or_define:"Ou définissez le vôtre",
    protag_ph:"Un jeune cartographe avec un passé secret…",
    s4:"Étape Quatre", s4_title:"Qui d'autre est dans votre histoire ?", s4_sub:"Ajoutez jusqu'à 4 personnages — réels, fictifs ou imaginés.",
    character:"Personnage", char_name_ph:"Son prénom…", char_hint:"Réel, fictif, peu importe. Personne ne le saura.",
    their_personality:"Sa personnalité", anything_else:"Autre chose sur lui/elle ?",
    char_notes_ph:"Une cicatrice, une habitude, un détail particulier…",
    add_character:"Ajouter un autre personnage",
    s5:"Étape Cinq", s5_title:"Comment tout commence-t-il ?", s5_sub:"Choisissez l'ouverture de votre histoire.",
    s6:"Étape Six", s6_title:"Définissez le ton.", s6_sub:"Choisissez la couleur émotionnelle de votre histoire.",
    mood_label:"Décrivez exactement l'ambiance que vous voulez",
    mood_ph:"Une douleur qui couve, des silences tendres, un seul geste qui change tout…",
    s7:"Étape Sept", s7_title:"Comment ça se termine-t-il ?", s7_sub:"Définissez la destination de votre histoire.",
    custom_ending:"Définissez votre propre fin",
    ending_ph:"Ils se retrouvent des années plus tard, dans une ville où aucun ne voulait aller…",
    s8:"Étape Huit", s8_title:"Choisissez la longueur.", s8_sub:"Quelle longueur voulez-vous pour votre histoire ?",
    s9:"Étape Neuf", s9_title:"Choisissez la langue de votre histoire.", s9_sub:"Votre histoire sera entièrement écrite dans cette langue.",
    back:"Retour", continue_btn:"Continuer", write:"Écrire mon histoire", writing:"Écriture…",
    selected:"sélectionnés",
    prot1:"Une âme mystérieuse avec un passé caché", prot2:"Un esprit fort et inébranlable",
    prot3:"Un rêveur doux perdu dans son monde", prot4:"Un esprit vif qui voit ce que les autres ratent",
    open_i:"Dans l'action", open_i_d:"On ouvre directement au milieu d'une scène",
    open_ii:"Une rencontre fortuite", open_ii_d:"Les personnages se croisent par hasard",
    open_iii:"Un conflit", open_iii_d:"Ils commencent en opposition ou en tension",
    open_iv:"Une introduction lente", open_iv_d:"Mise en place progressive et atmosphérique",
    end_i:"Happy ending", end_i_d:"Ils finissent ensemble",
    end_ii:"Fin tragique", end_ii_d:"Séparation, sacrifice ou mort",
    end_iii:"Fin ouverte", end_iii_d:"Ambiguë — le lecteur décide",
    end_iv:"Cliffhanger", end_iv_d:"Suspendu — vous en voudrez plus",
    len_short:"Scène courte", len_chapter:"Un chapitre", len_multi:"Multi-chapitres",
  },
  es: {
    step:"Paso", of:"de",
    s1:"Paso Uno", s1_title:"Elige tus géneros.", s1_sub:"Selecciona cualquier combinación — o describe tu propia idea.",
    your_idea:"¿Tienes tu propia idea?", your_idea_ph:"Describe aquí el concepto de tu historia…",
    tab_romance:"Romance", tab_universe:"Universo", tab_action:"Acción",
    s2:"Paso Dos", s2_title:"Define el universo.", s2_sub:"¿Dónde transcurre? Elige.",
    world_notes:"Describe el mundo con tus palabras", world_ph:"Una ciudad costera en invierno, una megalópolis de neón, un imperio en declive…",
    s3:"Paso Tres", s3_title:"¿Estás en esta historia?", s3_sub:"Entra en la narrativa — o deja que otro tome la delantera.",
    yes_me:"Sí, ponme en la historia", yes_me_sub:"Quiero ser el protagonista",
    no_me:"No, crea un protagonista para mí", no_me_sub:"La IA construirá un personaje",
    your_name:"Tu nombre", your_name_ph:"El nombre que quieres usar en esta historia…",
    pronouns:"¿Cómo debe referirse la historia a ti?",
    she:"Ella", he:"Él", they:"Elle", no_pref:"Sin preferencia",
    your_nature:"Tu personalidad", your_nature_sub:"— elige",
    describe_you:"Descríbete", optional:"(opcional)",
    choose_protag:"Elige un protagonista", or_define:"O define el tuyo",
    protag_ph:"Un joven cartógrafo con un pasado secreto…",
    s4:"Paso Cuatro", s4_title:"¿Quién más está en tu historia?", s4_sub:"Añade hasta 4 personajes — reales, ficticios o imaginados.",
    character:"Personaje", char_name_ph:"Su nombre…", char_hint:"Real, ficticio, da igual. Nadie lo sabrá.",
    their_personality:"Su personalidad", anything_else:"¿Algo más sobre él/ella?",
    char_notes_ph:"Una cicatriz, un hábito, un detalle particular…",
    add_character:"Añadir otro personaje",
    s5:"Paso Cinco", s5_title:"¿Cómo empieza todo?", s5_sub:"Elige la apertura de tu historia.",
    s6:"Paso Seis", s6_title:"Define el tono.", s6_sub:"Elige el sabor emocional de tu historia.",
    mood_label:"Describe exactamente el ambiente que quieres",
    mood_ph:"Un dolor latente, silencios tiernos, un solo toque que lo cambia todo…",
    s7:"Paso Siete", s7_title:"¿Cómo termina?", s7_sub:"Define el destino de tu historia.",
    custom_ending:"Define tu propio final",
    ending_ph:"Se reencuentran años después, en una ciudad a la que ninguno quería ir…",
    s8:"Paso Ocho", s8_title:"Elige la longitud.", s8_sub:"¿Qué tan larga quieres tu historia?",
    s9:"Paso Nueve", s9_title:"Elige el idioma de tu historia.", s9_sub:"Tu historia se escribirá completamente en este idioma.",
    back:"Atrás", continue_btn:"Continuar", write:"Escribir mi historia", writing:"Escribiendo…",
    selected:"seleccionados",
    prot1:"Un alma misteriosa con un pasado oculto", prot2:"Un espíritu feroz e inquebrantable",
    prot3:"Un soñador gentil perdido en su mundo", prot4:"Una mente aguda que ve lo que otros no",
    open_i:"En la acción", open_i_d:"Abrimos justo en medio de una escena",
    open_ii:"Un encuentro casual", open_ii_d:"Los personajes se cruzan inesperadamente",
    open_iii:"Un conflicto", open_iii_d:"Empiezan en oposición o tensión",
    open_iv:"Una introducción lenta", open_iv_d:"Construcción progresiva y atmosférica",
    end_i:"Final feliz", end_i_d:"Terminan juntos",
    end_ii:"Final trágico", end_ii_d:"Separación, sacrificio o muerte",
    end_iii:"Final abierto", end_iii_d:"Ambiguo — el lector decide",
    end_iv:"Cliffhanger", end_iv_d:"Suspendido — querrás más",
    len_short:"Escena corta", len_chapter:"Un capítulo", len_multi:"Multi-capítulo",
  },
  pt: {
    step:"Passo", of:"de",
    s1:"Passo Um", s1_title:"Escolha seus gêneros.", s1_sub:"Selecione qualquer combinação — ou descreva sua própria ideia.",
    your_idea:"Tem sua própria ideia?", your_idea_ph:"Descreva o conceito da sua história aqui…",
    tab_romance:"Romance", tab_universe:"Universo", tab_action:"Ação",
    s2:"Passo Dois", s2_title:"Defina o universo.", s2_sub:"Onde isso acontece? Escolha.",
    world_notes:"Descreva o mundo com suas palavras", world_ph:"Uma cidade costeira no inverno, uma megalópole neon, um império em decadência…",
    s3:"Passo Três", s3_title:"Você está nesta história?", s3_sub:"Entre na narrativa — ou deixe outra pessoa liderar.",
    yes_me:"Sim, me coloque na história", yes_me_sub:"Quero ser o protagonista",
    no_me:"Não, crie um protagonista para mim", no_me_sub:"A IA construirá um personagem",
    your_name:"Seu nome", your_name_ph:"O nome que você quer usar nesta história…",
    pronouns:"Como a história deve se referir a você?",
    she:"Ela", he:"Ele", they:"Elu", no_pref:"Sem preferência",
    your_nature:"Sua personalidade", your_nature_sub:"— escolha",
    describe_you:"Descreva-se", optional:"(opcional)",
    choose_protag:"Escolha um protagonista", or_define:"Ou defina o seu",
    protag_ph:"Um jovem cartógrafo com um passado secreto…",
    s4:"Passo Quatro", s4_title:"Quem mais está na sua história?", s4_sub:"Adicione até 4 personagens — reais, fictícios ou imaginados.",
    character:"Personagem", char_name_ph:"O nome dele/dela…", char_hint:"Real, fictício, tanto faz. Ninguém vai saber.",
    their_personality:"A personalidade dele/dela", anything_else:"Mais alguma coisa sobre ele/ela?",
    char_notes_ph:"Uma cicatriz, um hábito, um detalhe particular…",
    add_character:"Adicionar outro personagem",
    s5:"Passo Cinco", s5_title:"Como tudo começa?", s5_sub:"Escolha a abertura da sua história.",
    s6:"Passo Seis", s6_title:"Defina o tom.", s6_sub:"Escolha o sabor emocional da sua história.",
    mood_label:"Descreva exatamente o clima que você quer",
    mood_ph:"Uma dor latente, silêncios tenros, um único toque que muda tudo…",
    s7:"Passo Sete", s7_title:"Como termina?", s7_sub:"Defina o destino da sua história.",
    custom_ending:"Defina seu próprio final",
    ending_ph:"Eles se reencontram anos depois, em uma cidade que nenhum pretendia visitar…",
    s8:"Passo Oito", s8_title:"Escolha o tamanho.", s8_sub:"Qual o tamanho que você quer para sua história?",
    s9:"Passo Nove", s9_title:"Escolha o idioma da sua história.", s9_sub:"Sua história será escrita inteiramente neste idioma.",
    back:"Voltar", continue_btn:"Continuar", write:"Escrever minha história", writing:"Escrevendo…",
    selected:"selecionados",
    prot1:"Uma alma misteriosa com um passado oculto", prot2:"Um espírito feroz e inabalável",
    prot3:"Um sonhador gentil perdido em seu mundo", prot4:"Uma mente afiada que vê o que outros não veem",
    open_i:"Na ação", open_i_d:"Abrimos bem no meio de uma cena",
    open_ii:"Um encontro casual", open_ii_d:"Os personagens se cruzam inesperadamente",
    open_iii:"Um conflito", open_iii_d:"Eles começam em oposição ou tensão",
    open_iv:"Uma introdução lenta", open_iv_d:"Construção progressiva e atmosférica",
    end_i:"Final feliz", end_i_d:"Eles terminam juntos",
    end_ii:"Final trágico", end_ii_d:"Separação, sacrifício ou morte",
    end_iii:"Final aberto", end_iii_d:"Ambíguo — o leitor decide",
    end_iv:"Cliffhanger", end_iv_d:"Suspenso — vai querer mais",
    len_short:"Cena curta", len_chapter:"Um capítulo", len_multi:"Multi-capítulo",
  },
  ko: {
    step:"단계", of:"중",
    s1:"1단계", s1_title:"장르를 선택하세요.", s1_sub:"원하는 조합을 선택하거나 직접 아이디어를 설명하세요.",
    your_idea:"직접 아이디어가 있나요?", your_idea_ph:"여기에 스토리 개념을 설명하세요…",
    tab_romance:"로맨스", tab_universe:"유니버스", tab_action:"액션",
    s2:"2단계", s2_title:"세계를 설정하세요.", s2_sub:"이야기는 어디서 펼쳐지나요?",
    world_notes:"자신의 말로 세계를 묘사하세요", world_ph:"겨울의 해안 도시, 네온빛 대도시, 쇠퇴하는 제국…",
    s3:"3단계", s3_title:"이 이야기에 당신이 있나요?", s3_sub:"이야기 속으로 들어가거나 다른 사람이 이끌게 하세요.",
    yes_me:"네, 저를 이야기에 넣어주세요", yes_me_sub:"주인공이 되고 싶어요",
    no_me:"아니요, 주인공을 만들어주세요", no_me_sub:"AI가 캐릭터를 만들어줄 거예요",
    your_name:"이름", your_name_ph:"이 이야기에서 사용할 이름…",
    pronouns:"이야기에서 어떻게 불릴까요?",
    she:"그녀", he:"그", they:"그들", no_pref:"상관없어요",
    your_nature:"당신의 성격", your_nature_sub:"— 선택",
    describe_you:"자신을 설명하세요", optional:"(선택사항)",
    choose_protag:"주인공 선택", or_define:"직접 정의하기",
    protag_ph:"숨겨진 과거를 가진 젊은 지도 제작자…",
    s4:"4단계", s4_title:"이야기에 누가 더 있나요?", s4_sub:"최대 4명의 캐릭터를 추가하세요.",
    character:"캐릭터", char_name_ph:"이름…", char_hint:"실제든 허구든 상관없어요. 아무도 모를 거예요.",
    their_personality:"성격", anything_else:"더 추가할 사항이 있나요?",
    char_notes_ph:"눈썹 위의 흉터, 긴장할 때 콧노래를 부르는 습관…",
    add_character:"캐릭터 추가",
    s5:"5단계", s5_title:"어떻게 시작되나요?", s5_sub:"이야기의 시작을 선택하세요.",
    s6:"6단계", s6_title:"분위기를 설정하세요.", s6_sub:"이야기의 감정적 색채를 선택하세요.",
    mood_label:"원하는 분위기를 설명하세요",
    mood_ph:"서서히 타오르는 아픔, 부드러운 침묵, 모든 것을 바꾸는 단 하나의 손길…",
    s7:"7단계", s7_title:"어떻게 끝나나요?", s7_sub:"이야기의 결말을 정하세요.",
    custom_ending:"직접 결말 정하기",
    ending_ph:"그들은 몇 년 후 서로 방문할 생각이 없었던 도시에서 다시 만난다…",
    s8:"8단계", s8_title:"길이를 선택하세요.", s8_sub:"이야기를 얼마나 길게 하고 싶나요?",
    s9:"9단계", s9_title:"이야기 언어를 선택하세요.", s9_sub:"이야기가 완전히 이 언어로 작성됩니다.",
    back:"뒤로", continue_btn:"계속", write:"내 이야기 쓰기", writing:"작성 중…",
    selected:"선택됨",
    prot1:"숨겨진 과거를 가진 신비로운 영혼", prot2:"강하고 흔들리지 않는 정신",
    prot3:"자신의 세계에 빠진 부드러운 몽상가", prot4:"다른 사람이 놓치는 것을 보는 예리한 마음",
    open_i:"액션 속으로", open_i_d:"장면의 한복판에서 시작",
    open_ii:"우연한 만남", open_ii_d:"캐릭터들이 예상치 못하게 만남",
    open_iii:"갈등", open_iii_d:"반목이나 긴장으로 시작",
    open_iv:"느린 도입", open_iv_d:"점진적이고 분위기 있는 전개",
    end_i:"해피엔딩", end_i_d:"함께 끝남",
    end_ii:"비극적 결말", end_ii_d:"이별, 희생 또는 죽음",
    end_iii:"열린 결말", end_iii_d:"모호함 — 독자가 결정",
    end_iv:"클리프행어", end_iv_d:"중단 — 더 읽고 싶어짐",
    len_short:"짧은 장면", len_chapter:"한 챕터", len_multi:"여러 챕터",
  },
  ja: {
    step:"ステップ", of:"の",
    s1:"ステップ1", s1_title:"ジャンルを選んでください。", s1_sub:"好きな組み合わせを選ぶか、自分のアイデアを説明してください。",
    your_idea:"自分のアイデアがありますか？", your_idea_ph:"ここにストーリーのコンセプトを説明してください…",
    tab_romance:"ロマンス", tab_universe:"ユニバース", tab_action:"アクション",
    s2:"ステップ2", s2_title:"世界観を設定してください。", s2_sub:"どこで起こりますか？選んでください。",
    world_notes:"自分の言葉で世界を描写してください", world_ph:"冬の海岸の街、ネオンの大都市、衰退する帝国…",
    s3:"ステップ3", s3_title:"この物語にあなたはいますか？", s3_sub:"物語に入るか、誰かに主導させてください。",
    yes_me:"はい、私を物語に入れてください", yes_me_sub:"主人公になりたいです",
    no_me:"いいえ、主人公を作ってください", no_me_sub:"AIがキャラクターを作ります",
    your_name:"名前", your_name_ph:"この物語で使いたい名前…",
    pronouns:"物語でどのように呼ばれますか？",
    she:"彼女", he:"彼", they:"かれら", no_pref:"こだわらない",
    your_nature:"あなたの性格", your_nature_sub:"— 選んでください",
    describe_you:"自分を説明してください", optional:"(任意)",
    choose_protag:"主人公を選んでください", or_define:"または自分で定義",
    protag_ph:"隠された過去を持つ若い地図製作者…",
    s4:"ステップ4", s4_title:"他に誰がいますか？", s4_sub:"最大4人のキャラクターを追加してください。",
    character:"キャラクター", char_name_ph:"名前…", char_hint:"実在でも架空でも、誰も知りません。",
    their_personality:"性格", anything_else:"他に何かありますか？",
    char_notes_ph:"眉の上の傷、緊張した時に鼻歌を歌う癖…",
    add_character:"キャラクターを追加",
    s5:"ステップ5", s5_title:"どのように始まりますか？", s5_sub:"物語の始まりを選んでください。",
    s6:"ステップ6", s6_title:"トーンを設定してください。", s6_sub:"物語の感情的な味わいを選んでください。",
    mood_label:"望む雰囲気を正確に説明してください",
    mood_ph:"くすぶる痛み、優しい沈黙、すべてを変える一つの触れ合い…",
    s7:"ステップ7", s7_title:"どのように終わりますか？", s7_sub:"物語の行き先を設定してください。",
    custom_ending:"自分だけの結末を定義する",
    ending_ph:"数年後、どちらも行くつもりのなかった街で再会する…",
    s8:"ステップ8", s8_title:"長さを選んでください。", s8_sub:"物語をどのくらい長くしたいですか？",
    s9:"ステップ9", s9_title:"物語の言語を選んでください。", s9_sub:"物語は完全にこの言語で書かれます。",
    back:"戻る", continue_btn:"続ける", write:"物語を書く", writing:"執筆中…",
    selected:"選択済み",
    prot1:"隠された過去を持つ神秘的な魂", prot2:"強くて揺るぎない精神",
    prot3:"自分の世界に迷い込んだ優しい夢想家", prot4:"他の人が見逃すものを見る鋭い心",
    open_i:"アクションの中から", open_i_d:"場面の真っ只中から始まる",
    open_ii:"偶然の出会い", open_ii_d:"キャラクターが予期せず出会う",
    open_iii:"対立", open_iii_d:"反目や緊張から始まる",
    open_iv:"ゆっくりした導入", open_iv_d:"段階的で雰囲気のある展開",
    end_i:"ハッピーエンド", end_i_d:"二人は結ばれる",
    end_ii:"悲劇的な結末", end_ii_d:"別れ、犠牲、または死",
    end_iii:"オープンエンド", end_iii_d:"曖昧 — 読者が決める",
    end_iv:"クリフハンガー", end_iv_d:"宙吊り — もっと読みたくなる",
    len_short:"短い場面", len_chapter:"一章", len_multi:"複数章",
  },
  ar: {
    step:"خطوة", of:"من",
    s1:"الخطوة الأولى", s1_title:"اختر أنواعك.", s1_sub:"اختر أي مزيج — أو صف فكرتك الخاصة.",
    your_idea:"لديك فكرتك الخاصة؟", your_idea_ph:"صف مفهوم قصتك هنا…",
    tab_romance:"رومانسي", tab_universe:"عالم", tab_action:"أكشن",
    s2:"الخطوة الثانية", s2_title:"حدد العالم.", s2_sub:"أين تجري الأحداث؟ اختر.",
    world_notes:"صف العالم بكلماتك", world_ph:"مدينة ساحلية في الشتاء، مدينة نيون، إمبراطورية في تراجع…",
    s3:"الخطوة الثالثة", s3_title:"هل أنت في هذه القصة؟", s3_sub:"ادخل القصة — أو دع شخصاً آخر يقود.",
    yes_me:"نعم، ضعني في القصة", yes_me_sub:"أريد أن أكون البطل",
    no_me:"لا، أنشئ بطلاً لي", no_me_sub:"الذكاء الاصطناعي سينشئ شخصية",
    your_name:"اسمك", your_name_ph:"الاسم الذي تريد استخدامه في القصة…",
    pronouns:"كيف يجب أن تشير إليك القصة؟",
    she:"هي", he:"هو", they:"هم", no_pref:"لا تفضيل",
    your_nature:"شخصيتك", your_nature_sub:"— اختر",
    describe_you:"صف نفسك", optional:"(اختياري)",
    choose_protag:"اختر بطلاً", or_define:"أو عرّف بطلك",
    protag_ph:"رسام خرائط شاب ذو ماضٍ سري…",
    s4:"الخطوة الرابعة", s4_title:"من هو أيضاً في قصتك؟", s4_sub:"أضف ما يصل إلى 4 شخصيات.",
    character:"شخصية", char_name_ph:"الاسم…", char_hint:"حقيقي أو خيالي، لن يعرف أحد.",
    their_personality:"شخصيته/شخصيتها", anything_else:"أي شيء آخر عنه/عنها؟",
    char_notes_ph:"ندبة فوق حاجبه، عادة التمتمة عند التوتر…",
    add_character:"إضافة شخصية أخرى",
    s5:"الخطوة الخامسة", s5_title:"كيف يبدأ كل شيء؟", s5_sub:"اختر مقدمة قصتك.",
    s6:"الخطوة السادسة", s6_title:"حدد النبرة.", s6_sub:"اختر النكهة العاطفية لقصتك.",
    mood_label:"صف بالضبط المزاج الذي تريده",
    mood_ph:"ألم خامد، صمت رقيق، لمسة واحدة تغير كل شيء…",
    s7:"الخطوة السابعة", s7_title:"كيف تنتهي؟", s7_sub:"حدد وجهة قصتك.",
    custom_ending:"عرّف نهايتك الخاصة",
    ending_ph:"يلتقيان بعد سنوات في مدينة لم يقصدها أي منهما…",
    s8:"الخطوة الثامنة", s8_title:"اختر الطول.", s8_sub:"كم تريد أن تكون قصتك طويلة؟",
    s9:"الخطوة التاسعة", s9_title:"اختر لغة قصتك.", s9_sub:"ستُكتب قصتك بالكامل بهذه اللغة.",
    back:"رجوع", continue_btn:"متابعة", write:"اكتب قصتي", writing:"جاري الكتابة…",
    selected:"محددة",
    prot1:"روح غامضة ذات ماضٍ مخفي", prot2:"روح قوية لا تهتز",
    prot3:"حالم لطيف ضائع في عالمه", prot4:"عقل حاد يرى ما يفوت الآخرين",
    open_i:"في قلب الحدث", open_i_d:"نبدأ في منتصف مشهد",
    open_ii:"لقاء مصادفة", open_ii_d:"الشخصيات تلتقي بشكل غير متوقع",
    open_iii:"صراع", open_iii_d:"يبدأن في تعارض أو توتر",
    open_iv:"مقدمة بطيئة", open_iv_d:"بناء تدريجي وجوي",
    end_i:"نهاية سعيدة", end_i_d:"ينتهيان معاً",
    end_ii:"نهاية مأساوية", end_ii_d:"فراق أو تضحية أو موت",
    end_iii:"نهاية مفتوحة", end_iii_d:"غامضة — القارئ يقرر",
    end_iv:"كليف هانغر", end_iv_d:"معلقة — ستريد المزيد",
    len_short:"مشهد قصير", len_chapter:"فصل واحد", len_multi:"فصول متعددة",
  },
  de: {
    step:"Schritt", of:"von",
    s1:"Schritt Eins", s1_title:"Wähle deine Genres.", s1_sub:"Wähle eine beliebige Kombination — oder beschreibe deine eigene Idee.",
    your_idea:"Eigene Idee?", your_idea_ph:"Beschreibe hier dein Geschichtskonzept…",
    tab_romance:"Romantik", tab_universe:"Universum", tab_action:"Aktion",
    s2:"Schritt Zwei", s2_title:"Das Universum festlegen.", s2_sub:"Wo findet das statt? Wähle.",
    world_notes:"Beschreibe die Welt in deinen Worten", world_ph:"Eine Küstenstadt im Winter, eine Neon-Metropole, ein sterbendes Imperium…",
    s3:"Schritt Drei", s3_title:"Bist du in dieser Geschichte?", s3_sub:"Tritt in die Handlung ein — oder lass jemand anderen übernehmen.",
    yes_me:"Ja, setz mich in die Geschichte", yes_me_sub:"Ich möchte der Protagonist sein",
    no_me:"Nein, erstelle einen Protagonisten für mich", no_me_sub:"Die KI wird eine Figur erschaffen",
    your_name:"Dein Name", your_name_ph:"Der Name, den du in dieser Geschichte verwenden möchtest…",
    pronouns:"Wie soll die Geschichte auf dich verweisen?",
    she:"Sie", he:"Er", they:"Sie (pl.)", no_pref:"Keine Präferenz",
    your_nature:"Deine Persönlichkeit", your_nature_sub:"— wähle",
    describe_you:"Beschreibe dich", optional:"(optional)",
    choose_protag:"Wähle einen Protagonisten", or_define:"Oder definiere deinen eigenen",
    protag_ph:"Ein junger Kartograf mit einer geheimen Vergangenheit…",
    s4:"Schritt Vier", s4_title:"Wer ist noch in deiner Geschichte?", s4_sub:"Füge bis zu 4 Charaktere hinzu.",
    character:"Charakter", char_name_ph:"Ihr Name…", char_hint:"Real, fiktiv — niemand wird es wissen.",
    their_personality:"Ihre Persönlichkeit", anything_else:"Noch etwas über sie?",
    char_notes_ph:"Eine Narbe über der Augenbraue, eine Gewohnheit zu summen…",
    add_character:"Weiteren Charakter hinzufügen",
    s5:"Schritt Fünf", s5_title:"Wie fängt alles an?", s5_sub:"Wähle den Anfang deiner Geschichte.",
    s6:"Schritt Sechs", s6_title:"Den Ton festlegen.", s6_sub:"Wähle die emotionale Note deiner Geschichte.",
    mood_label:"Beschreibe genau die gewünschte Stimmung",
    mood_ph:"Ein schwelender Schmerz, zärtliche Stille, eine einzige Berührung, die alles verändert…",
    s7:"Schritt Sieben", s7_title:"Wie endet es?", s7_sub:"Bestimme das Ziel deiner Geschichte.",
    custom_ending:"Definiere dein eigenes Ende",
    ending_ph:"Sie treffen sich Jahre später in einer Stadt, die keiner von ihnen besuchen wollte…",
    s8:"Schritt Acht", s8_title:"Wähle die Länge.", s8_sub:"Wie lang soll deine Geschichte sein?",
    s9:"Schritt Neun", s9_title:"Wähle die Sprache deiner Geschichte.", s9_sub:"Deine Geschichte wird vollständig in dieser Sprache geschrieben.",
    back:"Zurück", continue_btn:"Weiter", write:"Meine Geschichte schreiben", writing:"Schreibe…",
    selected:"ausgewählt",
    prot1:"Eine geheimnisvolle Seele mit einer verborgenen Vergangenheit", prot2:"Ein starker, unerschütterlicher Geist",
    prot3:"Ein sanfter Träumer, verloren in seiner Welt", prot4:"Ein scharfer Verstand, der sieht, was andere übersehen",
    open_i:"Mitten in der Aktion", open_i_d:"Wir öffnen mitten in einer Szene",
    open_ii:"Eine zufällige Begegnung", open_ii_d:"Die Charaktere treffen sich unerwartet",
    open_iii:"Ein Konflikt", open_iii_d:"Sie beginnen in Opposition oder Spannung",
    open_iv:"Eine langsame Einführung", open_iv_d:"Schrittweiser, atmosphärischer Aufbau",
    end_i:"Gutes Ende", end_i_d:"Sie enden zusammen",
    end_ii:"Tragisches Ende", end_ii_d:"Trennung, Opfer oder Tod",
    end_iii:"Offenes Ende", end_iii_d:"Zweideutig — der Leser entscheidet",
    end_iv:"Cliffhanger", end_iv_d:"Offen — du willst mehr",
    len_short:"Kurze Szene", len_chapter:"Ein Kapitel", len_multi:"Mehrere Kapitel",
  },
  it: {
    step:"Passo", of:"di",
    s1:"Passo Uno", s1_title:"Scegli i tuoi generi.", s1_sub:"Seleziona qualsiasi combinazione — o descrivi la tua idea.",
    your_idea:"Hai un'idea tua?", your_idea_ph:"Descrivi qui il concetto della tua storia…",
    tab_romance:"Romance", tab_universe:"Universo", tab_action:"Azione",
    s2:"Passo Due", s2_title:"Definisci l'universo.", s2_sub:"Dove si svolge? Scegli.",
    world_notes:"Descrivi il mondo a modo tuo", world_ph:"Una città costiera d'inverno, una megalopoli al neon, un impero in declino…",
    s3:"Passo Tre", s3_title:"Sei in questa storia?", s3_sub:"Entra nella narrazione — o lascia che qualcun altro guidi.",
    yes_me:"Sì, mettimi nella storia", yes_me_sub:"Voglio essere il protagonista",
    no_me:"No, crea un protagonista per me", no_me_sub:"L'IA creerà un personaggio",
    your_name:"Il tuo nome", your_name_ph:"Il nome che vuoi usare in questa storia…",
    pronouns:"Come dovrebbe riferirti la storia?",
    she:"Lei", he:"Lui", they:"Loro", no_pref:"Nessuna preferenza",
    your_nature:"La tua personalità", your_nature_sub:"— scegli",
    describe_you:"Descriviti", optional:"(opzionale)",
    choose_protag:"Scegli un protagonista", or_define:"O definisci il tuo",
    protag_ph:"Un giovane cartografo con un passato segreto…",
    s4:"Passo Quattro", s4_title:"Chi altro è nella tua storia?", s4_sub:"Aggiungi fino a 4 personaggi.",
    character:"Personaggio", char_name_ph:"Il suo nome…", char_hint:"Reale, fittizio — nessuno lo saprà.",
    their_personality:"La sua personalità", anything_else:"Altro su di lui/lei?",
    char_notes_ph:"Una cicatrice sopra il sopracciglio, l'abitudine di fischiettare…",
    add_character:"Aggiungi un altro personaggio",
    s5:"Passo Cinque", s5_title:"Come inizia tutto?", s5_sub:"Scegli l'apertura della tua storia.",
    s6:"Passo Sei", s6_title:"Definisci il tono.", s6_sub:"Scegli il sapore emotivo della tua storia.",
    mood_label:"Descrivi esattamente l'umore che vuoi",
    mood_ph:"Un dolore covato, silenzi teneri, un solo tocco che cambia tutto…",
    s7:"Passo Sette", s7_title:"Come finisce?", s7_sub:"Definisci la destinazione della tua storia.",
    custom_ending:"Definisci il tuo finale",
    ending_ph:"Si incontrano di nuovo anni dopo, in una città che nessuno dei due intendeva visitare…",
    s8:"Passo Otto", s8_title:"Scegli la lunghezza.", s8_sub:"Quanto vuoi che sia lunga la tua storia?",
    s9:"Passo Nove", s9_title:"Scegli la lingua della tua storia.", s9_sub:"La tua storia sarà scritta interamente in questa lingua.",
    back:"Indietro", continue_btn:"Continua", write:"Scrivi la mia storia", writing:"Scrittura…",
    selected:"selezionati",
    prot1:"Un'anima misteriosa con un passato nascosto", prot2:"Uno spirito forte e indomabile",
    prot3:"Un dolce sognatore perso nel suo mondo", prot4:"Una mente acuta che vede ciò che gli altri non vedono",
    open_i:"Nel vivo dell'azione", open_i_d:"Apriamo nel mezzo di una scena",
    open_ii:"Un incontro casuale", open_ii_d:"I personaggi si incontrano inaspettatamente",
    open_iii:"Un conflitto", open_iii_d:"Iniziano in opposizione o tensione",
    open_iv:"Un'introduzione lenta", open_iv_d:"Costruzione progressiva e atmosferica",
    end_i:"Lieto fine", end_i_d:"Finiscono insieme",
    end_ii:"Fine tragica", end_ii_d:"Separazione, sacrificio o morte",
    end_iii:"Fine aperta", end_iii_d:"Ambigua — il lettore decide",
    end_iv:"Cliffhanger", end_iv_d:"Sospeso — ne vorrai ancora",
    len_short:"Scena breve", len_chapter:"Un capitolo", len_multi:"Multi-capitolo",
  },
  zh: {
    step:"步骤", of:"共",
    s1:"第一步", s1_title:"选择你的类型。", s1_sub:"选择任意组合 — 或描述你自己的想法。",
    your_idea:"有自己的想法？", your_idea_ph:"在此描述你的故事概念…",
    tab_romance:"浪漫", tab_universe:"宇宙", tab_action:"动作",
    s2:"第二步", s2_title:"设定世界。", s2_sub:"故事发生在哪里？选择。",
    world_notes:"用自己的话描述世界", world_ph:"冬天的海滨城市，霓虹灯闪烁的大都市，衰落的帝国…",
    s3:"第三步", s3_title:"你在这个故事里吗？", s3_sub:"进入故事 — 或让别人带头。",
    yes_me:"是的，把我放进故事里", yes_me_sub:"我想成为主角",
    no_me:"不，为我创建一个主角", no_me_sub:"AI将创建一个角色",
    your_name:"你的名字", your_name_ph:"你想在这个故事中使用的名字…",
    pronouns:"故事应该如何称呼你？",
    she:"她", he:"他", they:"他们", no_pref:"无偏好",
    your_nature:"你的性格", your_nature_sub:"— 选择",
    describe_you:"描述你自己", optional:"(可选)",
    choose_protag:"选择主角", or_define:"或自定义",
    protag_ph:"一位有着隐秘过去的年轻制图师…",
    s4:"第四步", s4_title:"还有谁在你的故事里？", s4_sub:"最多添加4个角色。",
    character:"角色", char_name_ph:"名字…", char_hint:"真实的、虚构的，没关系。没人会知道。",
    their_personality:"他/她的性格", anything_else:"还有什么关于他/她的？",
    char_notes_ph:"眉毛上的疤，紧张时哼歌的习惯…",
    add_character:"添加另一个角色",
    s5:"第五步", s5_title:"一切是如何开始的？", s5_sub:"选择你故事的开头。",
    s6:"第六步", s6_title:"设定基调。", s6_sub:"选择你故事的情感色彩。",
    mood_label:"精确描述你想要的氛围",
    mood_ph:"闷烧的痛苦，温柔的沉默，一个改变一切的触碰…",
    s7:"第七步", s7_title:"结局如何？", s7_sub:"设定你故事的目的地。",
    custom_ending:"定义你自己的结局",
    ending_ph:"多年后，他们在一个双方都无意到访的城市再次相遇…",
    s8:"第八步", s8_title:"选择长度。", s8_sub:"你想要你的故事多长？",
    s9:"第九步", s9_title:"选择你故事的语言。", s9_sub:"你的故事将完全用这种语言书写。",
    back:"返回", continue_btn:"继续", write:"写我的故事", writing:"写作中…",
    selected:"已选",
    prot1:"一个有着隐藏过去的神秘灵魂", prot2:"一个强大而坚定的精神",
    prot3:"一个迷失在自己世界里的温柔梦想家", prot4:"一个能看见别人错过的事物的敏锐头脑",
    open_i:"行动中", open_i_d:"直接在场景中开始",
    open_ii:"偶遇", open_ii_d:"角色意外相遇",
    open_iii:"冲突", open_iii_d:"以对立或紧张开始",
    open_iv:"缓慢介绍", open_iv_d:"渐进式的氛围铺垫",
    end_i:"圆满结局", end_i_d:"他们最终在一起",
    end_ii:"悲剧结局", end_ii_d:"分离、牺牲或死亡",
    end_iii:"开放式结局", end_iii_d:"模糊 — 读者自己决定",
    end_iv:"悬念结局", end_iv_d:"悬而未决 — 让你想要更多",
    len_short:"短篇场景", len_chapter:"一个章节", len_multi:"多章节",
  },
};

// ─── STATIC DATA (kept in English as genre names are universal) ──────────────

const ROMANCE_GENRES = ["Toxic Love","Slow Burn","Enemies to Lovers","Fake Dating","Second Chance","Secret Admirer","Soulmates","Forbidden Bond","Arranged Marriage","CEO Romance","Bodyguard Romance","Friends to Lovers","Love Triangle","Unrequited Love","Obsessive Love"];
const UNIVERSE_GENRES = ["Royal Romance","Fantasy Academy","Villain's Revenge","Historical Court","Supernatural Bond","Campus Life","Idol Romance","Reincarnation","Rivals to Lovers","Revenge Arc","Time Travel","Found Family","War Romance","Political Intrigue","Mafia Romance"];
const ACTION_GENRES = ["Mystery & Investigation","Spy Romance","Survival Game","Assassin's Code","Heist Story","Psychological Thriller","Conspiracy","Dark Academia","Crime & Redemption","Forbidden Mission","Underground World","Power Struggle"];
const CONTEXTS = ["Modern day","Royal court","Fantasy world","Magic academy","Post-apocalyptic","Historical era","Corporate world","Small town","Supernatural realm","Parallel dimension","Island isolation","Big city","Space","Medieval kingdom","Underground world"];
const CHARACTER_TRAITS = ["Cold & distant","Warm & protective","Arrogant & confident","Gentle & patient","Mysterious & unpredictable","Playful & teasing","Possessive & intense","Soft & caring","Dominant & commanding","Broken & guarded","Charismatic & charming","Ruthless & ambitious","Loyal & devoted","Rebellious & wild","Quiet & observant","Yearner / Golden Retriever","Sunshine personality","Morally grey","Stoic protector","Cunning & calculating","Gentle giant","Emotionally unavailable"];
const READER_TRAITS = [
  "Soft & shy","Bold & fierce","Sarcastic & witty","Warm & empathetic",
  "Confident & ambitious","Dreamy & romantic","Independent & strong",
  "Playful & flirty","Sweet & gentle","Chaotic & unpredictable",
  "Fiercely loyal","Emotionally complex","Stubborn & determined",
  "Quietly observant","Cold outside warm inside","Passionate & intense",
];
const TONES = ["Sweet romance","Intense & dramatic","Suggestive","Sensual","Suggestive & steamy","Angst & emotional","Dark & complex","Slow burn tension","Lighthearted & fun","Bittersweet","Chaotic & unpredictable","Obsessive & intense","Hopeful & healing","Melancholic","Passionate & fiery","Tender & intimate","Mysterious & suspenseful"];
const LANGUAGES = [{ id:"English", label:"English" },{ id:"French", label:"Français" },{ id:"Spanish", label:"Español" },{ id:"Portuguese", label:"Português" },{ id:"Korean", label:"한국어" },{ id:"Japanese", label:"日本語" },{ id:"German", label:"Deutsch" },{ id:"Italian", label:"Italiano" },{ id:"Arabic", label:"العربية" },{ id:"Chinese", label:"中文" }];
const TOTAL_STEPS = 9;

interface Character { name: string; traits: string[]; notes: string; }
const emptyCharacter = (): Character => ({ name:"", traits:[], notes:"" });

const Tag = ({ active, onClick, onDoubleClick, children }: { active:boolean; onClick:()=>void; onDoubleClick?:()=>void; children:React.ReactNode; }) => (
  <button type="button" onClick={onClick} onDoubleClick={onDoubleClick}
    className={cn("px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-soft border select-none font-sans-ui",
      active ? "bg-primary text-primary-foreground border-primary shadow-amber" : "bg-transparent text-foreground/80 border-border hover:border-primary hover:text-primary")}>
    {children}
  </button>
);

const Create = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const lang = (() => { try { return localStorage.getItem("tender_lang") || "en"; } catch { return "en"; } })();
  const tr = (k: string) => TC[lang]?.[k] ?? TC.en[k] ?? k;

  const STEP_LABELS = [tr("tab_romance").slice(0,3)==="Rom" ? "Genre" : tr("s1").split(" ").pop()!,"World","You","Cast","Opening","Tone","Ending","Length","Language"];
  const stepLabels = [tr("s1"),tr("s2"),tr("s3"),tr("s4"),tr("s5"),tr("s6"),tr("s7"),tr("s8"),tr("s9")].map(s=>s.split(" ").slice(-1)[0]);

  const STORY_STARTS = [
    { id:"action", num:"I", label:tr("open_i"), desc:tr("open_i_d") },
    { id:"encounter", num:"II", label:tr("open_ii"), desc:tr("open_ii_d") },
    { id:"conflict", num:"III", label:tr("open_iii"), desc:tr("open_iii_d") },
    { id:"slow", num:"IV", label:tr("open_iv"), desc:tr("open_iv_d") },
  ];
  const ENDINGS = [
    { id:"happy", num:"I", label:tr("end_i"), desc:tr("end_i_d") },
    { id:"tragic", num:"II", label:tr("end_ii"), desc:tr("end_ii_d") },
    { id:"open", num:"III", label:tr("end_iii"), desc:tr("end_iii_d") },
    { id:"cliffhanger", num:"IV", label:tr("end_iv"), desc:tr("end_iv_d") },
  ];
  const LENGTHS = [
    { id:"short", label:tr("len_short"), desc:"500 words" },
    { id:"chapter", label:tr("len_chapter"), desc:"1500 words" },
    { id:"multi", label:tr("len_multi"), desc:"3000+ words" },
  ];
  const PROTAGONIST_OPTIONS = [tr("prot1"),tr("prot2"),tr("prot3"),tr("prot4")];
  const PRONOUNS = [{ id:"she", label:tr("she") },{ id:"he", label:tr("he") },{ id:"they", label:tr("they") },{ id:"none", label:tr("no_pref") }];

  const [genres, setGenres] = useState<string[]>([]);
  const [storyIdea, setStoryIdea] = useState("");
  const [contexts, setContexts] = useState<string[]>([]);
  const [contextNotes, setContextNotes] = useState("");
  const [includeReader, setIncludeReader] = useState<boolean | null>(null);
  const [readerName, setReaderName] = useState("");
  const [readerPronouns, setReaderPronouns] = useState("none");
  const [readerTraits, setReaderTraits] = useState<string[]>([]);
  const [readerNotes, setReaderNotes] = useState("");
  const [protagonistChoice, setProtagonistChoice] = useState("");
  const [protagonistCustom, setProtagonistCustom] = useState("");
  const [characters, setCharacters] = useState<Character[]>([emptyCharacter()]);
  const [storyStart, setStoryStart] = useState("");
  const [tones, setTones] = useState<string[]>([]);
  const [toneNotes, setToneNotes] = useState("");
  const [ending, setEnding] = useState("");
  const [endingCustom, setEndingCustom] = useState("");
  const [length, setLength] = useState("chapter");
  const [language, setLanguage] = useState("English");
  const [generating, setGenerating] = useState(false);

  useEffect(() => { supabase.auth.getSession().then(({ data }) => { if (!data.session) navigate("/auth"); }); }, [navigate]);

  const toggle = (arr: string[], setArr: (v:string[])=>void, v: string) => setArr(arr.includes(v) ? arr.filter(x=>x!==v) : [...arr,v]);
  const updateCharacter = (i: number, field: keyof Character, value: string|string[]) => setCharacters(prev=>prev.map((c,idx)=>idx===i?{...c,[field]:value}:c));
  const toggleCharacterTrait = (ci: number, trait: string) => { const c=characters[ci]; updateCharacter(ci,"traits",c.traits.includes(trait)?c.traits.filter(t=>t!==trait):[...c.traits,trait]); };

  const canNext = () => {
    if (step===1) return genres.length>0||storyIdea.trim().length>0;
    if (step===2) return true;
    if (step===3) { if (includeReader===null) return false; if (includeReader) return readerName.trim().length>0; return protagonistChoice.trim().length>0||protagonistCustom.trim().length>0; }
    if (step===4) return characters[0].name.trim().length>0;
    if (step===5) return storyStart.length>0;
    if (step===6) return tones.length>0||toneNotes.trim().length>0;
    if (step===7) return ending.length>0||endingCustom.trim().length>0;
    return true;
  };
  const goNext = () => { if (!canNext()||step>=TOTAL_STEPS) return; setStep(s=>s+1); };
  const selectAndAdvance = (arr: string[], setArr:(v:string[])=>void, v: string) => { if (!arr.includes(v)) setArr([...arr,v]); setTimeout(goNext,0); };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate("/auth"); return; }
      const protagonistDescription = includeReader ? readerName : protagonistCustom.trim()||protagonistChoice;
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story`, {
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`},
        body:JSON.stringify({ genres, storyIdea:storyIdea.trim()||null, contexts, contextNotes:contextNotes.trim()||null, characters:characters.filter(c=>c.name.trim()), includeReader, readerName:includeReader?readerName:null, readerPronouns:includeReader?readerPronouns:null, readerTraits:includeReader?readerTraits:[], readerNotes:includeReader?(readerNotes.trim()||null):null, protagonistDescription:!includeReader?protagonistDescription:null, storyStart, tones, toneNotes:toneNotes.trim()||null, ending, endingCustom:endingCustom.trim()||null, length, language }),
      });
      if (!resp.ok||!resp.body) { const err=await resp.json().catch(()=>({})); throw new Error((err as any).error||"Generation failed"); }
      const reader=resp.body.getReader(); const decoder=new TextDecoder(); let buffer=""; let content="";
      while (true) {
        const {done,value}=await reader.read(); if (done) break;
        buffer+=decoder.decode(value,{stream:true}); let idx;
        while ((idx=buffer.indexOf("\n"))!==-1) { let line=buffer.slice(0,idx); buffer=buffer.slice(idx+1); if (line.endsWith("\r")) line=line.slice(0,-1); if (!line.startsWith("data: ")) continue; const json=line.slice(6).trim(); if (json==="[DONE]") continue; try { const p=JSON.parse(json); const c=p.choices?.[0]?.delta?.content; if (c) content+=c; } catch { buffer=line+"\n"+buffer; break; } }
      }
      const match=content.match(/^#\s+(.+)/);
      const mainCharName=characters[0]?.name??"Unknown";
      const title=match?match[1].trim():`${genres[0]??"Untitled"} with ${mainCharName}`;
      const body=content.replace(/^#\s+.+\n+/,"");
      const templateSlug=(genres[0]??"custom").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
      const combinedNotes=[contextNotes.trim(),contexts.length?`Universe: ${contexts.join(", ")}`:"",genres.length?`Genres: ${genres.join(", ")}`:"",storyIdea.trim()?`Idea: ${storyIdea.trim()}`:"",storyStart?`Opening: ${storyStart}`:"",toneNotes.trim()?`Mood: ${toneNotes.trim()}`:"",ending?`Ending: ${ending}`:"",endingCustom.trim()?`Custom ending: ${endingCustom.trim()}`:"",`Language: ${language}`].filter(Boolean).join(" | ")||null;
      const {data:saved,error}=await supabase.from("stories").insert({user_id:sess.session.user.id,title,template:templateSlug,character_name:mainCharName,character_traits:characters[0]?.traits??[],character_notes:combinedNotes,reader_name:includeReader?readerName:null,reader_traits:includeReader?readerTraits:[],reader_notes:includeReader?(readerNotes.trim()||null):null,tones,length,content:body}).select().single();
      if (error) throw error;
      navigate(`/story/${saved.id}`);
    } catch (e: any) { toast.error(e.message??"Something went wrong"); setGenerating(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-noir relative grain">
      <Header />
      <div className="absolute inset-0 bg-gradient-aurora opacity-40 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[60vh] candle-bloom pointer-events-none animate-flicker" />
      <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 pt-28 pb-32 md:pb-24">

        {/* Progress */}
        <div className="mb-12">
          <div className="flex sm:hidden items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-sans-ui">{tr("step")} {step} {tr("of")} {TOTAL_STEPS}</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-foreground font-sans-ui">{stepLabels[step-1]}</span>
          </div>
          <div className="flex h-px w-full sm:hidden"><div className="bg-primary transition-soft" style={{width:`${(step/TOTAL_STEPS)*100}%`}} /><div className="bg-border flex-1" /></div>
          <div className="hidden sm:flex items-center justify-between gap-1">
            {stepLabels.map((label,i) => { const n=i+1; return (
              <div key={n} className="flex-1 flex flex-col items-start gap-1.5 min-w-0">
                <div className={cn("h-px w-full transition-soft",n<=step?"bg-primary":"bg-border")} />
                <div className="flex items-center gap-1 min-w-0">
                  <span className={cn("font-display text-[10px]",n<=step?"text-primary":"text-muted-foreground")}>0{n}</span>
                  <span className={cn("text-[8px] uppercase tracking-[0.15em] truncate font-sans-ui",n===step?"text-foreground":"text-muted-foreground")}>{label}</span>
                </div>
              </div>
            ); })}
          </div>
        </div>

        <div key={step} className="animate-fade-up">

          {/* STEP 1 */}
          {step===1 && (<>
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">{tr("s1")}</p>
            <h2 className="font-display text-4xl md:text-6xl mb-3 italic">{tr("s1_title")}</h2>
            <p className="text-muted-foreground mb-8 font-light text-sm md:text-base">{tr("s1_sub")}</p>
            <div className="mb-10">
              <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">{tr("your_idea")} <span className="opacity-60 normal-case tracking-normal">{tr("optional")}</span></Label>
              <Textarea value={storyIdea} onChange={e=>setStoryIdea(e.target.value)} placeholder={tr("your_idea_ph")} rows={3} className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none" />
            </div>
            <Tabs defaultValue="romance" className="w-full">
              <TabsList className="rounded-none bg-transparent border border-border p-0 h-auto w-full grid grid-cols-3">
                <TabsTrigger value="romance" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none text-[9px] uppercase tracking-[0.1em] py-3 font-sans-ui">{tr("tab_romance")}</TabsTrigger>
                <TabsTrigger value="universe" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none text-[9px] uppercase tracking-[0.1em] py-3 font-sans-ui">{tr("tab_universe")}</TabsTrigger>
                <TabsTrigger value="action" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none text-[9px] uppercase tracking-[0.1em] py-3 font-sans-ui">{tr("tab_action")}</TabsTrigger>
              </TabsList>
              <TabsContent value="romance" className="mt-6"><div className="flex flex-wrap gap-2">{ROMANCE_GENRES.map(g=><Tag key={g} active={genres.includes(g)} onClick={()=>toggle(genres,setGenres,g)} onDoubleClick={()=>selectAndAdvance(genres,setGenres,g)}>{g}</Tag>)}</div></TabsContent>
              <TabsContent value="universe" className="mt-6"><div className="flex flex-wrap gap-2">{UNIVERSE_GENRES.map(g=><Tag key={g} active={genres.includes(g)} onClick={()=>toggle(genres,setGenres,g)} onDoubleClick={()=>selectAndAdvance(genres,setGenres,g)}>{g}</Tag>)}</div></TabsContent>
              <TabsContent value="action" className="mt-6"><div className="flex flex-wrap gap-2">{ACTION_GENRES.map(g=><Tag key={g} active={genres.includes(g)} onClick={()=>toggle(genres,setGenres,g)} onDoubleClick={()=>selectAndAdvance(genres,setGenres,g)}>{g}</Tag>)}</div></TabsContent>
            </Tabs>
            {genres.length>0 && <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-sans-ui">{genres.length} {tr("selected")}</p>}
          </>)}

          {/* STEP 2 */}
          {step===2 && (<>
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">{tr("s2")}</p>
            <h2 className="font-display text-4xl md:text-6xl mb-3 italic">{tr("s2_title")}</h2>
            <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">{tr("s2_sub")}</p>
            <div className="flex flex-wrap gap-2 mb-10">{CONTEXTS.map(c=><Tag key={c} active={contexts.includes(c)} onClick={()=>toggle(contexts,setContexts,c)} onDoubleClick={()=>selectAndAdvance(contexts,setContexts,c)}>{c}</Tag>)}</div>
            <div>
              <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">{tr("world_notes")} <span className="opacity-60 normal-case tracking-normal">{tr("optional")}</span></Label>
              <Textarea value={contextNotes} onChange={e=>setContextNotes(e.target.value)} placeholder={tr("world_ph")} rows={3} className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none" />
            </div>
          </>)}

          {/* STEP 3 */}
          {step===3 && (<>
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">{tr("s3")}</p>
            <h2 className="font-display text-4xl md:text-6xl mb-3 italic">{tr("s3_title")}</h2>
            <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">{tr("s3_sub")}</p>
            <div className="space-y-px bg-border mb-8">
              <button onClick={()=>setIncludeReader(true)} className={cn("w-full p-6 text-left transition-soft",includeReader===true?"bg-primary text-primary-foreground":"bg-background hover:bg-card hover:text-primary")}>
                <div className="font-display text-2xl mb-1">{tr("yes_me")}</div>
                <div className={cn("text-[10px] uppercase tracking-[0.2em] font-sans-ui",includeReader===true?"opacity-80":"text-muted-foreground")}>{tr("yes_me_sub")}</div>
              </button>
              <button onClick={()=>setIncludeReader(false)} className={cn("w-full p-6 text-left transition-soft",includeReader===false?"bg-primary text-primary-foreground":"bg-background hover:bg-card hover:text-primary")}>
                <div className="font-display text-2xl mb-1">{tr("no_me")}</div>
                <div className={cn("text-[10px] uppercase tracking-[0.2em] font-sans-ui",includeReader===false?"opacity-80":"text-muted-foreground")}>{tr("no_me_sub")}</div>
              </button>
            </div>
            {includeReader===true && (
              <div className="animate-fade-up space-y-6">
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-sans-ui">{tr("your_name")}</Label>
                  <Input value={readerName} onChange={e=>setReaderName(e.target.value)} placeholder={tr("your_name_ph")} className="rounded-none h-12 mt-2 bg-transparent border-0 border-b border-border focus-visible:ring-0 focus-visible:border-primary text-lg font-serif px-0" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">{tr("pronouns")}</Label>
                  <div className="grid grid-cols-2 gap-px bg-border">
                    {PRONOUNS.map(p=>(
                      <button key={p.id} onClick={()=>setReaderPronouns(p.id)} className={cn("p-4 text-left font-sans-ui text-[11px] uppercase tracking-[0.2em] transition-soft",readerPronouns===p.id?"bg-primary text-primary-foreground":"bg-background hover:bg-card hover:text-primary")}>{p.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">{tr("your_nature")} <span className="opacity-60 normal-case tracking-normal">{tr("your_nature_sub")}</span></Label>
                  <div className="flex flex-wrap gap-2">{READER_TRAITS.map(t=><Tag key={t} active={readerTraits.includes(t)} onClick={()=>toggle(readerTraits,setReaderTraits,t)} onDoubleClick={()=>selectAndAdvance(readerTraits,setReaderTraits,t)}>{t}</Tag>)}</div>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">{tr("describe_you")} <span className="opacity-60 normal-case tracking-normal">{tr("optional")}</span></Label>
                  <Textarea value={readerNotes} onChange={e=>setReaderNotes(e.target.value)} placeholder="..." rows={3} className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none" />
                </div>
              </div>
            )}
            {includeReader===false && (
              <div className="animate-fade-up space-y-4">
                <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground block font-sans-ui">{tr("choose_protag")}</Label>
                <div className="space-y-px bg-border">
                  {PROTAGONIST_OPTIONS.map(opt=>(
                    <button key={opt} onClick={()=>{setProtagonistChoice(opt);setProtagonistCustom("");}} className={cn("w-full p-4 text-left font-serif transition-soft",protagonistChoice===opt&&!protagonistCustom?"bg-primary text-primary-foreground":"bg-background hover:bg-card hover:text-primary")}>{opt}</button>
                  ))}
                </div>
                <div className="mt-4">
                  <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">{tr("or_define")} <span className="opacity-60 normal-case tracking-normal">{tr("optional")}</span></Label>
                  <Textarea value={protagonistCustom} onChange={e=>{setProtagonistCustom(e.target.value);if(e.target.value)setProtagonistChoice("");}} placeholder={tr("protag_ph")} rows={2} className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none" />
                </div>
              </div>
            )}
          </>)}

          {/* STEP 4 */}
          {step===4 && (<>
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">{tr("s4")}</p>
            <h2 className="font-display text-4xl md:text-6xl mb-3 italic">{tr("s4_title")}</h2>
            <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">{tr("s4_sub")}</p>
            <div className="space-y-10">
              {characters.map((char,idx)=>(
                <div key={idx} className="border border-border p-6 relative">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-sans-ui">{tr("character")} {idx+1}</span>
                    {idx>0 && <button onClick={()=>setCharacters(prev=>prev.filter((_,i)=>i!==idx))} className="text-muted-foreground hover:text-destructive transition-soft p-1"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                  <Input value={char.name} onChange={e=>updateCharacter(idx,"name",e.target.value)} placeholder={tr("char_name_ph")} className="rounded-none h-14 text-xl font-serif px-0 bg-transparent border-0 border-b-2 border-border focus-visible:ring-0 focus-visible:border-primary mb-2" />
                  <p className="text-xs text-muted-foreground italic font-light mb-8">{tr("char_hint")}</p>
                  {char.name.trim() && (
                    <div className="animate-fade-up space-y-6">
                      <div>
                        <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">{tr("their_personality")} <span className="opacity-60 normal-case tracking-normal">{tr("your_nature_sub")}</span></Label>
                        <div className="flex flex-wrap gap-2">{CHARACTER_TRAITS.map(t=><Tag key={t} active={char.traits.includes(t)} onClick={()=>toggleCharacterTrait(idx,t)}>{t}</Tag>)}</div>
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">{tr("anything_else")} <span className="opacity-60 normal-case tracking-normal">{tr("optional")}</span></Label>
                        <Textarea value={char.notes} onChange={e=>updateCharacter(idx,"notes",e.target.value)} placeholder={tr("char_notes_ph")} rows={2} className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {characters.length<4 && (
              <button onClick={()=>setCharacters(prev=>[...prev,emptyCharacter()])} className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-soft font-sans-ui">
                <Plus className="w-4 h-4" /> {tr("add_character")}
              </button>
            )}
          </>)}

          {/* STEP 5 */}
          {step===5 && (<>
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">{tr("s5")}</p>
            <h2 className="font-display text-4xl md:text-6xl mb-3 italic">{tr("s5_title")}</h2>
            <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">{tr("s5_sub")}</p>
            <div className="space-y-px bg-border">
              {STORY_STARTS.map(s=>(
                <button key={s.id} onClick={()=>setStoryStart(s.id)} onDoubleClick={()=>{setStoryStart(s.id);setTimeout(goNext,0);}}
                  className={cn("w-full p-6 text-left flex items-start gap-4 transition-soft",storyStart===s.id?"bg-primary text-primary-foreground shadow-amber":"bg-background hover:bg-card hover:text-primary")}>
                  <span className={cn("font-display text-3xl w-10 shrink-0",storyStart===s.id?"text-primary-foreground/60":"text-primary/40")}>{s.num}</span>
                  <div><div className="font-display text-xl mb-1">{s.label}</div><div className={cn("text-[10px] uppercase tracking-[0.2em] font-sans-ui",storyStart===s.id?"opacity-80":"text-muted-foreground")}>{s.desc}</div></div>
                </button>
              ))}
            </div>
          </>)}

          {/* STEP 6 */}
          {step===6 && (<>
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">{tr("s6")}</p>
            <h2 className="font-display text-4xl md:text-6xl mb-3 italic">{tr("s6_title")}</h2>
            <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">{tr("s6_sub")}</p>
            <div className="flex flex-wrap gap-3">{TONES.map(t=><Tag key={t} active={tones.includes(t)} onClick={()=>toggle(tones,setTones,t)} onDoubleClick={()=>selectAndAdvance(tones,setTones,t)}>{t}</Tag>)}</div>
            <div className="mt-10">
              <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">{tr("mood_label")} <span className="opacity-60 normal-case tracking-normal">{tr("optional")}</span></Label>
              <Textarea value={toneNotes} onChange={e=>setToneNotes(e.target.value)} placeholder={tr("mood_ph")} rows={3} className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none" />
            </div>
          </>)}

          {/* STEP 7 */}
          {step===7 && (<>
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">{tr("s7")}</p>
            <h2 className="font-display text-4xl md:text-6xl mb-3 italic">{tr("s7_title")}</h2>
            <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">{tr("s7_sub")}</p>
            <div className="space-y-px bg-border mb-8">
              {ENDINGS.map(e=>(
                <button key={e.id} onClick={()=>{setEnding(e.id);setEndingCustom("");}} onDoubleClick={()=>{setEnding(e.id);setEndingCustom("");setTimeout(goNext,0);}}
                  className={cn("w-full p-6 text-left flex items-start gap-4 transition-soft",ending===e.id&&!endingCustom?"bg-primary text-primary-foreground shadow-amber":"bg-background hover:bg-card hover:text-primary")}>
                  <span className={cn("font-display text-3xl w-10 shrink-0",ending===e.id&&!endingCustom?"text-primary-foreground/60":"text-primary/40")}>{e.num}</span>
                  <div><div className="font-display text-xl mb-1">{e.label}</div><div className={cn("text-[10px] uppercase tracking-[0.2em] font-sans-ui",ending===e.id&&!endingCustom?"opacity-80":"text-muted-foreground")}>{e.desc}</div></div>
                </button>
              ))}
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block font-sans-ui">{tr("custom_ending")} <span className="opacity-60 normal-case tracking-normal">{tr("optional")}</span></Label>
              <Textarea value={endingCustom} onChange={e=>{setEndingCustom(e.target.value);if(e.target.value)setEnding("");}} placeholder={tr("ending_ph")} rows={3} className="rounded-none bg-transparent border border-border focus-visible:ring-0 focus-visible:border-primary font-serif text-base resize-none" />
            </div>
          </>)}

          {/* STEP 8 */}
          {step===8 && (<>
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">{tr("s8")}</p>
            <h2 className="font-display text-4xl md:text-6xl mb-3 italic">{tr("s8_title")}</h2>
            <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">{tr("s8_sub")}</p>
            <div className="space-y-px bg-border">
              {LENGTHS.map(l=>(
                <button key={l.id} onClick={()=>setLength(l.id)} onDoubleClick={()=>{setLength(l.id);setTimeout(goNext,0);}} disabled={generating}
                  className={cn("w-full p-6 text-left flex justify-between items-center transition-soft",length===l.id?"bg-primary text-primary-foreground shadow-amber":"bg-background hover:bg-card hover:text-primary")}>
                  <span className="font-display text-2xl">{l.label}</span>
                  <span className={cn("text-[10px] uppercase tracking-[0.3em] font-sans-ui",length===l.id?"opacity-90":"text-muted-foreground")}>{l.desc}</span>
                </button>
              ))}
            </div>
          </>)}

          {/* STEP 9 */}
          {step===9 && (<>
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary mb-3 font-sans-ui">{tr("s9")}</p>
            <h2 className="font-display text-4xl md:text-6xl mb-3 italic">{tr("s9_title")}</h2>
            <p className="text-muted-foreground mb-10 font-light text-sm md:text-base">{tr("s9_sub")}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
              {LANGUAGES.map(l=>(
                <button key={l.id} onClick={()=>setLanguage(l.id)} onDoubleClick={()=>{setLanguage(l.id);setTimeout(handleGenerate,0);}} disabled={generating}
                  className={cn("p-5 text-left transition-soft",language===l.id?"bg-primary text-primary-foreground shadow-amber":"bg-background hover:bg-card hover:text-primary")}>
                  <div className="font-display text-xl">{l.label}</div>
                  <div className={cn("text-[10px] uppercase tracking-[0.3em] mt-1 font-sans-ui",language===l.id?"opacity-90":"text-muted-foreground")}>{l.id}</div>
                </button>
              ))}
            </div>
          </>)}

        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-border sticky bottom-0 md:static bg-background/95 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none pb-6 md:pb-0 -mx-4 md:mx-0 px-4 md:px-0">
          <Button variant="ghost" onClick={()=>setStep(s=>Math.max(1,s-1))} disabled={step===1||generating} className="text-[11px] uppercase tracking-[0.3em] hover:text-primary hover:bg-transparent font-sans-ui">
            <ArrowLeft className="w-4 h-4 mr-2" /> {tr("back")}
          </Button>
          {step<TOTAL_STEPS ? (
            <button onClick={goNext} disabled={!canNext()} className="group flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-foreground hover:text-primary disabled:opacity-30 transition-soft font-sans-ui">
              {tr("continue_btn")} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-soft" />
            </button>
          ) : (
            <HeartButton glow onClick={handleGenerate} disabled={generating}>
              {generating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{tr("writing")}</> : tr("write")}
            </HeartButton>
          )}
        </div>
      </main>
    </div>
  );
};

export default Create;
