import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: 'login', loadComponent: () => import('./login.component').then(m => m.LoginComponent) },
	{
		path: '',
		loadComponent: () => import('./layout.component').then(m => m.LayoutComponent),
		children: [
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
			{ path: 'dashboard', loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent) },
			{ path: 'form', loadComponent: () => import('./sample-form.component').then(m => m.SampleFormComponent) },
			{ path: 'users', loadComponent: () => import('./users-table.component').then(m => m.UsersTableComponent) },
			{ path: 'clients', loadComponent: () => import('./clients/clients.component').then(m => m.ClientsComponent) }
		]
	},
	{ path: '**', redirectTo: '' }
];
