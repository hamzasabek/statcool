import { frenchTypo } from '../i18n.jsx'

// Texts of the Home page (the concept) and the About page.

export const HOME = {
  en: {
    eyebrow: 'Statistics for psychologists',
    title: 'Learn statistics with data you make yourself',
    lead: 'StatsCool is a set of short games based on classic psychology experiments. You play, every action becomes a dot, and the dots grow into the graph that explains the idea.',
    start: 'Start playing →',
    about: 'About StatsCool',
    heroCaption: 'Every dot is one try at stopping a clock at 2 seconds. Together, they draw a bell.',
    heroAria: 'Dots drop one by one and pile up into a bell-shaped curve.',
    target: '2 s',
    howTitle: 'How it works',
    how: [
      {
        title: 'Play a short game',
        text: 'Stop a hidden clock, react to a flash, judge an illusion. Each game takes a few minutes.',
      },
      {
        title: 'Your actions become data',
        text: 'Every press, tap or choice drops a dot on a live graph. The data is yours, not a textbook’s.',
      },
      {
        title: 'The graph shows the idea',
        text: 'Your dots draw a bell, a long tail or a binomial shape, and short guided steps explain what it means.',
      },
    ],
    whyTitle: 'What makes it different',
    why: [
      {
        title: 'Real experiments',
        text: 'Each game recreates a classic study from psychology: time estimation, visual illusions, reaction times, neurons.',
      },
      {
        title: 'One idea at a time',
        text: 'A guide points at one thing at a time, and each step says one short sentence. No wall of formulas.',
      },
      {
        title: 'Free and private',
        text: 'No account and no tracking. What you do in a game stays in your browser.',
      },
    ],
    topicsTitle: 'The topics',
    topicsMore: 'See all topics →',
    endTitle: 'Your first dot is one tap away.',
    endButton: 'Start with “Your inner clock” →',
  },
  fr: frenchTypo({
    eyebrow: 'Les statistiques pour les psychologues',
    title: 'Apprenez les statistiques avec vos propres données',
    lead: 'StatsCool est un ensemble de petits jeux inspirés d’expériences classiques de psychologie. Vous jouez, chaque action devient un point, et les points forment le graphique qui explique l’idée.',
    start: 'Commencer à jouer →',
    about: 'À propos de StatsCool',
    heroCaption: 'Chaque point est un essai pour arrêter une horloge à 2 secondes. Ensemble, ils dessinent une cloche.',
    heroAria: 'Des points tombent un à un et s’empilent en une courbe en cloche.',
    target: '2 s',
    howTitle: 'Comment ça marche',
    how: [
      {
        title: 'Jouez à un petit jeu',
        text: 'Arrêtez une horloge cachée, réagissez à un flash, jugez une illusion. Chaque jeu dure quelques minutes.',
      },
      {
        title: 'Vos actions deviennent des données',
        text: 'Chaque appui, chaque toucher, chaque choix fait tomber un point sur un graphique en direct. Les données sont les vôtres, pas celles d’un manuel.',
      },
      {
        title: 'Le graphique montre l’idée',
        text: 'Vos points dessinent une cloche, une longue traîne ou une forme binomiale, et de courtes étapes guidées expliquent ce que cela veut dire.',
      },
    ],
    whyTitle: 'Ce qui le rend différent',
    why: [
      {
        title: 'De vraies expériences',
        text: 'Chaque jeu reprend une étude classique de psychologie : estimation du temps, illusions visuelles, temps de réaction, neurones.',
      },
      {
        title: 'Une idée à la fois',
        text: 'Un guide montre une seule chose à la fois, et chaque étape tient en une phrase courte. Pas de mur de formules.',
      },
      {
        title: 'Gratuit et privé',
        text: 'Pas de compte, pas de pistage. Ce que vous faites dans un jeu reste dans votre navigateur.',
      },
    ],
    topicsTitle: 'Les thèmes',
    topicsMore: 'Voir tous les thèmes →',
    endTitle: 'Votre premier point est à un toucher.',
    endButton: 'Commencer par « Votre horloge interne » →',
  }),
}

