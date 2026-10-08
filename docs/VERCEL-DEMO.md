# Configurarea demo-ului personal pe Vercel Hobby

Această etapă este pentru învățare și verificarea unei versiuni demo personale, conform preferinței proprietarului. Vercel Hobby nu este presupus eligibil pentru folosirea comercială a site-ului agenției. Înainte ca website-ul să promoveze servicii către clienți ori să fie folosit comercial, verifică termenii Vercel și reevaluează trecerea la Pro. Gate-ul tehnic nu confirmă eligibilitatea planului de hosting și nu configurează sincronizarea GitHub sau DNS-ul.

## Setările proiectului

În Vercel, după ce repository-ul GitHub poate fi conectat:

1. Creează proiectul din repository-ul `SantierSyncR` și alege framework-ul Next.js.
2. Folosește Node.js 24.x. Build command: `npm run build`; instalarea folosește lockfile-ul repository-ului (`npm ci`).
3. Adaugă aceleași Environment Variables pentru mediile **Preview** și **Production** ale demo-ului:

   ```text
   DEPLOYMENT_STAGE=demo
   SITE_URL=https://santiersync.ro
   CONTACT_ENABLED=false
   NEXT_PUBLIC_CONTACT_ENABLED=false
   ```

   Nu adăuga chei de e-mail, Turnstile sau alte secrete pentru demo. Gate-ul demo nu verifică și nu certifică eligibilitatea planului de hosting, configurarea DNS ori verificarea manuală. `DOMAIN_CONFIRMED` și `MAILBOX_TESTED` pot reflecta verificări făcute ulterior; `LEGAL_REVIEWED` și `RELEASE_APPROVED` nu înlocuiesc verificările stricte live. Variabilele juridice rămân necompletate până când informațiile operatorului și practicile reale sunt stabilite și verificate.

4. Fă întâi deploy-ul și verifică URL-ul temporar Vercel, înainte de a lega domeniul ori a schimba DNS-ul. Apoi, dacă dorești domeniul personal, adaugă-l prin setările reale din dashboard-ul Vercel și aplică înregistrările DNS indicate acolo. Gate-ul acceptă etapa demo numai dacă URL-ul este exact și ambele opțiuni de contact sunt explicit `false`.

## Ce face etapa demo

- `releaseReady` rămâne `false`, indiferent de flag-uri de aprobare ori de mediul Vercel.
- API-ul de contact rămâne dezactivat; formularul pregătește un mesaj `mailto`, care poate fi trimis din aplicația de e-mail a vizitatorului.
- Pagina principală poate fi vizualizată ca demo; rutele `/confidentialitate` și `/informatii-legale` răspund cu 404 în etapa demo, astfel încât proiectele juridice să nu fie expuse public.
- Sitemap-ul rămâne gol, iar regulile pentru motoarele de căutare rămân restrictive conform comportamentului de preview.
- Un build reușit nu confirmă DNS, HTTPS, aspectul vizual sau folosirea domeniului. Verificarea manuală rămâne la proprietar.

Pentru trecerea ulterioară la etapa live, elimină `DEPLOYMENT_STAGE=demo` sau setează `live`, apoi completează și verifică independent toate valorile reale cerute de release gate. Nu schimba stadiul doar pentru a ocoli verificările.
