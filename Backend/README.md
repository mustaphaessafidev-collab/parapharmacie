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