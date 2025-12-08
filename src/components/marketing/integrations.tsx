export function IntegrationsSection() {
  const integrations = [
    'JavaScript',
    'Python',
    'PHP',
    'Ruby',
    'Node.js',
    'Java',
    'C#',
    'Go',
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Easy integration with your stack
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            RESTful API with libraries for all major programming languages
          </p>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          {integrations.map((integration) => (
            <div
              key={integration}
              className="flex items-center justify-center rounded-lg border bg-card px-8 py-4 text-card-foreground shadow-sm"
            >
              <span className="font-medium">{integration}</span>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <pre className="inline-block rounded-lg bg-muted p-6 text-left text-sm">
            <code>{`curl -X POST https://api.emailpro.com/validate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"email": "user@example.com"}'`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

