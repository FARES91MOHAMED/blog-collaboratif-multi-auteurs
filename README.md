# 📰 Blog Collaboratif Multi-Auteurs

> **Test Technique – Développeur Fullstack MEAN Stack (Confirmé)**  
> Projet complet de gestion de blog collaboratif avec rôles, permissions, commentaires en temps réel et authentification sécurisée.

---

## 🚀 1. Installation, Exécution et Structure

### ⚙️ 1.1 Installation et Exécution du Projet

| **Partie**   | **Prérequis**                                                                       | **Commandes d'installation et lancement**                                                                                                                                                                                                                                                                                                           |
| ------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Global**   | - Node.js `v22.20.0` <br/> - Angular CLI `v20.3.6` <br/> - MongoDB (locale ou Atlas) | Variables d’environnement à définir dans un fichier `.env` : <br/>`bash `<br/> `MONGO_URI=mongodb+srv://PROJET:bePeUpyYJV_22S-@plateformeblog.ysgtpek.mongodb.net`<br/>`JWT_ACCESS_SECRET=<votre_secret>`<br/>`JWT_REFRESH_SECRET=<votre_secret>`<br/>`VAPID_PUBLIC_KEY=<clé_publique>`<br/>`VAPID_PRIVATE_KEY=<clé_privée>`<br/>`VAPID_EMAIL=<votre_email>`<br/>` |
| **Backend**  | Configurer un fichier `.env` avec `MONGO_URI`, `JWT_SECRET`, etc.                   | `bash`<br/>cd backend/<br/>npm install<br/>npm run dev   # (lancement avec nodemon)<br/>                                                                                                                                                                                                                                                           |
| **Frontend** | Vérifier que l’URL de l’API est correcte dans `environment.ts.                     | `bash`<br/>`cd frontend`/<br/>`npm install`<br/>ng serve<br/>                                                                                                                                                                                                                                                                                          |

#### 🌐 Accès à l’application

- Frontend : [http://localhost:4200/](http://localhost:4200/)
- Backend / API : [http://localhost:5000/](http://localhost:5000/)
- Base URL (Postman) : selon la variable `base_url`

---

### 🧩 1.2 Structure et Choix Techniques

| **Section**      | **Détails techniques**                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| **Backend**      | Node.js (v22.20.0) + Express + MongoDB/Mongoose                                                             |
| **Frontend**     | Angular (CLI v20.3.6)                                                                                       |
| **Temps Réel**   | Socket.io (commentaires & notifications)                                                                    |
| **Sécurité**     | JWT + Refresh Token + Hashing (bcrypt)                                                                      |
| **Architecture** | Architecture en couches (Controllers, Services, Models) côté backend et organisation modulaire côté Angular |

---

## 🧪 2. Tests Unitaires — Validation des Rôles et Permissions

### 🔐 2.1 Validation des Rôles et Permissions

Trois collections principales existent dans la base de données :

- `users`
- `comments`
- `articles`

Chaque utilisateur a un rôle spécifique déterminant ses permissions.

| **Rôle**      | **Email / Nom d'utilisateur** | **Mot de passe** | **Permissions clés**                               |
| ------------- | ----------------------------- | ---------------- | -------------------------------------------------- |
| **Admin**     | `admin@blog.com`              | `admin123`       | Gère les rôles, modifie/supprime tous les articles |
| **Éditeur**   | `editeur@blog.com`            | `editeur123`     | Peut modifier tous les articles                    |
| **Rédacteur** | `redacteur@blog.com`          | `redacteur123`   | Crée et modifie uniquement ses propres articles    |
| **Lecteur**   | `lecteur@blog.com`            | `lecteur123`     | Peut lire les articles et ajouter des commentaires |

> 💡 Par défaut, tout nouvel utilisateur est **Lecteur**.  
> Le rôle peut ensuite être modifié par un **Admin** depuis le front ou directement dans la base de données.

---

### 🧾 2.2 Scénario de Test pour le Correcteur

#### Étapes à suivre (Postman)

1. **Connexion (Admin)**

   - Effectuer une requête `POST /auth/login` avec `admin@blog.com`
   - Récupérer le `{{token}}` JWT pour les tests suivants.

2. **Création d’un article (Rédacteur)**

   - Se connecter avec `redacteur@blog.com`
   - Créer un article (ex : _Article A_)
   - Tenter de modifier cet article → ✅ **Succès attendu**

3. **Modification (Éditeur)**

   - Se connecter avec `editeur@blog.com`
   - Modifier _Article A_ → ✅ **Succès attendu**

4. **Vérification d’autorisation (Échec attendu)**

   - Se reconnecter avec `redacteur@blog.com`
   - Tenter de modifier un article d’un autre rédacteur → ❌ **HTTP 403 Forbidden attendu**

5. **Suppression (Admin)**
   - Se connecter avec `admin@blog.com`
   - Supprimer _Article A_ → ✅ **HTTP 200 / 204 attendu**

---

## 🧰 3. Postman — Configuration et Script Automatisé

### 📁 3.1 Collection JSON

> Importez le fichier : **`Blog API - MEAN Stack.postman_collection.json`**

---

### 💻 3.2 Script de Test (à insérer dans la requête _Login_)

Dans Postman →  
Ouvrir **Auth > Login** → Onglet **Tests**  
et insérer le script suivant :

```javascript
// Postman Tests pour récupérer le Token JWT et le stocker dans la variable d'environnement
var jsonData = JSON.parse(responseBody)

// Vérification de la présence du token
if (jsonData && jsonData.token) {
  pm.collectionVariables.set('token', jsonData.token)
  console.log("✅ Token JWT récupéré et stocké dans la variable 'token'.")
} else {
  console.log('❌ Erreur : Token non trouvé dans la réponse.')
}

// Optionnel : récupérer l'ID utilisateur
if (jsonData && jsonData.user && jsonData.user._id) {
  pm.collectionVariables.set('user_id', jsonData.user._id)
}
```
