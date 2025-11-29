import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AccountService } from 'src/app/Services/httpService/account.service';
import { UserRole } from 'src/app/Models/EntityResultModel';
import { TranslateService } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';

@Component({
    selector: 'app-report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.css'],
})
export class ReportComponent implements OnInit {
    userList: any;
    selectedUserIdFilter: any | null = '';
    startDateFilter: any | null = '';
    endDateFilter: any | null = '';
    UserRole = UserRole;
    activeUserRole: UserRole | null = null;
    statistics: any | null = null;

    @ViewChild('loginLogoutChart') loginLogoutChartRef!: ElementRef<HTMLCanvasElement>;

    loading: boolean = false;
    loginLogoutChartInstance!: Chart;

    constructor(private http: HttpClient, private accountService: AccountService, private translateService: TranslateService) {}

    ngOnInit(): void {
        debugger;
        this.fPopulateUserList();
        Chart.register(...registerables);
        this.activeUserRole = this.accountService.activeUserRole();
        this.selectedUserIdFilter = this.accountService.activeUserId();

        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // YYYY-MM-DD formatına çevir
        this.startDateFilter = this.formatDate(firstDay);
        this.endDateFilter = this.formatDate(lastDay);
        this.GetUserStatistics();
    }

    fPopulateUserList(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<any>(`${environment.apiUrl}/Common/PopulateUserList`).subscribe({
                next: response => {
                    this.userList = response.ResultObject;
                    resolve();
                },
                error: err => {
                    reject(err);
                },
            });
        });
    }

    setThisWeek(): void {
        const now = new Date();
        const firstDayOfWeek = new Date(now);
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday...
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // Pazartesi
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        this.startDateFilter = this.formatDate(monday);
        this.endDateFilter = this.formatDate(sunday);

        this.filterChange();
    }

    setThisMonth(): void {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        this.startDateFilter = this.formatDate(firstDay);
        this.endDateFilter = this.formatDate(lastDay);

        this.filterChange();
    }

    private formatDate(date: Date): string {
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    GetUserStatistics(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.loading = true;

            this.http
                .get<any>(`${environment.apiUrl}/Common/GetUserStatistics`, {
                    params: {
                        userId: this.selectedUserIdFilter,
                        startDate: this.startDateFilter,
                        endDate: this.endDateFilter,
                    },
                })
                .subscribe({
                    next: response => {
                        this.loading = false;
                        this.statistics = response.ResultObject;

                        const loginLogs = this.statistics?.Logss?.LoginLogs || [];
                        const logoutLogs = this.statistics?.Logss?.LogoutLogs || [];

                        const labels: string[] = [];
                        const loginHours: number[] = [];
                        const logoutHours: number[] = [];

                        loginLogs.forEach((log: any, i: number) => {
                            const processDate = new Date(log.ProcessTime);
                            labels.push(this.getDayName(processDate)); // gün ismi veya tarih

                            loginHours.push(this.getDecimalHour(processDate));

                            const logoutDateStr = logoutLogs[i]?.ProcessTime;
                            logoutHours.push(logoutDateStr ? this.getDecimalHour(new Date(logoutDateStr)) : 0);
                        });

                        // Yardımcı fonksiyon: Date objesini "dd/MM/yyyy HH:mm" formatına çevirir
                        const formatDateTime = (date: Date): string => {
                            const day = date.getDate().toString().padStart(2, '0');
                            const month = (date.getMonth() + 1).toString().padStart(2, '0');
                            const year = date.getFullYear();
                            const hours = date.getHours().toString().padStart(2, '0');
                            const minutes = date.getMinutes().toString().padStart(2, '0');
                            return `${day}/${month}/${year} ${hours}:${minutes}`;
                        };

                        // === TEK CHART ===
                        if (this.loginLogoutChartInstance) this.loginLogoutChartInstance.destroy();
                        const ctx = this.loginLogoutChartRef.nativeElement.getContext('2d');
                        if (ctx) {
                            this.loginLogoutChartInstance = new Chart(ctx, {
                                type: 'bar',
                                data: {
                                    labels: labels,
                                    datasets: [
                                        {
                                            label: this.translateService.instant('Report.loginHour'),
                                            data: loginHours,
                                            backgroundColor: '#2ecc71',
                                        },
                                        {
                                            label: this.translateService.instant('Report.logoutHour'),
                                            data: logoutHours,
                                            backgroundColor: '#e74c3c',
                                        },
                                    ],
                                },
                                options: {
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'bottom' },
                                        tooltip: {
                                            callbacks: {
                                                label: context => {
                                                    const index = context.dataIndex;
                                                    const label = context.dataset.label;

                                                    const timeStr = label === this.translateService.instant('Report.loginHour') ? loginLogs[index]?.ProcessTime : logoutLogs[index]?.ProcessTime;

                                                    const formatted = timeStr ? formatDateTime(new Date(timeStr)) : '--:--';
                                                    return `${label}: ${formatted}`;
                                                },
                                            },
                                        },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            max: 24,
                                            title: {
                                                display: true,
                                                text: this.translateService.instant('Report.hour'),
                                            },
                                            ticks: {
                                                callback: function (value) {
                                                    const h = Math.floor(Number(value));
                                                    const m = Math.round((Number(value) - h) * 60);
                                                    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                                                },
                                            },
                                        },
                                        x: {
                                            title: {
                                                display: true,
                                                text: this.translateService.instant('Report.day'),
                                            },
                                        },
                                    },
                                },
                            });
                        }

                        resolve();
                    },
                    error: err => reject(err),
                });
        });
    }

    getDecimalHour(date: Date): number {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return parseFloat((hours + minutes / 60).toFixed(2));
    }

    formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    formatDateTime(date: Date): string {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ay 0'dan başladığı için +1
        const year = date.getFullYear();

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    getDayName(date: Date): string {
        const days = [
            this.translateService.instant('Days.Sunday'),
            this.translateService.instant('Days.Monday'),
            this.translateService.instant('Days.Tuesday'),
            this.translateService.instant('Days.Wednesday'),
            this.translateService.instant('Days.Thursday'),
            this.translateService.instant('Days.Friday'),
            this.translateService.instant('Days.Saturday'),
        ];
        return days[date.getDay()];
    }

    filterChange() {
        this.GetUserStatistics();
    }
}
