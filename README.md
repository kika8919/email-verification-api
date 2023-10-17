# email-verification-api

An email verification api for LUCID GROWTH.

## POST /api/verify-email HTTP/1.1

Host: localhost:4000
Content-Type: application/json

### Request Body :

```
    {
        "emails": [
            "kavitagupta.gupta123@gmail.com",
            "apple@gmail.com",
            "sagar@gmail.com"
        ]
    }
```

### Response :

```

    {
        "emails": [
            {
                "email": "kavitagupta.gupta123@gmail.com",
                "isValid": true,
                "isCatchAllEmail": false
            },
            {
                "email": "apple@gmail.com",
                "isValid": true,
                "isCatchAllEmail": false
            },
            {
                "email": "sagar@gmail.com",
                "isValid": true,
                "isCatchAllEmail": false
            }
        ]
    }
```
