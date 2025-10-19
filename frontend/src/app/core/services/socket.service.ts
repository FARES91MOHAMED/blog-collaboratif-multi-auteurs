import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

interface CommentNotification {
  title: string;
  message: string;
  articleId?: string;
  commentId?: string;
}

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  public notification$ = new BehaviorSubject<CommentNotification | null>(null);

  /**
   * ✅ Connexion au serveur Socket.io
   * @param userId Identifiant de l'utilisateur (pour rejoindre sa "room")
   */
  connect(userId: string): void {
    if (this.socket) return; // déjà connecté

    // ⚙️ On retire /api de l’URL si présent (car le socket n’écoute pas sur /api)
    const socketUrl = environment.apiUrl.replace(/\/api$/, '');

    this.socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connecté :', this.socket?.id);
      this.socket?.emit('joinUserRoom', userId);
    });

    // 🔔 Notification reçue depuis le serveur
    this.socket.on('commentNotification', (data: CommentNotification) => {
      console.log('📩 Notification reçue :', data);
      this.notification$.next(data);

      // ✅ Tente d'afficher une notification navigateur
      this.displayBrowserNotification(data);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ Socket déconnecté :', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('🚨 Erreur de connexion Socket.io :', err.message);
    });
  }

  /**
   * ✅ Gère les notifications natives du navigateur
   */
  private async displayBrowserNotification(data: CommentNotification): Promise<void> {
    try {
      if (!('Notification' in window)) {
        console.warn('Les notifications ne sont pas supportées par ce navigateur.');
        return;
      }

      // Demande la permission si pas encore donnée
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      if (Notification.permission === 'granted') {
        new Notification(data.title || 'Nouvelle notification', {
          body: data.message,
          icon: '/assets/icons/notification-icon.png'
        });
      } else {
        console.log('🔕 Permission de notification refusée.');
      }
    } catch (err) {
      console.error('Erreur lors de l’affichage de la notification :', err);
    }
  }

  /**
   * ✅ Déconnexion propre du socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔴 Socket déconnecté proprement.');
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
