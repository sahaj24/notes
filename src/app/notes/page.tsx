import { BeautifulNote } from '@/components/BeautifulNote';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function NotesPage() {
  return (
    <ProtectedRoute>
      <BeautifulNote />
    </ProtectedRoute>
  );
}
