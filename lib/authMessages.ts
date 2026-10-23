import type { Language } from './i18n'

// Confirmation guidance shared by desktop and mobile authentication.
export const authMessages: Record<Language, readonly [string, string, string]> = {
  "LV": [
    "Pārbaudi savu e-pastu un mēstuļu mapi. Pirms pirmās pieslēgšanās apstiprini e-pasta adresi, nospiežot saiti vēstulē.",
    "Nosūtīt apstiprinājuma vēstuli atkārtoti",
    "Apstiprinājuma vēstule nosūtīta. Pārbaudi savu e-pastu un mēstuļu mapi."
  ],
  "EN": [
    "Check your inbox and spam folder. Before your first sign-in, confirm your email address using the link in the email.",
    "Resend confirmation email",
    "Confirmation email sent. Check your inbox and spam folder."
  ],
  "RU": [
    "Проверь входящие и папку «Спам». Перед первым входом подтверди адрес электронной почты по ссылке в письме.",
    "Отправить письмо повторно",
    "Письмо отправлено. Проверь входящие и папку «Спам»."
  ],
  "LT": [
    "Patikrink el. paštą ir šlamšto aplanką. Prieš pirmą prisijungimą patvirtink el. pašto adresą paspausdamas laiške esančią nuorodą.",
    "Siųsti patvirtinimo laišką dar kartą",
    "Patvirtinimo laiškas išsiųstas. Patikrink el. paštą ir šlamšto aplanką."
  ],
  "EE": [
    "Kontrolli postkasti ja rämpsposti. Enne esimest sisselogimist kinnita oma e-posti aadress kirjas oleva lingi kaudu.",
    "Saada kinnituskiri uuesti",
    "Kinnituskiri on saadetud. Kontrolli postkasti ja rämpsposti."
  ],
  "DE": [
    "Prüfe deinen Posteingang und Spamordner. Bestätige vor der ersten Anmeldung deine E-Mail-Adresse über den Link in der E-Mail.",
    "Bestätigungs-E-Mail erneut senden",
    "Bestätigungs-E-Mail gesendet. Prüfe deinen Posteingang und Spamordner."
  ],
  "FR": [
    "Vérifie ta boîte de réception et les indésirables. Avant ta première connexion, confirme ton adresse e-mail avec le lien reçu.",
    "Renvoyer le message de confirmation",
    "Message de confirmation envoyé. Vérifie ta boîte de réception et les indésirables."
  ],
  "ES": [
    "Revisa tu correo y la carpeta de spam. Antes de iniciar sesión por primera vez, confirma tu dirección con el enlace del mensaje.",
    "Reenviar correo de confirmación",
    "Correo de confirmación enviado. Revisa tu correo y la carpeta de spam."
  ],
  "PT": [
    "Verifica a caixa de entrada e o spam. Antes do primeiro início de sessão, confirma o teu endereço através da ligação no e-mail.",
    "Reenviar e-mail de confirmação",
    "E-mail de confirmação enviado. Verifica a caixa de entrada e o spam."
  ],
  "IT": [
    "Controlla la posta in arrivo e lo spam. Prima del primo accesso, conferma il tuo indirizzo tramite il link ricevuto via e-mail.",
    "Invia di nuovo la conferma",
    "E-mail di conferma inviata. Controlla la posta in arrivo e lo spam."
  ],
  "FI": [
    "Tarkista sähköposti ja roskapostikansio. Vahvista sähköpostiosoitteesi viestin linkistä ennen ensimmäistä kirjautumista.",
    "Lähetä vahvistusviesti uudelleen",
    "Vahvistusviesti lähetetty. Tarkista sähköposti ja roskapostikansio."
  ],
  "PL": [
    "Sprawdź pocztę i folder spam. Przed pierwszym logowaniem potwierdź adres e-mail, klikając link w wiadomości.",
    "Wyślij ponownie wiadomość potwierdzającą",
    "Wiadomość potwierdzająca wysłana. Sprawdź pocztę i folder spam."
  ],
  "SV": [
    "Kontrollera inkorgen och skräpposten. Bekräfta din e-postadress via länken i mejlet före första inloggningen.",
    "Skicka bekräftelsemejlet igen",
    "Bekräftelsemejlet har skickats. Kontrollera inkorgen och skräpposten."
  ],
  "NO": [
    "Sjekk innboksen og søppelposten. Bekreft e-postadressen via lenken i e-posten før første innlogging.",
    "Send bekreftelses-e-posten på nytt",
    "Bekreftelses-e-posten er sendt. Sjekk innboksen og søppelposten."
  ],
  "DA": [
    "Tjek indbakken og spam. Bekræft din e-mailadresse via linket i e-mailen før første login.",
    "Send bekræftelsesmail igen",
    "Bekræftelsesmail sendt. Tjek indbakken og spam."
  ],
  "BG": [
    "Провери входящата поща и спама. Преди първото влизане потвърди имейл адреса си чрез връзката в писмото.",
    "Изпрати потвърждението отново",
    "Писмото за потвърждение е изпратено. Провери входящата поща и спама."
  ],
  "HU": [
    "Nézd meg a beérkező leveleket és a spam mappát. Az első belépés előtt erősítsd meg az e-mail-címedet a levélben lévő hivatkozással.",
    "Megerősítő e-mail újraküldése",
    "A megerősítő e-mailt elküldtük. Nézd meg a beérkező leveleket és a spam mappát."
  ],
  "RO": [
    "Verifică inboxul și spamul. Înainte de prima autentificare, confirmă adresa de e-mail folosind linkul din mesaj.",
    "Retrimite e-mailul de confirmare",
    "E-mailul de confirmare a fost trimis. Verifică inboxul și spamul."
  ],
  "CS": [
    "Zkontroluj doručenou poštu a spam. Před prvním přihlášením potvrď e-mailovou adresu odkazem ve zprávě.",
    "Znovu odeslat potvrzovací e-mail",
    "Potvrzovací e-mail odeslán. Zkontroluj doručenou poštu a spam."
  ],
  "EL": [
    "Έλεγξε τα εισερχόμενα και την ανεπιθύμητη αλληλογραφία. Πριν από την πρώτη σύνδεση, επιβεβαίωσε το e-mail σου από τον σύνδεσμο στο μήνυμα.",
    "Επανάληψη αποστολής επιβεβαίωσης",
    "Το μήνυμα επιβεβαίωσης στάλθηκε. Έλεγξε τα εισερχόμενα και την ανεπιθύμητη αλληλογραφία."
  ],
  "NL": [
    "Controleer je inbox en spammap. Bevestig vóór de eerste aanmelding je e-mailadres via de link in de e-mail.",
    "Bevestigingsmail opnieuw versturen",
    "Bevestigingsmail verstuurd. Controleer je inbox en spammap."
  ],
  "GA": [
    "Seiceáil do bhosca isteach agus an fillteán turscair. Roimh do chéad logáil isteach, deimhnigh do sheoladh ríomhphoist leis an nasc sa teachtaireacht.",
    "Seol an ríomhphost deimhnithe arís",
    "Seoladh an ríomhphost deimhnithe. Seiceáil do bhosca isteach agus an fillteán turscair."
  ],
  "SK": [
    "Skontroluj doručenú poštu a spam. Pred prvým prihlásením potvrď e-mailovú adresu odkazom v správe.",
    "Znova odoslať potvrdzovací e-mail",
    "Potvrdzovací e-mail bol odoslaný. Skontroluj doručenú poštu a spam."
  ],
  "SL": [
    "Preveri prejeto in neželeno pošto. Pred prvo prijavo potrdi e-poštni naslov s povezavo v sporočilu.",
    "Ponovno pošlji potrditveno e-pošto",
    "Potrditvena e-pošta je poslana. Preveri prejeto in neželeno pošto."
  ],
  "MT": [
    "Iċċekkja l-inbox u l-ispam. Qabel l-ewwel dħul, ikkonferma l-indirizz tal-email bil-link fil-messaġġ.",
    "Erġa’ ibgħat l-email ta’ konferma",
    "L-email ta’ konferma ntbagħtet. Iċċekkja l-inbox u l-ispam."
  ],
  "TR": [
    "Gelen kutunu ve spam klasörünü kontrol et. İlk girişten önce e-postadaki bağlantıyla e-posta adresini doğrula.",
    "Doğrulama e-postasını yeniden gönder",
    "Doğrulama e-postası gönderildi. Gelen kutunu ve spam klasörünü kontrol et."
  ]
}
