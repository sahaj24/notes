'use client';

export default function ErrorBoundary({ error, reset }: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="error-boundary">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}