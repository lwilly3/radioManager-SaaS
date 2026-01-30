# 🚀 Quick Start - Agent Skills

## Activation rapide

Les Agent Skills sont **déjà actifs** dans VS Code grâce à la configuration automatique.

## 📖 Utilisation

### Pour les développeurs

Posez vos questions normalement, l'agent activera automatiquement les skills appropriés :

```
✅ "Explique-moi le projet"
   → Active: project-overview

✅ "Crée un composant QuoteFilter"
   → Active: project-overview → architecture → coding-standards

✅ "Refactorise ce code pour mieux séparer la logique"
   → Active: architecture → coding-standards

✅ "Commit les changements"
   → Active: workflow-git

✅ "Crée une nouvelle version 1.3.0"
   → Active: project-overview → workflow-git
```

### Pour les agents IA

Les skills sont consultés automatiquement selon le contexte :

| Contexte | Skill activé |
|----------|--------------|
| Question sur le projet | `project-overview` |
| Écriture de code | `coding-standards` |
| Décision architecturale | `architecture` |
| Git/Versioning | `workflow-git` |

## 📚 Documentation complète

- **[README.md](./README.md)** : Vue d'ensemble et guide complet
- **[DELIVERABLES.md](./DELIVERABLES.md)** : Récapitulatif technique

## 🎯 Skills disponibles

| Skill | Description rapide |
|-------|-------------------|
| [project-overview](./project-overview/SKILL.md) | Vision globale du projet RadioManager SaaS |
| [coding-standards](./coding-standards/SKILL.md) | Standards TypeScript/React, conventions |
| [architecture](./architecture/SKILL.md) | Patterns architecturaux, organisation code |
| [workflow-git](./workflow-git/SKILL.md) | Git workflow, versioning, commits |

## ⚡ Actions rapides

### Consulter un skill spécifique
```bash
# Voir project-overview
cat .github/skills/project-overview/SKILL.md

# Voir coding-standards
cat .github/skills/coding-standards/SKILL.md
```

### Tester l'activation
Demandez à l'agent :
```
"Crée un composant Card réutilisable avec TypeScript strict"
```

L'agent devrait automatiquement :
1. ✅ Consulter `project-overview` (structure)
2. ✅ Consulter `architecture` (où créer)
3. ✅ Consulter `coding-standards` (comment écrire)
4. ✅ Créer le fichier avec types stricts
5. ✅ Proposer un commit avec format conventionnel

## 🔧 Configuration

Vérifiez que `.vscode/settings.json` contient :

```json
{
  "chat.useAgentSkills": true,
  "chat.agentSkills.path": ".github/skills"
}
```

## ✅ Validation

Le système fonctionne si l'agent :
- ✅ Respecte les conventions de nommage
- ✅ Suit la structure de fichiers du projet
- ✅ Utilise TypeScript strict (pas de `any`)
- ✅ Crée des commits conventionnels
- ✅ Organise le code selon l'architecture définie

## 🆘 Troubleshooting

### L'agent ne suit pas les conventions

1. Vérifiez que `.vscode/settings.json` existe
2. Vérifiez que `chat.useAgentSkills: true`
3. Relancez VS Code si nécessaire
4. Mentionnez explicitement le skill : "En suivant coding-standards, crée..."

### Besoin de plus de détails

Consultez directement les fichiers SKILL.md :
- **Conventions de code** → `coding-standards/SKILL.md`
- **Décisions architecturales** → `architecture/SKILL.md`
- **Workflow Git** → `workflow-git/SKILL.md`

## 📞 Support

Documentation complète disponible dans :
- `.github/skills/README.md`
- `.github/skills/DELIVERABLES.md`
- Chaque dossier de skill contient un SKILL.md détaillé

---

**Prêt à utiliser ! Les skills guideront automatiquement l'agent dans ses décisions.** 🎉
