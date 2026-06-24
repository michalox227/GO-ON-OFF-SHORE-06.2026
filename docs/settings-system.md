# Panel "Ustawienia witryny" — architektura

Strona jest czystym HTML/CSS/JS bez builda i bez backendu. Cała trwałość ustawień to `localStorage` w przeglądarce odwiedzającego.

## Sekcja "Globalne ustawienia strony"

To jedyna część panelu Ustawień, która steruje wyglądem **całej** witryny (kolory, font, zaokrąglenie kart, cień, tryb jasny/ciemny, widoczność zakładek). Podzielona na 3 pliki o jasno rozdzielonych odpowiedzialnościach:

```
js/settings-config.js   →  domyślne dane + localStorage (bez DOM-u)
        ↓
js/settings-panel.js    →  formularz w zakładce Ustawienia (czyta/zapisuje pola, Eksport/Import JSON)
        ↓ localStorage
js/renderers.js          →  stosuje ustawienia na stronie (CSS-variable, klasy, widoczność)
```

Przepływ danych:

1. `settings-config.js` definiuje `window.GoShoreSettings` z domyślnymi wartościami (`DEFAULTS`), dostępnymi fontami (`FONT_STACKS`), listą kluczy `localStorage` objętych eksportem/importem (`KNOWN_KEYS`) oraz funkcjami `loadSettings()` / `saveSettings()` / `resetSettings()`.
2. `renderers.js` dodaje do tego samego obiektu `applyGlobalStyles(settings)` — ustawia CSS custom properties (`--teal`, `--gold`, `--bg`, `--text`, `--panel`, `--display`, `--body`, `--card-radius`, `--shadow-strength`), atrybut `data-theme` na `<html>`, tekst nazwy/sloganu w nagłówku oraz `display:none` na ukrytych zakładkach.
3. `settings-panel.js` podłącza pola formularza (`#gsSiteName`, `#gsAccentColor`, …) — przy każdej zmianie wywołuje `GoShoreSettings.applyGlobalStyles(...)` na żywo (przed zapisem), a przyciski Zapisz/Resetuj/Eksportuj/Importuj wołają odpowiednio `saveSettings`/`resetSettings`/eksport-import JSON.
4. `js/app.js` zawiera całą resztę logiki strony (Prezentacja, Road Mapa, Organizacja, edytor Biznes Planu, rejestr etykiet, baza wartości) — to istniejące od dawna w projekcie "silniki" pozostałych paneli Ustawień; nie zależą od plików `settings-*`/`renderers.js` i odwrotnie.

## Dlaczego CSS-variable, a nie nowe klasy

Każda zmieniona reguła CSS (np. `border-radius:var(--card-radius,12px)`) ma **swój oryginalny rozmiar jako fallback**. Dopóki `--card-radius` nie zostanie ustawiony przez JS (czyli zanim użytkownik faktycznie zmieni coś w Ustawieniach), strona wygląda dokładnie tak jak przed wdrożeniem panelu. Dzięki temu globalne ustawienia są realne (nie atrapa) i jednocześnie nieinwazyjne — nic nie zmienia się "z automatu" przy pierwszym wczytaniu.

## Eksport/Import JSON

`exportSettingsJSON()` (w `settings-panel.js`) pakuje surowe wartości wszystkich kluczy z `GoShoreSettings.KNOWN_KEYS` do jednego obiektu `{ keys: { ... } }` i pozwala go skopiować/pobrać. `importSettingsJSON()` parsuje wklejony JSON przez `JSON.parse` (nigdy `eval`/`Function`), sprawdza strukturę `{ keys: {...} }` i zapisuje **tylko** wartości pod znanymi kluczami z whitelisty — nieznane pola są ignorowane.
