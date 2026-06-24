import { Navigate, useParams } from 'react-router-dom';

export default function ClientLegacyRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/clients?client=${id}` : '/clients'} replace />;
}
