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
    <section className="py-12 sm:py-24 bg-background">
      <div className="container px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
            Easy integration with your stack
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
            RESTful API with libraries for all major programming languages
          </p>
        </div>
        <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:flex md:flex-wrap md:justify-center md:gap-6 lg:gap-8">
          {integrations.map((integration) => (
            <div
              key={integration}
              className="flex items-center justify-center rounded-lg border bg-card px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-card-foreground shadow-sm"
            >
              <span className="font-medium text-sm sm:text-base">{integration}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 sm:mt-12 text-center overflow-x-auto">
          <pre className="inline-block rounded-lg bg-muted p-4 sm:p-6 text-left text-xs sm:text-sm max-w-full overflow-x-auto">
            <code>{`curl -X POST https://api.validink.io/validate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"email": "user@example.com"}'`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

