import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { Employee } from "../model/employee";
import { Firestore, addDoc, collection, collectionData, DocumentData } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private firestore: Firestore = inject(Firestore);
  private employeeCollection = collection(this.firestore, 'employees');

  employees$: BehaviorSubject<readonly Employee[]> = new BehaviorSubject<readonly Employee[]>([]);

  constructor() {
    this.fetchEmployees();
  }

  get $(): Observable<readonly Employee[]> {
    return this.employees$;
  }

  async addEmployee(employee: any) {
    try {
      // Add the employee to Firestore
      await addDoc(this.employeeCollection, employee);
      console.log('Employee added successfully to Firestore');
      return true;
    } catch (error) {
      console.error('Error adding employee to Firestore:', error);
      return false;
    }
  }

  private fetchEmployees() {
    // Fetch the collection data from Firestore and map it to Employee[]
    collectionData(this.employeeCollection, { idField: 'id' }).pipe(
      map((documents: DocumentData[]) => documents.map((doc: DocumentData) => ({
        name: doc['name'],
        dateOfBirth: new Date(doc['dateOfBirth']), // Convert date from Firestore string to JavaScript Date
        city: doc['city'],
        salary: doc['salary'],
        gender: doc['gender'],
        email: doc['email']
      }) as Employee))
    ).subscribe((employees: Employee[]) => {
      this.employees$.next(employees);
      console.log('Fetched employees from Firestore:', employees);
    });
  }
}
