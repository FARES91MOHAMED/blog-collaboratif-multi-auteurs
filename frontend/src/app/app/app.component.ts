import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../core/services/socket.service';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Blog collaboratif multi-auteurs';
  notificationMessage: string | null = null;
  private socketSub!: Subscription;
  private userSub!: Subscription;

  constructor(
    private socketService: SocketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 🔹 Surveille l'utilisateur connecté
    this.userSub = this.authService.user$.subscribe(user => {
      if (user && user['_id']) {
  this.socketService.connect(user['_id']);

        // Écoute les notifications du service
        this.socketSub = this.socketService.notification$.subscribe((notif) => {
          if (notif) this.showToast(`${notif.title} — ${notif.message}`);
        });
      } else {
        // Si l’utilisateur se déconnecte → déconnecte le socket
        this.socketService.disconnect();
      }
    });
  }

  /**
   * ✅ Affiche un toast de notification Bootstrap
   */
  showToast(message: string): void {
    this.notificationMessage = message;

    const toastEl = document.getElementById('liveToast');
    if (toastEl) {
      const toast = new (window as any).bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
    this.socketSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }
}
