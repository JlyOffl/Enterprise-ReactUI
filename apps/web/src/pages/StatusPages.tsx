import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState } from '../components/ui';

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <EmptyState
      icon="search"
      title={t('errors.notFound')}
      description={t('errors.notFoundBody')}
      action={<Button onClick={() => navigate('/')}>{t('nav.dashboard')}</Button>}
    />
  );
}

export function AccessDenied() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <EmptyState
      icon="shield"
      title={t('auth.accessDenied')}
      description={t('auth.accessDeniedBody')}
      action={
        <Button variant="secondary" onClick={() => navigate('/')}>
          {t('common.back')}
        </Button>
      }
    />
  );
}

export default NotFoundPage;
