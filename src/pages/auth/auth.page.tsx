import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService, type LoginResponse } from '../../api/auth.service';
import { isAxiosError } from 'axios';
import GoogleButton from './components/google-button';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials, parseJwt } from '../../store/slices/auth.slice';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  affiliation_number: z.string().min(1, 'Affiliate number is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const dispatch = useAppDispatch();
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
      const response = await authService.login(data);
      console.log('Login successful:', response);
      onLoginSuccess(response);
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

  const onLoginSuccess = (response: LoginResponse) => {
    dispatch(setCredentials({ token: response.access }));
    navigate('/');
  };

  return (
    <>
      <h1>Auth</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="affiliation_number">Affiliation Number:</label>
          <input id="affiliation_number" type="text" required {...register('affiliation_number')} />
          {errors.affiliation_number && <p>{errors.affiliation_number.message}</p>}
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input id="password" type="password" required {...register('password')} />
          {errors.password && <p>{errors.password.message}</p>}
        </div>
        {errors.root?.serverError && <p style={{ color: 'red' }}>{errors.root.serverError.message}</p>}
        <button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <GoogleButton handleSuccess={onLoginSuccess} />
    </>
  );
}
