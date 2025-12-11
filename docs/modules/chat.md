# 💬 Module Chat

> Messagerie temps réel basée sur Firebase Firestore avec salons, messages et réactions.

## 📋 Vue d'ensemble

| Aspect | Valeur |
|--------|--------|
| **Page** | `Chat.tsx` |
| **Store** | `useChatStore` |
| **Backend** | Firebase Firestore (temps réel) |
| **Permissions** | `can_view_messages`, `can_send_messages`, `can_delete_messages` |

## 🎯 Fonctionnalités

### 1. Salons de discussion (Rooms)

- Création de salons par sujet/émission
- Liste des salons avec dernier message
- Indicateur de messages non lus
- Salons privés ou publics

### 2. Messages

- Envoi de messages texte
- Horodatage et auteur
- Édition et suppression
- Indicateur de lecture

### 3. Réactions

- Emojis sur les messages
- Compteur par type de réaction
- Ajout/retrait de réaction

### 4. Brouillons

- Sauvegarde automatique des brouillons
- Persistance par salon
- Restauration au retour

## 📁 Structure des fichiers

```
src/
├── pages/
│   └── Chat.tsx                   # Page principale
├── store/
│   └── useChatStore.ts            # Store Zustand + Firebase
├── components/
│   └── chat/
│       ├── ChatRoom.tsx           # Conteneur de salon
│       ├── ChatRoomList.tsx       # Liste des salons
│       ├── ChatMessage.tsx        # Message individuel
│       ├── ChatInput.tsx          # Zone de saisie
│       ├── ChatReactions.tsx      # Réactions emojis
│       └── ChatTypingIndicator.tsx # Indicateur frappe
├── hooks/
│   └── Chat/
│       └── useChat.ts             # Hook principal
├── types/
│   └── chat.ts                    # Types TypeScript
└── api/
    └── firebase/
        └── chat.ts                # Config Firebase
```

## 🔒 Contraintes et règles métier

### Permissions requises

| Action | Permission |
|--------|------------|
| Voir les salons | `can_view_messages` |
| Envoyer un message | `can_send_messages` |
| Supprimer un message | `can_delete_messages` |
| Créer un salon | `can_send_messages` + admin |

### Règles Firebase

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chatRooms/{roomId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/permissions/$(request.auth.uid)).data.can_send_messages == true;
    }
    
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                       get(/databases/$(database)/documents/permissions/$(request.auth.uid)).data.can_send_messages == true;
      allow delete: if request.auth != null &&
                       (resource.data.userId == request.auth.uid ||
                        get(/databases/$(database)/documents/permissions/$(request.auth.uid)).data.can_delete_messages == true);
    }
  }
}
```

### Contraintes de données

| Champ | Contrainte |
|-------|------------|
| Message | Max 2000 caractères |
| Nom de salon | Max 100 caractères |
| Réactions | 10 types d'emojis max |

## 📊 Types TypeScript

### ChatRoom

```typescript
interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  createdAt: Timestamp;
  createdBy: string;
  lastMessage?: {
    text: string;
    userId: string;
    userName: string;
    timestamp: Timestamp;
  };
  members: string[];
  isPrivate: boolean;
}
```

### ChatMessage

```typescript
interface ChatMessage {
  id: string;
  roomId: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: Timestamp;
  editedAt?: Timestamp;
  reactions: MessageReaction[];
  replyTo?: string;
  isDeleted: boolean;
}
```

### MessageReaction

```typescript
interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}
```

### ChatDraft

```typescript
interface ChatDraft {
  roomId: string;
  text: string;
  savedAt: Timestamp;
}
```

## 🔥 Structure Firestore

```
firestore/
├── chatRooms/
│   └── {roomId}/
│       ├── name: string
│       ├── description: string
│       ├── createdAt: timestamp
│       ├── createdBy: string (userId)
│       ├── lastMessage: map
│       ├── members: array<string>
│       └── isPrivate: boolean
│
├── messages/
│   └── {messageId}/
│       ├── roomId: string
│       ├── text: string
│       ├── userId: string
│       ├── userName: string
│       ├── timestamp: timestamp
│       ├── reactions: array<map>
│       └── isDeleted: boolean
│
└── chatDrafts/
    └── {odId-roomId}/
        ├── text: string
        └── savedAt: timestamp
```

## 🗃️ Store Zustand (useChatStore)

### État

```typescript
interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  drafts: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  unreadCounts: Record<string, number>;
}
```

### Actions principales

```typescript
interface ChatActions {
  // Rooms
  fetchRooms: () => Promise<void>;
  createRoom: (name: string, isPrivate: boolean) => Promise<void>;
  selectRoom: (roomId: string) => void;
  
  // Messages
  fetchMessages: (roomId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newText: string) => Promise<void>;
  
