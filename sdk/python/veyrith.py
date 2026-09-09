from dataclasses import dataclass
from typing import Any
import requests

@dataclass(frozen=True)
class VeyrithClient:
    endpoint: str
    api_key: str
    timeout: float = 60.0

    def _request(self, method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        response = requests.request(method, self.endpoint.rstrip("/") + path, json=payload, headers={"Authorization": f"Bearer {self.api_key}"}, timeout=self.timeout)
        response.raise_for_status()
        return response.json()

    def generate_blueprint(self, brief: str) -> dict[str, Any]:
        return self._request("POST", "/api/v1/blueprints", {"brief": brief})

    def usage(self) -> dict[str, Any]:
        return self._request("GET", "/api/v1/usage")
