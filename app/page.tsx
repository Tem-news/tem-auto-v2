'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const OFFICIAL_MAKES: { [key: string]: string } = {
  'bmw': 'BMW',
  'audi': 'Audi',
  'volkswagen': 'Volkswagen',
  'vw': 'Volkswagen',
  'volvo': 'Volvo',
  'toyota': 'Toyota',
  'mercedes': 'Mercedes-Benz',
  'mercedes-benz': 'Mercedes-Benz',
  'mb': 'Mercedes-Benz',
  'alfa romeo': 'Alfa Romeo',
  'alfaromeo': 'Alfa Romeo',
  'chevrolet': 'Chevrolet',
  'chrysler': 'Chrysler',
  'citroen': 'Citroën',
  'cupra': 'Cupra',
  'dacia': 'Dacia',
  'dodge': 'Dodge',
  'ford': 'Ford',
  'honda': 'Honda',
  'hyundai': 'Hyundai',
  'kia': 'Kia',
  'lexus': 'Lexus',
  'mazda': 'Mazda',
  'mitsubishi': 'Mitsubishi',
  'nissan': 'Nissan',
  'opel': 'Opel',
  'peugeot': 'Peugeot',
  'porsche': 'Porsche',
  'renault': 'Renault',
  'skoda': 'Škoda',
  'subaru': 'Subaru',
  'suzuki': 'Suzuki',
  'tesla': 'Tesla'
}

const COUNTRIES = [
  { name: 'Latvija', code: 'lv' },
  { name: 'Lietuva', code: 'lt' },
  { name: 'Igaunija', code: 'ee' },
  { name: 'Vācija', code: 'de' },
  { name: 'Polija', code: 'pl' },
  { name: 'Zviedrija', code: 'se' },
  { name: 'Somija', code: 'fi' },
  { name: 'Dānija', code: 'dk' },
  { name: 'Norvēģija', code: 'no' },
  { name: 'Nīderlande', code: 'nl' },
  { name: 'Beļģija', code: 'be' },
  { name: 'Francija', code: 'fr' },
  { name: 'Itālija', code: 'it' },
  { name: 'Spānija', code: 'es' },
  { name: 'Lielbritānija', code: 'gb' },
  { name: 'ASV', code: 'us' },
  { name: 'Kanāda', code: 'ca' },
  { name: 'Austrija', code: 'at' },
  { name: 'Šveice', code: 'ch' },
  { name: 'Čehija', code: 'cz' },
  { name: 'Islande', code: 'is' },
  { name: 'Īrija', code: 'ie' },
  { name: 'Japāna', code: 'jp' },
  { name: 'Koreja', code: 'kr' },
  { name: 'Portugāle', code: 'pt' },
  { name: 'Rumānija', code: 'ro' },
  { name: 'Turcija', code: 'tr' },
  { name: 'Ukraina', code: 'ua' }
]

const REGIONS_BY_COUNTRY: { [key: string]: string[] } = {
  'Latvija': ['Rīga', 'Rīgas rajons', 'Jūrmala', 'Pierīga', 'Vidzeme', 'Kurzeme', 'Zemgale', 'Latgale', 'Liepāja', 'Ventspils', 'Jelgava', 'Daugavpils', 'Valmiera', 'Jēkabpils', 'Ogre', 'Tukums', 'Cēsis'],
  'Lietuva': ['Viļņa', 'Kauna', 'Klaipēda', 'Šauļi', 'Panevēža', 'Alīta', 'Marijampole', 'Mažeiķi', 'Jonava', 'Utenas apriņķis'],
  'Igaunija': ['Harju (Tallina)', 'Tartu', 'Ida-Viru', 'Pērnava', 'Lääne-Viru', 'Viljandi', 'Rapla', 'Võru', 'Saare', 'Järva'],
  'Vācija': [
    'Bāden-Virtemberga (Baden-Württemberg)', 'Bavārija (Bayern)', 'Berlīne (Berlin)', 'Brandenburga (Brandenburg)', 
    'Brēmene (Bremen)', 'Hamburga (Hamburg)', 'Hesene (Hessen)', 'Mērklenburga-Priekšpomerānija (Mecklenburg-Vorpommern)', 
    'Lejassaksija (Niedersachsen)', 'Ziemeļreina-Vestfālene (Nordrhein-Westfalen)', 'Reinlande-Pfalca (Rheinland-Pfalz)', 
    'Sāra (Saarland)', 'Saksija (Sachsen)', 'Saksija-Anhalte (Saksija-Anhalt)', 'Šlēsviga-Holšteina (Schleswig-Holstein)', 'Tīringene (Thüringen)'
  ],
  'Polija': [
    'Apakšsilēzijas vojevodiste (Dolnośląskie)', 'Kujāvijas-Pomožes vojevodiste (Kujawsko-pomorskie)', 'Lodzas vojevodiste (Łódzkie)', 
    'Mazpolijas vojevodiste (Małopolskie)', 'Mazovijas vojevodiste (Mazowieckie)', 'Opoles vojevodiste (Opolskie)', 
    'Piekarpatu vojevodiste (Podkarpackie)', 'Podlases vojevodiste (Podlaskie)', 'Pomožes vojevodiste (Pomorskie)', 
    'Saksijas/Silēzijas vojevodiste (Śląskie)', 'Svētkrusta vojevodiste (Świętokrzyskie)', 'Varmijas-Mazūrijas vojevodiste (Warmińsko-mazurskie)', 
    'Lielpolijas vojevodiste (Wielkopolskie)', 'Rietumpomožes vojevodiste (Zachodniopomorskie)', 'Lubļinas vojevodiste (Lubelskie)', 'Lubušas vojevodiste (Lubuskie)'
  ],
  'ASV': [
    'Alabama (AL)', 'Alaska (AK)', 'Arizona (AZ)', 'Arkansas (AR)', 'California (CA)', 
    'Colorado (CO)', 'Connecticut (CT)', 'Delaware (DE)', 'Florida (FL)', 'Georgia (GA)', 
    'Hawaii (HI)', 'Idaho (ID)', 'Illinois (IL)', 'Indiana (IN)', 'Iowa (IA)', 
    'Kansas (KS)', 'Kentucky (KY)', 'Louisiana (LA)', 'Maine (ME)', 'Maryland (MD)', 
    'Massachusetts (MA)', 'Michigan (MI)', 'Minnesota (MN)', 'Mississippi (MS)', 'Missouri (MO)', 
    'Montana (MT)', 'Nebraska (NE)', 'Nevada (NV)', 'New Hampshire (NH)', 'New Jersey (NJ)', 
    'New Mexico (NM)', 'New York (NY)', 'North Carolina (NC)', 'North Dakota (ND)', 'Ohio (OH)', 
    'Oklahoma (OK)', 'Oregon (OR)', 'Pennsylvania (PA)', 'Rhode Island (RI)', 'South Carolina (SC)', 
    'South Dakota (SD)', 'Tennessee (TN)', 'Texas (TX)', 'Utah (UT)', 'Vermont (VT)', 
    'Virginia (VA)', 'Washington (WA)', 'West Virginia (WV)', 'Wisconsin (WI)', 'Wyoming (WY)'
  ]
}

