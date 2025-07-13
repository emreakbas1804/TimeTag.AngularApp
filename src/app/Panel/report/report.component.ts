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
    UserRole = UserRole;
    activeUserRole: UserRole | null = null;
    statistics: any | null = null;

    @ViewChild('weeklyChart') weeklyChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('monthlyChart') monthlyChartRef!: ElementRef<HTMLCanvasElement>;

    weeklyChartInstance!: Chart;
    monthlyChartInstance!: Chart;

    constructor(private http: HttpClient, private accountService: AccountService, private translateService: TranslateService) {}

    ngOnInit(): void {
        Chart.register(...registerables);
        this.activeUserRole = this.accountService.activeUserRole();
        this.GetUserStatistics();
    }

    GetUserStatistics(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<any>(`${environment.apiUrl}/Common/GetUserStatistics?userId=${this.selectedUserIdFilter}`).subscribe({
                next: response => {
                    this.statistics = response.ResultObject;

                    // === HAFTALIK VERİLER ===
                    const loginLogsWeek = this.statistics?.ThisWeek?.LoginLogs || [];
                    const logoutLogsWeek = this.statistics?.ThisWeek?.LogoutLogs || [];

                    const dayLabelsWeek: string[] = [];
                    const loginHoursWeek: number[] = [];
                    const logoutHoursWeek: number[] = [];

                    loginLogsWeek.forEach((log: any, i: number) => {
                        const processDate = new Date(log.ProcessTime);
                        const dayName = this.getDayName(processDate);

                        dayLabelsWeek.push(dayName);

                        const loginTime = this.getDecimalHour(processDate);
                        loginHoursWeek.push(loginTime);

                        const logoutDateStr = logoutLogsWeek[i]?.ProcessTime;
                        const logoutTime = logoutDateStr ? this.getDecimalHour(new Date(logoutDateStr)) : 0;
                        logoutHoursWeek.push(logoutTime);
                    });

                    // === AYLIK VERİLER ===
                    const loginLogsMonth = this.statistics?.ThisMonth?.LoginLogs || [];
                    const logoutLogsMonth = this.statistics?.ThisMonth?.LogoutLogs || [];

                    const dayLabelsMonth: string[] = [];
                    const loginHoursMonth: number[] = [];
                    const logoutHoursMonth: number[] = [];

                    loginLogsMonth.forEach((log: any, i: number) => {
                        const processDate = new Date(log.ProcessTime);
                        const day = processDate.getDate();

                        dayLabelsMonth.push(day.toString());

                        const loginTime = this.getDecimalHour(processDate);
                        loginHoursMonth.push(loginTime);

                        const logoutDateStr = logoutLogsMonth[i]?.ProcessTime;
                        const logoutTime = logoutDateStr ? this.getDecimalHour(new Date(logoutDateStr)) : 0;
                        logoutHoursMonth.push(logoutTime);
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

                    // === HAFTALIK GRAFİK ===
                    if (this.weeklyChartInstance) this.weeklyChartInstance.destroy();
                    const ctxWeek = this.weeklyChartRef.nativeElement.getContext('2d');
                    if (ctxWeek) {
                        this.weeklyChartInstance = new Chart(ctxWeek, {
                            type: 'bar',
                            data: {
                                labels: dayLabelsWeek,
                                datasets: [
                                    {
                                        label: this.translateService.instant('Report.loginHour'),
                                        data: loginHoursWeek,
                                        backgroundColor: '#2ecc71',
                                    },
                                    {
                                        label: this.translateService.instant('Report.logoutHour'),
                                        data: logoutHoursWeek,
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

                                                const timeStr = label === this.translateService.instant('Report.loginHour') ? loginLogsWeek[index]?.ProcessTime : logoutLogsWeek[index]?.ProcessTime;

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

                    // === AYLIK GRAFİK ===
                    if (this.monthlyChartInstance) this.monthlyChartInstance.destroy();
                    const ctxMonth = this.monthlyChartRef.nativeElement.getContext('2d');
                    if (ctxMonth) {
                        this.monthlyChartInstance = new Chart(ctxMonth, {
                            type: 'bar',
                            data: {
                                labels: dayLabelsMonth,
                                datasets: [
                                    {
                                        label: this.translateService.instant('Report.loginHour'),
                                        data: loginHoursMonth,
                                        backgroundColor: '#2ecc71',
                                    },
                                    {
                                        label: this.translateService.instant('Report.logoutHour'),
                                        data: logoutHoursMonth,
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

                                                const timeStr = label === this.translateService.instant('Report.loginHour') ? loginLogsMonth[index]?.ProcessTime : logoutLogsMonth[index]?.ProcessTime;

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
                                            text: this.translateService.instant('Report.dayOfMonth'),
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

    resetFilters() {}
    filterChange() {}
}
