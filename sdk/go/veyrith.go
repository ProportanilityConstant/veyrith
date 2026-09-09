package veyrith

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

type Client struct {
	Endpoint, APIKey string
	HTTPClient       *http.Client
}
type BriefRequest struct {
	Brief string `json:"brief"`
}
type BlueprintResponse struct {
	Data Blueprint      `json:"data"`
	Meta map[string]any `json:"meta"`
}
type Blueprint struct {
	Title             string      `json:"title"`
	Summary           string      `json:"summary"`
	Confidence        float64     `json:"confidence"`
	ArchitectureStyle string      `json:"architectureStyle"`
	Assumptions       []string    `json:"assumptions"`
	Components        []Component `json:"components"`
	Risks             []Risk      `json:"risks"`
	NextMove          string      `json:"nextMove"`
	Generated         bool        `json:"generated"`
}
type Component struct {
	Name        string `json:"name"`
	Type        string `json:"type"`
	Description string `json:"description"`
	Health      string `json:"health"`
}
type Risk struct {
	Title    string `json:"title"`
	Detail   string `json:"detail"`
	Severity string `json:"severity"`
}
type UsageResponse struct {
	Data map[string]any `json:"data"`
	Meta map[string]any `json:"meta"`
}

func (c Client) do(ctx context.Context, method, path string, body any, target any) error {
	payload, err := json.Marshal(body)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, method, strings.TrimRight(c.Endpoint, "/")+path, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Content-Type", "application/json")
	client := c.HTTPClient
	if client == nil {
		client = http.DefaultClient
	}
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode >= 400 {
		return fmt.Errorf("veyrith API returned HTTP %d", res.StatusCode)
	}
	return json.NewDecoder(res.Body).Decode(target)
}

func (c Client) GenerateBlueprint(ctx context.Context, brief string) (BlueprintResponse, error) {
	var out BlueprintResponse
	err := c.do(ctx, http.MethodPost, "/api/v1/blueprints", BriefRequest{Brief: brief}, &out)
	return out, err
}
func (c Client) Usage(ctx context.Context) (UsageResponse, error) {
	var out UsageResponse
	err := c.do(ctx, http.MethodGet, "/api/v1/usage", nil, &out)
	return out, err
}