// Link texts are separate so the page can put them in <a> tags.
export const ABOUT = {
  en: {
    title: 'About StatsCool',
    lead: 'StatsCool is a free, open-source website that teaches statistics to psychologists through short games built on classic psychology experiments.',
    whyTitle: 'Why',
    why: 'Statistics is often taught with formulas and someone else’s data. Here you make the data yourself, and the idea appears on the graph while you play. When the dots are your own, the idea sticks.',
    expTitle: 'The experiments behind the games',
    sep: ': ',
    experiments: [
      ['Your inner clock', 'time estimation. The longer the time you estimate, the bigger your errors, in proportion (Weber’s law for time).'],
      ['The Müller-Lyer illusion', 'Franz Müller-Lyer, 1889. A line with outward fins looks longer than a plain line of the same length.'],
      ['Reaction time', 'one of the oldest measures in experimental psychology. Reaction times have a floor but no ceiling, so they always trail off to the right.'],
      ['Listen to a neuron', 'neurons fire at irregular moments. A simple model is a random (Poisson) process, whose waits follow the exponential distribution.'],
      ['The Ebbinghaus illusion', 'Hermann Ebbinghaus. A circle surrounded by small circles looks bigger than the same circle surrounded by big ones.'],
    ],
    inspTitle: 'Inspiration',
    inspBefore: 'StatsCool is inspired by the interactive visualisations of Kristoffer Magnusson at ',
    inspAfter: '.',
    privacyTitle: 'Privacy',
    privacy: 'No account, no ads, no tracking. What you do in a game stays in your browser and is gone when you leave the page. Only your language, your theme and which guides you have seen are saved, on your own device. The fonts are loaded from Google Fonts.',
    openTitle: 'Open source',
    openBefore: 'The code is free to reuse under the MIT license. It is on ',
    github: 'GitHub',
    openAfter: '. Made by Hamza Sabek.',
    builtTitle: 'Built with',
    built: 'React, Vite, D3 and Motion. Fonts: Fraunces and Inter.',
    contactTitle: 'Contact',
    contactBefore: 'Found a bug, or have an idea for a game? ',
    issue: 'Open an issue on GitHub',
    contactAfter: '.',
    play: 'Play the games →',
  },
  fr: frenchTypo({
    title: 'À propos de StatsCool',
    lead: 'StatsCool est un site gratuit et open source qui enseigne les statistiques aux psychologues par de petits jeux inspirés d’expériences classiques de psychologie.',
    whyTitle: 'Pourquoi',
    why: 'Les statistiques s’apprennent souvent avec des formules et les données de quelqu’un d’autre. Ici, vous créez vous-même les données, et l’idée apparaît sur le graphique pendant que vous jouez. Quand les points sont les vôtres, l’idée reste.',
    expTitle: 'Les expériences derrière les jeux',
    sep: ' : ',
    experiments: [
      ['Votre horloge interne', 'l’estimation du temps. Plus la durée à estimer est longue, plus vos erreurs grandissent, en proportion (la loi de Weber pour le temps).'],
      ['L’illusion de Müller-Lyer', 'Franz Müller-Lyer, 1889. Une ligne avec des pointes vers l’extérieur paraît plus longue qu’une ligne simple de même longueur.'],
      ['Temps de réaction', 'l’une des plus anciennes mesures de la psychologie expérimentale. Les temps de réaction ont un plancher mais pas de plafond, donc ils s’étirent toujours vers la droite.'],
      ['Écoutez un neurone', 'les neurones déchargent à des moments irréguliers. Un modèle simple est un processus aléatoire (de Poisson), dont les attentes suivent la loi exponentielle.'],
      ['L’illusion d’Ebbinghaus', 'Hermann Ebbinghaus. Un cercle entouré de petits cercles paraît plus grand que le même cercle entouré de grands.'],
    ],
    inspTitle: 'Inspiration',
    inspBefore: 'StatsCool s’inspire des visualisations interactives de Kristoffer Magnusson sur ',
    inspAfter: '.',
    privacyTitle: 'Vie privée',
    privacy: 'Pas de compte, pas de publicité, pas de pistage. Ce que vous faites dans un jeu reste dans votre navigateur et disparaît quand vous quittez la page. Seuls votre langue, votre thème et les guides déjà vus sont enregistrés, sur votre propre appareil. Les polices sont chargées depuis Google Fonts.',
    openTitle: 'Open source',
    openBefore: 'Le code est libre de réutilisation sous licence MIT. Il est sur ',
    github: 'GitHub',
    openAfter: '. Créé par Hamza Sabek.',
    builtTitle: 'Construit avec',
    built: 'React, Vite, D3 et Motion. Polices : Fraunces et Inter.',
    contactTitle: 'Contact',
    contactBefore: 'Vous avez trouvé un bug, ou une idée de jeu ? ',
    issue: 'Ouvrez une issue sur GitHub',
    contactAfter: '.',
    play: 'Jouer aux jeux →',
  }),
}
