# Polskify — wersja z prawdziwymi kontami (Supabase)

Ta wersja ma przygotowane:
- prawdziwą rejestrację i logowanie e-mail + hasło,
- sesję działającą między odświeżeniami strony,
- zapis XP, województw, odznak/statystyk, serii i ligi w bazie,
- prawdziwy ranking innych zalogowanych użytkowników,
- rolę administratora zapisaną w bazie,
- RLS (Row Level Security), więc użytkownik nie może odczytać progresu innych osób.

## Uruchomienie

1. Utwórz projekt w Supabase.
2. W Supabase otwórz SQL Editor i uruchom cały plik `schema.sql`.
3. Otwórz `config.js` i wklej:
   - Project URL
   - Publishable/anon key
4. Uruchom stronę przez serwer HTTP, np.:
   `python -m http.server 8000`
5. Wejdź na:
   `http://localhost:8000`

## Administrator

Najpierw normalnie utwórz konto i zaloguj się.
Potem w tabeli `profiles` ustaw dla tego użytkownika `is_admin = true`
albo użyj SQL:
`update public.profiles set is_admin = true where id = 'UUID_UŻYTKOWNIKA';`

Nie ma już potrzeby trzymania prawdziwego hasła administratora w kodzie strony.

## Ważne

Jeśli `config.js` jest pusty, Polskify zachowuje stary tryb lokalny jako fallback.
Po wpisaniu danych Supabase nowe logowanie korzysta z chmury.

Kolejny etap bezpieczeństwa: naliczanie XP po stronie serwera/RPC, aby nie dało się go zmieniać przez DevTools.
