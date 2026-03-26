import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  public loading = signal(false);
  start() { this.loading.set(true); }
  stop() { this.loading.set(false); }
}