  // Reactions
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
  
  // Drafts
  saveDraft: (roomId: string, text: string) => void;
  loadDraft: (roomId: string) => string;
  clearDraft: (roomId: string) => void;
  
  // Real-time subscriptions
  subscribeToRoom: (roomId: string) => () => void;
  subscribeToRooms: () => () => void;
}
```

### Listeners temps réel

```typescript
// Abonnement aux messages d'un salon
const subscribeToRoom = (roomId: string) => {
  const q = query(
    collection(db, 'messages'),
    where('roomId', '==', roomId),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    set({ messages });
  });
};
```

## 🎨 Interface utilisateur

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Chat                                                           │
├────────────────┬────────────────────────────────────────────────┤
│  Salons        │  # Général                                     │
│  ┌────────────┐│  ┌────────────────────────────────────────────┐│
│  │ # Général  ││  │ 10:30 Jean: Bonjour à tous ! 👋            ││
│  │   (3 new)  ││  │       [👍 2] [❤️ 1]                         ││
│  ├────────────┤│  │                                            ││
│  │ # Matinale ││  │ 10:32 Marie: Salut Jean !                  ││
│  │            ││  │                                            ││
│  ├────────────┤│  │ 10:35 Pierre: Réunion à 11h ?              ││
│  │ # Tech     ││  │       [✅ 3]                                ││
│  └────────────┘│  └────────────────────────────────────────────┘│
│                │  ┌────────────────────────────────────────────┐│
│  [+ Salon]     │  │ Tapez votre message...          [Envoyer]  ││
│                │  └────────────────────────────────────────────┘│
└────────────────┴────────────────────────────────────────────────┘
```

### États des messages

| État | Icône | Description |
|------|-------|-------------|
| Envoyé | ✓ | Message envoyé au serveur |
| Distribué | ✓✓ | Message reçu par Firestore |
| Lu | ✓✓ (bleu) | Message lu par destinataires |
| Édité | (modifié) | Message a été modifié |
| Supprimé | 🗑️ | Message supprimé |

## 📝 Exemple d'implémentation

### Page Chat

```tsx
const Chat = () => {
  const { permissions } = useAuthStore();
  const { 
    rooms, 
    currentRoom, 
    messages, 
    selectRoom, 
    sendMessage,
    addReaction 
  } = useChatStore();

  if (!permissions?.can_view_messages) {
    return <AccessDenied message="Vous n'avez pas accès au chat" />;
  }

  return (
    <Layout>
      <div className="flex h-full">
        {/* Liste des salons */}
        <aside className="w-64 border-r">
          <ChatRoomList 
            rooms={rooms}
            currentRoomId={currentRoom?.id}
            onSelectRoom={selectRoom}
          />
        </aside>

        {/* Zone de chat */}
        <main className="flex-1 flex flex-col">
          {currentRoom ? (
            <>
              <ChatRoomHeader room={currentRoom} />
              
              <div className="flex-1 overflow-y-auto p-4">
                {messages.map(message => (
                  <ChatMessage 
                    key={message.id}
                    message={message}
                    onReaction={(emoji) => addReaction(message.id, emoji)}
                  />
                ))}
              </div>

              {permissions.can_send_messages && (
                <ChatInput onSend={sendMessage} />
              )}
            </>
          ) : (
            <EmptyState message="Sélectionnez un salon" />
          )}
        </main>
      </div>
    </Layout>
  );
};
```

### Composant ChatMessage

```tsx
const ChatMessage = ({ message, onReaction }) => {
  const { user, permissions } = useAuthStore();
  const isOwn = message.userId === String(user?.id);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs p-3 rounded-lg ${
        isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100'
      }`}>
        {!isOwn && (
          <span className="text-xs font-semibold">{message.userName}</span>
        )}
        
        <p>{message.text}</p>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs opacity-70">
            {formatTime(message.timestamp)}
          </span>
          
          {message.editedAt && (
            <span className="text-xs opacity-50">(modifié)</span>
          )}
        </div>

        <ChatReactions 
          reactions={message.reactions}
          onAddReaction={onReaction}
        />
      </div>
    </div>
  );
};
```

## ⚠️ Gestion des erreurs

| Erreur | Comportement |
|--------|--------------|
| Offline | Mode hors ligne, queue messages |
| Permission refusée | Message "Accès refusé" |
| Message trop long | Bloquer envoi + message |
| Salon inexistant | Redirect vers liste |

## 🧪 Points de test

- [ ] Création de salon fonctionne
- [ ] Messages s'affichent en temps réel
- [ ] Réactions ajoutées/retirées
- [ ] Brouillons sauvegardés
- [ ] Permissions respectées
- [ ] Messages supprimés masqués
- [ ] Indicateur "en train d'écrire"
- [ ] Compteur non-lus correct
