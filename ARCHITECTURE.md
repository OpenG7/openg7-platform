**Languages:** [English](#english) | [Français](#francais)

<a id="english"></a>
# Global State Architecture – OpenG7

## 🧭 Overview

This Angular project adopts a **signal-first and standalone architecture**, integrating **NgRx modularly** via `provideStore()` and `provideEffects()`.

---

## 🎯 Goal

Maximize:
- Component autonomy
- Domain-based scalability
- Smooth integration with SSR, TransferState, and lazy-loading

---

## 🧱 Structure Used

Each domain (or feature) declares:
- Its local `reducer`
- Its `actions`, `selectors`, and optionally `effects`
- Its `FEATURE` exported via `provideStore()` / `provideEffects()`

Example in `app.config.ts`:
```ts
import { MAP_FEATURE } from './features/map/state/map.feature';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(),
    provideEffects(),
    ...MAP_FEATURE,
    // other features...
  ]
};
```

---

## 🧠 Why Not Use a Global AppState?

While possible, the classic approach:
```ts
StoreModule.forRoot<AppState>({...})
```
is:
- Rigid
- Hard to split by domain
- Poorly compatible with lazy-loading
- Counterproductive in a modern standalone architecture

---

## ✅ Advantages of Our Approach

| Advantage                           | Detail                                                                |
|-------------------------------------|-----------------------------------------------------------------------|
| 🔌 Modular                          | Each domain is autonomous: easy to maintain and test                  |
| 💡 Native signal-first              | Components can inject `Store<FeatureState>` directly                  |
| 🧠 Ready for SSR and TransferState  | The split facilitates data prehydration                               |
| 🧭 Clear structure                  | The `app.config.ts` file serves as a centralized entry point           |

---

## 🛠️ Example of a Signal-First Component

```ts
@Component({ standalone: true, imports: [...], ... })
export class MapInteractionPanelComponent {
  private store = inject(Store<MapState>); // No need for AppState

  readonly provinceFilter = this.store.selectSignal(selectProvinceFilter);
  readonly filteredConnections = this.store.selectSignal(selectFilteredConnections);

  // ...
}
```

---

## 🔄 Replacing `@Input() economicInputs`

In this architecture, the component no longer depends on a parent input like `@Input() economicInputs`.  
It:
- Declares its own signals (`selectedProvince`, `selectedSector`, etc.)
- Observes data via selectors derived from the store
- Acts through local effects

✅ The component is thus **100% autonomous, predictable, testable, and instantly understandable** by a developer or an AI.  
This removes any unnecessary parent → child dependency.

---

## 📁 Feature Location

```
src/app/features/map/state/
  ├── map.actions.ts
  ├── map.reducer.ts
  ├── map.selectors.ts
  ├── map.effects.ts
  └── map.feature.ts         ✅ Provides `provideStore()` + `provideEffects()`
```

---

## 📝 Form Typing

To fully benefit from VSCode’s IntelliSense, forms should be explicitly typed.  
Declare the data interface, then the typed structure of the controls:

```ts
export interface AdhesionFormData {
  country: string;
  organization: string;
  email: string;
  message: string;
}

// Typed representation of the form controls
type AdhesionFormDataForm = {
  country: FormControl<string | null>;
  organization: FormControl<string | null>;
  email: FormControl<string | null>;
  message: FormControl<string | null>;
};

form: FormGroup<AdhesionFormDataForm>;

constructor(private fb: FormBuilder) {
  this.form = this.fb.group({
    country: this.fb.control<string | null>(null),
    organization: this.fb.control<string | null>(null),
    email: this.fb.control<string | null>(null, [Validators.required, Validators.email]),
    message: this.fb.control<string | null>(null, Validators.required)
  });
}
```

---

## 🚀 Adding a New Feature

1. Create a folder `src/app/features/<name>/state`.
2. Declare `actions`, `reducer`, `selectors`, and if needed, `effects`.
3. Export a `<NAME>_FEATURE` via `provideStore()` and `provideEffects()`.
4. Add `...<NAME>_FEATURE` to `app.config.ts` to register it.
5. *(Optional)* Configure lazy routing to load the feature on demand.

---

## ✨ Conclusion

The modular signal-first + `provideStore()` approach is perfectly suited for modern Angular 17+ applications: maintainable, high-performing, and component-oriented.

---

<a id="francais"></a>
# Architecture de l’état global – OpenG7

## 🧭 Vue d’ensemble

Ce projet Angular adopte une **architecture signal-first et standalone**, intégrant **NgRx de manière modulaire** via `provideStore()` et `provideEffects()`.

---

## 🎯 Objectif

Maximiser :
- l’autonomie des composants
- la scalabilité par domaine fonctionnel
- l’intégration fluide avec SSR, TransferState et lazy-loading

---

## 🧱 Structure utilisée

Chaque domaine (ou feature) déclare :
- son `reducer` local
- ses `actions`, `selectors`, et éventuellement `effects`
- son `FEATURE` exporté via `provideStore()` / `provideEffects()`

Exemple dans `app.config.ts` :
```ts
import { MAP_FEATURE } from './features/map/state/map.feature';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(),
    provideEffects(),
    ...MAP_FEATURE,
    // autres features...
  ]
};
```

---

## 🧠 Pourquoi ne pas utiliser AppState global ?

Bien que possible, l’approche classique :
```ts
StoreModule.forRoot<AppState>({...})
```
est :
- rigide
- difficile à découper par domaine
- peu compatible avec le lazy-loading
- contre-productive dans une architecture standalone moderne

---

## ✅ Avantages de notre approche

| Avantage                             | Détail                                                                 |
|--------------------------------------|------------------------------------------------------------------------|
| 🔌 Modulaire                         | Chaque domaine est autonome : facile à maintenir et tester            |
| 💡 Signal-first native               | Les composants peuvent injecter `Store<FeatureState>` directement     |
| 🧠 Prêt pour le SSR et TransferState | Le découpage facilite la préhydratation des données                   |
| 🧭 Lecture claire                    | Le fichier `app.config.ts` sert de point d’entrée centralisé          |

---

## 🛠️ Exemple de composant signal-first

```ts
@Component({ standalone: true, imports: [...], ... })
export class MapInteractionPanelComponent {
  private store = inject(Store<MapState>); // Pas besoin d’AppState

  readonly provinceFilter = this.store.selectSignal(selectProvinceFilter);
  readonly filteredConnections = this.store.selectSignal(selectFilteredConnections);

  // ...
}
```

---

## 🔄 Remplacement de `@Input() economicInputs`

Dans cette architecture, le composant ne dépend plus d’une entrée parentale comme `@Input() economicInputs`.  
Il :
- déclare ses propres signaux (`selectedProvince`, `selectedSector`, etc.)
- observe les données via des `selectors` dérivés du store
- agit via des `effects` locaux

✅ Le composant est ainsi **100 % autonome, prévisible, testable, et compréhensible instantanément** par un développeur ou une IA.  
Cela permet de **supprimer toute dépendance parent → enfant inutile**.

---

## 📁 Emplacement des features

```
src/app/features/map/state/
  ├── map.actions.ts
  ├── map.reducer.ts
  ├── map.selectors.ts
  ├── map.effects.ts
  └── map.feature.ts         ✅ Fournit `provideStore()` + `provideEffects()`
```

---

## 📝 Typage des formulaires

Pour profiter pleinement de l’**IntelliSense** de VSCode, les formulaires doivent être **explicitement typés**.  
On déclare l’interface des données puis la structure typée des contrôles :

```ts
export interface AdhesionFormData {
  country: string;
  organization: string;
  email: string;
  message: string;
}

// Représentation typée des contrôles de formulaire
type AdhesionFormDataForm = {
  country: FormControl<string | null>;
  organization: FormControl<string | null>;
  email: FormControl<string | null>;
  message: FormControl<string | null>;
};

form: FormGroup<AdhesionFormDataForm>;

constructor(private fb: FormBuilder) {
  this.form = this.fb.group({
    country: this.fb.control<string | null>(null),
    organization: this.fb.control<string | null>(null),
    email: this.fb.control<string | null>(null, [Validators.required, Validators.email]),
    message: this.fb.control<string | null>(null, Validators.required)
  });
}
```

---

## 🚀 Ajout d’une nouvelle feature

1. Créer un dossier `src/app/features/<nom>/state`.
2. Déclarer `actions`, `reducer`, `selectors` et, si nécessaire, `effects`.
3. Exporter un `<NOM>_FEATURE` via `provideStore()` et `provideEffects()`.
4. Ajouter `...<NOM>_FEATURE` dans `app.config.ts` pour l’enregistrer.
5. *(Optionnel)* Configurer le routage lazy pour charger la feature à la demande.

---

## ✨ Conclusion

L’approche modulaire signal-first + `provideStore()` est parfaitement adaptée aux applications modernes Angular 17+ : maintenable, performante et orientée vers les composants.
