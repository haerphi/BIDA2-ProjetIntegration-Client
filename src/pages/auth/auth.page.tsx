import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../api/auth.service';
import { isAxiosError } from 'axios';
import GoogleButton from './components/google-button';
import { useNavigate } from 'react-router-dom';
import CustomIcon from '../../components/common/Icons/custom-icon';

const loginSchema = z.object({
  affiliation_number: z.string().min(1, 'Affiliate number is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      affiliation_number: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await authService.login(data);
      onLoginSuccess();
    } catch (error) {
      console.error('Login failed:', error);
      if (isAxiosError(error) && error.response) {
        setError('root.serverError', {
          type: 'server',
          message: error.response.data?.detail || 'Invalid credentials or server error',
        });
      } else {
        setError('root.serverError', {
          type: 'server',
          message: 'An unexpected error occurred.',
        });
      }
    }
  };

  const onLoginSuccess = () => {
    navigate('/');
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
          <h1 className="h3 mb-1">Tennis Club</h1>
          <p className="mb-0 opacity-75">Espace Membre</p>
        </div>
        <div className="card-body p-4 p-sm-5">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="affiliation_number" className="form-label fw-medium small">
                Numéro d'affiliation AFT
              </label>
              <input
                id="affiliation_number"
                type="text"
                className="form-control form-control-lg fs-6 custom-input"
                placeholder="Ex: 1234567"
                required
                {...register('affiliation_number')}
              />
              <div className="form-text text-stone-500 small mt-1">7 chiffres, ne peut pas commencer par 0.</div>
              {errors.affiliation_number && (
                <div className="text-danger small mt-1">{errors.affiliation_number.message}</div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-medium small">
                Mot de passe
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

            {errors.root?.serverError && (
              <div className="alert alert-danger small py-2 mb-3">{errors.root.serverError.message}</div>
            )}

            <button
              type="submit"
              className="btn btn-emerald-600 w-100 py-2 fw-semibold text-white rounded-3 mb-3"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
            </button>
            <hr />
            <div className="text-center mt-3">
              <GoogleButton handleSuccess={onLoginSuccess} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
