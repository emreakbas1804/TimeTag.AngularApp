import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {

  constructor( private snackBar: MatSnackBar) { }

  error(message: string){
    this.snackBar.open(message,"",{
      verticalPosition: 'top',
      horizontalPosition: 'end',
      duration: 3000,
      panelClass: ['snackBar-error']
    });
  }


  warning(message: string){
    this.snackBar.open(message,"",{
      verticalPosition: 'top',
      horizontalPosition: 'end',
      duration: 3000,
      panelClass: ['snackBar-warning']
    });
  }

  success(message: string){
    this.snackBar.open(message,"",{
      verticalPosition: 'top',
      horizontalPosition: 'end',
      duration: 3000,
      panelClass: ['snackBar-success']
    });
  }


}