const DEFAULT_REGIONS = ['Galvaspilsēta / Centrs', 'Ziemeļu reģions', 'Dienvidu reģions', 'Austrumu reģions', 'Rietumu reģions']

const ENGINE_TYPES = [
  'Dīzelis', 'Benzīns', 'Benzīns / Gāze', 'Hibrīds (Benzīns)', 'Hibrīds (Dīzelis)', 'Elektriskais'
]

const GEARBOX_TYPES = [
  'Mehāniskā', 'Automāts', 'Pusautomāts'
]

const BODY_TYPES = [
  'Sedans', 'Universāls', 'Hečbeks', 'Apvidus (SUV)', 'Kupeja', 'Kabriolets', 'Minivens', 'Kompaktvens', 'Pikaps', 'Furgons'
]

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

const VOLUMES = [
  '1.0', '1.2', '1.4', '1.6', '1.8', '2.0', '2.2', '2.5', '3.0', '3.5', '4.0', '5.0'
]

function normalizeMake(makeStr: string): string {
  if (!makeStr) return ''
  const trimmed = makeStr.trim()
  const lower = trimmed.toLowerCase()
  if (OFFICIAL_MAKES[lower]) {
    return OFFICIAL_MAKES[lower]
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function formatPriceInput(value: string): string {
  const cleanNums = value.replace(/\D/g, '')
  if (!cleanNums) return ''
  return cleanNums.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function Sakumlapa() {
  const router = useRouter()
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [searchMake, setSearchMake] = useState('')
  const [searchModel, setSearchModel] = useState('')
  
  const [valsts, setValsts] = useState('')
  const [regions, setRegions] = useState('')
  
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [displayMinPrice, setDisplayMinPrice] = useState('')
  const [displayMaxPrice, setDisplayMaxPrice] = useState('')

  const [minYear, setMinYear] = useState('')
  const [maxYear, setMaxYear] = useState('')
  const [dzinejs, setDzinejs] = useState('')
  const [minTilpums, setMinTilpums] = useState('')
  const [maxTilpums, setMaxTilpums] = useState('')
  const [atrumkarba, setAtrumkarba] = useState('')
  const [virsbuve, setVirsbuve] = useState('')
  const [krasa, setKrasa] = useState('')

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = (name: string) => {
    setActiveDropdown(prev => prev === name ? null : name)
  }

  const hasActiveFilters = searchMake 
    ? Boolean(searchModel || valsts || regions || minPrice || maxPrice || minYear || maxYear || dzinejs || minTilpums || maxTilpums || atrumkarba || virsbuve || krasa)
    : Boolean(searchMake || searchModel || valsts || regions || minPrice || maxPrice || minYear || maxYear || dzinejs || minTilpums || maxTilpums || atrumkarba || virsbuve || krasa)

  const clearAllFilters = () => {
    setSearchModel('')
    setValsts('')
    setRegions('')
    setMinPrice('')
    setMaxPrice('')
    setDisplayMinPrice('')
    setDisplayMaxPrice('')
    setMinYear('')
    setMaxYear('')
    setDzinejs('')
    setMinTilpums('')
    setMaxTilpums('')
    setAtrumkarba('')
    setVirsbuve('')
    setKrasa('')
    setActiveDropdown(null)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchData() {
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false })

      if (carsError) {
        console.error('Kļūda ielādējot auto:', carsError)
      } else {
        const normalizedCars = (carsData || []).map(car => ({
          ...car,
          make: normalizeMake(car.make)
        }))
        setCars(normalizedCars)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const availableRegions = useMemo(() => {
    if (!valsts) {
      return REGIONS_BY_COUNTRY['Latvija']
    }
    const foundKey = Object.keys(REGIONS_BY_COUNTRY).find(
      key => key.toLowerCase() === valsts.toLowerCase()
    )
    return foundKey ? REGIONS_BY_COUNTRY[foundKey] : DEFAULT_REGIONS
  }, [valsts])

  const makeCounts = useMemo(()
