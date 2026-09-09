<?php

declare(strict_types=1);

namespace Veyrith;

use RuntimeException;

final class VeyrithClient
{
    public function __construct(private readonly string $endpoint, private readonly string $apiKey, private readonly int $timeout = 60) {}

    /** @return array<string, mixed> */
    public function generateBlueprint(string $brief): array
    {
        return $this->request('POST', '/api/v1/blueprints', ['brief' => $brief]);
    }

    /** @return array<string, mixed> */
    public function usage(): array
    {
        return $this->request('GET', '/api/v1/usage');
    }

    /** @param array<string, mixed>|null $payload @return array<string, mixed> */
    private function request(string $method, string $path, ?array $payload = null): array
    {
        $ch = curl_init(rtrim($this->endpoint, '/') . $path);
        if ($ch === false) throw new RuntimeException('Could not initialize cURL');
        $headers = ['Authorization: Bearer ' . $this->apiKey, 'Content-Type: application/json'];
        curl_setopt_array($ch, [CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers, CURLOPT_POSTFIELDS => $payload === null ? null : json_encode($payload, JSON_THROW_ON_ERROR), CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => $this->timeout]);
        $body = curl_exec($ch); $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE); $error = curl_error($ch); curl_close($ch);
        if ($body === false) throw new RuntimeException($error ?: 'Veyrith request failed');
        if ($status >= 400) throw new RuntimeException("Veyrith API returned HTTP {$status}");
        return json_decode($body, true, 512, JSON_THROW_ON_ERROR);
    }
}
