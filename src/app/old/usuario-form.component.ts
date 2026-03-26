import { Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { LoadingService } from '../services/loading.service';
import { Usuario } from '../usuario/novo/usuario.model';
import { Observable, tap } from 'rxjs';
import { of } from 'rxjs';
import { UserStateService } from '../state/user-state.service';
import { AuthService } from '../services/auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';

// CPF validator (basic)
function cpfValido(control: any) {
  const val: string = (control.value || '').replace(/\D/g, '');
  if (!val) return null;
  if (val.length !== 11) return { cpf: true };
  // simple repeated digits check
  if (/^(\d)\1+$/.test(val)) return { cpf: true };
  return null;
}

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzCardModule,
    NzTabsModule,
    NzGridModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzSwitchModule,
    NzBadgeModule,
    NzTableModule,
    NzSkeletonModule,
    NzSpaceModule,
    NzButtonModule,
    NzSelectModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- preserved old usuario-form template -->`
})
export class UsuarioFormComponent implements OnInit {
  // preserved implementation moved to old/
  constructor() {}
  ngOnInit(): void {}
}
