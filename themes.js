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
        },
        { id: 'sw_theme_padawan', name: 'Padawan', description: 'Der Beginn einer Reise (5 Padawane)', cssClass: 'theme-padawan', condition: { type: 'tag_full_team', tag: 'padawan', count: 5 }, preview: '#87CEFA' },
        { id: 'sw_theme_meister', name: 'Jedi Meister', description: 'Die Weisheit des Rates (5 Jedi Meister)', cssClass: 'theme-meister', condition: { type: 'tag_full_team', tag: 'meister', count: 5 }, preview: '#00008B' },
        { id: 'sw_theme_inquisitor', name: 'Inquisitoren', description: 'Jäger der Jedi (5 Inquisitoren)', cssClass: 'theme-inquisitor', condition: { type: 'tag_full_team', tag: 'inquisitor', count: 5 }, preview: '#8B0000' },
        { id: 'sw_theme_grau', name: 'Graue Macht', description: 'Zwischen Hell und Dunkel (5 Graue Machtnutzer)', cssClass: 'theme-grau', condition: { type: 'tag_full_team', tag: 'grau', count: 5 }, preview: '#808080' },
        { id: 'sw_theme_nachtschwester', name: 'Nachtschwestern', description: 'Magie von Dathomir (5 Nachtschwestern)', cssClass: 'theme-nachtschwester', condition: { type: 'tag_full_team', tag: 'nachtschwester', count: 5 }, preview: '#800080' },
        { id: 'sw_theme_dathomir', name: 'Dathomir', description: 'Heimat der Hexen (5 Dathomir)', cssClass: 'theme-dathomir', condition: { type: 'tag_full_team', tag: 'dathomir', count: 5 }, preview: '#be185d' },
        { id: 'sw_theme_501st', name: '501. Legion', description: 'Vaders Faust (5 Klone der 501.)', cssClass: 'theme-501st', condition: { type: 'tag_full_team', tag: '501st', count: 5 }, preview: 'linear-gradient(45deg, #0000ff 25%, #ffffff 25%, #ffffff 50%, #0000ff 50%, #0000ff 75%, #ffffff 75%, #ffffff 100%)' },
        { id: 'sw_theme_212th', name: '212. Legion', description: 'Kenobis Stolz (5 Klone der 212.)', cssClass: 'theme-212th', condition: { type: 'tag_full_team', tag: '212th', count: 5 }, preview: 'linear-gradient(45deg, #ffa500 25%, #ffffff 25%, #ffffff 50%, #ffa500 50%, #ffa500 75%, #ffffff 75%, #ffffff 100%)' },
        { id: 'sw_theme_coruscant_guard', name: 'Coruscant Wache', description: 'Schutz des Senats (Beide Wachen)', cssClass: 'theme-coruscant-guard', condition: { type: 'tag_full_team', tag: 'coruscant_guard', count: 2 }, preview: 'linear-gradient(45deg, #ff0000 25%, #ffffff 25%, #ffffff 50%, #ff0000 50%, #ff0000 75%, #ffffff 75%, #ffffff 100%)' },
        { id: 'sw_theme_bad_batch', name: 'Bad Batch', description: 'Schaden-Charge (5 Bad Batch)', cssClass: 'theme-bad-batch', condition: { type: 'tag_full_team', tag: 'bad_batch', count: 5 }, preview: '#1a1a1a' },
        { id: 'sw_theme_arc', name: 'ARC Trooper', description: 'Die Elite (5 ARC Trooper)', cssClass: 'theme-arc', condition: { type: 'tag_full_team', tag: 'arc', count: 5 }, preview: '#0055ff' },
        { id: 'sw_theme_mandalorian', name: 'Mandalorianer', description: 'Das ist der Weg (5 Mandalorianer)', cssClass: 'theme-mandalorian', condition: { type: 'tag_full_team', tag: 'mandalorian', count: 5 }, preview: '#FF8C00' },
        { id: 'sw_theme_death_watch', name: 'Death Watch', description: 'Für Mandalore (5 Death Watch)', cssClass: 'theme-death-watch', condition: { type: 'tag_full_team', tag: 'death_watch', count: 5 }, preview: 'linear-gradient(45deg, #ff0000 25%, #000000 25%, #000000 50%, #ff0000 50%, #ff0000 75%, #000000 75%, #000000 100%)' },
        { id: 'sw_theme_kopfgeld', name: 'Kopfgeldjäger', description: 'Für ein paar Credits mehr (5 Kopfgeldjäger)', cssClass: 'theme-kopfgeld', condition: { type: 'tag_full_team', tag: 'kopfgeldjäger', count: 5 }, preview: '#FFA07A' },
        { id: 'sw_theme_unterwelt', name: 'Unterwelt', description: 'Syndikate und Kriminelle (5 Unterwelt)', cssClass: 'theme-unterwelt', condition: { type: 'tag_full_team', tag: 'unterwelt', count: 5 }, preview: '#8A2BE2' },
        { id: 'sw_theme_hutte', name: 'Huttenkartell', description: 'Mächtige Schnecken (5 Hutten)', cssClass: 'theme-hutte', condition: { type: 'tag_full_team', tag: 'hutte', count: 5 }, preview: '#006400' },
        { id: 'sw_theme_imperium', name: 'Imperium', description: 'Ordnung für die Galaxis (5 Imperium)', cssClass: 'theme-imperium', condition: { type: 'tag_full_team', tag: 'imperium', count: 5 }, preview: 'linear-gradient(45deg, #000000 25%, #ffffff 25%, #ffffff 50%, #000000 50%, #000000 75%, #ffffff 75%, #ffffff 100%)' },
        { id: 'sw_theme_heiss', name: 'Hot', description: 'Geheimes Theme', cssClass: 'theme-heiss', condition: { type: 'tag_full_team', tag: 'heiss', count: 5 }, preview: '#FF1493', secret: true },
        { id: 'sw_theme_monster', name: 'Bestien', description: 'Wilde Monster (5 Monster)', cssClass: 'theme-monster', condition: { type: 'tag_full_team', tag: 'monster', count: 5 }, preview: '#8b4513' },
        { id: 'sw_theme_droide', name: 'Droiden', description: 'Maschinen (5 Droiden)', cssClass: 'theme-droide', condition: { type: 'tag_full_team', tag: 'droide', count: 5 }, preview: '#c0c0c0' },
        { id: 'sw_theme_senat', name: 'Galaktischer Senat', description: 'Politiker (5 Senat)', cssClass: 'theme-senat', condition: { type: 'tag_full_team', tag: 'senat', count: 5 }, preview: '#ffd700' },
        { id: 'sw_theme_widerstand', name: 'Widerstand', description: 'Der Funke (5 Widerstand)', cssClass: 'theme-widerstand', condition: { type: 'tag_full_team', tag: 'widerstand', count: 5 }, preview: '#d2691e' },
        { id: 'sw_theme_separatist', name: 'Separatisten', description: 'KUS (5 Separatisten)', cssClass: 'theme-separatist', condition: { type: 'tag_full_team', tag: 'separatist', count: 5 }, preview: '#00ced1' },
        { id: 'sw_theme_schmuggel', name: 'Schmuggler', description: 'Gauner (5 Schmuggler)', cssClass: 'theme-schmuggel', condition: { type: 'tag_full_team', tag: 'schmuggel', count: 5 }, preview: '#cd853f' },
        { id: 'sw_theme_erste_ordnung', name: 'Erste Ordnung', description: 'Neue Macht (5 Erste Ordnung)', cssClass: 'theme-erste-ordnung', condition: { type: 'tag_full_team', tag: 'erste_ordnung', count: 5 }, preview: 'linear-gradient(45deg, #000000 25%, #ff0000 25%, #ff0000 50%, #000000 50%, #000000 75%, #ff0000 75%, #ff0000 100%)' }
    ],
    waifu: [
        // Zukünftige Waifu-Themes hier
    ]
};
