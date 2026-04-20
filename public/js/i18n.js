/**
 * MollAI i18n — RU ⇄ RO
 *
 * Подход: словарь точных строк (после trim) RU → RO.
 * Движок обходит текстовые ноды + атрибуты placeholder/title/alt/value
 * и заменяет совпадения, не трогая разметку.
 *
 * Применяется:
 *  - на старте, если в localStorage уже выбран `ro`
 *  - при клике по плавающей кнопке
 *  - после каждой навигации/реренда (через MutationObserver на body)
 */
(function () {
  if (window.__MOLLAI_I18N__) return;
  window.__MOLLAI_I18N__ = true;

  const LS_KEY = 'mollai_lang';

  // ── Dictionary RU → RO ────────────────────────────────────────────────
  // Ключи — это видимый русский текст (после trim, без переносов строк
  // в начале/конце). Длинные значения переносим как обычные строки.
  const DICT = {
    // ===== Nav / Footer =====
    'Главная': 'Acasă',
    'Блог': 'Blog',
    'Портфолио': 'Portofoliu',
    'Цены': 'Prețuri',
    'Магазин': 'Magazin',
    'О нас': 'Despre noi',
    'Консультация': 'Consultație',
    '© 2026 MollAI. Все права защищены.': '© 2026 MollAI. Toate drepturile rezervate.',
    'Политика конфиденциальности': 'Politica de confidențialitate',

    // ===== Home: Hero =====
    'Web Studio': 'Web Studio',
    'AI-решения,': 'Soluții AI,',
    'которые': 'care',
    'развивают': 'dezvoltă',
    'строят': 'construiesc',
    'ускоряют': 'accelerează',
    'ваш': 'afacerea',
    'бизнес': 'ta',
    'Премиальные сайты. Умные боты. Автоматизация процессов. Всё под ключ - без головной боли.':
      'Site-uri premium. Boți inteligenți. Automatizarea proceselor. Totul la cheie — fără bătăi de cap.',
    'Посмотреть цены\n                            →': 'Vezi prețurile →',
    'Посмотреть цены →': 'Vezi prețurile →',
    '✱\n                            Записаться на консультацию': '✱ Rezervă o consultație',
    '✱ Записаться на консультацию': '✱ Rezervă o consultație',
    'Записаться на консультацию': 'Rezervă o consultație',

    // ===== Home: Services =====
    'Услуги': 'Servicii',
    'Наши услуги': 'Serviciile noastre',
    'Полный стек цифровых решений для современного бизнеса':
      'Stack complet de soluții digitale pentru afaceri moderne',

    'Премиальные сайты': 'Site-uri premium',
    'Сайт — это ваша витрина 24/7. Мы создаём полноценные инструменты продаж, проектируемые с нуля без шаблонов.':
      'Site-ul este vitrina ta 24/7. Construim instrumente reale de vânzare, proiectate de la zero, fără șabloane.',
    'Уникальный\n                                    дизайн': 'Design unic',
    'Уникальный дизайн': 'Design unic',
    'Адаптивность\n                                    (Mobile First)': 'Adaptiv (Mobile First)',
    'Адаптивность (Mobile First)': 'Adaptiv (Mobile First)',
    'SEO-подготовка': 'Pregătire SEO',

    'AI-боты и ассистенты': 'Boți și asistenți AI',
    'Чат-боты, которые работают за вас: отвечают клиентам, квалифицируют лиды и записывают на встречи 24/7.':
      'Chatboți care lucrează pentru tine: răspund clienților, califică lead-urile și programează întâlniri 24/7.',
    'Обучен на\n                                    ваших данных': 'Antrenat pe datele tale',
    'Обучен на ваших данных': 'Antrenat pe datele tale',
    'Интеграция с\n                                    мессенджерами': 'Integrare cu mesagerii',
    'Интеграция с мессенджерами': 'Integrare cu mesagerii',
    'Автономная\n                                    квалификация': 'Calificare autonomă',
    'Автономная квалификация': 'Calificare autonomă',

    'Бизнес-автоматизация': 'Automatizare de business',
    'Связываем ваши инструменты в единую экосистему: Заявка → CRM → Уведомление. Без ручной работы.':
      'Conectăm instrumentele tale într-un ecosistem unic: Cerere → CRM → Notificare. Fără muncă manuală.',
    'Автоматизация\n                                    n8n': 'Automatizare n8n',
    'Автоматизация n8n': 'Automatizare n8n',
    'Синхронизация\n                                    CRM': 'Sincronizare CRM',
    'Синхронизация CRM': 'Sincronizare CRM',
    'Умные\n                                    уведомления': 'Notificări inteligente',
    'Умные уведомления': 'Notificări inteligente',

    'AI-контент и Продвижение': 'Conținut AI și Promovare',
    'Наполняем ваш сайт смыслом и приводим клиентов. От контент-стратегии до настройки Google / FB Ads.':
      'Umplem site-ul cu sens și aducem clienți. De la strategie de conținut până la Google / FB Ads.',
    'Генерация\n                                    статей через AI': 'Generare de articole prin AI',
    'Генерация статей через AI': 'Generare de articole prin AI',
    'Настройка\n                                    контекстной рекламы': 'Configurare reclamă contextuală',
    'Настройка контекстной рекламы': 'Configurare reclamă contextuală',
    'Аналитика\n                                    окупаемости (ROI)': 'Analiză de rentabilitate (ROI)',
    'Аналитика окупаемости (ROI)': 'Analiză de rentabilitate (ROI)',

    // ===== Home: Process =====
    'Как это работает': 'Cum funcționează',
    'Три шага к результату': 'Trei pași până la rezultat',
    'Консультация': 'Consultație',
    'Бесплатно обсуждаем ваши процессы и находим точки роста':
      'Discutăm gratuit procesele tale și găsim puncte de creștere',
    'Проектирование': 'Proiectare',
    'Создаём план - что автоматизируем, какой бот нужен, как выглядит сайт':
      'Construim planul — ce automatizăm, ce bot e nevoie, cum arată site-ul',
    'Запуск и поддержка': 'Lansare și suport',
    'Внедряем, тестируем, обучаем. Вы не остаётесь один - мы рядом':
      'Implementăm, testăm, instruim. Nu rămâi singur — suntem alături',

    // ===== Home: Why us =====
    'Почему мы': 'De ce noi',
    'Наши преимущества': 'Avantajele noastre',
    'Не шаблоны': 'Fără șabloane',
    'Каждое решение индивидуально - под ваш бизнес, под ваши процессы':
      'Fiecare soluție este individuală — pentru afacerea ta, pentru procesele tale',
    'Говорим понятно': 'Vorbim pe înțeles',
    'Без технического жаргона - объясняем так, чтобы было ясно':
      'Fără jargon tehnic — explicăm clar, pe limba ta',
    'Под ключ': 'La cheie',
    'Вы получаете результат, а не проблему. Мы закрываем всё':
      'Primești rezultat, nu probleme. Acoperim totul',
    'Поддержка после запуска': 'Suport după lansare',
    'Не исчезаем после оплаты - помогаем и дорабатываем':
      'Nu dispărem după plată — ajutăm și optimizăm',

    // ===== Home: Stats =====
    'AI First подход': 'Abordare AI First',
    'AI First': 'AI First',
    'Готовых шаблонов': 'Șabloane gata făcute',
    'Шаблонов': 'Șabloane',
    'Performance Score': 'Performance Score',
    'Языка поддержки': 'Limbi suportate',
    'Core Web Vitals': 'Core Web Vitals',

    // ===== Home: Testimonials =====
    'Отзывы': 'Recenzii',
    'Что говорят клиенты': 'Ce spun clienții',
    '"Рабовали с MollAI над моим портфолио. Потрясающее внимание к\n                            деталям в Web3-интерфейсе и очень плавная анимация. Ребята понимают специфику\n                            крипто-индустрии и умеют делать \'дорогой\' визуал."':
      '"Am lucrat cu MollAI la portofoliul meu. Atenție impresionantă la detalii în interfața Web3 și animații foarte fluide. Băieții înțeleg specificul industriei crypto și știu să facă vizual «scump»."',
    'Web3 Contributor': 'Web3 Contributor',
    '"Заказывали Telegram-бота для обработки заявок. Бот работает в\n                            фоновом режиме, клиенты получают ответы мгновенно. Всё приватно, защищено и реально экономит\n                            нам время каждый день."':
      '"Am comandat un bot Telegram pentru procesarea cererilor. Botul lucrează în fundal, clienții primesc răspunsuri instant. Totul e privat, protejat și ne economisește timp în fiecare zi."',
    'Партнер в логистике': 'Partener în logistică',
    '"Помогли запустить контент-стратегию. Минимум правок, тексты на трёх\n                            языках звучат естественно и профессионально. Теперь сайт выглядит живым, а мы не тратим часы\n                            на копирайтинг."':
      '"Ne-au ajutat să lansăm strategia de conținut. Minimum de corecții, textele în trei limbi sună natural și profesionist. Acum site-ul e viu, iar noi nu mai pierdem ore pe copywriting."',
    'Основатель бренда': 'Fondator de brand',

    // ===== Home: CTA =====
    'Готовы перестать терять время на рутину?': 'Gata să nu mai pierzi timp cu rutina?',
    'Бесплатная консультация - 30 минут, которые могут изменить ваш бизнес':
      'Consultație gratuită — 30 de minute care îți pot schimba afacerea',

    // ===== Home: FAQ =====
    'FAQ': 'FAQ',
    'Частые вопросы': 'Întrebări frecvente',
    'Зачем мне AI-бот на сайте?': 'De ce am nevoie de un bot AI pe site?',
    'AI-бот отвечает клиентам мгновенно 24/7,\n                                даже когда вы спите. Он квалифицирует заявки, записывает\n                                клиентов на встречи и отвечает на частые вопросы.\n                                В среднем бот обрабатывает до 70% обращений без участия человека.':
      'Botul AI răspunde clienților instant 24/7, chiar și când dormi. Califică cererile, programează clienții la întâlniri și răspunde la întrebări frecvente. În medie, botul procesează până la 70% din mesaje fără implicarea omului.',
    'Зачем мне автоматизация процессов?': 'De ce am nevoie de automatizarea proceselor?',
    'Автоматизация связывает ваши инструменты\n                                в единую систему. Например: заявка с сайта автоматически\n                                попадает в CRM, менеджер получает уведомление в Telegram,\n                                а клиент — письмо с подтверждением.\n                                Без ручной работы и ошибок.':
      'Automatizarea conectează instrumentele tale într-un sistem unic. De exemplu: cererea de pe site ajunge automat în CRM, managerul primește notificare în Telegram, iar clientul — un email de confirmare. Fără muncă manuală și fără erori.',
    'Сколько времени занимает создание сайта?': 'Cât durează crearea unui site?',
    'Лендинг — 3-5 рабочих дней.\n                                Многостраничный сайт — 2-3 недели. Комплексный проект\n                                с ботом и автоматизацией — 3-4 недели.\n                                Точные сроки обсуждаем на консультации.':
      'Landing — 3–5 zile lucrătoare. Site multi-pagină — 2–3 săptămâni. Proiect complex cu bot și automatizare — 3–4 săptămâni. Termenele exacte le discutăm la consultație.',
    'Вы работаете только с Молдовой?': 'Lucrați doar cu Moldova?',
    'Нет! Мы работаем удалённо с клиентами из любой страны.\n                                Мультиязычность и понимание международных рынков - наша сильная сторона. Но наш офис в\n                                Кишинёве, и мы активно помогаем местному бизнесу.':
      'Nu! Lucrăm la distanță cu clienți din orice țară. Multilingvismul și înțelegerea piețelor internaționale sunt punctul nostru forte. Dar biroul nostru e în Chișinău și ajutăm activ afacerile locale.',
    'Мне точно нужен весь этот AI, если я маленький бизнес?':
      'Chiar am nevoie de tot acest AI dacă sunt o afacere mică?',
    'Именно маленький бизнес выигрывает больше всего. AI-бот\n                                заменяет второго сотрудника, автоматизация освобождает часы рутины, а хороший сайт\n                                приносит заявки, пока вы занимаетесь другими делами. Мы подбираем решение под ваш\n                                масштаб и бюджет.':
      'Tocmai afacerile mici câștigă cel mai mult. Botul AI înlocuiește un al doilea angajat, automatizarea eliberează ore de rutină, iar un site bun aduce cereri în timp ce te ocupi de altceva. Adaptăm soluția la scara și bugetul tău.',

    // ===== About =====
    'О нас': 'Despre noi',
    'Мы - MollAI': 'Suntem MollAI',
    'Небольшая команда с большим подходом. Делаем AI-решения доступными для бизнеса в Молдове.':
      'O echipă mică cu o abordare mare. Facem soluțiile AI accesibile pentru afacerile din Moldova.',
    'Наша история': 'Povestea noastră',
    'Мы начали с убеждения, что AI и автоматизация - не привилегия корпораций. Малый и средний бизнес\n                        в Молдове заслуживает тех же инструментов, что и компании в Берлине или Сан-Франциско. Поэтому\n                        мы строим решения, которые работают - без лишней сложности и по адекватным ценам.':
      'Am pornit de la convingerea că AI-ul și automatizarea nu sunt un privilegiu al corporațiilor. Afacerile mici și mijlocii din Moldova merită aceleași instrumente ca firmele din Berlin sau San Francisco. De aceea construim soluții care funcționează — fără complexitate inutilă și la prețuri rezonabile.',
    'Ценности': 'Valori',
    'Чем мы руководствуемся': 'După ce ne ghidăm',
    'Простота': 'Simplitate',
    'Сложное должно стать простым': 'Complexul trebuie să devină simplu',
    'Результат': 'Rezultat',
    'Красота без конверсии - это впустую': 'Frumusețea fără conversie e pierdere de timp',
    'Прозрачность': 'Transparență',
    'Без скрытых платежей и сюрпризов': 'Fără plăți ascunse și surprize',
    'Партнёрство': 'Parteneriat',
    'Ваш успех = наш успех': 'Succesul tău = succesul nostru',
    'Контакты': 'Contacte',
    'Давайте поговорим': 'Hai să vorbim',
    'Бесплатная консультация - 30 минут, без\n                        обязательств': 'Consultație gratuită — 30 de minute, fără obligații',
    'Бесплатная консультация - 30 минут, без обязательств':
      'Consultație gratuită — 30 de minute, fără obligații',
    'Отправить заявку': 'Trimite cererea',
    'Имя': 'Nume',
    'Email': 'Email',
    'Telegram / Телефон': 'Telegram / Telefon',
    'Чем можем помочь?': 'Cu ce te putem ajuta?',
    'Выберите услугу': 'Alege un serviciu',
    'Сайт': 'Site',
    'AI-бот': 'Bot AI',
    'Автоматизация': 'Automatizare',
    'Комплексное решение': 'Soluție complexă',
    'Другое': 'Altceva',
    'Опишите задачу': 'Descrie sarcina',
    '✱ Отправить\n                                    заявку': '✱ Trimite cererea',
    '✱ Отправить заявку': '✱ Trimite cererea',
    'Офис': 'Birou',
    'Кишинёв, Молдова': 'Chișinău, Moldova',
    'Время работы': 'Program de lucru',
    'Пн-Пт - 9:00 - 18:00': 'Lun–Vin — 9:00 – 18:00',

    // form placeholders
    'Ваше имя': 'Numele tău',
    '@username или номер': '@username sau număr',
    'Какую проблему вы хотите решить?': 'Ce problemă vrei să rezolvi?',

    // form messages
    'Укажите ваше имя!': 'Introdu numele!',
    'Введите корректный Email адрес!': 'Introdu o adresă de email validă!',
    'Выберите категорию услуги!': 'Alege o categorie de serviciu!',
    'Опишите вашу задачу подробнее (минимум 10 символов)!':
      'Descrie sarcina mai detaliat (minim 10 caractere)!',
    'Отправляю...': 'Se trimite...',
    'Заявка отправлена! Мы свяжемся с вами в ближайшее время.':
      'Cererea a fost trimisă! Te vom contacta în curând.',
    'Ошибка при отправке. Попробуйте ещё раз.':
      'Eroare la trimitere. Încearcă din nou.',
    'Ошибка сети. Попробуйте ещё раз.': 'Eroare de rețea. Încearcă din nou.',

    // ===== Pricing =====
    'Прозрачные цены': 'Prețuri transparente',
    'Без скрытых платежей. Вы знаете за что платите.':
      'Fără plăți ascunse. Știi pentru ce plătești.',
    'Старт': 'Start',
    'Launch': 'Launch',
    'Для малого бизнеса: быстрый запуск цифрового присутствия':
      'Pentru afaceri mici: lansare rapidă a prezenței digitale',
    'Конверсионный Landing Page': 'Landing Page cu conversie',
    'Авто-уведомления о лидах в Telegram': 'Notificări automate despre lead-uri în Telegram',
    'Базовая SEO-оптимизация': 'Optimizare SEO de bază',
    'Мультиязычность (2 языка)': 'Multilingvism (2 limbi)',
    'Managed Hosting (1 год включен)': 'Hosting administrat (1 an inclus)',
    'Выбрать': 'Alege',
    'Популярный': 'Popular',
    'Business AI': 'Business AI',
    'Для компаний: сайт + обученный\n                            AI-менеджер для продаж': 'Pentru companii: site + AI-manager antrenat pentru vânzări',
    'Для компаний: сайт + обученный AI-менеджер для продаж':
      'Pentru companii: site + AI-manager antrenat pentru vânzări',
    'Многостраничный сайт (до 6 страниц)': 'Site multi-pagină (până la 6 pagini)',
    'AI-чат-бот, обученный на ваших данных': 'Chatbot AI antrenat pe datele tale',
    '3 Сценария автоматизации (Lead Gen)': '3 scenarii de automatizare (Lead Gen)',
    'Прямая интеграция с CRM': 'Integrare directă cu CRM',
    'Мультиязычность (3 языка)': 'Multilingvism (3 limbi)',
    '1 месяц техподдержки': '1 lună de suport tehnic',
    'Премиум': 'Premium',
    'Enterprise AI': 'Enterprise AI',
    'Для лидеров: полная цифровая трансформация бизнеса':
      'Pentru lideri: transformare digitală completă a afacerii',
    'Всё из пакета "Business AI"': 'Tot din pachetul „Business AI"',
    'Omnichannel AI (Web + TG + WhatsApp)': 'AI Omnichannel (Web + TG + WhatsApp)',
    '8 Глубоких сценариев автоматизации': '8 scenarii complexe de automatizare',
    'Модуль AI-генерации контента': 'Modul de generare de conținut AI',
    'Выделенный VPS для n8n': 'VPS dedicat pentru n8n',
    'Аналитические дашборды (ROI)': 'Dashboard-uri analitice (ROI)',
    '3 месяца VIP-поддержки': '3 luni de suport VIP',
    'Приоритетная доработка': 'Dezvoltare prioritară',
    'Дополнительно': 'Suplimentar',
    'Аддоны': 'Add-on-uri',
    'Дополнительная бизнес-автоматизация': 'Automatizare suplimentară de business',
    'Ещё один воркфлоу для ваших задач': 'Încă un workflow pentru sarcinile tale',
    'Дополнительная страница сайта': 'Pagină suplimentară de site',
    'Полноценная страница с дизайном и контентом': 'Pagină completă cu design și conținut',
    'Ежемесячная поддержка': 'Suport lunar',
    'Техническая поддержка и доработки': 'Suport tehnic și îmbunătățiri',
    'AI-контент пакет (10 текстов)': 'Pachet conținut AI (10 texte)',
    'Генерация, редактирование и адаптация контента':
      'Generare, editare și adaptare a conținutului',
    'Интеграция с WhatsApp (API)': 'Integrare cu WhatsApp (API)',
    'Подключение прямого канала продаж в мессенджере':
      'Conectarea unui canal direct de vânzări în mesager',
    'Ребрендинг и фирменный стиль': 'Rebranding și identitate vizuală',
    'Логотип, современная палитра и новый образ бренда':
      'Logo, paletă modernă și o nouă imagine de brand',

    // ===== Blog =====
    'Наш блог': 'Blogul nostru',
    'Делимся опытом, инсайдами и новостями из мира AI и автоматизации':
      'Împărtășim experiență, idei și noutăți din lumea AI și a automatizării',
    'Загрузка записей...': 'Se încarcă articolele...',
    'Загрузка товаров...': 'Se încarcă produsele...',
    'Статей пока нет. Мы скоро добавим что-нибудь интересное!':
      'Încă nu sunt articole. Adăugăm ceva interesant în curând!',
    'Не удалось загрузить блог. Попробуйте позже.':
      'Nu am reușit să încărcăm blogul. Încearcă mai târziu.',
    'Читать далее →': 'Citește mai mult →',
    'Закрыть': 'Închide',

    // ===== Shop =====
    'Готовые автоматизации': 'Automatizări gata făcute',
    'Каталог ботов, скриптов и решений - забирайте и внедряйте':
      'Catalog de boți, scripturi și soluții — ia-le și implementează-le',
    'Все': 'Toate',
    'Telegram-боты': 'Boți Telegram',
    'AI-автоматизации': 'Automatizări AI',
    'Веб-скрипты': 'Scripturi web',
    'Парсеры': 'Parsere',
    'Telegram-бот': 'Bot Telegram',
    'AI-автоматизация': 'Automatizare AI',
    'Веб-скрипт': 'Script web',
    'Парсер': 'Parser',
    'Демо →': 'Demo →',
    'Заказать': 'Comandă',
    'Заказать скрипт': 'Comandă scriptul',
    'Возможности': 'Funcționalități',
    'Описание уточняйте у команды.': 'Pentru detalii, contactează echipa.',
    'Читать далее': 'Citește mai mult',
    'Свернуть': 'Ascunde',
    'Демо': 'Demo',
    'Оформление заказа': 'Comandă',
    'Укажите Email или контакты!': 'Indică Email sau contacte!',
    'Заявка отправлена! Мы скоро свяжемся с вами.': 'Cererea a fost trimisă! Te contactăm în curând.',
    'Ошибка. Попробуйте еще раз.': 'Eroare. Încearcă din nou.',
    'Отправить заявку': 'Trimite cererea',
    'Товары скоро появятся. Мы готовим новые боты и скрипты!':
      'Produsele apar în curând. Pregătim noi boți și scripturi!',
    'Не удалось загрузить товары. Попробуйте позже.':
      'Nu am reușit să încărcăm produsele. Încearcă mai târziu.',

    // ===== Portfolio =====
    'Наши работы': 'Lucrările noastre',
    'Типичные решения, которые мы создаём для бизнеса':
      'Soluții tipice pe care le creăm pentru afaceri',
    'Каждый проект - это\n                        уникальное решение под задачи клиента. Без шаблонов, без конвейера. Только результат.':
      'Fiecare proiect este o soluție unică, adaptată sarcinilor clientului. Fără șabloane, fără bandă rulantă. Doar rezultat.',
    'Каждый проект - это уникальное решение под задачи клиента. Без шаблонов, без конвейера. Только результат.':
      'Fiecare proiect este o soluție unică, adaptată sarcinilor clientului. Fără șabloane, fără bandă rulantă. Doar rezultat.',
    'FarmTokyo - Портфолио Web3-контрибьютора': 'FarmTokyo — Portofoliu Web3-contributor',
    'Задача': 'Sarcină',
    'Создать персональный сайт-портфолио для блогера и контент-мейкера в Web3-пространстве.\n                                    Нужно было собрать ключевые проекты, показать экспертизу в визуальном сторителлинге\n                                    и дать возможность связаться напрямую.':
      'Crearea unui site-portofoliu personal pentru un blogger și content-maker din Web3. Era nevoie să adunăm proiectele-cheie, să arătăm expertiza în storytelling vizual și să oferim contact direct.',
    'Решение': 'Soluție',
    'Минималистичный сайт на Framer с кураторской подачей работ. Структура: Selected Work,\n                                    Latest Work, About, Shop и Contact. Интеграция с Twitter/X, Telegram и Discord для\n                                    прямого контакта с аудиторией.':
      'Site minimalist pe Framer cu prezentare curatorială a lucrărilor. Structură: Selected Work, Latest Work, About, Shop și Contact. Integrare cu Twitter/X, Telegram și Discord pentru contact direct cu publicul.',
    'Результат': 'Rezultat',
    'Чистый, быстрый сайт без лишнего кода. Все проекты собраны в одном месте, навигация\n                                    интуитивная, контакты - в один клик.':
      'Site curat și rapid, fără cod inutil. Toate proiectele într-un singur loc, navigare intuitivă, contacte la un click.',
    'Посмотреть сайт →': 'Vezi site-ul →',
    'Следующий кейс - ваш?': 'Următorul caz — al tău?',
    'Мы ищем первый проект, который станет нашей гордостью. Если вам нужен сайт, бот или\n                                автоматизация - давайте обсудим.':
      'Căutăm primul proiect care să devină mândria noastră. Dacă ai nevoie de site, bot sau automatizare — hai să discutăm.',
    '✱ Обсудить проект': '✱ Discută proiectul',
    'Портфолио': 'Portofoliu',
    'Framer': 'Framer',

    // ===== Privacy =====
    'Правовая информация': 'Informații juridice',
    'Как мы собираем, используем и защищаем ваши данные':
      'Cum colectăm, folosim și protejăm datele tale',
    '1. Какие данные мы собираем': '1. Ce date colectăm',
    'При обращении через форму на сайте мы получаем только те данные, которые вы указываете: имя, email или телефон, текст обращения.':
      'Când contactezi prin formularul de pe site, primim doar datele pe care le indici: nume, email sau telefon, textul mesajului.',
    '2. Как мы используем данные': '2. Cum folosim datele',
    'Ваши данные используются исключительно для связи с вами по вашему запросу. Мы не передаём их третьим лицам и не используем для маркетинговых рассылок без вашего согласия.':
      'Datele tale sunt folosite exclusiv pentru a-ți răspunde la cerere. Nu le transmitem terților și nu le folosim pentru marketing fără consimțământul tău.',
    '3. Хранение и защита': '3. Stocare și protecție',
    'Мы применяем стандартные меры защиты данных: шифрование соединений, ограничение доступа к информации, регулярное резервное копирование. Данные хранятся только на период, необходимый для обработки вашего запроса.':
      'Aplicăm măsuri standard de protecție: criptarea conexiunilor, acces restricționat la informații, copii de rezervă regulate. Datele sunt păstrate doar pe perioada necesară procesării cererii.',
    '4. Файлы cookie': '4. Fișiere cookie',
    'Сайт может использовать технические cookie для корректной работы (навигация, предпочтения). Аналитические cookie применяются для понимания поведения пользователей - всегда с возможностью отключения в настройках браузера.':
      'Site-ul poate folosi cookie-uri tehnice pentru funcționare corectă (navigare, preferințe). Cookie-urile analitice sunt folosite pentru înțelegerea comportamentului — întotdeauna cu posibilitatea de a fi dezactivate din setările browserului.',
    '5. Ваши права': '5. Drepturile tale',
    'Вы имеете право запросить удаление ваших данных, получить копию хранимой информации, а также отозвать согласие на обработку.':
      'Ai dreptul să soliciți ștergerea datelor, să obții o copie a informațiilor păstrate și să retragi consimțământul pentru prelucrare.',
    '6. Сторонние сервисы': '6. Servicii terțe',
    'При создании сайтов и AI-ботов для ваших клиентов мы можем интегрировать сторонние сервисы (Google Fonts, хостинг-провайдеры, CRM). Каждый из них имеет собственную политику конфиденциальности.':
      'La crearea site-urilor și a boților AI pentru clienții tăi, putem integra servicii terțe (Google Fonts, hosting, CRM). Fiecare are propria politică de confidențialitate.',
    '7. Изменения': '7. Modificări',
    'Мы можем обновлять эту политику. Актуальная версия всегда доступна на этой странице. Дата последнего обновления: 14 апреля 2026 г.':
      'Putem actualiza această politică. Versiunea actuală este mereu disponibilă pe această pagină. Ultima actualizare: 14 aprilie 2026.',

    // ===== Chat widget =====
    'Онлайн': 'Online',
    'Напишите сообщение...': 'Scrie un mesaj...',
    'MollAI печатает...': 'MollAI scrie...',
    'Здравствуйте! Чем могу помочь?': 'Bună! Cu ce te pot ajuta?',
    'Извините, произошла ошибка. Попробуйте позже.':
      'Scuze, a apărut o eroare. Încearcă mai târziu.',
  };

  // Normalize: collapse all whitespace (incl. newlines) to single spaces, trim, lowercase.
  // This lets us match strings regardless of how they're broken across lines in HTML.
  function norm(s) {
    return s.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  // Normalized lookup maps. Key = norm(source), value = target (in original case).
  const RU2RO = {};
  const RO2RU = {};
  Object.keys(DICT).forEach((ru) => {
    const ro = DICT[ru];
    RU2RO[norm(ru)] = ro;
    RO2RU[norm(ro)] = ru;
  });

  function getLang() {
    return localStorage.getItem(LS_KEY) === 'ro' ? 'ro' : 'ru';
  }
  function setLang(lang) {
    localStorage.setItem(LS_KEY, lang);
    document.documentElement.setAttribute('lang', lang === 'ro' ? 'ro' : 'ru');
    document.documentElement.setAttribute('data-lang', lang);
  }

  // Skip these tags entirely when walking text nodes
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE']);

  function translateText(raw, map) {
    if (!raw) return raw;
    const trimmed = raw.trim();
    if (!trimmed) return raw;
    const key = norm(raw);
    const hit = map[key];
    if (hit === undefined) return raw;
    // Preserve surrounding whitespace from the original node
    const leading = raw.match(/^\s*/)[0];
    const trailing = raw.match(/\s*$/)[0];
    return leading + hit + trailing;
  }

  function walk(node, map) {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const next = translateText(node.nodeValue, map);
      if (next !== node.nodeValue) node.nodeValue = next;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (SKIP_TAGS.has(node.tagName)) return;

    // Translate certain attributes
    ['placeholder', 'title', 'aria-label', 'alt'].forEach((attr) => {
      if (node.hasAttribute && node.hasAttribute(attr)) {
        const v = node.getAttribute(attr);
        const next = translateText(v, map);
        if (next !== v) node.setAttribute(attr, next);
      }
    });
    // Translate <option> visible text via textContent fallback
    // (covered by text-node walk on its child)

    // Translate <input value="..."> and <button value="..."> if non-form-control text
    if ((node.tagName === 'INPUT' || node.tagName === 'BUTTON') && node.type === 'submit') {
      const v = node.getAttribute('value');
      if (v) {
        const next = translateText(v, map);
        if (next !== v) node.setAttribute('value', next);
      }
    }

    let child = node.firstChild;
    while (child) {
      const nextSibling = child.nextSibling;
      walk(child, map);
      child = nextSibling;
    }
  }

  let applying = false;
  function applyLang(lang) {
    const targetMap = lang === 'ro' ? RU2RO : RO2RU;
    applying = true;
    try {
      walk(document.body, targetMap);
    } finally {
      setTimeout(() => { applying = false; }, 0);
    }
  }

  function ensureToggleButton() {
    let btn = document.getElementById('lang-toggle');
    if (btn) return btn;
    btn = document.createElement('button');
    btn.id = 'lang-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Сменить язык / Schimbă limba');
    btn.innerHTML = `<span class="lang-toggle__label"></span>`;
    document.body.appendChild(btn);

    if (!document.getElementById('lang-toggle-style')) {
      const css = document.createElement('style');
      css.id = 'lang-toggle-style';
      css.textContent = `
        #lang-toggle{
          position:fixed;
          top:50%;
          right:0;
          transform:translateY(-50%);
          z-index:100000;
          display:flex;
          align-items:center;
          justify-content:center;
          width:42px;
          height:54px;
          padding:0;
          border:none;
          border-top-left-radius:14px;
          border-bottom-left-radius:14px;
          border-top-right-radius:0;
          border-bottom-right-radius:0;
          background:#E2E1DD;
          color:#2C2C2C;
          font-family:'Inter',system-ui,sans-serif;
          font-weight:700;
          font-size:13px;
          letter-spacing:0.5px;
          cursor:pointer;
          box-shadow:-4px 4px 12px rgba(0,0,0,0.12), -2px -2px 6px rgba(255,255,255,0.6);
          transition:transform .2s ease, box-shadow .2s ease, background .2s ease;
        }
        #lang-toggle:hover{
          transform:translateY(-50%) translateX(-2px);
          box-shadow:-6px 6px 16px rgba(0,0,0,0.16), -2px -2px 8px rgba(255,255,255,0.7);
        }
        #lang-toggle:active{ transform:translateY(-50%) scale(0.97); }
        #lang-toggle .lang-toggle__label{
          writing-mode:vertical-rl;
          transform:rotate(180deg);
          line-height:1;
        }
        @media (max-width:480px){
          #lang-toggle{ width:36px; height:48px; font-size:12px; }
        }
      `;
      document.head.appendChild(css);
    }
    return btn;
  }

  function updateButtonLabel(btn, lang) {
    const label = btn.querySelector('.lang-toggle__label');
    // Show the *other* language as the action target
    label.textContent = lang === 'ro' ? 'RU' : 'RO';
  }

  function init() {
    const btn = ensureToggleButton();
    const lang = getLang();
    setLang(lang);
    updateButtonLabel(btn, lang);
    if (lang === 'ro') applyLang('ro');

    btn.onclick = () => {
      const cur = getLang();
      const next = cur === 'ro' ? 'ru' : 'ro';
      setLang(next);
      updateButtonLabel(btn, next);
      applyLang(next);
    };

    // Re-apply translation when DOM changes (page navigation, async lists)
    const obs = new MutationObserver((mutations) => {
      if (applying) return;
      if (getLang() !== 'ro') return;
      // Throttle: collect roots and translate them
      const roots = new Set();
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE) {
            roots.add(n);
          }
        });
      }
      if (roots.size === 0) return;
      applying = true;
      try {
        roots.forEach((n) => walk(n, RU2RO));
      } finally {
        setTimeout(() => { applying = false; }, 0);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: false });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // Expose minimal API
  window.MollaiI18n = {
    get: getLang,
    set: (lang) => {
      setLang(lang);
      const btn = document.getElementById('lang-toggle');
      if (btn) updateButtonLabel(btn, lang);
      applyLang(lang);
    },
    apply: (lang) => applyLang(lang || getLang()),
  };
})();
