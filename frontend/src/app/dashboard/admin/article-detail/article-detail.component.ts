import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.scss']
})
export class ArticleDetailComponent implements OnInit {
  form!: FormGroup;
  articleId!: string | null;
  loading = false;
  message = '';
  userRole: string = '';
  currentUserId: string = '';
  canEditOwnArticle = true;
  isReadOnly = false; // ✅ pour le rôle reader

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.detectUserRole();

    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      author: [''],
      image: ['']
    });

    this.articleId = this.route.snapshot.paramMap.get('id');
    if (this.articleId) {
      this.loadArticle(this.articleId);
    } else if (this.userRole === 'redacteur') {
      this.form.patchValue({ author: this.currentUserId });
    }
  }

  detectUserRole(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      this.userRole = decoded?.role?.toLowerCase() || '';
      this.currentUserId = decoded?.id || decoded?.userId || '';
      console.log('✅ Rôle:', this.userRole, '| ID:', this.currentUserId);
    } catch (err) {
      console.error('❌ Erreur décodage token:', err);
    }
  }

  loadArticle(id: string): void {
    this.loading = true;
    this.http.get<any>(`http://localhost:5000/api/articles/${id}`).subscribe({
      next: (data) => {
        this.form.patchValue({
          title: data.title,
          content: data.content,
          author: data.author?._id || data.author
        });

        if (data.image) {
          this.previewUrl = `http://localhost:5000/uploads/${data.image}`;
        }

        // 🧩 Gestion des rôles
        if (this.userRole === 'redacteur' && data.author?._id !== this.currentUserId) {
          this.canEditOwnArticle = false;
          this.form.disable();
        } else if (this.userRole === 'lecteur') {
          this.isReadOnly = true;
          this.form.disable(); // ❌ Aucun champ éditable
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement article:', err);
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  save(): void {
    if (this.userRole === 'lecteur') {
      this.message = '🚫 Vous ne pouvez pas modifier un article (lecteur).';
      return;
    }

    if (this.userRole === 'redacteur' && !this.canEditOwnArticle) {
      this.message = '🚫 Vous ne pouvez modifier que vos propres articles.';
      return;
    }

    if (this.form.invalid) {
      this.message = '⚠️ Veuillez remplir tous les champs requis.';
      return;
    }

    const formData = new FormData();
    formData.append('title', this.form.value.title);
    formData.append('content', this.form.value.content);
    formData.append('author', this.form.value.author);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.loading = true;

    const request = this.articleId
      ? this.http.put(`http://localhost:5000/api/articles/${this.articleId}`, formData)
      : this.http.post('http://localhost:5000/api/articles', formData);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.message = this.articleId
          ? '✅ Article mis à jour avec succès !'
          : '✅ Article créé avec succès !';
        setTimeout(() => this.router.navigate(['/dashboard/admin/articles']), 1000);
      },
      error: (err) => {
        console.error('❌ Erreur enregistrement :', err);
        this.loading = false;
        this.message = '❌ Erreur serveur.';
      }
    });
  }

  delete(): void {
    if (this.userRole !== 'admin') {
      this.message = '🚫 Seul un administrateur peut supprimer un article.';
      return;
    }

    if (!this.articleId) return;
    if (!confirm('Voulez-vous vraiment supprimer cet article ?')) return;

    this.http.delete(`http://localhost:5000/api/articles/${this.articleId}`).subscribe({
      next: () => {
        this.message = '🗑️ Article supprimé.';
        setTimeout(() => this.router.navigate(['/dashboard/admin/articles']), 1000);
      },
      error: (err) => console.error('❌ Erreur suppression :', err)
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/admin/articles']);
  }
}
