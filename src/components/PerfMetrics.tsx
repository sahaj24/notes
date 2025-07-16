useEffect(() => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.log('[Perf]', entry.name, entry.duration.toFixed(2), 'ms');
    });
  });
  observer.observe({ type: 'longtask', buffered: true });
  return () => observer.disconnect();
}, []);