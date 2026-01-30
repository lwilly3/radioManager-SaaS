# Guide de Test - Module Citations

## Slice 2 : Créer une citation manuelle

### ✅ Fonctionnalités implémentées

1. **Formulaire de création** (`QuoteForm.tsx`)
   - Champ citation (obligatoire, 10-500 caractères)
   - Informations auteur (nom obligatoire, rôle et avatar optionnels)
   - Contexte d'émission (optionnel : nom, date, timestamp)
   - Métadonnées (catégorie, tags)
   - Upload audio optionnel (max 50 MB)
   - Validation en temps réel avec Zod

2. **Page de création** (`CreateQuote.tsx`)
   - Route : `/quotes/create`
   - Permission requise : `quotes_create`
   - Upload automatique des fichiers audio vers Firebase Storage
   - Récupération de la durée audio
   - Redirection vers la liste après création

3. **Navigation**
   - Bouton "Nouvelle citation" dans la liste (si permission)
   - Bouton retour dans la page de création

---

## 🧪 Scénarios de test

### Test 1 : Citation minimale (champs obligatoires seulement)

1. Aller sur `/quotes`
2. Cliquer sur "Nouvelle citation"
3. Remplir :
   - Citation : "C'est une excellente émission ce matin !"
   - Nom de l'auteur : "Jean Dupont"
4. Cliquer sur "Créer la citation"
5. ✅ Vérifier la redirection vers `/quotes`
6. ✅ Vérifier que la citation apparaît dans la liste avec statut "Brouillon"

### Test 1bis : Citation depuis un conducteur

1. Aller sur `/show-plans` ou `/my-show-plans`
2. Cliquer sur un conducteur pour voir ses détails
3. Cliquer sur le bouton "Nouvelle citation" (icône Quote) dans le header
4. ✅ Vérifier que le contexte est pré-rempli :
   - Nom de l'émission : automatique
   - Date : pré-remplie depuis le conducteur
5. ✅ Vérifier la présence du sélecteur d'invités (si le conducteur a des invités)
6. Sélectionner un invité dans la liste déroulante
7. ✅ Vérifier que le nom, rôle et avatar sont pré-remplis
8. Saisir la citation : "Cette interview était passionnante !"
9. Cliquer sur "Créer"
10. ✅ Vérifier que la citation est liée au conducteur (context.showPlanId présent dans Firestore)

### Test 2 : Citation complète avec contexte

1. Aller sur `/quotes/create`
2. Remplir :
   - Citation : "Nous devons investir davantage dans les énergies renouvelables"
   - Nom de l'auteur : "Marie Martin"
   - Rôle : "Invité"
   - Avatar : `https://i.pravatar.cc/150?img=5`
   - Nom de l'émission : "Morning Show"
   - Date : Sélectionner aujourd'hui
   - Timestamp : "01:23:45"
   - Catégorie : "Politique"
   - Tags : "environnement, énergie, climat"
3. Cliquer sur "Créer"
4. ✅ Vérifier tous les champs dans la carte de citation

### Test 3 : Upload de fichier audio

1. Aller sur `/quotes/create`
2. Remplir les champs obligatoires
3. Cliquer sur la zone d'upload audio
4. Sélectionner un fichier audio (MP3, WAV, OGG)
5. ✅ Vérifier l'aperçu du fichier (nom, taille)
6. Cliquer sur "Créer"
7. ✅ Attendre l'upload (spinner visible)
8. ✅ Vérifier que la citation est créée avec l'audio

### Test 4 : Validation des erreurs

1. Aller sur `/quotes/create`
2. Laisser la citation vide et cliquer sur "Créer"
3. ✅ Vérifier les messages d'erreur rouges
4. Remplir une citation trop courte (< 10 caractères)
5. ✅ Vérifier le message "au moins 10 caractères"
6. Remplir une URL d'avatar invalide
7. ✅ Vérifier le message "URL invalide"

### Test 5 : Annulation

1. Aller sur `/quotes/create`
2. Commencer à remplir le formulaire
3. Cliquer sur "Annuler" ou sur le bouton retour
4. ✅ Vérifier la redirection vers `/quotes`
5. ✅ Vérifier qu'aucune citation n'a été créée

### Test 6 : Permission refusée

1. Se connecter avec un utilisateur sans permission `quotes_create`
2. Aller sur `/quotes`
3. ✅ Vérifier que le bouton "Nouvelle citation" n'apparaît pas
4. Tenter d'accéder directement à `/quotes/create`
5. ✅ Vérifier le blocage par ProtectedRoute

---

## 🔍 Points à vérifier dans Firestore

Après création d'une citation, vérifier dans Firebase Console :

1. **Collection `quotes`** contient un nouveau document
2. **Champs obligatoires** :
   - `content` : texte de la citation
   - `author.name` : nom de l'auteur
   - `source.type` : "manual"
   - `status` : "draft"
   - `createdBy` : ID de l'utilisateur
   - `createdAt` : timestamp
   - `updatedAt` : timestamp
3. **Champs optionnels** (si renseignés) :
   - `author.role`, `author.avatar`
   - `context.showName`, `context.date`, `context.timestamp`
   - `metadata.category`, `metadata.tags`
   - `source.audioUrl`, `source.audioFile`, `source.duration`

---

## 🐛 Problèmes connus

Aucun pour le moment.

---

## 📊 Résultats attendus

✅ La citation est créée dans Firestore
✅ L'upload audio fonctionne (si fichier fourni)
✅ La validation empêche les données invalides
✅ La redirection fonctionne après création
✅ La citation apparaît immédiatement dans la liste (temps réel)
✅ Les permissions sont respectées

---

## 🔜 Prochaines étapes

Après validation de Slice 2, continuer vers :
- **Slice 3** : Voir les détails d'une citation
- **Slice 4** : Éditer et supprimer une citation
- **Slice 5** : Générer du contenu pour les réseaux sociaux
