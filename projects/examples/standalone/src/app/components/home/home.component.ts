import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, timer } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule]
})
export class HomeComponent implements OnDestroy {
  private copyMessageSubject = new BehaviorSubject<string | null>(null);
  copyMessage$ = this.copyMessageSubject.asObservable(); // Expose as Observable

  copyToClipboard(text: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.copyMessageSubject.next(`"${text}" copied to clipboard!`);
        timer(3000).subscribe(() => this.copyMessageSubject.next(null));
      })
      .catch((err) => {
        this.copyMessageSubject.next('Failed to copy text. Please try again.');
      });
  }

  ngOnDestroy(): void {
    this.copyMessageSubject.complete();
  }
}
