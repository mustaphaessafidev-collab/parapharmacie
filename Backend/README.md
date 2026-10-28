## API : Inscription

- **Méthode :** POST
- **URL :** `http://localhost:5000/api/auth/register`
- **Description :** Créer un nouveau compte utilisateur.

**Body (JSON) :**

```json
{
  "fullName": "Mustapha Essafi",
  "email": "mustapha@example.com",
  "phone": "+212610000000",
  "password": "Test123456",
  "confirmPassword": "Test123456"
}
```

**Réponse :** `201 Created`

```json
{
  "success": true,
  "message": "Inscription réussie",
  "user": {
    "id": "uuid",
    "firstName": "Mustapha",
    "lastName": "Essafi",
    "email": "mustapha@example.com",
    "phone": "+212610000000",
    "emailVerified": false,
    "createdAt": "2026-10-15T20:09:25.917Z"
  }
}
```

**Erreurs possibles :**
- `400` : données invalides ou compte déjà existant.
- `500` : erreur interne du serveur.

### API : Connexion (Login)

- **Méthode :** POST
- **URL :** `http://localhost:5000/api/auth/login`
- **Description :** Authentifier un utilisateur et générer un token JWT.

**Body (JSON) :**

```json
{
  "email": "mustapha@example.com",
  "password": "Test123456"
}
```

**Réponse :** `200 OK`

```json
{
  "success": true,
  "message": "Connexion réussie",
  "token": "JWT_TOKEN",
  "user": {
    "id": "uuid",
    "firstName": "Mustapha",
    "lastName": "Essafi",
    "email": "mustapha@example.com",
    "phone": "+212610000000",
    "role": "CLIENT",
    "emailVerified": false
  }
}
```

**Erreurs possibles :**
- `400` : email ou mot de passe incorrect, ou champ manquant.
- `403` : compte désactivé.
- `500` : erreur interne du serveur.

 ### API : Vérification de l'email

### Méthode : POST

### URL : http://localhost:5000/api/auth/verify-email

### Description : Vérifier le code reçu par email et activer le compte utilisateur.

### Body (JSON) :
```json

{
  "email": "adresse@email.com",
  "code": "123456"
}

```
### Réponse : 200 OK
```json
{
  "success": true,
  "message": "Adresse email vérifiée avec succès"
}

Erreurs possibles :

### 400 : email ou code manquant.

### 400 : utilisateur introuvable.

### 400 : code invalide, expiré ou déjà utilisé.

### 500 : erreur interne du serveur.

### Remarque : Le code contient 6 chiffres et expire après 10 minutes. Après vérification, emailVerified passe à true.

## Développement uniquement

Le seed ne se lance pas avec le serveur. Il faut l'exécuter à la main depuis `Backend`, et il s'arrête immédiatement si `NODE_ENV=production`, avant toute lecture des mots de passe.

```bash
npx prisma db seed
```

Les mots de passe ne sont pas dans le dépôt. Ils sont lus depuis `Backend/.env`, qui est ignoré par Git :

```text
SEED_ADMIN_PASSWORD=replace-with-a-local-password
SEED_CLIENT_PASSWORD=replace-with-a-local-password
SEED_LIVREUR_PASSWORD=replace-with-a-local-password
```

Le script peut être relancé. Il ne duplique pas les catégories, les produits ni les commandes de démonstration, et il ne modifie pas un compte admin ou livreur déjà présent. Les comptes reconnus sont `admin@admin.com`, `client.demo@atlaspara.test` et `livreur@atlaspara.com`. Le client de démonstration est déjà vérifié. Les produits portent la marque « Catalogue démo AtlasPara » et une référence `AP-DEMO`. Les commandes de démonstration ont une adresse qui commence par `DEMO`.