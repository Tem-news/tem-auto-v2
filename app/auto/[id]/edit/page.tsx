'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'

const formatPriceInput = (value: string) => {
  const digits = value.replace(/\D/g, '')
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const POPULAR_MAKES = [
  'BMW', 'Audi', 'Volkswagen', 'Volvo', 'Toyota', 'Mercedes-Benz', 
  'Škoda', 'Ford', 'Hyundai', 'Kia', 'Nissan', 'Opel', 'Peugeot', 
  'Renault', 'Mazda', 'Honda', 'Lexus', 'Subaru', 'Tesla', 'Porsche',
  'Fiat', 'Alfa Romeo', 'Citroën', 'Dacia', 'Jeep', 'Land Rover', 
  'Mitsubishi', 'Suzuki', 'Mini', 'Chrysler', 'Dodge', 'Chevrolet'
]

const MODELS_BY_MAKE: { [key: string]: string[] } = {
  'BMW': [
    '1 sērija', '114', '116', '118', '120', '123', '125', '130', '135', 'M135i', 'M140i',
    '2 sērija', '216', '218', '220', '225', '228', '230', 'M235i', 'M240i', 'M2', '2 Gran Coupe', '2 Active Tourer', '2 Gran Tourer',
    '3 sērija', '316', '318', '320', '323', '325', '328', '330', '335', '340', 'M340i', 'M3', '3 GT',
    '4 sērija', '418', '420', '425', '428', '430', '435', '440', 'M440i', 'M4', '4 Gran Coupe',
    '5 sērija', '518', '520', '523', '525', '528', '530', '535', '540', '545', '550', 'M550i', 'M550d', 'M5', '5 GT',
    '6 sērija', '630', '635', '640', '650', 'M6', '6 GT',
    '7 sērija', '728', '730', '735', '740', '745', '750', '760', 'M760Li',
    '8 sērija', '840', '850', 'M8', 'M850i',
    'X1', 'X2', 'X3', 'X3 M', 'X4', 'X4 M', 'X5', 'X5 M', 'X6', 'X6 M', 'X7', 'XM', 'Z3', 'Z4', 'Z8',
    'i3', 'i4', 'i7', 'iX', 'iX1', 'iX2', 'iX3'
  ],
  'Audi': [
    '80', '90', '100', '200', 'A1', 'A2', 'A3', 'S3', 'RS3',
    'A4', 'S4', 'RS4', 'A4 Allroad',
    'A5', 'S5', 'RS5',
    'A6', 'S6', 'RS6', 'A6 Allroad',
    'A7', 'S7', 'RS7',
    'A8', 'S8',
    'Q2', 'SQ2', 'Q3', 'RS Q3', 'Q4 e-tron', 'Q5', 'SQ5', 'Q7', 'SQ7', 'Q8', 'SQ8', 'RS Q8',
    'TT', 'TTS', 'TT RS', 'R8',
    'e-tron', 'e-tron GT', 'RS e-tron GT', 'Q8 e-tron'
  ],
  'Volkswagen': [
    'Amarok', 'Arteon', 'Atlas', 'Beetle', 'Bora', 'Caddy', 'California', 'Caravelle', 'CC', 'Corrado',
    'Crafter', 'EOS', 'Fox', 'Golf', 'Golf Plus', 'Golf Sportsvan', 'Golf Alltrack', 'ID.3', 'ID.4', 'ID.5', 'ID.7', 'ID. Buzz',
    'Jetta', 'Lupo', 'Multivan', 'Passat', 'Passat CC', 'Phaeton', 'Polo', 'Scirocco', 'Sharan', 'T-Cross', 'T-Roc', 'Taigo',
    'Tiguan', 'Tiguan Allspace', 'Touareg', 'Touran', 'Transporter', 'Up!'
  ],
  'Volvo': [
    '440', '460', '850', 'C30', 'C70', 'EX30', 'EX90', 'S40', 'S60', 'S70', 'S80', 'S90',
    'V40', 'V40 Cross Country', 'V50', 'V60', 'V60 Cross Country', 'V70', 'V90', 'V90 Cross Country',
    'XC40', 'XC60', 'XC70', 'XC90', 'C40 Recharge'
  ],
  'Toyota': [
    'Auris', 'Avensis', 'Avensis Verso', 'Aygo', 'Aygo X', 'bZ4X', 'C-HR', 'Camry', 'Celica', 'Corolla', 'Corolla Verso',
    'FJ Cruiser', 'GR86', 'GT86', 'Hiace', 'Highlander', 'Hilux', 'IQ', 'Land Cruiser', 'MR2', 'Paseo', 'Prius', 'Prius Plus',
    'RAV4', 'Sequoia', 'Sienna', 'Supra', 'Tacoma', 'Tundra', 'Urban Cruiser', 'Verso', 'Yaris', 'Yaris Cross'
  ],
  'Mercedes-Benz': [
    'A-klase', 'AMG GT', 'B-klase', 'C-klase', 'CL-klase', 'CLA', 'CLE', 'CLK', 'CLS',
    'E-klase', 'EQA', 'EQB', 'EQC', 'EQE', 'EQE SUV', 'EQS', 'EQS SUV', 'EQV',
    'G-klase', 'GL-klase', 'GLA', 'GLB', 'GLC', 'GLE', 'GLE Coupe', 'GLK', 'GLS',
    'M-klase / ML', 'R-klase', 'S-klase', 'SL-klase', 'SLC', 'SLK', 'SLS AMG',
    'Citan', 'Sprinter', 'V-klase', 'Vaneo', 'Vito', 'X-klase', '190 (W201)'
  ],
  'Škoda': [
    'Citigo', 'Enyaq iV', 'Fabia', 'Kamiq', 'Karoq', 'Kodiaq', 'Kodiaq GT', 'Octavia', 'Octavia Scout',
    'Praktik', 'Rapid', 'Roomster', 'Scala', 'Superb', 'Yeti'
  ],
  'Ford': [
    'B-Max', 'C-Max', 'Cougar', 'Crown Victoria', 'Ecosport', 'Edge', 'Escape', 'Excursion', 'Expedition', 'Explorer',
    'F-150', 'F-250', 'F-350', 'Fiesta', 'Focus', 'Focus C-Max', 'Fusion', 'Galaxy', 'Grand C-Max', 'Ka', 'Kuga',
    'Maverick', 'Mondeo', 'Mustang', 'Mustang Mach-E', 'Puma', 'Ranger', 'S-Max', 'Scorpio', 'Sierra', 'Streetka', 'Tourneo', 'Transit'
  ],
  'Hyundai': [
    'Accent', 'Bayon', 'Coupe', 'Elantra', 'Getz', 'Grandeur', 'H-1', 'i10', 'i20', 'i30', 'i40', 'Ioniq',
    'Ioniq 5', 'Ioniq 6', 'IX20', 'IX35', 'IX55', 'Kona', 'Lantra', 'Matrix', 'Palisade', 'Santa Fe', 'Sonata',
    'Terracan', 'Tucson', 'Veloster', 'Venue'
  ],
  'Kia': [
    'Carens', 'Carnival', 'Ceed', 'ProCeed', 'Ceed SW', 'Cerato', 'EV6', 'EV9', 'Magentis', 'Niro', 'Opirus',
    'Optima', 'Picanto', 'Rio', 'Sorento', 'Soul', 'Sportage', 'Stinger', 'Stonic', 'Venga', 'XCeed'
  ],
  'Nissan': [
    '100 NX', '200 SX', '350Z', '370Z', 'Almera', 'Almera Tino', 'Ariya', 'Cube', 'GT-R', 'Juke', 'King Cab',
    'Leaf', 'Maxima', 'Micra', 'Murano', 'Navara', 'Note', 'NV200', 'Pathfinder', 'Patrol', 'Pick Up', 'Pixo',
    'Primera', 'Pulsar', 'Qashqai', 'Qashqai+2', 'Terrano', 'Tiida', 'X-Trail', 'Z'
  ],
  'Opel': [
    'Adam', 'Agila', 'Ampera', 'Antara', 'Astra', 'Calibra', 'Combo', 'Corsa', 'Crossland', 'Crossland X',
    'Frontera', 'Grandland', 'Grandland X', 'Insignia', 'Kadett', 'Meriva', 'Mokka', 'Mokka X', 'Movano',
    'Omega', 'Signum', 'Sintra', 'Tigra', 'Vectra', 'Vivaro', 'Zafira', 'Zafira Tourer'
  ],
  'Peugeot': [
    '106', '107', '108', '206', '207', '208', '301', '306', '307', '308', '406', '407', '408', '508', '607', '807',
    '1007', '2008', '3008', '4007', '4008', '5008', 'Boxer', 'Expert', 'Partner', 'Rifter', 'RCZ', 'iOn'
  ],
  'Renault': [
    'Alaskan', 'Arkana', 'Austral', 'Avantime', 'Captur', 'Clio', 'Espace', 'Fluence', 'Grand Espace', 'Grand Scenic',
    'Kadjar', 'Kangoo', 'Koleos', 'Laguna', 'Latitude', 'Master', 'Megane', 'Megane E-Tech', 'Modus', 'Rafale',
    'Scenic', 'Symbol', 'Talisman', 'Trafic', 'Twingo', 'Twizy', 'Zoe'
  ],
  'Mazda': [
    '2', '3', '323', '5', '6', '626', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'CX-7', 'CX-80', 'CX-9', 'MX-30', 'MX-5', 'RX-8'
  ],
  'Honda': [
    'Accord', 'City', 'Civic', 'CR-V', 'CR-Z', 'e', 'e:Ny1', 'FR-V', 'HR-V', 'Insight', 'Integra', 'Jazz', 'Legend', 'NSX', 'Prelude', 'S2000', 'ZR-V'
  ],
  'Lexus': [
    'CT', 'ES', 'GS', 'GX', 'IS', 'LC', 'LFA', 'LS', 'LX', 'NX', 'RC', 'RX', 'RZ', 'SC', 'UX', 'LM'
  ],
  'Subaru': [
    'BRZ', 'Forester', 'Impreza', 'Justy', 'Legacy', 'Levorg', 'Outback', 'Solterra', 'SVX', 'Tribeca', 'WRX', 'XV'
  ],
  'Tesla': [
    'Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y', 'Roadster'
  ],
  'Porsche': [
    '718 Boxster', '718 Cayman', '911', 'Boxster', 'Cayenne', 'Cayman', 'Macan', 'Panamera', 'Taycan'
  ],
  'Fiat': [
    '124 Spider', '500', '500C', '500L', '500X', 'Bravo', 'Croma', 'Doblo', 'Ducato', 'Fiorino', 'Freemont', 'Grande Punto', 'Panda', 'Punto', 'Sedici', 'Stilo', 'Tipo', 'Ulysse'
  ],
  'Alfa Romeo': [
    '147', '156', '159', '166', '4C', '8C', 'Brera', 'Giulia', 'Giulietta', 'GT', 'Mito', 'Spider', 'Stelvio', 'Tonale'
  ],
  'Citroën': [
    'Berlingo', 'C1', 'C2', 'C3', 'C3 Aircross', 'C3 Pluriel', 'C4', 'C4 Aircross', 'C4 Cactus', 'C4 Grand Picasso', 'C4 Picasso', 'C4 SpaceTourer', 'C5', 'C5 Aircross', 'C5 X', 'C6', 'C8', 'DS3', 'DS4', 'DS5', 'Jumper', 'Jumpy', 'Nemo', 'Saxo', 'SpaceTourer', 'Xantia', 'Xsara', 'Xsara Picasso'
  ],
  'Dacia': [
    'Dokker', 'Duster', 'Lodgy', 'Logan', 'Logan MCV', 'Jogger', 'Sandero', 'Sandero Stepway', 'Spring'
  ],
  'Jeep': [
    'Avenger', 'Cherokee', 'Commander', 'Compass', 'Grand Cherokee', 'Patriot', 'Renegade', 'Wrangler'
  ],
  'Land Rover': [
    'Defender', 'Discovery', 'Discovery Sport', 'Freelander', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'
  ],
  'Mitsubishi': [
    '3000 GT', 'ASX', 'Carisma', 'Colt', 'Eclipse', 'Eclipse Cross', 'Grandis', 'L200', 'Lancer', 'Outlander', 'Pajero', 'Pajero Pinin', 'Space Star', 'Space Wagon'
  ],
  'Suzuki': [
    'Alto', 'Baleno', 'Grand Vitara', 'Ignis', 'Jimny', 'Kizashi', 'Liana', 'Samurai', 'Splash', 'Swace', 'Swift', 'SX4', 'SX4 S-Cross', 'Vitara', 'Wagon R+'
  ],
  'Mini': [
    'Cabrio', 'Clubman', 'Cooper', 'Cooper S', 'Countryman', 'Coupe', 'One', 'Paceman', 'Roadster'
  ],
  'Chrysler': [
    '300C', '300M', 'Crossfire', 'Grand Voyager', 'PT Cruiser', 'Sebring', 'Town & Country', 'Voyager'
  ],
  'Dodge': [
    'Avenger', 'Caliber', 'Challenger', 'Charger', 'Dakota', 'Dart', 'Durango', 'Grand Caravan', 'Journey', 'Magnum', 'Nitro', 'RAM', 'Viper'
  ],
  'Chevrolet': [
    'Aveo', 'Camaro', 'Captiva', 'Corvette', 'Cruze', 'Epica', 'Equinox', 'HHR', 'Impala', 'Kalos', 'Lacetti', 'Malibu', 'Matiz', 'Orlando', 'Silverado', 'Spark', 'Suburban', 'Tahoe', 'Tracker', 'Trailblazer', 'Trax', 'Volt'
  ]
}

const COLORS = [
  { name: 'Melna', hex: '#111827', border: '#374151' },
  { name: 'Balta', hex: '#ffffff', border: '#d1d5db' },
  { name: 'Pelēka', hex: '#6b7280', border: '#4b5563' },
  { name: 'Sudraba', hex: '#e5e7eb', border: '#9ca3af' },
  { name: 'Zila', hex: '#2563eb', border: '#1d4ed8' },
  { name: 'Sarkana', hex: '#dc2626', border: '#b91c1c' },
  { name: 'Zaļa', hex: '#16a34a', border: '#15803d' },
  { name: 'Brūna', hex: '#78350f', border: '#451a03' },
  { name: 'Zelta', hex: '#d97706', border: '#b45309' },
  { name: 'Oranža', hex: '#ea580c', border: '#c2410c' },
  { name: 'Dzeltena', hex: '#eab308', border: '#ca8a04' },
  { name: 'Violeta', hex: '#7c3aed', border: '#6d28d9' }
]

const BODY_TYPES = [
  'Sedans', 'Universāls', 'Hečbeks', 'Apvidus (SUV)', 'Kupeja', 'Kabriolets', 'Minivens', 'Kompaktvens', 'Pikaps', 'Furgons'
]

const GEARBOX_TYPES = ['Manuālā', 'Automāts', 'Pusautomāts']

const ENGINE_TYPES = ['Dīzelis', 'Benzīns', 'Benzīns / Gāze', 'Hibrīds (Benzīns)', 'Hibrīds (Dīzelis)', 'Elektriskais']
const STEERING_TYPES = ['Kreisā', 'Labā']

const ENGINE_VOLUMES = [
  '1.0', '1.2', '1.3', '1.4', '1.5', '1.6', '1.8', '1.9', '2.0', 
  '2.2', '2.4', '2.5', '2.8', '3.0', '3.2', '3.5', '4.0', '4.4', '5.0', 'Elektro / Nav'
]

const COUNTRIES = [
  { name: 'Latvija', code: 'lv', flagUrl: 'https://flagcdn.com/w40/lv.png', regions: ['Rīga un rajons', 'Jūrmala', 'Pierīga', 'Vidzeme', 'Kurzeme', 'Zemgale', 'Latgale'] },
  { name: 'Lietuva', code: 'lt', flagUrl: 'https://flagcdn.com/w40/lt.png', regions: ['Viļņa', 'Kauņa', 'Klaipēda', 'Šauļi', 'Panevēža', 'Alytus'] },
  { name: 'Igaunija', code: 'ee', flagUrl: 'https://flagcdn.com/w40/ee.png', regions: ['Tallina', 'Tartu', 'Narva', 'Pērnava', 'Kohtla-Järve'] },
  { 
    name: 'Vācija', 
    code: 'de', 
    flagUrl: 'https://flagcdn.com/w40/de.png',
    regions: [
      'Bavārija (Bayern)', 'Bādene-Virtemberga (Baden-Württemberg)', 'Ziemeļreina-Vestfālene (Nordrhein-Westfalen)',
      'Lejassaksija (Niedersachsen)', 'Hesene (Hessen)', 'Reinlande-Pfalca (Rheinland-Pfalz)',
      'Saksija (Sachsen)', 'Tīringene (Thüringen)', 'Brandenburga (Brandenburg)', 'Saksija-Anhalte (Saksija-Anhalt)',
      'Šlēsviga-Holšteina (Schleswig-Holstein)', 'Mēklenburga-Priekšpomerānija (Mecklenburg-Vorpommern)',
      'Hamburga', 'Berlīne', 'Brēmene', 'Sārija (Saarland)', 'Minhene', 'Frankfurte pie Mainas', 'Ķelne', 'Štutgarte'
    ] 
  },
  { name: 'Lielbritānija', code: 'gb', flagUrl: 'https://flagcdn.com/w40/gb.png', regions: ['Londona', 'Mančestra', 'Birmingema', 'Liverpūle', 'Skotija', 'Velsa', 'Ziemeļīrija'] },
  { 
    name: 'ASV', 
    code: 'us', 
    flagUrl: 'https://flagcdn.com/w40/us.png',
    regions: [
      'Alabama', 'Aļaska (Alaska)', 'Arizona', 'Arkanzasa (Arkansas)', 'Kalifornija (California)', 
      'Kolorādo', 'Konektikuta (Connecticut)', 'Delavēra (Delaware)', 'Florida', 'Džordžija (Georgia)',
      'Havajas (Hawaii)', 'Aidaho (Idaho)', 'Ilinoisa (Illinois)', 'Indiana', 'Aiovas (Iowa)',
      'Kanzasa (Kansas)', 'Kentuki (Kentucky)', 'Luiziāna (Louisiana)', 'Meina (Maine)', 'Merilenda (Maryland)', 
      'Masačūsetsa (Massachusetts)', 'Mičigana (Michigan)', 'Minesota (Minnesota)', 'Misisipi (Mississippi)', 
      'Misūri (Missouri)', 'Montāna (Montana)', 'Nebraska', 'Nevada', 'Ņūhempšīra (New Hampshire)', 
      'Ņūdžersija (New Jersey)', 'Ņūmeksika (New Mexico)', 'Ņujorka (New York)', 'Ziemeļkarolīna (North Carolina)', 
      'Ziemeļdakota (North Dakota)', 'Ohaio (Ohio)', 'Oklahoma', 'Oregonas (Oregon)', 'Pensilvānija (Pennsylvania)', 
      'Roudailenda (Rhode Island)', 'Dienvidkarolīna (South Carolina)', 'Dienviddakota (South Dakota)', 'Tenesī (Tennessee)', 
      'Teksasa (Texas)', 'Jūta (Utah)', 'Vermonta (Vermont)', 'Virdžīnija (Virginia)', 'Vašingtona (Washington)', 
      'Rietumvirdžīnija (West Virginia)', 'Viskonsina (Wisconsin)', 'Vaiominga (Wyoming)'
    ] 
  },
  { name: 'Japāna', code: 'jp', flagUrl: 'https://flagcdn.com/w40/jp.png', regions: ['Tokija', 'Osaka', 'Kioto', 'Jokohama', 'Nagoja', 'Fukuoka', 'Hokaido'] },
  { name: 'Krievija', code: 'ru', flagUrl: 'https://flagcdn.com/w40/ru.png', regions: ['Maskava', 'Sanktpēterburga', 'Novosibirska', 'Jekaterinburga', 'Kazaņa', 'Soči', 'Kaliningrada'] },
  { name: 'Zviedrija', code: 'se', flagUrl: 'https://flagcdn.com/w40/se.png', regions: ['Stokholma', 'Gēteborga', 'Malme', 'Uppsala'] },
  { name: 'Norvēģija', code: 'no', flagUrl: 'https://flagcdn.com/w40/no.png', regions: ['Oslo', 'Bergena', 'Tronheima', 'Stavangere'] },
  { name: 'Polija', code: 'pl', flagUrl: 'https://flagcdn.com/w40/pl.png', regions: ['Varšava', 'Krakova', 'Gdaņska', 'Poznaņa', 'Vroclava', 'Lodza'] },
  { name: 'Somija', code: 'fi', flagUrl: 'https://flagcdn.com/w40/fi.png', regions: ['Helsinki', 'Espo', 'Tamperes', 'Vantaa', 'Oulu'] },
  { name: 'Dānija', code: 'dk', flagUrl: 'https://flagcdn.com/w40/dk.png', regions: ['Kopenhāgena', 'Orhūsa', 'Odense', 'Olborka'] },
  { name: 'Francija', code: 'fr', flagUrl: 'https://flagcdn.com/w40/fr.png', regions: ['Parīze', 'Marseļa', 'Liona', 'Tulūza', 'Nica', 'Nante'] },
  { name: 'Itālija', code: 'it', flagUrl: 'https://flagcdn.com/w40/it.png', regions: ['Roma', 'Milāna', 'Neapole', 'Turīna', 'Palermo', 'Florence'] },
  { name: 'Spānija', code: 'es', flagUrl: 'https://flagcdn.com/w40/es.png', regions: ['Madride', 'Barselona', 'Valensija', 'Seviļa', 'Saragosa', 'Malaga'] },
  { name: 'Nīderlande', code: 'nl', flagUrl: 'https://flagcdn.com/w40/nl.png', regions: ['Amsterdama', 'Roterdama', 'Hāga', 'Utrehta', 'Eindhovena'] },
  { name: 'Ķīna', code: 'cn', flagUrl: 'https://flagcdn.com/w40/cn.png', regions: ['Pekina', 'Šanhaja', 'Guandžou', 'Šendžena', 'Čendu'] },
  { name: 'Dienvidkoreja', code: 'kr', flagUrl: 'https://flagcdn.com/w40/kr.png', regions: ['Seula', 'Pusana', 'Inčhona', 'Tegu'] },
  { name: 'Apvienotie Arābu Emirāti', code: 'ae', flagUrl: 'https://flagcdn.com/w40/ae.png', regions: ['Dubaija', 'Abū Dabī', 'Šardža'] },
  { name: 'Kanāda', code: 'ca', flagUrl: 'https://flagcdn.com/w40/ca.png', regions: ['Ontārio', 'Kvebeka', 'Britu Kolumbija', 'Alberta', 'Monreāla', 'Toronto'] },
  { name: 'Austrālija', code: 'au', flagUrl: 'https://flagcdn.com/w40/au.png', regions: ['Sidneja', 'Melburna', 'Brisbena', 'Pērta', 'Adelaida'] }
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1969 }, (_, i) => (CURRENT_YEAR - i).toString())

