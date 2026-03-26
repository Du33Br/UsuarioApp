import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.estaAutenticado();

  // debug: log token state and requested URL (ver no console do navegador)
  try {
    // eslint-disable-next-line no-console
    // debug log removed
  } catch (e) {
    // ignore
  }

  if (isAuthenticated) {
    return true;
  }

  // Redirecionar para login se não autenticado, preservando a URL de retorno
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
