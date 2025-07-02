export interface EntityResultModel{
    Result : Result,
    ResultMessage : string,
    ResultObject : any
}
export enum Result{
    Warning = 0,
    Success = 1,
    Error = 2
}
export enum FormMode {
  View = 'View',
  AddOrUpdate = 'AddOrUpdate',
}