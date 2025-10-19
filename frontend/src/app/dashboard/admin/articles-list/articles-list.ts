import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-articles-list',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule, FormsModule],
  templateUrl: './articles-list.html',
  styleUrls: ['./articles-list.scss']
})
export class ArticlesList implements OnInit {
  articles: any[] = [];
  newComments: { [key: string]: string } = {};
  showAddForm = false;
  userRole: string = '';
  userId: string = ''; // ✅ pour savoir quel utilisateur est connecté
  apiUrl = 'http://localhost:5000/api/articles';

  newArticle = {
    title: '',
    content: '',
    author: '',
    image: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.getUserData();
    this.loadArticles();
  }

  /** ✅ Extraire rôle et ID depuis le token JWT */
  getUserData(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.userRole = '';
      console.log(this.userRole);
      this.userId = '';
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      this.userRole = decoded?.role?.toLowerCase() || '';
      this.userId = decoded?.id || decoded?._id || '';
      console.log('✅ Utilisateur détecté:', { role: this.userRole, id: this.userId });
    } catch (err) {
      console.error('Erreur décodage token:', err);
    }
  }

  /** 🔁 Charger tous les articles */
  loadArticles(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.articles = data;
        this.articles.forEach(a => this.loadComments(a));
      },
      error: (err) => console.error('Erreur chargement articles:', err)
    });
  }

  /** 💬 Charger les commentaires */
  loadComments(article: any): void {
    this.http.get<any[]>(`http://localhost:5000/api/comments/${article._id}`).subscribe({
      next: (comments) => (article.comments = comments),
      error: (err) => console.error(`Erreur chargement commentaires:`, err)
    });
  }

  /** 👁️ Voir un article */
  view(article: any): void {
    this.router.navigate(['/dashboard/admin/articles', article._id]);
  }

  /** ✏️ Modifier un article */
  edit(article: any): void {
    // ✅ Writer peut modifier uniquement ses articles
    if (this.userRole === 'redacteur' && article.author?._id !== this.userId && article.author !== this.userId) {
      alert('❌ Vous ne pouvez modifier que vos propres articles.');
      return;
    }

    this.router.navigate([`/dashboard/admin/articles/edit/${article._id}`]);
  }

  /** 🗑️ Supprimer (admin uniquement) */
  confirmDelete(article: any): void {
    if (this.userRole !== 'admin') {
      alert('❌ Suppression réservée à l’administrateur.');
      return;
    }

    if (confirm(`Supprimer "${article.title}" ?`)) {
      const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      this.http.delete(`${this.apiUrl}/${article._id}`, { headers }).subscribe({
        next: () => {
          this.articles = this.articles.filter(a => a._id !== article._id);
        },
        error: (err) => console.error('Erreur suppression:', err)
      });
    }
  }

  /** 💬 Ajouter un commentaire */
  addComment(article: any): void {
    const content = this.newComments[article._id]?.trim();
    if (!content) return;

    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post(`${this.apiUrl}/${article._id}/comments`, { content }, { headers }).subscribe({
      next: (comment: any) => {
        article.comments = article.comments || [];
        article.comments.push(comment);
        this.newComments[article._id] = '';
      },
      error: (err) => console.error('Erreur ajout commentaire:', err)
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
  }

  /** ➕ Ajouter un article */
  addArticle(): void {
    if (!this.newArticle.title || !this.newArticle.content) {
      alert('Veuillez remplir tous les champs requis.');
      return;
    }

    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const articleData = {
      title: this.newArticle.title,
      content: this.newArticle.content,
      author: this.userId, // ✅ l'auteur est l'utilisateur connecté
      images: this.newArticle.image ? [this.newArticle.image] : []
    };

    this.http.post(this.apiUrl, articleData, { headers }).subscribe({
      next: (created: any) => {
        this.articles.unshift(created);
        this.newArticle = { title: '', content: '', author: '', image: '' };
        this.showAddForm = false;
      },
      error: (err) => console.error('Erreur ajout article:', err)
    });
  }
}
