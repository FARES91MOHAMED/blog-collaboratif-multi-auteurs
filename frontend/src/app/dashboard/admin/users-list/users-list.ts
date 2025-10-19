import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // ✅ pour ngModel

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ ajoute FormsModule ici
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.scss']
})
export class UsersList implements OnInit {
  users: any[] = [];
  roles = ['admin', 'editeur', 'redacteur', 'lecteur'];
   editedRoles: { [key: string]: string } = {}

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<any[]>('http://localhost:5000/api/users').subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error('Erreur chargement utilisateurs:', err)
    });
  }

   saveRole(user: any): void {
    const newRole = this.editedRoles[user._id];
    if (!newRole || newRole === user.role) return; // rien à faire

    console.log(`🔄 Mise à jour du rôle de ${user.name} vers ${newRole}`);

    this.http.put(`http://localhost:5000/api/users/${user._id}/role`, { role: newRole }).subscribe({
      next: (res: any) => {
        user.role = newRole;
        delete this.editedRoles[user._id];
        console.log(`✅ Rôle mis à jour pour ${user.name}: ${newRole}`);
        alert(`Rôle de ${user.name} mis à jour : ${newRole}`);
      },
      error: (err) => console.error('❌ Erreur mise à jour rôle:', err)
    });
  }

  confirmDelete(user: any): void {
    if (confirm(`Supprimer ${user.name} ?`)) {
      this.http.delete(`http://localhost:5000/api/users/${user._id}`).subscribe({
        next: () => {
          this.users = this.users.filter(u => u._id !== user._id);
          console.log(`Utilisateur supprimé: ${user.name}`);
        },
        error: (err) => console.error('Erreur suppression:', err)
      });
    }
  }
}
