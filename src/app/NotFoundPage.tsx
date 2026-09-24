import { FileQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { paths } from './paths';

export function NotFoundPage() {
  return (
    <Card>
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={
          <Link to={paths.dashboard} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Back to dashboard
          </Link>
        }
      />
    </Card>
  );
}
