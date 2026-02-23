export default function DocsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">API Documentation</h1>
        <p className="text-sm text-[var(--color-muted)]">
          OpenAPI + Swagger UI for Runly backend endpoints.
        </p>
      </div>

      <div className="h-[calc(100vh-11rem)] overflow-hidden rounded-2xl border border-black/10 bg-white">
        <iframe
          src="/swagger.html"
          title="Runly Swagger UI"
          className="h-full w-full"
          loading="lazy"
        />
      </div>
    </main>
  );
}
