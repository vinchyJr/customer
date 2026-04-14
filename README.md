# customer-service

Microservice de gestion des clients et de leurs adresses de livraison.
Fait partie du projet Mini Zalando (TP Microservices).

## Port

`8002`

## Lancement

```bash
docker compose up --build
```

Le service démarre automatiquement, applique les migrations et charge les données de test.

## Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/customers/` | Liste tous les clients |
| GET | `/api/customers/<id>/` | Détail d'un client (404 si inexistant) |
| GET | `/api/customers/<id>/addresses/` | Adresses d'un client |

## Exemples de requêtes

```bash
# Lister tous les clients
curl http://localhost:8002/api/customers/

# Détail du client 1
curl http://localhost:8002/api/customers/1/

# Adresses du client 1
curl http://localhost:8002/api/customers/1/addresses/

# Client inexistant → 404
curl http://localhost:8002/api/customers/999/
```

## Format JSON

### GET /api/customers/
```json
[
  {
    "id": 1,
    "first_name": "Sarah",
    "last_name": "Benali",
    "email": "sarah.benali@example.com",
    "phone": "0600000001",
    "is_active": true
  }
]
```

### GET /api/customers/1/addresses/
```json
[
  {
    "id": 1,
    "street": "12 rue des Lilas",
    "postal_code": "38000",
    "city": "Grenoble",
    "country": "France",
    "is_default": true
  }
]
```

## Données de test

5 clients pré-chargés :
- Sarah Benali (2 adresses)
- Lucas Martin (2 adresses)
- Emma Dupont
- Thomas Bernard
- Julie Moreau

## Responsabilité métier

Ce service gère **uniquement** les clients et leurs adresses.
Il ne gère ni les produits (catalog-service) ni les commandes (order-service).
