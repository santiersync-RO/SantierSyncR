# CMS Sanity pentru ȘantierSync

Site-ul folosește un singur document Sanity pentru textele publice, formular, SEO și logo. Proiectul `qxu9dq06` folosește datasetul `production` și planul Free implicit Sanity; nu a fost ales un abonament plătit. Datasetul public poate fi citit de oricine, așa că publică doar conținut destinat site-ului. Nu introduce date personale, secrete, chei API sau informații interne.

| Serviciu | Adresă |
| --- | --- |
| Studio publicat | [santiersync-ro.sanity.studio](https://santiersync-ro.sanity.studio) |
| Administrarea proiectului Sanity | [sanity.io/manage](https://www.sanity.io/manage) |
| Site | [santiersync.ro](https://santiersync.ro) |

ID-ul aplicației Studio publicate este `g9tmzbgatl7rbaw15k97672f`.

Adresa Studio redirecționează normal la `https://www.sanity.io/@o2aoecxqi/studio/g9tmzbgatl7rbaw15k97672f`. Website-ul permite previzualizarea în iframe din această origine oficială, configurată prin `SANITY_STUDIO_URL`. Sanity permite deja CORS cu credențiale pentru propria platformă; nu s-a adăugat o permisiune CORS suplimentară pentru întregul domeniu `www.sanity.io`.

## Editare rapidă

1. Deschide [Studio-ul ȘantierSync](https://santiersync-ro.sanity.studio) și autentifică-te cu Google folosind contul autorizat pentru proiect.
2. Alege „Conținutul site-ului” → „Pagina principală” și editează textele din „Navigare”, „Hero”, „Servicii”, „Flux de lucru”, „Colaborare”, „Despre noi” sau „Contact”. Celelalte file conțin subsolul, formularul, SEO și logo-ul.
3. Deschide Presentation pentru previzualizare. După editări, reîncarcă manual iframe-ul de preview ca să vezi versiunea curentă. Verifică pagina pe mobil și desktop.
4. Apasă Publish pentru a publica schimbările. Webhookul invalidează cache-ul site-ului la Publish; cache-ul are și un termen de revalidare de 60 de secunde.

Documentul singleton nu poate fi creat, șters sau duplicat din Studio. Schimbările rămân draft până la Publish. Presentation folosește URL-uri de preview semnate și ruta website `/api/draft-mode/enable`, care verifică URL-ul cu mecanismul oficial Sanity. Nu adăuga manual tokenuri în adresa de preview. Previzualizarea se reîncarcă manual și nu include click-to-edit din iframe.

## Structura și limitele conținutului

Macheta depinde de numărul și ordinea unor elemente. Studio-ul cere 4 rânduri pentru titlul Hero, 5 servicii, 4 etape demonstrative, 3 pași de colaborare, două etichete laterale și trei linkuri de navigare. Păstrează ordinea celor trei etape din diagrama Hero; starea „ÎN LUCRU” aparține etapei din mijloc. Destinațiile din navigare sunt limitate la ancorele paginii. Etichetele și numerele secțiunilor care țin de structură sunt fixe.

Logo-ul existent folosește `originalCrop=true`, pentru a păstra încadrarea originală. La încărcarea unui logo nou, dezactivează această opțiune ca imaginea să fie afișată întreagă. Completează textul alternativ. Studio-ul verifică dimensiunile imaginii când metadatele assetului sunt disponibile; nu verifică separat dacă o referință modificată indică un asset existent.

SEO-ul din CMS schimbă metadatele paginii. În mediul demo, `noindex` rămâne activ prin configurația de publicare a website-ului; editarea SEO în Studio nu activează indexarea. Configurația de indexare se schimbă doar odată cu aprobarea și publicarea mediului live.

## Configurare locală și seed

Studio-ul este separat în `studio/`. Pentru configurarea locală, copiază `studio/.env.template` în `studio/.env.local` și folosește setările proiectului existent:

```dotenv
SANITY_STUDIO_PROJECT_ID=qxu9dq06
SANITY_STUDIO_DATASET=production
PREVIEW_URL=https://santiersync.ro
STUDIO_HOSTNAME=santiersync-ro
```

Nu comite `studio/.env.local` și nu pune tokenuri în ea. Din directorul `studio/`, rulează `npm install` și `npm run dev`; CLI-ul Sanity folosește autentificarea locală pentru proiect. Datasetul real conține deja documentul `siteContent` și logo-ul original, deci nu rula seed-ul pe acest dataset. Pentru un dataset de dezvoltare gol, comanda `npx sanity exec ../scripts/sanity-seed.mjs --with-user-token` creează documentul și assetul numai dacă nu există nici documentul publicat, nici draftul `siteContent`.

Pentru un proiect sau mediu separat, creează un proiect Sanity și datasetul dorit, pune project ID-ul real în `SANITY_STUDIO_PROJECT_ID`, apoi setează datasetul, `PREVIEW_URL` și opțional `STUDIO_HOSTNAME` în fișierul local. Instalează dependențele din `studio/`, folosește `npm run dev` pentru lucru local și `npm run deploy` după autentificarea în contul cu acces la acel proiect. Rulează seed-ul numai într-un dataset nou și gol.

Website-ul folosește `SANITY_PROJECT_ID=qxu9dq06` și `SANITY_DATASET=production`. Cererile obișnuite includ doar conținut publicat (`perspective: published`). `SANITY_API_READ_TOKEN` este un Viewer token server-only folosit pentru draft preview după validarea URL-ului; nu ajunge în browser. Secretul webhookului este păstrat în setările serverului sub `SANITY_WEBHOOK_SECRET`. Endpointul webhookului este `/api/sanity/revalidate`; semnătura HTTP este verificată înainte de invalidarea cache-ului.

## Backup și export

Backupurile CMS se păstrează separat de codul site-ului și nu înlocuiesc backupul Git. Scriptul citește project ID-ul și datasetul din `studio/.env.local`; rulează-l din rădăcina repository-ului în PowerShell:

```powershell
./scripts/sanity-backup.ps1
```

Backupul inițial a fost exportat aici: [`santiersync-production-20261008-183814-098.tar.gz`](</D:/AI/Codex/ȘantierSync/Backups/Sanity/santiersync-production-20261008-183814-098.tar.gz>). Arhiva conține un document și un asset. Exportul folosește Sanity CLI și include asseturile; scriptul creează arhive cu marcaj temporal și nu suprascrie backupuri existente. Păstrează copiile într-o locație protejată și verifică importul într-un dataset separat înainte de a te baza pe o restaurare.

## Verificare și dependențe

Studio-ul a fost typecheck-uit și construit. Verificarea schemei a găsit zero erori, iar verificările pentru semnătura webhookului și securitatea rutei de draft au trecut. Interfața Studio și pașii Preview/Publish încă așteaptă verificarea manuală în browser.

Auditul de producție al website-ului raportează zero advisories. Auditul Studio raportează 17 advisories în dependențele tranzitive ale Sanity CLI: 8 moderate și 9 high. Nu s-au aplicat remedieri forțate sau downgrade-uri; dependențele vor fi reevaluate la o actualizare obișnuită a CLI-ului.
