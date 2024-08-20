export interface EntityResultModel{
    result : Result,
    resultMessage : string,
    resultObject : any
}
export enum Result{
    Warning = 0,
    Success = 1,
    Error = 2
}