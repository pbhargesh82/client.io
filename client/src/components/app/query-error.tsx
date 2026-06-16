export function QueryError({ message }: { message: string }) {
  return (
    <p
      className="rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-[13px] text-destructive"
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
