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

                    // HAFTALIK VERİ
                    const loginLogsWeek = this.statistics?.ThisWeek?.LoginLogs || [];
                    const logoutLogsWeek = this.statistics?.ThisWeek?.LogoutLogs || [];

                    const dayLabelsWeek: string[] = [];
                    const loginHoursWeek: number[] = [];
                    const logoutHoursWeek: number[] = [];

                    loginLogsWeek.forEach((loginLog: any, index: number) => {
                        const date = new Date(loginLog.ProcessTime);
                        const dayName = this.getDayName(date);
                        const loginHour = this.extractHour(loginLog.StartTime);
                        const logoutHour = this.extractHour(logoutLogsWeek[index]?.EndTime);

                        dayLabelsWeek.push(dayName);
                        loginHoursWeek.push(loginHour);
                        logoutHoursWeek.push(logoutHour);
                    });

                    // AYLIK VERİ
                    const loginLogsMonth = this.statistics?.ThisMonth?.LoginLogs || [];
                    const logoutLogsMonth = this.statistics?.ThisMonth?.LogoutLogs || [];

                    const dayLabelsMonth: string[] = [];
                    const loginHoursMonth: number[] = [];
                    const logoutHoursMonth: number[] = [];

                    loginLogsMonth.forEach((loginLog: any, index: number) => {
                        const date = new Date(loginLog.ProcessTime);
                        const dayNumber = date.getDate();
                        const loginHour = this.extractHour(loginLog.StartTime);
                        const logoutHour = this.extractHour(logoutLogsMonth[index]?.EndTime);

                        dayLabelsMonth.push(dayNumber.toString());
                        loginHoursMonth.push(loginHour);
                        logoutHoursMonth.push(logoutHour);
                    });

                    // Haftalık grafik oluştur
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
                                plugins: { legend: { position: 'bottom' } },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 24,
                                        title: { display: true, text: this.translateService.instant('Report.hour') },
                                    },
                                    x: { title: { display: true, text: this.translateService.instant('Report.day') } },
                                },
                            },
                        });
                    }

                    // Aylık grafik oluştur
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
                                plugins: { legend: { position: 'bottom' } },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 24,
                                        title: { display: true, text: this.translateService.instant('Report.hour') },
                                    },
                                    x: { title: { display: true, text: this.translateService.instant('Report.dayOfMonth') } },
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

    getDayName(date: Date): string {
        const dayIndex = date.getDay(); // 0=Pazar, 1=Pazartesi, ...
        // Gün isimleri translate dosyasından alınacak:
        const days = [
            this.translateService.instant('Days.Sunday'),
            this.translateService.instant('Days.Monday'),
            this.translateService.instant('Days.Tuesday'),
            this.translateService.instant('Days.Wednesday'),
            this.translateService.instant('Days.Thursday'),
            this.translateService.instant('Days.Friday'),
            this.translateService.instant('Days.Saturday'),
        ];
        return days[dayIndex];
    }

    extractHour(timeStr: string): number {
        if (!timeStr) return 0;
        const [hourStr] = timeStr.split(':');
        return parseInt(hourStr, 10);
    }
    resetFilters() {}
    filterChange() {}
}
