# 🔍 Analyse Architecture - CreateShowPlan

## 📊 Hiérarchie des Composants

```
App.tsx
└── QueryClientProvider (React Query)
    └── BrowserRouter
        └── Routes
            └── Route "/" (ProtectedRoute)
                └── Layout.tsx ⚠️ [POTENTIEL PROBLÈME]
                    ├── MobileHeader
                    ├── Sidebar (useState: isSidebarOpen)
                    ├── <main>
                    │   └── <Outlet /> ← Rendu des pages enfants
                    └── RadioPlayer
                    
                    Dans <Outlet>:
                    └── CreateShowPlan.tsx
                        ├── EmissionSelect (controlé: value + onChange)
                        ├── ShowPlanForm ⚠️ [PROBLÈME IDENTIFIÉ]
                        │   └── useForm (react-hook-form)
                        │       └── defaultValues (passé par props)
                        ├── StatusSelect (controlé: value + onChange)
                        ├── PresenterSelect (controlé: value + onChange)
                        ├── NewSegmentForm
                        │   └── useForm interne (isolé)
                        │   └── onAdd → addSegment (store)
                        └── SegmentList
```

## 🔄 Flux de Données Actuel

```
┌─────────────────────────────────────────────────────────────────────┐
│                     useShowPlanFormStore (Zustand)                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ formData: { title, showType, date, time, description }      │   │
│  │ selectedEmission: number | null                              │   │
│  │ selectedStatus: Status | null                                │   │
│  │ selectedPresenters: Presenter[]                              │   │
│  │ segments: ShowSegment[]                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CreateShowPlan.tsx                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ const { formData, ... } = useShowPlanFormStore()            │   │
│  │                                                              │   │
│  │ handleFormChange = (values) => updateFormData(values)       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ props: defaultValues={formData}
                              │        onValuesChange={handleFormChange}
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       ShowPlanForm.tsx                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ useForm({ defaultValues: { ... } })                         │   │
│  │                                                              │   │
│  │ ⚠️ PROBLÈME: defaultValues n'est utilisé qu'à               │   │
│  │              l'INITIALISATION de useForm                     │   │
│  │                                                              │   │
│  │ useEffect → setValue() pour sync parent → enfant            │   │
│  │ watch() → onValuesChange() pour sync enfant → parent        │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## 🚨 Problème Identifié

### Séquence du Bug

```
1. Utilisateur remplit ShowPlanForm (title, date, etc.)
   └─→ watch() déclenché
       └─→ onValuesChange() appelé
           └─→ updateFormData() dans le store Zustand
               └─→ formData mis à jour ✅

2. Utilisateur clique "Ajouter segment" dans NewSegmentForm
   └─→ handleSubmit() de NewSegmentForm
       └─→ onAdd(segment) appelé
           └─→ addSegment(segment) dans le store
               └─→ segments mis à jour ✅
               └─→ RE-RENDER de CreateShowPlan ⚠️

3. RE-RENDER de CreateShowPlan
   └─→ ShowPlanForm re-rendu avec MÊME defaultValues
       └─→ MAIS useForm NE SE RÉINITIALISE PAS avec defaultValues
           car ce sont les valeurs du store (devrait être OK)
       
   ⚠️ PROBLÈME PROBABLE: 
   Le useEffect de sync [defaultValues, setValue] se déclenche
   MAIS le flag isUpdatingFromParent ne fonctionne pas correctement
   OU le watch() est appelé avant que setValue soit terminé
```

## 🔍 Analyse Détaillée du ShowPlanForm

```typescript
// PROBLÈME 1: Les conditions de hasValues
const hasValues = defaultValues.title || defaultValues.showType || 
                  defaultValues.date || defaultValues.time || 
                  defaultValues.description;

// Si formData du store est vide initialement, hasValues = false
// → setValue n'est jamais appelé
// → Les champs restent vides après re-render

// PROBLÈME 2: Le setTimeout pour isUpdatingFromParent
setTimeout(() => {
  isUpdatingFromParent.current = false;
}, 100);

// 100ms peut être trop court ou trop long selon les cas
// Le watch() peut être appelé PENDANT ce délai
```

## ✅ Solution Recommandée

### Option A: Supprimer ShowPlanForm et utiliser directement le store

```
CreateShowPlan.tsx
├── <input value={formData.title} onChange={(e) => updateFormData({title: e.target.value})} />
├── <select value={formData.showType} onChange={...} />
├── etc.
```

**Avantages:**
- Plus simple
- Pas de synchronisation bidirectionnelle
- Le store Zustand gère tout

### Option B: Garder ShowPlanForm mais le connecter directement au store

```typescript
// ShowPlanForm.tsx
const ShowPlanForm = () => {
  const { formData, updateFormData } = useShowPlanFormStore();
  
  const { register, formState } = useForm({
    defaultValues: formData,
  });
  
  // Les champs sont directement liés au store
  return (
    <input 
      {...register('title')} 
      onChange={(e) => updateFormData({ title: e.target.value })}
    />
  );
};
```

### Option C (RECOMMANDÉE): Inputs contrôlés simples sans react-hook-form

```typescript
// ShowPlanForm.tsx - Version simplifiée
const ShowPlanForm = () => {
  const { formData, updateFormData } = useShowPlanFormStore();
  
  return (
    <div>
      <input 
        value={formData.title || ''}
        onChange={(e) => updateFormData({ title: e.target.value })}
      />
      {/* etc. */}
    </div>
  );
};
```

**Cette option:**
- Élimine la complexité de react-hook-form pour ce cas
- Le store Zustand est la seule source de vérité
- Pas de synchronisation bidirectionnelle à gérer
- Les valeurs persistent naturellement car le store est externe

## 📋 Composants Affectés à Modifier

| Composant | Action | Priorité |
|-----------|--------|----------|
| `ShowPlanForm.tsx` | Réécrire avec inputs contrôlés | 🔴 Haute |
| `CreateShowPlan.tsx` | Simplifier (retirer handleFormChange) | 🔴 Haute |
| `useShowPlanFormStore.ts` | OK (déjà bien structuré) | ✅ |
| `EmissionSelect.tsx` | OK (déjà contrôlé) | ✅ |
| `StatusSelect.tsx` | OK (déjà contrôlé) | ✅ |
| `PresenterSelect.tsx` | OK (déjà contrôlé) | ✅ |

## 🎯 Plan d'Action

1. **Réécrire `ShowPlanForm.tsx`** avec des inputs contrôlés connectés directement au store Zustand
2. **Supprimer la prop `onValuesChange`** de ShowPlanForm (plus nécessaire)
3. **Simplifier `CreateShowPlan.tsx`** en retirant handleFormChange
4. **Tester** l'ajout de segment → les champs doivent persister
