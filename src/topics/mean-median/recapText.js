import { frenchTypo } from '../../i18n.jsx'

// Texts of topic 01's recap sheet (MeanRecap.jsx).

export const RECAP = {
  en: {
    title: 'Recap sheet',
    subtitle: 'Everything from this topic on one page',
    odd: 'n odd',
    even: 'n even',
    modeArg: 'the',
    modeMax: 'with the largest',
    meanTitle: 'Mean: the balance point',
    meanText:
      'Add all the values, divide by n. x̄ is the mean of a sample (your tries); the mean of a whole population is written μ and is usually unknown: x̄ estimates it, and changes a little from one sample to the next. Every value counts, so extreme values pull it.',
    medianTitle: 'Median: the middle value',
    medianText:
      'Put the values in order (x₍₁₎ ≤ … ≤ x₍ₙ₎) and take the middle one, or halfway between the two middle ones. Half the values are below it, half above. Extreme values hardly move it: it is robust.',
    modeTitle: 'Mode: the most common value',
    modeText:
      'The value with the largest frequency f(x). There can be several (two peaks: bimodal). By the usual convention, no mode if every value appears once. For measured data (times, lengths) the mode only exists once values are grouped, and it depends on the grouping.',
    scalesTitle: 'Which centre for which data?',
    colScale: 'Level of measurement',
    colExamples: 'Examples',
    colCentres: 'Centres you can give',
    scales: [
      { name: 'Nominal', what: 'categories, no order', examples: 'colours, diagnoses, yes / no', centres: 'Mode only.' },
      { name: 'Ordinal', what: 'an order, no equal distances', examples: 'ranks, “never … always”, one Likert item', centres: 'Median and mode. A mean is debated for a single item.' },
      { name: 'Interval / ratio', what: 'equal distances (ratio: a true zero)', examples: 'reaction times, lengths, test scores', centres: 'Mean and median; the mode for whole numbers (spans, errors), or once measured values are grouped.' },
    ],
    scalesNote: 'The four levels come from a psychologist, S. S. Stevens (1946). Averaging a scale made of many Likert items is common practice and usually reasonable; for a single item, prefer the median.',
    whichTitle: 'Which one to report?',
    which: [
      'Symmetric data with one peak: the mean (and the median and the mode agree anyway).',
      'Skewed data or a few extreme values (salaries, reaction times): the median, or a trimmed mean.',
      'A 20 % trimmed mean drops the lowest and highest 20 % and averages the rest: a robust compromise widely used in psychology (Wilcox & Keselman, 2003). It usually lies between the mean and the median, but not always.',
      'Categories: the mode. Two peaks: give both modes, or show the chart.',
      'Comparing groups: usually the mean (or the median if the data are skewed), always with n.',
    ],
    pitfallsTitle: 'Pitfalls',
    pitfalls: [
      'Mean > median usually means a tail to the right, but not always, especially with whole-number data (von Hippel, 2005).',
      'Mean = median does not mean “one peak in the middle”: a split group has the same mean and median, and nobody near them.',
      'A mean need not be a possible value (6.2 digits): it is still a sound estimate.',
      'A median needs the values in order: the middle of the list as written is not the median.',
      'Your mean is a sample’s mean: play again and it changes a little.',
    ],
    reportTitle: 'How to report it (APA style)',
    reportExample: 'Reaction times: M = 365.5 ms, Mdn = 327 ms, n = 16.',
    reportNote: 'M for the mean, Mdn for the median (in italics in a paper). Give n, and say which centre you used when the data are skewed. Add a measure of spread (topic 02).',
  },
  fr: frenchTypo({
    title: 'Fiche récapitulative',
    subtitle: 'Tout ce thème sur une seule page',
    odd: 'n impair',
    even: 'n pair',
    modeArg: 'le',
    modeMax: 'de plus grand',
    meanTitle: 'Moyenne : le point d’équilibre',
    meanText:
      'Additionnez toutes les valeurs, divisez par n. x̄ est la moyenne d’un échantillon (vos essais) ; la moyenne d’une population entière s’écrit μ et est en général inconnue : x̄ l’estime, et change un peu d’un échantillon à l’autre. Chaque valeur compte : les valeurs extrêmes la tirent.',
    medianTitle: 'Médiane : la valeur du milieu',
    medianText:
      'Rangez les valeurs dans l’ordre (x₍₁₎ ≤ … ≤ x₍ₙ₎) et prenez celle du milieu, ou le milieu entre les deux du centre. La moitié des valeurs est en dessous, la moitié au-dessus. Les valeurs extrêmes la bougent à peine : elle est robuste.',
    modeTitle: 'Mode : la valeur la plus fréquente',
    modeText:
      'La valeur de plus grande fréquence f(x). Il peut y en avoir plusieurs (deux pics : bimodal). Par convention, pas de mode si chaque valeur apparaît une fois. Pour des données mesurées (temps, longueurs), le mode n’existe qu’une fois les valeurs regroupées, et il dépend du regroupement.',
    scalesTitle: 'Quel centre pour quelles données ?',
    colScale: 'Niveau de mesure',
    colExamples: 'Exemples',
    colCentres: 'Centres possibles',
    scales: [
      { name: 'Nominal', what: 'des catégories, sans ordre', examples: 'couleurs, diagnostics, oui / non', centres: 'Le mode seulement.' },
      { name: 'Ordinal', what: 'un ordre, sans distances égales', examples: 'rangs, « jamais … toujours », un item de Likert', centres: 'Médiane et mode. Une moyenne est discutée pour un seul item.' },
      { name: 'Intervalle / rapport', what: 'des distances égales (rapport : un vrai zéro)', examples: 'temps de réaction, longueurs, scores à un test', centres: 'Moyenne et médiane ; le mode pour des nombres entiers (empans, erreurs), ou une fois les valeurs mesurées regroupées.' },
    ],
    scalesNote: 'Les quatre niveaux viennent d’un psychologue, S. S. Stevens (1946). Faire la moyenne d’une échelle de plusieurs items de Likert est une pratique courante et en général raisonnable ; pour un seul item, préférez la médiane.',
    whichTitle: 'Lequel donner ?',
    which: [
      'Données symétriques à un seul pic : la moyenne (la médiane et le mode sont d’accord de toute façon).',
      'Données asymétriques ou quelques valeurs extrêmes (salaires, temps de réaction) : la médiane, ou une moyenne tronquée.',
      'Une moyenne tronquée à 20 % retire les 20 % les plus bas et les 20 % les plus hauts, puis fait la moyenne du reste : un compromis robuste très utilisé en psychologie (Wilcox & Keselman, 2003). Elle se place en général entre la moyenne et la médiane, mais pas toujours.',
      'Des catégories : le mode. Deux pics : donnez les deux modes, ou montrez le graphique.',
      'Comparer des groupes : en général la moyenne (ou la médiane si les données sont asymétriques), toujours avec n.',
    ],
    pitfallsTitle: 'Pièges',
    pitfalls: [
      'Moyenne > médiane signale en général une traîne à droite, mais pas toujours, surtout avec des nombres entiers (von Hippel, 2005).',
      'Moyenne = médiane ne veut pas dire « un pic au milieu » : un groupe partagé a la même moyenne et la même médiane, et personne autour.',
      'Une moyenne n’est pas forcément une valeur possible (6,2 chiffres) : c’est pourtant une estimation solide.',
      'Une médiane demande les valeurs rangées : le milieu de la liste telle qu’elle est écrite n’est pas la médiane.',
      'Votre moyenne est celle d’un échantillon : rejouez et elle change un peu.',
    ],
    reportTitle: 'Comment l’écrire (style APA)',
    reportExample: 'Temps de réaction : M = 365,5 ms, Mdn = 327 ms, n = 16.',
    reportNote: 'M pour la moyenne, Mdn pour la médiane (en italique dans un article). Donnez n, et dites quel centre vous utilisez quand les données sont asymétriques. Ajoutez une mesure de dispersion (thème 02).',
  }),
}