const SUPPLEMENTAL_FIELDS = [
  { key: 'make', db: 'make', label: 'Marka', type: 'text' },
  { key: 'model', db: 'model', label: 'Modelis', type: 'text' },
  { key: 'year', db: 'year', label: 'Izlaiduma gads', type: 'number', inputMode: 'numeric' },
  { key: 'engine', db: 'engine', label: 'Dzinēja tips', type: 'text' },
  { key: 'volume', db: 'volume', label: 'Dzinēja tilpums', type: 'number', inputMode: 'decimal' },
  { key: 'gearbox', db: 'gearbox', label: 'Ātrumkārba', type: 'text' },
  { key: 'bodyType', db: 'body_type', label: 'Virsbūves tips', type: 'text' },
  { key: 'color', db: 'color', label: 'Krāsa', type: 'text' },
  { key: 'mileage', db: 'mileage', label: 'Nobraukums', type: 'number', inputMode: 'numeric' },
  { key: 'steeringWheel', db: 'steering_wheel', label: 'Stūre', type: 'text' },
  { key: 'interiorColor', db: 'interior_color', label: 'Salona krāsa', type: 'text' },
  { key: 'techInspection', db: 'tech_inspection', label: 'Tehniskā apskate', type: 'text' },
  { key: 'vin', db: 'vin', label: 'VIN kods', type: 'text' }
] as const

