import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: '', redirectTo: 'app/dashboard', pathMatch: 'full' },
	{ path: 'login', loadComponent: () => import('./logins/login.component').then(m => m.LoginComponent) },
	{
		path: 'app',
		canActivate: [authGuard],
		loadComponent: () => import('./layout.component').then(m => m.LayoutComponent),
		children: [
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
			{ path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
			{ path: 'form', loadComponent: () => import('./sample-form.component').then(m => m.SampleFormComponent) },
			{ path: 'users', loadComponent: () => import('./users/users-list.component').then(m => m.UsersListComponent) },
			{ path: 'usuario', loadComponent: () => import('./users/users-list.component').then(m => m.UsersListComponent) },
			{ path: 'logins', loadComponent: () => import('./users/users-list.component').then(m => m.UsersListComponent) },
			{ path: 'logins/novo', loadComponent: () => import('./logins/form/login-form.component').then(m => m.LoginFormComponent) },
			{ path: 'usuario/novo', loadComponent: () => import('./usuario/novo/usuario.component').then(m => m.UsuarioComponent) },
			{ path: 'logins/edit/:id', loadComponent: () => import('./logins/form/login-form.component').then(m => m.LoginFormComponent) },
			{ path: 'logins/view/:id', loadComponent: () => import('./logins/form/login-form.component').then(m => m.LoginFormComponent), data: { readonly: true } },
			{ path: 'clients', loadComponent: () => import('./clients/clients.component').then(m => m.ClientsComponent) },
			{ path: 'unidades', loadComponent: () => import('./unidades/unidade.component').then(m => m.UnidadeComponent) },
			{ path: 'unidades/novo', loadComponent: () => import('./unidades/form/unidade-form.component').then(m => m.UnidadeFormComponent) },
			{ path: 'unidades/:id/editar', loadComponent: () => import('./unidades/form/unidade-form.component').then(m => m.UnidadeFormComponent) },
			{ path: 'unidades/view/:id', loadComponent: () => import('./unidades/form/unidade-form.component').then(m => m.UnidadeFormComponent), data: { readonly: true } },
			// perfil do login autenticado
			{ path: 'perfil', loadComponent: () => import('./perfil.component').then(m => m.PerfilComponent) },
			{ path: 'perfil/novo', loadComponent: () => import('./perfil.component').then(m => m.PerfilComponent) },
			{ path: 'perfil/:id', loadComponent: () => import('./perfil.component').then(m => m.PerfilComponent) },
			// admin usuario dentro do layout `/app`
			{ path: 'admin/usuario', loadComponent: () => import('./users/users-form.component').then(m => m.UsersFormComponent) },
			{ path: 'admin/usuario/:id', loadComponent: () => import('./users/users-form.component').then(m => m.UsersFormComponent) },
			// removed: admin usuario view (replaced by /app/usuarios/view/:id using UsuarioFormComponent in read-only)
		]
	},
	// rota admin para edição de usuário (lazy load do componente) — REMOVIDA: agora está sob /app children
	{ path: '**', redirectTo: 'login' }
];
