import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { StatisticsService } from '../../../core/services/statistics.service';


Chart.register(...registerables);

interface ChartData {
  labels: string[];
  articles: number[];
  comments: number[];
}

interface StatisticsResponse {
  articleCount: number;
  commentCount: number;
  chartData: ChartData;
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  chart: any;
  totalArticles = 0;
  totalComments = 0;

  constructor(private statsService: StatisticsService) {}

  ngOnInit(): void {
    this.statsService.getStats().subscribe((data: StatisticsResponse) => {
      this.totalArticles = data.articleCount;
      this.totalComments = data.commentCount;
      this.renderChart(data.chartData);
    });
  }

  renderChart(chartData: ChartData) {
    const ctx = document.getElementById('statsChart') as HTMLCanvasElement;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Articles publiés',
            data: chartData.articles,
            borderColor: '#3e95cd',
            backgroundColor: 'rgba(62,149,205,0.4)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Commentaires publiés',
            data: chartData.comments,
            borderColor: '#8e5ea2',
            backgroundColor: 'rgba(142,94,162,0.3)',
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: { display: true, text: 'Mois' }
          },
          y: {
            title: { display: true, text: 'Nombre' },
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        },
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: '📊 Activité mensuelle : Articles & Commentaires'
          }
        }
      }
    });
  }
}
