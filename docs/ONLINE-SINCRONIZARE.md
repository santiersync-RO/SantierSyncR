# Publicare și sincronizare online

## Situația de acum

Codul de referință este salvat local în checkpointul `v0.2-design-referinta` (`d80f477`). Repository-ul public [SantierSyncR pe GitHub](https://github.com/santiersync-RO/SantierSyncR) este încă nesincronizat; push-ul nu a fost făcut. Autentificarea prin browser/Git Credential Manager și Vercel CLI a reușit. Vercel CLI confirmă contul `adriancomann`, echipa `coman-family` și planul Hobby. Proiectul Vercel SantierSyncR urmează să fie creat/configurat; site-ul nu este încă găzduit public. Nu au fost salvate coduri OAuth sau URL-uri de autorizare în repository.

Există o copie Git locală separată la `D:\AI\Codex\ȘantierSync\Backups\SantierSync-2026-10-08.bundle`, verificată pentru checkpointul `d80f477`. Bundle-ul păstrează istoricul comis și tag-ul, dar nu include `.env`, secrete sau dependențele `node_modules`. Fișierul este tot pe acest calculator, deci nu este backup offsite.

## Opțiuni de găzduire

| Variantă | Cost și potrivire | Git și preview |
|---|---|---|
| **Vercel Hobby** | Este preferința actuală a proprietarului pentru a începe fără abonament, dar utilizarea trebuie clarificată înainte de publicarea comercială. Vercel spune că Hobby este pentru uz personal și necomercial; exemplele de utilizare comercială includ publicitate și vânzarea unui produs sau serviciu. Un site al unei agenții care promovează servicii poate intra în această definiție. Verifică [regulile de utilizare corectă Hobby](https://vercel.com/docs/limits/fair-use-guidelines); nu presupunem că un site gratuit este automat eligibil. | Acceptă integrarea Git și preview-uri pentru branch-uri/PR-uri, la fel ca Pro. Limita de plan se referă la eligibilitatea utilizării, nu la fluxul de deploy. |
| **Vercel Pro** | Potrivirea cea mai directă pentru proiectul actual Next.js: păstrează API Route Handler-ul viitor, `next/image` și ruta OG fără adaptare de platformă. Pagina oficială afișează **20 USD/lună**, cu un credit de 20 USD pentru utilizare; taxele și consumul peste credit pot adăuga cost. Poate fi opțiunea potrivită dacă Vercel confirmă că site-ul agenției este utilizare comercială. Verifică [Vercel Pricing](https://vercel.com/pricing). | Conectat la GitHub, generează deploy-uri preview pentru schimbările din branch/PR și actualizează domeniul de producție doar pentru branch-ul ales ca production. Vezi [Vercel pentru GitHub](https://vercel.com/docs/git/vercel-for-github). |
| **Cloudflare Pages Free** | Poate reduce costul lunar dacă site-ul rămâne static. Proiectul actual ar cere adaptare: ruta API nefolosită trebuie scoasă sau tratată separat, iar optimizarea imaginilor Next trebuie configurată pentru hosting static. Cloudflare documentează, între altele, 500 build-uri/lună și maximum 20.000 fișiere pe planul Free; verifică [limitele curente](https://developers.cloudflare.com/pages/platform/limits/). | Are deploy-uri preview și aliasuri pentru branch-uri/PR-uri GitHub; consultă [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/). Domeniul de producție rămâne separat de preview-urile de branch. |

**Decizia actuală:** pentru etapa personală de învățare și demo se dorește Vercel Hobby. Când site-ul se apropie de folosirea cu clienți sau promovarea comercială a serviciilor, proprietarul va reevalua eligibilitatea și va trece la Vercel Pro dacă este necesar. Aceasta este intenția de hosting, nu o confirmare că termenii Hobby permit utilizarea comercială și nici că un deploy a avut loc. RoTLD este registrul domeniilor `.ro`, nu furnizorul de hosting. Contul Cloudflare asociat domeniului `.com` nu înseamnă că DNS-ul `.ro` ori hostingul sunt configurate.

Configurația pentru demo este descrisă în [VERCEL-DEMO.md](VERCEL-DEMO.md): `DEPLOYMENT_STAGE=demo`, URL-ul canonic și ambele setări contact false, pentru Preview și Production. Demo-ul nu schimbă copy-ul homepage-ului; păstrează `noindex`, ascunde paginile juridice draft cu 404, lasă activ doar formularul `mailto` și ține API-ul dezactivat. Aceste setări nu confirmă eligibilitatea planului, DNS-ul sau verificarea manuală. Cloudflare Pages Free rămâne alternativă numai dacă se dorește adaptarea proiectului static.

## Pașii pentru sincronizare și domeniu

1. Autentificarea GitHub prin browser/Git Credential Manager este pregătită; următorul pas este push-ul autorizat și confirmarea că tag-ul apare pe remote. Nu trimite parole, tokenuri, coduri OAuth sau URL-uri de autorizare în conversație ori repository.
2. După ce push-ul este autorizat, se urcă checkpointul curent pe GitHub și se confirmă că tag-ul `v0.2-design-referinta` este vizibil acolo. Până la confirmarea acelei operații, repository-ul online rămâne gol.
3. După sincronizarea repository-ului, se creează/configurează proiectul SantierSyncR în Vercel și variabilele demo descrise în ghid; apoi se verifică întâi URL-ul temporar Vercel. Proiectul Vercel, deploy-ul demo și configurarea DNS sunt încă în așteptare. Push-urile la branch-uri de design și PR-uri pot crea preview-uri.
4. Proprietarul verifică manual pe preview textul, aspectul desktop/mobil și legăturile. Testarea manuală rămâne la proprietar; un build reușit nu confirmă aspectul vizual sau funcționarea domeniului.
5. După ce designul este acceptat, proprietarul alege branch-ul de producție (de regulă `main`). Deploy-ul la domeniul public trebuie legat numai de acel branch; branch-urile de lucru rămân preview-uri.
6. Pentru domeniul `.ro`, trebuie cunoscute registrarul și persoana cu acces la DNS, apoi aplicate exact înregistrările cerute de furnizorul ales. Domeniile `santiersync.ro` și `.com` sunt confirmate ca nume cumpărate; codul nu presupune că DNS-ul sau HTTPS-ul sunt deja configurate. Domeniul `.com` poate redirecționa spre `.ro` după configurare.
7. Publicarea rămâne blocată până când proprietarul completează și aprobă datele operatorului, informările juridice și variabilele de lansare cerute de release gate. Nu pune secrete sau date `.env` în GitHub.

## Cum se leagă localul, GitHub și site-ul

- **Local:** copia de pe acest calculator, unde se editează și se verifică schimbările.
- **GitHub:** istoricul și copia la distanță; devine sincronizată numai după un push autorizat.
- **Preview:** o versiune online temporară construită dintr-un commit de branch sau PR.
- **Producție:** domeniul public, legat de branch-ul pe care proprietarul îl alege.

După sincronizare, localul și online-ul corespund când localul a preluat commitul dorit. O editare locală nu modifică site-ul live. Publicarea live se face numai după push/merge către branch-ul de producție și confirmarea deploy-ului.

Pentru întoarcere sau comparație poți cere în chat: „revino la `v0.2-design-referinta`” sau „compară designul nou cu `v0.2-design-referinta`”. Nu trebuie să folosești terminalul. Bundle-ul local este o recuperare suplimentară, nu o copie externă.
