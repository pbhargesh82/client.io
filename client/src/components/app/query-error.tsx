export function QueryError({ message }: { message: string }) {
  return (
    <p
      className="rounded border border-error/25 bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-error"
      role="alert"
    >
      {message}
    </p>
  );
}

export function FormAlert({ message }: { message: string }) {
  return (
    <div className="mb-4">
      <QueryError message={message} />
    </div>
  );
}
