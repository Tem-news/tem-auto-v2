'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

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

type ImageItem = {
  file: File
  url: string
}

export default function PievienotAuto() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [price, setPrice] = useState('')
  const [displayPrice, setDisplayPrice] = useState('')
  const [engine, setEngine] = useState('')
  const [volume, setVolume] = useState('')
  const [gearbox, setGearbox] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [color, setColor] = useState('')
  
  const [vin, setVin] = useState('')
  const [nobraukums, setNobraukums] = useState('')
  const [displayNobraukums, setDisplayNobraukums] = useState('')
  const [tehiskapskate, setTehiskapskate] = useState('')
  const [sture, setSture] = useState('')
  const [salonaKrasa, setSalonaKrasa] = useState('')
  
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [region, setRegion] = useState('')
  const [description, setDescription] = useState('')
  
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  
  const [images, setImages] = useState<ImageItem[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  
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

  const toggleDropdown = (name: string) => {
    setActiveDropdown(prev => prev === name ? null : name)
  }

  const handlePriceChange = (val: string) => {
    const cleanNums = val.replace(/\D/g, '')
    if (!cleanNums) {
      setPrice('')
      setDisplayPrice('')
      return
    }
    setPrice(cleanNums)
    setDisplayPrice(cleanNums.replace(/\B(?=(\d{3})+(?!\d))/g, ' '))
  }

  const handleNobraukumsChange = (val: string) => {
    const cleanNums = val.replace(/\D/g, '')
    if (!cleanNums) {
      setNobraukums('')
      setDisplayNobraukums('')
      return
    }
    setNobraukums(cleanNums)
    setDisplayNobraukums(cleanNums.replace(/\B(?=(\d{3})+(?!\d))/g, ' '))
  }

  const handleFiles = (files: FileList | File[]) => {
    const filesArray = Array.from(files)
    const newImages: ImageItem[] = filesArray.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }))
    setImages(prev => [...prev, ...newImages])
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...images]
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newImages.length) return
    const temp = newImages[index]
    newImages[index] = newImages[targetIndex]
    newImages[targetIndex] = temp
    setImages(newImages)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    if (!make || !model || !year) {
      setErrorMessage('Lūdzu, aizpildiet obligātos laukus: Marka, Modelis un Gads!')
      setLoading(false)
      return
    }

    try {
      const uploadedImageUrls: string[] = []

      for (const img of images) {
        if (img.file) {
          const fileExt = img.file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('car-images')
            .upload(fileName, img.file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('Kļūda augšupielādējot attēlu:', uploadError.message)
            continue
          }

          const { data: publicUrlData } = supabase.storage
            .from('car-images')
            .getPublicUrl(fileName)

          if (publicUrlData?.publicUrl) {
            uploadedImageUrls.push(publicUrlData.publicUrl)
          }
        }
      }

      const mainCoverImage = uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : null

      const { error } = await supabase.from('cars').insert([
        {
          make: make.trim(),
          model: model.trim(),
          year: Number(year),
          price: price ? Number(price) : null,
          engine: engine.trim(),
          volume: volume ? Number(volume) : null,
          gearbox: gearbox.trim(),
          body_type: bodyType.trim(),
          color: color.trim(),
          vin: vin.trim(),
          mileage: nobraukums ? Number(nobraukums) : null,
          tech_inspection: tehiskapskate.trim(),
          steering_wheel: sture.trim() || 'Kreisā',
          interior_color: salonaKrasa.trim(),
          country: selectedCountry.name,
          region: region.trim(),
          description: description.trim(),
          email: email.trim(),
          phone: phone.trim(),
          images: uploadedImageUrls,
          image_url: mainCoverImage,
          created_at: new Date().toISOString()
        }
      ])

      if (error) {
        console.error('Kļūda saglabājot auto:', error)
        setErrorMessage('Neizdevās pievienot sludinājumu: ' + error.message)
        setLoading(false)
      } else {
        router.push('/')
      }
    } catch (err: any) {
      console.error('Negaidīta kļūda:', err)
      setErrorMessage('Sistēmas kļūda: ' + err.message)
      setLoading(false)
    }
  }

  const availableModels = (MODELS_BY_MAKE[make] || []).filter(m => 
    m.toLowerCase().includes(model.toLowerCase())
  )

  return (
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '24px 12px', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 240px', gap: '16px', alignItems: 'start', width: '100%' }}>
        
        {/* KREISĀ PUSE - 2 Baneri */}
        <div style={{ position: 'sticky', top: '72px', alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f9fafb', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#6b7280', fontSize: '13px' }}>
            <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA 1</span>
            <span>Sānu baneris augšējais!</span>
          </div>
          <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f9fafb', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#6b7280', fontSize: '13px' }}>
            <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA 2</span>
            <span>Sānu baneris apakšējais!</span>
          </div>
        </div>

        {/* VIDUS: Forma */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', boxSizing: 'border-box' }}>
          
          <div style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Pievienot jaunu auto sludinājumu</h1>
            <p style={{ fontSize: '13.5px', color: '#6b7280', marginTop: '4px' }}>Aizpildiet datus par automašīnu un pievienojiet attēlus.</p>
          </div>

          {errorMessage && (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '13.5px', marginBottom: '20px' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* 1. Rinda: Marka / Modelis */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Automašīnas marka *</label>
                <input
                  type="text"
                  placeholder="Sāciet rakstīt vai izvēlieties..."
                  value={make}
                  onChange={(e) => { setMake(e.target.value); setActiveDropdown('make'); }}
                  onClick={() => toggleDropdown('make')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'make' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '220px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {POPULAR_MAKES.filter(m => m.toLowerCase().includes(make.toLowerCase())).map((m) => (
                      <div
                        key={m}
                        onClick={() => { setMake(m); setModel(''); setActiveDropdown(null); }}
                        style={{ padding: '9px 12px', fontSize: '13.5px', cursor: 'pointer', fontWeight: '500', color: '#111827', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Modelis *</label>
                <input
                  type="text"
                  placeholder={make ? `Izvēlieties ${make} modeli...` : 'Vispirms izvēlieties marku'}
                  value={model}
                  onChange={(e) => { setModel(e.target.value); setActiveDropdown('model'); }}
                  onClick={() => toggleDropdown('model')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'model' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {availableModels.length > 0 ? (
                      availableModels.map((mod) => (
                        <div
                          key={mod}
                          onClick={() => { setModel(mod); setActiveDropdown(null); }}
                          style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                          {mod}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '8px 12px', fontSize: '13.5px', color: '#6b7280' }}>Ievadiet modeli brīvā formā</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Rinda: Gads / Cena */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Izlaiduma gads *</label>
                <input
                  type="text"
                  placeholder="Piem., 2020"
                  value={year}
                  onChange={(e) => { setYear(e.target.value); setActiveDropdown('year'); }}
                  onClick={() => toggleDropdown('year')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'year' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {YEARS.filter(y => y.includes(year)).map((y) => (
                      <div
                        key={y}
                        onClick={() => { setYear(y); setActiveDropdown(null); }}
                        style={{ padding: '6px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {y} g.
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Cena (€)</label>
                <input
                  type="text"
                  placeholder="Piem., 12 500"
                  value={displayPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
            </div>

            {/* 3. Rinda: Dzinēja tips / Dzinēja tilpums */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Dzinēja tips</label>
                <input
                  type="text"
                  placeholder="Izvēlieties dzinēju..."
                  value={engine}
                  onChange={(e) => { setEngine(e.target.value); setActiveDropdown('engine'); }}
                  onClick={() => toggleDropdown('engine')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'engine' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {ENGINE_TYPES.filter(et => et.toLowerCase().includes(engine.toLowerCase())).map((et) => (
                      <div
                        key={et}
                        onClick={() => { setEngine(et); setActiveDropdown(null); }}
                        style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {et}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Dzinēja tilpums (L)</label>
                <input
                  type="text"
                  placeholder="Piem., 2.0"
                  value={volume}
                  onChange={(e) => { setVolume(e.target.value); setActiveDropdown('volume'); }}
                  onClick={() => toggleDropdown('volume')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'volume' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {ENGINE_VOLUMES.filter(v => v.includes(volume)).map((v) => (
                      <div
                        key={v}
                        onClick={() => { setVolume(v); setActiveDropdown(null); }}
                        style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {v}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Rinda: Ātrumkārba / Virsbūves tips */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Ātrumkārba</label>
                <input
                  type="text"
                  placeholder="Izvēlieties kārbu..."
                  value={gearbox}
                  onChange={(e) => { setGearbox(e.target.value); setActiveDropdown('gearbox'); }}
                  onClick={() => toggleDropdown('gearbox')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'gearbox' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {GEARBOX_TYPES.filter(gt => gt.toLowerCase().includes(gearbox.toLowerCase())).map((gt) => (
                      <div
                        key={gt}
                        onClick={() => { setGearbox(gt); setActiveDropdown(null); }}
                        style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {gt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Virsbūves tips</label>
                <input
                  type="text"
                  placeholder="Izvēlieties virsbūvi..."
                  value={bodyType}
                  onChange={(e) => { setBodyType(e.target.value); setActiveDropdown('bodyType'); }}
                  onClick={() => toggleDropdown('bodyType')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'bodyType' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {BODY_TYPES.filter(bt => bt.toLowerCase().includes(bodyType.toLowerCase())).map((bt) => (
                      <div
                        key={bt}
                        onClick={() => { setBodyType(bt); setActiveDropdown(null); }}
                        style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {bt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 5. Rinda: Krāsa / Nobraukums */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Krāsa</label>
                <input
                  type="text"
                  placeholder="Izvēlieties krāsu..."
                  value={color}
                  onChange={(e) => { setColor(e.target.value); setActiveDropdown('color'); }}
                  onClick={() => toggleDropdown('color')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'color' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {COLORS.filter(c => c.name.toLowerCase().includes(color.toLowerCase())).map((c) => (
                      <div
                        key={c.name}
                        onClick={() => { setColor(c.name); setActiveDropdown(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: c.hex, border: `1px solid ${c.border}` }}></span>
                        {c.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Nobraukums (km)</label>
                <input
                  type="text"
                  placeholder="Piem., 180 000"
                  value={displayNobraukums}
                  onChange={(e) => handleNobraukumsChange(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
            </div>

            {/* 6. Rinda: VIN kods / Stūres novietojums */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>VIN kods</label>
                <input
                  type="text"
                  placeholder="Ievadiet VIN kods"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>

              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Stūres novietojums</label>
                <input
                  type="text"
                  placeholder="Izvēlieties..."
                  value={sture}
                  onChange={(e) => { setSture(e.target.value); setActiveDropdown('sture'); }}
                  onClick={() => toggleDropdown('sture')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'sture' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {STEERING_TYPES.filter(st => st.toLowerCase().includes(sture.toLowerCase())).map((st) => (
                      <div
                        key={st}
                        onClick={() => { setSture(st); setActiveDropdown(null); }}
                        style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {st}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 7. Rinda: Tehniskā apskate / Salona krāsa */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Tehniskā apskate līdz</label>
                <input
                  type="text"
                  placeholder="MM/GGGG vai Datums"
                  value={tehiskapskate}
                  onChange={(e) => setTehiskapskate(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Salona krāsa</label>
                <input
                  type="text"
                  placeholder="Piem., Melna āda"
                  value={salonaKrasa}
                  onChange={(e) => setSalonaKrasa(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
            </div>

            {/* 8. Rinda: Valsts un Reģions / Pilsēta (Novietoti pretī viens otram) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Valsts */}
              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Valsts</label>
                <div 
                  onClick={() => toggleDropdown('country')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                >
                  <img src={selectedCountry.flagUrl} alt="" style={{ width: '24px', height: '16px', objectFit: 'cover', borderRadius: '2px' }} />
                  <span>{selectedCountry.name}</span>
                </div>
                {activeDropdown === 'country' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '220px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {COUNTRIES.map((c) => (
                      <div
                        key={c.code}
                        onClick={() => { setSelectedCountry(c); setRegion(''); setActiveDropdown(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        <img src={c.flagUrl} alt="" style={{ width: '24px', height: '16px', objectFit: 'cover', borderRadius: '2px' }} />
                        <span>{c.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reģions / Pilsēta */}
              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Reģions / Pilsēta</label>
                <input
                  type="text"
                  placeholder="Izvēlieties reģionu..."
                  value={region}
                  onChange={(e) => { setRegion(e.target.value); setActiveDropdown('region'); }}
                  onClick={() => toggleDropdown('region')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'region' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {selectedCountry.regions.filter(r => r.toLowerCase().includes(region.toLowerCase())).map((r) => (
                      <div
                        key={r}
                        onClick={() => { setRegion(r); setActiveDropdown(null); }}
                        style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {r}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Apraksts */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Apraksts</label>
              <textarea
                rows={4}
                placeholder="Papildus informācija par auto stāvokli, komplektāciju..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff', resize: 'vertical' }}
              />
            </div>

            {/* Kontakti */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>E-pasts</label>
                <input
                  type="email"
                  placeholder="tavs@epasts.lv"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Telefons</label>
                <input
                  type="text"
                  placeholder="+371 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
            </div>

            {/* Bilžu augšupielāde */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Fotoattēli</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? '#2563eb' : '#d1d5db'}`,
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: isDragging ? '#eff6ff' : '#f9fafb',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                  <span style={{ display: 'block', fontSize: '14px', color: '#374151', fontWeight: '500', marginBottom: '4px' }}>
                    Ievilkt attēlus šeit vai <span style={{ color: '#2563eb' }}>izvēlēties failus</span>
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>PNG, JPG vai WEBP</span>
                </label>
              </div>

              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginTop: '12px' }}>
                  {images.map((img, index) => (
                    <div key={index} style={{ position: 'relative', height: '90px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #d1d5db', backgroundColor: '#f3f4f6' }}>
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '2px' }}>
                        {index > 0 && (
                          <button type="button" onClick={() => moveImage(index, 'left')} style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '3px', width: '20px', height: '20px', fontSize: '10px', cursor: 'pointer' }}>◀</button>
                        )}
                        {index < images.length - 1 && (
                          <button type="button" onClick={() => moveImage(index, 'right')} style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '3px', width: '20px', height: '20px', fontSize: '10px', cursor: 'pointer' }}>▶</button>
                        )}
                        <button type="button" onClick={() => removeImage(index)} style={{ background: 'rgba(220,38,38,0.8)', color: '#fff', border: 'none', borderRadius: '3px', width: '20px', height: '20px', fontSize: '10px', cursor: 'pointer' }}>✕</button>
                      </div>
                      {index === 0 && (
                        <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '9px', textAlign: 'center', padding: '2px 0' }}>Galvenā</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Iesniegšanas poga */}
            <div style={{ marginTop: '12px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: loading ? '#9ca3af' : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Pievieno sludinājumu...' : 'Pievienot sludinājumu'}
              </button>
            </div>

          </form>
        </div>

        {/* LABĀ PUSE - 2 Baneri */}
        <div style={{ position: 'sticky', top: '72px', alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f9fafb', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#6b7280', fontSize: '13px' }}>
            <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA 3</span>
            <span>Sānu baneris labajā pusē (augšā)!</span>
          </div>
          <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f9fafb', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#6b7280', fontSize: '13px' }}>
            <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA 4</span>
            <span>Sānu baneris labajā pusē (apakšā)!</span>
          </div>
        </div>

      </div>
    </div>
  )
}
