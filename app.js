(function () {
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- Zakładki ---------- */
  var VIEWS = {
    home: [document.getElementById('tab-home'), document.getElementById('home')],
    quiz: [document.getElementById('tab-quiz'), document.getElementById('quiz')],
    draw: [document.getElementById('tab-draw'), document.getElementById('draw')],
    badges: [document.getElementById('tab-badges'), document.getElementById('badges')],
    ranking: [document.getElementById('tab-ranking'), document.getElementById('ranking')],
    profile: [document.getElementById('tab-profile'), document.getElementById('profile')],
    learn: [document.getElementById('tab-learn'), document.getElementById('learn')],
    challenges: [document.getElementById('tab-challenges'), document.getElementById('challenges')]
  };
  var pQuiz = VIEWS.quiz[1];
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.innerHTML = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }
  function show(which) {
    if (which === 'draw' && !allRegionsPassed()) {
      refreshDrawUnlock();
      showToast('<strong>🔒 Wyzwanie jest zablokowane.</strong><br>Najpierw zalicz wszystkie 16 quizów wojewódzkich z wynikiem co najmniej 50%.');
      return;
    }
    Object.keys(VIEWS).forEach(function (k) {
      var on = k === which;
      VIEWS[k][0].setAttribute('aria-selected', on);
      VIEWS[k][1].hidden = !on;
    });
    if (which === 'badges') renderBadges();
    if (which === 'ranking') renderLeague();
    if (which === 'profile') {
      if (window.PolskifyProfileReload) window.PolskifyProfileReload();
      else if (window.PolskifyProfileRender) window.PolskifyProfileRender();
    }
  }
  Object.keys(VIEWS).forEach(function (k) {
    VIEWS[k][0].addEventListener('click', function () { show(k); });
  });
  /* ---------- Quiz wojewódzki ---------- */
  var REGIONS = {
    ZP: { name: 'Zachodniopomorskie', desc: 'Nad Bałtykiem, z rozległym wybrzeżem, portowym Szczecinem i wyspami Wolin oraz Uznam.', questions: [
      { q: 'Jakie miasto jest stolicą województwa zachodniopomorskiego?', a: ['Szczecin','Koszalin','Świnoujście','Stargard'], c: 0 },
      { q: 'Z którym morzem graniczy województwo zachodniopomorskie?', a: ['Bałtyckim','Północnym','Śródziemnym','Czarnym'], c: 0 },
      { q: 'Który park narodowy leży w województwie zachodniopomorskim?', a: ['Woliński Park Narodowy','Ojcowski Park Narodowy','Biebrzański Park Narodowy','Tatrzański Park Narodowy'], c: 0 },
      { q: 'Jaka rzeka tworzy dużą część zachodniej granicy województwa?', a: ['Odra','Wisła','Warta','San'], c: 0 },
      { q: 'Które miasto leży na wyspie Wolin?', a: ['Świnoujście','Koszalin','Wałcz','Gryfice'], c: 0 },
      { q: 'Jak nazywa się znana nadmorska miejscowość uzdrowiskowa z molem?', a: ['Kołobrzeg','Szczecinek','Myślibórz','Choszczno'], c: 0 },
      { q: 'Jaki duży akwen znajduje się na północ od Szczecina?', a: ['Zalew Szczeciński','Jezioro Śniardwy','Zalew Zegrzyński','Zalew Wiślany'], c: 0 },
      { q: 'Która wyspa jest kojarzona z Międzyzdrojami?', a: ['Wolin','Wielkanocna','Sobieszewska','Słodowa'], c: 0 },
      { q: 'Co znajduje się w Szczecinie i jest ważnym zabytkiem miasta?', a: ['Zamek Książąt Pomorskich','Wawel','Zamek Królewski na Wawelu','Zamek w Malborku'], c: 0 },
      { q: 'Jaki typ krajobrazu jest charakterystyczny dla północnej części województwa?', a: ['Nadmorski','Wysokogórski','Pustynny','Tundrowy'], c: 0 }
    ]},
    PM: { name: 'Pomorskie', desc: 'Region Trójmiasta, Bałtyku, Kaszub i Półwyspu Helskiego, z Gdańskiem jako stolicą województwa.', questions: [
      { q: 'Jakie miasto jest stolicą województwa pomorskiego?', a: ['Gdańsk','Gdynia','Sopot','Bytów'], c: 0 },
      { q: 'Z jakim morzem graniczy województwo pomorskie?', a: ['Bałtyckim','Czarnym','Północnym','Adriatyckim'], c: 0 },
      { q: 'Jak nazywa się charakterystyczny półwysep wysunięty w Zatokę Pucką?', a: ['Półwysep Helski','Półwysep Jutlandzki','Mierzeja Wiślana','Wyspa Wolin'], c: 0 },
      { q: 'Przez Gdańsk przepływa rzeka:', a: ['Motława','Narew','San','Pilica'], c: 0 },
      { q: 'Które miasto razem z Gdańskiem i Gdynią tworzy Trójmiasto?', a: ['Sopot','Malbork','Tczew','Wejherowo'], c: 0 },
      { q: 'Jak nazywa się region kulturowy znany z własnej tradycji i języka?', a: ['Kaszuby','Kurpie','Podhale','Roztocze'], c: 0 },
      { q: 'Który zabytek kojarzy się z Gdańskiem?', a: ['Żuraw','Spodek','Hala Stulecia','Pałac Kultury'], c: 0 },
      { q: 'W którym mieście znajduje się port i słynne Muzeum Emigracji?', a: ['Gdynia','Sopot','Malbork','Słupsk'], c: 0 },
      { q: 'Jak nazywa się największy zamek krzyżacki w Malborku?', a: ['Zamek w Malborku','Zamek Książ','Zamek Ogrodzieniec','Zamek Czocha'], c: 0 },
      { q: 'Który park narodowy leży na wybrzeżu województwa?', a: ['Słowiński Park Narodowy','Biebrzański Park Narodowy','Ojcowski Park Narodowy','Tatrzański Park Narodowy'], c: 0 }
    ]},
    WN: { name: 'Warmińsko-mazurskie', desc: 'Kraina jezior, lasów i żeglugi. To tutaj znajdują się Mazury i Olsztyn.', questions: [
      { q: 'Jakie miasto jest stolicą województwa warmińsko-mazurskiego?', a: ['Olsztyn','Elbląg','Ełk','Iława'], c: 0 },
      { q: 'Z czego najbardziej znane są Mazury?', a: ['Z licznych jezior','Z wysokich gór','Z pustyń','Z klifów nad Atlantykiem'], c: 0 },
      { q: 'Które jezioro jest największym jeziorem w Polsce?', a: ['Śniardwy','Mamry','Hańcza','Jeziorak'], c: 0 },
      { q: 'W którym mieście znajduje się planetarium i obserwatorium związane z Mikołajem Kopernikiem?', a: ['Frombork','Malbork','Nidzica','Mrągowo'], c: 0 },
      { q: 'Który kanał łączy jeziora i jest jedną z atrakcji regionu?', a: ['Kanał Elbląski','Kanał Augustowski','Kanał Gliwicki','Kanał Żerański'], c: 0 },
      { q: 'Które zwierzę jest symbolem Mazurskiego Parku Krajobrazowego?', a: ['Bocian czarny','Pingwin','Koala','Renifer'], c: 0 },
      { q: 'Które miasto leży nad jeziorem Niegocin?', a: ['Giżycko','Olsztyn','Elbląg','Braniewo'], c: 0 },
      { q: 'Jak nazywa się kraina historyczna związana z Olsztynem?', a: ['Warmia','Podlasie','Kaszuby','Mazowsze'], c: 0 },
      { q: 'Które jezioro jest jednym z największych w Polsce i leży na Mazurach?', a: ['Mamry','Morskie Oko','Jezioro Żywieckie','Gopło'], c: 0 },
      { q: 'Jaki sport wodny jest szczególnie popularny na Mazurach?', a: ['Żeglarstwo','Narciarstwo alpejskie','Surfing na oceanie','Hokej na lodzie'], c: 0 }
    ]},
    PD: { name: 'Podlaskie', desc: 'Zielony region północno-wschodniej Polski, znany z Puszczy Białowieskiej, Narwi i różnorodności kulturowej.', questions: [
      { q: 'Jakie miasto jest stolicą województwa podlaskiego?', a: ['Białystok','Łomża','Suwałki','Augustów'], c: 0 },
      { q: 'Który park narodowy chroni część Puszczy Białowieskiej?', a: ['Białowieski Park Narodowy','Słowiński Park Narodowy','Kampinoski Park Narodowy','Wigierski Park Narodowy'], c: 0 },
      { q: 'Która rzeka jest jednym z najważniejszych cieków Podlasia?', a: ['Narew','Warta','Odra','Dunajec'], c: 0 },
      { q: 'Z którym państwem Polska graniczy w województwie podlaskim?', a: ['Białorusią','Czechami','Słowacją','Niemcami'], c: 0 },
      { q: 'Jakie zwierzę szczególnie kojarzy się z Puszczą Białowieską?', a: ['Żubr','Lew','Kangur','Wielbłąd'], c: 0 },
      { q: 'Które miasto słynie z kanału łączącego dorzecza Wisły i Niemna?', a: ['Augustów','Białystok','Łomża','Hajnówka'], c: 0 },
      { q: 'Który park narodowy chroni rozlewiska rzeki Biebrzy?', a: ['Biebrzański Park Narodowy','Ojcowski Park Narodowy','Karkonoski Park Narodowy','Woliński Park Narodowy'], c: 0 },
      { q: 'Jak nazywa się mniejszość, z którą kojarzy się część okolic Hajnówki?', a: ['Białoruska','Duńska','Hiszpańska','Portugalska'], c: 0 },
      { q: 'Który z tych parków narodowych leży w Podlaskiem?', a: ['Wigierski Park Narodowy','Tatrzański Park Narodowy','Bieszczadzki Park Narodowy','Kampinoski Park Narodowy'], c: 0 },
      { q: 'Jakie miasto jest jednym z ważnych ośrodków przemysłu i kultury regionu?', a: ['Białystok','Gdynia','Opole','Wałbrzych'], c: 0 }
    ]},
    LB: { name: 'Lubuskie', desc: 'Zielony zachód Polski, położony przy granicy z Niemcami, z Zieloną Górą i Gorzowem Wielkopolskim.', questions: [
      { q: 'Jakie dwa miasta są siedzibami władz województwa lubuskiego?', a: ['Gorzów Wielkopolski i Zielona Góra','Poznań i Kalisz','Wrocław i Opole','Bydgoszcz i Toruń'], c: 0 },
      { q: 'Która duża rzeka przepływa przez województwo lubuskie?', a: ['Odra','San','Narew','Dunajec'], c: 0 },
      { q: 'Który park krajobrazowy i obiekt UNESCO słynie z ogromnego parku położonego przy granicy z Niemcami?', a: ['Park Mużakowski','Park Śląski','Park Gródek','Park Zdrojowy'], c: 0 },
      { q: 'Województwo lubuskie leży w zachodniej części Polski przy granicy z:', a: ['Niemcami','Ukrainą','Litwą','Czechami'], c: 0 },
      { q: 'Które miasto słynie z tradycji winiarskich?', a: ['Zielona Góra','Gorzów Wielkopolski','Słubice','Żagań'], c: 0 },
      { q: 'Który park narodowy leży w województwie lubuskim?', a: ['Park Narodowy Ujście Warty','Białowieski Park Narodowy','Ojcowski Park Narodowy','Tatrzański Park Narodowy'], c: 0 },
      { q: 'Który z tych mostów przekracza Odrę na granicy Polski i Niemiec?', a: ['Most w Słubicach i Frankfurcie nad Odrą','Most Świętokrzyski','Most Grunwaldzki','Most Dębnicki'], c: 0 },
      { q: 'Jakie miasto słynie z zamku i dawnej twierdzy?', a: ['Kostrzyn nad Odrą','Sopot','Puck','Zakopane'], c: 0 },
      { q: 'Które miasto jest stolicą województwa lubuskiego wspólnie z Gorzowem Wielkopolskim jako siedzibą władz?', a: ['Zielona Góra','Słubice','Żagań','Nowa Sól'], c: 0 },
      { q: 'Co jest charakterystyczne dla krajobrazu województwa lubuskiego?', a: ['Duża liczba lasów i jezior','Lodowce','Wysokie Tatry','Pustynie'], c: 0 }
    ]},
    KP: { name: 'Kujawsko-pomorskie', desc: 'Region dwóch siedzib władz — Bydgoszczy i Torunia — oraz miast związanych z Wisłą i historią Kopernika.', questions: [
      { q: 'Które dwa miasta są siedzibami władz województwa kujawsko-pomorskiego?', a: ['Bydgoszcz i Toruń','Włocławek i Grudziądz','Toruń i Inowrocław','Bydgoszcz i Płock'], c: 0 },
      { q: 'Z którego miasta pochodził Mikołaj Kopernik?', a: ['Toruń','Bydgoszcz','Chełmno','Włocławek'], c: 0 },
      { q: 'Która wielka rzeka przepływa przez Toruń?', a: ['Wisła','Odra','Warta','Bug'], c: 0 },
      { q: 'Toruń słynie między innymi z:', a: ['Pierników','Oscypków','Krupnioków','Obwarzanków'], c: 0 },
      { q: 'Jak nazywa się duży kanał wodny w Bydgoszczy łączący dorzecza?', a: ['Kanał Bydgoski','Kanał Elbląski','Kanał Augustowski','Kanał Gliwicki'], c: 0 },
      { q: 'Które miasto słynie z tężni solankowych?', a: ['Ciechocinek','Chełmno','Toruń','Brodnica'], c: 0 },
      { q: 'Który park narodowy leży w województwie kujawsko-pomorskim?', a: ['Brak parku narodowego','Wielkopolski Park Narodowy','Biebrzański Park Narodowy','Woliński Park Narodowy'], c: 0 },
      { q: 'Jak nazywa się zabytkowe miasto słynące z gotyckiej architektury nad Wisłą?', a: ['Toruń','Zakopane','Szczecin','Lublin'], c: 0 },
      { q: 'Który rodzaj soli kojarzy się z Ciechocinkiem?', a: ['Solanka','Sól morska z oceanu','Sól kamienna z Sahary','Sól himalajska'], c: 0 },
      { q: 'Jaką rzeką jest Brda, która przepływa przez Bydgoszcz?', a: ['Dopływem Wisły','Dopływem Odry','Dopływem Bugu','Dopływem Sanu'], c: 0 }
    ]},
    WP: { name: 'Wielkopolskie', desc: 'Region Poznania, Gniezna i początków państwa polskiego, z charakterystyczną gwarą i bogatą historią.', questions: [
      { q: 'Jakie miasto jest stolicą województwa wielkopolskiego?', a: ['Poznań','Kalisz','Leszno','Gniezno'], c: 0 },
      { q: 'Jaka rzeka przepływa przez Poznań?', a: ['Warta','Wisła','Odra','Bug'], c: 0 },
      { q: 'W którym mieście znajduje się słynna katedra związana z początkami państwa polskiego?', a: ['Gniezno','Konin','Piła','Ostrów Wielkopolski'], c: 0 },
      { q: 'Który park narodowy leży w województwie wielkopolskim?', a: ['Wielkopolski Park Narodowy','Białowieski Park Narodowy','Tatrzański Park Narodowy','Roztoczański Park Narodowy'], c: 0 },
      { q: 'Co według tradycji znajduje się na poznańskim Starym Rynku?', a: ['Koziołki','Żurawie','Smoki wawelskie','Syrenka'], c: 0 },
      { q: 'Jak nazywa się słynna poznańska bułka z nadzieniem z białego maku?', a: ['Rogal świętomarciński','Obwarzanek krakowski','Krupniok','Kołacz'], c: 0 },
      { q: 'Które jezioro jest jednym z największych w Wielkopolsce?', a: ['Powidzkie','Morskie Oko','Hańcza','Śniardwy'], c: 0 },
      { q: 'Jak nazywa się historyczna kraina związana z Gnieznem i Poznaniem?', a: ['Wielkopolska','Małopolska','Warmia','Kaszuby'], c: 0 },
      { q: 'Które miasto jest ważnym ośrodkiem przemysłowym i kulturalnym na południu regionu?', a: ['Kalisz','Hel','Białystok','Olsztyn'], c: 0 },
      { q: 'Jaki ptak pojawia się w legendzie o początkach państwa polskiego?', a: ['Orzeł biały','Pingwin','Flaming','Pelikan'], c: 0 }
    ]},
    MZ: { name: 'Mazowieckie', desc: 'Największy powierzchniowo region Polski, z Warszawą, Wisłą i Puszczą Kampinoską.', questions: [
      { q: 'Jakie miasto jest stolicą województwa mazowieckiego?', a: ['Warszawa','Radom','Płock','Siedlce'], c: 0 },
      { q: 'Przez Warszawę przepływa rzeka:', a: ['Wisła','Odra','Warta','Narew'], c: 0 },
      { q: 'Który park narodowy leży niedaleko Warszawy?', a: ['Kampinoski Park Narodowy','Wigierski Park Narodowy','Bieszczadzki Park Narodowy','Ojcowski Park Narodowy'], c: 0 },
      { q: 'Mazowieckie leży głównie w:', a: ['środkowo-wschodniej Polsce','północno-zachodniej Polsce','południowo-zachodniej Polsce','wyłącznie nad Bałtykiem'], c: 0 },
      { q: 'Które miasto słynie z Pałacu Kultury i Nauki?', a: ['Warszawa','Płock','Radom','Siedlce'], c: 0 },
      { q: 'Jak nazywa się historyczny zespół staromiejski Warszawy?', a: ['Stare Miasto','Kazimierz','Nikiszowiec','Ostrów Tumski'], c: 0 },
      { q: 'Która rzeka jest dużym dopływem Wisły i płynie przez północną część regionu?', a: ['Narew','San','Noteć','Odra'], c: 0 },
      { q: 'Z jakim kompozytorem szczególnie kojarzy się Żelazowa Wola?', a: ['Fryderyk Chopin','Stanisław Moniuszko','Henryk Wieniawski','Ignacy Jan Paderewski'], c: 0 },
      { q: 'Które miasto leży nad Wisłą i jest jednym z najstarszych ośrodków Mazowsza?', a: ['Płock','Sopot','Kołobrzeg','Krosno'], c: 0 },
      { q: 'Jak nazywa się duży kompleks leśny wokół Warszawy objęty ochroną?', a: ['Puszcza Kampinoska','Puszcza Białowieska','Puszcza Notecka','Puszcza Niepołomicka'], c: 0 }
    ]},
    LD: { name: 'Łódzkie', desc: 'Centralny region Polski z Łodzią — miastem dawnego przemysłu włókienniczego i słynną ulicą Piotrkowską.', questions: [
      { q: 'Jakie miasto jest stolicą województwa łódzkiego?', a: ['Łódź','Piotrków Trybunalski','Skierniewice','Pabianice'], c: 0 },
      { q: 'Łódź była historycznie bardzo ważnym ośrodkiem:', a: ['przemysłu włókienniczego','rybołówstwa morskiego','wydobycia ropy naftowej','stoczniowym'], c: 0 },
      { q: 'Najbardziej znaną ulicą reprezentacyjną Łodzi jest:', a: ['Piotrkowska','Długa','Floriańska','Mariacka'], c: 0 },
      { q: 'Województwo łódzkie leży mniej więcej w:', a: ['centrum Polski','skrajnym północnym zachodzie','górach','północno-wschodnim narożniku'], c: 0 },
      { q: 'Jak nazywa się słynny kompleks fabryczny i centrum kultury w Łodzi?', a: ['Manufaktura','Stocznia','Spodek','Nikiszowiec'], c: 0 },
      { q: 'Która rzeka jest dopływem Wisły i płynie przez część województwa?', a: ['Pilica','Odra','Warta','San'], c: 0 },
      { q: 'Które miasto słynie z długiej ulicy Piotrkowskiej?', a: ['Łódź','Zgierz','Łowicz','Kutno'], c: 0 },
      { q: 'Jak nazywa się ważny ośrodek przemysłowy na południu regionu?', a: ['Piotrków Trybunalski','Hel','Sopot','Ełk'], c: 0 },
      { q: 'Która miejscowość kojarzy się z tradycją ludową i charakterystycznymi pasiakami?', a: ['Łowicz','Pabianice','Bełchatów','Łęczyca'], c: 0 },
      { q: 'Jak nazywa się główna rzeka przepływająca przez Łódź?', a: ['Nie ma jednej dużej rzeki przepływającej przez centrum; przez miasto płyną mniejsze rzeki','Wisła','Odra','Bug'], c: 0 }
    ]},
    LU: { name: 'Lubelskie', desc: 'Wschodni region Polski z Lublinem, Kazimierzem Dolnym, Roztoczem i granicą na Bugu.', questions: [
      { q: 'Jakie miasto jest stolicą województwa lubelskiego?', a: ['Lublin','Zamość','Chełm','Biała Podlaska'], c: 0 },
      { q: 'Która miejscowość słynie z malowniczego położenia nad Wisłą i zabytkowego rynku?', a: ['Kazimierz Dolny','Nałęczów','Biłgoraj','Łuków'], c: 0 },
      { q: 'Wschodnią granicę województwa lubelskiego tworzy między innymi rzeka:', a: ['Bug','Odra','Warta','Nida'], c: 0 },
      { q: 'Na południu województwa znajduje się kraina geograficzna:', a: ['Roztocze','Kaszyby','Puszcza Notecka','Żuławy'], c: 0 },
      { q: 'Które miasto jest znane z renesansowej zabudowy i wpisanego na listę UNESCO Starego Miasta?', a: ['Zamość','Puławy','Chełm','Biała Podlaska'], c: 0 },
      { q: 'Który park narodowy leży w Lubelskiem?', a: ['Poleski Park Narodowy','Tatrzański Park Narodowy','Wigierski Park Narodowy','Woliński Park Narodowy'], c: 0 },
      { q: 'Jaka rzeka przepływa przez Lublin?', a: ['Bystrzyca','Wisła','Odra','San'], c: 0 },
      { q: 'Które miasto jest ważnym ośrodkiem akademickim regionu?', a: ['Lublin','Hel','Zakopane','Tarnów'], c: 0 },
      { q: 'Jak nazywa się kraina historyczna obejmująca wschodnią część Polski z Chełmem?', a: ['Chełmszczyzna','Kaszuby','Śląsk Cieszyński','Spisz'], c: 0 },
      { q: 'Który z produktów jest silnie kojarzony z Roztoczem i Lubelszczyzną?', a: ['Uprawa chmielu','Plantacje bananów','Hodowla wielbłądów','Uprawa kawy'], c: 0 }
    ]},
    DS: { name: 'Dolnośląskie', desc: 'Południowo-zachodni region z Wrocławiem, Sudetami i dużą liczbą zamków oraz uzdrowisk.', questions: [
      { q: 'Jakie miasto jest stolicą województwa dolnośląskiego?', a: ['Wrocław','Legnica','Wałbrzych','Jelenia Góra'], c: 0 },
      { q: 'Przez Wrocław przepływa rzeka:', a: ['Odra','Wisła','Warta','San'], c: 0 },
      { q: 'Które pasmo górskie znajduje się w południowej części województwa?', a: ['Sudety','Tatry','Beskid Niski','Bieszczady'], c: 0 },
      { q: 'Zamek Książ znajduje się w pobliżu:', a: ['Wałbrzycha','Wrocławia','Legnicy','Lubina'], c: 0 },
      { q: 'Jak nazywa się najwyższy szczyt Sudetów?', a: ['Śnieżka','Rysy','Tarnica','Łysica'], c: 0 },
      { q: 'Które miasto słynie z krasnali na ulicach?', a: ['Wrocław','Legnica','Jelenia Góra','Lubin'], c: 0 },
      { q: 'Który park narodowy leży na Dolnym Śląsku?', a: ['Karkonoski Park Narodowy','Biebrzański Park Narodowy','Woliński Park Narodowy','Roztoczański Park Narodowy'], c: 0 },
      { q: 'Jak nazywa się słynna hala z 1913 roku wpisana na listę UNESCO?', a: ['Hala Stulecia','Spodek','Hala Olivia','Ergo Arena'], c: 0 },
      { q: 'Które miasto jest znanym uzdrowiskiem u podnóża Sudetów?', a: ['Kudowa-Zdrój','Sopot','Słupsk','Giżycko'], c: 0 },
      { q: 'Jaki przemysł jest historycznie ważny dla okolic Wałbrzycha?', a: ['Górnictwo','Rybołówstwo dalekomorskie','Stoczniowy','Wielorybnictwo'], c: 0 }
    ]},
    OP: { name: 'Opolskie', desc: 'Niewielkie województwo południowo-zachodniej Polski, znane z Opola, Odry i Góry Świętej Anny.', questions: [
      { q: 'Jakie miasto jest stolicą województwa opolskiego?', a: ['Opole','Nysa','Brzeg','Kędzierzyn-Koźle'], c: 0 },
      { q: 'Która rzeka przepływa przez Opole?', a: ['Odra','Wisła','Narew','Bug'], c: 0 },
      { q: 'Która znana miejscowość słynie z bazyliki i góry będącej miejscem ważnych wydarzeń historycznych?', a: ['Góra Świętej Anny','Paczków','Otmuchów','Brzeg'], c: 0 },
      { q: 'Województwo opolskie jest położone w:', a: ['południowo-zachodniej Polsce','północno-wschodniej Polsce','środkowej Polsce','wyłącznie nad Bałtykiem'], c: 0 },
      { q: 'Z czego słynie Opole jako miasto?', a: ['Z festiwalu polskiej piosenki','Z żeglarskich regat oceanicznych','Z kopalni soli','Z zamku krzyżackiego'], c: 0 },
      { q: 'Które miasto słynie z dobrze zachowanych murów obronnych?', a: ['Paczków','Hel','Sopot','Ełk'], c: 0 },
      { q: 'Jak nazywa się duży zamek położony nad Odrą w Brzegu?', a: ['Zamek Piastów Śląskich','Zamek Książ','Zamek w Malborku','Zamek Ogrodzieniec'], c: 0 },
      { q: 'Które jezioro jest znane w okolicach Nysy?', a: ['Jezioro Nyskie','Jezioro Hańcza','Śniardwy','Jeziorak'], c: 0 },
      { q: 'Jaki kolor często kojarzy się z barwami Opola?', a: ['Niebieski i biały','Czarny i zielony','Żółty i fioletowy','Czerwony i czarny'], c: 0 },
      { q: 'Która z tych gałęzi przemysłu ma duże znaczenie w regionie?', a: ['Przemysł chemiczny','Wielorybnictwo','Wydobycie diamentów','Przemysł kosmiczny na pustyni'], c: 0 }
    ]},
    SK: { name: 'Świętokrzyskie', desc: 'Region Gór Świętokrzyskich, Kielc, gołoborzy i legend związanych ze Świętym Krzyżem.', questions: [
      { q: 'Jakie miasto jest stolicą województwa świętokrzyskiego?', a: ['Kielce','Ostrowiec Świętokrzyski','Sandomierz','Starachowice'], c: 0 },
      { q: 'Jak nazywają się stare góry znajdujące się w regionie?', a: ['Góry Świętokrzyskie','Sudety','Tatry','Beskid Sądecki'], c: 0 },
      { q: 'Na której górze znajduje się słynne sanktuarium na Świętym Krzyżu?', a: ['Łysej Górze','Śnieżce','Giewoncie','Tarnicy'], c: 0 },
      { q: 'Jaskinia Raj znajduje się w pobliżu:', a: ['Kielc','Sandomierza','Buska-Zdroju','Końskich'], c: 0 },
      { q: 'Jak nazywają się charakterystyczne rumowiska skalne w Górach Świętokrzyskich?', a: ['Gołoborza','Morena','Klify','Wydmy'], c: 0 },
      { q: 'Które miasto słynie z malowniczego rynku i położenia nad Wisłą?', a: ['Sandomierz','Kielce','Skarżysko-Kamienna','Starachowice'], c: 0 },
      { q: 'Który park narodowy leży w województwie świętokrzyskim?', a: ['Świętokrzyski Park Narodowy','Białowieski Park Narodowy','Woliński Park Narodowy','Słowiński Park Narodowy'], c: 0 },
      { q: 'Jakie pasmo jest jednym z najstarszych w Polsce?', a: ['Góry Świętokrzyskie','Tatry','Pieniny','Beskid Żywiecki'], c: 0 },
      { q: 'Które miasto jest ważnym ośrodkiem targowym regionu?', a: ['Kielce','Hel','Gdynia','Suwałki'], c: 0 },
      { q: 'Jaki surowiec wydobywano historycznie w wielu miejscach regionu?', a: ['Rudy metali','Ropę z morza','Diamenty','Węgiel kamienny wyłącznie spod Bałtyku'], c: 0 }
    ]},
    SL: { name: 'Śląskie', desc: 'Górnicza i przemysłowa część południowej Polski, ale też Beskidy, Jury i mnóstwo ciekawych miast.', questions: [
      { q: 'Jakie miasto jest stolicą województwa śląskiego?', a: ['Katowice','Gliwice','Częstochowa','Bielsko-Biała'], c: 0 },
      { q: 'Katowicki Spodek jest przede wszystkim:', a: ['halą widowiskowo-sportową','zamkiem','kopalnią','planetarium'], c: 0 },
      { q: 'Z czego historycznie słynęła przemysłowa część Górnego Śląska?', a: ['Górnictwa i hutnictwa','Uprawy winorośli','Rybołówstwa morskiego','Hodowli reniferów'], c: 0 },
      { q: 'W którym mieście znajduje się zabytkowe osiedle Nikiszowiec?', a: ['Katowicach','Tychach','Rybniku','Sosnowcu'], c: 0 },
      { q: 'Które góry znajdują się na południu województwa?', a: ['Beskidy','Tatry','Bieszczady','Góry Świętokrzyskie'], c: 0 },
      { q: 'Z jakiego miasta słynie Jasna Góra?', a: ['Częstochowa','Gliwice','Ruda Śląska','Żory'], c: 0 },
      { q: 'Która kraina geograficzna obejmuje północną część województwa?', a: ['Jura Krakowsko-Częstochowska','Pojezierze Mazurskie','Roztocze','Żuławy'], c: 0 },
      { q: 'Jak nazywa się park położony między Chorzowem a Katowicami?', a: ['Park Śląski','Park Mużakowski','Park Saski','Park Cytadela'], c: 0 },
      { q: 'Które miasto jest znane z zabytkowej Kopalni Guido?', a: ['Zabrze','Tychy','Będzin','Żywiec'], c: 0 },
      { q: 'Jaki produkt kojarzy się z tradycyjną kuchnią śląską?', a: ['Kluski śląskie','Oscypek','Kartacz podlaski','Rogalik marciński'], c: 0 }
    ]},
    MA: { name: 'Małopolskie', desc: 'Kraków, Tatry, Pieniny i dziedzictwo królewskie — jeden z najbardziej zróżnicowanych regionów południowej Polski.', questions: [
      { q: 'Jakie miasto jest stolicą województwa małopolskiego?', a: ['Kraków','Tarnów','Nowy Sącz','Zakopane'], c: 0 },
      { q: 'Która słynna budowla znajduje się na wzgórzu nad Wisłą w Krakowie?', a: ['Zamek Królewski na Wawelu','Zamek Książ','Zamek w Malborku','Zamek Czocha'], c: 0 },
      { q: 'Które pasmo górskie leży na południu Małopolski?', a: ['Tatry','Sudety','Góry Świętokrzyskie','Pojezierze Mazurskie'], c: 0 },
      { q: 'Przez Kraków przepływa:', a: ['Wisła','Odra','Warta','Bug'], c: 0 },
      { q: 'Jak nazywa się słynna kopalnia soli pod Krakowem?', a: ['Kopalnia Soli Wieliczka','Kopalnia Guido','Kopalnia Srebra','Kopalnia Turów'], c: 0 },
      { q: 'Które miasto jest zimową stolicą Polski?', a: ['Zakopane','Tarnów','Oświęcim','Bochnia'], c: 0 },
      { q: 'Jak nazywa się rzeka przepływająca przez Tarnów?', a: ['Biała','Odra','Narew','Noteć'], c: 0 },
      { q: 'Który park narodowy słynie z Pienińskiego Przełomu Dunajca?', a: ['Pieniński Park Narodowy','Kampinoski Park Narodowy','Wigierski Park Narodowy','Poleski Park Narodowy'], c: 0 },
      { q: 'Jak nazywa się górski szczyt i symbol Tatr?', a: ['Giewont','Śnieżka','Łysica','Tarnica'], c: 0 },
      { q: 'Które miasto ma znany renesansowy rynek z ratuszem?', a: ['Kraków','Olsztyn','Gorzów Wielkopolski','Bydgoszcz'], c: 0 }
    ]},
    PK: { name: 'Podkarpackie', desc: 'Południowo-wschodni region z Rzeszowem, Bieszczadami, Sanem i zabytkowymi miastami pogranicza.', questions: [
      { q: 'Jakie miasto jest stolicą województwa podkarpackiego?', a: ['Rzeszów','Przemyśl','Krosno','Tarnobrzeg'], c: 0 },
      { q: 'Które góry znajdują się w południowej części regionu?', a: ['Bieszczady','Tatry','Karkonosze','Góry Stołowe'], c: 0 },
      { q: 'Jaka rzeka przepływa przez Przemyśl?', a: ['San','Warta','Narew','Pilica'], c: 0 },
      { q: 'Jezioro Solińskie powstało dzięki budowie zapory na rzece:', a: ['Sanie','Wiśle','Odrze','Warcie'], c: 0 },
      { q: 'Jak nazywa się słynny szczyt Bieszczad?', a: ['Tarnica','Giewont','Śnieżka','Łysica'], c: 0 },
      { q: 'Które miasto słynie z zamku i arystokratycznej rezydencji Łańcut?', a: ['Łańcut','Rzeszów','Krosno','Sanok'], c: 0 },
      { q: 'Jak nazywa się kraina historyczna kojarzona z południowo-wschodnią częścią regionu?', a: ['Bieszczady i Pogórze','Kaszuby','Żuławy','Warmia'], c: 0 },
      { q: 'Które miasto słynie z Muzeum Budownictwa Ludowego i cerkwi z okolic regionu?', a: ['Sanok','Tarnobrzeg','Mielec','Dębica'], c: 0 },
      { q: 'Który park narodowy leży w województwie podkarpackim?', a: ['Bieszczadzki Park Narodowy','Woliński Park Narodowy','Kampinoski Park Narodowy','Słowiński Park Narodowy'], c: 0 },
      { q: 'Z czego słynie Krosno?', a: ['Szkła','Budowy statków','Wydobycia bursztynu z Bałtyku','Produkcji oscypków'], c: 0 }
    ]}
  };

  var qEl = pQuiz;
  var currentRegion = null, quizMode = 'regional', QUESTIONS = [], qi = 0, score = 0, answered = false, results = [], missed = [], secureQuizSession = null, currentSpecialKind = null;
  var PASS_PERCENT = 50;
  var PASSED_KEY = 'polskify-passed-regions-v1';
  var OLD_PASSED_KEY = 'szpajza-passed-regions-v1';
  var ACCOUNTS_KEY = 'polskify-accounts-v3';
  var SESSION_KEY = 'polskify-session-v2';
  var ADMIN_EMAIL = 'admin@polskify.pl';

  var ADMIN_DEFAULT_PASSWORD = 'admin123';

  async function ensureAdminAccount(email, password) {
    if (email !== ADMIN_EMAIL || password !== ADMIN_DEFAULT_PASSWORD) return false;

    var hash = await hashPassword(ADMIN_DEFAULT_PASSWORD);
    var old = accounts[ADMIN_EMAIL] || {};
    accounts[ADMIN_EMAIL] = {
      email: ADMIN_EMAIL,
      displayName: old.displayName || 'Administrator',
      passwordHash: hash,
      passedRegions: old.passedRegions || {},
      xp: Number(old.xp || 0),
      stats: old.stats || { quizzes:0, perfect:0, passedQuizStreak:0 },
      streak: old.streak || { count:0, best:0, lastDay:'', activeDays:[] },
      league: old.league || { weeklyXP:0, week:mondayKey(), league:'bronze' }
    };
    saveAccounts();
    return true;
  }


  var GUEST_XP_KEY = 'polskify-guest-xp-v1';
  var GUEST_STATS_KEY = 'polskify-guest-stats-v1';
  var GUEST_STREAK_KEY = 'polskify-guest-streak-v1';
  var GUEST_LEAGUE_KEY = 'polskify-guest-league-v1';
  var LEVEL_THRESHOLDS = [
    { level: 1, xp: 50, name: 'Odkrywca' },
    { level: 2, xp: 100, name: 'Turysta' },
    { level: 3, xp: 125, name: 'Podróżnik' },
    { level: 4, xp: 170, name: 'Znawca Regionów' },
    { level: 5, xp: 230, name: 'Kartograf' },
    { level: 6, xp: 250, name: 'Ekspert Polski' },
    { level: 7, xp: 300, name: 'Mistrz Województw' },
    { level: 8, xp: 375, name: 'Geograf' },
    { level: 9, xp: 400, name: 'Legenda Polski' },
    { level: 10, xp: 450, name: 'Mistrz Polskify' }
  ];
  var passedRegions = {};
  var accounts = {};
  var currentUser = null;
  var accountMode = 'login';
  var backendHydrating = false;
  var backendSyncTimer = null;

  function backendEnabled() {
    return !!(window.PolskifyBackend && window.PolskifyBackend.isConfigured());
  }

  function scheduleBackendSync() {
    if (!backendEnabled() || backendHydrating || !currentUser || !currentUser.id) return;
    clearTimeout(backendSyncTimer);
    backendSyncTimer = setTimeout(function () {
      window.PolskifyBackend.saveUser(currentUser).catch(function (err) {
        console.error('Polskify backend sync error:', err);
      });
    }, 250);
  }

  async function activateBackendUser(authUser) {
    if (!backendEnabled() || !authUser) return;
    backendHydrating = true;
    try {
      var remote = await window.PolskifyBackend.loadUser(authUser);
      accounts[remote.email] = remote;
      currentUser = remote;
      passedRegions = remote.passedRegions || {};
      refreshMapStatuses();
      refreshDrawUnlock();
      refreshAccountUI();
      refreshAdminPanel();
      renderLeague();
      try { if (window.PolskifyProfileReload) await window.PolskifyProfileReload(); } catch (e) { console.error('Profile reload after login:', e); }
      scheduleBackendSync();
    } finally {
      backendHydrating = false;
    }
  }

  async function restoreBackendSession() {
    if (!backendEnabled()) return;
    try {
      var session = await window.PolskifyBackend.getSession();
      if (session && session.user) await activateBackendUser(session.user);
    } catch (err) {
      console.error('Polskify session restore error:', err);
    }
  }


  function loadAccounts() {
    try {
      var raw = localStorage.getItem(ACCOUNTS_KEY);
      if (!raw) raw = localStorage.getItem('polskify-accounts-v2') || '{}';
      accounts = JSON.parse(raw) || {};
    } catch (err) { accounts = {}; }
    // Przeniesienie ewentualnych starszych kont, które już miały e-mail.
    var migrated = {};
    Object.keys(accounts).forEach(function (key) {
      var acc = accounts[key] || {};
      var email = normalizeEmail(acc.email || (String(acc.username || '').indexOf('@') !== -1 ? acc.username : ''));
      if (email) {
        acc.email = email;
        if (!acc.displayName) acc.displayName = email.split('@')[0];
        migrated[email] = acc;
      }
    });
    if (Object.keys(migrated).length) {
      accounts = migrated;
      saveAccounts();
    }
  }

  function saveAccounts() {
    try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch (err) {}
    scheduleBackendSync();
  }

  function readSession() {
    try { return localStorage.getItem(SESSION_KEY) || ''; } catch (err) { return ''; }
  }

  function writeSession(username) {
    try { if (username) localStorage.setItem(SESSION_KEY, username); else localStorage.removeItem(SESSION_KEY); } catch (err) {}
  }

  function simpleHash(text) {
    var hash = 2166136261;
    for (var i = 0; i < text.length; i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 16777619); }
    return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
  }

  async function hashPassword(text) {
    try {
      if (window.crypto && crypto.subtle) {
        var data = new TextEncoder().encode(text);
        var digest = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(digest)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
      }
    } catch (err) {}
    return simpleHash(text);
  }

  function normalizeUsername(value) { return String(value || '').trim().toLowerCase(); }

  function setCurrentUser(email) {
    email = normalizeEmail(email);
    currentUser = email ? (accounts[email] || null) : null;
    if (currentUser) {
      passedRegions = currentUser.passedRegions || {};
      currentUser.passedRegions = passedRegions;
      writeSession(email);
    } else {
      passedRegions = {};
      writeSession('');
    }
    refreshMapStatuses();
    refreshDrawUnlock();
    refreshAccountUI();
    refreshAdminPanel();
  }

  function migrateOldProgressToGuest() {
    // Stary zapis zachowujemy tylko po to, aby nie zniknął użytkownikowi przy aktualizacji strony.
    try {
      var old = JSON.parse(localStorage.getItem(PASSED_KEY) || '{}') || {};
      if (!Object.keys(old).length) old = JSON.parse(localStorage.getItem(OLD_PASSED_KEY) || '{}') || {};
      if (Object.keys(old).length && !currentUser) passedRegions = old;
    } catch (err) {}
  }

  function normalizeEmail(value) { return String(value || '').trim().toLowerCase(); }

  function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

  function isAdmin() {
    if (!currentUser) return false;

    // Główne źródło: rola is_admin z Supabase.
    // Fallback dla głównego konta właściciela Polskify,
    // żeby panel admina był dostępny nawet jeśli profil w bazie
    // nie został jeszcze poprawnie zsynchronizowany.
    var email = normalizeEmail(currentUser.email);
    if (email === 'lmich1406@gmail.com') return true;

    if (backendEnabled()) return !!currentUser.isAdmin;
    return email === ADMIN_EMAIL;
  }

  var BADGES = [
    { id:'first', icon:'★', name:'Pierwszy krok', desc:'Zalicz 1 województwo.' },
    { id:'explorer', icon:'🧭', name:'Odkrywca Polski', desc:'Zalicz 4 województwa.' },
    { id:'half', icon:'◐', name:'Pół Polski', desc:'Zalicz 8 województw.' },
    { id:'all', icon:'🦅', name:'Cała Polska', desc:'Zalicz wszystkie 16 województw.' },
    { id:'perfect', icon:'100', name:'Perfekcja', desc:'Zdobądź 100% w quizie.' },
    { id:'pomorze', icon:'⚓', name:'Mistrz Pomorza', desc:'Zalicz województwo pomorskie.' },
    { id:'cartographer', icon:'⌖', name:'Kartograf', desc:'Osiągnij poziom 5.' },
    { id:'master', icon:'♛', name:'Mistrz Polskify', desc:'Osiągnij poziom 10.' }
  ];

  function localDayKey(date) {
    var d = date || new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function dayDiff(a, b) {
    if (!a || !b) return 999;
    var pa = a.split('-').map(Number);
    var pb = b.split('-').map(Number);
    var da = new Date(pa[0], pa[1]-1, pa[2]);
    var db = new Date(pb[0], pb[1]-1, pb[2]);
    return Math.round((db - da) / 86400000);
  }

  function defaultStreak() {
    return { count:0, best:0, lastDay:'', activeDays:[] };
  }

  function getStreak() {
    var base = defaultStreak();
    if (currentUser) {
      currentUser.streak = Object.assign(base, currentUser.streak || {});
      return currentUser.streak;
    }
    try {
      return Object.assign(base, JSON.parse(localStorage.getItem(GUEST_STREAK_KEY) || '{}'));
    } catch (err) {
      return base;
    }
  }

  function saveStreak(streak) {
    if (currentUser) {
      currentUser.streak = streak;
      accounts[currentUser.email] = currentUser;
      saveAccounts();
    } else {
      try { localStorage.setItem(GUEST_STREAK_KEY, JSON.stringify(streak)); } catch (err) {}
    }
  }

  function updateDailyStreak() {
    var streak = getStreak();
    var today = localDayKey();

    if (streak.lastDay === today) {
      refreshStreakUI();
      return false;
    }

    var diff = dayDiff(streak.lastDay, today);
    if (!streak.lastDay || diff > 1) {
      streak.count = 1;
    } else if (diff === 1) {
      streak.count = Number(streak.count || 0) + 1;
    }

    streak.lastDay = today;
    streak.best = Math.max(Number(streak.best || 0), Number(streak.count || 0));
    streak.activeDays = Array.isArray(streak.activeDays) ? streak.activeDays : [];
    if (streak.activeDays.indexOf(today) === -1) streak.activeDays.push(today);
    if (streak.activeDays.length > 60) streak.activeDays = streak.activeDays.slice(-60);

    saveStreak(streak);
    refreshStreakUI();
    return true;
  }

  function refreshStreakUI() {
    var streak = getStreak();
    var count = Number(streak.count || 0);
    var today = localDayKey();

    // Jeśli użytkownik opuścił co najmniej jeden pełny dzień, pokaż 0 do czasu nowej aktywności.
    if (streak.lastDay && dayDiff(streak.lastDay, today) > 1) count = 0;

    var chip = document.getElementById('streak-count');
    var main = document.getElementById('streak-main-count');
    var text = document.getElementById('streak-main-text');

    if (chip) chip.textContent = count;
    if (main) main.textContent = count;

    if (text) {
      if (streak.lastDay === today) {
        text.textContent = 'Dzisiejsza seria uratowana. Najlepsza: ' + Number(streak.best || count) + ' dni.';
      } else if (count > 0) {
        text.textContent = 'Zrób dziś quiz, żeby utrzymać serię.';
      } else {
        text.textContent = 'Zrób dziś quiz, aby rozpocząć serię.';
      }
    }

    var week = document.getElementById('streak-week');
    if (!week) return;

    var names = ['Nd','Pn','Wt','Śr','Cz','Pt','Sb'];
    var active = Array.isArray(streak.activeDays) ? streak.activeDays : [];
    var parts = [];

    for (var i = 6; i >= 0; i--) {
      var d = new Date();
      d.setHours(12,0,0,0);
      d.setDate(d.getDate() - i);
      var key = localDayKey(d);
      var done = active.indexOf(key) !== -1;
      parts.push(
        '<div class="streak-day">' +
          '<div class="streak-dot ' + (done ? 'done ' : '') + (key === today ? 'today' : '') + '">' +
            (done ? '🔥' : d.getDate()) +
          '</div>' +
          '<span class="streak-day-label">' + names[d.getDay()] + '</span>' +
        '</div>'
      );
    }
    week.innerHTML = parts.join('');
  }


  var LEAGUES = [
    { id:'bronze', name:'Liga Brązowa', emblem:'III', min:0, next:500, nextName:'Liga Srebrna' },
    { id:'silver', name:'Liga Srebrna', emblem:'II', min:500, next:1200, nextName:'Liga Złota' },
    { id:'gold', name:'Liga Złota', emblem:'I', min:1200, next:null, nextName:null }
  ];

  var LEAGUE_RIVALS = [
    'Kuba','Maja','Olek','Zosia','Filip','Lena','Antek','Nina','Bartek'
  ];

  function mondayKey(date) {
    var d = new Date(date || new Date());
    d.setHours(12,0,0,0);
    var day = d.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return localDayKey(d);
  }

  function defaultLeague() {
    return { weeklyXP:0, week:mondayKey(), league:'bronze' };
  }

  function getLeagueState() {
    var base = defaultLeague();
    var state;
    if (currentUser) {
      currentUser.league = Object.assign(base, currentUser.league || {});
      state = currentUser.league;
    } else {
      try {
        state = Object.assign(base, JSON.parse(localStorage.getItem(GUEST_LEAGUE_KEY) || '{}'));
      } catch (err) {
        state = base;
      }
    }

    var nowWeek = mondayKey();
    if (state.week !== nowWeek) {
      state.week = nowWeek;
      state.weeklyXP = 0;
      saveLeagueState(state);
    }
    updateLeagueTier(state);
    return state;
  }

  function saveLeagueState(state) {
    if (currentUser) {
      currentUser.league = state;
      accounts[currentUser.email] = currentUser;
      saveAccounts();
    } else {
      try { localStorage.setItem(GUEST_LEAGUE_KEY, JSON.stringify(state)); } catch (err) {}
    }
  }

  function updateLeagueTier(state) {
    var xp = Number(state.weeklyXP || 0);
    if (xp >= 1200) state.league = 'gold';
    else if (xp >= 500) state.league = 'silver';
    else state.league = 'bronze';
  }

  function currentLeagueInfo(state) {
    var id = state && state.league ? state.league : 'bronze';
    for (var i=0;i<LEAGUES.length;i++) if (LEAGUES[i].id === id) return LEAGUES[i];
    return LEAGUES[0];
  }

  function addLeagueXP(amount) {
    var state = getLeagueState();
    state.weeklyXP = Math.max(0, Number(state.weeklyXP || 0) + Math.max(0, Math.round(amount || 0)));
    updateLeagueTier(state);
    saveLeagueState(state);
    renderLeague();
  }

  function seededNumber(text) {
    var h = 2166136261;
    for (var i=0;i<text.length;i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h >>> 0);
  }

  function rivalXP(name, leagueId, week) {
    var base = leagueId === 'gold' ? 760 : leagueId === 'silver' ? 350 : 120;
    var spread = leagueId === 'gold' ? 900 : leagueId === 'silver' ? 620 : 430;
    var seed = seededNumber(name + leagueId + week);
    return base + (seed % spread);
  }

  function renderLeague() {
    try {
      var board = document.getElementById('leaderboard');
      if (!board) return;

      var state = getLeagueState();
      var info = currentLeagueInfo(state);
      var weeklyXP = Number(state.weeklyXP || 0);

      var nameEl = document.getElementById('league-name');
      var emblemEl = document.getElementById('league-emblem');
      var xpEl = document.getElementById('league-user-xp');
      var labelEl = document.getElementById('league-progress-label');
      var valueEl = document.getElementById('league-progress-value');
      var fillEl = document.getElementById('league-progress-fill');
      var noteEl = document.getElementById('league-note');

      if (nameEl) nameEl.textContent = info.name;
      if (emblemEl) {
        emblemEl.textContent = info.emblem;
        emblemEl.setAttribute('data-league', info.id);
      }
      if (xpEl) xpEl.textContent = weeklyXP + ' XP';

      if (info.next) {
        var local = Math.max(0, weeklyXP - info.min);
        var total = info.next - info.min;
        var pct = Math.max(0, Math.min(100, (local / total) * 100));
        if (labelEl) labelEl.textContent = 'Do ' + info.nextName;
        if (valueEl) valueEl.textContent = weeklyXP + '/' + info.next + ' XP';
        if (fillEl) fillEl.style.width = pct + '%';
        if (noteEl) noteEl.textContent = 'Zdobywaj XP w quizach. Po osiągnięciu ' + info.next + ' XP awansujesz do ' + info.nextName + '.';
      } else {
        if (labelEl) labelEl.textContent = 'Najwyższa liga';
        if (valueEl) valueEl.textContent = weeklyXP + ' XP';
        if (fillEl) fillEl.style.width = '100%';
        if (noteEl) noteEl.textContent = 'Jesteś w najwyższej lidze. Walcz o 1. miejsce w rankingu tygodnia.';
      }
      try { if (typeof renderProfile2 === 'function') renderProfile2(); } catch (e) {}

      var displayName = currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'Ty';
      var rows = [{ name: displayName, xp: weeklyXP, you:true }];

      LEAGUE_RIVALS.forEach(function (name) {
        rows.push({
          name:name,
          xp:rivalXP(name, info.id, state.week),
          you:false
        });
      });

      rows.sort(function(a,b){ return b.xp - a.xp; });

      board.innerHTML = rows.map(function(row, idx) {
        var pos = idx + 1;
        var cls = row.you ? ' you' : '';
        if (pos <= 3) cls += ' promotion';
        return '<div class="leader-row' + cls + '">' +
          '<div class="leader-place">' + (pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : pos) + '</div>' +
          '<div class="leader-avatar">' + escapeHtml(row.name.charAt(0).toUpperCase()) + '</div>' +
          '<div class="leader-name">' + escapeHtml(row.name) + (row.you ? '<span>TY</span>' : '') + '</div>' +
          '<div class="leader-xp">' + row.xp + ' XP</div>' +
        '</div>';
      }).join('');
    } catch (err) {
      console.error('Polskify league render error:', err);
    }

    if (backendEnabled() && currentUser && currentUser.id) {
      window.PolskifyBackend.loadLeaderboard(info.id, state.week).then(function (entries) {
        if (!entries || !entries.length) return;

        var rows = entries.map(function (entry) {
          return {
            name: entry.display_name || 'Gracz',
            xp: Number(entry.weekly_xp || 0),
            you: entry.user_id === currentUser.id
          };
        });

        rows.sort(function (a,b) { return b.xp - a.xp; });

        board.innerHTML = rows.map(function(row, idx) {
          var pos = idx + 1;
          var cls = row.you ? ' you' : '';
          if (pos <= 3) cls += ' promotion';
          return '<div class="leader-row' + cls + '">' +
            '<div class="leader-place">' + (pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : pos) + '</div>' +
            '<div class="leader-avatar">' + escapeHtml(row.name.charAt(0).toUpperCase()) + '</div>' +
            '<div class="leader-name">' + escapeHtml(row.name) + (row.you ? '<span>TY</span>' : '') + '</div>' +
            '<div class="leader-xp">' + row.xp + ' XP</div>' +
          '</div>';
        }).join('');
      }).catch(function (err) {
        console.error('Polskify leaderboard load error:', err);
      });
    }
  }

  function getStats() {
    var base = { quizzes:0, perfect:0, passedQuizStreak:0 };
    if (currentUser) {
      currentUser.stats = Object.assign(base, currentUser.stats || {});
      return currentUser.stats;
    }
    try {
      return Object.assign(base, JSON.parse(localStorage.getItem(GUEST_STATS_KEY) || '{}'));
    } catch (err) {
      return base;
    }
  }

  function saveStats(stats) {
    if (currentUser) {
      currentUser.stats = stats;
      accounts[currentUser.email] = currentUser;
      saveAccounts();
    } else {
      try { localStorage.setItem(GUEST_STATS_KEY, JSON.stringify(stats)); } catch (err) {}
    }
  }

  function badgeEarned(id) {
    var count = passedCount();
    var xp = getXP();
    var stats = getStats();
    if (id === 'first') return count >= 1;
    if (id === 'explorer') return count >= 4;
    if (id === 'half') return count >= 8;
    if (id === 'all') return count >= 16;
    if (id === 'perfect') return Number(stats.perfect || 0) >= 1;
    if (id === 'pomorze') return !!passedRegions.PM;
    if (id === 'cartographer') return xpLevel(xp) >= 5;
    if (id === 'master') return xpLevel(xp) >= 10 && xp >= 450;
    return false;
  }

  function renderBadges(newlyEarned) {
    try {
      var grid = document.getElementById('badges-grid');
      var countEl = document.getElementById('badges-count');
      if (!grid) return;

      newlyEarned = newlyEarned || [];
      var earnedCount = 0;

      grid.innerHTML = BADGES.map(function (badge) {
        var earned = badgeEarned(badge.id);
        if (earned) earnedCount++;
        return '<div class="badge-card ' + (earned ? 'earned' : 'locked') + (newlyEarned.indexOf(badge.id) !== -1 ? ' badge-new' : '') + '">' +
          '<div class="badge-icon">' + badge.icon + '</div>' +
          '<span class="badge-name">' + escapeHtml(badge.name) + '</span>' +
          '<span class="badge-desc">' + escapeHtml(badge.desc) + '</span>' +
          '<span class="badge-state">' + (earned ? 'ZDOBYTA' : 'ZABLOKOWANA') + '</span>' +
        '</div>';
      }).join('');

      if (countEl) countEl.textContent = earnedCount + '/' + BADGES.length;
    } catch (err) {
      console.error('Polskify badge render error:', err);
    }
  }

  function badgeSnapshot() {
    var result = {};
    BADGES.forEach(function (b) { result[b.id] = badgeEarned(b.id); });
    return result;
  }

  function newlyEarnedBadges(before) {
    return BADGES.filter(function (b) {
      return !before[b.id] && badgeEarned(b.id);
    }).map(function (b) { return b.id; });
  }

  function getXP() {
    if (currentUser) return Number(currentUser.xp || 0);
    try { return Number(localStorage.getItem(GUEST_XP_KEY) || 0); } catch (err) { return 0; }
  }

  function saveXP(value) {
    value = Math.max(0, Math.round(Number(value) || 0));
    if (currentUser) {
      currentUser.xp = value;
      accounts[currentUser.email] = currentUser;
      saveAccounts();
    } else {
      try { localStorage.setItem(GUEST_XP_KEY, String(value)); } catch (err) {}
    }
  }

  function addXP(amount) {
    var next = getXP() + Math.max(0, Math.round(amount || 0));
    saveXP(next);
    refreshXPUI();
    renderBadges();
    return next;
  }

  function xpLevel(xp) {
    xp = Math.max(0, Number(xp) || 0);
    for (var i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (xp < LEVEL_THRESHOLDS[i].xp) return LEVEL_THRESHOLDS[i].level;
    }
    return 10;
  }

  function levelName(level) {
    for (var i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (LEVEL_THRESHOLDS[i].level === level) return LEVEL_THRESHOLDS[i].name;
    }
    return 'Odkrywca';
  }

  function nextLevelXP(xp) {
    var level = xpLevel(xp);
    if (level >= 10 && xp >= 450) return null;
    for (var i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (LEVEL_THRESHOLDS[i].level === level) return LEVEL_THRESHOLDS[i].xp;
    }
    return 450;
  }

  function refreshXPUI() {
    var xp = getXP();
    var level = xpLevel(xp);
    var nextXP = nextLevelXP(xp);
    var levelEl = document.getElementById('xp-level');
    var valueEl = document.getElementById('xp-value');

    if (levelEl) levelEl.textContent = 'Poziom ' + level + ' · ' + levelName(level);

    if (valueEl) {
      if (level >= 10 && xp >= 450) {
        valueEl.textContent = xp + ' XP · MAX';
      } else {
        valueEl.textContent = xp + '/' + nextXP + ' XP';
      }
    }
  }

  function refreshAccountUI() {
    refreshXPUI();
    refreshStreakUI();
    renderLeague();
    renderBadges();

    var name = document.getElementById('account-name');
    var sub = document.getElementById('account-sub');
    var open = document.getElementById('account-open');
    var logout = document.getElementById('account-logout');
    var adminOpen = document.getElementById('account-admin-open');

    if (currentUser) {
      if (name) name.textContent = currentUser.displayName || currentUser.email;
      if (sub) sub.textContent = 'Zalogowany · ' + passedCount() + '/16';
      if (open) open.hidden = true;
      if (logout) logout.hidden = false;
      if (adminOpen) adminOpen.hidden = !isAdmin();
    } else {
      if (name) name.textContent = 'Gra jako gość';
      if (sub) sub.textContent = 'Zaloguj się, aby zapisywać postęp.';
      if (open) open.hidden = false;
      if (logout) logout.hidden = true;
      if (adminOpen) adminOpen.hidden = true;
    }
  }

  function refreshAdminXP() {
    var status = document.getElementById('admin-xp-status');
    if (!status) return;
    var xp = getXP();
    var level = xpLevel(xp);
    status.textContent = 'XP: ' + xp + ' · Poziom ' + level + ' · ' + levelName(level) + (xp >= 450 ? ' · MAX' : '');
  }

  function adminLeagueState() {
    var state = getLeagueState();
    updateLeagueTier(state);
    return state;
  }

  function refreshAdminLeague() {
    var status = document.getElementById('admin-league-status');
    if (!status) return;
    var state = adminLeagueState();
    var info = currentLeagueInfo(state);
    status.textContent = 'Tygodniowe XP: ' + Number(state.weeklyXP || 0) + ' · ' + info.name;
  }

  async function adminSetLeagueXP(value) {
    if (!isAdmin()) return;
    var nextValue = Math.max(0, Math.round(Number(value) || 0));

    if (backendEnabled() && currentUser && currentUser.id) {
      try {
        var data = await window.PolskifyBackend.adminSetProtected({ weeklyXP:nextValue });
        currentUser.league = currentUser.league || {};
        currentUser.league.weeklyXP = Number(data.weekly_xp || 0);
        currentUser.league.league = data.league || 'bronze';
        currentUser.league.week = data.week_key || mondayKey();
        accounts[currentUser.email] = currentUser;
        try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch (err) {}
      } catch (err) {
        console.error('Admin league RPC error:', err);
        showToast('<strong>Nie udało się ustawić rankingu.</strong>');
        return;
      }
    } else {
      var state = getLeagueState();
      state.weeklyXP = nextValue;
      updateLeagueTier(state);
      saveLeagueState(state);
    }

    refreshAdminLeague();
    renderLeague();
  }

  function adminSetLeagueTier(id) {
    if (!isAdmin()) return;
    var state = getLeagueState();
    if (id === 'bronze') state.weeklyXP = 0;
    if (id === 'silver') state.weeklyXP = 500;
    if (id === 'gold') state.weeklyXP = 1200;
    updateLeagueTier(state);
    saveLeagueState(state);
    refreshAdminLeague();
    renderLeague();
  }

  function adminResetLeague() {
    if (!isAdmin()) return;
    var state = getLeagueState();
    state.weeklyXP = 0;
    state.week = mondayKey();
    state.league = 'bronze';
    saveLeagueState(state);
    refreshAdminLeague();
    renderLeague();
  }

  function refreshAdminPanel() {
    refreshAdminXP();
    refreshAdminLeague();
    var panel = document.getElementById('admin-panel');
    var list = document.getElementById('admin-regions');
    if (!panel || !list) return;
    if (!isAdmin()) { panel.hidden = true; return; }
    list.innerHTML = Object.keys(REGIONS).map(function (code) {
      var r = REGIONS[code];
      var passed = !!passedRegions[code];
      return '<button class="admin-region ' + (passed ? 'passed' : '') + '" type="button" data-admin-region="' + code + '">' + (passed ? '✓ ' : '○ ') + escapeHtml(r.name) + '</button>';
    }).join('');
  }

  async function adminSetXP(value) {
    if (!isAdmin()) return;
    value = Math.max(0, Math.round(Number(value) || 0));

    if (backendEnabled() && currentUser && currentUser.id) {
      try {
        var data = await window.PolskifyBackend.adminSetProtected({ xp:value });
        currentUser.xp = Number(data.total_xp || value);
        accounts[currentUser.email] = currentUser;
        try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch (err) {}
      } catch (err) {
        console.error('Admin XP RPC error:', err);
        showToast('<strong>Nie udało się ustawić XP.</strong>');
        return;
      }
    } else {
      saveXP(value);
    }

    refreshXPUI();
    refreshAdminXP();
    renderBadges();
  }

  async function adminSetAll(value) {
    if (!isAdmin()) return;
    passedRegions = {};
    if (value) Object.keys(REGIONS).forEach(function (code) { passedRegions[code] = true; });

    if (backendEnabled() && currentUser && currentUser.id) {
      try {
        await window.PolskifyBackend.adminSetProtected({ passedRegions:passedRegions });
      } catch (err) {
        console.error('Admin regions RPC error:', err);
        showToast('<strong>Nie udało się zmienić województw.</strong>');
        return;
      }
    }

    currentUser.passedRegions = passedRegions;
    accounts[currentUser.email] = currentUser;
    try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch (err) {}
    refreshMapStatuses();
    refreshDrawUnlock();
    refreshAccountUI();
    refreshAdminPanel();
    renderBadges();
  }

  function savePassedRegions() {
    try {
      if (currentUser) {
        currentUser.passedRegions = passedRegions;
        accounts[currentUser.email] = currentUser;
        saveAccounts();
      } else {
        localStorage.setItem(PASSED_KEY, JSON.stringify(passedRegions));
      }
    } catch (err) {}
    refreshAccountUI();
  }

  loadAccounts();
  var sessionRaw = readSession();
  if (!sessionRaw) { try { sessionRaw = localStorage.getItem('polskify-session-v1') || ''; } catch (err) {} }
  var sessionUser = normalizeEmail(sessionRaw);
  if (sessionUser && accounts[sessionUser]) setCurrentUser(sessionUser);
  else { migrateOldProgressToGuest(); refreshMapStatuses(); refreshDrawUnlock(); refreshAccountUI(); }
  restoreBackendSession();

  function refreshMapStatuses() {
    document.querySelectorAll('.province-hotspot, .province-shape, .map-region, .region-pick').forEach(function (btn) {
      var code = btn.getAttribute('data-region');
      var passed = !!passedRegions[code];
      btn.classList.toggle('passed', passed);
      var label = (btn.getAttribute('data-name') || btn.textContent || '').replace(/^✓\s*/, '').replace(/\s+✓$/, '');
      if (btn.classList.contains('region-pick')) {
        btn.textContent = label;
      }
      btn.setAttribute('aria-label', label + (passed ? ' — quiz zaliczony' : ''));
    });
  }

  function passedCount() {
    return Object.keys(REGIONS).filter(function (code) { return !!passedRegions[code]; }).length;
  }

  function allRegionsPassed() {
    return passedCount() === Object.keys(REGIONS).length;
  }

  function refreshDrawUnlock() {
    var count = passedCount();
    var total = Object.keys(REGIONS).length;
    var prog = document.getElementById('draw-progress');
    var mapStatus = document.getElementById('modern-map-status');
    var locked = document.getElementById('draw-locked');
    var unlocked = document.getElementById('draw-unlocked');
    if (prog) prog.textContent = count + '/' + total;
    if (mapStatus) mapStatus.textContent = 'Ukończone: ' + count + '/' + total;
    var unlockedNow = allRegionsPassed();
    if (locked) locked.hidden = unlockedNow;
    if (unlocked) unlocked.hidden = !unlockedNow;
    var drawTab = document.getElementById('tab-draw');
    if (drawTab) {
      drawTab.classList.toggle('locked-tab', !unlockedNow);
      drawTab.setAttribute('aria-label', unlockedNow ? 'Narysuj Polskę — odblokowane' : 'Narysuj Polskę — zablokowane');
    }
    var drawLock = document.getElementById('draw-tab-lock');
    if (drawLock) drawLock.textContent = unlockedNow ? '' : '🔒 ';
    refreshDrawBest();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'\"]/g, function (ch) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[ch];
    });
  }

  function segs(activeIdx) {
    return '<div class="segs" aria-hidden="true">' + QUESTIONS.map(function (_, i) {
      var cls = i < results.length ? (results[i] ? 'ok' : 'no') : (i === activeIdx ? 'now' : '');
      return '<span class="seg ' + cls + '"></span>';
    }).join('') + '</div>';
  }

  function explainQuestion(q) {
    // Każde pytanie dostaje opis odnoszący się bezpośrednio do jego treści.
    // Gdy pytanie ma własne pole e, używamy go w pierwszej kolejności.
    if (q.e) return q.e;
    var a = q.a[q.c];
    var t = q.q.toLowerCase();
    var region = currentRegion ? currentRegion.name : 'Polska';

    if (t.indexOf('stolicą') !== -1) return a + ' jest stolicą województwa ' + region + '. To miasto jest siedzibą władz wojewódzkich.';
    if (t.indexOf('z którym morzem') !== -1 || t.indexOf('z jakim morzem') !== -1) return region + ' ma dostęp do Morza Bałtyckiego, dlatego wybrzeże i nadmorskie miejscowości są ważną częścią tego regionu.';
    if (t.indexOf('rzeka') !== -1 || t.indexOf('rzek') !== -1) return a + ' to poprawna odpowiedź. Ta rzeka jest ważnym elementem krajobrazu ' + region + ' i pojawia się w jego geografii oraz historii.';
    if (t.indexOf('park narodowy') !== -1) return a + ' znajduje się w województwie ' + region + ' i chroni cenne przyrodniczo obszary charakterystyczne dla tego regionu.';
    if (t.indexOf('jezior') !== -1) return a + ' jest poprawną odpowiedzią. Ten akwen jest jednym z charakterystycznych elementów krajobrazu ' + region + '.';
    if (t.indexOf('góra') !== -1 || t.indexOf('góry') !== -1 || t.indexOf('szczyt') !== -1 || t.indexOf('pasmo') !== -1) return a + ' jest związane z górskim krajobrazem ' + region + '. Ten obiekt lub pasmo warto zapamiętać jako charakterystyczne dla województwa.';
    if (t.indexOf('wysp') !== -1) return 'Wyspa ' + a + ' jest związana z miejscem wymienionym w pytaniu. To właśnie na tej wyspie znajduje się wskazana miejscowość lub atrakcja.';
    if (t.indexOf('zabytek') !== -1 || t.indexOf('budowla') !== -1 || t.indexOf('zamek') !== -1 || t.indexOf('znajduje się') !== -1) return a + ' jest obiektem lub miejscem związanym z województwem ' + region + '. To jedna z rzeczy, z których ten region jest rozpoznawalny.';
    if (t.indexOf('miasto') !== -1) return a + ' to miasto związane z województwem ' + region + '. Właśnie z tym miejscem wiąże się ciekawostka opisana w pytaniu.';
    if (t.indexOf('znaczy') !== -1 || t.indexOf('gwar') !== -1 || t.indexOf('słowo') !== -1) return '„' + a + '” oznacza poprawną odpowiedź podaną w pytaniu. To słowo jest charakterystyczne dla lokalnego języka lub gwary.';
    if (t.indexOf('słynie') !== -1 || t.indexOf('znane') !== -1 || t.indexOf('kojar') !== -1) return a + ' jest jednym z najbardziej charakterystycznych skojarzeń z ' + region + '. Właśnie dlatego ta odpowiedź pasuje do pytania.';
    if (t.indexOf('znajduje się') !== -1 || t.indexOf('leży') !== -1) return a + ' leży lub znajduje się w miejscu wskazanym w pytaniu. To ważny punkt na mapie województwa ' + region + '.';
    if (t.indexOf('jak nazywa się') !== -1) return 'Poprawna nazwa to „' + a + '”. Jest to obiekt, miejsce albo nazwa charakterystyczna dla ' + region + '.';
    if (t.indexOf('co wyróżnia') !== -1) return a + ' jest cechą wymienioną w pytaniu. To właśnie ten szczegół pomaga rozpoznać wskazaną potrawę, zwyczaj albo atrakcję.';
    if (t.indexOf('co jest') !== -1 || t.indexOf('co to jest') !== -1 || t.indexOf('co znajduje') !== -1) return 'Poprawna odpowiedź to „' + a + '”. Jest to ważna cecha lub obiekt związany z ' + region + '.';
    return 'Poprawna odpowiedź to „' + a + '”. To konkretna ciekawostka związana z województwem ' + region + ', którą warto zapamiętać.';
  }

  function renderQuiz() {
    if (!currentRegion) {
      qEl.innerHTML = '<div class="card-box quiz-empty"><span class="mono">Quiz wojewódzki</span><h2 class="question" style="margin-top:10px">Najpierw wybierz województwo na mapie.</h2><p>Wróć do zakładki Start i kliknij wybrany region.</p></div>';
      return;
    }
    if (qi >= QUESTIONS.length) { renderResult(); return; }
    var q = QUESTIONS[qi];
    answered = false;
    var order = shuffle(q.a.map(function (_, k) { return k; }));
    qEl.innerHTML =
      '<div class="card-box">' +
        '<div class="region-title"><div><span class="mono">' + (quizMode === 'regional' ? 'Quiz wojewódzki' : 'Quiz specjalny') + '</span><h2>' + escapeHtml(currentRegion.name) + '</h2><p class="region-desc">' + escapeHtml(currentRegion.desc) + '</p></div><button class="btn ghost" id="back-map" type="button">← Mapa</button></div>' +
        '<div class="qhead"><span class="mono">Pytanie ' + (qi + 1) + ' z ' + QUESTIONS.length + '</span><span class="mono">Wynik ' + score + '</span></div>' +
        segs(qi) +
        '<h3 class="question" id="q-title" tabindex="-1">' + escapeHtml(q.q) + '</h3>' +
        '<div class="opts">' + order.map(function (k, n) {
          return '<button class="opt" type="button" data-k="' + k + '"><span class="key">' + 'ABCD'.charAt(n) + '</span><span>' + escapeHtml(q.a[k]) + '</span></button>';
        }).join('') + '</div>' +
        '<div class="fb" id="fb" role="status" aria-live="polite"></div>' +
      '</div>';
  }

  async function renderResult() {
    var streakWasNewToday = updateDailyStreak();
    var badgeBefore = badgeSnapshot();
    var percent = Math.round((score / QUESTIONS.length) * 100);
    var passed = percent >= PASS_PERCENT;

    var quizStats = getStats();
    quizStats.quizzes = Number(quizStats.quizzes || 0) + 1;
    if (percent === 100) quizStats.perfect = Number(quizStats.perfect || 0) + 1;
    quizStats.passedQuizStreak = passed ? Number(quizStats.passedQuizStreak || 0) + 1 : 0;
    saveStats(quizStats);

    var xpEarned = (score * 10) + (passed ? 25 : 0);
    var totalXP;

    if (backendEnabled() && currentUser && currentUser.id) {
      try {
        var reward;
        if (secureQuizSession && window.PolskifyBackend.finalizeSecureQuiz) {
          reward = await window.PolskifyBackend.finalizeSecureQuiz(secureQuizSession);
          score = Number(reward.score || score);
          percent = Math.round((score / QUESTIONS.length) * 100);
          passed = percent >= PASS_PERCENT;
        } else {
          reward = quizMode === 'regional'
            ? await window.PolskifyBackend.awardQuizXP(currentRegion.code, score, QUESTIONS.length)
            : await window.PolskifyBackend.awardSpecialQuizXP(currentRegion.code, score, QUESTIONS.length);
        }
        xpEarned = Number(reward.xp_awarded || 0);
        totalXP = Number(reward.total_xp || 0);

        currentUser.xp = totalXP;
        currentUser.league = currentUser.league || {};
        currentUser.league.weeklyXP = Number(reward.weekly_xp || 0);
        currentUser.league.league = reward.league || 'bronze';
        currentUser.league.week = reward.week_key || mondayKey();

        if (reward.region_passed) {
          passedRegions[currentRegion.code] = true;
          currentUser.passedRegions = passedRegions;
        }

        accounts[currentUser.email] = currentUser;
        try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch (err) {}
        refreshXPUI();
        renderLeague();
        refreshMapStatuses();
        refreshDrawUnlock();
      } catch (err) {
        console.error('Secure XP error:', err);
        showToast('<strong>Nie udało się zapisać XP.</strong><br>Sprawdź połączenie z internetem i spróbuj ponownie.');
        totalXP = getXP();
        xpEarned = 0;
      }
    } else {
      totalXP = addXP(xpEarned);
      addLeagueXP(xpEarned);
      if (passed) {
        passedRegions[currentRegion.code] = true;
        savePassedRegions();
        refreshMapStatuses();
        refreshDrawUnlock();
      }
    }

    var newLevel = xpLevel(totalXP);
    var nextXPGoal = nextLevelXP(totalXP);
    var earnedNow = newlyEarnedBadges(badgeBefore);
    renderBadges(earnedNow);
    qEl.innerHTML =
      '<div class="card-box">' +
        '<div class="region-title"><div><span class="mono">Koniec quizu</span><h2>' + escapeHtml(currentRegion.name) + '</h2><p class="region-desc">' + escapeHtml(currentRegion.desc) + '</p></div><button class="btn ghost" id="back-map" type="button">← Mapa</button></div>' +
        segs(-1) +
        '<div class="result-hero-pro ' + (passed ? 'win' : 'lose') + '">' +
          '<div class="result-ring" style="--p:' + percent + '"><div><strong id="q-title" tabindex="-1">' + percent + '%</strong><span>wynik</span></div></div>' +
          '<div class="result-summary-pro"><span class="mono">' + (passed ? 'ŚWIETNA ROBOTA' : 'JESZCZE JEDNA PRÓBA') + '</span><h3>' + score + '/' + QUESTIONS.length + ' poprawnych</h3><p>' + (passed ? 'Quiz zaliczony. XP i postęp zostały zapisane.' : 'Do zaliczenia potrzebujesz co najmniej 50%.') + '</p></div>' +
        '</div>' +
        '<div class="xp-earned"><strong>' + (xpEarned > 0 ? ('+' + xpEarned + ' XP') : '0 XP') + '</strong><span>' + (xpEarned > 0 ? ('Masz teraz ' + totalXP + ' XP · Poziom ' + newLevel + ' · ' + levelName(newLevel) + (nextXPGoal ? ' · następny próg: ' + nextXPGoal + ' XP' : ' · MAX')) : 'Za ten region otrzymałeś już dziś XP. Wynik quizu nadal się liczy.') + '</span></div>' +
        (streakWasNewToday ? '<div class="xp-earned"><strong>🔥 Seria!</strong><span>Dzisiejszy quiz został zaliczony do codziennej serii.</span></div>' : '') +
        (earnedNow.length ? '<div class="xp-earned"><strong>Nowa odznaka!</strong><span>' + earnedNow.map(function(id){ var b = BADGES.find(function(x){return x.id===id;}); return b ? escapeHtml(b.name) : ''; }).join(' · ') + '</span></div>' : '') +
        '<div class="result-status ' + (passed ? 'passed' : 'failed') + '">' +
          '<strong>' + (passed ? '✓ QUIZ ZALICZONY' : '✕ QUIZ NIEZALICZONY') + '</strong>' +
          '<span>' + (passed ? 'Masz co najmniej ' + PASS_PERCENT + '%. Województwo zostaje podświetlone na zielono na mapie.' : 'Do zaliczenia potrzebujesz co najmniej ' + PASS_PERCENT + '%. Spróbuj jeszcze raz!') + '</span>' +
        '</div>' +
        (missed.length ? '<p class="mono" style="margin-top:20px">Do powtórki</p><ul class="missed">' + missed.map(function (m) {
          return '<li><b>' + escapeHtml(m.q) + '</b>Poprawna odpowiedź: ' + escapeHtml(m.a[m.c]) + '</li>';
        }).join('') + '</ul>' : '<p style="margin-top:18px">Wszystkie odpowiedzi były poprawne. 🔥</p>') +
        '<div class="actions"><button class="btn" id="again" type="button">Zagraj jeszcze raz</button></div>' +
      '</div>';

    try {
      window.dispatchEvent(new CustomEvent('polskify:quiz-result', {
        detail: {
          score: score,
          total: QUESTIONS.length,
          percent: percent,
          xpEarned: xpEarned,
          totalXP: totalXP,
          passed: passed,
          regionCode: currentRegion && currentRegion.code ? currentRegion.code : ''
        }
      }));
    } catch (e) {}

  }

  async function startRegionalQuiz(code) {
    quizMode = 'regional';
    currentSpecialKind = null;
    currentRegion = REGIONS[code];
    currentRegion.code = code;
    qi = 0; score = 0; results = []; missed = [];
    secureQuizSession = null;

    if (backendEnabled() && currentUser && currentUser.id && window.PolskifyBackend.startSecureQuiz) {
      try {
        var secure = await window.PolskifyBackend.startSecureQuiz(code);
        secureQuizSession = secure.session_id;
        QUESTIONS = (secure.questions || []).map(function(q){
          return { id:q.id, q:q.q, a:q.a, c:null };
        });
      } catch (err) {
        console.error('Secure quiz start error:', err);
        showToast('<strong>Nie udało się uruchomić bezpiecznego quizu.</strong><br>Uruchamiam tryb lokalny.');
        QUESTIONS = currentRegion.questions.slice();
      }
    } else {
      QUESTIONS = currentRegion.questions.slice();
    }

    show('quiz');
    renderQuiz();
    var t = document.getElementById('q-title'); if (t) t.focus();
  }

  var SPECIAL_QUIZZES = {
    capitals: {name:'Stolice województw', code:'SPECIAL_CAPITALS', questions:[
      {q:'Jakie miasto jest stolicą województwa mazowieckiego?',a:['Warszawa','Radom','Płock','Siedlce'],c:0},
      {q:'Jakie miasto jest stolicą województwa małopolskiego?',a:['Kraków','Tarnów','Nowy Sącz','Zakopane'],c:0},
      {q:'Jakie miasto jest stolicą województwa pomorskiego?',a:['Gdańsk','Gdynia','Sopot','Słupsk'],c:0},
      {q:'Jakie miasto jest stolicą województwa śląskiego?',a:['Katowice','Gliwice','Częstochowa','Bielsko-Biała'],c:0},
      {q:'Jakie miasto jest stolicą województwa podlaskiego?',a:['Białystok','Suwałki','Łomża','Augustów'],c:0},
      {q:'Jakie miasto jest stolicą województwa warmińsko-mazurskiego?',a:['Olsztyn','Elbląg','Ełk','Iława'],c:0},
      {q:'Jakie miasto jest stolicą województwa dolnośląskiego?',a:['Wrocław','Legnica','Wałbrzych','Jelenia Góra'],c:0},
      {q:'Jakie miasto jest stolicą województwa opolskiego?',a:['Opole','Nysa','Brzeg','Kędzierzyn-Koźle'],c:0},
      {q:'Jakie miasto jest stolicą województwa świętokrzyskiego?',a:['Kielce','Sandomierz','Ostrowiec Świętokrzyski','Starachowice'],c:0},
      {q:'Jakie miasto jest stolicą województwa podkarpackiego?',a:['Rzeszów','Przemyśl','Krosno','Mielec'],c:0}
    ]},
    rivers: {name:'Rzeki Polski', code:'SPECIAL_RIVERS', questions:[
      {q:'Jaka jest najdłuższa rzeka Polski?',a:['Wisła','Odra','Warta','Bug'],c:0},
      {q:'Która rzeka przepływa przez Wrocław?',a:['Odra','Wisła','San','Narew'],c:0},
      {q:'Która rzeka przepływa przez Warszawę?',a:['Wisła','Odra','Warta','Noteć'],c:0},
      {q:'Która rzeka przepływa przez Poznań?',a:['Warta','Wisła','Nysa Łużycka','San'],c:0},
      {q:'Która rzeka jest prawym dopływem Wisły i przepływa przez południowo-wschodnią Polskę?',a:['San','Odra','Warta','Bóbr'],c:0},
      {q:'Która rzeka uchodzi do Bałtyku w rejonie Gdańska?',a:['Wisła','Warta','Pilica','Narew'],c:0},
      {q:'Która rzeka stanowi część zachodniej granicy Polski?',a:['Odra','Wisła','Bug','Narew'],c:0},
      {q:'Która rzeka przepływa przez Kraków?',a:['Wisła','Warta','Odra','Bug'],c:0},
      {q:'Która rzeka jest największym dopływem Odry?',a:['Warta','San','Narew','Pilica'],c:0},
      {q:'Która rzeka przepływa przez Toruń?',a:['Wisła','Odra','Warta','San'],c:0}
    ]},
    neighbors: {name:'Sąsiedzi Polski', code:'SPECIAL_NEIGHBORS', questions:[
      {q:'Z którym państwem Polska graniczy na zachodzie?',a:['Niemcy','Litwa','Ukraina','Słowacja'],c:0},
      {q:'Z którym państwem Polska graniczy na południowym zachodzie?',a:['Czechy','Białoruś','Rosja','Litwa'],c:0},
      {q:'Które państwo leży na południe od Polski i ma stolicę w Bratysławie?',a:['Słowacja','Czechy','Ukraina','Litwa'],c:0},
      {q:'Z którym państwem Polska graniczy na północnym wschodzie?',a:['Litwa','Niemcy','Czechy','Słowacja'],c:0},
      {q:'Z którym państwem Polska graniczy na wschodzie i którego stolicą jest Mińsk?',a:['Białoruś','Ukraina','Litwa','Rosja'],c:0},
      {q:'Które państwo graniczy z Polską na południowym wschodzie?',a:['Ukraina','Niemcy','Czechy','Litwa'],c:0},
      {q:'Z jaką częścią Rosji graniczy Polska?',a:['Obwodem kaliningradzkim','Syberią','Kaukazem','Obwodem moskiewskim'],c:0},
      {q:'Ile państw lądowych graniczy z Polską?',a:['7','5','6','8'],c:0},
      {q:'Który sąsiad Polski ma stolicę w Pradze?',a:['Czechy','Słowacja','Litwa','Białoruś'],c:0},
      {q:'Który sąsiad Polski ma stolicę w Wilnie?',a:['Litwa','Ukraina','Niemcy','Słowacja'],c:0}
    ]},
    flags: {name:'Flagi', code:'SPECIAL_FLAGS', questions:[
      {q:'Jakie barwy ma flaga Polski?',a:['Biała i czerwona','Niebieska i biała','Czerwona i żółta','Biała i zielona'],c:0},
      {q:'Która flaga składa się z poziomych pasów: czarnego, czerwonego i złotego?',a:['Niemiec','Polski','Czech','Litwy'],c:0},
      {q:'Która flaga ma biało-czerwone pasy i niebieski trójkąt przy maszcie?',a:['Czech','Słowacji','Ukrainy','Litwy'],c:0},
      {q:'Która flaga ma trzy poziome pasy: biały, niebieski i czerwony?',a:['Rosji','Niemiec','Ukrainy','Polski'],c:0},
      {q:'Która flaga ma dwa poziome pasy: niebieski nad żółtym?',a:['Ukrainy','Litwy','Białorusi','Niemiec'],c:0},
      {q:'Która flaga ma trzy poziome pasy: żółty, zielony i czerwony?',a:['Litwy','Polski','Rosji','Czech'],c:0},
      {q:'Która flaga ma czerwony i zielony pas oraz biało-czerwony ornament przy maszcie?',a:['Białorusi','Ukrainy','Litwy','Niemiec'],c:0},
      {q:'Na której fladze występują biały i czerwony kolor, podobnie jak na fladze Polski, ale z dodatkowym niebieskim elementem?',a:['Czech','Niemiec','Litwy','Ukrainy'],c:0},
      {q:'Który kolor znajduje się na górze flagi Polski?',a:['Biały','Czerwony','Niebieski','Zielony'],c:0},
      {q:'Który kolor znajduje się na dole flagi Polski?',a:['Czerwony','Biały','Żółty','Niebieski'],c:0}
    ]},
    landmarks: {name:'Zabytki Polski', code:'SPECIAL_LANDMARKS', questions:[
      {q:'W jakim mieście znajduje się Zamek Królewski na Wawelu?',a:['Kraków','Warszawa','Gdańsk','Poznań'],c:0},
      {q:'W jakim mieście znajduje się Zamek Krzyżacki wpisany na listę UNESCO?',a:['Malbork','Toruń','Gniezno','Lublin'],c:0},
      {q:'W jakim mieście znajduje się Pałac Kultury i Nauki?',a:['Warszawa','Łódź','Katowice','Wrocław'],c:0},
      {q:'Z jakim miastem kojarzy się zabytkowy Żuraw nad Motławą?',a:['Gdańsk','Szczecin','Gdynia','Elbląg'],c:0},
      {q:'W jakim mieście znajduje się Hala Stulecia?',a:['Wrocław','Opole','Poznań','Kraków'],c:0},
      {q:'W jakim mieście znajduje się Jasna Góra?',a:['Częstochowa','Kielce','Radom','Rzeszów'],c:0},
      {q:'W jakim mieście znajduje się słynny rynek z ratuszem i koziołkami?',a:['Poznań','Lublin','Toruń','Białystok'],c:0},
      {q:'W jakim mieście znajduje się Zamek Książąt Pomorskich?',a:['Szczecin','Gdańsk','Warszawa','Opole'],c:0},
      {q:'Które miasto słynie z gotyckiej starówki i związku z Mikołajem Kopernikiem?',a:['Toruń','Łódź','Kielce','Rzeszów'],c:0},
      {q:'W jakim mieście znajduje się Sukiennice?',a:['Kraków','Warszawa','Wrocław','Lublin'],c:0}
    ]}
  };

  async function startSpecialQuiz(kind) {
    var pack;
    currentSpecialKind = kind;
    if (kind === 'random') {
      pack = {name:'Losowy quiz z całej Polski', code:'SPECIAL_RANDOM', questions:[]};
    } else {
      pack = SPECIAL_QUIZZES[kind];
    }
    if (!pack) return;

    quizMode = kind === 'random' ? 'random' : 'special';
    currentRegion = {name:pack.name, desc:'Quiz specjalny Polskify', code:pack.code};
    qi=0; score=0; results=[]; missed=[];
    secureQuizSession = null;

    if (backendEnabled() && currentUser && currentUser.id && window.PolskifyBackend.startSecureQuiz) {
      try {
        var secure = await window.PolskifyBackend.startSecureQuiz(pack.code);
        secureQuizSession = secure.session_id;
        QUESTIONS = (secure.questions || []).map(function(q){
          return { id:q.id, q:q.q, a:q.a, c:null };
        });
      } catch(err) {
        console.error('Secure special quiz start error:', err);
        if (kind === 'random') {
          var pool = [];
          Object.keys(REGIONS).forEach(function(code){
            REGIONS[code].questions.forEach(function(q){ pool.push({q:q.q,a:q.a.slice(),c:q.c}); });
          });
          QUESTIONS = shuffle(pool).slice(0,10);
        } else {
          QUESTIONS = shuffle(pack.questions).slice(0,10);
        }
      }
    } else {
      if (kind === 'random') {
        var pool2 = [];
        Object.keys(REGIONS).forEach(function(code){
          REGIONS[code].questions.forEach(function(q){ pool2.push({q:q.q,a:q.a.slice(),c:q.c}); });
        });
        QUESTIONS = shuffle(pool2).slice(0,10);
      } else {
        QUESTIONS = shuffle(pack.questions).slice(0,10);
      }
    }

    show('quiz');
    renderQuiz();
  }

  /* ---------- Wyzwanie: narysuj granicę Polski ---------- */
  var drawCanvas = document.getElementById('draw-canvas');
  var drawCtx = drawCanvas ? drawCanvas.getContext('2d') : null;
  var drawing = false, drawPoints = [], drawChecked = false;
  var drawReferenceImage = document.getElementById('draw-reference-image');
  var neighborPreviewMap = document.getElementById('neighbor-preview-map');
  var neighborShapesReady = false;
  var drawBoard = drawCanvas ? drawCanvas.closest('.draw-board') : null;
  var drawPreviewStatus = document.getElementById('draw-preview-status');
  var drawPreviewTimer = null;
  var drawPreviewInterval = null;
  var drawPreviewActive = false;
  var DRAW_BEST_KEY = 'polskify-draw-best-v1';
  var DRAW_THRESHOLD = 50;
  var REFERENCE = [[729.6, 197.3], [731.4, 223.1], [742.3, 245.3], [742.1, 268.5], [718.4, 280.4], [730.6, 307.4], [731.3, 333.3], [751.2, 384.2], [747.0, 400.5], [727.4, 407.3], [691.5, 455.7], [701.7, 481.9], [693.1, 478.5], [655.6, 456.1], [627.2, 464.3], [608.5, 458.4], [585.2, 470.8], [565.3, 450.2], [549.1, 458.1], [546.8, 454.6], [528.7, 425.9], [499.3, 422.4], [495.6, 404.1], [468.5, 397.6], [462.6, 412.7], [441.2, 400.6], [443.6, 384.6], [414.1, 379.5], [395.4, 360.8], [379.2, 323.6], [382.3, 303.5], [372.5, 272.3], [358.2, 251.6], [369.2, 236.0], [360.0, 206.4], [387.0, 189.3], [448.6, 162.3], [498.3, 142.6], [537.7, 152.5], [540.6, 166.7], [578.7, 167.4], [627.3, 174.0], [699.9, 173.2], [720.2, 179.4], [729.6, 197.3]];

  function drawBestKey() {
    var user = currentUser && currentUser.email ? normalizeEmail(currentUser.email) : 'guest';
    return DRAW_BEST_KEY + ':' + user;
  }
  function getDrawBest() {
    try { var v = localStorage.getItem(drawBestKey()); return v ? +v : null; } catch (err) { return null; }
  }
  function setDrawBest(v) {
    try { localStorage.setItem(drawBestKey(), String(v)); } catch (err) {}
  }
  function refreshDrawBest() {
    var el = document.getElementById('draw-best');
    if (!el) return;
    var best = getDrawBest();
    el.textContent = best === null ? 'Najlepszy wynik: —' : 'Najlepszy wynik: ' + best + '%';
  }
  function clearDrawing() {
    if (!drawCtx || !drawCanvas) return;
    drawCtx.clearRect(0,0,drawCanvas.width,drawCanvas.height);
    drawPoints = [];
    drawing = false; drawChecked = false;
    if (drawReferenceImage) drawReferenceImage.classList.remove('show');
    document.querySelectorAll('.neighbor-country.show').forEach(function (el) { el.classList.remove('show'); });
    if (drawBoard) drawBoard.classList.remove('preview-active');
    drawPreviewActive = false;
    clearTimeout(drawPreviewTimer);
    clearInterval(drawPreviewInterval);
    if (drawPreviewStatus) drawPreviewStatus.hidden = true;
    drawCtx.save();
    drawCtx.lineJoin='round'; drawCtx.lineCap='round';
    drawCtx.fillStyle='#0a0c0f'; drawCtx.fillRect(0,0,drawCanvas.width,drawCanvas.height);
    drawCtx.strokeStyle='rgba(255,255,255,.035)'; drawCtx.lineWidth=1;
    for (var x=0;x<drawCanvas.width;x+=45) { drawCtx.beginPath(); drawCtx.moveTo(x,0); drawCtx.lineTo(x,drawCanvas.height); drawCtx.stroke(); }
    for (var y=0;y<drawCanvas.height;y+=45) { drawCtx.beginPath(); drawCtx.moveTo(0,y); drawCtx.lineTo(drawCanvas.width,y); drawCtx.stroke(); }
    drawCtx.fillStyle='rgba(255,255,255,.18)'; drawCtx.font='500 15px IBM Plex Sans, Arial, sans-serif';
    drawCtx.fillText('Narysuj tutaj obrys Polski',450,565);
    drawCtx.restore();
    var result=document.getElementById('draw-result'); if(result){result.hidden=true; result.innerHTML=''; result.className='draw-result';}
  }
  function canvasPoint(e) {
    var r=drawCanvas.getBoundingClientRect();
    return {x:(e.clientX-r.left)*(drawCanvas.width/r.width), y:(e.clientY-r.top)*(drawCanvas.height/r.height)};
  }
  function beginDraw(e) { if (!allRegionsPassed() || drawPreviewActive) return; e.preventDefault(); drawing=true; drawChecked=false; drawPoints=[canvasPoint(e)]; if(drawCanvas.setPointerCapture) drawCanvas.setPointerCapture(e.pointerId); }
  function moveDraw(e) { if(drawPreviewActive || !drawing) return; e.preventDefault(); var p=canvasPoint(e); var last=drawPoints[drawPoints.length-1]; if(Math.hypot(p.x-last.x,p.y-last.y)<3) return; drawPoints.push(p); drawCtx.strokeStyle='#f0b20a'; drawCtx.lineWidth=5; drawCtx.lineJoin='round'; drawCtx.lineCap='round'; drawCtx.beginPath(); drawCtx.moveTo(last.x,last.y); drawCtx.lineTo(p.x,p.y); drawCtx.stroke(); }
  function endDraw(e) { if(!drawing) return; drawing=false; if(drawCanvas.releasePointerCapture){try{drawCanvas.releasePointerCapture(e.pointerId);}catch(err){}} }
  function pointSegDist(p,a,b) {
    var dx=b[0]-a[0], dy=b[1]-a[1]; var len=dx*dx+dy*dy; var t=len ? ((p[0]-a[0])*dx+(p[1]-a[1])*dy)/len : 0; t=Math.max(0,Math.min(1,t)); var x=a[0]+t*dx, y=a[1]+t*dy; return Math.hypot(p[0]-x,p[1]-y);
  }
  function nearestDist(p, path) { var m=Infinity; for(var i=1;i<path.length;i++) m=Math.min(m,pointSegDist(p,path[i-1],path[i])); return m; }
  function samplePath(path, n) {
    if(path.length<2) return []; var lengths=[0], total=0; for(var i=1;i<path.length;i++){ total+=Math.hypot(path[i].x-path[i-1].x,path[i].y-path[i-1].y); lengths.push(total); }
    if(!total) return []; var out=[]; for(var k=0;k<n;k++){ var target=(total*k)/(n-1), j=1; while(j<lengths.length && lengths[j]<target) j++; if(j>=lengths.length) j=lengths.length-1; var prev=lengths[j-1], seg=lengths[j]-prev, t=seg?(target-prev)/seg:0; out.push([path[j-1].x+(path[j].x-path[j-1].x)*t,path[j-1].y+(path[j].y-path[j-1].y)*t]); } return out;
  }
  function referenceScaledPoints() { return REFERENCE.map(function(p){return [p[0],p[1]];}); }
  function scoreDrawing() {
    if(drawPoints.length<12) return null; var user=samplePath(drawPoints,120); if(user.length<20) return null; var ref=referenceScaledPoints();
    var d1=user.reduce(function(sum,p){return sum+nearestDist(p,ref);},0)/user.length; var d2=ref.reduce(function(sum,p){return sum+nearestDist(p,user);},0)/ref.length;
    var avg=(d1+d2)/2; var first=user[0], last=user[user.length-1]; var closure=Math.min(80,Math.hypot(last[0]-first[0],last[1]-first[1]));
    var closePenalty=Math.max(0,closure-18)*0.35;
    var minX=Math.min.apply(null,user.map(function(p){return p[0];})), maxX=Math.max.apply(null,user.map(function(p){return p[0];})); var minY=Math.min.apply(null,user.map(function(p){return p[1];})), maxY=Math.max.apply(null,user.map(function(p){return p[1];}));
    var bbox=(maxX-minX)*(maxY-minY); var refBBox=(671-187)*(493-151); var scalePenalty=Math.min(25,Math.abs(Math.log(Math.max(1,bbox)/refBBox))*7);
    var raw=100-avg*0.62-closePenalty-scalePenalty; return Math.max(0,Math.min(100,Math.round(raw)));
  }
  function previewNeighborForFiveSeconds(country) {
    if (!allRegionsPassed()) return;

    var shape = document.querySelector('.neighbor-country[data-country-shape="' + country + '"]');
    if (!shape) return;

    if (drawing) drawing = false;
    clearTimeout(drawPreviewTimer);
    clearInterval(drawPreviewInterval);

    document.querySelectorAll('.neighbor-country.show').forEach(function (el) {
      el.classList.remove('show');
    });

    drawPreviewActive = true;
    shape.classList.add('show');
    if (drawBoard) drawBoard.classList.add('preview-active');

    var seconds = 5;
    if (drawPreviewStatus) {
      drawPreviewStatus.hidden = false;
      drawPreviewStatus.textContent = 'Podgląd sąsiada: ' + seconds + ' s';
    }

    drawPreviewInterval = setInterval(function () {
      seconds--;
      if (drawPreviewStatus && seconds > 0) {
        drawPreviewStatus.textContent = 'Podgląd sąsiada: ' + seconds + ' s';
      }
    }, 1000);

    drawPreviewTimer = setTimeout(function () {
      clearInterval(drawPreviewInterval);
      drawPreviewActive = false;
      shape.classList.remove('show');
      if (drawBoard) drawBoard.classList.remove('preview-active');
      if (drawPreviewStatus) drawPreviewStatus.hidden = true;
    }, 5000);
  }

  function revealReference() {
    if (drawReferenceImage) drawReferenceImage.classList.add('show');
  }
  function checkDrawing() {
    var score=scoreDrawing(); var result=document.getElementById('draw-result'); if(!result) return;
    if(score===null){ result.hidden=false; result.className='draw-result failed'; result.innerHTML='<strong>Narysuj trochę dokładniej.</strong><small>Obrys powinien mieć co najmniej kilka–kilkanaście punktów. Spróbuj zamknąć granicę wokół Polski.</small>'; return; }
    revealReference(); drawChecked=true; var passed=score>=DRAW_THRESHOLD; var best=getDrawBest(); if(best===null||score>best){setDrawBest(score); best=score; refreshDrawBest();}
    result.hidden=false; result.className='draw-result '+(passed?'passed':'failed'); result.innerHTML='<div class="draw-score">'+score+'%</div><strong>'+ (passed?'✓ GRANICA ROZPOZNANA':'Jeszcze nie — spróbuj ponownie') +'</strong><small>'+ (passed?'Bardzo dobrze! Zielona linia pokazuje prawidłowy obrys do porównania.':'Zielona linia pokazuje prawidłowy obrys. Wyczyść pole i spróbuj jeszcze raz.') +'</small>';
  }
  document.querySelectorAll('.draw-country-hint, .draw-neighbor-label[data-country]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      previewNeighborForFiveSeconds(btn.getAttribute('data-country'));
    });
  });

  if(drawCanvas){
    drawCanvas.addEventListener('pointerdown',beginDraw); drawCanvas.addEventListener('pointermove',moveDraw); drawCanvas.addEventListener('pointerup',endDraw); drawCanvas.addEventListener('pointercancel',endDraw); drawCanvas.addEventListener('pointerleave',endDraw);
    document.getElementById('draw-clear').addEventListener('click',clearDrawing);
    document.getElementById('draw-check').addEventListener('click',checkDrawing);
    clearDrawing();
  }

  document.getElementById('home').addEventListener('click', function (e) {
    var region = e.target.closest('.province-hotspot, .province-shape, .map-region, .region-pick');
    if (region) { startRegionalQuiz(region.getAttribute('data-region')); return; }
  });

  var challengesPanel = document.getElementById('challenges');
  if (challengesPanel) challengesPanel.addEventListener('click', function(e){
    var card = e.target.closest('[data-special]');
    if (card) startSpecialQuiz(card.getAttribute('data-special'));
  });

  qEl.addEventListener('click', async function (e) {
    if (e.target.closest('#back-map')) { show('home'); return; }
    var opt = e.target.closest('.opt');
    if (opt && !answered) {
      answered = true;
      var q = QUESTIONS[qi];
      var k = +opt.getAttribute('data-k');
      var correctIndex = q.c;
      var ok;

      if (secureQuizSession && window.PolskifyBackend && window.PolskifyBackend.submitSecureAnswer) {
        try {
          opt.classList.add('checking');
          var checked = await window.PolskifyBackend.submitSecureAnswer(secureQuizSession, qi, k);
          ok = !!checked.correct;
          correctIndex = Number(checked.correct_index);
          q.c = correctIndex;
        } catch(err) {
          console.error('Secure answer error:', err);
          answered = false;
          opt.classList.remove('checking');
          showToast('<strong>Nie udało się sprawdzić odpowiedzi.</strong><br>Spróbuj jeszcze raz.');
          return;
        }
      } else {
        ok = k === correctIndex;
      }

      results.push(ok);
      if (ok) score++; else missed.push(q);
      qEl.querySelectorAll('.opt').forEach(function (b) {
        var bk = +b.getAttribute('data-k');
        b.disabled = true;
        b.classList.remove('checking');
        if (bk === correctIndex) b.classList.add('correct');
        else if (b === opt) b.classList.add('wrong');
      });
      qEl.querySelectorAll('.seg')[qi].className = 'seg ' + (ok ? 'ok' : 'no');
      var last = qi === QUESTIONS.length - 1;
      document.getElementById('fb').innerHTML =
        '<div class="fb-in"><p class="fb-title">' + (ok ? 'Dobrze! ✓' : 'Nie tym razem') + '</p>' +
        '<p class="fb-answer">Poprawna odpowiedź: <b>' + escapeHtml(q.a[correctIndex]) + '</b></p>' +
        '<div class="fb-explain"><p class="mono fb-label">Dlaczego?</p><p>' + escapeHtml(explainQuestion(q)) + '</p></div>' +
        '<button class="btn" id="next" type="button">' + (last ? 'Zobacz wynik' : 'Dalej') + '</button></div>';
      document.getElementById('next').focus();
      return;
    }
    if (e.target.closest('#next')) {
      qi++;
      renderQuiz();
      var t = document.getElementById('q-title'); if (t) t.focus();
      return;
    }
    if (e.target.closest('#again')) {
      if (secureQuizSession) {
        if (quizMode === 'regional') await startRegionalQuiz(currentRegion.code);
        else await startSpecialQuiz(currentSpecialKind || 'random');
        return;
      }
      qi = 0; score = 0; results = []; missed = [];
      renderQuiz();
      var t2 = document.getElementById('q-title'); if (t2) t2.focus();
    }
  });

  var accountPanel = document.getElementById('account-panel');
  var accountOpen = document.getElementById('account-open');
  var accountAdminOpen = document.getElementById('account-admin-open');
  var accountLogout = document.getElementById('account-logout');
  var accountClose = document.getElementById('account-close');
  var accountSubmit = document.getElementById('account-submit');
  var accountSwitch = document.getElementById('account-switch');
  var accountTitle = document.getElementById('account-form-title');
  var accountMsg = document.getElementById('account-msg');
  var emailInput = document.getElementById('account-email');
  var passwordInput = document.getElementById('account-password');
  var adminPanel = document.getElementById('admin-panel');

  function openAccountPanel(mode) {
    accountMode = mode || 'login';
    if (accountTitle) accountTitle.textContent = accountMode === 'login' ? 'Zaloguj się' : 'Załóż konto';
    if (accountSubmit) accountSubmit.textContent = accountMode === 'login' ? 'Zaloguj się' : 'Utwórz konto';
    if (accountSwitch) accountSwitch.textContent = accountMode === 'login' ? 'Załóż konto' : 'Mam już konto';
    if (accountMsg) {
      accountMsg.className = 'account-msg';
      accountMsg.textContent = backendEnabled()
        ? 'Konto jest zapisywane online. Możesz zalogować się na innym urządzeniu.'
        : 'Tryb lokalny: skonfiguruj Supabase w config.js, aby włączyć prawdziwe konta.';
    }
    if (passwordInput) passwordInput.value = '';
    if (accountPanel) accountPanel.hidden = false;
    if (emailInput) emailInput.focus();
  }

  if (accountOpen) accountOpen.addEventListener('click', function () { openAccountPanel('login'); });
  if (accountAdminOpen) accountAdminOpen.addEventListener('click', function () { if (isAdmin() && adminPanel) { adminPanel.hidden = !adminPanel.hidden; refreshAdminPanel(); } });
  if (accountLogout) accountLogout.addEventListener('click', async function () {
    try {
      if (backendEnabled()) await window.PolskifyBackend.signOut();
    } catch (err) {
      console.error('Polskify sign out error:', err);
    }
    setCurrentUser(null);
  });
  if (accountClose) accountClose.addEventListener('click', function () { if (accountPanel) accountPanel.hidden = true; });
  if (accountSwitch) accountSwitch.addEventListener('click', function () { openAccountPanel(accountMode === 'login' ? 'register' : 'login'); });

  if (accountSubmit) accountSubmit.addEventListener('click', async function () {
    var email = normalizeEmail(emailInput ? emailInput.value : '');
    var password = passwordInput ? passwordInput.value : '';

    try {
      if (accountMsg) {
        accountMsg.className = 'account-msg';
        accountMsg.textContent = 'Sprawdzam dane...';
      }

      if (!validEmail(email)) {
        if (accountMsg) {
          accountMsg.className = 'account-msg error';
          accountMsg.textContent = 'Wpisz poprawny adres e-mail.';
        }
        return;
      }

      if (password.length < 4) {
        if (accountMsg) {
          accountMsg.className = 'account-msg error';
          accountMsg.textContent = 'Hasło musi mieć co najmniej 4 znaki.';
        }
        return;
      }

      if (backendEnabled()) {
        if (accountMode === 'register') {
          var signUpData = await window.PolskifyBackend.signUp(email, password);

          if (!signUpData.session) {
            if (accountMsg) {
              accountMsg.className = 'account-msg';
              accountMsg.textContent = 'Konto utworzone. Sprawdź e-mail i potwierdź rejestrację, a potem się zaloguj.';
            }
            return;
          }

          await activateBackendUser(signUpData.user);
          if (accountPanel) accountPanel.hidden = true;
          return;
        }

        var signInData = await window.PolskifyBackend.signIn(email, password);
        await activateBackendUser(signInData.user);
        if (accountPanel) accountPanel.hidden = true;
        return;
      }

      // Lokalny admin projektu: zawsze napraw/utwórz konto przy poprawnych danych.
      if (email === ADMIN_EMAIL && password === ADMIN_DEFAULT_PASSWORD) {
        await ensureAdminAccount(email, password);
        loadAccounts();
        setCurrentUser(ADMIN_EMAIL);
        if (accountPanel) accountPanel.hidden = true;
        if (accountMsg) accountMsg.textContent = 'Zalogowano jako administrator.';
        return;
      }

      var hash = await hashPassword(password);

      if (accountMode === 'register') {
        if (accounts[email]) {
          if (accountMsg) {
            accountMsg.className = 'account-msg error';
            accountMsg.textContent = 'Konto z tym adresem e-mail już istnieje.';
          }
          return;
        }

        accounts[email] = {
          email: email,
          displayName: email.split('@')[0],
          passwordHash: hash,
          passedRegions: {},
          xp: 0,
          stats: { quizzes:0, perfect:0, passedQuizStreak:0 }, streak: { count:0, best:0, lastDay:'', activeDays:[] }, league: { weeklyXP:0, week:mondayKey(), league:'bronze' }
        };
        saveAccounts();
        setCurrentUser(email);
        if (accountPanel) accountPanel.hidden = true;
        return;
      }

      if (!accounts[email] || accounts[email].passwordHash !== hash) {
        if (accountMsg) {
          accountMsg.className = 'account-msg error';
          accountMsg.textContent = 'Nieprawidłowy e-mail lub hasło.';
        }
        return;
      }

      setCurrentUser(email);
      if (accountPanel) accountPanel.hidden = true;
    } catch (err) {
      console.error('Polskify login error:', err);
      if (accountMsg) {
        accountMsg.className = 'account-msg error';
        accountMsg.textContent = 'Błąd logowania: ' + (err && err.message ? err.message : 'nieznany błąd');
      }
    }
  });


  [emailInput, passwordInput].forEach(function (input) {
    if (!input) return;
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && accountSubmit) accountSubmit.click();
    });
  });

  var adminLeagueXPInput = document.getElementById('admin-league-xp-input');
  var adminLeagueXPSet = document.getElementById('admin-league-xp-set');
  var adminLeagueAdd100 = document.getElementById('admin-league-add100');
  var adminLeagueBronze = document.getElementById('admin-league-bronze');
  var adminLeagueSilver = document.getElementById('admin-league-silver');
  var adminLeagueGold = document.getElementById('admin-league-gold');
  var adminLeagueReset = document.getElementById('admin-league-reset');

  if (adminLeagueXPSet) adminLeagueXPSet.addEventListener('click', function () {
    adminSetLeagueXP(adminLeagueXPInput ? adminLeagueXPInput.value : 0);
  });
  if (adminLeagueAdd100) adminLeagueAdd100.addEventListener('click', function () {
    var state = getLeagueState();
    adminSetLeagueXP(Number(state.weeklyXP || 0) + 100);
  });
  if (adminLeagueBronze) adminLeagueBronze.addEventListener('click', function () {
    adminSetLeagueTier('bronze');
  });
  if (adminLeagueSilver) adminLeagueSilver.addEventListener('click', function () {
    adminSetLeagueTier('silver');
  });
  if (adminLeagueGold) adminLeagueGold.addEventListener('click', function () {
    adminSetLeagueTier('gold');
  });
  if (adminLeagueReset) adminLeagueReset.addEventListener('click', function () {
    adminResetLeague();
    if (adminLeagueXPInput) adminLeagueXPInput.value = '';
  });

  var adminXPInput = document.getElementById('admin-xp-input');
  var adminXPSet = document.getElementById('admin-xp-set');
  var adminXPAdd50 = document.getElementById('admin-xp-add50');
  var adminXPMax = document.getElementById('admin-xp-max');
  var adminXPReset = document.getElementById('admin-xp-reset');

  if (adminXPSet) adminXPSet.addEventListener('click', function () {
    adminSetXP(adminXPInput ? adminXPInput.value : 0);
  });
  if (adminXPAdd50) adminXPAdd50.addEventListener('click', function () {
    adminSetXP(getXP() + 50);
  });
  if (adminXPMax) adminXPMax.addEventListener('click', function () {
    adminSetXP(450);
  });
  if (adminXPReset) adminXPReset.addEventListener('click', function () {
    adminSetXP(0);
    if (adminXPInput) adminXPInput.value = '';
  });

  var adminAll = document.getElementById('admin-all');
  var adminNone = document.getElementById('admin-none');
  var adminClose = document.getElementById('admin-close');
  var adminRegions = document.getElementById('admin-regions');

  if (adminAll) adminAll.addEventListener('click', function () { adminSetAll(true); });
  if (adminNone) adminNone.addEventListener('click', function () { adminSetAll(false); });
  if (adminClose) adminClose.addEventListener('click', function () { if (adminPanel) adminPanel.hidden = true; });
  if (adminRegions) adminRegions.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-admin-region]');
    if (!btn || !isAdmin()) return;
    var code = btn.getAttribute('data-admin-region');
    passedRegions[code] = !passedRegions[code];
    currentUser.passedRegions = passedRegions;
    accounts[currentUser.email] = currentUser;
    saveAccounts();
    refreshMapStatuses();
    refreshDrawUnlock();
    refreshAccountUI();
    refreshAdminPanel();
  });

  refreshMapStatuses();
  refreshDrawUnlock();
  refreshAccountUI();
  refreshAdminPanel();
  renderQuiz();



  // Public read-only bridge for UI modules such as Profile.
  window.PolskifyCore = {
    getXP: function () {
      return getXP();
    },
    getLevel: function () {
      var xp = getXP();
      var level = xpLevel(xp);
      return { xp: xp, level: level, name: levelName(level), next: nextLevelXP(xp) };
    },
    getLeague: function () {
      var state = getLeagueState();
      var info = currentLeagueInfo(state);
      return {
        id: info.id,
        name: info.name,
        weeklyXP: Number(state.weeklyXP || 0),
        week: state.week || mondayKey()
      };
    },
    getPassedCount: function () {
      return passedCount();
    },
    getStreak: function () {
      var s = getStreak();
      return { count:Number(s.count||0), best:Number(s.best||0), lastDay:s.lastDay||'' };
    },
    getBadgeCount: function () {
      return BADGES.filter(function (b) { return badgeEarned(b.id); }).length;
    },
    getRegions: function () {
      var out = {};
      Object.keys(REGIONS).forEach(function(code){
        out[code] = {
          code: code,
          name: REGIONS[code].name,
          desc: REGIONS[code].desc,
          questions: REGIONS[code].questions.slice()
        };
      });
      return out;
    },
    getUser: function () {
      if (!currentUser) return null;
      return {
        id: currentUser.id || '',
        email: currentUser.email || '',
        displayName: currentUser.displayName || '',
        isAdmin: isAdmin()
      };
    }
  };


})();


