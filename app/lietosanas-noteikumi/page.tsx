'use client'

import { useRouter } from 'next/navigation'

const sections = [
  {
    title: '1. Vispārīgie noteikumi',
    paragraphs: [
      'Šie lietošanas noteikumi nosaka kārtību, kādā drīkst izmantot TemAuto tīmekļvietni un tās pakalpojumus. Izmantojot TemAuto vai izveidojot lietotāja kontu, tu apliecini, ka esi izlasījis šos noteikumus un piekrīti tos ievērot.',
      'TemAuto ir transportlīdzekļu sludinājumu publicēšanas un meklēšanas platforma. TemAuto nav sludinājumā piedāvātā transportlīdzekļa pārdevējs, pircējs, īpašnieks, starpnieks vai darījuma puse, ja vien konkrētajā piedāvājumā nav skaidri norādīts citādi.',
      'Sludinājumu drīkst publicēt persona, kura ir vismaz 18 gadus veca un kurai ir tiesības slēgt saistošus darījumus. Ja platformu izmanto juridiskas personas vārdā, tu apliecini, ka esi tiesīgs šo personu pārstāvēt.'
    ]
  },
  {
    title: '2. Lietotāja konts',
    paragraphs: [
      'Sludinājumu apskatei reģistrācija nav nepieciešama. Lai publicētu, labotu vai dzēstu sludinājumu, ir jāizveido lietotāja konts.',
      'Tu esi atbildīgs par sniegto konta datu pareizību, piekļuves datu drošību un visām darbībām savā kontā. Kontu nedrīkst nodot citai personai vai izmantot citas personas kontu bez atļaujas.',
      'Ja tev ir aizdomas par neatļautu piekļuvi kontam, nekavējoties nomaini piekļuves datus un sazinies ar TemAuto.'
    ]
  },
  {
    title: '3. Sludinājumu publicēšana',
    paragraphs: [
      'Publicēt drīkst tikai patiesu, aktuālu un pietiekami pilnīgu informāciju. Sludinājuma ievietotājam ir jābūt transportlīdzekļa īpašniekam vai jābūt īpašnieka nepārprotamai atļaujai transportlīdzekli piedāvāt.',
      'Sludinājumā norādītajai cenai, tehniskajam stāvoklim, nobraukumam, izlaiduma gadam, atrašanās vietai, attēliem un citai informācijai jāatbilst faktiskajai situācijai. Būtiskus defektus, bojājumus un zināmus juridiskus apgrūtinājumus nedrīkst apzināti slēpt.',
      'Tu apliecini, ka tev ir tiesības publicēt visus iesniegtos tekstus, fotogrāfijas un citus materiālus. Publicējot tos, tu piešķir TemAuto neekskluzīvas, bezmaksas tiesības tos tehniski glabāt, apstrādāt, pielāgot attēlošanai un publiskot tikai platformas darbības un sludinājuma popularizēšanas vajadzībām.',
      'Kad transportlīdzeklis vairs nav pieejams vai informācija ir mainījusies, sludinājums ir savlaicīgi jāatjaunina vai jādzēš.'
    ]
  },
  {
    title: '4. Aizliegtais saturs un rīcība',
    intro: 'TemAuto aizliegts:',
    items: [
      'publicēt nepatiesus, maldinošus, krāpnieciskus vai dublētus sludinājumus;',
      'piedāvāt zagtu, meklēšanā esošu, nelikumīgi iegūtu vai tādu transportlīdzekli, kuru nav tiesību pārdot;',
      'izmantot svešas fotogrāfijas, preču zīmes, personas datus vai citu aizsargātu saturu bez tiesiska pamata;',
      'publicēt aizskarošu, diskriminējošu, vardarbīgu, nelikumīgu vai ar transportlīdzekļa pārdošanu nesaistītu saturu;',
      'norādīt ļaunprogrammatūras, pikšķerēšanas vai citas nedrošas saites;',
      'mākslīgi palielināt skatījumu skaitu, traucēt platformas darbību, automatizēti vākt datus vai kopēt būtisku platformas satura daļu bez rakstiskas atļaujas;',
      'izmantot TemAuto surogātpasta sūtīšanai, nelikumīgai reklāmai vai citu personu maldināšanai.'
    ]
  },
  {
    title: '5. Darījumi un drošība',
    paragraphs: [
      'Pircējs un pārdevējs par pirkumu, cenu, samaksu, transportlīdzekļa pārbaudi, piegādi, īpašuma tiesību pāreju, nodokļiem un citiem darījuma nosacījumiem vienojas patstāvīgi. TemAuto neglabā darījuma naudu un negarantē neviena lietotāja identitāti, maksātspēju, transportlīdzekļa stāvokli, izcelsmi vai atbilstību aprakstam.',
      'Pirms darījuma iesakām klātienē apskatīt transportlīdzekli, pārbaudīt tā identifikācijas numuru un dokumentus, īpašuma tiesības, nobraukuma un negadījumu vēsturi, kā arī veikt neatkarīgu tehnisko pārbaudi. Nesūti avansa maksājumu personai, kuras identitāti un piedāvājumu neesi droši pārbaudījis.',
      'Ja pārdevējs darbojas savas saimnieciskās vai profesionālās darbības ietvaros, viņam ir pienākums ievērot attiecīgās patērētāju tiesību un komercprakses prasības. Privātpersonu savstarpējam darījumam patērētāju aizsardzības noteikumi var nebūt piemērojami.'
    ]
  },
  {
    title: '6. Sludinājumu secība un reklāma',
    paragraphs: [
      'Sludinājumus var atlasīt un sakārtot pēc lietotāja izvēlētiem kritērijiem, piemēram, markas, modeļa, cenas, gada, atrašanās vietas vai publicēšanas laika. Ja tiks piedāvāta maksas izcelšana vai sponsorēts saturs, tas būs skaidri apzīmēts.',
      'TemAuto var izvietot trešo personu reklāmas. Reklāmdevējs ir atbildīgs par reklāmas saturu, piedāvājumu un tā atbilstību tiesību aktiem.'
    ]
  },
  {
    title: '7. Satura pārbaude un moderēšana',
    paragraphs: [
      'TemAuto ir tiesības pārbaudīt lietotāju iesniegto saturu un bez iepriekšēja brīdinājuma ierobežot tā redzamību, noraidīt, labot tikai tehniskas kļūdas vai dzēst saturu, kas pārkāpj šos noteikumus, tiesību aktus, trešo personu tiesības vai apdraud platformas un lietotāju drošību.',
      'Atkarībā no pārkāpuma rakstura TemAuto var izteikt brīdinājumu, apturēt sludinājumu, ierobežot funkcijas vai uz laiku vai pastāvīgi bloķēt kontu. Pieņemot šādu lēmumu, TemAuto ņem vērā pārkāpuma smagumu, biežumu, sekas un lietotāja iepriekšējo rīcību.',
      'Ja uzskati, ka saturs ir nelikumīgs vai pārkāpj tavas tiesības, vari par to ziņot TemAuto, norādot konkrēto sludinājumu, pārkāpuma iemeslu un savu kontaktinformāciju. Lietotājs var arī lūgt pārskatīt lēmumu par viņa satura vai konta ierobežošanu. Ziņojumi un iebildumi tiek izskatīti godprātīgi un bez nepamatotas kavēšanās.'
    ]
  },
  {
    title: '8. Maksa par pakalpojumiem',
    paragraphs: [
      'Pamata funkcijas ir pieejamas atbilstoši platformā norādītajiem nosacījumiem. Ja TemAuto ieviesīs maksas pakalpojumus, to cena, ilgums un būtiskie noteikumi tiks skaidri parādīti pirms pasūtījuma apstiprināšanas. Maksa netiks piemērota ar atpakaļejošu spēku bez lietotāja skaidras piekrišanas.',
      'Konkrētam maksas pakalpojumam var būt papildu noteikumi. Pretrunas gadījumā attiecībā uz šo pakalpojumu priekšroka ir tā īpašajiem noteikumiem, ciktāl tie nav pretrunā piemērojamiem tiesību aktiem.'
    ]
  },
  {
    title: '9. Platformas pieejamība un atbildība',
    paragraphs: [
      'TemAuto cenšas nodrošināt stabilu un drošu platformas darbību, taču negarantē nepārtrauktu pieejamību, kļūdu neesamību vai visu lietotāju publicētās informācijas precizitāti. Platformas darbība var tikt īslaicīgi ierobežota apkopes, drošības, tehnisku traucējumu vai no TemAuto neatkarīgu apstākļu dēļ.',
      'Ciktāl to pieļauj piemērojamie tiesību akti, TemAuto neatbild par lietotāju rīcību, sludinājuma saturu, transportlīdzekļa trūkumiem, nenotikušu vai neveiksmīgu darījumu, kā arī netiešiem zaudējumiem. Nekas šajos noteikumos neierobežo atbildību, kuru saskaņā ar tiesību aktiem nedrīkst ierobežot.'
    ]
  },
  {
    title: '10. Personas dati',
    paragraphs: [
      'Personas dati tiek apstrādāti saskaņā ar TemAuto Privātuma politiku. Sludinājumā publiskotā kontaktinformācija kļūst redzama citiem lietotājiem, tādēļ nepublicē datus, kurus nevēlies atklāt, vai citas personas datus bez tiesiska pamata.'
    ]
  },
  {
    title: '11. Konta un sludinājumu dzēšana',
    paragraphs: [
      'Tu vari dzēst savus sludinājumus un pieprasīt konta slēgšanu. Atsevišķa informācija var tikt saglabāta tik ilgi, cik tas nepieciešams juridisku pienākumu izpildei, strīdu risināšanai, krāpšanas novēršanai vai tiesību aizsardzībai.',
      'TemAuto var pārtraukt vai ierobežot pakalpojuma sniegšanu, ja lietotājs būtiski vai atkārtoti pārkāpj šos noteikumus vai tiesību aktus.'
    ]
  },
  {
    title: '12. Noteikumu izmaiņas',
    paragraphs: [
      'TemAuto var grozīt šos noteikumus, lai atspoguļotu pakalpojuma, drošības prasību vai tiesību aktu izmaiņas. Par būtiskām izmaiņām reģistrētie lietotāji tiks informēti saprātīgā termiņā pirms to stāšanās spēkā, izņemot gadījumus, kad izmaiņas nepieciešamas steidzami drošības vai juridisku iemeslu dēļ.',
      'Noteikumu aktuālā redakcija un spēkā stāšanās datums vienmēr būs pieejams šajā sadaļā.'
    ]
  },
  {
    title: '13. Piemērojamie tiesību akti un strīdi',
    paragraphs: [
      'Šiem noteikumiem piemēro Latvijas Republikas tiesību aktus, neskarot patērētājam obligāti piemērojamās tiesības viņa dzīvesvietas valstī.',
      'Domstarpību gadījumā aicinām vispirms sazināties ar TemAuto un mēģināt rast savstarpēju risinājumu. Ja vienošanās nav iespējama, strīds risināms normatīvajos aktos noteiktajā kārtībā.'
    ]
  }
]

export default function TermsPage() {
  const router = useRouter()

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '18px 16px 56px', color: '#1e293b' }}>
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
              <ul style={{ margin: 0, paddingLeft: '22px' }}>
                {section.items.map((item) => <li key={item} style={{ marginBottom: '8px', lineHeight: 1.6 }}>{item}</li>)}
              </ul>
            )}
          </section>
        ))}
      </article>
    </div>
  )
}
