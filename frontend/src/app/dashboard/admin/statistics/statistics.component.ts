import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { StatisticsService } from '../../../core/services/statistics.service';

Chart.register(...registerables, zoomPlugin);

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  totalArticles = 0;
  totalComments = 0;
  chart: any;
  viewMode: 'daily' | 'monthly' = 'daily'; // ✅ toggle mode

  constructor(private statsService: StatisticsService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.statsService.getStats().subscribe((data: any) => {
      this.totalArticles = data.articleCount;
      this.totalComments = data.commentCount;
      this.createChart(data.chartData);
    });
  }

  /** ✅ Création du graphique */
  createChart(data: any) {
    const ctx = document.getElementById('statsChart') as HTMLCanvasElement;
    if (this.chart) this.chart.destroy();

    const isDaily = this.viewMode === 'daily';
    const chartType = isDaily ? 'line' : 'bar';

    const chartLabels = isDaily
      ? data.daily.labels // ⚙️ ex: ["01", "02", ...]
      : data.monthly.labels; // ⚙️ ["Jan", "Fév", ...]

    const articlesData = isDaily ? data.daily.articles : data.monthly.articles;
    const commentsData = isDaily ? data.daily.comments : data.monthly.comments;

    this.chart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: 'Articles',
            data: articlesData,
            borderColor: '#5280ff',
            backgroundColor: 'rgba(82, 128, 255, 0.4)',
            tension: 0.3,
            fill: isDaily
          },
          {
            label: 'Commentaires',
            data: commentsData,
            borderColor: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.4)',
            tension: 0.3,
            fill: isDaily
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          zoom: {
            pan: { enabled: true, mode: 'x' },
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'x'
            }
          },
          legend: { position: 'top' },
          title: {
            display: true,
            text: isDaily
              ? '📅 Articles & Commentaires par jour'
              : '📆 Articles & Commentaires par mois'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: isDaily ? 'Jour du mois' : 'Mois'
            }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Nombre' }
          }
        }
      }
    });
  }

  /** ✅ Réinitialiser le zoom */
  resetZoom() {
    if (this.chart) this.chart.resetZoom();
  }

  /** ✅ Basculer entre jour / mois */
  toggleView(mode: 'daily' | 'monthly') {
    this.viewMode = mode;
    this.loadData(); // recharge le graphique
  }
}
