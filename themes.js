// themes.js – Freischaltbare Farbthemen
// condition: { type: 'tag_full_team', tag: 'sith' }
// = "Ranke 5 Charaktere mit diesem Tag im selben Spiel"

export const THEMES = {
    starwars: [
        {
            id: 'sw_theme_default',
            name: 'Standard',
            description: 'Das klassische Blau des Jedi-Ordens.',
            cssClass: '',
            condition: null,
            preview: '#3b82f6'
        },
        {
            id: 'sw_theme_sith',
            name: 'Sith',
            description: 'Die dunkle Seite der Macht.',
            cssClass: 'theme-sith',
            condition: { type: 'tag_full_team', tag: 'sith' },
            preview: '#dc2626'
        },
        {
            id: 'sw_theme_klon',
            name: 'Klone',
            description: 'Die Ehre der Klonarmee – reine weiße Rüstung.',
            cssClass: 'theme-klon',
            condition: { type: 'tag_full_team', tag: 'klon' },
            preview: '#e2e8f0'
        },
        {
            id: 'sw_theme_rebell',
            name: 'Rebellion',
            description: 'Möge die Macht mit uns sein – für die Galaxis!',
            cssClass: 'theme-rebell',
            condition: { type: 'tag_full_team', tag: 'rebell' },
            preview: '#16a34a'
        }
    ],
    waifu: [
        // Zukünftige Waifu-Themes hier
    ]
};
