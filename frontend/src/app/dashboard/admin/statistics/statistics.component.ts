import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { StatisticsService } from '../../../core/services/statistics.service';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables, zoomPlugin);

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  totalArticles = 0;
  totalComments = 0;

  dailyChart: any;
  monthlyChart: any;

  @ViewChild('dailyChartCanvas', { static: true }) dailyChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthlyChartCanvas', { static: true }) monthlyChartCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private statsService: StatisticsService) {}

  ngOnInit() {
    this.statsService.getStats().subscribe((data: any) => {
      this.totalArticles = data.articleCount;
      this.totalComments = data.commentCount;

      this.createDailyChart(data.chartData.daily);
      this.createMonthlyChart(data.chartData.monthly);
    });
  }

  /** Graphique journalier (bar) */
  createDailyChart(data: any) {
    const ctx = this.dailyChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.dailyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels, 
        datasets: [
          { label: 'Articles', data: data.articles, backgroundColor: '#5280ff' },
          { label: 'Commentaires', data: data.comments, backgroundColor: '#ff6b6b' }
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
          title: { display: true, text: 'Articles & Commentaires par jour' }
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'day', tooltipFormat: 'dd/MM/yyyy', displayFormats: { day: 'dd/MM' } },
            title: { display: true, text: 'Date' }
          },
          y: { beginAtZero: true, title: { display: true, text: 'Nombre' } }
        }
      }
    });
  }

  /** Graphique mensuel (line) */
  createMonthlyChart(data: any) {
    const ctx = this.monthlyChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.monthlyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          { label: 'Articles', data: data.articles, borderColor: '#5280ff', tension: 0.3, fill: false },
          { label: 'Commentaires', data: data.comments, borderColor: '#ff6b6b', tension: 0.3, fill: false }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Articles & Commentaires par mois' }
        },
        scales: {
          x: { title: { display: true, text: 'Mois' } },
          y: { beginAtZero: true, title: { display: true, text: 'Nombre' } }
        }
      }
    });
  }

  /** Reset zoom du graphique journalier */
  resetDailyZoom() {
    if (this.dailyChart) this.dailyChart.resetZoom();
  }
}
