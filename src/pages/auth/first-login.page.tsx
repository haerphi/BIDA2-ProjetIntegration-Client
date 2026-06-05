import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { memberService } from '../../api/member.service';
import { authService } from '../../api/auth.service';
import { isAxiosError } from 'axios';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import CustomIcon from '../../components/common/Icons/custom-icon';

const firstLoginSchema = z
  .object({
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type FirstLoginFormValues = z.infer<typeof firstLoginSchema>;

export default function FirstLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, tokenPayload } = useAppSelector((state) => state.auth);
  const isFirstLogin = tokenPayload?.is_first_login;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FirstLoginFormValues>({
    resolver: zodResolver(firstLoginSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isFirstLogin) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: FirstLoginFormValues) => {
    try {
      await memberService.setPassword(data.password);
      // Refresh token to get the updated is_first_login claim
      await authService.refreshToken();
      navigate('/');
    } catch (error) {
      console.error('Password update failed:', error);
      if (isAxiosError(error) && error.response) {
        setError('root.serverError', {
          type: 'server',
          message: error.response.data?.detail || 'Une erreur est survenue lors de la mise à jour du mot de passe.',
        });
      } else {
        setError('root.serverError', {
          type: 'server',
          message: 'Une erreur inattendue est survenue.',
        });
      }
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-stone-100 p-3 w-100">
      <div className="card shadow border-0 rounded-4 w-100 overflow-hidden" style={{ maxWidth: '400px' }}>
        <div className="card-header border-0 text-center py-4 bg-emerald-900 text-white rounded-top-4">
          <div
            className="d-flex align-items-center justify-content-center bg-emerald-500 rounded-circle mx-auto mb-3"
            style={{ width: '64px', height: '64px', fontSize: '24px' }}
          >
            <CustomIcon iconName="tennis-ball" className="w-50 h-50" />
          </div>
          <h1 className="h3 mb-1">Première Connexion</h1>
          <p className="mb-0 opacity-75">Veuillez définir votre mot de passe</p>
        </div>
        <div className="card-body p-4 p-sm-5">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-medium small">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                type="password"
                className="form-control form-control-lg fs-6 custom-input"
                placeholder="••••••••"
                required
                {...register('password')}
              />
              {errors.password && <div className="text-danger small mt-1">{errors.password.message}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label fw-medium small">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-control form-control-lg fs-6 custom-input"
                placeholder="••••••••"
                required
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <div className="text-danger small mt-1">{errors.confirmPassword.message}</div>
              )}
            </div>

            {errors.root?.serverError && (
              <div className="alert alert-danger small py-2 mb-3">{errors.root.serverError.message}</div>
            )}

            <button
              type="submit"
              className="btn btn-emerald-600 w-100 py-2 fw-semibold text-white rounded-3"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Mise à jour...' : 'Enregistrer le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
