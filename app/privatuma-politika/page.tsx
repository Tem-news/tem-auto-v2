'use client'

import { useRouter } from 'next/navigation'
import InfoPageHeader from '../components/InfoPageHeader'

const sections = [
  {
    title: '1. Par šo Privātuma politiku',
    paragraphs: [
      'Šajā Privātuma politikā ir paskaidrots, kā TemAuto iegūst, izmanto, glabā un aizsargā personas datus, kad tu apskati platformu, izveido kontu, publicē sludinājumu vai izmanto citas TemAuto iespējas.',
      'Par personas datu apstrādi atbild TemAuto operators. Operatora pilns nosaukums, reģistrācijas dati, adrese un privātuma jautājumiem paredzētā kontaktinformācija tiks norādīta šeit pirms platformas publiskās darbības uzsākšanas.'
    ]
  },
  {
    title: '2. Kādus datus mēs apstrādājam',
    intro: 'Atkarībā no izmantotajām iespējām TemAuto var apstrādāt:',
    items: [
      'konta datus — e-pasta adresi, lietotāja identifikatoru un autentifikācijai nepieciešamo informāciju;',
      'sludinājuma datus — transportlīdzekļa aprakstu, atrašanās vietu, cenu, VIN, attēlus un citu tevis ievadīto informāciju;',
      'kontaktinformāciju — tālruņa numuru un e-pasta adresi, kuru norādi saziņai par sludinājumu;',
      'lietošanas datus — sludinājumu skatījumus, 24 stundu apmeklējumu statistiku un darbības, kas vajadzīgas platformas drošībai un darbībai;',
      'tehniskos datus — IP adresi, ierīces un pārlūkprogrammas informāciju, pieprasījumu laiku, kļūdu un drošības žurnālus, ciktāl tos apstrādā TemAuto vai tā tehnisko pakalpojumu sniedzēji;',
      'saziņas datus — ziņojumus un citu informāciju, kuru nosūti TemAuto, lūdzot palīdzību, iesniedzot sūdzību vai ziņojot par pārkāpumu.'
    ]
  },
  {
    title: '3. Datu iegūšanas avoti',
    paragraphs: [
      'Lielāko daļu datu mēs saņemam tieši no tevis, kad tu reģistrējies, aizpildi vai rediģē sludinājumu un sazinies ar TemAuto. Tehniskie un lietošanas dati var tikt iegūti automātiski no tavas ierīces, pārlūkprogrammas un platformas tehniskajiem pakalpojumiem.',
      'Nepublicē citas personas datus, attēlus vai kontaktinformāciju, ja tev nav tiesiska pamata to darīt.'
    ]
  },
  {
    title: '4. Kāpēc dati tiek izmantoti',
    intro: 'Datus mēs izmantojam, lai:',
    items: [
      'izveidotu un uzturētu lietotāja kontu;',
      'publicētu, parādītu, labotu un dzēstu sludinājumus;',
      'nodrošinātu saziņu starp potenciālo pircēju un sludinājuma ievietotāju;',
      'saglabātu lietotāja izvēles un nodrošinātu platformas funkcijas;',
      'uzskaitītu apmeklējumus un sludinājumu skatījumus, analizētu darbību un uzlabotu TemAuto;',
      'atklātu krāpniecību, ļaunprātīgu izmantošanu un tehniskus vai drošības apdraudējumus;',
      'izskatītu jautājumus, sūdzības, ziņojumus un strīdus;',
      'izpildītu TemAuto juridiskos pienākumus un aizsargātu TemAuto un citu personu tiesības.'
    ]
  },
  {
    title: '5. Datu apstrādes tiesiskais pamats',
    paragraphs: [
      'Atkarībā no situācijas personas dati tiek apstrādāti, lai izpildītu ar tevi noslēgtu līgumu vai veiktu darbības pēc tava pieprasījuma, ievērotu juridisku pienākumu, aizsargātu TemAuto vai trešo personu leģitīmās intereses vai pamatojoties uz tavu piekrišanu, ja tā ir nepieciešama.',
      'TemAuto leģitīmās intereses var būt platformas drošība, krāpniecības novēršana, pakalpojuma uzlabošana un juridisku prasību aizsardzība. Ja apstrāde balstīta uz piekrišanu, tu vari to atsaukt, neietekmējot pirms atsaukšanas veiktās apstrādes likumību.'
    ]
  },
  {
    title: '6. Publiski redzamā informācija',
    paragraphs: [
      'Sludinājuma saturs un attēli ir paredzēti publiskai apskatei. Sludinājumā norādītā kontaktinformācija un VIN var tikt sākotnēji daļēji aizsegti, tomēr lietotājs tos var atvērt, lai sazinātos ar pārdevēju vai pārbaudītu transportlīdzekli.',
      'Pirms sludinājuma publicēšanas pārliecinies, ka tajā nav dokumentu, sejas attēlu, numuru zīmju vai citas informācijas, kuru nevēlies publiskot. Publiski pieejamu informāciju var saglabāt vai pārpublicēt trešās personas ārpus TemAuto kontroles.'
    ]
  },
  {
    title: '7. Datu saņēmēji un pakalpojumu sniedzēji',
    paragraphs: [
      'Dati var tikt nodoti pakalpojumu sniedzējiem tikai tādā apjomā, kāds vajadzīgs TemAuto darbībai. Pašlaik tehniskajā risinājumā tiek izmantots Supabase kontiem, datubāzei un attēlu glabāšanai, kā arī Vercel tīmekļvietnes izvietošanai un piegādei.',
      'Karodziņu attēlošanai var tikt izmantots ārējs attēlu piegādes pakalpojums, kurš, saņemot attēla pieprasījumu, var apstrādāt ierīces IP adresi un tehnisko informāciju.',
      'Datus varam izpaust kompetentai valsts iestādei, tiesai vai citai personai, ja to prasa tiesību akti vai tas nepieciešams juridisku prasību aizsardzībai. TemAuto nepārdod personas datus.'
    ]
  },
  {
    title: '8. Datu nosūtīšana uz citām valstīm',
    paragraphs: [
      'TemAuto ir paredzēts starptautiskai lietošanai. Daži tehnisko pakalpojumu sniedzēji vai to infrastruktūra var atrasties ārpus Eiropas Ekonomikas zonas. Ja uz šādu nosūtīšanu attiecas Eiropas datu aizsardzības prasības, tiek izmantots piemērojams tiesiskais mehānisms un atbilstoši drošības pasākumi.',
      'Sludinājuma publiskā informācija var būt pieejama lietotājiem jebkurā pasaules valstī.'
    ]
  },
  {
    title: '9. Vietējā glabāšana un nepieciešamās tehnoloģijas',
    paragraphs: [
      'TemAuto izmanto pārlūkprogrammas vietējo un sesijas glabātuvi, lai uzturētu pierakstīšanos, atcerētos dienas vai nakts režīmu, favorītus, nesen apskatītos sludinājumus, atgriešanās adresi un citas lietotāja izvēles.',
      'Daļa šo datu paliek tikai tavā ierīcē. Tu vari tos dzēst pārlūkprogrammas iestatījumos, taču pēc dzēšanas vari tikt izrakstīts no konta un dažas saglabātās izvēles var pazust.',
      'Ja nākotnē tiks izmantotas reklāmas vai izvēles analītikas sīkdatnes, informācija par tām tiks papildināta un, kur nepieciešams, pirms to izmantošanas tiks prasīta piekrišana.'
    ]
  },
  {
    title: '10. Datu glabāšanas ilgums',
    paragraphs: [
      'Datus glabājam tikai tik ilgi, cik tas nepieciešams attiecīgajam nolūkam. Konta un sludinājumu dati parasti tiek glabāti, kamēr konts vai sludinājums ir aktīvs, un saprātīgu laiku pēc tā dzēšanas, ja tas nepieciešams drošībai, strīdu risināšanai, krāpniecības novēršanai vai juridisku pienākumu izpildei.',
      'Tehnisko žurnālu, rezerves kopiju un saziņas datu glabāšanas termiņi var atšķirties. Pirms publiskās palaišanas TemAuto noteiks un šeit norādīs konkrētākus termiņus galvenajām datu kategorijām.'
    ]
  },
  {
    title: '11. Tavas tiesības',
    intro: 'Atbilstoši piemērojamiem tiesību aktiem tev var būt tiesības:',
    items: [
      'saņemt informāciju un piekļūt saviem personas datiem;',
      'labot neprecīzus vai nepilnīgus datus;',
      'pieprasīt datu dzēšanu vai apstrādes ierobežošanu;',
      'iebilst pret apstrādi, kas balstīta uz leģitīmajām interesēm;',
      'saņemt savus datus pārnesamā formātā, ja šīs tiesības ir piemērojamas;',
      'atsaukt iepriekš sniegtu piekrišanu;',
      'iesniegt sūdzību savas valsts datu aizsardzības uzraudzības iestādē.'
    ],
    after: 'Latvijā uzraudzības iestāde ir Datu valsts inspekcija. Lai izmantotu savas tiesības, būs iespējams sazināties ar TemAuto, izmantojot pirms publiskās palaišanas norādīto privātuma kontaktadresi.'
  },
  {
    title: '12. Datu drošība',
    paragraphs: [
      'TemAuto izmanto samērīgus tehniskus un organizatoriskus pasākumus, lai aizsargātu datus pret neatļautu piekļuvi, izpaušanu, nozaudēšanu, pārveidošanu vai iznīcināšanu. Piekļuve kontam tiek aizsargāta ar autentifikāciju, un sludinājumu pārvaldība paredzēta tikai to īpašniekam.',
      'Neviena interneta sistēma nav pilnīgi droša. Arī tev jāizmanto droša parole, tā nav jāizpauž citām personām un pēc darba koplietojamā ierīcē jāizrakstās no konta.'
    ]
  },
  {
    title: '13. Bērnu dati',
    paragraphs: [
      'TemAuto sludinājumu publicēšanas pakalpojums nav paredzēts personām, kuras nav sasniegušas 18 gadu vecumu. Ja konstatēsim, ka nepilngadīgas personas dati iesniegti neatbilstoši, veiksim samērīgas darbības to dzēšanai.'
    ]
  },
  {
    title: '14. Politikas izmaiņas',
    paragraphs: [
      'Šī politika var tikt atjaunināta, mainoties TemAuto iespējām, pakalpojumu sniedzējiem vai tiesību aktu prasībām. Aktuālā redakcija un tās spēkā stāšanās datums vienmēr būs pieejams šajā sadaļā. Par būtiskām izmaiņām reģistrētie lietotāji tiks informēti piemērotā veidā.'
    ]
  }
]

