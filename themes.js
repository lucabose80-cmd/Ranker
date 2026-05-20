// themes.js – Freischaltbare Farbthemen
// condition: { type: 'tag_ranked', tag: 'sith', required: 5 }
// = "Ranke 5 Charaktere mit diesem Tag"

export const THEMES = {
    starwars: [
        {
            id: 'sw_theme_default',
            name: 'Standard',
            description: 'Das klassische Blau des Jedi-Ordens.',
            cssClass: '',           // kein extra CSS class = default
            condition: null,        // immer verfügbar
            preview: '#3b82f6'
        },
        {
            id: 'sw_theme_sith',
            name: 'Sith',
            description: 'Die Dunkelheit der Sith – freischaltbar wenn du 5 Sith gerankt hast.',
            cssClass: 'theme-sith',
            condition: { type: 'tag_ranked', tag: 'sith', required: 5 },
            preview: '#dc2626'
        }
    ],
    waifu: [
        // Zukünftige Waifu-Themes hier
    ]
};
