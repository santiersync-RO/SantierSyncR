# Decizii de implementare — 8 octombrie 2026

Proiectul implementează brief-ul ȘantierSync. Textele și direcția vizuală au fost aprobate de proprietar pentru prima versiune la 8 octombrie 2026. Această aprobare nu reprezintă validarea manuală a website-ului sau autorizarea publicării pe domeniul final.

- Nume public: **ȘantierSync**. Identificatori fără diacritice: SantierSync. Repository-ul existent al agenției se numește **SantierSyncR**: https://github.com/santiersync-RO/SantierSyncR.
- Domenii declarate cumpărate și confirmate fără diacritice: **santiersync.ro** și **santiersync.com**. Principal: https://santiersync.ro. Domeniul .com poate redirecționa către .ro după configurarea DNS și verificarea manuală; codul nu pretinde că DNS-ul este deja configurat.
- Email public: **santiersync@gmail.com**. Homepage-ul folosește `mailto:`; deschiderea aplicației de email nu înseamnă trimitere sau livrare confirmată.
- Aria publică: **Cluj și împrejurimi**. Fără telefon sau adresă stradală în pagina comercială.
- Homepage-ul revizuit are șase secțiuni, navigația „Ce facem”, „Cum lucrăm”, „Despre noi” și CTA „Hai să vorbim”. Nu afișează FAQ și nu promovează separat serviciul de website în această versiune.
- Footerul urmează macheta: sloganul „Organizare pentru munca din teren.”, email, „CLUJ · ROMÂNIA”, „ÎNAPOI SUS ↑” și „OMUL RĂMÂNE LA VOLAN.”. Linkurile legale sunt pe paginile legale, nu în footerul homepage-ului.
- Logo: imaginea raster orizontală furnizată de proprietar. Albul din jur se amestecă cu suprafața prin CSS; desenul nu este redesenat sau prezentat drept vector.
- Identitatea prestatorului/operatorului și practicile de prelucrare nu sunt confirmate. Paginile juridice rămân proiecte în preview.
- Endpointul API de contact rămâne nelegat de homepage, dezactivat și destinat unei etape viitoare. Turnstile, Resend și WAF nu sunt raportate drept configurate.

## Responsabilități și consum

Orchestratorul păstrează modelul conversației pentru arhitectură, revizuirea codului și integrare. Trei subagenți cu modelul `gpt-6-luna` au implementat sarcini delimitate: frontend, contact și configurare/SEO/documentație. Au primit numai contextul necesar și fișierele în care au voie să scrie. Corecțiile folosesc aceiași agenți, fără a relua contextul complet în agenți noi.

Orchestratorul efectuează revizuirea codului și verificările automate (`lint`, TypeScript, build). **Testarea manuală a modulelor și validarea vizuală aparțin proprietarului.** Nu se raportează verificări manuale, teste de dispozitive sau emailuri livrate ca executate dacă nu există rezultatul lor real.

Prima versiune este pentru verificare locală/preview. Publicarea pe domeniul final cere configurarea furnizorilor, completarea datelor juridice reale și validarea proprietarului. Planurile de business și documentele interne din directorul părinte nu intră în repository-ul website-ului.
