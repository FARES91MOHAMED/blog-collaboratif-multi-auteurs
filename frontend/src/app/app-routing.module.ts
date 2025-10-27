import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminComponent } from './dashboard/admin/admin.component';
import { ArticleDetailComponent } from './dashboard/admin/article-detail/article-detail.component';
import { EditorComponent } from './dashboard/editor/editor.component';
import { WriterComponent } from './dashboard/writer/writer.component';
import { ReaderComponent } from './dashboard/reader/reader.component';
import { AuthGuard } from './auth/auth-guard';
import { ArticlesList } from './dashboard/admin/articles-list/articles-list';
import { UsersList } from './dashboard/admin/users-list/users-list';
import {StatisticsComponent } from './dashboard/admin/statistics/statistics.component';
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  //{ path: 'dashboard/admin', component: AdminComponent, canActivate: [AuthGuard] },
   {
    path: 'dashboard/admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UsersList },
      { path: 'articles', component: ArticlesList },
      { path: 'articles/:id', component: ArticleDetailComponent },
      { path: 'statistics', component: StatisticsComponent}
    ]
  },
  {
  path: 'dashboard/editor',
  component: EditorComponent,
  canActivate: [AuthGuard],
  data: { role: 'editeur', allowDelete: false }, // passe la config
  children: [
    { path: '', redirectTo: 'articles', pathMatch: 'full' },
    { path: 'articles', component: ArticlesList },
    { path: 'articles/:id', component: ArticleDetailComponent }
  ]
},

   {
  path: 'dashboard/writer',
  component: WriterComponent,
  canActivate: [AuthGuard],
  data: { role: 'redacteur', allowDelete: false }, // passe la config
  children: [
    { path: '', redirectTo: 'articles', pathMatch: 'full' },
    { path: 'articles', component: ArticlesList },
    { path: 'articles/:id', component: ArticleDetailComponent }
  ]
},
   {
  path: 'dashboard/reader',
  component: ReaderComponent,
  canActivate: [AuthGuard],
  data: { role: 'lecteur', allowDelete: false }, // passe la config
  children: [
    { path: '', redirectTo: 'articles', pathMatch: 'full' },
    { path: 'articles', component: ArticlesList },
    { path: 'articles/:id', component: ArticleDetailComponent }
  ]
},
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' } // Gestion des routes inconnues
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}