'use client'

const feedbackIdeas = [
  {
    icon: '💡',
    title: 'Ierosini uzlabojumu',
    description: 'Pastāsti, kādu funkciju, informāciju vai ērtību tu vēlētos redzēt TemAuto.'
  },
  {
    icon: '🧭',
    title: 'Dalies pieredzē',
    description: 'Uzraksti, kas platformā ir saprotams un ērts, bet kas sagādā grūtības.'
  },
  {
    icon: '🛠️',
    title: 'Norādi uz problēmu',
    description: 'Ja kaut kas nedarbojas, apraksti savas darbības un, ja iespējams, norādi izmantoto ierīci.'
  },
  {
    icon: '💬',
    title: 'Kritizē atklāti',
    description: 'Konstruktīva kritika palīdz mums pamanīt trūkumus un veidot TemAuto labāku.'
  }
]

export default function FeedbackPage() {
  return (
    <div data-info-page="true" style={{ maxWidth: '860px', margin: '0 auto', padding: '18px 16px 56px', color: '#1e293b' }}>
      <article style={{ padding: 'clamp(20px, 5vw, 40px)', background: '#ffffff', border: '1px solid #dbe3ec', borderRadius: '14px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
        <p style={{ margin: '0 0 28px', color: '#64748b', fontSize: '15px', lineHeight: 1.6 }}>
          TemAuto top kopā ar lietotājiem. Tavs viedoklis palīdz mums saprast, ko vajag uzlabot, papildināt vai vienkāršot.
        </p>

        <div style={{ display: 'grid', gap: '12px' }}>
          {feedbackIdeas.map((item) => (
            <section key={item.title} style={{ padding: '16px', background: '#f8fafc', border: '1px solid #dbe3ec', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span aria-hidden="true" style={{ fontSize: '24px', lineHeight: 1.2 }}>{item.icon}</span>
                <div>
                  <h2 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '18px', lineHeight: 1.3 }}>{item.title}</h2>
                  <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>{item.description}</p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <section style={{ marginTop: '28px' }}>
          <h2 style={{ margin: '0 0 12px', color: '#0f172a', fontSize: '20px', lineHeight: 1.3 }}>Ko vari mums uzrakstīt?</h2>
          <ul style={{ margin: 0, paddingLeft: '22px' }}>
            <li style={{ marginBottom: '8px', lineHeight: 1.6 }}>ko TemAuto vajadzētu darīt ērtāk vai ātrāk;</li>
            <li style={{ marginBottom: '8px', lineHeight: 1.6 }}>kādas funkcijas vai sadaļas tev pietrūkst;</li>
            <li style={{ marginBottom: '8px', lineHeight: 1.6 }}>kas šķiet nesaprotams, lieks vai traucējošs;</li>
            <li style={{ marginBottom: '8px', lineHeight: 1.6 }}>jebkuru citu ideju, kritiku vai atsauksmi par platformu.</li>
          </ul>
        </section>

        <section style={{ marginTop: '28px', padding: '18px', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '10px' }}>
          <h2 style={{ margin: '0 0 10px', color: '#1e40af', fontSize: '20px', lineHeight: 1.3 }}>Tavs ziņojums būs privāts</h2>
          <p style={{ margin: 0, color: '#1e3a8a', lineHeight: 1.65 }}>
            Ieteikumi netiks publicēti platformā un nebūs redzami citiem apmeklētājiem. Tos varēs apskatīt tikai TemAuto administrators. Ja vēlēsies saņemt atbildi, varēsi brīvprātīgi norādīt savu e-pasta adresi.
          </p>
        </section>

        <section style={{ marginTop: '28px', padding: '18px', textAlign: 'center', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px' }}>
          <h2 style={{ margin: '0 0 8px', color: '#166534', fontSize: '20px' }}>Privātā ieteikumu forma tiek gatavota</h2>
          <p style={{ margin: 0, color: '#166534', lineHeight: 1.6 }}>
            Šeit būs īsa forma ieteikuma, kritikas vai problēmas aprakstam. Ziņojums nonāks TemAuto privātajā administrācijas iesūtnē, nevis publiskā komentāru sadaļā.
          </p>
        </section>

        <p style={{ margin: '22px 0 0', color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>
          Lūdzu, neraksti paroles, bankas kartes datus, internetbankas piekļuves informāciju vai citus slepenus datus.
        </p>
      </article>
    </div>
  )
}
