package veyrith

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGenerateBlueprint(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != "/api/v1/blueprints" {
			t.Fatalf("unexpected request: %s %s", r.Method, r.URL.Path)
		}
		if r.Header.Get("Authorization") != "Bearer test-key" {
			t.Fatalf("missing auth header")
		}
		var body BriefRequest
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Fatal(err)
		}
		if body.Brief == "" {
			t.Fatal("brief was empty")
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"data":{"title":"Test","generated":true},"meta":{"apiVersion":"v1"}}`))
	}))
	defer server.Close()

	response, err := (Client{Endpoint: server.URL, APIKey: "test-key"}).GenerateBlueprint(context.Background(), "A sufficiently detailed brief for the SDK test.")
	if err != nil {
		t.Fatal(err)
	}
	if response.Data.Title != "Test" || !response.Data.Generated {
		t.Fatalf("unexpected response: %+v", response.Data)
	}
}
