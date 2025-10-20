import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { SocketService } from '../../../core/services/socket.service'; // ✅ import
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar implements OnInit, OnDestroy {
  userRole: string = '';
  notification: any = null;
  private notifSub?: Subscription;

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.detectUserRole();

    const token = localStorage.getItem('auth_token');
    if (token) {
      const decoded: any = jwtDecode(token);
      const userId = decoded?.id || decoded?._id;

      // ✅ Connexion Socket
      if (userId) {
        this.socketService.connect(userId);
      }

      // ✅ Écoute des notifications
      this.notifSub = this.socketService.notification$.subscribe((notif) => {
        if (notif) {
          this.notification = notif;

          // 👀 Optionnel : la notification disparaît après 5 secondes
          setTimeout(() => (this.notification = null), 5000);
        }
      });
    }
  }

  /** 🔍 Détecte le rôle depuis le token JWT */
  detectUserRole(): void {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      this.userRole = '';
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      this.userRole = decoded?.role?.toLowerCase() || '';
    } catch {
      this.userRole = '';
    }
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
  }
}
