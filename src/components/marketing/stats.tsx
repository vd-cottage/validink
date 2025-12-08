export function StatsSection() {
  const stats = [
    { value: '99.6%', label: 'Accuracy Rate' },
    { value: '10M+', label: 'Emails Validated' },
    { value: '<50ms', label: 'Average Response Time' },
    { value: '5K+', label: 'Happy Customers' },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-primary">{stat.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

