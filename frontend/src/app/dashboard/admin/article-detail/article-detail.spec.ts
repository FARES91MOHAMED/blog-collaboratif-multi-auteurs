import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleDetail } from './article-detail.component';

describe('ArticleDetail', () => {
  let component: ArticleDetail;
  let fixture: ComponentFixture<ArticleDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
