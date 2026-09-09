# Veyrith integrations

Veyrith's product UI and server-side AI orchestration are implemented in TypeScript because that is the strongest fit for the current React, tRPC, and WebDev runtime. The product does not need a forced rewrite into another language to be production-quality.

The architecture boundary is a versioned, authenticated REST API. Set `VEYRITH_API_KEY` in the server environment, then send `Authorization: Bearer <key>` to `POST /api/v1/blueprints`. The request body is `{ "brief": "..." }`, where the brief is 20–5000 characters. The response is `{ "data": { ...blueprint }, "meta": { "apiVersion": "v1", "advisory": true } }`. Never put the API key in browser code, mobile binaries, or source control. Generated architecture is advisory output and requires human review.

## Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "os"
)

type Brief struct { Brief string `json:"brief"` }

func requestBlueprint(endpoint string, brief Brief) (*http.Response, error) {
    payload, err := json.Marshal(brief)
    if err != nil { return nil, err }
    req, err := http.NewRequest(http.MethodPost, endpoint+"/api/v1/blueprints", bytes.NewReader(payload))
    if err != nil { return nil, err }
    req.Header.Set("Authorization", "Bearer "+os.Getenv("VEYRITH_API_KEY"))
    req.Header.Set("Content-Type", "application/json")
    return http.DefaultClient.Do(req)
}

func main() { response, _ := requestBlueprint("https://your-veyrith-host", Brief{Brief: "Build a reliable marketplace checkout API."}); fmt.Println(response.Status) }
```

## Python

```python
import os
import requests

def request_blueprint(endpoint: str, brief: str) -> dict:
    response = requests.post(
        f"{endpoint}/api/v1/blueprints",
        json={"brief": brief},
        headers={"Authorization": f"Bearer {os.environ['VEYRITH_API_KEY']}"},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()
```

## C#

```csharp
using System.Net.Http.Headers;
using System.Net.Http.Json;

public sealed record Brief(string BriefText);

public static async Task<HttpResponseMessage> RequestBlueprint(
    HttpClient client, string endpoint, string apiKey, string brief, CancellationToken ct)
{
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
    return await client.PostAsJsonAsync($"{endpoint}/api/v1/blueprints", new { brief }, ct);
}
```

## PHP

```php
<?php
$payload = json_encode([
    'brief' => 'Build a reliable marketplace checkout API with idempotent payments.',
], JSON_THROW_ON_ERROR);

$ch = curl_init($_ENV['VEYRITH_ENDPOINT'] . '/api/v1/blueprints');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $_ENV['VEYRITH_API_KEY'],
    ],
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 60,
]);
$result = curl_exec($ch);
if ($result === false) { throw new RuntimeException(curl_error($ch)); }
curl_close($ch);
```

## Response and error contract

The API returns `401 Unauthorized` when the Bearer token is missing or invalid, `400 Bad Request` when the brief is missing or outside the supported length, and `200 OK` with the blueprint envelope when generation succeeds. The server may return a seeded blueprint with `data.generated: false` if the AI provider is temporarily unavailable; clients should surface that state rather than presenting it as a fresh model result.

## Official client packages

The repository includes first-party clients in [`sdk/`](../sdk/README.md): a Go module, Python package, .NET package, and PHP Composer package. They call the same authenticated v1 contract and expose both blueprint generation and the 24-hour usage summary. See [`docs/api.md`](api.md) for rotation, rate limiting, and deployment guidance.
