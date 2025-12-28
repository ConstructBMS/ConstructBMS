import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { estimatesRepo } from '../data/estimatesRepo';
import { useAuth } from '../../../app/authShim';
import { Card } from '../../../ui/Card';
import { Button } from '../../../ui/Button';

export function EstimatesPage() {
  const nav = useNavigate();
  const { companyId } = useAuth();

  const { data } = useQuery({
    queryKey: ['estimates', companyId],
    queryFn: () => estimatesRepo.list(companyId!),
    enabled: !!companyId,
  });

  const create = useMutation({
    mutationFn: () => estimatesRepo.create(companyId!, 'New Estimate'),
    onSuccess: e => nav(`/estimating/${e.id}`),
  });

  return (
    <div className="space-y-4">
      <Button onClick={() => create.mutate()} disabled={!companyId}>
        Create Estimate
      </Button>
      {!companyId ? (
        <div className="text-sm text-slate-600">
          No company selected. Ensure you are signed in and have a
          company_memberships row.
        </div>
      ) : null}
      {data?.map(e => (
        <Card key={e.id} onClick={() => nav(`/estimating/${e.id}`)}>
          {e.title}
        </Card>
      ))}
    </div>
  );
}

