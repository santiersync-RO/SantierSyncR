# ȘantierSync

Website de prezentare pentru organizarea cererilor de ofertă la firme de construcții și instalații. Homepage-ul urmează macheta aprobată cu șase secțiuni; contactul pregătește un mesaj prin `mailto:santiersync@gmail.com`. Repository-ul conține un preview în limba română.

## Dezvoltare

- Node.js 24.x (mediul proiectului folosește Node 24.14.1).
- Next.js 16.4.0, React 19.3.0 și TypeScript.
- Creează `.env.local` pornind de la `.env.example`; păstrează valorile goale/false pentru preview și nu introduce secrete în Git.
- Rulează `npm ci`, apoi `npm run dev` pentru serverul local.
- `npm run lint`, `npm run typecheck` și `npm run build` verifică proiectul. Build-ul rulează mai întâi controlul de lansare; acesta nu blochează build-ul local sau un preview.

`npm run start` pornește un build deja creat. `npm run check-release` verifică setările obligatorii doar în mediul Vercel Production. Pentru a verifica intenționat controlul fără deploy, setează `CHECK_PRODUCTION=true`; configurația incompletă trebuie să returneze eroare.

## Publicare

Domeniul canonic confirmat este `https://santiersync.ro`; `santiersync.com` este opțional pentru redirect după configurarea și verificarea DNS-ului. Canonical-ul din producție trebuie să fie exact `https://santiersync.ro`.

Importă repository-ul într-un proiect Vercel și folosește Node 24.x. Preview-urile rămân `noindex`. Formularul din homepage pregătește local un mesaj și deschide aplicația de email a vizitatorului, fără a trimite date prin API. Endpointul API păstrat în repository nu este legat de homepage și nu este configurat; integrarea lui este pentru o etapă viitoare. Dacă acea etapă primește aprobare, folosește un widget Turnstile separat pentru hostname-ul preview exact, cheia secretă reală a widgetului și un mailbox de test dedicat. Cheile dummy nu validează acțiunea/hostname-ul real; nu ocoli verificările pentru a le accepta.

Producția se blochează dacă lipsesc identitatea și datele aplicabile operatorului, temeiurile și practicile reale, revizuirea juridică, controlul domeniului, proba manuală `mailto:` la un inbox real ori aprobarea proprietarului. Trimiterea prin API este o integrare viitoare și nu trebuie descrisă ca funcțională sau testată.

Ghidurile de configurare și de testare sunt în [docs/CONFIGURARE.md](docs/CONFIGURARE.md) și [docs/TESTARE-MANUALA.md](docs/TESTARE-MANUALA.md). Păstrează un deployment anterior verificat pentru rollback; după rollback repetă verificarea paginii, linkului de email, paginilor juridice și indexării.

## Versiuni locale

Conținutul public se editează din [Sanity Studio](https://santiersync-ro.sanity.studio), fără un deploy nou. Ghidul de editare, previzualizare și backup este în [docs/CMS-SANITY.md](docs/CMS-SANITY.md). Codul și macheta rămân în Git; backupurile conținutului CMS se păstrează separat, local.

Istoricul și regulile de lucru sunt descrise în [docs/VERSIUNI.md](docs/VERSIUNI.md). Textele anterioare redesignului sunt păstrate separat în [arhiva de conținut](docs/versiuni/v0.1-continut-original.md). Reperul `v0.2-design-referinta` salvează codul variantei actuale; nu reprezintă o lansare publică sau validarea manuală.

## Infrastructură și licențe

Brief-ul alege Vercel Pro pentru folosire comercială; verifică prețul și condițiile actuale înainte de activarea contului. Resend și Cloudflare Turnstile sunt păstrate doar pentru o integrare API viitoare, care nu este configurată în versiunea curentă. Costurile, limitele și termenii se pot schimba; surse oficiale: [prețuri Vercel](https://vercel.com/pricing), [prețuri Resend](https://resend.com/pricing), [planuri Turnstile](https://developers.cloudflare.com/turnstile/plans/).

Next.js și dependențele au licențele publicate de proiectele lor. Verifică licențele versiunilor exacte din `package-lock.json` înainte de distribuție și păstrează notificările pe care acestea le cer.