const hasStoredValue = (value: unknown) =>
  value !== null && value !== undefined && String(value).trim() !== ''

export default function RedigetAuto() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null)
  const hasUnsavedChangesRef = useRef(false)
  const allowNavigationRef = useRef(false)
  const skipNextPopRef = useRef(false)

  const markUnsaved = () => {
    hasUnsavedChangesRef.current = true
  }


  // Vienmēr rediģējamie lauki
  const [price, setPrice] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // Pārējie lauki ir papildināmi tikai tad, ja tie sākotnēji bija tukši.
  const [supplementalValues, setSupplementalValues] = useState<Record<string, string>>({})
  const [supplementalLocked, setSupplementalLocked] = useState<Record<string, boolean>>({})

  // Bilžu state
  const [images, setImages] = useState<{ url: string; isNew: boolean; file?: File }[]>([])

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const mobileKeyboardReady = useRef<string | null>(null)
  const mobileKeyboardHistoryArmed = useRef(false)
  const mobileDropdownHistoryArmed = useRef(false)
  const mobileIgnoreNextPopstate = useRef(false)
  const mobileInternalHistoryJump = useRef(false)
  const mobileFormPopHandled = useRef(false)
  const mobileActiveField = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const mobileActiveFieldName = useRef<string | null>(null)
  const mobileDropdownPointerStart = useRef<{ name: string; x: number; y: number } | null>(null)

  const mobileSuggestionFields = new Set([
    'country', 'region', 'make', 'model', 'year', 'engine', 'volume',
    'gearbox', 'bodyType', 'color', 'steeringWheel'
  ])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (activeDropdown !== null) return

    mobileKeyboardReady.current = null
    const historySteps =
      (mobileKeyboardHistoryArmed.current ? 1 : 0) +
      (mobileDropdownHistoryArmed.current ? 1 : 0)

    if (historySteps > 0) {
      mobileKeyboardHistoryArmed.current = false
      mobileDropdownHistoryArmed.current = false
      mobileInternalHistoryJump.current = true
      window.history.go(-historySteps)
      window.setTimeout(() => {
        mobileInternalHistoryJump.current = false
      }, 500)
    }
  }, [activeDropdown])

  useEffect(() => {
    const keepActiveSuggestionAtTop = () => {
      const field = mobileActiveField.current
      const name = mobileActiveFieldName.current
      if (!field || !name || !mobileSuggestionFields.has(name)) return
      positionMobileFieldForKeyboard(field, name, 'auto')
    }

    const handleKeyboardBack = () => {
      mobileFormPopHandled.current = true
      window.setTimeout(() => {
        mobileFormPopHandled.current = false
      }, 0)

      if (mobileInternalHistoryJump.current) {
        mobileInternalHistoryJump.current = false
        return
      }

      if (mobileIgnoreNextPopstate.current) {
        mobileIgnoreNextPopstate.current = false
        return
      }

      if (mobileKeyboardHistoryArmed.current) {
        mobileKeyboardHistoryArmed.current = false
        const activeFieldName = mobileActiveFieldName.current || mobileKeyboardReady.current
        const activeElement = document.activeElement
        if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
          activeElement.blur()
        }
        mobileKeyboardReady.current = null
        if (!activeFieldName || !mobileSuggestionFields.has(activeFieldName)) {
          setActiveDropdown(null)
        } else {
          window.setTimeout(keepActiveSuggestionAtTop, 0)
          window.setTimeout(keepActiveSuggestionAtTop, 180)
        }
        return
      }

      if (mobileDropdownHistoryArmed.current) {
        mobileDropdownHistoryArmed.current = false
        mobileKeyboardReady.current = null
        setActiveDropdown(null)
        window.setTimeout(keepActiveSuggestionAtTop, 0)
        window.setTimeout(keepActiveSuggestionAtTop, 180)
      }
    }

    window.addEventListener('popstate', handleKeyboardBack)
    return () => window.removeEventListener('popstate', handleKeyboardBack)
  }, [])

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    let previousHeight = viewport.height
    const handleViewportResize = () => {
      const currentHeight = viewport.height
      const keyboardWasClosed =
        mobileKeyboardHistoryArmed.current &&
        currentHeight > previousHeight + 80
      previousHeight = currentHeight
      if (!keyboardWasClosed) return

      const field = mobileActiveField.current
      const name = mobileActiveFieldName.current
      mobileKeyboardHistoryArmed.current = false
      mobileKeyboardReady.current = null
      if (field) field.blur()

      mobileIgnoreNextPopstate.current = true
      window.history.back()

      if (field && name && mobileSuggestionFields.has(name)) {
        const keepAtTop = () => positionMobileFieldForKeyboard(field, name, 'auto')
        window.setTimeout(keepAtTop, 0)
        window.setTimeout(keepAtTop, 180)
      } else {
        setActiveDropdown(null)
      }
    }

    viewport.addEventListener('resize', handleViewportResize)
    return () => viewport.removeEventListener('resize', handleViewportResize)
  }, [])

  const positionMobileFieldForKeyboard = (
    field: HTMLInputElement | HTMLTextAreaElement,
    name: string,
    behavior: ScrollBehavior = 'smooth'
  ) => {
    const hasSuggestions = mobileSuggestionFields.has(name)
    const anchorElement = hasSuggestions
      ? field.closest('.dropdown-container') as HTMLElement | null
      : field
    if (!anchorElement) return

    const visibleHeight = window.visualViewport?.height || window.innerHeight
    const targetTop = hasSuggestions || name === 'description'
      ? 58
      : Math.max(76, visibleHeight * 0.42)
    const currentTop = anchorElement.getBoundingClientRect().top
    window.scrollTo({
      top: Math.max(0, window.scrollY + currentTop - targetTop),
      behavior
    })
  }

  const handleDropdownInputPointerDown = (
    event: React.PointerEvent<HTMLInputElement | HTMLTextAreaElement>,
    name: string
  ) => {
    const isMobileTouch = window.matchMedia('(max-width: 767px)').matches && event.pointerType !== 'mouse'
    if (!isMobileTouch) return

    event.preventDefault()
    mobileDropdownPointerStart.current = { name, x: event.clientX, y: event.clientY }
  }

  const handleDropdownInputPointerUp = (
    event: React.PointerEvent<HTMLInputElement | HTMLTextAreaElement>,
    name: string
  ) => {
    const start = mobileDropdownPointerStart.current
    mobileDropdownPointerStart.current = null
    if (!start || start.name !== name) return

    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y)
    if (moved > 10) return

    mobileActiveField.current = event.currentTarget
    mobileActiveFieldName.current = name

    if (mobileKeyboardReady.current === name && document.activeElement === event.currentTarget) {
      event.currentTarget.blur()
      mobileKeyboardReady.current = null
      setActiveDropdown(null)
      return
    }

    setActiveDropdown(name)
    if (mobileKeyboardReady.current === name) {
      const field = event.currentTarget
      if (!mobileKeyboardHistoryArmed.current) {
        window.history.pushState(
          { ...window.history.state, temautoEditKeyboard: true },
          '',
          window.location.href
        )
        mobileKeyboardHistoryArmed.current = true
      }
      field.focus({ preventScroll: true })
      positionMobileFieldForKeyboard(field, name)
      window.setTimeout(() => positionMobileFieldForKeyboard(field, name, 'auto'), 320)
    } else {
      if (mobileSuggestionFields.has(name) && !mobileDropdownHistoryArmed.current) {
        window.history.pushState(
          { ...window.history.state, temautoEditDropdown: true },
          '',
          window.location.href
        )
        mobileDropdownHistoryArmed.current = true
      }
      mobileKeyboardReady.current = name
      event.currentTarget.blur()
    }
  }

  const handleDropdownInputPointerCancel = () => {
    mobileDropdownPointerStart.current = null
  }

  const handleSuggestionInputBlur = (name: string) => {
    if (!window.matchMedia('(max-width: 767px)').matches) return

    window.setTimeout(() => {
      if (
        mobileKeyboardHistoryArmed.current &&
        mobileDropdownHistoryArmed.current &&
        mobileActiveFieldName.current === name
      ) {
        const field = mobileActiveField.current
        setActiveDropdown(null)
        if (field) {
          const keepAtTop = () => positionMobileFieldForKeyboard(field, name, 'auto')
          window.setTimeout(keepAtTop, 0)
          window.setTimeout(keepAtTop, 200)
        }
      }
    }, 0)
  }

  const handleDropdownInputClick = (name: string) => {
    if (window.matchMedia('(max-width: 767px)').matches) return
    setActiveDropdown((current) => current === name ? null : name)
  }

  useEffect(() => {
    const confirmExit = () => window.confirm('Ir nesaglabātas izmaiņas. Vai tiešām iziet, tās nesaglabājot?')

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChangesRef.current || allowNavigationRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }

    const handleLinkClick = (event: MouseEvent) => {
      if (!hasUnsavedChangesRef.current || allowNavigationRef.current) return
      const target = event.target as Element | null
      const anchor = target?.closest('a')
      if (!anchor || anchor.target === '_blank' || !anchor.href) return
      if (!confirmExit()) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      allowNavigationRef.current = true
    }

    const handlePopState = () => {
      if (mobileFormPopHandled.current || mobileInternalHistoryJump.current) return
      if (skipNextPopRef.current) {
        skipNextPopRef.current = false
        return
      }
      if (!hasUnsavedChangesRef.current || allowNavigationRef.current) return
      if (!confirmExit()) {
        skipNextPopRef.current = true
        window.history.forward()
      } else {
        allowNavigationRef.current = true
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    document.addEventListener('click', handleLinkClick, true)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [])

  useEffect(() => {
    if (!id) return

    async function checkAuthAndLoadCar() {
      // 1. Pārbaudām, vai lietotājs ir ielogojies
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
        router.push('/login')
        return
      }

      // 2. Ielādējam sludinājumu
      const { data, error } = await supabase.from('cars').select('*').eq('id', id).single()

      if (error || !data) {
        setErrorMsg('Sludinājums nav atrasts.')
        setLoading(false)
        return
      }

      // 3. Pārbaudām, vai ielogotais lietotājs ir šī sludinājuma īpašnieks
      if (!data.user_id || data.user_id !== session.user.id) {
        setErrorMsg('Tev nav tiesību rediģēt šo sludinājumu!')
        setLoading(false)
        return
      }

      // Ja viss kārtībā, aizpildām datus
      setOwnerUserId(session.user.id)
      setPrice(data.price ? formatPriceInput(String(data.price)) : '')
      setCountry(data.country || data.valsts || '')
      setRegion(data.region || data.regions || '')
      setDescription(data.description || '')
      setPhone(data.phone || '')
      setEmail(data.email || '')

      const loadedSupplementalValues: Record<string, string> = {
        make: String(data.make || ''),
        model: String(data.model || ''),
        year: String(data.year || ''),
        engine: String(data.engine || data.engine_type || data.fuel_type || ''),
        volume: String(data.volume ?? data.engine_volume ?? ''),
        gearbox: String(data.gearbox || data.atrumkarba || ''),
        bodyType: String(data.body_type || data.virsbuve || ''),
        color: String(data.color || data.krasa || ''),
        mileage: String(data.mileage ?? data.nobraukums ?? ''),
        steeringWheel: String(data.steering_wheel || data.sture || ''),
        interiorColor: String(data.interior_color || data.salona_krasa || ''),
        techInspection: String(data.tech_inspection || data.tehniska_apskate || ''),
        vin: String(data.vin || '')
      }
      setSupplementalValues(loadedSupplementalValues)
      setSupplementalLocked(
        Object.fromEntries(
          Object.entries(loadedSupplementalValues).map(([key, value]) => [key, hasStoredValue(value)])
        )
      )
      
      const existing = Array.isArray(data.images)
        ? data.images
        : data.images
          ? [data.images]
          : [data.image, data.image_url].filter((url): url is string => typeof url === 'string' && url.trim() !== '')
      setImages(existing.map((url: string) => ({ url, isNew: false })))
      
      setLoading(false)
    }

    checkAuthAndLoadCar()
  }, [id, router])

  // Pārvietot bildi ar bultiņām
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= images.length) return
    const updated = [...images]
    const [moved] = updated.splice(index, 1)
    updated.splice(newIndex, 0, moved)
    setImages(updated)
    markUnsaved()
  }

  // Dzēst bildi
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    markUnsaved()
  }

  // Saglabāt izmaiņas
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ownerUserId) {
      alert('Tev nav tiesību rediģēt šo sludinājumu!')
      return
    }
    if (!window.confirm('Vai saglabāt izmaiņas?')) return
    setSaving(true)
    
    let finalUrls = []
    for (const img of images) {
      if (img.isNew && img.file) {
        const fileName = `${Date.now()}-${Math.random()}.jpg`
        await supabase.storage.from('car-images').upload(fileName, img.file)
        const { data } = supabase.storage.from('car-images').getPublicUrl(fileName)
        finalUrls.push(data.publicUrl)
      } else {
        finalUrls.push(img.url)
      }
    }

    const updates: Record<string, string | number | null | string[]> = {
      price: price ? Number(price.replace(/\s/g, '')) : null,
      country: country.trim(),
      region: region.trim(),
      description: description.trim(),
      phone: phone.trim(),
      email: email.trim(),
      images: finalUrls,
      image: finalUrls[0] || null,
      image_url: finalUrls[0] || null
    }

    for (const field of SUPPLEMENTAL_FIELDS) {
      if (supplementalLocked[field.key]) continue
      const value = (supplementalValues[field.key] || '').trim()
      if (!value) continue
      updates[field.db] = ['year', 'volume', 'mileage'].includes(field.key)
        ? Number(value)
        : value
    }

    const { error } = await supabase
      .from('cars')
      .update(updates)
      .eq('id', id)
      .eq('user_id', ownerUserId)

    setSaving(false)
    if (error) {
      alert('Kļūda saglabājot sludinājumu: ' + error.message)
      return
    }

    hasUnsavedChangesRef.current = false
    allowNavigationRef.current = true
    router.push(`/auto/${id}`)
  }

  // Dzēst visu sludinājumu no rediģēšanas lapas
  const handleDeleteCar = async () => {
    if (!ownerUserId) {
      alert('Tev nav tiesību dzēst šo sludinājumu!')
      return
    }
    const confirmDelete = window.confirm('Vai tiešām vēlaties neatgriezeniski dzēst šo sludinājumu?')
    if (!confirmDelete) return

    setDeleting(true)
    const { error } = await supabase.from('cars').delete().eq('id', id).eq('user_id', ownerUserId)
    setDeleting(false)

    if (error) {
      alert('Kļūda dzēšot sludinājumu: ' + error.message)
    } else {
      hasUnsavedChangesRef.current = false
      allowNavigationRef.current = true
      alert('Sludinājums veiksmīgi izdzēsts!')
      router.push('/')
      router.refresh()
    }
  }

  const getSuggestionOptions = (name: string): Array<{ value: string; label: string; flagUrl?: string }> => {
    if (name === 'country') {
      return COUNTRIES.map((item) => ({ value: item.name, label: item.name, flagUrl: item.flagUrl }))
    }
    if (name === 'region') {
      const selectedCountry = COUNTRIES.find((item) => item.name === country)
      return (selectedCountry?.regions || []).map((value) => ({ value, label: value }))
    }
    if (name === 'make') return POPULAR_MAKES.map((value) => ({ value, label: value }))
    if (name === 'model') {
      return (MODELS_BY_MAKE[supplementalValues.make] || []).map((value) => ({ value, label: value }))
    }
    if (name === 'year') return YEARS.map((value) => ({ value, label: value }))
    if (name === 'engine') return ENGINE_TYPES.map((value) => ({ value, label: value }))
    if (name === 'volume') return ENGINE_VOLUMES.map((value) => ({ value, label: value }))
    if (name === 'gearbox') return GEARBOX_TYPES.map((value) => ({ value, label: value }))
    if (name === 'bodyType') return BODY_TYPES.map((value) => ({ value, label: value }))
    if (name === 'color') return COLORS.map((item) => ({ value: item.name, label: item.name }))
    if (name === 'steeringWheel') return STEERING_TYPES.map((value) => ({ value, label: value }))
    return []
  }

  const renderSuggestionDropdown = (name: string, onSelect: (value: string) => void) => {
    const options = getSuggestionOptions(name)
    if (activeDropdown !== name || options.length === 0) return null

    return (
      <div
        data-edit-suggestion-dropdown="true"
        style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 80, maxHeight: '220px', overflowY: 'auto', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '7px', boxShadow: '0 6px 14px rgba(0,0,0,0.16)' }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            data-edit-suggestion-option="true"
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => {
              onSelect(option.value)
              markUnsaved()
              setActiveDropdown(null)
            }}
            style={{ width: '100%', minHeight: '40px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '10px', color: '#111827', background: '#ffffff', border: 0, borderBottom: '1px solid #f1f5f9', textAlign: 'left', fontSize: '14px' }}
          >
            {option.flagUrl && <img src={option.flagUrl} alt="" style={{ width: '24px', height: '16px', objectFit: 'cover', borderRadius: '2px', flex: '0 0 auto' }} />}
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    )
  }

  if (loading) return <div style={{textAlign: 'center', padding: '50px', fontSize: '18px'}}>Pārbauda piekļuves tiesības...</div>

  if (errorMsg) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '30px', background: '#fff', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '15px' }}>Piekļuve liegta</h2>
        <p style={{ color: '#334155', marginBottom: '20px' }}>{errorMsg}</p>
        <button onClick={() => router.push('/')} style={{ padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Atgriezties sākumā
        </button>
      </div>
    )
  }

  const listingTitle = [supplementalValues.make, supplementalValues.model].filter(Boolean).join(' ')

  return (
    <div data-edit-page="true" style={{ maxWidth: '1150px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <style>{`
        @media (max-width: 767px) {
          [data-edit-page="true"] {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 10px !important;
            box-sizing: border-box !important;
          }
          [data-edit-layout="true"] {
            display: block !important;
          }
          [data-edit-card="true"] {
            width: 100% !important;
            max-width: none !important;
            padding: 14px !important;
            border-radius: 10px !important;
            box-sizing: border-box !important;
          }
          [data-edit-title="true"] {
            margin: 0 0 14px !important;
            font-size: 19px !important;
            line-height: 1.2 !important;
          }
          [data-edit-form="true"] {
            gap: 11px !important;
          }
          [data-edit-form="true"] input,
          [data-edit-form="true"] select,
          [data-edit-form="true"] textarea {
            min-width: 0 !important;
            font-size: 16px !important;
          }
          [data-edit-supplemental-grid="true"] {
            grid-template-columns: 1fr !important;
            gap: 9px !important;
          }
          [data-edit-images="true"] > div {
            gap: 8px !important;
          }
          [data-edit-actions="true"] {
            flex-direction: column !important;
          }
          [data-edit-ad-column="true"] {
            display: none !important;
          }
          html[data-temauto-theme="night"] body:has([data-edit-page="true"]),
          html[data-temauto-theme="night"] [data-edit-page="true"] {
            color: #e5e7eb !important;
            background: #020617 !important;
          }
          html[data-temauto-theme="night"] [data-edit-card="true"],
          html[data-temauto-theme="night"] [data-edit-supplemental="true"] {
            color: #e5e7eb !important;
            background: #111827 !important;
            border-color: #334155 !important;
          }
          html[data-temauto-theme="night"] [data-edit-title="true"],
          html[data-temauto-theme="night"] [data-edit-form="true"] label,
          html[data-temauto-theme="night"] [data-edit-form="true"] strong {
            color: #f8fafc !important;
          }
          html[data-temauto-theme="night"] [data-edit-form="true"] input,
          html[data-temauto-theme="night"] [data-edit-form="true"] select,
          html[data-temauto-theme="night"] [data-edit-form="true"] textarea {
            color: #f1f5f9 !important;
            background: #1e293b !important;
            border-color: #475569 !important;
          }
          html[data-temauto-theme="night"] [data-edit-form="true"] input:disabled {
            color: #94a3b8 !important;
            background: #0f172a !important;
            opacity: 1 !important;
          }
          html[data-temauto-theme="night"] [data-edit-suggestion-dropdown="true"] {
            background: #0f172a !important;
            border-color: #475569 !important;
          }
          html[data-temauto-theme="night"] [data-edit-suggestion-option="true"] {
            color: #f1f5f9 !important;
            background: #1e293b !important;
            border-bottom-color: #334155 !important;
          }
        }
      `}</style>
      
      <div data-edit-layout="true" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', justifyContent: 'center' }}>
        
        {/* Kreisā puse: Rediģēšanas forma */}
        <div data-edit-card="true" style={{ flex: 1, maxWidth: '800px', backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          <h1 data-edit-title="true" style={{ marginBottom: '20px', color: '#111', fontSize: '24px' }}>Rediģēt sludinājumu: {listingTitle}</h1>
          
          <form data-edit-form="true" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="dropdown-container" style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Cena (€)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Piem. 12 500"
                value={price}
                onChange={(event) => { setPrice(formatPriceInput(event.target.value)); markUnsaved() }}
                onPointerDown={(event) => handleDropdownInputPointerDown(event, 'price')}
                onPointerUp={(event) => handleDropdownInputPointerUp(event, 'price')}
                onPointerCancel={handleDropdownInputPointerCancel}
                onClick={() => handleDropdownInputClick('price')}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div className="dropdown-container" style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Valsts</label>
              {COUNTRIES.find((item) => item.name === country) && (
                <img
                  src={COUNTRIES.find((item) => item.name === country)?.flagUrl}
                  alt=""
                  data-edit-selected-flag="true"
                  style={{ position: 'absolute', left: '11px', top: '38px', width: '24px', height: '16px', objectFit: 'cover', borderRadius: '2px', zIndex: 2, pointerEvents: 'none' }}
                />
              )}
              <input
                type="text"
                placeholder="Izvēlieties valsti"
                value={country}
                onChange={(event) => { setCountry(event.target.value); markUnsaved() }}
                onPointerDown={(event) => handleDropdownInputPointerDown(event, 'country')}
                onPointerUp={(event) => handleDropdownInputPointerUp(event, 'country')}
                onPointerCancel={handleDropdownInputPointerCancel}
                onClick={() => handleDropdownInputClick('country')}
                onBlur={() => handleSuggestionInputBlur('country')}
                style={{ width: '100%', padding: '12px', paddingLeft: COUNTRIES.some((item) => item.name === country) ? '44px' : '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', background: '#fff' }}
              />
              {renderSuggestionDropdown('country', (value) => {
                setCountry(value)
                setRegion('')
              })}
            </div>

            <div className="dropdown-container" style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Reģions / pilsēta</label>
              <input
                type="text"
                placeholder="Reģions vai pilsēta"
                value={region}
                onChange={(event) => { setRegion(event.target.value); markUnsaved() }}
                onPointerDown={(event) => handleDropdownInputPointerDown(event, 'region')}
                onPointerUp={(event) => handleDropdownInputPointerUp(event, 'region')}
                onPointerCancel={handleDropdownInputPointerCancel}
                onClick={() => handleDropdownInputClick('region')}
                onBlur={() => handleSuggestionInputBlur('region')}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              {renderSuggestionDropdown('region', setRegion)}
            </div>

            <section data-edit-supplemental="true" style={{ padding: '14px', border: '1px solid #dbeafe', borderRadius: '10px', background: '#f8fafc' }}>
              <strong style={{ display: 'block', marginBottom: '4px', color: '#0f172a' }}>Papildināt trūkstošo informāciju</strong>
              <span style={{ display: 'block', marginBottom: '12px', color: '#64748b', fontSize: '12px', lineHeight: 1.35 }}>
                Tukšos laukus drīkst aizpildīt vienu reizi. Jau aizpildītā informācija nav maināma.
              </span>
              <div data-edit-supplemental-grid="true" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px' }}>
                {SUPPLEMENTAL_FIELDS.map((field) => {
                  const isLocked = supplementalLocked[field.key]
                  return (
                    <label key={field.key} className="dropdown-container" style={{ display: 'block', minWidth: 0, position: 'relative' }}>
                      <span style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>
                        {field.label}{isLocked ? ' — aizpildīts' : ''}
                      </span>
                      <input
                        type="text"
                        inputMode={('inputMode' in field ? field.inputMode : undefined) as 'numeric' | 'decimal' | undefined}
                        disabled={isLocked}
                        value={supplementalValues[field.key] || ''}
                        placeholder={isLocked ? '' : 'Papildināt'}
                        onChange={(event) => {
                          setSupplementalValues((current) => ({ ...current, [field.key]: event.target.value }))
                          markUnsaved()
                        }}
                        onPointerDown={isLocked ? undefined : (event) => handleDropdownInputPointerDown(event, field.key)}
                        onPointerUp={isLocked ? undefined : (event) => handleDropdownInputPointerUp(event, field.key)}
                        onPointerCancel={isLocked ? undefined : handleDropdownInputPointerCancel}
                        onClick={isLocked ? undefined : () => handleDropdownInputClick(field.key)}
                        onBlur={isLocked ? undefined : () => handleSuggestionInputBlur(field.key)}
                        style={{ width: '100%', padding: '10px', borderRadius: '7px', border: '1px solid #cbd5e1', boxSizing: 'border-box', background: isLocked ? '#f1f5f9' : '#ffffff', color: isLocked ? '#64748b' : '#111827' }}
                      />
                      {!isLocked && renderSuggestionDropdown(field.key, (value) => {
                        setSupplementalValues((current) => ({ ...current, [field.key]: value }))
                      })}
                    </label>
                  )
                })}
              </div>
            </section>

            <div className="dropdown-container" style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Apraksts</label>
              <textarea
                placeholder="Papildus informācija par auto..."
                value={description}
                onChange={(event) => { setDescription(event.target.value); markUnsaved() }}
                onPointerDown={(event) => handleDropdownInputPointerDown(event, 'description')}
                onPointerUp={(event) => handleDropdownInputPointerUp(event, 'description')}
                onPointerCancel={handleDropdownInputPointerCancel}
                onClick={() => handleDropdownInputClick('description')}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '240px', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            <div className="dropdown-container" style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Telefona numurs</label>
              <input
                type="text"
                inputMode="tel"
                placeholder="Piem. +371 29000000"
                value={phone}
                onChange={(event) => { setPhone(event.target.value); markUnsaved() }}
                onPointerDown={(event) => handleDropdownInputPointerDown(event, 'phone')}
                onPointerUp={(event) => handleDropdownInputPointerUp(event, 'phone')}
                onPointerCancel={handleDropdownInputPointerCancel}
                onClick={() => handleDropdownInputClick('phone')}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div className="dropdown-container" style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>E-pasts</label>
              <input
                type="email"
                inputMode="email"
                placeholder="Piem. epasts@inbox.lv"
                value={email}
                onChange={(event) => { setEmail(event.target.value); markUnsaved() }}
                onPointerDown={(event) => handleDropdownInputPointerDown(event, 'email')}
                onPointerUp={(event) => handleDropdownInputPointerUp(event, 'email')}
                onPointerCancel={handleDropdownInputPointerCancel}
                onClick={() => handleDropdownInputClick('email')}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            {/* BILŽU SADAĻA */}
            <div data-edit-images="true" style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Bildes (pirmā ir galvenā titulbilde):</label>
              <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '10px' }}>
                Izmanto bultiņas <b>← →</b>, lai mainītu bilžu secību.
              </span>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {images.map((img, i) => {
                  const previewUrl = img.isNew && img.file ? URL.createObjectURL(img.file) : img.url
                  const isMain = i === 0

                  return (
                    <div key={i} style={{ position: 'relative', width: '120px', height: '120px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', border: isMain ? '3px solid #2563eb' : '1px solid #cbd5e1' }}>
                      <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      
                      <button 
                        type="button" 
                        onClick={() => removeImage(i)} 
                        style={{ 
                          position: 'absolute', top: '4px', right: '4px', 
                          background: '#ef4444', color: 'white', border: 'none', 
                          borderRadius: '50%', width: '22px', height: '22px', 
                          cursor: 'pointer', fontWeight: 'bold', display: 'flex', 
                          alignItems: 'center', justifyContent: 'center', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                        }}
                      >
                        ×
                      </button>

                      <div style={{ 
                        position: 'absolute', bottom: '0', left: '0', right: '0', 
                        background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'space-between', padding: '3px 6px', alignItems: 'center' 
                      }}>
                        <button 
                          type="button" 
                          onClick={() => moveImage(i, 'left')} 
                          disabled={i === 0}
                          style={{ background: 'none', border: 'none', color: i === 0 ? '#64748b' : '#fff', cursor: i === 0 ? 'default' : 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                        >
                          ◀
                        </button>
                        
                        <span style={{ color: '#fff', fontSize: '10px', fontWeight: '600' }}>
                          {isMain ? 'Tituls' : `${i + 1}.`}
                        </span>

                        <button 
                          type="button" 
                          onClick={() => moveImage(i, 'right')} 
                          disabled={i === images.length - 1}
                          style={{ background: 'none', border: 'none', color: i === images.length - 1 ? '#64748b' : '#fff', cursor: i === images.length - 1 ? 'default' : 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <input 
                type="file" 
                multiple 
                onChange={(e) => {
                  if (e.target.files) {
                    const addedFiles = Array.from(e.target.files).map(file => ({ url: '', isNew: true, file }))
                    setImages([...images, ...addedFiles])
                    markUnsaved()
                  }
                }} 
                style={{ padding: '8px 0' }} 
              />
            </div>

            {/* Saglabāšanas un Dzēšanas pogas */}
            <div data-edit-actions="true" style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" disabled={saving} style={{ flex: 1, padding: '15px', background: '#2563eb', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>
                {saving ? 'Saglabā izmaiņas...' : 'Saglabāt izmaiņas'}
              </button>

              <button type="button" onClick={handleDeleteCar} disabled={deleting} style={{ padding: '15px 20px', background: deleting ? '#9ca3af' : '#dc2626', color: 'white', borderRadius: '8px', border: 'none', cursor: deleting ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '600' }}>
                {deleting ? 'Dzēš...' : '🗑️ Dzēst sludinājumu'}
              </button>
            </div>

          </form>
        </div>

        {/* Labā puse: divi nekustīgi, vienāda izmēra reklāmas baneri */}
        <div data-edit-ad-column="true" style={{ width: '260px', flexShrink: 0 }}>
          <div style={{ position: 'fixed', top: '100px', width: '260px', height: 'calc(100dvh - 120px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2].map((placement) => (
              <div key={placement} style={{ flex: '1 1 0', minHeight: 0, boxSizing: 'border-box', backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Reklāma</span>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Ekskluzīvs baneris šeit!<br/><span style={{ fontSize: '12px' }}>(Maksimāla uzmanība)</span></p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
