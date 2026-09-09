using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace Veyrith.Client;

public sealed class VeyrithClient(HttpClient httpClient, string endpoint, string apiKey)
{
    public async Task<BlueprintEnvelope> GenerateBlueprintAsync(string brief, CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, $"{endpoint.TrimEnd('/')}/api/v1/blueprints")
        { Content = JsonContent.Create(new { brief }) };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        using var response = await httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<BlueprintEnvelope>(cancellationToken: cancellationToken))!;
    }

    public async Task<UsageEnvelope> GetUsageAsync(CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"{endpoint.TrimEnd('/')}/api/v1/usage");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        using var response = await httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<UsageEnvelope>(cancellationToken: cancellationToken))!;
    }
}

public sealed record BlueprintEnvelope(Blueprint Data, Dictionary<string, object> Meta);
public sealed record UsageEnvelope(Dictionary<string, object> Data, Dictionary<string, object> Meta);
public sealed record Blueprint(string Title, string Summary, double Confidence, string ArchitectureStyle, string[] Assumptions, Component[] Components, Risk[] Risks, string NextMove, bool Generated);
public sealed record Component(string Name, string Type, string Description, string Health);
public sealed record Risk(string Title, string Detail, string Severity);
