export const TITLES = {
    starwars: [
        { id: 'sw_0', name: 'Kein Titel', required: 0 },
        { id: 'sw_1', name: 'Jüngling', required: 5 },
        { id: 'sw_2', name: 'Padawan', required: 20 },
        { id: 'sw_3', name: 'Jedi-Ritter', required: 50 },
        { id: 'sw_4', name: 'Jedi-Meister', required: 100 },
        { id: 'sw_5', name: 'Großmeister', required: 250 },
        { id: 'sw_6', name: 'Machtgeist', required: 500 },
        { id: 'sw_secret_1', name: 'Der Auserwählte', required: -1, secret: true, condition: { type: 'has_characters', chars: ['Anakin Skywalker', 'Darth Vader'] } },
        { id: 'sw_secret_2', name: 'Zwillingssonnen', required: -1, secret: true, condition: { type: 'has_characters', chars: ['Luke Skywalker', 'Leia Organa'] } },
        { id: 'sw_secret_3', name: 'Weeb', required: -1, secret: true, condition: { type: 'has_discovered_characters', chars: ['Fino Bloodstone', 'Monkey D. Ruffy'] } },
        { id: 'sw_secret_4', name: 'Gooner', required: -1, secret: true, condition: { type: 'has_tag_in_round', tag: 'heiss', count: 5 } }
    ],
    waifu: [
        { id: 'wf_0', name: 'Kein Titel', required: 0 },
        { id: 'wf_1', name: 'Kouhai', required: 5 },
        { id: 'wf_2', name: 'Senpai', required: 20 },
        { id: 'wf_3', name: 'Sensei', required: 50 },
        { id: 'wf_4', name: 'Weeb', required: 100 },
        { id: 'wf_5', name: 'Otaku', required: 250 },
        { id: 'wf_6', name: 'Isekai-Gott', required: 500 },
        { id: 'wf_secret_1', name: 'Tsundere-Meister', required: -1, secret: true, condition: { type: 'has_characters', chars: ['Asuka Langley Soryu', 'Taiga Aisaka'] } }
    ]
};
