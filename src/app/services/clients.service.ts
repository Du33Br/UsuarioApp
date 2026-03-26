import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Client { id?: number; name: string; email?: string; phone?: string }

@Injectable({ providedIn: 'root' })
export class ClientsService {
  // Use configured n8n workflow id when available; otherwise call backend API under `/api/Clients`.
  // Set `n8nWorkflowId` in `src/environments/environment.ts` when you import/activate the workflow in n8n.
  private workflowId = environment.n8nWorkflowId || '';
  private webhookUrl = this.workflowId ? `http://localhost:5678/webhook/${this.workflowId}/clients` : '';
  private readonly base = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // list all clients
  list(): Observable<Client[]> {
    if (this.webhookUrl) {
      return this.http.post<Client[]>(this.webhookUrl, {});
    }
    return this.http.get<Client[]>(`${this.base}/api/Clients`);
  }

  // create client
  create(client: Client): Observable<Client> {
    if (this.webhookUrl) {
      return this.http.post<Client>(this.webhookUrl, client);
    }
    return this.http.post<Client>(`${this.base}/api/Clients`, client);
  }

  // delete client by id
  delete(id: number): Observable<any> {
    if (this.webhookUrl) {
      return this.http.post(this.webhookUrl, { id, _action: 'delete' });
    }
    return this.http.delete(`${this.base}/api/Clients/${id}`);
  }
}
