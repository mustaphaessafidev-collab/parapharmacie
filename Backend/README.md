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