/* =========================================================
   POLSKIFY 2.0 — PROFILE / QUESTS / SHOP / TOP100 / THEME / PWA
   ========================================================= */
(function(){
  'use strict';

  var META_LOCAL_KEY = 'polskify-meta-v2';
  var metaState = {
    display_name:'',
    avatar:'🇵🇱',
    frame:'basic',
    coins:0,
    owned_items:['frame-basic','avatar-pl'],
    theme:'dark',
    daily_reward_date:'',
    profile_title:'odkrywca',
    daily:{date:'',xp:0,quizzes:0,correct:0},
    lifetime:{quizzes:0,correct:0,best:0}
  };

  var SHOP = [
    {id:'frame-blue',name:'Niebieska ramka',price:80,type:'frame',value:'blue'},
    {id:'frame-gold',name:'Złota ramka',price:160,type:'frame',value:'gold'},
    {id:'frame-green',name:'Leśna ramka',price:120,type:'frame',value:'green'},
    {id:'avatar-eagle',name:'Orzeł',price:100,type:'avatar',value:'🦅'},
    {id:'avatar-map',name:'Mapa',price:70,type:'avatar',value:'🗺️'},
    {id:'avatar-castle',name:'Zamek',price:90,type:'avatar',value:'🏰'},
    {id:'avatar-mountain',name:'Góry',price:90,type:'avatar',value:'⛰️'},
    {id:'avatar-sea',name:'Bałtyk',price:90,type:'avatar',value:'🌊'}
  ];

  function todayKey(){
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  function safeLoadLocalMeta(){
    try {
      var raw = localStorage.getItem(META_LOCAL_KEY);
      if (raw) metaState = Object.assign(metaState, JSON.parse(raw));
    } catch(e){}
  }

  function safeSaveLocalMeta(){
    try { localStorage.setItem(META_LOCAL_KEY, JSON.stringify(metaState)); } catch(e){}
  }

  async function loadMetaState(){
    safeLoadLocalMeta();
    if (typeof backendEnabled === 'function' && backendEnabled() && window.PolskifyBackend) {
      try {
        var remote = await window.PolskifyBackend.loadMeta();
        if (remote) {
          metaState = Object.assign(metaState, {
            display_name: remote.display_name || metaState.display_name,
            avatar: remote.avatar || metaState.avatar,
            frame: remote.frame || metaState.frame,
            coins: Number(remote.coins || 0),
            owned_items: remote.owned_items || metaState.owned_items,
            theme: remote.theme || metaState.theme,
            daily_reward_date: remote.daily_reward_date || '',
            profile_title: remote.profile_title || metaState.profile_title || 'odkrywca',
            daily: remote.daily || metaState.daily,
            lifetime: remote.lifetime || metaState.lifetime
          });
        }
      } catch(err){ console.error('load meta',err); }
    }
    normalizeDaily();
    applyTheme();
    renderProfile2();
    refreshUnlockedTitles();
  }

  async function saveMetaState(){
    safeSaveLocalMeta();
    if (typeof backendEnabled === 'function' && backendEnabled() && window.PolskifyBackend) {
      try {
        await window.PolskifyBackend.saveMeta({
          display_name: metaState.display_name || null,
          avatar: metaState.avatar,
          frame: metaState.frame,
          theme: metaState.theme,
          daily: metaState.daily || {},
          lifetime: metaState.lifetime || {}
        });
      } catch(err){ console.error('save meta',err); }
    }
  }

  function normalizeDaily(){
    var t = todayKey();
    if (!metaState.daily || metaState.daily.date !== t) {
      metaState.daily = {date:t,xp:0,quizzes:0,correct:0};
    }
  }

  function earnedBadgesCount(){
    try {
      return window.PolskifyCore ? window.PolskifyCore.getBadgeCount() : 0;
    } catch(e){ return 0; }
  }

  function frameClass(){
    return 'profile-frame frame-' + (metaState.frame || 'basic');
  }

  function levelLabel(){
    try {
      if (!window.PolskifyCore) return 'Poziom 1';
      var x = window.PolskifyCore.getLevel();
      return 'Poziom ' + x.level + ' · ' + x.name;
    } catch(e){ return 'Poziom 1'; }
  }

  function leagueLabel(){
    try {
      if (!window.PolskifyCore) return 'Liga Brązowa';
      return window.PolskifyCore.getLeague().name || 'Liga Brązowa';
    } catch(e){ return 'Liga Brązowa'; }
  }

  function profileName(){
    if (metaState.display_name) return metaState.display_name;
    try {
      var u = window.PolskifyCore ? window.PolskifyCore.getUser() : null;
      if (u && u.displayName) return u.displayName;
      if (u && u.email) return u.email.split('@')[0];
    } catch(e){}
    return 'Gracz';
  }

  function renderQuests(){
    normalizeDaily();
    var box = document.getElementById('daily-quests');
    if (!box) return;
    var q = [
      {title:'Zdobądź 50 XP',cur:Number(metaState.daily.xp||0),goal:50,reward:10},
      {title:'Ukończ 2 quizy',cur:Number(metaState.daily.quizzes||0),goal:2,reward:15},
      {title:'Odpowiedz poprawnie 8 razy',cur:Number(metaState.daily.correct||0),goal:8,reward:20}
    ];
    box.innerHTML = q.map(function(x){
      var done = x.cur >= x.goal;
      var pct = Math.max(0,Math.min(100,(x.cur/x.goal)*100));
      return '<div class="quest'+(done?' done':'')+'">' +
        '<div><div class="quest-title">'+(done?'✓ ':'')+x.title+'</div><div class="quest-sub">'+Math.min(x.cur,x.goal)+' / '+x.goal+'</div></div>' +
        '<div class="quest-right"><div class="quest-reward">🪙 '+x.reward+'</div><div class="quest-bar"><i style="width:'+pct+'%"></i></div></div>' +
      '</div>';
    }).join('');
  }

  function renderShop(){
    var grid = document.getElementById('shop-grid');
    if (!grid) return;
    var owned = metaState.owned_items || [];
    grid.innerHTML = SHOP.map(function(item){
      var isOwned = owned.indexOf(item.id) >= 0;
      var equipped = (item.type==='frame' && metaState.frame===item.value) || (item.type==='avatar' && metaState.avatar===item.value);
      var preview = item.type==='frame'
        ? '<div class="profile-frame frame-'+item.value+'"><div class="profile-avatar">'+(metaState.avatar||'🇵🇱')+'</div></div>'
        : '<div style="font-size:2.5rem">'+item.value+'</div>';
      return '<div class="shop-item">' +
        '<div class="shop-preview">'+preview+'</div>' +
        '<h4>'+item.name+'</h4>' +
        '<p>'+(isOwned ? (equipped?'Aktualnie używasz':'Kupione') : ('Cena: 🪙 '+item.price))+'</p>' +
        '<button class="btn shop-buy" data-item="'+item.id+'" '+(equipped?'disabled':'')+'>'+(equipped?'Założone':(isOwned?'Użyj':'Kup'))+'</button>' +
      '</div>';
    }).join('');
    grid.querySelectorAll('.shop-buy').forEach(function(btn){
      btn.addEventListener('click', function(){ handleShop(btn.dataset.item); });
    });
  }

  async function handleShop(id){
    var item = SHOP.find(function(x){ return x.id===id; });
    if (!item) return;
    var owned = metaState.owned_items || [];
    var isOwned = owned.indexOf(id)>=0;
    if (!isOwned) {
      if (Number(metaState.coins||0) < item.price) {
        alert('Masz za mało monet.');
        return;
      }
      try {
        if (typeof backendEnabled === 'function' && backendEnabled() && window.PolskifyBackend) {
          var res = await window.PolskifyBackend.buyShopItem(item.id,item.price);
          metaState.coins = Number(res.coins || 0);
          metaState.owned_items = res.owned_items || owned.concat(id);
        } else {
          metaState.coins -= item.price;
          metaState.owned_items = owned.concat(id);
        }
      } catch(err) {
        console.error(err); alert('Nie udało się kupić przedmiotu.'); return;
      }
    }
    if (item.type==='frame') metaState.frame=item.value;
    if (item.type==='avatar') metaState.avatar=item.value;
    await saveMetaState();
    renderProfile2();
  }

  async function claimDaily(){
    var btn = document.getElementById('daily-reward-btn');
    if (!btn) return;
    try {
      if (typeof backendEnabled === 'function' && backendEnabled() && window.PolskifyBackend) {
        var res = await window.PolskifyBackend.claimDailyReward();
        metaState.coins = Number(res.coins || metaState.coins);
        metaState.daily_reward_date = res.reward_date || todayKey();
      } else {
        if (metaState.daily_reward_date === todayKey()) return;
        metaState.coins = Number(metaState.coins||0)+20;
        metaState.daily_reward_date=todayKey();
      }
      await saveMetaState();
      renderProfile2();
    } catch(err){ console.error(err); alert('Nie udało się odebrać nagrody.'); }
  }


  var PROFILE_TITLES = {
    odkrywca:{name:'Odkrywca',icon:'🧭',cls:'title-odkrywca',desc:'Podstawowy tytuł każdego gracza.'},
    kartograf:{name:'Kartograf',icon:'🗺️',cls:'title-kartograf',desc:'Osiągnij co najmniej 230 XP.'},
    mistrz_wojewodztw:{name:'Mistrz Województw',icon:'🏆',cls:'title-mistrz',desc:'Zalicz wszystkie 16 województw.'},
    zloty_gracz:{name:'Złoty Gracz',icon:'🥇',cls:'title-zloty',desc:'Awansuj do Ligi Złotej.'},
    straznik_serii:{name:'Strażnik Serii',icon:'🔥',cls:'title-seria',desc:'Osiągnij serię co najmniej 7 dni.'},
    mistrz_polskify:{name:'Mistrz Polskify',icon:'👑',cls:'title-polskify',desc:'Osiągnij 450 XP.'},
    legenda_polski:{name:'Legenda Polski',icon:'⚡',cls:'title-legenda',desc:'Poziom MAX, Cała Polska i Liga Złota.'},
    administrator:{name:'Administrator',icon:'🛡️',cls:'title-admin',desc:'Specjalny tytuł administratora.'}
  };

  var unlockedProfileTitles = ['odkrywca'];

  function titleInfo(id){
    return PROFILE_TITLES[id] || PROFILE_TITLES.odkrywca;
  }

  async function refreshUnlockedTitles(){
    // Najpierw wyliczamy tytuły bezpośrednio z aktualnego stanu aplikacji.
    // Dzięki temu UI działa nawet jeśli RPC chwilowo nie zwróci listy.
    var unlocked = ['odkrywca'];

    try {
      if (window.PolskifyCore) {
        var lvl = window.PolskifyCore.getLevel();
        var league = window.PolskifyCore.getLeague();
        var passed = Number(window.PolskifyCore.getPassedCount() || 0);
        var streak = window.PolskifyCore.getStreak();
        var user = window.PolskifyCore.getUser();

        var xp = Number((lvl && lvl.xp) || 0);
        var leagueId = league && league.id ? league.id : '';
        var bestStreak = Number((streak && streak.best) || 0);

        if (xp >= 230) unlocked.push('kartograf');
        if (passed >= 16) unlocked.push('mistrz_wojewodztw');
        if (leagueId === 'gold') unlocked.push('zloty_gracz');
        if (bestStreak >= 7) unlocked.push('straznik_serii');
        if (xp >= 450) unlocked.push('mistrz_polskify');
        if (xp >= 450 && passed >= 16 && leagueId === 'gold') unlocked.push('legenda_polski');
        if (user && user.isAdmin) unlocked.push('administrator');
      }
    } catch(err) {
      console.error('local titles calc', err);
    }

    // Supabase może dorzucić/zweryfikować listę, ale nie blokuje już interfejsu.
    if (typeof backendEnabled === 'function' && backendEnabled() && window.PolskifyBackend && window.PolskifyBackend.getUnlockedTitles) {
      try {
        var list = await window.PolskifyBackend.getUnlockedTitles();
        if (Array.isArray(list)) {
          list.forEach(function(id){
            if (unlocked.indexOf(id) < 0) unlocked.push(id);
          });
        }
      } catch(err) {
        console.error('titles load', err);
      }
    }

    unlockedProfileTitles = unlocked;

    if (unlockedProfileTitles.indexOf(metaState.profile_title) < 0) {
      metaState.profile_title = 'odkrywca';
    }

    renderTitles();
    renderProfileTitleChip();
  }

  function renderProfileTitleChip(){
    var el=document.getElementById('profile-title-chip');
    if(!el)return;
    var info=titleInfo(metaState.profile_title);
    el.className='profile-title-chip '+info.cls;
    el.textContent=info.icon+' '+info.name;
  }

  function renderTitles(){
    var box=document.getElementById('title-picker'); if(!box)return;
    box.innerHTML=Object.keys(PROFILE_TITLES).map(function(id){
      var t=PROFILE_TITLES[id];
      var unlocked=unlockedProfileTitles.indexOf(id)>=0;
      var selected=metaState.profile_title===id;
      return '<button class="title-option '+t.cls+(selected?' selected':'')+(unlocked?'':' locked')+'" data-title="'+id+'" '+(unlocked?'':'disabled')+'>'+
        '<span class="title-option-icon">'+t.icon+'</span><span><b>'+t.name+'</b><small>'+t.desc+'</small></span>'+
        '<em>'+(selected?'Wybrany':(unlocked?'Odblokowany':'🔒'))+'</em></button>';
    }).join('');
  }

  async function selectProfileTitle(id){
    if(unlockedProfileTitles.indexOf(id)<0)return;
    try{
      if(typeof backendEnabled==='function' && backendEnabled() && window.PolskifyBackend.setProfileTitle){
        var r=await window.PolskifyBackend.setProfileTitle(id);
        metaState.profile_title=(r && r.profile_title) ? r.profile_title : id;
      }else{
        metaState.profile_title=id;
      }
      safeSaveLocalMeta();
      if(window.PolskifyProfileReload) await window.PolskifyProfileReload();
      else {
        renderTitles();
        renderProfileTitleChip();
      }
    }catch(err){ console.error(err); alert('Nie udało się ustawić tytułu.'); }
  }

  function renderProfile2(){
    normalizeDaily();
    var name = document.getElementById('profile-name');
    if (!name) return;
    name.textContent = profileName();
    document.getElementById('profile-avatar').textContent = metaState.avatar || '🇵🇱';
    document.getElementById('profile-frame').className = frameClass();
    document.getElementById('profile-level-chip').textContent = levelLabel();
    document.getElementById('profile-league-chip').textContent = leagueLabel();
    document.getElementById('profile-coins-chip').textContent = '🪙 ' + Number(metaState.coins||0);
    renderProfileTitleChip();
    document.getElementById('shop-coins').textContent = '🪙 ' + Number(metaState.coins||0);

    try {
      document.getElementById('profile-completed').textContent =
        (window.PolskifyCore ? window.PolskifyCore.getPassedCount() : 0) + '/16';
    } catch(e){}
    try {
      document.getElementById('profile-streak').textContent =
        window.PolskifyCore ? (window.PolskifyCore.getStreak().count || 0) : 0;
    } catch(e){}
    document.getElementById('profile-badges').textContent = earnedBadgesCount();
    document.getElementById('profile-quizzes').textContent = Number((metaState.lifetime||{}).quizzes||0);
    document.getElementById('profile-correct').textContent = Number((metaState.lifetime||{}).correct||0);
    document.getElementById('profile-best').textContent = Number((metaState.lifetime||{}).best||0) + '%';

    var dailyBtn = document.getElementById('daily-reward-btn');
    if (dailyBtn) {
      var claimed = metaState.daily_reward_date === todayKey();
      dailyBtn.disabled = claimed;
      dailyBtn.textContent = claimed ? 'Odebrane dzisiaj ✓' : 'Odbierz +20 monet';
    }
    renderQuests();
    renderShop();
    renderTitles();
  }


  window.PolskifyProfileCoins = {
    get:function(){ return Number(metaState.coins||0); },
    setLocal:function(v){ metaState.coins=Math.max(0,Math.round(Number(v)||0)); safeSaveLocalMeta(); renderProfile2(); },
    refreshTitles:refreshUnlockedTitles
  };

  window.PolskifyProfileReload = async function(){
    await loadMetaState();
    return Number(metaState.coins || 0);
  };

  window.PolskifyProfileRender = renderProfile2;

  function applyTheme(){
    document.body.dataset.theme = metaState.theme || 'dark';
  }

  function setTheme(v){
    metaState.theme = v;
    applyTheme();
    saveMetaState();
  }

  async function editNickname(){
    var next = prompt('Wpisz nowy nick:', profileName());
    if (!next) return;
    next = next.trim().slice(0,24);
    if (!next) return;
    metaState.display_name = next;
    await saveMetaState();
    renderProfile2();
  }

  function cycleAvatar(){
    var free = ['🇵🇱','🧭','📚','🗺️'];
    var owned = SHOP.filter(function(i){ return i.type==='avatar' && (metaState.owned_items||[]).indexOf(i.id)>=0; }).map(function(i){ return i.value; });
    var all = free.concat(owned.filter(function(v){ return free.indexOf(v)<0; }));
    var idx = all.indexOf(metaState.avatar);
    metaState.avatar = all[(idx+1+all.length)%all.length];
    saveMetaState();
    renderProfile2();
  }

  // Hook new Profile tab into existing app navigation.
  function wireProfileTab(){
    // Profil jest częścią głównego systemu VIEWS.
  }


  // Add Top100 filters to the existing ranking.
  function installLeaderboardFilters(){
    var card = document.querySelector('#ranking .league-card');
    if (!card || card.querySelector('.league-filter')) return;
    var filter = document.createElement('div');
    filter.className='league-filter';
    filter.innerHTML='<button class="active" data-l="all">Top 100</button><button data-l="bronze">Brązowa</button><button data-l="silver">Srebrna</button><button data-l="gold">Złota</button>';
    var board = card.querySelector('.leaderboard');
    if (board) card.insertBefore(filter, board);
    filter.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click', async function(){
        filter.querySelectorAll('button').forEach(function(x){x.classList.remove('active')});
        b.classList.add('active');
        await renderTop100(b.dataset.l);
      });
    });
  }

  async function renderTop100(leagueId){
    var board = document.querySelector('#ranking .leaderboard');
    if (!board || !window.PolskifyBackend || !(typeof backendEnabled==='function' && backendEnabled())) return;
    try {
      var rows = await window.PolskifyBackend.loadTop100(leagueId);
      board.innerHTML = rows.map(function(row,idx){
        var pos=idx+1;
        var you=false;
        try{
          var coreUser = window.PolskifyCore ? window.PolskifyCore.getUser() : null;
          you = !!(coreUser && row.user_id === coreUser.id);
        }catch(e){}
        return '<div class="leader-row'+(you?' you':'')+'">' +
          '<div class="leader-place">'+(pos===1?'🥇':pos===2?'🥈':pos===3?'🥉':pos)+'</div>' +
          '<div class="leader-avatar">'+((row.display_name||'G').charAt(0).toUpperCase())+'</div>' +
          '<div class="leader-name">'+(row.display_name||'Gracz')+(you?'<span>TY</span>':'')+'</div>' +
          '<div class="leader-xp">'+Number(row.weekly_xp||0)+' XP</div>' +
        '</div>';
      }).join('') || '<div style="padding:20px;color:#91a3b6">Brak graczy w tej lidze.</div>';
    } catch(err){ console.error('top100',err); }
  }

  // Track daily and lifetime stats after each finished quiz by observing results screen changes.
  function installResultObserver(){
    window.addEventListener('polskify:quiz-result', function(ev){
      var d = ev.detail || {};
      normalizeDaily();

      metaState.daily.quizzes = Number(metaState.daily.quizzes || 0) + 1;
      metaState.daily.correct = Number(metaState.daily.correct || 0) + Number(d.score || 0);
      metaState.daily.xp = Number(metaState.daily.xp || 0) + Number(d.xpEarned || 0);

      metaState.lifetime = metaState.lifetime || {};
      metaState.lifetime.quizzes = Number(metaState.lifetime.quizzes || 0) + 1;
      metaState.lifetime.correct = Number(metaState.lifetime.correct || 0) + Number(d.score || 0);
      metaState.lifetime.best = Math.max(Number(metaState.lifetime.best || 0), Number(d.percent || 0));

      saveMetaState();
      renderProfile2();
    });
  }

  function installPWA(){
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function(){
        navigator.serviceWorker.register('./sw.js').catch(function(err){ console.warn('SW',err); });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    wireProfileTab();
    installLeaderboardFilters();
    installResultObserver();
    installPWA();

    var titleBox=document.getElementById('title-picker');
    if(titleBox) titleBox.addEventListener('click',function(ev){
      var b=ev.target.closest('[data-title]'); if(b) selectProfileTitle(b.dataset.title);
    });
    var titleChange=document.getElementById('profile-title-change');
    if(titleChange) titleChange.addEventListener('click',async function(){
      await refreshUnlockedTitles();
      var box=document.getElementById('title-picker'); if(box) box.scrollIntoView({behavior:'smooth',block:'center'});
    });
    var e=document.getElementById('profile-edit-name'); if(e)e.addEventListener('click',editNickname);
    e=document.getElementById('profile-avatar-change'); if(e)e.addEventListener('click',cycleAvatar);
    e=document.getElementById('daily-reward-btn'); if(e)e.addEventListener('click',claimDaily);
    e=document.getElementById('theme-dark'); if(e)e.addEventListener('click',function(){setTheme('dark')});
    e=document.getElementById('theme-light'); if(e)e.addEventListener('click',function(){setTheme('light')});

    loadMetaState();
  });

})();


