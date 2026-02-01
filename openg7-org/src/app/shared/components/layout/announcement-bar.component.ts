import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'og7-announcement-bar',
  standalone: true,
  templateUrl: './announcement-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementBarComponent {}