export default function PrivacyPolicyPage() {
  const router = useRouter()

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '18px 16px 56px', color: '#1e293b' }}>
      <InfoPageHeader title="Privātuma politika" />
      <button
        type="button"
        onClick={() => router.back()}
        style={{ minHeight: '40px', marginBottom: '16px', padding: '8px 14px', color: '#166534', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
      >
        ← Atpakaļ
      </button>

      <article style={{ padding: 'clamp(20px, 5vw, 40px)', background: '#ffffff', border: '1px solid #dbe3ec', borderRadius: '14px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
        <p style={{ margin: '0 0 28px', color: '#64748b', fontSize: '14px' }}>Spēkā no 2026. gada 21. septembra</p>

        {sections.map((section) => (
          <section key={section.title} style={{ marginTop: '28px' }}>
            <h2 style={{ margin: '0 0 12px', color: '#0f172a', fontSize: '20px', lineHeight: 1.3 }}>{section.title}</h2>
            {section.intro && <p style={{ margin: '0 0 10px', lineHeight: 1.65 }}>{section.intro}</p>}
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} style={{ margin: '0 0 12px', lineHeight: 1.65 }}>{paragraph}</p>
            ))}
            {section.items && (
              <ul style={{ margin: '0 0 12px', paddingLeft: '22px' }}>
                {section.items.map((item) => <li key={item} style={{ marginBottom: '8px', lineHeight: 1.6 }}>{item}</li>)}
              </ul>
            )}
            {section.after && <p style={{ margin: '0 0 12px', lineHeight: 1.65 }}>{section.after}</p>}
          </section>
        ))}
      </article>
    </div>
  )
}
