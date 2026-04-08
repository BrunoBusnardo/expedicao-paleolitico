import { Question } from './types';

export const PALEO_TIPS = [
  "O Paleolítico é conhecido como a Idade da Pedra Lascada.",
  "Os seres humanos eram nômades, ou seja, não tinham moradia fixa.",
  "A alimentação baseava-se na caça, pesca e coleta de frutos e raízes.",
  "O controle do fogo foi uma das maiores conquistas da humanidade.",
  "As ferramentas eram feitas de pedra, osso e madeira.",
  "As pinturas rupestres eram feitas nas paredes das cavernas.",
  "A pele de animais era usada para fazer roupas e tendas.",
  "Os grupos eram pequenos para facilitar o deslocamento.",
  "Vênus de Willendorf é uma famosa escultura desse período.",
  "O clima era muito mais frio, com períodos de glaciação.",
  "Não existia agricultura nem criação de animais ainda.",
  "A comunicação era feita por sons, gestos e pinturas.",
  "O fogo servia para aquecer, iluminar e espantar predadores.",
  "As cavernas serviam de abrigo temporário contra o frio e animais.",
  "A expectativa de vida era muito menor do que a de hoje.",
  "A divisão do trabalho costumava ser por idade e sexo.",
  "Os primeiros rituais funerários surgiram no Paleolítico.",
  "O Homo sapiens conviveu com os Neandertais por um tempo.",
  "A arte rupestre usava pigmentos naturais como terra e carvão.",
  "As ferramentas de pedra eram afiadas batendo uma pedra na outra.",
  "A pesca era feita com as mãos ou com lanças simples.",
  "O nomadismo dependia da disponibilidade de comida na região.",
  "A linguagem complexa permitiu a transmissão de conhecimentos.",
  "A cooperação era essencial para caçar animais grandes.",
  "O arco e flecha só surgiram no final deste período.",
  "As agulhas de osso permitiram costurar roupas melhores.",
  "O Paleolítico durou cerca de 2,5 milhões de anos.",
  "Os seres humanos migraram da África para outros continentes.",
  "A dieta era rica em proteínas e fibras naturais.",
  "Não existia escrita; a história era passada oralmente.",
  "O termo 'Paleolítico' vem do grego: palaios (antigo) e lithos (pedra).",
  "A música provavelmente existia, usando flautas de osso.",
  "As ferramentas tornaram-se mais sofisticadas ao longo do tempo.",
  "O fogo permitiu cozinhar alimentos, facilitando a digestão.",
  "A observação da natureza era vital para a sobrevivência.",
  "Os grupos seguiam as migrações dos grandes rebanhos.",
  "A luz do dia ditava o ritmo das atividades da tribo.",
  "A solidariedade entre os membros era a base da sociedade.",
  "Cada ferramenta tinha uma função: raspar, cortar ou furar.",
  "O fim do Paleolítico deu lugar ao período Neolítico."
];

export const QUESTIONS: Question[] = [
  {
    id: 1,
    title: "Onde vocês estão?",
    narrative: "O sol começa a nascer. O vento frio entra pela entrada de uma caverna. Vocês acordam. O grupo é pequeno. Alguns são crianças. Outros já são velhos. Vocês vivem ali há alguns dias… mas não sabem se poderão ficar por muito tempo. Lá fora existe uma grande floresta e um rio próximo.",
    subQuestions: [
      "O lugar onde vocês vivem é quente ou frio?",
      "Tem rios ou não?",
      "Tem montanhas, florestas ou planícies?",
      "Como é a vegetação?",
      "Quantas pessoas existem no grupo (10-30)?"
    ],
    suggestions: ["Frio", "Rio próximo", "Floresta densa", "Caverna úmida", "20 pessoas"],
    objective: "Perceber que o ambiente condiciona a vida humana.",
    concept: "Adaptação ao meio"
  },
  {
    id: 2,
    title: "Como vocês lidam com o clima?",
    narrative: "O vento sopra forte. À noite faz frio. Às vezes chove muito. Vocês precisam sobreviver.",
    subQuestions: [
      "Onde vocês dormem? (Cavernas, galhos, árvores?)",
      "Vocês usam peles de animais?",
      "Vocês fazem fogo?"
    ],
    suggestions: ["Caverna profunda", "Peles de bisão", "Fogo para aquecer", "Cabanas de galhos"],
    objective: "Entender estratégias de adaptação.",
    concept: "Sobrevivência"
  },
  {
    id: 3,
    title: "A Fome Chega",
    narrative: "As crianças choram. Os mais velhos estão cansados. Não há mais comida guardada. O grupo precisa sair para procurar alimento. Alguns pegam pedras afiadas. Outros carregam cestos feitos de galhos.",
    subQuestions: [
      "Vocês caçam ou coletam?",
      "O que vocês comem?",
      "Que ferramentas vocês usam? (Pedra, osso, madeira?)",
      "Quem sai para buscar comida?"
    ],
    suggestions: ["Coleta de frutos", "Caça de veados", "Lanças de madeira", "Pedras lascadas", "Divisão de tarefas"],
    objective: "Economia de subsistência.",
    concept: "Subsistência"
  },
  {
    id: 4,
    title: "O Perigo",
    narrative: "No meio da busca… um barulho. Pegadas enormes aparecem no chão. Um animal selvagem está por perto. O grupo precisa decidir rápido o que fazer.",
    subQuestions: [
      "O grupo foge ou enfrenta o animal?",
      "Eles usam fogo ou armas?",
      "O grupo se separa ou fica unido?",
      "Alguém se machuca?"
    ],
    suggestions: ["Usar fogo para espantar", "Fugir para a caverna", "Ficar unidos", "Armadilhas de galhos"],
    objective: "Perceber a importância do grupo.",
    concept: "Cooperação"
  },
  {
    id: 5,
    title: "A Mudança",
    narrative: "Dias passam. O clima começa a mudar. O frio aumenta. Os frutos ficam mais difíceis de encontrar. Os animais parecem ter ido embora.",
    subQuestions: [
      "O grupo decide ficar ou ir embora?",
      "Para onde eles vão?",
      "Como transportam seus objetos?",
      "O grupo discute ou alguém manda?"
    ],
    suggestions: ["Seguir o rio", "Migrar para o sul", "Levar peles e ferramentas", "Decisão coletiva"],
    objective: "Conceito de Nomadismo.",
    concept: "Nomadismo"
  },
  {
    id: 6,
    title: "A Cultura",
    narrative: "Depois de uma longa caminhada… o grupo encontra um novo abrigo. À noite, todos se sentam ao redor do fogo. Um dos membros começa a desenhar na parede da caverna.",
    subQuestions: [
      "Como vocês registram a história? (Desenhos, histórias faladas?)",
      "O que vocês desenham?",
      "Qual a importância de contar histórias para o grupo?"
    ],
    suggestions: ["Pintura rupestre", "Sangue de animal e carvão", "Histórias de caça", "Respeito aos velhos"],
    objective: "Arte rupestre e memória coletiva.",
    concept: "Cultura"
  },
  {
    id: 7,
    title: "O Encontro",
    narrative: "O grupo encontra outro grupo humano. O que acontece?",
    subQuestions: [
      "Sentem medo ou curiosidade?",
      "Trocam alimentos ou ferramentas?",
      "Aprendem algo novo?"
    ],
    suggestions: ["Troca de ferramentas", "Curiosidade", "Paz entre grupos", "Aprender nova técnica"],
    objective: "Interação entre grupos humanos.",
    concept: "Socialização"
  }
];
