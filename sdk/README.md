# Official Veyrith clients

These lightweight first-party clients target the stable `v1` REST contract.

| Language | Package location | Intended publication target                                  |
| -------- | ---------------- | ------------------------------------------------------------ |
| Go       | `sdk/go`         | Go module `github.com/ProportanilityConstant/veyrith/sdk/go` |
| Python   | `sdk/python`     | PyPI package `veyrith-client`                                |
| C#       | `sdk/csharp`     | NuGet package `Veyrith.Client`                               |
| PHP      | `sdk/php`        | Packagist package `veyrith/client`                           |

All clients require a server-side API key and expose blueprint generation plus the 24-hour usage summary. They intentionally do not persist or log the key. Package publication can be automated once the repository owners configure the corresponding registry credentials and release workflow.
