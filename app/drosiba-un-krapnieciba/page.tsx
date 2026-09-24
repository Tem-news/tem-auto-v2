'use client'

const sections = [
  {
    title: 'Drošs darījums sākas ar pārbaudi',
    paragraphs: [
      'TemAuto palīdz pircējiem un pārdevējiem atrast vienam otru, bet nav transportlīdzekļa pārdevējs, maksājumu starpnieks vai darījuma garantētājs. Par automašīnas pārbaudi, samaksu un īpašuma tiesību maiņu vienojas pircējs un pārdevējs.',
      'Nesteidzies. Krāpnieki bieži rada steidzamības sajūtu, piedāvā neticami zemu cenu vai apgalvo, ka ir vēl vairāki pircēji. Ja piedāvājums šķiet pārāk labs, lai būtu patiess, pārbaudi to īpaši rūpīgi.'
    ]
  },
  {
    title: '1. Pirms pirkuma pārbaudi automašīnu',
    items: [
      'apskati automašīnu klātienē vai uztici apskati neatkarīgam speciālistam;',
      'salīdzini VIN uz automašīnas ar VIN dokumentos un sludinājumā;',
      'pārbaudi reģistrācijas dokumentus, pārdevēja identitāti un tiesības automašīnu pārdot;',
      'izmanto uzticamu transportlīdzekļa vēstures avotu, lai pārbaudītu nobraukumu, negadījumus, īpašnieku maiņas un meklēšanas statusu;',
      'veic neatkarīgu tehnisko diagnostiku, nepaļaujoties tikai uz pārdevēja sagatavotu atzinumu;',
      'pārbaudi, vai transportlīdzeklim nav ķīlas, aresta, līzinga vai cita juridiska apgrūtinājuma;',
      'salīdzini cenu ar līdzīgiem piedāvājumiem attiecīgajā valstī un reģionā.'
    ]
  },
  {
    title: '2. Pārbaudi pārdevēju',
    items: [
      'pārbaudi, vai pārdevēja vārds sakrīt ar transportlīdzekļa dokumentos norādīto īpašnieku;',
      'ja pārdod uzņēmums, pārbaudi tā nosaukumu, reģistrācijas datus, adresi un atsauksmes neatkarīgos avotos;',
      'neuzticies tikai nosūtītai pases, licences vai reģistrācijas dokumenta fotogrāfijai — arī tā var būt zagta vai viltota;',
      'uzmanies, ja pārdevējs atsakās sazvanīties, tikties, parādīt automašīnu vai ļaut to pārbaudīt;',
      'pārbaudi sludinājuma attēlus ar attēlu meklēšanu — vienas un tās pašas fotogrāfijas dažādās valstīs vai sludinājumos var liecināt par krāpšanu.'
    ]
  },
  {
    title: '3. Maksā droši',
    items: [
      'nesūti avansu, drošības naudu vai transportēšanas maksu, pirms esi droši pārbaudījis pārdevēju un automašīnu;',
      'neizmanto dāvanu kartes, kriptovalūtu, anonīmus naudas pārvedumus vai citus grūti atgūstamus maksājuma veidus pēc nepazīstamas personas pieprasījuma;',
      'pārbaudi saņēmēja vārdu un konta numuru, izmantojot neatkarīgi iegūtu kontaktinformāciju;',
      'nepaļaujies uz maksājuma ekrānuzņēmumu vai e-pasta paziņojumu — pārbaudi naudas saņemšanu savā bankas kontā;',
      'pārdevējam nevajag atdot automašīnu vai dokumentus, kamēr maksājums nav droši saņemts;',
      'ja saņem čeku vai maksājumu par lielāku summu un pircējs prasa starpību nosūtīt atpakaļ, neveic pārskaitījumu — tā ir izplatīta krāpšanas pazīme.'
    ]
  },
  {
    title: '4. TemAuto nepieņem darījuma naudu',
    paragraphs: [
      'TemAuto pašlaik nepiedāvā maksājumu, depozīta, piegādes vai darījuma garantijas pakalpojumu. Ja kāds apgalvo, ka TemAuto glabās tavu naudu, garantēs transportlīdzekļa piegādi vai atsūtīs rēķinu par automašīnu, tā nav TemAuto darbība.',
      'TemAuto darbinieks nekad neprasīs tavu paroli, pilnu bankas kartes numuru, internetbankas piekļuves datus vai īsziņā saņemtu apstiprinājuma kodu.'
    ]
  },
  {
    title: '5. Sargies no viltus saitēm un ziņām',
    items: [
      'pirms paroles vai maksājuma datu ievadīšanas pārbaudi vietnes adresi pārlūkprogrammā;',
      'neatver nepazīstamus pielikumus un saites, kas atsūtītas īsziņā, e-pastā vai saziņas lietotnē;',
      'neinstalē programmu vai pārlūkprogrammas paplašinājumu pēc pircēja, pārdevēja vai “atbalsta darbinieka” lūguma;',
      'neļauj nepazīstamai personai attālināti pieslēgties tavai ierīcei;',
      'ja ziņa rada bailes vai steidzina nekavējoties apstiprināt kontu vai maksājumu, aizver saiti un atver TemAuto pats no ierastās adreses.'
    ]
  },
  {
    title: '6. Biežākās krāpšanas pazīmes',
    items: [
      'cena ir ievērojami zemāka par tirgus cenu bez saprotama iemesla;',
      'pārdevējs atrodas citā valstī un sola automašīnu nosūtīt tikai pēc avansa;',
      'persona steidzina, izvairās no konkrētiem jautājumiem vai stāsts pastāvīgi mainās;',
      'pircējs piedāvā samaksāt vairāk nekā prasīts vai iesaista nepazīstamu kurjeru un maksājumu saiti;',
      'maksājuma saņēmējs nav pārdevējs vai bez skaidra pamatojuma tiek prasīti vairāki pārskaitījumi;',
      'dokumenti ir neskaidri, tajos ir atšķirīgi vārdi, datumi, VIN vai redzamas labošanas pazīmes;',
      'saziņa tiek pēkšņi pārcelta ārpus platformas un tiek prasīta slepena vai neparasta rīcība.'
    ]
  },
  {
    title: '7. Padomi pārdevējam',
    items: [
      'nepublicē personu apliecinoša dokumenta, bankas kartes vai pilnu transportlīdzekļa dokumentu kopijas;',
      'pirms testa brauciena pārbaudi vadītāja apliecību un neatdod atslēgas, paliekot ārpus automašīnas;',
      'drošības dēļ tiekaties publiskā vietā vai transportlīdzekļu pārbaudes vietā un informē tuvinieku par tikšanos;',
      'neklikšķini uz pircēja atsūtītas “naudas saņemšanas”, “kurjera” vai “apdrošināšanas” saites;',
      'nekad neievadi kartes datus, lai it kā saņemtu pārskaitījumu — naudas saņemšanai kartes PIN un internetbankas parole nav vajadzīga;',
      'noformē rakstisku darījuma dokumentu un īpašuma tiesību maiņu veic attiecīgās valsts oficiālajā kārtībā.'
    ]
  },
  {
    title: '8. Padomi pircējam',
    items: [
      'saglabā sludinājuma kopiju, saraksti, maksājumu dokumentus un pārdevēja sniegto informāciju;',
      'nepiekrīti līgumā norādīt mazāku cenu par faktiski samaksāto;',
      'pirms parakstīšanas izlasi visu līgumu un pārliecinies, ka tajā pareizi norādīts transportlīdzeklis, cena un puses;',
      'pārrobežu darījumā pārbaudi muitas, nodokļu, reģistrācijas un transportēšanas prasības pirms maksājuma;',
      'ja transportlīdzekli nevar apskatīt klātienē, izmanto neatkarīgu pārbaudes pakalpojumu, kuru izvēlies pats.'
    ]
  },
  {
    title: '9. Konta drošība',
    items: [
      'izmanto unikālu un pietiekami garu paroli, kuru nelieto citās vietnēs;',
      'neizpaud paroli vai autentifikācijas kodus citām personām;',
      'nepaliec pierakstījies koplietojamā ierīcē;',
      'ja pamani nepazīstamas izmaiņas, nekavējoties nomaini paroli un sazinies ar TemAuto;',
      'nepublicē sludinājumā vairāk personas datu, nekā nepieciešams saziņai par automašīnu.'
    ]
  },
  {
    title: '10. Kā ziņot TemAuto',
    paragraphs: [
      'Ja pamani aizdomīgu vai nepatiesu sludinājumu, viltotus dokumentus, nozagtu transportlīdzekli, pikšķerēšanas saiti vai personu, kas uzdodas par TemAuto, saglabā sludinājuma adresi, ekrānuzņēmumus un saraksti. Ziņo TemAuto, norādot konkrēto sludinājumu un īsi aprakstot problēmu.',
      'Ziņošanas kontaktinformācija un ērtā ziņošanas iespēja tiks pievienota pirms platformas publiskās darbības uzsākšanas. TemAuto var ierobežot vai dzēst aizdomīgu saturu un kontu, taču ziņojuma iesniegšana pati par sevi negarantē naudas atgūšanu.'
    ]
  },
  {
    title: '11. Ja esi kļuvis par krāpšanas upuri',
    items: [
      'nekavējoties pārtrauc saziņu un neveic jaunus maksājumus;',
      'sazinies ar savu banku vai maksājumu pakalpojuma sniedzēju un lūdz apturēt vai atsaukt maksājumu, ja tas vēl iespējams;',
      'nomaini apdraudētās paroles un informē banku, ja esi izpaudis kartes vai internetbankas datus;',
      'saglabā sludinājumu, saraksti, tālruņa numurus, e-pastus, maksājumu dokumentus un ekrānuzņēmumus;',
      'ziņo TemAuto un savas valsts policijai vai kibernoziegumu apkarošanas iestādei;',
      'ja pastāv tūlītējs apdraudējums cilvēka drošībai, zvani savas valsts neatliekamās palīdzības dienestam.'
    ]
  },
  {
    title: '12. Atceries',
    paragraphs: [
      'Neviena pārbaude pilnībā neizslēdz risku. Drošākais darījums ir tāds, kurā identitāte, automašīna, dokumenti un maksājums ir pārbaudīti neatkarīgi un īpašuma tiesību maiņa ir noformēta oficiāli.',
      'Šī sadaļa sniedz vispārīgus drošības ieteikumus. Konkrēta darījuma juridiskās, nodokļu un reģistrācijas prasības ir atkarīgas no iesaistītajām valstīm.'
    ]
  }
]

export default function SafetyAndFraudPage() {
  return (
    <div data-info-page="true" style={{ maxWidth: '860px', margin: '0 auto', padding: '18px 16px 56px', color: '#1e293b' }}>
      <article style={{ padding: 'clamp(20px, 5vw, 40px)', background: '#ffffff', border: '1px solid #dbe3ec', borderRadius: '14px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
        <p style={{ margin: '0 0 28px', color: '#64748b', fontSize: '14px' }}>Praktiski padomi drošam transportlīdzekļa darījumam</p>

        {sections.map((section) => (
          <section key={section.title} style={{ marginTop: '28px' }}>
            <h2 style={{ margin: '0 0 12px', color: '#0f172a', fontSize: '20px', lineHeight: 1.3 }}>{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} style={{ margin: '0 0 12px', lineHeight: 1.65 }}>{paragraph}</p>
            ))}
            {section.items && (
              <ul style={{ margin: '0 0 12px', paddingLeft: '22px' }}>
                {section.items.map((item) => <li key={item} style={{ marginBottom: '8px', lineHeight: 1.6 }}>{item}</li>)}
              </ul>
            )}
          </section>
        ))}
      </article>
    </div>
  )
}
