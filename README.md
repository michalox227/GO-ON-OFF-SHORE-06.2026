GO ON [OFF] SHORE to Marketplace & Trust Infrastructure dla sektora offshore, onshore i high-risk industries. Projekt nie jest klasycznym portalem pracy, lecz operacyjnym systemem rynku pracy projektowej: łączy zweryfikowanych specjalistów, firmy, partnerów, certyfikaty, dostępność, dokumenty, ubezpieczenia, doradztwo i podstawową warstwę rozliczeniową.

Pracownicy tracą ciągłość kontraktów, firmy ręcznie kompletują zespoły, certyfikaty wygasają w krytycznym momencie, a rynek nie ma wspólnej warstwy zaufania. GO ON [OFF] SHORE odpowiada na to poprzez Digital ID, Document Vault, Centrum Certyfikacji, AI Matching basic, ATS/CRM dla firm, marketplace partnerów, moduł rozliczeń lite oraz warstwę reputacji i anty-scam.

## Pliki projektu

- `index.html` — cała witryna: 5 zakładek (Biznes Plan, Prezentacja, Road Mapa, Organizacja, Ustawienia witryny). Ładuje style z `css/style.css` i skrypty z `js/`. Brak builda, brak zależności — to czysty HTML/CSS/JS, pliki ładowane bezpośrednio przez `<link>`/`<script src>`.
- `css/style.css` — wszystkie style strony (wydzielone z dawnego inline `<style>`).
- `js/settings-config.js` — domyślne dane i `localStorage` dla panelu „Globalne ustawienia strony” (`window.GoShoreSettings.DEFAULTS/FONT_STACKS/KNOWN_KEYS`, `loadSettings/saveSettings/resetSettings`). Nie dotyka DOM-u.
- `js/renderers.js` — stosuje te ustawienia na stronie: CSS-variable (kolory, font, zaokrąglenie, cień), tryb jasny/ciemny, nazwa/slogan, widoczność zakładek (`GoShoreSettings.applyGlobalStyles`).
- `js/settings-panel.js` — wiąże formularz w zakładce Ustawienia (pola, przyciski Zapisz/Podgląd/Resetuj/Eksportuj/Importuj JSON) z dwoma powyższymi plikami.
- `js/app.js` — pozostała logika strony: prezentacja (slajdy), Road Mapa, Organizacja, edytor Biznes Planu, rejestr etykiet i bazy wartości — to są „silniki” pozostałych paneli Ustawień, działające od dawna w tym projekcie.
- `docs/settings-system.md` — krótki opis architektury panelu ustawień (jak `settings-config.js` → `settings-panel.js` → `localStorage` → `renderers.js` aktualizuje stronę).
- `preview/biznesplan.html` — samodzielny podgląd prezentacji (slajdy), używany do publikacji/podglądu poza głównym `index.html`. To jest osobny plik, niepodłączony do `css/`/`js/` z głównej witryny.
- Brak backendu i bazy danych — cała trwałość danych to `localStorage` w przeglądarce użytkownika.

## Jak uruchomić lokalnie

Wystarczy serwer statyczny w katalogu projektu, np.:

```
python3 -m http.server 8080
```

i otworzyć `http://localhost:8080/index.html`. Samo otwarcie pliku przez `file://` też działa, ale niektóre przeglądarki ograniczają `localStorage` dla plików lokalnych — serwer HTTP jest bezpieczniejszy.

## Panel "Ustawienia witryny"

Zakładka **Ustawienia witryny** zawiera kilka sekcji, każda z własnymi przyciskami Zapisz/Resetuj:

1. **Globalne ustawienia strony** — nazwa projektu, slogan, kolory (akcent, tło, tekst, karty), font, zaokrąglenie kart, intensywność cienia, tryb jasny/ciemny, widoczność zakładek Biznes Plan / Prezentacja / Road Mapa / Organizacja. Zmiany widać na żywo w trakcie edycji (jeszcze przed kliknięciem „Zapisz”) — to jedyna sekcja sterująca wyglądem całej witryny.
2. **Biznes Plan** — włącza edycję treści wprost na stronie (klikalne `contenteditable`), z podglądem zmian i przywróceniem opublikowanej wersji.
3. **Prezentacja** — edytor listy slajdów (tytuły, treść, kolejność, dodawanie/usuwanie).
4. **Road Mapa** — edycja opisów etapów + formularze do dodawania kosztów, przychodów, grantów i osób do konkretnego etapu/kwartału.
5. **Organizacja** — dodawanie/usuwanie działów i ról; widoczne od razu na zakładce „Organizacja”.
6. **Baza wartości** i **Etykiety i nagłówki** — rejestr pozycji kosztowych oraz pozostałych napisów na stronie (nazwy zakładek itp.).

### Jak edytować i zapisać

W każdej sekcji: zmień wartości w polach/formularzach → kliknij przycisk **Zapisz** (albo **Zapisz prezentację** / **Zapisz wszystkie etykiety**, zależnie od sekcji) → dane trafiają do `localStorage` tej przeglądarki i strona odświeża się automatycznie. **Resetuj** / „Przywróć opublikowaną wersję” usuwa zapisane zmiany i wraca do treści wpisanej w `index.html`.

### Eksport / import ustawień (JSON)

W sekcji **Globalne ustawienia strony**:
- **Eksportuj JSON** — zbiera wszystkie zapisane ustawienia (globalne + Biznes Plan + Prezentacja + Road Mapa + Organizacja + Baza wartości + Etykiety) w jeden plik JSON, pobiera go i wkleja podgląd do pola tekstowego.
- **Importuj JSON** — wklej wcześniej wyeksportowany JSON do pola tekstowego i kliknij; po walidacji dane zostają zapisane do `localStorage`, a strona przeładowuje się z zaimportowaną konfiguracją. Import akceptuje tylko znaną, oczekiwaną strukturę (`{ keys: {...} }`) — nieprawidłowy JSON lub nieznane pola są ignorowane, nic nie jest wykonywane jako kod.

Eksport/import działa per przeglądarka — żeby przenieść ustawienia na inny komputer albo do wersji opublikowanej na GitHub Pages, trzeba ręcznie skopiować plik JSON i zaimportować go tam.

## Commit i push do GitHub

```
git add index.html css/ js/ README.md
git commit -m "opis zmiany"
git push origin main
```

Repozytorium ma skonfigurowany workflow `static.yml`, który po push do `main` automatycznie publikuje zawartość repo na GitHub Pages.

**Ważne:** ustawienia zapisane w panelu „Ustawienia witryny” żyją tylko w `localStorage` przeglądarki — push do GitHub nie zawiera ich automatycznie. Żeby zmiana była widoczna dla wszystkich odwiedzających, trzeba przenieść poprawiony tekst/wartości z powrotem do `index.html` (np. korzystając z „Wyświetl poprawione” / eksportu JSON jako źródła zmian) i to dopiero commitować.
