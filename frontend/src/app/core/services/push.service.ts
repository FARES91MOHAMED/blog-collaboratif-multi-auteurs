import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushService {
  private publicKey = 'TA_CLE_VAPID_PUBLIC'; // tu vas la générer côté backend

  constructor(private swPush: SwPush, private http: HttpClient) {}

  subscribeToNotifications() {
    if (!this.swPush.isEnabled) {
      console.warn('🚫 Service Worker non activé ou notifications non supportées.');
      return;
    }

    this.swPush.requestSubscription({ serverPublicKey: this.publicKey })
      .then(sub => {
        console.log('✅ Abonné aux notifications', sub);
        this.http.post(`${environment.apiUrl}/api/notifications/subscribe`, sub)
          .subscribe(() => console.log('✅ Abonnement enregistré sur le serveur'));
      })
      .catch(err => console.error('❌ Erreur abonnement Web Push :', err));
  }
}
