# Configurarea demo-ului personal pe Vercel Hobby

Această etapă este pentru învățare și verificarea unei versiuni demo personale, conform preferinței proprietarului. Vercel Hobby nu este presupus eligibil pentru folosirea comercială a site-ului agenției. Înainte ca website-ul să promoveze servicii către clienți ori să fie folosit comercial, verifică termenii Vercel și reevaluează trecerea la Pro. Gate-ul tehnic nu confirmă eligibilitatea planului de hosting și nu configurează sincronizarea GitHub sau DNS-ul.

## Setările proiectului

Proiectul Vercel `santiersync` este creat în echipa `coman-family`, pe planul Hobby. Demo-ul este **Ready** la [URL-ul stabil](https://santiersync.vercel.app); deploy-ul curent este [aici](https://santiersync-mlmao3k8w-coman-family.vercel.app), iar [dashboard-ul proiectului](https://vercel.com/coman-family/santiersync) arată configurarea. Build-ul cloud și TypeScript au trecut.

Configurarea existentă:

1. Proiectul folosește framework Next.js, Node.js 24.x, `npm ci` și `npm run build`.
2. Sunt setate aceleași Environment Variables pentru mediile **Preview** și **Production** ale demo-ului:

   ```text
   DEPLOYMENT_STAGE=demo
   SITE_URL=https://santiersync.ro
   CONTACT_ENABLED=false
   NEXT_PUBLIC_CONTACT_ENABLED=false
   ```

   Nu adăuga chei de e-mail, Turnstile sau alte secrete pentru demo. Gate-ul demo nu verifică și nu certifică eligibilitatea planului de hosting, configurarea DNS ori verificarea manuală. `DOMAIN_CONFIRMED` și `MAILBOX_TESTED` pot reflecta verificări făcute ulterior; `LEGAL_REVIEWED` și `RELEASE_APPROVED` nu înlocuiesc verificările stricte live. Variabilele juridice rămân necompletate până când informațiile operatorului și practicile reale sunt stabilite și verificate.

3. Domeniul `santiersync.ro` este deja adăugat la proiect, însă public DNS este NXDOMAIN, iar nameserverele actuale lipsesc. În [RoTLD](https://rotld.ro/) trebuie setate nameserverele solicitate de Vercel: `ns1.vercel-dns.com` și `ns2.vercel-dns.com`; până la propagare, HTTPS și site-ul pe `.ro` nu sunt confirmate. Aliasul de producție `.ro` încă nu este atașat deploy-ului; după DNS trebuie atașat explicit sau făcut redeploy.

Conectarea repository-ului GitHub la Vercel nu a reușit: API-ul a răspuns cu eroarea 400 deoarece integrarea GitHub necesară nu este instalată. Pentru conectarea unui repository personal, Vercel cere proprietarul repository-ului și [Vercel GitHub App](https://github.com/apps/vercel) autorizată. Proprietarul decide dacă păstrează repository-ul și face publicări controlate, configurează Vercel prin contul `santiersync-RO` sau transferă repository-ul către `adriancomann`; automatizarea Git nu este activă.

## Ce face etapa demo

- `releaseReady` rămâne `false`, indiferent de flag-uri de aprobare ori de mediul Vercel.
- API-ul de contact rămâne dezactivat; formularul pregătește un mesaj `mailto`, care poate fi trimis din aplicația de e-mail a vizitatorului.
- Pagina principală poate fi vizualizată ca demo; rutele `/confidentialitate` și `/informatii-legale` răspund cu 404 în etapa demo, astfel încât proiectele juridice să nu fie expuse public.
- Sitemap-ul rămâne gol, iar regulile pentru motoarele de căutare rămân restrictive conform comportamentului de preview.
- Deploy-ul `vercel.app` este online, dar un build reușit nu confirmă DNS-ul `.ro`, HTTPS-ul pe domeniu ori aspectul vizual. Verificarea manuală rămâne la proprietar și nu a fost efectuată.

Pentru trecerea ulterioară la etapa live, elimină `DEPLOYMENT_STAGE=demo` sau setează `live`, apoi completează și verifică independent toate valorile reale cerute de release gate. Nu schimba stadiul doar pentru a ocoli verificările.
