import { frenchTypo } from '../../i18n.jsx'

// Texts of the game "Pick a random number" (BlueSeven, CategoryChart), topic 01.
// Numbers arrive already formatted.

export const BLUE = {
  en: {
    title: 'Pick a random number',
    steps: ['Choose', 'The crowd', 'Colours'],
    // 1. Choose
    sayStrong: 'Two quick questions. Don’t think too long:',
    say: 'go with the first answer that comes.',
    qNumber: 'Pick a digit from 0 to 9, at random.',
    qColour: 'Now name a colour: the first one that comes to mind.',
    yourAnswers: (n, c) => `Your answers: ${n} and ${c}.`,
    pickBoth: 'Answer both questions to go on.',
    nextCrowd: 'Next: the crowd →',
    colours: {
      blue: 'blue', red: 'red', green: 'green', purple: 'purple', black: 'black',
      orange: 'orange', yellow: 'yellow', pink: 'pink', white: 'white', brown: 'brown',
    },
    // 2. The crowd
    crowdStrong: (share) => `${share} of people picked 7. If they really chose at random, each digit would get 10%.`,
    crowdSay: 'The most common answer is the mode.',
    keyCrowd: '200 people + you',
    keyYou: 'You',
    keyMode: 'Mode',
    keyChance: 'If chosen at random',
    youSeven: 'You picked 7 too, like more than a quarter of people.',
    youOther: (n) => `You picked ${n}. Most people did not choose at random either: 7 “feels” the most random.`,
    crowdFact: (md, mn) =>
      `The median (${md}) and the mean (${mn}) answer another question: where is the middle of all the numbers? Only the mode answers “which number do people pick?”.`,
    markMode: (v) => `mode ${v}`,
    markMedian: (v) => `median ${v}`,
    markMean: (v) => `mean ${v}`,
    chance: 'if random: 20 each',
    you: 'you',
    nextColours: 'Next: colours →',
    // 3. Colours
    coloursStrong: (c, share) => `The mode is ${c}: ${share} of people.`,
    coloursSay: 'Colours are categories: they have a mode, and nothing else.',
    noMedian: 'Median colour? Colours have no order, so there is no “middle” one.',
    meanTitle: 'Mean colour? Mix everyone’s colour like paint:',
    meanSwatch: 'the “mean colour”',
    meanFact: 'a muddy shade that nobody chose. For categories, the mode is the only centre that makes sense.',
    youColour: (c) => `You said ${c}.`,
    crowdNote: 'Simulated crowd, shaped like real studies: 28% of 1,770 people chose 7 from 0 to 9 (Kubovy & Psotka, 1976); more than two in five US college students named blue (Simon, 1971). Mostly US students: elsewhere the effect is weaker or disputed.',
    aria: (what) => `Bar chart of ${what}`,
    ariaNumbers: 'the numbers picked by 201 people',
    ariaColours: 'the colours named by 201 people',
    tourPlay: 'Let’s go!',
    // guided tour (Tour.jsx): one bubble per thing, in the order of TOUR_TARGETS in BlueSeven.jsx
    tour: {
      choose: [
        { title: 'Pick a random number', text: 'Two quick questions: a digit from 0 to 9 at random, and a colour. Then you see what 200 other people answered.' },
        { title: 'Your answers', text: 'Tap a number, then a colour. You can change your mind before going on.' },
        { title: 'Three steps', text: 'First choose, then look at the crowd’s numbers, then at their colours.' },
      ],
      crowd: [
        { title: '201 answers', text: 'Each bar counts the people who picked that number. Your answer is marked “you”.' },
        { title: 'If it were random', text: 'The dashed line is what each number would get if people really chose at random: 20 each. One number towers over it.' },
        { title: 'Three centres', text: 'The highlighted column is the mode. The dashed and solid lines are the median and the mean: they say where the middle of the numbers is, not which one people pick.' },
      ],
      colours: [
        { title: 'Colours', text: 'Each bar counts the people who named that colour. The highlighted one is the mode.' },
        { title: 'The “mean colour”', text: 'Mixing everyone’s colour gives this: a centre that nobody chose.' },
      ],
    },
  },
  fr: frenchTypo({
    title: 'Choisissez un nombre au hasard',
    steps: ['Choisir', 'La foule', 'Couleurs'],
    sayStrong: 'Deux questions rapides. Ne réfléchissez pas trop :',
    say: 'prenez la première réponse qui vient.',
    qNumber: 'Choisissez un chiffre de 0 à 9, au hasard.',
    qColour: 'Maintenant, citez une couleur : la première qui vous vient.',
    yourAnswers: (n, c) => `Vos réponses : ${n} et ${c}.`,
    pickBoth: 'Répondez aux deux questions pour continuer.',
    nextCrowd: 'Suivant : la foule →',
    colours: {
      blue: 'bleu', red: 'rouge', green: 'vert', purple: 'violet', black: 'noir',
      orange: 'orange', yellow: 'jaune', pink: 'rose', white: 'blanc', brown: 'marron',
    },
    crowdStrong: (share) => `${share} des gens ont choisi 7. S’ils choisissaient vraiment au hasard, chaque chiffre aurait 10\u00a0%.`,
    crowdSay: 'La réponse la plus fréquente est le mode.',
    keyCrowd: '200 personnes + vous',
    keyYou: 'Vous',
    keyMode: 'Mode',
    keyChance: 'Si c’était au hasard',
    youSeven: 'Vous aussi avez choisi 7, comme plus d’un quart des gens.',
    youOther: (n) => `Vous avez choisi ${n}. La plupart des gens ne choisissent pas au hasard non plus : 7 « fait » le plus hasard.`,
    crowdFact: (md, mn) =>
      `La médiane (${md}) et la moyenne (${mn}) répondent à une autre question : où est le milieu de tous les nombres ? Seul le mode répond à « quel nombre les gens choisissent-ils ? ».`,
    markMode: (v) => `mode ${v}`,
    markMedian: (v) => `médiane ${v}`,
    markMean: (v) => `moyenne ${v}`,
    chance: 'au hasard : 20 chacun',
    you: 'vous',
    nextColours: 'Suivant : couleurs →',
    coloursStrong: (c, share) => `Le mode est ${c} : ${share} des gens.`,
    coloursSay: 'Les couleurs sont des catégories : elles ont un mode, et rien d’autre.',
    noMedian: 'Couleur médiane ? Les couleurs n’ont pas d’ordre : il n’y a pas de couleur « du milieu ».',
    meanTitle: 'Couleur moyenne ? Mélangez la couleur de chacun comme de la peinture :',
    meanSwatch: 'la « couleur moyenne »',
    meanFact: 'une teinte boueuse que personne n’a choisie. Pour des catégories, le mode est le seul centre qui ait un sens.',
    youColour: (c) => `Vous avez dit ${c}.`,
    crowdNote: 'Foule simulée, avec la forme de vraies études : 28 % de 1 770 personnes ont choisi 7 entre 0 et 9 (Kubovy et Psotka, 1976) ; plus de deux étudiants américains sur cinq ont cité le bleu (Simon, 1971). Surtout des étudiants américains : ailleurs, l’effet est plus faible ou discuté.',
    aria: (what) => `Diagramme en barres : ${what}`,
    ariaNumbers: 'les nombres choisis par 201 personnes',
    ariaColours: 'les couleurs citées par 201 personnes',
    tourPlay: 'C’est parti !',
    tour: {
      choose: [
        { title: 'Choisissez un nombre au hasard', text: 'Deux questions rapides : un chiffre de 0 à 9 au hasard, et une couleur. Ensuite, vous voyez ce qu’ont répondu 200 autres personnes.' },
        { title: 'Vos réponses', text: 'Touchez un nombre, puis une couleur. Vous pouvez changer d’avis avant de continuer.' },
        { title: 'Trois étapes', text: 'D’abord choisir, puis regarder les nombres de la foule, puis ses couleurs.' },
      ],
      crowd: [
        { title: '201 réponses', text: 'Chaque barre compte les personnes qui ont choisi ce nombre. Votre réponse est marquée « vous ».' },
        { title: 'Si c’était au hasard', text: 'La ligne en pointillé est ce que chaque nombre aurait si les gens choisissaient vraiment au hasard : 20 chacun. Un nombre la dépasse de loin.' },
        { title: 'Trois centres', text: 'La colonne en surbrillance est le mode. Les lignes en pointillé et pleine sont la médiane et la moyenne : elles disent où est le milieu des nombres, pas lequel les gens choisissent.' },
      ],
      colours: [
        { title: 'Couleurs', text: 'Chaque barre compte les personnes qui ont cité cette couleur. Celle en surbrillance est le mode.' },
        { title: 'La « couleur moyenne »', text: 'Mélanger la couleur de chacun donne ceci : un centre que personne n’a choisi.' },
      ],
    },
  }),
}
