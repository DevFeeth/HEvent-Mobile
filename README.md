# HEvent Mobile

Application mobile de billetterie d'événements (React Native / Expo) : découvrir les événements autour de soi, acheter ses billets, présenter son QR code à l'entrée et, pour les organisateurs, gérer ses événements et scanner les billets.

Projet réalisé dans le cadre de l'UE **Programmation et nouvelles technologies** (Henallux) par Maxime, Nolan et Florian.

## Dépôts

| Partie | Lien |
|---|---|
| Application mobile | https://github.com/DevFeeth/HEvent-Mobile |
| API REST + base de données | https://github.com/DevFeeth/HEvent-api |

## Ressources individuelles

| Membre | Ressource | Slice Redux |
|---|---|---|
| Maxime | Utilisateurs (inscription, connexion, profil) | `auth` (global) |
| Nolan | Événements | `events` |
| Florian | Billets et types de billets | `tickets` |

## Prérequis

- **Node.js 24** et npm
- **Docker Desktop** (pour l'API et la base de données)
- **Android Studio** avec un émulateur Android, **ou** un téléphone Android avec l'application **Expo Go** (SDK 58), connecté au même réseau Wi-Fi que le PC

## Lancement

### 1. L'API (Docker)

```bash
git clone https://github.com/DevFeeth/HEvent-api.git
cd HEvent-api
```

Créer le fichier `.env` à partir de `.env.example` (le `.env` complet de l'équipe est fourni avec la remise : les mots de passe des comptes de test dépendent de son `PEPPER`), puis :

```bash
docker compose up --build
```

L'API répond sur http://localhost:3001/api/v1/health. La base est créée et remplie automatiquement (comptes, événements, billets de démonstration). Le détail est dans le README de l'API.

### 2. L'application mobile (Android)

```bash
git clone https://github.com/DevFeeth/HEvent-Mobile.git
cd HEvent-Mobile
npm install
```

Créer le fichier `.env` à partir de `.env.example`. Toutes les valeurs sont facultatives :
- `EXPO_PUBLIC_API_HOST` : laissé vide, l'adresse de l'API est détectée automatiquement (`10.0.2.2` sur l'émulateur Android, l'IP du PC sur un téléphone avec Expo Go) ;
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` : sans clé, l'application fonctionne mais n'affiche pas les distances en voiture.

Puis lancer :

```bash
npx expo start
```

- **Émulateur** : démarrer l'émulateur dans Android Studio, puis appuyer sur `a` dans le terminal d'Expo.
- **Téléphone** : scanner le QR code affiché avec Expo Go.

En cas de changement de réseau ou d'adresse IP, relancer en vidant le cache :

```bash
npx expo start --clear
```

Si le téléphone n'atteint pas l'API, vérifier que le pare-feu Windows autorise les connexions entrantes sur le port **3001**.

## Comptes de test

Voir [login.txt](login.txt). Tous les comptes ont le mot de passe `password` :
`user@mail.com` (utilisateur), `orga@mail.com` (organisateur), `admin@mail.com` (administrateur).

## Fonctionnalités

**Tout le monde**
- Accueil avec les prochains événements et leur distance en voiture
- Liste des événements avec recherche, filtres par catégorie, date et distance
- Détail d'un événement : adresse, horaires, types de billets et places restantes

**Utilisateur connecté**
- Achat de billets avec code promo, puis paiement simulé (réservation de 15 minutes, annulée si on quitte le paiement)
- Mes billets (actifs et historique) et QR code d'entrée, renouvelé automatiquement
- Modification du profil

**Organisateur et administrateur**
- Création, modification et suppression de ses événements
- Gestion des types de billets avec le nombre de billets vendus
- Scan des QR codes à l'entrée avec la caméra

## Choix techniques

- **Redux Toolkit** : un store avec des slices globaux (`auth`, `categories`, `network`) et un slice par ressource individuelle (`events`, `tickets`).
- **JWT** stocké dans **expo-secure-store** (chiffré). Le token n'est pas dans Redux. Un token refusé par l'API (401) déconnecte automatiquement l'utilisateur.
- **Fonctionnalités natives** : caméra (scan des QR codes), géolocalisation (distance et adresse des événements), état du réseau (bandeau « Hors connexion »).
- **API externe** : Google Routes pour les distances en voiture.
- **Validation des formulaires** pendant la saisie et à l'envoi. Mot de passe selon la norme **NIST SP 800-63B** (8 caractères minimum, mots de passe courants refusés).
- **Requêtes annulées** (`AbortController`) quand on quitte un écran avant la réponse.

## Structure

```
App.js                Provider Redux, navigation, restauration de session, bandeau hors connexion
src/
├── api/              Client HTTP (JWT, timeout, erreurs) et configuration de l'URL de l'API
├── components/       Composants réutilisables (formulaires, cartes, popups…)
├── constants/        Couleurs, statuts, traductions des messages de l'API, mots de passe courants
├── hooks/            Hooks personnalisés (useAuth, useFetch, useStoreLoader, useFormErrors…)
├── navigation/       Onglets et piles d'écrans (React Navigation)
├── screens/          Écrans de l'application
├── services/         Appels à l'API par ressource
├── store/            Store Redux et slices
└── utils/            Formatage, gestion des erreurs, validateurs
```

## Commandes utiles

```bash
npm run lint
```
