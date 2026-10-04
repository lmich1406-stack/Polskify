# Polskify — Secure XP

Co zmienione:
- XP i tygodniowe XP nie są już zapisywane bezpośrednio z JavaScript do tabeli.
- Zwykły użytkownik nie ma prawa UPDATE kolumn XP/ligi/zaliczonych regionów.
- Quiz przekazuje wynik do funkcji RPC w Supabase.
- Serwer nalicza maks. 125 XP za quiz.
- Za ten sam region XP można dostać maksymalnie raz dziennie.
- Zaliczenie regionu przy wyniku >= 50% jest zapisywane przez bazę.
- Panel admina korzysta z osobnej funkcji sprawdzającej `is_admin`.

## Co zrobić
1. Supabase -> SQL Editor -> New query.
2. Otwórz `SECURE_XP_PATCH.sql`, skopiuj całość i kliknij Run.
3. Wrzuć cały ten folder ponownie na Netlify (nowy deploy).
4. Wyloguj/zaloguj się i zrób quiz.

Ważne:
To blokuje zwykłe ręczne wpisanie dowolnego XP do tabeli przez DevTools/API.
Najmocniejszy możliwy anty-cheat wymagałby przeniesienia także pytań i poprawnych odpowiedzi na serwer. To może być kolejny etap.
