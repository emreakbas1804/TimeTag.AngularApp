export interface EntityResultModel {
    Result: Result;
    ResultMessage: string;
    ResultObject: any;
}
export enum Result {
    Warning = 0,
    Success = 1,
    Error = 2,
}
export enum FormMode {
    View = 'View',
    AddOrUpdate = 'AddOrUpdate',
}
export enum ExportType {
    Excel = 0,
    PDF = 1,
}
export enum UserRole {
    Employee = 0,
    CompanyOwner = 1,
    SystemManager = 2,
}
