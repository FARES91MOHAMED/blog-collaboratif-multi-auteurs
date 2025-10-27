import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { ArticleService } from '../../../core/services/article';
import { CommentService } from '../../../core/services/comment';
import { Article } from '../../../models/article.model';

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
  userRole = '';
  userId = '';
  newArticle = { title: '', content: '', author: '', image: '' };

toggleAddForm(): void {
  this.showAddForm = !this.showAddForm;
}

  constructor(
    private articleService: ArticleService,
    private commentService: CommentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUserData();
    this.loadArticles();
  }

  getUserData(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.userRole = '';
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

 
  loadArticles(): void {
    this.articleService.getAll().subscribe({
      next: (data) => {
        this.articles = data;
        this.articles.forEach((a) => this.loadComments(a));
      },
      error: (err) => console.error('Erreur chargement articles:', err),
    });
  }

  loadComments(article: any): void {
    this.commentService.getComments(article._id).subscribe({
      next: (comments) => (article.comments = comments),
      error: (err) => console.error(`Erreur chargement commentaires:`, err),
    });
  }

   view(article: any): void {
    this.router.navigate(['/dashboard/admin/articles', article._id]);
  }

   edit(article: any): void {
    if (
      this.userRole === 'redacteur' &&
      article.author?._id !== this.userId &&
      article.author !== this.userId
    ) {
      alert('❌ Vous ne pouvez modifier que vos propres articles.');
      return;
    }

    this.router.navigate([`/dashboard/admin/articles/edit/${article._id}`]);
  }

   confirmDelete(article: any): void {
    if (this.userRole !== 'admin') {
      alert('❌ Suppression réservée à l’administrateur.');
      return;
    }

    if (confirm(`Supprimer "${article.title}" ?`)) {
      this.articleService.delete(article._id).subscribe({
        next: () => {
          this.articles = this.articles.filter((a) => a._id !== article._id);
        },
        error: (err) => console.error('Erreur suppression:', err),
      });
    }
  }

addComment(article: any): void {
  const content = this.newComments[article._id]?.trim();
  if (!content) return;

  this.commentService.addComment(article._id, content).subscribe({
    next: (comment: any) => {
            if (Array.isArray(comment)) {
        article.comments = comment;
      } else {
               article.comments = article.comments || [];
        article.comments.push(comment);
      }
      this.newComments[article._id] = '';
    },
    error: (err) => console.error('Erreur ajout commentaire:', err),
  });
}

   addArticle(): void {
    if (!this.newArticle.title || !this.newArticle.content) {
      alert('Veuillez remplir tous les champs requis.');
      return;
    }

    const payload = {
      title: this.newArticle.title,
      content: this.newArticle.content,
      author: this.userId,
      images: this.newArticle.image ? [this.newArticle.image] : [],
    };

    this.articleService.create(payload).subscribe({
      next: (created: any) => {
        this.articles.unshift(created);
        this.newArticle = { title: '', content: '', author: '', image: '' };
        this.showAddForm = false;
      },
      error: (err) => console.error('Erreur ajout article:', err),
    });
  }
}
