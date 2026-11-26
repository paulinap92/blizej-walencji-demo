/* Fully fabricated portfolio examples. No scraped text or event records from a real service. */
export const events=[
{id:'bw01',title:'Wieczór muzyki w centrum',city:'Valencia',category:'Kultura',date:'2026-12-03',source:'Demo cultural feed',description:'Przykładowy kameralny koncert z programem dla miłośników muzyki.',score:94},
{id:'bw02',title:'Rodzinny spacer przez park',city:'Valencia',category:'Rodzina',date:'2026-12-05',source:'Demo event calendar',description:'Fikcyjny spacer z zagadkami przyrodniczymi dla dzieci i dorosłych.',score:88},
{id:'bw03',title:'Targ zimowych smaków',city:'Alicante',category:'Gastronomia',date:'2026-12-06',source:'Demo regional portal',description:'Przykładowe stoiska z lokalnymi produktami i kulinarnymi pokazami.',score:91},
{id:'bw04',title:'Dzień otwartych pracowni',city:'Castellón',category:'Kultura',date:'2026-12-08',source:'Demo cultural feed',description:'Fikcyjna inicjatywa lokalnych artystów i warsztaty dla odwiedzających.',score:82},
{id:'bw05',title:'Trasa rowerowa nad morzem',city:'Valencia',category:'Aktywność',date:'2026-12-10',source:'Demo tourism source',description:'Pokazowa wycieczka rekreacyjna wzdłuż wybrzeża.',score:86},
{id:'bw06',title:'Targi rzemiosła',city:'Alicante',category:'Kultura',date:'2026-12-12',source:'Demo cultural feed',description:'Przykładowa prezentacja lokalnego rękodzieła i ceramiki.',score:95},
{id:'bw07',title:'Warsztaty świąteczne dla rodzin',city:'Castellón',category:'Rodzina',date:'2026-12-13',source:'Demo event calendar',description:'Fikcyjne zajęcia twórcze z lokalnymi tradycjami.',score:79},
{id:'bw08',title:'Spacer po zabytkowych ulicach',city:'Alicante',category:'Aktywność',date:'2026-12-15',source:'Demo tourism source',description:'Przykładowa trasa po historycznej części miasta.',score:90},
{id:'bw09',title:'Pokaz kuchni śródziemnomorskiej',city:'Valencia',category:'Gastronomia',date:'2026-12-16',source:'Demo regional portal',description:'Fikcyjny pokaz lokalnych przepisów i technik gotowania.',score:84}
];
export const jobs=[
{id:'rss',name:'Wyszukiwanie aktualności / RSS',schedule:'Co 30 min · przykład',desc:'Pobieranie metadanych i deduplikacja źródeł',sample:'Found 12 → deduplicated 3 → staged 9'},
{id:'events',name:'Wyszukiwanie wydarzeń',schedule:'Codziennie · przykład',desc:'Wyszukiwanie, klasyfikacja, filtrowanie dat',sample:'Found 9 → normalized 9 → review 9'},
{id:'review',name:'Weryfikacja redakcyjna',schedule:'Na żądanie',desc:'Kontrola źródeł, kategorii i statusu szkiców',sample:'Validated draft schema → pending human review'},
{id:'social',name:'Przygotowanie postów',schedule:'Po zatwierdzeniu',desc:'Tworzenie propozycji copy do ręcznej publikacji',sample:'Prepared one local preview → no external calls'}
];