/* ===== POLSKIFY 3.0 FEATURES ===== */
(function(){
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]}); }

  function renderStudy(){
    if (!window.PolskifyCore) return;
    var regions = window.PolskifyCore.getRegions();
    var list = document.getElementById('study-region-list');
    if (!list) return;
    list.innerHTML = Object.keys(regions).map(function(code){
      return '<button class="study-region-btn" data-study="'+code+'">'+esc(regions[code].name)+'</button>';
    }).join('');
  }

  function openStudy(code){
    var regions = window.PolskifyCore.getRegions();
    var r = regions[code]; if(!r) return;
    var facts = r.questions.slice(0,5).map(function(q){return q.a[q.c];});
    var card = document.getElementById('study-card');
    card.innerHTML =
      '<span class="mono">KARTA NAUKI</span><h2>'+esc(r.name)+'</h2><p class="study-desc">'+esc(r.desc)+'</p>'+
      '<div class="study-facts">'+facts.map(function(x,i){return '<div><b>'+(i+1)+'.</b><span>'+esc(x)+'</span></div>';}).join('')+'</div>'+
      '<button class="btn" data-study-start="'+code+'">Rozpocznij quiz z tego regionu</button>';
  }

  var learn = document.getElementById('learn');
  if (learn) learn.addEventListener('click',function(e){
    var b=e.target.closest('[data-study]'); if(b){openStudy(b.dataset.study);return;}
    var s=e.target.closest('[data-study-start]');
    if(s){
      var home=document.querySelector('[data-region="'+s.dataset.study+'"]');
      if(home) home.click();
    }
  });

  async function renderSeason(){
    var box=document.getElementById('season-banner');
    if(!box || !window.PolskifyBackend) return;
    try{
      var s=await window.PolskifyBackend.loadSeason();
      if(!s) return;
      box.innerHTML='<span>SEZON</span><strong>'+esc(s.name)+'</strong><small>'+Number(s.points||0)+' pkt · do '+esc(s.ends_at||'')+'</small>';
    }catch(e){console.error(e);}
  }

  async function renderAdminUsers(){
    var box=document.getElementById('admin-users-v2'); if(!box) return;
    box.innerHTML='<p class="admin-note">Ładowanie użytkowników…</p>';
    try{
      var users=await window.PolskifyBackend.adminListUsers();
      box.innerHTML=users.map(function(u){
        return '<div class="admin-user-row">'+
          '<div><b>'+esc(u.email)+'</b><small>XP '+Number(u.xp||0)+' · 🪙 '+Number(u.coins||0)+' · streak '+Number(u.streak_count||0)+(u.banned?' · ZBANOWANY':'')+'</small></div>'+
          '<div class="admin-user-actions">'+
            '<button data-admin-action="setxp" data-user="'+u.user_id+'">XP</button>'+
            '<button data-admin-action="setcoins" data-user="'+u.user_id+'">🪙 Coins</button>'+
            '<button data-admin-action="resetstreak" data-user="'+u.user_id+'">Reset serii</button>'+
            '<button data-admin-action="'+(u.banned?'unban':'ban')+'" data-user="'+u.user_id+'">'+(u.banned?'Odbanuj':'Ban')+'</button>'+
          '</div></div>';
      }).join('') || '<p class="admin-note">Brak użytkowników.</p>';
    }catch(e){ box.innerHTML='<p class="admin-note">Błąd: '+esc(e.message)+'</p>'; }
  }

  var refresh=document.getElementById('admin-users-refresh');
  if(refresh) refresh.addEventListener('click',renderAdminUsers);
  var adminBox=document.getElementById('admin-users-v2');
  if(adminBox) adminBox.addEventListener('click',async function(e){
    var b=e.target.closest('[data-admin-action]'); if(!b)return;
    var action=b.dataset.adminAction, value=null;
    if(action==='setxp'){ value=prompt('Nowe XP:'); if(value===null)return; }
    if(action==='setcoins'){ value=prompt('Nowa liczba monet:'); if(value===null)return; }
    try{ await window.PolskifyBackend.adminUserAction(b.dataset.user,action,value); await renderAdminUsers(); }
    catch(err){ alert('Błąd: '+err.message); }
  });


  async function syncAdminCoinsUI(){
    var coins = 0;
    try {
      if (window.PolskifyProfileReload) coins = await window.PolskifyProfileReload();
      else if (window.PolskifyProfileCoins) coins = window.PolskifyProfileCoins.get();
    } catch(e) { console.error('coin sync', e); }

    var s=document.getElementById('admin-coins-status');
    var i=document.getElementById('admin-coins-input');
    if(s)s.textContent='🪙 '+Number(coins||0);
    if(i)i.value=Number(coins||0);
    return Number(coins||0);
  }

  async function setAdminOwnCoins(value){
    value=Math.max(0,Math.round(Number(value)||0));
    try{
      var coins = await window.PolskifyBackend.adminSetMyCoins(value);
      if(window.PolskifyProfileCoins) window.PolskifyProfileCoins.setLocal(coins);
      await syncAdminCoinsUI();
    }catch(err){
      console.error(err);
      alert('Nie udało się ustawić monet: '+err.message);
    }
  }

  async function addAdminOwnCoins(delta){
    try{
      var coins = await window.PolskifyBackend.adminAddMyCoins(delta);
      if(window.PolskifyProfileCoins) window.PolskifyProfileCoins.setLocal(coins);
      await syncAdminCoinsUI();
    }catch(err){
      console.error(err);
      alert('Nie udało się dodać monet: '+err.message);
    }
  }

  var coinSet=document.getElementById('admin-coins-set');
  if(coinSet)coinSet.addEventListener('click',function(){setAdminOwnCoins(document.getElementById('admin-coins-input').value);});
  var coin100=document.getElementById('admin-coins-add100');
  if(coin100)coin100.addEventListener('click',function(){addAdminOwnCoins(100);});
  var coin1000=document.getElementById('admin-coins-add1000');
  if(coin1000)coin1000.addEventListener('click',function(){addAdminOwnCoins(1000);});
  var coinReset=document.getElementById('admin-coins-reset');
  if(coinReset)coinReset.addEventListener('click',function(){setAdminOwnCoins(0);});

  async function enableNotifications(){
    if(!('Notification' in window)){alert('Ta przeglądarka nie obsługuje powiadomień.');return;}
    var p=await Notification.requestPermission();
    if(p==='granted'){
      localStorage.setItem('polskify-reminders','1');
      new Notification('Polskify',{body:'Przypomnienia o serii są włączone 🔥'});
    }
  }
  var notify=document.getElementById('notify-enable');
  if(notify) notify.addEventListener('click',enableNotifications);

  function streakReminder(){
    if(localStorage.getItem('polskify-reminders')!=='1' || Notification.permission!=='granted') return;
    var h=new Date().getHours();
    if(h>=18 && h<=21 && sessionStorage.getItem('polskify-reminded')!=='1'){
      sessionStorage.setItem('polskify-reminded','1');
      try{ new Notification('Nie trać serii 🔥',{body:'Zrób dziś jeden quiz w Polskify.'}); }catch(e){}
    }
  }

  document.addEventListener('DOMContentLoaded',function(){
    renderStudy(); renderSeason(); streakReminder(); syncAdminCoinsUI();
  });
  window.addEventListener('polskify:quiz-result',renderSeason);
  window.addEventListener('polskify:quiz-result',function(){ if(window.PolskifyProfileCoins && window.PolskifyProfileCoins.refreshTitles) window.PolskifyProfileCoins.refreshTitles(); });
})();
