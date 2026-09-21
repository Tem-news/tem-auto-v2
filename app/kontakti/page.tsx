'use client'

import { useRouter } from 'next/navigation'

const contactAreas = [
  {
    icon: '💬',
    title: 'Lietotāju atbalsts',
    description: 'Jautājumi par kontu, sludinājuma pievienošanu, rediģēšanu, dzēšanu vai TemAuto darbību.'
  },
  {
    icon: '🛡️',
    title: 'Drošība un krāpniecība',
    description: 'Ziņojumi par aizdomīgu sludinājumu, viltotu informāciju, krāpšanas mēģinājumu vai personu, kas uzdodas par TemAuto.'
  },
  {
    icon: '🔒',
    title: 'Privātums un personas dati',
    description: 'Datu piekļuves, labošanas vai dzēšanas pieprasījumi un citi jautājumi par personas datu apstrādi.'
  },
  {
    icon: '⚖️',
    title: 'Juridiski jautājumi',
    description: 'Tiesību īpašnieku, valsts iestāžu un citi juridiski pamatoti pieprasījumi.'
  },
  {
    icon: '📣',
    title: 'Reklāma un sadarbība',
    description: 'Jautājumi par reklāmas iespējām, sadarbības piedāvājumiem un TemAuto partnerību.'
  }
]

export default function ContactsPage() {
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
        <h1 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: 'clamp(26px, 6vw, 38px)', lineHeight: 1.15 }}>Kontakti</h1>
        <p style={{ margin: '0 0 28px', color: '#64748b', fontSize: '15px', lineHeight: 1.6 }}>
          Izvēlies savam jautājumam atbilstošo tēmu. TemAuto saziņas forma un oficiālās kontaktadreses tiks pievienotas pirms platformas publiskās darbības uzsākšanas.
        </p>

        <div style={{ display: 'grid', gap: '12px' }}>
          {contactAreas.map((area) => (
            <section key={area.title} style={{ padding: '16px', background: '#f8fafc', border: '1px solid #dbe3ec', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span aria-hidden="true" style={{ fontSize: '24px', lineHeight: 1.2 }}>{area.icon}</span>
                <div>
                  <h2 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '18px', lineHeight: 1.3 }}>{area.title}</h2>
                  <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>{area.description}</p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <section style={{ marginTop: '28px' }}>
          <h2 style={{ margin: '0 0 12px', color: '#0f172a', fontSize: '20px', lineHeight: 1.3 }}>Lai varam palīdzēt ātrāk</h2>
          <p style={{ margin: '0 0 10px', lineHeight: 1.65 }}>Sagatavo un norādi:</p>
          <ul style={{ margin: 0, paddingLeft: '22px' }}>
            <li style={{ marginBottom: '8px', lineHeight: 1.6 }}>e-pasta adresi, uz kuru vēlies saņemt atbildi;</li>
            <li style={{ marginBottom: '8px', lineHeight: 1.6 }}>īsu un precīzu problēmas aprakstu;</li>
            <li style={{ marginBottom: '8px', lineHeight: 1.6 }}>sludinājuma saiti vai identifikācijas numuru, ja jautājums saistīts ar konkrētu sludinājumu;</li>
            <li style={{ marginBottom: '8px', lineHeight: 1.6 }}>ekrānuzņēmumu, ja tajā redzama kļūda vai aizdomīga darbība.</li>
          </ul>
          <p style={{ margin: '14px 0 0', color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>
            Nesūti paroli, bankas kartes pilnos datus, internetbankas piekļuves informāciju vai īsziņā saņemtus apstiprinājuma kodus.
          </p>
        </section>

        <section style={{ marginTop: '28px', padding: '18px', background: '#fff7ed', border: '1px solid #fdba74', borderRadius: '10px' }}>
          <h2 style={{ margin: '0 0 10px', color: '#9a3412', fontSize: '20px', lineHeight: 1.3 }}>Steidzams drošības gadījums</h2>
          <p style={{ margin: 0, color: '#7c2d12', lineHeight: 1.65 }}>
            Ja nauda jau ir pārskaitīta krāpniekam vai ir izpausti bankas dati, nekavējoties sazinies ar savu banku un savas valsts policiju. TemAuto nevar apturēt bankas maksājumu vai aizstāt neatliekamās palīdzības dienestu.
          </p>
        </section>

        <section style={{ marginTop: '28px', padding: '18px', textAlign: 'center', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px' }}>
          <h2 style={{ margin: '0 0 8px', color: '#166534', fontSize: '20px' }}>Saziņas forma tiek gatavota</h2>
          <p style={{ margin: 0, color: '#166534', lineHeight: 1.6 }}>
            Šeit būs droša saziņas forma ar tēmas izvēli, pielikumu pievienošanu un pieprasījuma apstiprinājumu.
          </p>
        </section>

        <section style={{ marginTop: '28px' }}>
          <h2 style={{ margin: '0 0 10px', color: '#0f172a', fontSize: '20px', lineHeight: 1.3 }}>TemAuto operators</h2>
          <p style={{ margin: 0, lineHeight: 1.65 }}>
            Operatora nosaukums, reģistrācijas dati un juridiskā kontaktinformācija tiks norādīta pirms platformas publiskās darbības uzsākšanas.
          </p>
        </section>
      </article>
    </div>
  )
}
